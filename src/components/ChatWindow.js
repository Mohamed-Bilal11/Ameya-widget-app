/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, User, Mic, MicOff, Phone } from 'lucide-react';
import VoiceActivityDetection from './VoiceActivityDetection';
import WebSpeechService from '../services/WebSpeechService';
import { GlowingEffect } from './ui/glowing-effect';

// Wave Animation Component
const WaveAnimation = ({ isActive, colors = "from-cyan-400 to-blue-500" }) => {
  if (!isActive) return null;
  
  return (
    <div className="flex items-center justify-center gap-0.5 w-4 h-4">
      <div className={`w-0.6 h-1 bg-gradient-to-t ${colors} rounded-full animate-wave-1`}></div>
      <div className={`w-0.6 h-2 bg-gradient-to-t ${colors} rounded-full animate-wave-2`}></div>
      <div className={`w-0.6 h-1.5 bg-gradient-to-t ${colors} rounded-full animate-wave-3`}></div>
      <div className={`w-0.6 h-3 bg-gradient-to-t ${colors} rounded-full animate-wave-4`}></div>
      <div className={`w-0.6 h-1 bg-gradient-to-t ${colors} rounded-full animate-wave-5`}></div>
    </div>
  );
};

// Test backend connectivity (removed - using WebSocket connection status instead)
const testBackendConnection = async () => {
  // WebSocket connection status is handled by the session service
  console.log("✅ Backend connectivity checked via WebSocket");
  return true;
};

// Local Audio File Player for calling tone
const createLocalAudioPlayer = (audioPath) => {
  let audio = null;
  let isPlaying = false;
  
  return {
    start: () => {
      try {
        // Stop any existing audio first
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        
        console.log("🎵 Starting local audio:", audioPath);
        audio = new Audio(audioPath);
        audio.loop = true; // Loop the audio
        audio.volume = 0.6; // Set volume to 60%
        
        audio.onplay = () => {
          console.log("🎵 Local audio started playing");
          isPlaying = true;
        };
        
        audio.onended = () => {
          console.log("🎵 Local audio ended");
          isPlaying = false;
        };
        
        audio.onerror = (error) => {
          console.error("❌ Local audio error:", error);
          isPlaying = false;
        };
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log("🎵 Local audio play promise resolved");
          }).catch(error => {
            console.error("❌ Local audio play promise rejected:", error);
            isPlaying = false;
          });
        }
        
      } catch (error) {
        console.error("❌ Error starting local audio:", error);
        isPlaying = false;
      }
    },
    
    stop: () => {
      if (audio) {
        console.log("🎵 Stopping local audio");
        try {
          audio.pause();
          audio.currentTime = 0;
          isPlaying = false;
        } catch (error) {
          console.warn("Error stopping local audio:", error);
        }
      }
    },
    
    setVolume: (volume) => {
      if (audio) {
        const adjustedVolume = Math.max(0, Math.min(1, volume));
        audio.volume = adjustedVolume;
      }
    },
    
    isPlaying: () => isPlaying
  };
};

// Typewriter Effect Component - Smart Voice Sync
const TypewriterText = ({ text, speed = 15, delay = 800, onComplete, messageId, isCompleted = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasRun, setHasRun] = useState(false); // Track if typewriter has already run
  
  // If already completed, show full text immediately
  useEffect(() => {
    if (isCompleted && !hasRun) {
      setDisplayedText(text);
      setIsComplete(true);
      setHasStarted(true);
      setHasRun(true);
      return;
    }
  }, [isCompleted, text, hasRun]);

  useEffect(() => {
    // Prevent restarting if already completed or has run
    if (!text || isCompleted || hasRun) return;
    
    setDisplayedText('');
    setIsComplete(false);
    setHasStarted(false);
    setHasRun(true); // Mark as run to prevent restarts
    let index = 0;
    let currentSpeed = speed;
    let timeoutId;

    console.log(`Starting typewriter for message: ${messageId}`);

    // Start typewriter after delay to sync with voice
    const startDelay = setTimeout(() => {
      setHasStarted(true);
      
      const typeChar = () => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
          
          // Gradually speed up typewriter as it progresses
          if (index > text.length * 0.3) {
            currentSpeed = Math.max(speed * 0.8, 15); // Speed up after 30% of text
          }
          
          timeoutId = setTimeout(typeChar, currentSpeed);
        } else {
          setIsComplete(true);
          console.log(`Typewriter completed for message: ${messageId}`);
          if (onComplete) onComplete(messageId);
        }
      };
      
      typeChar();
    }, delay);

    return () => {
      clearTimeout(startDelay);
      if (timeoutId) clearTimeout(timeoutId);
    };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, delay, messageId]); // Removed onComplete from dependencies

  return (
    <span>
      {!hasStarted && delay > 0 && !isCompleted ? (
        <span className="text-blue-400 font-medium animate-pulse">●●●</span>
      ) : (
        <>
          {displayedText}
          {!isComplete && !isCompleted && (
            <span className="text-blue-400 font-bold animate-pulse">|</span>
          )}
        </>
      )}
    </span>
  );
};

const ChatWindow = ({ 
  isOpen, 
  onClose, 
  currentUser,
  // Additional props for session management
  userSessions,
  selectedSessionId,
  handleSessionChange,
  sessionId,
  // WebSocket session service
  sessionService,
  // WebSocket chat response
  chatResponse,
  onChatResponseProcessed
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [typewriterMessageId, setTypewriterMessageId] = useState(null);
  
  // Voice functionality states
  const [isRecording, setIsRecording] = useState(false);
  const [isVADActive, setIsVADActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  // Web Speech API states
  const [isWebSpeechActive, setIsWebSpeechActive] = useState(false);
  const [webSpeechSupported, setWebSpeechSupported] = useState(false);
  const [useWebSpeech, setUseWebSpeech] = useState(true); // Default to Web Speech API
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Transcript handling state
  const [pendingTranscript, setPendingTranscript] = useState(null);
  const [isWaitingForAIResponse, setIsWaitingForAIResponse] = useState(false);
  
  // Additional states from old code
  
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [hasPlayedGreeting, setHasPlayedGreeting] = useState(false);
  
  // Animation states for specific messages
  const [currentSpeakingMessageId, setCurrentSpeakingMessageId] = useState(null);
  const [currentUserMessageId, setCurrentUserMessageId] = useState(null);
  
  // New states for mute/unmute and call control
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  
  // Professional polish states
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [showMicError, setShowMicError] = useState(false);
  const [showAIError, setShowAIError] = useState(false);
  const [lastError, setLastError] = useState(null);
  
  // Streaming states
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [processingTimeout, setProcessingTimeout] = useState(null);
  const [sttServiceAvailable, setSttServiceAvailable] = useState(true);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [processingError, setProcessingError] = useState(false);
  
  // Automatic conversation flow states
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [autoListenTimeout, setAutoListenTimeout] = useState(null);
  const [noSpeechTimeout, setNoSpeechTimeout] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioLevelIntervalRef = useRef(null);
  
  // Add state to prevent message duplication
  const [processingMessageIds, setProcessingMessageIds] = useState(new Set());
  const messageIdCounterRef = useRef(0);
  
  // Add state to prevent multiple simultaneous AI requests
  const [isProcessingAIRequest, setIsProcessingAIRequest] = useState(false);
  
  // Add debouncing for speech events
  const lastSpeechEndTime = useRef(0);
  
  // Track completed typewriter messages to prevent restarts
  const [completedTypewriterIds, setCompletedTypewriterIds] = useState(new Set());
  
  // Local audio player state
  const [isLocalAudioPlaying, setIsLocalAudioPlaying] = useState(false);
  
  const messagesEndRef = useRef(null);
  const vadRef = useRef(null);
  const webSpeechRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioStreamRef = useRef(null);
  const greetingTimeoutRef = useRef(null);
  const localAudioPlayerRef = useRef(null);

  // Stable callback for typewriter completion to prevent effect restarts
  const handleTypewriterComplete = useCallback((messageId) => {
    console.log(`Typewriter completed for message: ${messageId}`);
    setCompletedTypewriterIds(prev => new Set([...prev, messageId]));
    setTypewriterMessageId(null);
  }, []);

  // Local audio control functions
  const startLocalAudio = useCallback((audioPath = '/audio/ringtone-1-46486.mp3') => {
    try {
      // Stop any existing audio first
      stopLocalAudio();
      
      console.log("🎵 Starting local audio:", audioPath);
      localAudioPlayerRef.current = createLocalAudioPlayer(audioPath);
      localAudioPlayerRef.current.start();
      setIsLocalAudioPlaying(true);
    } catch (error) {
      console.warn("Failed to start local audio:", error);
      // Fallback to silent operation if audio file is not available
    }
  }, []);

  const stopLocalAudio = useCallback(() => {
    if (localAudioPlayerRef.current) {
      console.log("🎵 Stopping local audio");
      try {
        localAudioPlayerRef.current.stop();
      } catch (error) {
        console.warn("Error stopping local audio:", error);
      }
      localAudioPlayerRef.current = null;
      setIsLocalAudioPlaying(false);
    }
  }, []);

  // Generate unique message IDs to prevent conflicts
  const generateMessageId = () => {
    messageIdCounterRef.current += 1;
    return `msg_${Date.now()}_${messageIdCounterRef.current}`;
  };

  // Safe message addition with deduplication
  const addMessage = useCallback((newMessage) => {
    const messageId = newMessage.id || generateMessageId();
    const messageWithId = { ...newMessage, id: messageId };
    
    // Check if this message is already being processed
    if (processingMessageIds.has(messageId)) {
      console.log(`Preventing duplicate message: ${messageId}`);
      return messageWithId;
    }
    
    // Mark this message as being processed
    setProcessingMessageIds(prev => new Set([...prev, messageId]));
    
    // Add the message
    setMessages(prev => {
      // Double-check for duplicates by text content and type
      const isDuplicate = prev.some(msg => 
        msg.text === messageWithId.text && 
        msg.isAI === messageWithId.isAI &&
        Math.abs(new Date(msg.timestamp) - new Date(messageWithId.timestamp)) < 2000 // Within 2 seconds
      );
      
      if (isDuplicate) {
        console.log(`Preventing duplicate message by content: ${messageWithId.text.substring(0, 50)}...`);
        return prev;
      }
      
      return [...prev, messageWithId];
    });
    
    // Clean up processing flag after a delay
    setTimeout(() => {
      setProcessingMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }, 3000);
    
    return messageWithId;
  }, [processingMessageIds]);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typewriterMessageId]);

  // Cleanup VAD and Web Speech on component unmount or modal close
  useEffect(() => {
    return () => {
      if (vadRef.current) {
        vadRef.current.cleanup();
        vadRef.current = null;
      }
      if (webSpeechRef.current) {
        webSpeechRef.current.cleanup();
        webSpeechRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clean up local audio
      stopLocalAudio();
    };
  }, [stopLocalAudio]);

  // Stop VAD and Web Speech when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (vadRef.current) {
        vadRef.current.stopListening();
        setIsVADActive(false);
      }
      if (webSpeechRef.current) {
        webSpeechRef.current.stop();
        setIsWebSpeechActive(false);
      }
      // Stop local audio when modal closes
      stopLocalAudio();
    }
  }, [isOpen, stopLocalAudio]);

  // Pause/Resume voice recording based on AI speaking state
  useEffect(() => {
    if (isAISpeaking) {
      // AI is speaking - pause voice recording to prevent feedback
      console.log("🔇 AI is speaking, pausing voice recording to prevent feedback");
      
      if (vadRef.current) {
        vadRef.current.stopListening();
        setIsVADActive(false);
      }
      
      if (webSpeechRef.current) {
        webSpeechRef.current.pause();
        setIsWebSpeechActive(false);
      }
      
      // setCurrentTranscript('🤖 AI is speaking...');
    } else {
      // AI finished speaking - resume voice recording ONLY if user hasn't muted and conditions are good
      if (isOpen && !isMuted && !isProcessingVoice && !isUserSpeaking) {
        console.log("🎤 AI finished speaking, resuming voice recording (user has not muted)");
        
        // Resume the appropriate voice system
        if (useWebSpeech && webSpeechSupported && webSpeechRef.current) {
          webSpeechRef.current.resume();
          setIsWebSpeechActive(true);
        } else if (vadRef.current) {
          vadRef.current.startListening();
          setIsVADActive(true);
        }
        
        // setCurrentTranscript('🎤 Listening... Speak now!');
      } else if (isMuted) {
        console.log("🔇 AI finished speaking but user has muted - not resuming voice recording");
        setCurrentTranscript('');
      }
    }
  }, [isAISpeaking, isOpen, isMuted, isProcessingVoice, isUserSpeaking, useWebSpeech, webSpeechSupported]);

  // Play greeting message when modal opens and initialize VAD
  useEffect(() => {
    if (isOpen && !hasPlayedGreeting) {
      // Start local audio (ringtone) immediately when chat opens
      console.log("🎵 Starting ringtone for call connection");
      startLocalAudio();
      
      // Test backend connection first
      testBackendConnection().then((connected) => {
        if (connected) {
          console.log("🎵 Backend connected, playing greeting");
        } else {
          console.log("⚠️ Backend not connected, playing greeting with browser TTS only");
        }
        playGreetingMessage();
        setHasPlayedGreeting(true);
        setIsCallActive(true); // Set call as active when chat opens
        
        // Initialize and prepare voice systems for automatic start after greeting
        console.log("🎤 Preparing voice systems and will start automatically after greeting...");
        
        // Try Web Speech API first, fallback to VAD
        if (useWebSpeech) {
          initializeWebSpeechSystem().then(() => {
            console.log("✅ Web Speech API system prepared successfully");
          }).catch(error => {
            console.log("⚠️ Web Speech API system preparation failed, falling back to VAD:", error);
            // Fallback to VAD
            initializeVADSystem().then(() => {
              console.log("✅ VAD system prepared successfully as fallback");
            }).catch(vadError => {
              console.log("⚠️ VAD system preparation also failed, voice recording will be unavailable:", vadError);
            });
          });
        } else {
          // Use VAD directly
          initializeVADSystem().then(() => {
            console.log("✅ VAD system prepared successfully");
          }).catch(error => {
            console.log("⚠️ VAD system preparation failed, voice recording will be unavailable:", error);
          });
        }
      });
    }  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasPlayedGreeting, startLocalAudio]);

  // Handle chat responses from WebSocket service
  useEffect(() => {
    if (chatResponse && isOpen) {
      console.log("🎵 Processing chat response from WebSocket:", chatResponse);
      console.log("🔍 Response details:", {
        response: chatResponse.response,
        message: chatResponse.message,
        text: chatResponse.text,
        dataResponse: chatResponse.data?.response,
        dataMessage: chatResponse.data?.message,
        hasAudio: !!(chatResponse.audio || chatResponse.data?.audio),
        isTranscript: chatResponse.isTranscript,
        isAudioResponse: chatResponse.isAudioResponse,
        type: chatResponse.type,
        data: chatResponse.data
      });
      
      // Handle transcript separately from AI response
      if (chatResponse.isTranscript) {
        console.log("📝 Processing transcript:", chatResponse);
        
        // Extract transcript text from various possible fields
        const transcriptText = chatResponse.transcript || 
                             chatResponse.text ||
                             chatResponse.data?.transcript ||
                             chatResponse.data?.text ||
                             "Speech detected";
        
        console.log("📝 Final transcript text:", transcriptText);
        
        // Add transcript as user message immediately
        const userMessage = addMessage({
          text: transcriptText,
          isAI: false,
          timestamp: new Date(),
          isTypewriter: false,
          isGreeting: false
        });
        
        setCurrentUserMessageId(userMessage.id);
        setIsWaitingForAIResponse(true);
        
        // Mark response as processed
        onChatResponseProcessed();
        return;
      }
      
      // Handle AI response (only if we have a transcript or it's a direct text message)
      if (chatResponse.isAudioResponse || chatResponse.response || chatResponse.message || chatResponse.text || chatResponse.data?.response || chatResponse.data?.message) {
        console.log("🎵 Processing AI response");
        
        // Extract the actual response text from various possible fields
        const responseText = chatResponse.response || 
                           chatResponse.message || 
                           chatResponse.text ||
                           chatResponse.data?.response ||
                           chatResponse.data?.message ||
                           "I received your message.";
        
        console.log("🔍 Final response text:", responseText);
        
        // Cancel the greeting timeout since we received a response from the server
        if (greetingTimeoutRef.current) {
          console.log("✅ Cancelling greeting timeout - received server response");
          clearTimeout(greetingTimeoutRef.current);
          greetingTimeoutRef.current = null;
        }
        
        // Stop local audio as call is now "answered" (AI response received)
        console.log("🎵 Call answered - stopping ringtone");
        stopLocalAudio();
        
        // Add new AI response with typewriter effect
// Remove this line entirely
        
        const aiResponse = addMessage({
          text: responseText,
          isAI: true,
          timestamp: new Date(),
          isTypewriter: true,
          isGreeting: false
        });
        setTypewriterMessageId(aiResponse.id);

        // Play AI response audio if available
        const audioData = chatResponse.audio || chatResponse.data?.audio;
        if (audioData) {
          console.log("🎵 Using audio from WebSocket response");
          playAudioFromBase64(audioData, aiResponse.id).catch(() => {
            console.log("❌ WebSocket audio failed, using browser TTS fallback");
            tryBrowserTTS(responseText, aiResponse.id);
          });
        } else {
          console.log("🎵 No audio in WebSocket response, using browser TTS fallback");
          tryBrowserTTS(responseText, aiResponse.id);
        }

        // Reset waiting state and processing state
        setIsWaitingForAIResponse(false);
        setCurrentUserMessageId(null);
        setIsProcessingVoice(false); // Reset processing state when AI response is received
      }

      // Mark response as processed
      onChatResponseProcessed();
    }
  }, [chatResponse, isOpen, onChatResponseProcessed, addMessage]);

        // Reset chat when modal closes - start fresh conversation every time
  useEffect(() => {
    if (!isOpen) {
      // Clear all chat states for fresh start
      setMessages([]);
      setInputText('');
      setIsTyping(false);
      setIsAISpeaking(false);
      setTypewriterMessageId(null);
      setIsRecording(false);
      setIsVADActive(false);
      setIsWebSpeechActive(false);
      setCurrentTranscript('');
      setInterimTranscript('');
      setIsProcessingVoice(false);
      setIsUserTyping(false);
      setIsUserSpeaking(false);
      setHasPlayedGreeting(false);
      setIsWaitingForUser(false);
      setCurrentSpeakingMessageId(null);
      setCurrentUserMessageId(null);
      setIsMuted(false); // Reset mute state
      setIsCallActive(false); // Reset call state
      
      // Reset transcript-related states
      setPendingTranscript(null);
      setIsWaitingForAIResponse(false);
      
      // Clear message processing state
      setProcessingMessageIds(new Set());
      setIsProcessingAIRequest(false);
      setCompletedTypewriterIds(new Set());
      
              // Clear timeouts
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        if (greetingTimeoutRef.current) {
          clearTimeout(greetingTimeoutRef.current);
          greetingTimeoutRef.current = null;
        }
        if (autoListenTimeout) {
          clearTimeout(autoListenTimeout);
          setAutoListenTimeout(null);
        }
        if (noSpeechTimeout) {
          clearTimeout(noSpeechTimeout);
          setNoSpeechTimeout(null);
        }
        
        // Stop local audio when chat resets
        stopLocalAudio();
        }
      }, [isOpen, autoListenTimeout, noSpeechTimeout, stopLocalAudio]);

  // Automatic conversation flow - start listening after AI finishes speaking
  useEffect(() => {
    if (!isOpen) return;
    
    console.log("🎤 Checking auto conversation flow:", {
      isAISpeaking,
      isUserSpeaking,
      isProcessingVoice,
      isTyping,
      messagesLength: messages.length,
      isWaitingForUser,
      isMuted,
      lastMessage: messages[messages.length - 1]?.isAI,
      isVADActive,
      isWebSpeechActive
    });
    
    // When AI finishes speaking, wait then start listening for user
    if (!isAISpeaking && !isUserSpeaking && !isProcessingVoice && !isTyping && !isMuted && messages.length > 0) {
      // Check if the last message was from AI (so we should listen for user response)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.isAI && !isWaitingForUser && !isVADActive && !isWebSpeechActive) {
        console.log("🎤 AI finished speaking, waiting 2 seconds before listening for user...");
        setIsWaitingForUser(true);
        
        const timeout = setTimeout(async () => {
          console.log("🎤 Starting automatic voice listening...");
          setIsWaitingForUser(false);
          
          try {
            // Double-check conditions before starting recording - MUST respect mute state
            if (!isMuted && isOpen && !isAISpeaking && !isUserSpeaking && !isVADActive && !isWebSpeechActive) {
              console.log("🎤 Starting automatic voice recording (user has not muted)");
              // Use startVoiceRecording to properly restart voice system
              const started = await startVoiceRecording();
              if (started) {
                console.log("🎤 ✅ Automatic voice recording started successfully");
              } else {
                console.log("🎤 ❌ Automatic voice recording failed to start");
              }
            } else {
              console.log("🎤 ❌ Conditions changed - skipping automatic recording", {
                isMuted, isOpen, isAISpeaking, isUserSpeaking, isVADActive, isWebSpeechActive
              });
              if (isMuted) {
                console.log("🔇 User has muted - respecting mute state and not starting voice recording");
              }
            }
          } catch (error) {
            console.error("Failed to start automatic voice recording:", error);
            setIsWaitingForUser(false);
            
            // If auto-recording fails, provide visual feedback to user
            // setCurrentTranscript("🔴 Voice recording unavailable. Please use text input or try the microphone button.");
            setTimeout(() => setCurrentTranscript(''), 3000);
          }
        }, 2000); // 2 second delay (reduced from 2.5 for faster response)
        
        setAutoListenTimeout(timeout);
      }
    }
    
    // Cleanup timeout when dependencies change
    return () => {
      if (autoListenTimeout) {
        clearTimeout(autoListenTimeout);
        setAutoListenTimeout(null);
      }
    };  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAISpeaking, isUserSpeaking, isProcessingVoice, isTyping, messages, isWaitingForUser, isOpen, isMuted, isVADActive, isWebSpeechActive]); // Removed autoListenTimeout from deps

  // Play greeting message when chat opens
const playGreetingMessage = async () => {
  try {
    console.log("🎵 Checking WebSocket connection for greeting");
    console.log("🔍 Debug playGreetingMessage:", {
      sessionService: !!sessionService,
      isConnected: sessionService?.isConnected,
      currentUser,
      sessionId,
      socketState: sessionService?.socket?.readyState,
      userEmail: sessionService?.userEmail
    });

    // Wait up to 3 seconds for socket readiness
    let connectionAttempts = 0;
    const maxAttempts = 30;

    while (
      (!sessionService?.isConnected || sessionService?.socket?.readyState !== 1) &&
      connectionAttempts < maxAttempts
    ) {
      console.log(`🎵 Waiting for WebSocket connection... attempt ${connectionAttempts + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 100));
      connectionAttempts++;
    }

    if (sessionService?.isConnected && sessionService.socket?.readyState === 1) {
      console.log("✅ WebSocket connected - requesting personalized greeting");
      setIsAISpeaking(true);

      if (sessionId && sessionId.includes("local-")) {
        const sent = sessionService.sendTextMessage("!request_greeting");
        if (!sent) {
          console.warn("⚠️ Greeting message not sent. Retrying...");
          setTimeout(() => sessionService.sendTextMessage("!request_greeting"), 500);
        } else {
          console.log("📨 Greeting request sent");
        }
      }

      // Set fallback timeout if no response
      greetingTimeoutRef.current = setTimeout(() => {
        console.warn("⏰ No WebSocket greeting response received after 10 seconds, falling back to browser TTS");
        stopLocalAudio();
        setIsAISpeaking(false);
        tryBrowserTTS(getMealTimeGreeting());
      }, 12000);
    } else {
      console.warn("❌ WebSocket not connected after timeout. Using fallback greeting.");
      stopLocalAudio();
      setIsAISpeaking(false);
      tryBrowserTTS(getMealTimeGreeting());
    }
  } catch (error) {
    console.error("❌ Error during greeting request:", error);
    stopLocalAudio();
    setIsAISpeaking(false);
    tryBrowserTTS(getMealTimeGreeting());
  }
};


  // Helper function to extract name from email
  const getNameFromEmail = (email) => {
    if (!email) return null;
    const namePart = email.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    return namePart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get appropriate greeting based on time of day
  const getMealTimeGreeting = () => {
    const hour = new Date().getHours();
    
    // Try multiple sources for user name
    let userName = currentUser?.fullName || 
                  currentUser?.username || 
                  (sessionService?.userEmail ? getNameFromEmail(sessionService.userEmail) : null) ||
                  "there";
    
    console.log("🔍 Debug getMealTimeGreeting:", {
      currentUser,
      fullName: currentUser?.fullName,
      username: currentUser?.username,
      sessionServiceEmail: sessionService?.userEmail,
      extractedName: sessionService?.userEmail ? getNameFromEmail(sessionService.userEmail) : null,
      finalUserName: userName,
      hour
    });
    
    if (hour < 10) {
      return `Good morning, ${userName}! I'm your AI nutrition assistant. What did you have for breakfast today, or what are you planning to eat?`;
    } else if (hour < 14) {
      return `Hello, ${userName}! I'm here to help with your nutrition. How was your breakfast? Or what are you thinking for lunch?`;
    } else if (hour < 18) {
      return `Good afternoon, ${userName}! I'm your nutrition assistant. What have you eaten today? Let's track your meals together.`;
    } else {
      return `Good evening, ${userName}! I'm here to help with your nutrition. How were your meals today? What's for dinner?`;
    }
  };

    // Toast notification functions
    const addToast = (message, type = 'error') => {
    };

   

    // Replace setError with addToast
    const showError = (message) => {
        addToast(message, 'error');
    };

  // Handle text input changes with typing detection
  // eslint-disable-next-line no-unused-vars
  const handleTextInputChange = (e) => {
    setInputText(e.target.value);
    setIsUserTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000); // Stop typing indicator 1 second after last keystroke
  };

  // Show all messages - simplified logic
  const messagesToShow = messages || [];

  // Fallback function to use browser's built-in TTS
  const tryBrowserTTS = (text, messageId = null) => {
    if (!('speechSynthesis' in window) || !text || text.length > 300) {
      console.log("❌ Browser TTS not available or text too long");
      return;
    }
    
    console.log("🔊 Using browser TTS as fallback");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      console.log("🔊 Browser TTS started");
      setIsAISpeaking(true);
      if (messageId) setCurrentSpeakingMessageId(messageId);
    };
    
    utterance.onend = () => {
      console.log("🔊 Browser TTS ended");
      setIsAISpeaking(false);
      setCurrentSpeakingMessageId(null);
    };
    
    utterance.onerror = () => {
      console.log("❌ Browser TTS error");
      setIsAISpeaking(false);
      setCurrentSpeakingMessageId(null);
    };
    
    window.speechSynthesis.speak(utterance);
    
    // Backup timeout
    setTimeout(() => {
      setIsAISpeaking(false);
      setCurrentSpeakingMessageId(null);
    }, Math.max(text.length * 50, 3000));
  };

  // Function to play audio from base64 with optimizations
  const playAudioFromBase64 = (base64Audio, messageId = null) => {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing AI audio to prevent overlaps
        if (window.currentAIAudio) {
          console.log("🔊 Stopping previous AI audio to prevent overlap");
          window.currentAIAudio.pause();
          window.currentAIAudio.currentTime = 0;
        }
        
        console.log("🔊 Playing AI message audio...");
        console.time("Audio-Playback-Setup");
        
        // Create audio element
        const audio = new Audio();
        window.currentAIAudio = audio; // Store reference globally
        
        // Set up event listeners
        audio.onplay = () => {
          console.timeEnd("Audio-Playback-Setup");
          console.log("🔊 Audio playback started");
          setIsAISpeaking(true);
          if (messageId) {
            console.log(`🎵 Setting currentSpeakingMessageId to: ${messageId}`);
            setCurrentSpeakingMessageId(messageId);
          }
        };
                  audio.onended = () => {
            console.log("🔊 Audio playback ended");
            setIsAISpeaking(false);
            console.log(`🎵 Clearing currentSpeakingMessageId`);
            setCurrentSpeakingMessageId(null);
            window.currentAIAudio = null; // Clear reference
            resolve();
        };
        audio.onerror = (e) => {
          console.error("❌ Audio playback error:", e);
          if (typeof console.timeEnd === 'function') {
            try { console.timeEnd("Audio-Playback-Setup"); } catch {} 
          }
          setIsAISpeaking(false);
          setCurrentSpeakingMessageId(null);
          window.currentAIAudio = null; // Clear reference
          
          // Try fallback to browser TTS instead of failing completely
          console.log("🔄 TTS audio failed, trying browser speech synthesis fallback");
          reject(new Error("Audio playback failed"));
        };
        audio.onabort = () => {
          console.log("🔊 Audio playback aborted");
          setIsAISpeaking(false);
          setCurrentSpeakingMessageId(null);
          window.currentAIAudio = null; // Clear reference
          resolve();
        };
        
        // Try multiple audio formats for better browser compatibility
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        audio.src = audioUrl;
        
        // Preload for faster playback
        audio.preload = 'auto';
        audio.volume = 1.0; // Ensure full volume
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log("🔊 Audio play promise resolved successfully");
          }).catch(error => {
            console.error("❌ Audio play promise rejected:", error);
            if (typeof console.timeEnd === 'function') {
              try { console.timeEnd("Audio-Playback-Setup"); } catch {}
            }
            setIsAISpeaking(false);
            reject(error);
          });
        }
        
      } catch (error) {
        console.error("❌ Error in playAudioFromBase64:", error);
        console.timeEnd("Audio-Playback-Setup");
        setIsAISpeaking(false);
        reject(error);
      }
    });
  };



    // Clear any existing timeout when component unmounts
    useEffect(() => {
      return () => {
          if (processingTimeout) {
              clearTimeout(processingTimeout);
          }
      };
  }, [processingTimeout]);

  // Function to request TTS via WebSocket (removed - using audio responses directly)
  const requestTTS = async (text, messageId = null) => {
    // TTS is now handled automatically by the backend when sending messages
    // Audio responses come back via WebSocket with type 'audio'
    console.log("🎵 TTS request removed - audio handled automatically by backend");
    
    // Fallback to browser TTS if no audio response received
    setTimeout(() => {
      if (isAISpeaking) {
        console.log("🎵 No audio response received, using browser TTS fallback");
        tryBrowserTTS(text, messageId);
      }
    }, 2000); // Wait 2 seconds for audio response
  };

  const handleAudioChunk = (audioChunk) => {
    // Streaming service disabled - chunks are accumulated in VAD for final processing
    // if (audioStreamRef.current) {
    //     audioStreamRef.current.sendAudioChunk(audioChunk);
    // }
    console.log(`VAD: Audio chunk buffered: ${audioChunk.size} bytes (will be sent as complete audio blob)`);
};

  // Initialize Web Speech API system
  const initializeWebSpeechSystem = async () => {
    try {
      console.log('🗣️ Initializing Web Speech API system...');
      
      webSpeechRef.current = new WebSpeechService({
        language: 'en-US',
        continuous: true,
        interimResults: true,
        maxAlternatives: 5, // Get multiple alternatives for better accuracy
        confidenceThreshold: 0.6, // Lower threshold for food terms and foreign words
        onStart: () => {
          console.log('🗣️ Web Speech API started');
          setIsWebSpeechActive(true);
          setIsRecording(true);
          setIsUserSpeaking(true);
          setCurrentTranscript('');
          setInterimTranscript('');
        },
        onEnd: () => {
          console.log('🗣️ Web Speech API ended');
          setIsWebSpeechActive(false);
          setIsRecording(false);
          setIsUserSpeaking(false);
          setCurrentTranscript('');
          setInterimTranscript('');
        },
        onInterimResult: (transcript) => {
          console.log('🗣️ Web Speech interim result:', transcript);
          setInterimTranscript(transcript);
          // setCurrentTranscript(transcript);
        },
        onFinalResult: (transcript, bestAlternative, allAlternatives) => {
          console.log('🗣️ Web Speech final result:', transcript);
          console.log('🗣️ All alternatives:', allAlternatives);
          handleWebSpeechFinalResult(transcript, bestAlternative, allAlternatives);
        },
        onAlternatives: (alternatives) => {
          console.log('🗣️ Available alternatives:', alternatives);
          // Could implement UI to show alternatives to user
        },
        onLowConfidence: (bestAlternative, alternatives) => {
          console.warn('🗣️ Low confidence detection:', bestAlternative.confidence);
          console.log('🗣️ Consider these alternatives:', alternatives);
          // Could show warning to user or ask for confirmation
        },
        onError: (error) => {
          console.error('🗣️ Web Speech API error:', error);
          handleWebSpeechError(error);
        }
      });
      
      const webSpeechInitialized = await webSpeechRef.current.initialize();
      if (webSpeechInitialized) {
        setWebSpeechSupported(true);
        console.log('✅ Web Speech API system ready!');
        return true;
      } else {
        setWebSpeechSupported(false);
        console.log('❌ Web Speech API not supported');
        return false;
      }
    } catch (err) {
      console.error('Web Speech API system preparation error:', err);
      setWebSpeechSupported(false);
      return false;
    }
  };

  // Initialize VAD system without starting listening (preparation only)
  const initializeVADSystem = async () => {
    try {
        console.log('🎤 Preparing VAD system...');

        // Initialize VAD with enhanced noise filtering (but don't start listening yet)
        vadRef.current = new VoiceActivityDetection({
            volumeThreshold: 0.008,  // Much lower threshold for better speech detection
            silenceDelay: 4000,      // Longer silence delay (4 seconds) to prevent splitting on natural pauses
            chunkMs: 1000,           // 1 second chunks for better processing
            onSpeechStart: handleSpeechStart,
            onSpeechEnd: handleSpeechEnd,
            onAudioChunk: handleAudioChunk,
            onError: handleVADError
        });

        const vadInitialized = await vadRef.current.initialize();
        if (!vadInitialized) {
            throw new Error('Failed to initialize voice detection');
        }

        // Disable audio streaming service for now - using regular STT which works better
        // audioStreamRef.current = new AudioStreamingService({
        //     wsUrl: `ws://34.139.138.247/ws`,
        //     onConnect: () => {
        //         setConnectionStatus('connected');
        //         console.log('🔗 Audio streaming connected');
        //     },
        //     onDisconnect: () => {
        //         setConnectionStatus('disconnected');
        //         console.log('🔗 Audio streaming disconnected');
        //     },
        //     onTranscript: handleStreamingTranscript,
        //     onAIResponse: handleStreamingAIResponse,
        //     onError: handleStreamingError
        // });

        // audioStreamRef.current.connect(sessionId);

        // Calibrate VAD threshold (shorter duration for faster testing)
        console.log('🎤 Calibrating voice detection threshold...');
        await vadRef.current.calibrateThreshold(1500);

        console.log('✅ VAD system ready! Voice recording can be started via mute/unmute.');
        return true;
    } catch (err) {
        console.error('VAD system preparation error:', err);
        // Don't show error immediately, just log it - user can still try to use voice later
        return false;
    }
  };

  // Initialize VAD with proper permission handling and start listening
  const initializeVAD = async () => {
    try {
        setStatus('Initializing voice detection...');

        // If VAD system not prepared yet, prepare it first
        if (!vadRef.current) {
            await initializeVADSystem();
        }

        // Check if VAD is ready
        if (!vadRef.current) {
            throw new Error('VAD system not available');
        }

        // Start listening
        vadRef.current.startListening();
        setIsVADActive(true);

        // Start audio level monitoring
        startAudioLevelMonitoring();

        setStatus('AI is listening! Start speaking when you\'re ready...');
        return true;
    } catch (err) {
        showError('Failed to access microphone. Please grant permission and try again.');
        console.error('VAD initialization error:', err);

        // Enable text fallback when VAD initialization fails
        setSttServiceAvailable(false);
        setShowTextFallback(true);
        setStatus('Voice detection unavailable. You can use text input below to continue our conversation.');
        return false;
    }
};

  // Add a handler to restart VAD after error
    // eslint-disable-next-line no-unused-vars
  const handleRestartVAD = async () => {
    setProcessingError(false);
    setStatus('Restarting voice detection...');
    await initializeVAD();
};

  // eslint-disable-next-line no-unused-vars
const stopVAD = () => {
  cleanup();
  setIsVADActive(false);
  setConnectionStatus('disconnected');
  setStatus('Voice detection stopped. Click "Start Listening" to resume.');
};

const cleanup = () => {
  if (vadRef.current) {
      vadRef.current.cleanup();
      vadRef.current = null;
  }

  if (audioStreamRef.current) {
      audioStreamRef.current.disconnect();
      audioStreamRef.current = null;
  }

  if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
  }

  setAudioLevel(0);
};

  // Start voice recording with better error handling
  const startVoiceRecording = async () => {
    try {
      console.log("🎤 startVoiceRecording called - checking conditions...");
      
      // Don't start recording if muted
      if (isMuted) {
        console.log("🔇 Microphone is muted, not starting recording");
        return;
      }
      
      // Don't start if chat is closed
      if (!isOpen) {
        console.log("🚪 Chat is closed, not starting recording");
        return;
      }
      
      // Don't start recording if AI is speaking (prevents feedback loop)
      if (isAISpeaking) {
        console.log("🤖 AI is speaking, not starting recording to prevent feedback");
        return;
      }
      
      // Ensure we're in a stable state before starting
      setIsProcessingVoice(false);
      setCurrentTranscript('');
      setInterimTranscript('');
      
      // Try Web Speech API first if supported and enabled
      if (useWebSpeech && webSpeechSupported && webSpeechRef.current) {
        console.log("🗣️ Starting Web Speech API...");
        const webSpeechStarted = webSpeechRef.current.start();
        
        if (webSpeechStarted) {
          console.log("✅ Web Speech API started successfully");
          setIsWebSpeechActive(true);
          setIsVADActive(false); // Ensure VAD is not active
          
          // Set timeout for when user doesn't speak at all
          const timeout = setTimeout(() => {
            console.log("⏰ No speech detected within 8 seconds, will timeout");
            handleNoSpeechTimeout();
          }, 8000);
          
          setNoSpeechTimeout(timeout);
          return true;
        } else {
          console.log("⚠️ Web Speech API failed to start, falling back to VAD");
        }
      }
      
      // Fallback to VAD
      console.log("🎤 Initializing VAD...");
      const initialized = await initializeVAD();
      
      if (initialized && vadRef.current) {
        console.log("🎤 VAD initialized, starting listening...");
        vadRef.current.startListening();
        setIsVADActive(true);
        setIsWebSpeechActive(false); // Ensure Web Speech is not active
        console.log("✅ Voice recording started successfully");
        
        // Set timeout for when user doesn't speak at all
        const timeout = setTimeout(() => {
          console.log("⏰ No speech detected within 8 seconds, will timeout");
          handleNoSpeechTimeout();
        }, 8000);
        
        setNoSpeechTimeout(timeout);
        return true;
      } else {
        throw new Error("Voice recording initialization failed - check microphone permissions");
      }
    } catch (error) {
      console.error("❌ Failed to start voice recording:", error);
      
      // Provide more specific error messages
      let errorMessage = "Voice recording failed. ";
      if (error.name === 'NotAllowedError') {
        errorMessage += "Please allow microphone access and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No microphone found. Please check your device.";
      } else {
        errorMessage += "Please try the text input instead.";
      }
      
      setCurrentTranscript(`🔴 ${errorMessage}`);
      setTimeout(() => setCurrentTranscript(''), 5000);
      
      handleVADError(error);
      return false;
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (vadRef.current) {
      vadRef.current.stopListening();
    }
    if (webSpeechRef.current) {
      webSpeechRef.current.stop();
    }
    setIsVADActive(false);
    setIsWebSpeechActive(false);
    setIsRecording(false);
    setIsUserSpeaking(false);
    setCurrentTranscript('');
    setInterimTranscript('');
  };

  // Handle when no speech is detected after timeout
  const handleNoSpeechTimeout = () => {
    console.log("⏰ No speech detected after timeout, stopping VAD");
    
    // Stop VAD and reset states
    stopVoiceRecording();
    
    // Clear the timeout
    if (noSpeechTimeout) {
      clearTimeout(noSpeechTimeout);
      setNoSpeechTimeout(null);
    }
    
    // Show a helpful message but don't add it to conversation history
    // This keeps the conversation cleaner and allows user to try again
    // setCurrentTranscript("⏰ No speech detected. You can speak now or use text input below.");
    
    // Clear the message after a few seconds and restart listening
    setTimeout(() => {
      setCurrentTranscript('');
      
      // Restart listening automatically ONLY if user hasn't muted and conditions are good
      if (!isMuted && isOpen && !isAISpeaking && !isUserSpeaking && !isProcessingVoice) {
        console.log("🔄 Auto-restarting voice listening after timeout (user has not muted)");
        startVoiceRecording().catch(error => {
          console.log("Auto-restart failed, user will need to manually try again");
        });
      } else if (isMuted) {
        console.log("🔇 Not auto-restarting voice listening because user has muted");
      } else if (isAISpeaking) {
        console.log("🤖 Not auto-restarting voice listening because AI is speaking");
      } else {
        console.log("🔇 Not auto-restarting voice listening due to other conditions:", {
          isMuted, isOpen, isAISpeaking, isUserSpeaking, isProcessingVoice
        });
      }
    }, 3000);
  };

  // Handle speech start
  const handleSpeechStart = () => {
    console.log("Speech started in ChatWindow");
    setIsRecording(true);
    setIsUserSpeaking(true);
    setCurrentTranscript(''); // Don't show "Speaking..." text, just use wave animation
    
    // Clear the no speech timeout since user started speaking
    if (noSpeechTimeout) {
      clearTimeout(noSpeechTimeout);
      setNoSpeechTimeout(null);
    }
  };

  // Enhanced transcription correction for food terms
  const correctTranscription = (transcript, alternatives = []) => {
    // Common food term corrections (expandable list)
    const corrections = {
      'those': ['dosa', 'dose'],
      'buddha': ['bhutta', 'bhutta corn'],
      'dolma': ['dalmiya', 'dalma'],
      'idli': ['idle', 'ideal'],
      'samosa': ['samoa', 'somoasa'],
      'biryani': ['biriyani', 'bryani'],
      'chapati': ['chapatti', 'chappati'],
      'masala': ['marsala', 'masaala'],
      'papad': ['pappad', 'papadam'],
      'roti': ['rotie', 'rotty'],
      'curry': ['curie', 'kurry'],
      'naan': ['nan', 'naan bread'],
      'tandoori': ['tandori', 'tondori'],
      'kebab': ['kabab', 'kebob'],
      'tikka': ['tika', 'tikka'],
      'paneer': ['panear', 'panir'],
      'chutney': ['chutnee', 'chatney'],
      'raita': ['raitha', 'raita'],
      'papadum': ['papadam', 'papadums'],
      'pulao': ['pilaf', 'pulav'],
      'khichdi': ['khichri', 'khichadi'],
      'rajma': ['rajmah', 'rajma'],
      'dal': ['daal', 'dall'],
      'bhel': ['bhel puri', 'bhell'],
      'pav': ['pav bhaji', 'paav'],
      'vada': ['wadda', 'vada pav'],
      'upma': ['uppma', 'upama'],
      'poha': ['poha', 'pohe'],
      'thali': ['thaali', 'thalli'],
      'sabzi': ['sabzii', 'sabji'],
      'paratha': ['paratha', 'parotha'],
      'lassi': ['lassie', 'lassi'],
      'kulfi': ['kulfia', 'kulfi'],
      'halwa': ['halva', 'halwa'],
      'laddu': ['ladoo', 'laddu'],
      'jalebi': ['jalebi', 'jaaleby'],
      'gulab': ['gulab jamun', 'goolab']
    };
    
    let correctedTranscript = transcript.toLowerCase();
    
    // Check if any alternatives contain food terms that might be correct
    if (alternatives && alternatives.length > 0) {
      for (const alt of alternatives) {
        const altText = alt.transcript.toLowerCase();
        // If an alternative contains a known food term, consider it
        for (const [common, foodTerms] of Object.entries(corrections)) {
          if (foodTerms.some(term => altText.includes(term))) {
            console.log(`🗣️ Found potential food term "${altText}" in alternatives`);
            // If confidence is reasonable, use this alternative
            if (alt.confidence > 0.4) {
              correctedTranscript = alt.transcript;
              break;
            }
          }
        }
      }
    }
    
    // Apply direct corrections for common misrecognitions
    for (const [common, foodTerms] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${common}\\b`, 'gi');
      if (regex.test(correctedTranscript)) {
        // For food context, replace with the most likely food term
        correctedTranscript = correctedTranscript.replace(regex, foodTerms[0]);
        console.log(`🗣️ Applied correction: "${common}" -> "${foodTerms[0]}"`);
      }
    }
    
    return correctedTranscript;
  };

  // Generate suggestion message for low confidence transcriptions
  const generateConfidenceSuggestion = (transcript, alternatives) => {
    if (!alternatives || alternatives.length <= 1) return null;
    
    const topAlternatives = alternatives.slice(0, 3).map(alt => 
      `"${alt.transcript}" (${(alt.confidence * 100).toFixed(0)}%)`
    ).join(', ');
    
    return `Did you mean: ${topAlternatives}?`;
  };

  // Handle Web Speech API final result
  const handleWebSpeechFinalResult = (transcript, bestAlternative, allAlternatives) => {
    console.log("🗣️ Web Speech final result:", transcript);
    
    // Enhanced logging for debugging transcription issues
    if (bestAlternative) {
      console.log(`🗣️ Best alternative confidence: ${bestAlternative.confidence.toFixed(2)}`);
      
      // Log potential food terms that might be misrecognized
      if (bestAlternative.confidence < 0.7) {
        console.warn("🗣️ Low confidence - possible misrecognition. Alternatives:", 
          allAlternatives.map(alt => `"${alt.transcript}" (${alt.confidence.toFixed(2)})`));
        
        // Generate and log suggestion for user
        const suggestion = generateConfidenceSuggestion(transcript, allAlternatives);
        if (suggestion) {
          console.log("🗣️ Suggestion:", suggestion);
        }
      }
    }
    
    // Prevent multiple simultaneous processing requests
    if (isProcessingVoice || isProcessingAIRequest) {
      console.log("🗣️ Already processing voice or AI request, skipping this transcript");
      return;
    }
    
    // Debounce rapid speech events (prevent multiple requests within 2 seconds)
    const now = Date.now();
    if (now - lastSpeechEndTime.current < 2000) {
      console.log("🗣️ Debouncing rapid speech events, skipping this transcript");
      return;
    }
    lastSpeechEndTime.current = now;
    
    // Check for very short transcriptions (likely false positives)
    if (transcript.trim().length < 3) {
      console.log("🗣️ Skipping very short transcription:", transcript);
      return;
    }
    
    // Apply transcription correction for food terms
    const correctedTranscript = correctTranscription(transcript, allAlternatives);
    if (correctedTranscript !== transcript) {
      console.log(`🗣️ Transcription corrected: "${transcript}" -> "${correctedTranscript}"`);
    }
    
    setIsRecording(false);
    setIsUserSpeaking(false);
    setIsProcessingVoice(true);
    setInterimTranscript('');
    setCurrentTranscript('');
    
    // Add user message immediately with the corrected transcript
    const userMessage = addMessage({
      text: correctedTranscript,
      isAI: false,
      timestamp: new Date(),
      isTypewriter: false,
      isGreeting: false
    });
    
    setCurrentUserMessageId(userMessage.id);
    setIsWaitingForAIResponse(true);
    
    // Send text directly to server via WebSocket using the same format as the HTML sample
    try {
      console.log("🗣️ Sending text message to server:", correctedTranscript);
      
      if (sessionService && sessionService.isConnected) {
        // Use sendTextMessage directly (text_message type) to match the HTML sample
        const sent = sessionService.sendTextMessage(correctedTranscript);
        
        if (sent) {
          console.log("🗣️ Text message sent to server, waiting for AI response...");
          // Log performance comparison
          console.log("🚀 Web Speech API: Text sent directly (no STT processing time)");
        } else {
          throw new Error("Failed to send text message");
        }
      } else {
        throw new Error("WebSocket not connected");
      }
    } catch (error) {
      console.error("Error sending text message:", error);
      
      const errorResponse = addMessage({
        text: "I'm sorry, there was an error sending your message. Please try again.",
        isAI: true,
        timestamp: new Date(),
        isTypewriter: true,
        isGreeting: false
      });
      setTypewriterMessageId(errorResponse.id);
      
      // Play error response audio using browser TTS
      tryBrowserTTS(errorResponse.text, errorResponse.id);
    } finally {
      // Don't reset isProcessingVoice here - it should remain true until AI response is received
      // This keeps the wave animation and visual indicators active
      setIsProcessingAIRequest(false);
      
      // Add timeout to show error if no AI response is received
      setTimeout(() => {
        if (isWaitingForAIResponse) {
          console.log("⏰ No AI response received after 10 seconds");
          // setCurrentTranscript("🔴 No response from AI. Please try again.");
          setTimeout(() => setCurrentTranscript(''), 5000);
          setIsWaitingForAIResponse(false);
          // Only reset processing state if no response received
          setIsProcessingVoice(false);
        }
      }, 10000);
      
      // Add shorter timeout for debugging
      setTimeout(() => {
        if (isWaitingForAIResponse) {
          console.log("⏰ No AI response received after 5 seconds - checking WebSocket status");
          console.log("WebSocket status:", sessionService?.getConnectionStatus());
          console.log("WebSocket readyState:", sessionService?.socket?.readyState);
        }
      }, 5000);
    }
  };

  // Handle Web Speech API error
  const handleWebSpeechError = (error) => {
    console.error("🗣️ Web Speech API error:", error);
    
    // Reset states
    setIsWebSpeechActive(false);
    setIsRecording(false);
    setIsUserSpeaking(false);
    setCurrentTranscript('');
    setInterimTranscript('');
    setIsProcessingVoice(false);
    
    // Show error message
    setCurrentTranscript(`🔴 ${error.message}`);
    setTimeout(() => setCurrentTranscript(''), 5000);
    
    // If Web Speech API fails, fallback to VAD if available
    if (vadRef.current && !isVADActive) {
      console.log("🔄 Falling back to VAD system");
      setTimeout(() => {
        if (isOpen && !isMuted && !isAISpeaking) {
          startVoiceRecording();
        }
      }, 2000);
    }
  };

  // Handle speech end
  const handleSpeechEnd = async (audioBlob) => {
    console.log("🎤 Speech ended in ChatWindow, processing audio...");
    console.log("🎤 Audio blob size:", audioBlob?.size, "bytes");
    
    // Prevent multiple simultaneous processing requests
    if (isProcessingVoice || isProcessingAIRequest) {
      console.log("🎤 Already processing voice or AI request, skipping this audio blob");
      return;
    }
    
    // Debounce rapid speech events (prevent multiple requests within 2 seconds)
    const now = Date.now();
    if (now - lastSpeechEndTime.current < 2000) {
      console.log("🎤 Debouncing rapid speech events, skipping this audio blob");
      return;
    }
    lastSpeechEndTime.current = now;
    
    setIsRecording(false);
    setIsUserSpeaking(false);
    setIsProcessingVoice(true);
    // setCurrentTranscript('🔄 Converting speech to text...');

    if (!audioBlob || audioBlob.size === 0) {
      console.warn("No audio data received");
      setCurrentTranscript('');
      setIsProcessingVoice(false);
      return;
    }
    
    if (audioBlob.size < 2000) {
      console.warn(`Audio blob too small: ${audioBlob.size} bytes - may not contain enough speech for recognition`);
      setCurrentTranscript('🔴 Recording too short. Please speak for at least 1 second.');
      setIsProcessingVoice(false);
      setTimeout(() => setCurrentTranscript(''), 3000);
      return;
    }

    try {
      console.log("🎤 Sending audio via WebSocket for processing...");
      
      // Send audio via WebSocket session service
      if (sessionService && sessionService.isConnected) {
        // Send audio blob via WebSocket
        const audioSent = sessionService.sendAudio(audioBlob);
        
        if (audioSent) {
          console.log("🎤 Audio sent via WebSocket, waiting for transcript and response...");
          // The transcript and response will be handled by the WebSocket message handler
          // We don't need to add user messages here - they'll be added when transcript is received
        } else {
          throw new Error("Failed to send audio via WebSocket");
        }
      } else {
        // Fallback to text input if WebSocket not available
        console.log("WebSocket not available, showing text input fallback");
        setCurrentTranscript("WebSocket not available. Please use text input below.");
        setTimeout(() => setCurrentTranscript(''), 5000);
      }
    } catch (error) {
      console.error("Error in handleSpeechEnd:", error);
      
      const errorResponse = addMessage({
        text: "I'm sorry, there was an error processing your voice input. Please try again.",
        isAI: true,
        timestamp: new Date(),
        isTypewriter: true,
        isGreeting: false
      });
      setTypewriterMessageId(errorResponse.id);
      
      // Play error response audio using browser TTS
      tryBrowserTTS(errorResponse.text, errorResponse.id);
    } finally {
      setCurrentTranscript('');
      setIsProcessingVoice(false);
      // Don't reset currentUserMessageId here - it will be set when transcript is received
      setIsProcessingAIRequest(false);
    }
    
    // Backup timeout to reset processing states if something gets stuck
    setTimeout(() => {
      if (isProcessingVoice || isProcessingAIRequest) {
        console.log("🎤 Backup timeout: Resetting stuck processing states");
        setIsProcessingVoice(false);
        setIsProcessingAIRequest(false);
        setCurrentTranscript('');
        setIsWaitingForAIResponse(false);
      }
    }, 30000); // 30 second backup timeout
  };

 


  // Enhanced VAD error handling with professional polish
  const handleVADError = (error) => {
    console.error("VAD Error in ChatWindow:", error);
    
    // Reset VAD state safely
    try {
      setIsVADActive(false);
      setIsRecording(false);
      setIsUserSpeaking(false);
      setCurrentTranscript('');
      setIsProcessingVoice(false);
      
      // Cleanup VAD if it exists
      if (vadRef.current) {
        vadRef.current.cleanup();
        vadRef.current = null;
      }
    } catch (cleanupError) {
      console.error("Error during VAD cleanup:", cleanupError);
    }
    
    // Determine error type and show appropriate professional error handling
    if (error.name === 'NotAllowedError') {
      setShowMicError(true);
      setConnectionStatus('error');
    } else if (error.message && (error.message.includes('network') || error.message.includes('timeout'))) {
      setShowConnectionError(true);
      setConnectionStatus('error');
    } else {
      setShowAIError(true);
      setConnectionStatus('error');
    }
    
    setLastError(error);
  };

  // Periodic buffer clearing to prevent memory accumulation

  useEffect(() => {
    if (isVADActive && audioStreamRef.current) {
      const bufferClearInterval = setInterval(() => {
        console.log('Periodic buffer clearing...');
        audioStreamRef.current.clearServerBuffer();
      }, 120000); // Clear every 2 minutes
      return () => clearInterval(bufferClearInterval);
    }
  }, [isVADActive]);

      // Handle text input submission when voice is not available (removed - using WebSocket only)
      // eslint-disable-next-line no-unused-vars
      const handleTextSubmit = async (e) => {
        // Text input is handled by handleSendMessage which uses WebSocket
        console.log("Text input handled via WebSocket");
      };


 

  // Error recovery functions
    // eslint-disable-next-line no-unused-vars
  const retryConnection = () => {
    setShowConnectionError(false);
    setConnectionStatus('connecting');
    // Test connection and reset status
    testBackendConnection().then((connected) => {
      setConnectionStatus(connected ? 'connected' : 'error');
    });
  };

    // eslint-disable-next-line no-unused-vars
  const retryMicrophone = () => {
    setShowMicError(false);
    setConnectionStatus('connecting');
    initializeVAD().then(() => {
      setConnectionStatus('connected');
    }).catch(() => {
      setConnectionStatus('error');
    });
  };
  // eslint-disable-next-line no-unused-vars
  const useTextInput = () => {
    setShowMicError(false);
    setConnectionStatus('connected');
  };
  // eslint-disable-next-line no-unused-vars
  const retryAIProcessing = () => {
    setShowAIError(false);
    setConnectionStatus('connected');
  };
  // eslint-disable-next-line no-unused-vars
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping || isProcessingAIRequest) return;

    // Add user message
    const userMessage = addMessage({
      text: inputText,
      isAI: false,
      timestamp: new Date()
    });

    setCurrentUserMessageId(userMessage.id);
    const messageText = inputText;
    setInputText('');
    setIsTyping(true);
    setIsProcessingAIRequest(true);

    try {
      // Send message via WebSocket session service
      console.log("Sending message via WebSocket...");
      
      if (sessionService && sessionService.isConnected) {
        sessionService.sendMessage(messageText);
        // The AI response will be handled by the WebSocket message handler
        // No need to add a placeholder message here
      } else {
        // WebSocket not available - show error
        console.log("WebSocket not available");
        throw new Error("WebSocket connection not available");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      let errorText = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error.response?.status === 400) {
        errorText = "Sorry, there seems to be a configuration issue. The service may not be fully set up yet.";
      } else if (error.response?.status === 500) {
        errorText = "The AI service is temporarily unavailable. Please try again in a moment.";
      }
      
      // Add error message with typewriter effect
      const errorResponse = addMessage({
        text: errorText,
        isAI: true,
        timestamp: new Date(),
        isTypewriter: true,
        isGreeting: false
      });
      setTypewriterMessageId(errorResponse.id);
      
      // Play error response audio using browser TTS
      tryBrowserTTS(errorText, errorResponse.id);
    } finally {
      setIsTyping(false);
      setCurrentUserMessageId(null);
      setIsProcessingAIRequest(false);
    }
  };

  // Handle mute/unmute functionality
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    console.log(`🎙️ Toggling mute: ${isMuted} -> ${newMutedState}`);
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      // Muting - stop current recording if active
      console.log("🔇 Muting microphone - stopping voice recording...");
      
      // Cancel any pending auto-restart timeouts
      if (autoListenTimeout) {
        clearTimeout(autoListenTimeout);
        setAutoListenTimeout(null);
        console.log("🔇 Cancelled pending auto-listen timeout due to mute");
      }
      if (noSpeechTimeout) {
        clearTimeout(noSpeechTimeout);
        setNoSpeechTimeout(null);
        console.log("🔇 Cancelled no-speech timeout due to mute");
      }
      
      if (isVADActive || isWebSpeechActive || isRecording) {
        if (vadRef.current) {
          vadRef.current.stopListening();
        }
        if (webSpeechRef.current) {
          webSpeechRef.current.stop();
        }
        setIsVADActive(false);
        setIsWebSpeechActive(false);
        setIsRecording(false);
        setIsUserSpeaking(false);
        setCurrentTranscript('');
        setInterimTranscript('');
       
        console.log("🔇 ✅ Voice recording stopped due to mute");
      } else {
        console.log("🔇 No active recording to stop");
      }
    } else {
      // Unmuting - restart listening if voice system is ready
      console.log("🎤 Unmuting microphone...");
      if (isCallActive) {
        console.log("🎤 Voice system ready, restarting listening...");
        setTimeout(() => {
          if (!isMuted) {
            startVoiceRecording().catch(error => {
              console.error("❌ Failed to restart voice recording after unmute:", error);
              setCurrentTranscript('🔴 Voice recording unavailable');
            });
          }
        }, 200);
      }
    }
  };

  // Handle end call functionality
  const handleEndCall = () => {
    console.log("Ending call...");
    
    // Stop ringtone immediately
    stopLocalAudio();
    
    // Stop all voice activities
    if (vadRef.current) {
      vadRef.current.cleanup();
      vadRef.current = null;
    }
    
    if (webSpeechRef.current) {
      webSpeechRef.current.cleanup();
      webSpeechRef.current = null;
    }
    
    // Stop any playing audio
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop any currently playing AI audio
    if (window.currentAIAudio) {
      window.currentAIAudio.pause();
      window.currentAIAudio.currentTime = 0;
      window.currentAIAudio = null;
    }
    
    // Clear all timeouts
    if (autoListenTimeout) {
      clearTimeout(autoListenTimeout);
      setAutoListenTimeout(null);
    }
    if (noSpeechTimeout) {
      clearTimeout(noSpeechTimeout);
      setNoSpeechTimeout(null);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Close the chat modal
    setIsCallActive(false);
    onClose();
  };

  // Streaming disabled - this function is no longer used
  // const handleStreamingTranscript = (transcript) => {
  //   console.log('Received transcript:', transcript);
  // };

  
  // eslint-disable-next-line no-unused-vars
  const resetProcessingState = () => {
    setIsProcessing(false);
    setStatus('Listening for voice activity...');
    if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
    }
};

  // Helper function to send AI greeting when conversation starts (removed - using WebSocket)
  // eslint-disable-next-line no-unused-vars
  const sendAIGreeting = async () => {
    console.log("AI greeting handled via WebSocket");
  };

  // Streaming disabled - this function is no longer used
  // const handleStreamingAIResponse = (response) => {
  //   console.log('Received AI response:', response);
  // };


  // Streaming disabled - this function is no longer used
  // const handleStreamingError = (error) => {
  //   console.error('Streaming error:', error);
  // };

  
  

  const startAudioLevelMonitoring = () => {
    if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
    }
    audioLevelIntervalRef.current = setInterval(() => {
        if (vadRef.current) {
            const level = vadRef.current.getCurrentAudioLevel();
            setAudioLevel(level);
        }
    }, 100);
  };


  if (!isOpen) return null;

  return (
          <div className="fixed inset-0 bg-glass-bg-strong backdrop-blur-xl z-50 flex items-center justify-center p-2 md:p-3 lg:p-4 animate-in fade-in duration-300" style={{minHeight: '100vh', minWidth: '100vw'}}>
        <div className="glass-card-strong w-full max-w-3xl h-[75vh] md:h-[70vh] lg:h-[75vh] flex flex-col overflow-hidden shadow-glass-2xl animate-in zoom-in-95 duration-300 slide-in-from-bottom-4 mx-auto rounded-lg" style={{visibility: 'visible', opacity: 1, position: 'relative'}}>
        
        {/* Compact Messages Container */}
        <div 
          className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-surface-gradient hide-scrollbar relative group"
        >

          {messagesToShow.map((message, index) => {
            // Debug logging for animation states
            if (message.isAI) {
              console.log(`AI Message ${message.id}: currentSpeakingMessageId=${currentSpeakingMessageId}, typewriterMessageId=${typewriterMessageId}, shouldAnimate=${(currentSpeakingMessageId === message.id) || (message.isTypewriter && typewriterMessageId === message.id)}`);
            } else {
              console.log(`User Message ${message.id}: currentUserMessageId=${currentUserMessageId}, isProcessingVoice=${isProcessingVoice}, isTyping=${isTyping}, shouldAnimate=${currentUserMessageId === message.id && (isProcessingVoice || isTyping)}`);
            }
            
            // Show only the last 2 messages (one pair) by default, all messages on hover
            const isRecentMessage = index >= messagesToShow.length - 2;
            
            return (
              <div
                key={message.id}
                className={`flex ${
                  message.isAI ? 'justify-start' : 'justify-end'
                } ${isRecentMessage ? 'block' : 'hidden group-hover:block'}`}
              >
             <div className={`
  ${message.isAI ? 'order-2 mr-auto' : 'order-1 ml-auto'}
  max-w-[65%] md:max-w-md
`}>
                {message.isAI && (
                  <div className="flex items-start gap-2 animate-in slide-in-from-left duration-300">
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-4 h-4 bg-button-gradient rounded-md flex items-center justify-center shadow-glow relative overflow-hidden">
                        <Bot className="w-2 h-2 text-white relative z-10" />
                      </div>
                      {/* Only show wave animation when AI is actively speaking (not during typewriter) */}
                      {currentSpeakingMessageId === message.id && isAISpeaking && (
                        <WaveAnimation 
                          isActive={true} 
                          colors="from-cyan-400 to-blue-500" 
                        />
                      )}
                    </div>
                    <div className="flex-1 relative">
                      {/* Glowing effect for active AI messages */}
                      {((currentSpeakingMessageId === message.id && isAISpeaking) || (message.isTypewriter && typewriterMessageId === message.id)) && (
                        <GlowingEffect
                          blur={0}
                          borderWidth={3}
                          spread={80}
                          glow={true}
                          disabled={false}
                          proximity={80}
                          inactiveZone={0.2}
                          glowColor="rgba(34, 197, 94, 0.8)" // Green glow for AI speaking
                          className="absolute inset-0 rounded-lg"
                        />
                      )}
                      <div
                        className="glass-card px-2.5 py-2 relative text-text-primary"
                      >
                        {/* Subtle background glow effect */}
                        <div className={`absolute inset-0 rounded-md transition-all duration-500 ${
                          ((currentSpeakingMessageId === message.id && isAISpeaking) || (message.isTypewriter && typewriterMessageId === message.id)) 
                            ? 'bg-gradient-to-r from-blue-500/10 via-cyan-500/15 to-blue-500/10 animate-pulse' 
                            : 'bg-gradient-to-r from-gray-500/5 to-gray-600/5'
                        }`}></div>
                        
                        {/* Message content with typewriter effect for AI messages */}
                        <div className="relative z-10">
                          <div className="text-xs leading-tight font-medium">
                            {message.isAI && message.isTypewriter && (typewriterMessageId === message.id || completedTypewriterIds.has(message.id)) ? (
                              <div className="relative">
                                {/* Hidden text to reserve space */}
                                <div className="invisible" aria-hidden="true">{message.text}</div>
                                {/* Visible typewriter text */}
                                <div className="absolute inset-0">
                                  <TypewriterText 
                                    text={message.text} 
                                    speed={25} // Slower, more natural typewriter speed
                                    delay={300} // Reduced delay to prevent empty card
                                    onComplete={handleTypewriterComplete}
                                    messageId={message.id}
                                    isCompleted={completedTypewriterIds.has(message.id)}
                                  />
                                </div>
                              </div>
                            ) : message.isGreeting ? (
                              <div className="animate-in fade-in slide-in-from-left duration-700">
                                {message.text}
                              </div>
                            ) : (
                              message.text
                            )}
                          </div>
                          
                          {/* Ultra Compact timestamp */}
                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-glass-border">
                            <p className="text-xs opacity-50 font-medium">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!message.isAI && (
                  <div className="flex items-start gap-2 justify-end animate-in slide-in-from-right duration-300">
                    <div className="flex-1 relative">
                      {/* Glowing effect for active user messages */}
                      {(currentUserMessageId === message.id && (isProcessingVoice || isTyping || isUserSpeaking || isWaitingForAIResponse)) && (
                        <GlowingEffect
                          blur={0}
                          borderWidth={3}
                          spread={70}
                          glow={true}
                          disabled={false}
                          proximity={70}
                          inactiveZone={0.15}
                          glowColor="rgba(168, 85, 247, 0.8)" // Purple glow for user activity
                          className="absolute inset-0 rounded-lg"
                        />
                      )}
                      <div
                        className="glass-card px-2.5 py-2 relative text-text-primary"
                      >
                        {/* Subtle background glow effect */}
                        <div className={`absolute inset-0 rounded-md transition-all duration-500 ${
                          (currentUserMessageId === message.id && (isProcessingVoice || isTyping || isUserSpeaking || isWaitingForAIResponse)) 
                            ? 'bg-gradient-to-r from-blue-500/10 via-cyan-500/15 to-blue-500/10 animate-pulse' 
                            : 'bg-gradient-to-r from-gray-500/5 to-gray-600/5'
                        }`}></div>
                        
                        {/* Message content */}
                        <div className="relative z-10">
                          <div className="text-xs leading-tight font-medium">
                            {message.isTypewriter && (typewriterMessageId === message.id || completedTypewriterIds.has(message.id)) ? (
                              <div className="relative">
                                {/* Hidden text to reserve space */}
                                <div className="invisible" aria-hidden="true">{message.text}</div>
                                {/* Visible typewriter text */}
                                <div className="absolute inset-0">
                                  <TypewriterText 
                                    text={message.text} 
                                    speed={25} // Same speed as AI messages
                                    delay={0} // No delay for user messages
                                    onComplete={handleTypewriterComplete}
                                    messageId={message.id}
                                    isCompleted={completedTypewriterIds.has(message.id)}
                                  />
                                </div>
                              </div>
                            ) : (
                              message.text
                            )}
                          </div>
                          
                          {/* Ultra Compact timestamp */}
                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-glass-border">
                            <p className="text-xs opacity-50 font-medium">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-4 h-4 bg-button-secondary rounded-md flex items-center justify-center shadow-glow relative overflow-hidden">
                        <User className="w-2 h-2 text-white relative z-10" />
                        {currentUserMessageId === message.id && (isTyping || isProcessingVoice || isWaitingForAIResponse) && (
                          <div className="absolute inset-0 animate-pulse bg-white/20 rounded-md"></div>
                        )}
                      </div>
                      {/* Show wave animation when user is actively speaking OR when processing voice input */}
                      {currentUserMessageId === message.id && (isUserSpeaking || isProcessingVoice) && (
                        <WaveAnimation 
                          isActive={true} 
                          colors="from-cyan-400 to-blue-500" 
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })}
          

             
          <div ref={messagesEndRef} />
        </div>



        {/* Control Buttons */}
        {isCallActive && (
          <div className="flex items-center justify-center gap-6 p-4">
            {/* Mute/Unmute Button */}
            <button
              onClick={handleMuteToggle}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 shadow-cyan-500/30 transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 transition-all duration-300"></div>
              {isMuted ? (
                <MicOff className="w-5 h-5 text-white relative z-10" />
              ) : (
                <Mic className="w-5 h-5 text-white relative z-10" />
              )}
            </button>

            {/* Mute Label */}
            <span className="text-sm font-medium text-text-primary opacity-70">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95"
              title="End call"
            >
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"></div>
              <Phone className="w-5 h-5 text-white relative z-10 rotate-[135deg]" />
            </button>

            {/* End Call Label */}
            <span className="text-sm font-medium text-text-primary opacity-70">
              End call
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

// Custom styles for scrollbar only - wave animations are in Tailwind config
const styles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Safari and Chrome */
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ChatWindow;
