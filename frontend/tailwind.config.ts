import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: {
          DEFAULT: "#12181f",
          700: "#1c2530",
          500: "#3d4a58",
          300: "#6b7784",
        },
        paper: "#faf7f1",
        line: "#e6e1d5",
        gold: {
          DEFAULT: "#a9814b",
          600: "#8f6c3d",
          100: "#f3e8d6",
        },
        sage: {
          DEFAULT: "#2f6f5e",
          100: "#e4efec",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18, 24, 31, 0.04), 0 8px 24px -12px rgba(18, 24, 31, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        "hero-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "hero-in": "hero-in 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
