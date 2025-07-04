import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Save, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { useRecipe, useCreateRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { Ingredient, Tag, RecipeCreate, RecipeUpdate } from '@/types/recipe';
import { ParsedRecipe } from '@/services/parsingService';

// Form-specific interfaces
interface FormTag {
  name: string;
  color: string;
}

interface FormData {
  title: string;
  description: string;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: number | null;
  difficulty: string;
  source_type: 'manual' | 'website' | 'instagram' | 'image';
  source_url: string;
  media: Record<string, unknown>;
  instructions: Record<string, unknown>;
  ingredients: Record<string, unknown>;
  tags: FormTag[];
}


interface LocationState {
  parsedData?: ParsedRecipe;
}

export default function RecipeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };
  
  // Determine if we're in edit mode
  const isEditMode = Boolean(id);
  
  // Hooks for data fetching and mutations
  const { data: recipe, isLoading, error } = useRecipe(id!);
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    prep_time: null,
    cook_time: null,
    total_time: null,
    servings: null,
    difficulty: '',
    source_type: 'manual',
    source_url: '',
    media: {},
    instructions: {},
    ingredients: {},
    tags: [],
  });
  
  const [parsedData, setParsedData] = useState<ParsedRecipe | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Initialize form data for new recipes with parsed data
  useEffect(() => {
    if (!isEditMode && location.state?.parsedData) {
      const parsed = location.state.parsedData;
      setParsedData(parsed);
      setConfidenceScore(parsed.confidence_score);

      const ingredientsHtml = parsed.ingredients || '';

      setFormData({
        title: parsed.title || '',
        description: parsed.description || '',
        prep_time: parsed.prep_time || null,
        cook_time: parsed.cook_time || null,
        total_time: parsed.total_time || null,
        servings: parsed.servings || null,
        difficulty: '',
        source_type: (parsed.source_type as FormData['source_type']) || 'manual',
        source_url: parsed.source_url || '',
        media: parsed.media || {},
        instructions: typeof parsed.instructions === 'string' 
          ? { type: 'html', content: parsed.instructions }
          : parsed.instructions || {},
        ingredients: typeof ingredientsHtml === 'string' 
          ? { type: 'html', content: ingredientsHtml }
          : ingredientsHtml || {},
        tags: [],
      });
    }
  }, [isEditMode, location.state]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && recipe && typeof recipe === 'object' && 'title' in recipe) {
      // Type the recipe properly with better type assertion
      const typedRecipe = recipe as {
        title: string;
        description?: string;
        prep_time?: number;
        cook_time?: number;
        total_time?: number;
        servings?: number;
        difficulty?: string;
        source_type: 'manual' | 'website' | 'instagram' | 'image';
        source_url?: string;
        media?: Record<string, unknown>;
        instructions?: Record<string, unknown>;
        ingredients?: Ingredient[] | Record<string, unknown> | string;
        tags: Tag[];
      };

      // Convert structured ingredients back to HTML for the rich text editor
      const ingredientsHtml = Array.isArray(typedRecipe.ingredients) && typedRecipe.ingredients.length > 0 
        ? (typedRecipe.ingredients as Ingredient[])
            .sort((a: Ingredient, b: Ingredient) => a.order_index - b.order_index)
            .map((ing: Ingredient) => {
              const amount = ing.amount && ing.unit ? `${ing.amount} ${ing.unit} ` : ing.amount ? `${ing.amount} ` : '';
              const notes = ing.notes ? ` (${ing.notes})` : '';
              return `<p>${amount}${ing.name}${notes}</p>`;
            }).join('')
        : '';

      setFormData({
        title: typedRecipe.title,
        description: typedRecipe.description || '',
        prep_time: typedRecipe.prep_time || null,
        cook_time: typedRecipe.cook_time || null,
        total_time: typedRecipe.total_time || null,
        servings: typedRecipe.servings || null,
        difficulty: typedRecipe.difficulty || '',
        source_type: typedRecipe.source_type,
        source_url: typedRecipe.source_url || '',
        media: typedRecipe.media || {},
        instructions: typedRecipe.instructions || {},
        ingredients: { type: 'html', content: ingredientsHtml },
        tags: typedRecipe.tags.map((tag: Tag) => ({
          name: tag.name,
          color: tag.color || ''
        })),
      });
    }
  }, [isEditMode, recipe]);

  const handleInputChange = (field: keyof FormData, value: unknown): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = (): void => {
    if (!tagInput.trim()) return;
    
    const newTag: FormTag = {
      name: tagInput.trim(),
      color: ''
    };
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }));
    setTagInput('');
  };

  const removeTag = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Helper function to convert HTML ingredients to structured format
  const parseHtmlIngredients = (ingredientsData: Record<string, unknown>): Omit<Ingredient, 'id'>[] => {
    if (!ingredientsData) return [];
    
    // If it's already an array (structured), return as is
    if (Array.isArray(ingredientsData)) {
      return ingredientsData;
    }
    
    // If it's HTML content, parse it into structured format
    if ('content' in ingredientsData && typeof ingredientsData.content === 'string') {
      const htmlContent = ingredientsData.content;
      
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Use a Set to track seen ingredients and avoid duplicates
      const seenIngredients = new Set<string>();
      
      // Extract text from paragraphs first, then list items if no paragraphs
      let listItems: NodeListOf<Element> = tempDiv.querySelectorAll('p');
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
            amount: undefined,
            unit: '',
            notes: '',
            order_index: index
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null) as Omit<Ingredient, 'id'>[];
      
      return ingredients;
    }
    
    return [];
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a recipe title');
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
      ingredients: parseHtmlIngredients(formData.ingredients),
      tags: formData.tags.map(({ name, color }) => ({ name, color }))
    };

    if (isEditMode) {
      // Update existing recipe
      updateRecipeMutation.mutate({ id: id!, recipe: recipeData as RecipeUpdate }, {
        onSuccess: (updatedRecipe) => {
          navigate(`/recipes/${updatedRecipe.id}`);
        },
        onError: (error) => {
          alert(`Failed to update recipe: ${error.message}`);
        }
      });
    } else {
      // Create new recipe
      createRecipeMutation.mutate(recipeData as RecipeCreate, {
        onSuccess: (newRecipe) => {
          navigate(`/recipes/${newRecipe.id}`);
        },
        onError: (error) => {
          alert(`Failed to create recipe: ${error.message}`);
        }
      });
    }
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (score: number): string => {
    if (score >= 0.8) return 'High confidence';
    if (score >= 0.6) return 'Medium confidence';
    return 'Low confidence - please review';
  };

  // Loading state for edit mode
  if (isEditMode && isLoading) {
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

  // Error state for edit mode
  if (isEditMode && (error || !recipe)) {
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
              {error?.message || 'Recipe not found'}
            </p>
            <Button variant="outline" onClick={() => navigate('/recipes')}>
              Back to Recipes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pageTitle = isEditMode ? 'Edit Recipe' : (parsedData ? 'Review Parsed Recipe' : 'Add New Recipe');
  const backUrl = isEditMode ? `/recipes/${id}` : '/recipes';
  const isSubmitting = isEditMode ? updateRecipeMutation.isPending : createRecipeMutation.isPending;
  const submitError = isEditMode ? updateRecipeMutation.error : createRecipeMutation.error;
  const submitText = isSubmitting 
    ? 'Saving...' 
    : isEditMode 
      ? 'Save Changes' 
      : 'Save Recipe';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to={backUrl}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
        </div>

        {/* Confidence Score Banner - only show for parsed recipes */}
        {confidenceScore !== null && !isEditMode && (
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
                    <span
                      className={`font-semibold ${getConfidenceColor(confidenceScore)}`}
                    >
                      {Math.round(confidenceScore * 100)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({getConfidenceText(confidenceScore)})
                    </span>
                  </div>
                  {formData.source_type && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Source: {formData.source_type} •{' '}
                      {formData.source_url && (
                        <a
                          href={formData.source_url}
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="15"
                    value={formData.prep_time || ''}
                    onChange={(e) => handleInputChange('prep_time', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    placeholder="30"
                    value={formData.cook_time || ''}
                    onChange={(e) => handleInputChange('cook_time', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    placeholder="4"
                    value={formData.servings || ''}
                    onChange={(e) => handleInputChange('servings', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
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
                  content={typeof formData.ingredients === 'object' && 'content' in formData.ingredients && typeof formData.ingredients.content === 'string'
                    ? formData.ingredients.content 
                    : ''
                  }
                  onChange={(content) => handleInputChange('ingredients', { type: 'html', content })}
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
                  content={typeof formData.instructions === 'object' && 'content' in formData.instructions && typeof formData.instructions.content === 'string'
                    ? formData.instructions.content 
                    : ''
                  }
                  onChange={(content) => handleInputChange('instructions', { type: 'html', content })}
                  placeholder="Enter cooking instructions..."
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                  disabled={isSubmitting || !formData.title.trim()}
                >
                  <Save size={16} />
                  {submitText}
                </Button>
                <Button variant="outline" asChild>
                  <Link to={backUrl}>Cancel</Link>
                </Button>
              </div>

              {submitError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">
                    Error: {submitError.message}
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