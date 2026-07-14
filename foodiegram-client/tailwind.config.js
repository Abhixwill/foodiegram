/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm, food-forward brand palette
        coral: {
          50: "#fff1ee",
          100: "#ffe1da",
          200: "#ffc3b5",
          300: "#ff9c82",
          400: "#ff714f",
          500: "#f9502b", // primary brand color
          600: "#e63a17",
          700: "#c02b10",
          800: "#9c2712",
          900: "#7f2513",
        },
        amber: {
          50: "#fffaeb",
          100: "#fff0c6",
          200: "#ffe088",
          300: "#ffc94a",
          400: "#ffb01f",
          500: "#f99008", // secondary accent
          600: "#dd6d03",
          700: "#b74d07",
          800: "#943c0d",
          900: "#7a330f",
        },
        ink: {
          // near-black background for dark mode, not pure black
          900: "#1a1210",
          800: "#251a17",
          700: "#33221e",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(249, 80, 43, 0.15)",
        "glass-lg": "0 12px 48px 0 rgba(249, 80, 43, 0.2)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.4)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "heart-pop": "heart-pop 0.35s ease-in-out",
      },
    },
  },
  plugins: [],
};
