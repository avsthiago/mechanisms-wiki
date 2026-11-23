M507.define({
  number: 364,
  title: "Rollers in oblique grooves",
  lede: "A small wheel with rollers on spokes drives a big drum whose shaft is at right angles to its own. The rollers catch on slanting ribs across the drum's rim. The drum turns in steps, with a short rest between them, while the small wheel turns steadily.",
  alt: "On the left, a small wheel facing you with eight short spokes, each ending in a red roller. On the right, a big drum on an upright shaft, seen from the side, with slanting green ribs across its rim. The right-hand roller sits between two ribs.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Small wheel", note: "The driver. It turns steadily and carries eight short spokes, called studs." },
    { key: "rollers", color: "#C2503F", name: "Rollers", note: "A small roller turns freely on the end of each stud. Watch the right-hand one climb and push a rib." },
    { key: "drum", color: "#C8873A", name: "Drum", note: "The big wheel on the upright shaft. It only turns while a roller is pushing a rib, then it rests." },
    { key: "ribs", color: "#4FA58A", name: "Slanting ribs", note: "Raised strips running on a slant across the rim of the drum. A climbing roller pushes one sideways, so the drum turns." }
  ],
  controls: [],
  readouts: [{ id: "w", label: "Drum" }, { id: "n", label: "Steps" }],
  views: { "3d": [300, 280, 820], front: [-20, 0, 720], top: [-20, 720, 1] },
  target: [-20, 0, 0],
  how: [
    "The small wheel turns, and each roller in turn swings up past the drum. Near the middle of its swing, the roller dips in among the ribs on the drum's rim. Then it swings out again, and the next roller comes along.",
    "The ribs slant across the rim. As a roller climbs, it presses on the side of the rib next to it. A slanting rib can only get out of the way by moving sideways, so the drum turns a little. When the roller rolls off the top of the rib, the push stops and the drum rests until the next roller catches the next rib. The rollers turn as they rub along the ribs, so there is less wear.",
    "Watch the drum readout jump between a speed and zero. Count the steps: there is one for every roller that passes, so one turn of the small wheel moves the drum by eight ribs."
  ],
  note: "This model is rebuilt from Brown's drawing. The number of ribs, their slant and depth, all the sizes, the bearings, the post, the base and the bracket holding the drum shaft were made up. In a real machine something like a brake would hold the drum still between steps; here it simply stays where the last roller left it.",

  // Shape of the drive. Drum axis upright at x = xb, z = 0; small wheel axis along Z at (xs, ys). Ribs: N of them, half width w,
  // standing from radius Rb to Rb + e, from y = -H/2 to H/2, each slanting by T (sideways distance on the rim per unit of height).
  // Rollers: radius rho, from r1 to r2 along each of the studs.
  _G: function () {
    var G = { xb: 60, Rb: 150, e: 10, H: 80, N: 16, w: 5, xs: -191.5, ys: 0, r1: 80, r2: 100, rho: 7, studs: 8, T: 1.1, gap: .35 };
    G.rm = G.Rb + G.e / 2; G.k = G.T / G.rm; G.wa = G.w / G.rm; G.ga = G.gap / G.rm;
    return G;
  },
  _wrap: function (a) { return Math.atan2(Math.sin(a), Math.cos(a)); },
  // Points on one side (side -1 is towards -z) of a roller whose stud points at angle f, keeping only those inside the
  // rib layer. Each is [angle round the drum, height, radius].
  _pts: function (G, f, side, ns) {
    var out = [], c = Math.cos(f), s = Math.sin(f), i, j;
    for (i = 0; i <= 5; i++) {
      var x = G.xb - G.Rb - G.e + (G.e - .01) * i / 5, yc = G.ys + (x - G.xs) * s / c, hb = G.rho / c;
      for (j = 0; j <= ns; j++) {
        var y = yc - hb + 2 * hb * j / ns, u = -(x - G.xs) * s + (y - G.ys) * c, t = (x - G.xs) * c + (y - G.ys) * s;
        if (Math.abs(u) > G.rho || t < G.r1 || t > G.r2) continue;
        var z = side * Math.sqrt(G.rho * G.rho - u * u), rad = Math.hypot(G.xb - x, z);
        if (rad < G.Rb || rad > G.Rb + G.e || Math.abs(y) > G.H / 2) continue;
        out.push([Math.atan2(z, G.xb - x), y, rad]);
      }
    }
    return out;
  },
  // The drum angle allowed when the wheel is at phi and the drum was at beta: a rib just behind a roller may not overlap it,
  // so a climbing roller pushes that rib (and the drum) back. Returns {beta, by: which stud pushed, or -1}.
  _limit: function (G, phi, beta) {
    var b = beta, by = -1, self = this;
    for (var q = 0; q < G.studs; q++) {
      var f = this._wrap(phi + q * 2 * Math.PI / G.studs); if (Math.cos(f) < .8) continue;
      var P = this._pts(G, f, -1, 24); if (!P.length) continue;
      var yc = G.ys + (G.xb - G.rm - G.xs) * Math.tan(f);
      for (var j = 0; j < G.N; j++) {
        var pj = j * 2 * Math.PI / G.N, d = this._wrap(beta + pj + G.k * yc);
        if (d >= 0 || d < -.6) continue;                                  // only the rib just behind the roller
        P.forEach(function (p) { var m = beta + self._wrap(p[0] - pj - G.k * p[1] - G.wa - G.ga - beta); if (m < b) { b = m; by = q; } });
      }
    }
    return { beta: b, by: by };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, G = this._G(), i;
    var o = this.o = { G: G, phi: 0, beta: .3, spin: [], rollers: [], rate: 0 };
    // small wheel: disc z -6..6, studs and rollers in the plane z = 0, shaft z -37..-6 through the bearing (z -37..-23)
    o.wheel = new T.Group(); o.wheel.position.set(G.xs, G.ys, 0); scene.add(o.wheel);
    o.wheel.add(P.cylZ(68, 12, c.mat("wheel")));                                          // disc r 68, z -6..6
    P.at(P.cylZ(14, 4, c.mat("wheel")), 0, 0, 8, o.wheel);                                // hub z 6..10
    P.at(P.cylZ(9, .8, c.mat("wheel", "dark")), 0, 0, 10.4, o.wheel);                     // shaft end, dark, z 10..10.8
    P.at(P.cylZ(8, 31, c.mat("wheel")), 0, 0, -21.5, o.wheel);                            // shaft z -37..-6
    P.at(P.box(40, 5, .8, c.mat("wheel", "dark")), 40, 0, 6.5, o.wheel);                  // stripe on the face, z 6.1..6.9, x 20..60
    for (i = 0; i < G.studs; i++) {
      var g = new T.Group(); g.rotation.z = i * 2 * Math.PI / G.studs; o.wheel.add(g);
      P.at(P.cylX(3, 33.5, c.mat("wheel")), 82.75, 0, 0, g);                              // stud x 66..99.5 (ends inside the roller)
      var sp = new T.Group(); sp.position.x = (G.r1 + G.r2) / 2; g.add(sp);
      sp.add(P.cylX(G.rho, G.r2 - G.r1, c.mat("rollers")));                               // roller x 80..100
      P.at(P.box(G.r2 - G.r1 - 2, 2, .8, c.mat("rollers", "dark")), 0, G.rho + .5, 0, sp);   // stripe, y rho+0.1..rho+0.9
      o.rollers.push(sp); o.spin.push(0);
    }
    // drum: body radius Rb, y -41..41; ribs y -40..40 from radius Rb-1 (sunk in) to Rb+e; shaft y -170..170
    o.drum = new T.Group(); o.drum.position.x = G.xb; scene.add(o.drum);
    o.drum.add(P.cylY(G.Rb, G.H + 2, c.mat("drum")));
    P.at(P.cylY(8, 340, c.mat("drum")), 0, 0, 0, o.drum);                                 // shaft y -170..170
    P.at(P.box(125, .8, 6, c.mat("drum", "dark")), -82.5, G.H / 2 + 1.5, 0, o.drum);       // stripe on top, y 41.1..41.9 (top face 41), x -145..-20 (local)
    var rm = c.mat("ribs");
    for (i = 0; i < G.N; i++) o.drum.add(P.mesh(this._ribGeo(T, G, i * 2 * Math.PI / G.N), rm));
    // supports. base y -182..-170; drum shaft in a footstep bearing y -170..-150 and a top bearing y 150..170 on an arm from a post
    P.at(P.box(500, 12, 240, c.fixed), -20, -176, -80, scene);                            // base x -270..230, y -182..-170, z -200..40
    P.at(P.guideBlock({ w: 26, h: 20, d: 26, hole: 8.6, material: c.fixed }), G.xb, -160, 0, scene);   // footstep y -170..-150, z -13..13
    P.at(P.guideBlock({ w: 26, h: 20, d: 26, hole: 8.6, material: c.fixed }), G.xb, 160, 0, scene);    // top bearing y 150..170, z -13..13
    P.at(P.box(26, 20, 160, c.fixed), G.xb, 160, -93, scene);                            // arm z -173..-13, y 150..170 (clear of the drum, top y 41)
    P.at(P.box(26, 340, 12, c.fixed), G.xb, 0, -179, scene);                              // post y -170..170, z -185..-173 (ribs reach z -160)
    P.at(P.bearingBlock({ bore: 8.6, outer: 16, width: 14, drop: 170, material: c.fixed }), G.xs, G.ys, -30, scene);   // bearing z -37..-23, foot on the base top (y -170)
    // settle the drum against the rollers before the first frame
    for (var a = -2 * Math.PI; a <= 0; a += .002) o.beta = this._limit(G, a, o.beta).beta;
    o.drum.rotation.y = o.beta; o.beta0 = o.beta;
  },

  // One rib as a solid strip: four corners (inner and outer radius, each side) at each height, joined into faces.
  _ribGeo: function (T, G, p0) {
    var n = 16, ring = [], i, pos = [];
    for (i = 0; i <= n; i++) {
      var y = -G.H / 2 + G.H * i / n, a = p0 + G.k * y, r0 = G.Rb - 1, r1 = G.Rb + G.e;
      ring.push([[r0, a - G.wa], [r1, a - G.wa], [r1, a + G.wa], [r0, a + G.wa]].map(function (q) { return [-q[0] * Math.cos(q[1]), y, q[0] * Math.sin(q[1])]; }));
    }
    function tri(a, b, d) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], d[0], d[1], d[2]); }
    for (i = 0; i < n; i++) for (var s = 0; s < 4; s++) {
      var A = ring[i][s], B = ring[i][(s + 1) % 4], C = ring[i + 1][(s + 1) % 4], D = ring[i + 1][s];
      tri(A, C, B); tri(A, D, C);
    }
    var b0 = ring[0], b1 = ring[n];
    tri(b0[0], b0[1], b0[2]); tri(b0[0], b0[2], b0[3]); tri(b1[0], b1[2], b1[1]); tri(b1[0], b1[3], b1[2]);
    var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return g;
  },

  step: function (c, dt, S) {
    var o = this.o, G = o.G, d = S.w * dt, n = Math.max(1, Math.ceil(Math.abs(d) / .004)), b0 = o.beta, i;
    for (i = 0; i < n; i++) {
      o.phi += d / n;
      var L = this._limit(G, o.phi, o.beta);
      if (L.by >= 0 && L.beta < o.beta) {
        var f = o.phi + L.by * 2 * Math.PI / G.studs, dy = (G.r1 + G.r2) / 2 * Math.cos(f) * Math.abs(d / n);   // how far the roller climbs in this sub-step
        o.spin[L.by] += Math.hypot(dy, (o.beta - L.beta) * G.rm) / G.rho;           // rolls along the rib face without rubbing
      }
      o.beta = L.beta;
    }
    o.wheel.rotation.z = o.phi;
    o.drum.rotation.y = o.beta;
    for (i = 0; i < G.studs; i++) o.rollers[i].rotation.x = o.spin[i];
    var rpm = dt > 0 ? (o.beta - b0) / dt * 60 / (2 * Math.PI) : 0;
    o.rate += (rpm - o.rate) * Math.min(1, dt * 12);
    var v = Math.round(o.rate);
    S.set("w", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " rpm");
    S.set("n", String(Math.floor((o.beta0 - o.beta) / (2 * Math.PI / G.N) + .01)));   // each push moves the drum on by exactly one rib
  }
});
