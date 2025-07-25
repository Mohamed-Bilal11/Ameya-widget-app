import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const MovingBorder = ({
  children,
  duration = 2000,
  rx = '8px',
  ry = '8px',
  className,
  containerClassName,
  borderRadius = '1.75rem',
  ...otherProps
}) => {
  return (
    <div
      className={cn(
        'bg-transparent relative text-xl h-16 w-40 flex items-center justify-center border border-transparent',
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: borderRadius }}
      >
        <motion.div
          className="h-full w-full absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(#0ea5e9, #8b5cf6, #06b6d4, #3b82f6, #8b5cf6, #0ea5e9)`,
            borderRadius: borderRadius,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div
        className={cn(
          'w-full h-full flex items-center justify-center bg-slate-900/[0.8] backdrop-blur-xl relative',
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}; 