M507.define({
  number: 397,
  title: "Shuttle drive for a sewing machine",
  lede: "A crank turns steadily, but the shuttle stops for half of every turn. Then it shoots across and back. Sewing machines used this to wait for the needle and then pass the shuttle through the loop of thread.",
  alt: "An upright curved lever, shaped like a long S, stands on a pivot at the bottom. A curved slot runs down its middle. A crank beside it has a red pin that rides in the slot. From the top of the lever a flat link runs left to a block that slides under a fixed bar.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank", note: "It turns steadily on its shaft. Its red pin rides in the lever's slot. Watch the pin." },
    { key: "lever", color: "#C8873A", name: "Curved lever", note: "Swings on the pivot at its foot. Half of its slot is bent round the crank shaft, so there the pin slides without moving it." },
    { key: "link", color: "#D9B13B", name: "Link", note: "Joins the top of the lever to the shuttle driver." },
    { key: "driver", color: "#4FA58A", name: "Shuttle driver", note: "Slides along under the bar and would carry the shuttle. It waits, then goes right and comes back." }
  ],
  readouts: [{ id: "cr", label: "Crank" }, { id: "sh", label: "Shuttle" }],
  speed: { min: 5, max: 40, value: 15 },
  views: { "3d": [70, 10, 684], front: [-10, -10, 860], side: [860, -10, 0] },
  target: [-10, -13, 0],
  how: [
    "The crank turns at a steady speed. Its red pin sits in a curved slot in the lever. The lever can only swing on the pivot at its foot.",
    "Half of the slot is bent in a circle round the crank shaft. While the pin travels round that half, it just slides along the slot and the lever stays still. On the other half of the turn the pin is no longer on that circle. It pulls the lever over to the right and brings it back. The link passes this on to the shuttle driver. So the shuttle waits for half a turn, then goes out and back.",
    "Turn the speed down and watch the readouts. The crank angle keeps rising, but the shuttle reading stays at 0 mm for half of every turn."
  ],
  note: "This model is rebuilt from Brown's drawing. The bearing for the crank, the bracket at the foot, the posts holding the bar and all the sizes were made up. The crank is drawn shorter than in Brown's figure. With his longer crank the lever would have to swing so far that the link could not reach the bar. The shuttle itself is left out.",

  // Model units. B lever pivot, O crank shaft, R crank radius, T top pin of the lever (as drawn), LK link length,
  // YC height of the shuttle driver's pin. The lever's slot is the left half of the crank circle as drawn.
  K: { B: [0, -141], O: [10, 0], R: 58, T: [-2, 114], LK: 144, YC: 114 },

  /** Lever and shuttle for crank angle th (radians, anticlockwise from +X). The pin is at distance rho from the pivot.
      The slot point at that distance is where the circle of radius rho round the pivot meets the crank circle on its
      left half (the lever as drawn); the lever turns by the angle between that point and the pin. */
  solve: function (th) {
    var K = this.K, ox = K.O[0] - K.B[0], oy = K.O[1] - K.B[1];
    var wx = ox + K.R * Math.cos(th), wy = oy + K.R * Math.sin(th), rho = Math.hypot(wx, wy);
    var d = Math.hypot(ox, oy), a = (rho * rho - K.R * K.R + d * d) / (2 * d), h = Math.sqrt(Math.max(0, rho * rho - a * a));
    var ux = ox / d, uy = oy / d, sx = a * ux - h * uy, sy = a * uy + h * ux;      // left of the line from the pivot to the shaft
    var psi = Math.atan2(wy, wx) - Math.atan2(sy, sx);
    psi = Math.atan2(Math.sin(psi), Math.cos(psi));
    var tx = K.T[0] - K.B[0], ty = K.T[1] - K.B[1], c = Math.cos(psi), s = Math.sin(psi);
    var Tx = K.B[0] + tx * c - ty * s, Ty = K.B[1] + tx * s + ty * c;
    var cx = Tx - Math.sqrt(K.LK * K.LK - (K.YC - Ty) * (K.YC - Ty));
    return { psi: psi, pin: [K.B[0] + wx, K.B[1] + wy], T: [Tx, Ty], cx: cx };
  },

  /** Lever outline and slot, in the lever's own frame (pivot at the origin, as drawn). */
  shape: function (P) {
    var K = this.K, ox = K.O[0] - K.B[0], oy = K.O[1] - K.B[1], au = Math.atan2(oy, ox), slot = [], i;
    for (i = 0; i <= 60; i++) { var a = au + Math.PI - Math.PI * i / 60; slot.push([ox + K.R * Math.cos(a), oy + K.R * Math.sin(a)]); }   // near end, round the left, to the far end
    var N = slot[0], F = slot[60], tx = K.T[0] - K.B[0], ty = K.T[1] - K.B[1];
    var mid = [[0, 0], [14, 28], [20, 56], [16, 76]].concat(slot.slice(0, 61).filter(function (q, k) { return k % 4 === 0 || k === 60; }))
      .concat([[F[0] + 14, F[1] + 4], [F[0] + 20, F[1] + 22], [tx + 10, ty - 10], [tx, ty]]);
    return { outline: P ? P.strokeOutline(mid, 32) : null, slot: slot, N: N, F: F, mid: mid };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, sh = this.shape(P);
    var o = this.o = { th: 132 * Math.PI / 180, x0: null };          // crank pin where Brown draws it, up and to the left
    o.x0 = this.solve(o.th).cx;
    // lever z 0..10 with bosses z -1..11 at the pivot and the top
    o.lever = new T.Group(); P.at(o.lever, K.B[0], K.B[1], 0, scene);
    P.at(P.slottedPlate({ outline: sh.outline, slot: sh.slot, half: 7, thick: 10, material: c.mat("lever") }), 0, 0, 5, o.lever);
    P.at(P.cylZ(15, 12, c.mat("lever")), 0, 0, 5, o.lever);
    P.at(P.cylZ(14, 12, c.mat("lever")), K.T[0] - K.B[0], K.T[1] - K.B[1], 5, o.lever);
    // pivot pin z -.5..11.5 from the bracket's face through the foot boss; bracket x -14..14, y -157..-127, z -16..-.5
    P.at(P.cylZ(5, 12, c.fixed), K.B[0], K.B[1], 5.5, scene);
    P.at(P.box(28, 30, 15.5, c.fixed), K.B[0], -142, -8.25, scene);
    // crank: arm z 14..20, pin z -.5..14 through the slot (half width 7), shaft z 20..44 to the bearing's front face
    o.crank = new T.Group(); P.at(o.crank, K.O[0], K.O[1], 0, scene);
    P.at(P.armPlate({ length: K.R, r0: 14, r1: 9, thick: 6, material: c.mat("crank") }), 0, 0, 17, o.crank);
    P.at(P.cylZ(5.5, 14.5, c.mat("crank", "mark")), K.R, 0, 6.75, o.crank);
    P.at(P.cylZ(6, 24, c.mat("crank")), 0, 0, 32, o.crank);
    P.at(P.box(10, 2.5, 1, c.mat("crank", "dark")), 20, 0, 20.5, o.crank);   // stripe on the arm's front face, z 20..21
    P.at(P.bearingBlock({ bore: 6.5, outer: 14, drop: 157, width: 14, material: c.fixed }), K.O[0], K.O[1], 37, scene);   // z 30..44, foot on the ground (y -157)
    // link z -8..-1.5, behind the lever, from the top pin to the shuttle driver's pin
    o.link = new T.Group(); scene.add(o.link);
    P.at(P.armPlate({ length: K.LK, r0: 9, thick: 6.5, material: c.mat("link") }), 0, 0, -4.75, o.link);
    o.tpin = P.at(P.cylZ(4, 20, c.mat("link")), 0, 0, 1.5, scene);            // top pin z -8.5..11.5
    // shuttle driver x -14..14, y 106..130 (under the bar), z -16.5..-8.5; its pin z -16.5..-1.5
    o.drv = new T.Group(); scene.add(o.drv);
    P.at(P.box(28, 24, 8, c.mat("driver")), 0, -8 + 12, -12.5, o.drv);       // y 106..130 when the group sits at y = YC (114)
    P.at(P.cylZ(4, 14, c.mat("driver")), 0, 0, -9.5, o.drv);
    // bar x -232..112, y 130..140, z -20..-4; posts y -157..130, z -20..-10; ground top y -157
    P.at(P.box(344, 10, 16, c.fixed), -60, 135, -12, scene);
    P.at(P.box(12, 287, 10, c.fixed), -226, -13.5, -15, scene);              // x -232..-220
    P.at(P.box(12, 287, 10, c.fixed), 106, -13.5, -15, scene);               // x 100..112
    P.at(P.box(480, 10, 90, c.fixed), -10, -162, 0, scene);                  // ground x -250..230, y -167..-157, z -45..45
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    o.th += S.w * dt;
    var q = this.solve(o.th);
    o.crank.rotation.z = o.th;
    o.lever.rotation.z = q.psi;
    o.tpin.position.set(q.T[0], q.T[1], 1.5);
    o.drv.position.set(q.cx, K.YC, 0);
    o.link.position.set(q.T[0], q.T[1], 0);
    o.link.rotation.z = Math.atan2(K.YC - q.T[1], q.cx - q.T[0]);
    var deg = ((o.th * 180 / Math.PI) % 360 + 360) % 360;
    S.set("cr", Math.round(deg) + "°");
    S.set("sh", Math.round(q.cx - o.x0) + " mm");
  }
});
