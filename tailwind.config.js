/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: "#130d08",
          100: "#1a140e",
          200: "#221b12",
          300: "#2d2617",
          400: "#3b321f",
          500: "#4d4028",
          600: "#695336",
          700: "#8a6d45",
          800: "#b48c60",
          900: "#f1dec5",
        },
      },
    },
  },
  plugins: [],
};
