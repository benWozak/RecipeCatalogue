import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  MealType,
  MealPlanCreate,
  MealPlanEntryCreate,
  encodeMealPlanDate,
} from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";
import { WeeklyMealPlanGrid, WeekSelector } from "@/components/meal-plan";
import { mealPlanService } from "@/services/mealPlanService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DayMealsData {
  [MealType.BREAKFAST]?: Recipe;
  [MealType.LUNCH]?: Recipe;
  [MealType.DINNER]?: Recipe;
}

interface WeekMealsData {
  [dayOfWeek: number]: DayMealsData;
}

interface MultiWeekMealsData {
  [weekNumber: number]: WeekMealsData;
}

export default function NewMealPlanPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [meals, setMeals] = useState<MultiWeekMealsData>({ 1: {} });
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total meals planned across all weeks
  const getTotalMealsCount = () => {
    return Object.values(meals).reduce((total, weekMeals) => {
      return total + Object.values(weekMeals as WeekMealsData).reduce((weekTotal, dayMeals) => {
        return weekTotal + Object.values(dayMeals).filter((meal) => meal !== undefined).length;
      }, 0);
    }, 0);
  };

  // Calculate meals for current week (kept for potential future use)
  // const getCurrentWeekMealsCount = () => {
  //   const currentWeekMeals = meals[currentWeek] || {};
  //   return Object.values(currentWeekMeals as WeekMealsData).reduce((total, dayMeals) => {
  //     return total + Object.values(dayMeals).filter((meal) => meal !== undefined).length;
  //   }, 0);
  // };

  // Convert internal meals data to API format
  const convertToApiFormat = (): MealPlanEntryCreate[] => {
    const entries: MealPlanEntryCreate[] = [];

    Object.entries(meals).forEach(([weekNumberStr, weekMeals]) => {
      const weekNumber = parseInt(weekNumberStr, 10);

      Object.entries(weekMeals as WeekMealsData).forEach(([dayOfWeekStr, dayMeals]) => {
        const dayOfWeek = parseInt(dayOfWeekStr, 10);

        Object.entries(dayMeals).forEach(([mealTypeStr, recipe]) => {
          if (recipe && (recipe as Recipe).id) {
            const mealType = mealTypeStr as MealType;
            entries.push({
              recipe_id: (recipe as Recipe).id,
              date: encodeMealPlanDate(weekNumber, dayOfWeek),
              meal_type: mealType,
              servings: 1,
            });
          }
        });
      });
    });

    return entries;
  };

  // Get meal counts for each week (for WeekSelector)
  const getWeekMealCounts = () => {
    const counts: { [weekNumber: number]: number } = {};
    Object.entries(meals).forEach(([weekNumberStr, weekMeals]) => {
      const weekNumber = parseInt(weekNumberStr, 10);
      counts[weekNumber] = Object.values(weekMeals as WeekMealsData).reduce((total, dayMeals) => {
        return total + Object.values(dayMeals).filter((meal) => meal !== undefined).length;
      }, 0);
    });
    return counts;
  };

  // Week management functions
  const handleWeekChange = (weekNumber: number) => {
    setCurrentWeek(weekNumber);
    setError(null); // Clear any errors when switching weeks
  };

  const handleAddWeek = () => {
    const newWeekNumber = totalWeeks + 1;
    setTotalWeeks(newWeekNumber);
    setMeals(prev => ({ ...prev, [newWeekNumber]: {} }));
    setCurrentWeek(newWeekNumber); // Switch to new week
  };

  const handleRemoveWeek = () => {
    if (totalWeeks <= 1) return;
    
    const newMeals = { ...meals };
    delete newMeals[totalWeeks]; // Remove the last week
    
    setMeals(newMeals);
    setTotalWeeks(totalWeeks - 1);
    
    // If we were on the removed week, switch to previous week
    if (currentWeek === totalWeeks) {
      setCurrentWeek(totalWeeks - 1);
    }
  };

  // Handle meal changes for the current week
  const handleCurrentWeekMealsChange = (weekMeals: WeekMealsData) => {
    setMeals(prev => ({
      ...prev,
      [currentWeek]: weekMeals
    }));
  };

  const validateForm = () => {
    if (getTotalMealsCount() === 0) {
      setError("Please add at least one meal to your plan");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Convert meals to API format
      const entries = convertToApiFormat();

      // Generate a simple name and calculate date range
      const now = new Date();
      const planName = `Meal Plan - ${now.toLocaleDateString()}`;
      const startDate = now.toISOString().split("T")[0];
      const endDate = new Date(now.getTime() + (totalWeeks * 7 * 24 * 60 * 60 * 1000))
        .toISOString()
        .split("T")[0];

      const mealPlanData: MealPlanCreate = {
        name: planName,
        start_date: startDate,
        end_date: endDate,
        entries,
      };

      const response = await mealPlanService.createMealPlan(
        mealPlanData,
        token
      );
      if (response.success) {
        navigate("/meal-plans");
      } else {
        setError(response.error || "Failed to create meal plan");
      }
    } catch (err) {
      console.error("Error creating meal plan:", err);
      setError("Failed to create meal plan");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">
            Create Meal Plan
          </h1>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Instructions */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Plan Your Weeks</h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Click "Add Recipe" under any meal to start building your meal plan. 
                Add multiple weeks to create a rotation, and switch between weeks to plan each one.
              </p>
            </CardContent>
          </Card>

          {/* Week Selector */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <WeekSelector
                currentWeek={currentWeek}
                totalWeeks={totalWeeks}
                onWeekChange={handleWeekChange}
                onAddWeek={handleAddWeek}
                onRemoveWeek={handleRemoveWeek}
                weekMealCounts={getWeekMealCounts()}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* Weekly Meal Plan Grid */}
          <Card>
            <CardContent className="p-6">
              <WeeklyMealPlanGrid
                weekNumber={currentWeek}
                meals={meals[currentWeek] || {}}
                onMealsChange={handleCurrentWeekMealsChange}
                authToken={getToken}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mt-6 border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-destructive font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              {getTotalMealsCount() > 0
                ? `${getTotalMealsCount()} meal${
                    getTotalMealsCount() !== 1 ? "s" : ""
                  } planned across ${totalWeeks} week${totalWeeks !== 1 ? "s" : ""}`
                : "No meals planned yet"}
            </div>

            <div className="flex gap-4">
              <Link
                to="/meal-plans"
                className="bg-secondary text-foreground px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors flex items-center"
              >
                Cancel
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={loading || getTotalMealsCount() === 0}
                className="flex items-center gap-2 px-6"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {loading ? "Creating..." : "Create Meal Plan"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
