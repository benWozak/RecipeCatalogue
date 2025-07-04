import { BrowserRouter as Router, Routes, Route } from 'react-router'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from '@/components/theme-provider'
import Layout from './components/common/Layout'
import HomePage from './pages/HomePage'
import RecipesPage from './pages/RecipesPage'
import RecipeScanPage from './pages/RecipeScanPage'
import InstagramScanPage from './pages/InstagramScanPage'
import URLScanPage from './pages/URLScanPage'
import ImageScanPage from './pages/ImageScanPage'
import ManualRecipePage from './pages/ManualRecipePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import RecipeFormPage from './pages/RecipeFormPage'
import MealPlansPage from './pages/MealPlansPage'
import NewMealPlanPage from './pages/NewMealPlanPage'
import NotFoundPage from './pages/NotFoundPage'
import PWABadge from './PWABadge.tsx'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="recipe-catalogue-theme">
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
                <Route path="/recipes/scan" element={<RecipeScanPage />} />
                <Route path="/recipes/scan/instagram" element={<InstagramScanPage />} />
                <Route path="/recipes/scan/url" element={<URLScanPage />} />
                <Route path="/recipes/scan/image" element={<ImageScanPage />} />
                <Route path="/recipes/scan/manual" element={<ManualRecipePage />} />
                <Route path="/recipes/new" element={<RecipeFormPage />} />
                <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
                <Route path="/meal-plans" element={<MealPlansPage />} />
                <Route path="/meal-plans/new" element={<NewMealPlanPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </SignedIn>
          
          <PWABadge />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
