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
    // First, try video thumbnails if this is a video
    if (recipe.media?.video_thumbnails?.thumbnails) {
      // Use small size for mini cards
      return (
        recipe.media.video_thumbnails.thumbnails.small ||
        recipe.media.video_thumbnails.thumbnails.medium ||
        recipe.media.video_thumbnails.thumbnails.large
      );
    }

    // Next, try stored image thumbnails (optimized for recipe cards)
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
  const isVideoContent = recipe.media?.is_video || recipe.media?.video_url;

  return (
    <Card
      className={`py-0 transition-all hover:bg-muted/50 ${
        onClick ? "cursor-pointer" : ""
      } ${className || ""}`}
      onClick={onClick}
    >
      <CardContent className="px-0">
        <div className="flex items-center gap-3 h-24">
          {/* Recipe Thumbnail */}
          <div className="w-24 h-full flex-shrink-0 bg-muted rounded overflow-hidden relative">
            {thumbnailImage ? (
              <>
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
                {isVideoContent && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </>
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
