/** @type {import('tailwindcss').Config} */
module.exports = {
  content:[
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        DM:['DM Sans', 'san-serif'],
        OS:['Open Sans', 'san-serif'],
        MS: ['Montserrat', 'san-serif']
      }
    },
  },
  plugins: [],
}
