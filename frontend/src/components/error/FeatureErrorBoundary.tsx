import React, { ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
  featureName: string;
  fallbackMessage?: string;
}

const FeatureErrorBoundary: React.FC<Props> = ({ 
  children, 
  featureName, 
  fallbackMessage 
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Feature-specific error handling
    console.error(`${featureName} feature error:`, {
      feature: featureName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  const customFallback = (
    <div className="flex min-h-[200px] w-full items-center justify-center p-6 border border-border rounded-lg bg-secondary/20">
      <div className="text-center space-y-3 max-w-sm">
        <div className="text-4xl">⚠️</div>
        
        <h3 className="text-lg font-medium text-foreground">
          {featureName} Unavailable
        </h3>
        
        <p className="text-sm text-muted-foreground">
          {fallbackMessage || `The ${featureName} feature encountered an error and is temporarily unavailable.`}
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      level="feature" 
      onError={handleError}
      fallback={customFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

export default FeatureErrorBoundary;