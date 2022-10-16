const hull = require("hull.js");
const $ = require("jquery");
const _ = require("lodash");
const centroid = require("polygon-centroid");
const midpoint = require("midpoint");
const convexHull = require("convex-hull");
const acos = require("@stdlib/math-base-special-acos");

class Direction {
  static N = "N";
  static NE = "NE";
  static E = "E";
  static SE = "SE";
  static S = "S";
  static SW = "SW";
  static W = "W";
  static NW = "NW";
  static _DIRECTIONS = [
    Direction.N,
    Direction.NE,
    Direction.E,
    Direction.SE,
    Direction.S,
    Direction.SW,
    Direction.W,
    Direction.NW,
  ];

  static isValid(val) {
    return Direction._DIRECTIONS.includes(val);
  }

  /**
   *
   * @param {Direction} dir Cardinal Direction
   * @returns List of adjacent cardinal directions (including `dir`)
   */
  static adjacent(dir) {
    const i = Direction._DIRECTIONS.indexOf(i);
    const prevI = i === 0 ? Direction._DIRECTIONS.length : i;
    const nextI = i === Direction._DIRECTIONS.length ? 0 : i;
    return [Direction._DIRECTIONS[prevI], dir, Direction._DIRECTIONS[nextI]];
  }
}

function randInt(a, b) {
  return Math.round(Math.random() * (b - a) + a);
}

function randomRgba(r = -1, g = -1, b = -1, a = -1) {
  return new Pencil.Color(
    r < 0 ? Math.random() : r,
    g < 0 ? Math.random() : g,
    b < 0 ? Math.random() : b,
    a < 0 ? Math.random() : a
  );
}

function randomPoint(xmin = 0, ymin = 0, xmax = 200, ymax = 200) {
  return [randInt(xmin, xmax), randInt(ymin, ymax)];
}

function randomConvexPolygon(nPoints, viewSize) {
  const points = new Array(nPoints).fill().map(() => {
    return randomPoint(0, 0, viewSize.width, viewSize.height);
  });
  return hull(points, Infinity);
}

// Utility method to normalize "Pointy" objects or x,y pairs.
const getX = (obj) => (_.isArray(obj) ? obj[0] : obj.x || obj["x"]);
const getY = (obj) => (_.isArray(obj) ? obj[1] : obj.y || obj["y"]);
// converts a pair to an x/y object.
const objPt = (x, y) => {
  return { x, y };
};
// covnerts an array of pairs to x/y objects.
const objPts = (...points) => {
  return points.map((p) => objPt(...p));
};
const objPair = (xy) => {
  return _.isArray ? xy : [xy.x, xy.y];
};
const objPairs = (arr) => {
  return arr.map(objPair);
};

/**
 * Get any points on a polygon relative to the point {x, y}
 * @param {Array<Array<number>>} Pairs of points (e.g. from a polygon)
 * @param {x, y} reference x coordinate and reference y coordinate
 * @returns
 */
function pointsAfter(points, { x, y } = { x: null, y: null }, lessThan = true) {
  // Comparison for the quadrant
  const comp = lessThan ? (a, b) => a < b : (a, b) => a > b;

  return points.filter((point) => {
    if (x !== null && y !== null) {
      return comp(getX(point), x) && comp(getY(point), y);
    } else if (x != null) {
      return comp(getX(point), x);
    }
    return comp(getY(point), x);
  });
}

/**
 *
 * @param {Array<Array<number>> | Array<{x: number, y: number}>} polygon Polygon whose sides we're directionifying.
 * @return {Array<Array<Array<number>>> | Array<Array<{x : number, y: Number}>>} all the sides of a polygon.
 */
function getSides(polygon) {
  return polygon.map((point, i) => {
    return [point, polygon[i == polygon.length - 1 ? 0 : i + 1]];
  });
}

function slope(p0, p1) {
  return (getX(p1) - getX(p0)) / (getY(p1) - getY(p0));
}

function northMost(...points) {
  const y0 = getY(points[0]);
  return (
    points.find((pt) => {
      const y1 = getY(pt);
      return y1 < y0 ? pt : null;
    }) || points[0]
  );
}

function southMost(...points) {
  const y0 = getY(points[0]);
  return (
    points.find((pt) => {
      const y1 = getY(pt);
      return y1 > y0 ? pt : null;
    }) || points[0]
  );
}

function westMost(...points) {
  const x0 = getX(points[0]);
  return (
    points.find((pt) => {
      const x1 = getX(pt);
      return x1 < x0 ? pt : null;
    }) || points[0]
  );
}

function eastMost(...points) {
  const x0 = getX(points[0]);
  return (
    points.find((pt) => {
      const x1 = getX(pt);
      return x1 > x0 ? pt : null;
    }) || points[0]
  );
}

/**
 *
 * @param {*} p0
 * @param {*} p1
 * @returns true if p1 is north of p0
 */
function isNorthOf(p0, p1) {
  return getY(p1) < getY(p0);
}

/**
 *
 * @param {*} p0
 * @param {*} p1
 * @returns true if p1 is south of p0
 */
function isSouthOf(p0, p1) {
  return getY(p1) > getY(p0);
}

/**
 *
 * @param {*} p0
 * @param {*} p1
 * @returns true if p1 is east of p0
 */
function isEastOf(p0, p1) {
  return getX(p1) > getX(p0);
}

/**
 *
 * @param {*} p0
 * @param {*} p1
 * @returns true if p1 is west of p0
 */
function isWestOf(p0, p1) {
  return getX(p1) < getX(p0);
}

function dist(p1, p2) {
  return Math.sqrt(
    Math.pow(getX(p2) - getX(p1), 2) / Math.pow(getY(p2) - getY(p2), 2)
  );
}

function calcAngle(p1, hyp, p2) {
  // Thanks https://www.omnicalculator.com/math/triangle-angle#how-to-find-the-angle-of-a-triangle
  const b = dist(hyp, p1);
  const c = dist(hyp, p2);
  const a = dist(p1, p2);
  return acos(Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2)) / (2 * b * c);
}

/**
 * Normalizes the polygon so that we have an ordered set of sides.
 */
function normalizePoly(polygon) {
  // Use nmp as reference
  const nmp = northMost(...polygon);
  const center = centroid(objPts(polygon));
  console.log(
    `center of ${JSON.stringify(polygon)} is ${JSON.stringify(center)}`
  );
  // Calculate the other angles.
  const angles = polygon.map((point) => {
    const angle = calcAngle(nmp, center, point);
    console.log(
      `angle from ${nmp} -> ${JSON.stringify(center)} -> ${point} = ${angle}`
    );
    return { point, angle };
  });
  return _.sortBy(angles, "angle").map((x) => x.point);
}

function sideCardinality(side, polygon) {
  const poly = normalizePoly(polygon);
  const center = centroid(poly);

  const emp = eastMost(...side);
  const wmp = westMost(...side);
  const nmp = northMost(...side);
  // const smp = southMost(...side);

  const m = slope(wmp, emp);
  const mppoints = objPairs(side);
  const mp = midpoint(mppoints);
  console.log(`slope of ${JSON.stringify(side)} is ${m}`);
  console.log(`midpoint = ${mp}`);

  if (m === 0) {
    return isNorthOf(center, mp) ? Direction.N : Direction.S;
  }

  if (m === Infinity || m === NaN) {
    return isEastOf(center, mp) ? Direction.E : Direction.W;
  }

  // the reference point is top-left,
  // (as opposed to cartesian coordinates)
  // so we have to think of the slope in reverse.

  if (m > 0) {
    // looks like "\"
    // either NE or SW
    return isSouthOf(center, mp) ? Direction.NE : Direction.SW;
  }

  // looks like "/"
  // Either NW or SE
  return isSouthOf(center, mp) ? Direction.NW : Direction.SE;
}

/**
 *
 * @param {Array<Array<number>> || Array<{x: number, y: number}>} polygon Polygon whose sides we're directionifying.
 */
function cardinalizeSides(polygon) {
  const sides = getSides(polygon);
  return _.groupBy(sides, (side) => {
    sideCardinality(side, polygon);
  });
}

/**
 * Get the side at the specific cardinality or adjacent cardinality
 *
 * @param {Array<Array<number>> || Array<{x: number, y: number}>} polygon Polygon whose sides we're directionifying.
 * @param {"N" | "E" | "S" | "W" | "NE" | "NW" | "SE" | "SW"} direction
 *
 */
function pickSide(polygon, direction) {
  const sides = cardinalizeSides(polygon);
  const dirs = _.keys(card);
  return (
    sides[direction] ||
    dirs.map((dir) => {
      sides[dir];
    })
  );
}

function pointBeyond(pt, dir, maxDist) {
  const x1 = getX(pt);
  const y1 = getY(pt);
  const posX = String(dir).includes("S");
  const posY = String(dir).includes("E");
  const xDist = _.random(0, maxDist);
  const yDist = _.random(0, maxDist);
  const x2 = posX ? x1 + xDist : x1 - xDist;
  const y2 = posY ? y1 + yDist : y1 - yDist;
  return [x2, y2];
}

/**
 *
 * @param {Array<Array<number>> | Array<{x: number, y: number}>} otherPolygon
 * @param {"N" | "E" | "S" | "W" | "NE" | "NW" | "SE" | "SW"} direction
 */
function randomConvexHullFrom(otherPolygon, direction, nPoints = null) {
  const startSide = pickSide(otherPolygon, direction);
  nPoints = nPoints !== null ? nPoints : otherPolygon.length;
  const points = [
    ...startSide,
    Array(nPoints)
      .fill()
      .map((el) => {
        return pointBeyond(startSide[0]);
      }),
  ];
}

module.exports = {
  Direction,
  randomConvexPolygon,
  pointsAfter,
  getX,
  getY,
  getSides,
  northMost,
  sideCardinality,
  cardinalizeSides,
  pickSide,
  pointBeyond,
  randomConvexHullFrom,
  normalizePoly,
};
