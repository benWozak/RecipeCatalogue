import { Recipe, RecipeCreate, RecipeUpdate, RecipeListResponse, RecipeFilters } from '@/types/recipe';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class RecipeService {
  private baseUrl = `${import.meta.env.VITE_API_URL}/api/recipes`;

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

  async getRecipes(filters: RecipeFilters = {}, token: string): Promise<ApiResponse<RecipeListResponse>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.tags?.length) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.collection_id) params.append('collection_id', filters.collection_id);
      if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
      if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/?${queryString}` : '/';
      
      const response = await this.makeRequest(endpoint, token);
      const data = await response.json();
      
      // Handle the case where backend returns array directly instead of {recipes: [], total: number}
      const normalizedData = Array.isArray(data) 
        ? { recipes: data, total: data.length, skip: filters.skip || 0, limit: filters.limit || 20 }
        : data;
      
      return {
        success: true,
        data: normalizedData as RecipeListResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recipes'
      };
    }
  }

  async getRecipe(id: string, token: string): Promise<ApiResponse<Recipe>> {
    try {
      const response = await this.makeRequest(`/${id}`, token);
      const data = await response.json();
      
      return {
        success: true,
        data: data as Recipe
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recipe'
      };
    }
  }

  async createRecipe(recipe: RecipeCreate, token: string): Promise<ApiResponse<Recipe>> {
    try {
      const response = await this.makeRequest('/', token, {
        method: 'POST',
        body: JSON.stringify(recipe),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as Recipe
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create recipe'
      };
    }
  }

  async updateRecipe(id: string, recipe: RecipeUpdate, token: string): Promise<ApiResponse<Recipe>> {
    try {
      const response = await this.makeRequest(`/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(recipe),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as Recipe
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update recipe'
      };
    }
  }

  async deleteRecipe(id: string, token: string): Promise<ApiResponse<void>> {
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
        error: error instanceof Error ? error.message : 'Failed to delete recipe'
      };
    }
  }

  async searchRecipes(query: string, token: string): Promise<ApiResponse<RecipeListResponse>> {
    return this.getRecipes({ search: query }, token);
  }

  async getRecipesByTag(tag: string, token: string): Promise<ApiResponse<RecipeListResponse>> {
    return this.getRecipes({ tags: [tag] }, token);
  }

  async assignRecipeToCollection(recipeId: string, collectionId: string | null, token: string): Promise<ApiResponse<Recipe>> {
    try {
      const response = await this.makeRequest(`/${recipeId}`, token, {
        method: 'PUT',
        body: JSON.stringify({ collection_id: collectionId }),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as Recipe
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign recipe to collection'
      };
    }
  }

  async removeRecipeFromCollection(recipeId: string, token: string): Promise<ApiResponse<Recipe>> {
    return this.assignRecipeToCollection(recipeId, null, token);
  }

}

export const recipeService = new RecipeService();
export default recipeService;