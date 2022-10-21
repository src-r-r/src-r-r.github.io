const { expect } = require("chai");
const nurbs = require("nurbs");

async function test() {
  const { domainTr, isWithinBounds } = await import("./tilelib.js");
  const curve = {
    points: [
      [100, 10],
      [200, 0],
      [300, 10],
    ],
    domain: [[1, 10]],
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
  expect(isWithinBounds(validPt, upperCurve, lowerCurve)).to.equal(true);
}

test();
