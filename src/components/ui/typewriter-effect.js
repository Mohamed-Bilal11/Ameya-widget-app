"use client";

import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const spans = entry.target.querySelectorAll('span[data-char]');
            spans.forEach((span, index) => {
              setTimeout(() => {
                span.style.opacity = '1';
                span.style.display = 'inline-block';
                span.style.width = 'fit-content';
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const renderWords = () => {
    return (
      <div ref={containerRef} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  data-char="true"
                  className={cn(
                    `dark:text-white text-black opacity-0 hidden transition-all duration-300 ease-in-out`,
                    word.className
                  )}
                  style={{ opacity: 0, display: 'none' }}
                >
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine all words into a single text string with proper styling info
  const fullText = words.map(word => word.text).join(' ');
  
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 60); // 60ms per character for smooth typing
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, fullText]);

  // Create styled text based on original word boundaries
  const renderStyledText = () => {
    let charIndex = 0;
    return words.map((word, wordIdx) => {
      const wordStart = charIndex;
      const wordEnd = charIndex + word.text.length;
      charIndex += word.text.length + (wordIdx < words.length - 1 ? 1 : 0); // +1 for space
      
      // Check if this word should be displayed (partially or fully)
      if (wordStart >= displayedText.length) {
        return null; // Word hasn't started typing yet
      }
      
      const visibleChars = Math.min(word.text.length, displayedText.length - wordStart);
      const visibleText = word.text.slice(0, visibleChars);
      
      return (
        <span key={wordIdx} className={cn("text-slate-900", word.className)}>
          {visibleText}
          {wordIdx < words.length - 1 && visibleChars === word.text.length && wordEnd < displayedText.length ? ' ' : ''}
        </span>
      );
    });
  };

  return (
    <div className={cn("flex items-center justify-center my-6 w-full", className)}>
      <div className="flex items-center">
        <div className={cn("text-lg sm:text-xl font-bold text-slate-900", className)}>
          {renderStyledText()}
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={cn(
            "ml-1 inline-block rounded-sm w-[2px] h-5 bg-blue-500",
            cursorClassName
          )}
        />
      </div>
    </div>
  );
}; 