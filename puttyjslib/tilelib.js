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

function randomPoint(xmin = 0, ymin = 0, xmax = 2, ymax = 2) {
  return [randInt(xmin, xmax), randInt(ymin, ymax)];
}

function randUnique(a, b, exclude) {
  const r = _.random(a, b);
  if (exclude.includes(r)) {
    return randUnique(a, b, exclude);
  }
  return r;
}

function randSortedNumbers(N, C) {
  return new Array(N).fill().map((val, i, arr) => {
    return randUnique(0, C, arr);
  });
}

function randomPartitioned(array, n, except = []) {
  const good = array.filter((x) => !except.includes(x));
  const buckets = good.map(() => _.random(0, n));
  const partitioned = _.zipObject(buckets, good);
  console.log(`partitioned as ${JSON.stringify(partitioned)}`);
  return _.values(partitioned);
}

function findConsec(val, i, arr) {
  if (i == arr.length - 1) {
    return val;
  }
  return arr[i + 1] - val;
}

function slope(p1, p2) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return (x2 - x1) / (y2 - y1);
}

function randomConvexPolygon(N, C) {
  const xlist = randSortedNumbers(N, C);
  const ylist = randSortedNumbers(N, C);
  console.log(`random x's: ${xlist}`);
  console.log(`random y's: ${ylist}`);
  const [xMin, xMax] = [_.min(xlist), _.max(xlist)];
  const [yMin, yMax] = [_.min(ylist), _.max(xlist)];
  const [x1list, x2list] = randomPartitioned(xlist, 1, [xMin, xMax]);
  const [y1list, y2list] = randomPartitioned(ylist, 1, [yMin, yMax]);
  console.log(`x1list=${x1list}`);
  console.log(`x2list=${x2list}`);
  console.log(`y1list=${y1list}`);
  console.log(`y2list=${y2list}`);
  const x1 = [xMin, ...x1list, xMax];
  const x2 = [xMin, ...x2list, xMax];
  const y1 = [yMin, ...y1list, yMax];
  const y2 = [yMin, ...y2list, yMax];
  const xVec = [x1.map(findConsec), _.reverse(x2.map(findConsec))];
  const yVec = [y1.map(findConsec), _.reverse(y2.map(findConsec))];
  const vecsPoints = _.sortBy(
    xVec.map((v, i) => {
      [v, yVec[i]];
    }),
    (vec) => {
      return slope(...vec);
    }
  );
  console.log("Vector points: ");
  console.log(vecPoints);
}
