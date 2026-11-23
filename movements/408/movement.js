M507.define({
  number: 408,
  title: "Centrolinead",
  lede: "A long blade has two flat legs fixed to its end at a set angle. The legs rest against two pins on the paper. However the tool is moved, the blade keeps pointing at one far-off spot that is off the page. A pencil along the blade draws lines that all meet at that spot.",
  alt: "Seen from above: a long flat blade ending in a round disc, with two flat legs fanning out from the disc to the upper left and lower left. Two pins on the paper touch the inner edges of the legs. A fan of pencil lines is drawn along the blade.",
  parts: [
    { key: "blade", color: "#5E7387", name: "Blade and disc", note: "The long ruler with a round end. Its top edge is the drawing edge. It lines up exactly with the centre of the disc." },
    { key: "legs", color: "#C8873A", name: "Two legs", note: "Flat arms fixed to the disc at a set angle. Their inner edges also line up with the centre of the disc." },
    { key: "pins", color: "#4FA58A", name: "Two pins", note: "Stuck into the paper. The inner edges of the legs press against them, so the disc can only move on one curved path." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Draws along the top edge of the blade. Watch the red lines. If they were longer, they would all cross at one point." }
  ],
  controls: [{ type: "range", id: "d", label: "Pins from the joint", min: 70, max: 115, step: 5, value: 95, unit: " mm", presets: [[70, "Near"], [95, "Medium"], [115, "Far"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "a", label: "Blade turned" }, { id: "n", label: "Lines" }, { id: "f", label: "Meeting point" }],
  views: { "3d": [60, -140, 700], front: [60, 10, 800], side: [700, 10, 330] },
  target: [60, 10, 0],
  distance: [300, 1600],
  how: [
    "The legs are fixed to the disc, and their inner edges press on the two pins. This leaves the tool only one way to move. It slides along a curved path while it turns.",
    "As it moves, the blade turns just enough to keep pointing at the same spot. That spot is far off to the left, beyond the edge of the paper. Each line the pencil draws is part of a line that runs through it, so the lines fan out from there.",
    "The pins set where that spot is. Try the pins near the joint, then far from it, and see how the lines fan out more or less."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the blade, disc, legs and clamp knobs; the curved slots and knobs are left out and the legs are fixed. The paper, the two pins and the pencil were added to show how it works. In the drawing the pins are a diagram only. The sizes are made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, i, o = this.o = { N: 5, B: 114 * Math.PI / 180, r: 3, R: 34, BL: 240, LG: 190, W: 18, ph: 0, d: null, psiMax: 14 * Math.PI / 180 };
    var B = o.B, R = o.R, a;
    P.at(P.box(420, 420, 2, c.fixed), 60, 15, -1, c.scene);                                              // paper: x -150..270, y -195..225, z -2..0
    // blade with round end and a V cut between the legs; the cut edges lie along the legs' inner edges
    var pts = [[0, 0], [R * Math.cos(B), R * Math.sin(B)]], al = Math.asin(o.W / R);
    for (a = B - .12; a > 0; a -= .12) pts.push([R * Math.cos(a), R * Math.sin(a)]);
    pts.push([R, 0], [o.BL, 0], [o.BL, -o.W], [R * Math.cos(al), -o.W]);
    for (a = -al - .12; a > -B; a -= .12) pts.push([R * Math.cos(a), R * Math.sin(a)]);
    pts.push([R * Math.cos(-B), R * Math.sin(-B)]);
    o.inst = new T.Group(); c.scene.add(o.inst);
    o.inst.add(P.rulerPlate({ points: pts, z0: 1.2, depth: 3, material: c.mat("blade") }));               // z 1.2..4.2
    var l1 = new T.Group(), l2 = new T.Group(); l1.rotation.z = B; l2.rotation.z = -B; o.inst.add(l1); o.inst.add(l2);
    l1.add(P.rulerPlate({ points: [[0, 0], [o.LG, 0], [o.LG, -16], [0, -16]], z0: 4.2, depth: 3, material: c.mat("legs") }));   // z 4.2..7.2
    l2.add(P.rulerPlate({ points: [[0, 0], [o.LG, 0], [o.LG, 16], [0, 16]], z0: 4.2, depth: 3, material: c.mat("legs") }));
    P.at(P.cylZ(2.6, 6.3, c.mat("legs", "dark")), 0, 0, 4.85, o.inst);                                    // joint pin, z 1.2..8
    o.pins = [P.at(P.cylZ(o.r, 10, c.mat("pins")), 0, 0, 5, c.scene), P.at(P.cylZ(o.r, 10, c.mat("pins")), 0, 0, 5, c.scene)];   // z 0..10
    o.lines = []; for (i = 0; i < o.N; i++) o.lines.push(P.at(P.box(1, 1.6, .3, c.mat("pencil", "dark")), 0, 0, .45, c.scene));   // z .3..0.6
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 0, o.inst);
  },

  // where the joint sits when the blade is turned by psi, with both legs touching their pins
  joint: function (psi) {
    var o = this.o, B = o.B, r = o.r, a = psi + B, b = psi - B, n1 = [-Math.sin(a), Math.cos(a)], n2 = [Math.sin(b), -Math.cos(b)];
    var r1 = o.C1[0] * n1[0] + o.C1[1] * n1[1] - r, r2 = o.C2[0] * n2[0] + o.C2[1] * n2[1] - r, det = n1[0] * n2[1] - n1[1] * n2[0];
    return [(r1 * n2[1] - r2 * n1[1]) / det, (n1[0] * r2 - n2[0] * r1) / det];
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, d = +S.controls.d, B = o.B, r = o.r, i, N = o.N;
    if (d !== o.d) {
      o.d = d; o.ph = 0;
      var u1 = [Math.cos(B), Math.sin(B)], u2 = [Math.cos(-B), Math.sin(-B)];
      o.C1 = [d * u1[0] - r * u1[1], d * u1[1] + r * u1[0]]; o.C2 = [d * u2[0] + r * u2[1], d * u2[1] - r * u2[0]];
      o.pins[0].position.set(o.C1[0], o.C1[1], 5); o.pins[1].position.set(o.C2[0], o.C2[1], 5);
      o.far = 2 * d * Math.sin(B) / Math.sin(2 * Math.PI - 2 * B);
    }
    o.ph += S.w * dt / (2 * Math.PI);
    var cy = P.ruleCycle(o.ph, N), xFar = o.BL - 8, xNear = o.R + 8;
    function psiAt(pos) { return pos / (N - 1) * o.psiMax; }
    var self = this;
    for (i = 0; i < N; i++) {
      var ln = o.lines[i], full = i < cy.k || (cy.k < 0 && i < cy.lines), part = i === cy.k, f = full ? 1 : part ? cy.pen : 0;
      if (f <= 0) { ln.visible = false; continue; }
      var ps = psiAt(i), jp = self.joint(ps), c0 = Math.cos(ps), s0 = Math.sin(ps), xa = xFar, xb = xFar - f * (xFar - xNear);
      var yo = 1.2, ax = jp[0] + c0 * xa - s0 * yo, ay = jp[1] + s0 * xa + c0 * yo, bx = jp[0] + c0 * xb - s0 * yo, by = jp[1] + s0 * xb + c0 * yo;
      ln.visible = true; ln.scale.x = Math.max(.01, xa - xb); ln.position.set((ax + bx) / 2, (ay + by) / 2, .45); ln.rotation.z = ps;
    }
    var psi = psiAt(cy.pos), j = this.joint(psi);
    o.inst.position.set(j[0], j[1], 0); o.inst.rotation.z = psi;
    o.pen.place(xFar - cy.pen * (xFar - xNear), 1.2, .9 + 9 * cy.air, 1);
    S.set("a", Math.round(psi * 180 / Math.PI) + "°");
    S.set("n", Math.min(N, cy.k < 0 ? cy.lines : cy.k + (cy.frac > .98 ? 1 : 0)) + " of " + N);
    S.set("f", Math.round(o.far) + " mm");
  }
});
