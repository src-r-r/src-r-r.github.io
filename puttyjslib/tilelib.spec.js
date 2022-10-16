const { expect } = require("chai");
const {
  randomConvexPolygon,
  pointsAfter,
  getX,
  getY,
  getSides,
  northMost,
  sideCardinality,
  Direction,
  normalizePoly,
} = require("./tilelib");
describe("tile library tests", function () {
  it("Get a random convex polygon", function () {
    const polyPoints = randomConvexPolygon(4, { width: 40, height: 20 });
    console.log(polyPoints);
  });
  it("the get functions get correct point", function () {
    expect(getX({ x: 4, y: 2 })).to.equal(4);
    expect(getX([4, 2])).to.equal(4);
    expect(getY({ x: 9, y: 18 })).to.equal(18);
    expect(getY([7, 8])).to.equal(8);
  });
  it("Get all the sides of a polygon", function () {
    const diamond = [
      [4, 1],
      [2, 2],
      [6, 2],
      [8, 8],
    ];

    const expected1 = [
      [
        [4, 1],
        [2, 2],
      ],
      [
        [2, 2],
        [6, 2],
      ],
      [
        [6, 2],
        [8, 8],
      ],
      [
        [8, 8],
        [4, 1],
      ],
    ];
    expect(getSides(diamond)).to.deep.equal(expected1);
  });

  it("Can get northmost point on a set of points", function () {
    const seg1 = [
      [0, 4],
      [1, 1],
      [2, 2],
      [3, 2],
    ];
    expect(northMost(...seg1)).to.deep.equal([1, 1]);
  });

  it("Unordered set of polygon points are ordered", function () {
    const diamond = [
      [4, 1], // top
      [4, 2], // right
      [4, 4], // bottom
      [1, 2], // left
      [4, 1],
    ];
    const ordered = [
      [4, 4], // bottom
      [1, 2], // left
      [4, 1], // top
      [4, 2], // right
    ];
    const result = normalizePoly(diamond);
    console.log(`expected: ${JSON.stringify(ordered)}`);
    console.log(`result: ${JSON.stringify(result)}`);
    expect().to.deep.equal(ordered);
  });

  it("Cardinality can be determined from a side along a polygon.", function () {
    const diamond = [
      [4, 4], // bottom
      [1, 2], // left
      [4, 1], // top
      [4, 2], // right
    ];
    const sides = getSides(normalizePoly(diamond));
    expect(sideCardinality(sides[0], diamond)).to.equal(Direction.SW);
    expect(sideCardinality(sides[1], diamond)).to.equal(Direction.NW);
    expect(sideCardinality(sides[2], diamond)).to.equal(Direction.NE);
    expect(sideCardinality(sides[3], diamond)).to.equal(Direction.SE);
  });
});
