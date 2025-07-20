import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'global' | 'route' | 'feature';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback based on error boundary level
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          level={this.props.level || 'feature'}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  level: 'global' | 'route' | 'feature';
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
  level,
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const getErrorTitle = () => {
    switch (level) {
      case 'global':
        return 'Application Error';
      case 'route':
        return 'Page Error';
      case 'feature':
        return 'Something went wrong';
      default:
        return 'Error';
    }
  };

  const getErrorMessage = () => {
    switch (level) {
      case 'global':
        return 'The application encountered an unexpected error. Please try refreshing the page.';
      case 'route':
        return 'This page encountered an error. You can try going back or refreshing.';
      case 'feature':
        return 'This section encountered an error. You can try again or continue using other features.';
      default:
        return 'An unexpected error occurred.';
    }
  };

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">⚠️</div>
        
        <h2 className="text-2xl font-semibold text-foreground">
          {getErrorTitle()}
        </h2>
        
        <p className="text-muted-foreground">
          {getErrorMessage()}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          
          {level === 'global' || level === 'route' ? (
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Refresh Page
            </button>
          ) : null}
          
          {level !== 'global' ? (
            <button
              onClick={handleGoHome}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Go Home
            </button>
          ) : null}
        </div>
        
        {import.meta.env.DEV && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-4 bg-secondary rounded-md text-xs font-mono overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div className="mt-2">
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;