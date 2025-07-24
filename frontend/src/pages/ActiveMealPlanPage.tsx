import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { Settings, Loader2, AlertCircle } from "lucide-react";
import { MealPlan } from "@/types/mealPlan";
import { mealPlanService } from "@/services/mealPlanService";
import { DailyMealView } from "@/components/meal-plan/DailyMealView";
import { WeeklyMealView } from "@/components/meal-plan/WeeklyMealView";
import {
  MealPlanViewToggle,
  ViewMode,
} from "@/components/meal-plan/MealPlanViewToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ActiveMealPlanPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  useEffect(() => {
    loadActiveMealPlan();
  }, []);

  const loadActiveMealPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await mealPlanService.getActiveMealPlan(token);
      if (response.success) {
        if (response.data) {
          setActiveMealPlan(response.data);
        } else {
          // No active meal plan found, redirect to meal plans list
          navigate("/meal-plans/all");
          return;
        }
      } else {
        setError(response.error || "Failed to load active meal plan");
      }
    } catch (err) {
      console.error("Error loading active meal plan:", err);
      setError("Failed to load active meal plan");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">
              Error Loading Meal Plan
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadActiveMealPlan} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we reach here, we have an active meal plan (redirect happens during loading if none found)
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Your Meal Plan</h1>
              <MealPlanViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
              />
            </div>

            <div className="flex items-center gap-2">
              <Link to="/meal-plans/all">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeMealPlan &&
          (viewMode === "daily" ? (
            <DailyMealView mealPlan={activeMealPlan} />
          ) : (
            <WeeklyMealView mealPlan={activeMealPlan} />
          ))}
      </div>
    </div>
  );
}
