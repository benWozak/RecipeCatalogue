import { BrowserRouter as Router, Routes, Route } from 'react-router'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import Layout from './components/common/Layout'
import HomePage from './pages/HomePage'
import RecipesPage from './pages/RecipesPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import NewRecipePage from './pages/NewRecipePage'
import EditRecipePage from './pages/EditRecipePage'
import MealPlansPage from './pages/MealPlansPage'
import NewMealPlanPage from './pages/NewMealPlanPage'
import NotFoundPage from './pages/NotFoundPage'
import PWABadge from './PWABadge.tsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <SignedOut>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-8">Recipe Catalogue</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Please sign in to access your recipes
              </p>
              <SignInButton mode="modal">
                <Button size="lg">
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/new" element={<NewRecipePage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
              <Route path="/meal-plans" element={<MealPlansPage />} />
              <Route path="/meal-plans/new" element={<NewMealPlanPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </SignedIn>
        
        <PWABadge />
      </div>
    </Router>
  )
}

export default App
