import {
  Globe,
  Camera,
  Instagram,
  Search,
  Calendar,
  Share2,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  position?: "left" | "right";
  cornerStyle?: string;
  color: string;
};

const chartColors = [
  "#89ccac",
  "#608bd1",
  "#977bd7",
  "#c6923a",
  "#329776",
  "#B689CC",
];

const leftFeatures: FeatureItem[] = [
  {
    icon: Globe,
    title: "Get From Any Website",
    description:
      "Easily extract recipes from anywhere on the web using intelligent, AI-powered parsing technology.",
    position: "left",
    cornerStyle: "sm:translate-x-4 sm:rounded-br-[2px]",
    color: chartColors[0],
  },
  {
    icon: Instagram,
    title: "Instagram Recipe Import",
    description:
      "Turn Instagram recipe posts into organized, searchable recipes with intelligent extraction and formatting.",
    position: "left",
    cornerStyle: "sm:-translate-x-4 sm:rounded-br-[2px]",
    color: chartColors[1],
  },
  {
    icon: Camera,
    title: "Photo Recipe Scanning",
    description:
      "Scan recipe cards, cookbook pages, or handwritten notes and convert them into digital recipes instantly.",
    position: "left",
    cornerStyle: "sm:translate-x-4 sm:rounded-tr-[2px]",
    color: chartColors[2],
  },
];

const rightFeatures: FeatureItem[] = [
  {
    icon: Search,
    title: "Make it Yours",
    description:
      "Modify recipes the way you like them. Add notes, adjust ingredients, and create your own variations.",
    position: "right",
    cornerStyle: "sm:-translate-x-4 sm:rounded-bl-[2px]",
    color: chartColors[3],
  },
  {
    icon: Calendar,
    title: "Weekly Meal Planning",
    description:
      'Plan your meals weeks ahead with an intuitive interface. Never wonder "what\'s for dinner" again.',
    position: "right",
    cornerStyle: "sm:translate-x-4 sm:rounded-bl-[2px]",
    color: chartColors[5],
  },
  {
    icon: Share2,
    title: "Account Linking",
    description:
      "Sync effortlessly with your partner and share your favorite recipes and plan weekly meals with your entire household.",
    position: "right",
    cornerStyle: "sm:-translate-x-4 sm:rounded-tl-[2px]",
    color: chartColors[4],
  },
];

const FeatureCard = ({ feature }: { feature: FeatureItem }) => {
  const Icon = feature.icon;

  return (
    <div>
      <Card
        id="details"
        className={cn(
          "relative rounded-2xl px-4 pt-4 pb-4 text-sm border-0",
          "ring-muted ring-1 hover:bg-background/80 transition-all duration-300",
          feature.cornerStyle
        )}
      >
        <CardHeader className="p-0 gap-0">
          <div className="mb-3 text-[2rem]">
            <Icon style={{ color: feature.color }} />
          </div>
          <CardTitle className="text-foreground mb-2.5 text-2xl font-semibold">
            {feature.title}
          </CardTitle>
        </CardHeader>
        <CardDescription className="text-muted-foreground text-base text-pretty leading-relaxed">
          {feature.description}
        </CardDescription>
        <span
          className="absolute -bottom-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r opacity-70"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${feature.color}, transparent)`,
          }}
        ></span>
        <span
          className="absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(50% 15% at 50% 100%, ${feature.color}60 0%, transparent 100%)`,
          }}
        ></span>
      </Card>
    </div>
  );
};

export function ThreeColumnFeaturesSection() {
  return (
    <section className="pt-20 pb-8" id="three-column-features">
      <div className="mx-6 max-w-[1120px] pt-2 pb-16 max-[300px]:mx-4 min-[1150px]:mx-auto">
        <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-3">
          <div className="flex flex-col gap-6">
            {leftFeatures.map((feature, index) => (
              <FeatureCard key={`left-feature-${index}`} feature={feature} />
            ))}
          </div>

          <div className="order-[1] mb-6 self-center sm:order-[0] md:mb-0">
            <div className="bg-background/50 backdrop-blur-sm text-foreground ring-border/20 relative mx-auto mb-4.5 w-fit rounded-full rounded-bl-[2px] px-4 py-2 text-sm ring">
              <span className="relative z-1 flex items-center gap-2">
                Features
              </span>
              <span className="from-primary/10 via-primary to-primary/0 absolute -bottom-px left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r"></span>
              <span className="absolute inset-0 bg-[radial-gradient(30%_40%_at_50%_100%,hsl(var(--primary)/0.75)_0%,transparent_100%)]"></span>
            </div>
            <h2 className="text-foreground mb-2 text-center text-2xl sm:mb-2.5 md:text-[2rem] font-bold">
              Tools That Make Home Cooking{" "}
              <span className="text-chart-3">Effortless</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-[22rem] text-center text-pretty">
              Everything you need to collect, organize, and use your recipes
              effectively in one seamless experience.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {rightFeatures.map((feature, index) => (
              <FeatureCard key={`right-feature-${index}`} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
