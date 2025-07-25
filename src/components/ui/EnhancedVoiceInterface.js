import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, Volume2, Square, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MovingBorder } from './MovingBorder';

export const EnhancedVoiceInterface = ({
  isVADActive,
  isUserSpeaking,
  isAISpeaking,
  isProcessing,
  currentTranscript,
  showSpeakingIndicator,
  initializeVAD,
  stopVAD,
  className,
}) => {
  const handleVoiceToggle = () => {
    if (isVADActive) {
      stopVAD();
    } else {
      initializeVAD();
    }
  };

  return (
    <div className={cn("flex flex-col items-center space-y-6", className)}>
      {/* Enhanced Main Voice Button with Better Spacing */}
      <div className="relative mb-8 md:mb-12">
        <MovingBorder
          duration={isUserSpeaking ? 1000 : 3000}
          containerClassName={cn(
            "w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52 transition-all duration-300",
            isUserSpeaking && "scale-110"
          )}
          borderRadius="50%"
        >
          <motion.button
            onClick={handleVoiceToggle}
            disabled={isProcessing}
            className={cn(
              "w-full h-full rounded-full flex items-center justify-center text-white relative overflow-hidden",
              isVADActive 
                ? "bg-gradient-to-br from-red-500 to-pink-600" 
                : "bg-gradient-to-br from-blue-500 to-blue-600",
              "hover:shadow-2xl transition-all duration-300"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-spin" />
                </motion.div>
              ) : isAISpeaking ? (
                <motion.div
                  key="ai-speaking"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-1"
                >
                  <Volume2 className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16" />
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-white rounded-full"
                        animate={{
                          height: ["4px", "12px", "4px"],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : isVADActive ? (
                <motion.div
                  key="recording"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Square className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mic className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audio Wave Animation */}
            {(isUserSpeaking || isAISpeaking) && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.button>
        </MovingBorder>

        {/* Speaking Indicator Rings */}
        <AnimatePresence>
          {showSpeakingIndicator && (
            <>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                                      className="absolute inset-0 rounded-full border border-blue-400/40"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{
                    scale: 1 + i * 0.3,
                    opacity: 0,
                  }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Status Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={
            isProcessing ? 'processing' :
            isAISpeaking ? 'ai-speaking' :
            isUserSpeaking ? 'user-speaking' :
            isVADActive ? 'listening' : 'ready'
          }
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="text-center space-y-2"
        >
          <h3 className="text-lg md:text-xl font-semibold text-white">
            {isProcessing ? "Processing..." :
             isAISpeaking ? "AI Speaking" :
             isUserSpeaking ? "Listening..." :
             isVADActive ? "Ready to Listen" : "Start Voice Chat"}
          </h3>
          <p className="text-sm md:text-base text-white/70 max-w-xs mx-auto">
            {isProcessing ? "Analyzing your message..." :
             isAISpeaking ? "Playing AI response" :
             isUserSpeaking ? "Speak clearly into your microphone" :
             isVADActive ? "Tap to stop recording" : "Tap to begin voice conversation"}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Live Transcript */}
      <AnimatePresence>
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-md mx-auto"
          >
            <p className="text-white/90 text-sm md:text-base text-center">
              "{currentTranscript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Visualization */}
      {(isUserSpeaking || isAISpeaking) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center space-x-1"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
                                className="w-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-full"
              animate={{
                height: [8, 24, 8],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}; 