import { MealType, getDayName } from '@/types/mealPlan';
import { Recipe } from '@/types/recipe';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MealSlot } from './MealSlot';

interface DayMealsData {
  [MealType.BREAKFAST]?: Recipe;
  [MealType.LUNCH]?: Recipe;
  [MealType.DINNER]?: Recipe;
}

interface DayMealSlotsProps {
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  meals: DayMealsData;
  onAddRecipe: (dayOfWeek: number, mealType: MealType) => void;
  onRemoveRecipe?: (dayOfWeek: number, mealType: MealType) => void;
  disabled?: boolean;
}

export function DayMealSlots({ 
  dayOfWeek, 
  meals, 
  onAddRecipe, 
  onRemoveRecipe, 
  disabled = false 
}: DayMealSlotsProps) {
  const dayName = getDayName(dayOfWeek);
  
  // Count assigned meals for this day
  const assignedMealsCount = Object.values(meals).filter(meal => meal !== undefined).length;
  
  const mealTypes = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="text-center">
          <h3 className="font-semibold text-lg">{dayName}</h3>
          <p className="text-sm text-muted-foreground">
            {assignedMealsCount} of 3 meals planned
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {mealTypes.map((mealType) => (
            <MealSlot
              key={mealType}
              mealType={mealType}
              recipe={meals[mealType as keyof DayMealsData]}
              onAddRecipe={(type) => onAddRecipe(dayOfWeek, type)}
              onRemoveRecipe={onRemoveRecipe ? (type) => onRemoveRecipe(dayOfWeek, type) : undefined}
              disabled={disabled}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}