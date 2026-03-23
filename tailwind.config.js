/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F2FF',
          100: '#CCE5FF',
          400: '#3385FF',
          500: '#0066FF',
          600: '#005CE6',
          700: '#0052CC',
          900: '#003D99',
        },
        accent: {
          50: '#E6FCF7',
          400: '#33D4AE',
          500: '#00C896',
          600: '#00B386',
          700: '#00A078',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          400: '#A3A3A3',
          600: '#525252',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



