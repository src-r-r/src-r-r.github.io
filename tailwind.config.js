/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_includes/**/*.{html,njk,md}", // Includes files in _includes directory
    "./*.{html,njk,md}", // Main layout and other root-level pages
    "./*.{css,scss}", //Include any CSS or SCSS for Tailwind utilities
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}