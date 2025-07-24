import { Clock } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Card, CardContent } from '@/components/ui/card';

interface MiniRecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  className?: string;
}

export function MiniRecipeCard({ recipe, onClick, className }: MiniRecipeCardProps) {
  // Get the best thumbnail image - prioritize stored thumbnails  
  const getThumbnailImage = () => {
    // First, try stored thumbnails (optimized for recipe cards)
    if (recipe.media?.stored_media?.thumbnails) {
      // Use small size for mini cards
      return (
        recipe.media.stored_media.thumbnails.small ||
        recipe.media.stored_media.thumbnails.medium ||
        recipe.media.stored_media.thumbnails.large
      );
    }

    // Fallback to original images array
    if (
      recipe.media?.images &&
      Array.isArray(recipe.media.images) &&
      recipe.media.images.length > 0
    ) {
      const firstImage = recipe.media.images[0];
      return typeof firstImage === "string" ? firstImage : firstImage?.url;
    }

    // Fallback to legacy video_thumbnail field
    return recipe.media?.video_thumbnail;
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const thumbnailImage = getThumbnailImage();

  return (
    <Card 
      className={`transition-all hover:bg-muted/50 ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Recipe Thumbnail */}
          <div className="w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
            {thumbnailImage ? (
              <img
                src={thumbnailImage}
                alt={recipe.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.parentElement) {
                    target.parentElement.innerHTML =
                      '<div class="flex items-center justify-center h-full text-muted-foreground text-xs">No image</div>';
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate mb-1">
              {recipe.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {recipe.prep_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(recipe.prep_time)}</span>
                </div>
              )}
              {recipe.prep_time && recipe.cook_time && <span>•</span>}
              {recipe.cook_time && (
                <span>Cook {formatTime(recipe.cook_time)}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}