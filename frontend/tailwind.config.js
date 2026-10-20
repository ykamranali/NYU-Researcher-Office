/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nyu: {
          primary: '#57068C',
          deep: '#330662',
          light: '#AB82C5',
          veryLight: '#F3EFF7',
        },
        gray: {
          dark: '#404040',
          light: '#F2F2F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Playfair Display', 'serif'], // Example for academic heading
      }
    },
  },
  plugins: [],
}
