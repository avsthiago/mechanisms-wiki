M507.define({
  number: 322,
  title: "Triangle parallel ruler",
  lede: "Two triangles are cut from one rectangle and laid with their slanting edges together. One slides along the other, and its bottom edge always points the same way. A pencil along that edge draws lines that never meet.",
  alt: "Two flat right-angled triangles lying on a sheet of paper, edge to edge along their long slanting side, with a finger hole in each. A pencil draws horizontal lines along the bottom of the lower triangle as it slides.",
  parts: [
    { key: "held", color: "#E8E2D0", name: "Held triangle", note: "Pressed flat on the paper and kept still. Its slanting edge is the track." },
    { key: "moving", color: "#E8E2D0", name: "Sliding triangle", note: "Slides along the track. Its bottom edge moves down the page but never turns." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Draws along the bottom edge of the sliding triangle. Watch the lines pile up." }
  ],
  controls: [{ type: "range", id: "step", label: "Space between lines", min: 8, max: 20, step: 2, value: 14, unit: " mm", presets: [[8, "Close"], [14, "Medium"], [20, "Wide"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "s", label: "Slid" }, { id: "n", label: "Lines" }],
  views: { "3d": [-40, -190, 493], front: [-40, -40, 800], side: [900, -40, 260] },
  target: [-40, -40, 0],
  distance: [300, 1600],
  how: [
    "Look at the long slanting edges. They lie face to face, so the sliding triangle can only move along that line. It cannot turn while it slides.",
    "Because it only slides, every edge keeps its direction. The pencil runs along the bottom edge each time, so all the lines point the same way and never meet. The farther the triangle slides, the farther apart the lines are.",
    "Try Close spacing, then Wide. A longer slide gives wider gaps, but the lines stay parallel."
  ],
  note: "This model is rebuilt from Brown's drawing. The sheet of paper and the pencil were added to show the lines. The two triangles are the same thickness, each with a finger hole as drawn. In real use you press one triangle down with a hand and push the other; here the upper one stays still. The sizes are made up.",

  build: function (c) {
    var P = c.P, T = c.THREE, o = this.o = { N: 5, W: 240, H: 160, Z0: 1.2, ph: 0, st: null }, W = o.W, H = o.H, x = W / 2, y = H / 2;
    o.L = Math.sqrt(W * W + H * H);
    P.at(P.box(480, 300, 2, c.fixed), -40, -40, -1, c.scene);                                   // paper: x -280..200, y -190..110, z -2..0
    o.A = P.at(P.rulerPlate({ points: [[-x, -y], [x, y], [-x, y]], holes: [[-65, 33, 14]], z0: o.Z0, depth: 4, material: c.mat("held") }), 0, 0, 0, c.scene);   // z 1.2..5.2
    o.B = P.at(P.rulerPlate({ points: [[-x, -y], [x, -y], [x, y]], holes: [[60, -42, 14]], z0: o.Z0, depth: 4, material: c.mat("moving") }), 0, 0, 0, c.scene);
    o.lines = P.at(P.ruledLines(o.N, c.mat("pencil", "dark")), 0, 0, 0, c.scene);
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 9, c.scene);
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, st = +S.controls.step, W = o.W, H = o.H, L = o.L;
    if (st !== o.st) { o.st = st; o.ph = 0; }
    o.ph += S.w * dt / (2 * Math.PI);
    var cy = P.ruleCycle(o.ph, o.N);
    function offset(pos) { var dy = pos * st; return [-dy * W / H + .5 * H / L, -dy - .5 * W / L, dy]; }   // slides down the slanting edge; 0.5 clear of it
    function edge(pos) { var d = offset(pos); return { x0: -W / 2 + d[0], x1: W / 2 + d[0], y: -H / 2 + d[1] }; }
    var d = offset(cy.pos); o.B.position.set(d[0], d[1], 0);
    P.ruleDraw({ n: o.N, cyc: cy, edge: edge, lines: o.lines, pen: o.pen, out: -1 });
    S.set("s", Math.round(d[2] * L / H) + " mm");
    S.set("n", Math.min(o.N, cy.k < 0 ? cy.lines : cy.k + (cy.frac > .98 ? 1 : 0)) + " of " + o.N);
  }
});
