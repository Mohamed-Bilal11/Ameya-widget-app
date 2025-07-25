/**
 * Web Speech API Service
 * Provides browser-based speech-to-text with immediate transcription display
 */

class WebSpeechService {
    constructor(options = {}) {
        // Configuration
        this.language = options.language || 'en-US';
        this.continuous = options.continuous !== false; // Default to true
        this.interimResults = options.interimResults !== false; // Default to true
        this.maxAlternatives = options.maxAlternatives || 5; // Increased from 1 to 5 for better accuracy
        this.confidenceThreshold = options.confidenceThreshold || 0.7; // Minimum confidence score
        
        // State management
        this.recognition = null;
        this.isListening = false;
        this.isSupported = false;
        this.isInitialized = false;
        this.abortedCount = 0; // Track aborted errors for retry logic
        this.microphoneAvailable = null; // Track microphone availability
        
        // Callbacks
        this.onStart = options.onStart || (() => {});
        this.onEnd = options.onEnd || (() => {});
        this.onResult = options.onResult || (() => {});
        this.onInterimResult = options.onInterimResult || (() => {});
        this.onError = options.onError || ((error) => console.error('Web Speech Error:', error));
        this.onFinalResult = options.onFinalResult || (() => {});
        this.onAlternatives = options.onAlternatives || (() => {}); // New callback for alternatives
        this.onLowConfidence = options.onLowConfidence || (() => {}); // New callback for low confidence results
        
        // Check browser support
        this.checkSupport();
    }
    
    checkSupport() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.isSupported = !!SpeechRecognition;
        
        if (!this.isSupported) {
            console.warn('Web Speech API not supported in this browser');
            this.onError(new Error('Web Speech API not supported in this browser'));
        } else {
            console.log('✅ Web Speech API supported');
        }
    }
    
    // Check if microphone is available and has permission
    async checkMicrophoneAvailability() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('MediaDevices API not supported in this browser');
            this.microphoneAvailable = false;
            return false;
        }

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // If we got here, microphone is available and permission granted
            console.log('✅ Microphone access granted');
            
            // Clean up the stream
            stream.getTracks().forEach(track => track.stop());
            
            this.microphoneAvailable = true;
            return true;
        } catch (error) {
            console.error('❌ Microphone access error:', error);
            
            // Determine specific error
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                console.warn('Microphone permission denied by user');
            } else if (error.name === 'NotFoundError') {
                console.warn('No microphone device found');
            } else {
                console.warn('Microphone error:', error.name);
            }
            
            this.microphoneAvailable = false;
            this.onError(error);
            return false;
        }
    }
    
    async initialize() {
        if (!this.isSupported) {
            throw new Error('Web Speech API not supported');
        }
        
        if (this.isInitialized) {
            console.log('Web Speech API already initialized');
            return true;
        }
        
        // Check microphone availability first
        if (this.microphoneAvailable === null) {
            this.microphoneAvailable = await this.checkMicrophoneAvailability();
            if (!this.microphoneAvailable) {
                throw new Error('Microphone not available or permission denied');
            }
        }
        
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure recognition
            this.recognition.continuous = this.continuous;
            this.recognition.interimResults = this.interimResults;
            this.recognition.lang = this.language;
            this.recognition.maxAlternatives = this.maxAlternatives;
            
            // Set up event handlers
            this.setupEventHandlers();
            
            this.isInitialized = true;
            console.log('✅ Web Speech API initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Web Speech API:', error);
            this.onError(error);
            return false;
        }
    }
    
    setupEventHandlers() {
        if (!this.recognition) return;
        
        this.recognition.onstart = () => {
            console.log('🗣️ Web Speech API started listening');
            this.isListening = true;
            this.abortedCount = 0; // Reset aborted count on successful start
            this.onStart();
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            let bestAlternative = null;
            let allAlternatives = [];
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                
                if (result.isFinal) {
                    // Process all alternatives for final results
                    const alternatives = [];
                    for (let j = 0; j < result.length; j++) {
                        const alternative = result[j];
                        alternatives.push({
                            transcript: alternative.transcript,
                            confidence: alternative.confidence || 0
                        });
                    }
                    
                    // Sort alternatives by confidence
                    alternatives.sort((a, b) => b.confidence - a.confidence);
                    allAlternatives = alternatives;
                    
                    // Get the best alternative
                    bestAlternative = alternatives[0];
                    finalTranscript += bestAlternative.transcript;
                    
                    // Log alternatives for debugging
                    console.log('🗣️ All alternatives:', alternatives);
                    
                    // Check if confidence is low
                    if (bestAlternative.confidence < this.confidenceThreshold) {
                        console.warn(`🗣️ Low confidence transcription (${bestAlternative.confidence.toFixed(2)}):`, bestAlternative.transcript);
                        this.onLowConfidence(bestAlternative, alternatives);
                    }
                    
                    // Send alternatives to callback
                    this.onAlternatives(alternatives);
                } else {
                    // For interim results, just use the first alternative
                    interimTranscript += result[0].transcript;
                }
            }
            
            // Handle interim results for real-time display
            if (interimTranscript) {
                console.log('🗣️ Interim transcript:', interimTranscript);
                this.onInterimResult(interimTranscript);
            }
            
            // Handle final results
            if (finalTranscript) {
                console.log('🗣️ Final transcript:', finalTranscript);
                console.log('🗣️ Best confidence:', bestAlternative?.confidence || 'N/A');
                
                // Send the best result
                this.onResult(finalTranscript);
                this.onFinalResult(finalTranscript, bestAlternative, allAlternatives);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('🗣️ Web Speech API error:', event.error);
            this.isListening = false;
            
            let errorMessage = 'Speech recognition error';
            
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try speaking again.';
                    // Auto-restart for no-speech errors
                    if (this.isListening) {
                        setTimeout(() => this.start(), 1000);
                    }
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone found. Please connect a microphone.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Speech recognition service not allowed.';
                    break;
                case 'bad-grammar':
                    errorMessage = 'Speech recognition grammar error.';
                    break;
                case 'language-not-supported':
                    errorMessage = 'Language not supported.';
                    break;
                case 'aborted':
                    this.abortedCount++;
                    errorMessage = 'Speech recognition was aborted.';
                    
                    // Implement exponential backoff for retry
                    if (this.shouldAutoRestart && this.abortedCount < 5) {
                        const backoffTime = Math.min(1000 * Math.pow(2, this.abortedCount - 1), 10000);
                        console.log(`🔄 Restarting after aborted error (attempt ${this.abortedCount}) in ${backoffTime}ms`);
                        setTimeout(() => {
                            if (this.shouldAutoRestart && !this.isListening) {
                                this.start();
                            }
                        }, backoffTime);
                    } else if (this.abortedCount >= 5) {
                        errorMessage = 'Speech recognition repeatedly aborted. Please try again later.';
                        this.shouldAutoRestart = false;
                    }
                    break;
                default:
                    errorMessage = `Speech recognition error: ${event.error}`;
            }
            
            this.onError(new Error(errorMessage));
        };
        
        this.recognition.onend = () => {
            console.log('🗣️ Web Speech API stopped listening');
            this.isListening = false;
            this.onEnd();
            
            // Auto-restart if we should still be listening
            if (this.shouldAutoRestart) {
                setTimeout(() => {
                    if (this.shouldAutoRestart && !this.isListening) {
                        console.log('🔄 Auto-restarting Web Speech API');
                        this.start();
                    }
                }, 1000);
            }
        };
    }
    
    async start() {
        if (!this.isInitialized) {
            console.warn('Web Speech API not initialized. Call initialize() first.');
            return false;
        }
        
        if (this.isListening) {
            console.log('Web Speech API already listening');
            return true;
        }
        
        // Check microphone availability before starting
        if (this.microphoneAvailable === null || this.microphoneAvailable === false) {
            try {
                const available = await this.checkMicrophoneAvailability();
                if (!available) {
                    console.error('❌ Cannot start Web Speech API: Microphone not available');
                    this.onError(new Error('Microphone not available or permission denied'));
                    return false;
                }
            } catch (error) {
                console.error('❌ Microphone check failed:', error);
                this.onError(error);
                return false;
            }
        }
        
        try {
            console.log('🗣️ Starting Web Speech API...');
            this.shouldAutoRestart = true;
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('❌ Error starting Web Speech API:', error);
            this.onError(error);
            return false;
        }
    }
    
    stop() {
        if (!this.isListening) {
            return;
        }
        
        try {
            console.log('🛑 Stopping Web Speech API...');
            this.shouldAutoRestart = false;
            this.recognition.stop();
        } catch (error) {
            console.error('❌ Error stopping Web Speech API:', error);
        }
    }
    
    pause() {
        if (!this.isListening) {
            return;
        }
        
        try {
            console.log('⏸️ Pausing Web Speech API...');
            this.shouldAutoRestart = false;
            this.recognition.stop();
        } catch (error) {
            console.error('❌ Error pausing Web Speech API:', error);
        }
    }
    
    resume() {
        if (this.isListening) {
            return;
        }
        
        setTimeout(() => {
            this.start();
        }, 500);
    }
    
    // Update language
    setLanguage(language) {
        if (this.recognition) {
            this.recognition.lang = language;
            this.language = language;
            console.log(`🗣️ Language updated to: ${language}`);
        }
    }
    
    // Check if currently listening
    getListeningState() {
        return this.isListening;
    }
    
    // Check if supported
    isSupported() {
        return this.isSupported;
    }
    
    // Cleanup
    cleanup() {
        if (this.isListening) {
            this.stop();
        }
        
        this.recognition = null;
        this.isInitialized = false;
        this.isListening = false;
        this.shouldAutoRestart = false;
        this.abortedCount = 0;
        
        console.log('🗣️ Web Speech API cleaned up');
    }
    
    // New method to update confidence threshold
    setConfidenceThreshold(threshold) {
        this.confidenceThreshold = threshold;
        console.log(`🗣️ Confidence threshold updated to: ${threshold}`);
    }
    
    // Explicitly request microphone permissions
    async requestMicrophonePermission() {
        try {
            console.log('🎤 Requesting microphone permission...');
            const available = await this.checkMicrophoneAvailability();
            
            if (available) {
                console.log('✅ Microphone permission granted');
                return true;
            } else {
                console.warn('❌ Microphone permission denied or device not available');
                return false;
            }
        } catch (error) {
            console.error('❌ Error requesting microphone permission:', error);
            this.onError(error);
            return false;
        }
    }
    
    // New method to get current settings
    getSettings() {
        return {
            language: this.language,
            continuous: this.continuous,
            interimResults: this.interimResults,
            maxAlternatives: this.maxAlternatives,
            confidenceThreshold: this.confidenceThreshold,
            microphoneAvailable: this.microphoneAvailable
        };
    }
}

export default WebSpeechService; 