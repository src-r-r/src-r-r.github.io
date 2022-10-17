// import("./dist/tilelib.js")
//   .then((tilelib) => {
//     console.log("tilelib loaded");
//     console.log(tilelib);
//   })
//   .catch((err) => {
//     console.error("Could not load tilelib");
//     console.error(err);
//   });

// import tilelib from "./dist/tilelib.js";
// import { name as tilelib } from "./dist/tilelib.js";
console.log(DirectedPointCloud);

// import { nurbs } from "./dist/tilelib.js";
// console.log(tilelib);
// // console.log(require("dist/tilelib.js"));
// // import * as $ from "jquery";
// // import paper from "paper";
// // import nurbs from "nurbs";
// // const $ = require("jquery");
// // const paper = require("paper");
// // const nurbs = require("nurbs");
// // const { DirectedPointCloud } = require("./dist/tilelib.js");

// $(document).load(function () {
//   const canvas = $("#myCanvas")[0];
//   const scope = paper.install(window);
//   const layer = paper.setup(canvas);
//   console.log(layer.view.viewSize);

//   const path = new paper.Path.Arc();
//   path.strokeColor = "black";
//   path.strokeWidth = 3;
//   path.add(new paper.Point(0, 0));
//   path.curveTo(new paper.Point(300, 40), new paper.Point(400, 100));

//   const curve = nurbs({
//     points: [
//       [0, 0],
//       [300, 40],
//       [400, 100],
//     ],
//     degree: 2,
//   });

//   for (let i = 0; i < 4; i += 0.1) {
//     let pt = curve.evaluator(0)([], i);
//     let rendPoint = paper.Path.Circle(new Point(...pt), 10);
//     rendPoint.strokeColor = "blue";
//     console.log(`rendering at ${pt}`);
//   }
// });
