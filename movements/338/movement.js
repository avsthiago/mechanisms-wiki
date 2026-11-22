M507.define({
  number: 338,
  title: "Parallel motion with the radius bar above",
  lede: "The end of a rocking beam moves on a curve, but a piston rod must go straight up and down. Here a short rod is pinned to the beam end, and a radius bar above the beam holds its top. The bottom of the short rod then goes up and down almost straight.",
  alt: "A long tapered beam pivoted at the left, its right end tilted down. A short yellow rod is pinned through the beam end. Its top is held by an orange radius bar that slopes up to a fixed pin above the beam. A red piston rod hangs from the bottom of the short rod into a see-through cylinder, and a dark line shows the path of its top.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam", note: "Rocks up and down about its pivot on the left. Its end moves on a curve that bends to the left." },
    { key: "link", color: "#D9B13B", name: "Short rod", note: "Pinned through the end of the beam. Its top is held by the radius bar, and the piston rod hangs from its bottom." },
    { key: "radius", color: "#8E7AA8", name: "Radius bar", note: "Swings about a fixed pin above the beam. It holds the top of the short rod back, so the rod tilts as the beam rocks." },
    { key: "piston", color: "#C8873A", name: "Piston rod", note: "Hangs from the bottom of the short rod and goes down into the cylinder. Watch its top: the dark line is its path." }
  ],
  controls: [{ type: "range", id: "amp", label: "Beam swing", min: 6, max: 20, step: 1, value: 16, unit: "°",
    presets: [[8, "Small"], [16, "As drawn"], [20, "Large"]] }],
  readouts: [{ id: "off", label: "Off line" }, { id: "y", label: "Piston" }],
  closed: { label: "Cylinder" },
  views: { "3d": [300, 20, 760], front: [-10, -50, 840], side: [820, -50, 0] },
  target: [-10, -50, 0],
  how: [
    "The end of the beam swings on a curve. At the top and bottom of its swing it moves to the left, toward the pivot. The short rod goes with it, but the radius bar holds its top on a curve of its own.",
    "The radius bar is shorter than the beam, so its curve is tighter. That tilts the short rod. At the top and bottom of the swing the bottom of the rod swings out to the right. This just makes up for the beam end moving left. So the bottom of the rod goes up and down almost straight, and that is where the piston rod hangs.",
    "The line is only nearly straight. Look at the Off line reading. Try Small, then Large, and watch the dark path open into a thin figure of eight. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The cylinder, the piston, the posts and bearings, the floor and all sizes were made up. The beam is rocked to and fro as if by a crank on its far end, which is left out. The radius bar is set behind the beam so that its fixed pin is clear of the beam. The bottom of the short rod was placed where the line comes out straightest for these lengths.",

  // geometry (model units; read as cm): beam pivot O, beam radius R, short rod from the radius bar pin (top) through the
  // beam pin (l below it) to the piston pin (d below the beam pin). At mid-swing the beam and radius bar lie flat and the
  // short rod hangs straight down. d = l * r / (R - r) is the classic point that goes straightest.
  K: { O: [-180, 40], R: 229, l: 45, r: 114, F: [-65, 85], d: 45 * 114 / 115, rodLen: 182 },

  solve: function (P, th) {                                  // th: beam angle, positive lifts its end
    var K = this.K, E = [K.O[0] + K.R * Math.cos(th), K.O[1] + K.R * Math.sin(th)], U = P.meet(E[0], E[1], K.l, K.F[0], K.F[1], K.r, -1);
    var ux = (E[0] - U[0]) / K.l, uy = (E[1] - U[1]) / K.l;
    return { E: E, U: U, X: [E[0] + ux * K.d, E[1] + uy * K.d] };
  },
  probe: function () { return this.o.last; },                // for the node test

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, mid = this.solve(P, 0);
    var o = this.o = { ph: -Math.PI / 2, amp: null, x0: mid.X[0], y0: mid.X[1] };     // starts at the bottom of the swing, as drawn
    // floor: x -250..130, y -280..-272, z -45..45
    P.at(P.box(380, 8, 90, c.fixed), -60, -276, 0, scene);
    // beam pedestal behind the beam: bearing z -22..-8, foot at y = 40 - 312 = -272 (floor top)
    P.at(P.bearingBlock({ bore: 6.5, outer: 18, post: 28, width: 14, drop: 312, material: c.fixed }), K.O[0], K.O[1], -15, scene);
    // post for the radius bar pin, further back: bearing z -30..-18, foot at y = 85 - 357 = -272
    P.at(P.bearingBlock({ bore: 4.5, outer: 11, post: 18, width: 12, drop: 357, material: c.fixed }), K.F[0], K.F[1], -24, scene);
    // cylinder on the floor under the mid-stroke point, axis z 10: top y -95, bottom -272, inside y -269..-98
    c.shell(P.at(P.steamCylinder({ radius: 20, length: 177, wall: 3, hole: 5, material: c.fixed }), o.x0, -95, 10, scene));
    // beam z -5..5: the long arm to the right and a short stub to the left, toward the crank; dark ring on the hub face z 5.6..6.4
    o.beam = new T.Group(); o.beam.position.set(K.O[0], K.O[1], 0); scene.add(o.beam);
    o.beam.add(P.armPlate({ length: K.R, r0: 24, r1: 9, thick: 10, material: c.mat("beam") }));
    var stub = P.armPlate({ length: 60, r0: 24, r1: 14, thick: 10, material: c.mat("beam") }); stub.rotation.z = Math.PI; o.beam.add(stub);
    P.at(P.hoop(15, 0.8, c.mat("beam", "dark")), 0, 0, 6, o.beam);
    P.at(P.cylZ(6, 32, c.mat("beam", "dark")), 0, 0, -10, o.beam);           // gudgeon z -26..6, through the bearing bore
    // short rod z 8..12 from its top pin along local +X; radius bar z -14..-10 behind the beam
    o.link = P.at(P.armPlate({ length: K.l + K.d, r0: 5, thick: 4, material: c.mat("link") }), 0, 0, 10, scene);
    o.rad = P.at(P.armPlate({ length: K.r, r0: 5, thick: 4, material: c.mat("radius") }), K.F[0], K.F[1], -12, scene);
    P.at(P.cylZ(3, 23, c.mat("radius", "dark")), K.F[0], K.F[1], -20.5, scene);     // fixed pin z -32..-10, through the post bore
    o.pinU = P.at(P.cylZ(3, 29, c.mat("radius", "dark")), 0, 0, -1, scene);     // top pin z -15..12, clear of the beam end
    o.pinE = P.at(P.cylZ(3, 20, c.mat("link", "dark")), 0, 0, 3, scene);        // beam pin z -7..12
    o.pinX = P.at(P.cylZ(3, 6, c.mat("piston", "mark")), 0, 0, 10, scene);        // bottom pin z 7..13, the red point to follow
    // piston rod in the plane z 10 from the bottom pin down to the piston; piston 10 thick inside the bore
    o.rod = P.at(P.rod(2.5, c.mat("piston")), 0, 0, 0, scene);
    o.pist = P.at(P.cylY(16.5, 10, c.mat("piston")), o.x0, 0, 10, scene);
    o.trace = P.trail({ color: c.ink, max: 500 }); scene.add(o.trace);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, amp = +S.controls.amp;
    if (o.amp !== amp) { o.amp = amp; o.trace.clear(); }
    o.ph += S.w * dt;
    var th = amp * Math.PI / 180 * Math.sin(o.ph), s = this.solve(c.P, th), E = s.E, U = s.U, X = s.X;
    o.beam.rotation.z = th;
    o.link.position.set(U[0], U[1], 10); o.link.rotation.z = Math.atan2(X[1] - U[1], X[0] - U[0]);
    o.rad.rotation.z = Math.atan2(U[1] - K.F[1], U[0] - K.F[0]);
    o.pinU.position.set(U[0], U[1], -1.5); o.pinE.position.set(E[0], E[1], 2.5); o.pinX.position.set(X[0], X[1], 10);
    var py = X[1] - K.rodLen;                                  // the piston keeps to the bore, so the rod leans by the tiny error
    o.pist.position.y = py; o.rod.span(X[0], X[1], 10, o.x0, py, 10);
    o.trace.push(X[0], X[1], 22);                               // path of the red pin, drawn in front of the rods
    o.last = { X: X, U: U, E: E, py: py };
    var off = (X[0] - o.x0) * 10;
    S.set("off", (Math.abs(off) < 0.05 ? "0.0" : off.toFixed(Math.abs(off) < 10 ? 1 : 0)) + " mm");
    S.set("y", Math.round(X[1] - o.y0) + " cm");
  }
});
