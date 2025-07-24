import { Clock } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { Card, CardContent } from "@/components/ui/card";

interface MiniRecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  className?: string;
}

export function MiniRecipeCard({
  recipe,
  onClick,
  className,
}: MiniRecipeCardProps) {
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

  const thumbnailImage = getThumbnailImage();

  return (
    <Card
      className={`py-0 rounded-t-none transition-all hover:bg-muted/50 ${
        onClick ? "cursor-pointer" : ""
      } ${className || ""}`}
      onClick={onClick}
    >
      <CardContent className="px-0">
        <div className="flex items-center gap-3">
          {/* Recipe Thumbnail */}
          <div className="max-w-16 w-12 h-full flex-shrink-0 bg-muted rounded overflow-hidden">
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
            <div className="font-medium text-sm text-wrap mb-1">
              {recipe.title}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
