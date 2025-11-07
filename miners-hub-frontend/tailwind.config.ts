import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Use class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
        },
        text: {
          DEFAULT: "var(--color-text)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
        },
        border: {
          DEFAULT: "var(--color-border)",
        },
      },
    },
  },
  plugins: [],
};

export default config;

