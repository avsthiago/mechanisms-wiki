M507.define({
  number: 323,
  title: "Rolling parallel ruler",
  lede: "A straight ruler rides on a rod with a small wheel at each end. The wheels roll over the paper and always turn the same way, so the ruler can only roll straight ahead. A pencil along its edge draws lines that never meet.",
  alt: "A long flat ruler on a sheet of paper, with a rod through it and a small wheel at each end. The wheels have ridged rims. The ruler rolls up the page while a pencil draws lines along its edge.",
  parts: [
    { key: "ruler", color: "#E8E2D0", name: "Ruler", note: "A straight bar fixed to the rod. Its long edge guides the pencil." },
    { key: "wheels", color: "#5E7387", name: "Ridged wheels", note: "They stick out a little under the ruler. The ridges grip the paper, so the wheels cannot slip sideways." },
    { key: "axle", color: "#D9B13B", name: "Rod", note: "Joins the two wheels so they always turn together and at the same speed." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Draws along the top edge of the ruler. Watch the lines pile up." }
  ],
  controls: [{ type: "range", id: "step", label: "Space between lines", min: 8, max: 24, step: 2, value: 16, unit: " mm", presets: [[8, "Close"], [16, "Medium"], [24, "Wide"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "s", label: "Rolled" }, { id: "n", label: "Lines" }],
  views: { "3d": [0, -194, 523], front: [0, -30, 780], side: [820, -50, 300] },
  target: [0, -30, 0],
  distance: [300, 1600],
  how: [
    "The two wheels sit on one rod, so they turn together at the same speed. Both ends of the ruler move forward by the same amount. That is why the ruler cannot swing round.",
    "The ridges bite into the paper, so the wheels roll instead of sliding. The pencil runs along the same edge each time, and every line is parallel to the one before.",
    "Try Close spacing, then Wide. The ruler rolls farther for wider gaps, and the wheels turn more."
  ],
  note: "This model is rebuilt from Brown's drawing. The sheet of paper and the pencil were added to show the lines. Brown shows the wheels in small frames at the ends; these are left out. The ridges on the wheels are drawn in simply, and all sizes are made up.",

  build: function (c) {
    var P = c.P, T = c.THREE, o = this.o = { N: 5, Y0: -70, YW: 10, ph: 0, st: null, wheels: [] }, i, a;
    P.at(P.box(430, 200, 2, c.fixed), 0, -30, -1, c.scene);                                    // paper: x -215..215, y -130..70, z -2..0
    o.ruler = new T.Group(); c.scene.add(o.ruler);
    P.at(P.box(340, 20, 8, c.mat("ruler")), 0, 0, 5.4, o.ruler);                               // x -170..170, y -10..10, z 1.4..9.4
    P.at(P.cylX(2.4, 396, c.mat("axle")), 0, 0, 10.4, o.ruler);                               // rod, x -198..198, through the ruler and both wheels
    [-1, 1].forEach(function (s) {
      var w = new T.Group(); P.at(w, s * 179, 0, 10.4, o.ruler);                              // wheel x 171..187, bottom z 0.4
      P.at(P.cylX(9, 16, c.mat("wheels")), 0, 0, 0, w);
      for (i = 0; i < 12; i++) { a = i * Math.PI / 6; var r = P.box(17, 2, 4, c.mat("wheels", "light")); r.rotation.x = a; P.at(r, 0, 9 * Math.cos(a), 9 * Math.sin(a), w); }   // ridges reach radius 10
      o.wheels.push(w);
      P.at(P.cylX(5, 5, c.mat("axle")), s * 192.5, 0, 10.4, o.ruler);                          // nut, x 190..195
    });
    o.lines = P.at(P.ruledLines(o.N, c.mat("pencil", "dark")), 0, 0, 0, c.scene);
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 9, c.scene);
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, st = +S.controls.step;
    if (st !== o.st) { o.st = st; o.ph = 0; }
    o.ph += S.w * dt / (2 * Math.PI);
    var cy = P.ruleCycle(o.ph, o.N);
    function edge(pos) { return { x0: -170, x1: 170, y: o.Y0 + pos * st + o.YW }; }
    var d = cy.pos * st;
    o.ruler.position.y = o.Y0 + d;
    o.wheels.forEach(function (w) { w.rotation.x = -d / 10; });
    P.ruleDraw({ n: o.N, cyc: cy, edge: edge, lines: o.lines, pen: o.pen, out: 1 });
    S.set("s", Math.round(d) + " mm");
    S.set("n", Math.min(o.N, cy.k < 0 ? cy.lines : cy.k + (cy.frac > .98 ? 1 : 0)) + " of " + o.N);
  }
});
