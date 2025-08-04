import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { subscriptionService, SubscriptionStatus, UsageStats } from "@/services/subscriptionService";

export function useSubscriptionStatus() {
  const { user, isSignedIn, getToken } = useUser();

  return useQuery({
    queryKey: ["subscriptionStatus", user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get auth token");
      }

      const response = await subscriptionService.getSubscriptionStatus(token);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch subscription status");
      }

      return response.data;
    },
    enabled: !!user && isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes("auth")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useUsageStats() {
  const { user, isSignedIn, getToken } = useUser();

  return useQuery({
    queryKey: ["usageStats", user?.id],
    queryFn: async (): Promise<UsageStats> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get auth token");
      }

      const response = await subscriptionService.getUsageStats(token);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch usage statistics");
      }

      return response.data;
    },
    enabled: !!user && isSignedIn,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for usage)
    retry: (failureCount, error) => {
      if (error.message.includes("auth")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useCreateCheckoutSession() {
  const { getToken } = useUser();

  return useMutation({
    mutationFn: async ({ successUrl, cancelUrl }: { successUrl?: string; cancelUrl?: string } = {}) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get auth token");
      }

      const response = await subscriptionService.createCheckoutSession(token, successUrl, cancelUrl);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create checkout session");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
  });
}

export function useCreateBillingPortalSession() {
  const { getToken } = useUser();

  return useMutation({
    mutationFn: async ({ returnUrl }: { returnUrl?: string } = {}) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to get auth token");
      }

      const response = await subscriptionService.createBillingPortalSession(token, returnUrl);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create billing portal session");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe billing portal
      window.location.href = data.url;
    },
  });
}

export function useRefreshSubscriptionData() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus", user.id] });
      queryClient.invalidateQueries({ queryKey: ["usageStats", user.id] });
    }
  };
}

// Helper hook to check if user is premium
export function useIsPremium() {
  const { data: subscriptionStatus } = useSubscriptionStatus();
  return subscriptionStatus?.tier === 'PREMIUM' && subscriptionStatus?.status === 'active';
}

// Helper hook to check if user has reached limits
export function useSubscriptionLimits() {
  const { data: usageStats } = useUsageStats();
  const isPremium = useIsPremium();

  return {
    isAtRecipeLimit: !isPremium && usageStats ? usageStats.recipe_count >= usageStats.recipe_limit : false,
    isAtParsingLimit: !isPremium && usageStats ? usageStats.parsing_count >= usageStats.parsing_limit : false,
    recipeUsage: usageStats ? {
      current: usageStats.recipe_count,
      limit: usageStats.recipe_limit,
      percentage: Math.min((usageStats.recipe_count / usageStats.recipe_limit) * 100, 100)
    } : null,
    parsingUsage: usageStats ? {
      current: usageStats.parsing_count,
      limit: usageStats.parsing_limit,
      percentage: Math.min((usageStats.parsing_count / usageStats.parsing_limit) * 100, 100)
    } : null,
  };
}