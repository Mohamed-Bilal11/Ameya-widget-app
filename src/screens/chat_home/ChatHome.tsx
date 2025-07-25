"use client"

import { useEffect, useState, useRef } from "react"
import Header from "../../components/Header"
import StatusSection from "../../components/StatusSection"
import ChatWindow from "../../components/ChatWindow"
import DietEntries from "../../components/DietEntries"
import ToastContainer from "../../components/ToastContainer"
import Footer from "../../components/ui/Footer"
import { Button } from "../../components/ui/Button"
import { Mic,PhoneCall, Activity, Apple, BarChart3, Lightbulb, Calendar, TrendingUp, Clock, Award, Mail, X } from "lucide-react"
import VoiceButtonParticles from '../../components/ui/VoiceButtonParticles';
import ParticlesBackground from "../../components/ui/ParticlesBackground";
import WebSocketSessionService from "../../services/WebSocketSessionService";




// eslint-disable-next-line no-unused-vars
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://nutrina.techjays.com"


function ChatHome() {
  const [dietEntries, setDietEntries] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [status, setStatus] = useState("Loading...")

  // UI state
  const [welcomeText, setWelcomeText] = useState("")
  const [showTypewriter, setShowTypewriter] = useState(false)

  // Toast notifications
  const [toasts, setToasts] = useState([])

  // Session management
  const [userSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)

  // UI State Management
  const [uiState, setUiState] = useState("hero") // hero, conversation

  // Chat Modal State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  
  // Microphone Permission Popup State
  const [isMicPermissionPopupOpen, setIsMicPermissionPopupOpen] = useState(false)
  const [popupStep, setPopupStep] = useState("email") // "email" or "microphone"
  const [userEmail, setUserEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  
  // Session-based microphone permission tracking
  const [hasMicPermissionBeenRequested, setHasMicPermissionBeenRequested] = useState(false)
  
  // Voice Button States for Micro-interactions
  const [isVoiceButtonHovered, setIsVoiceButtonHovered] = useState(false)
  const [isVoiceButtonActive, setIsVoiceButtonActive] = useState(false)

  // WebSocket Session Service
  const sessionServiceRef = useRef(null)
  const [chatResponse, setChatResponse] = useState(null)
  
  // eslint-disable-next-line no-unused-vars
  const [connectionStatus, setConnectionStatus] = useState('disconnected') // 'connecting', 'connected', 'error'

  useEffect(() => {
    initializeApp()
    
    // Check if microphone permission was already requested in this session
    const micPermissionRequested = sessionStorage.getItem('micPermissionRequested')
    if (micPermissionRequested === 'true') {
      setHasMicPermissionBeenRequested(true)
    }

    // Initialize WebSocket session service
    initializeSessionService()

    // Cleanup on unmount
    return () => {
      if (sessionServiceRef.current) {
        sessionServiceRef.current.disconnect()
      }
    }

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeSessionService = () => {
    console.log("Initializing WebSocket session service...")
    
    sessionServiceRef.current = new WebSocketSessionService({
      wsUrl: process.env.REACT_APP_WEBSOCKET_URL || 'wss://nutrina.techjays.com/ws',
      onConnect: () => {
        console.log("✅ WebSocket session service connected")
        setConnectionStatus('connected')
      },
      onDisconnect: () => {
        console.log("❌ WebSocket session service disconnected")
        setConnectionStatus('disconnected')
      },
      onSessionCreated: (sessionData) => {
        console.log("✅ Session created via WebSocket:", sessionData)
        setSessionId(sessionData.sessionId)
        setSelectedSessionId(sessionData.sessionId)
        setDietEntries([])
        
        // Store session ID
        localStorage.setItem('dietAI_sessionId', sessionData.sessionId)
        
        // Update URL to reflect new session
        const url = new URL(window.location)
        url.searchParams.set('session', sessionData.sessionId)
        window.history.replaceState({}, '', url)
      },
      onSessionLoaded: (sessionData) => {
        console.log("✅ Session loaded via WebSocket:", sessionData)
        setSessionId(sessionData.sessionId)
        setSelectedSessionId(sessionData.sessionId)
        setDietEntries(sessionData.dietEntries || [])
        
        // Store session ID
        localStorage.setItem('dietAI_sessionId', sessionData.sessionId)
        
        // Update URL to reflect current session
        const url = new URL(window.location)
        url.searchParams.set('session', sessionData.sessionId)
        window.history.replaceState({}, '', url)
      },
      onError: (error) => {
        console.error("❌ WebSocket session service error:", error)
        const errorMessage = error?.message || 'Unknown WebSocket error'
        console.error("Error details:", {
          message: errorMessage,
          stack: error?.stack,
          error: error
        })
        
        setConnectionStatus('error')
        
        // Show user-friendly error message
        if (errorMessage.includes('timeout')) {
          showError("Connection timeout - please check if your WebSocket server is running")
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          showError("Cannot connect to WebSocket server - please ensure it's running")
        } else {
          showError("WebSocket connection error: " + errorMessage)
        }
      },
      onChatResponse: (responseData) => {
        console.log("💬 Chat response received in App:", responseData)
        setChatResponse(responseData)
      },
      onAudioResponse: (audioData) => {
        console.log("🎵 Audio response received in App:", audioData)
        // Forward audio response to ChatWindow component
        setChatResponse({
          ...audioData,
          isAudioResponse: true
        })
      },
      onTranscript: (transcriptData) => {
        console.log("📝 Transcript received in App:", transcriptData)
        // Forward transcript to ChatWindow component
        setChatResponse({
          ...transcriptData,
          isTranscript: true
        })
      }
    })
    
    // Don't connect immediately - wait for user to enter email
    console.log("⏳ WebSocket service initialized, waiting for user email...")
    setConnectionStatus('waiting')
  }

  const initializeApp = async () => {
    try {
      // Get session param from URL
      const urlParams = new URLSearchParams(window.location.search)
      const sessionParam = urlParams.get("session")

      console.log("=== INITIALIZE APP START ===")
      console.log("URL params:", window.location.search)
      console.log("Session param:", sessionParam)
      console.log("============================")

      // Show generic welcome message with typewriter effect
      const mealInfo = getMealTimeGreeting()
      const welcomeMessage = `Hey there! ${mealInfo.greeting.split('!')[0]}! ${mealInfo.timeIcon} ${mealInfo.greeting.split('!')[1]}`;

      setTimeout(() => {
        setShowTypewriter(true)
        typeWriter(
          welcomeMessage,
          () => {
            setTimeout(() => {
              setStatus("Ready to chat! Click the microphone below to start our conversation")
            }, 300)
          },
          30,
        )
      }, 500) // Give a bit more time for the loading effect

      // Handle session creation/loading based on URL parameters
      if (sessionParam) {
        // If session ID provided in URL, load that specific session
        console.log("Branch: Loading specific session")
        await initializeSession(sessionParam)
      } else {
        // Create new session
        console.log("Branch: Creating new session")
        await initializeSession(null)
      }
    } catch (err) {
      showError("Failed to initialize app. Please check your connection.")
      console.error("App initialization error:", err)
    }
  }



  const initializeSession = async (sessionParam = null) => {
    try {
        // Since WebSocket connection is now delayed until user enters email,
        // we'll create a local session ID for now
        console.log('📝 Creating local session ID (WebSocket will connect when user enters email)')
        const localSessionId = sessionParam || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setSessionId(localSessionId)
        setSelectedSessionId(localSessionId)
        setDietEntries([])
        
        // Store session ID
        localStorage.setItem('dietAI_sessionId', localSessionId)
        
        // Update URL to reflect session
        const url = new URL(window.location)
        url.searchParams.set('session', localSessionId)
        window.history.replaceState({}, '', url)
        
        console.log('✅ Local session created:', localSessionId)
        console.log('⏳ WebSocket will connect when user enters email')
    } catch (error) {
        console.error('Error initializing session:', error)
        showError('Failed to initialize session')
    }
  }

  const handleSessionChange = async (sessionId) => {
    try {
      setSelectedSessionId(sessionId)
      setSessionId(sessionId)
      // Load session via WebSocket by reconnecting with new session ID
      if (sessionServiceRef.current) {
        console.log('🔄 Changing session via WebSocket:', sessionId)
        sessionServiceRef.current.disconnect()
        sessionServiceRef.current.connect(sessionId, userEmail || 'user@example.com')
      }
    } catch (error) {
      console.error("Error changing session:", error)
      showError("Failed to load session")
    }
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatMealType = (mealType) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1)
  }

  const getMealTimeGreeting = () => {
    const hour = new Date().getHours()
    
    if (hour < 10) {
      return {
        greeting: "Good morning! Ready to track your nutrition today?",
        timeIcon: "🌅" // sunrise for morning
      }
    } else if (hour < 14) {
      return {
        greeting: "Good afternoon! Ready to track your nutrition today?",
        timeIcon: "☀️" // sun for afternoon
      }
    } else if (hour < 18) {
      return {
        greeting: "Good afternoon! Ready to track your nutrition today?",
        timeIcon: "☀️" // sun for afternoon
      }
    } else {
      return {
        greeting: "Good evening! Ready to track your nutrition today?",
        timeIcon: "🌙" // moon for evening
      }
    }
  }

  const typeWriter = (text, callback, speed = 50) => {
    let i = 0
    const timer = setInterval(() => {
      setWelcomeText(text.slice(0, i))
      i++
      if (i > text.length) {
        clearInterval(timer)
        if (callback) callback()
      }
    }, speed)
  }

  const addToast = (message, type = "error") => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type }
    setToasts(prev => [...prev, toast])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

 

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showError = (message) => {
    addToast(message, "error")
  }

  const handleBackToHero = () => {
    setUiState("hero")
  }

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle email submission
  const handleEmailContinue = () => {
    setEmailError("")
    
    if (!userEmail.trim()) {
      setEmailError("Please enter your email address")
      return
    }
    
    if (!validateEmail(userEmail)) {
      setEmailError("Please enter a valid email address")
      return
    }
    
    // Store email in session storage for reconnection
    sessionStorage.setItem('userEmail', userEmail)
    
    // Email is valid, now connect to WebSocket with the user's email
    if (sessionServiceRef.current) {
      console.log("🔗 Connecting to WebSocket with user email:", userEmail)
      setConnectionStatus('connecting')
      
      // Get session ID from URL if available
      const urlParams = new URLSearchParams(window.location.search)
      const sessionParam = urlParams.get("session")
      
      // Connect to WebSocket with user's email
      sessionServiceRef.current.connect(sessionParam, userEmail)
    } else {
      console.error("❌ WebSocket service not initialized")
      setEmailError("Service not ready. Please refresh and try again.")
      return
    }
    
    // Transition to microphone step
    setPopupStep("microphone")
  }

  // Handle voice button click with session-based popup logic
  const handleVoiceButtonClick = () => {
    console.log("Voice button clicked!");
    setIsVoiceButtonActive(true);
    setTimeout(() => setIsVoiceButtonActive(false), 300);
    
    // Only show popup if microphone permission hasn't been granted in this session
    if (!hasMicPermissionBeenRequested) {
      console.log("Microphone permission not granted yet - showing popup");
      setPopupStep("email"); // Reset to email step
      setUserEmail(""); // Clear previous email
      setEmailError(""); // Clear previous error
      setIsMicPermissionPopupOpen(true);
    } else {
      console.log("Microphone permission already granted in this session - checking WebSocket connection");
      
      // Check if WebSocket is connected, if not, reconnect
      if (sessionServiceRef.current && !sessionServiceRef.current.isConnected) {
        console.log("WebSocket not connected, attempting to reconnect...");
        setConnectionStatus('connecting');
        
        // Get the stored email from session storage or use a default
        const storedEmail = sessionStorage.getItem('userEmail') || userEmail;
        const sessionParam = new URLSearchParams(window.location.search).get("session");
        
        if (storedEmail) {
          console.log("Reconnecting WebSocket with stored email:", storedEmail);
          sessionServiceRef.current.connect(sessionParam, storedEmail);
          
          // Wait a bit for connection, then open chat
          setTimeout(() => {
            setIsChatModalOpen(true);
          }, 1000);
        } else {
          console.log("No stored email found, showing popup to get email");
          setPopupStep("email");
          setUserEmail("");
          setEmailError("");
          setIsMicPermissionPopupOpen(true);
        }
      } else {
        console.log("WebSocket is connected, opening chat directly");
        setIsChatModalOpen(true);
      }
    }
  };

  // Handle microphone permission popup actions
  const handleAllowMicrophone = () => {
    setIsMicPermissionPopupOpen(false);
    setIsChatModalOpen(true);
    // Only mark as requested when user actually allows it
    setHasMicPermissionBeenRequested(true);
    sessionStorage.setItem('micPermissionRequested', 'true');
    // Reset popup state
    setPopupStep("email");
    setUserEmail("");
    setEmailError("");
    
    // The ChatWindow will automatically initialize Web Speech API when it opens
    console.log("🎤 Microphone permission granted - Web Speech API will be initialized in ChatWindow");
  };

  const handleNotNow = () => {
    setIsMicPermissionPopupOpen(false);
    // User declined, don't mark as requested so popup can show again
    // Reset popup state
    setPopupStep("email");
    setUserEmail("");
    setEmailError("");
  };

  // Handle close popup button click
  const handleClosePopup = () => {
    setIsMicPermissionPopupOpen(false);
    // Reset popup state
    setPopupStep("email");
    setUserEmail("");
    setEmailError("");
    };


  return (
    <div className="min-h-screen flex flex-col">
      <ParticlesBackground />
      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-6 flex-grow">
        {/* Hero Section */}
        {uiState === "hero" && (
          <div className="min-h-screen flex items-center justify-center py-8">
            <div className="w-full max-w-3xl mx-auto text-center space-y-8">
              {/* Header Component */}
              <div className="space-y-6">
                <Header />
                
                {/* Welcome Message with Typewriter Effect */}
                {showTypewriter && welcomeText && (
                  <div className="max-w-xl mx-auto text-center space-y-4">
                    <p className="text-xl text-slate-900 font-bold mb-3">
                      {welcomeText}
                    </p>
                  </div>
                )}
                 
              </div>

              {/* Action Section */}
              <div className="space-y-8">
              
              

                {/* Primary Voice Button */}
                    <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="relative w-28 h-28">
                        {/* Particles Layer */}
                        <VoiceButtonParticles 
                          isActive={isVoiceButtonHovered || isVoiceButtonActive} 
                          isListening={false}
                        />
                        {/* Voice Button */}
                        <button
                          onClick={handleVoiceButtonClick}
                          onMouseEnter={() => setIsVoiceButtonHovered(true)}
                          onMouseLeave={() => setIsVoiceButtonHovered(false)}
                          className={`
                            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                            w-20 h-20
                            rounded-full bg-gradient-to-br from-blue-500 to-teal-400
                            flex items-center justify-center text-white cursor-pointer 
                            transition-all duration-300 ease-out shadow-lg
                            hover:shadow-xl hover:shadow-blue-500/25
                            ${isVoiceButtonHovered ? 'scale-110' : ''}
                            ${isVoiceButtonActive ? 'scale-95' : ''}
                          `}
                        >
                          <PhoneCall className="w-10 h-10 transition-all duration-300 relative z-10" />
                        </button>
                      </div>
                    </div>
                  
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Mic className="w-4 h-4 text-blue-600" />
                      <h2 className="text-lg font-bold text-slate-900">
                        Start Your Chat
                      </h2>
                    </div>
                    <p className="text-slate-600 font-medium text-sm max-w-sm">
                      Tap the microphone to begin your conversation with AI
                    </p>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    { 
                      icon: Apple, 
                      iconColor: "text-green-600", 
                      bgColor: "bg-green-50",
                      title: "Log Meals", 
                      desc: "Tell me what you ate and I'll analyze your nutrition",
                      features: ["Smart recognition", "Macro tracking", "Portion estimation"]
                    },
                    { 
                      icon: BarChart3, 
                      iconColor: "text-blue-600", 
                      bgColor: "bg-blue-50",
                      title: "Track Progress", 
                      desc: "Monitor your nutrition goals and daily achievements",
                      features: ["Daily summaries", "Trend analysis", "Goal tracking"]
                    },
                    { 
                      icon: Lightbulb, 
                      iconColor: "text-amber-600", 
                      bgColor: "bg-amber-50",
                      title: "Get Advice", 
                      desc: "Receive personalized tips and meal recommendations",
                      features: ["Custom meal plans", "Expert tips", "Health insights"]
                    }
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 
                                                text-left group hover:shadow-lg transition-all duration-300
                                                hover:border-slate-300 flex flex-col items-start">
                        <div className={`w-10 h-10 ${item.bgColor} rounded-lg 
                                       flex items-center justify-center mb-3 
                                       group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 font-medium mb-3 leading-relaxed text-sm">
                          {item.desc}
                        </p>
                        <div className="space-y-1 text-left w-full">
                          {item.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-1.5 text-xs text-slate-500">
                              <div className="w-4 flex-shrink-0 flex items-center">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              </div>
                              <span className="font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Section */}
        {uiState === "conversation" && (
          <div className="min-h-screen py-6 space-y-6">
            {/* Header with Back Button */}
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between py-3">
                <Button
                  onClick={handleBackToHero}
                  variant="ghost"
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-2 
                           font-medium text-sm"
                >
                  ← Back to Home
                </Button>
              </div>
            </div>

            {/* Status Section */}
            <div className="max-w-2xl mx-auto">
              <StatusSection status={status} isRecording={false} />
            </div>

            {/* Nutrition Summary Section */}
            {dietEntries.length > 0 && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-3 h-3 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Today's Nutrition Summary
                    </h2>
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium mb-4 text-sm">
                    Track your progress toward your daily goals
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-center gap-4 
                                bg-white border border-slate-200 py-3 px-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-slate-600 font-medium">Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span className="text-xs text-slate-600 font-medium">Real-time</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-slate-600 font-medium">Goals</span>
                    </div>
                  </div>
                </div>
                <DietEntries 
                  entries={dietEntries}
                  formatMealType={formatMealType}
                  formatTime={formatTime}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Microphone Permission Popup */}
      {isMicPermissionPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full mx-auto text-center shadow-xl hover:shadow-2xl transition-all duration-300 relative">
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Email Step */}
            {popupStep === "email" && (
              <div className="transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Get Started
                </h2>
                <p className="text-slate-600 text-sm mb-6">
                  Enter your email to begin your AI nutrition conversation
                </p>
                <div className="space-y-4">
                  <div className="text-left">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailContinue()}
                      placeholder="Enter your email address"
                      className={`w-full px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        emailError 
                          ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
                          : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500 hover:border-slate-400'
                      }`}
                      autoFocus
                    />
                    {emailError && (
                      <p className="text-red-600 text-xs mt-2 font-medium">{emailError}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleEmailContinue}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Microphone Permission Step */}
            {popupStep === "microphone" && (
              <div className="transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mic className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Enable Microphone
                </h2>
                <p className="text-slate-600 text-sm mb-6">
                  To chat with AI, please allow us to use your microphone for voice conversations
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAllowMicrophone}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Allow Microphone
                  </button>
                  {/* <button
                    onClick={() => setPopupStep("email")}
                    className="bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  >
                    ← Back
                  </button> */}
                  <button
                    onClick={handleNotNow}
                    className="bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
      
      {/* Chat Modal */}
      <ChatWindow 
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        userSessions={userSessions}
        selectedSessionId={selectedSessionId}
        handleSessionChange={handleSessionChange}
        sessionId={sessionId}
        sessionService={sessionServiceRef.current}
        chatResponse={chatResponse}
        onChatResponseProcessed={() => setChatResponse(null)}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ChatHome





