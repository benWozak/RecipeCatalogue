import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, Plus, Camera, Clock, TrendingUp, ChefHat } from "lucide-react";
import { useRecipes } from "@/hooks/useRecipes";
import { useRecipeSelectors } from "@/stores/recipeStore";
import { RecipeCard } from "@/components/recipe";

function RecentActivity() {
  const { data, isLoading } = useRecipes({ limit: 6 });
  const { recentRecipes, recipesByDifficulty } = useRecipeSelectors();

  const totalRecipes = data?.total || 0;
  const recipes = data?.recipes || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Your Recipe Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Recipes</p>
                  <p className="text-2xl font-bold">{totalRecipes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{recentRecipes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <ChefHat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Easy Recipes</p>
                  <p className="text-2xl font-bold">{recipesByDifficulty.easy || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Recipes */}
      {recipes.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Recipes</h2>
            <Button variant="outline" asChild>
              <Link to="/recipes">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.slice(0, 3).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4">No recipes yet. Start building your collection!</p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link to="/recipes/new">Create Recipe</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/recipes/scan">Scan Recipe</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const quickActions = [
    {
      title: "Scan Recipe",
      description: "Parse from URL or photo",
      icon: Camera,
      href: "/recipes/scan",
      variant: "default" as const,
    },
    {
      title: "Browse Recipes",
      description: "View your collection",
      icon: BookOpen,
      href: "/recipes",
      variant: "secondary" as const,
    },
    {
      title: "Meal Plans",
      description: "Plan your meals",
      icon: Calendar,
      href: "/meal-plans",
      variant: "outline" as const,
    },
    {
      title: "Add Recipe",
      description: "Create a new recipe",
      icon: Plus,
      href: "/recipes/new",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Welcome Back!
          </h1>
          <p className="text-muted-foreground">
            What would you like to cook today?
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="touch-manipulation">
                <CardContent className="p-6">
                  <Button
                    asChild
                    variant={action.variant}
                    className="w-full h-auto flex-col gap-3 py-6"
                  >
                    <Link to={action.href}>
                      <Icon size={28} />
                      <div className="text-center">
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity Section */}
        <RecentActivity />
      </div>
    </div>
  );
}
