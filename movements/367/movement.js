M507.define({
  number: 367,
  title: "Graduated parallel ruler",
  lede: "Two blades are joined by swinging arms, so the lower blade always stays parallel to the upper one. A curved brass arc on the lower blade crosses a scale on the upper blade and shows how far apart the blades are. This lets you draw lines the right distance apart without measuring each one.",
  alt: "Two long flat rulers one above the other on a sheet of paper, joined by two slanting arms. A curved brass strip rises from the lower ruler and crosses a scale of fine marks along the bottom edge of the upper ruler. A pencil draws lines along the bottom edge of the lower ruler.",
  parts: [
    { key: "held", color: "#E8E2D0", name: "Upper blade", note: "Held flat on the paper. A strip of ivory along its lower edge carries the scale." },
    { key: "moving", color: "#5E7387", name: "Lower blade", note: "Slides down the page and never turns. Its lower edge guides the pencil." },
    { key: "arms", color: "#D9B13B", name: "Swinging arms", note: "Two equal arms, pinned to both blades. They keep the blades parallel." },
    { key: "arc", color: "#C8873A", name: "Brass arc", note: "Fixed to the lower blade. Watch where it crosses the scale. That point tells you the gap between the blades." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Draws along the lower edge of the lower blade. Watch the lines pile up, each the same distance from the last." }
  ],
  controls: [{ type: "range", id: "step", label: "Space between lines", min: 2, max: 5, step: 1, value: 4, unit: " mm", presets: [[2, "Close"], [4, "Medium"], [5, "Wide"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "g", label: "Gap" }, { id: "n", label: "Lines" }],
  views: { "3d": [-181, -75, 399], front: [5, -15, 760], side: [820, -15, 260] },
  target: [5, -15, 0],
  distance: [300, 1600],
  how: [
    "The two blades are joined by two arms of the same length. As the arms swing, the lower blade slides down and sideways, but it never turns. So its edge always points the same way as the upper blade.",
    "The brass arc is fixed to the lower blade. As the blades come closer, the arc moves along the scale on the upper blade. Each mark on the scale matches a gap, so you can read the gap without a separate ruler.",
    "The ruler closes a little before each line is drawn. Try Close spacing, then Wide, and watch how far the arc moves along the scale each time."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown drew curly arms; plain bars are used here. The sheet of paper and the pencil were added to show the lines. The scale marks are placed to match the arc as it is drawn here. In real use you hold the upper blade and push the lower one. All the sizes are made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, i, o = this.o = { N: 5, L: 71, U: [-75, 43], ph: 0, st: null, G0: 29 };
    o.phi0 = Math.asin((33 + o.G0) / o.L); o.c0 = o.L * Math.cos(o.phi0);
    // geometry helpers shared with step: lower blade offset and where the arc crosses the scale for a gap g
    o.sx = function (g) { return o.L * Math.cos(Math.asin((33 + g) / o.L)) - o.c0; };
    o.read = function (g) { var s = Math.asin(Math.min(1, (20 + g) / 52)); return 38 - 71 * (1 - Math.cos(s)) + o.sx(g); };
    P.at(P.box(280, 145, 2, c.fixed), 5, -27.5, -1, c.scene);                                     // paper: x -135..145, y -100..45, z -2..0
    o.up = P.at(P.rulerPlate({ points: [[-90, 0], [112, 0], [112, 32], [-90, 32]], z0: 1.2, depth: 4, material: c.mat("held") }), 0, 0, 0, c.scene);   // z 1.2..5.2
    // ivory scale on the lower edge of the upper blade, with a mark for each millimetre of gap
    var xa = o.read(30), xb = o.read(2), x0 = Math.min(xa, xb) - 3, x1 = Math.max(xa, xb) + 3;
    P.at(P.box(x1 - x0, 8, .6, c.mat("held", "light")), (x0 + x1) / 2, 4.5, 5.5, c.scene);       // strip y 0.5..8.5, z 5.2..5.8
    for (var g = 2; g <= 30; g++) {
      var tall = g % 10 === 0 ? 7 : g % 5 === 0 ? 5 : 3;
      P.at(P.box(.7, tall, .4, c.mat("held", "dark")), o.read(g), 8 - tall / 2, 6, c.scene);        // mark z 5.8..6.2, up from the top of the strip
    }
    o.low = new T.Group(); c.scene.add(o.low);
    o.low.add(P.rulerPlate({ points: [[-111, -32], [92, -32], [92, 0], [-111, 0]], z0: 1.2, depth: 4, material: c.mat("moving") }));
    // curved brass arc: a quarter ellipse from the lower blade up to the scale, z 10.4..12.4
    var cen = [], n = 28, k, s, nx, ny, len, pts = [];
    for (k = 0; k <= n; k++) { s = k / n * Math.PI / 2; cen.push([38 - 71 * (1 - Math.cos(s)), -16 + 52 * Math.sin(s), -71 * Math.sin(s), 52 * Math.cos(s)]); }
    for (k = 0; k <= n; k++) { var q = cen[k]; len = Math.hypot(q[2], q[3]); pts.push([q[0] - q[3] / len * 2.5, q[1] + q[2] / len * 2.5]); }
    for (k = n; k >= 0; k--) { var r = cen[k]; len = Math.hypot(r[2], r[3]); pts.push([r[0] + r[3] / len * 2.5, r[1] - r[2] / len * 2.5]); }
    o.low.add(P.rulerPlate({ points: pts, z0: 10.4, depth: 2, material: c.mat("arc") }));
    P.at(P.cylZ(3.2, 7.5, c.mat("arc", "dark")), 38, -16, 8.15, o.low);                              // rivet from the blade (z 5.2) through the arc (to 12.4)
    P.at(P.cylZ(3.2, 1, c.mat("arc", "dark")), -33, 36, 12.9, o.low);                              // rivet head at the free end
    o.lx = o.U.map(function (u) { return u + o.c0; });
    o.arm = o.U.map(function (u) { return P.at(P.armPlate({ length: o.L, r0: 7, thick: 3, material: c.mat("arms") }), u, 16, 8.5, c.scene); });   // z 7..10
    o.U.forEach(function (u) { P.at(P.cylZ(3, 6, c.mat("arms", "dark")), u, 16, 8.2, c.scene); });     // rivets on the upper blade, z 5.2..11.2
    o.lx.forEach(function (x) { P.at(P.cylZ(3, 6, c.mat("arms", "dark")), x, -17, 8.2, o.low); });
    o.lines = P.at(P.ruledLines(o.N, c.mat("pencil", "dark")), 0, 0, 0, c.scene);
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 9, c.scene);
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, st = +S.controls.step, i;
    if (st !== o.st) { o.st = st; o.ph = 0; }
    o.ph += S.w * dt / (2 * Math.PI);
    var cy = P.ruleCycle(o.ph, o.N);
    function gapAt(pos) { return o.G0 - pos * st; }
    function edge(pos) { var g = gapAt(pos), sx = o.sx(g); return { x0: -111 + sx, x1: 92 + sx, y: -g - 32 }; }
    var g = gapAt(cy.pos), sx = o.sx(g), phi = Math.asin((33 + g) / o.L);
    o.low.position.set(sx, -g, 0);
    for (i = 0; i < 2; i++) { o.arm[i].position.set(o.U[i], 16, 8.5); o.arm[i].rotation.z = -phi; }
    P.ruleDraw({ n: o.N, cyc: cy, edge: edge, lines: o.lines, pen: o.pen, out: -1 });
    S.set("g", Math.round(g) + " mm");
    S.set("n", Math.min(o.N, cy.k < 0 ? cy.lines : cy.k + (cy.frac > .98 ? 1 : 0)) + " of " + o.N);
  }
});
