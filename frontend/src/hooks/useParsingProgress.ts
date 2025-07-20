import { useState, useCallback, useRef } from 'react'
import { ProgressEvent, ProgressCallback, ParsedRecipe } from '../services/parsingService'

export interface ParsingProgressState {
  isActive: boolean
  currentPhase: string | null
  currentStatus: string | null
  currentMessage: string | null
  currentMethod: string | null
  progressPercent: number
  estimatedRemainingMs: number | null
  duration: number
  events: ProgressEvent[]
  error: Error | null
  result: ParsedRecipe | null
  suggestions: string[]
  metadata: Record<string, any>
}

export interface ParsingProgressActions {
  startParsing: () => void
  reset: () => void
  addEvent: (event: ProgressEvent) => void
  setError: (error: Error) => void
  setResult: (result: ParsedRecipe) => void
}

const initialState: ParsingProgressState = {
  isActive: false,
  currentPhase: null,
  currentStatus: null,
  currentMessage: null,
  currentMethod: null,
  progressPercent: 0,
  estimatedRemainingMs: null,
  duration: 0,
  events: [],
  error: null,
  result: null,
  suggestions: [],
  metadata: {}
}

export function useParsingProgress(): [ParsingProgressState, ParsingProgressActions] {
  const [state, setState] = useState<ParsingProgressState>(initialState)
  const startTimeRef = useRef<number | null>(null)

  const startParsing = useCallback(() => {
    startTimeRef.current = Date.now()
    setState(prev => ({
      ...initialState,
      isActive: true
    }))
  }, [])

  const reset = useCallback(() => {
    startTimeRef.current = null
    setState(initialState)
  }, [])

  const addEvent = useCallback((event: ProgressEvent) => {
    setState(prev => {
      const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0
      
      return {
        ...prev,
        currentPhase: event.phase,
        currentStatus: event.status,
        currentMessage: event.message,
        currentMethod: event.method || prev.currentMethod,
        progressPercent: event.progress_percent ?? prev.progressPercent,
        estimatedRemainingMs: event.estimated_remaining_ms ?? prev.estimatedRemainingMs,
        duration,
        events: [...prev.events, event],
        suggestions: event.suggestions || [],
        metadata: { ...prev.metadata, ...event.metadata }
      }
    })
  }, [])

  const setError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      isActive: false,
      error,
      suggestions: (error as any).suggestions || []
    }))
  }, [])

  const setResult = useCallback((result: ParsedRecipe) => {
    setState(prev => ({
      ...prev,
      isActive: false,
      result,
      progressPercent: 100
    }))
  }, [])

  return [
    state,
    {
      startParsing,
      reset,
      addEvent,
      setError,
      setResult
    }
  ]
}

export function createProgressCallbacks(
  actions: ParsingProgressActions
): ProgressCallback {
  return {
    onProgress: actions.addEvent,
    onComplete: actions.setResult,
    onError: actions.setError
  }
}

// Utility functions for progress display
export const getPhaseDisplayName = (phase: string): string => {
  const phaseNames: Record<string, string> = {
    'initializing': 'Initializing',
    'rate_limiting': 'Rate Limiting',
    'trying_scrapers': 'Trying Recipe Scrapers',
    'scrapers_failed': 'Recipe Scrapers Failed',
    'trying_manual': 'Manual Parsing',
    'manual_blocked': 'Manual Parsing Blocked',
    'trying_browser': 'Browser Automation',
    'parsing_content': 'Parsing Content',
    'validating': 'Validating Recipe',
    'completed': 'Completed',
    'failed': 'Failed'
  }
  return phaseNames[phase] || phase
}

export const getStatusIcon = (status: string): string => {
  const statusIcons: Record<string, string> = {
    'pending': '⏳',
    'in_progress': '🔄',
    'success': '✅',
    'failed': '❌',
    'skipped': '⏭️',
    'retrying': '🔁'
  }
  return statusIcons[status] || '❓'
}

export const getMethodDisplayName = (method: string | null): string => {
  if (!method) return 'Unknown'
  
  const methodNames: Record<string, string> = {
    'recipe-scrapers': 'Recipe Scrapers Library',
    'manual-http': 'Manual HTTP Request',
    'browser-automation': 'Browser Automation (Playwright)',
  }
  return methodNames[method] || method
}

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

export const formatEstimatedTime = (ms: number | null): string => {
  if (!ms) return 'Unknown'
  return formatDuration(ms)
}