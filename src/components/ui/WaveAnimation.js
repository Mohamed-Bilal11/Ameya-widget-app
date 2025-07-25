import React from 'react';

const WaveAnimation = ({ 
  isActive, 
  color = "blue", 
  size = "medium", 
  intensity = "normal", 
  pattern = "ripple" 
}) => {
  if (!isActive) return null;
  
  const sizeClasses = {
    tiny: { container: "absolute inset-0", wave1: "inset-1", wave2: "inset-1.5", wave3: "inset-2" },
    small: { container: "absolute inset-0", wave1: "inset-0.5", wave2: "inset-1", wave3: "inset-1.5" },
    medium: { container: "absolute inset-0", wave1: "inset-0", wave2: "inset-0.5", wave3: "inset-1" },
    large: { container: "absolute inset-0", wave1: "-inset-1", wave2: "-inset-0.5", wave3: "inset-0" }
  };
  
  const colorClasses = {
    blue: { 
      primary: "bg-blue-400", 
      secondary: "bg-blue-300", 
      tertiary: "bg-blue-200",
      shadow: "shadow-blue-400/20"
    },
    purple: { 
      primary: "bg-purple-400", 
      secondary: "bg-purple-300", 
      tertiary: "bg-purple-200",
      shadow: "shadow-purple-400/20"
    },
    white: { 
      primary: "bg-white", 
      secondary: "bg-white", 
      tertiary: "bg-white",
      shadow: "shadow-white/20"
    },
    red: { 
      primary: "bg-red-400", 
      secondary: "bg-red-300", 
      tertiary: "bg-red-200",
      shadow: "shadow-red-400/20"
    },
    yellow: { 
      primary: "bg-yellow-400", 
      secondary: "bg-yellow-300", 
      tertiary: "bg-yellow-200",
      shadow: "shadow-yellow-400/20"
    }
  };
  
  const intensitySettings = {
    low: { opacity1: "10", opacity2: "7", opacity3: "5", duration1: "1.2s", duration2: "1.8s", duration3: "2.4s" },
    normal: { opacity1: "30", opacity2: "20", opacity3: "15", duration1: "0.8s", duration2: "1.2s", duration3: "1.6s" },
    high: { opacity1: "40", opacity2: "30", opacity3: "20", duration1: "0.6s", duration2: "0.9s", duration3: "1.2s" }
  };
  
  const sizes = sizeClasses[size];
  const colors = colorClasses[color];
  const intensities = intensitySettings[intensity];
  
  if (pattern === "pulse") {
    return (
      <div className={sizes.container}>
        <div 
          className={`absolute ${sizes.wave1} rounded-full ${colors.primary}/${intensities.opacity1} animate-pulse`} 
          style={{animationDuration: intensities.duration1}}
        ></div>
        <div 
          className={`absolute ${sizes.wave2} rounded-full ${colors.secondary}/${intensities.opacity2} animate-pulse`} 
          style={{animationDuration: intensities.duration2, animationDelay: '0.2s'}}
        ></div>
      </div>
    );
  }
  
  if (pattern === "breathing") {
    return (
      <div className={sizes.container}>
        <div 
          className={`absolute ${sizes.wave1} rounded-full ${colors.primary}/${intensities.opacity1} animate-ping`} 
          style={{
            animationDuration: '2s',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)'
          }}
        ></div>
        <div 
          className={`absolute ${sizes.wave2} rounded-full ${colors.secondary}/${intensities.opacity2} animate-ping`} 
          style={{
            animationDuration: '2.5s',
            animationDelay: '0.5s',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)'
          }}
        ></div>
      </div>
    );
  }
  
  // Default ripple pattern
  return (
    <div className={sizes.container}>
      {/* Primary wave - fastest */}
      <div 
        className={`absolute ${sizes.wave1} rounded-full ${colors.primary}/${intensities.opacity1} animate-ping`} 
        style={{animationDuration: intensities.duration1}}
      ></div>
      
      {/* Secondary wave - medium speed */}
      <div 
        className={`absolute ${sizes.wave2} rounded-full ${colors.secondary}/${intensities.opacity2} animate-ping`} 
        style={{animationDuration: intensities.duration2, animationDelay: '0.2s'}}
      ></div>
      
      {/* Tertiary wave - slowest */}
      <div 
        className={`absolute ${sizes.wave3} rounded-full ${colors.tertiary}/${intensities.opacity3} animate-ping`} 
        style={{animationDuration: intensities.duration3, animationDelay: '0.4s'}}
      ></div>
      
      {/* Continuous pulse overlay */}
      <div 
        className={`absolute ${sizes.wave2} rounded-full ${colors.primary}/10 animate-pulse`} 
        style={{animationDuration: '1s'}}
      ></div>
    </div>
  );
};

export default WaveAnimation; 