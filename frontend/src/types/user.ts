export interface UserStats {
  recipeCount: number;
  mealPlanCount: number;
  memberSince: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  measurementUnit: 'metric' | 'imperial';
  dietaryRestrictions: string[];
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  username?: string;
}