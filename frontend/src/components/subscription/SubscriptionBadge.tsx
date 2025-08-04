import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { useIsPremium } from "@/hooks/useSubscription";

interface SubscriptionBadgeProps {
  showIcon?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default";
  className?: string;
}

export function SubscriptionBadge({ 
  showIcon = true, 
  variant = "default",
  size = "default",
  className = "" 
}: SubscriptionBadgeProps) {
  const isPremium = useIsPremium();

  if (!isPremium) {
    return (
      <Badge 
        variant="secondary" 
        className={`${size === 'sm' ? 'text-xs px-2 py-0.5' : ''} ${className}`}
      >
        {showIcon && <Crown size={size === 'sm' ? 12 : 14} className="mr-1" />}
        Free
      </Badge>
    );
  }

  return (
    <Badge 
      variant={variant}
      className={`${size === 'sm' ? 'text-xs px-2 py-0.5' : ''} bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 hover:from-yellow-500 hover:to-yellow-700 ${className}`}
    >
      {showIcon && <Crown size={size === 'sm' ? 12 : 14} className="mr-1" />}
      Chef
    </Badge>
  );
}