import { useCallback } from 'react';
import { useRecipeStore } from '@/stores/recipeStore';

export interface ErrorContext {
  feature?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface ErrorDetails {
  message: string;
  code?: string;
  type: 'network' | 'auth' | 'validation' | 'component' | 'unknown';
  context?: ErrorContext;
  timestamp: string;
}

export const useErrorHandler = () => {
  const { setError } = useRecipeStore();

  const classifyError = useCallback((error: Error | unknown): ErrorDetails['type'] => {
    if (!error) return 'unknown';

    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    // Network errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout')) {
      return 'network';
    }

    // Auth errors
    if (errorMessage.includes('authentication') || 
        errorMessage.includes('unauthorized') || 
        errorMessage.includes('token') ||
        errorMessage.includes('permission')) {
      return 'auth';
    }

    // Validation errors
    if (errorMessage.includes('validation') || 
        errorMessage.includes('invalid') || 
        errorMessage.includes('required') ||
        errorMessage.includes('format')) {
      return 'validation';
    }

    // Component errors (React errors)
    if (errorMessage.includes('component') || 
        errorMessage.includes('render') || 
        errorMessage.includes('hook')) {
      return 'component';
    }

    return 'unknown';
  }, []);

  const getUserFriendlyMessage = useCallback((error: Error | unknown, type: ErrorDetails['type']): string => {
    const baseMessage = error instanceof Error ? error.message : String(error);

    switch (type) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      
      case 'auth':
        return 'Authentication failed. Please sign in again to continue.';
      
      case 'validation':
        return 'Please check your input and try again.';
      
      case 'component':
        return 'A display error occurred. Please refresh the page or try again.';
      
      case 'unknown':
      default:
        // Return original message if it's user-friendly, otherwise generic message
        if (baseMessage.length < 100 && !baseMessage.includes('TypeError') && !baseMessage.includes('ReferenceError')) {
          return baseMessage;
        }
        return 'An unexpected error occurred. Please try again.';
    }
  }, []);

  const handleError = useCallback((
    error: Error | unknown,
    context?: ErrorContext,
    showToUser: boolean = true
  ): ErrorDetails => {
    const type = classifyError(error);
    const message = getUserFriendlyMessage(error, type);
    
    const errorDetails: ErrorDetails = {
      message,
      type,
      context,
      timestamp: new Date().toISOString(),
    };

    // Add error code if available
    if (error instanceof Error && 'code' in error) {
      errorDetails.code = String(error.code);
    }

    // Log error for debugging
    console.error('Error handled:', {
      ...errorDetails,
      originalError: error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Show error to user if requested
    if (showToUser) {
      setError(message);
    }

    return errorDetails;
  }, [classifyError, getUserFriendlyMessage, setError]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    showToUser: boolean = true
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context, showToUser);
      return null;
    }
  }, [handleError]);

  const withErrorBoundary = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    context?: ErrorContext,
    showToUser: boolean = true
  ) => {
    return (...args: T): R | null => {
      try {
        return fn(...args);
      } catch (error) {
        handleError(error, context, showToUser);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    clearError,
    handleAsyncError,
    withErrorBoundary,
    classifyError,
    getUserFriendlyMessage,
  };
};

export default useErrorHandler;