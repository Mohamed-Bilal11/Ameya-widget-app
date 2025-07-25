import React from 'react';

const VoiceWaveAnimation = ({ 
  isActive = false, 
  isListening = false, 
  isSpeaking = false,
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const waveCount = isListening ? 6 : isSpeaking ? 8 : 4;
  
  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      {/* Animated Sound Waves */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: waveCount }).map((_, index) => (
            <div
              key={index}
              className={`absolute inset-0 border-2 rounded-full opacity-0 ${
                isListening 
                  ? 'border-red-400' 
                  : isSpeaking 
                  ? 'border-green-400' 
                  : 'border-blue-400'
              }`}
              style={{
                animation: `soundWaveExpand 2s ease-out infinite`,
                animationDelay: `${index * 0.3}s`,
                transform: `scale(${1 + index * 0.2})`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Central Pulse */}
      {isActive && (
        <div 
          className={`absolute inset-4 rounded-full ${
            isListening 
              ? 'bg-red-400/20' 
              : isSpeaking 
              ? 'bg-green-400/20' 
              : 'bg-blue-400/20'
          }`}
          style={{
            animation: isListening 
              ? 'listeningPulse 1s ease-in-out infinite'
              : isSpeaking
              ? 'speakingPulse 0.8s ease-in-out infinite'
              : 'voicePulse 2s ease-in-out infinite'
          }}
        />
      )}
      
      {/* Micro Wave Bars for Speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-1 bg-white/60 rounded-full"
              style={{
                height: '8px',
                animation: `waveBar 0.8s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`,
                transform: 'scaleY(0.3)'
              }}
            />
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes soundWaveExpand {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        
        @keyframes waveBar {
          0%, 100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1.8);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceWaveAnimation; 