import { useParams, Link } from 'react-router'
import { ArrowLeft, Clock, Users, Edit, Trash2 } from 'lucide-react'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/recipes"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Recipe Details</h1>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-card-foreground mb-2">
                Recipe Title
              </h2>
              <div className="flex items-center gap-4 text-muted-foreground">
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
                className="bg-secondary text-foreground px-3 py-2 rounded-md hover:bg-secondary/90 transition-colors flex items-center gap-1"
              >
                <Edit size={16} />
                Edit
              </Link>
              <button className="bg-destructive text-destructive-foreground px-3 py-2 rounded-md hover:bg-destructive/90 transition-colors flex items-center gap-1">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Ingredients</h3>
              <div className="text-muted-foreground">
                Recipe ingredients will be displayed here
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Instructions</h3>
              <div className="text-muted-foreground">
                Recipe instructions will be displayed here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}