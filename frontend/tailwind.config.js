/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0066CC',
        'brand-dark': '#0052A3',
        teal: '#0099FF',
        accent: '#00A0E9',
        cream: '#F0F7FF',
      },
    },
  },
  plugins: [],
}
