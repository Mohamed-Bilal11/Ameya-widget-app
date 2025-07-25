import React, { useEffect, useState } from 'react';
import { motion, stagger, useAnimate } from 'framer-motion';
import { cn } from '../../lib/utils';

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  onComplete,
}) => {
  const [scope, animate] = useAnimate();
  const [isVisible, setIsVisible] = useState(false);
  const wordsArray = words.split(' ');

  useEffect(() => {
    if (isVisible) {
      animate(
        'span',
        {
          opacity: 1,
          filter: filter ? 'blur(0px)' : 'none',
        },
        {
          duration: duration ? duration : 1,
          delay: stagger(0.2),
          onComplete: () => {
            if (onComplete) onComplete();
          }
        }
      );
    }
  }, [scope.current, isVisible, animate, duration, filter, onComplete]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="opacity-0"
              style={{
                filter: filter ? 'blur(10px)' : 'none',
              }}
            >
              {word}{' '}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={cn('font-bold', className)}>
      <div className="mt-4">
        <div className="dark:text-white text-black text-2xl leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
}; 