import React from 'react';
import { Code, Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-auto relative z-10 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-teal-50/30 animate-gradient-x"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex items-center justify-center gap-3">
          {/* Animated logo */}
          <div className="relative group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Code className="w-4 h-4 text-white" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 w-8 h-8 bg-blue-400/20 rounded-full animate-ping"></div>
          </div>

          {/* Text with gradient and animations */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Powered by</span>
            <span className="text-lg font-bold bg-gradient-to-br from-[#626cfc] to-[#5f6afc] bg-clip-text text-transparent animate-gradient-text">
              techjays
            </span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" />
          </div>

          {/* Sparkle effect */}
          <div className="relative">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

      </div>

      <style >{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 0.8; }
        }
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 6s ease infinite;
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer; 