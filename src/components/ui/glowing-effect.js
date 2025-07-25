"use client";

import React, { useRef, useEffect, useState } from "react";

export function GlowingEffect({
  blur = 0,
  borderWidth = 1,
  spread = 80,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
  glowColor = "rgba(59, 130, 246, 0.4)", // Default blue glow
  children,
  className = "",
  ...props
}) {
  const containerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      if (distance <= proximity) {
        setIsHovering(true);
        setMousePosition({ x, y });
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled, proximity]);

  const glowStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "inherit",
    padding: `${borderWidth}px`,
    background: isHovering && glow
      ? `radial-gradient(${spread}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`
      : "transparent",
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    maskComposite: "xor",
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    filter: blur > 0 ? `blur(${blur}px)` : "none",
    opacity: isHovering ? 1 : inactiveZone,
    transition: "opacity 0.3s ease",
    pointerEvents: "none",
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      {...props}
    >
      <div style={glowStyle} />
      {children}
    </div>
  );
} 