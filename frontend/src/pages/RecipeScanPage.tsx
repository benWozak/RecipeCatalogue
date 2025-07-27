import { Link } from "react-router";
import { Instagram, Globe, Camera, PlusCircle, ArrowLeft } from "lucide-react";

export default function RecipeScanPage() {
  const scanOptions = [
    {
      title: "Web URL",
      description: "Paste a link to a recipe website",
      icon: Globe,
      href: "/recipes/scan/url",
      featured: true,
      bgColor: "bg-primary",
      textColor: "text-primary-foreground",
      iconColor: "text-primary-foreground",
    },
    {
      title: "Instagram URL",
      description: "Parse a recipe from an Instagram post",
      icon: Instagram,
      href: "/recipes/scan/instagram",
      featured: false,
      bgColor: "bg-muted border border-muted-foreground",
      textColor: "text-muted-foreground",
      iconColor: "text-muted-foreground",
    },
    {
      title: "Image Upload",
      description: "Extract from a photo or screenshot",
      icon: Camera,
      href: "/recipes/scan/image",
      featured: false,
      bgColor: "bg-muted border border-muted-foreground",
      textColor: "text-muted-foreground",
      iconColor: "text-muted-foreground",
    },
    {
      title: "Manual Entry",
      description: "Create a new recipe from scratch",
      icon: PlusCircle,
      href: "/recipes/scan/manual",
      featured: false,
      bgColor: "bg-muted border border-muted-foreground",
      textColor: "text-muted-foreground",
      iconColor: "text-muted-foreground",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
      </div>

      {/* Title and Description */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Add Your Recipe</h1>
        <p className="text-gray-400 text-lg">
          Choose your preferred method to get started.
        </p>
      </div>

      {/* Scan Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
        {scanOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Link key={option.title} to={option.href} className="group block">
              <div
                className={`${option.bgColor} rounded-2xl p-8 h-32 md:h-80 flex flex-col items-center justify-center text-center transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer`}
              >
                <div className="mb-2 md:mb-6">
                  <Icon
                    className={`h-6 w-6 md:h-12 md:w-12 ${option.iconColor}`}
                  />
                </div>
                <div className="space-y-1 md:space-y-3">
                  <h3 className={`font-bold text-xl ${option.textColor}`}>
                    {option.title}
                  </h3>
                  <p
                    className={`text-sm ${option.textColor} opacity-80 leading-relaxed`}
                  >
                    {option.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-400 max-w-3xl mx-auto">
        <p>
          Automatic parsing from web and Instagram URLs will extract ingredients
          and instructions for you. You can review and edit all content before
          saving your new recipe.
        </p>
      </div>
    </div>
  );
}
