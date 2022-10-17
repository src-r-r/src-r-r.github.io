$(window).on("load", function () {
  const scope = paper.install(window.document);
  const canvas = $("#myCanvas")[0];
  const layer = paper.setup(canvas);

  const sz = layer.view.viewSize;

  const upperPoints = [
    [0, 0],
    [Math.round(sz.width * 0.6), 30],
    [Math.round(sz.width * 0.9), 100],
  ];

  const lowerPoints = [
    [0, 0],
    [Math.round(sz.width * 0.6), 30],
    [Math.round(sz.width * 0.9), 100],
  ];

  const upperNurbs = nurbs({ points: upperPoints });
  const lowerNurbs = nurbs({ points: lowerPoints });

  const dpc = new DirectedPointCloud(paper, upperNurbs, lowerNurbs);
  dpc.previewBounds();
});
