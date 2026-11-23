M507.define({
  number: 335,
  title: "Beam engine parallel motion",
  lede: "The end of a rocking beam moves along a curve, but a piston rod must go straight up and down. This set of links joins the two. It turns the curve into a line that is very nearly straight.",
  alt: "The end of a rocking beam with two short links hanging from it and a bar joining their lower ends. A long rod runs from a fixed pin on the left to the back corner. The piston rod hangs from the front corner into a see-through cylinder.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam", note: "A heavy bar that rocks on a pin near its middle. Its end swings along a curve, not a straight line." },
    { key: "links", color: "#D9B13B", name: "Parallel links", note: "Two links hang from the beam and a short bar joins their lower ends. With the beam they make a box whose opposite sides always stay parallel." },
    { key: "radius", color: "#8E7AA8", name: "Radius rod", note: "A rod that swings on a fixed pin. It holds the back corner of the box, so that corner cannot follow the beam's curve." },
    { key: "rod", color: "#C8873A", name: "Piston rod", note: "Pinned to the front corner of the box and joined to the piston. Watch its red trace stay straight." }
  ],
  controls: [{ type: "range", id: "swing", label: "Beam swing", min: 6, max: 25, step: 1, value: 20, unit: "°",
    presets: [[10, "Short"], [20, "Usual"], [25, "Long"]] }],
  readouts: [{ id: "beam", label: "Beam" }, { id: "off", label: "Off line" }, { id: "worst", label: "Worst" }],
  closed: { label: "Cylinder" },
  views: { "3d": [403, 124, 683], front: [0, -10, 680], side: [680, -10, 0] },
  target: [0, -10, 0],
  how: [
    "Watch the end of the beam. It swings up and down along part of a circle, and its grey trace bends. Now watch the red piston rod. Its trace is a straight line.",
    "Look at the back link, the one nearer the middle of the beam. Its top is carried along the beam's curve, which bends one way. Its bottom is held by the radius rod, whose curve bends the other way. A point part way down that link moves almost straight. The box of links copies that point's motion onto the piston rod, only larger.",
    "No set of rods can make a perfectly straight line this way. The Off line reading shows how far the rod strays sideways, in millimetres. Try a short swing, then a long one, and compare the worst error. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the end of the beam and the links. The rest of the beam's half, its pillar, the post for the fixed pin, the cylinder and the floor were added so it stands up. The links are drawn on the front of the beam only; real engines had a pair, one on each side. Lengths were measured from the drawing, then the back link was moved a little so the line comes out as straight as it can. The beam is rocked steadily, as a crank and flywheel would rock it.",

  // Units: cm. Beam centre O, beam end E (length L), back link on the beam at b from O, both links h long.
  // The radius rod runs from the fixed pin F to the bottom of the back link. Measured from the engraving, then b tuned.
  G: { O: [115, 114], L: 161, b: 98.5, h: 55, F: [-137.5, 59], rodLen: 170 },

  // Exact solve for beam angle be (positive lifts the beam end): the bottom of the back link is where a circle of
  // radius h about its top meets a circle of radius r about F; the front corner D completes the parallelogram.
  kin: function (be) {
    var g = this.G, P = this.P, O = g.O, c = Math.cos(be), s = Math.sin(be), r = this.r;
    var E = [O[0] - g.L * c, O[1] + g.L * s], B = [O[0] - g.b * c, O[1] + g.b * s];
    var C = P.meet(B[0], B[1], g.h, g.F[0], g.F[1], r, 1);                      // the meeting point below the beam
    return { E: E, B: B, C: C, D: [E[0] + C[0] - B[0], E[1] + C[1] - B[1]] };
  },
  setup: function (P) {                                                            // radius rod length from the drawn pose
    var g = this.G; this.P = P;
    this.r = Math.hypot(g.O[0] - g.b - g.F[0], g.O[1] - g.h - g.F[1]);
    this.x0 = this.kin(0).D[0];                                                    // cylinder axis: under the rod at mid-stroke
  },
  worst: function (deg) {
    var w = 0, a = deg * Math.PI / 180;
    for (var i = 0; i <= 200; i++) w = Math.max(w, Math.abs(this.kin(a * Math.sin(Math.PI * (i / 100 - .5))).D[0] - this.x0));
    return w;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, g = this.G, o = this.o = { ph: 0, amp: -1 }, fx = c.fixed;
    this.setup(P);
    var X0 = this.x0, BASE = -190;
    function annulus(rIn, rOut, y0, y1, m) { return P.mesh(new T.LatheGeometry([new T.Vector2(rIn, y0), new T.Vector2(rOut, y0), new T.Vector2(rOut, y1), new T.Vector2(rIn, y1), new T.Vector2(rIn, y0)], 64), m); }

    // floor: y -202..-190, x -160..150, z -45..45
    P.at(P.box(310, 12, 90, fx), -5, -196, 0, c.scene);
    // cylinder on the floor, axis x = X0: bottom cover y -190..-186, wall y -189.5..-30.5 (r 32..34), top cover -36..-30 (r 4..33, set into the wall), gland -30..-22
    c.shell(P.at(P.cylY(34, 4, fx), X0, -188, 0, c.scene));
    c.shell(P.at(annulus(32, 34, -189.5, -30.5, fx), X0, 0, 0, c.scene));
    c.shell(P.at(annulus(4, 33, -36, -30, fx), X0, 0, 0, c.scene));
    c.shell(P.at(annulus(4, 10, -30, -22, fx), X0, 0, 0, c.scene));
    // beam pillar: bearing z -20..-8, foot on the floor top (drop = 114 + 190)
    P.at(P.bearingBlock({ bore: 8.5, outer: 17, post: 26, width: 12, drop: g.O[1] - BASE, material: fx }), g.O[0], g.O[1], -14, c.scene);
    // post for the radius rod's fixed pin: bearing z 26..36, foot on the floor top
    P.at(P.bearingBlock({ bore: 3.8, outer: 9, post: 14, width: 10, drop: g.F[1] - BASE, material: fx }), g.F[0], g.F[1], 31, c.scene);
    P.at(P.cylZ(3.5, 18, c.mat("radius", "dark")), g.F[0], g.F[1], 27, c.scene);       // fixed pin z 18..36, ends at the post's back face

    // beam: plate z -6..6 from O towards E, boss and gudgeon (z -20..9, ends at the pillar's back face)
    o.beam = new T.Group(); P.at(o.beam, g.O[0], g.O[1], 0, c.scene);
    o.beam.add(P.armPlate({ length: g.L, r0: 26, r1: 11, thick: 12, material: c.mat("beam") }));
    P.at(P.cylZ(8, 29, c.mat("beam", "dark")), 0, 0, -5.5, o.beam);
    P.at(P.box(g.L - 40, 2, 1, c.mat("beam", "dark")), (g.L + 10) / 2, 0, 7, o.beam);     // centre stripe z 6.5..7.5, lifted 0.5 off the front face
    P.at(P.cylZ(3.5, 20, c.mat("links", "dark")), g.L, 0, 3, o.beam);                       // beam-end pin z -7..13
    P.at(P.cylZ(3.5, 20, c.mat("links", "dark")), g.b, 0, 3, o.beam);                       // back-link pin z -7..13

    function link(len, r, key, z, th) { var m = P.armPlate({ length: len, r0: r, thick: th, material: c.mat(key) }); m.position.z = z; c.scene.add(m); return m; }
    o.l1 = link(g.h, 5, "links", 10, 4);                          // front hanging link z 8..12
    o.l2 = link(g.h, 5, "links", 10, 4);                          // back hanging link z 8..12
    o.bar = link(g.L - g.b, 5, "links", 16, 4);                   // parallel bar z 14..18
    o.rad = link(this.r, 5, "radius", 22, 4);                     // radius rod z 20..24
    o.pinC = P.at(P.cylZ(3.2, 18, c.mat("links", "dark")), 0, 0, 16, c.scene);   // z 7..25

    // piston rod: crosshead block z -5..5 on the front corner, pin z -5..19, rod down to the piston
    o.rod = new T.Group(); c.scene.add(o.rod);
    P.at(P.box(10, 10, 10, c.mat("rod")), 0, 0, 0, o.rod);
    P.at(P.cylZ(3.2, 24, c.mat("rod", "dark")), 0, 0, 7.5, o.rod);
    P.at(P.cylY(3, g.rodLen - 9, c.mat("rod")), 0, -5 - (g.rodLen - 9) / 2, 0, o.rod);   // y -5..-(rodLen-4)
    P.at(P.cylY(30, 8, c.mat("rod")), 0, -g.rodLen, 0, o.rod);                       // piston, r 30 in a bore of 32

    o.tEnd = P.trail({ color: 0x8A94A0, max: 300 }); c.scene.add(o.tEnd);
    o.tRod = P.trail({ color: 0xC2503F, max: 300 }); c.scene.add(o.tRod);
  },

  step: function (c, dt, S) {
    var o = this.o, amp = +S.controls.swing;
    if (amp !== o.amp) { o.amp = amp; o.worst = this.worst(amp) * 10; o.tEnd.clear(); o.tRod.clear(); }
    o.ph += S.w * dt;
    var be = amp * Math.PI / 180 * Math.sin(o.ph), k = this.kin(be), g = this.G;
    function place(m, a, b) { m.position.x = a[0]; m.position.y = a[1]; m.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); }
    o.beam.rotation.z = Math.PI - be;
    place(o.l1, k.E, k.D); place(o.l2, k.B, k.C); place(o.bar, k.C, k.D); place(o.rad, g.F, k.C);
    o.pinC.position.x = k.C[0]; o.pinC.position.y = k.C[1];
    o.rod.position.set(k.D[0], k.D[1], 0);
    o.tEnd.push(k.E[0], k.E[1], 14); o.tRod.push(k.D[0], k.D[1], 26);
    var off = (k.D[0] - this.x0) * 10, deg = be * 180 / Math.PI;
    function sg(v, d) { var t = Math.abs(v).toFixed(d); return (+t === 0 ? "" : v < 0 ? "−" : "+") + t; }
    S.set("beam", sg(deg, 0) + "°");
    S.set("off", sg(off, 1) + " mm");
    S.set("worst", o.worst.toFixed(1) + " mm");
  }
});
