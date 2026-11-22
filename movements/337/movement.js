M507.define({
  number: 337,
  title: "Parallel motion with a short rod",
  lede: "The end of a rocking beam moves on a curve, but a piston rod must go straight up and down. A short hanging rod and a sideways radius rod pull the curve almost straight. The piston rod hangs from near the middle of the short rod.",
  alt: "A long tapered beam pivoted at the right, its left end rocking up and down. A short yellow rod hangs from the beam end. Its lower end is held by a long orange rod pivoted on a post at the left. A red piston rod hangs from the middle of the short rod down into a see-through cylinder, and a dark line shows the path of its top.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam", note: "Rocks up and down about its pivot on the right. Its end moves on a curve that bends to the right." },
    { key: "link", color: "#D9B13B", name: "Short rod", note: "Hangs from the end of the beam. It tilts a little to and fro as the beam rocks." },
    { key: "radius", color: "#8E7AA8", name: "Radius rod", note: "Swings about a fixed pin on the left. It holds the bottom of the short rod, and its end moves on a curve that bends to the left." },
    { key: "piston", color: "#C8873A", name: "Piston rod", note: "Hangs from the middle of the short rod and goes down into the cylinder. Watch its top: the dark line is its path." }
  ],
  controls: [{ type: "range", id: "amp", label: "Beam swing", min: 6, max: 20, step: 1, value: 14, unit: "°",
    presets: [[8, "Small"], [14, "Usual"], [20, "Large"]] }],
  readouts: [{ id: "off", label: "Off line" }, { id: "y", label: "Piston" }],
  closed: { label: "Cylinder" },
  views: { "3d": [-289, 52, 717], front: [-15, -60, 700], side: [680, -60, 0] },
  target: [-15, -60, 0],
  how: [
    "The end of the beam swings on a curve. At the top and bottom of its swing it moves to the right. The radius rod swings on a curve too. At the ends of its swing it moves to the left.",
    "The short rod joins the two ends. Its top is pulled right and its bottom is pulled left, by about the same amount. So a point near its middle hardly moves sideways at all. That is where the piston rod hangs, and it goes up and down in an almost straight line.",
    "The line is only nearly straight. Look at the Off line reading. Try Small, then Large, and watch the dark path open into a thin figure of eight. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the beam end and the rods. The cylinder, the piston, the posts and bearings, the floor and all sizes were made up. The beam is rocked to and fro as if by a crank on its far end, which is left out. The piston rod is fixed a little above the middle of the short rod, at the point that gives the straightest line for these rod lengths.",

  // geometry (model units; read as cm): beam pivot O, beam radius R, short rod l, radius rod r with fixed pin F.
  // At mid-swing the beam and radius rod lie flat and the short rod hangs straight down. k = r / (R + r) is the
  // classic point on the short rod that goes straightest (measured from its top).
  K: { O: [150, 60], R: 190, l: 80, r: 140, F: [-180, -20], k: 140 / 330, rodLen: 196 },

  solve: function (P, th) {                                  // th: beam angle, positive lifts its end
    var K = this.K, E = [K.O[0] - K.R * Math.cos(th), K.O[1] + K.R * Math.sin(th)], L = P.meet(E[0], E[1], K.l, K.F[0], K.F[1], K.r, 1);
    return { E: E, L: L, M: [E[0] + (L[0] - E[0]) * K.k, E[1] + (L[1] - E[1]) * K.k] };
  },

  probe: function () { return this.o.last; },                // for the node test
  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, mid = this.solve(P, 0);
    var o = this.o = { ph: 0, amp: null, x0: mid.M[0], y0: mid.M[1] };
    // floor: x -230..200, y -255..-247, z -40..40
    P.at(P.box(430, 8, 80, c.fixed), -15, -251, 0, scene);
    // beam pedestal behind the beam: bearing z -22..-8, boss at the pivot, foot at y = 60 - 307 = -247 (floor top)
    P.at(P.bearingBlock({ bore: 6.5, outer: 16, post: 26, width: 14, drop: 307, material: c.fixed }), K.O[0], K.O[1], -15, scene);
    // post for the radius rod pin: bearing z -22..-8, foot at y = -20 - 227 = -247
    P.at(P.bearingBlock({ bore: 4.5, outer: 11, post: 18, width: 14, drop: 227, material: c.fixed }), K.F[0], K.F[1], -15, scene);
    // cylinder on the floor, axis under the mid-stroke point: top y -95 (below the lowest reach of the rods), bottom -247 (floor top), bore radius 17, inside y -244..-98
    c.shell(P.at(P.steamCylinder({ radius: 20, length: 152, wall: 3, hole: 5, material: c.fixed }), o.x0, -95, 0, scene));
    // beam z -5..5, tapered, from the pivot to the end; a dark ring on the hub face lifted to z 5.6..6.4
    o.beam = new T.Group(); o.beam.position.set(K.O[0], K.O[1], 0); scene.add(o.beam);
    o.beam.add(P.armPlate({ length: K.R, r0: 24, r1: 10, thick: 10, material: c.mat("beam") }));
    P.at(P.hoop(14, 0.8, c.mat("beam", "dark")), 0, 0, 6, o.beam);
    P.at(P.cylZ(6, 32, c.mat("beam", "dark")), 0, 0, -10, o.beam);           // gudgeon z -26..6, through the bearing bore
    // short rod z 8..12, radius rod z 14..18, both drawn from their first joint along local +X
    o.link = P.at(P.armPlate({ length: K.l, r0: 5, thick: 4, material: c.mat("link") }), 0, 0, 10, scene);
    o.rad = P.at(P.armPlate({ length: K.r, r0: 5, thick: 4, material: c.mat("radius") }), K.F[0], K.F[1], 16, scene);
    P.at(P.cylZ(3, 43, c.mat("radius", "dark")), K.F[0], K.F[1], -2.5, scene);     // fixed pin z -24..18, through the post bore
    o.pinE = P.at(P.cylZ(3, 20, c.mat("link", "dark")), 0, 0, 3, scene);        // beam end pin z -7..12
    o.pinL = P.at(P.cylZ(3, 12, c.mat("radius", "dark")), 0, 0, 13, scene);       // z 7..19
    o.pinM = P.at(P.cylZ(3, 15, c.mat("piston", "mark")), 0, 0, 5.5, scene);      // z -2..13, the red point to follow
    // piston rod at z 0 from the pin down to the piston; piston 10 thick inside the bore
    o.rod = P.at(P.rod(2.5, c.mat("piston")), 0, 0, 0, scene);
    o.pist = P.at(P.cylY(16.5, 10, c.mat("piston")), o.x0, 0, 0, scene);
    o.trace = P.trail({ color: c.ink, max: 500 }); scene.add(o.trace);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, amp = +S.controls.amp;
    if (o.amp !== amp) { o.amp = amp; o.trace.clear(); }
    o.ph += S.w * dt;
    var th = amp * Math.PI / 180 * Math.sin(o.ph), s = this.solve(c.P, th), E = s.E, L = s.L, M = s.M;
    o.beam.rotation.z = Math.PI - th;
    o.link.position.set(E[0], E[1], 10); o.link.rotation.z = Math.atan2(L[1] - E[1], L[0] - E[0]);
    o.rad.rotation.z = Math.atan2(L[1] - K.F[1], L[0] - K.F[0]);
    o.pinE.position.set(E[0], E[1], 2.5); o.pinL.position.set(L[0], L[1], 13); o.pinM.position.set(M[0], M[1], 5.5);
    var py = M[1] - K.rodLen;                                  // the piston keeps to the bore, so the rod leans by the tiny error
    o.pist.position.y = py; o.rod.span(M[0], M[1], 0, o.x0, py, 0);
    o.trace.push(M[0], M[1], 22);                               // path of the red pin, drawn in front of the rods
    o.last = { M: M, L: L, py: py };
    var off = (M[0] - o.x0) * 10;
    S.set("off", (Math.abs(off) < 0.05 ? "0.0" : off.toFixed(Math.abs(off) < 10 ? 1 : 0)) + " mm");
    S.set("y", Math.round(M[1] - o.y0) + " cm");
  }
});
