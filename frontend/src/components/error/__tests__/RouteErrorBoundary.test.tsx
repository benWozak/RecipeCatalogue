import { render, screen, fireEvent } from '@/test/test-utils'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import RouteErrorBoundary from '../RouteErrorBoundary'
import { errorSimulation } from '@/test/test-utils'

describe('RouteErrorBoundary', () => {
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
      <RouteErrorBoundary routeName="Test Route">
        <div data-testid="child-component">Child content</div>
      </RouteErrorBoundary>
    )
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument()
  })

  it('renders route error UI when child throws', () => {
    render(
      <RouteErrorBoundary routeName="Test Route">
        <errorSimulation.ThrowingComponent errorMessage="Route test error" />
      </RouteErrorBoundary>
    )
    
    expect(screen.getByText(/page unavailable/i)).toBeInTheDocument()
    expect(screen.getByText(/test route feature is temporarily unavailable/i)).toBeInTheDocument()
  })

  it('renders generic message when no route name provided', () => {
    render(
      <RouteErrorBoundary>
        <errorSimulation.ThrowingComponent />
      </RouteErrorBoundary>
    )
    
    expect(screen.getByText(/page unavailable/i)).toBeInTheDocument()
    expect(screen.getByText(/page encountered an error and couldn't load properly/i)).toBeInTheDocument()
  })

  it('logs error details with route context', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    
    render(
      <RouteErrorBoundary routeName="Test Route">
        <errorSimulation.ThrowingComponent errorMessage="Route test error" />
      </RouteErrorBoundary>,
      { initialEntries: ['/test-route'] }
    )
    
    expect(consoleSpy).toHaveBeenCalledWith('Route error caught:', expect.objectContaining({
      error: 'Route test error',
      routeName: 'Test Route',
      route: '/',
      timestamp: expect.any(String),
    }))
  })

  it('provides refresh page functionality', () => {
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <RouteErrorBoundary>
        <errorSimulation.ThrowingComponent />
      </RouteErrorBoundary>
    )
    
    const refreshButton = screen.getByText(/refresh page/i)
    fireEvent.click(refreshButton)
    expect(mockReload).toHaveBeenCalled()
  })

  it('provides go back functionality', () => {
    const mockBack = vi.fn()
    Object.defineProperty(window, 'history', {
      value: { back: mockBack },
      writable: true,
    })

    render(
      <RouteErrorBoundary>
        <errorSimulation.ThrowingComponent />
      </RouteErrorBoundary>
    )
    
    const backButton = screen.getByText(/go back/i)
    fireEvent.click(backButton)
    expect(mockBack).toHaveBeenCalled()
  })

  it('provides home navigation functionality', () => {
    const originalLocation = window.location
    const mockLocation = {
      ...originalLocation,
      href: '',
    }
    
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    })

    render(
      <RouteErrorBoundary>
        <errorSimulation.ThrowingComponent />
      </RouteErrorBoundary>
    )
    
    const homeButton = screen.getByText(/home/i)
    fireEvent.click(homeButton)
    expect(window.location.href).toBe('/')
    
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  it('handles route changes while in error state', () => {
    const { rerender } = render(
      <RouteErrorBoundary routeName="First Route">
        <errorSimulation.ThrowingComponent />
      </RouteErrorBoundary>,
      { initialEntries: ['/first-route'] }
    )
    
    expect(screen.getByText(/first route feature is temporarily unavailable/i)).toBeInTheDocument()
    
    // Change route while in error state
    rerender(
      <RouteErrorBoundary routeName="Second Route">
        <div>New content</div>
      </RouteErrorBoundary>
    )
    
    // Should still show error since error boundary doesn't reset on prop change
    expect(screen.getByText(/page unavailable/i)).toBeInTheDocument()
  })

  it('uses custom fallback design with proper styling', () => {
    render(
      <RouteErrorBoundary>
        <errorSimulation.ThrowingComponent />
      </RouteErrorBoundary>
    )
    
    // Check for construction emoji
    expect(screen.getByText('🚧')).toBeInTheDocument()
    
    // Check that all action buttons are present
    expect(screen.getByText(/refresh page/i)).toBeInTheDocument()
    expect(screen.getByText(/go back/i)).toBeInTheDocument()
    expect(screen.getByText(/home/i)).toBeInTheDocument()
  })

  it('handles errors in different route contexts', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    
    const { rerender } = render(
      <RouteErrorBoundary routeName="Recipe Details">
        <errorSimulation.ThrowingComponent />
      </RouteErrorBoundary>,
      { initialEntries: ['/recipes/123'] }
    )
    
    expect(consoleSpy).toHaveBeenCalledWith('Route error caught:', expect.objectContaining({
      routeName: 'Recipe Details',
    }))
    
    consoleSpy.mockClear()
    
    rerender(
      <RouteErrorBoundary routeName="Meal Plans">
        <div>Working content</div>
      </RouteErrorBoundary>
    )
    
    // Should not log error for working content
    expect(consoleSpy).not.toHaveBeenCalled()
  })
})