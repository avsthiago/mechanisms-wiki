M507.define({
  number: 349,
  title: "Jointed-arm parallel ruler",
  lede: "Two rulers are joined by jointed arms that bend in the middle, and a bar rides between them. When the rulers open or close, their edges and their ends all stay parallel. A pencil along the edge draws lines that never meet.",
  alt: "Two long flat rulers one above the other on a sheet of paper, with a pointed bar between them. Two pairs of jointed arms, each bent like a sideways V, join the rulers to the bar. A pencil draws lines along the top edge of the upper ruler.",
  parts: [
    { key: "held", color: "#E8E2D0", name: "Lower ruler", note: "Pressed on the paper and kept still." },
    { key: "moving", color: "#E8E2D0", name: "Upper ruler", note: "Moves straight up and down the page. Its ends stay in line with the lower ruler." },
    { key: "bar", color: "#4FA58A", name: "Middle bar", note: "Rides between the rulers. The joints of the arms are pinned to it, so it keeps the arms bending evenly." },
    { key: "arms", color: "#D9B13B", name: "Jointed arms", note: "Each pair has two equal arms pinned together at the middle joint. One end is pinned to each ruler." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Draws along the top edge of the upper ruler. Watch the lines pile up." }
  ],
  controls: [{ type: "range", id: "step", label: "Space between lines", min: 4, max: 12, step: 2, value: 8, unit: " mm", presets: [[4, "Close"], [8, "Medium"], [12, "Wide"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "g", label: "Gap" }, { id: "n", label: "Lines" }],
  views: { "3d": [0, -169, 475], front: [0, -25, 800], side: [820, -30, 300] },
  target: [0, -25, 0],
  distance: [300, 1600],
  how: [
    "Each pair of arms is pinned to both rulers and to the middle bar. The two arms are the same length, so the bar always sits halfway between the rulers. The rulers cannot twist, because both pairs of arms bend the same amount.",
    "When the rulers close, the arms bend more and the bar slides sideways. When they open, the arms straighten and the bar slides back. The rulers themselves only move up and down, so every pencil line is parallel to the last.",
    "Try Close spacing, then Wide. Watch the bar slide sideways while the rulers stay in line."
  ],
  note: "This model is rebuilt from Brown's drawing. The sheet of paper and the pencil were added to show the lines. The lengths, thicknesses and pin positions are made up. In real use you hold one ruler and push the other; here the lower one stays still.",

  build: function (c) {
    var P = c.P, o = this.o = { N: 5, L: 104, C0: 166, YB: -100, TX: [-78, 64], ph: 0, st: null }, T = c.THREE;
    var cos0 = Math.sqrt(1 - Math.pow(o.C0 / 2 / o.L, 2)); o.cos0 = cos0;
    P.at(P.box(430, 270, 2, c.fixed), 0, -25, -1, c.scene);                                       // paper: x -215..215, y -160..110, z -2..0
    o.top = P.at(P.rulerPlate({ points: [[-180, -45], [-104, -45], [-88, -29], [180, -29], [180, 26], [-180, 26]], z0: 1.2, depth: 4, material: c.mat("moving") }), 0, 0, 0, c.scene);   // z 1.2..5.2
    o.bot = P.at(P.rulerPlate({ points: [[-180, 45], [-104, 45], [-88, 29], [180, 29], [180, -26], [-180, -26]], z0: 1.2, depth: 4, material: c.mat("held") }), 0, o.YB, 0, c.scene);
    o.bar = P.at(P.rulerPlate({ points: [[-128, 0], [-103, 24.5], [157, 24.5], [157, -24.5], [-103, -24.5]], z0: 1.2, depth: 4, material: c.mat("bar") }), 0, 0, 0, c.scene);
    var m = c.mat("arms");
    o.up = [0, 1].map(function () { return P.at(P.armPlate({ length: o.L, r0: 6, thick: 3, material: m }), 0, 0, 6.7, c.scene); });   // z 5.2..8.2, from the upper ruler to the middle joint
    o.lo = [0, 1].map(function () { return P.at(P.armPlate({ length: o.L, r0: 6, thick: 3, material: m }), 0, 0, 9.7, c.scene); });   // z 8.2..11.2, from the middle joint to the lower ruler
    o.pt = [0, 1].map(function () { return P.at(P.cylZ(5, 1.5, c.mat("arms", "dark")), 0, 0, 8.95, c.scene); });     // head on the upper ruler joint, z 8.2..9.7
    o.pe = [0, 1].map(function () { return P.at(P.cylZ(3.2, 6, m), 0, 0, 8.2, c.scene); });        // pin through both arms at the middle joint, z 5.2..11.2
    o.he = [0, 1].map(function () { return P.at(P.cylZ(5, 1.5, c.mat("arms", "dark")), 0, 0, 11.95, c.scene); });    // head, z 11.2..12.7
    o.pb = [0, 1].map(function () { return P.at(P.cylZ(3.2, 3, m), 0, 0, 6.7, c.scene); });        // post under the lower arm end, z 5.2..8.2
    o.hb = [0, 1].map(function () { return P.at(P.cylZ(5, 1.5, c.mat("arms", "dark")), 0, 0, 11.95, c.scene); });
    o.lines = P.at(P.ruledLines(o.N, c.mat("pencil", "dark")), 0, 0, 0, c.scene);
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 9, c.scene);
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, st = +S.controls.step, L = o.L, i;
    if (st !== o.st) { o.st = st; o.ph = 0; }
    o.ph += S.w * dt / (2 * Math.PI);
    var cy = P.ruleCycle(o.ph, o.N);
    function c2cAt(pos) { return o.C0 - pos * st; }
    function edge(pos) { return { x0: -180, x1: 180, y: o.YB + c2cAt(pos) + 26 }; }
    var c2c = c2cAt(cy.pos), s = c2c / 2 / L, co = Math.sqrt(1 - s * s), phi = Math.asin(s), yT = o.YB + c2c, yM = o.YB + c2c / 2;
    o.top.position.y = yT;
    o.bar.position.set(L * (co - o.cos0), yM, 0);
    for (i = 0; i < 2; i++) {
      var tx = o.TX[i], ex = tx + L * co;
      o.up[i].position.set(tx, yT, 6.7); o.up[i].rotation.z = -phi;
      o.lo[i].position.set(ex, yM, 9.7); o.lo[i].rotation.z = phi - Math.PI;
      o.pt[i].position.set(tx, yT, 8.95);
      o.pe[i].position.set(ex, yM, 8.2); o.he[i].position.set(ex, yM, 11.95);
      o.pb[i].position.set(tx, o.YB, 6.7); o.hb[i].position.set(tx, o.YB, 11.95);
    }
    P.ruleDraw({ n: o.N, cyc: cy, edge: edge, lines: o.lines, pen: o.pen, out: 1 });
    S.set("g", Math.round(c2c - 58) + " mm");
    S.set("n", Math.min(o.N, cy.k < 0 ? cy.lines : cy.k + (cy.frac > .98 ? 1 : 0)) + " of " + o.N);
  }
});
