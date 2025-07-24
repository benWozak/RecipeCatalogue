import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { MealPlan } from "@/types/mealPlan";
import { MealPlanCard } from "@/components/meal-plan";
import { mealPlanService } from "@/services/mealPlanService";

export default function MealPlansPage() {
  const { getToken } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await mealPlanService.getMealPlans({}, token);
      if (response.success && response.data) {
        setMealPlans(response.data.meal_plans || []);
      } else {
        setError(response.error || "Failed to load meal plans");
      }
    } catch (err) {
      console.error("Error loading meal plans:", err);
      setError("Failed to load meal plans");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMealPlan = (mealPlan: MealPlan) => {
    // Navigate to edit page
    window.location.href = `/meal-plans/${mealPlan.id}/edit`;
  };

  const handleDeleteMealPlan = async (mealPlan: MealPlan) => {
    if (!confirm(`Are you sure you want to delete "${mealPlan.name}"?`)) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const response = await mealPlanService.deleteMealPlan(mealPlan.id, token);
      if (response.success) {
        setMealPlans((prev) => prev.filter((mp) => mp.id !== mealPlan.id));
      } else {
        alert("Failed to delete meal plan");
      }
    } catch (err) {
      console.error("Error deleting meal plan:", err);
      alert("Failed to delete meal plan");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meal Plans</h1>
          <Link
            to="/meal-plans/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Plan
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Loading meal plans...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive font-medium mb-4">{error}</p>
            <button
              onClick={loadMealPlans}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.length === 0 ? (
              <div className="col-span-full bg-card border border-border rounded-lg p-6 text-center text-card-foreground">
                <Calendar
                  size={48}
                  className="mx-auto mb-4 text-muted-foreground"
                />
                <p className="mb-4">
                  No meal plans yet. Create your first weekly rotation to get
                  started!
                </p>
                <Link
                  to="/meal-plans/new"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                  Create Your First Plan
                </Link>
              </div>
            ) : (
              mealPlans.map((mealPlan) => (
                <MealPlanCard
                  key={mealPlan.id}
                  mealPlan={mealPlan}
                  onEdit={handleEditMealPlan}
                  onDelete={handleDeleteMealPlan}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
