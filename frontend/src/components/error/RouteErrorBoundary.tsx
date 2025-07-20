import React, { ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useLocation } from 'react-router';

interface Props {
  children: React.ReactNode;
  routeName?: string;
}

const RouteErrorBoundary: React.FC<Props> = ({ children, routeName }) => {
  const location = useLocation();

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Route-specific error handling
    console.error('Route error caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      route: location.pathname,
      routeName,
      timestamp: new Date().toISOString(),
    });
  };

  const customFallback = (
    <div className="flex min-h-[400px] w-full items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">🚧</div>
        
        <h2 className="text-2xl font-semibold text-foreground">
          Page Unavailable
        </h2>
        
        <p className="text-muted-foreground">
          This page encountered an error and couldn't load properly. 
          {routeName && ` The ${routeName} feature is temporarily unavailable.`}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Go Back
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      level="route" 
      onError={handleError}
      fallback={customFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RouteErrorBoundary;