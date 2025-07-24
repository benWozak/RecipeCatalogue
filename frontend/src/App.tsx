import { BrowserRouter as Router, Routes, Route } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { ThemeProvider } from "@/components/theme-provider";
import { RouteErrorBoundary } from "@/components/error";
import Layout from "./components/common/Layout";
import LandingPage from "./pages/LandingPage.tsx";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RecipesPage from "./pages/RecipesPage";
import RecipeScanPage from "./pages/RecipeScanPage";
import InstagramScanPage from "./pages/InstagramScanPage";
import URLScanPage from "./pages/URLScanPage";
import ImageScanPage from "./pages/ImageScanPage";
import ManualRecipePage from "./pages/ManualRecipePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import RecipeFormPage from "./pages/RecipeFormPage";
import CollectionsPage from "./pages/CollectionsPage";
import ActiveMealPlanPage from "./pages/ActiveMealPlanPage";
import MealPlansPage from "./pages/MealPlansPage";
import NewMealPlanPage from "./pages/NewMealPlanPage";
import MealPlanDetailPage from "./pages/MealPlanDetailPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import PWABadge from "./PWABadge.tsx";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="recipe-catalogue-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <SignedOut>
            <Routes>
              <Route path="/" element={
                <RouteErrorBoundary routeName="Landing">
                  <LandingPage />
                </RouteErrorBoundary>
              } />
              <Route path="/login" element={
                <RouteErrorBoundary routeName="Login">
                  <LoginPage />
                </RouteErrorBoundary>
              } />
              <Route path="*" element={
                <RouteErrorBoundary routeName="Not Found">
                  <NotFoundPage />
                </RouteErrorBoundary>
              } />
            </Routes>
          </SignedOut>

          <SignedIn>
            <Layout>
              <Routes>
                <Route path="/" element={
                  <RouteErrorBoundary routeName="Home">
                    <HomePage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes" element={
                  <RouteErrorBoundary routeName="Recipes">
                    <RecipesPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes/scan" element={
                  <RouteErrorBoundary routeName="Recipe Scan">
                    <RecipeScanPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes/scan/instagram" element={
                  <RouteErrorBoundary routeName="Instagram Scan">
                    <InstagramScanPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes/scan/url" element={
                  <RouteErrorBoundary routeName="URL Scan">
                    <URLScanPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes/scan/image" element={
                  <RouteErrorBoundary routeName="Image Scan">
                    <ImageScanPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes/scan/manual" element={
                  <RouteErrorBoundary routeName="Manual Recipe">
                    <ManualRecipePage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes/new" element={
                  <RouteErrorBoundary routeName="New Recipe">
                    <RecipeFormPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes/:id" element={
                  <RouteErrorBoundary routeName="Recipe Details">
                    <RecipeDetailPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/recipes/:id/edit" element={
                  <RouteErrorBoundary routeName="Edit Recipe">
                    <RecipeFormPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/collections" element={
                  <RouteErrorBoundary routeName="Collections">
                    <CollectionsPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/meal-plans" element={
                  <RouteErrorBoundary routeName="Active Meal Plan">
                    <ActiveMealPlanPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/meal-plans/all" element={
                  <RouteErrorBoundary routeName="All Meal Plans">
                    <MealPlansPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/meal-plans/new" element={
                  <RouteErrorBoundary routeName="New Meal Plan">
                    <NewMealPlanPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/meal-plans/:id" element={
                  <RouteErrorBoundary routeName="Meal Plan Details">
                    <MealPlanDetailPage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="/profile" element={
                  <RouteErrorBoundary routeName="Profile">
                    <ProfilePage />
                  </RouteErrorBoundary>
                } />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </SignedIn>

          <PWABadge />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
