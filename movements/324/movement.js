M507.define({
  number: 324,
  title: "Crossed-arm parallel ruler",
  lede: "Two rulers are joined by two arms that cross like a pair of scissors. When the rulers open or close, their edges stay parallel and their ends stay in line. A pencil along the edge draws lines that never meet.",
  alt: "Two long flat rulers one above the other on a sheet of paper, joined by two crossed arms with a pin where they cross. The arms end in pins that slide in a slot on the left of each ruler. A pencil draws lines along the top edge of the upper ruler.",
  parts: [
    { key: "held", color: "#E8E2D0", name: "Lower ruler", note: "Pressed on the paper and kept still. It has a slot near its left end." },
    { key: "moving", color: "#E8E2D0", name: "Upper ruler", note: "Moves straight up and down the page. Its ends stay in line with the lower ruler." },
    { key: "arms", color: "#D9B13B", name: "Crossed arms", note: "Two equal arms with a pin where they cross. One end of each arm is pinned to a ruler. The other end has a pin that slides in a slot." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Draws along the top edge of the upper ruler. Watch the lines pile up." }
  ],
  controls: [{ type: "range", id: "step", label: "Space between lines", min: 6, max: 16, step: 2, value: 12, unit: " mm", presets: [[6, "Close"], [12, "Medium"], [16, "Wide"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "g", label: "Gap" }, { id: "n", label: "Lines" }],
  views: { "3d": [0, -139, 475], front: [0, 5, 780], side: [820, 0, 300] },
  target: [0, 5, 0],
  distance: [300, 1600],
  how: [
    "The two arms are the same length and cross at their middles. When the rulers move apart, the arms open evenly on both sides of the crossing. So the upper ruler goes straight up and never tilts.",
    "The end of each arm that is not pinned slides in a slot. As the arms open they stand more upright, so they reach less far sideways. The pins slide along the slots to allow this.",
    "Try Close spacing, then Wide. Watch the pins slide in the slots while the pencil lines stay parallel."
  ],
  note: "This model is rebuilt from Brown's drawing. The sheet of paper and the pencil were added to show the lines. The slot lengths, the arm lengths and the thicknesses are made up. In real use you hold one ruler and push the other; here the lower one stays still.",

  build: function (c) {
    var P = c.P, o = this.o = { N: 5, H: 153.5, C0: 101, QX: 150, YB: -70, WR: 22, ph: 0, st: null };
    P.at(P.box(430, 260, 2, c.fixed), 0, 5, -1, c.scene);                                       // paper: x -215..215, y -125..135, z -2..0
    function ruler(key) { return P.rulerPlate({ points: [[-180, -22], [180, -22], [180, 22], [-180, 22]], slots: [{ x0: -141, x1: -107, y: 0, w: 8 }], z0: 1.2, depth: 4, material: c.mat(key) }); }   // z 1.2..5.2
    o.lo = P.at(ruler("held"), 0, o.YB, 0, c.scene);
    o.up = P.at(ruler("moving"), 0, o.YB + o.C0, 0, c.scene);
    var m = c.mat("arms");
    o.a1 = P.at(P.armPlate({ length: 2 * o.H, r0: 6, thick: 3, material: m }), 0, 0, 6.7, c.scene);   // z 5.2..8.2, from the slot pin on the upper ruler to the pivot on the lower
    o.a2 = P.at(P.armPlate({ length: 2 * o.H, r0: 6, thick: 3, material: m }), 0, 0, 9.7, c.scene);   // z 8.2..11.2, from the pivot on the upper ruler to the slot pin on the lower
    o.pins = {
      p1: P.at(P.cylZ(3, 3, m), 0, 0, 3.7, c.scene),            // slot pin, z 2.2..5.2, inside the slot (slot is 8 wide)
      q2: P.at(P.cylZ(3, 6, m), 0, 0, 5.2, c.scene),            // slot pin, z 2.2..8.2
      q1: P.at(P.cylZ(3.2, 1, m), 0, 0, 5.2, c.scene),
      p2: P.at(P.cylZ(3.2, 3, m), 0, 0, 6.7, c.scene),          // post under the arm end, z 5.2..8.2
      mid: P.at(P.cylZ(3.2, 6, m), 0, 0, 8.2, c.scene)          // pin through both arms
    };
    o.heads = [8.95, 11.95, 11.95, 8.95, 11.95].map(function (z) { return P.at(P.cylZ(5, 1.5, c.mat("arms", "dark")), 0, 0, z, c.scene); });   // brass heads: arm 1 ends z 8.2..9.7, arm 2 ends and the middle 11.2..12.7
    o.lines = P.at(P.ruledLines(o.N, c.mat("pencil", "dark")), 0, 0, 0, c.scene);
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 9, c.scene);
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, st = +S.controls.step, H = o.H, QX = o.QX, YB = o.YB;
    if (st !== o.st) { o.st = st; o.ph = 0; }
    o.ph += S.w * dt / (2 * Math.PI);
    var cy = P.ruleCycle(o.ph, o.N);
    function edge(pos) { return { x0: -180, x1: 180, y: YB + o.C0 + pos * st + o.WR }; }
    var c2c = o.C0 + cy.pos * st, s = c2c / (2 * H), co = Math.sqrt(1 - s * s), dx = 2 * H * co, yA = YB + c2c;
    o.up.position.y = yA;
    var ang = Math.atan2(-c2c, dx);
    o.a1.position.set(QX - dx, yA, 6.7); o.a1.rotation.z = ang;          // slot pin end at left, pivot end at (QX, YB)
    o.a2.position.set(QX, yA, 9.7); o.a2.rotation.z = Math.atan2(-c2c, -dx);
    var p = o.pins, hd = o.heads;
    p.p1.position.set(QX - dx, yA, 3.7); p.q2.position.set(QX - dx, YB, 5.2); p.q1.position.set(QX, YB, 5.2); p.p2.position.set(QX, yA, 6.7);
    p.mid.position.set(QX - dx / 2, (YB + yA) / 2, 8.2);
    hd[0].position.set(QX - dx, yA, 8.95); hd[1].position.set(QX - dx, YB, 11.95); hd[2].position.set(QX, yA, 11.95); hd[3].position.set(QX, YB, 8.95); hd[4].position.set(QX - dx / 2, (YB + yA) / 2, 11.95);
    P.ruleDraw({ n: o.N, cyc: cy, edge: edge, lines: o.lines, pen: o.pen, out: 1 });
    S.set("g", Math.round(c2c - 2 * o.WR) + " mm");
    S.set("n", Math.min(o.N, cy.k < 0 ? cy.lines : cy.k + (cy.frac > .98 ? 1 : 0)) + " of " + o.N);
  }
});
