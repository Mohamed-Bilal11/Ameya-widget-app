/**
 * WebSocket Audio Streaming Service
 * Handles real-time audio streaming to backend for continuous processing
 */

class AudioStreamingService {
    constructor(options = {}) {
        this.wsUrl = options.wsUrl || process.env.REACT_APP_WEBSOCKET_URL || 'wss://nutrina.techjays.com/ws';
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10; // Increased from 5 to 10
        this.connectionTimeout = options.connectionTimeout || 15000; // 15 second connection timeout

        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;

        // Callbacks
        this.onConnect = options.onConnect || (() => { });
        this.onDisconnect = options.onDisconnect || (() => { });
        this.onTranscript = options.onTranscript || (() => { });
        this.onAIResponse = options.onAIResponse || (() => { });
        this.onError = options.onError || ((error) => console.error('AudioStreaming Error:', error));
    } connect(sessionId) {
        try {
            this.sessionId = sessionId;
            this.socket = new WebSocket(`${this.wsUrl}?sessionId=${sessionId}`);

            // Connection timeout
            const connectionTimer = setTimeout(() => {
                if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
                    console.log('WebSocket connection timeout');
                    this.socket.close();
                }
            }, this.connectionTimeout);

            this.socket.onopen = () => {
                clearTimeout(connectionTimer);
                console.log('WebSocket connected to audio streaming service');
                this.isConnected = true;
                this.reconnectAttempts = 0;

                // Clear any residual audio buffer on reconnection
                setTimeout(() => {
                    this.clearServerBuffer();
                }, 100);

                this.onConnect();
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                this.isConnected = false;
                this.onDisconnect();

                if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.onError(error);
            };

        } catch (error) {
            this.onError(error);
        }
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'transcript':
                    this.onTranscript(message.data);
                    break;
                case 'ai-response':
                    this.onAIResponse(message.data);
                    break; case 'error':
                    console.error('Server error:', message.data);

                    // Provide more specific error messages to user
                    let errorMsg = message.data.message || 'Unknown server error';
                    if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
                        errorMsg = 'Service temporarily busy. Please wait a moment and try again.';
                    } else if (errorMsg.includes('timeout')) {
                        errorMsg = 'Connection timeout. Please try speaking again.';
                    } else if (errorMsg.includes('processing audio')) {
                        errorMsg = 'Audio processing error. Please try speaking more clearly.';
                    }

                    this.onError(new Error(errorMsg));
                    break;
                case 'status':
                    console.log('Server status:', message.data);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            this.onError(new Error('Failed to parse server message'));
        }
    }

    sendAudioChunk(audioBlob) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot send audio: WebSocket not connected');
            return false;
        }

        if (this.socket.readyState !== WebSocket.OPEN) {
            console.warn('Cannot send audio: WebSocket not in OPEN state:', this.socket.readyState);
            return false;
        }

        try {
            // Check if audio blob is valid and substantial
            // Reduced threshold to allow smaller but valid chunks through
            if (!audioBlob || audioBlob.size < 500) {
                console.warn('Skipping very small or invalid audio chunk:', audioBlob?.size || 0);
                return false;
            }

            // Convert blob to array buffer and send
            audioBlob.arrayBuffer().then(buffer => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    console.log(`Sending audio chunk: ${buffer.byteLength} bytes`);
                    this.socket.send(buffer);
                } else {
                    console.warn('WebSocket closed while preparing to send audio');
                }
            }).catch(error => {
                console.error('Error processing audio blob:', error);
                this.onError(new Error('Failed to process audio data'));
            });

            return true;
        } catch (error) {
            console.error('Error sending audio chunk:', error);
            this.onError(new Error('Failed to send audio data'));
            return false;
        }
    }

    sendCommand(command, data = {}) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot send command: WebSocket not connected');
            return false;
        }

        if (this.socket.readyState !== WebSocket.OPEN) {
            console.warn('Cannot send command: WebSocket not in OPEN state:', this.socket.readyState);
            return false;
        }

        try {
            const message = JSON.stringify({
                type: 'command',
                command,
                data,
                sessionId: this.sessionId
            });

            this.socket.send(message);
            console.log(`Sent command: ${command}`);
            return true;
        } catch (error) {
            console.error('Error sending command:', error);
            this.onError(new Error('Failed to send command'));
            return false;
        }
    }

    // Clear the audio buffer on the server side
    clearServerBuffer() {
        return this.sendCommand('clear-buffer');
    }

    // Force process any buffered audio on server
    processServerBuffer() {
        return this.sendCommand('process-audio');
    }

    scheduleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        } this.reconnectAttempts++;
        const baseDelay = this.reconnectInterval;
        const delay = Math.min(baseDelay * Math.pow(1.5, this.reconnectAttempts - 1), 30000); // Max 30 seconds

        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            if (this.sessionId && this.reconnectAttempts < this.maxReconnectAttempts) {
                console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
                this.connect(this.sessionId);
            }
        }, delay);
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }

        this.isConnected = false;
        this.reconnectAttempts = 0;
        console.log('Disconnected from audio streaming service');
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            socketState: this.socket ? this.socket.readyState : null
        };
    }
}

export default AudioStreamingService;
