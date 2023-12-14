/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        INTER: ["Inter", "san-serif"],
      },

      backgroundImage: {
        "hero-img": "url('/src/assets/images/library.jpg')",
      },
    },
  },

  daisyui: {
    themes: [
      {
        apptheme: {
          primary: "#025BA7",

          secondary: "#F7E71B",

          accent: "#A1B9CA",

          neutral: "#3D4451",

          "base-100": "#FFFFFF",

          info: "#3ABFF8",

          success: "#36D399",

          warning: "#fbbf24",

          error: "#F87272",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
