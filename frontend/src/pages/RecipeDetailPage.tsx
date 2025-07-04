import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Clock, Users, Edit, Trash2, ChefHat, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HtmlRenderer } from '@/components/ui/html-renderer';
import { useRecipe, useDeleteRecipe } from '@/hooks/useRecipes';
import { useRecipeStore } from '@/stores/recipeStore';
import { Recipe, Ingredient, Tag } from '@/types/recipe';

interface MediaImage {
  url: string;
  width?: number;
  height?: number;
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedRecipe, error } = useRecipeStore();
  const { data: recipe, isLoading, error: queryError } = useRecipe(id!);
  const deleteRecipe = useDeleteRecipe();

  const currentRecipe: Recipe | null = (recipe && typeof recipe === 'object' && recipe !== null && 'id' in recipe ? recipe as Recipe : selectedRecipe) || null;
  const displayError = error || queryError?.message;

  const handleDelete = async () => {
    if (!currentRecipe) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentRecipe.title}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      deleteRecipe.mutate(currentRecipe.id, {
        onSuccess: () => {
          navigate('/recipes');
        }
      });
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (displayError) {
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
            <h1 className="text-3xl font-bold text-foreground">Recipe Details</h1>
          </div>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Recipe</h2>
            <p className="text-destructive/80 mb-4">{displayError}</p>
            <Button variant="outline" onClick={() => navigate('/recipes')}>
              Back to Recipes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRecipe) {
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
            <h1 className="text-3xl font-bold text-foreground">Recipe Details</h1>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Recipe not found</h2>
            <p className="text-muted-foreground mb-4">
              The recipe you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/recipes')}>
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
            to="/recipes"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Recipe Details</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{currentRecipe.title}</CardTitle>
                    {currentRecipe.description && (
                      <p className="text-muted-foreground mb-4">{currentRecipe.description}</p>
                    )}
                    
                    {/* Recipe Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {currentRecipe.total_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(currentRecipe.total_time)}</span>
                        </div>
                      )}
                      {currentRecipe.servings && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{currentRecipe.servings} servings</span>
                        </div>
                      )}
                      {currentRecipe.difficulty && (
                        <div className="flex items-center gap-1">
                          <ChefHat className="h-4 w-4" />
                          <Badge className={getDifficultyColor(currentRecipe.difficulty)}>
                            {currentRecipe.difficulty}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(currentRecipe.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link to={`/recipes/${currentRecipe.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={deleteRecipe.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteRecipe.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
                    {currentRecipe.ingredients ? (
                      Array.isArray(currentRecipe.ingredients) && currentRecipe.ingredients.length > 0 ? (
                        // Structured ingredients from database
                        <ul className="space-y-2">
                          {(currentRecipe.ingredients as Ingredient[])
                            .sort((a: Ingredient, b: Ingredient) => a.order_index - b.order_index)
                            .map((ingredient: Ingredient) => (
                              <li key={ingredient.id} className="flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {ingredient.amount && ingredient.unit 
                                      ? `${ingredient.amount} ${ingredient.unit} `
                                      : ingredient.amount 
                                      ? `${ingredient.amount} `
                                      : ''}
                                    {ingredient.name}
                                  </span>
                                  {ingredient.notes && (
                                    <span className="text-muted-foreground text-sm ml-2">
                                      ({ingredient.notes})
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        // HTML ingredients from parsing (Instagram, web, etc.)
                        <HtmlRenderer content={currentRecipe.ingredients as string} />
                      )
                    ) : (
                      <p className="text-muted-foreground">No ingredients listed</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Instructions</h3>
                    {currentRecipe.instructions ? (
                      (() => {
                        // Handle different instruction formats
                        if (typeof currentRecipe.instructions === 'string') {
                          // Plain text instructions
                          return <div className="whitespace-pre-wrap">{currentRecipe.instructions}</div>;
                        } 
                        
                        if (typeof currentRecipe.instructions === 'object') {
                          // Check for content property (rich text editor format)
                          if (currentRecipe.instructions.content) {
                            return <HtmlRenderer content={currentRecipe.instructions.content} />;
                          }
                          
                          // Check if it's a direct HTML object (some parsing formats)
                          if (currentRecipe.instructions.html) {
                            return <HtmlRenderer content={currentRecipe.instructions.html} />;
                          }
                          
                          // Fallback: try to render the whole object as HTML
                          return <HtmlRenderer content={currentRecipe.instructions as unknown as string} />;
                        }
                        
                        // Final fallback
                        return <div>Unable to display instructions</div>;
                      })()
                    ) : (
                      <p className="text-muted-foreground">No instructions provided</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Media Section */}
            {currentRecipe.media && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Media</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentRecipe.media.images && currentRecipe.media.images.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Images</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {currentRecipe.media.images.map((image: MediaImage, index: number) => (
                          <div key={index} className="relative">
                            <img
                              src={image.url}
                              alt={`Recipe image ${index + 1}`}
                              className="w-full h-auto rounded-lg object-cover max-h-96"
                              loading="lazy"
                            />
                            {image.width && image.height && (
                              <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                {image.width}×{image.height}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentRecipe.media.video_url && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Video</h4>
                      <div className="relative aspect-video">
                        <video
                          src={currentRecipe.media.video_url}
                          controls
                          className="w-full h-full rounded-lg object-cover"
                          poster={currentRecipe.media.video_thumbnail}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                  
                  {currentRecipe.media.video_thumbnail && !currentRecipe.media.video_url && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Video Thumbnail</h4>
                      <div className="relative">
                        <img
                          src={currentRecipe.media.video_thumbnail}
                          alt="Video thumbnail"
                          className="w-full h-auto rounded-lg object-cover max-h-96"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                          <div className="bg-white/90 rounded-full p-3">
                            <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentRecipe.source_url && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" asChild className="w-full">
                        <a href={currentRecipe.source_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Original Source
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recipe Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipe Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentRecipe.prep_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prep Time</span>
                    <span>{formatTime(currentRecipe.prep_time)}</span>
                  </div>
                )}
                {currentRecipe.cook_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cook Time</span>
                    <span>{formatTime(currentRecipe.cook_time)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{currentRecipe.source_type}</span>
                    {currentRecipe.source_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={currentRecipe.source_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tags */}
            {currentRecipe.tags && currentRecipe.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentRecipe.tags.map((tag: Tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}