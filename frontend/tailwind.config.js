/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#002366',
        'brand-dark': '#001A47',
        teal: '#005599',
        accent: '#004477',
        cream: '#D4E8FF',
      },
    },
  },
  plugins: [],
}
