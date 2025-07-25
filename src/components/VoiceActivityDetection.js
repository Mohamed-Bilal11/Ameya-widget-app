/**Add commentMore actions
 * Voice Activity Detection (VAD) Component
 * Detects speech start/stop automatically using energy-based algorithm
 */

class VoiceActivityDetection {
    constructor(options = {}) {
        // VAD Configuration - Much more sensitive default threshold
        this.VOLUME_THRESHOLD = options.volumeThreshold || 0.008;
        this.SILENCE_DELAY = options.silenceDelay || 4000; // ms - Wait 4 seconds of silence before ending speech (longer to prevent splitting)
        this.CHUNK_MS = options.chunkMs || 1000; // 1 second chunks for better responsiveness
        this.SAMPLE_RATE = options.sampleRate || 16000;

        // State
        this.isListening = false;
        this.isSpeaking = false;
        this.silenceStart = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.stream = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.speechStartTime = null;

        // UPDATED: Enhanced noise filtering configuration
        this.VOICE_FREQ_MIN = 85;   // Voice frequency range minimum (Hz)
        this.VOICE_FREQ_MAX = 300;  // Voice frequency range maximum (Hz)
        this.HIGH_FREQ_THRESHOLD = 1000; // Frequencies above this considered noise (Hz)
        this.RMS_SMOOTHING_FRAMES = 5; // Number of frames for RMS smoothing
        this.CONTINUOUS_SPEECH_MS = 150; // Minimum continuous speech duration before triggering

        // UPDATED: Smoothing and noise detection state
        this.rmsHistory = []; // Moving average for RMS smoothing
        this.speechDetectionStart = null; // When continuous speech detection began
        this.smoothedRMS = 0; // Current smoothed RMS value

        // Callbacks
        this.onSpeechStart = options.onSpeechStart || (() => { });
        this.onSpeechEnd = options.onSpeechEnd || (() => { });
        this.onAudioChunk = options.onAudioChunk || (() => { });
        this.onError = options.onError || ((error) => console.error('VAD Error:', error));
    }

    async initialize() {
        try {
            // Get microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 44100,  // Higher sample rate for better STT quality
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    latency: 0.01       // Low latency for better responsiveness
                }
            });

            // Set up audio context for VAD
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.SAMPLE_RATE
            });

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            const source = this.audioContext.createMediaStreamSource(this.stream);
            source.connect(this.analyser);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            // Set up MediaRecorder for audio capture
            this.setupMediaRecorder();

            console.log('VAD initialized successfully');
            return true;
        } catch (error) {
            this.onError(error);
            return false;
        }
    }

    setupMediaRecorder() {
        // Use MediaRecorder with optimized settings for speech recognition
        const options = {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 32000 // Even higher bitrate for better speech recognition quality
        };
        
        // Fallback for browsers that don't support the preferred format
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'audio/webm';
            options.audioBitsPerSecond = 24000; // Lower bitrate for fallback format
        }
        
        this.mediaRecorder = new MediaRecorder(this.stream, options);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                console.log(`VAD: Audio chunk received: ${event.data.size} bytes`);
                this.audioChunks.push(event.data);

                // Send ALL audio chunks immediately for real-time processing
                if (event.data.type.includes('audio')) {
                    console.log(`VAD: Sending audio chunk: ${event.data.size} bytes`);
                    this.onAudioChunk(event.data);
                } else {
                    console.log(`VAD: Non-audio chunk: ${event.data.size} bytes, type: ${event.data.type}`);
                }
            }
        };

        this.mediaRecorder.onstop = () => {
            if (this.audioChunks.length > 0) {
                // Use ALL chunks for better audio quality
                const validChunks = this.audioChunks.filter(chunk => chunk.size > 50);

                if (validChunks.length > 0) {
                    const audioBlob = new Blob(validChunks, { type: 'audio/webm' });
                    console.log(`VAD: Speech ended, final blob size: ${audioBlob.size} bytes (from ${validChunks.length} chunks)`);

                    // Send audio blob if it's substantial enough (increased minimum size)
                    if (audioBlob.size > 2000) {
                        this.onSpeechEnd(audioBlob);
                    } else {
                        console.log(`VAD: Final audio blob too small (${audioBlob.size} bytes), need at least 2000 bytes for reliable recognition`);
                    }
                } else {
                    console.log('VAD: No valid audio chunks to process');
                }

                this.audioChunks = [];
            }
        };

        // Error handling for MediaRecorder
        this.mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event.error);
            this.onError(new Error(`MediaRecorder error: ${event.error}`));
        };
    }

    startListening() {
        if (this.isListening) return;

        this.isListening = true;
        this.detectVoiceActivity();
        console.log('VAD: Started listening for voice activity');
    }

    stopListening() {
        this.isListening = false;

        if (this.isSpeaking && this.mediaRecorder?.state === 'recording') {
            this.mediaRecorder.stop();
            this.isSpeaking = false;
        }

        console.log('VAD: Stopped listening');
    }

    detectVoiceActivity() {
        if (!this.isListening || !this.analyser || !this.dataArray) return;

        // Get frequency data for voice detection
        const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(frequencyData);

        // UPDATED: Calculate frequency bin ranges for strict voice detection
        const nyquist = this.audioContext.sampleRate / 2;
        const voiceStartBin = Math.floor(this.VOICE_FREQ_MIN * frequencyData.length / nyquist);
        const voiceEndBin = Math.floor(this.VOICE_FREQ_MAX * frequencyData.length / nyquist);
        const highFreqStartBin = Math.floor(this.HIGH_FREQ_THRESHOLD * frequencyData.length / nyquist);
        
        // UPDATED: Analyze frequencies in restricted voice band and detect high-frequency noise
        let voiceEnergy = 0;
        let highFreqEnergy = 0;
        let totalVoiceBandSamples = 0;
        let totalHighFreqSamples = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const energy = frequencyData[i] / 255;
            
            // Only consider energy in voice frequency range (85-300Hz)
            if (i >= voiceStartBin && i <= voiceEndBin) {
                voiceEnergy += energy;
                totalVoiceBandSamples++;
            }
            
            // Track high-frequency energy to detect notification sounds, etc.
            if (i >= highFreqStartBin) {
                highFreqEnergy += energy;
                totalHighFreqSamples++;
            }
        }

        // UPDATED: Calculate current RMS and apply 5-frame smoothing
        this.analyser.getByteTimeDomainData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const sample = (this.dataArray[i] - 128) / 128;
            sum += sample * sample;
        }
        const currentRMS = Math.sqrt(sum / this.dataArray.length);
        
        // UPDATED: Add to RMS history and maintain smoothing window
        this.rmsHistory.push(currentRMS);
        if (this.rmsHistory.length > this.RMS_SMOOTHING_FRAMES) {
            this.rmsHistory.shift();
        }
        
        // UPDATED: Calculate smoothed RMS from moving average
        this.smoothedRMS = this.rmsHistory.reduce((a, b) => a + b, 0) / this.rmsHistory.length;
        
        // UPDATED: Normalize energy values for comparison
        const avgVoiceEnergy = totalVoiceBandSamples > 0 ? voiceEnergy / totalVoiceBandSamples : 0;
        const avgHighFreqEnergy = totalHighFreqSamples > 0 ? highFreqEnergy / totalHighFreqSamples : 0;
        
        // UPDATED: Enhanced voice detection with noise filtering
        const volumeAboveThreshold = this.smoothedRMS > this.VOLUME_THRESHOLD;
        const hasVoiceFrequencies = avgVoiceEnergy > 0.05; // Voice energy threshold in 85-300Hz range
        const highFreqSpike = avgHighFreqEnergy > (avgVoiceEnergy * 2); // High-freq dominant = noise
        
        // UPDATED: Voice is detected only if volume is sufficient, voice frequencies present, and no high-freq dominance
        const isVoiceCandidate = volumeAboveThreshold && hasVoiceFrequencies && !highFreqSpike;
        
        // UPDATED: Enhanced debug logging with smoothed values and noise detection
        if (this.smoothedRMS > this.VOLUME_THRESHOLD * 0.3) {
            console.log(`VAD Debug: SmoothedRMS=${this.smoothedRMS.toFixed(4)}, CurrentRMS=${currentRMS.toFixed(4)}, Threshold=${this.VOLUME_THRESHOLD.toFixed(4)}`);
            console.log(`VAD Freq: VoiceEnergy=${avgVoiceEnergy.toFixed(4)}, HighFreqEnergy=${avgHighFreqEnergy.toFixed(4)}, HighFreqSpike=${highFreqSpike}`);
            console.log(`VAD Status: VolumeOK=${volumeAboveThreshold}, VoiceFreqOK=${hasVoiceFrequencies}, VoiceCandidate=${isVoiceCandidate}`);
        }

        // UPDATED: Require continuous speech detection for minimum duration before triggering
        if (isVoiceCandidate) {
            // Start timing continuous speech detection
            if (!this.speechDetectionStart) {
                this.speechDetectionStart = Date.now();
            }
            
            // Check if we've had continuous speech detection for minimum duration
            const continuousSpeechDuration = Date.now() - this.speechDetectionStart;
            const shouldTriggerSpeech = continuousSpeechDuration >= this.CONTINUOUS_SPEECH_MS;
            
            if (shouldTriggerSpeech && !this.isSpeaking) {
                this.startSpeechRecording();
            }
            
            // Reset silence timer since we detected voice
            this.silenceStart = null;
        } else {
            // No voice detected - reset continuous speech timer
            this.speechDetectionStart = null;
            
            // Handle silence detection using smoothed RMS for consistency
            if (this.isSpeaking) {
                if (!this.silenceStart) {
                    this.silenceStart = Date.now();
                } else if (Date.now() - this.silenceStart > this.SILENCE_DELAY) {
                    this.stopSpeechRecording();
                }
            }
        }

        // Continue monitoring
        requestAnimationFrame(() => this.detectVoiceActivity());
    }

    startSpeechRecording() {
        if (this.isSpeaking) return;

        this.isSpeaking = true;
        this.silenceStart = null;
        this.speechStartTime = Date.now();

        // Start recording with chunked data
        if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
            this.audioChunks = [];
            this.mediaRecorder.start(this.CHUNK_MS);
        }

        this.onSpeechStart();
        console.log('VAD: Speech started');
    }

    stopSpeechRecording() {
        if (!this.isSpeaking) return;

        // Check minimum speech duration (800ms) to filter out noise bursts and ensure meaningful speech
        const speechDuration = Date.now() - this.speechStartTime;
        if (speechDuration < 800) {
            console.log(`VAD: Speech too short (${speechDuration}ms), ignoring`);
            this.isSpeaking = false;
            this.silenceStart = null;
            this.audioChunks = []; // Clear short recordings
            return;
        }

        this.isSpeaking = false;
        this.silenceStart = null;

        // Stop recording
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }

        console.log(`VAD: Speech ended after ${speechDuration}ms`);
    }

    // Calibrate VAD sensitivity based on ambient noise
    async calibrateThreshold(durationMs = 3000) {
        if (!this.analyser || !this.dataArray) {
            this.onError(new Error("VAD not initialized. Call initialize() before calibrating."));
            return;
        }
    
        return new Promise((resolve) => {
            const samples = [];
            const startTime = Date.now();
    
            const collectSamples = () => {
                if (!this.analyser || !this.dataArray) {
                    this.onError(new Error("VAD was cleaned up during calibration."));
                    resolve(null);
                    return;
                }
    
                if (Date.now() - startTime > durationMs) {
                    const avgNoise = samples.reduce((a, b) => a + b, 0) / samples.length;
                    const maxNoise = Math.max(...samples);
                    // Use much lower multipliers for better speech sensitivity
                    this.VOLUME_THRESHOLD = Math.max(avgNoise * 1.8, maxNoise * 1.1, 0.008);
                    console.log(`VAD: Calibrated threshold to ${this.VOLUME_THRESHOLD.toFixed(4)} (avg: ${avgNoise.toFixed(4)}, max: ${maxNoise.toFixed(4)})`);
                    resolve(this.VOLUME_THRESHOLD);
                    return;
                }
    
                this.analyser.getByteTimeDomainData(this.dataArray);
                let sum = 0;
                for (let i = 0; i < this.dataArray.length; i++) {
                    const sample = (this.dataArray[i] - 128) / 128;
                    sum += sample * sample;
                }
                const rms = Math.sqrt(sum / this.dataArray.length);
                samples.push(rms);
    
                requestAnimationFrame(collectSamples);
            };
    
            collectSamples();
        });
    }
    

    // UPDATED: Get current audio level for visual feedback using smoothed RMS
    getCurrentAudioLevel() {
        if (!this.analyser || !this.dataArray) return 0;

        // Return smoothed RMS if available, otherwise calculate current RMS
        if (this.smoothedRMS > 0) {
            return this.smoothedRMS;
        }

        this.analyser.getByteTimeDomainData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const sample = (this.dataArray[i] - 128) / 128;
            sum += sample * sample;
        }
        return Math.sqrt(sum / this.dataArray.length);
    }

    cleanup() {
        this.stopListening();

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.mediaRecorder = null;

        console.log('VAD: Cleaned up resources');
    }

    // Reset VAD state in case of errors
    reset() {
        console.log('VAD: Resetting state');

        // Stop any ongoing recording
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            try {
                this.mediaRecorder.stop();
            } catch (e) {
                console.log('Error stopping media recorder during reset:', e.message);
            }
        }

        // Clear audio chunks
        this.audioChunks = [];

        // Reset state
        this.isSpeaking = false;
        this.silenceStart = null;
        this.speechStartTime = null;

        // UPDATED: Reset enhanced noise filtering state
        this.rmsHistory = [];
        this.speechDetectionStart = null;
        this.smoothedRMS = 0;

        // Restart recording if still listening
        if (this.isListening && this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
            try {
                this.setupMediaRecorder();
            } catch (e) {
                console.error('Error setting up media recorder during reset:', e);
                this.onError(e);
            }
        }
    }
}

export default VoiceActivityDetection;