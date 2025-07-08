export enum MealType {
  BREAKFAST = 'breakfast',
  SNACK = 'snack',
  LUNCH = 'lunch',
  DINNER = 'dinner'
}

export interface MealPlanEntry {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  date: string; // We'll use this to encode week_number + day_of_week
  meal_type: MealType;
  servings: number;
  recipe_title?: string; // For display purposes
  recipe_thumbnail?: string; // For display purposes
  week_number?: number; // Derived from date for UI purposes
  day_of_week?: number; // Derived from date for UI purposes (0=Monday, 6=Sunday)
}

export interface MealPlanEntryCreate {
  recipe_id: string;
  date: string; // Encoded week + day info
  meal_type: MealType;
  servings: number;
}

export interface MealPlan {
  id: string;
  user_id: string;
  name: string; // Auto-generated
  start_date?: string; // Auto-calculated
  end_date?: string; // Auto-calculated
  created_at: string;
  entries: MealPlanEntry[];
  weeks?: WeekPlan[]; // Derived from entries for UI
}

export interface MealPlanCreate {
  name: string; // Auto-generated
  start_date?: string; // Auto-calculated
  end_date?: string; // Auto-calculated
  entries: MealPlanEntryCreate[];
}

export interface MealPlanUpdate {
  name?: string;
  start_date?: string;
  end_date?: string;
  entries?: MealPlanEntryCreate[];
}

export interface MealPlanListResponse {
  meal_plans: MealPlan[];
  total: number;
  skip: number;
  limit: number;
}

export interface MealPlanFilters {
  search?: string;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

// UI-specific types for rotation-based meal planning
export interface DayMeals {
  day_of_week: number; // 0 = Monday, 6 = Sunday
  day_name: string; // "Monday", "Tuesday", etc.
  meals: {
    [MealType.BREAKFAST]?: MealPlanEntry;
    [MealType.SNACK]?: MealPlanEntry[];
    [MealType.LUNCH]?: MealPlanEntry;
    [MealType.DINNER]?: MealPlanEntry;
  };
}

export interface WeekPlan {
  week_number: number; // 1, 2, 3, etc.
  days: DayMeals[];
  total_meals: number;
}

export interface RotationalMealPlan {
  id: string;
  weeks: WeekPlan[];
  total_weeks: number;
  created_at: string;
}

// For recipe selection dialog
export interface RecipeForMealPlan {
  id: string;
  title: string;
  thumbnail?: string;
  prep_time?: number;
  cook_time?: number;
}

// For drag and drop functionality
export interface MealSlot {
  week_number: number;
  day_of_week: number;
  meal_type: MealType;
  recipe?: RecipeForMealPlan;
  text_placeholder?: string;
}

// Week management types
export interface WeekMealAssignment {
  week_number: number;
  day_of_week: number;
  meal_type: MealType;
  recipe: RecipeForMealPlan;
}

// Utility functions for date encoding/decoding
export const encodeMealPlanDate = (weekNumber: number, dayOfWeek: number): string => {
  // Encode as YYYY-MM-DD where YYYY = 2000 + weekNumber, MM = 01, DD = dayOfWeek + 1
  const year = 2000 + weekNumber;
  const month = '01';
  const day = String(dayOfWeek + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const decodeMealPlanDate = (encodedDate: string): { weekNumber: number; dayOfWeek: number } => {
  const date = new Date(encodedDate);
  const weekNumber = date.getFullYear() - 2000;
  const dayOfWeek = date.getDate() - 1;
  return { weekNumber, dayOfWeek };
};

export const getDayName = (dayOfWeek: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayOfWeek] || '';
};