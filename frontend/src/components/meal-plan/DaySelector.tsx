import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DaySelectorProps {
  selectedDate?: string; // ISO date string
  onSelectDay: (date: string) => void;
  startDate?: string; // ISO date string for week start
  currentDate?: string; // ISO date string for today
}

export function DaySelector({ 
  selectedDate, 
  onSelectDay, 
  startDate,
  currentDate 
}: DaySelectorProps) {
  // Generate days of the week starting from Monday
  const generateWeekDays = () => {
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

  const weekDays = generateWeekDays();

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatDayShort = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const isToday = (date: Date) => {
    if (!currentDate) return false;
    const today = new Date(currentDate);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return date.toDateString() === selected.toDateString();
  };

  const getDayDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Select Day</h3>
        </div>
        
        <div className="space-y-2">
          {weekDays.map((day) => {
            const dateStr = getDayDateString(day);
            const isCurrentDay = isToday(day);
            const isDaySelected = isSelected(day);

            return (
              <Button
                key={dateStr}
                variant={isDaySelected ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-3 ${
                  isCurrentDay && !isDaySelected 
                    ? 'border-2 border-primary/50 bg-primary/5' 
                    : ''
                }`}
                onClick={() => onSelectDay(dateStr)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start">
                    <div className="font-medium">
                      {formatDayName(day)}
                    </div>
                    <div className={`text-sm ${
                      isDaySelected 
                        ? 'text-primary-foreground/80' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatMonth(day)} {formatDayNumber(day)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-lg font-semibold">
                      {formatDayShort(day)}
                    </div>
                    {isCurrentDay && (
                      <div className={`text-xs font-medium ${
                        isDaySelected 
                          ? 'text-primary-foreground' 
                          : 'text-primary'
                      }`}>
                        Today
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}