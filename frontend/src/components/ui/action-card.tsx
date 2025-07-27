import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const actionCardVariants = cva(
  "group block cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl rounded-2xl overflow-hidden",
  {
    variants: {
      variant: {
        featured: "bg-primary text-primary-foreground",
        default:
          "bg-muted border border-muted-foreground text-muted-foreground",
        outline:
          "bg-background border border-border text-foreground hover:bg-accent/40 transition-all duration-200",
        secondary:
          "bg-background border border-primary text-primary hover:bg-accent hover:text-accent-foreground dark:border-secondary dark:text-secondary dark:hover:bg-secondary/40 transition-all duration-200",
      },
      size: {
        compact: "p-6 h-24",
        large: "p-8 h-32 md:h-80",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "large",
    },
  }
);

export interface ActionCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof actionCardVariants> {
  icon: LucideIcon;
  title: string;
  description: string;
  asChild?: boolean;
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  (
    {
      className,
      variant,
      size,
      icon: Icon,
      title,
      description,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        className={cn(actionCardVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className={cn("mb-2", size === "large" && "md:mb-6")}>
            <Icon
              className={cn("h-6 w-6", size === "large" && "md:h-12 md:w-12")}
            />
          </div>
          <div className={cn("space-y-1", size === "large" && "md:space-y-3")}>
            <h3
              className={cn(
                "font-bold",
                size === "compact" ? "text-lg" : "text-xl"
              )}
            >
              {title}
            </h3>
            <p
              className={cn(
                "text-sm opacity-80 leading-relaxed",
                size === "compact" && "text-xs"
              )}
            >
              {description}
            </p>
          </div>
        </div>
      </Comp>
    );
  }
);

ActionCard.displayName = "ActionCard";

export { ActionCard, actionCardVariants };
