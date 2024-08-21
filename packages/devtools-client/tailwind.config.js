/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(220, 20, 60)",
        "primary-light": "rgb(228 50 86)",
      },
    },
  },
  plugins: [],
}
