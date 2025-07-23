import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Globe,
  Calendar,
  Search,
  Edit3,
  Share2,
} from "lucide-react";

export function DetailedFeaturesSection() {
  const chartColors = ["#89ccac", "#608bd1", "#977bd7", "#c6923a", "#329776"];

  const detailedFeatures = [
    {
      icon: Smartphone,
      title: "Cross-Platform Access",
      description:
        "Works on any device - iOS, Android, or desktop. Install like a native app with offline access to all your recipes.",
      badge: "PWA Ready",
      gridClass: "",
      color: chartColors[0],
    },
    {
      icon: Globe,
      title: "Multi-Source Recipe Parsing",
      description:
        "Parse recipes from any website, extract from Instagram posts, or scan from photos with intelligent AI extraction.",
      badge: "AI Powered",
      gridClass: "",
      color: chartColors[1],
    },
    {
      icon: Calendar,
      title: "Weekly Meal Planning",
      description:
        "Plan your weeks with intuitive drag-and-drop interface. Plan for multiple weeks ahead with your saved recipes.",
      badge: "Coming Soon",
      gridClass: "",
      color: chartColors[2],
    },
    {
      icon: Search,
      title: "Smart Recipe Search",
      description:
        "Find recipes by ingredients, cuisine, cooking time, or any keyword. Advanced filtering makes discovery effortless.",
      badge: "Smart",
      gridClass: "",
      color: chartColors[3],
    },
    {
      icon: Edit3,
      title: "Easy to Update & Modify",
      description:
        "Edit recipes with a simple interface. Add personal notes, modifications, and rate your favorites.",
      badge: "Flexible",
      gridClass: "",
      color: chartColors[4],
    },
    {
      icon: Share2,
      title: "Recipe Sharing",
      description:
        "Share your favorite recipes with friends and family. Export recipes in multiple formats for easy sharing.",
      badge: "Social",
      gridClass: "md:col-span-2 lg:col-span-1",
      color: chartColors[0],
    },
  ];

  return (
    <section className="py-20" aria-labelledby="detailed-features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="detailed-features-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Powerful Features
            <span className="block text-primary">Built for Home Cooks</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to collect, organize, and use your recipes
            effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {detailedFeatures.map((feature, index) => (
            <Card
              key={index}
              className={`group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80 ${feature.gridClass}`}
            >
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center transition-colors duration-300"
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
                      className="h-10 w-10"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <Badge
                    style={{ backgroundColor: feature.color }}
                    className="absolute -top-2 -right-2 text-secondary-foreground"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
