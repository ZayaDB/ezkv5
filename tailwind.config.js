/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
      },
      colors: {
        // LNK design system — values read directly from the Figma file.
        // Figma: bg #0e1a18, surface #101e1c, pill #1b332f, accent #3fa393,
        // text #f3f7f5, muted #9fb0ac, divider #2a3b38.
        // B3 브랜드 (홈 시안 확정색): 청록 면 · 노랑 강조 · 민트 · 먹색
        brand: {
          DEFAULT: "#1f6f62", deep: "#14564c", mint: "#9fe0d2",
          sun: "#ffcf3f", "sun-deep": "#f2bd1d", ink: "#111a19", mist: "#f1f4f3", line: "#d3dcda", soft: "#47605b",
        },
        surface: { DEFAULT: "#F4F8F7", card: "#FFFFFF" },
        ink: { DEFAULT: "#0e1a18", muted: "#5b6b68" },
        night: { DEFAULT: "#0e1a18", card: "#101e1c", pill: "#1b332f" },
        snow: { DEFAULT: "#f3f7f5", muted: "#9fb0ac" },
        teal: { DEFAULT: "#2f8a7b", dark: "#3fa393" },
        hairline: { DEFAULT: "#dce6e3", dark: "#2a3b38" },
        // Single brand hue everywhere: old indigo/violet palettes now map to
        // the Figma teal so all existing pages unify without per-file edits.
        primary: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
        accent: {
          50: "#ecfaf8", 100: "#d2f2ee", 200: "#a6e4dd", 300: "#76d1c9",
          400: "#4fb8b0", 500: "#2ea39b", 600: "#23867f", 700: "#1d6b66",
          800: "#195552", 900: "#164240",
        },
        slate: {
          50: "#f4f8f7", 100: "#eaf1ef", 200: "#dce6e3", 300: "#bccac6",
          400: "#9fb0ac", 500: "#6f827e", 600: "#4a5d59", 700: "#2a3b38",
          800: "#182b28", 900: "#101e1c", 950: "#0e1a18",
        },
        gray: {
          50: "#f4f8f7", 100: "#eaf1ef", 200: "#dce6e3", 300: "#bccac6",
          400: "#9fb0ac", 500: "#6f827e", 600: "#4a5d59", 700: "#2a3b38",
          800: "#182b28", 900: "#101e1c", 950: "#0e1a18",
        },
        zinc: {
          50: "#f4f8f7", 100: "#eaf1ef", 200: "#dce6e3", 300: "#bccac6",
          400: "#9fb0ac", 500: "#6f827e", 600: "#4a5d59", 700: "#2a3b38",
          800: "#182b28", 900: "#101e1c", 950: "#0e1a18",
        },
        neutral: {
          50: "#f4f8f7", 100: "#eaf1ef", 200: "#dce6e3", 300: "#bccac6",
          400: "#9fb0ac", 500: "#6f827e", 600: "#4a5d59", 700: "#2a3b38",
          800: "#182b28", 900: "#101e1c", 950: "#0e1a18",
        },
        blue: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
        indigo: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
        violet: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
        purple: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
        cyan: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
        sky: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
        pink: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
        fuchsia: {
          50: "#eaf6f3", 100: "#d3ede7", 200: "#a9dbd0", 300: "#7cc4b6",
          400: "#5db5a4", 500: "#3fa393", 600: "#2f8a7b", 700: "#276f64",
          800: "#205953", 900: "#1b3f3b", 950: "#0e2623",
        },
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "dash-draw": {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
