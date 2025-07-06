import { 
  MealPlan, 
  MealPlanCreate, 
  MealPlanUpdate, 
  MealPlanListResponse, 
  MealPlanFilters,
  RecipeForMealPlan 
} from '@/types/mealPlan';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class MealPlanService {
  private baseUrl = 'http://localhost:8000/api/meal-plans';

  private async makeRequest(endpoint: string, token: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async getMealPlans(filters: MealPlanFilters = {}, token: string): Promise<ApiResponse<MealPlanListResponse>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
      if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/?${queryString}` : '/';
      
      const response = await this.makeRequest(endpoint, token);
      const data = await response.json();
      
      // Handle the case where backend returns array directly instead of {meal_plans: [], total: number}
      const normalizedData = Array.isArray(data) 
        ? { meal_plans: data, total: data.length, skip: filters.skip || 0, limit: filters.limit || 20 }
        : data;
      
      return {
        success: true,
        data: normalizedData as MealPlanListResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meal plans'
      };
    }
  }

  async getMealPlan(id: string, token: string): Promise<ApiResponse<MealPlan>> {
    try {
      const response = await this.makeRequest(`/${id}`, token);
      const data = await response.json();
      
      return {
        success: true,
        data: data as MealPlan
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meal plan'
      };
    }
  }

  async createMealPlan(mealPlan: MealPlanCreate, token: string): Promise<ApiResponse<MealPlan>> {
    try {
      const response = await this.makeRequest('/', token, {
        method: 'POST',
        body: JSON.stringify(mealPlan),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as MealPlan
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create meal plan'
      };
    }
  }

  async updateMealPlan(id: string, mealPlan: MealPlanUpdate, token: string): Promise<ApiResponse<MealPlan>> {
    try {
      const response = await this.makeRequest(`/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(mealPlan),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as MealPlan
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update meal plan'
      };
    }
  }

  async deleteMealPlan(id: string, token: string): Promise<ApiResponse<void>> {
    try {
      await this.makeRequest(`/${id}`, token, {
        method: 'DELETE',
      });
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete meal plan'
      };
    }
  }

  async searchMealPlans(query: string, token: string): Promise<ApiResponse<MealPlanListResponse>> {
    return this.getMealPlans({ search: query }, token);
  }

  // Helper method to get recipes formatted for meal planning
  async getRecipesForMealPlan(token: string, search?: string): Promise<ApiResponse<RecipeForMealPlan[]>> {
    try {
      const recipeServiceUrl = 'http://localhost:8000/api/recipes';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/?${queryString}` : '/';
      
      const response = await fetch(`${recipeServiceUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform recipe data to the format needed for meal planning
      const recipes = Array.isArray(data) ? data : data.recipes || [];
      const mealPlanRecipes: RecipeForMealPlan[] = recipes.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        thumbnail: recipe.media?.thumbnail_url,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        difficulty: recipe.difficulty,
      }));

      return {
        success: true,
        data: mealPlanRecipes
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recipes for meal planning'
      };
    }
  }
}

export const mealPlanService = new MealPlanService();
export default mealPlanService;