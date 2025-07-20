
export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  source_type: 'manual' | 'website' | 'instagram' | 'image';
  source_url?: string;
  media?: Record<string, any>;
  instructions?: Record<string, any> | string;
  ingredients?: Record<string, any>; // HTML format stored as JSONB
  tags: Tag[];
  collection_id?: string;
  collection?: Collection;
  created_at: string;
  updated_at: string;
}

export interface RecipeCreate {
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  source_type?: 'manual' | 'website' | 'instagram' | 'image';
  source_url?: string;
  media?: Record<string, any>;
  instructions?: Record<string, any>;
  ingredients?: Record<string, any>; // HTML format
  tags: Omit<Tag, 'id'>[];
  collection_id?: string;
}

export interface RecipeUpdate {
  title?: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  source_type?: 'manual' | 'website' | 'instagram' | 'image';
  source_url?: string;
  media?: Record<string, any>;
  instructions?: Record<string, any>;
  ingredients?: Record<string, any>; // HTML format
  tags?: Omit<Tag, 'id'>[];
  collection_id?: string;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

export interface RecipeFilters {
  search?: string;
  tags?: string[];
  collection_id?: string;
  skip?: number;
  limit?: number;
}

export interface RecipeFormData {
  title: string;
  description: string;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: number | null;
  source_type: 'manual' | 'website' | 'instagram' | 'image';
  source_url: string;
  media: Record<string, any>;
  instructions: Record<string, any>;
  ingredients: Record<string, any>; // HTML content for rich text editor
  tags: Array<{
    name: string;
    color: string;
  }>;
  collection_id?: string;
}

export interface CollectionCreate {
  name: string;
  description?: string;
}

export interface CollectionUpdate {
  name?: string;
  description?: string;
}