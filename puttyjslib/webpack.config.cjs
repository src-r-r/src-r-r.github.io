const fs = require("fs");
const path = require("path");

const HERE = path.resolve(__dirname);
const DIST = path.resolve(HERE, "dist");
const PROJ_DIST = path.resolve(
  HERE,
  "..",
  "custom-themes",
  "putty2",
  "static",
  "static",
  "js"
);
// const INFILE = path.resolve(HERE, "tilelib.js");
const INFILE = path.resolve(HERE, "index.js");
const BUNDLE = path.resolve(DIST, "tilelib.js");

fs.mkdirSync(DIST, { recursive: true });

module.exports = {
  watch: true,
  entry: INFILE,
  mode: "development",
  output: {
    path: PROJ_DIST,
    filename: "tiling.js",
    library: {
      name: "tilelib",
      type: "global",
    },
  },
};
