import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PWABadge from '../PWABadge'

// Mock the virtual:pwa-register/react module
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    offlineReady: [false, vi.fn()],
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }))
}))

describe('PWABadge', () => {
  it('renders nothing when offline is not ready and no refresh needed', () => {
    const { container } = render(<PWABadge />)
    expect(container.firstChild?.firstChild).toBeNull()
  })

  it('shows offline ready message when app is ready for offline use', () => {
    const mockUseRegisterSW = vi.fn(() => ({
      offlineReady: [true, vi.fn()],
      needRefresh: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    }))
    
    vi.doMock('virtual:pwa-register/react', () => ({
      useRegisterSW: mockUseRegisterSW
    }))

    // Re-import the component to pick up the new mock
    delete require.cache[require.resolve('../PWABadge')]
    const PWABadgeWithMock = require('../PWABadge').default
    
    render(<PWABadgeWithMock />)
    expect(screen.getByText(/app ready to work offline/i)).toBeInTheDocument()
  })

  it('shows refresh message when new content is available', () => {
    const mockUpdateServiceWorker = vi.fn()
    const mockUseRegisterSW = vi.fn(() => ({
      offlineReady: [false, vi.fn()],
      needRefresh: [true, vi.fn()],
      updateServiceWorker: mockUpdateServiceWorker,
    }))
    
    vi.doMock('virtual:pwa-register/react', () => ({
      useRegisterSW: mockUseRegisterSW
    }))

    delete require.cache[require.resolve('../PWABadge')]
    const PWABadgeWithMock = require('../PWABadge').default
    
    render(<PWABadgeWithMock />)
    
    expect(screen.getByText(/new content available/i)).toBeInTheDocument()
    expect(screen.getByText(/reload/i)).toBeInTheDocument()
  })

  it('calls updateServiceWorker when reload button is clicked', () => {
    const mockUpdateServiceWorker = vi.fn()
    const mockUseRegisterSW = vi.fn(() => ({
      offlineReady: [false, vi.fn()],
      needRefresh: [true, vi.fn()],
      updateServiceWorker: mockUpdateServiceWorker,
    }))
    
    vi.doMock('virtual:pwa-register/react', () => ({
      useRegisterSW: mockUseRegisterSW
    }))

    delete require.cache[require.resolve('../PWABadge')]
    const PWABadgeWithMock = require('../PWABadge').default
    
    render(<PWABadgeWithMock />)
    
    const reloadButton = screen.getByText(/reload/i)
    fireEvent.click(reloadButton)
    
    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('has proper accessibility attributes', () => {
    const mockUseRegisterSW = vi.fn(() => ({
      offlineReady: [true, vi.fn()],
      needRefresh: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    }))
    
    vi.doMock('virtual:pwa-register/react', () => ({
      useRegisterSW: mockUseRegisterSW
    }))

    delete require.cache[require.resolve('../PWABadge')]
    const PWABadgeWithMock = require('../PWABadge').default
    
    render(<PWABadgeWithMock />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByLabelText(/toast-message/i)).toBeInTheDocument()
  })
})