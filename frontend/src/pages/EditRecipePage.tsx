import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Save, Plus, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { useRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { RecipeFormData } from '@/types/recipe';

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recipe, isLoading, error } = useRecipe(id!);
  const updateRecipeMutation = useUpdateRecipe();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prep_time: null as number | null,
    cook_time: null as number | null,
    total_time: null as number | null,
    servings: null as number | null,
    difficulty: "",
    source_type: "manual" as const,
    source_url: "",
    media: {} as Record<string, any>,
    instructions: {} as Record<string, any>,
    ingredients: {} as Record<string, any>,
    tags: [] as Array<{ name: string; color: string }>,
  });
  
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (recipe) {
      // Convert ingredients back to HTML for the rich text editor
      const ingredientsHtml = recipe.ingredients && recipe.ingredients.length > 0 
        ? recipe.ingredients
            .sort((a, b) => a.order_index - b.order_index)
            .map(ing => {
              const amount = ing.amount && ing.unit ? `${ing.amount} ${ing.unit} ` : ing.amount ? `${ing.amount} ` : '';
              const notes = ing.notes ? ` (${ing.notes})` : '';
              return `<p>${amount}${ing.name}${notes}</p>`;
            }).join('')
        : '';

      setFormData({
        title: recipe.title,
        description: recipe.description || "",
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        total_time: recipe.total_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty || "",
        source_type: recipe.source_type,
        source_url: recipe.source_url || "",
        media: recipe.media || {},
        instructions: recipe.instructions || {},
        ingredients: { type: 'html', content: ingredientsHtml },
        tags: recipe.tags.map(tag => ({
          name: tag.name,
          color: tag.color || ""
        })),
      });
    }
  }, [recipe]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = {
      name: tagInput.trim(),
      color: ""
    };
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }));
    setTagInput("");
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Helper function to convert HTML ingredients to structured format
  const parseHtmlIngredients = (ingredientsData: any) => {
    if (!ingredientsData) return [];
    
    // If it's already an array (structured), return as is
    if (Array.isArray(ingredientsData)) {
      return ingredientsData;
    }
    
    // If it's HTML content, parse it into structured format
    if (ingredientsData.content) {
      const htmlContent = ingredientsData.content;
      
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Use a Set to track seen ingredients and avoid duplicates
      const seenIngredients = new Set();
      
      // Extract text from paragraphs first, then list items if no paragraphs
      let listItems = tempDiv.querySelectorAll('p');
      if (listItems.length === 0 || (listItems.length === 1 && !listItems[0].textContent?.trim())) {
        listItems = tempDiv.querySelectorAll('li');
      }
      
      const ingredients = Array.from(listItems)
        .map((item, index) => {
          let text = item.textContent?.trim() || '';
          if (!text || text.length < 2) return null;
          
          // Remove trailing special characters and emojis
          text = text.replace(/⁣$/, '').trim();
          
          // Skip section headers (like "Salmon⁣", "Salad⁣", "Creamy Asian Dressing⁣")
          if (text.length < 10 && !text.match(/\d/) && !text.includes(' ')) {
            return null;
          }
          
          // Skip duplicates
          if (seenIngredients.has(text)) {
            return null;
          }
          seenIngredients.add(text);
          
          return {
            name: text,
            amount: null,
            unit: "",
            notes: "",
            order_index: index
          };
        })
        .filter(Boolean); // Remove null items
      
      return ingredients;
    }
    
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert("Please enter a recipe title");
      return;
    }

    // Convert form data to API format
    const recipeData = {
      title: formData.title,
      description: formData.description || undefined,
      prep_time: formData.prep_time || undefined,
      cook_time: formData.cook_time || undefined,
      total_time: formData.total_time || undefined,
      servings: formData.servings || undefined,
      difficulty: formData.difficulty || undefined,
      source_type: formData.source_type,
      source_url: formData.source_url || undefined,
      media: Object.keys(formData.media).length > 0 ? formData.media : undefined,
      instructions: Object.keys(formData.instructions).length > 0 ? formData.instructions : undefined,
      ingredients: parseHtmlIngredients(formData.ingredients), // Parse HTML ingredients to structured format
      tags: formData.tags.map(({ name, color }) => ({ name, color }))
    };

    updateRecipeMutation.mutate({ id: id!, recipe: recipeData }, {
      onSuccess: (updatedRecipe) => {
        navigate(`/recipes/${updatedRecipe.id}`);
      },
      onError: (error) => {
        alert(`Failed to update recipe: ${error.message}`);
      }
    });
  };

  if (isLoading) {
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
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
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
            <h1 className="text-3xl font-bold text-foreground">Edit Recipe</h1>
          </div>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Recipe</h2>
            <p className="text-destructive/80 mb-4">
              {error?.message || "Recipe not found"}
            </p>
            <Button variant="outline" onClick={() => navigate('/recipes')}>
              Back to Recipes
            </Button>
          </div>
        </div>
      </div>
    );
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter recipe title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter recipe description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="15"
                    value={formData.prep_time || ""}
                    onChange={(e) => handleInputChange("prep_time", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    placeholder="30"
                    value={formData.cook_time || ""}
                    onChange={(e) => handleInputChange("cook_time", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    placeholder="4"
                    value={formData.servings || ""}
                    onChange={(e) => handleInputChange("servings", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange("difficulty", e.target.value)}
                  >
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Ingredients Section */}
              <div>
                <Label htmlFor="ingredients">Ingredients</Label>
                <RichTextEditor
                  content={typeof formData.ingredients === 'object' && formData.ingredients.content 
                    ? formData.ingredients.content 
                    : ""
                  }
                  onChange={(content) => handleInputChange("ingredients", { type: 'html', content })}
                  placeholder="Enter ingredients..."
                />
              </div>

              {/* Tags Section */}
              <div>
                <Label>Tags</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag (e.g., vegetarian, quick)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <RichTextEditor
                  content={typeof formData.instructions === 'object' && formData.instructions.content 
                    ? formData.instructions.content 
                    : ""
                  }
                  onChange={(content) => handleInputChange("instructions", { type: 'html', content })}
                  placeholder="Enter cooking instructions..."
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                  disabled={updateRecipeMutation.isPending || !formData.title.trim()}
                >
                  <Save size={16} />
                  {updateRecipeMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/recipes/${id}`}>Cancel</Link>
                </Button>
              </div>

              {updateRecipeMutation.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">
                    Error: {updateRecipeMutation.error.message}
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}