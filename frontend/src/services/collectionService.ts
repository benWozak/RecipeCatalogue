import { Collection, CollectionCreate, CollectionUpdate } from '@/types/recipe';
import { ApiResponse } from './recipeService';

export interface CollectionListResponse {
  collections: Collection[];
  total: number;
  skip: number;
  limit: number;
}

export interface CollectionWithStats extends Collection {
  recipe_count: number;
}

class CollectionService {
  private baseUrl = 'http://localhost:8000/api/collections';

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

  async getCollections(token: string): Promise<ApiResponse<Collection[]>> {
    try {
      const response = await this.makeRequest('/', token);
      const data = await response.json();
      
      // Handle both array response and paginated response
      const collections = Array.isArray(data) ? data : data.collections || [];
      
      return {
        success: true,
        data: collections as Collection[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch collections'
      };
    }
  }

  async getCollectionsWithStats(token: string): Promise<ApiResponse<CollectionWithStats[]>> {
    try {
      const response = await this.makeRequest('/stats', token);
      const data = await response.json();
      
      return {
        success: true,
        data: data as CollectionWithStats[]
      };
    } catch (error) {
      // Fallback to regular collections if stats endpoint doesn't exist
      const collectionsResult = await this.getCollections(token);
      if (collectionsResult.success && collectionsResult.data) {
        const collectionsWithStats: CollectionWithStats[] = collectionsResult.data.map(collection => ({
          ...collection,
          recipe_count: 0 // Will be updated when backend supports it
        }));
        
        return {
          success: true,
          data: collectionsWithStats
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch collections with stats'
      };
    }
  }

  async getCollection(id: string, token: string): Promise<ApiResponse<Collection>> {
    try {
      const response = await this.makeRequest(`/${id}`, token);
      const data = await response.json();
      
      return {
        success: true,
        data: data as Collection
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch collection'
      };
    }
  }

  async createCollection(collection: CollectionCreate, token: string): Promise<ApiResponse<Collection>> {
    try {
      const response = await this.makeRequest('/', token, {
        method: 'POST',
        body: JSON.stringify(collection),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as Collection
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create collection'
      };
    }
  }

  async updateCollection(id: string, collection: CollectionUpdate, token: string): Promise<ApiResponse<Collection>> {
    try {
      const response = await this.makeRequest(`/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(collection),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as Collection
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update collection'
      };
    }
  }

  async deleteCollection(id: string, token: string): Promise<ApiResponse<void>> {
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
        error: error instanceof Error ? error.message : 'Failed to delete collection'
      };
    }
  }

  async addRecipeToCollection(collectionId: string, recipeId: string, token: string): Promise<ApiResponse<void>> {
    try {
      await this.makeRequest(`/${collectionId}/recipes/${recipeId}`, token, {
        method: 'POST',
      });
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add recipe to collection'
      };
    }
  }

  async removeRecipeFromCollection(collectionId: string, recipeId: string, token: string): Promise<ApiResponse<void>> {
    try {
      await this.makeRequest(`/${collectionId}/recipes/${recipeId}`, token, {
        method: 'DELETE',
      });
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove recipe from collection'
      };
    }
  }
}

export const collectionService = new CollectionService();
export default collectionService;