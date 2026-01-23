import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#C5A059",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Dark Luxury Theme - Atelier Art Royal
        "background-light": "#f6f6f8",
        "background-dark": "#0a0a0c",
        gold: {
          DEFAULT: "#C5A059",
          50: "#FAF6E8",
          100: "#F5EDD1",
          200: "#EBDBA3",
          300: "#E1C975",
          400: "#D7B747",
          500: "#C5A059",
          600: "#A8861F",
          700: "#7D6417",
          800: "#524210",
          900: "#2A2108",
        },
        royal: {
          50: "#EBF0F7",
          100: "#D6E0EE",
          200: "#ADC1DD",
          300: "#84A2CC",
          400: "#5B83BB",
          500: "#1152d4",  // PRIMARY BLUE
          600: "#0d42ab",
          700: "#0a3282",
          800: "#072259",
          900: "#0a0a0c",  // DARK BACKGROUND
        },
        ivory: {
          50: "#FEFDFB",
          100: "#F8F6F0",
          200: "#F5F3ED",
          300: "#F2F0EA",
          400: "#EFEDE7",
          500: "#ECEAE4",
        },
        neutral: {
          50: "#F5F5F5",
          100: "#D1D1D1",
          200: "#6B6B6B",
          300: "#4A4A4A",
          400: "#1A1A1A",
          500: "#0a0a0c",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Playfair Display", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-heading)", "Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        fadeIn: "fadeIn 0.5s ease-out",
        slideUp: "slideUp 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
