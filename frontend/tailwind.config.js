/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arc': {
          'dark': '#1a1a2e',
          'darker': '#0f0f1a',
          'accent': '#e94560',
          'accent-light': '#ff6b6b',
          'blue': '#4a9fff',
          'gold': '#ffd700',
          'purple': '#a855f7',
        }
      }
    },
  },
  plugins: [],
}
