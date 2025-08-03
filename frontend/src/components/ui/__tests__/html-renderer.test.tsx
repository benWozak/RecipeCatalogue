import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HtmlRenderer, SafeHtmlRenderer } from '../html-renderer'

describe('HtmlRenderer', () => {
  it('renders safe HTML content', () => {
    const safeHtml = '<p>This is <strong>safe</strong> content</p>'
    render(<HtmlRenderer content={safeHtml} />)
    
    expect(screen.getByText(/this is/i)).toBeInTheDocument()
    expect(screen.getByText(/safe/i)).toBeInTheDocument()
  })

  it('sanitizes malicious script tags', () => {
    const maliciousHtml = '<p>Safe content</p><script>alert("xss")</script>'
    render(<HtmlRenderer content={maliciousHtml} />)
    
    expect(screen.getByText(/safe content/i)).toBeInTheDocument()
    // Script tag should be removed by DOMPurify
    expect(screen.queryByText(/alert/)).not.toBeInTheDocument()
  })

  it('preserves allowed HTML tags', () => {
    const htmlWithAllowedTags = '<h1>Heading</h1><p>Paragraph with <em>emphasis</em> and <strong>strong</strong></p><ul><li>List item</li></ul>'
    render(<HtmlRenderer content={htmlWithAllowedTags} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/paragraph with/i)).toBeInTheDocument()
    expect(screen.getByText(/list item/i)).toBeInTheDocument()
  })

  it('removes dangerous attributes', () => {
    const htmlWithDangerousAttrs = '<p onclick="alert(\'xss\')">Click me</p>'
    const { container } = render(<HtmlRenderer content={htmlWithDangerousAttrs} />)
    
    expect(screen.getByText(/click me/i)).toBeInTheDocument()
    // onclick attribute should be removed
    const paragraph = container.querySelector('p')
    expect(paragraph?.getAttribute('onclick')).toBeNull()
  })
})

describe('SafeHtmlRenderer', () => {
  it('only allows specified tags', () => {
    const html = '<h1>Heading</h1><p>Paragraph</p><script>alert("xss")</script>'
    const allowedTags: string[] = ['p']
    
    render(<SafeHtmlRenderer content={html} allowedTags={allowedTags} />)
    
    expect(screen.getByText(/paragraph/i)).toBeInTheDocument()
    // h1 and script should be removed since only 'p' is allowed
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByText(/alert/)).not.toBeInTheDocument()
  })

  it('handles empty content', () => {
    const { container } = render(<SafeHtmlRenderer content="" />)
    
    // Should render without crashing
    expect(container.firstChild).toBeInTheDocument()
  })

  it('preserves text content when tags are stripped', () => {
    const html = '<script>alert("xss")</script>Safe text<div>More text</div>'
    const allowedTags: string[] = [] // No tags allowed
    
    render(<SafeHtmlRenderer content={html} allowedTags={allowedTags} />)
    
    // Text content should be preserved even when tags are stripped
    expect(screen.getByText(/safe text/i)).toBeInTheDocument()
    expect(screen.getByText(/more text/i)).toBeInTheDocument()
  })
})