import { create } from 'zustand';
import { Recipe, RecipeFilters } from '@/types/recipe';

interface RecipeState {
  // Current state
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  filters: RecipeFilters;
  searchQuery: string;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalRecipes: number;
  hasNextPage: boolean;
  
  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  
  // Filters and search
  setFilters: (filters: Partial<RecipeFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // UI state actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Pagination actions
  setCurrentPage: (page: number) => void;
  setTotalRecipes: (total: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  
  // Utility actions
  clearRecipes: () => void;
  reset: () => void;
}

const initialState = {
  recipes: [],
  selectedRecipe: null,
  filters: {},
  searchQuery: '',
  isLoading: false,
  error: null,
  currentPage: 1,
  totalRecipes: 0,
  hasNextPage: false,
};

export const useRecipeStore = create<RecipeState>((set) => ({
  ...initialState,

  // Recipe management
  setRecipes: (recipes) => set({ recipes }),
  
  addRecipe: (recipe) => set((state) => ({ 
    recipes: [recipe, ...state.recipes],
    totalRecipes: state.totalRecipes + 1
  })),
  
  updateRecipe: (id, updatedRecipe) => set((state) => ({
    recipes: state.recipes.map(recipe => 
      recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
    ),
    selectedRecipe: state.selectedRecipe?.id === id 
      ? { ...state.selectedRecipe, ...updatedRecipe }
      : state.selectedRecipe
  })),
  
  removeRecipe: (id) => set((state) => ({
    recipes: state.recipes.filter(recipe => recipe.id !== id),
    selectedRecipe: state.selectedRecipe?.id === id ? null : state.selectedRecipe,
    totalRecipes: Math.max(0, state.totalRecipes - 1)
  })),
  
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),

  // Filters and search
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters },
    currentPage: 1 // Reset to first page when filters change
  })),
  
  setSearchQuery: (query) => set({ 
    searchQuery: query,
    currentPage: 1 // Reset to first page when search changes
  }),
  
  clearFilters: () => set({ 
    filters: {},
    searchQuery: '',
    currentPage: 1
  }),

  // UI state
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Pagination
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalRecipes: (total) => set({ totalRecipes: total }),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),

  // Utility
  clearRecipes: () => set({ recipes: [] }),
  reset: () => set(initialState),
}));

// Selectors for derived state
export const useRecipeSelectors = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const filters = useRecipeStore((state) => state.filters);
  const searchQuery = useRecipeStore((state) => state.searchQuery);
  
  return {
    // Filtered recipes for local filtering (if needed)
    filteredRecipes: (recipes || []).filter(recipe => {
      const matchesSearch = !searchQuery || 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = !filters.tags?.length || 
        recipe.tags.some(tag => filters.tags?.includes(tag.name));
      
      return matchesSearch && matchesTags;
    }),
    
    // All unique tags
    allTags: Array.from(
      new Set((recipes || []).flatMap(recipe => recipe.tags.map(tag => tag.name)))
    ),
    
    // Recent recipes (last 7 days)
    recentRecipes: (recipes || []).filter(recipe => {
      const recipeDate = new Date(recipe.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return recipeDate >= weekAgo;
    }),
  };
};