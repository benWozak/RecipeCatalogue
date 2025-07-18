import { Link, useLocation } from "react-router";
import { Home, BookOpen, FolderOpen, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Recipes", href: "/recipes", icon: BookOpen },
    { name: "Add", href: "/recipes/scan", icon: Plus, special: true },
    { name: "Collections", href: "/collections", icon: FolderOpen },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around h-16 px-2 safe-area-pb">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const isSpecial = item.special;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 py-1 text-xs font-medium transition-colors min-w-0",
                "touch-manipulation", // Improves touch responsiveness
                isSpecial
                  ? "relative"
                  : active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isSpecial ? (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg -mt-6">
                  <Icon size={24} />
                </div>
              ) : (
                <>
                  <Icon size={20} className="mb-1" />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
