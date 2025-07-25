import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const EnhancedBackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
  variant = "wellness", // wellness, nutrition, energy, calm
}) => {
  // Color psychology variants for health and wellness
  const gradientVariants = {
    wellness: {
      // Warm, trustworthy health colors
      background: "bg-wellness-gradient",
      glow: "from-emerald-400/20 via-blue-400/15 to-amber-300/20",
      accent: "from-emerald-500/30 to-blue-500/30"
    },
    nutrition: {
      // Fresh, organic nutrition colors
      background: "bg-nutrition-gradient", 
      glow: "from-green-400/25 via-lime-300/20 to-emerald-400/25",
      accent: "from-green-500/35 to-lime-500/35"
    },
    energy: {
      // Vibrant, energizing colors
      background: "bg-energy-gradient",
      glow: "from-orange-400/20 via-yellow-300/15 to-red-400/20",
      accent: "from-orange-500/30 to-yellow-500/30"
    },
    calm: {
      // Soothing, peaceful colors
      background: "bg-calm-gradient",
      glow: "from-blue-400/20 via-indigo-300/15 to-purple-400/20",
      accent: "from-blue-500/30 to-indigo-500/30"
    }
  };

  const selectedVariant = gradientVariants[variant];

  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  return (
    <div className={cn("fixed inset-0 w-full h-full", containerClassName)}>
      {/* Main sophisticated gradient background */}
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 20, // Slower, more subtle animation
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 opacity-90",
          selectedVariant.background
        )}
      />

      {/* Sophisticated pattern overlay */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 25%),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.08) 0%, transparent 25%),
              radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.06) 0%, transparent 25%),
              radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.04) 0%, transparent 25%)
            `,
            backgroundSize: '800px 800px, 600px 600px, 1000px 1000px, 400px 400px',
            backgroundPosition: '0% 0%, 100% 100%, 50% 0%, 0% 100%'
          }}
        />
      </div>

      {/* Organic flowing waves */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundImage: `
            linear-gradient(60deg, 
              rgba(34, 197, 94, 0.1) 0%, 
              transparent 25%, 
              rgba(59, 130, 246, 0.08) 50%, 
              transparent 75%, 
              rgba(251, 191, 36, 0.06) 100%
            )
          `,
          backgroundSize: '200% 200%'
        }}
      />

      {/* Subtle mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 400px 300px at 20% 30%, rgba(34, 197, 94, 0.15), transparent),
            radial-gradient(ellipse 600px 400px at 80% 70%, rgba(59, 130, 246, 0.12), transparent),
            radial-gradient(ellipse 300px 200px at 60% 10%, rgba(251, 191, 36, 0.08), transparent),
            radial-gradient(ellipse 500px 350px at 10% 80%, rgba(168, 85, 247, 0.06), transparent),
            linear-gradient(135deg, 
              rgba(248, 250, 252, 0.95) 0%, 
              rgba(241, 245, 249, 0.92) 25%,
              rgba(248, 250, 252, 0.95) 50%,
              rgba(241, 245, 249, 0.92) 75%,
              rgba(248, 250, 252, 0.95) 100%
            )
          `
        }}
      />

      {/* Floating light particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Gentle glow overlay */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-20 blur-3xl",
          selectedVariant.glow
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content layer */}
      <div className={cn("relative z-10 w-full h-full", className)}>
        {children}
      </div>
    </div>
  );
};

// Wellness-themed backdrop component
export const WellnessBackdrop = ({ className }) => (
  <div className={cn("fixed inset-0 pointer-events-none", className)}>
    {/* Organic shape overlays */}
    <div className="absolute top-10 left-10 w-96 h-96 opacity-10">
      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl transform rotate-12" />
    </div>
    <div className="absolute bottom-20 right-20 w-80 h-80 opacity-10">
      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl transform -rotate-12" />
    </div>
    <div className="absolute top-1/3 right-1/4 w-64 h-64 opacity-10">
      <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl transform rotate-45" />
    </div>
  </div>
); 