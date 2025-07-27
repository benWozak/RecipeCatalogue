import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import {
  MealPlan,
  MealType,
  MealPlanEntry,
  decodeMealPlanDate,
  getDayName,
  getCurrentDayOfWeek,
  getCurrentWeekInRotation,
} from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { MiniRecipeCard } from "./MiniRecipeCard";

interface DailyMealViewProps {
  mealPlan: MealPlan;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface DayMeals {
  [MealType.BREAKFAST]?: MealPlanEntry;
  [MealType.LUNCH]?: MealPlanEntry;
  [MealType.DINNER]?: MealPlanEntry;
}

// Utility function to convert MealPlanEntry to Recipe format for MiniRecipeCard
const convertMealPlanEntryToRecipe = (entry: MealPlanEntry): Recipe | null => {
  // If we have enhanced recipe details from the API, use them
  if (entry.recipe) {
    return {
      id: entry.recipe.id,
      title: entry.recipe.title,
      media: entry.recipe.media,
      // Add other required Recipe fields with defaults
      user_id: "",
      description: undefined,
      prep_time: undefined,
      cook_time: undefined,
      total_time: undefined,
      servings: entry.servings,
      source_type: "manual" as const,
      source_url: entry.recipe.source_url,
      instructions: undefined,
      ingredients: undefined,
      tags: [],
      collection_id: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Fallback to legacy fields if available
  if (entry.recipe_title) {
    return {
      id: entry.recipe_id,
      title: entry.recipe_title,
      media: entry.recipe_thumbnail
        ? {
            images: [entry.recipe_thumbnail],
          }
        : undefined,
      // Add other required Recipe fields with defaults
      user_id: "",
      description: undefined,
      prep_time: undefined,
      cook_time: undefined,
      total_time: undefined,
      servings: entry.servings,
      source_type: "manual" as const,
      source_url: undefined,
      instructions: undefined,
      ingredients: undefined,
      tags: [],
      collection_id: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return null;
};

export function DailyMealView({
  mealPlan,
  onSwipeLeft,
  onSwipeRight,
}: DailyMealViewProps) {
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(getCurrentDayOfWeek());
  const [currentWeek, setCurrentWeek] = useState(
    getCurrentWeekInRotation(mealPlan)
  );
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update week when meal plan changes
  useEffect(() => {
    setCurrentWeek(getCurrentWeekInRotation(mealPlan));
  }, [mealPlan]);

  // Get meals for the current day and week
  const getCurrentDayMeals = (): DayMeals => {
    const dayMeals: DayMeals = {};

    mealPlan.entries.forEach((entry) => {
      const { weekNumber, dayOfWeek } = decodeMealPlanDate(entry.date);
      if (weekNumber === currentWeek && dayOfWeek === currentDay) {
        if (
          entry.meal_type === MealType.BREAKFAST ||
          entry.meal_type === MealType.LUNCH ||
          entry.meal_type === MealType.DINNER
        ) {
          dayMeals[entry.meal_type] = entry;
        }
      }
    });

    return dayMeals;
  };

  const navigateDay = (direction: "prev" | "next") => {
    const totalWeeks = new Set(
      mealPlan.entries.map((entry) => decodeMealPlanDate(entry.date).weekNumber)
    ).size;

    if (direction === "next") {
      if (currentDay === 6) {
        // Sunday
        setCurrentDay(0); // Monday
        if (currentWeek < totalWeeks) {
          setCurrentWeek(currentWeek + 1);
        } else {
          setCurrentWeek(1); // Loop back to first week
        }
      } else {
        setCurrentDay(currentDay + 1);
      }
      onSwipeLeft?.();
    } else {
      if (currentDay === 0) {
        // Monday
        setCurrentDay(6); // Sunday
        if (currentWeek > 1) {
          setCurrentWeek(currentWeek - 1);
        } else {
          setCurrentWeek(totalWeeks || 1); // Loop to last week
        }
      } else {
        setCurrentDay(currentDay - 1);
      }
      onSwipeRight?.();
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        navigateDay("prev"); // Swipe right = previous day
      } else {
        navigateDay("next"); // Swipe left = next day
      }
    }

    touchStartRef.current = null;
  };

  const dayMeals = getCurrentDayMeals();
  const dayName = getDayName(currentDay);
  const isToday = currentDay === getCurrentDayOfWeek();

  const mealTypes = [
    {
      type: MealType.BREAKFAST,
      label: "Breakfast",
    },
    {
      type: MealType.LUNCH,
      label: "Lunch",
    },
    {
      type: MealType.DINNER,
      label: "Dinner",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateDay("prev")}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-center">
          <h2 className={`text-xl font-bold ${isToday ? "text-primary" : ""}`}>
            {dayName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Week {currentWeek} {isToday && "• Today"}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateDay("next")}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Meals for the Day */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {mealTypes.map(({ type, label }) => {
          const meal = dayMeals[type as keyof DayMeals];

          return (
            <div key={type}>
              <div>
                <h3 className="font-semibold text-lg">{label}</h3>
              </div>
              <div>
                {meal ? (
                  (() => {
                    const recipeData = convertMealPlanEntryToRecipe(meal);
                    return recipeData ? (
                      <MiniRecipeCard
                        recipe={recipeData}
                        onClick={() => navigate(`/recipes/${meal.recipe_id}`)}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                      />
                    ) : (
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-base mb-1">
                              Recipe (ID: {meal.recipe_id})
                            </h4>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No meal planned</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Swipe Indicator */}
      <div className="p-2 text-center">
        <p className="text-xs text-muted-foreground">
          Swipe left or right to navigate days
        </p>
      </div>
    </div>
  );
}
