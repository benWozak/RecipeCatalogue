import { renderHook, waitFor } from '@/test/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUser, useUserStats } from '../useUser'
import { mockAuth } from '@/test/test-utils'

// Mock the services
vi.mock('@/services/recipeService', () => ({
  recipeService: {
    getRecipes: vi.fn(),
  },
}))

vi.mock('@/services/mealPlanService', () => ({
  mealPlanService: {
    getMealPlans: vi.fn(),
  },
}))

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}))

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockAuth.signedIn()
    })

    it('returns user data when authenticated', () => {
      const { result } = renderHook(() => useUser())
      
      expect(result.current.user).toEqual(
        expect.objectContaining({
          id: 'test-user-id',
          firstName: 'Test',
          lastName: 'User',
        })
      )
      expect(result.current.isSignedIn).toBe(true)
      expect(result.current.isLoaded).toBe(true)
    })

    it('provides getToken function', async () => {
      const { result } = renderHook(() => useUser())
      
      const token = await result.current.getToken()
      expect(token).toBe('mock-token')
    })

    it('handles token retrieval errors', async () => {
      // Mock getToken to throw an error
      const { useAuth } = await import('@clerk/clerk-react')
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        sessionClaims: {} as any,
        actor: null,
        orgId: 'test-org-id',
        orgRole: 'admin',
        orgSlug: 'test-org',
        has: vi.fn(),
        getToken: vi.fn().mockRejectedValue(new Error('Token error')),
        signOut: vi.fn(),
      })

      const { result } = renderHook(() => useUser())
      
      await expect(result.current.getToken()).rejects.toThrow('Token error')
    })
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockAuth.signedOut()
    })

    it('returns null user when not authenticated', () => {
      const { result } = renderHook(() => useUser())
      
      expect(result.current.user).toBeNull()
      expect(result.current.isSignedIn).toBe(false)
      expect(result.current.isLoaded).toBe(true)
    })

    it('getToken returns null when not authenticated', async () => {
      const { result } = renderHook(() => useUser())
      
      const token = await result.current.getToken()
      expect(token).toBeNull()
    })
  })
})

describe('useUserStats', () => {
  let mockRecipeService: any
  let mockMealPlanService: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock the services after the imports
    mockRecipeService = {
      getRecipes: vi.fn().mockResolvedValue({
        data: { recipes: [{ id: '1' }, { id: '2' }, { id: '3' }] }
      })
    }
    
    mockMealPlanService = {
      getMealPlans: vi.fn().mockResolvedValue({
        data: { meal_plans: [{ id: '1' }, { id: '2' }] }
      })
    }
    
    vi.doMock('@/services/recipeService', () => ({
      recipeService: mockRecipeService
    }))
    
    vi.doMock('@/services/mealPlanService', () => ({
      mealPlanService: mockMealPlanService
    }))
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockAuth.signedIn()
    })

    it('fetches and returns user statistics', async () => {
      const { result } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.data).toEqual({
          recipeCount: 3,
          mealPlanCount: 2,
          memberSince: expect.any(String),
        })
      })
    })

    it('passes auth token to service calls', async () => {
      renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(mockRecipeService.getRecipes).toHaveBeenCalledWith({}, 'mock-token')
        expect(mockMealPlanService.getMealPlans).toHaveBeenCalledWith({}, 'mock-token')
      })
    })

    it('handles API errors gracefully', async () => {
      mockRecipeService.getRecipes.mockRejectedValue(new Error('API Error'))
      
      const { result } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })
    })

    it('handles token retrieval errors', async () => {
      // Mock getToken to return null
      const { useAuth } = await import('@clerk/clerk-react')
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        sessionClaims: {} as any,
        actor: null,
        orgId: 'test-org-id',
        orgRole: 'admin',
        orgSlug: 'test-org',
        has: vi.fn(),
        getToken: vi.fn().mockResolvedValue(null),
        signOut: vi.fn(),
      })

      const { result } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.error).toEqual(
          expect.objectContaining({
            message: 'Unable to get auth token'
          })
        )
      })
    })

    it('handles missing user data', async () => {
      // Mock useUser to return no user
      const { useUser: useClerkUser } = await import('@clerk/clerk-react')
      vi.mocked(useClerkUser).mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      })

      const { result } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.error).toEqual(
          expect.objectContaining({
            message: 'User not authenticated'
          })
        )
      })
    })

    it('handles empty API responses', async () => {
      mockRecipeService.getRecipes.mockResolvedValue({ data: null })
      mockMealPlanService.getMealPlans.mockResolvedValue({ data: null })
      
      const { result } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.data).toEqual({
          recipeCount: 0,
          mealPlanCount: 0,
          memberSince: expect.any(String),
        })
      })
    })

    it('handles missing recipes array in response', async () => {
      mockRecipeService.getRecipes.mockResolvedValue({ 
        data: { recipes: null } 
      })
      mockMealPlanService.getMealPlans.mockResolvedValue({ 
        data: { meal_plans: undefined } 
      })
      
      const { result } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.data).toEqual({
          recipeCount: 0,
          mealPlanCount: 0,
          memberSince: expect.any(String),
        })
      })
    })

    it('formats member since date correctly', async () => {
      const mockDate = new Date('2024-01-15T10:30:00Z')
      const { useUser: useClerkUser } = await import('@clerk/clerk-react')
      vi.mocked(useClerkUser).mockReturnValue({
        user: {
          id: 'test-user-id',
          emailAddresses: [{ 
            emailAddress: 'test@example.com',
            id: 'test-email-id',
            verification: null as any,
            matchesSsoConnection: false,
            linkedTo: [],
            destroy: vi.fn(),
            prepareVerification: vi.fn(),
            attemptVerification: vi.fn(),
            reload: vi.fn(),
            toString: vi.fn(),
            created: false
          } as any],
          firstName: 'Test',
          lastName: 'User',
          createdAt: mockDate,
        } as any,
        isLoaded: true,
        isSignedIn: true,
      })

      const { result } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.data?.memberSince).toBe(mockDate.toLocaleDateString())
      })
    })

    it('handles missing createdAt date', async () => {
      const { useUser: useClerkUser } = await import('@clerk/clerk-react')
      vi.mocked(useClerkUser).mockReturnValue({
        user: {
          id: 'test-user-id',
          emailAddresses: [{ 
            emailAddress: 'test@example.com',
            id: 'test-email-id',
            verification: null as any,
            matchesSsoConnection: false,
            linkedTo: [],
            destroy: vi.fn(),
            prepareVerification: vi.fn(),
            attemptVerification: vi.fn(),
            reload: vi.fn(),
            toString: vi.fn(),
            created: false
          } as any],
          firstName: 'Test',
          lastName: 'User',
          createdAt: null,
        } as any,
        isLoaded: true,
        isSignedIn: true,
      })

      const { result } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.data?.memberSince).toBe('Unknown')
      })
    })
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockAuth.signedOut()
    })

    it('does not fetch data when user is not authenticated', () => {
      const { result } = renderHook(() => useUserStats())
      
      expect(result.current.data).toBeUndefined()
      expect(mockRecipeService.getRecipes).not.toHaveBeenCalled()
      expect(mockMealPlanService.getMealPlans).not.toHaveBeenCalled()
    })

    it('does not fetch data when user is not loaded', async () => {
      const { useUser: useClerkUser } = await import('@clerk/clerk-react')
      vi.mocked(useClerkUser).mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any)

      const { result } = renderHook(() => useUserStats())
      
      expect(result.current.data).toBeUndefined()
      expect(mockRecipeService.getRecipes).not.toHaveBeenCalled()
      expect(mockMealPlanService.getMealPlans).not.toHaveBeenCalled()
    })
  })

  describe('caching and stale time', () => {
    beforeEach(() => {
      mockAuth.signedIn()
    })

    it('uses appropriate stale time for caching', async () => {
      const { result, rerender } = renderHook(() => useUserStats())
      
      await waitFor(() => {
        expect(result.current.data).toBeTruthy()
      })
      
      // Clear mocks and re-render
      mockRecipeService.getRecipes.mockClear()
      mockMealPlanService.getMealPlans.mockClear()
      
      rerender()
      
      // Should not fetch again immediately due to stale time
      expect(mockRecipeService.getRecipes).not.toHaveBeenCalled()
      expect(mockMealPlanService.getMealPlans).not.toHaveBeenCalled()
    })
  })
})