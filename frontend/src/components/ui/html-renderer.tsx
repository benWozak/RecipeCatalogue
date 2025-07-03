import { cn } from '@/lib/utils'

interface HtmlRendererProps {
  content: string
  className?: string
}

export function HtmlRenderer({ content, className }: HtmlRendererProps) {
  // Basic HTML sanitization - in production, consider using a library like DOMPurify
  const sanitizeHtml = (html: string): string => {
    // For now, we trust our own HTML since it comes from our controlled rich text editor
    // In production, you might want to add DOMPurify for additional security
    return html
  }

  const sanitizedContent = sanitizeHtml(content)

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:text-foreground prose-p:text-foreground',
        'prose-strong:text-foreground prose-em:text-foreground',
        'prose-ul:text-foreground prose-ol:text-foreground',
        'prose-li:text-foreground',
        'prose-h1:text-xl prose-h1:font-bold prose-h1:mb-3',
        'prose-h2:text-lg prose-h2:font-semibold prose-h2:mb-2',
        'prose-h3:text-base prose-h3:font-medium prose-h3:mb-2',
        'prose-ul:list-disc prose-ul:pl-6',
        'prose-ol:list-decimal prose-ol:pl-6',
        'prose-li:mb-1',
        'prose-p:mb-2',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}

// Alternative safer version using React's built-in HTML parsing
interface SafeHtmlRendererProps {
  content: string
  className?: string
  allowedTags?: string[]
}

export function SafeHtmlRenderer({ 
  content, 
  className,
  allowedTags = ['p', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'br']
}: SafeHtmlRendererProps) {
  // This is a basic implementation - in production, use a proper HTML sanitizer
  const stripDisallowedTags = (html: string): string => {
    // Simple regex-based cleaning (not comprehensive - use DOMPurify in production)
    const allowedTagsRegex = new RegExp(`</?(?:${allowedTags.join('|')})[^>]*>`, 'gi')
    const cleanHtml = html.replace(/<[^>]*>/g, (match) => {
      return allowedTagsRegex.test(match) ? match : ''
    })
    
    return cleanHtml
  }

  const cleanContent = stripDisallowedTags(content)

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:text-foreground prose-p:text-foreground',
        'prose-strong:text-foreground prose-em:text-foreground',
        'prose-ul:text-foreground prose-ol:text-foreground',
        'prose-li:text-foreground',
        'prose-h1:text-xl prose-h1:font-bold prose-h1:mb-3',
        'prose-h2:text-lg prose-h2:font-semibold prose-h2:mb-2',
        'prose-h3:text-base prose-h3:font-medium prose-h3:mb-2',
        'prose-ul:list-disc prose-ul:pl-6',
        'prose-ol:list-decimal prose-ol:pl-6',
        'prose-li:mb-1',
        'prose-p:mb-2',
        className
      )}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  )
}