import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeGrid, RecipeSearch } from "@/components/recipe";
import { useRecipes } from "@/hooks/useRecipes";
import { useCollections } from "@/hooks/useCollections";
import { useRecipeStore, useRecipeSelectors } from "@/stores/recipeStore";
import { RecipeFilters } from "@/types/recipe";

export default function RecipesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<RecipeFilters>({});

  const { setLoading, setError } = useRecipeStore();
  const { allTags } = useRecipeSelectors();
  const { collections } = useCollections();

  // Build the filters for the API call
  const apiFilters: RecipeFilters = {
    ...filters,
    ...(searchQuery && { search: searchQuery }),
    limit: 20,
    skip: 0,
  };

  const { data, isLoading, error, refetch } = useRecipes(apiFilters);

  // Update store with loading and error states
  useEffect(() => {
    setLoading(isLoading);
    setError(error?.message || null);
  }, [isLoading, error, setLoading, setError]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: RecipeFilters) => {
    setFilters(newFilters);
  };

  const recipes = data?.recipes || [];
  const totalRecipes = data?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ChefHat className="h-8 w-8" />
              My Recipes
            </h1>
            <p className="text-muted-foreground mt-1">
              {totalRecipes > 0
                ? `${totalRecipes} recipes in your collection`
                : "No recipes yet"}
            </p>
          </div>
          <Button onClick={() => navigate(-1)}>
            <Plus className="h-4 w-4" />
            Add Recipe
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <RecipeSearch
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            searchQuery={searchQuery}
            availableTags={allTags}
            availableCollections={collections}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-destructive">
              <p className="font-medium">Error loading recipes</p>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Recipe Grid */}
        <RecipeGrid recipes={recipes} isLoading={isLoading} />

        {/* Empty State for New Users */}
        {!isLoading &&
          recipes.length === 0 &&
          !searchQuery &&
          Object.keys(filters).length === 0 && (
            <div className="text-center py-12">
              <div className="bg-card border border-border rounded-lg p-8 text-card-foreground max-w-md mx-auto">
                <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your recipe collection by adding your first
                  recipe.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => navigate(-1)}>
                    <Plus className="h-4 w-4" />
                    Add Recipe
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/recipes/scan">Scan Recipe</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
