import { useState } from 'react';
import { MealType, getDayName } from '@/types/mealPlan';
import { Recipe } from '@/types/recipe';
import { DayMealSlots } from './DayMealSlots';
import { RecipeSelectionSheet } from './RecipeSelectionSheet';

interface WeekMealsData {
  [dayOfWeek: number]: {
    [MealType.BREAKFAST]?: Recipe;
    [MealType.LUNCH]?: Recipe;
    [MealType.DINNER]?: Recipe;
  };
}

interface WeeklyMealPlanGridProps {
  weekNumber: number;
  meals: WeekMealsData;
  onMealsChange: (meals: WeekMealsData) => void;
  authToken: (() => Promise<string | null>) | string;
  disabled?: boolean;
}

interface SheetState {
  isOpen: boolean;
  dayOfWeek: number | null;
  mealType: MealType | null;
}

export function WeeklyMealPlanGrid({
  weekNumber,
  meals,
  onMealsChange,
  authToken,
  disabled = false
}: WeeklyMealPlanGridProps) {
  const [sheetState, setSheetState] = useState<SheetState>({
    isOpen: false,
    dayOfWeek: null,
    mealType: null
  });

  // Calculate total meals planned
  const getTotalMealsCount = () => {
    return Object.values(meals).reduce((total, dayMeals) => {
      return total + Object.values(dayMeals).filter(meal => meal !== undefined).length;
    }, 0);
  };

  const handleAddRecipe = (dayOfWeek: number, mealType: MealType) => {
    setSheetState({
      isOpen: true,
      dayOfWeek,
      mealType
    });
  };

  const handleRemoveRecipe = (dayOfWeek: number, mealType: MealType) => {
    const updatedMeals = { ...meals };
    if (!updatedMeals[dayOfWeek]) {
      updatedMeals[dayOfWeek] = {};
    }
    if (mealType in updatedMeals[dayOfWeek]) {
      delete (updatedMeals[dayOfWeek] as any)[mealType];
    }
    onMealsChange(updatedMeals);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    if (sheetState.dayOfWeek === null || sheetState.mealType === null) return;

    const updatedMeals = { ...meals };
    if (!updatedMeals[sheetState.dayOfWeek]) {
      updatedMeals[sheetState.dayOfWeek] = {};
    }
    (updatedMeals[sheetState.dayOfWeek] as any)[sheetState.mealType] = recipe;
    onMealsChange(updatedMeals);
    
    // Close the sheet
    setSheetState({
      isOpen: false,
      dayOfWeek: null,
      mealType: null
    });
  };

  const handleCloseSheet = () => {
    setSheetState({
      isOpen: false,
      dayOfWeek: null,
      mealType: null
    });
  };

  const getDayMeals = (dayOfWeek: number) => {
    return meals[dayOfWeek] || {};
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {getTotalMealsCount()} of 21 meals planned for Week {weekNumber}
        </p>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, dayIndex) => (
          <DayMealSlots
            key={dayIndex}
            dayOfWeek={dayIndex}
            meals={getDayMeals(dayIndex)}
            onAddRecipe={handleAddRecipe}
            onRemoveRecipe={handleRemoveRecipe}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Recipe Selection Sheet */}
      <RecipeSelectionSheet
        isOpen={sheetState.isOpen}
        onClose={handleCloseSheet}
        onSelectRecipe={handleRecipeSelect}
        mealType={sheetState.mealType || undefined}
        dayName={sheetState.dayOfWeek !== null ? getDayName(sheetState.dayOfWeek) : undefined}
        authToken={authToken}
      />
    </div>
  );
}