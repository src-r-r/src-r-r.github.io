function dup(obj) {
  return JSON.parse(JSON.stringify(obj));
}
$(window).on("load", function () {
  const scope = paper.install(window.document);
  const canvas = $("#myCanvas")[0];
  const layer = paper.setup(canvas);
  console.log(layer.view.viewSize);

  const sz = layer.view.viewSize;

  const width = sz.width;

  const upperPoints = [
    [50, -70],
    [Math.round(width * 0.6), -30],
    [Math.round(width * 0.85), 10],
  ];

  const lpy = 100;

  const lowerPoints = [
    [50, lpy + 10],
    [Math.round(width * 0.4), lpy + 70],
    [Math.round(width * 0.75), lpy + 500],
  ];

  const upperNurbs = nurbs({
    points: upperPoints,
    degree: 2,
    boundary: "clamped",
  });
  const lowerNurbs = nurbs({
    points: lowerPoints,
    degree: 2,
    boundary: "clamped",
  });

  const randColor = (ps) =>
    new ps.Color(Math.random(), Math.random(), Math.random());

  const black = new paper.Color(0, 0, 0);
  const blue = new paper.Color(0.3, 0.2, 0.6);
  const lavendar = new paper.Color(0.5, 0.4, 0.7);

  const r = Math.round;
  const [b1, b2] = lowerNurbs.domain[0];

  let factor = 0.03;

  window.cellFrames = [];
  window.frameI = 0;

  function preRenderCell(ps, voronoiCell) {
    console.log(`adding ${JSON.stringify(voronoiCell)}`);
    window.cellFrames.push({
      frame: window.frameI,
      cell: dup(voronoiCell),
    });
    window.frameI += 1;
  }

  function renderCell(ps, voronoiCell) {
    const shape = new ps.Path();
    if (
      Math.random() < 0.2 ||
      lavendar.brightness <= 0.3 ||
      lavendar.brightness >= 0.9
    ) {
      factor *= -1;
    }
    lavendar.brightness += factor;
    shape.fillColor = lavendar;

    for (let cellPoint of voronoiCell) {
      console.log(cellPoint);
      shape.add(new ps.Point(...cellPoint));
    }
    shape.strokeWidth = 2;
    // shape.closed = true;
    shape.scale(0.9);
  }

  const dpc = new DelaunayCloud(layer, upperNurbs, lowerNurbs, 4, 500);
  dpc.generateParticles();
  // dpc.debugPoints();
  dpc.render(preRenderCell);
  dpc.previewBounds(layer);

  paper.view.onFrame = (event) => {
    try {
      typeof window.cellFrames === "undefined";
      typeof window.frameI === "undefined";
    } catch {
      return;
    }
    const cellFrames = window.cellFrames;
    const toRender = cellFrames.filter((c) => event.count > c.frame);
    // remove them from the cells to render.
    window.cellFrames = cellFrames.filter((c) => event.count > c.frame);
    if (!toRender.cell) {
      return;
    }
    console.log(`rendering ${toRender.cell}`);
    renderCell(paper, toRender.cell);
  };

  // for (let i = b1; i <= b2; i += 0.1) {
  //   const [x, y] = lowerNurbs.evaluator(0)([], i);
  //   const ppt = new paper.Point(x, y);
  //   const txt = new paper.PointText(ppt.add([30, -10]));
  //   const ptTest = domainTr([x, y], lowerNurbs);
  //   const ii = Math.round(i * 10) / 10;
  //   txt.content = `(${ii} - ${ptTest})`;
  //   const circle = new paper.Path.Circle(ppt, 10);
  //   circle.strokeColor = blue;
  // }
  console.log(upperNurbs);
  console.log(lowerNurbs);
});

function onFrame(event) {
  console.log(`frame (out)`);
}
