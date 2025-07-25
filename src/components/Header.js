import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Brain, Zap } from 'lucide-react';

const Header = () => (
  <header className="relative mb-6 md:mb-8 flex justify-center w-full">
    <Card className="glass-card-strong padding-component text-center relative overflow-hidden max-w-3xl w-full mx-auto flex flex-col items-center">
      {/* Decorative background elements (static, no hover) */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-3 left-3 w-10 md:w-12 h-10 md:h-12 bg-blue-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-3 right-3 w-12 md:w-16 h-12 md:h-16 bg-purple-200/15 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 md:w-26 h-20 md:h-26 bg-slate-300/10 rounded-full blur-2xl"></div>
      </div>
      <CardContent className="relative z-10 p-0 w-full flex flex-col items-center">
        {/* Logo and Title Row */}
        <div className="flex flex-row items-center justify-center gap-4 md:gap-6 mb-3 w-full">
          <div className="flex items-center justify-center flex-shrink-0">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-glow-lg">
              <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight text-left drop-shadow-lg relative">
            <span className="bg-gradient-to-br from-blue-500 to-teal-400 bg-clip-text text-transparent font-black">Nutrina </span> <span className="text-slate-900">Talks</span>
            <span className="block w-full mt-2">
              <span className="block h-1 w-20 md:w-32 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full animate-accentBar"></span>
            </span>
          </h1>
          <style>{`
            @keyframes accentBar {
              0%, 100% { width: 5rem; opacity: 0.7; }
              50% { width: 8rem; opacity: 1; }
            }
            .animate-accentBar {
              animation: accentBar 2.5s ease-in-out infinite;
            }
          `}</style>
        </div>
        {/* Badges */}
        {/* Subtitle */}
        <p className="text-base md:text-lg lg:text-xl text-slate-800 font-semibold max-w-2xl mx-auto leading-relaxed mb-5 md:mb-6 px-3 md:px-0 drop-shadow-sm">
          Your intelligent nutrition companion for healthier living
        </p>
        {/* Decorative divider (static, no hover) */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-px w-10 md:w-12 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
            <div className="w-6 h-6 bg-blue-400/20 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-blue-600" />
            </div>
          </div>
          <div className="mx-2 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-400/20 rounded-full flex items-center justify-center">
              <Brain className="w-3 h-3 text-purple-600" />
            </div>
            <div className="h-px w-10 md:w-12 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  </header>
);

export default Header; 