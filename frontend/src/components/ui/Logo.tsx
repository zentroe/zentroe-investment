import { useState, useEffect } from "react";

interface LogoProps {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export default function Logo({
  variant = "full",
  size = "md",
  theme = "auto",
  className = ""
}: LogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      setIsDark(theme === "dark");
    }
  }, [theme]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          icon: "w-6 h-6",
          text: "text-lg",
          full: "w-6 h-6 text-lg"
        };
      case "lg":
        return {
          icon: "w-12 h-12",
          text: "text-3xl",
          full: "w-12 h-12 text-3xl"
        };
      default: // md
        return {
          icon: "w-8 h-8",
          text: "text-xl",
          full: "w-8 h-8 text-xl"
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === "icon") {
    return (
      <div className={`${sizeClasses.icon} ${className}`}>
        <img
          src="/zen-siteIcon.svg"
          alt="Zentroe"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <span className={`font-bold text-gray-900 ${sizeClasses.text} ${className}`}>
        Zentroe
      </span>
    );
  }

  // Full variant with logo image
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={sizeClasses.icon}>
        <img
          src={isDark ? "/src/assets/zenLogoDark.png" : "/src/assets/zenLogo.png"}
          alt="Zentroe"
          className="w-full h-full object-contain"
        />
      </div>
      <span className={`font-bold text-gray-900 ${sizeClasses.text}`}>
        Zentroe
      </span>
    </div>
  );
}
