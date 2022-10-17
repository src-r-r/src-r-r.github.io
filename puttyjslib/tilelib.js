import nurbs from "nurbs";
import $ from "jquery";
import * as paper from "paper";

export const name = "puttytilelib";

const getX = (pt) => (pt.x ? pt.x : pt[0]);
const getY = (pt) => (pt.y ? pt.y : pt[0]);

const randInt = (...range) =>
  Math.round(
    range.length == 1
      ? Math.random() * range[0]
      : Math.random() * (range[1] - range[0]) + range[0]
  );

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
  }

  randomPoint() {
    const [xMin, yMin] = lowerNurbs.evaluate([], Math.random() * length);
    const [xMax, yMax] = upperNurbs.evaluate([], Math.random() * length);
    return [randInt(xMin, xMax), randInt(yMin, yMax)];
  }

  generateParticles() {
    this.particlePoints = this.particlePoints.map(() => {
      const pt = this.randomPoint();
      console.debug(`picked random point ${pt}`);
      return pt;
    });
  }

  /**
   *
   * @param {number []} pt Where to draw the point.
   */
  drawCircle(pt) {
    const circle = this.paperScope.Path.Circle(pt, 5);
    circle.strokeColor = "blue";
    return circle;
  }

  /**
   *
   * @param {(paper.PaperScope, number[]) => any} drawFunc Function to use for drawing. Default will draw a circle.
   */
  render(drawFunc = this.drawCircle) {
    return this.particles.map((particlePoint) => drawFunc(particlePoint));
  }

  previewBounds() {
    const upperArc = this.paperScope.Path.Arc();
    const lowerArc = this.paperScope.Path.Arc();
    upperArc.strokeWidth = 3;
    lowerArc.strokeWidth = 3;
    const upperPoints = this.upperNurbs.points;
    const lowerPoints = this.lowerNurbs.points;
    console.log(`upper points: ${upperPoints}`);
    console.log(`lower points: ${lowerPoints}`);
    upperArc.add(...upperPoints);
    lowerArc.add(...lowerPoints);
  }
}
class DelaunayCloud extends DirectedPointCloud {
  delaunay = null;

  generate() {
    this.delaunay = Delaunay.from();
  }
}

globalThis.DirectedPointCloud = DirectedPointCloud;
globalThis.nurbs = nurbs;
globalThis.$ = $;
globalThis.paper = paper.paper;
globalThis.getX = getX;
globalThis.getY = getY;
