/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/devtools-shared/src/**/*.{tsx,css,ts}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: "crimson",
      },
    },
  },
  plugins: [],
}
