import React from 'react';

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
    {toasts.map((toast, index) => (
      <div 
        key={toast.id} 
        className={`
          glass-card p-4 text-sm font-medium leading-relaxed relative overflow-hidden 
          pointer-events-auto cursor-pointer transition-all duration-300 ease-in-out
          flex items-center gap-3 animate-slide-in-right shadow-elevated
          hover:shadow-modern-lg hover:-translate-y-1
          ${toast.type === 'success' ? 'border-blue-400/30 bg-blue-500/10 text-blue-200' : ''}
          ${toast.type === 'error' ? 'border-red-400/30 bg-red-500/10 text-red-200' : ''}
          ${toast.type === 'warning' ? 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200' : ''}
          ${toast.type === 'info' ? 'border-primary-400/30 bg-primary-500/10 text-primary-200' : ''}
        `}
        style={{
          zIndex: 1000 - index,
        }}
      >
        {/* Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                        toast.type === 'success' ? 'bg-blue-500/20 text-blue-400' :
          toast.type === 'error' ? 'bg-red-500/20 text-red-400' :
          toast.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-primary-500/20 text-primary-400'
        }`}>
          {toast.type === 'success' ? '✓' : 
           toast.type === 'error' ? '⚠' : 
           toast.type === 'warning' ? '⚠' : 'ℹ'}
        </div>
        
        {/* Message */}
        <span className="flex-1 text-text-primary">{toast.message}</span>
        
        {/* Close Button */}
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-glass-medium transition-all duration-200 ease-in-out"
          onClick={() => removeToast(toast.id)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ))}
  </div>
);

export default ToastContainer; 