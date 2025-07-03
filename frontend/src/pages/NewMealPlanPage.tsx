import { Link } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewMealPlanPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/meal-plans"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create Meal Plan</h1>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Plan Name
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter plan name (e.g., Weekly Meal Plan)"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Start Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  End Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Meal Schedule</h3>
              <div className="text-muted-foreground">
                Meal planning interface will be built here
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Create Plan
              </button>
              <Link 
                to="/meal-plans"
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