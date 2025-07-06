import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Globe, AlertCircle, CheckCircle, Loader2, Shield, Camera, FileText, ExternalLink } from 'lucide-react'
import parsingService from '@/services/parsingService'

export default function URLScanPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [websiteProtectionError, setWebsiteProtectionError] = useState<{
    message: string
    suggestions: string[]
  } | null>(null)
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setWebsiteProtectionError(null)
    
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
      const token = await getToken()
      if (!token) {
        setError('Authentication required')
        return
      }
      
      const result = await parsingService.parseWebUrl(url, token)
      
      if (result.success && result.data) {
        navigate('/recipes/new', { 
          state: { 
            parsedData: result.data,
            sourceType: 'web'
          } 
        })
      } else if (result.errorType === 'website_protection') {
        setWebsiteProtectionError({
          message: result.error || 'This website blocks automated access',
          suggestions: result.suggestions || []
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
    setWebsiteProtectionError(null)
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

          {/* Website Protection Error Message */}
          {websiteProtectionError && (
            <Card className="mt-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                      Website Protection Detected
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300 mb-4">
                      {websiteProtectionError.message}
                    </p>
                    
                    <div className="space-y-3">
                      <p className="font-medium text-orange-800 dark:text-orange-200 text-sm">
                        Try these alternatives:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto p-3 border-orange-200 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900/20"
                          onClick={() => navigate('/recipes/manual')}
                        >
                          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium">Manual Entry</div>
                            <div className="text-xs opacity-75">Copy & paste recipe</div>
                          </div>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto p-3 border-orange-200 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900/20"
                          onClick={() => navigate('/recipes/scan/image')}
                        >
                          <Camera className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium">Image Scan</div>
                            <div className="text-xs opacity-75">Take a screenshot</div>
                          </div>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto p-3 border-orange-200 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900/20"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium">View Original</div>
                            <div className="text-xs opacity-75">Open in new tab</div>
                          </div>
                        </Button>
                      </div>
                      
                      {websiteProtectionError.suggestions.length > 0 && (
                        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                            Additional suggestions:
                          </p>
                          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                            {websiteProtectionError.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-orange-500 mt-0.5">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Supported Websites</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>500+ recipe websites supported</strong></p>
                <p>• AllRecipes, Food Network, Bon Appétit, NYT Cooking</p>
                <p>• Serious Eats, Epicurious, Tasty, Half Baked Harvest</p>
                <p>• Personal blogs with recipe schema markup</p>
                <p>• Most websites with structured recipe data</p>
              </div>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Enhanced Parsing:</strong> Our improved parser automatically detects recipe data and formats ingredients and instructions for easy editing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}