import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)"
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)"
        },
        destructive: {
          DEFAULT: "var(--destructive)"
        },
        ink: "#08111b",
        mist: "#eef5f8",
        ember: "#ff7a18",
        aqua: "#7fe0d6",
        pine: "#0f3d3e",
        sunrise: "#f6c76b"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(11, 18, 27, 0.18)",
        card: "0 18px 48px rgba(8, 17, 27, 0.12)"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at 20% 20%, rgba(127,224,214,0.28), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,122,24,0.22), transparent 32%), linear-gradient(135deg, #f7fbfd 0%, #edf4f6 42%, #fff8ef 100%)"
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-12px,0) scale(1.03)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        drift: "drift 10s ease-in-out infinite",
        pulseSoft: "pulseSoft 3.2s ease-in-out infinite",
        rise: "rise 0.35s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
