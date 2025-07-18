import { SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuroraText } from "@/components/ui/aurora-text";
import {
  ChefHat,
  BookOpen,
  Calendar,
  Smartphone,
  Globe,
  Camera,
  Instagram,
  Sparkles,
  Search,
  Edit3,
  FolderOpen,
  Share2,
  CircleCheckBig,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Globe,
      title: "No More Distractions",
      description:
        "Clean, ad-free interface that never jumps or shifts while you're cooking. No more losing your place!",
      badge: "Ad-Free",
    },
    {
      icon: Smartphone,
      title: "Instant Access",
      description:
        "All your recipes load instantly. No waiting for slow recipe sites or broken 'jump to recipe' buttons.",
      badge: "Lightning Fast",
    },
    {
      icon: BookOpen,
      title: "One Central Place",
      description:
        "All your recipes from Instagram, web bookmarks, and reading lists organized in one searchable location.",
      badge: "Unified",
    },
    {
      icon: Calendar,
      title: "Easy Discovery",
      description:
        "Smart search and organization so you can actually find that recipe you saved. Plus meal planning!",
      badge: "Coming Soon",
    },
  ];

  return (
    <article className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center space-y-8">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              <ChefHat className="h-12 w-12 text-primary" />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Recipe Catalogue
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Finally, All Your Recipes <br />
                <AuroraText className="block" colors={["#89CCAC", "#B689CC"]}>
                  In One Place
                </AuroraText>
              </h1>
              <div className="flex flex-col gap-2 max-w-xl justify-start mx-auto">
                <p className="sm:text-lg text-muted-foreground leading-relaxed inline-flex items-center">
                  <CircleCheckBig className="mr-2" /> No more losing your place
                  when ads refresh.
                </p>
                <p className="sm:text-lg text-muted-foreground leading-relaxed inline-flex items-center">
                  <CircleCheckBig className="mr-2" /> No more waiting for slow
                  recipe sites.
                </p>
                <p className="sm:text-lg text-muted-foreground leading-relaxed inline-flex items-center">
                  <CircleCheckBig className="mr-2" /> No more searching through
                  Insta, bookmarks, and reading lists.
                </p>
                <p className="sm:text-lg text-muted-foreground leading-relaxed inline-flex items-center">
                  <CircleCheckBig className="mr-2" /> Just your recipes,
                  organized and ready to use.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </SignInButton>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
                asChild
              >
                <a href="#features">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Learn More
                </a>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center space-x-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Any Website</span>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4" />
                <span>Instagram Posts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Photo Scanning</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Solve the problems that
              <span className="block text-primary">
                make cooking frustrating
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've all been there—ads that make pages jump, slow recipe sites,
              and recipes scattered everywhere. This app fixes all of that.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    {feature.badge && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 text-xs bg-primary/20 text-primary border-primary/30"
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

      {/* Detailed Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful Features
              <span className="block text-primary">Built for Home Cooks</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to collect, organize, and use your recipes
              effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* PWA Cross Platform */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Smartphone className="h-10 w-10 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 bg-primary/20 text-primary border-primary/30"
                  >
                    PWA Ready
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Cross-Platform Access
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Works on any device - iOS, Android, or desktop. Install like
                    a native app with offline access to all your recipes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Multi-Source Parsing */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Globe className="h-10 w-10 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 bg-primary/20 text-primary border-primary/30"
                  >
                    AI Powered
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Multi-Source Recipe Parsing
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Parse recipes from any website, extract from Instagram
                    posts, or scan from photos with intelligent AI extraction.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Meal Planning */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Calendar className="h-10 w-10 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 bg-primary/20 text-primary border-primary/30"
                  >
                    Coming Soon
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Weekly Meal Planning
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Plan your weeks with intuitive drag-and-drop interface. Plan
                    for multiple weeks ahead with your saved recipes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Smart Search */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Search className="h-10 w-10 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 bg-primary/20 text-primary border-primary/30"
                  >
                    Smart
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Smart Recipe Search
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Find recipes by ingredients, cuisine, cooking time, or any
                    keyword. Advanced filtering makes discovery effortless.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Easy Updates */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Edit3 className="h-10 w-10 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 bg-primary/20 text-primary border-primary/30"
                  >
                    Flexible
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Easy to Update & Modify
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Edit recipes with a simple interface. Add personal notes,
                    modifications, and rate your favorites.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Collections & Folders */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <FolderOpen className="h-10 w-10 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 bg-primary/20 text-primary border-primary/30"
                  >
                    Organized
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Collections & Folders
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Create custom recipe collections. Organize by cuisine,
                    occasion, or preference with smart tagging.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recipe Sharing */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80 md:col-span-2 lg:col-span-1">
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Share2 className="h-10 w-10 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 bg-primary/20 text-primary border-primary/30"
                  >
                    Social
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Recipe Sharing
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Share your favorite recipes with friends and family. Export
                    recipes in multiple formats for easy sharing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to end the
              <span className="block text-primary">
                recipe site frustrations?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Stop losing your place to jumping ads. Stop waiting for slow
              sites. Get all your recipes in one organized, distraction-free
              place.
            </p>
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="text-lg px-12 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ChefHat className="mr-2 h-5 w-5" />
                Get Your Recipes Organized
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>
    </article>
  );
}
