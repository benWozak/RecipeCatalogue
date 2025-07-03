import { Link, useLocation } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import { Home, BookOpen, Calendar } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Recipes", href: "/recipes", icon: BookOpen },
    { name: "Meal Plans", href: "/meal-plans", icon: Calendar },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Desktop Header */}
      <header className="bg-card border-b border-border hidden lg:block sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-foreground">
                Recipe Catalogue
              </Link>

              {/* Desktop Navigation */}
              <nav className="flex items-center gap-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon size={16} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Simplified */}
      <header className="bg-card border-b border-border lg:hidden sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="text-xl font-bold text-foreground">
            Recipe Catalogue
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding for mobile nav */}
      <main className="pb-16 lg:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
