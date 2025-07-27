import { useState, useEffect } from "react";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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

// Internal component for carousel content
function DailyMealCarouselContent({
  mealPlan,
  currentDay,
  currentWeek,
  onNavigateDay,
  onSwipeLeft,
  onSwipeRight,
  carouselApi,
}: {
  mealPlan: MealPlan;
  currentDay: number;
  currentWeek: number;
  onNavigateDay: (direction: "prev" | "next") => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  carouselApi: CarouselApi | undefined;
}) {
  const navigate = useNavigate();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Get all possible day/week combinations
  const getAllDayCombinations = () => {
    const combinations: Array<{
      day: number;
      week: number;
      dayName: string;
      isToday: boolean;
    }> = [];
    const totalWeeks = new Set(
      mealPlan.entries.map((entry) => decodeMealPlanDate(entry.date).weekNumber)
    ).size;

    for (let week = 1; week <= totalWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        combinations.push({
          day,
          week,
          dayName: getDayName(day),
          isToday:
            day === getCurrentDayOfWeek() &&
            week === getCurrentWeekInRotation(mealPlan),
        });
      }
    }
    return combinations;
  };

  const dayCombinations = getAllDayCombinations();
  const currentIndex = dayCombinations.findIndex(
    (combo) => combo.day === currentDay && combo.week === currentWeek
  );

  // Update scroll state and sync carousel position
  useEffect(() => {
    if (!carouselApi) return;

    const updateCanScroll = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    updateCanScroll();
    carouselApi.on("select", updateCanScroll);

    // Sync carousel position with current day/week
    if (currentIndex >= 0) {
      carouselApi.scrollTo(currentIndex);
    }

    return () => {
      carouselApi.off("select", updateCanScroll);
    };
  }, [carouselApi, currentIndex]);

  // Handle carousel navigation
  const handlePrevious = () => {
    carouselApi?.scrollPrev();
    onNavigateDay("prev");
    onSwipeRight?.();
  };

  const handleNext = () => {
    carouselApi?.scrollNext();
    onNavigateDay("next");
    onSwipeLeft?.();
  };

  // Get meals for a specific day and week
  const getDayMeals = (day: number, week: number): DayMeals => {
    const dayMeals: DayMeals = {};

    mealPlan.entries.forEach((entry) => {
      const { weekNumber, dayOfWeek } = decodeMealPlanDate(entry.date);
      if (weekNumber === week && dayOfWeek === day) {
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
    <div className="h-full flex flex-col">
      {/* Day Header */}
      <div className="flex items-center justify-between p-2 sm:p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="flex items-center gap-1 text-xs sm:text-sm"
          disabled={!canScrollPrev}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        <div className="text-center flex-1 mx-2">
          <h2
            className={`text-lg sm:text-xl font-bold ${
              dayCombinations[currentIndex]?.isToday ? "text-primary" : ""
            }`}
          >
            {dayCombinations[currentIndex]?.dayName}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Week {currentWeek}{" "}
            {dayCombinations[currentIndex]?.isToday && "• Today"}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="flex items-center gap-1 text-xs sm:text-sm"
          disabled={!canScrollNext}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Carousel Content */}
      <CarouselContent className="flex-1 -ml-2 sm:-ml-4">
        {dayCombinations.map((combo) => {
          const dayMeals = getDayMeals(combo.day, combo.week);

          return (
            <CarouselItem key={`${combo.week}-${combo.day}`} className="h-full basis-full pl-2 sm:pl-4">
              <div className="h-full w-full max-w-full p-2 sm:p-4 space-y-2 sm:space-y-4 overflow-y-auto">
                {mealTypes.map(({ type, label }) => {
                  const meal = dayMeals[type as keyof DayMeals];

                  return (
                    <div key={type}>
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg">{label}</h3>
                      </div>
                      <div>
                        {meal ? (
                          (() => {
                            const recipeData =
                              convertMealPlanEntryToRecipe(meal);
                            return recipeData ? (
                              <MiniRecipeCard
                                recipe={recipeData}
                                onClick={() =>
                                  navigate(`/recipes/${meal.recipe_id}`)
                                }
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
                          <div className="text-center py-4 sm:py-8 text-muted-foreground">
                            <p className="text-xs sm:text-sm">No meal planned</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {/* Swipe Indicator */}
      <div className="p-1 sm:p-2 text-center">
        <p className="text-xs text-muted-foreground">
          Swipe left or right to navigate days
        </p>
      </div>
    </div>
  );
}

export function DailyMealView({
  mealPlan,
  onSwipeLeft,
  onSwipeRight,
}: DailyMealViewProps) {
  const [currentDay, setCurrentDay] = useState(getCurrentDayOfWeek());
  const [currentWeek, setCurrentWeek] = useState(
    getCurrentWeekInRotation(mealPlan)
  );
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Update week when meal plan changes
  useEffect(() => {
    setCurrentWeek(getCurrentWeekInRotation(mealPlan));
  }, [mealPlan]);

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
    }
  };

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        containScroll: "trimSnaps",
      }}
      setApi={setCarouselApi}
      className="h-full w-full"
    >
      <DailyMealCarouselContent
        mealPlan={mealPlan}
        currentDay={currentDay}
        currentWeek={currentWeek}
        onNavigateDay={navigateDay}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        carouselApi={carouselApi}
      />
    </Carousel>
  );
}
