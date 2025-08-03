import { render, screen, fireEvent } from '@/test/test-utils'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'
import { errorSimulation } from '@/test/test-utils'

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're intentionally causing errors
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })
  
  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <errorSimulation.ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByTestId('no-error')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <errorSimulation.ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('displays the error message when available', () => {
    render(
      <ErrorBoundary>
        <errorSimulation.ThrowingComponent errorMessage="Test error" />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/test error/i)).toBeInTheDocument()
  })

  it('calls custom error handler when provided', () => {
    const mockErrorHandler = vi.fn()
    
    render(
      <ErrorBoundary onError={mockErrorHandler}>
        <errorSimulation.ThrowingComponent errorMessage="Custom handler test" />
      </ErrorBoundary>
    )
    
    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Custom handler test' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  it('provides try again functionality', () => {
    let shouldThrow = true
    const DynamicComponent = () => {
      if (shouldThrow) {
        throw new Error('Dynamic error')
      }
      return <div data-testid="recovered">Recovered</div>
    }
    
    const { rerender } = render(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    
    // Reset the component
    shouldThrow = false
    const tryAgainButton = screen.getByText(/try again/i)
    fireEvent.click(tryAgainButton)
    
    // Re-render with non-throwing component
    rerender(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByTestId('recovered')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <errorSimulation.ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
  })

  it('shows appropriate UI based on error level', () => {
    const { rerender } = render(
      <ErrorBoundary level="global">
        <errorSimulation.ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/application error/i)).toBeInTheDocument()
    
    rerender(
      <ErrorBoundary level="route">
        <errorSimulation.ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/page error/i)).toBeInTheDocument()
    
    rerender(
      <ErrorBoundary level="feature">
        <errorSimulation.ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('provides different action buttons based on error level', () => {
    const { rerender } = render(
      <ErrorBoundary level="global">
        <errorSimulation.ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/refresh page/i)).toBeInTheDocument()
    expect(screen.queryByText(/go home/i)).not.toBeInTheDocument()
    
    rerender(
      <ErrorBoundary level="route">
        <errorSimulation.ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/refresh page/i)).toBeInTheDocument()
    expect(screen.getByText(/go home/i)).toBeInTheDocument()
    
    rerender(
      <ErrorBoundary level="feature">
        <errorSimulation.ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.queryByText(/refresh page/i)).not.toBeInTheDocument()
    expect(screen.getByText(/go home/i)).toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    render(
      <ErrorBoundary>
        <errorSimulation.ThrowingComponent errorMessage="Detailed error with stack" />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/error details/i)).toBeInTheDocument()
    
    // Click to expand details
    fireEvent.click(screen.getByText(/error details/i))
    expect(screen.getByText(/detailed error with stack/i)).toBeInTheDocument()
  })

  it('handles errors in componentDidCatch correctly', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    
    render(
      <ErrorBoundary>
        <errorSimulation.ThrowingComponent errorMessage="componentDidCatch test" />
      </ErrorBoundary>
    )
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.objectContaining({ message: 'componentDidCatch test' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  it('maintains error state until reset', () => {
    let shouldThrow = true
    const DynamicComponent = () => {
      if (shouldThrow) {
        throw new Error('Persistent error')
      }
      return <div data-testid="working">Working</div>
    }
    
    const { rerender } = render(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    
    // Change component to non-throwing version without resetting
    shouldThrow = false
    rerender(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    )
    
    // Should still show error since error boundary hasn't been reset
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.queryByTestId('working')).not.toBeInTheDocument()
  })
})