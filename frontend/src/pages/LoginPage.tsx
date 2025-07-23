import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router";
import { ChefHat, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="flex flex-col items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Recipe Catalogue
            </span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to organize your recipes and meal plans
            </p>
          </div>

          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/90 text-white",
                  card: "shadow-lg",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                },
              }}
              signUpUrl={undefined}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-sm text-muted-foreground">
        <p>
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </footer>
    </div>
  );
}
