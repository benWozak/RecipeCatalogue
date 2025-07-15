import { Link } from 'react-router';
import { MoreVertical, Edit, Trash2, Users, RotateCcw } from 'lucide-react';
import { MealPlan, decodeMealPlanDate } from '@/types/mealPlan';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface MealPlanCardProps {
  mealPlan: MealPlan;
  onEdit?: (mealPlan: MealPlan) => void;
  onDelete?: (mealPlan: MealPlan) => void;
}

export function MealPlanCard({ mealPlan, onEdit, onDelete }: MealPlanCardProps) {
  const getRotationInfo = () => {
    if (mealPlan.entries.length === 0) {
      return { weekCount: 0, dayCount: 0 };
    }

    const weeks = new Set<number>();
    const days = new Set<string>();
    
    mealPlan.entries.forEach(entry => {
      const { weekNumber, dayOfWeek } = decodeMealPlanDate(entry.date);
      weeks.add(weekNumber);
      days.add(`${weekNumber}-${dayOfWeek}`);
    });

    return {
      weekCount: weeks.size,
      dayCount: days.size
    };
  };

  const getMealCount = () => {
    return mealPlan.entries.length;
  };

  const getRotationDescription = () => {
    const { weekCount } = getRotationInfo();
    
    if (weekCount === 0) {
      return 'No meals planned';
    }
    
    if (weekCount === 1) {
      return 'Single week rotation';
    }
    
    return `${weekCount} week rotation`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/meal-plans/${mealPlan.id}`} 
              className="block hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-lg leading-tight truncate mb-1">
                Meal Plan
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-2">
              {getRotationDescription()}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(mealPlan)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(mealPlan)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              <span>{getRotationInfo().weekCount} week{getRotationInfo().weekCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{getMealCount()} meals</span>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            Rotation
          </Badge>
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            Created {new Date(mealPlan.created_at).toLocaleDateString()}
          </span>
          <Link 
            to={`/meal-plans/${mealPlan.id}`}
            className="text-primary hover:text-primary/80 font-medium"
          >
            View Plan →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}