/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          100: '#FEEBE7',
          200: '#FCC8BF',
          300: '#FAA597',
          400: '#F8826F',
          500: '#F65E47',
          600: '#C54B39',
          700: '#94382B',
          800: '#62261D',
          900: '#31130E',
        },
      }
    },
  },
  plugins: [],
}