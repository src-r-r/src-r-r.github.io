// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    sass: {} // Add this if using Sass.  If using SCSS, it's still useful to include so it can transpile to CSS.
  },
}