import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Slightly more lively floating circles
    const circles = [];
    const hues = [195, 180, 210]; // Blue/teal/lavender
    for (let i = 0; i < 8; i++) {
      circles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 38 + 32, // Slightly larger
        speedX: (Math.random() - 0.5) * 0.35, // Still slow
        speedY: (Math.random() - 0.5) * 0.35, // Still slow
        hue: hues[i % hues.length],
        opacity: 0.18 + Math.random() * 0.09 // Slightly more visible
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      circles.forEach(circle => {
        circle.x += circle.speedX;
        circle.y += circle.speedY;
        if (circle.x <= circle.radius || circle.x >= canvas.width - circle.radius) circle.speedX *= -1;
        if (circle.y <= circle.radius || circle.y >= canvas.height - circle.radius) circle.speedY *= -1;
        circle.x = Math.max(circle.radius, Math.min(canvas.width - circle.radius, circle.x));
        circle.y = Math.max(circle.radius, Math.min(canvas.height - circle.radius, circle.y));
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${circle.hue}, 80%, 70%, ${circle.opacity})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticlesBackground;
