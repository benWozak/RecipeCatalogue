import { Recipe } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { useRecipeActions } from '@/hooks/useRecipes';
import { useNavigate } from 'react-router';

interface RecipeGridProps {
  recipes: Recipe[];
  isLoading?: boolean;
  onDeleteRecipe?: (recipe: Recipe) => void;
}

export function RecipeGrid({ recipes, isLoading, onDeleteRecipe }: RecipeGridProps) {
  const navigate = useNavigate();
  const { deleteRecipe } = useRecipeActions();

  const handleEdit = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}/edit`);
  };

  const handleDelete = (recipe: Recipe) => {
    if (onDeleteRecipe) {
      onDeleteRecipe(recipe);
    } else {
      // Default delete behavior
      if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
        deleteRecipe(recipe.id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-card border border-border rounded-lg p-8 text-card-foreground">
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground">
            Start by creating your first recipe or try adjusting your search filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}