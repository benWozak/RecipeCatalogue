import { Link } from "react-router";
import { Clock, Users, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CollectionAssignment } from "./CollectionAssignment";

interface RecipeCardProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  onUpdate?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onEdit, onDelete, onUpdate }: RecipeCardProps) {
  const formatTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Get the best thumbnail image - prioritize stored thumbnails
  const getThumbnailImage = () => {
    // First, try stored thumbnails (optimized for recipe cards)
    if (recipe.media?.stored_media?.thumbnails) {
      // Use medium size for recipe cards (300x300)
      return (
        recipe.media.stored_media.thumbnails.medium ||
        recipe.media.stored_media.thumbnails.large ||
        recipe.media.stored_media.thumbnails.small
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
    <Link to={`/recipes/${recipe.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden md:h-56">
        {/* Recipe Image/Thumbnail */}
        {thumbnailImage && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={thumbnailImage}
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.classList.add("bg-muted");
                  target.parentElement.innerHTML =
                    '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">No image</div>';
                }
              }}
            />
            {isVideoContent && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {recipe.source_type === "instagram"
                  ? "IG"
                  : recipe.source_type === "website"
                  ? "Web"
                  : recipe.source_type === "image"
                  ? "Img"
                  : "Manual"}
              </Badge>
            </div>
          </div>
        )}

        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 h-24">
              <h3 className="block hover:text-primary transition-colors font-semibold text-lg leading-tight truncate mb-1 text-wrap">
                {recipe.title}
              </h3>
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
                <DropdownMenuSeparator />
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
          </div>

          {/* Collection Badge */}
          {recipe.collection && (
            <div className="mb-2">
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                📁 {recipe.collection.name}
              </Badge>
            </div>
          )}

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

          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span>
              {recipe.source_type === "manual"
                ? "Manual"
                : recipe.source_type === "website"
                ? "Web"
                : recipe.source_type === "instagram"
                ? "Instagram"
                : "Image"}
            </span>
            <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
          </div>
          
          {/* Collection Assignment */}
          <CollectionAssignment 
            recipe={recipe} 
            onUpdate={onUpdate}
            variant="inline"
          />
        </CardContent>
      </Card>
    </Link>
  );
}
