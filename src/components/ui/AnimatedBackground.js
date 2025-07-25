import React from 'react';

const blobs = [
  {
    className:
      'absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-80 animate-blob blob-delay-0 blob-duration-18 blob-pulse',
  },
  {
    className:
      'absolute bottom-[-15%] right-[-10%] w-[48rem] h-[48rem] bg-gradient-to-br from-green-300 via-blue-300 to-purple-300 opacity-70 animate-blob blob-delay-1 blob-duration-22 blob-pulse',
  },
  {
    className:
      'absolute top-1/4 left-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-yellow-200 via-pink-300 to-purple-200 opacity-70 animate-blob blob-delay-2 blob-duration-20 blob-pulse',
    style: { transform: 'translateX(-50%)' },
  },
  {
    className:
      'absolute bottom-1/4 left-1/4 w-[28rem] h-[28rem] bg-gradient-to-br from-blue-200 via-green-200 to-cyan-200 opacity-70 animate-blob blob-delay-3 blob-duration-24 blob-pulse',
  },
];

// Particle layer
const particles = Array.from({ length: 24 }).map((_, i) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: `${6 + Math.random() * 10}px`,
  delay: `${Math.random() * 8}s`,
  duration: `${8 + Math.random() * 8}s`,
  opacity: 0.15 + Math.random() * 0.25,
}));

const AnimatedBackground = () => (
  <div className="fixed inset-0 w-full h-full z-[-1] pointer-events-none overflow-hidden">
    {/* Blobs */}
    {blobs.map((blob, i) => (
      <div
        key={i}
        className={blob.className + ' rounded-full'}
        style={blob.style}
      />
    ))}
    {/* Particles */}
    {particles.map((p, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white shadow-lg"
        style={{
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          opacity: p.opacity,
          filter: 'blur(1.5px)',
          animation: `particle-float ${p.duration} linear ${p.delay} infinite alternate`,
        }}
      />
    ))}
    <style>{`
      @keyframes blob {
        0%, 100% { transform: scale(1) translateY(0) translateX(0) rotate(0deg); }
        20% { transform: scale(1.1) translateY(-180px) translateX(120px) rotate(8deg); }
        50% { transform: scale(0.95) translateY(160px) translateX(-180px) rotate(-6deg); }
        75% { transform: scale(1.07) translateY(-90px) translateX(90px) rotate(4deg); }
      }
      @keyframes particle-float {
        0% { transform: translateY(0) scale(1); }
        100% { transform: translateY(-40px) scale(1.15); }
      }
    `}</style>
  </div>
);

export default AnimatedBackground; 