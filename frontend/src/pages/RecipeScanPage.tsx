import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Instagram, Globe, Camera, PlusCircle, ArrowLeft } from "lucide-react";

export default function RecipeScanPage() {
  const scanOptions = [
    {
      title: "Instagram URL",
      description: "Parse recipe from Instagram post",
      icon: Instagram,
      href: "/recipes/scan/instagram",
      variant: "default" as const,
      featured: true,
    },
    {
      title: "Web URL",
      description: "Parse recipe from any website",
      icon: Globe,
      href: "/recipes/scan/url",
      variant: "secondary" as const,
      featured: false,
    },
    {
      title: "Image Upload",
      description: "Extract recipe from photo",
      icon: Camera,
      href: "/recipes/scan/image",
      variant: "secondary" as const,
      featured: false,
    },
    {
      title: "Manual Entry",
      description: "Create recipe from scratch",
      icon: PlusCircle,
      href: "/recipes/scan/manual",
      variant: "outline" as const,
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Add Recipe</h1>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-lg">
            Choose how you'd like to add your recipe
          </p>
        </div>

        {/* Scan Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {scanOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.title}
                asChild
                variant={option.variant}
                className="w-full h-auto flex-col gap-4 py-4 touch-manipulation"
              >
                <Link to={option.href}>
                  <Icon className="h-32 w-32" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">{option.title}</div>
                    <div
                      className={`text-sm ${
                        option.featured
                          ? "dark:text-gray-400 text-gray-200"
                          : "text-muted-foreground"
                      }  mt-1`}
                    >
                      {option.description}
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Instagram and web URL parsing will automatically extract ingredients
            and instructions.
            <br />
            You can edit all parsed content before saving.
          </p>
        </div>
      </div>
    </div>
  );
}
