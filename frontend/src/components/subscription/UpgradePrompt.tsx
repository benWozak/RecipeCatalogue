import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ArrowRight, X } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

interface UpgradePromptProps {
  title: string;
  description: string;
  features?: string[];
  dismissible?: boolean;
  compact?: boolean;
  className?: string;
}

export function UpgradePrompt({ 
  title, 
  description, 
  features, 
  dismissible = false,
  compact = false,
  className = "" 
}: UpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="text-primary" size={20} />
            <div>
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link to="/profile/plan" className="flex items-center gap-1">
                Upgrade
                <ArrowRight size={14} />
              </Link>
            </Button>
            {dismissible && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDismissed(true)}
                className="h-8 w-8 p-0"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-background ${className}`}>
      <CardHeader className="relative">
        {dismissible && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            <X size={14} />
          </Button>
        )}
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Crown className="text-primary" size={20} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {features && features.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Upgrade to unlock:</p>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button asChild className="flex-1">
            <Link to="/profile/plan" className="flex items-center gap-2">
              <Crown size={16} />
              Upgrade to Chef Plan
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/profile/plan">View Plans</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}