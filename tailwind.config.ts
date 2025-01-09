import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        iranyekan: ["var(--font-iranyekan)"],
        mono: ["Fira Code", "monospace"],
      },
      fontSize: {
        base: "15px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
      },
      typography: {
        DEFAULT: {
          css: {
            "*": {
              "@apply min-w-0 border-border": {},
            },
            html: {
              "@apply antialiased": {},
              "font-size": "15px",
            },
            body: {
              "@apply bg-background text-foreground": {},
              "letter-spacing": "-0.011em",
              "line-height": "1.6",
            },
            '[dir="rtl"]': {
              "text-align": "right",
            },
            "pre, code, .preview-content": {
              direction: "ltr",
              "text-align": "left",
              "overflow-x": "auto",
            },
            h1: {
              "@apply text-3xl leading-tight font-medium": {},
              "text-wrap": "balance",
              "text-shadow": "0 1px 2px rgba(0, 0, 0, 0.1)",
            },
            h2: {
              "@apply text-2xl leading-tight font-medium": {},
              "text-shadow": "0 1px 2px rgba(0, 0, 0, 0.1)",
            },
            h3: {
              "@apply text-xl leading-snug font-medium": {},
              "text-shadow": "0 1px 2px rgba(0, 0, 0, 0.1)",
            },
            "p, li, input, textarea": {
              "@apply text-[0.9375rem] leading-relaxed": {},
              "text-wrap": "pretty",
            },
            "button, a": {
              "@apply transition-all duration-500": {},
              "-webkit-tap-highlight-color": "transparent",
              transform: "translate3d(0, 0, 0)",
              "backface-visibility": "hidden",
            },
          },
        },
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
        "float-fur": {
          "0%": {
            backgroundPosition: "0 0",
            opacity: "0.8",
          },
          "50%": {
            opacity: "0.6",
          },
          "100%": {
            backgroundPosition: "100px 100px",
            opacity: "0.8",
          },
        },
        "message-slide-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px) scale(0.96)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        "slide-to-right": {
          "0%": {
            width: "100%",
            transform: "translateX(0)",
            opacity: "1",
          },
          "100%": {
            width: "50%",
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "slide-from-left": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0",
          },
          "60%": {
            opacity: "0.8",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "slide-down": {
          "0%": {
            transform: "translateY(-100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(12px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        bounce: {
          "0%, 100%": {
            transform: "translate(-50%, 0)",
          },
          "50%": {
            transform: "translate(-50%, -4px)",
          },
        },
        spinner: {
          from: { opacity: "1" },
          to: { opacity: "0.15" },
        },
        "subtle-fade": {
          "0%": {
            opacity: "0",
            transform: "translateY(12px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95) translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-6px)",
          },
        },
        glow: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.6",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-fur": "float-fur 30s linear infinite",
        "message-slide-in":
          "message-slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-to-right": "slide-to-right 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-from-left": "slide-from-left 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "bounce 2s infinite",
        spinner: "spinner 1s linear infinite",
        "subtle-fade":
          "subtle-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
        float: "float 4s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
