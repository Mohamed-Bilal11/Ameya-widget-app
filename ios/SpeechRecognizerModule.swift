import Foundation
import Speech
import React
import AVFoundation
@objc(SpeechRecognizerModule)
class SpeechRecognizerModule: RCTEventEmitter, SFSpeechRecognizerDelegate, SFSpeechRecognitionTaskDelegate {
    override init() {
        super.init()
        print("[SpeechRecognizerModule] Module initialized")
    }
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
        print("[SpeechRecognizerModule] startListening called from JS")
        
        // First request microphone permission
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            if !granted {
                print("[SpeechRecognizerModule] Microphone permission denied")
                self.sendEvent(withName: "onSpeechError", body: "Microphone permission denied")
                return
            }
            
            // Then request speech recognition permission
            SFSpeechRecognizer.requestAuthorization { authStatus in
                if authStatus != .authorized {
                    print("[SpeechRecognizerModule] Speech recognition not authorized: \(authStatus.rawValue)")
                    self.sendEvent(withName: "onSpeechError", body: "Speech recognition not authorized")
                    return
                }
                DispatchQueue.main.async {
                    self.startRecording()
                }
            }
        }
    }

    @objc
    func stopListening() {
        print("[SpeechRecognizerModule] stopListening called from JS")
        audioEngine.stop()
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionTask = nil
    }
    
    @objc
    func checkMicrophonePermission(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let status = AVAudioSession.sharedInstance().recordPermission
        resolve(status == .granted)
    }
    
    @objc
    func openSettings() {
        if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
            DispatchQueue.main.async {
                UIApplication.shared.open(settingsUrl)
            }
        }
    }

    private func startRecording() {
        print("[SpeechRecognizerModule] startRecording called")
        if audioEngine.isRunning {
            print("[SpeechRecognizerModule] audioEngine already running, stopping")
            audioEngine.stop()
            recognitionRequest?.endAudio()
            return
        }

        // Set up audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            print("[SpeechRecognizerModule] audioSession set up and activated")
        } catch {
            print("[SpeechRecognizerModule] audioSession setup error: \(error)")
            sendEvent(withName: "onSpeechError", body: "audioSession error: \(error.localizedDescription)")
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            print("[SpeechRecognizerModule] Unable to create recognitionRequest")
            sendEvent(withName: "onSpeechError", body: "Unable to create recognitionRequest")
            return
        }
        recognitionRequest.shouldReportPartialResults = true

        // Remove any existing taps
        let node = audioEngine.inputNode
        node.removeTap(onBus: 0)

        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            if let result = result {
                print("[SpeechRecognizerModule] Partial: \(result.bestTranscription.formattedString)")
                // Send both partial and final results for continuous listening
                self?.sendEvent(withName: "onSpeechResults", body: result.bestTranscription.formattedString)
                
                if result.isFinal {
                    print("[SpeechRecognizerModule] Final: \(result.bestTranscription.formattedString)")
                    // Don't stop the audio engine for continuous listening
                    // The user will manually stop by releasing the button
                }
            }
            if let error = error {
                print("[SpeechRecognizerModule] recognitionTask error: \(error)")
                self?.sendEvent(withName: "onSpeechError", body: error.localizedDescription)
                self?.audioEngine.stop()
                node.removeTap(onBus: 0)
            }
        }

        let recordingFormat = node.outputFormat(forBus: 0)
        node.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer, when) in
            self.recognitionRequest?.append(buffer)
        }

        do {
            try audioEngine.start()
            print("[SpeechRecognizerModule] audioEngine started")
        } catch {
            print("[SpeechRecognizerModule] audioEngine start error: \(error)")
            sendEvent(withName: "onSpeechError", body: "audioEngine error: \(error.localizedDescription)")
        }
    }

    func speechRecognitionTask(_ task: SFSpeechRecognitionTask, didFinishRecognition recognitionResult: SFSpeechRecognitionResult) {
        if let bestTranscription = recognitionResult.bestTranscription.formattedString as String? {
            sendEvent(withName: "onSpeechResults", body: bestTranscription)
        }
        // Don't automatically stop listening for continuous mode
        // stopListening()
    }

    func speechRecognitionTask(_ task: SFSpeechRecognitionTask, didFinishSuccessfully successfully: Bool) {
        if !successfully {
            sendEvent(withName: "onSpeechError", body: "Recognition failed")
            stopListening()
        }
        // Don't automatically stop listening for continuous mode
        // stopListening()
    }
}