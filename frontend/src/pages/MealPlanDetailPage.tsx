import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Edit, Loader2, Calendar, Users, RotateCcw } from 'lucide-react';
import { MealPlan, decodeMealPlanDate, WeekPlan, getDayName } from '@/types/mealPlan';
import { mealPlanService } from '@/services/mealPlanService';

export default function MealPlanDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadMealPlan(id);
    }
  }, [id]);

  const loadMealPlan = async (mealPlanId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await mealPlanService.getMealPlan(mealPlanId, token);
      if (response.success && response.data) {
        setMealPlan(response.data);
      } else {
        setError(response.error || 'Failed to load meal plan');
      }
    } catch (err) {
      setError('Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  };

  const getRotationInfo = () => {
    if (!mealPlan || mealPlan.entries.length === 0) {
      return { weekCount: 0, totalMeals: 0, weeks: [] };
    }

    const weekMap = new Map<number, any>();
    
    mealPlan.entries.forEach(entry => {
      const { weekNumber, dayOfWeek } = decodeMealPlanDate(entry.date);
      
      if (!weekMap.has(weekNumber)) {
        weekMap.set(weekNumber, {
          week_number: weekNumber,
          days: new Map(),
          total_meals: 0
        });
      }
      
      const week = weekMap.get(weekNumber)!;
      if (!week.days.has(dayOfWeek)) {
        week.days.set(dayOfWeek, []);
      }
      
      week.days.get(dayOfWeek)!.push(entry);
      week.total_meals++;
    });

    const weeks = Array.from(weekMap.values()).sort((a, b) => a.week_number - b.week_number);
    
    return {
      weekCount: weeks.length,
      totalMeals: mealPlan.entries.length,
      weeks
    };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading meal plan...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/meal-plans"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Meal Plan</h1>
          </div>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive font-medium mb-4">{error}</p>
            <Link 
              to="/meal-plans"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Meal Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/meal-plans"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Meal Plan</h1>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">Meal plan not found</p>
            <Link 
              to="/meal-plans"
              className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Meal Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/meal-plans"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Meal Plan</h1>
            <p className="text-muted-foreground">{getRotationDescription()}</p>
          </div>
          <Link
            to={`/meal-plans/${mealPlan.id}/edit`}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Plan
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Week Rotation</div>
                <div className="font-semibold">{getRotationInfo().weekCount} week{getRotationInfo().weekCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Meals</div>
                <div className="font-semibold">{getRotationInfo().totalMeals}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-semibold">
                  {new Date(mealPlan.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rotation View */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Rotation Schedule</h2>
          
          {getRotationInfo().totalMeals === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No meals planned yet</p>
              <Link
                to={`/meal-plans/${mealPlan.id}/edit`}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Meals
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {getRotationInfo().weeks.map((week) => (
                <div key={week.week_number} className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Week {week.week_number}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({week.total_meals} meals)
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const dayName = getDayName(dayIndex);
                      const dayMeals = week.days.get(dayIndex) || [];
                      
                      return (
                        <div key={dayIndex} className="bg-muted/30 rounded-lg p-3">
                          <div className="font-medium text-sm mb-2">{dayName}</div>
                          <div className="space-y-1">
                            {dayMeals.length === 0 ? (
                              <div className="text-xs text-muted-foreground">No meals</div>
                            ) : (
                              dayMeals.map((entry, index) => (
                                <div key={index} className="text-xs p-1 bg-background rounded border border-border">
                                  <div className="font-medium">{entry.meal_type}</div>
                                  <div className="text-muted-foreground truncate">
                                    {entry.recipe_title || 'Recipe'}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}