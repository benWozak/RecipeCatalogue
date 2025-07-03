import { Link } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewMealPlanPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/meal-plans"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Meal Plan</h1>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
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
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Start Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  End Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Schedule</h3>
              <div className="text-gray-600">
                Meal planning interface will be built here
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Create Plan
              </button>
              <Link 
                to="/meal-plans"
                className="bg-gray-200 text-gray-900 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
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