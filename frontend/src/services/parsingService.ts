import { useAuth } from '@clerk/clerk-react'

export interface ParsedRecipe {
  title: string
  description: string
  source_type: string
  source_url: string
  servings?: number
  prep_time?: number
  cook_time?: number
  total_time?: number
  ingredients: string[]
  instructions: {
    steps: string[]
    notes?: string
  }
  confidence_score: number
  media?: {
    type: string
    images?: Array<{
      url: string
      width?: number
      height?: number
    }>
  }
}

export interface ParseResponse {
  success: boolean
  data?: ParsedRecipe
  error?: string
}

class ParsingService {
  private baseUrl = 'http://localhost:8000/api/parsing'

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const { getToken } = useAuth()
    const token = await getToken()
    
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
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response
  }

  async parseInstagramUrl(url: string): Promise<ParseResponse> {
    try {
      const response = await this.makeRequest('/instagram', {
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

  async parseWebUrl(url: string): Promise<ParseResponse> {
    try {
      const response = await this.makeRequest('/url', {
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
        error: error instanceof Error ? error.message : 'Failed to parse web URL'
      }
    }
  }

  async parseImage(file: File): Promise<ParseResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { getToken } = useAuth()
      const token = await getToken()

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