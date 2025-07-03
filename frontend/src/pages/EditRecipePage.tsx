import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState({
    title: "Recipe Title",
    description: "Recipe description",
    prepTime: "15",
    cookTime: "30",
    servings: "4",
    ingredients: "<p>2 cups flour</p><p>1 cup sugar</p><p>3 eggs</p>",
    instructions: "<p>1. Mix ingredients</p><p>2. Bake at 350°F for 30 minutes</p>",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to={`/recipes/${id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Edit Recipe</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form className="space-y-6">
              <div>
                <Label htmlFor="title">Recipe Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => handleInputChange("prepTime", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => handleInputChange("cookTime", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={formData.servings}
                    onChange={(e) => handleInputChange("servings", e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ingredients">Ingredients</Label>
                <RichTextEditor
                  content={formData.ingredients}
                  onChange={(content) => handleInputChange("ingredients", content)}
                  placeholder="Enter ingredients..."
                />
              </div>
              
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <RichTextEditor
                  content={formData.instructions}
                  onChange={(content) => handleInputChange("instructions", content)}
                  placeholder="Enter cooking instructions..."
                />
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save size={16} />
                  Save Changes
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/recipes/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}