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

function randomConvexPolygon(viewSize) {
  const pt = () => {
    return randomPoint(0, 0, viewSize.width, viewSize.height);
  };
  const innerPoints = [pt(), pt(), pt(), pt()];
  return hull(innerPoints, Infinity);
}

$(document).load(function () {
  // const canvas = $("canvas")[0];
  const polygon = randomConvexPolygon(paperScope);
  console.log(`polygon: ${JSON.stringify(polygon)}`);
});
