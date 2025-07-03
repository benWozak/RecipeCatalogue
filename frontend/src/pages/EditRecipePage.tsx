import { useParams, Link } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to={`/recipes/${id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Edit Recipe</h1>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Recipe Title
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                defaultValue="Recipe Title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Description
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-24"
                defaultValue="Recipe description"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Prep Time (minutes)
                </label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  defaultValue="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Cook Time (minutes)
                </label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  defaultValue="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Servings
                </label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  defaultValue="4"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Ingredients
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-32"
                defaultValue="2 cups flour\n1 cup sugar\n3 eggs"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Instructions
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-40"
                defaultValue="1. Mix ingredients\n2. Bake at 350°F for 30 minutes"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
              <Link 
                to={`/recipes/${id}`}
                className="bg-secondary text-foreground px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}