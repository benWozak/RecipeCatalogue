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

export interface ProgressEvent {
  event_id: string
  phase: string
  status: string
  message: string
  timestamp: number
  datetime: string
  method?: string
  attempt?: number
  total_attempts?: number
  duration_ms?: number
  metadata?: Record<string, any>
  error_details?: string
  suggestions?: string[]
  progress_percent?: number
  estimated_remaining_ms?: number
}

export interface ProgressCallback {
  onProgress?: (event: ProgressEvent) => void
  onComplete?: (data: ParsedRecipe) => void
  onError?: (error: any) => void
}

class ParsingService {
  private baseUrl = `${import.meta.env.VITE_API_URL}/api/parse`

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
      // Direct post/reel/tv URLs (old format)
      /https?:\/\/(?:www\.)?instagram\.com\/p\/[^/?]+/,
      /https?:\/\/(?:www\.)?instagram\.com\/reel\/[^/?]+/,
      /https?:\/\/(?:www\.)?instagram\.com\/tv\/[^/?]+/,
      // User-specific URLs (new format with username in path)
      /https?:\/\/(?:www\.)?instagram\.com\/[^/]+\/(p|reel|tv)\/[^/?]+/,
      // Stories URLs
      /https?:\/\/(?:www\.)?instagram\.com\/stories\/[^/]+\/[^/?]+/,
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

  /**
   * Parse URL with real-time progress streaming using Server-Sent Events
   */
  async parseUrlWithProgress(
    url: string, 
    token: string, 
    callbacks: ProgressCallback,
    collectionId?: string
  ): Promise<void> {
    // Check for EventSource support
    if (typeof EventSource === 'undefined') {
      console.warn('EventSource not supported, falling back to regular parsing')
      // Fallback to regular parsing
      const result = await this.parseUrl(url, token, collectionId)
      if (result.success && result.data) {
        callbacks.onComplete?.(result.data)
      } else {
        callbacks.onError?.(new Error(result.error || 'Parsing failed'))
      }
      return
    }

    try {
      // Start SSE stream
      const streamUrl = `${this.baseUrl}/url/stream`
      const requestBody = JSON.stringify({
        url,
        collection_id: collectionId
      })

      // Make POST request to start streaming
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: requestBody
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      // Handle EventSource manually for better control
      this.handleEventStream(response, callbacks)

    } catch (error) {
      console.error('Failed to start progress stream:', error)
      callbacks.onError?.(error)
    }
  }

  /**
   * Handle Server-Sent Event stream
   */
  private async handleEventStream(response: Response, callbacks: ProgressCallback): Promise<void> {
    if (!response.body) {
      throw new Error('No response body for streaming')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        
        // Process complete events
        const events = buffer.split('\n\n')
        buffer = events.pop() || '' // Keep incomplete event in buffer

        for (const eventData of events) {
          if (eventData.trim()) {
            this.processSSEEvent(eventData, callbacks)
          }
        }
      }
    } catch (error) {
      console.error('Error reading SSE stream:', error)
      callbacks.onError?.(error)
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Process individual SSE event
   */
  private processSSEEvent(eventData: string, callbacks: ProgressCallback): void {
    try {
      // Parse SSE format: "data: {...json...}"
      const lines = eventData.split('\n')
      const dataLine = lines.find(line => line.startsWith('data: '))
      
      if (!dataLine) return

      const jsonData = dataLine.substring(6) // Remove "data: " prefix
      const data = JSON.parse(jsonData)

      // Handle different event types
      if (data.event === 'result') {
        // Final result
        callbacks.onComplete?.(data.data as ParsedRecipe)
      } else if (data.event === 'error') {
        // Error event
        const error = new Error(data.data.message)
        if (data.data.error_type === 'website_protection') {
          (error as any).isWebsiteProtection = true
          (error as any).suggestions = data.data.suggestions
        }
        callbacks.onError?.(error)
      } else {
        // Progress event
        callbacks.onProgress?.(data as ProgressEvent)
      }
    } catch (error) {
      console.error('Error parsing SSE event:', error)
    }
  }

  /**
   * Get active parsing sessions
   */
  async getActiveSessions(token: string): Promise<any> {
    try {
      const response = await this.makeRequest('/progress/sessions', token)
      return await response.json()
    } catch (error) {
      console.error('Failed to get active sessions:', error)
      throw error
    }
  }

  /**
   * Get details of a specific parsing session
   */
  async getSessionDetails(sessionId: string, token: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/progress/session/${sessionId}`, token)
      return await response.json()
    } catch (error) {
      console.error('Failed to get session details:', error)
      throw error
    }
  }
}

export const parsingService = new ParsingService()
export default parsingService