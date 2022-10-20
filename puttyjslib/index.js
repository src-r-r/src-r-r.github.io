$(window).on("load", function () {
  const scope = paper.install(window.document);
  const canvas = $("#myCanvas")[0];
  const layer = paper.setup(canvas);
  console.log(layer.view.viewSize);

  const sz = layer.view.viewSize;

  const width = sz.width;

  const upperPoints = [
    [0, 40],
    [Math.round(width * 0.4), 20],
    [Math.round(width * 0.95), 100],
  ];

  const lpy = 100;

  const lowerPoints = [
    [0, lpy + 40],
    [Math.round(width * 0.4), lpy + 70],
    [Math.round(width * 0.95), lpy + 300],
  ];

  const upperNurbs = nurbs({
    points: upperPoints,
    degree: 2,
    boundary: "clamped",
  });
  const lowerNurbs = nurbs({
    points: lowerPoints,
    degree: 2,
    boundary: "open",
  });

  const randColor = (ps) =>
    new ps.Color(Math.random(), Math.random(), Math.random());

  const black = new paper.Color(0, 0, 0);
  const blue = new paper.Color(0.3, 0.2, 0.6);

  const r = Math.round;
  const [b1, b2] = lowerNurbs.domain[0];

  function renderCell(ps, voronoiCell) {
    const shape = new ps.Path();
    shape.fillColor = randColor(ps);
    shape.strokeColor = randColor(ps);
    for (let cellPoint of voronoiCell) {
      console.log(cellPoint);
      shape.add(new ps.Point(...cellPoint));
    }
    shape.strokeWidth = 2;
    // shape.closed = true;
    // shape.scale(0.9);
  }

  const dpc = new DelaunayCloud(layer, upperNurbs, lowerNurbs, 2, 500);
  dpc.generateParticles();
  dpc.debugPoints();
  // dpc.render(renderCell);
  dpc.previewBounds(layer);

  for (let i = b1; i <= b2; i += 0.1) {
    const [x, y] = lowerNurbs.evaluator(0)([], i);
    const ppt = new paper.Point(x, y);
    const txt = new paper.PointText(ppt.add([30, -10]));
    const ptTest = domainTr([x, y], lowerNurbs);
    const ii = Math.round(i * 10) / 10;
    txt.content = `(${ii} - ${ptTest})`;
    const circle = new paper.Path.Circle(ppt, 10);
    circle.strokeColor = blue;
  }

  console.log(upperNurbs);
  console.log(lowerNurbs);
});
