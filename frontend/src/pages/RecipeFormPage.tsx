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
import { useCollections, useCreateCollection } from '@/hooks/useCollections';
import { Tag, RecipeCreate, RecipeUpdate, Collection } from '@/types/recipe';
import { ParsedRecipe } from '@/services/parsingService';
import { CollectionCombobox } from '@/components/ui/collection-combobox';

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
  source_type: 'manual' | 'website' | 'instagram' | 'image';
  source_url: string;
  media: Record<string, unknown>;
  instructions: Record<string, unknown>;
  ingredients: Record<string, unknown>;
  tags: FormTag[];
  collection_id?: string;
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
  const { collections } = useCollections();
  const { createCollection } = useCreateCollection();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    prep_time: null,
    cook_time: null,
    total_time: null,
    servings: null,
    source_type: 'manual',
    source_url: '',
    media: {},
    instructions: {},
    ingredients: {},
    tags: [],
    collection_id: undefined,
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

      setFormData({
        title: parsed.title || '',
        description: parsed.description || '',
        prep_time: parsed.prep_time || null,
        cook_time: parsed.cook_time || null,
        total_time: parsed.total_time || null,
        servings: parsed.servings || null,
        source_type: (parsed.source_type as FormData['source_type']) || 'manual',
        source_url: parsed.source_url || '',
        media: parsed.media || {},
        instructions: typeof parsed.instructions === 'string' 
          ? { type: 'html', content: parsed.instructions }
          : parsed.instructions || {},
        ingredients: typeof parsed.ingredients === 'string' 
          ? { type: 'html', content: parsed.ingredients }
          : parsed.ingredients || {},
        tags: [],
        collection_id: undefined,
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
        source_type: 'manual' | 'website' | 'instagram' | 'image';
        source_url?: string;
        media?: Record<string, unknown>;
        instructions?: Record<string, unknown>;
        ingredients?: Record<string, unknown>;
        tags: Tag[];
        collection_id?: string;
      };

      setFormData({
        title: typedRecipe.title,
        description: typedRecipe.description || '',
        prep_time: typedRecipe.prep_time || null,
        cook_time: typedRecipe.cook_time || null,
        total_time: typedRecipe.total_time || null,
        servings: typedRecipe.servings || null,
        source_type: typedRecipe.source_type,
        source_url: typedRecipe.source_url || '',
        media: typedRecipe.media || {},
        instructions: typedRecipe.instructions || {},
        ingredients: typedRecipe.ingredients || {},
        tags: typedRecipe.tags.map((tag: Tag) => ({
          name: tag.name,
          color: tag.color || ''
        })),
        collection_id: typedRecipe.collection_id,
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
      source_type: formData.source_type,
      source_url: formData.source_url || undefined,
      media: Object.keys(formData.media).length > 0 ? formData.media : undefined,
      instructions: Object.keys(formData.instructions).length > 0 ? formData.instructions : undefined,
      ingredients: Object.keys(formData.ingredients).length > 0 ? formData.ingredients : undefined,
      tags: formData.tags.map(({ name, color }) => ({ name, color })),
      collection_id: formData.collection_id || undefined
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

        {/* Recipe Images/Video Preview - only show for parsed recipes with media */}
        {parsedData?.media && ((parsedData.media.images?.length ?? 0) > 0 || parsedData.media.video_url || parsedData.media.stored_media) && !isEditMode && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-muted-foreground">Recipe Media</h3>
                  {parsedData.media.is_video && (
                    <Badge variant="outline" className="text-xs">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Video
                    </Badge>
                  )}
                </div>

                {/* Show stored thumbnails if available (preferred) */}
                {parsedData.media.stored_media?.thumbnails && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-600 font-medium">✓ Optimized thumbnails generated</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {Object.entries(parsedData.media.stored_media.thumbnails).map(([size, url]: [string, any]) => (
                        <div key={size} className="space-y-1">
                          <div className="text-xs text-muted-foreground capitalize">{size} ({
                            size === 'small' ? '150×150' : 
                            size === 'medium' ? '300×300' : 
                            size === 'large' ? '600×600' : 'Custom'
                          })</div>
                          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                            <img
                              src={url}
                              alt={`${size} thumbnail`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.classList.add('bg-muted');
                                target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground text-xs">Failed to load</div>';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show original images */}
                {parsedData.media.images && parsedData.media.images.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {parsedData.media.stored_media ? 'Original sources:' : 'Images found:'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {parsedData.media.images.map((image: any, index: number) => {
                        const imageUrl = typeof image === 'string' ? image : image.url;
                        const imageType = typeof image === 'object' ? image.type : 'image';
                        
                        return (
                          <div key={index} className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                            <img
                              src={imageUrl}
                              alt={typeof image === 'object' && image.alt ? image.alt : `Recipe ${imageType} ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.classList.add('bg-muted');
                                target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">Image failed to load</div>';
                              }}
                            />
                            {/* Video play button overlay */}
                            {imageType === 'thumbnail' && parsedData.media?.is_video && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/50 rounded-full p-2">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            )}
                            {/* Source badge */}
                            <div className="absolute bottom-1 right-1">
                              <Badge variant="secondary" className="text-xs">
                                {imageType === 'thumbnail' ? 'Thumb' : 'Image'}
                                {typeof image === 'object' && image.source && (
                                  <span className="ml-1">
                                    {image.source === 'recipe-scrapers' ? '(Auto)' : 
                                     image.source === 'page-fallback' ? '(Page)' : 
                                     image.source === 'recipe-section' ? '(Section)' : ''}
                                  </span>
                                )}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Video information */}
                {parsedData.media.video_url && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span className="font-medium">Video Available</span>
                      {parsedData.media.video_duration && (
                        <span className="text-blue-600 dark:text-blue-400">
                          ({Math.floor(parsedData.media.video_duration / 60)}:{(parsedData.media.video_duration % 60).toString().padStart(2, '0')})
                        </span>
                      )}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                      Original video content detected from {parsedData.source_type}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {parsedData.media.stored_media ? 
                    'Thumbnails optimized for fast loading on recipe cards' :
                    `${parsedData.media.images?.length || 0} image${parsedData.media.images?.length !== 1 ? 's' : ''} found automatically`
                  }
                </p>
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

              {/* Collection Section */}
              <div>
                <Label htmlFor="collection">Collection</Label>
                <div className="mt-2">
                  <CollectionCombobox
                    collections={collections}
                    value={formData.collection_id}
                    onValueChange={(value) => handleInputChange('collection_id', value)}
                    onCreateCollection={async (name: string): Promise<Collection> => {
                      const newCollection = await createCollection({ name });
                      // In a real app, this would be handled by react-query refetch
                      // For now, we need to update the local collections state
                      return newCollection;
                    }}
                    placeholder="Select or create a collection..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Organize your recipes into collections like "Dinner Favorites" or "Quick Meals"
                  </p>
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