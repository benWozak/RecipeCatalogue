import { User as ClerkUser } from "@clerk/clerk-react";

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

export interface AppUser extends ClerkUser {
  stats?: UserStats;
  preferences?: UserPreferences;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  username?: string;
}