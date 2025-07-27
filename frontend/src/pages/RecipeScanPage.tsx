import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ScanOptionsGrid } from "@/components/recipe/ScanOptionsGrid";

export default function RecipeScanPage() {

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
      <ScanOptionsGrid className="mb-12" />

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
