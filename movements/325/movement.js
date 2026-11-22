M507.define({
  number: 325,
  title: "Swinging-arm parallel ruler",
  lede: "Two rulers are joined by two arms of the same length that swing like gates. The rulers can open or close, but their edges always stay parallel. A pencil along the edge draws lines that never meet.",
  alt: "Two long flat rulers one above the other on a sheet of paper, joined by two slanting arms with a pin at each end. A pencil draws lines along the top edge of the upper ruler.",
  parts: [
    { key: "held", color: "#E8E2D0", name: "Lower ruler", note: "Pressed on the paper and kept still." },
    { key: "moving", color: "#E8E2D0", name: "Upper ruler", note: "Swings up and sideways as the arms turn, but never tilts." },
    { key: "arms", color: "#D9B13B", name: "Swinging arms", note: "Two arms of the same length, pinned at both ends. They always stay parallel to each other." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Draws along the top edge of the upper ruler. Watch the lines pile up." }
  ],
  controls: [{ type: "range", id: "step", label: "Space between lines", min: 6, max: 16, step: 2, value: 12, unit: " mm", presets: [[6, "Close"], [12, "Medium"], [16, "Wide"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "g", label: "Gap" }, { id: "n", label: "Lines" }],
  views: { "3d": [10, -167, 516], front: [10, -10, 800], side: [820, -20, 300] },
  target: [10, -10, 0],
  distance: [300, 1600],
  how: [
    "Each ruler has two pins, and the two arms join them in pairs. The distance between the pins is the same on both rulers, and the arms are the same length. Those four pins and two rulers always make a slanting box, a parallelogram.",
    "In a parallelogram the opposite sides stay parallel however far it leans. So the upper ruler slides up and a little sideways, and it never turns. The pencil draws parallel lines.",
    "Try Close spacing, then Wide. Watch how the arms lean more upright and the upper ruler shifts sideways."
  ],
  note: "This model is rebuilt from Brown's drawing. The sheet of paper and the pencil were added to show the lines. The arm length, pin positions and thicknesses are made up. In real use you hold one ruler and push the other; here the lower one stays still.",

  build: function (c) {
    var P = c.P, o = this.o = { N: 5, L: 172, C0: 91, BX: -35, YB: -90, HW: 21.5, AX: [-133, -44], BXS: [33, 122], ph: 0, st: null };
    P.at(P.box(450, 240, 2, c.fixed), 10, -10, -1, c.scene);                                      // paper: x -215..235, y -130..110, z -2..0
    function ruler(key) { return P.rulerPlate({ points: [[-150, -o.HW], [150, -o.HW], [150, o.HW], [-150, o.HW]], z0: 1.2, depth: 4, material: c.mat(key) }); }   // z 1.2..5.2
    o.lo = P.at(ruler("held"), o.BX, o.YB, 0, c.scene);
    o.up = P.at(ruler("moving"), 0, 0, 0, c.scene);
    var m = c.mat("arms");
    o.arms = [0, 1].map(function () { return P.at(P.armPlate({ length: o.L, r0: 6, thick: 3, material: m }), 0, 0, 6.7, c.scene); });   // z 5.2..8.2, sitting on the rulers
    o.heads = [0, 1, 2, 3].map(function () { return P.at(P.cylZ(5, 1.5, c.mat("arms", "dark")), 0, 0, 8.95, c.scene); });                                  // brass heads, z 8.2..9.7
    o.lines = P.at(P.ruledLines(o.N, c.mat("pencil", "dark")), 0, 0, 0, c.scene);
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 9, c.scene);
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, st = +S.controls.step, L = o.L, i;
    if (st !== o.st) { o.st = st; o.ph = 0; }
    o.ph += S.w * dt / (2 * Math.PI);
    var cy = P.ruleCycle(o.ph, o.N);
    function pose(pos) { var c2c = o.C0 + pos * st, s = c2c / L, co = Math.sqrt(1 - s * s); return { c2c: c2c, phi: Math.asin(s), x: o.BX + o.BXS[0] - o.AX[0] - L * co, y: o.YB + c2c }; }
    function edge(pos) { var q = pose(pos); return { x0: q.x - 150, x1: q.x + 150, y: q.y + o.HW }; }
    var q = pose(cy.pos);
    o.up.position.set(q.x, q.y, 0);
    for (i = 0; i < 2; i++) {
      o.arms[i].position.set(q.x + o.AX[i], q.y, 6.7); o.arms[i].rotation.z = -q.phi;
      o.heads[i].position.set(q.x + o.AX[i], q.y, 8.95);
      o.heads[2 + i].position.set(o.BX + o.BXS[i], o.YB, 8.95);
    }
    P.ruleDraw({ n: o.N, cyc: cy, edge: edge, lines: o.lines, pen: o.pen, out: 1 });
    S.set("g", Math.round(q.c2c - 2 * o.HW) + " mm");
    S.set("n", Math.min(o.N, cy.k < 0 ? cy.lines : cy.k + (cy.frac > .98 ? 1 : 0)) + " of " + o.N);
  }
});
