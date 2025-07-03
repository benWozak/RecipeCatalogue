import { Link } from 'react-router'
import { Plus } from 'lucide-react'

export default function RecipesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Recipes</h1>
          <Link 
            to="/recipes/new" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Recipe
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center text-card-foreground">
            No recipes yet. Add your first recipe to get started!
          </div>
        </div>
      </div>
    </div>
  )
}