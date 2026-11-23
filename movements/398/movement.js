M507.define({
  number: 398,
  title: "Cam-driven intermittent wheel",
  lede: "A disc with a three-lobed groove turns steadily. A pin in the groove pushes a frame in and out, and a rod from the frame turns a wheel. The wheel turns in steps, stopping twice in every turn.",
  alt: "On the left a round disc with a groove shaped like a three-leaf clover. A pin rides in the groove, on the end of a rod. The rod is fixed to a small sliding frame with a spool in its middle. From the frame a long rod runs right to a short crank on a big wheel.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Cam", note: "A disc that turns steadily. A groove with three lobes is cut in its face." },
    { key: "slide", color: "#C8873A", name: "Sliding frame", note: "Its pin rides in the groove. It can only slide left and right, between the two fixed rails." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod and crank", note: "The long connecting rod joins the frame to a short crank on the wheel." },
    { key: "wheel", color: "#4FA58A", name: "Wheel", note: "Turned by the crank. Watch the red spoke: it stops, then moves on." }
  ],
  controls: [{ id: "dw", label: "Stops in the groove", value: "long", options: [["short", "Short"], ["long", "Long"]] }],
  speed: { min: 2, max: 20, value: 6, label: "Cam speed", unit: "rpm" },
  readouts: [{ id: "w", label: "Wheel" }, { id: "n", label: "Turns" }],
  views: { "3d": [10, 30, 670], front: [-12, 0, 680], side: [-760, 40, 120] },
  target: [-12, 0, 0],
  how: [
    "The cam turns steadily. Its pin cannot leave the groove, and the frame can only slide sideways. So as the groove's distance from the centre changes, the frame is pushed out and pulled in. The rod passes this to the crank on the wheel.",
    "Each lobe of the groove pushes the frame out and back once, and that turns the crank once. Three lobes give three turns of the wheel for each turn of the cam. Between the moves, parts of the groove run in a circle round the centre. There the pin stays the same distance out, the frame stands still, and so does the wheel.",
    "Try Short, then Long. Long gives a groove with longer circular parts, so the wheel waits longer and then moves faster."
  ],
  note: "This model is rebuilt from Brown's drawing. The rails, the back plate, the exact shape of the groove and all sizes were made up. Brown does not say where the wheel stops; here it stops with the crank square to the rod, so it never stops at a dead point. The spool in the frame is drawn as Brown shows it but does nothing here.",

  // Cam centre C0, wheel centre W (both on y = 0), crank radius CR, rod length LR, follower pin to rod joint D1.
  K: { C0: -173, W: 131, CR: 9, LR: 152, D1: 107, AD: Math.PI / 2, F: { short: .04, long: .14 }, HW: 3.1, RC: 64 },

  /** Groove radius for lobe phase u (0..1, repeating) and stop length f. Each half of a lobe starts at the middle radius
      (crank square to the rod), goes in (or out) and comes back along a sine squared curve, then runs round in a circle
      for a stop of f. Going in, the crank turns from AD to AD + pi; going out, on to AD + 2 pi. */
  rhoU: function (u, f) {
    var K = this.K, h, t, m = this.rho(K.AD);
    u = ((u % 1) + 1) % 1; h = u < .5 ? 0 : 1; t = Math.min(1, (u - h / 2) / (.5 - f));
    var e = Math.pow(Math.sin(Math.PI * t), 2);
    return h ? m + (this.rho(0) - m) * e : m - (m - this.rho(Math.PI)) * e;
  },
  /** Crank angle for lobe phase u: the angle at which the crank puts the pin at rhoU, found by halving on the right quarter turn. */
  crank: function (u, f) {
    var K = this.K, uu = ((u % 1) + 1) % 1, h = uu < .5 ? 0 : 1, t = Math.min(1, (uu - h / 2) / (.5 - f));
    var q = h * 2 + (t < .5 ? 0 : 1), lo = K.AD + q * Math.PI / 2, hi = lo + Math.PI / 2, r = this.rhoU(u, f), k;
    var up = this.rho(hi) > this.rho(lo);
    if (t >= 1) return Math.floor(u) * 2 * Math.PI + K.AD + (h + 1) * Math.PI;
    for (k = 0; k < 40; k++) { var mid = (lo + hi) / 2; if ((this.rho(mid) < r) === up) lo = mid; else hi = mid; }
    return Math.floor(u) * 2 * Math.PI + (lo + hi) / 2;
  },
  /** Distance of the follower pin from the cam centre for crank angle a (exact slider-crank). */
  rho: function (a) {
    var K = this.K, s = K.CR * Math.sin(a);
    return K.W + K.CR * Math.cos(a) - Math.sqrt(K.LR * K.LR - s * s) - K.D1 - K.C0;
  },
  /** Centre line of the groove in the cam's own frame: radius rho at polar angle phi, with u = 3 phi / 2 pi. */
  groove: function (f, n) {
    var pts = [], i;
    for (i = 0; i < n; i++) { var ph = 2 * Math.PI * i / n, r = this.rhoU(3 * ph / (2 * Math.PI), f); pts.push([r * Math.cos(ph), r * Math.sin(ph)]); }
    return pts;
  },
  /** Offset a closed loop by d along its normals (positive = outward for an anticlockwise loop). */
  offset: function (pts, d) {
    var n = pts.length;
    return pts.map(function (p, i) {
      var a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
      return [p[0] + ty / l * d, p[1] - tx / l * d];
    });
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { ph: 0, u0: 1 - K.F.long / 2, dw: null, a: null, turns: 0, a0: K.AD, wrpm: 0 };
    // back plate x -250..225, y -95..95, z -40..-32 (cam x -237..-109, wheel x 49..213)
    P.at(P.box(475, 190, 8, c.fixed), -12.5, 0, -36, scene);
    // cam: back disc z -14..-6 (the groove floor), face z -6..2 cut by the groove, hub z 2..5, shaft z -32..2
    o.cam = new T.Group(); P.at(o.cam, K.C0, 0, 0, scene);
    P.at(P.cylZ(K.RC, 8, c.mat("cam", "dark")), 0, 0, -10, o.cam);
    o.face = new T.Group(); o.cam.add(o.face);
    P.at(P.cylZ(14, 3, c.mat("cam")), 0, 0, 3.5, o.cam);
    P.at(P.cylZ(8, 34, c.mat("cam")), 0, 0, -15, o.cam);
    P.at(P.box(10, 3, 1, c.mat("cam", "dark")), 0, 7.5, 5.5, o.cam);        // stripe on the hub, z 5..6
    // sliding frame, origin at the follower pin; all of it z 3..16, in front of the cam face (z 2), except the pin and spool
    o.slide = new T.Group(); P.at(o.slide, 0, 0, 0, scene);
    var ms = c.mat("slide");
    P.at(P.cylZ(2.6, 18, ms), 0, 0, 3.5, o.slide);                            // pin radius 2.6 (groove half width 3.1), z -5.5..12.5, .5 above the groove floor
    P.at(P.cylX(3.5, 44, ms), 22, 0, 9.5, o.slide);                           // rod x 0..44 into the left upright, z 6..13
    P.at(P.box(86, 9, 13, ms), 73, 25.5, 9.5, o.slide);                       // top bar x 30..116, y 21..30, z 3..16
    P.at(P.box(86, 9, 13, ms), 73, -25.5, 9.5, o.slide);                      // bottom bar y -30..-21
    P.at(P.box(10, 42, 12, ms), 45, 0, 9.5, o.slide);                         // left upright x 40..50, y -21..21 (touching the bars), z 3.5..15.5
    P.at(P.box(10, 42, 12, ms), 95, 0, 9.5, o.slide);                         // right upright x 90..100
    P.at(P.box(7, 14, 12, ms), 103.5, 0, 9.5, o.slide);                       // tab x 100..107
    P.at(P.cylZ(8, 13, ms), K.D1, 0, 9.5, o.slide);                           // round end of the tab, joint at x 107, z 3..16 (thicker than the tab, so no shared faces)
    var sp = [[0, -18], [13, -18], [13, -16], [9, -9], [8, 0], [9, 9], [13, 16], [13, 18], [0, 18]].map(function (q) { return new T.Vector2(q[0], q[1]); });
    var spool = new T.Mesh(new T.LatheGeometry(sp, 36), c.mat("slide", "light"));
    spool.rotation.z = -Math.PI / 2; P.at(spool, 70, 0, 9.5, o.slide);       // spool x 52..88, radius 13 (z -3.5..22.5), between the uprights; at least 24 clear of the cam's rim
    // rails above and below the frame, z 2.5..16.5, on blocks from the back plate (z -32..2.5), clear of the cam (which reaches x -116 at this height)
    [33, -33].forEach(function (y) {
      P.at(P.box(129, 6, 14, c.fixed), -45.5, y, 9.5, scene);                 // x -110..19, y 30..36 / -36..-30; the bars reach x -107..1
      [-80, 8].forEach(function (x) { P.at(P.box(14, 6, 34.5, c.fixed), x, y, -14.75, scene); });
    });
    // connecting rod z 17..22 from the frame's joint to the crank pin
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.armPlate({ length: K.LR, r0: 7, thick: 5, material: c.mat("rod") }), 0, 0, 19.5, o.rod);
    o.jpin = P.at(P.cylZ(3.5, 18, c.mat("rod")), 0, 0, 13.5, scene);      // joint pin z 3..22.5
    // wheel z -11..-3, crank arm z 10..16 with its pin z 10..22.5, shaft z -32..10
    o.wheel = new T.Group(); P.at(o.wheel, K.W, 0, 0, scene);
    var wh = P.pulley({ radius: 82, width: 8, rim: 8, spokes: 6, hub: 14, material: c.mat("wheel") });
    wh.spokes[0].material = c.mat("wheel", "mark");                          // one red spoke to watch
    P.at(wh, 0, 0, -7, o.wheel);                                              // z -11..-3
    P.at(P.cylZ(6, 42, c.mat("wheel")), 0, 0, -11, o.wheel);
    P.at(P.armPlate({ length: K.CR, r0: 10, r1: 6, thick: 6, material: c.mat("rod") }), 0, 0, 13, o.wheel);
    P.at(P.cylZ(3.5, 12.5, c.mat("rod")), K.CR, 0, 16.25, o.wheel);
  },

  setGroove: function (c, f) {
    var T = c.THREE, o = this.o, K = this.K;
    while (o.face.children.length) { var m = o.face.children.pop(); m.geometry.dispose(); }
    var g = this.groove(f, 720), outer = this.offset(g, K.HW), inner = this.offset(g, -K.HW);
    var sh = new T.Shape(); sh.absarc(0, 0, K.RC, 0, 2 * Math.PI, false);
    var hole = new T.Path(); outer.slice().reverse().forEach(function (q, i) { if (i) hole.lineTo(q[0], q[1]); else hole.moveTo(q[0], q[1]); }); hole.closePath(); sh.holes.push(hole);
    var isl = new T.Shape(); inner.forEach(function (q, i) { if (i) isl.lineTo(q[0], q[1]); else isl.moveTo(q[0], q[1]); }); isl.closePath();
    [sh, isl].forEach(function (s) {
      var geo = new T.ExtrudeGeometry(s, { depth: 8, bevelEnabled: false, curveSegments: 72 }); geo.translate(0, 0, -6);   // z -6..2
      o.face.add(new T.Mesh(geo, c.mat("cam")));
    });
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, f = K.F[S.controls.dw] || K.F.long;
    if (S.controls.dw !== o.dw) { o.dw = S.controls.dw; this.setGroove(c, f); }
    o.ph += S.w * dt;                                                          // cam turned clockwise by ph
    var u = o.u0 + 3 * o.ph / (2 * Math.PI), a = this.crank(u, f), x = K.C0 + this.rhoU(u, f);
    if (o.a !== null && dt > 0) {
      var da = Math.atan2(Math.sin(a - o.a), Math.cos(a - o.a));
      o.turns += da / (2 * Math.PI); o.wrpm = da / dt * 60 / (2 * Math.PI);
    }
    if (!S.playing) o.wrpm = 0;
    o.a = a;
    o.cam.rotation.z = -o.ph;
    o.slide.position.x = x;
    var jx = x + K.D1, px = K.W + K.CR * Math.cos(a), py = K.CR * Math.sin(a);
    o.jpin.position.x = jx;
    o.rod.position.x = jx; o.rod.rotation.z = Math.atan2(py, px - jx);
    o.wheel.rotation.z = a;
    var r = Math.round(o.wrpm);
    S.set("w", (r > 0 ? "+" : r < 0 ? "−" : "") + Math.abs(r) + " rpm");
    S.set("n", o.turns.toFixed(1));
  }
});
