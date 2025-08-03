import { render, screen, fireEvent } from '@/test/test-utils'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import GlobalErrorBoundary from '../GlobalErrorBoundary'
import { errorSimulation } from '@/test/test-utils'

describe('GlobalErrorBoundary', () => {
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
      <GlobalErrorBoundary>
        <div data-testid="child-component">Child content</div>
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument()
  })

  it('renders global error UI when child throws', () => {
    render(
      <GlobalErrorBoundary>
        <errorSimulation.ThrowingComponent errorMessage="Global test error" />
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByText(/application error/i)).toBeInTheDocument()
    expect(screen.getByText(/application encountered an unexpected error/i)).toBeInTheDocument()
  })

  it('logs error details with global context', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    
    render(
      <GlobalErrorBoundary>
        <errorSimulation.ThrowingComponent errorMessage="Global test error" />
      </GlobalErrorBoundary>
    )
    
    expect(consoleSpy).toHaveBeenCalledWith('Global error caught:', expect.objectContaining({
      error: 'Global test error',
      timestamp: expect.any(String),
      userAgent: expect.any(String),
      url: expect.any(String),
    }))
  })

  it('provides refresh page button', () => {
    // Mock window.location.reload
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <GlobalErrorBoundary>
        <errorSimulation.ThrowingComponent />
      </GlobalErrorBoundary>
    )
    
    const refreshButton = screen.getByText(/refresh page/i)
    expect(refreshButton).toBeInTheDocument()
    
    fireEvent.click(refreshButton)
    expect(mockReload).toHaveBeenCalled()
  })

  it('does not show go home button for global errors', () => {
    render(
      <GlobalErrorBoundary>
        <errorSimulation.ThrowingComponent />
      </GlobalErrorBoundary>
    )
    
    expect(screen.queryByText(/go home/i)).not.toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    render(
      <GlobalErrorBoundary>
        <errorSimulation.ThrowingComponent errorMessage="Detailed error message" />
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByText(/error details/i)).toBeInTheDocument()
    expect(screen.getByText(/detailed error message/i)).toBeInTheDocument()
  })

  it('handles multiple consecutive errors', () => {
    const { rerender } = render(
      <GlobalErrorBoundary>
        <div data-testid="working">Working</div>
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByTestId('working')).toBeInTheDocument()
    
    // Cause first error
    rerender(
      <GlobalErrorBoundary>
        <errorSimulation.ThrowingComponent errorMessage="First error" />
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByText(/application error/i)).toBeInTheDocument()
    
    // Reset and cause second error
    const resetButton = screen.getByText(/try again/i)
    fireEvent.click(resetButton)
    
    rerender(
      <GlobalErrorBoundary>
        <errorSimulation.ThrowingComponent errorMessage="Second error" />
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByText(/application error/i)).toBeInTheDocument()
  })

  it('preserves error boundary state across re-renders of children', () => {
    let shouldThrow = false
    
    const DynamicComponent = () => {
      if (shouldThrow) {
        throw new Error('Dynamic error')
      }
      return <div data-testid="dynamic">Dynamic content</div>
    }
    
    const { rerender } = render(
      <GlobalErrorBoundary>
        <DynamicComponent />
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByTestId('dynamic')).toBeInTheDocument()
    
    // Trigger error
    shouldThrow = true
    rerender(
      <GlobalErrorBoundary>
        <DynamicComponent />
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByText(/application error/i)).toBeInTheDocument()
    
    // Component should stay in error state even with different children
    shouldThrow = false
    rerender(
      <GlobalErrorBoundary>
        <div>Different content</div>
      </GlobalErrorBoundary>
    )
    
    expect(screen.getByText(/application error/i)).toBeInTheDocument()
  })
})