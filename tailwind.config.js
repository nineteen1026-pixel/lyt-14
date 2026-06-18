/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: "#f3f8ef",
          100: "#e2efd7",
          200: "#c5dfb1",
          300: "#a0c983",
          400: "#8CB369",
          500: "#6a9b4a",
          600: "#517c39",
          700: "#40612f",
          800: "#354e28",
          900: "#2D5016",
          950: "#162b0a",
        },
        earth: {
          50: "#faf7f1",
          100: "#f3ecd8",
          200: "#e6d5af",
          300: "#D9BC85",
          400: "#C9A96E",
          500: "#b99256",
          600: "#a87a4a",
          700: "#8c6040",
          800: "#724f3a",
          900: "#5e4232",
        },
        cream: {
          50: "#fdfbf5",
          100: "#faf5e8",
          200: "#f4ebcd",
          300: "#ecdbab",
          400: "#e3c685",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(45, 80, 22, 0.08)",
        card: "0 2px 12px rgba(45, 80, 22, 0.06)",
        hover: "0 8px 30px -4px rgba(45, 80, 22, 0.15)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "slide-down": "slideDown 0.25s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        slideDown: {
          "0%": { opacity: "0", maxHeight: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", maxHeight: "500px", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "paper-texture":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
