import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { MealType } from '@/types/mealPlan';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { MiniRecipeCard } from './MiniRecipeCard';
import { recipeService } from '@/services/recipeService';

interface RecipeSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  mealType?: MealType;
  dayName?: string;
  authToken: (() => Promise<string | null>) | string;
}

export function RecipeSelectionSheet({
  isOpen,
  onClose,
  onSelectRecipe,
  mealType,
  dayName,
  authToken
}: RecipeSelectionSheetProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the tag name for meal type filtering
  const getMealTypeTag = (type?: MealType) => {
    if (!type) return null;
    switch (type) {
      case MealType.BREAKFAST:
        return 'breakfast';
      case MealType.LUNCH:
        return 'lunch';
      case MealType.DINNER:
        return 'dinner';
      default:
        return null;
    }
  };

  const getMealTypeLabel = (type?: MealType) => {
    if (!type) return '';
    switch (type) {
      case MealType.BREAKFAST:
        return 'Breakfast';
      case MealType.LUNCH:
        return 'Lunch';
      case MealType.DINNER:
        return 'Dinner';
      case MealType.SNACK:
        return 'Snack';
      default:
        return type;
    }
  };

  // Load recipes when sheet opens
  useEffect(() => {
    if (isOpen) {
      loadRecipes();
      
      // Auto-apply meal type filter if provided
      const mealTag = getMealTypeTag(mealType);
      if (mealTag) {
        setActiveFilters([mealTag]);
      }
    } else {
      // Reset state when sheet closes
      setSearchQuery('');
      setActiveFilters([]);
      setError(null);
    }
  }, [isOpen, mealType]);

  // Apply filters when recipes, search, or filters change
  useEffect(() => {
    applyFilters();
  }, [recipes, searchQuery, activeFilters]);

  const loadRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof authToken === 'function' ? await authToken() : authToken;
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await recipeService.getRecipes({}, token);
      if (response.success && response.data) {
        setRecipes(response.data.recipes || []);
      } else {
        setError(response.error || 'Failed to load recipes');
      }
    } catch (err) {
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recipes];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query)
      );
    }

    // Apply tag filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(recipe =>
        recipe.tags.some(tag =>
          activeFilters.includes(tag.name.toLowerCase())
        )
      );
    }

    setFilteredRecipes(filtered);
  };

  const removeFilter = (filterToRemove: string) => {
    setActiveFilters(prev => prev.filter(filter => filter !== filterToRemove));
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    onClose();
  };

  const formatFilterDisplay = (filter: string) => {
    return filter.charAt(0).toUpperCase() + filter.slice(1);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Select Recipe</SheetTitle>
          <SheetDescription>
            {mealType && dayName 
              ? `Choose a recipe for ${getMealTypeLabel(mealType)} on ${dayName}`
              : 'Choose a recipe for your meal plan'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {formatFilterDisplay(filter)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Recipe List */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading recipes...</div>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-destructive mb-4">{error}</div>
                <Button variant="outline" onClick={loadRecipes}>
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-2 pb-4">
                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || activeFilters.length > 0
                      ? 'No recipes found matching your criteria'
                      : 'No recipes available'
                    }
                  </div>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <MiniRecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => handleRecipeSelect(recipe)}
                      className="hover:bg-primary/5 hover:border-primary/20"
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}