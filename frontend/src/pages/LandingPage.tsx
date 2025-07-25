import SEO from "@/components/SEO";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DetailedFeaturesSection } from "@/components/landing/DetailedFeaturesSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Recipe Catalogue",
    "description": "Organize all your recipes from any website, Instagram posts, and photos in one clean, ad-free interface. No more losing your place to jumping ads and slow recipe sites.",
    "url": "https://recipecatalogue.app",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web Browser, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Recipe Catalogue",
      "url": "https://recipecatalogue.app"
    },
    "featureList": [
      "Ad-free recipe viewing",
      "Multi-source recipe parsing",
      "Instagram recipe extraction",
      "Photo recipe scanning",
      "Smart recipe search",
      "Cross-platform access",
      "Meal planning tools"
    ],
    "screenshot": "https://recipecatalogue.app/app-screenshot.png"
  };

  return (
    <>
      <SEO 
        structuredData={structuredData}
        title="Recipe Catalogue - All Your Recipes In One Place"
        description="Stop losing your place to jumping ads and slow recipe sites. Recipe Catalogue organizes all your recipes from any website, Instagram posts, and photos in one clean, ad-free interface."
        keywords="recipe organizer, meal planning, recipe collection, cooking app, recipe manager, ad-free recipes, recipe storage, instagram recipes, photo scanning"
      />
      <article className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <HeroSection />
        <FeaturesSection />
        <DetailedFeaturesSection />
        <CTASection />
      </article>
    </>
  );
}
