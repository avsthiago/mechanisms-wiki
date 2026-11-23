M507.define({
  number: 30,
  title: "Rectangular gears",
  lede: "A small square gear drives a big square gear. The small one turns steadily, but the big one keeps speeding up and slowing down. A printing press used this to turn a square roller that carried the type.",
  alt: "Two square gears side by side on an upright plate. The small one on the left stands on a corner like a diamond, and that corner meets the middle of a side of the big one. The big gear's shaft sits in a sliding block with a coil spring behind it.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "The small square gear. It turns at a steady speed on a shaft that stays in one place. Watch its red stripe sweep round evenly." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "The big square gear. The small gear pushes it round, faster and then slower. Watch its red stripe hurry and then lag." },
    { key: "slide", color: "#D9B13B", name: "Sliding block", note: "A block that holds the big gear's shaft. It slides sideways between two rails, so the big gear can move back when a corner needs room." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "Pushes the sliding block towards the small gear. It keeps the teeth together as the block moves in and out." }
  ],
  controls: [{ id: "shape", label: "Shape", value: "square", options: [["square", "Square"], ["round", "Rounder"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }, { id: "shift", label: "Block moved" }],
  views: { "3d": [240, 135, 510], front: [20, 0, 720], side: [720, 0, 0] },
  target: [20, 0, 0],
  how: [
    "Watch the two red stripes. The stripe on the small blue gear sweeps round steadily. The stripe on the big orange gear speeds up and slows down as its sides and corners come past.",
    "A corner of a square gear is further from the shaft than the middle of a side. So the teeth at a corner move faster than the teeth on a side, and the push on the orange gear keeps changing. A corner also needs more room than a side. That is why the orange shaft sits in a green block that slides. The spring pushes the block back so the teeth always stay together.",
    "Slow the speed right down and watch the green block move in and out. Then choose Rounder. The gears bulge out, the block hardly moves and the speed stays steadier. Go back to Square and compare."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two gears. Two square gears cannot stay in mesh on shafts that never move, so the sliding block, the rails and the spring were made up to let them run. The sides are bowed out a little and the corners are rounded so the gears roll smoothly. The sizes, the number of teeth, the red stripes and the stand were made up. The printing press is left out.",

  /* Pitch curve of a "square" gear: four side arcs that each turn through gamma and four corner arcs that turn through the
     rest of the quarter turn. Stepped in arcs of length pitch / K, so the curve closes exactly and N * K steps go round once.
     Starts on the +x axis at the middle of a corner (atCorner) or of a side, running anticlockwise.
     Returns pts (about the centre) and T (how far the tangent has turned at each step). */
  _curve: function (N, pitch, cornerPitches, gamma, K, atCorner) {
    var q = N / 4 * K, nc = cornerPitches * K, ns = q - nc, n = 4 * q, h = pitch / K;
    var kc = (Math.PI / 2 - gamma) / (nc * h), ks = gamma / (ns * h);
    var x = 0, y = 0, a = Math.PI / 2, T = [0], pts = [], sx = 0, sy = 0, i;
    for (i = 0; i < n; i++) {
      var m = (i + (atCorner ? nc / 2 : nc + ns / 2)) % q, k = m < nc ? kc : ks, ch = 2 * Math.sin(k * h / 2) / k;
      pts.push([x, y]); sx += x; sy += y;
      x += ch * Math.cos(a + k * h / 2); y += ch * Math.sin(a + k * h / 2); a += k * h; T.push(a - Math.PI / 2);
    }
    for (i = 0; i < n; i++) { pts[i][0] -= sx / n; pts[i][1] -= sy / n; }
    return { n: n, pts: pts, T: T };
  },

  /* Rolling without slip with the driven shaft free to slide along x. After j steps of arc the contact is at step -j on the
     driver and +j on the driven curve (equal arc lengths). The curves are tangent there when the driven gear has turned by
     theta - T, with T the sum of the two tangent turns. That fixes how the two shapes sit against each other; the driver
     angle theta is then whatever puts the line of centres along x, and d is the distance between the centres. */
  _table: function (c1, c2, M) {
    var th = [], TT = [], d = [], prev = 0, j;
    for (j = 0; j <= M; j++) {
      var p1 = c1.pts[j % c1.n], p2 = c2.pts[j % c2.n];
      var T = c1.T[j % c1.n] + c2.T[j % c2.n] + 2 * Math.PI * (Math.floor(j / c1.n) + Math.floor(j / c2.n));
      var X = p1[0] + p2[0] * Math.cos(T) + p2[1] * Math.sin(T), Y = p1[1] + p2[0] * Math.sin(T) - p2[1] * Math.cos(T);
      var t = Math.atan2(Y, X); t += 2 * Math.PI * Math.round((prev - t) / (2 * Math.PI)); prev = t;
      th.push(t); TT.push(T); d.push(Math.sqrt(X * X + Y * Y));
    }
    return { th: th, T: TT, d: d, M: M, dmin: Math.min.apply(null, d) };
  },

  /* One pair: 36 and 56 teeth of the same pitch (9 and 14 to a side, as near as the drawing can be counted). The pair is
     back where it started after 126 teeth have passed: 3.5 turns of the driver and 2.25 of the driven gear. */
  _pair: function (gamma, cornerPitches) {
    var K = 40, N1 = 36, N2 = 56, pitch = 3.5 * Math.PI;
    var c1 = this._curve(N1, pitch, cornerPitches, gamma, K, true), c2 = this._curve(N2, pitch, cornerPitches, gamma, K, false);
    var t = this._table(c1, c2, 126 * K);
    t.c1 = c1; t.c2 = c2; t.N1 = N1; t.N2 = N2; t.pitch = pitch;
    return t;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, XD = -115, self = this;
    var o = this.o = { th: 0, XD: XD, sets: {} };
    // driving gear: gear z -8..8, shaft z -30..12 (starts at the plate face), hub z 8..12 on the gear face
    o.g1 = new T.Group(); o.g1.position.set(XD, 0, 0); scene.add(o.g1);
    P.at(P.cylZ(6, 42, c.mat("drive")), 0, 0, -9, o.g1);
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 10, o.g1);
    // driven gear: gear z -8..8, shaft z -14..12 (starts at the front face of the sliding block), hub z 8..12
    o.g2 = new T.Group(); scene.add(o.g2);
    P.at(P.cylZ(6, 26, c.mat("driven")), 0, 0, -1, o.g2);
    P.at(P.cylZ(11, 4, c.mat("driven")), 0, 0, 10, o.g2);
    [["square", .3, 2], ["round", .9, 3]].forEach(function (s) {
      var pr = self._pair(s[1], s[2]), ded = 1.25 * pr.pitch / Math.PI;
      function thin(pts) { return pts.filter(function (p, i) { return i % 4 === 0; }); }
      // same pitch on both; the driver has a tooth on the middle of each corner, the driven gear a gap at the middle of each side
      pr.m1 = P.noncircularGear({ points: thin(pr.c1.pts), teeth: pr.N1, phase: 0, width: 16, material: c.mat("drive") });
      pr.m2 = P.noncircularGear({ points: thin(pr.c2.pts), teeth: pr.N2, phase: .5, width: 16, material: c.mat("driven") });
      // red stripes from the hub to the root of the teeth, x 11..r-3, z 8.5..9.5, lifted off the gear face (z = 8)
      var r1 = pr.c1.pts[0][0] - ded, r2 = pr.c2.pts[0][0] - ded;
      P.at(P.box(r1 - 14, 5, 1, c.mat("drive", "mark")), 11 + (r1 - 14) / 2, 0, 9, pr.m1);     // to a corner
      P.at(P.box(r2 - 14, 5, 1, c.mat("driven", "mark")), 11 + (r2 - 14) / 2, 0, 9, pr.m2);    // to the middle of a side
      o.g1.add(pr.m1); o.g2.add(pr.m2); o.sets[s[0]] = pr;
    });
    // sliding block: x (shaft - 20)..(shaft + 125), y -16..16, z -30..-14; its back slides on the plate face (z = -30)
    o.slide = new T.Group(); scene.add(o.slide);
    P.at(P.box(145, 32, 16, c.mat("slide")), 52.5, 0, -22, o.slide);
    // spring: from the right end of the block to the stop face at x = 225; coil y -7.5..7.5, z -29.5..-14.5, clear of the plate
    o.spring = P.spring({ radius: 6, wire: 1.5, turns: 7, length: 60, material: c.mat("spring") });
    P.at(o.spring, 0, 0, -22, scene);
    // supports
    P.at(P.box(225, 10, 16, c.fixed), 112.5, 21, -22, scene);                  // top rail x 0..225, y 16..26 (block top is y 16), z -30..-14
    P.at(P.box(225, 10, 16, c.fixed), 112.5, -21, -22, scene);                 // bottom rail x 0..225, y -26..-16
    P.at(P.box(10, 52, 16, c.fixed), 230, 0, -22, scene);                      // stop x 225..235, y -26..26, on the rail ends (x = 225)
    P.at(P.box(450, 260, 10, c.fixed), 20, 0, -35, scene);                     // plate x -205..245, y -130..130, z -40..-30; rails and driver shaft end at z -30
    P.at(P.box(490, 12, 100, c.fixed), 20, -136, -30, scene);                  // base x -225..265, y -142..-130, z -80..20; plate stands on y -130
  },

  step: function (c, dt, S) {
    var o = this.o, k, pr = o.sets[S.controls.shape] || o.sets.square;
    for (k in o.sets) o.sets[k].m1.visible = o.sets[k].m2.visible = o.sets[k] === pr;
    o.th += S.w * dt;
    // find where in the cycle the driver angle falls, then read off the driven angle and the centre distance
    var th = pr.th, M = pr.M, full = th[M], laps = Math.floor(o.th / full), f = o.th - laps * full, lo = 0, hi = M;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (th[m] <= f) lo = m; else hi = m; }
    var u = (f - th[lo]) / (th[lo + 1] - th[lo]);
    var Tt = pr.T[lo] + u * (pr.T[lo + 1] - pr.T[lo]) + laps * pr.T[M], d = pr.d[lo] + u * (pr.d[lo + 1] - pr.d[lo]);
    var ratio = 1 - (pr.T[lo + 1] - pr.T[lo]) / (th[lo + 1] - th[lo]);       // driven speed over driver speed, always negative
    var x2 = o.XD + d;
    o.g1.rotation.z = o.th;
    o.g2.position.x = x2;
    o.g2.rotation.z = Math.PI + o.th - Tt;                 // curves tangent at the contact, equal arc rolled on both
    o.slide.position.x = x2;
    o.spring.position.x = x2 + 125;                        // block end; the other end stays on the stop face at x = 225
    o.spring.setLength(225 - (x2 + 125));
    function fmt(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", fmt(rpm));
    S.set("out", fmt(rpm === 0 ? 0 : rpm * ratio));
    S.set("shift", Math.round(d - pr.dmin) + " mm");
  }
});
