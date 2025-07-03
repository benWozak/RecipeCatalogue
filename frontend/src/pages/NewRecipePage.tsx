import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ParsedRecipe } from '@/services/parsingService'

export default function NewRecipePage() {
  const location = useLocation()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    totalTime: '',
    servings: '',
    ingredients: '',
    instructions: '',
    sourceUrl: '',
    sourceType: ''
  })
  const [parsedData, setParsedData] = useState<ParsedRecipe | null>(null)
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null)

  useEffect(() => {
    if (location.state?.parsedData) {
      const parsed = location.state.parsedData as ParsedRecipe
      setParsedData(parsed)
      setConfidenceScore(parsed.confidence_score)
      
      setFormData({
        title: parsed.title || '',
        description: parsed.description || '',
        prepTime: parsed.prep_time?.toString() || '',
        cookTime: parsed.cook_time?.toString() || '',
        totalTime: parsed.total_time?.toString() || '',
        servings: parsed.servings?.toString() || '',
        ingredients: parsed.ingredients?.join('\n') || '',
        instructions: parsed.instructions?.steps?.join('\n') || '',
        sourceUrl: parsed.source_url || '',
        sourceType: parsed.source_type || location.state.sourceType || ''
      })
    }
  }, [location.state])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'High confidence'
    if (score >= 0.6) return 'Medium confidence'
    return 'Low confidence - please review'
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/recipes"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {parsedData ? 'Review Parsed Recipe' : 'Add New Recipe'}
          </h1>
        </div>

        {/* Confidence Score Banner */}
        {confidenceScore !== null && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {confidenceScore >= 0.6 ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <AlertCircle size={20} className="text-yellow-500" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Parsing Confidence:</span>
                    <span className={`font-semibold ${getConfidenceColor(confidenceScore)}`}>
                      {Math.round(confidenceScore * 100)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({getConfidenceText(confidenceScore)})
                    </span>
                  </div>
                  {formData.sourceType && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Source: {formData.sourceType} • {formData.sourceUrl && (
                        <a 
                          href={formData.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View Original
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-6">
            <form className="space-y-6">
              <div>
                <Label htmlFor="title">Recipe Title</Label>
                <Input 
                  id="title"
                  type="text" 
                  placeholder="Enter recipe title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Enter recipe description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input 
                    id="prepTime"
                    type="number" 
                    placeholder="15"
                    value={formData.prepTime}
                    onChange={(e) => handleInputChange('prepTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                  <Input 
                    id="cookTime"
                    type="number" 
                    placeholder="30"
                    value={formData.cookTime}
                    onChange={(e) => handleInputChange('cookTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input 
                    id="servings"
                    type="number" 
                    placeholder="4"
                    value={formData.servings}
                    onChange={(e) => handleInputChange('servings', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea 
                  id="ingredients"
                  placeholder="Enter ingredients, one per line"
                  value={formData.ingredients}
                  onChange={(e) => handleInputChange('ingredients', e.target.value)}
                  rows={8}
                />
              </div>
              
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea 
                  id="instructions"
                  placeholder="Enter cooking instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  rows={10}
                />
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save size={16} />
                  Save Recipe
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/recipes">
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}