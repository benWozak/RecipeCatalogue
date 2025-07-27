import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { AuroraText } from "@/components/ui/aurora-text";
import { BoxReveal } from "@/components/magicui/box-reveal";
import {
  ChefHat,
  BookOpen,
  Globe,
  Camera,
  Instagram,
  Sparkles,
  CircleCheckBig,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="flex flex-col items-center justify-between w-full mb-10 lg:flex-row">
        <div className="mb-16 lg:mb-0 lg:max-w-2xl lg:pr-5">
          <div className="lg:w-2xl mb-6">
            <div className="flex items-center space-x-2 mb-6">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Recipe Catalogue
              </span>
            </div>
            <div>
              <BoxReveal boxColor="#89CCAC" duration={0.5}>
                <p className="inline-block mb-4 text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  coming soon
                </p>
              </BoxReveal>
            </div>
            <BoxReveal boxColor="#B689CC" duration={0.7}>
              <h1 className="font-sans text-3xl font-bold tracking-tight sm:text-4xl sm:leading-none max-w-lg mb-6">
                Finally, All Your Recipes <br className="hidden md:block" />
                <AuroraText
                  className="inline-block"
                  colors={["#89CCAC", "#B689CC"]}
                >
                  In One Place
                </AuroraText>
              </h1>
            </BoxReveal>
            <div className="flex flex-col gap-2 mb-6">
              <BoxReveal boxColor="#89CCAC" duration={0.5}>
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg inline-flex items-center">
                  <CircleCheckBig className="mr-2 h-5 w-5 text-green-600" /> No
                  more losing your place when ads refresh
                </p>
              </BoxReveal>
              <BoxReveal boxColor="#B689CC" duration={0.5}>
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg inline-flex items-center">
                  <CircleCheckBig className="mr-2 h-5 w-5 text-green-600" /> No
                  more waiting for slow recipe sites
                </p>
              </BoxReveal>
              <BoxReveal boxColor="#89CCAC" duration={0.5}>
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg inline-flex items-center">
                  <CircleCheckBig className="mr-2 h-5 w-5 text-green-600" /> No
                  more scrolling through reading lists
                </p>
              </BoxReveal>
              <BoxReveal boxColor="#B689CC" duration={0.6}>
                <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl inline-flex items-center">
                  Just your recipes, streamlined and ready for your next meal
                </p>
              </BoxReveal>
            </div>
          </div>
          <BoxReveal boxColor="#89CCAC" duration={0.8}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <Button
                size="lg"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link to="/login">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button
                // variant="outline"
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
          </BoxReveal>
          <div className="flex items-center space-x-3">
            {/* App store links commented out as in original */}
          </div>
          <BoxReveal boxColor="#B689CC" duration={0.6}>
            <div className="flex items-center space-x-6 pt-6 text-sm text-muted-foreground">
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
          </BoxReveal>
        </div>
        <div className="flex items-center justify-center lg:w-1/2">
          <div className="w-2/5">
            <img
              className="object-cover"
              src="https://kitwind.io/assets/kometa/one-girl-phone.png"
              alt="Person using Recipe Catalogue app on mobile device"
            />
          </div>
          <div className="w-5/12 -ml-16 lg:-ml-32">
            <img
              className="object-cover"
              src="https://kitwind.io/assets/kometa/two-girls-phone.png"
              alt="Two people sharing recipes using the Recipe Catalogue mobile app"
            />
          </div>
        </div>
      </div>
      <a
        href="#features"
        aria-label="Scroll down"
        className="flex items-center justify-center w-10 h-10 mx-auto text-gray-600 hover:text-deep-purple-accent-400 hover:border-deep-purple-accent-400 duration-300 transform border border-gray-400 rounded-full hover:shadow hover:scale-110"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M10.293,3.293,6,7.586,1.707,3.293A1,1,0,0,0,.293,4.707l5,5a1,1,0,0,0,1.414,0l5-5a1,1,0,1,0-1.414-1.414Z" />
        </svg>
      </a>
    </section>
  );
}
