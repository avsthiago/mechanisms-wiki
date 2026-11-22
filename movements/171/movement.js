M507.define({
  number: 171,
  title: "Oscillating engine reversing gear",
  lede: "Two rods, each driven by its own eccentric, rock a curved link. A block in the link works a slide, and the slide moves the valve of the engine. Moving the block to one end of the link makes the engine run one way, and moving it to the other end makes it run backwards.",
  alt: "At the top, a shaft carries two round discs inside two rings. A rod hangs from each ring to the ends of a curved slotted link. A handle sticks out of the link on the left. A straight rod hangs from a block in the slot down to a curved arch with a slot, round a round bearing called the trunnion. Two upright posts guide the arch, and an arm comes in from the left to a pin in its slot.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Eccentric discs", note: "Two round discs fixed on the shaft, each off-centre. They turn inside the rings and push the rods up and down." },
    { key: "rod", color: "#D9B13B", name: "Eccentric rods", note: "Each rod has a ring at the top that fits round a disc. The other end is pinned to one end of the link." },
    { key: "link", color: "#C8873A", name: "Slotted link", note: "A curved bar with a slot along it. The two rods rock it. The handle on the left shifts it sideways." },
    { key: "block", color: "#C2503F", name: "Block and rod", note: "A block rides in the slot of the link and carries a straight rod. Watch it. It follows whichever rod it is nearer to." },
    { key: "slide", color: "#4FA58A", name: "Curved slide", note: "An arch round the trunnion, with a curved slot in it. It moves up and down between two posts as the rod pushes it." },
    { key: "arm", color: "#8E7AA8", name: "Valve arm", note: "An arm on the rock-shaft with a pin in the slot of the slide. The pin moves up and down with the slide, and this works the valve." }
  ],
  controls: [{ id: "b", label: "Block in the slot", value: "0", options: [["-1", "Left end"], ["0", "Middle"], ["1", "Right end"]] }],
  readouts: [{ id: "v", label: "Valve" }, { id: "s", label: "Stroke" }, { id: "d", label: "Engine" }],
  views: { "3d": [330, -120, 1000], front: [0, -195, 1060], side: [900, -195, 0] },
  target: [0, -195, 0],
  how: [
    "The shaft turns two round discs that are fixed off-centre, called eccentrics. Each disc pushes its own rod up and down. The two rods hold the ends of a curved link, so the link rocks. Watch the red block.",
    "The block sits in the slot of the link and rides on a straight rod. With the block at one end of the slot, it copies the rod at that end. With it at the other end, it copies the other rod, and the valve works the opposite way round. In the middle the two rods cancel out and the valve hardly moves. The rod pushes a curved slide, and a pin in the slide's slot carries the motion to the valve. The slot is curved round the trunnion, so the engine can swing without moving the pin.",
    "Try Left end, then Middle, then Right end. Watch the red block and the engine readout."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the posts, the pillar for the rock-shaft, the sizes of the discs and the handle on the link were made up. Brown's lever runs off the drawing, so here it is a short handle fixed to the link. The swing of the cylinder on its trunnion is not shown. The arm that works the valve is drawn straight.",

  K: {
    e: 15, L: 231, psi: 95 * Math.PI / 180, C: 230, pr: 208, pphi: 12.5 * Math.PI / 180,
    T: [0, -405], Rs: 80, Pv: [-210, -355], Q0ang: 110 * Math.PI / 180, slotHalf: 4.5,
    lp: function (u) { return [u, this.C - Math.sqrt(this.C * this.C - u * u)]; },       // slot centre line in the link's own frame
    pins: function () { var s = Math.sin(this.pphi), cs = Math.cos(this.pphi); return [[-this.pr * s, this.C - this.pr * cs], [this.pr * s, this.C - this.pr * cs]]; },
    // eccentric centres for crank angle th
    ecc: function (th) { var a = th - this.psi, b = th + this.psi; return [[this.e * Math.cos(a), this.e * Math.sin(a)], [this.e * Math.cos(b), this.e * Math.sin(b)]]; },
    // link pose q = [Y, alpha, u] for link x-offset X; returns residuals
    res: function (th, X, q) {
      var E = this.ecc(th), p = this.pins(), c = Math.cos(q[1]), s = Math.sin(q[1]), bl = this.lp(q[2]), r = [], i;
      for (i = 0; i < 2; i++) {
        var wx = X + c * p[i][0] - s * p[i][1], wy = q[0] + s * p[i][0] + c * p[i][1];
        r.push(Math.hypot(wx - E[i][0], wy - E[i][1]) - this.L);
      }
      r.push(X + c * bl[0] - s * bl[1]);                                                  // block sits on the vertical line through the shaft
      return r;
    },
    solve: function (th, X, q) {
      var it, i, j, h = 1e-6;
      q = q.slice();
      for (it = 0; it < 30; it++) {
        var f = this.res(th, X, q), n = Math.abs(f[0]) + Math.abs(f[1]) + Math.abs(f[2]);
        if (n < 1e-9) break;
        var J = [[], [], []];
        for (j = 0; j < 3; j++) { var q2 = q.slice(); q2[j] += h; var f2 = this.res(th, X, q2); for (i = 0; i < 3; i++) J[i][j] = (f2[i] - f[i]) / h; }
        var d = this.lin(J, [-f[0], -f[1], -f[2]]);
        for (j = 0; j < 3; j++) q[j] += d[j];
      }
      return q;
    },
    lin: function (A, b) {
      var n = 3, M = [], i, j, k;
      for (i = 0; i < n; i++) M.push(A[i].concat([b[i]]));
      for (i = 0; i < n; i++) {
        var p = i; for (k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
        var t = M[i]; M[i] = M[p]; M[p] = t;
        for (k = i + 1; k < n; k++) { var f = M[k][i] / M[i][i]; for (j = i; j <= n; j++) M[k][j] -= f * M[i][j]; }
      }
      var x = [0, 0, 0];
      for (i = n - 1; i >= 0; i--) { var s = M[i][n]; for (j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
      return x;
    },
    // valve pin: on the arm's circle and on the slide's slot circle (centre raised by dl)
    pin: function (dl, prev) {
      var T = this.T, Pv = this.Pv, c1 = [T[0], T[1] + dl], ra = this.ra, dx = c1[0] - Pv[0], dy = c1[1] - Pv[1], d = Math.hypot(dx, dy);
      var a = (ra * ra - this.Rs * this.Rs + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ra * ra - a * a));
      var mx = Pv[0] + a * dx / d, my = Pv[1] + a * dy / d, p1 = [mx + h * dy / d, my - h * dx / d], p2 = [mx - h * dy / d, my + h * dx / d];
      return Math.hypot(p1[0] - prev[0], p1[1] - prev[1]) < Math.hypot(p2[0] - prev[0], p2[1] - prev[1]) ? p1 : p2;
    },
    init: function () {
      var T = this.T, Pv = this.Pv;
      this.Q0 = [T[0] + this.Rs * Math.cos(this.Q0ang), T[1] + this.Rs * Math.sin(this.Q0ang)];
      this.ra = Math.hypot(this.Q0[0] - Pv[0], this.Q0[1] - Pv[1]);
      this.Yref = this.stats(0, 0).meanY;
      return this;
    },
    // one full turn at link offset X: mean block height, valve pin travel (mean, min, max) and its phase against the crank
    stats: function (X, useRef) {
      var q = [-255, 0, -X], n = 72, i, ys = [], ps = [], cs = [], mean = 0, mn = 1e9, mx = -1e9, corr = 0, my = 0, pm = this.Q0, k;
      for (k = 0; k < 2; k++) for (i = 0; i < n; i++) {                                    // first lap settles, second records
        var th = 2 * Math.PI * i / n; q = this.solve(th, X, q);
        if (k === 1) { ys.push(q[0] + this.lp(q[2])[1] * Math.cos(q[1]) + q[2] * Math.sin(q[1])); }
      }
      for (i = 0; i < n; i++) my += ys[i] / n;
      var ref = useRef === 0 ? my : this.Yref, q2 = [-255, 0, -X];
      for (i = 0; i < n; i++) {
        pm = this.pin(ys[i] - ref, pm); ps.push(pm[1]); mean += pm[1] / n; mn = Math.min(mn, pm[1]); mx = Math.max(mx, pm[1]);
      }
      for (i = 0; i < n; i++) corr += (ps[i] - mean) * Math.cos(2 * Math.PI * i / n) / n;
      return { meanY: my, mean: mean, min: mn, max: mx, corr: corr };
    }
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K.init(), PI = Math.PI;
    var o = this.o = { a: -PI / 2, X: 0, q: [-255, 0, 0], pm: K.Q0.slice(), cacheX: null, st: null };
    function pol(C, r, a, d) { return [C[0] + r * d(a)[0], C[1] + r * d(a)[1]]; }
    function slotPath(C, R, a1, a2, half, d, t) {                                          // stadium slot following a circle arc of radius R
      var pts = [], i, n = 40, b;
      function cap(a, b0, b1) { for (i = 0; i <= 12; i++) { b = b0 + (b1 - b0) * i / 12; var cE = pol(C, R, a, d); pts.push(new T.Vector2(cE[0] + half * (Math.cos(b) * d(a)[0] + Math.sin(b) * t(a)[0]), cE[1] + half * (Math.cos(b) * d(a)[1] + Math.sin(b) * t(a)[1]))); } }
      for (i = 0; i <= n; i++) { var p = pol(C, R + half, a1 + (a2 - a1) * i / n, d); pts.push(new T.Vector2(p[0], p[1])); }
      cap(a2, 0, PI);
      for (i = 0; i <= n; i++) { var p2 = pol(C, R - half, a2 + (a1 - a2) * i / n, d); pts.push(new T.Vector2(p2[0], p2[1])); }
      cap(a1, PI, 2 * PI);
      return new T.Path(pts);
    }
    function bandShape(C, r0, r1, a0, a1, d) {
      var sh = new T.Shape(), i, n = 30, p;
      for (i = 0; i <= n; i++) { p = pol(C, r1, a0 + (a1 - a0) * i / n, d); if (i === 0) sh.moveTo(p[0], p[1]); else sh.lineTo(p[0], p[1]); }
      for (i = n; i >= 0; i--) { p = pol(C, r0, a0 + (a1 - a0) * i / n, d); sh.lineTo(p[0], p[1]); }
      return sh;
    }
    function ext(sh, z0, z1, m) { var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 40 }); g.translate(0, 0, z0); return P.mesh(g, m); }
    function ring(rin, rout, z0, z1, m) { var sh = new T.Shape(), h = new T.Path(); sh.absarc(0, 0, rout, 0, 2 * PI, false); h.absarc(0, 0, rin, 0, 2 * PI, true); sh.holes.push(h); return ext(sh, z0, z1, m); }

    // eccentric discs on the shaft (z -15 bearing face .. 22)
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(7, 37, c.mat("disc")), 0, 0, 3.5, o.rot);                                  // shaft z -15..22, ends on the bearing face
    P.at(P.box(3, 18, 1, c.mat("disc", "dark")), 0, 0, 22.5, o.rot);                       // key mark z 22..23
    var e = K.e, ea = -K.psi, eb = K.psi;
    P.at(P.cylZ(28, 7, c.mat("disc")), e * Math.cos(ea), e * Math.sin(ea), 7.5, o.rot);      // disc one z 4..11
    P.at(P.cylZ(28, 6, c.mat("disc")), e * Math.cos(eb), e * Math.sin(eb), 14.5, o.rot);     // disc two z 11.5..17.5
    P.at(P.cylZ(3, .7, c.mat("disc", "dark")), e * Math.cos(eb), e * Math.sin(eb), 17.85, o.rot);   // centre mark z 17.5..18.2
    // rings and rods: local origin at the ring centre, rod hangs along -Y
    o.rods = [];
    [[7.5, 4.5, 10.5, 4.8, 10.2, 4.5, 11], [14.5, 12, 17, 12.3, 16.7, 12, 18]].forEach(function (zz, i) {
      var g = new T.Group(); scene.add(g);
      g.add(ring(28.4, 36.5, zz[1], zz[2], c.mat("rod")));                                  // ring r 28.4..36.5 round the disc (r 28)
      [1, -1].forEach(function (s) { P.at(P.box(10, 10, zz[4] - zz[3] + .4, c.mat("rod")), s * 36, 0, zz[0], g); });   // ears x 31..41, thinner than the ring
      P.at(P.box(11, K.L - 30, zz[4] - zz[3], c.mat("rod")), 0, -(K.L + 30) / 2 + 0, zz[0], g);   // bar y -30..-L+0
      P.at(P.cylZ(10, zz[4] - zz[3], c.mat("rod")), 0, -K.L, zz[0], g);                      // eye round the link pin
      P.at(P.cylZ(3.4, zz[6] + 3.9, c.mat("rod", "dark")), 0, -K.L, (zz[6] - 3.9) / 2, g);   // pin through the link ear, z -3.9..zz6
      o.rods.push(g);
    });
    // link: arc band with slot, ears for the rod pins and a handle on the left
    o.link = new T.Group(); scene.add(o.link);
    var dL = function (a) { return [Math.sin(a), -Math.cos(a)]; }, tL = function (a) { return [Math.cos(a), Math.sin(a)]; }, CL = [0, K.C];
    var bs = bandShape(CL, 220, 240, -15 * PI / 180, 15 * PI / 180, dL); bs.holes.push(slotPath(CL, K.C, -12.5 * PI / 180, 12.5 * PI / 180, K.slotHalf, dL, tL));
    o.link.add(ext(bs, -4, 4, c.mat("link")));                                              // plate z -4..4, slot through it
    [-1, 1].forEach(function (s) {
      var pa = s * K.pphi, pp = K.pins()[s < 0 ? 0 : 1];
      o.link.add(ext(bandShape(CL, 204, 222, pa - 3 * PI / 180, pa + 3 * PI / 180, dL), -3.6, 3.6, c.mat("link")));   // tab z -3.6..3.6
      P.at(P.cylZ(12, 7.2, c.mat("link")), pp[0], pp[1], 0, o.link);                          // ear round the pin
    });
    P.at(P.box(50, 8, 7, c.mat("link")), -83, 6, 0, o.link);                                // handle x -108..-58, z -3.5..3.5
    P.at(P.cylZ(6, 7, c.mat("link")), -108, 6, 0, o.link);                                  // knob at the tip, z -3.5..3.5
    // block, rod and the slide
    o.rodG = new T.Group(); scene.add(o.rodG);
    o.die = P.cylZ(4.2, 7, c.mat("block")); scene.add(o.die);                                // die in the slot, z -3.5..3.5, placed each frame
    P.at(P.cylZ(3.4, 5, c.mat("block")), 0, 0, 6, o.die);                                    // neck z 3.5..8.5 (relative to the die at z 0)
    P.at(P.cylY(3.5, 246, c.mat("block")), 0, -185, 7.5, o.rodG);                           // rod y -308..-62, z 4..11
    o.slide = new T.Group(); scene.add(o.slide);
    var Tt = K.T, dS = function (a) { return [Math.cos(a), Math.sin(a)]; }, tS = function (a) { return [-Math.sin(a), Math.cos(a)]; };
    var ss = bandShape([0, 0], 62, 94, 0, PI, dS); ss.holes.push(slotPath([0, 0], K.Rs, 25 * PI / 180, 155 * PI / 180, K.slotHalf, dS, tS));
    var sm = ext(ss, -4, 4, c.mat("slide")); sm.position.set(Tt[0], Tt[1], 0); o.slide.add(sm);   // arch r 62..94, z -4..4, slot at r 80
    P.at(P.cylZ(9, 7.6, c.mat("slide")), 0, Tt[1] + 99, 0, o.slide);                         // lug for the rod, z -3.8..3.8
    P.at(P.cylZ(3.4, 12.9, c.mat("slide", "dark")), 0, Tt[1] + 99, 2.55, o.slide);         // pin z -3.9..9, joins the rod
    [-1, 1].forEach(function (s) {
      P.at(P.box(26, 57, 10.6, c.mat("slide")), s * 83, Tt[1] + 28.5, -1.7, o.slide);       // shoe x 70..96, y T..T+57, z -7..3.6
    });
    // valve arm on the rock-shaft
    o.arm = P.rod(3, c.mat("arm")); scene.add(o.arm);
    o.armPin = P.cylZ(3.4, 12.5, c.mat("arm")); scene.add(o.armPin);                         // pin through the slot, z -3.5..9
    P.at(P.cylZ(6, 13, c.mat("arm")), K.Pv[0], K.Pv[1], 6.5, scene);                         // rock-shaft z 0..13, starts on the pillar face
    P.at(P.cylZ(9, 6, c.mat("arm")), K.Pv[0], K.Pv[1], 7.5, scene);                          // hub z 4.5..10.5
    // supports
    P.at(P.box(24, 482, 10, c.fixed), 0, -209, -30, scene);                                  // beam x -12..12, y -450..32, z -35..-25
    P.at(P.box(64, 64, 10, c.fixed), 0, 0, -20, scene);                                      // bearing pad y -32..32, z -25..-15; shaft ends on its face
    P.at(P.box(520, 12, 60, c.fixed), 0, -456, -10, scene);                                  // base x -260..260, y -462..-450, z -40..20
    P.at(P.cylZ(24, 20, c.fixed), Tt[0], Tt[1], -15, scene);                                 // trunnion z -25..-5, on the beam face
    var gb = P.guideBlock({ w: 24, d: 24, h: 14, hole: 4.2, material: c.fixed });
    P.at(gb, 0, -95, 7.5, scene);                                                            // guide for the rod x -12..12, y -102..-88, z -4.5..19.5
    P.at(P.box(20, 14, 20.5, c.fixed), 0, -95, -14.75, scene);                               // arm from the beam z -25..-4.5
    [-1, 1].forEach(function (s) { P.at(P.cylY(3.5, 150, c.fixed), s * 83, -375, -10, scene); });   // posts y -450..-300, z -13.5..-6.5, behind the shoes
    P.at(P.box(30, 110, 10, c.fixed), K.Pv[0], -395, -5, scene);                             // rock-shaft pillar x -225..-195, y -450..-340, z -10..0
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, tgt = -40 * (+(S.controls.b || "0")), d;                 // block at the left end means the link sits to the right
    d = tgt - o.X; var mv = 150 * (dt || 0);
    o.X += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    o.a += S.w * dt;
    var th = o.a, X = o.X, q = o.q = K.solve(th, X, o.q), c1 = Math.cos(q[1]), s1 = Math.sin(q[1]), bl = K.lp(q[2]);
    o.link.position.set(X, q[0], 0); o.link.rotation.z = q[1];
    var bx = X + c1 * bl[0] - s1 * bl[1], by = q[0] + s1 * bl[0] + c1 * bl[1];
    o.die.position.set(bx, by, 0);
    var Eh = K.ecc(th), pn = K.pins(), i;
    for (i = 0; i < 2; i++) {
      var px = X + c1 * pn[i][0] - s1 * pn[i][1], py = q[0] + s1 * pn[i][0] + c1 * pn[i][1];
      o.rods[i].position.set(Eh[i][0], Eh[i][1], 0); o.rods[i].rotation.z = Math.atan2(px - Eh[i][0], -(py - Eh[i][1]));
    }
    o.rot.rotation.z = th;
    if (o.cacheX === null || Math.abs(o.cacheX - X) > .2) { o.st = K.stats(X); o.cacheX = X; }
    var dl = by - K.Yref;
    o.slide.position.y = dl; o.rodG.position.y = dl;
    o.pm = K.pin(dl, o.pm);
    o.armPin.position.set(o.pm[0], o.pm[1], 2.75);
    o.arm.span(K.Pv[0], K.Pv[1], 7.5, o.pm[0], o.pm[1], 7.5);
    var tr = o.pm[1] - o.st.mean, str = o.st.max - o.st.min;
    function sg(v) { v = Math.round(v); return (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm"; }
    S.set("v", sg(tr)); S.set("s", Math.round(str) + " mm");
    S.set("d", str < 6 ? "Still" : (o.st.corr < 0 ? "Forward" : "Reverse"));
  }
});
