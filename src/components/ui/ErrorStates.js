import React from 'react';
import { 
  WifiOff, 
  AlertTriangle, 
  RefreshCw, 
  Mic, 
  Brain, 
  Settings, 
  HelpCircle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

// Main connection error component
export const ConnectionError = ({ 
  onRetry,
  message = "Connection lost",
  subtitle = "Please check your internet connection and try again",
  className = '' 
}) => (
  <div className={`glass-card-strong padding-component text-center max-w-md mx-auto ${className}`}>
    <div className="relative w-20 h-20 mx-auto mb-6">
      {/* Error icon with animated warning ring */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-white" />
      </div>
      
      {/* Animated warning rings */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-0 border-2 border-red-400 rounded-full opacity-30 animate-ping"
          style={{ 
            animationDelay: `${i * 0.5}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </div>
    
    <h3 className="text-xl font-bold text-slate-900 mb-2">{message}</h3>
    <p className="text-sm text-slate-600 mb-6">{subtitle}</p>
    
    <div className="space-y-3">
      <button
        onClick={onRetry}
        className="w-full btn-primary btn-micro flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
      
      <button className="w-full btn-glass text-sm">
        <Settings className="w-4 h-4 mr-2" />
        Check Settings
      </button>
    </div>
  </div>
);

// Voice/microphone error
export const MicrophoneError = ({ 
  onRetry,
  onUseText,
  message = "Microphone access denied",
  className = '' 
}) => (
  <div className={`glass-card padding-component text-center max-w-md mx-auto ${className}`}>
    <div className="relative w-16 h-16 mx-auto mb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
        <Mic className="w-6 h-6 text-white" />
      </div>
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">!</span>
      </div>
    </div>
    
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{message}</h3>
    <p className="text-sm text-slate-600 mb-4">
      Please allow microphone access to use voice features, or continue with text input.
    </p>
    
    <div className="space-y-2">
      <button
        onClick={onRetry}
        className="w-full btn-secondary btn-micro flex items-center justify-center gap-2"
      >
        <Mic className="w-4 h-4" />
        Allow Microphone
      </button>
      
      <button
        onClick={onUseText}
        className="w-full btn-glass text-sm"
      >
        Continue with Text
      </button>
    </div>
  </div>
);

// AI processing error
export const AIProcessingError = ({ 
  onRetry,
  onReportIssue,
  message = "AI processing failed",
  subtitle = "Something went wrong while processing your request",
  className = '' 
}) => (
  <div className={`glass-card-strong padding-component text-center max-w-md mx-auto ${className}`}>
    <div className="relative w-16 h-16 mx-auto mb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-red-500 rounded-full flex items-center justify-center">
        <Brain className="w-6 h-6 text-white" />
      </div>
      
      {/* Error indicator */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-3 h-3 text-white" />
      </div>
    </div>
    
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{message}</h3>
    <p className="text-sm text-slate-600 mb-4">{subtitle}</p>
    
    <div className="space-y-2">
      <button
        onClick={onRetry}
        className="w-full btn-primary btn-micro flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
      
      <button
        onClick={onReportIssue}
        className="w-full btn-glass text-sm"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Report Issue
      </button>
    </div>
  </div>
);

// Rate limit error
export const RateLimitError = ({ 
  retryAfter = 60,
  onUnderstand,
  className = '' 
}) => (
  <div className={`glass-card padding-component text-center max-w-md mx-auto ${className}`}>
    <div className="relative w-16 h-16 mx-auto mb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
        <Clock className="w-6 h-6 text-white" />
      </div>
    </div>
    
    <h3 className="text-lg font-semibold text-slate-900 mb-2">Service Busy</h3>
    <p className="text-sm text-slate-600 mb-4">
      Too many requests right now. Please wait {retryAfter} seconds and try again.
    </p>
    
    {/* Countdown timer visualization */}
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div 
        className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full animate-pulse"
        style={{ width: '60%' }}
      />
    </div>
    
    <button
      onClick={onUnderstand}
      className="w-full btn-glass"
    >
      I Understand
    </button>
  </div>
);

// Generic error fallback
export const GenericError = ({ 
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  onGoBack,
  className = '' 
}) => (
  <div className={`glass-card-strong padding-component text-center max-w-md mx-auto ${className}`}>
    <div className="relative w-16 h-16 mx-auto mb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-red-500 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-white" />
      </div>
    </div>
    
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-600 mb-4">{message}</p>
    
    <div className="space-y-2">
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full btn-primary btn-micro flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
      
      {onGoBack && (
        <button
          onClick={onGoBack}
          className="w-full btn-glass"
        >
          Go Back
        </button>
      )}
    </div>
  </div>
);

// Inline error message
export const InlineError = ({ 
  message,
  onDismiss,
  type = 'error',
  className = '' 
}) => {
  const typeStyles = {
    error: 'border-red-300 bg-red-50 text-red-700',
    warning: 'border-yellow-300 bg-yellow-50 text-yellow-700',
    info: 'border-blue-300 bg-blue-50 text-blue-700'
  };

  const icons = {
    error: AlertTriangle,
    warning: AlertTriangle,
    info: HelpCircle
  };

  const Icon = icons[type];

  return (
    <div className={`glass-ultra-light border ${typeStyles[type]} rounded-xl p-3 flex items-center gap-3 ${className}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <span className="sr-only">Dismiss</span>
          ×
        </button>
      )}
    </div>
  );
};

// Connection status indicator
export const ConnectionStatus = ({ 
  status = 'connected', // connected, connecting, disconnected, error
  className = '' 
}) => {
  const statusConfig = {
    connected: {
      color: 'text-green-500',
      bg: 'bg-green-100',
      text: 'Connected',
      icon: Shield
    },
    connecting: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-100',
      text: 'Connecting...',
      icon: RefreshCw
    },
    disconnected: {
      color: 'text-gray-500',
      bg: 'bg-gray-100',
      text: 'Disconnected',
      icon: WifiOff
    },
    error: {
      color: 'text-red-500',
      bg: 'bg-red-100',
      text: 'Connection Error',
      icon: AlertTriangle
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${config.bg} ${className}`}>
      <div className="relative">
        <Icon className={`w-4 h-4 ${config.color} ${status === 'connecting' ? 'animate-spin' : ''}`} />
        {status === 'connected' && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
      <span className={`text-xs font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
};

// Error boundary fallback component
export const ErrorBoundaryFallback = ({ 
  error,
  resetError,
  className = '' 
}) => (
  <div className={`min-h-screen flex items-center justify-center p-6 ${className}`}>
    <div className="glass-card-strong padding-component text-center max-w-lg">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
        <Zap className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Oops! Something went wrong</h1>
      <p className="text-slate-600 mb-6">
        The application encountered an unexpected error. This has been logged and we'll look into it.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={resetError}
          className="w-full btn-primary btn-micro flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Application
        </button>
        
        <details className="text-left">
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
            Show error details
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
            {error?.message || 'Unknown error occurred'}
          </pre>
        </details>
      </div>
    </div>
  </div>
); 