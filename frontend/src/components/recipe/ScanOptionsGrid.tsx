import { Link } from "react-router";
import { ActionCard } from "@/components/ui/action-card";
import { ActionGrid } from "@/components/ui/action-grid";
import { scanOptions } from "@/constants/scanOptions";

interface ScanOptionsGridProps {
  className?: string;
}

export function ScanOptionsGrid({ className = "" }: ScanOptionsGridProps) {
  return (
    <ActionGrid className={className}>
      {scanOptions.map((option) => (
        <Link key={option.title} to={option.href}>
          <ActionCard
            icon={option.icon}
            title={option.title}
            description={option.description}
            variant={option.featured ? "featured" : "default"}
            size="large"
          />
        </Link>
      ))}
    </ActionGrid>
  );
}