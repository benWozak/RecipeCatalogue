import { Link } from 'react-router';
import { Clock, Users, ChefHat, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
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

  const formatTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Get the first image for thumbnail
  const thumbnailImage = recipe.media?.images?.[0] || recipe.media?.video_thumbnail;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Recipe Image/Thumbnail */}
      {thumbnailImage && (
        <div className="relative aspect-video overflow-hidden">
          <Link to={`/recipes/${recipe.id}`}>
            <img
              src={typeof thumbnailImage === 'string' ? thumbnailImage : thumbnailImage.url}
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </Link>
          {recipe.media?.video_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {recipe.source_type === 'instagram' ? 'IG' : 
               recipe.source_type === 'website' ? 'Web' : 
               recipe.source_type === 'image' ? 'Img' : 'Manual'}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/recipes/${recipe.id}`} 
              className="block hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-lg leading-tight truncate mb-1">
                {recipe.title}
              </h3>
            </Link>
            {recipe.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {recipe.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(recipe)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(recipe)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-4">
            {recipe.total_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(recipe.total_time)}</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>
          
          {recipe.difficulty && (
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
            </div>
          )}
        </div>
        
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{recipe.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {recipe.source_type === 'manual' ? 'Manual' : 
             recipe.source_type === 'website' ? 'Web' :
             recipe.source_type === 'instagram' ? 'Instagram' : 'Image'}
          </span>
          <span>
            {new Date(recipe.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}