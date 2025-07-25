import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router";
import { MealType } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { MiniRecipeCard } from "./MiniRecipeCard";

interface MealSlotProps {
  mealType: MealType;
  recipe?: Recipe;
  onAddRecipe: (mealType: MealType) => void;
  onRemoveRecipe?: (mealType: MealType) => void;
  disabled?: boolean;
}

export function MealSlot({
  mealType,
  recipe,
  onAddRecipe,
  onRemoveRecipe,
  disabled = false,
}: MealSlotProps) {
  const navigate = useNavigate();
  const getMealTypeLabel = (type: MealType) => {
    switch (type) {
      case MealType.BREAKFAST:
        return "Breakfast";
      case MealType.LUNCH:
        return "Lunch";
      case MealType.DINNER:
        return "Dinner";
      case MealType.SNACK:
        return "Snack";
      default:
        return type;
    }
  };

  // const getMealTypeColor = (type: MealType) => {
  //   switch (type) {
  //     case MealType.BREAKFAST:
  //       return "text-orange-600 bg-orange-50 border-orange-200";
  //     case MealType.LUNCH:
  //       return "text-green-600 bg-green-50 border-green-200";
  //     case MealType.DINNER:
  //       return "text-blue-600 bg-blue-50 border-blue-200";
  //     case MealType.SNACK:
  //       return "text-purple-600 bg-purple-50 border-purple-200";
  //     default:
  //       return "text-gray-600 bg-gray-50 border-gray-200";
  //   }
  // };

  return (
    <div className="">
      {/* Meal Type Label */}
      <div
        className={`text-xs font-medium px-2 py-1 rounded-t-md text-center border`}
      >
        {getMealTypeLabel(mealType)}
      </div>

      {/* Recipe Slot */}
      <div className="min-h-[60px]">
        {recipe ? (
          /* Filled State - Show Recipe */
          <div className="relative group">
            <MiniRecipeCard 
              recipe={recipe} 
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              className="cursor-pointer hover:bg-muted/30 transition-colors"
            />
            {onRemoveRecipe && !disabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveRecipe(mealType)}
                className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-background shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          /* Empty State - Show Add Button */
          <Button
            variant="outline"
            onClick={() => onAddRecipe(mealType)}
            disabled={disabled}
            className="w-full h-10 border-dashed border-t-0 rounded-t-none bg-primary/50 dark:bg-primary/50 hover:border-solid hover:bg-muted/50 transition-all"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add Recipe</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
