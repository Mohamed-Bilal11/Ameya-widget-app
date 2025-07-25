import React from 'react';

const StatusSection = ({ status, isRecording }) => {
  // Hide status messages during recording to make UI cleaner
  if (isRecording || status === 'Recording...' || status === 'Ready - Start speaking!') {
    return null;
  }

  return (
    <div className="w-full bg-glass-bg backdrop-blur-lg border-2 border-black border-opacity-30 rounded-2xl shadow-glass-border px-8 py-6 my-4 text-center transition-all duration-300 ease-in-out hover:scale-105 hover:border-opacity-50 hover:shadow-glass-hover relative overflow-hidden">
      <p className="text-base font-medium text-text-primary m-0 leading-relaxed tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out flex items-center justify-center gap-2 before:content-['🎯'] before:text-lg before:animate-pulse before:drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] hover:text-white hover:drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:scale-105">
        {status}
      </p>
    </div>
  );
};

export default StatusSection; 