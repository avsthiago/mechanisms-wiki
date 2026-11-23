M507.define({
  number: 149,
  title: "Cams and levers",
  lede: "Two oval cams turn together on one shaft. Each one pushes a long lever up and down, and the lever moves a rod. The shaft turns round and round, while the rods slide up and down.",
  alt: "Two long levers fixed at one end to a pin on the left. At the other end each lever has a small wheel resting on an oval cam. A tall oval cam and a wide oval cam sit on the same shaft. Near the pin, an upright rod hangs from each lever and slides through two guides.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Oval cams", note: "Two oval plates on one shaft. The shaft is not in the middle of each oval, so the edge swings in and out as it turns." },
    { key: "lever", color: "#D9B13B", name: "Levers", note: "Each lever swings on a pin at its left end. It rests on its cam by its own weight, so it rises and falls with the cam's edge." },
    { key: "roller", color: "#C2503F", name: "Wheels", note: "A small wheel on the end of each lever. It rolls along the cam. Watch it: it moves up and down once for each turn." },
    { key: "rod", color: "#C8873A", name: "Rods", note: "Each rod hangs from its lever and slides straight up and down in two guides. The lever swings in an arc, so the rod's pin slides along a slot in the lever." }
  ],
  controls: [{ id: "oval", label: "Shape of the cams", value: "1", options: [["0.35", "Nearly round"], ["1", "Medium"], ["1.3", "Long"]] }],
  readouts: [{ id: "up", label: "Upper rod" }, { id: "lo", label: "Lower rod" }],
  views: { "3d": [270, 100, 470], front: [0, 0, 760], side: [700, 0, 20] },
  target: [5, -30, 8],
  distance: [300, 1800],
  how: [
    "Look at the wheel on each lever. It sits on the edge of an oval cam. The shaft is off to one side of each oval, so as the cam turns, its edge moves up and down under the wheel.",
    "When the edge rises, it lifts the wheel and the lever swings up. When the edge falls, the lever sinks back by its own weight. The rod hangs from the lever, so it rises and falls with it. The two cams point in different directions, so the two rods do not move together.",
    "Turning in one direction at a steady speed gives rods that go up and down, again and again. Try Nearly round, Medium and Long, and watch how far each rod moves."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the exact oval shapes, the shaft, the pin, the back plate, the guides and the base were made up. The two cams sit side by side on the shaft so that each lever has its own. The levers are held down on the cams only by their weight. Brown draws the rods as if fixed to the levers, but a rod that stays upright cannot be fixed to a lever that swings in an arc, so each rod's pin slides in a slot. The lever heights are worked out exactly from the shapes of the cams. With the long cams, the edge sometimes rises beside the wheel, and then the lever rests on the cam for a moment. The choice of cam shape was added for comparison.",

  G: { P0: [-153, 23], SH: [90, -21], RR: 10, XR: [6, 13], ZC: [0, 20], RL: 130, GY: [-35, -55],
       CAM: [{ a: 70, b: 38, e: 20, psi: Math.PI / 2, L: 240 }, { a: 44, b: 26, e: 12, psi: 0, L: 240 }] },

  // Edge of cam i (shape factor k) as a closed list of [x, y] in the shaft frame at turn 0.
  poly: function (i, k) {
    var g = this.G.CAM[i], a = g.b + (g.a - g.b) * k, n = 360, out = [], j;
    for (j = 0; j < n; j++) {
      var t = 2 * Math.PI * j / n, x = g.e + a * Math.cos(t), y = g.b * Math.sin(t), cs = Math.cos(g.psi), sn = Math.sin(g.psi);
      out.push([x * cs - y * sn, x * sn + y * cs]);
    }
    return out;
  },

  // Distance from a point to the closed polygon.
  dist: function (pt, q) {
    var n = pt.length, best = 1e9, j;
    for (j = 0; j < n; j++) {
      var p0 = pt[j], p1 = pt[(j + 1) % n], dx = p1[0] - p0[0], dy = p1[1] - p0[1];
      var t = ((q[0] - p0[0]) * dx + (q[1] - p0[1]) * dy) / (dx * dx + dy * dy); t = t < 0 ? 0 : t > 1 ? 1 : t;
      var ex = p0[0] + t * dx - q[0], ey = p0[1] + t * dy - q[1], d = ex * ex + ey * ey;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  },

  // Lever angle for lever i with the cam turned by th: the lowest swing at which neither the wheel nor the lever's
  // underside (6 below its centre line) cuts into the cam. Where the cam rises left of the wheel, the lever rests on it.
  angle: function (i, th, pt, rmax) {
    return Math.max(this.wheelAngle(i, th, pt, rmax), this.barAngle(i, th, pt));
  },
  barAngle: function (i, th, pt) {
    var G = this.G, L = G.CAM[i].L, cs = Math.cos(th), sn = Math.sin(th), best = -9, j;
    for (j = 0; j < pt.length; j += 2) {
      var x = pt[j][0] * cs - pt[j][1] * sn + G.SH[0] - G.P0[0], y = pt[j][0] * sn + pt[j][1] * cs + G.SH[1] - G.P0[1], R = Math.hypot(x, y);
      if (x > L || R < 7) continue;                                                     // past the lever's end: the wheel's job
      best = Math.max(best, Math.atan2(y, x) + Math.asin(6 / R));
    }
    return best;
  },
  wheelAngle: function (i, th, pt, rmax) {
    var G = this.G, L = G.CAM[i].L, r = G.RR, cs = Math.cos(-th), sn = Math.sin(-th), self = this;
    function d(f) {
      var x = G.P0[0] + L * Math.cos(f) - G.SH[0], y = G.P0[1] + L * Math.sin(f) - G.SH[1];
      if (Math.hypot(x, y) > rmax + r + 1) return 1e9;
      return self.dist(pt, [x * cs - y * sn, x * sn + y * cs]);
    }
    var hi = 0.5, lo = hi, step = 0.01;
    if (d(hi) < r) return hi;
    while (lo > -0.6) { lo -= step; if (d(lo) < r) break; }
    if (lo <= -0.6) return -0.6;
    var a = lo, b = lo + step, k;                  // a touches or overlaps, b is clear
    for (k = 0; k < 30; k++) { var m = (a + b) / 2; if (d(m) < r) a = m; else b = m; }
    return (a + b) / 2;
  },

  // Height of the rod's top: the lever's height at the rod's x.
  rodY: function (i, f) { var G = this.G; return G.P0[1] + (G.XR[i] - G.P0[0]) * Math.tan(f); },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene, i;
    var o = this.o = { th: 0, k: null, cams: [], plate: [], dot: [], pts: [], rmax: [], lev: [], rod: [], pin: [], rng: [] };
    var px = G.P0[0], py = G.P0[1], sx = G.SH[0], sy = G.SH[1];
    // shaft x 90, radius 6, z -10..31 (starts on the back plate face); pivot pin radius 5, z -10..31, head z 31..33
    P.at(P.cylZ(6, 41, c.mat("cam")), sx, sy, 10.5, scene);
    P.at(P.cylZ(5, 41, c.mat("cam")), px, py, 10.5, scene);
    P.at(P.cylZ(8, 2, c.mat("cam", "light")), px, py, 32, scene);
    for (i = 0; i < 2; i++) {
      var zc = G.ZC[i], L = G.CAM[i].L;
      o.cams[i] = new T.Group(); o.cams[i].position.set(sx, sy, 0); scene.add(o.cams[i]);
      // lever: group at the pin; box x 0..L, y -6..6, z zc-4..zc+4; hub radius 10 z zc-4.5..zc+4.5; wheel radius 10, z zc-5..zc+5
      var lv = new T.Group(); lv.position.set(px, py, zc); scene.add(lv); o.lev[i] = lv;
      P.at(P.box(L, 12, 8, c.mat("lever")), L / 2, 0, 0, lv);
      P.at(P.cylZ(10, 9, c.mat("lever")), 0, 0, 0, lv);
      P.at(P.cylZ(G.RR, 10, c.mat("roller", "mark")), L, 0, 0, lv);
      P.at(P.cylZ(2.5, 1.4, c.mat("roller", "dark")), L, 0, 5.7, lv);               // z 5..6.4
      P.at(P.box(50, 3, 1.4, c.mat("lever", "dark")), (G.XR[i] - px) + 8, 0, 4.8, lv);   // slot strip z 4.1..5.5
      // rod: z zc+5..zc+13 (centre zc+9), pin z zc..zc+9 joins it to the lever
      var rg = new T.Group(); rg.position.set(G.XR[i], 0, zc + 9); scene.add(rg); o.rod[i] = rg;
      P.at(P.cylY(4, G.RL, c.mat("rod")), 0, -G.RL / 2, 0, rg);
      P.at(P.cylZ(3, 9.5, c.mat("rod", "dark")), 0, 0, -4.5, rg);
      P.at(P.cylY(5.5, 4, c.mat("rod", "light")), 0, -20, 0, rg);                    // collar, y -22..-18
    }
    // guides: x XR +-12, blocks y GY +-7. Back rod: block z -10..18 on the plate, hole centre z 9 (hz 5).
    // Front rod: block z 20..38, with a post x XR+4..XR+12, z -10..20 on the right so the back rod stays clear.
    G.GY.forEach(function (y) {
      P.at(P.guideBlock({ w: 24, h: 14, d: 28, hole: 4.5, hz: 5, material: c.fixed }), G.XR[0], y, 4, scene);
      P.at(P.guideBlock({ w: 24, h: 14, d: 18, hole: 4.5, material: c.fixed }), G.XR[1], y, 29, scene);
      P.at(P.box(8, 14, 30, c.fixed), G.XR[1] + 8, y, 5, scene);                      // x 17..25, z -10..20
    });
    P.at(P.box(380, 280, 10, c.fixed), 0, 0, -15, scene);        // back plate x -190..190, y -140..140, z -20..-10
    P.at(P.box(380, 12, 90, c.fixed), 0, -146, -5, scene);       // base y -152..-140, z -50..40
  },

  makeCams: function (c, k) {
    var T = c.THREE, P = c.P, G = this.G, o = this.o, i;
    for (i = 0; i < 2; i++) {
      var g = o.cams[i], zc = G.ZC[i];
      if (o.plate[i]) { g.remove(o.plate[i]); o.plate[i].geometry.dispose(); g.remove(o.dot[i]); }
      var pts = this.poly(i, k), sh = new T.Shape();
      pts.forEach(function (p, j) { if (j) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
      o.plate[i] = P.at(P.mesh(new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false }), c.mat("cam")), 0, 0, zc - 6, g);   // z zc-6..zc+6
      var q = pts[0];                                                                  // the oval's far end, marked with a dark dot on the face
      var f = 0.7, d = P.cylZ(2.5, 1.4, c.mat("cam", "dark")); d.position.set(q[0] * f, q[1] * f, zc + 6.7); g.add(d); o.dot[i] = d;
      o.pts[i] = pts;
      o.rmax[i] = Math.max.apply(null, pts.map(function (p) { return Math.hypot(p[0], p[1]); }));
    }
    // lowest rod height over a turn, so the readouts start from zero
    o.rng = [1e9, 1e9];
    for (i = 0; i < 2; i++) for (var j = 0; j < 90; j++) o.rng[i] = Math.min(o.rng[i], this.rodY(i, this.angle(i, 2 * Math.PI * j / 90, o.pts[i], o.rmax[i])));
    o.k = k;
  },

  step: function (c, dt, S) {
    var o = this.o, G = this.G, k = +S.controls.oval || 1, i, y = [];
    if (k !== o.k) this.makeCams(c, k);
    o.th += S.w * dt;
    for (i = 0; i < 2; i++) {
      var f = this.angle(i, o.th, o.pts[i], o.rmax[i]);
      o.cams[i].rotation.z = o.th;
      o.lev[i].rotation.z = f;
      y[i] = this.rodY(i, f);
      o.rod[i].position.y = y[i];
    }
    S.set("up", (y[0] - o.rng[0]).toFixed(0) + " mm");
    S.set("lo", (y[1] - o.rng[1]).toFixed(0) + " mm");
  }
});
