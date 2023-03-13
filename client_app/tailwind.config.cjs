/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        INTER: ["Inter", "san-serif"],
      },
      backgroundImage: {
        "hero-img": "url('./src/assets/images/hero.svg')",
      },
    },
  },
  plugins: [],
};
