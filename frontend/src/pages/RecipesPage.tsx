import { Link } from 'react-router'
import { Plus } from 'lucide-react'

export default function RecipesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
          <Link 
            to="/recipes/new" 
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Recipe
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
            No recipes yet. Add your first recipe to get started!
          </div>
        </div>
      </div>
    </div>
  )
}