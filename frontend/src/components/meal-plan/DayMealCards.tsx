import { Plus } from "lucide-react";
import { MealType, MealPlanEntry } from "@/types/mealPlan";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DayMealCardsProps {
  date: string;
  meals: {
    [MealType.BREAKFAST]?: MealPlanEntry;
    [MealType.SNACK]?: MealPlanEntry[];
    [MealType.LUNCH]?: MealPlanEntry;
    [MealType.DINNER]?: MealPlanEntry;
  };
  onAddMeal?: (date: string, mealType: MealType) => void;
  onEditMeal?: (entry: MealPlanEntry) => void;
  isEditing?: boolean;
}

export function DayMealCards({
  date,
  meals,
  onAddMeal,
  onEditMeal,
  isEditing = false,
}: DayMealCardsProps) {
  const formatMealTypeName = (mealType: MealType) => {
    switch (mealType) {
      case MealType.BREAKFAST:
        return "Breakfast";
      case MealType.SNACK:
        return "Snack";
      case MealType.LUNCH:
        return "Lunch";
      case MealType.DINNER:
        return "Dinner";
      default:
        return mealType;
    }
  };

  const getMealTypeColor = (mealType: MealType) => {
    switch (mealType) {
      case MealType.BREAKFAST:
        return "bg-orange-50 border-orange-200 text-orange-800";
      case MealType.SNACK:
        return "bg-purple-50 border-purple-200 text-purple-800";
      case MealType.LUNCH:
        return "bg-green-50 border-green-200 text-green-800";
      case MealType.DINNER:
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const renderMealCard = (
    mealType: MealType,
    entry?: MealPlanEntry,
    index?: number
  ) => {
    const isEmpty = !entry;
    const displayName =
      mealType === MealType.SNACK && typeof index === "number"
        ? `Snack ${index + 1}`
        : formatMealTypeName(mealType);

    return (
      <Card
        key={`${mealType}-${index || 0}`}
        className={`transition-all duration-200 h-24 ${getMealTypeColor(
          mealType
        )} ${
          isEmpty ? "border-dashed hover:bg-opacity-70" : "hover:shadow-md"
        }`}
      >
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium opacity-75 mb-1">
                {displayName}
              </div>
              {entry ? (
                <div
                  className="cursor-pointer group"
                  onClick={() => onEditMeal?.(entry)}
                >
                  <div className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {entry.recipe_title || "Recipe"}
                  </div>
                  {entry.servings > 1 && (
                    <div className="text-xs opacity-60 mt-1">
                      {entry.servings} servings
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  {isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddMeal?.(date, mealType)}
                      className="h-8 text-xs opacity-70 hover:opacity-100"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  ) : (
                    <div className="text-xs opacity-50">No meal</div>
                  )}
                </div>
              )}
            </div>
            {entry?.recipe_thumbnail && (
              <div className="w-8 h-8 ml-2 flex-shrink-0">
                <img
                  src={entry.recipe_thumbnail}
                  alt=""
                  className="w-full h-full object-cover rounded"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render cards for breakfast, snack 1, lunch, snack 2, dinner
  const snacks = meals[MealType.SNACK] || [];

  return (
    <div className="space-y-2">
      {/* Breakfast */}
      {renderMealCard(MealType.BREAKFAST, meals[MealType.BREAKFAST])}

      {/* Snack 1 */}
      {renderMealCard(MealType.SNACK, snacks[0], 0)}

      {/* Lunch */}
      {renderMealCard(MealType.LUNCH, meals[MealType.LUNCH])}

      {/* Snack 2 */}
      {renderMealCard(MealType.SNACK, snacks[1], 1)}

      {/* Dinner */}
      {renderMealCard(MealType.DINNER, meals[MealType.DINNER])}
    </div>
  );
}
