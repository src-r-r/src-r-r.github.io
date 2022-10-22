import { paper, nurbs, $, DelaunayCloud, randNum, Popper } from "./tilelib.js";

function dup(obj) {
  return JSON.parse(JSON.stringify(obj));
}

console.log(paper);

function getSeasonalColor(paper, when = new Date()) {
  const thisYear = new Date(when.getFullYear(), 0).valueOf();
  const nextYear = new Date(when.getFullYear() + 1, 0).valueOf();
  const totSec = nextYear - thisYear;
  const now = when.valueOf();
  const b = (now - thisYear) / totSec;
  const g = Math.pow(b, 2);
  const r = Math.pow(g, 2);
  console.log(`new color: ${r}, ${g}, ${b}`);
  const color = new paper.Color(r, g, b);
  // Scale the color so it's at least 65%
  if (color.brightness < 0.5) color.brightness = 0.5;
  // But not greater than 70
  if (color.brightness > 0.7) color.brightness = 0.7;
  return color;
}

const randColor = (ps) =>
  new ps.Color(Math.random(), Math.random(), Math.random());

/**
 *
 * @param {paper.PaperScope} _paper Paper Scope we're installing to.
 */
export function installPuttyCanvas(window, _paper) {
  const ppr = _paper;

  // Set up global window properties

  window.cellFrames = [];
  window.frameI = 0;

  window.currPath = null;
  window.prevPaths = [];

  window.renderI = 0;

  window.sweepX = 0;

  const layer = new ppr.Layer();
  layer.activate();

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

  const black = new paper.Color(0, 0, 0);
  const blue = new paper.Color(0.3, 0.2, 0.6);
  let seasColor = getSeasonalColor(paper);

  const r = Math.round;
  const [b1, b2] = lowerNurbs.domain[0];

  let factor = 0.03;

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
  dpc.render(preRenderCell);
  window.poppers = dpc.getVoronoiPolygons().map((poly) => {
    const col = new paper.Color(seasColor);
    col.brightness += randNum(-0.1, 0.5);
    return new Popper(poly, col);
  });

  window.sweepXPreview = paper.Path.Line([10, 0], [10, height]);

  const sweepOffset = 10;

  layer.onFrame = (event) => {
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
  console.log(upperNurbs);
  console.log(lowerNurbs);

  ppr.view.onMouseDown = function (event) {
    console.log(`creating new path`);
    window.currPath = new paper.Path();
    window.currPath.strokeColor = randColor(paper);
    window.currPath.strokeWidth = 3;
    window.currPath.add(event.point);
  };

  ppr.view.onMouseUp = function (event) {
    if (!window.currPath) {
      return;
    }
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
    if (!window.currPath) {
      return;
    }
    window.currPath.add(event.point);
    if (event.timeStamp % 10 === 0) {
      window.currPath.simplify(1.5);
      window.currPath.smooth();
    }
  };
}

function onFrame(event) {
  console.log(`frame (out)`);
}

if (window) {
  window.installPuttyCanvas = installPuttyCanvas;
}
