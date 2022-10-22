import { paper, nurbs, $, DelaunayCloud, randNum, Popper } from "./tilelib.js";

function dup(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getSeasonalColor(paper, when = new Date()) {
  const thisYear = new Date(when.getFullYear(), 0).valueOf();
  const nextYear = new Date(when.getFullYear() + 1, 0).valueOf();
  const totSec = nextYear - thisYear;
  const now = when.valueOf();
  const b = (now - thisYear) / totSec;
  const g = (b * 2) / totSec;
  const r = (g * 4) / totSec;
  console.log(`new color (${nextYear} - ${thisYear}): ${r}, ${g}, ${b}`);
  const color = new paper.Color(r, g, b);
  // Scale the color so it's at least 75%
  if (color.lightness < 0.75) color.lightness = 0.85;
  return color;
}

$(window).on("load", function () {
  const ppr = new paper.PaperScope();
  ppr.install(window.document);
  const canvas = $("#myCanvas")[0];
  const layer = ppr.setup(canvas);
  console.log(layer.view.viewSize);

  const sz = layer.view.viewSize;

  const width = sz.width;
  const height = sz.height;

  const upperPoints = [
    [100, 100 + 20],
    [Math.round(width * 0.6), -30],
    [Math.round(width), 100],
  ];

  const lpy = 100;

  const lowerPoints = [
    [300, lpy + 10],
    [Math.round(width * 0.4), lpy + 10],
    [Math.round(width), lpy + 800],
  ];

  const upperNurbs = nurbs({
    points: upperPoints,
    degree: 2,
    boundary: "clamped",
  });
  const lowerNurbs = nurbs({
    points: lowerPoints,
    degree: 2,
    boundary: "clamped",
  });

  const randColor = (ps) =>
    new ps.Color(Math.random(), Math.random(), Math.random());

  const black = new ppr.Color(0, 0, 0);
  const blue = new ppr.Color(0.3, 0.2, 0.6);
  let seasColor = getSeasonalColor(ppr);

  const r = Math.round;
  const [b1, b2] = lowerNurbs.domain[0];

  let factor = 0.03;

  window.cellFrames = [];
  window.frameI = 0;

  function preRenderCell(ps, voronoiCell) {
    console.log(`adding ${JSON.stringify(voronoiCell)}`);
    window.cellFrames.push({
      frame: window.frameI,
      cell: dup(voronoiCell),
    });
    window.frameI += 1;
  }

  const dpc = new DelaunayCloud(layer, upperNurbs, lowerNurbs, 4, 500);
  dpc.generateParticles();
  // dpc.debugPoints();
  dpc.render(preRenderCell);
  // dpc.previewBounds(layer);

  window.renderI = 0;

  window.poppers = dpc.getVoronoiPolygons().map((poly) => {
    const col = new ppr.Color(seasColor);
    col.brightness += randNum(-0.1, 0.5);
    return new Popper(poly, col);
  });

  window.sweepX = 0;

  window.sweepXPreview = ppr.Path.Line([10, 0], [10, height]);
  // window.sweepXPreview.strokeColor = new ppr.Color(0, 0, 0);
  // window.sweepXPreview.strokeWidth = 3;

  const sweepOffset = 10;

  window.currPath = null;
  window.prevPaths = [];

  ppr.view.onFrame = (event) => {
    try {
      typeof window.cellFrames === "undefined";
      typeof window.frameI === "undefined";
      typeof window.poppers === "undefined";
      typeof window.currPath === "undefined";
    } catch {
      return true;
    }
    window.poppers.forEach((popper) => {
      popper.onFrame(ppr, window.sweepX, event);
    });
    if (window.sweepX < width) {
      // window.sweepXPreview.translate([sweepOffset, 0]);
      window.sweepX += sweepOffset;
    }

    if (event.count % 10 === 0) {
      window.currPath?.simplify();
      window.currPath?.smooth();
    }

    window.renderI += 1;
  };

  // for (let i = b1; i <= b2; i += 0.1) {
  //   const [x, y] = lowerNurbs.evaluator(0)([], i);
  //   const ppt = new ppr.Point(x, y);
  //   const txt = new ppr.PointText(ppt.add([30, -10]));
  //   const ptTest = domainTr([x, y], lowerNurbs);
  //   const ii = Math.round(i * 10) / 10;
  //   txt.content = `(${ii} - ${ptTest})`;
  //   const circle = new ppr.Path.Circle(ppt, 10);
  //   circle.strokeColor = blue;
  // }
  console.log(upperNurbs);
  console.log(lowerNurbs);

  ppr.view.onMouseDown = function (event) {
    window.currPath = new ppr.Path();
    window.currPath.strokeColor = randColor(ppr);
    window.currPath.strokeWidth = 3;
    window.currPath.add(event.point);
  };

  ppr.view.onClick = function (event) {};

  ppr.view.onMouseUp = function (event) {
    window.currPath.add(event.point);
    window.currPath.simplify(1.5);
    window.currPath.smooth("asymetric");
    if (!window.currPath.length) {
      window.prevPaths.forEach((p) => {
        p.remove();
      });
      window.prevPaths = [];
    } else {
      window.prevPaths.push(currPath);
    }
    window.currPath = null;
  };

  ppr.view.onMouseDrag = function (event) {
    window.currPath.add(event.point);
    if (event.timeStamp % 10 === 0) {
      window.currPath.simplify(1.5);
      window.currPath.smooth();
    }
  };
});

function onFrame(event) {
  console.log(`frame (out)`);
}
