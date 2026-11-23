M507.define({
  number: 125,
  title: "Two cranked gears, second form",
  lede: "Three gears in a row turn together. Each has a pin on its face, and rods and bars join the pins to one sliding rod at the top. The rod rises and falls in a pattern that does not repeat each turn, because the three gears turn at different speeds.",
  alt: "Three toothed wheels side by side, small, middle and big, with their teeth locked together. A pin on each wheel is joined by a thin rod to a bar above. The upper bar is held by a sliding rod that points straight up. A short rod joins the two bars.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "The small gear, turned by hand. Its pin pulls the end of the upper bar by a long rod." },
    { key: "driven", color: "#C8873A", name: "Driven gears", note: "The middle and the big gear. Their teeth lock into the gear beside them. Each carries a pin that pulls on the lower bar." },
    { key: "link", color: "#D9B13B", name: "Connecting rods", note: "Thin rods with a pin hole at each end. They join the gear pins to the bars, and join the two bars to each other." },
    { key: "bars", color: "#4FA58A", name: "Two bars", note: "The lower bar rocks on its middle pin. The upper bar is tied to the sliding rod and tilts as the rods push and pull." },
    { key: "rod", color: "#C2503F", name: "Sliding rod", note: "It can only move straight up and down. Watch how far it rises and falls." },
    { key: "spring", color: "#8E7AA8", name: "Spring", note: "Pulls the rod gently up, so it always rises as far as the rods allow." }
  ],
  readouts: [{ id: "a", label: "Driving gear" }, { id: "b", label: "Big gear" }, { id: "h", label: "Rod lift" }],
  views: { "3d": [300, 220, 1000], front: [100, 140, 840], side: [800, 150, 40] },
  target: [100, 150, 0],
  how: [
    "Turn the small driving gear. Its teeth push the middle gear the other way, and the middle gear pushes the big one. Each gear has a pin, and each pin pulls a thin rod. The lower rods rock the lower bar. A short rod carries that rocking up to the upper bar.",
    "The sliding rod is held by the upper bar, so it feels the pull from all three gears at once. The big gear turns slowly and the small one quickly, so they fall in and out of step. The rod does not repeat its path every turn.",
    "Watch the red rod and count how often it reaches its highest point in one turn of the small gear. Then slow the speed right down and follow how the lower bar tilts, and how the tilt changes the height of the rod."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows no frame, no handle, no guide for the rod and no spring. The back plate, the guide for the rod, the spring and the sizes and tooth counts were made up. As drawn, the rods fix the rod's height three ways at once, so the linkage would jam. The spring was added to make it work: it pulls the rod up, and the rod rises as high as the rods let it. The upper bar was left free to tilt for the same reason.",

  K: (function () {
    var N = [12, 16, 20], MD = 6, rp = N.map(function (n) { return n * MD / 2; });
    return {
      N: N, MD: MD, rp: rp,
      G: [[0, 0], [rp[0] + rp[1], 0], [rp[0] + 2 * rp[1] + rp[2], 0]],        // gear centres: sums of pitch radii apart
      PIN: [[-19, 4], [-26, -1], [-28, -3]],                                    // crank pins at the start, relative to each gear centre
      C: [67, 198], L: [13, 194], R: [121, 189],                                // upper bar: rod pin, left end, right end
      E: [81, 121], D: [121, 123], F: [165, 119]                                // lower bar: left end, middle, right end
    };
  })(),

  // Kinematics. Gear angles from tooth counts. Unknowns x = [s, phi, Dx, Dy, psi]: rod height, upper bar tilt, lower bar middle and tilt.
  // Four rods of fixed length give four equations. The fifth freedom is closed by the spring: the rod rises as far as the rods allow
  // (projected gradient ascent on s, then Newton correction onto the constraints).
  makeKin: function () {
    var K = this.K, N = K.N, G = K.G;
    function meshPhase(pA, NA, NB) { var sA = 2 * Math.PI / NA, sB = 2 * Math.PI / NB; return Math.PI - sB * (0.5 - (0 - pA) / sA); }
    function rots(a) { var r2 = meshPhase(a, N[0], N[1]); return [a, r2, meshPhase(r2, N[1], N[2])]; }
    function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
    function rot(v, p) { var c = Math.cos(p), s = Math.sin(p); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; }
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
    var r0 = rots(0);
    var beta = K.PIN.map(function (p, i) { return Math.atan2(p[1], p[0]) - r0[i]; });
    var pr = K.PIN.map(function (p) { return Math.hypot(p[0], p[1]); });
    function pins(a) { var r = rots(a); return [0, 1, 2].map(function (i) { return [G[i][0] + pr[i] * Math.cos(beta[i] + r[i]), G[i][1] + pr[i] * Math.sin(beta[i] + r[i])]; }); }
    var P0 = pins(0), Lv = sub(K.L, K.C), Rv = sub(K.R, K.C), e = sub(K.E, K.D), f = sub(K.F, K.D);
    var len = [dist(K.L, P0[0]), dist(K.R, K.D), dist(K.E, P0[1]), dist(K.F, P0[2])];
    var x = [0, 0, K.D[0], K.D[1], 0];
    function cons(x, P) {
      var C = [K.C[0], K.C[1] + x[0]], L = rot(Lv, x[1]), R = rot(Rv, x[1]), D = [x[2], x[3]], E = rot(e, x[4]), F = rot(f, x[4]);
      return [dist([C[0] + L[0], C[1] + L[1]], P[0]) - len[0], dist([C[0] + R[0], C[1] + R[1]], D) - len[1],
        dist([D[0] + E[0], D[1] + E[1]], P[1]) - len[2], dist([D[0] + F[0], D[1] + F[1]], P[2]) - len[3]];
    }
    function jac(P) { var r = cons(x, P), J = [], k; for (k = 0; k < 5; k++) { var y = x.slice(); y[k] += 1e-6; var r2 = cons(y, P); J.push(r2.map(function (v, i) { return (v - r[i]) / 1e-6; })); }
      return [0, 1, 2, 3].map(function (i) { return [J[0][i], J[1][i], J[2][i], J[3][i], J[4][i]]; }); }
    function solveLin(A, b) { var n = A.length, M = A.map(function (r, i) { return r.concat([b[i]]); }), i, j, k;
      for (i = 0; i < n; i++) { var p = i; for (j = i + 1; j < n; j++) if (Math.abs(M[j][i]) > Math.abs(M[p][i])) p = j; var t = M[i]; M[i] = M[p]; M[p] = t;
        for (j = i + 1; j < n; j++) { var m = M[j][i] / M[i][i]; for (k = i; k <= n; k++) M[j][k] -= m * M[i][k]; } }
      var s = new Array(n); for (i = n - 1; i >= 0; i--) { var sum = M[i][n]; for (j = i + 1; j < n; j++) sum -= M[i][j] * s[j]; s[i] = sum / M[i][i]; } return s; }
    function gram(J) { return J.map(function (a) { return J.map(function (b) { var s = 0; for (var k = 0; k < 5; k++) s += a[k] * b[k]; return s; }); }); }
    function correct(P) {
      for (var it = 0; it < 20; it++) {
        var c = cons(x, P); if (Math.max.apply(null, c.map(Math.abs)) < 1e-9) return;
        var J = jac(P), y = solveLin(gram(J), c.map(function (v) { return -v; }));
        for (var k = 0; k < 5; k++) { var s = 0; for (var i = 0; i < 4; i++) s += J[i][k] * y[i]; x[k] += s; }
      }
    }
    function step(a, iters) {
      var P = pins(a), it, k, i; correct(P);
      for (it = 0; it < iters; it++) {
        var J = jac(P), y = solveLin(gram(J), J.map(function (r) { return r[0]; })), g = [1, 0, 0, 0, 0];
        for (k = 0; k < 5; k++) { var s = 0; for (i = 0; i < 4; i++) s += J[i][k] * y[i]; g[k] -= s; x[k] += 20 * g[k]; }
        correct(P);
      }
      return { x: x.slice(), P: P, rots: rots(a) };
    }
    return { step: step, pins: pins, rots: rots, len: len, beta: beta, pr: pr };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, MD = K.MD, i;
    var o = this.o = { a: 0, kin: this.makeKin(), g: [], pin: [], links: [] };
    var keys = ["drive", "driven", "driven"];
    // gears: face z 8, hub z 8..12, shaft z -30..-8 (ends on the plate face), stripe z 8.5..9.5 lifted off the face
    for (i = 0; i < 3; i++) {
      var g = new T.Group(); g.position.set(K.G[i][0], K.G[i][1], 0); scene.add(g); o.g.push(g);
      var gear = P.spurGear({ teeth: K.N[i], module: MD, material: c.mat(keys[i]) }); g.add(gear);
      P.at(P.cylZ(6, 22, c.mat(keys[i], "dark")), 0, 0, -19, g);                    // shaft z -30..-8
      P.at(P.cylZ(10, 4, c.mat(keys[i])), 0, 0, 10, g);                               // hub z 8..12, on the gear face
      var rf = K.rp[i] - 1.25 * MD, bt = o.kin.beta[i], st = new T.Group(); st.rotation.z = bt + Math.PI; g.add(st);
      P.at(P.box(rf - 14, 5, 1, c.mat(keys[i], "mark")), 11 + (rf - 14) / 2, 0, 9, st);   // stripe x 11..rf-3, opposite the pin
      var pn = new T.Group(); pn.position.set(o.kin.pr[i] * Math.cos(bt), o.kin.pr[i] * Math.sin(bt), 0); g.add(pn);
      P.at(P.cylZ(5, 17, c.mat("link", "dark")), 0, 0, 16.5, pn);                     // crank pin z 8..25, ends inside the rod eye
      P.at(P.cylZ(7.5, 3, c.mat("link", "dark")), 0, 0, 28, pn);                      // cap z 26.5..29.5
    }
    // rods: z 20..26, eyes z 19.5..26.5; bars z 26..32, eyes z 25.5..32.5, pin heads z 32.5..35.5
    function link() {
      var g = new T.Group(); scene.add(g);
      var b = P.at(P.box(1, 8, 6, c.mat("link")), 0, 0, 23, g);
      var e1 = P.at(P.cylZ(7, 7, c.mat("link")), 0, 0, 23, g), e2 = P.at(P.cylZ(7, 7, c.mat("link")), 0, 0, 23, g);
      return { g: g, b: b, e2: e2 };
    }
    for (i = 0; i < 4; i++) o.links.push(link());
    function barEnds(grp, pts, w) {
      var a = pts[0], b = pts[pts.length - 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      var box = P.at(P.box(d + 16, 14, 6, c.mat("bars")), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 29, grp); box.rotation.z = ang;
      pts.forEach(function (p) {
        P.at(P.cylZ(8, 7, c.mat("bars")), p[0], p[1], 29, grp);                         // eye z 25.5..32.5
        P.at(P.cylZ(6, 3, c.mat("bars", "dark")), p[0], p[1], 34, grp);                 // pin head z 32.5..35.5
      });
    }
    var rel = function (p, q) { return [p[0] - q[0], p[1] - q[1]]; };
    o.top = new T.Group(); scene.add(o.top);                                              // slides up and down with the rod
    o.bar1 = new T.Group(); o.bar1.position.set(K.C[0], K.C[1], 0); o.top.add(o.bar1);   // upper bar, tilts about the rod pin
    barEnds(o.bar1, [rel(K.L, K.C), [0, 0], rel(K.R, K.C)]);
    // the bar passes over the rod pin: pins at centre sit on the rod (rod z 24..34, so the head is z 34..37)
    P.at(P.box(12, 160, 10, c.mat("rod")), K.C[0], 270, 29, o.top);                       // rod x 61..73, y 190..350, z 24..34
    o.bar2 = new T.Group(); scene.add(o.bar2);                                            // lower bar, at its middle pin
    barEnds(o.bar2, [rel(K.E, K.D), [0, 0], rel(K.F, K.D)]);
    // spring above the rod, up to the cap of the guide
    o.spring = new T.Group(); o.spring.rotation.z = Math.PI / 2; scene.add(o.spring);
    o.coil = P.spring({ radius: 5, wire: 1.2, turns: 9, length: 50, material: c.mat("spring") }); o.spring.add(o.coil);
    // supports. plate x -70..270, y -100..410, z -40..-30; gear shafts end at z -30
    P.at(P.box(340, 510, 10, c.fixed), 100, 155, -35, scene);
    P.at(P.box(380, 12, 110, c.fixed), 100, -106, -25, scene);                            // base x -90..290, y -112..-100, z -80..30; plate stands on y -100
    P.at(P.box(26, 138, 46, c.fixed), 67, 331, -7, scene);                                // spine x 54..80, y 262..400, z -30..16
    P.at(P.box(6, 60, 20, c.fixed), 57, 292, 26, scene);                                  // left cheek x 54..60, y 262..322, z 16..36
    P.at(P.box(6, 60, 20, c.fixed), 77, 292, 26, scene);                                  // right cheek x 74..80, y 262..322, z 16..36
    P.at(P.box(54, 10, 70, c.fixed), 67, 405, 5, scene);                                  // cap x 40..94, y 400..410, z -30..40; spring hangs from its underside
    o.kin.step(0, 400);
    this.step(c, 0, { w: 0, playing: false, rpm: 0, set: function () {} });
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, i, r;
    o.a += S.w * dt;
    r = o.kin.step(o.a, 30);
    var x = r.x, Pn = r.P, s = x[0], phi = x[1], psi = x[4];
    function rot(v, p) { var cs = Math.cos(p), sn = Math.sin(p); return [v[0] * cs - v[1] * sn, v[0] * sn + v[1] * cs]; }
    for (i = 0; i < 3; i++) o.g[i].rotation.z = r.rots[i];
    o.top.position.set(0, s, 0);
    o.bar1.rotation.z = phi;
    o.bar2.position.set(x[2], x[3], 0); o.bar2.rotation.z = psi;
    var Cw = [K.C[0], K.C[1] + s], Lw = rot([K.L[0] - K.C[0], K.L[1] - K.C[1]], phi), Rw = rot([K.R[0] - K.C[0], K.R[1] - K.C[1]], phi);
    Lw = [Cw[0] + Lw[0], Cw[1] + Lw[1]]; Rw = [Cw[0] + Rw[0], Cw[1] + Rw[1]];
    var Ew = rot([K.E[0] - K.D[0], K.E[1] - K.D[1]], psi), Fw = rot([K.F[0] - K.D[0], K.F[1] - K.D[1]], psi);
    Ew = [x[2] + Ew[0], x[3] + Ew[1]]; Fw = [x[2] + Fw[0], x[3] + Fw[1]];
    var ends = [[Pn[0], Lw], [Rw, [x[2], x[3]]], [Pn[1], Ew], [Pn[2], Fw]];
    ends.forEach(function (e, k) {
      var l = o.links[k], dx = e[1][0] - e[0][0], dy = e[1][1] - e[0][1], d = Math.hypot(dx, dy);
      l.g.position.set(e[0][0], e[0][1], 0); l.g.rotation.z = Math.atan2(dy, dx);
      l.b.scale.x = d; l.b.position.x = d / 2; l.e2.position.x = d;
    });
    var ty = 350 + s;                                                                      // top of the rod
    o.spring.position.set(K.C[0], ty, 29); o.coil.setLength(400 - ty);
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("a", f(rpm)); S.set("b", f(rpm === 0 ? 0 : rpm * K.N[0] / K.N[2]));
    var h = Math.round(s); S.set("h", (h < 0 ? "−" + -h : h > 0 ? "+" + h : "0") + " mm");
  }
});
