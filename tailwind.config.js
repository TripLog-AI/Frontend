/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-container": "#4f46e5",
        "on-primary-container": "#dad7ff",
        "surface": "#f8f9ff",
        "on-surface": "#0b1c30",
        "outline-variant": "#c7c4d8",
        "surface-variant": "#d3e4fe",
        "surface-container-lowest": "#ffffff",
        "primary": "#3525cd",
        "surface-container-highest": "#d3e4fe",
        "secondary-container": "#39b8fd",
        "on-secondary-container": "#004666",
        "surface-container-high": "#dce9ff",
        "surface-container": "#e5eeff",
        "background": "#f8f9ff",
        "on-background": "#0b1c30",
        "on-surface-variant": "#464555",
      },
      fontFamily: {
        "label-sm": ["Inter", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "title-sm": ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}