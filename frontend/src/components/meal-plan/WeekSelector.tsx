import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
  onAddWeek: () => void;
  onRemoveWeek: () => void;
  weekMealCounts: { [weekNumber: number]: number };
  disabled?: boolean;
}

export function WeekSelector({
  currentWeek,
  totalWeeks,
  onWeekChange,
  onAddWeek,
  onRemoveWeek,
  weekMealCounts,
  disabled = false
}: WeekSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Week Management Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Week Planning</h3>
          <Badge variant="secondary">
            {totalWeeks} week{totalWeeks !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddWeek}
            disabled={disabled || totalWeeks >= 12} // Reasonable max limit
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Week
          </Button>
          
          {totalWeeks > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveWeek}
              disabled={disabled}
              className="flex items-center gap-1"
            >
              <Minus className="h-4 w-4" />
              Remove Week
            </Button>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWeekChange(currentWeek - 1)}
            disabled={disabled || currentWeek === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center min-w-[120px]">
            <div className="font-semibold">Week {currentWeek}</div>
            <div className="text-sm text-muted-foreground">
              {weekMealCounts[currentWeek] || 0} meals planned
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWeekChange(currentWeek + 1)}
            disabled={disabled || currentWeek === totalWeeks}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Tabs for larger screens */}
        <div className="hidden md:flex items-center gap-1">
          {Array.from({ length: totalWeeks }, (_, index) => {
            const weekNumber = index + 1;
            const isActive = weekNumber === currentWeek;
            const mealCount = weekMealCounts[weekNumber] || 0;
            
            return (
              <Button
                key={weekNumber}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onWeekChange(weekNumber)}
                disabled={disabled}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
              >
                <span className="text-xs font-medium">Week {weekNumber}</span>
                <span className="text-xs opacity-75">
                  {mealCount} meal{mealCount !== 1 ? 's' : ''}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Mobile week indicator */}
        <div className="md:hidden text-sm text-muted-foreground">
          {currentWeek} of {totalWeeks}
        </div>
      </div>

      {/* Mobile Week Tabs - Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {Array.from({ length: totalWeeks }, (_, index) => {
            const weekNumber = index + 1;
            const isActive = weekNumber === currentWeek;
            const mealCount = weekMealCounts[weekNumber] || 0;
            
            return (
              <Button
                key={weekNumber}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onWeekChange(weekNumber)}
                disabled={disabled}
                className="flex-shrink-0 flex flex-col items-center gap-1 h-auto py-2 px-3"
              >
                <span className="text-xs font-medium">Week {weekNumber}</span>
                <span className="text-xs opacity-75">
                  {mealCount}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}