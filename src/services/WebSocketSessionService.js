/**
 * WebSocket Session Management Service
 * Handles session creation and management through WebSocket connections
 */

class WebSocketSessionService {
    constructor(options = {}) {
        this.wsUrl = options.wsUrl || process.env.REACT_APP_WEBSOCKET_URL || 'wss://nutrina.techjays.com/ws';
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.connectionTimeout = options.connectionTimeout || 10000;

        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.sessionId = null;
        this.userEmail = null;

        // Callbacks
        this.onConnect = options.onConnect || (() => {});
        this.onDisconnect = options.onDisconnect || (() => {});
        this.onSessionCreated = options.onSessionCreated || (() => {});
        this.onSessionLoaded = options.onSessionLoaded || (() => {});
        this.onChatResponse = options.onChatResponse || (() => {});
        this.onAudioResponse = options.onAudioResponse || (() => {});
        this.onTranscript = options.onTranscript || (() => {});
        this.onError = options.onError || ((error) => console.error('WebSocket Session Error:', error));
        this.onMessage = options.onMessage || (() => {});
    }

    connect(sessionId = null, userEmail = null) {
        try {
            this.sessionId = sessionId;
            this.userEmail = userEmail;
            
            // Build WebSocket URL with parameters
            let wsUrl = this.wsUrl;
            const params = new URLSearchParams();
            
            if (sessionId) {
                params.append('sessionId', sessionId);
            }
            if (userEmail) {
                params.append('userEmail', userEmail);
            }
            
            if (params.toString()) {
                wsUrl += '?' + params.toString();
            }

            console.log('🔗 Attempting WebSocket connection to:', wsUrl);
            this.socket = new WebSocket(wsUrl);

            // Connection timeout
            const connectionTimer = setTimeout(() => {
                if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
                    console.log('❌ WebSocket session connection timeout');
                    this.socket.close();
                    this.onError(new Error('Connection timeout - server not responding'));
                }
            }, this.connectionTimeout);

            this.socket.onopen = () => {
                clearTimeout(connectionTimer);
                console.log('✅ WebSocket session service connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.onConnect();
            };

            this.socket.onmessage = (event) => {
                console.log('📨 WebSocket message received:', event.data);
                console.log('📨 WebSocket message type:', typeof event.data);
                console.log('📨 WebSocket message length:', event.data.length);
                console.log('📨 WebSocket readyState:', this.socket.readyState);
                try {
                    const parsed = JSON.parse(event.data);
                    console.log('📨 Parsed WebSocket message:', parsed);
                    console.log('📨 Message type:', parsed.type);
                    console.log('📨 Message data keys:', Object.keys(parsed.data || {}));
                } catch (e) {
                    console.log('📨 Non-JSON WebSocket message');
                }
                this.handleMessage(event.data);
            };

            this.socket.onclose = (event) => {
                console.log('❌ WebSocket session service disconnected:', event.code, event.reason);
                this.isConnected = false;
                this.onDisconnect();

                // Handle specific error codes
                if (event.code === 1008) {
                    if (event.reason === 'Session ID required') {
                        console.log('⚠️ Session ID required - this is expected when no session ID is provided');
                    } else if (event.reason === 'Email address required') {
                        console.log('⚠️ Email address required - this is expected when no email is provided');
                    } else {
                        console.log('⚠️ WebSocket closed with code 1008:', event.reason);
                    }
                    // Don't reconnect for session ID or email errors
                    return;
                }

                if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket session service error:', error);
                // Create a proper error message
                const errorMessage = error.message || 'WebSocket connection failed';
                this.onError(new Error(errorMessage));
            };

        } catch (error) {
            console.error('❌ Error creating WebSocket connection:', error);
            this.onError(new Error(error.message || 'Failed to create WebSocket connection'));
        }
    }

    handleMessage(data) {
        try {
            console.log('📨 Parsing WebSocket message:', data);
            const message = JSON.parse(data);

            switch (message.type) {
                case 'session_created':
                    console.log('✅ Session created:', message.data);
                    this.sessionId = message.data.sessionId;
                    this.onSessionCreated(message.data);
                    break;
                case 'session_loaded':
                    console.log('✅ Session loaded:', message.data);
                    this.onSessionLoaded(message.data);
                    break;
                case 'chat_response':
                    console.log('💬 Chat response received:', message.data);
                    this.onChatResponse(message.data);
                    break;
                case 'audio':
                    console.log('🎵 Audio response received:', message.data);
                    this.onAudioResponse(message.data);
                    break;
                case 'transcript':
                    console.log('📝 Transcript received:', message.data);
                    this.onTranscript(message.data);
                    break;
                case 'text_message':
                    console.log('📝 Text message response received:', message.data);
                    // Forward text message responses to chat response handler
                    this.onChatResponse(message.data);
                    break;
                case 'error':
                    console.error('❌ Session service error:', message.data);
                    const errorMessage = message.data?.message || 'Unknown session service error';
                    this.onError(new Error(errorMessage));
                    break;
                case 'status':
                    console.log('ℹ️ Session service status:', message.data);
                    break;
                default:
                    console.log('❓ Unknown session message type:', message.type, message);
                    this.onMessage(message);
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket session message:', error);
            console.error('Raw message data:', data);
            this.onError(new Error('Failed to parse session message: ' + error.message));
        }
    }

    createSession(userEmail) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot create session: WebSocket not connected');
            return false;
        }

        try {
            const message = JSON.stringify({
                type: 'create_session',
                data: {
                    userEmail: userEmail
                }
            });

            this.socket.send(message);
            console.log('Session creation request sent');
            return true;
        } catch (error) {
            console.error('Error creating session:', error);
            this.onError(new Error('Failed to create session'));
            return false;
        }
    }

    loadSession(sessionId) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot load session: WebSocket not connected');
            return false;
        }

        try {
            const message = JSON.stringify({
                type: 'load_session',
                data: {
                    sessionId: sessionId
                }
            });

            this.socket.send(message);
            console.log('Session load request sent');
            return true;
        } catch (error) {
            console.error('Error loading session:', error);
            this.onError(new Error('Failed to load session'));
            return false;
        }
    }

    sendMessage(messageText) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot send message: WebSocket not connected');
            return false;
        }

        try {
            const message = JSON.stringify({
                type: 'chat_message',
                data: {
                    message: messageText,
                    sessionId: this.sessionId
                }
            });

            console.log('📤 Sending chat message:', message);
            this.socket.send(message);
            console.log('Chat message sent');
            return true;
        } catch (error) {
            console.error('Error sending chat message:', error);
            this.onError(new Error('Failed to send chat message'));
            return false;
        }
    }

    sendAudio(audioBlob) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot send audio: WebSocket not connected');
            return false;
        }

        if (this.socket.readyState !== WebSocket.OPEN) {
            console.warn('Cannot send audio: WebSocket not in OPEN state:', this.socket.readyState);
            return false;
        }

        try {
            // Check if audio blob is valid
            if (!audioBlob || audioBlob.size < 500) {
                console.warn('Skipping very small or invalid audio blob:', audioBlob?.size || 0);
                return false;
            }

            // Convert blob to base64 and send as webm_audio message
            const reader = new FileReader();
            reader.onloadend = () => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    const base64Audio = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
                    
                    const message = JSON.stringify({
                        type: 'webm_audio',
                        data: base64Audio,
                        mimeType: 'audio/webm',
                        size: audioBlob.size,
                        sessionId: this.sessionId
                    });

                    console.log(`🎤 Sending audio via WebSocket: ${audioBlob.size} bytes`);
                    this.socket.send(message);
                } else {
                    console.warn('WebSocket closed while preparing to send audio');
                }
            };

            reader.onerror = () => {
                console.error('Failed to read audio blob for WebSocket transmission');
                this.onError(new Error('Failed to process audio data'));
            };

            reader.readAsDataURL(audioBlob);
            return true;
        } catch (error) {
            console.error('Error sending audio via WebSocket:', error);
            this.onError(new Error('Failed to send audio data'));
            return false;
        }
    }

    sendBinaryAudio(audioBlob) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot send binary audio: WebSocket not connected');
            return false;
        }

        if (this.socket.readyState !== WebSocket.OPEN) {
            console.warn('Cannot send binary audio: WebSocket not in OPEN state:', this.socket.readyState);
            return false;
        }

        try {
            // Check if audio blob is valid
            if (!audioBlob || audioBlob.size < 500) {
                console.warn('Skipping very small or invalid audio blob:', audioBlob?.size || 0);
                return false;
            }

            // Convert blob to array buffer and send as binary data
            audioBlob.arrayBuffer().then(buffer => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    console.log(`🎤 Sending binary audio via WebSocket: ${buffer.byteLength} bytes`);
                    this.socket.send(buffer);
                } else {
                    console.warn('WebSocket closed while preparing to send binary audio');
                }
            }).catch(error => {
                console.error('Error processing audio blob for binary transmission:', error);
                this.onError(new Error('Failed to process audio data'));
            });

            return true;
        } catch (error) {
            console.error('Error sending binary audio via WebSocket:', error);
            this.onError(new Error('Failed to send audio data'));
            return false;
        }
    }

    sendTextMessage(text) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot send text message: WebSocket not connected');
            return false;
        }

        try {
            // Use text_message type to match the HTML sample exactly
            const message = JSON.stringify({
                type: 'text_message',
                data: text,
                timestamp: Date.now()
            });

            console.log('📤 Sending text message as text_message:', message);
            this.socket.send(message);
            console.log('text_message sent via WebSocket');
            return true;
        } catch (error) {
            console.error('Error sending text_message:', error);
            this.onError(new Error('Failed to send text message'));
            return false;
        }
    }

    sendSpeechStartSignal() {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot send speech start signal: WebSocket not connected');
            return false;
        }

        try {
            const message = JSON.stringify({
                type: 'speech_start',
                timestamp: Date.now(),
                sessionId: this.sessionId
            });

            this.socket.send(message);
            console.log('Speech start signal sent');
            return true;
        } catch (error) {
            console.error('Error sending speech start signal:', error);
            this.onError(new Error('Failed to send speech start signal'));
            return false;
        }
    }

    scheduleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1), 30000);

        console.log(`Scheduling session service reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                console.log(`Reconnecting session service... attempt ${this.reconnectAttempts}`);
                this.connect(this.sessionId, this.userEmail);
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
        console.log('Disconnected from session service');
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            socketState: this.socket ? this.socket.readyState : null,
            sessionId: this.sessionId,
            userEmail: this.userEmail
        };
    }
}

export default WebSocketSessionService; 