import { BrowserRouter as Router, Routes, Route } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "./components/common/Layout";
import LandingPage from "./pages/LandingPage.tsx";
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
            <LandingPage />
          </SignedOut>

          <SignedIn>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="/recipes/scan" element={<RecipeScanPage />} />
                <Route
                  path="/recipes/scan/instagram"
                  element={<InstagramScanPage />}
                />
                <Route path="/recipes/scan/url" element={<URLScanPage />} />
                <Route path="/recipes/scan/image" element={<ImageScanPage />} />
                <Route
                  path="/recipes/scan/manual"
                  element={<ManualRecipePage />}
                />
                <Route path="/recipes/new" element={<RecipeFormPage />} />
                <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/meal-plans" element={<MealPlansPage />} />
                <Route path="/meal-plans/new" element={<NewMealPlanPage />} />
                <Route
                  path="/meal-plans/:id"
                  element={<MealPlanDetailPage />}
                />
                <Route path="/profile" element={<ProfilePage />} />
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
