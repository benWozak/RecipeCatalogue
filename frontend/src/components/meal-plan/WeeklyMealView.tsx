import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  MealPlan, 
  MealType, 
  MealPlanEntry, 
  decodeMealPlanDate, 
  getDayName, 
  getCurrentDayOfWeek,
  getCurrentWeekInRotation 
} from '@/types/mealPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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

export function WeeklyMealView({ mealPlan, onSwipeLeft, onSwipeRight }: WeeklyMealViewProps) {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekInRotation(mealPlan));
  const [currentDay] = useState(getCurrentDayOfWeek());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update week when meal plan changes
  useEffect(() => {
    setCurrentWeek(getCurrentWeekInRotation(mealPlan));
  }, [mealPlan]);

  // Get all days for the current week
  const getWeekDays = (): WeekDay[] => {
    const weekDays: WeekDay[] = [];
    
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayMeals: DayMeals = {};
      
      // Find meals for this day
      mealPlan.entries.forEach(entry => {
        const { weekNumber, dayOfWeek: entryDay } = decodeMealPlanDate(entry.date);
        if (weekNumber === currentWeek && entryDay === dayOfWeek) {
          if (entry.meal_type === MealType.BREAKFAST || 
              entry.meal_type === MealType.LUNCH || 
              entry.meal_type === MealType.DINNER) {
            dayMeals[entry.meal_type] = entry;
          }
        }
      });
      
      weekDays.push({
        dayOfWeek,
        dayName: getDayName(dayOfWeek),
        isToday: dayOfWeek === currentDay,
        meals: dayMeals
      });
    }
    
    return weekDays;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const totalWeeks = new Set(mealPlan.entries.map(entry => decodeMealPlanDate(entry.date).weekNumber)).size;
    
    if (direction === 'next') {
      if (currentWeek < totalWeeks) {
        setCurrentWeek(currentWeek + 1);
      } else {
        setCurrentWeek(1); // Loop back to first week
      }
      onSwipeLeft?.();
    } else {
      if (currentWeek > 1) {
        setCurrentWeek(currentWeek - 1);
      } else {
        setCurrentWeek(totalWeeks || 1); // Loop to last week
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
        navigateWeek('prev'); // Swipe right = previous week
      } else {
        navigateWeek('next'); // Swipe left = next week
      }
    }
    
    touchStartRef.current = null;
  };

  const weekDays = getWeekDays();
  const totalWeeks = new Set(mealPlan.entries.map(entry => decodeMealPlanDate(entry.date).weekNumber)).size;

  const mealTypeConfig = [
    { type: MealType.BREAKFAST, label: 'B', color: 'bg-orange-100 text-orange-800' },
    { type: MealType.LUNCH, label: 'L', color: 'bg-green-100 text-green-800' },
    { type: MealType.DINNER, label: 'D', color: 'bg-blue-100 text-blue-800' },
  ];

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Week Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-1"
          disabled={totalWeeks <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold">Week {currentWeek}</h2>
          <p className="text-sm text-muted-foreground">
            {totalWeeks > 1 && `of ${totalWeeks} weeks`}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="flex items-center gap-1"
          disabled={totalWeeks <= 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days Grid */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {weekDays.map((day) => (
          <Card 
            key={day.dayOfWeek} 
            className={`${day.isToday ? 'ring-2 ring-primary bg-primary/5' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${day.isToday ? 'text-primary' : ''}`}>
                  {day.dayName}
                  {day.isToday && <span className="ml-2 text-xs text-primary">Today</span>}
                </h3>
                <div className="flex gap-1">
                  {mealTypeConfig.map(({ type, label, color }) => {
                    const hasMeal = day.meals[type as keyof DayMeals];
                    return (
                      <div
                        key={type}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          hasMeal ? color : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {mealTypeConfig.map(({ type }) => {
                  const meal = day.meals[type as keyof DayMeals];
                  const typeLabels = {
                    [MealType.BREAKFAST]: 'Breakfast',
                    [MealType.LUNCH]: 'Lunch',
                    [MealType.DINNER]: 'Dinner'
                  };
                  
                  return (
                    <div key={type} className="text-sm">
                      <span className="font-medium text-muted-foreground text-xs">
                        {typeLabels[type as keyof typeof typeLabels]}:
                      </span>
                      {meal ? (
                        <div className="mt-1 flex items-center gap-2">
                          {meal.recipe_thumbnail && (
                            <div className="w-8 h-8 flex-shrink-0">
                              <img
                                src={meal.recipe_thumbnail}
                                alt={meal.recipe_title}
                                className="w-full h-full object-cover rounded"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {meal.recipe_title || 'Recipe'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meal.servings} servings
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground ml-1">No meal planned</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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