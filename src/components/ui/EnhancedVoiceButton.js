import React from 'react';
import { Button } from './Button';
import WaveAnimation from './WaveAnimation';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const EnhancedVoiceButton = ({
  isVADActive,
  isProcessing,
  isUserSpeaking,
  onClick,
  size = 'large' // 'small', 'medium', 'large'
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  if (isVADActive) {
    return (
      <div className="relative flex items-center justify-center">
        {/* Animated Orbital Rings */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
          <div className="absolute inset-0 rounded-full border border-bright-red/30"></div>
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-bright-red/70 rounded-full transform -translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-bright-orange/50 rounded-full transform -translate-x-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <div className="absolute inset-2 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
          <div className="absolute inset-0 rounded-full border border-bright-red/20"></div>
          <div className="absolute right-0 top-1/2 w-0.5 h-0.5 bg-bright-red/60 rounded-full transform -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute left-0 top-1/2 w-0.5 h-0.5 bg-bright-orange/40 rounded-full transform -translate-y-1/2 animate-pulse" style={{ animationDelay: '1.2s' }}></div>
        </div>

        {/* Pulse Rings - contained and blue */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 border-2 border-blue-400/40 rounded-full animate-ping"></div>
          <div className="absolute inset-1 border border-blue-300/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Main Button */}
        <Button
          onClick={onClick}
          disabled={isProcessing}
          className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 hover:shadow-glow-lg transform transition-all duration-500 z-10 group border-2 border-blue-500/50 overflow-hidden`}
          style={{
            boxShadow: `
              0 0 30px rgba(29, 78, 216, 0.6),
              0 0 60px rgba(30, 64, 175, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          {/* Wave Animation Overlay - contained within button */}
          <div className="absolute inset-2 rounded-full overflow-hidden">
            <WaveAnimation 
              isActive={true}
              color="white"
              size="small"
              intensity={isUserSpeaking ? "normal" : "low"}
              pattern="breathing"
            />
          </div>
          
          {/* Icon - Always show Mic, not MicOff */}
          <Mic className={`${iconSizes[size]} text-white relative z-10 group-hover:scale-110 transition-transform duration-300`} />
          
          {/* Inner Glow */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-bright-orange/20 to-transparent animate-pulse"></div>
          
          {/* Breathing Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-bright-red/10 to-transparent animate-pulse" style={{ animationDuration: '2s' }}></div>
        </Button>

        {/* Recording Indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-700 rounded-full text-xs text-white font-medium shadow-lg">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            REC
          </div>
        </div>
      </div>
    );
  }

  // Idle State Button
  return (
    <div className="relative flex items-center justify-center">
      {/* Floating Particles */}
      <div className="absolute -top-2 -right-2 w-2 h-2 bg-bright-cyan/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-bright-blue/40 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
      <div className="absolute top-1/2 -left-4 w-1 h-1 bg-bright-purple/40 rounded-full animate-bounce" style={{ animationDelay: '1.4s' }}></div>
      <div className="absolute top-1/4 -right-3 w-1 h-1 bg-bright-cyan/40 rounded-full animate-bounce" style={{ animationDelay: '2.1s' }}></div>

      {/* Gentle Pulse Ring */}
      <div className="absolute inset-0 border border-bright-blue/30 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
      <div className="absolute inset-1 border border-bright-cyan/20 rounded-full animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>

      {/* Main Button */}
      <Button
        onClick={onClick}
        disabled={isProcessing}
        className={`relative ${sizeClasses[size]} rounded-full transition-all duration-500 transform hover:scale-110 group border-2 border-bright-blue/30 ${
          isProcessing 
            ? 'bg-gradient-to-br from-bright-yellow to-bright-orange' 
            : 'bg-button-gradient hover:shadow-glow-lg'
        }`}
        style={{
          boxShadow: isProcessing 
            ? '0 0 30px rgba(191, 219, 254, 0.4), 0 0 60px rgba(37, 99, 235, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 0 30px rgba(107, 138, 255, 0.4), 0 0 60px rgba(77, 127, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Processing Wave Animation */}
        {isProcessing && (
          <WaveAnimation 
            isActive={true}
            color="white"
            size="medium"
            intensity="normal"
            pattern="breathing"
          />
        )}
        
        {/* Icon */}
        {isProcessing ? (
          <Loader2 className={`${iconSizes[size]} text-white animate-spin relative z-10`} />
        ) : (
          <Mic className={`${iconSizes[size]} text-white group-hover:scale-110 transition-transform duration-300 relative z-10`} />
        )}
        
        {/* Hover Glow */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-bright-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Ready Pulse */}
        {!isProcessing && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-bright-blue/10 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
        )}
      </Button>

      {/* Status Indicator */}
      {!isProcessing && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1 px-2 py-1 bg-bright-blue/90 rounded-full text-xs text-white font-medium">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            READY
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVoiceButton; 