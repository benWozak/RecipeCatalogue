import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Save, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export default function ManualRecipePage() {
  const [formData, setFormData] = useState({
    title: '',
    servings: '',
    description: '',
    prepTime: '',
    cookTime: '',
    totalTime: '',
    ingredients: '',
    instructions: '',
    sourceName: '',
    sourceUrl: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
          <h1 className="text-3xl font-bold text-foreground">Manual Recipe</h1>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <PlusCircle size={48} className="mx-auto mb-4 text-blue-500" />
                <h2 className="text-xl font-semibold mb-2">Create Recipe Manually</h2>
                <p className="text-muted-foreground">
                  Enter your recipe details from scratch
                </p>
              </div>

              <form className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Recipe Title *</Label>
                    <Input 
                      id="title"
                      type="text" 
                      placeholder="Enter recipe title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input 
                      id="servings"
                      type="number" 
                      placeholder="4"
                      min="1"
                      value={formData.servings}
                      onChange={(e) => handleInputChange('servings', e.target.value)}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Brief description of your recipe"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                {/* Timing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep-time">Prep Time (minutes)</Label>
                    <Input 
                      id="prep-time"
                      type="number" 
                      placeholder="15"
                      min="0"
                      value={formData.prepTime}
                      onChange={(e) => handleInputChange('prepTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cook-time">Cook Time (minutes)</Label>
                    <Input 
                      id="cook-time"
                      type="number" 
                      placeholder="30"
                      min="0"
                      value={formData.cookTime}
                      onChange={(e) => handleInputChange('cookTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-time">Total Time (minutes)</Label>
                    <Input 
                      id="total-time"
                      type="number" 
                      placeholder="45"
                      min="0"
                      value={formData.totalTime}
                      onChange={(e) => handleInputChange('totalTime', e.target.value)}
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients *</Label>
                  <RichTextEditor
                    content={formData.ingredients}
                    onChange={(content) => handleInputChange('ingredients', content)}
                    placeholder="Enter ingredients..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Use the formatting toolbar to organize your ingredients with lists, headings, etc.
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions *</Label>
                  <RichTextEditor
                    content={formData.instructions}
                    onChange={(content) => handleInputChange('instructions', content)}
                    placeholder="Enter cooking instructions..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Use the formatting toolbar to organize your instructions with numbered lists, headings, etc.
                  </p>
                </div>

                {/* Source Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="source-name">Source Name</Label>
                    <Input 
                      id="source-name"
                      type="text" 
                      placeholder="e.g., Grandma's Recipe Book"
                      value={formData.sourceName}
                      onChange={(e) => handleInputChange('sourceName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source-url">Source URL</Label>
                    <Input 
                      id="source-url"
                      type="url" 
                      placeholder="https://example.com/recipe"
                      value={formData.sourceUrl}
                      onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    type="submit"
                    className="flex-1 sm:flex-none"
                  >
                    <Save size={16} className="mr-2" />
                    Save Recipe
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    asChild
                  >
                    <Link to="/recipes/scan">
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Manual Entry Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Ingredients</h4>
                  <ul className="space-y-1">
                    <li>• Include quantities and units</li>
                    <li>• Be specific (e.g., "large onion")</li>
                    <li>• Use standard measurements</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Instructions</h4>
                  <ul className="space-y-1">
                    <li>• Write clear, actionable steps</li>
                    <li>• Include cooking times and temperatures</li>
                    <li>• Mention visual cues ("until golden")</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}