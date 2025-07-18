import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionSelector } from "@/components/ui/collection-selector";
import { useUser } from "@/hooks/useUser";
import { recipeService } from "@/services/recipeService";
import { Recipe } from "@/types/recipe";

interface CollectionAssignmentProps {
  recipe: Recipe;
  onUpdate?: (updatedRecipe: Recipe) => void;
  variant?: "inline" | "button";
  size?: "sm" | "default";
}

export function CollectionAssignment({ 
  recipe, 
  onUpdate, 
  variant = "inline",
  size = "default" 
}: CollectionAssignmentProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, getToken } = useUser();

  const handleCollectionChange = async (collectionId: string | null) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const token = await getToken();
      if (!token) {
        console.error('Unable to get auth token');
        return;
      }

      const response = await recipeService.assignRecipeToCollection(
        recipe.id, 
        collectionId, 
        token
      );

      if (response.success && response.data) {
        onUpdate?.(response.data);
      }
    } catch (error) {
      console.error('Failed to update recipe collection:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (variant === "button") {
    return (
      <CollectionSelector
        value={recipe.collection_id}
        onValueChange={handleCollectionChange}
        placeholder={size === "sm" ? "Collection" : "Assign to collection"}
        className={size === "sm" ? "h-8 text-xs" : ""}
        disabled={isUpdating}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <FolderPlus className="h-4 w-4 text-muted-foreground" />
      <CollectionSelector
        value={recipe.collection_id}
        onValueChange={handleCollectionChange}
        placeholder="No collection"
        className="h-8 text-xs border-none bg-transparent hover:bg-muted/50"
        disabled={isUpdating}
      />
      {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
    </div>
  );
}

interface QuickCollectionButtonProps {
  recipe: Recipe;
  onUpdate?: (updatedRecipe: Recipe) => void;
}

export function QuickCollectionButton({ recipe, onUpdate }: QuickCollectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2 text-xs"
      >
        <FolderPlus className="h-3 w-3 mr-1" />
        {recipe.collection?.name || "Collection"}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 z-10 mt-1">
          <CollectionAssignment
            recipe={recipe}
            onUpdate={(updatedRecipe) => {
              onUpdate?.(updatedRecipe);
              setIsOpen(false);
            }}
            variant="button"
            size="sm"
          />
        </div>
      )}
    </div>
  );
}