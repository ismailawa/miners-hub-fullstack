"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "miners-hub-theme";

// Get system preference
const getSystemPreference = (): Theme => {
  if (typeof window === "undefined") return "dark"; // Default to dark to match design
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "dark"; // Default to dark theme to match images
};

// Get initial theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark"; // Default to dark
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  return savedTheme || getSystemPreference();
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Initialize theme on mount (apply to DOM)
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Set theme and persist
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
