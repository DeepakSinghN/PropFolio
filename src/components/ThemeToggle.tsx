"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check current class on documentElement
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setIsDark(isCurrentlyDark);
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentlyDark = document.documentElement.classList.contains("dark");
    const nextDark = !currentlyDark;

    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      try {
        localStorage.setItem("propfolio-theme", "dark");
      } catch (err) {}
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      try {
        localStorage.setItem("propfolio-theme", "light");
      } catch (err) {}
    }

    setIsDark(nextDark);
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-[#0a1128] shadow-sm transition hover:border-[#c5a059] hover:bg-slate-50 active:scale-90 dark:border-slate-800 dark:bg-[#0f182e] dark:text-slate-200 dark:hover:border-[#c5a059] pointer-events-auto ${className}`}
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-[#d4af37] transition-transform duration-200" />
      ) : (
        <Sun className="h-4 w-4 text-[#c5a059] transition-transform duration-200" />
      )}
    </button>
  );
}
