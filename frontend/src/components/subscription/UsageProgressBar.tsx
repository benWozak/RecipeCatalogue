import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface UsageProgressBarProps {
  label: string;
  current: number;
  limit: number;
  icon?: React.ReactNode;
  showBadge?: boolean;
  className?: string;
}

export function UsageProgressBar({ 
  label, 
  current, 
  limit, 
  icon, 
  showBadge = true,
  className = "" 
}: UsageProgressBarProps) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isAtLimit = current >= limit;
  const isNearLimit = percentage >= 80;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{label}</span>
          {showBadge && isAtLimit && <AlertTriangle size={14} className="text-orange-500" />}
          {showBadge && !isAtLimit && percentage === 0 && <CheckCircle size={14} className="text-green-500" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {current} / {limit}
          </span>
          {showBadge && isNearLimit && !isAtLimit && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
              {Math.round(percentage)}%
            </Badge>
          )}
        </div>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-orange-100' : ''}`}
      />
      {isAtLimit && (
        <p className="text-xs text-orange-600">
          You've reached your {label.toLowerCase()} limit. Upgrade for unlimited access.
        </p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-orange-600">
          You're close to your {label.toLowerCase()} limit ({Math.round(percentage)}% used).
        </p>
      )}
    </div>
  );
}