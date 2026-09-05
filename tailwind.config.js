/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf6',
          500: '#0c8ee7',
          600: '#0171c6',
          700: '#025ba0',
          800: '#064d84',
          900: '#0a406e',
          950: '#072949',
        },
        tealbrand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
