import { useState, DragEvent } from 'react';
import { GripVertical, X } from 'lucide-react';
import { MealType, RecipeForMealPlan } from '@/types/mealPlan';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MealAssignment {
  mealType: MealType;
  recipe: RecipeForMealPlan;
}

interface MealTypeDropZonesProps {
  selectedRecipes: RecipeForMealPlan[];
  assignments: MealAssignment[];
  onAssignmentsChange: (assignments: MealAssignment[]) => void;
  onClose: () => void;
  onConfirm: () => void;
  date: string;
}

export function MealTypeDropZones({
  selectedRecipes,
  assignments,
  onAssignmentsChange,
  onClose,
  onConfirm,
  date
}: MealTypeDropZonesProps) {
  const [draggedRecipe, setDraggedRecipe] = useState<RecipeForMealPlan | null>(null);
  const [dragOverZone, setDragOverZone] = useState<MealType | null>(null);

  const mealTypes: { type: MealType; label: string; color: string }[] = [
    { type: MealType.BREAKFAST, label: 'Breakfast', color: 'bg-orange-50 border-orange-200 text-orange-800' },
    { type: MealType.SNACK, label: 'Snack 1', color: 'bg-purple-50 border-purple-200 text-purple-800' },
    { type: MealType.LUNCH, label: 'Lunch', color: 'bg-green-50 border-green-200 text-green-800' },
    { type: MealType.SNACK, label: 'Snack 2', color: 'bg-purple-50 border-purple-200 text-purple-800' },
    { type: MealType.DINNER, label: 'Dinner', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAssignedRecipe = (mealType: MealType, index?: number) => {
    if (mealType === MealType.SNACK) {
      const snacks = assignments.filter(a => a.mealType === MealType.SNACK);
      return snacks[index || 0]?.recipe;
    }
    return assignments.find(a => a.mealType === mealType)?.recipe;
  };

  const getUnassignedRecipes = () => {
    const assignedRecipeIds = assignments.map(a => a.recipe.id);
    return selectedRecipes.filter(recipe => !assignedRecipeIds.includes(recipe.id));
  };

  const handleDragStart = (e: DragEvent, recipe: RecipeForMealPlan) => {
    setDraggedRecipe(recipe);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedRecipe(null);
    setDragOverZone(null);
  };

  const handleDragOver = (e: DragEvent, mealType: MealType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(mealType);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (e: DragEvent, mealType: MealType, snackIndex?: number) => {
    e.preventDefault();
    setDragOverZone(null);

    if (!draggedRecipe) return;

    // Remove any existing assignment for this recipe
    const filteredAssignments = assignments.filter(a => a.recipe.id !== draggedRecipe.id);

    // For snacks, we need to handle the index
    if (mealType === MealType.SNACK && snackIndex !== undefined) {
      const existingSnacks = filteredAssignments.filter(a => a.mealType === MealType.SNACK);
      
      // Remove the snack at this position if it exists
      const snacksWithoutThisPosition = existingSnacks.filter((_, i) => i !== snackIndex);
      
      // Add the new assignment
      const newSnackAssignment: MealAssignment = {
        mealType: MealType.SNACK,
        recipe: draggedRecipe
      };

      // Rebuild snack assignments in correct order
      const newSnacks = [...snacksWithoutThisPosition];
      newSnacks.splice(snackIndex, 0, newSnackAssignment);

      // Combine with non-snack assignments
      const nonSnackAssignments = filteredAssignments.filter(a => a.mealType !== MealType.SNACK);
      onAssignmentsChange([...nonSnackAssignments, ...newSnacks]);
    } else {
      // For non-snack meals, remove existing assignment for this meal type
      const assignmentsWithoutThisMeal = filteredAssignments.filter(a => a.mealType !== mealType);
      
      onAssignmentsChange([
        ...assignmentsWithoutThisMeal,
        { mealType, recipe: draggedRecipe }
      ]);
    }
  };

  const handleRemoveAssignment = (mealType: MealType, snackIndex?: number) => {
    if (mealType === MealType.SNACK && snackIndex !== undefined) {
      const snacks = assignments.filter(a => a.mealType === MealType.SNACK);
      const updatedSnacks = snacks.filter((_, i) => i !== snackIndex);
      const nonSnacks = assignments.filter(a => a.mealType !== MealType.SNACK);
      onAssignmentsChange([...nonSnacks, ...updatedSnacks]);
    } else {
      onAssignmentsChange(assignments.filter(a => a.mealType !== mealType));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Organize Meals</h2>
            <p className="text-sm text-muted-foreground">
              Drag recipes to meal types for {formatDate(date)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Recipes */}
            <div>
              <h3 className="font-semibold mb-4">Available Recipes</h3>
              <div className="space-y-2">
                {getUnassignedRecipes().map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
                    draggable
                    onDragStart={(e) => handleDragStart(e, recipe)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        {recipe.thumbnail && (
                          <div className="w-10 h-10 flex-shrink-0">
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
                            {recipe.prep_time && `${recipe.prep_time}m`}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {getUnassignedRecipes().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    All recipes have been assigned
                  </div>
                )}
              </div>
            </div>

            {/* Meal Type Drop Zones */}
            <div>
              <h3 className="font-semibold mb-4">Meal Schedule</h3>
              <div className="space-y-3">
                {mealTypes.map((meal, index) => {
                  const snackIndex = meal.type === MealType.SNACK ? 
                    (meal.label === 'Snack 1' ? 0 : 1) : undefined;
                  const assignedRecipe = getAssignedRecipe(meal.type, snackIndex);
                  const isDropTarget = dragOverZone === meal.type;

                  return (
                    <Card
                      key={`${meal.type}-${index}`}
                      className={`transition-all ${meal.color} ${
                        isDropTarget ? 'ring-2 ring-primary bg-primary/10' : ''
                      } ${assignedRecipe ? '' : 'border-dashed'}`}
                      onDragOver={(e) => handleDragOver(e, meal.type)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, meal.type, snackIndex)}
                    >
                      <CardContent className="p-4 min-h-[80px]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {meal.label}
                          </div>
                          {assignedRecipe && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAssignment(meal.type, snackIndex)}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        {assignedRecipe ? (
                          <div className="flex items-center gap-3">
                            {assignedRecipe.thumbnail && (
                              <div className="w-10 h-10 flex-shrink-0">
                                <img
                                  src={assignedRecipe.thumbnail}
                                  alt=""
                                  className="w-full h-full object-cover rounded"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {assignedRecipe.title}
                              </div>
                              <div className="text-xs opacity-60">
                                {assignedRecipe.prep_time && `${assignedRecipe.prep_time}m`}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm opacity-60">
                            {draggedRecipe ? 'Drop recipe here' : 'No recipe assigned'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {assignments.length} of {selectedRecipes.length} recipes assigned
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onConfirm}>
                Confirm Meal Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}