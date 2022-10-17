const fs = require("fs");
const path = require("path");
const nodeExternals = require("webpack-node-externals");

const HERE = path.resolve(__dirname);
const DIST = path.resolve(HERE, "dist");
const INFILE = path.resolve(HERE, "tilelib.js");
const BUNDLE = path.resolve(DIST, "tilelib.js");

fs.mkdirSync(DIST, { recursive: true });

module.exports = {
  entry: INFILE,
  mode: "development",
  output: {
    path: DIST,
    filename: "tilelib.js",
    library: {
      name: "tilelib",
      type: "global",
    },
  },
};
