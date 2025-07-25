export enum MealType {
  BREAKFAST = 'breakfast',
  SNACK = 'snack',
  LUNCH = 'lunch',
  DINNER = 'dinner'
}

// Recipe details from backend
export interface RecipeDetails {
  id: string;
  title: string;
  media?: {
    stored_media?: {
      thumbnails?: {
        small?: string;
        medium?: string;
        large?: string;
      };
    };
    images?: Array<string | { url: string }>;
    video_thumbnail?: string;
  };
  source_url?: string;
}

export interface MealPlanEntry {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  date: string; // We'll use this to encode week_number + day_of_week
  meal_type: MealType;
  servings: number;
  recipe?: RecipeDetails; // Enhanced with recipe details for active meal plan
  recipe_title?: string; // For display purposes (legacy)
  recipe_thumbnail?: string; // For display purposes (legacy)
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
  is_active?: boolean; // Indicates if this is the user's active meal plan
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
  is_active?: boolean;
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

// Get current day of week (0 = Monday, 6 = Sunday)
export const getCurrentDayOfWeek = (): number => {
  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return jsDay === 0 ? 6 : jsDay - 1; // Convert to our format (0 = Monday)
};

// Calculate which week in rotation we should be showing based on current date
export const getCurrentWeekInRotation = (mealPlan: MealPlan): number => {
  if (!mealPlan.start_date || !mealPlan.entries.length) return 1;
  
  const startDate = new Date(mealPlan.start_date);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeksDiff = Math.floor(daysDiff / 7);
  
  // Get total weeks in rotation
  const weeks = new Set<number>();
  mealPlan.entries.forEach(entry => {
    const { weekNumber } = decodeMealPlanDate(entry.date);
    weeks.add(weekNumber);
  });
  const totalWeeks = weeks.size;
  
  if (totalWeeks === 0) return 1;
  
  // Calculate current week in rotation (1-based)
  return (weeksDiff % totalWeeks) + 1;
};