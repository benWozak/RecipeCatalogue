import { Calendar, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ViewMode = 'daily' | 'weekly';

interface MealPlanViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function MealPlanViewToggle({ currentView, onViewChange }: MealPlanViewToggleProps) {
  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <Button
        variant={currentView === 'daily' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('daily')}
        className="flex items-center gap-2 rounded-md"
      >
        <Calendar className="h-4 w-4" />
        Daily
      </Button>
      <Button
        variant={currentView === 'weekly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('weekly')}
        className="flex items-center gap-2 rounded-md"
      >
        <CalendarDays className="h-4 w-4" />
        Weekly
      </Button>
    </div>
  );
}