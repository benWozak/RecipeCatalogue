import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Smartphone, BookOpen, Calendar } from "lucide-react";

export function FeaturesSection() {
  const chartColors = ["#89ccac", "#608bd1", "#977bd7", "#c6923a", "#329776"];

  const features = [
    {
      icon: Globe,
      title: "No More Distractions",
      description:
        "Clean, ad-free interface that never jumps or shifts while you're cooking. No more losing your place!",
      badge: "Ad-Free",
      color: chartColors[0],
    },
    {
      icon: Smartphone,
      title: "Instant Access",
      description:
        "All your recipes load instantly. No waiting for slow recipe sites or broken 'jump to recipe' buttons.",
      badge: "Lightning Fast",
      color: chartColors[1],
    },
    {
      icon: BookOpen,
      title: "One Central Place",
      description:
        "All your recipes from Instagram, web bookmarks, and reading lists organized in one searchable location.",
      badge: "Unified",
      color: chartColors[2],
    },
    {
      icon: Calendar,
      title: "Easy Discovery",
      description:
        "Smart search and organization so you can actually find that recipe you saved. Plus meal planning!",
      badge: "Coming Soon",
      color: chartColors[3],
    },
  ];

  return (
    <section
      id="features"
      className="py-20 bg-muted/30"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Solve the problems that make
            <span className="block text-primary">
              modern home-cooking frustrating
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tired of slow page loads and ads that make you lose your place?
            Can't remember where you saved that recipe? This app solves all
            those problems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            >
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300"
                    style={{
                      backgroundColor: `${feature.color}1a`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${feature.color}33`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${feature.color}1a`;
                    }}
                  >
                    <feature.icon
                      className="h-8 w-8"
                      style={{ color: feature.color }}
                    />
                  </div>
                  {feature.badge && (
                    <Badge
                      style={{ backgroundColor: feature.color }}
                      className="absolute -top-2 -right-2 text-xs text-secondary-foreground"
                    >
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
