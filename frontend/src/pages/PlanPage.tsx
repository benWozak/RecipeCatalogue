import { useSubscriptionStatus, useUsageStats, useCreateCheckoutSession, useCreateBillingPortalSession, useIsPremium, useSubscriptionLimits } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Check, X, Crown, Settings, Calendar, BookOpen, Camera, AlertTriangle } from "lucide-react";
import { Link } from "react-router";

export default function PlanPage() {
  const { data: subscriptionStatus, isLoading: statusLoading } = useSubscriptionStatus();
  const { data: usageStats, isLoading: usageLoading } = useUsageStats();
  const isPremium = useIsPremium();
  const { isAtRecipeLimit, isAtParsingLimit, recipeUsage, parsingUsage } = useSubscriptionLimits();
  
  const createCheckoutSession = useCreateCheckoutSession();
  const createBillingPortalSession = useCreateBillingPortalSession();

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
      cta: "Current Plan",
      ctaVariant: "outline" as const,
      popular: false,
      color: chartColors[1],
      isCurrent: !isPremium,
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
      cta: isPremium ? "Current Plan" : "Upgrade to Chef",
      ctaVariant: isPremium ? "outline" as const : "default" as const,
      popular: true,
      color: chartColors[4],
      isCurrent: isPremium,
    },
  ];

  const handleUpgrade = async () => {
    if (isPremium) return;
    
    const currentUrl = window.location.href;
    const successUrl = `${window.location.origin}/profile/plan?session_status=success`;
    const cancelUrl = currentUrl;
    
    createCheckoutSession.mutate({ successUrl, cancelUrl });
  };

  const handleManageBilling = async () => {
    if (!isPremium) return;
    
    const returnUrl = window.location.href;
    createBillingPortalSession.mutate({ returnUrl });
  };

  if (statusLoading || usageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Plan</h1>
          <p className="text-muted-foreground">Manage your subscription and view usage statistics</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/profile" className="flex items-center gap-2">
            <Settings size={16} />
            Back to Profile
          </Link>
        </Button>
      </div>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPremium ? <Crown className="text-yellow-500" size={20} /> : <BookOpen size={20} />}
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your subscription details and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {subscriptionStatus?.tier === 'PREMIUM' ? 'Chef Plan' : 'Casual Plan'}
                </span>
                <Badge variant={isPremium ? "default" : "secondary"} className="text-xs">
                  {subscriptionStatus?.tier || 'FREE'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPremium ? '$5.00/month' : 'Free forever'}
              </p>
              {subscriptionStatus?.current_period_end && (
                <p className="text-xs text-muted-foreground">
                  {subscriptionStatus.cancel_at_period_end 
                    ? `Expires on ${new Date(subscriptionStatus.current_period_end).toLocaleDateString()}`
                    : `Renews on ${new Date(subscriptionStatus.current_period_end).toLocaleDateString()}`
                  }
                </p>
              )}
            </div>
            <div className="space-x-2">
              {isPremium ? (
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={createBillingPortalSession.isPending}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  {createBillingPortalSession.isPending ? "Loading..." : "Manage Billing"}
                </Button>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={createCheckoutSession.isPending}
                  className="flex items-center gap-2"
                >
                  <Crown size={16} />
                  {createCheckoutSession.isPending ? "Loading..." : "Upgrade to Chef"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics (only show for free tier) */}
      {!isPremium && usageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Usage This Month
            </CardTitle>
            <CardDescription>
              Your current usage for {new Date(usageStats.period_start).toLocaleDateString()} - {new Date(usageStats.period_end).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipe Usage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    <span className="font-medium">Recipes</span>
                    {isAtRecipeLimit && <AlertTriangle size={14} className="text-orange-500" />}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {recipeUsage?.current || 0} / {recipeUsage?.limit || 0}
                  </span>
                </div>
                <Progress value={recipeUsage?.percentage || 0} className="h-2" />
                {isAtRecipeLimit && (
                  <p className="text-xs text-orange-600">
                    You've reached your recipe limit. Upgrade to add unlimited recipes.
                  </p>
                )}
              </div>

              {/* Parsing Usage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-primary" />
                    <span className="font-medium">Parsing Uses</span>
                    {isAtParsingLimit && <AlertTriangle size={14} className="text-orange-500" />}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {parsingUsage?.current || 0} / {parsingUsage?.limit || 0}
                  </span>
                </div>
                <Progress value={parsingUsage?.percentage || 0} className="h-2" />
                {isAtParsingLimit && (
                  <p className="text-xs text-orange-600">
                    You've reached your parsing limit. Upgrade for unlimited parsing.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {isPremium ? "Your Plan" : "Upgrade Your Plan"}
          </h2>
          <p className="text-muted-foreground">
            {isPremium 
              ? "You're on the Chef plan with unlimited access to all features"
              : "Choose the plan that works best for your cooking needs"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card
              key={index}
              className={`relative group hover:shadow-lg transition-all duration-300 border-0 backdrop-blur-sm hover:bg-background/80 ring-1 ${
                tier.isCurrent 
                  ? "ring-primary/50 bg-primary/5" 
                  : tier.popular 
                    ? "ring-primary/20" 
                    : "ring-muted"
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

              {tier.isCurrent && (
                <Badge
                  variant="default"
                  className="absolute -top-3 right-4 text-xs"
                >
                  Current Plan
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
                  variant={tier.isCurrent ? "outline" : tier.ctaVariant}
                  className="w-full transition-all duration-300"
                  style={
                    !tier.isCurrent && tier.ctaVariant === "default"
                      ? {
                          backgroundColor: tier.color,
                          color: "white",
                        }
                      : tier.isCurrent
                        ? {}
                        : { borderColor: tier.color, color: tier.color }
                  }
                  onClick={tier.isCurrent ? undefined : tier.name === "Chef" ? handleUpgrade : undefined}
                  disabled={tier.isCurrent || (tier.name === "Chef" && createCheckoutSession.isPending)}
                >
                  {tier.isCurrent ? (
                    <div className="flex items-center gap-2">
                      <Check size={16} />
                      {tier.cta}
                    </div>
                  ) : (
                    tier.cta
                  )}
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
    </div>
  );
}