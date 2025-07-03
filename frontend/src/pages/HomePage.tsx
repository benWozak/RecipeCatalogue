import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, Plus, Camera } from "lucide-react";

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

        {/* Recent Activity Section - placeholder for now */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Recent Activity
          </h2>
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Your recent recipes and meal plans will appear here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
