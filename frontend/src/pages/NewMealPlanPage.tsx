import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Save, Loader2, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  MealType, 
  MealPlanCreate, 
  MealPlanEntryCreate, 
  RecipeForMealPlan,
  WeekMealAssignment,
  encodeMealPlanDate,
  getDayName
} from '@/types/mealPlan';
import { RecipeSelectionDialog, MealTypeDropZones } from '@/components/meal-plan';
import { mealPlanService } from '@/services/mealPlanService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NewMealPlanPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [totalWeeks, setTotalWeeks] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<{ week: number; day: number } | null>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [showMealTypeDialog, setShowMealTypeDialog] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<RecipeForMealPlan[]>([]);
  const [tempMealAssignments, setTempMealAssignments] = useState<WeekMealAssignment[]>([]);
  const [weekMealPlans, setWeekMealPlans] = useState<Map<string, WeekMealAssignment[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDaySelect = (weekNumber: number, dayOfWeek: number) => {
    setSelectedDay({ week: weekNumber, day: dayOfWeek });
    setShowRecipeDialog(true);
  };

  const handleRecipeSelection = (recipes: RecipeForMealPlan[], mealTypes: MealType[]) => {
    setSelectedRecipes(recipes);
    const assignments: WeekMealAssignment[] = recipes.map((recipe, index) => ({
      week_number: selectedDay!.week,
      day_of_week: selectedDay!.day,
      meal_type: mealTypes[index],
      recipe
    }));
    setTempMealAssignments(assignments);
    setShowRecipeDialog(false);
    setShowMealTypeDialog(true);
  };

  const handleMealAssignmentsChange = (assignments: { mealType: MealType; recipe: RecipeForMealPlan }[]) => {
    if (!selectedDay) return;
    
    const weekAssignments: WeekMealAssignment[] = assignments.map(assignment => ({
      week_number: selectedDay.week,
      day_of_week: selectedDay.day,
      meal_type: assignment.mealType,
      recipe: assignment.recipe
    }));
    setTempMealAssignments(weekAssignments);
  };

  const handleConfirmMealAssignments = () => {
    if (selectedDay) {
      const key = `${selectedDay.week}-${selectedDay.day}`;
      setWeekMealPlans(prev => new Map(prev.set(key, [...tempMealAssignments])));
    }
    setShowMealTypeDialog(false);
    setSelectedDay(null);
    setSelectedRecipes([]);
    setTempMealAssignments([]);
  };

  const handleCloseMealTypeDialog = () => {
    setShowMealTypeDialog(false);
    setSelectedDay(null);
    setSelectedRecipes([]);
    setTempMealAssignments([]);
  };

  const handleCloseRecipeDialog = () => {
    setShowRecipeDialog(false);
    setSelectedDay(null);
  };

  const addWeek = () => {
    setTotalWeeks(prev => prev + 1);
  };

  const removeWeek = () => {
    if (totalWeeks > 1) {
      // Remove all meals for this week
      const newWeekMealPlans = new Map(weekMealPlans);
      for (let day = 0; day < 7; day++) {
        newWeekMealPlans.delete(`${totalWeeks}-${day}`);
      }
      setWeekMealPlans(newWeekMealPlans);
      setTotalWeeks(prev => prev - 1);
      
      // Switch to a valid week if we're on the removed week
      if (selectedWeek >= totalWeeks) {
        setSelectedWeek(totalWeeks - 1);
      }
    }
  };

  const validateForm = () => {
    if (weekMealPlans.size === 0) {
      setError('Please add meals for at least one day');
      return false;
    }
    return true;
  };

  const getMealCountForWeek = (weekNumber: number) => {
    let count = 0;
    for (let day = 0; day < 7; day++) {
      const key = `${weekNumber}-${day}`;
      const assignments = weekMealPlans.get(key);
      if (assignments) {
        count += assignments.length;
      }
    }
    return count;
  };

  const getTotalMealCount = () => {
    return Array.from(weekMealPlans.values()).reduce((total, assignments) => total + assignments.length, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Convert week meal plans to meal plan entries
      const entries: MealPlanEntryCreate[] = [];
      weekMealPlans.forEach((assignments) => {
        assignments.forEach(assignment => {
          entries.push({
            recipe_id: assignment.recipe.id,
            date: encodeMealPlanDate(assignment.week_number, assignment.day_of_week),
            meal_type: assignment.meal_type,
            servings: 1
          });
        });
      });

      // Generate a simple name and calculate date range
      const now = new Date();
      const planName = `Meal Plan - ${now.toLocaleDateString()}`;
      const startDate = now.toISOString().split('T')[0];
      const endDate = new Date(now.getTime() + (totalWeeks * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

      const mealPlanData: MealPlanCreate = {
        name: planName,
        start_date: startDate,
        end_date: endDate,
        entries
      };

      const response = await mealPlanService.createMealPlan(mealPlanData, token);
      if (response.success) {
        navigate('/meal-plans');
      } else {
        setError(response.error || 'Failed to create meal plan');
      }
    } catch (err) {
      setError('Failed to create meal plan');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Create Meal Plan</h1>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          {/* Week Management */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weekly Rotation</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWeek}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Week
                </Button>
                {totalWeeks > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeWeek}
                    className="flex items-center gap-1"
                  >
                    <Minus size={16} />
                    Remove Week
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{totalWeeks} week{totalWeeks !== 1 ? 's' : ''} in rotation</span>
              <span>•</span>
              <span>{getTotalMealCount()} total meals planned</span>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Week {selectedWeek} of {totalWeeks}</h4>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                  disabled={selectedWeek === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWeek(Math.min(totalWeeks, selectedWeek + 1))}
                  disabled={selectedWeek === totalWeeks}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">
              {getMealCountForWeek(selectedWeek)} meals planned for this week
            </div>
          </div>

          {/* Weekly Day Grid */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Select a day to add meals:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayName = getDayName(dayIndex);
                const key = `${selectedWeek}-${dayIndex}`;
                const dayMeals = weekMealPlans.get(key) || [];
                
                return (
                  <Card 
                    key={dayIndex}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleDaySelect(selectedWeek, dayIndex)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="font-medium text-sm mb-1">{dayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Planned Meals Summary */}
          {getTotalMealCount() > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Rotation Summary:</h4>
              <div className="space-y-3">
                {Array.from({ length: totalWeeks }, (_, weekIndex) => {
                  const weekNumber = weekIndex + 1;
                  const weekMealCount = getMealCountForWeek(weekNumber);
                  
                  return (
                    <div key={weekNumber} className="bg-muted/30 rounded-lg p-3">
                      <div className="font-medium text-sm mb-2">Week {weekNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {weekMealCount} meal{weekMealCount !== 1 ? 's' : ''} planned
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || getTotalMealCount() === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? 'Creating...' : 'Create Meal Plan'}
            </Button>
            <Link 
              to="/meal-plans"
              className="bg-secondary text-foreground px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors flex items-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>

      {/* Recipe Selection Dialog */}
      {showRecipeDialog && selectedDay && (
        <RecipeSelectionDialog
          isOpen={showRecipeDialog}
          onClose={handleCloseRecipeDialog}
          onSelectRecipes={handleRecipeSelection}
          date={`${selectedDay.week}-${selectedDay.day}`}
          authToken={getToken}
        />
      )}

      {/* Meal Type Drop Zones Dialog */}
      {showMealTypeDialog && selectedDay && (
        <MealTypeDropZones
          selectedRecipes={selectedRecipes}
          assignments={tempMealAssignments.map(a => ({ mealType: a.meal_type, recipe: a.recipe }))}
          onAssignmentsChange={handleMealAssignmentsChange}
          onClose={handleCloseMealTypeDialog}
          onConfirm={handleConfirmMealAssignments}
          date={`Week ${selectedDay.week} - ${getDayName(selectedDay.day)}`}
        />
      )}
    </div>
  );
}