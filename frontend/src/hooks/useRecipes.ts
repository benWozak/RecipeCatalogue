import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { recipeService } from '@/services/recipeService';
import { useRecipeStore } from '@/stores/recipeStore';
import { RecipeCreate, RecipeUpdate, RecipeFilters } from '@/types/recipe';

// Query keys
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters: RecipeFilters) => [...recipeKeys.lists(), filters] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
};

// Hook for fetching recipes list
export const useRecipes = (filters: RecipeFilters = {}) => {
  const { getToken } = useAuth();
  const { setRecipes, setLoading, setError, setTotalRecipes } = useRecipeStore();

  const result = useQuery({
    queryKey: recipeKeys.list(filters),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await recipeService.getRecipes(filters, token);
      if (!response.success) throw new Error(response.error);
      
      return response.data!;
    },
    enabled: !!getToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle side effects with useEffect instead of deprecated callbacks
  React.useEffect(() => {
    if (result.isSuccess && result.data) {
      setRecipes(result.data.recipes);
      setTotalRecipes(result.data.total);
      setError(null);
    }
    if (result.isError) {
      setError(result.error instanceof Error ? result.error.message : 'Failed to fetch recipes');
    }
    setLoading(result.isLoading);
  }, [result.isSuccess, result.isError, result.isLoading, result.data, result.error, setRecipes, setTotalRecipes, setError, setLoading]);

  return result;
};

// Hook for fetching a single recipe
export const useRecipe = (id: string) => {
  const { getToken } = useAuth();
  const { setSelectedRecipe, setError } = useRecipeStore();

  const result = useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await recipeService.getRecipe(id, token);
      if (!response.success) throw new Error(response.error);
      
      return response.data!;
    },
    enabled: !!id && !!getToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle side effects with useEffect instead of deprecated callbacks
  React.useEffect(() => {
    if (result.isSuccess && result.data) {
      setSelectedRecipe(result.data);
      setError(null);
    }
    if (result.isError) {
      setError(result.error instanceof Error ? result.error.message : 'Failed to fetch recipe');
    }
  }, [result.isSuccess, result.isError, result.data, result.error, setSelectedRecipe, setError]);

  return result;
};

// Hook for creating a recipe
export const useCreateRecipe = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { addRecipe, setError } = useRecipeStore();

  return useMutation({
    mutationFn: async (recipe: RecipeCreate) => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await recipeService.createRecipe(recipe, token);
      if (!response.success) throw new Error(response.error);
      
      return response.data!;
    },
    onSuccess: (newRecipe) => {
      // Optimistically update the store
      addRecipe(newRecipe);
      
      // Invalidate and refetch recipes list
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create recipe');
    },
  });
};

// Hook for updating a recipe
export const useUpdateRecipe = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { updateRecipe, setError } = useRecipeStore();

  return useMutation({
    mutationFn: async ({ id, recipe }: { id: string; recipe: RecipeUpdate }) => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await recipeService.updateRecipe(id, recipe, token);
      if (!response.success) throw new Error(response.error);
      
      return response.data!;
    },
    onSuccess: (updatedRecipe) => {
      // Optimistically update the store
      updateRecipe(updatedRecipe.id, updatedRecipe);
      
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(updatedRecipe.id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update recipe');
    },
  });
};

// Hook for deleting a recipe
export const useDeleteRecipe = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { removeRecipe, setError } = useRecipeStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await recipeService.deleteRecipe(id, token);
      if (!response.success) throw new Error(response.error);
      
      return id;
    },
    onSuccess: (deletedId) => {
      // Optimistically update the store
      removeRecipe(deletedId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.removeQueries({ queryKey: recipeKeys.detail(deletedId) });
      
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to delete recipe');
    },
  });
};

// Hook for searching recipes
export const useSearchRecipes = (query: string) => {
  const { getToken } = useAuth();
  const { setSearchQuery } = useRecipeStore();

  const result = useQuery({
    queryKey: [...recipeKeys.lists(), 'search', query],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await recipeService.searchRecipes(query, token);
      if (!response.success) throw new Error(response.error);
      
      return response.data!;
    },
    enabled: !!query && !!getToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle side effects with useEffect instead of deprecated callbacks
  React.useEffect(() => {
    if (result.isSuccess) {
      setSearchQuery(query);
    }
  }, [result.isSuccess, query, setSearchQuery]);

  return result;
};

// Hook for getting recipes by tag
export const useRecipesByTag = (tag: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [...recipeKeys.lists(), 'tag', tag],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await recipeService.getRecipesByTag(tag, token);
      if (!response.success) throw new Error(response.error);
      
      return response.data!;
    },
    enabled: !!tag && !!getToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting recipes by difficulty
export const useRecipesByDifficulty = (difficulty: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [...recipeKeys.lists(), 'difficulty', difficulty],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await recipeService.getRecipesByDifficulty(difficulty, token);
      if (!response.success) throw new Error(response.error);
      
      return response.data!;
    },
    enabled: !!difficulty && !!getToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom hook for managing recipe state
export const useRecipeActions = () => {
  const store = useRecipeStore();
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();

  return {
    // Store actions
    ...store,
    
    // Mutation actions
    createRecipe: createRecipe.mutate,
    updateRecipe: updateRecipe.mutate,
    deleteRecipe: deleteRecipe.mutate,
    
    // Loading states
    isCreating: createRecipe.isPending,
    isUpdating: updateRecipe.isPending,
    isDeleting: deleteRecipe.isPending,
    
    // Error states
    createError: createRecipe.error,
    updateError: updateRecipe.error,
    deleteError: deleteRecipe.error,
  };
};