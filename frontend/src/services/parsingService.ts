// Remove useAuth import since we'll pass the token from components

export interface ParsedRecipe {
  title: string
  description: string
  source_type: string
  source_url: string
  servings?: number
  prep_time?: number
  cook_time?: number
  total_time?: number
  ingredients: string  // HTML formatted ingredients (e.g., "<ul><li>ingredient</li></ul>")
  instructions: string  // HTML formatted instructions (e.g., "<ol><li>step</li></ol>")
  confidence_score: number
  media?: {
    images?: string[] | Array<{
      url: string
      width?: number
      height?: number
      type?: 'image' | 'thumbnail'
      source?: string
      alt?: string
      video_url?: string
      video_duration?: number
    }>
    is_video?: boolean
    video_url?: string
    video_duration?: number
    stored_media?: {
      media_id: string
      thumbnails: {
        small?: string
        medium?: string
        large?: string
      }
      original?: string
    }
  }
}

export interface ParseResponse {
  success: boolean
  data?: ParsedRecipe
  error?: string
  errorType?: 'website_protection' | 'not_found' | 'timeout' | 'generic'
  suggestions?: string[]
}

class ParsingService {
  private baseUrl = 'http://localhost:8000/api/parse'

  private async makeRequest(endpoint: string, token: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // For 403 errors, check if it's a structured website protection error
      if (response.status === 403 && errorData.detail?.error_type === 'website_protection') {
        const error = new Error(errorData.detail.message) as any
        error.isWebsiteProtection = true
        error.suggestions = errorData.detail.suggestions
        throw error
      }
      
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response
  }

  async parseInstagramUrl(url: string, token: string): Promise<ParseResponse> {
    try {
      const response = await this.makeRequest('/instagram', token, {
        method: 'POST',
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      return {
        success: true,
        data: data as ParsedRecipe
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse Instagram URL'
      }
    }
  }

  async parseWebUrl(url: string, token: string): Promise<ParseResponse> {
    try {
      const response = await this.makeRequest('/url', token, {
        method: 'POST',
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      return {
        success: true,
        data: data as ParsedRecipe
      }
    } catch (error: any) {
      // Check if it's a website protection error
      if (error.isWebsiteProtection) {
        return {
          success: false,
          error: error.message,
          errorType: 'website_protection',
          suggestions: error.suggestions || []
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse web URL',
        errorType: 'generic'
      }
    }
  }

  async parseImage(file: File, token: string): Promise<ParseResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${this.baseUrl}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data as ParsedRecipe
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse image'
      }
    }
  }

  validateInstagramUrl(url: string): boolean {
    const patterns = [
      /https?:\/\/(?:www\.)?instagram\.com\/p\/[^/?]+/,
      /https?:\/\/(?:www\.)?instagram\.com\/reel\/[^/?]+/,
      /https?:\/\/(?:www\.)?instagram\.com\/tv\/[^/?]+/,
    ]
    
    return patterns.some(pattern => pattern.test(url))
  }

  validateWebUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }
}

export const parsingService = new ParsingService()
export default parsingService