import React from 'react';
import { Brain, Mic, Apple, Zap, Heart, Loader2, Clock, Activity } from 'lucide-react';

// Main AI processing loader
export const AIProcessingLoader = ({ 
  message = "AI is analyzing...", 
  submessage = "",
  className = '' 
}) => (
  <div className={`glass-card-strong padding-component text-center ${className}`}>
    <div className="relative mb-6">
      {/* Central brain icon with pulse */}
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <Brain className="w-6 h-6 text-white animate-pulse" />
        </div>
        
        {/* Orbiting nutrition icons */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
          <Apple className="absolute w-4 h-4 text-green-500 -top-2 left-1/2 transform -translate-x-1/2" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}>
          <Zap className="absolute w-4 h-4 text-yellow-500 -bottom-2 left-1/2 transform -translate-x-1/2" />
        </div>
      </div>
    </div>
    
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{message}</h3>
    {submessage && (
      <p className="text-sm text-slate-600 mb-4">{submessage}</p>
    )}
    
    {/* Animated dots */}
    <div className="flex justify-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  </div>
);

// Voice processing loader
export const VoiceProcessingLoader = ({ 
  message = "Processing voice...",
  className = '' 
}) => (
  <div className={`glass-card padding-element text-center ${className}`}>
    <div className="relative w-12 h-12 mx-auto mb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-full animate-pulse">
        <Mic className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Sound waves */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute inset-0 border-2 border-red-400 rounded-full opacity-30 animate-ping"
          style={{ 
            animationDelay: `${i * 0.3}s`,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
    
    <p className="text-sm font-medium text-slate-700">{message}</p>
  </div>
);

// Nutrition analysis loader
export const NutritionAnalysisLoader = ({ 
  message = "Analyzing nutrition...",
  progress = null,
  className = '' 
}) => (
  <div className={`glass-card padding-component text-center ${className}`}>
    <div className="relative mb-6">
      {/* Nutrition wheel */}
      <div className="w-20 h-20 mx-auto mb-4 relative">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
        
        {/* Center icon */}
        <div className="absolute inset-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <Apple className="w-6 h-6 text-white" />
        </div>
        
        {/* Floating nutrients */}
        {[
          { Icon: Heart, color: 'text-red-500', angle: 0 },
          { Icon: Zap, color: 'text-yellow-500', angle: 90 },
          { Icon: Activity, color: 'text-blue-500', angle: 180 },
        ].map(({ Icon, color, angle }, index) => (
          <div
            key={index}
            className="absolute w-6 h-6"
            style={{
              transform: `rotate(${angle}deg) translateY(-40px) rotate(-${angle}deg)`,
              left: '50%',
              top: '50%',
              marginLeft: '-12px',
              marginTop: '-12px',
              animation: `float 3s ease-in-out infinite`,
              animationDelay: `${index * 0.5}s`
            }}
          >
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        ))}
      </div>
    </div>
    
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{message}</h3>
    
    {progress !== null && (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

// Simple inline loader
export const InlineLoader = ({ 
  size = 'sm',
  color = 'blue',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    purple: 'text-purple-500'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin ${className}`} />
  );
};

// Skeleton loader for content
export const SkeletonLoader = ({ 
  lines = 3,
  className = '' 
}) => (
  <div className={`animate-pulse ${className}`}>
    <div className="glass-ultra-light rounded-2xl p-4 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ 
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  </div>
);

// Connection status loader
export const ConnectionLoader = ({ 
  message = "Connecting...",
  className = '' 
}) => (
  <div className={`glass-card-strong padding-element text-center ${className}`}>
    <div className="relative w-12 h-12 mx-auto mb-4">
      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-r-transparent animate-spin"></div>
      
      <div className="absolute inset-2 bg-blue-100 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>
    </div>
    
    <p className="text-sm font-medium text-slate-700">{message}</p>
  </div>
);

// Typing indicator
export const TypingIndicator = ({ 
  message = "AI is typing",
  className = '' 
}) => (
  <div className={`flex items-center gap-3 glass-ultra-light px-4 py-3 rounded-full ${className}`}>
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
    <span className="text-sm text-slate-600">{message}</span>
  </div>
); 