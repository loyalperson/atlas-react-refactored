/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        'custom-green': '#00211d',
        'light-green': '#39645e',
        'light-white': '#F0F0F0',
      },
      color: {
        'light-white': '#F0F0F0',
      },
      textColor: {
        'custom-green': '#00211d',
        'light-green': '#39645e',
        'light-white': '#F0F0F0',
      }
    },
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
