import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        // Backgrounds
        void:    "#0a0a0a",
        canvas:  "#0e0e0e",
        lift:    "#141414",
        raised:  "#1a1a1a",
        // Cream text scale
        cream: {
          DEFAULT: "#f0ebe0",
          muted:   "rgba(240,235,224,0.55)",
          faint:   "rgba(240,235,224,0.25)",
          ghost:   "rgba(240,235,224,0.08)",
        },
        // Border scale
        line: {
          DEFAULT: "rgba(240,235,224,0.12)",
          bright:  "rgba(240,235,224,0.22)",
          dim:     "rgba(240,235,224,0.06)",
        },
      },
      letterSpacing: {
        widest2: "0.22em",
        widest3: "0.3em",
      },
      boxShadow: {
        "card":       "0 1px 0 rgba(240,235,224,0.08)",
        "card-hover": "0 0 0 1px rgba(240,235,224,0.18)",
        "inset-top":  "inset 0 1px 0 rgba(240,235,224,0.1)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(200%)" },
        },
        "underline-grow": {
          "0%":   { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        "fade-up":  "fade-up 0.4s ease-out both",
        "fade-in":  "fade-in 0.3s ease-out both",
        shimmer:    "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
