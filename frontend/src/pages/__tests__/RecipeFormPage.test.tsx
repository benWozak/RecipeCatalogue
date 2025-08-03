import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RecipeFormPage from '../RecipeFormPage'
import { mockAuth, formUtils } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

// Mock the hooks
vi.mock('@/hooks/useRecipes', () => ({
  useRecipe: vi.fn(),
  useCreateRecipe: vi.fn(),
  useUpdateRecipe: vi.fn(),
}))

vi.mock('@/hooks/useCollections', () => ({
  useCollections: vi.fn(),
  useCreateCollection: vi.fn(),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useParams: vi.fn(() => ({})),
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ state: {} })),
  }
})

// Import the mocked hooks for use in tests
import { useRecipe, useCreateRecipe, useUpdateRecipe } from '@/hooks/useRecipes'
import { useCollections } from '@/hooks/useCollections'
import { useParams, useNavigate, useLocation } from 'react-router'

describe('RecipeFormPage', () => {
  const mockCreateRecipe = vi.fn()
  const mockUpdateRecipe = vi.fn()
  const mockNavigate = vi.fn()

  beforeEach(() => {
    mockAuth.signedIn()
    
    vi.mocked(useRecipe).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      refetch: vi.fn(),
      status: 'idle'
    } as any)
    
    vi.mocked(useCreateRecipe).mockReturnValue({
      mutateAsync: mockCreateRecipe,
      isPending: false,
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isIdle: false,
      isSuccess: false,
      mutate: vi.fn(),
      reset: vi.fn(),
      status: 'idle'
    } as any)
    
    vi.mocked(useUpdateRecipe).mockReturnValue({
      mutateAsync: mockUpdateRecipe,
      isPending: false,
      data: undefined,
      error: null,
      variables: undefined,
      isError: false,
      isIdle: false,
      isSuccess: false,
      mutate: vi.fn(),
      reset: vi.fn(),
      status: 'idle'
    } as any)
    
    vi.mocked(useCollections).mockReturnValue({
      collections: [],
      isLoading: false,
      error: null,
    })
    
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    
    mockCreateRecipe.mockClear()
    mockUpdateRecipe.mockClear()
    mockNavigate.mockClear()
  })

  it('renders recipe form with all required fields', () => {
    render(<RecipeFormPage />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prep time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cook time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/servings/i)).toBeInTheDocument()
    expect(screen.getByText(/ingredients/i)).toBeInTheDocument()
    expect(screen.getByText(/instructions/i)).toBeInTheDocument()
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    const submitButton = screen.getByRole('button', { name: /save recipe/i })
    await user.click(submitButton)
    
    // Should show validation errors for required fields
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })
    
    expect(mockCreateRecipe).not.toHaveBeenCalled()
  })

  it('sanitizes HTML input in title and description', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    
    // Test XSS inputs
    await user.type(titleInput, formUtils.xssInputs[0]) // <script>alert("xss")</script>
    await user.type(descriptionInput, formUtils.xssInputs[2]) // <img src="x" onerror="alert('xss')">
    
    // Fill other required fields
    await user.type(screen.getByLabelText(/prep time/i), '30')
    await user.type(screen.getByLabelText(/cook time/i), '45')
    await user.type(screen.getByLabelText(/servings/i), '4')
    
    const submitButton = screen.getByRole('button', { name: /save recipe/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.not.stringContaining('<script>'),
          description: expect.not.stringContaining('<img'),
        })
      )
    })
  })

  it('validates numeric inputs for time and servings', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe')
    await user.type(screen.getByLabelText(/prep time/i), 'invalid')
    await user.type(screen.getByLabelText(/cook time/i), '-10')
    await user.type(screen.getByLabelText(/servings/i), '0')
    
    const submitButton = screen.getByRole('button', { name: /save recipe/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/prep time must be a positive number/i)).toBeInTheDocument()
      expect(screen.getByText(/cook time must be a positive number/i)).toBeInTheDocument()
      expect(screen.getByText(/servings must be at least 1/i)).toBeInTheDocument()
    })
  })

  it('handles SQL injection attempts in form fields', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    const titleInput = screen.getByLabelText(/title/i)
    
    // Test SQL injection inputs
    for (const sqlInput of formUtils.sqlInjectionInputs) {
      await user.clear(titleInput)
      await user.type(titleInput, sqlInput)
      
      // Should not contain SQL injection patterns
      expect((titleInput as HTMLInputElement).value).not.toContain('DROP TABLE')
      expect((titleInput as HTMLInputElement).value).not.toContain('--')
    }
  })

  it('validates URL format for source URL', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe')
    
    const sourceUrlInput = screen.getByLabelText(/source url/i)
    await user.type(sourceUrlInput, 'not-a-valid-url')
    
    const submitButton = screen.getByRole('button', { name: /save recipe/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument()
    })
  })

  it('prevents submission with malicious URLs', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe')
    
    const maliciousUrls = [
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'vbscript:msgbox("xss")', // cspell:disable-line
    ]
    
    for (const url of maliciousUrls) {
      const sourceUrlInput = screen.getByLabelText(/source url/i)
      await user.clear(sourceUrlInput)
      await user.type(sourceUrlInput, url)
      
      const submitButton = screen.getByRole('button', { name: /save recipe/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument()
      })
    }
  })

  it('sanitizes rich text content in instructions', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe')
    
    // Find the rich text editor for instructions
    const instructionsEditor = screen.getByTestId('instructions-editor') || 
                              screen.getByRole('textbox', { name: /instructions/i })
    
    // Simulate pasting malicious content
    const maliciousContent = '<script>alert("xss")</script><p>Valid instruction</p>'
    fireEvent.change(instructionsEditor, { target: { value: maliciousContent } })
    
    const submitButton = screen.getByRole('button', { name: /save recipe/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          instructions: expect.objectContaining({
            content: expect.not.stringContaining('<script>')
          })
        })
      )
    })
  })

  it('validates tag names for special characters', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe')
    
    // Add a tag with special characters
    const tagInput = screen.getByPlaceholderText(/add tag/i)
    await user.type(tagInput, '<script>tag</script>')
    await user.keyboard('{Enter}')
    
    // Tag should be sanitized
    expect(screen.queryByText(/<script>/)).not.toBeInTheDocument()
  })

  it('handles form submission errors gracefully', async () => {
    const user = userEvent.setup()
    mockCreateRecipe.mockRejectedValue(new Error('Server error'))
    
    render(<RecipeFormPage />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe')
    await user.type(screen.getByLabelText(/prep time/i), '30')
    await user.type(screen.getByLabelText(/cook time/i), '45')
    await user.type(screen.getByLabelText(/servings/i), '4')
    
    const submitButton = screen.getByRole('button', { name: /save recipe/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/error saving recipe/i)).toBeInTheDocument()
    })
  })

  it('prevents double submission', async () => {
    const user = userEvent.setup()
    mockCreateRecipe.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<RecipeFormPage />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Recipe')
    await user.type(screen.getByLabelText(/prep time/i), '30')
    await user.type(screen.getByLabelText(/cook time/i), '45')
    await user.type(screen.getByLabelText(/servings/i), '4')
    
    const submitButton = screen.getByRole('button', { name: /save recipe/i })
    
    // Click submit multiple times rapidly
    await user.click(submitButton)
    await user.click(submitButton)
    await user.click(submitButton)
    
    // Should only call create once
    expect(mockCreateRecipe).toHaveBeenCalledTimes(1)
    
    // Button should be disabled during submission
    expect(submitButton).toBeDisabled()
  })

  it('populates form with parsed recipe data', () => {
    const parsedData = {
      title: 'Parsed Recipe',
      description: 'Parsed description',
      prep_time: 20,
      cook_time: 30,
      servings: 6,
      ingredients: { content: 'Parsed ingredients' },
      instructions: { content: 'Parsed instructions' },
    }
    
    vi.mocked(useLocation).mockReturnValue({
      state: { parsedData },
      key: 'test-key',
      pathname: '/recipe/new',
      search: '',
      hash: ''
    })
    
    render(<RecipeFormPage />)
    
    expect(screen.getByDisplayValue('Parsed Recipe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Parsed description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('20')).toBeInTheDocument()
    expect(screen.getByDisplayValue('30')).toBeInTheDocument()
    expect(screen.getByDisplayValue('6')).toBeInTheDocument()
  })

  it('handles edit mode correctly', () => {
    vi.mocked(useParams).mockReturnValue({ id: '123' })
    vi.mocked(useRecipe).mockReturnValue({
      data: {
        id: '123',
        title: 'Existing Recipe',
        description: 'Existing description',
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        ingredients: { content: 'Existing ingredients' },
        instructions: { content: 'Existing instructions' },
        tags: [{ id: 'tag-1', name: 'dinner', color: 'blue' }],
        user_id: 'test-user-id',
        source_type: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
    } as any)
    
    render(<RecipeFormPage />)
    
    expect(screen.getByDisplayValue('Existing Recipe')).toBeInTheDocument()
    expect(screen.getByText(/update recipe/i)).toBeInTheDocument()
  })

  it('validates file uploads for security', async () => {
    const user = userEvent.setup()
    render(<RecipeFormPage />)
    
    const fileInput = screen.getByLabelText(/upload image/i)
    
    // Test invalid file types
    const maliciousFile = new File(['<script>alert("xss")</script>'], 'malicious.html', {
      type: 'text/html',
    })
    
    await user.upload(fileInput, maliciousFile)
    
    await waitFor(() => {
      expect(screen.getByText(/only image files are allowed/i)).toBeInTheDocument()
    })
  })
})