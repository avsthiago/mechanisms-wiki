M507.define({
  number: 332,
  title: "Side-lever parallel motion",
  lede: "In a side-lever engine a long lever rocks low down beside the cylinder, and a side rod joins its end to the top of the piston rod. The lever end swings along a curve, yet the piston rod must move in a straight line. A few light rods keep it straight.",
  alt: "A long lever rocking on a shaft at the bottom left. A side rod rises from its end to a cross-head on top of the piston rod, which comes out of a see-through cylinder. An upright rod stands on the lever, a short bar joins its top to the cross-head, and a radius bar holds its middle from a fixed pin on the right.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Side lever", note: "A long lever that rocks on a shaft low down. Its far end swings along a curve." },
    { key: "side", color: "#4FA58A", name: "Side rod", note: "Joins the end of the lever to the cross-head at the top of the piston rod. It carries the push between the piston and the lever." },
    { key: "links", color: "#D9B13B", name: "Parallel links", note: "An upright rod stands on the lever, and a bar joins its top to the cross-head. With the side rod and the lever they make a box whose opposite sides stay parallel." },
    { key: "radius", color: "#8E7AA8", name: "Radius bar", note: "Swings on a fixed pin and holds the middle of the upright rod, so that point cannot follow the lever's curve." },
    { key: "rod", color: "#C8873A", name: "Piston rod", note: "Carries a cross-piece at its top, called a cross-head. Watch its red trace stay straight." }
  ],
  controls: [{ type: "range", id: "swing", label: "Lever swing", min: 4, max: 18, step: 1, value: 12, unit: "°",
    presets: [[6, "Short"], [12, "Usual"], [18, "Long"]] }],
  readouts: [{ id: "lever", label: "Lever" }, { id: "off", label: "Off line" }, { id: "worst", label: "Worst" }],
  closed: { label: "Cylinder" },
  views: { "3d": [418, 132, 700], front: [0, 0, 700], side: [700, 0, 40] },
  target: [0, 0, 40],
  how: [
    "Watch the end of the lever. It swings along part of a circle, and its grey trace bends. The cross-head at the top of the piston rod hangs on that end through the side rod, yet its red trace is a straight line.",
    "The upright rod is moved at its foot by the lever, whose curve bends one way. Near its middle it is held by the radius bar, whose curve bends the other way. A point between them moves almost straight. The box of rods copies that point's motion to the cross-head, only larger.",
    "The Off line reading shows how far the rod strays sideways, in millimetres. It stays tiny. Try a short swing, then a long one, and watch the worst error grow. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows one lever and one set of rods; a real engine has a pair, one each side of the cylinder. The shaft bearing, the post for the fixed pin, the stand under the cylinder and the floor were added. The cylinder is made a little deeper than drawn so the piston has room. The fixed pin was moved a little from where Brown drew it, so the line comes out as straight as it can. The lever is rocked steadily, as the engine's crank would rock it.",

  // Units: cm. Lever shaft O; the upright rod stands on the lever at b, the side rod at the lever end L.
  // The upright rod is gd long; the radius bar holds it at gc from its foot and swings on the fixed pin F.
  G: { O: [-100, -92.5], b: 82.5, L: 172.5, gc: 157.5, gd: 208.5, F: [125, 65], rodLen: 165 },

  // Exact solve for lever angle a (positive lifts the end): the radius bar's pin C is where a circle of radius gc
  // about the rod's foot meets a circle of radius r about F (the point above); D lies on the same rod, and the
  // cross-head E completes the parallelogram with the side rod.
  kin: function (a) {
    var g = this.G, O = g.O, c = Math.cos(a), s = Math.sin(a);
    var Gp = [O[0] + g.b * c, O[1] + g.b * s], Le = [O[0] + g.L * c, O[1] + g.L * s];
    var C = this.P.meet(Gp[0], Gp[1], g.gc, g.F[0], g.F[1], this.r, 1), k = g.gd / g.gc;
    var D = [Gp[0] + (C[0] - Gp[0]) * k, Gp[1] + (C[1] - Gp[1]) * k];
    return { G: Gp, Le: Le, C: C, D: D, E: [D[0] + Le[0] - Gp[0], D[1] + Le[1] - Gp[1]] };
  },
  setup: function (P) {
    var g = this.G; this.P = P;
    this.r = Math.hypot(g.F[0] - g.O[0] - g.b, g.F[1] - g.O[1] - g.gc);     // radius bar level in the drawn (middle) pose
    this.x0 = this.kin(0).E[0];                                              // cylinder axis: under the cross-head at mid-stroke
  },
  worst: function (deg) {
    var w = 0, a = deg * Math.PI / 180;
    for (var i = 0; i <= 200; i++) w = Math.max(w, Math.abs(this.kin(a * Math.sin(Math.PI * (i / 100 - .5))).E[0] - this.x0));
    return w;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, g = this.G, o = this.o = { ph: 0, amp: -1 }, fx = c.fixed;
    this.setup(P);
    var X0 = this.x0, BASE = -165;
    function annulus(rIn, rOut, y0, y1, m) { return P.mesh(new T.LatheGeometry([new T.Vector2(rIn, y0), new T.Vector2(rOut, y0), new T.Vector2(rOut, y1), new T.Vector2(rIn, y1), new T.Vector2(rIn, y0)], 64), m); }

    // floor: y -177..-165, x -165..160, z -70..110
    P.at(P.box(325, 12, 180, fx), -2.5, -171, 20, c.scene);
    // stand under the cylinder: y -165..-111, x X0 +- 50, z +-50
    P.at(P.box(100, 54, 100, fx), X0, -138, 0, c.scene);
    // cylinder, axis x = X0, z 0: bottom cover -111..-107, wall -110.5..14 (r 45..47.5), cover plate 14..25 (r 3.6..59.5), gland 25..33
    c.shell(P.at(P.cylY(47.5, 4, fx), X0, -109, 0, c.scene));
    c.shell(P.at(annulus(45, 47.5, -110.5, 14, fx), X0, 0, 0, c.scene));
    c.shell(P.at(annulus(3.6, 59.5, 14, 25, fx), X0, 0, 0, c.scene));
    c.shell(P.at(annulus(3.6, 9, 25, 33, fx), X0, 0, 0, c.scene));
    // lever shaft bearing: z 50..62, foot on the floor top (drop 72.5); post for the fixed pin: z 89..99, foot on the floor top
    P.at(P.bearingBlock({ bore: 9.5, outer: 19, post: 30, width: 12, drop: g.O[1] - BASE, material: fx }), g.O[0], g.O[1], 56, c.scene);
    P.at(P.bearingBlock({ bore: 3.8, outer: 9, post: 14, width: 10, drop: g.F[1] - BASE, material: fx }), g.F[0], g.F[1], 94, c.scene);
    P.at(P.cylZ(3.5, 17, c.mat("radius", "dark")), g.F[0], g.F[1], 90.5, c.scene);          // fixed pin z 83..99, ends at the post's back face

    // side lever: plate z 65..75, bosses z 64..76, shaft z 50..77 (starts at the bearing's back face)
    o.lever = new T.Group(); P.at(o.lever, g.O[0], g.O[1], 0, c.scene);
    o.lever.add(P.outlinePlate({ points: [[-42, -23], [g.L, -11], [g.L, 11], [-42, 27]], depth: 10, z0: 65, material: c.mat("lever") }));
    P.at(P.cylZ(25, 12, c.mat("lever")), 0, 0, 70, o.lever);
    P.at(P.cylZ(13, 12, c.mat("lever")), g.L, 0, 70, o.lever);
    P.at(P.cylZ(9, 27, c.mat("lever", "dark")), 0, 0, 63.5, o.lever);
    P.at(P.box(4, 1, 1, c.mat("lever", "dark")), 0, 17, 76.5, o.lever);                 // mark on the boss face z 76..77, lifted 0.5
    P.at(P.cylZ(3.5, 19, c.mat("links", "dark")), g.b, 0, 72.5, o.lever);                // foot pin of the upright rod z 64..82
    P.at(P.cylZ(3.5, 19, c.mat("side", "dark")), g.L, 0, 72.5, o.lever);                 // side rod pin z 64..82

    function link(len, r, key, z) { var m = P.armPlate({ length: len, r0: r, thick: 4, material: c.mat(key) }); m.position.z = z; c.scene.add(m); return m; }
    o.side = link(g.gd, 6, "side", 79);                      // side rod z 77..81
    o.up = link(g.gd, 5, "links", 79);                       // upright rod z 77..81
    o.bar = link(g.L - g.b, 5, "links", 85);                 // parallel bar z 83..87
    o.rad = link(this.r, 5, "radius", 85);                   // radius bar z 83..87
    o.pinC = P.at(P.cylZ(3.2, 12, c.mat("radius", "dark")), 0, 0, 82, c.scene);   // z 76..88
    o.pinD = P.at(P.cylZ(3.2, 12, c.mat("links", "dark")), 0, 0, 82, c.scene);    // z 76..88

    // cross-head and piston rod: cross-head z -6..76, pin z 76..88, rod down from the cross-head to the piston
    o.rod = new T.Group(); c.scene.add(o.rod);
    P.at(P.box(10, 10, 82, c.mat("rod")), 0, 0, 35, o.rod);
    P.at(P.cylZ(3.2, 12, c.mat("rod", "dark")), 0, 0, 82, o.rod);
    P.at(P.cylY(3, g.rodLen - 9, c.mat("rod")), 0, -5 - (g.rodLen - 9) / 2, 0, o.rod);
    P.at(P.cylY(43, 8, c.mat("rod")), 0, -g.rodLen, 0, o.rod);                      // piston, r 43 in a bore of 45

    o.tEnd = P.trail({ color: 0x8A94A0, max: 300 }); c.scene.add(o.tEnd);
    o.tRod = P.trail({ color: 0xC2503F, max: 300 }); c.scene.add(o.tRod);
  },

  step: function (c, dt, S) {
    var o = this.o, amp = +S.controls.swing, g = this.G;
    if (amp !== o.amp) { o.amp = amp; o.worst = this.worst(amp) * 10; o.tEnd.clear(); o.tRod.clear(); }
    o.ph += S.w * dt;
    var a = amp * Math.PI / 180 * Math.sin(o.ph), k = this.kin(a);
    function place(m, p, q) { m.position.x = p[0]; m.position.y = p[1]; m.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]); }
    o.lever.rotation.z = a;
    place(o.side, k.Le, k.E); place(o.up, k.G, k.D); place(o.bar, k.D, k.E); place(o.rad, g.F, k.C);
    o.pinC.position.x = k.C[0]; o.pinC.position.y = k.C[1]; o.pinD.position.x = k.D[0]; o.pinD.position.y = k.D[1];
    o.rod.position.set(k.E[0], k.E[1], 0);
    o.tEnd.push(k.Le[0], k.Le[1], 90); o.tRod.push(k.E[0], k.E[1], 90);
    var off = (k.E[0] - this.x0) * 10;
    function sg(v, d) { var t = Math.abs(v).toFixed(d); return (+t === 0 ? "" : v < 0 ? "−" : "+") + t; }
    S.set("lever", sg(a * 180 / Math.PI, 0) + "°");
    S.set("off", sg(off, 2) + " mm");
    S.set("worst", o.worst.toFixed(2) + " mm");
  }
});
