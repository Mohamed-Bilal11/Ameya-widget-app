import React from 'react';
import { Apple, Leaf, Heart, Droplets, Zap, Star } from 'lucide-react';

// Subtle background watermark pattern
export const NutritionWatermark = ({ opacity = 0.03, className = '' }) => (
  <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: -1 }}>
    {/* Nutrition Pattern Grid */}
    <div className="absolute inset-0" style={{ opacity }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const icons = [Apple, Leaf, Heart, Droplets, Zap, Star];
        const IconComponent = icons[i % 6];
        return (
          <div key={i} className="absolute" style={{
            left: `${(i % 4) * 25 + 10}%`,
            top: `${Math.floor(i / 4) * 33 + 15}%`,
            transform: `rotate(${i * 15}deg)`,
          }}>
            <IconComponent
              size={24 + (i % 3) * 8}
              className="text-blue-500"
              style={{ filter: 'blur(0.5px)' }}
            />
          </div>
        );
      })}
    </div>
    
    {/* Organic flowing lines */}
    <svg className="absolute inset-0 w-full h-full" style={{ opacity: opacity * 0.5 }}>
      <defs>
        <pattern id="nutritionFlow" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <path 
            d="M0,100 Q50,50 100,100 T200,100" 
            stroke="currentColor" 
            strokeWidth="1" 
            fill="none"
            className="text-blue-400"
          />
          <path 
            d="M100,0 Q150,50 100,100 T100,200" 
            stroke="currentColor" 
            strokeWidth="1" 
            fill="none"
            className="text-green-400"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nutritionFlow)" />
    </svg>
  </div>
);

// Corner branding element
export const BrandCorner = ({ position = 'bottom-right', className = '' }) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} pointer-events-none z-10 ${className}`}>
      <div className="glass-ultra-light p-3 rounded-2xl flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-1">
          <Apple size={16} className="text-green-500" />
          <Heart size={14} className="text-red-400" />
          <Leaf size={16} className="text-green-400" />
        </div>
        <span className="text-xs font-medium text-slate-700">Diet AI</span>
      </div>
    </div>
  );
};

// Floating nutrition icons animation
export const FloatingNutritionIcons = ({ className = '' }) => (
  <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: -1 }}>
    {[
      { Icon: Apple, color: 'text-green-400', delay: 0, x: '10%', y: '20%' },
      { Icon: Leaf, color: 'text-green-500', delay: 2, x: '85%', y: '15%' },
      { Icon: Heart, color: 'text-red-400', delay: 4, x: '20%', y: '70%' },
      { Icon: Droplets, color: 'text-blue-400', delay: 6, x: '75%', y: '75%' },
      { Icon: Zap, color: 'text-yellow-400', delay: 8, x: '50%', y: '30%' },
      { Icon: Star, color: 'text-purple-400', delay: 10, x: '60%', y: '85%' }
    ].map(({ Icon: IconComponent, color, delay, x, y }, index) => (
      <div
        key={index}
        className="absolute opacity-20"
        style={{
          left: x,
          top: y,
          animation: `floatGentle 20s ease-in-out infinite`,
          animationDelay: `${delay}s`
        }}
      >
        <IconComponent size={20} className={color} />
      </div>
    ))}
  </div>
);

// Subtle grid pattern overlay
export const GridPattern = ({ opacity = 0.02, className = '' }) => (
  <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: -2 }}>
    <div 
      className="w-full h-full"
      style={{
        opacity,
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    />
  </div>
);

// Nutrition theme badge
export const NutritionBadge = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-2 glass-ultra-light px-3 py-2 rounded-full ${className}`}>
    <div className="flex items-center gap-1">
      <Apple size={14} className="text-green-500" />
      <Zap size={12} className="text-yellow-500" />
    </div>
    <span className="text-xs font-semibold text-slate-700">AI Nutrition Assistant</span>
  </div>
); 