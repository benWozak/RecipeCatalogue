import React from 'react'
import { 
  ParsingProgressState, 
  getPhaseDisplayName, 
  getStatusIcon, 
  getMethodDisplayName,
  formatDuration,
  formatEstimatedTime
} from '../../hooks/useParsingProgress'

interface ProgressDisplayProps {
  progress: ParsingProgressState
  className?: string
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ 
  progress, 
  className = '' 
}) => {
  if (!progress.isActive && !progress.result && !progress.error) {
    return null
  }

  return (
    <div className={`parsing-progress ${className}`}>
      {/* Main Progress Bar */}
      <div className="progress-header">
        <div className="progress-info">
          <h3 className="progress-title">
            {progress.currentPhase ? getPhaseDisplayName(progress.currentPhase) : 'Parsing Recipe'}
          </h3>
          {progress.currentStatus && (
            <span className="progress-status">
              {getStatusIcon(progress.currentStatus)} {progress.currentStatus}
            </span>
          )}
        </div>
        <div className="progress-stats">
          <span className="progress-percent">{progress.progressPercent}%</span>
          {progress.duration > 0 && (
            <span className="progress-duration">{formatDuration(progress.duration)}</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>

      {/* Current Message */}
      {progress.currentMessage && (
        <div className="progress-message">
          {progress.currentMessage}
        </div>
      )}

      {/* Method and Details */}
      {progress.currentMethod && (
        <div className="progress-details">
          <div className="progress-method">
            <strong>Method:</strong> {getMethodDisplayName(progress.currentMethod)}
          </div>
          {progress.estimatedRemainingMs && (
            <div className="progress-estimate">
              <strong>Estimated remaining:</strong> {formatEstimatedTime(progress.estimatedRemainingMs)}
            </div>
          )}
        </div>
      )}

      {/* Fallback Chain Visualization */}
      <FallbackChain progress={progress} />

      {/* Error Display */}
      {progress.error && (
        <ErrorDisplay error={progress.error} suggestions={progress.suggestions} />
      )}

      {/* Suggestions */}
      {progress.suggestions.length > 0 && !progress.error && (
        <SuggestionsList suggestions={progress.suggestions} />
      )}
    </div>
  )
}

interface FallbackChainProps {
  progress: ParsingProgressState
}

const FallbackChain: React.FC<FallbackChainProps> = ({ progress }) => {
  const methods = [
    { key: 'recipe-scrapers', name: 'Recipe Scrapers', icon: '📚' },
    { key: 'manual-http', name: 'Manual Parsing', icon: '🌐' },
    { key: 'browser-automation', name: 'Browser Automation', icon: '🤖' }
  ]

  const getMethodStatus = (methodKey: string) => {
    const events = progress.events.filter(e => e.method === methodKey)
    if (events.length === 0) return 'pending'
    
    const lastEvent = events[events.length - 1]
    if (lastEvent.phase === 'completed') return 'success'
    if (lastEvent.status === 'failed') return 'failed'
    if (progress.currentMethod === methodKey) return 'in_progress'
    return 'completed'
  }

  return (
    <div className="fallback-chain">
      <h4>Parsing Strategy</h4>
      <div className="method-chain">
        {methods.map((method, index) => {
          const status = getMethodStatus(method.key)
          const isActive = progress.currentMethod === method.key
          
          return (
            <React.Fragment key={method.key}>
              <div className={`method-step ${status} ${isActive ? 'active' : ''}`}>
                <div className="method-icon">{method.icon}</div>
                <div className="method-name">{method.name}</div>
                <div className="method-status">{getStatusIcon(status)}</div>
              </div>
              {index < methods.length - 1 && (
                <div className="method-arrow">→</div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

interface ErrorDisplayProps {
  error: Error
  suggestions: string[]
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, suggestions }) => {
  const isWebsiteProtection = (error as any).isWebsiteProtection

  return (
    <div className={`error-display ${isWebsiteProtection ? 'website-protection' : 'general-error'}`}>
      <div className="error-header">
        <span className="error-icon">
          {isWebsiteProtection ? '🛡️' : '❌'}
        </span>
        <span className="error-title">
          {isWebsiteProtection ? 'Website Protection Detected' : 'Parsing Failed'}
        </span>
      </div>
      <div className="error-message">{error.message}</div>
      {suggestions.length > 0 && (
        <SuggestionsList suggestions={suggestions} />
      )}
    </div>
  )
}

interface SuggestionsListProps {
  suggestions: string[]
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({ suggestions }) => {
  if (suggestions.length === 0) return null

  return (
    <div className="suggestions-list">
      <h5>💡 Suggestions:</h5>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </div>
  )
}

export default ProgressDisplay