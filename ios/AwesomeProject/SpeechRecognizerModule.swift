import Foundation
import Speech
import AVFoundation
import React

@objc(SpeechRecognizer)
class SpeechRecognizer: RCTEventEmitter {
    
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    private var isTapInstalled = false
    
    override init() {
        super.init()
        speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    }
    
    override func supportedEvents() -> [String]! {
        return ["onSpeechResult", "onSpeechError", "onSpeechStart", "onSpeechEnd"]
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func requestPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Request microphone permission first
        AVAudioSession.sharedInstance().requestRecordPermission { microphoneGranted in
            if !microphoneGranted {
                DispatchQueue.main.async {
                    reject("MICROPHONE_DENIED", "Microphone permission denied", nil)
                }
                return
            }
            
            // Then request speech recognition permission
            SFSpeechRecognizer.requestAuthorization { authStatus in
                DispatchQueue.main.async {
                    switch authStatus {
                    case .authorized:
                        resolve(true)
                    case .denied, .restricted, .notDetermined:
                        reject("PERMISSION_DENIED", "Speech recognition permission denied", nil)
                    @unknown default:
                        reject("PERMISSION_DENIED", "Speech recognition permission denied", nil)
                    }
                }
            }
        }
    }
    
    @objc
    func startListening(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Stop any existing recognition task and clean up
        stopAudioEngine()
        
        // Check if speech recognizer is available
        guard let speechRecognizer = speechRecognizer, speechRecognizer.isAvailable else {
            reject("SPEECH_RECOGNIZER_UNAVAILABLE", "Speech recognizer is not available", nil)
            return
        }
        
        // Check authorization status
        guard SFSpeechRecognizer.authorizationStatus() == .authorized else {
            reject("PERMISSION_DENIED", "Speech recognition permission not granted", nil)
            return
        }
        
        // Check microphone permission
        let microphoneStatus = AVAudioSession.sharedInstance().recordPermission
        print("🎤 Microphone permission status: \(microphoneStatus.rawValue)")
        
        if microphoneStatus == .undetermined {
            // Request permission if not determined
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                DispatchQueue.main.async {
                    if granted {
                        // Retry startListening after permission is granted
                        self.startListening(resolve, rejecter: reject)
                    } else {
                        reject("MICROPHONE_DENIED", "Microphone permission denied", nil)
                    }
                }
            }
            return
        }
        
        guard microphoneStatus == .granted else {
            reject("MICROPHONE_DENIED", "Microphone permission not granted", nil)
            return
        }
        
        do {
            // Create recognition request
            recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            guard let recognitionRequest = recognitionRequest else {
                reject("RECOGNITION_REQUEST_FAILED", "Unable to create recognition request", nil)
                return
            }
            
            recognitionRequest.shouldReportPartialResults = true
            
            // Create recognition task
            recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
                if let result = result {
                    let transcript = result.bestTranscription.formattedString
                    print("🎤 Speech result: '\(transcript)', isFinal: \(result.isFinal)")
                    self?.sendEvent(withName: "onSpeechResult", body: ["text": transcript, "isFinal": result.isFinal])
                }
                
                if let error = error {
                    // Check if this is a cancellation error (which is expected when stopping)
                    let nsError = error as NSError
                    if nsError.domain == "kAFAssistantErrorDomain" && nsError.code == 216 {
                        // This is a cancellation error, don't send error event
                        print("🎤 Speech recognition cancelled (expected)")
                        return
                    }
                    
                    // Only send error for unexpected errors
                    print("🎤 Speech recognition error: \(error.localizedDescription)")
                    self?.sendEvent(withName: "onSpeechError", body: ["error": error.localizedDescription])
                    self?.stopAudioEngine()
                }
            }
            
            // Configure audio session
            let audioSession = AVAudioSession.sharedInstance()
            print("🎤 Current audio session category: \(audioSession.category)")
            print("🎤 Current audio session mode: \(audioSession.mode)")
            
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            
            print("🎤 Audio session configured - Category: \(audioSession.category), Mode: \(audioSession.mode)")
            print("🎤 Audio session is active: \(audioSession.isOtherAudioPlaying)")
            
            // Configure audio engine
            let inputNode = audioEngine.inputNode
            let recordingFormat = inputNode.outputFormat(forBus: 0)
            
            print("🎤 Audio engine input node available: \(inputNode.numberOfInputs > 0)")
            print("🎤 Recording format: \(recordingFormat)")
            print("🎤 Audio engine is running: \(audioEngine.isRunning)")
            
            // Only install tap if not already installed
            if !isTapInstalled {
                inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
                    // Debug: Check if we're receiving audio data
                    let channelData = buffer.floatChannelData?[0]
                    let frameCount = Int(buffer.frameLength)
                    var hasAudio = false
                    
                    if let channelData = channelData {
                        for i in 0..<frameCount {
                            if abs(channelData[i]) > 0.01 { // Threshold for detecting audio
                                hasAudio = true
                                break
                            }
                        }
                    }
                    
                    if hasAudio {
                        print("🎤 Audio data received, appending to recognition request")
                    }
                    
                    self.recognitionRequest?.append(buffer)
                }
                isTapInstalled = true
                print("🎤 Audio tap installed successfully")
            }
            
            // Start audio engine
            audioEngine.prepare()
            try audioEngine.start()
            
            print("🎤 Audio engine started successfully")
            print("🎤 Audio engine is running after start: \(audioEngine.isRunning)")
            print("🎤 Input node inputs after start: \(inputNode.numberOfInputs)")
            
            sendEvent(withName: "onSpeechStart", body: nil)
            resolve(true)
            
        } catch {
            reject("AUDIO_ENGINE_ERROR", "Failed to start audio engine: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func stopListening(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            print("🎤 Stopping speech recognition")
            self.stopAudioEngine()
            print("🎤 Sending onSpeechEnd event")
            self.sendEvent(withName: "onSpeechEnd", body: nil)
            resolve(true)
        }
    }
    
    @objc
    func isListening(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(audioEngine.isRunning)
    }
    
    @objc
    func isAvailable(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(speechRecognizer?.isAvailable ?? false)
    }
    
    private func stopAudioEngine() {
        // Cancel recognition task first
        if let task = recognitionTask {
            task.cancel()
            recognitionTask = nil
        }
        
        // End recognition request
        if let request = recognitionRequest {
            request.endAudio()
            recognitionRequest = nil
        }
        
        // Stop audio engine safely
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        
        // Remove tap safely - only if we know it was installed
        if isTapInstalled {
            let inputNode = audioEngine.inputNode
            do {
                inputNode.removeTap(onBus: 0)
                isTapInstalled = false
            } catch {
                print("Error removing tap: \(error)")
                isTapInstalled = false
            }
        }
        
        // Deactivate audio session
        do {
            try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        } catch {
            print("Error deactivating audio session: \(error)")
        }
    }
    
    deinit {
        stopAudioEngine()
    }
}