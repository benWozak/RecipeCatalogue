import { Link } from 'react-router'
import { Plus, Calendar } from 'lucide-react'

export default function MealPlansPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meal Plans</h1>
          <Link 
            to="/meal-plans/new" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Plan
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center text-card-foreground">
            <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p>No meal plans yet. Create your first meal plan to get started!</p>
          </div>
        </div>
      </div>
    </div>
  )
}