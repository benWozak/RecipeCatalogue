import React, { ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
}

const GlobalErrorBoundary: React.FC<Props> = ({ children }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Global error handling logic
    console.error('Global error caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  return (
    <ErrorBoundary level="global" onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default GlobalErrorBoundary;