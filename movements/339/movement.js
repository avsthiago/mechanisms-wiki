M507.define({
  number: 339,
  title: "Parallel motion with a sliding end",
  lede: "In an engine with no beam, the piston rod pushes a crank above it. Its top must still go straight up and down. Here one end of a bar slides in a straight slot, and a radius bar holds the bar's middle. The other end of the bar then moves in a perfectly straight line.",
  alt: "An arched see-through engine frame with a crank at the top and a cylinder at the bottom. A yellow bar runs from a green block sliding in a slot on the left to the red piston rod on the right. An orange radius bar joins the middle of the yellow bar to a fixed pin on the frame. A dark line shows the straight path of the piston rod's top.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank and connecting rod", note: "The crank turns at the top of the frame. The connecting rod joins it to the top of the piston rod." },
    { key: "bar", color: "#D9B13B", name: "Sliding bar", note: "One end slides along the slot, the other end is pinned to the top of the piston rod. The radius bar holds its middle." },
    { key: "radius", color: "#8E7AA8", name: "Radius bar", note: "Swings about a fixed pin on the frame. Its length is the same as half the sliding bar." },
    { key: "slide", color: "#4FA58A", name: "Sliding block", note: "Carries the end of the sliding bar along the straight slot on the left." },
    { key: "piston", color: "#C8873A", name: "Piston rod", note: "Goes down into the cylinder. Watch the red pin at its top: the dark line is its path." }
  ],
  controls: [{ type: "range", id: "k", label: "Radius bar length", min: 95, max: 105, step: 1, value: 100, unit: "%",
    presets: [[96, "Shorter"], [100, "As drawn"], [104, "Longer"]] }],
  readouts: [{ id: "off", label: "Off line" }, { id: "y", label: "Piston" }],
  closed: { label: "Cylinder" },
  views: { "3d": [-416, 97, 836], front: [-25, 20, 930], side: [900, 20, 0] },
  target: [-25, 20, 0],
  how: [
    "The sliding block keeps one end of the yellow bar on a straight line across. The radius bar is pinned to the middle of the yellow bar. It is exactly half as long as the yellow bar, and its fixed pin sits on the line of the slot.",
    "So the fixed pin, the sliding end and the piston end are all the same distance from the middle pin. They lie on a circle round it. The slot passes through the fixed pin, so the piston end must stay on the upright line through that pin. It is not nearly straight, but truly straight.",
    "Look at the Off line reading. As drawn, it stays at zero. Try Shorter or Longer. Now the red pin runs to one side of the fixed pin, on a line that is no longer quite straight. The piston rod has to lean to follow it. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame is drawn flat and see-through, and the crank, cylinder and all sizes were made up to fit the drawing. The fixed pin sits a little above the top of the stroke, so the parts never stack on it. The other radius bar lengths were added for comparison.",

  // geometry (model units, read as cm; engraving pixels x 0.8): fixed pin F on the line of the slot, half bar a,
  // crank shaft S, crank radius rc, connecting rod Lc. With the radius bar equal to a, the pin at the piston end
  // stays on the upright through F: from y = F - 88 (crank down) to F - 8 (crank up).
  K: { F: [0, 25], a: 104, S: [0, 228], rc: 40, Lc: 251, rodLen: 135 },

  solve: function (phi, k) {                                 // phi: crank angle from straight up; k: radius bar / half bar
    var K = this.K, a = K.a, F = K.F, pin = [K.S[0] + K.rc * Math.sin(phi), K.S[1] + K.rc * Math.cos(phi)];
    function at(psi) {                                       // psi: radius bar angle below the line of the slot
      var A = [F[0] - k * a * Math.cos(psi), F[1] - k * a * Math.sin(psi)], dy = A[1] - F[1];
      var B = [A[0] - Math.sqrt(a * a - dy * dy), F[1]];
      return { A: A, B: B, C: [2 * A[0] - B[0], 2 * A[1] - B[1]] };
    }
    var lo = -0.3, hi = 0.9, i, m, s;                       // the piston end goes down as psi grows: find the length that fits
    for (i = 0; i < 50; i++) {
      m = (lo + hi) / 2; s = at(m);
      if (Math.hypot(s.C[0] - pin[0], s.C[1] - pin[1]) < K.Lc) lo = m; else hi = m;
    }
    s = at((lo + hi) / 2); s.pin = pin; s.psi = (lo + hi) / 2;
    return s;
  },
  probe: function () { return this.o.last; },                // for the node test

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { ph: Math.PI, k: null, y0: K.F[1] - 48 };    // crank down, piston end at the bottom, as drawn
    // flat frame z -20..-14, outline traced from the engraving (pixels mapped to the model); the oval window is a hole
    function m(x, y) { return [(x - 360) * 0.8, (330 - y) * 0.8]; }
    var sh = new T.Shape(), q;
    function mv(f, x, y) { q = m(x, y); sh[f](q[0], q[1]); }
    function qc(cx, cy, x, y) { var a = m(cx, cy), b = m(x, y); sh.quadraticCurveTo(a[0], a[1], b[0], b[1]); }
    mv("moveTo", 40, 268); mv("lineTo", 152, 268); mv("lineTo", 152, 290); mv("lineTo", 262, 290);
    mv("lineTo", 262, 190);
    var cr = m(370, 190); sh.absellipse(cr[0], cr[1], 86.4, 108, Math.PI, 0, true);          // round top of the pillar, from x 262 to 478 px
    mv("lineTo", 505, 600); mv("lineTo", 470, 600); mv("lineTo", 470, 420); qc(470, 335, 370, 335); qc(270, 335, 268, 420);
    mv("lineTo", 268, 600); mv("lineTo", 236, 600); mv("lineTo", 236, 500); qc(150, 385, 40, 352); sh.closePath();
    var hole = new T.Path(), oc = m(367, 188); hole.absellipse(oc[0], oc[1], 52, 60, 0, 2 * Math.PI, true); sh.holes.push(hole);
    var g = new T.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false }); g.translate(0, 0, -20);
    scene.add(P.mesh(g, c.fixed));
    // floor under the frame foot: frame bottom y = (330 - 600) * 0.8 = -216 = floor top; floor y -224..-216
    P.at(P.box(320, 8, 110, c.fixed), 40, -220, 0, scene);          // x -120..200, z -55..55
    // slot guide on the left wing: two rails z -14..-2 on the plate face; slot y 25 +- 8 (rails y 33..41 and 9..17), x -236..-172
    P.at(P.box(64, 8, 12, c.fixed), -204, 37, -8, scene);
    P.at(P.box(64, 8, 12, c.fixed), -204, 13, -8, scene);
    P.at(P.box(8, 32, 12, c.fixed), -240, 25, -8, scene);                       // end stop x -244..-236, y 9..41
    P.at(P.box(64, 15, 0.4, c.mat("slide", "dark")), -204, 25, -13.5, scene);   // dark back of the slot, lifted off the plate face: z -13.7..-13.3
    // crank bearing boss z -14..-5 on the crown, shaft z -5..-1 into the crank arm
    P.at(P.cylZ(16, 9, c.fixed), K.S[0], K.S[1], -9.5, scene);
    o.crank = P.at(P.armPlate({ length: K.rc, r0: 12, r1: 7, thick: 4, material: c.mat("crank") }), K.S[0], K.S[1], -1, scene);  // z -3..1
    P.at(P.cylZ(5, 4, c.mat("crank", "dark")), K.S[0], K.S[1], -3, scene);     // shaft end z -5..-1
    o.crankPin = P.at(P.cylZ(3, 8, c.mat("crank", "dark")), 0, 0, 5, scene);    // z 1..9
    o.conrod = P.at(P.rod(3, c.mat("crank")), 0, 0, 0, scene);                  // plane z 6
    // fixed pin of the radius bar z -14..-4 (from the plate face)
    P.at(P.cylZ(3, 11, c.mat("radius", "dark")), K.F[0], K.F[1], -8.5, scene);
    o.rad = P.at(P.armPlate({ length: K.a, r0: 5, thick: 4, material: c.mat("radius") }), K.F[0], K.F[1], -6, scene);   // z -8..-4
    o.bar = P.at(P.armPlate({ length: 2 * K.a, r0: 7, thick: 4, material: c.mat("bar") }), 0, 0, 0, scene);              // z -2..2
    o.pinA = P.at(P.cylZ(3, 12, c.mat("bar", "dark")), 0, 0, -2.5, scene);        // z -8..2
    o.pinB = P.at(P.cylZ(3, 13, c.mat("slide", "dark")), 0, 0, -3.5, scene);      // z -10..2
    o.block = P.at(P.box(24, 15, 9, c.mat("slide")), 0, K.F[1], -7.5, scene);   // x B +- 12, y 17.5..32.5 between the rails, z -12..-3
    o.pinC = P.at(P.cylZ(3.5, 12, c.mat("piston", "mark")), 0, 0, 3, scene);    // z -3..9, the red point to follow
    // cylinder in the arch of the frame, axis on the line of the stroke: top y -100, bottom -216 (floor top), inside -213..-103
    c.shell(P.at(P.steamCylinder({ radius: 40, length: 116, wall: 3, hole: 8, material: c.fixed }), 0, -100, 6, scene));
    o.rod = P.at(P.rod(3, c.mat("piston")), 0, 0, 0, scene);
    o.pist = P.at(P.cylY(36.5, 10, c.mat("piston")), 0, 0, 6, scene);
    o.trace = P.trail({ color: c.ink, max: 500 }); scene.add(o.trace);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, k = +S.controls.k / 100;
    if (o.k !== k) { o.k = k; o.trace.clear(); }
    o.ph += S.w * dt;
    var s = this.solve(o.ph, k), A = s.A, B = s.B, C = s.C, pin = s.pin;
    o.crank.rotation.z = Math.atan2(pin[1] - K.S[1], pin[0] - K.S[0]);
    o.crankPin.position.set(pin[0], pin[1], 5); o.conrod.span(pin[0], pin[1], 6, C[0], C[1], 6);
    o.rad.rotation.z = Math.atan2(A[1] - K.F[1], A[0] - K.F[0]);
    o.bar.position.set(B[0], B[1], 0); o.bar.rotation.z = Math.atan2(C[1] - B[1], C[0] - B[0]);
    o.pinA.position.set(A[0], A[1], -3); o.pinB.position.set(B[0], B[1], -4); o.block.position.x = B[0]; o.pinC.position.set(C[0], C[1], 3);
    var py = C[1] - K.rodLen;                                  // the piston keeps to the bore, so the rod leans if the pin wanders
    o.pist.position.y = py; o.rod.span(C[0], C[1], 6, 0, py, 6);
    o.trace.push(C[0], C[1], 14);                               // path of the red pin, drawn in front of the rods
    o.last = { A: A, B: B, C: C, pin: pin, py: py, psi: s.psi };
    var off = C[0] * 10;
    S.set("off", (Math.abs(off) < 0.05 ? "0.0" : off.toFixed(Math.abs(off) < 10 ? 1 : 0)) + " mm");
    S.set("y", Math.round(C[1] - o.y0) + " cm");
  }
});
