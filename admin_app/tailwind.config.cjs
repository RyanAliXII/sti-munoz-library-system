/** @type {import('tailwindcss').Config} */
module.exports = {
  mode:"jit",
  content:[
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        // DM:['DM Sans', 'san-serif'],
        OS:['Open Sans', 'san-serif'],
        INTER: ['Inter', 'san-serif'],
        // MS: ['Montserrat', 'san-serif'],
        // RW:['Raleway', 'sans-serif'],
        // LT:['Lato', 'sans-serif'],
        // RB:['Roboty', 'sans-serif']
      },
      gridColumnStart:{
        '13': '13',
        '14': '14',
        '15': '15',
        '16': '16',
        '17': '17',
        '18': '18',
      },
      gridColumnEnd:{
        '13': '13',
        '14': '14',
        '15': '15',
        '16': '16',
        '17': '17',
        '18': '18',
      },
      gridRowStart: {
        '8': '8',
        '9': '9',
        '10': '10',
        '11': '11',
        '12': '12',
        '13': '13',
      },
      gridRowEnd: {
        '8': '8',
        '9': '9',
        '10': '10',
        '11': '11',
        '12': '12',
        '13': '13',
      },
    
    },
  },
  plugins: [],
}
