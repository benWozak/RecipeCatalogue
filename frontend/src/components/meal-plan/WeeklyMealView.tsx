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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface WeeklyMealViewProps {
  mealPlan: MealPlan;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface DayMeals {
  [MealType.BREAKFAST]?: MealPlanEntry;
  [MealType.LUNCH]?: MealPlanEntry;
  [MealType.DINNER]?: MealPlanEntry;
}

interface WeekDay {
  dayOfWeek: number;
  dayName: string;
  isToday: boolean;
  meals: DayMeals;
}

// Utility function to get recipe name and thumbnail from MealPlanEntry
const getRecipeInfo = (entry: MealPlanEntry) => {
  if (entry.recipe) {
    return {
      title: entry.recipe.title,
      thumbnail:
        entry.recipe.media?.stored_media?.thumbnails?.small ||
        entry.recipe.media?.stored_media?.thumbnails?.medium ||
        entry.recipe.media?.stored_media?.thumbnails?.large ||
        (entry.recipe.media?.images?.[0]
          ? typeof entry.recipe.media.images[0] === "string"
            ? entry.recipe.media.images[0]
            : entry.recipe.media.images[0].url
          : entry.recipe.media?.video_thumbnail),
      recipeId: entry.recipe.id,
    };
  }

  // Fallback to legacy fields
  return {
    title: entry.recipe_title || "Recipe",
    thumbnail: entry.recipe_thumbnail,
    recipeId: entry.recipe_id,
  };
};

// Internal component for carousel content
function WeeklyMealCarouselContent({
  mealPlan,
  currentWeek,
  onNavigateWeek,
  onSwipeLeft,
  onSwipeRight,
  carouselApi,
}: {
  mealPlan: MealPlan;
  currentWeek: number;
  onNavigateWeek: (direction: "prev" | "next") => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  carouselApi: CarouselApi | undefined;
}) {
  const navigate = useNavigate();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentDay] = useState(getCurrentDayOfWeek());

  // Get all weeks
  const getAllWeeks = () => {
    const weeks = Array.from(
      new Set(
        mealPlan.entries.map(
          (entry) => decodeMealPlanDate(entry.date).weekNumber
        )
      )
    ).sort((a, b) => a - b);
    return weeks;
  };

  const allWeeks = getAllWeeks();
  const totalWeeks = allWeeks.length;
  const currentIndex = allWeeks.indexOf(currentWeek);

  // Update scroll state and sync carousel position
  useEffect(() => {
    if (!carouselApi) return;

    const updateCanScroll = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    updateCanScroll();
    carouselApi.on("select", updateCanScroll);

    // Sync carousel position with current week
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
    onNavigateWeek("prev");
    onSwipeRight?.();
  };

  const handleNext = () => {
    carouselApi?.scrollNext();
    onNavigateWeek("next");
    onSwipeLeft?.();
  };

  // Get all days for a specific week
  const getWeekDays = (weekNumber: number): WeekDay[] => {
    const weekDays: WeekDay[] = [];

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayMeals: DayMeals = {};

      // Find meals for this day
      mealPlan.entries.forEach((entry) => {
        const { weekNumber: entryWeek, dayOfWeek: entryDay } =
          decodeMealPlanDate(entry.date);
        if (entryWeek === weekNumber && entryDay === dayOfWeek) {
          if (
            entry.meal_type === MealType.BREAKFAST ||
            entry.meal_type === MealType.LUNCH ||
            entry.meal_type === MealType.DINNER
          ) {
            dayMeals[entry.meal_type] = entry;
          }
        }
      });

      weekDays.push({
        dayOfWeek,
        dayName: getDayName(dayOfWeek),
        isToday:
          dayOfWeek === currentDay &&
          weekNumber === getCurrentWeekInRotation(mealPlan),
        meals: dayMeals,
      });
    }

    return weekDays;
  };

  const mealTypeConfig = [
    {
      type: MealType.BREAKFAST,
      label: "Breakfast",
    },
    { type: MealType.LUNCH, label: "Lunch" },
    { type: MealType.DINNER, label: "Dinner" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Week Header */}
      <div className="flex items-center justify-between p-2 sm:p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="flex items-center gap-1 text-xs sm:text-sm"
          disabled={!canScrollPrev || totalWeeks <= 1}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        <div className="text-center flex-1 mx-2">
          <h2 className="text-lg sm:text-xl font-bold">Week {currentWeek}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {totalWeeks > 1 && `of ${totalWeeks} weeks`}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="flex items-center gap-1 text-xs sm:text-sm"
          disabled={!canScrollNext || totalWeeks <= 1}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Carousel Content */}
      <CarouselContent className="flex-1 -ml-2 sm:-ml-4">
        {allWeeks.map((weekNumber) => {
          const weekDays = getWeekDays(weekNumber);

          return (
            <CarouselItem
              key={weekNumber}
              className="h-full basis-full pl-2 sm:pl-4"
            >
              <div className="h-full w-full max-w-full p-2 sm:p-4 space-y-3 overflow-y-auto">
                {weekDays.map((day) => (
                  <Card
                    key={day.dayOfWeek}
                    className={`py-2 w-full ${
                      day.isToday ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                  >
                    <CardHeader className="py-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-semibold text-base sm:text-lg ${
                            day.isToday ? "text-primary" : ""
                          }`}
                        >
                          {day.dayName}
                          {day.isToday && (
                            <span className="ml-2 text-xs text-primary">
                              Today
                            </span>
                          )}
                        </h3>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {mealTypeConfig.map(({ type }) => {
                          const meal = day.meals[type as keyof DayMeals];
                          const typeLabels = {
                            [MealType.BREAKFAST]: "Breakfast",
                            [MealType.LUNCH]: "Lunch",
                            [MealType.DINNER]: "Dinner",
                          };

                          return (
                            <div key={type} className="text-sm">
                              <span className="font-semibold text-muted-foreground">
                                {typeLabels[type as keyof typeof typeLabels]}:
                              </span>
                              {meal ? (
                                (() => {
                                  const recipeInfo = getRecipeInfo(meal);
                                  return (
                                    <div
                                      className="mt-1 flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-1 rounded transition-colors"
                                      onClick={() =>
                                        navigate(
                                          `/recipes/${recipeInfo.recipeId}`
                                        )
                                      }
                                    >
                                      {recipeInfo.thumbnail && (
                                        <div className="w-8 h-8 flex-shrink-0">
                                          <img
                                            src={recipeInfo.thumbnail}
                                            alt={recipeInfo.title}
                                            className="w-full h-full object-cover rounded"
                                            loading="lazy"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-xs sm:text-sm truncate">
                                          {recipeInfo.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {meal.servings} servings
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                <p className="text-xs text-muted-foreground ml-1">
                                  No meal planned
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {/* Swipe Indicator */}
      {totalWeeks > 1 && (
        <div className="p-2 text-center">
          <p className="text-xs text-muted-foreground">
            Swipe left or right to navigate weeks
          </p>
        </div>
      )}
    </div>
  );
}

export function WeeklyMealView({
  mealPlan,
  onSwipeLeft,
  onSwipeRight,
}: WeeklyMealViewProps) {
  const [currentWeek, setCurrentWeek] = useState(
    getCurrentWeekInRotation(mealPlan)
  );
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Update week when meal plan changes
  useEffect(() => {
    setCurrentWeek(getCurrentWeekInRotation(mealPlan));
  }, [mealPlan]);

  const navigateWeek = (direction: "prev" | "next") => {
    const totalWeeks = new Set(
      mealPlan.entries.map((entry) => decodeMealPlanDate(entry.date).weekNumber)
    ).size;

    if (direction === "next") {
      if (currentWeek < totalWeeks) {
        setCurrentWeek(currentWeek + 1);
      } else {
        setCurrentWeek(1); // Loop back to first week
      }
    } else {
      if (currentWeek > 1) {
        setCurrentWeek(currentWeek - 1);
      } else {
        setCurrentWeek(totalWeeks || 1); // Loop to last week
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
      <WeeklyMealCarouselContent
        mealPlan={mealPlan}
        currentWeek={currentWeek}
        onNavigateWeek={navigateWeek}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        carouselApi={carouselApi}
      />
    </Carousel>
  );
}
