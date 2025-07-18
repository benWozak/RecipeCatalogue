import { useUser as useClerkUser, useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { UserStats } from "@/types/user";
import { recipeService } from "@/services/recipeService";
import { mealPlanService } from "@/services/mealPlanService";

export function useUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();
  const { getToken } = useAuth();

  return {
    user: clerkUser,
    isLoaded,
    isSignedIn,
    getToken,
  };
}

export function useUserStats() {
  const { user, isSignedIn, getToken } = useUser();

  return useQuery({
    queryKey: ["userStats", user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get auth token");
      }

      const [recipes, mealPlans] = await Promise.all([
        recipeService.getRecipes({}, token),
        mealPlanService.getMealPlans({}, token),
      ]);

      return {
        recipeCount: recipes.data?.recipes?.length || 0,
        mealPlanCount: mealPlans.data?.meal_plans?.length || 0,
        memberSince: user.createdAt?.toLocaleDateString() || "Unknown",
      };
    },
    enabled: !!user && isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}