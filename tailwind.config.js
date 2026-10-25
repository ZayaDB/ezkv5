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
        // "Entry card" identity — grounded in the product's real subject matter
        // (visas, arrival cards, official documents). Light = paper, dark = ink/night.
        paper: {
          DEFAULT: "#F3EEE3",
          card: "#FAF7EF",
        },
        ink: {
          DEFAULT: "#211D17",
          muted: "#6B6253",
        },
        night: {
          DEFAULT: "#171310",
          card: "#1C1712",
        },
        parchment: {
          DEFAULT: "#F3ECDB",
          muted: "#A89C86",
        },
        stamp: {
          DEFAULT: "#B33B2C",
          dark: "#D14A36",
        },
        hairline: {
          DEFAULT: "#D8CFBC",
          dark: "#3A332A",
        },
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        accent: {
          50: "#f5f3ff",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        gray: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          400: "#A3A3A3",
          600: "#525252",
          900: "#171717",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
        serif: ["\"Noto Serif KR\"", "serif"],
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
