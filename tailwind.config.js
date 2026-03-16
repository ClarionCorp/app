/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
      },
      blur: {
        xs: '2px',
        '2xs': '1px',
      },
    },
  },
  darkMode: "class",
  plugins: [],
}