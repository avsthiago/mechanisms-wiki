M507.define({
  number: 336,
  title: "Marine parallel motion with rock-shaft",
  lede: "In a side-lever engine a long lever rocks low down, and a side rod joins its end to the top of the piston rod. The lever end swings along a curve, but the piston rod must move straight. Here the rods that keep it straight hang from short arms on a rocking shaft above the cylinder.",
  alt: "A long lever rocking on a shaft at the bottom left. A side rod rises from its end to the cross-head on top of the piston rod, which comes out of a see-through cylinder. An upright rod stands on the lever; its top is held by a short arm on a shaft in a fixed bearing, and a slanting rod joins it to the cross-head.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Side lever", note: "A long lever that rocks on a shaft low down. Its far end swings along a curve." },
    { key: "side", color: "#4FA58A", name: "Side rod", note: "Joins the end of the lever to the cross-head at the top of the piston rod. It carries the push between the piston and the lever." },
    { key: "links", color: "#D9B13B", name: "Parallel rods", note: "An upright rod stands on the lever, and a slanting rod joins its top to the cross-head. With the side rod and the lever they make a box whose opposite sides stay parallel." },
    { key: "radius", color: "#8E7AA8", name: "Rock-shaft and arm", note: "A short arm fixed on a shaft that rocks in a fixed bearing. It holds the top of the upright rod on a short curve of its own." },
    { key: "rod", color: "#C8873A", name: "Piston rod", note: "Carries a cross-piece at its top, called a cross-head. Watch its red trace stay straight." }
  ],
  controls: [{ type: "range", id: "swing", label: "Lever swing", min: 3, max: 13, step: 1, value: 10, unit: "°",
    presets: [[4, "Short"], [10, "Usual"], [13, "Long"]] }],
  readouts: [{ id: "lever", label: "Lever" }, { id: "off", label: "Off line" }, { id: "worst", label: "Worst" }],
  closed: { label: "Cylinder" },
  views: { "3d": [413, 138, 718], front: [0, 0, 760], side: [760, 0, 40] },
  target: [0, 0, 40],
  how: [
    "Watch the end of the lever. It swings along part of a circle, and its grey trace bends. The cross-head on the piston rod hangs on that end through the side rod, yet its red trace is a straight line.",
    "The upright rod is moved at its foot by the lever, whose curve bends one way. Its top is held by the short arm, whose curve bends the other way. A point low on the upright rod moves almost straight. The box of rods copies that point's motion to the cross-head, only larger.",
    "The Off line reading shows how far the rod strays sideways, in millimetres. A short arm makes a quick curve, so the error grows fast with a long swing. Try a short swing, then a long one, and compare the worst error. Choose Closed to see the cylinder and valve box as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows one lever and one set of rods; a real engine has a pair, one each side of the cylinder, with the arms on the two ends of the one rock-shaft. The heavy framing at the top left of the drawing is left out. The pillar for the rock-shaft stands on the valve box beside the cylinder. The shaft bearing, the stand under the cylinder and the floor were added. The rock-shaft was moved a little to the right of where Brown drew it, which makes the arm a little longer, so the line comes out straighter. The drawing shows the lever at the bottom of its swing. It is rocked steadily, as the engine's crank would rock it.",

  // Units: cm. Lever shaft O; the upright rod stands on the lever at b, the side rod at the lever end L. The rod is
  // gk long and its top K is held by the arm on the rock-shaft F. A0 is the drawn (lowest) lever angle, AM the middle.
  G: { O: [-112.5, -82.5], b: 78.5, L: 197, gk: 205, F: [4, 122], A0: -12.6, AM: -2.6, rodLen: 150 },

  // Exact solve for lever angle a: the arm's pin K is where a circle of radius gk about the rod's foot meets a
  // circle of radius r about F (the point above); the cross-head E completes the parallelogram with the side rod.
  kin: function (a) {
    var g = this.G, O = g.O, c = Math.cos(a), s = Math.sin(a);
    var Gp = [O[0] + g.b * c, O[1] + g.b * s], Le = [O[0] + g.L * c, O[1] + g.L * s];
    var K = this.P.meet(Gp[0], Gp[1], g.gk, g.F[0], g.F[1], this.r, 1);
    return { G: Gp, Le: Le, K: K, E: [K[0] + Le[0] - Gp[0], K[1] + Le[1] - Gp[1]] };
  },
  setup: function (P) {
    var g = this.G, a = g.A0 * Math.PI / 180; this.P = P;
    var Gx = g.O[0] + g.b * Math.cos(a) - 3, Gy = g.O[1] + g.b * Math.sin(a) + g.gk;   // the drawn top of the upright rod
    this.r = Math.hypot(g.F[0] - Gx, g.F[1] - Gy);
    this.x0 = this.kin(g.AM * Math.PI / 180).E[0];                                       // cylinder axis: under the cross-head at mid-stroke
  },
  worst: function (deg) {
    var w = 0, am = this.G.AM * Math.PI / 180, a = deg * Math.PI / 180;
    for (var i = 0; i <= 200; i++) w = Math.max(w, Math.abs(this.kin(am + a * Math.sin(Math.PI * (i / 100 - .5))).E[0] - this.x0));
    return w;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, g = this.G, o = this.o = { ph: -Math.PI / 2, amp: -1 }, fx = c.fixed;
    this.setup(P);
    var X0 = this.x0, BASE = -155;
    function annulus(rIn, rOut, y0, y1, m) { return P.mesh(new T.LatheGeometry([new T.Vector2(rIn, y0), new T.Vector2(rOut, y0), new T.Vector2(rOut, y1), new T.Vector2(rIn, y1), new T.Vector2(rIn, y0)], 64), m); }

    // floor: y -167..-155, x -175..150, z -70..110
    P.at(P.box(325, 12, 180, fx), -12.5, -161, 20, c.scene);
    // stand under the cylinder and valve box: y -155..-117.5, x -35..X0+56, z -56..56
    var sx0 = -35, sx1 = X0 + 56;
    P.at(P.box(sx1 - sx0, 37.5, 112, fx), (sx0 + sx1) / 2, -136.25, 0, c.scene);
    // cylinder, axis x = X0, z 0: bottom cover -117.5..-113.5, wall -117..42 (r 52..54.5), top cover 36.5..42.5 (r 3.6..53.5, set into the wall), gland 42.5..50
    c.shell(P.at(P.cylY(54.5, 4, fx), X0, -115.5, 0, c.scene));
    c.shell(P.at(annulus(52, 54.5, -117, 42, fx), X0, 0, 0, c.scene));
    c.shell(P.at(annulus(3.6, 53.5, 36.5, 42.5, fx), X0, 0, 0, c.scene));
    c.shell(P.at(annulus(3.6, 10, 42.5, 50, fx), X0, 0, 0, c.scene));
    // valve box beside the cylinder: x -35..X0-54.5 (its right face touches the wall), y -117.5..42.5, z -30..30
    var vx1 = X0 - 54.5;
    c.shell(P.at(P.box(vx1 - sx0, 160, 60, fx), (sx0 + vx1) / 2, -37.5, 0, c.scene));
    // pillar for the rock-shaft on the valve box top (y 42.5): bearing z -10..10
    P.at(P.bearingBlock({ bore: 5.4, outer: 11, post: 18, width: 20, drop: g.F[1] - 42.5, material: fx }), g.F[0], g.F[1], 0, c.scene);
    // lever shaft bearing: z 50..62, foot on the floor top
    P.at(P.bearingBlock({ bore: 9.5, outer: 19, post: 30, width: 12, drop: g.O[1] - BASE, material: fx }), g.O[0], g.O[1], 56, c.scene);

    // side lever: plate z 65..75, bosses z 64..76, shaft z 50..77 (starts at the bearing's back face)
    o.lever = new T.Group(); P.at(o.lever, g.O[0], g.O[1], 0, c.scene);
    o.lever.add(P.outlinePlate({ points: [[-30, -26], [g.L, -12], [g.L, 12], [-30, 30]], depth: 10, z0: 65, material: c.mat("lever") }));
    P.at(P.cylZ(25, 12, c.mat("lever")), 0, 0, 70, o.lever);
    P.at(P.cylZ(14, 12, c.mat("lever")), g.L, 0, 70, o.lever);
    P.at(P.cylZ(10, 26.5, c.mat("lever", "dark")), 0, 0, 63.75, o.lever);
    P.at(P.box(4, 1, 1, c.mat("lever", "dark")), 0, 17, 76.5, o.lever);                 // mark on the boss face z 76..77, lifted 0.5
    P.at(P.cylZ(3.5, 19, c.mat("links", "dark")), g.b, 0, 72.5, o.lever);                // foot pin of the upright rod z 64..82
    P.at(P.cylZ(3.5, 19, c.mat("side", "dark")), g.L, 0, 72.5, o.lever);                 // side rod pin z 64..82

    function link(len, r, key, z) { var m = P.armPlate({ length: len, r0: r, thick: 4, material: c.mat(key) }); m.position.z = z; c.scene.add(m); return m; }
    o.side = link(g.gk, 6, "side", 79);                      // side rod z 77..81
    o.up = link(g.gk, 5, "links", 79);                       // upright rod z 77..81
    o.bar = link(g.L - g.b, 5, "links", 85);                 // slanting parallel rod z 83..87
    // rock-shaft z -10..75 through the pillar's bearing, arm z 71..75 (behind the rods, so the shaft never meets them)
    o.arm = new T.Group(); P.at(o.arm, g.F[0], g.F[1], 0, c.scene);
    P.at(P.armPlate({ length: this.r, r0: 9, r1: 5, thick: 4, material: c.mat("radius") }), 0, 0, 73, o.arm);
    P.at(P.cylZ(5, 85, c.mat("radius")), 0, 0, 32.5, o.arm);
    P.at(P.box(5, 1, 30, c.mat("radius", "dark")), 0, 5.5, 40, o.arm);                // stripe on top of the shaft z 25..55, lifted 0.5
    o.pinK = P.at(P.cylZ(3.2, 18, c.mat("links", "dark")), 0, 0, 79, c.scene);         // z 70..88

    // cross-head and piston rod: cross-head z -6..76, pin z 76..88, rod down from the cross-head to the piston
    o.rod = new T.Group(); c.scene.add(o.rod);
    P.at(P.box(10, 10, 82, c.mat("rod")), 0, 0, 35, o.rod);
    P.at(P.cylZ(3.2, 12, c.mat("rod", "dark")), 0, 0, 82, o.rod);
    P.at(P.cylY(3, g.rodLen - 9, c.mat("rod")), 0, -5 - (g.rodLen - 9) / 2, 0, o.rod);
    P.at(P.cylY(50, 8, c.mat("rod")), 0, -g.rodLen, 0, o.rod);                      // piston, r 50 in a bore of 52

    o.tEnd = P.trail({ color: 0x8A94A0, max: 300 }); c.scene.add(o.tEnd);
    o.tRod = P.trail({ color: 0xC2503F, max: 300 }); c.scene.add(o.tRod);
  },

  step: function (c, dt, S) {
    var o = this.o, amp = +S.controls.swing, g = this.G;
    if (amp !== o.amp) { o.amp = amp; o.worst = this.worst(amp) * 10; o.tEnd.clear(); o.tRod.clear(); }
    o.ph += S.w * dt;
    var a = (g.AM + amp * Math.sin(o.ph)) * Math.PI / 180, k = this.kin(a);
    function place(m, p, q) { m.position.x = p[0]; m.position.y = p[1]; m.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]); }
    o.lever.rotation.z = a;
    place(o.side, k.Le, k.E); place(o.up, k.G, k.K); place(o.bar, k.K, k.E);
    o.arm.rotation.z = Math.atan2(k.K[1] - g.F[1], k.K[0] - g.F[0]);
    o.pinK.position.x = k.K[0]; o.pinK.position.y = k.K[1];
    o.rod.position.set(k.E[0], k.E[1], 0);
    o.tEnd.push(k.Le[0], k.Le[1], 96); o.tRod.push(k.E[0], k.E[1], 96);
    var off = (k.E[0] - this.x0) * 10;
    function sg(v, d) { var t = Math.abs(v).toFixed(d); return (+t === 0 ? "" : v < 0 ? "−" : "+") + t; }
    S.set("lever", sg(a * 180 / Math.PI, 0) + "°");
    S.set("off", sg(off, 1) + " mm");
    S.set("worst", o.worst.toFixed(1) + " mm");
  }
});
