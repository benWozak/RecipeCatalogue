import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const actionGridVariants = cva(
  "grid gap-6",
  {
    variants: {
      columns: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      },
      maxWidth: {
        none: "",
        "3xl": "max-w-3xl mx-auto",
        "4xl": "max-w-4xl mx-auto",
        "5xl": "max-w-5xl mx-auto",
        "6xl": "max-w-6xl mx-auto",
      },
    },
    defaultVariants: {
      columns: 4,
      maxWidth: "6xl",
    },
  }
);

export interface ActionGridProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof actionGridVariants> {}

const ActionGrid = React.forwardRef<HTMLDivElement, ActionGridProps>(
  ({ className, columns, maxWidth, ...props }, ref) => {
    return (
      <div
        className={cn(actionGridVariants({ columns, maxWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

ActionGrid.displayName = "ActionGrid";

export { ActionGrid, actionGridVariants };