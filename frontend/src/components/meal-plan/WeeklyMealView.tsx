import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MealType, MealPlan, MealPlanEntry, DayMeals } from '@/types/mealPlan';
import { DayMealCards } from './DayMealCards';
import { Button } from '@/components/ui/button';

interface WeeklyMealViewProps {
  mealPlan?: MealPlan;
  currentDate?: string; // ISO date string for the current day
  isEditing?: boolean;
  onAddMeal?: (date: string, mealType: MealType) => void;
  onEditMeal?: (entry: MealPlanEntry) => void;
}

export function WeeklyMealView({ 
  mealPlan, 
  currentDate, 
  isEditing = false,
  onAddMeal,
  onEditMeal 
}: WeeklyMealViewProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate days of the week starting from Monday
  const generateWeekDays = (startDate?: string) => {
    const today = currentDate ? new Date(currentDate) : new Date();
    const startOfWeek = startDate ? new Date(startDate) : new Date(today);
    
    // If no start date provided, get the start of current week (Monday)
    if (!startDate) {
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(today.getDate() + daysToMonday);
    }

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = generateWeekDays(mealPlan?.start_date);

  // Set initial day to today if currentDate is provided
  useEffect(() => {
    if (currentDate) {
      const todayIndex = weekDays.findIndex(day => 
        day.toISOString().split('T')[0] === currentDate.split('T')[0]
      );
      if (todayIndex !== -1) {
        setCurrentDayIndex(todayIndex);
      }
    }
  }, [currentDate, weekDays.length]);

  // Transform meal plan entries into day-organized structure
  const organizeMealsByDay = (): DayMeals[] => {
    if (!mealPlan) return [];

    const dayMealsMap = new Map<string, DayMeals>();

    // Initialize empty days
    weekDays.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      dayMealsMap.set(dateStr, {
        date: dateStr,
        meals: {
          [MealType.BREAKFAST]: undefined,
          [MealType.SNACK]: [],
          [MealType.LUNCH]: undefined,
          [MealType.DINNER]: undefined,
        }
      });
    });

    // Populate with actual meal entries
    mealPlan.entries.forEach(entry => {
      const dayMeals = dayMealsMap.get(entry.date);
      if (dayMeals) {
        if (entry.meal_type === MealType.SNACK) {
          dayMeals.meals[MealType.SNACK]!.push(entry);
        } else {
          dayMeals.meals[entry.meal_type] = entry;
        }
      }
    });

    return Array.from(dayMealsMap.values());
  };

  const dayMealsData = organizeMealsByDay();

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    if (!currentDate) return false;
    const today = new Date(currentDate);
    return date.toDateString() === today.toDateString();
  };

  const handlePrevDay = () => {
    setCurrentDayIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex(prev => Math.min(weekDays.length - 1, prev + 1));
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left - next day
        handleNextDay();
      } else {
        // Swipe right - previous day
        handlePrevDay();
      }
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Mobile view: single day
  if (isMobile) {
    const currentDay = weekDays[currentDayIndex];
    const currentDayMeals = dayMealsData[currentDayIndex];

    return (
      <div className="w-full">
        {/* Mobile day navigation */}
        <div className="flex items-center justify-between mb-4 bg-card border border-border rounded-lg p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevDay}
            disabled={currentDayIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className={`font-semibold ${isToday(currentDay) ? 'text-primary' : ''}`}>
              {formatDayName(currentDay)}
            </div>
            <div className={`text-sm ${isToday(currentDay) ? 'text-primary' : 'text-muted-foreground'}`}>
              {formatDayNumber(currentDay)}
            </div>
            {isToday(currentDay) && (
              <div className="text-xs text-primary font-medium">Today</div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextDay}
            disabled={currentDayIndex === weekDays.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile day meals */}
        <div
          ref={mobileContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="touch-pan-x"
        >
          {currentDayMeals && (
            <DayMealCards
              date={currentDayMeals.date}
              meals={currentDayMeals.meals}
              onAddMeal={onAddMeal}
              onEditMeal={onEditMeal}
              isEditing={isEditing}
            />
          )}
        </div>
      </div>
    );
  }

  // Desktop view: all days in a row
  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayMeals = dayMealsData[index];
          const dayStr = day.toISOString().split('T')[0];

          return (
            <div key={dayStr} className="flex flex-col">
              {/* Day header */}
              <div className="text-center mb-3 pb-2 border-b border-border">
                <div className={`font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
                  {formatDayName(day)}
                </div>
                <div className={`text-sm ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}>
                  {formatDayNumber(day)}
                </div>
                {isToday(day) && (
                  <div className="text-xs text-primary font-medium">Today</div>
                )}
              </div>

              {/* Day meals */}
              {dayMeals && (
                <DayMealCards
                  date={dayMeals.date}
                  meals={dayMeals.meals}
                  onAddMeal={onAddMeal}
                  onEditMeal={onEditMeal}
                  isEditing={isEditing}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}