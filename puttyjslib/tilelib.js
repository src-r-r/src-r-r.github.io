import nurbs from "nurbs";
import $ from "jquery";
import * as paper from "paper";
import { Delaunay } from "d3-delaunay";
import inside from "point-inside-polygon";

export const name = "puttytilelib";

const getX = (pt) => {
  return pt.x ? pt.x : pt[0];
};
const getY = (pt) => {
  return pt.y ? pt.y : pt[0];
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

/**
 * Translate points to the curve domain.
 * @param {number[] | {x: number, y : number}} pt
 * @param {nurbs} curve
 */
function domainTr(pt, curve) {
  const [d1, d2] = curve.domain[0];
  console.log(`curve domain: ${[d1, d2]}`);
  console.log(`pt: ${pt}`);
  const minPt = curve.points[0];
  const maxPt = curve.points[curve.points.length - 1];
  console.log(`minPt = ${minPt}, maxPt=${maxPt}`);
  const loc = getX(pt) / getX(maxPt);
  console.log(`loc=${loc}`);
  console.log(`-> ${d2} * ${loc}`);
  return d2 * loc;
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

  isWithinBounds(pt) {
    const upper = this.upperNurbs.evaluator(0)(
      [],
      domainTr(pt, this.upperNurbs)
    );
    const lower = this.lowerNurbs.evaluator(0)(
      [],
      domainTr(pt, this.lowerNurbs)
    );
    const upperY = getY(upper);
    const lowerY = getY(lower);
    const y = getY(pt);
    return true;
    // return y < upperY && y > lowerY;
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
        const color = this.isWithinBounds(pt) ? validColor : invalidColor;
        const circle = new paperScope.Path.Circle(pt, 2);
        const ppt = new paperScope.Point(pt);
        const text = new paperScope.PointText(ppt);
        text.content = `(${Math.round(getX(pt))}, ${Math.round(getY(pt))})`;
        text.strokeColor = color;
        text.fontSize = 4;
        circle.strokeWidth = 1;
        circle.strokeColor = color;
        return [circle, text];
      });
    }
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
          return this.isWithinBounds(point);
        }).length != poly.length
      )
        continue;
      drawFunc(paperScope, poly);
    }
  }
}

globalThis.DirectedPointCloud = DirectedPointCloud;
globalThis.DelaunayCloud = DelaunayCloud;
globalThis.nurbs = nurbs;
globalThis.$ = $;
globalThis.paper = paper.paper;
globalThis.getX = getX;
globalThis.getY = getY;
globalThis.randInt = randInt;
globalThis.domainTr = domainTr;
