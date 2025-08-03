import { cn } from '@/lib/utils'
import DOMPurify from 'dompurify'

interface HtmlRendererProps {
  content: string
  className?: string
}

export function HtmlRenderer({ content, className }: HtmlRendererProps) {
  // Sanitize HTML using DOMPurify to prevent XSS attacks
  const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'br', 'span'],
      ALLOWED_ATTR: ['class'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    })
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
        // Use the same list styling as the rich text editor
        '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-3',
        '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-3',
        '[&_li]:mb-1',
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
  // Use DOMPurify for comprehensive HTML sanitization
  const sanitizeWithCustomTags = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['class'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    })
  }

  const cleanContent = sanitizeWithCustomTags(content)

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