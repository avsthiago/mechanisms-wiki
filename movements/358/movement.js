M507.define({
  number: 358,
  title: "Fusee-driven carriage",
  lede: "A crank turns a cone with a spiral groove, called a fusee. A band wound in the groove pulls a carriage along a track. Where the cone is wide the carriage moves fast, and where it is thin the carriage creeps, even though the crank turns steadily.",
  alt: "A crank turns a level shaft held in two bearings, with a cone on its end. A band wound in the cone's spiral groove runs back to an arm on a small four-wheeled carriage on two rails. At the far end of the rails a drum on an upright pin holds a cord tied to the back of the carriage.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank and shaft", note: "Turned by hand at a steady speed. The cone is fixed on the end of its shaft." },
    { key: "fusee", color: "#C8873A", name: "Fusee", note: "A cone with one spiral groove cut round it, wide at the crank end and thin at the tip." },
    { key: "band", color: "#D9B13B", name: "Band", note: "Tied to the wide end of the fusee and wound along its groove. Its other end is tied to the carriage's arm." },
    { key: "carriage", color: "#4FA58A", name: "Carriage", note: "Runs on two rails. The band pulls it towards the fusee. Watch how its speed changes." },
    { key: "drum", color: "#8E7AA8", name: "Spring drum", note: "A drum with a spring inside. Its cord pulls the carriage back whenever the band is let out." }
  ],
  controls: [{ id: "body", label: "Band winds on", value: "fusee", options: [["fusee", "Fusee"], ["drum", "Plain drum"]] }],
  readouts: [{ id: "v", label: "Carriage" }, { id: "r", label: "Band radius" }],
  views: { "3d": [-20, 800, 380], top: [-10, 1050, -19], side: [1000, 150, -20] },
  target: [10, 0, 10],
  how: [
    "The crank turns at a steady speed. Each turn winds one loop of band onto the fusee and pulls the carriage closer. The band climbs the groove as it winds, from the wide end towards the thin tip.",
    "One turn pulls in as much band as the distance round the groove at that spot. Round the wide end that is a long way, so the carriage moves fast. Round the thin tip it is short, so the carriage moves slowly. The carriage's speed follows the size of the cone where the band is. When the band is let out again, the spring drum pulls the carriage back.",
    "Watch the two readouts rise and fall together. Then try Plain drum. Now the band always winds at the same size, so the carriage moves at almost one steady speed."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show what brings the carriage back, so the spring drum and its cord were added. The rails, the arm on the carriage, the sizes and the number of turns in the groove were made up. Brown's carriage has one wheel on each axle; this one has two, so it can stand on two rails. The plain drum is an extra to compare.",

  /* Geometry of the band, with no drawing, so it can be checked on its own.
     The fusee turns about the X axis at height H and depth ZF. A point at angle g round it is (y, z) = (H + r sin g, ZF - r cos g).
     The band is tied at spiral angle 0 (the wide end) and lies in the groove up to angle a, where it leaves for the carriage. */
  makeKin: function () {
    var TAU = 2 * Math.PI, K = { H: 72, ZF: 170, X0: -40, PITCH: 20, N: 3, R0: 28, R1: 7, BR: 4, XA: -10, YA: 30, AMIN: .3, AMAX: 2 * TAU - .4, NEAR: 90 };
    K.wall = function (a) { return K.R0 - (K.R0 - K.R1) * Math.max(0, Math.min(1, a / (2 * TAU))); };
    K.x = function (a) { return K.X0 + K.PITCH * (a / TAU + .5); };
    function table(rc) {
      var d = .004, n = Math.ceil(2 * TAU / d) + 2, S = new Float64Array(n + 1), i;
      function sp(p) { var dr = (rc(p + 1e-4) - rc(p - 1e-4)) / 2e-4; return Math.sqrt(rc(p) * rc(p) + dr * dr + K.PITCH * K.PITCH / (TAU * TAU)); }
      for (i = 1; i <= n; i++) S[i] = S[i - 1] + d * (sp((i - 1) * d) + 4 * sp((i - .5) * d) + sp(i * d)) / 6;
      return function (w) { var q = w / d, k = Math.max(0, Math.min(n - 1, Math.floor(q))); return S[k] + (S[k + 1] - S[k]) * (q - k); };
    }
    var fu = { rc: function (a) { return K.wall(a) + K.BR; } };
    fu.Lw = table(fu.rc);
    var target = fu.Lw(K.AMAX), lo = 5, hi = 60, i;                    // plain drum: same band taken up over the same turns
    for (i = 0; i < 50; i++) { var m = (lo + hi) / 2, L = m * Math.hypot(1, K.PITCH / (TAU * m)) * K.AMAX; if (L > target) hi = m; else lo = m; }
    var RM = (lo + hi) / 2, dr = { rc: function () { return RM; } };
    dr.Lw = function (a) { return a * Math.hypot(RM, K.PITCH / TAU); };
    K.RM = RM; K.modes = { fusee: fu, drum: dr };
    var dy = K.YA - K.H;
    /* Everything that follows from a in one mode. */
    K.state = function (m, a) {
      var rc = m.rc(a), xt = K.x(a), s = m.Ltot - m.Lw(a), dx = K.XA - xt;
      var tl = Math.sqrt(Math.max(0, s * s - dx * dx)), d2 = Math.sqrt(tl * tl + rc * rc);
      var dz = Math.sqrt(Math.max(0, d2 * d2 - dy * dy)), zA = K.ZF - dz;
      var gA = Math.atan2(dy, dz), gt = gA + Math.acos(rc / d2);
      return { a: a, rc: rc, zA: zA, gt: gt, phi: a + gt, tx: xt, ty: K.H + rc * Math.sin(gt), tz: K.ZF - rc * Math.cos(gt) };
    };
    [fu, dr].forEach(function (m) {                                     // band length chosen so the arm stops NEAR in front of the axis
      var rc = m.rc(K.AMAX), d2 = Math.hypot(K.NEAR, dy), tl = Math.sqrt(d2 * d2 - rc * rc), dx = K.XA - K.x(K.AMAX);
      m.Ltot = m.Lw(K.AMAX) + Math.hypot(tl, dx);
    });
    /* Spiral angle a for crank angle phi (Newton, from a guess). */
    K.solve = function (m, phi, a) {
      for (var k = 0; k < 6; k++) {
        var s0 = K.state(m, a), s1 = K.state(m, a + 1e-4), f = s0.phi - phi;
        a -= f / ((s1.phi - s0.phi) / 1e-4);
      }
      return a;
    };
    return K;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.makeKin(), HP = Math.PI / 2, i;
    var o = this.o = { K: K, dir: -1, a: K.AMAX, mode: null };
    var far = K.state(K.modes.fusee, K.AMIN).zA, near = K.state(K.modes.fusee, K.AMAX).zA;
    o.zD = far + 32 - 40 - 32;                                          // spring drum: 32 beyond the carriage's back face at its farthest
    // ---- shaft, crank and fusee turn together about the X axis at (y 72, z ZF)
    o.spin = new T.Group(); o.spin.position.set(0, K.H, K.ZF); scene.add(o.spin);
    P.at(P.cylX(5, 152, c.mat("crank")), -42, 0, 0, o.spin);            // shaft x -118..34
    P.at(P.cylX(9, 8, c.mat("crank")), 24, 0, 0, o.spin);               // collar x 20..28 against the fusee's tip
    o.crank = new T.Group(); o.spin.add(o.crank);
    P.at(P.box(8, 10, 63, c.mat("crank")), -122, 0, -26.5, o.crank);    // crank arm x -126..-118, out along -Z to the handle
    P.at(P.cylX(4, 18, c.mat("crank")), -135, 0, -55, o.crank);         // handle pin x -144..-126
    P.at(P.cylX(6.5, 16, c.mat("crank", "dark")), -152, 0, -55, o.crank);   // grip x -160..-144
    o.inner = new T.Group(); o.inner.rotation.y = HP; o.inner.position.x = K.X0; o.spin.add(o.inner);   // fusee's local Z = world +X, wide end at x -40
    o.bodies = {};
    o.bodies.fusee = P.fusee({ radius: K.wall, turns: K.N, pitch: K.PITCH, hand: -1, material: c.mat("fusee") });
    o.bodies.drum = P.fusee({ radius: function () { return K.RM - K.BR; }, turns: K.N, pitch: K.PITCH, hand: -1, material: c.mat("fusee") });
    o.inner.add(o.bodies.fusee); o.inner.add(o.bodies.drum);
    P.at(P.box(3, 14, 1, c.mat("fusee", "dark")), 0, 18, -1, o.inner);   // stripe on the wide end face, local z -1.5..-.5 (world x -41.5..-40.5)
    // band lying in the groove: one tube for each body, shown from the tie up to where it leaves
    o.tubes = {};
    ["fusee", "drum"].forEach(function (k) {
      var m = K.modes[k], pts = [], n = 400;
      for (i = 0; i <= n; i++) { var a = K.AMAX * i / n, r = m.rc(a); pts.push(new T.Vector3(r * Math.cos(-a), r * Math.sin(-a), K.PITCH * (a / (2 * Math.PI) + .5))); }
      var tb = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), n, K.BR - .3, 6, false), c.mat("band"));
      o.inner.add(tb); o.tubes[k] = { m: tb, n: n };
    });
    o.free = P.at(P.rod(K.BR - .3, c.mat("band")), 0, 0, 0, scene);
    o.knot = P.at(P.sphere(5, c.mat("band", "mark")), 0, 0, 0, scene);   // where the band is tied to the arm
    // ---- carriage, at depth zc; arm's front face at zc - 32 is where the band is tied
    o.car = new T.Group(); scene.add(o.car);
    var mc = c.mat("carriage");
    P.at(P.box(6, 12, 80, mc), 88, 20, 0, o.car); P.at(P.box(6, 12, 80, mc), 142, 20, 0, o.car);   // side bars x 85..91 and 139..145, y 14..26, z -40..40
    P.at(P.box(159, 8, 8, mc), 65.5, 30, -36, o.car);                    // arm x -14..145, y 26..34 (on the side bars' tops), z -40..-32
    o.wheels = [];
    [-28, 28].forEach(function (z) {
      P.at(P.cylX(3, 70, mc), 115, 20, z, o.car);                        // axle x 80..150
      [100, 130].forEach(function (x) {
        var w = new T.Group(); w.position.set(x, 20, z); o.car.add(w); o.wheels.push(w);
        w.add(P.cylX(14, 6, mc));                                         // wheel x +-3, rolls on a rail top at y 6
        P.at(P.box(1, 12, 3, c.mat("carriage", "dark")), x < 115 ? -3.5 : 3.5, 6, 0, w);   // stripe on the outer face, lifted .5
      });
    });
    // ---- spring drum and its cord
    o.drum = new T.Group(); o.drum.position.set(101, 30, o.zD); scene.add(o.drum);
    var dm = P.drum({ radius: 14, length: 20, flange: 6, flangeThick: 4, material: c.mat("drum") }); dm.rotation.x = HP; o.drum.add(dm);   // y 16..44
    P.at(P.box(16, 1, 3, c.mat("drum", "dark")), 8, 14.5, 0, o.drum);    // stripe on the top flange, y 44..45
    o.cord = P.at(P.rod(1.5, c.mat("drum")), 0, 0, 0, scene);
    // ---- supports
    var rz0 = far + 32 - 47, rz1 = near + 32 + 47;
    P.at(P.box(6, 6, rz1 - rz0, c.fixed), 100, 3, (rz0 + rz1) / 2, scene);   // rails x 97..103 and 127..133, y 0..6
    P.at(P.box(6, 6, rz1 - rz0, c.fixed), 130, 3, (rz0 + rz1) / 2, scene);
    P.at(P.cylY(4, 16, c.fixed), 101, 8, o.zD, scene);                    // pin y 0..16 under the drum
    [-100, -65].forEach(function (x) {
      P.at(P.bearingBlock({ bore: 5.5, outer: 12, width: 12, drop: 72, material: c.fixed }), x, K.H, K.ZF, scene).rotation.y = HP;   // foot on the base at y 0
    });
    var bz0 = o.zD - 30, bz1 = K.ZF + 70;
    P.at(P.box(340, 10, bz1 - bz0, c.fixed), 5, -5, (bz0 + bz1) / 2, scene);   // base x -165..175, y -10..0
    o.rz = [rz0, rz1, bz0, bz1];
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, mode = S.controls.body === "drum" ? "drum" : "fusee", m = K.modes[mode], k;
    if (o.mode !== mode) { o.mode = mode; o.phi = K.state(m, o.a).phi; }
    o.phi += o.dir * S.w * dt;
    o.a = K.solve(m, o.phi, o.a);
    if (o.a >= K.AMAX) { o.a = K.AMAX; o.dir = -1; o.phi = K.state(m, o.a).phi; }
    else if (o.a <= K.AMIN) { o.a = K.AMIN; o.dir = 1; o.phi = K.state(m, o.a).phi; }
    var s = K.state(m, o.a), zc = s.zA + 32;
    o.spin.rotation.x = o.phi;
    o.crank.rotation.x = Math.PI - K.state(K.modes.fusee, K.AMAX).phi;   // crank points at the viewer when fully wound, as drawn
    for (k in o.bodies) { o.bodies[k].visible = o.tubes[k].m.visible = k === mode; }
    o.tubes[mode].m.geometry.setDrawRange(0, Math.floor(o.a / K.AMAX * o.tubes[mode].n) * 36);
    o.free.span(s.tx, s.ty, s.tz, K.XA, K.YA, s.zA);
    o.knot.position.set(K.XA, K.YA, s.zA + .5);
    o.car.position.z = zc;
    o.wheels.forEach(function (w) { w.rotation.x = zc / 14; });
    var back = zc - 40;
    o.cord.span(115, 30, o.zD, 115, 30, back);
    o.drum.rotation.y = -(back - o.zD) / 14;
    // speed of the carriage: how far it moves per radian of crank, times the crank speed
    var s2 = K.state(m, Math.min(K.AMAX, o.a + 1e-3)), s1 = K.state(m, Math.max(K.AMIN, o.a - 1e-3));
    var v = Math.abs((s2.zA - s1.zA) / (s2.phi - s1.phi)) * S.w;
    S.set("v", (v / 10).toFixed(1) + " cm/s");
    S.set("r", Math.round(s.rc - K.BR) + " mm");
  }
});
