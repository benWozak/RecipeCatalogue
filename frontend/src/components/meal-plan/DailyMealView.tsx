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

export function DailyMealView({ mealPlan, onSwipeLeft, onSwipeRight }: DailyMealViewProps) {
  const [currentDay, setCurrentDay] = useState(getCurrentDayOfWeek());
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekInRotation(mealPlan));
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update week when meal plan changes
  useEffect(() => {
    setCurrentWeek(getCurrentWeekInRotation(mealPlan));
  }, [mealPlan]);

  // Get meals for the current day and week
  const getCurrentDayMeals = (): DayMeals => {
    const dayMeals: DayMeals = {};
    
    mealPlan.entries.forEach(entry => {
      const { weekNumber, dayOfWeek } = decodeMealPlanDate(entry.date);
      if (weekNumber === currentWeek && dayOfWeek === currentDay) {
        if (entry.meal_type === MealType.BREAKFAST || 
            entry.meal_type === MealType.LUNCH || 
            entry.meal_type === MealType.DINNER) {
          dayMeals[entry.meal_type] = entry;
        }
      }
    });
    
    return dayMeals;
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const totalWeeks = new Set(mealPlan.entries.map(entry => decodeMealPlanDate(entry.date).weekNumber)).size;
    
    if (direction === 'next') {
      if (currentDay === 6) { // Sunday
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
      if (currentDay === 0) { // Monday
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
        navigateDay('prev'); // Swipe right = previous day
      } else {
        navigateDay('next'); // Swipe left = next day
      }
    }
    
    touchStartRef.current = null;
  };

  const dayMeals = getCurrentDayMeals();
  const dayName = getDayName(currentDay);
  const isToday = currentDay === getCurrentDayOfWeek();

  const mealTypes = [
    { type: MealType.BREAKFAST, label: 'Breakfast', color: 'bg-orange-50 border-orange-200' },
    { type: MealType.LUNCH, label: 'Lunch', color: 'bg-green-50 border-green-200' },
    { type: MealType.DINNER, label: 'Dinner', color: 'bg-blue-50 border-blue-200' },
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
          onClick={() => navigateDay('prev')}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="text-center">
          <h2 className={`text-xl font-bold ${isToday ? 'text-primary' : ''}`}>
            {dayName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Week {currentWeek} {isToday && '• Today'}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateDay('next')}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Meals for the Day */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {mealTypes.map(({ type, label, color }) => {
          const meal = dayMeals[type as keyof DayMeals];
          
          return (
            <Card key={type} className={`${color} min-h-[120px]`}>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-lg">{label}</h3>
              </CardHeader>
              <CardContent className="pt-0">
                {meal ? (
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-3">
                      {meal.recipe_thumbnail && (
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={meal.recipe_thumbnail}
                            alt={meal.recipe_title}
                            className="w-full h-full object-cover rounded"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-base mb-1">
                          {meal.recipe_title || 'Recipe'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Servings: {meal.servings}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No meal planned</p>
                  </div>
                )}
              </CardContent>
            </Card>
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