import formsPlugin from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shade: {
          100: "#ECDFCC",
          200: "#8B8B8B",
          300: "#3F3F3F",
          400: "#2F2F2F",
          500: "#202020",
          600: "#101010",
        },
        primary: {
          tint: {
            300: "#44C588",
            400: "#08BD7A"
          }
        },
        text: "#ffffff",
        error: "#ee4238",
      }
    },
  },
  plugins: [
    formsPlugin,
  ],
}

