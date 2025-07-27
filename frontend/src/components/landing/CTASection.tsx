import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ChefHat } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 bg-muted/30" aria-labelledby="cta-heading">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold">
            Ready to end the
            <span className="block text-primary">
              recipe site frustrations?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Stop losing your place to jumping ads. Stop waiting for slow sites.
            Get all your recipes in one organized, distraction-free place.
          </p>
          <Button
            size="lg"
            className="text-lg px-12 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <Link to="/login">
              <ChefHat className="mr-2 h-5 w-5" />
              Join The Open Beta Today
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
