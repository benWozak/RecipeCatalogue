import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Globe, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import parsingService from '@/services/parsingService'

export default function URLScanPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    if (!parsingService.validateWebUrl(url)) {
      setError('Please enter a valid website URL')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await parsingService.parseWebUrl(url, '')
      
      if (result.success && result.data) {
        navigate('/recipes/new', { 
          state: { 
            parsedData: result.data,
            sourceType: 'web'
          } 
        })
      } else {
        setError(result.error || 'Failed to parse recipe from website')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    setError('')
  }

  const isValidUrl = url && parsingService.validateWebUrl(url)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/recipes/scan"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Web Recipe</h1>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Globe size={48} className="mx-auto mb-4 text-blue-500" />
                <h2 className="text-xl font-semibold mb-2">Parse Web Recipe</h2>
                <p className="text-muted-foreground">
                  Enter the URL of a recipe from any website
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="web-url">Website URL</Label>
                  <Input
                    id="web-url"
                    type="url"
                    placeholder="https://example.com/recipe"
                    value={url}
                    onChange={handleUrlChange}
                    className={error ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                  {isValidUrl && !error && (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <CheckCircle size={16} />
                      Valid website URL
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!isValidUrl || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Parsing Recipe...
                    </>
                  ) : (
                    'Parse Recipe'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Supported Websites</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• AllRecipes, Food Network, Bon Appétit</p>
                <p>• Serious Eats, Epicurious, Tasty</p>
                <p>• Personal blogs with recipe cards</p>
                <p>• Most websites with structured recipe data</p>
              </div>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Tip:</strong> Works best with websites that have clear recipe formatting with ingredients and instructions sections.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}