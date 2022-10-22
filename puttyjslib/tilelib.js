import nurbs from "nurbs";
import $ from "jquery";
import * as paper from "paper";
import { Delaunay } from "d3-delaunay";
import inside from "point-inside-polygon";
import tinycolor from "tinycolor2";

export const name = "puttytilelib";

const getX = (pt) => {
  return pt.x ? pt.x : pt[0];
};
const getY = (pt) => {
  return pt.y ? pt.y : pt[1];
};

const randNum = (...range) =>
  range.length == 1
    ? Math.random() * range[0]
    : Math.random() * (range[1] - range[0]) + range[0];

const randInt = (...range) =>
  Math.round(
    range.length == 1
      ? Math.random() * range[0]
      : Math.random() * (range[1] - range[0]) + range[0]
  );

function minOf(numbers) {
  return numbers.reduce((prev, curr) => {
    return curr < prev ? curr : prev;
  });
}

function maxOf(numbers) {
  return numbers.reduce((prev, curr) => {
    return curr > prev ? curr : prev;
  });
}

function curveMinX(curve) {
  return minOf(
    curve.points.map((pt) => {
      return getX(pt);
    })
  );
}

function curveMaxX(curve) {
  return maxOf(
    curve.points.map((pt) => {
      return getX(pt);
    })
  );
}

/**
 * Translate points to the curve domain.
 * @param {number[] | {x: number, y : number}} pt
 * @param {nurbs} curve
 */
function domainTr(pt, curve) {
  const [d1, d2] = curve.domain[0];
  // console.log(`curve domain: ${[d1, d2]}`);
  // console.log(`pt: ${pt}`);
  const minPt = curve.points[0];
  const maxPt = curve.points[curve.points.length - 1];
  // console.log(`minPt = ${minPt}, maxPt=${maxPt}`);
  const ptX = getX(pt);
  const maxPtX = getX(maxPt);
  const minPtX = getX(minPt);
  const loc = (ptX - minPtX) / (maxPtX - minPtX);
  // console.log(`loc= (${ptX} - ${minPtX}) / (${maxPtX} - ${minPtX}) => ${loc}`);
  // console.log(`-> ${d2} * ${loc}`);
  return (d2 - d1) * loc + d1;
}

/**
 * Translate points to the curve domain.
 * @param {number[] | {x: number, y : number}} pt
 * @param {nurbs} upperNurbs
 * @param {nurbs} lowerNurbs
 */
function isWithinBounds(pt, upperNurbs, lowerNurbs) {
  const y = getY(pt);
  const x = getX(pt);
  const minX = minOf([curveMinX(upperNurbs), curveMinX(lowerNurbs)]);
  const maxX = maxOf([curveMaxX(upperNurbs), curveMaxX(lowerNurbs)]);

  if (x <= minX || x >= maxX) {
    return false;
  }

  const upper = upperNurbs.evaluator(0)([], domainTr(pt, upperNurbs));
  const lower = lowerNurbs.evaluator(0)([], domainTr(pt, lowerNurbs));
  // console.log(`evaluating ${pt} between ${upper}, ${lower}`);

  const upperY = getY(upper);
  const lowerY = getY(lower);
  // return true;
  return y >= upperY && y <= lowerY;
}

class DirectedPointCloud {
  /**
   *
   * @param {nurbs.Curve} Upper boundary for the directed cloud
   * @param {nurbs.Curve} Lower boundary for the directed cloud
   * @param {number} length Length of the directed cloud.
   * @param {number} nParticles Number of particles
   */
  constructor(
    paperScope,
    upperNurbs,
    lowerNurbs,
    length = 4,
    nParticles = 1000
  ) {
    this.paperScope = paperScope;
    this.upperNurbs = upperNurbs;
    this.lowerNurbs = lowerNurbs;
    this.length = length;
    this.nParticles = nParticles;
    this.particlePoints = new Array(nParticles).fill();
    this.ghostParticles = new Array(nParticles / 2).fill();
    // Variables for the bounds.
    this.xmin = 0;
    this.xmax = 0;
    this.ymin = 0;
    this.ymax = 0;
  }

  randomPoint() {
    const { width, height } = this.paperScope.view.viewSize;
    return [randInt(width), randInt(height)];
  }

  generateParticles() {
    const { width, height } = this.paperScope.view.viewSize;
    this.xmax = width;
    this.ymax = height;
    this.xmin = 0;
    this.ymin = 0;
    this.particlePoints = this.particlePoints.map(() => {
      const pt = this.randomPoint();
      return pt;
    });
  }

  /**
   *
   * @param {number []} pt Where to draw the point.
   */
  drawCircle(paperScope, pt) {
    const circle = new paperScope.Path.Circle(pt, 5);
    circle.strokeColor = new paperScope.Color(0, 0, 100);
    return circle;
  }

  /**
   *
   * @param {(paper.PaperScope, number[]) => any} drawFunc Function to use for drawing. Default will draw a circle.
   */
  render(drawFunc = null) {
    drawFunc = drawFunc || this.drawCircle;
    return this.particlePoints.forEach((pt, i) => {
      drawFunc(this.paperScope, pt);
    });
  }

  previewBounds(paperScope) {
    const upperPoints = this.upperNurbs.points;
    const lowerPoints = this.lowerNurbs.points;
    const uP = upperPoints;
    const lP = lowerPoints;
    const upperArc = new paperScope.Path.Arc(uP[0], uP[1], uP[uP.length - 1]);
    const lowerArc = new paperScope.Path.Arc(lP[0], lP[1], lP[lP.length - 1]);
    upperArc.strokeColor = new paperScope.Color(0, 0, 0);
    lowerArc.strokeColor = new paperScope.Color(0, 0, 0);
    upperArc.strokeWidth = 3;
    lowerArc.strokeWidth = 3;
  }
}
class DelaunayCloud extends DirectedPointCloud {
  delaunay = null;

  renderCell(paperScope, voronoiCell) {
    const shape = new paperScope.Path();
    shape.closed = true;
    shape.fillColor = new paperScope.Color(0, 30, 40);
    for (let cellPoint of voronoiCell) {
      shape.add(new paperScope.Point(...cellPoint));
    }
  }

  debugPoints() {
    const delaunay = Delaunay.from([...this.particlePoints]);
    const voronoi = delaunay.voronoi([
      this.xmin,
      this.ymin,
      this.xmax,
      this.ymax,
    ]);
    const paperScope = this.paperScope;
    const validColor = new paperScope.Color(0.5, 0.5, 0.5);
    const invalidColor = new paperScope.Color(0.7, 0, 0);
    for (let poly of voronoi.cellPolygons()) {
      poly.map((pt) => {
        const color = isWithinBounds(pt, this.upperNurbs, this.lowerNurbs)
          ? validColor
          : invalidColor;
        const circle = new paperScope.Path.Circle(pt, 2);
        const ppt = new paperScope.Point(pt);
        const text = new paperScope.PointText(ppt);
        text.content = `(${Math.round(getX(pt))}, ${Math.round(getY(pt))})`;
        text.strokeColor = color;
        text.fontSize = 8;
        circle.strokeWidth = 1;
        circle.strokeColor = color;
        return [circle, text];
      });
    }
  }

  getVoronoiPolygons(withinBoundsOnly = true) {
    const delaunay = Delaunay.from([...this.particlePoints]);
    const voronoi = delaunay.voronoi([
      this.xmin,
      this.ymin,
      this.xmax,
      this.ymax,
    ]);
    return [...voronoi.cellPolygons()].filter((poly) => {
      return (
        !withinBoundsOnly ||
        poly.filter((point) => {
          return !isWithinBounds(point, this.upperNurbs, this.lowerNurbs);
        }).length != poly.length
      );
    });
  }

  render(drawFunc = null) {
    const delaunay = Delaunay.from([...this.particlePoints]);
    const voronoi = delaunay.voronoi([
      this.xmin,
      this.ymin,
      this.xmax,
      this.ymax,
    ]);
    drawFunc = drawFunc || this.renderCell;
    const paperScope = this.paperScope;
    console.log(voronoi.cellPolygons());
    let i = 0;
    const pts = delaunay.points;
    for (let poly of voronoi.cellPolygons()) {
      ++i;
      if (
        poly.filter((point) => {
          return isWithinBounds(point, this.upperNurbs, this.lowerNurbs);
        }).length != poly.length
      )
        continue;
      drawFunc(paperScope, poly);
    }
  }
}

class KeyFrame {
  /**
   *
   * @param {number} time Keyframe time for the action to occur
   * @param {function} action Do something on the action.
   * @param {any []} action_args Arguments passed into the action.
   */
  constructor(time, action, action_args = []) {
    this.time = time;
    this.action = action;
    this.action_args = action_args;
  }

  /**
   *
   * @param {{delta: number, time: number, count: number}} event
   */
  onFrame(event) {
    if (!event.time == this.time) return;
    this.action(...this.action_args);
  }
}

class Popper {
  /**
   *
   * @param {number [] []} poly Polygon we're rendering.
   * @param {paper.Color} color Color of the polygon.
   * @param {number} initialScale Initial scale of the polygon
   */
  constructor(poly, color, initialScale = 0.001) {
    this.poly = poly;
    this.start = null;
    this.color = color;
    this.initialScale = initialScale;
    this.onX = this.poly
      .map((pt) => {
        return getX(pt);
      })
      .reduce((prev, curr, currI) => {
        return curr < prev ? curr : prev;
      });
    this.shape = null;
    this.keyframe = 0;
    this.hasJumped = false;
  }

  /**
   * Draw the initial frame.
   * @param {paper.PaperScope} ps The current paper object
   */
  draw(ps) {
    this.shape = new ps.Path();
    this.shape.fillColor = this.color;
    this.shape.fillColor.alpha = 0;

    for (let cellPoint of this.poly) {
      this.shape.add(new ps.Point(...cellPoint));
    }
    this.shape.strokeWidth = 2;
    // shape.closed = true;
    this.shape.scale(this.initialScale);
  }

  /**
   *
   * @param {paper.PaperScope} ps Paper Scope
   * @param {number} x The x location we're scanning.
   * @param {{delta: number, time: number, count: number}} event
   */
  onFrame(ps, x, event) {
    const kf1 = 20;
    const kf2 = 25;
    const kf3 = 30;
    const kf4 = 50;
    const scale1 = 1.44;
    const scale2 = 0.95;
    const scale3 = 1.03;
    if (x < this.onX) return;
    if (!this.start) {
      this.start = event.count;
      this.draw(ps);
    } else if (event.count < this.start + kf1) {
      this.shape.scale(scale1);
    } else if (event.count < this.start + kf2) {
      this.shape.scale(scale2);
      this.shape.rotate(-6);
    } else if (event.count < this.start + kf3) {
      this.shape.scale(scale3);
      this.shape.rotate(6);
    }
    if (this.shape.fillColor && event.count < this.start + kf4) {
      this.shape.fillColor.alpha += 0.02;
    }
    if (Math.random() < 0.001) {
      if (event.count > this.start + kf4 && !this.hasJumped) {
        this.shape.scale(1.1);
        this.shape.rotate(-7);
        this.hasJumped = true;
      } else if (event.count > this.start) {
        this.shape.scale(0.92);
        this.shape.rotate(7);
        this.hasJumped = false;
      }
    }
  }
}

if (globalThis) {
  // external packages
  globalThis.paper = paper.paper;
  globalThis.nurbs = nurbs;
  globalThis.$ = $;
  globalThis.tinycolor = tinycolor;
  globalThis.DirectedPointCloud = DirectedPointCloud;
  globalThis.DelaunayCloud = DelaunayCloud;
  globalThis.getX = getX;
  globalThis.getY = getY;
  globalThis.randNum = randNum;
  globalThis.randInt = randInt;
  globalThis.domainTr = domainTr;
  globalThis.Popper = Popper;
} else if (window) {
  // external packages
  window.paper = paper.paper;
  window.nurbs = nurbs;
  window.$ = $;
  window.tinycolor = tinycolor;
  // local variables
  window.DirectedPointCloud = DirectedPointCloud;
  window.DelaunayCloud = DelaunayCloud;
  window.getX = getX;
  window.getY = getY;
  window.randNum = randNum;
  window.randInt = randInt;
  window.domainTr = domainTr;
  window.Popper = Popper;
  x;
}

export {
  paper,
  nurbs,
  $,
  tinycolor,
  DirectedPointCloud,
  DelaunayCloud,
  getX,
  getY,
  randNum,
  randInt,
  minOf,
  maxOf,
  curveMaxX,
  curveMinX,
  domainTr,
  isWithinBounds,
  Popper,
};
