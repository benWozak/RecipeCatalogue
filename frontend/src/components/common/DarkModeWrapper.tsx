import { useEffect } from "react";

interface DarkModeWrapperProps {
  children: React.ReactNode;
}

export function DarkModeWrapper({ children }: DarkModeWrapperProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    const originalClasses = root.className;
    
    root.classList.remove("light", "dark");
    root.classList.add("dark");
    
    return () => {
      root.className = originalClasses;
    };
  }, []);

  return <>{children}</>;
}