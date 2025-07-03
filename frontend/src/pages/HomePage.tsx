import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Recipe Catalogue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Organize, discover, and manage your favorite recipes
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/recipes">
                View Recipes
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/meal-plans">
                Meal Plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}