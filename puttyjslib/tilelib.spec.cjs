const { expect } = require("chai");
const nurbs = require("nurbs");

async function test() {
  const { minOf, maxOf, curveMaxX, curveMinX, domainTr, isWithinBounds } =
    await import("./tilelib.js");

  // min and max gets the min and max

  expect(minOf([100, 400, -8, 85])).to.equal(-8);
  expect(maxOf([100, 400, -8, 85])).to.equal(400);

  const curve = {
    points: [
      [100, 10],
      [200, 0],
      [300, 10],
    ],
    domain: [[0, 10]],
  };
  expect(domainTr([200, 0], curve)).to.equal(5);

  // Test that isWithinBounds works
  const upperCurve = nurbs({
    points: [
      [100, 20],
      [200, 10],
      [300, 20],
    ],
    degree: 2,
  });
  const lowerCurve = nurbs({
    points: [
      [100, 100],
      [200, 50],
      [300, 100],
    ],
    degree: 2,
  });
  const validPt = [150, 45];
  const invalidPtUpper = [150, 0];
  const invalidPtLower = [2000, 2000];
  expect(isWithinBounds(invalidPtUpper, upperCurve, lowerCurve)).to.equal(
    false
  );
  expect(isWithinBounds(invalidPtLower, upperCurve, lowerCurve)).to.equal(
    false
  );
  console.log(`------ should be true ------------`);
  let expected = isWithinBounds(validPt, upperCurve, lowerCurve);
  expect(expected).to.equal(true);
}

test();
