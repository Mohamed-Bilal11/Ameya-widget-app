import React, { useEffect, useRef } from 'react';

const VoiceButtonParticles = ({ isActive, isListening }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Particle class
    class Particle {
      constructor() {
        this.reset();
        this.age = Math.random() * this.maxAge;
      }

      reset() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 20;
        this.x = centerX + Math.cos(angle) * distance;
        this.y = centerY + Math.sin(angle) * distance;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.maxAge = 80 + Math.random() * 40;
        this.age = 0;
        this.size = 1 + Math.random() * 1.5;
        this.hue = isListening ? 200 + Math.random() * 40 : 240 + Math.random() * 40;
      }

      update() {
        this.age++;
        this.x += this.vx;
        this.y += this.vy;
        
        // Gentle drift towards center
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        this.vx += dx * 0.0002;
        this.vy += dy * 0.0002;

        if (this.age >= this.maxAge) {
          this.reset();
        }
      }

      draw(ctx) {
        const life = 1 - (this.age / this.maxAge);
        const alpha = life * 0.4;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Create subtle gradient for particle
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2.5
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 60%, 65%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 60%, 65%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * life, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Initialize particles
    const particleCount = isActive ? 20 : 8;
    while (particlesRef.current.length < particleCount) {
      particlesRef.current.push(new Particle());
    }
    while (particlesRef.current.length > particleCount) {
      particlesRef.current.pop();
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isListening]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default VoiceButtonParticles; 