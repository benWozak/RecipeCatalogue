import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { Link } from "react-router";

export function PricingSection() {
  const chartColors = ["#89ccac", "#608bd1", "#977bd7", "#c6923a", "#329776"];

  const pricingTiers = [
    {
      name: "Casual",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started with recipe organization",
      features: [
        {
          name: "Recipe Storage",
          detail: "Maximum 20 recipes",
          included: true,
        },
        {
          name: "Recipe Parsing",
          detail: "10 URL/Instagram parsing uses per month",
          included: true,
        },
        {
          name: "Meal Planning",
          detail: "1 week planning only (no saving meal plans)",
          included: true,
        },
        {
          name: "Image Processing",
          detail: "No access to image text parsing (OCR)",
          included: false,
        },
      ],
      cta: "Get Started Free",
      ctaVariant: "outline" as const,
      popular: false,
      color: chartColors[1],
    },
    {
      name: "Chef",
      price: "$5",
      period: "/month",
      description: "Everything you need for unlimited recipe management",
      features: [
        { name: "Recipe Storage", detail: "Unlimited recipes", included: true },
        {
          name: "Recipe Parsing",
          detail: "Unlimited URL/Instagram parsing",
          included: true,
        },
        {
          name: "Meal Planning",
          detail: "Unlimited meal planning with save functionality",
          included: true,
        },
        {
          name: "Image Processing",
          detail: "Full access to image text parsing (OCR)",
          included: true,
        },
      ],
      cta: "Start Premium",
      ctaVariant: "default" as const,
      popular: true,
      color: chartColors[4],
    },
  ];

  return (
    <section
      id="pricing"
      className="py-20 bg-background"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Simple, Transparent
            <span className="block text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready for unlimited recipe
            management
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card
              key={index}
              className={`relative group hover:shadow-lg transition-all duration-300 border-0 backdrop-blur-sm hover:bg-background/80 ring-1 ${
                tier.popular ? "ring-primary/20" : "ring-muted"
              }`}
            >
              {tier.popular && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs text-secondary-foreground"
                  style={{ backgroundColor: tier.color }}
                >
                  Most Popular
                </Badge>
              )}

              <CardHeader className="p-6 pb-4">
                <div className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold">
                    {tier.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground ml-1">
                      {tier.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {tier.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-2 space-y-6">
                <ul className="space-y-4">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          feature.included ? "text-green-500" : "text-red-600"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">
                          {feature.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {feature.detail}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant={tier.ctaVariant}
                  className="w-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                  style={
                    tier.ctaVariant === "default"
                      ? {
                          backgroundColor: tier.color,
                          color: "white",
                        }
                      : { borderColor: tier.color, color: tier.color }
                  }
                  asChild
                >
                  <Link to="/login">{tier.cta}</Link>
                </Button>
              </CardContent>

              <span
                className="absolute -bottom-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r opacity-70"
                style={{
                  backgroundImage: `linear-gradient(to right, transparent, ${tier.color}, transparent)`,
                }}
              />
              <span
                className="absolute inset-0 opacity-70 pointer-events-none"
                style={{
                  background: `radial-gradient(50% 15% at 50% 100%, ${tier.color}60 0%, transparent 100%)`,
                }}
              />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
