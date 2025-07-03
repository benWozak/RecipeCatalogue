import { useParams, Link } from 'react-router'
import { ArrowLeft, Clock, Users, Edit, Trash2 } from 'lucide-react'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/recipes"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Recipe Details</h1>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Recipe Title
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>30 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>4 servings</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link 
                to={`/recipes/${id}/edit`}
                className="bg-gray-200 text-gray-900 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <Edit size={16} />
                Edit
              </Link>
              <button className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-1">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
              <div className="text-gray-600">
                Recipe ingredients will be displayed here
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <div className="text-gray-600">
                Recipe instructions will be displayed here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}