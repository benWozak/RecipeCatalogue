import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { MealType, RecipeForMealPlan } from '@/types/mealPlan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { mealPlanService } from '@/services/mealPlanService';

interface RecipeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipes: (recipes: RecipeForMealPlan[], mealTypes: MealType[]) => void;
  date: string;
  authToken: (() => Promise<string | null>) | string;
  maxSelections?: number;
}

export function RecipeSelectionDialog({ 
  isOpen, 
  onClose, 
  onSelectRecipes, 
  date,
  authToken,
  maxSelections = 5 
}: RecipeSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<RecipeForMealPlan[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeForMealPlan[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<RecipeForMealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recipes when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen]);

  // Filter recipes based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  }, [searchQuery, recipes]);

  const loadRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = typeof authToken === 'function' ? await authToken() : authToken;
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await mealPlanService.getRecipesForMealPlan(token);
      if (response.success && response.data) {
        setRecipes(response.data);
      } else {
        setError(response.error || 'Failed to load recipes');
      }
    } catch {
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = (recipe: RecipeForMealPlan) => {
    if (selectedRecipes.find(r => r.id === recipe.id)) {
      // Deselect recipe
      setSelectedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    } else if (selectedRecipes.length < maxSelections) {
      // Select recipe
      setSelectedRecipes(prev => [...prev, recipe]);
    }
  };

  const isRecipeSelected = (recipe: RecipeForMealPlan) => {
    return selectedRecipes.some(r => r.id === recipe.id);
  };

  const handleConfirm = () => {
    if (selectedRecipes.length > 0) {
      // Create default meal type assignments (breakfast, snack, lunch, snack, dinner)
      const mealTypes: MealType[] = [];
      for (let i = 0; i < selectedRecipes.length; i++) {
        if (i === 0) mealTypes.push(MealType.BREAKFAST);
        else if (i === 1) mealTypes.push(MealType.SNACK);
        else if (i === 2) mealTypes.push(MealType.LUNCH);
        else if (i === 3) mealTypes.push(MealType.SNACK);
        else if (i === 4) mealTypes.push(MealType.DINNER);
      }
      
      onSelectRecipes(selectedRecipes, mealTypes);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedRecipes([]);
    setSearchQuery('');
    setError(null);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Select Recipes</h2>
            <p className="text-sm text-muted-foreground">
              Choose up to {maxSelections} recipes for {formatDate(date)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading recipes...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-destructive">{error}</div>
              <Button variant="outline" onClick={loadRecipes} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No recipes found matching your search' : 'No recipes available'}
                </div>
              ) : (
                filteredRecipes.map((recipe) => {
                  const selected = isRecipeSelected(recipe);
                  const selectionNumber = selected 
                    ? selectedRecipes.findIndex(r => r.id === recipe.id) + 1 
                    : null;

                  return (
                    <Card 
                      key={recipe.id}
                      className={`cursor-pointer transition-all ${
                        selected 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      } ${selectedRecipes.length >= maxSelections && !selected ? 'opacity-50' : ''}`}
                      onClick={() => handleRecipeSelect(recipe)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {recipe.thumbnail && (
                              <div className="w-12 h-12 flex-shrink-0">
                                <img
                                  src={recipe.thumbnail}
                                  alt=""
                                  className="w-full h-full object-cover rounded"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {recipe.title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {recipe.prep_time && `${recipe.prep_time}m prep`}
                                {recipe.prep_time && recipe.cook_time && ' • '}
                                {recipe.cook_time && `${recipe.cook_time}m cook`}
                              </div>
                            </div>
                          </div>
                          
                          {selected && (
                            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                              {selectionNumber}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedRecipes.length} of {maxSelections} recipes selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={selectedRecipes.length === 0}
              >
                Continue with {selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}