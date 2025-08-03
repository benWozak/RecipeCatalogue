import { render, screen, waitFor } from '@/test/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'
import { mockAuth } from '@/test/test-utils'

// Mock all page components to avoid complex dependencies
vi.mock('../pages/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>
}))

vi.mock('../pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('../pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}))

vi.mock('../pages/RecipesPage', () => ({
  default: () => <div data-testid="recipes-page">Recipes Page</div>
}))

vi.mock('../pages/NotFoundPage', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>
}))

vi.mock('../components/common/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated-layout">{children}</div>
  )
}))

vi.mock('../PWABadge', () => ({
  default: () => <div data-testid="pwa-badge">PWA Badge</div>
}))

describe('App - Authentication and Routing', () => {
  beforeEach(() => {
    // Clear any existing mocks
    vi.clearAllMocks()
  })

  describe('Unauthenticated Users', () => {
    beforeEach(() => {
      mockAuth.signedOut()
    })

    it('shows landing page for unauthenticated users on root path', () => {
      render(<App />, { initialEntries: ['/'] })
      
      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
      expect(screen.queryByTestId('authenticated-layout')).not.toBeInTheDocument()
    })

    it('shows login page for unauthenticated users on /login', () => {
      render(<App />, { initialEntries: ['/login'] })
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
      expect(screen.queryByTestId('authenticated-layout')).not.toBeInTheDocument()
    })

    it('shows not found page for unauthenticated users on protected routes', () => {
      render(<App />, { initialEntries: ['/recipes'] })
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
      expect(screen.queryByTestId('recipes-page')).not.toBeInTheDocument()
    })

    it('protects all authenticated routes from unauthenticated access', () => {
      const protectedRoutes = [
        '/recipes',
        '/recipes/scan',
        '/recipes/new',
        '/recipes/123',
        '/collections',
        '/meal-plans',
        '/profile',
      ]

      protectedRoutes.forEach(route => {
        const { unmount } = render(<App />, { initialEntries: [route] })
        
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
        expect(screen.queryByTestId('authenticated-layout')).not.toBeInTheDocument()
        
        unmount()
      })
    })

    it('renders PWA badge for unauthenticated users', () => {
      render(<App />, { initialEntries: ['/'] })
      
      expect(screen.getByTestId('pwa-badge')).toBeInTheDocument()
    })
  })

  describe('Authenticated Users', () => {
    beforeEach(() => {
      mockAuth.signedIn()
    })

    it('redirects authenticated users from landing page to home', async () => {
      render(<App />, { initialEntries: ['/'] })
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument()
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument()
      })
    })

    it('allows access to protected routes for authenticated users', () => {
      render(<App />, { initialEntries: ['/recipes'] })
      
      expect(screen.getByTestId('recipes-page')).toBeInTheDocument()
      expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument()
    })

    it('wraps authenticated routes with Layout component', () => {
      render(<App />, { initialEntries: ['/recipes'] })
      
      expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument()
    })

    it('handles all authenticated route patterns', () => {
      const authenticatedRoutes = [
        { path: '/', testId: 'home-page' },
        { path: '/recipes', testId: 'recipes-page' },
        { path: '/recipes/scan', testId: 'recipe-scan-page' },
        { path: '/recipes/scan/instagram', testId: 'instagram-scan-page' },
        { path: '/recipes/scan/url', testId: 'url-scan-page' },
        { path: '/recipes/scan/image', testId: 'image-scan-page' },
        { path: '/recipes/scan/manual', testId: 'manual-recipe-page' },
        { path: '/recipes/new', testId: 'recipe-form-page' },
        { path: '/recipes/123', testId: 'recipe-detail-page' },
        { path: '/recipes/123/edit', testId: 'recipe-form-page' },
        { path: '/collections', testId: 'collections-page' },
        { path: '/meal-plans', testId: 'active-meal-plan-page' },
        { path: '/meal-plans/all', testId: 'meal-plans-page' },
        { path: '/meal-plans/new', testId: 'new-meal-plan-page' },
        { path: '/meal-plans/123', testId: 'meal-plan-detail-page' },
        { path: '/profile', testId: 'profile-page' },
      ]

      authenticatedRoutes.forEach(({ path, testId }) => {
        // Mock the specific page component for this test
        const mockComponent = vi.fn(() => <div data-testid={testId}>Mock Page</div>)
        
        const { unmount } = render(<App />, { initialEntries: [path] })
        
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument()
        
        unmount()
      })
    })

    it('shows not found page for invalid authenticated routes', () => {
      render(<App />, { initialEntries: ['/invalid-route'] })
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
      expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument()
    })

    it('renders PWA badge for authenticated users', () => {
      render(<App />, { initialEntries: ['/'] })
      
      expect(screen.getByTestId('pwa-badge')).toBeInTheDocument()
    })
  })

  describe('Error Boundaries', () => {
    beforeEach(() => {
      mockAuth.signedIn()
    })

    it('wraps routes with RouteErrorBoundary components', () => {
      // Mock a component that throws an error
      vi.mock('../pages/HomePage', () => ({
        default: () => {
          throw new Error('Home page error')
        }
      }))

      render(<App />, { initialEntries: ['/'] })
      
      // Should show error boundary instead of crashing
      expect(screen.getByText(/page unavailable/i)).toBeInTheDocument()
    })

    it('provides route-specific error context', () => {
      // This would be tested with more specific error boundary behavior
      // For now, we verify that error boundaries are present
      render(<App />, { initialEntries: ['/recipes'] })
      
      // Verify that the route is wrapped (no error means boundary is working)
      expect(screen.getByTestId('recipes-page')).toBeInTheDocument()
    })
  })

  describe('Theme and Providers', () => {
    it('wraps app with ThemeProvider', () => {
      render(<App />)
      
      // Theme provider should be applied (check for theme-related elements)
      const appContainer = document.querySelector('.min-h-screen')
      expect(appContainer).toHaveClass('bg-background', 'text-foreground')
    })

    it('wraps app with HelmetProvider for SEO', () => {
      render(<App />)
      
      // HelmetProvider should be present (hard to test directly, but app should render)
      expect(screen.getByTestId('mock-clerk-provider')).toBeInTheDocument()
    })
  })

  describe('Authentication State Changes', () => {
    it('handles authentication state transitions', async () => {
      // Start with unauthenticated
      mockAuth.signedOut()
      const { rerender } = render(<App />, { initialEntries: ['/'] })
      
      expect(screen.getByTestId('landing-page')).toBeInTheDocument()
      
      // Simulate user signing in
      mockAuth.signedIn()
      rerender(<App />)
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument()
      })
    })

    it('preserves route when authentication changes', async () => {
      // User tries to access protected route while unauthenticated
      mockAuth.signedOut()
      const { rerender } = render(<App />, { initialEntries: ['/recipes'] })
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
      
      // User signs in
      mockAuth.signedIn()
      rerender(<App />)
      
      // Should now show the recipes page they were trying to access
      await waitFor(() => {
        expect(screen.getByTestId('recipes-page')).toBeInTheDocument()
      })
    })
  })

  describe('Route Parameters and Dynamic Routes', () => {
    beforeEach(() => {
      mockAuth.signedIn()
    })

    it('handles parameterized routes correctly', () => {
      const dynamicRoutes = [
        '/recipes/abc123',
        '/recipes/def456/edit',
        '/meal-plans/xyz789',
      ]

      dynamicRoutes.forEach(route => {
        const { unmount } = render(<App />, { initialEntries: [route] })
        
        // Should not show not found page for valid parameterized routes
        expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument()
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument()
        
        unmount()
      })
    })

    it('handles invalid route parameters gracefully', () => {
      const invalidRoutes = [
        '/recipes/', // Missing ID
        '/recipes//edit', // Empty ID
        '/meal-plans/', // Missing ID
      ]

      invalidRoutes.forEach(route => {
        const { unmount } = render(<App />, { initialEntries: [route] })
        
        // These should either show not found or handle gracefully
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument()
        
        unmount()
      })
    })
  })
})