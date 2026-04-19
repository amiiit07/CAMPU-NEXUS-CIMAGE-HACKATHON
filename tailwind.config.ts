import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-sora)", "var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"]
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        ring: "hsl(var(--ring))",
        brand: {
          purple: "#7C3AED",
          cyan: "#06B6D4",
          emerald: "#22C55E",
          bg0: "#030712",
          bg1: "#0F172A",
          bg2: "#111827"
        }
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.2) 1px, transparent 0)",
        "hero-glow": "radial-gradient(circle at top, rgba(14,165,233,0.35), transparent 55%)",
        aurora: "radial-gradient(65% 45% at 20% 0%, rgba(124,58,237,0.36), transparent 70%), radial-gradient(45% 30% at 85% 10%, rgba(6,182,212,0.3), transparent 68%)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.05), 0 20px 80px rgba(15,23,42,0.35)",
        "glow-purple": "0 18px 60px rgba(124,58,237,0.35)",
        "glow-cyan": "0 18px 60px rgba(6,182,212,0.28)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.8s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
