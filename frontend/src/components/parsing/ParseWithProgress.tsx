import React, { useState } from 'react'
import { useParsingProgress, createProgressCallbacks } from '../../hooks/useParsingProgress'
import ProgressDisplay from './ProgressDisplay'
import './ProgressDisplay.css'
import parsingService from '../../services/parsingService'

interface ParseWithProgressProps {
  onRecipeParsed?: (recipe: any) => void
  onError?: (error: Error) => void
  className?: string
  collectionId?: string
}

export const ParseWithProgress: React.FC<ParseWithProgressProps> = ({
  onRecipeParsed,
  onError,
  className = '',
  collectionId
}) => {
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, progressActions] = useParsingProgress()

  // Mock token - replace with actual auth token
  const getAuthToken = () => {
    // In a real app, get this from your auth context/store
    return localStorage.getItem('authToken') || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) return
    
    setIsSubmitting(true)
    progressActions.reset()
    progressActions.startParsing()

    try {
      const token = getAuthToken()
      const callbacks = createProgressCallbacks(progressActions)

      // Enhanced callbacks to handle completion
      const enhancedCallbacks = {
        ...callbacks,
        onComplete: (recipe: any) => {
          callbacks.onComplete?.(recipe)
          setIsSubmitting(false)
          onRecipeParsed?.(recipe)
        },
        onError: (error: Error) => {
          callbacks.onError?.(error)
          setIsSubmitting(false)
          onError?.(error)
        }
      }

      await parsingService.parseUrlWithProgress(
        url,
        token,
        enhancedCallbacks,
        collectionId
      )
    } catch (error) {
      console.error('Failed to start parsing:', error)
      progressActions.setError(error as Error)
      setIsSubmitting(false)
      onError?.(error as Error)
    }
  }

  const handleReset = () => {
    setUrl('')
    setIsSubmitting(false)
    progressActions.reset()
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className={`parse-with-progress ${className}`}>
      <form onSubmit={handleSubmit} className="parse-form">
        <div className="form-group">
          <label htmlFor="recipe-url" className="form-label">
            Recipe URL
          </label>
          <div className="input-group">
            <input
              id="recipe-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe"
              className="form-input"
              disabled={isSubmitting}
              required
            />
            <button
              type="submit"
              disabled={!url.trim() || !isValidUrl(url) || isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'Parsing...' : 'Parse Recipe'}
            </button>
          </div>
        </div>
      </form>

      {/* Progress Display */}
      <ProgressDisplay progress={progress} />

      {/* Success/Error Actions */}
      {(progress.result || progress.error) && (
        <div className="result-actions">
          <button 
            onClick={handleReset}
            className="reset-button"
          >
            Parse Another Recipe
          </button>
          
          {progress.result && (
            <div className="success-message">
              ✅ Recipe "{progress.result.title}" parsed successfully!
            </div>
          )}
        </div>
      )}

      {/* Debug Panel (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel progress={progress} />
      )}
    </div>
  )
}

interface DebugPanelProps {
  progress: any
}

const DebugPanel: React.FC<DebugPanelProps> = ({ progress }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!progress.isActive && progress.events.length === 0) {
    return null
  }

  return (
    <div className="debug-panel">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="debug-toggle"
      >
        {isExpanded ? '▼' : '▶'} Debug Info ({progress.events.length} events)
      </button>
      
      {isExpanded && (
        <div className="debug-content">
          <h4>Progress Events</h4>
          <div className="event-list">
            {progress.events.map((event: any, index: number) => (
              <div key={event.event_id} className="debug-event">
                <div className="event-header">
                  <span className="event-index">#{index + 1}</span>
                  <span className="event-phase">{event.phase}</span>
                  <span className="event-status">{event.status}</span>
                  <span className="event-time">
                    {new Date(event.timestamp * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <div className="event-message">{event.message}</div>
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <details className="event-metadata">
                    <summary>Metadata</summary>
                    <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
          
          <div className="debug-state">
            <h4>Current State</h4>
            <pre>{JSON.stringify(progress, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParseWithProgress