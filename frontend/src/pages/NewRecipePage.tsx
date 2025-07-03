import { Link } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewRecipePage() {
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
          <h1 className="text-3xl font-bold text-foreground">Add New Recipe</h1>
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
                placeholder="Enter recipe title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Description
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-24"
                placeholder="Enter recipe description"
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
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Cook Time (minutes)
                </label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Servings
                </label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="4"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Ingredients
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-32"
                placeholder="Enter ingredients, one per line"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Instructions
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-40"
                placeholder="Enter cooking instructions"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Recipe
              </button>
              <Link 
                to="/recipes"
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