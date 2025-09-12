import Foundation
import Speech
import React

@objc(SpeechRecognizerModule)
class SpeechRecognizerModule: RCTEventEmitter, SFSpeechRecognizerDelegate, SFSpeechRecognitionTaskDelegate {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    override func supportedEvents() -> [String]! {
        return ["onSpeechResults", "onSpeechError"]
    }

    @objc
    func startListening() {
        SFSpeechRecognizer.requestAuthorization { authStatus in
            if authStatus != .authorized {
                self.sendEvent(withName: "onSpeechError", body: "Speech recognition not authorized")
                return
            }
            DispatchQueue.main.async {
                self.startRecording()
            }
        }
    }

    @objc
    func stopListening() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
    }

    private func startRecording() {
        if audioEngine.isRunning {
            audioEngine.stop()
            recognitionRequest?.endAudio()
            return
        }

        let node = audioEngine.inputNode
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            sendEvent(withName: "onSpeechError", body: "Unable to create request")
            return
        }
        recognitionRequest.shouldReportPartialResults = false

        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest, delegate: self)

        let recordingFormat = node.outputFormat(forBus: 0)
        node.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            sendEvent(withName: "onSpeechError", body: "Audio engine error")
        }
    }

    func speechRecognitionTask(_ task: SFSpeechRecognitionTask, didFinishRecognition recognitionResult: SFSpeechRecognitionResult) {
        if let bestTranscription = recognitionResult.bestTranscription.formattedString as String? {
            sendEvent(withName: "onSpeechResults", body: bestTranscription)
        }
        stopListening()
    }

    func speechRecognitionTask(_ task: SFSpeechRecognitionTask, didFinishSuccessfully successfully: Bool) {
        if !successfully {
            sendEvent(withName: "onSpeechError", body: "Recognition failed")
        }
        stopListening()
    }
}