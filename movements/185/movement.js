M507.define({
  number: 185,
  title: "Locomotive link motion",
  lede: "Two eccentrics on one shaft rock a curved, slotted link. A block in the slot passes the rocking on to the valve of the engine. A hand lever raises or lowers the link, and this sets how long steam is let in, and which way the engine runs.",
  alt: "On the right, a shaft carries two round discs inside two rings. A long rod runs left from each ring to one end of a curved link with a slot. A block in the slot is joined by an upright lever to the valve rod, which goes into a frame on the left. A hand lever on top of the frame, with a notched arc beside its handle, holds up the link by a long hanging rod.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Shaft and eccentrics", note: "Two round discs fixed off-centre on the shaft, called eccentrics. One works the engine forward and the other backward." },
    { key: "rod", color: "#D9B13B", name: "Eccentric rods", note: "Each rod has a ring round one disc. The upper rod is pinned to the top of the link and the lower rod to the bottom." },
    { key: "link", color: "#C8873A", name: "Slotted link", note: "A curved bar with a slot along it. The two rods rock its ends, and the hanging rod sets its height." },
    { key: "block", color: "#D9B13B", name: "Block and rocker", note: "A block slides in the slot and works an upright lever that rocks on a fixed pin. Watch the red block. It follows whichever end of the link it is nearer to." },
    { key: "valve", color: "#4FA58A", name: "Valve rod", note: "Slides in and out of the frame and moves the valve of the engine. The valve lets steam into the cylinder." },
    { key: "lever", color: "#8E7AA8", name: "Hand lever", note: "The driver moves it along the notched arc. Its short end lifts or lowers the link through the long hanging rod." }
  ],
  controls: [{ id: "g", label: "Block in the link", value: "part", options: [["full", "Full forward"], ["part", "Part way"], ["mid", "Middle"], ["back", "Full back"]] }],
  readouts: [{ id: "t", label: "Valve travel" }, { id: "c", label: "Steam cut off" }, { id: "s", label: "Shaft" }],
  views: { "3d": [-364, 214, 781], front: [0, 15, 800], side: [800, 15, 0] },
  target: [0, 15, 0],
  how: [
    "The shaft turns two discs fixed off-centre, called eccentrics. Each one pushes its rod to and fro. The two rods hold the two ends of a curved link, so the link rocks. A block in the slot of the link works a lever, and the lever slides the valve rod.",
    "The two eccentrics point opposite ways. With the block at the top of the link, it copies the upper rod and the engine runs forward. At the bottom it copies the lower rod and the engine runs backward. In the middle the two rods nearly cancel out, so the valve hardly moves and lets in no steam. Part way, the valve moves less and shuts sooner. The rest of each push is done by the steam spreading out, which saves steam.",
    "Try Full forward, then Part way, then Middle. Watch the red block and the cut off readout. Then try Full back and see the shaft turn the other way."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the beam, the stands, the bearing for the shaft and the sizes of the eccentrics were made up. The valve itself and the cylinder are not shown. The cut off is worked out for a made-up valve that must move a set distance before it opens. In the middle the valve still moves a little, as on real engines, but too little to let steam in. The shaft turns the other way in back gear, as the engine would.",

  K: {
    O: [330, -50], e: 10, al: -25 * Math.PI / 180, Rl: 166, pin: [16, 30], lug: [-12, 0],
    Hp: [-82, 66], ra: 60, H0: [-22, 58], Rp: [10, -1], T0: [12, 40], Ys: 36, P0x: -25, u0: 18, lapv: 4.65, mm: 4,
    q0: [4, -60, 0],
    ecc: function (th) {                                                                    // forward and backward eccentric centres
      var a = th + Math.PI / 2 + this.al, b = th - Math.PI / 2 - this.al, O = this.O;
      return [[O[0] + this.e * Math.cos(a), O[1] + this.e * Math.sin(a)], [O[0] + this.e * Math.cos(b), O[1] + this.e * Math.sin(b)]];
    },
    tf: function (q, p) { var c = Math.cos(q[2]), s = Math.sin(q[2]); return [q[0] + c * p[0] - s * p[1], q[1] + s * p[0] + c * p[1]]; },
    hand: function (h) { return [this.Hp[0] + this.ra * Math.cos(h), this.Hp[1] + this.ra * Math.sin(h)]; },
    res: function (th, h, q) {
      var E = this.ecc(th), pt = this.tf(q, [this.pin[0], this.pin[1]]), pb = this.tf(q, [this.pin[0], -this.pin[1]]), lg = this.tf(q, this.lug), H = this.hand(h);
      return [Math.hypot(pt[0] - E[0][0], pt[1] - E[0][1]) - this.L, Math.hypot(pb[0] - E[1][0], pb[1] - E[1][1]) - this.L, Math.hypot(lg[0] - H[0], lg[1] - H[1]) - this.Ls];
    },
    solve: function (th, h, q) {
      var it, i, j, eps = 1e-6;
      q = q.slice();
      for (it = 0; it < 30; it++) {
        var f = this.res(th, h, q);
        if (Math.abs(f[0]) + Math.abs(f[1]) + Math.abs(f[2]) < 1e-9) break;
        var J = [[], [], []];
        for (j = 0; j < 3; j++) { var q2 = q.slice(); q2[j] += eps; var f2 = this.res(th, h, q2); for (i = 0; i < 3; i++) J[i][j] = (f2[i] - f[i]) / eps; }
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
    slot: function (u) { return [this.Rl - Math.sqrt(this.Rl * this.Rl - u * u), u]; },      // slot centre line in the link's frame
    // block: on the slot circle of the link and on the circle of the rocker's lower arm; then rocker, valve rod and stem
    rest: function (q, prev) {
      var C = this.tf(q, [this.Rl, 0]), R = this.Rp, dx = C[0] - R[0], dy = C[1] - R[1], d = Math.hypot(dx, dy), r1 = this.rl, r2 = this.Rl;
      var a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, r1 * r1 - a * a));
      var mx = R[0] + a * dx / d, my = R[1] + a * dy / d, p1 = [mx + hh * dy / d, my - hh * dx / d], p2 = [mx - hh * dy / d, my + hh * dx / d];
      var B = Math.hypot(p1[0] - prev[0], p1[1] - prev[1]) < Math.hypot(p2[0] - prev[0], p2[1] - prev[1]) ? p1 : p2;
      var c = Math.cos(q[2]), s = Math.sin(q[2]), lx = B[0] - q[0], ly = B[1] - q[1], u = -s * lx + c * ly;
      var ang = Math.atan2(B[1] - R[1], B[0] - R[0]), ta = ang + this.dl, Tp = [R[0] + this.rt * Math.cos(ta), R[1] + this.rt * Math.sin(ta)];
      var sx = Tp[0] - Math.sqrt(this.Lv * this.Lv - (this.Ys - Tp[1]) * (this.Ys - Tp[1]));
      return { B: B, u: u, ang: ang, T: Tp, sx: sx };
    },
    init: function () {
      var E = this.ecc(0), q = this.q0, pt = this.tf(q, this.pin), pb = this.tf(q, [this.pin[0], -this.pin[1]]), lg = this.tf(q, this.lug), B0 = this.tf(q, this.slot(this.u0)), R = this.Rp;
      this.L = (Math.hypot(pt[0] - E[0][0], pt[1] - E[0][1]) + Math.hypot(pb[0] - E[1][0], pb[1] - E[1][1])) / 2;   // one length for both rods
      this.h0 = Math.atan2(this.H0[1] - this.Hp[1], this.H0[0] - this.Hp[0]);
      var H = this.hand(this.h0); this.Ls = Math.hypot(lg[0] - H[0], lg[1] - H[1]);
      this.rl = Math.hypot(B0[0] - R[0], B0[1] - R[1]); this.rt = Math.hypot(this.T0[0] - R[0], this.T0[1] - R[1]);
      this.dl = Math.atan2(this.T0[1] - R[1], this.T0[0] - R[0]) - Math.atan2(B0[1] - R[1], B0[0] - R[0]);
      this.Lv = Math.hypot(this.T0[0] - this.P0x, this.T0[1] - this.Ys); this.B0 = B0;
      var me = this; function mu(h) { return me.lap(h, 1, 36).mu; }
      function find(t) { var lo = this_lo, hi = this_hi, i; for (i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (mu(m) > t) lo = m; else hi = m; } return (lo + hi) / 2; }
      var this_lo = this.h0 - 0.8, this_hi = this.h0 + 0.8;                                 // lower h lowers the link and raises the block in the slot
      this.H = { full: find(24), part: this.h0, mid: find(0), back: find(-22) };
      return this;
    },
    // one turn at handle angle h, shaft turning way d: mean block place in the slot, valve stem samples
    lap: function (h, d, n) {
      var q = this.q0.slice(), B = this.B0, i, k, vs = [], us = [], mu = 0, r;
      for (k = 0; k < 2; k++) for (i = 0; i < n; i++) {
        q = this.solve(d * 2 * Math.PI * i / n, h, q); r = this.rest(q, B); B = r.B;
        if (k === 1) { vs.push(r.sx); us.push(r.u); mu += r.u / n; }
      }
      return { mu: mu, vs: vs, us: us };
    },
    stats: function (h, d) {
      var n = 144, L = this.lap(h, d, n), vs = L.vs, mean = 0, mn = 1e9, mx = -1e9, i, lap = this.lapv;
      for (i = 0; i < n; i++) { mean += vs[i] / n; mn = Math.min(mn, vs[i]); mx = Math.max(mx, vs[i]); }
      var tot = 0;
      [1, -1].forEach(function (sg) {
        var best = 0;
        [0, n / 2].forEach(function (k) {
          function op(j) { return sg * (vs[((j % n) + n) % n] - mean) - lap; }
          var j = k, lim = k + n / 4;
          while (j < lim && op(j) <= 0) j++;
          if (op(j) <= 0) return;
          while (op(j) > 0 && j < k + n) j++;
          var a = op(j - 1), b = op(j), jb = j - 1 + a / (a - b), ph = 2 * Math.PI * (jb - k) / n;
          best = Math.max(best, ph >= Math.PI ? 1 : (1 - Math.cos(ph)) / 2);
        });
        tot += best / 2;
      });
      return { travel: mx - mn, cut: tot, mean: mean, umin: Math.min.apply(null, L.us), umax: Math.max.apply(null, L.us) };
    }
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = new c.THREE.Group(), K = this.K, PI = Math.PI;
    scene.position.x = -70; c.scene.add(scene);                                             // whole machine shifted left to centre it
    if (!K.H) K.init();
    var o = this.o = { th: 0, dir: 1, h: K.h0, q: K.q0.slice(), B: K.B0, st: null, ch: null, cd: 0 };
    function ext(sh, z0, z1, m) { var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 40 }); g.translate(0, 0, z0); return P.mesh(g, m); }
    function ring(rin, rout, z0, z1, m) { var sh = new T.Shape(), hl = new T.Path(); sh.absarc(0, 0, rout, 0, 2 * PI, false); hl.absarc(0, 0, rin, 0, 2 * PI, true); sh.holes.push(hl); return ext(sh, z0, z1, m); }
    // shaft and eccentrics; shaft z -20 (hanger face) .. 14
    o.rot = new T.Group(); o.rot.position.set(K.O[0], K.O[1], 0); scene.add(o.rot);
    P.at(P.cylZ(9, 34, c.mat("disc")), 0, 0, -3, o.rot);                                    // shaft z -20..14
    P.at(P.box(3, 16, 1, c.mat("disc", "dark")), 0, 0, 14.5, o.rot);                          // key mark z 14..15
    var bf = PI / 2 + K.al, bb = -PI / 2 - K.al;
    P.at(P.cylZ(34, 10, c.mat("disc")), K.e * Math.cos(bf), K.e * Math.sin(bf), 7, o.rot);    // forward disc z 2..12
    P.at(P.cylZ(34, 10, c.mat("disc")), K.e * Math.cos(bb), K.e * Math.sin(bb), -7, o.rot);   // backward disc z -12..-2
    P.at(P.cylZ(3, 0.7, c.mat("disc", "dark")), K.e * Math.cos(bf), K.e * Math.sin(bf), 12.35, o.rot);   // centre mark z 12..12.7
    // straps and rods: local origin at the disc centre, rod along local +X to the link pin
    o.rods = [];
    [7, -7].forEach(function (zc) {
      var g = new T.Group(); scene.add(g);
      g.add(ring(34.4, 42, zc - 4, zc + 4, c.mat("rod")));                                  // strap r 34.4..42 round the disc (r 34)
      [1, -1].forEach(function (s) { P.at(P.box(12, 8, 7.6, c.mat("rod")), 0, s * 43, zc, g); });   // lugs y 39..47, as drawn
      P.at(P.box(8, 12, 7.6, c.mat("rod")), -43, 0, zc, g);                                // back lug x -47..-39
      // heavy rod: a long tapered bar from the strap to the eye, never inside the strap's bore (r 34.4)
      var ri = 34.4, a6 = PI / 7, w0 = ri * Math.sin(a6), x0 = ri * Math.cos(a6), xe = K.L - 6, we = 6;
      var rs = new T.Shape(); rs.moveTo(x0, w0); rs.lineTo(xe, we); rs.lineTo(xe, -we); rs.lineTo(x0, -w0); rs.absarc(0, 0, ri, -a6, a6, false);
      g.add(ext(rs, zc - 2.5, zc + 2.5, c.mat("rod")));                                    // bar z zc-2.5..zc+2.5, inside the strap's thickness
      P.at(P.cylZ(8, 5, c.mat("rod")), K.L, 0, zc, g);                                      // eye round the link pin
      P.at(P.cylZ(2.8, Math.abs(zc) + 3, c.mat("rod", "dark")), K.L, 0, zc / 2 + (zc > 0 ? 1.5 : -1.5), g);   // pin from the link face to past the eye
      o.rods.push(g);
    });
    // link: band round the slot, bosses for the rod pins, and a lug for the hanging rod
    o.link = new T.Group(); scene.add(o.link);
    var CL = [K.Rl, 0], umax = 42, am = Math.asin(umax / K.Rl), as = Math.asin(34 / K.Rl);    // slot ends at 34 each side of the middle
    function pt(r, a) { return [CL[0] - r * Math.cos(a), r * Math.sin(a)]; }
    var band = new T.Shape(), i, p, n = 30;
    for (i = 0; i <= n; i++) { p = pt(K.Rl + 9, -am + 2 * am * i / n); if (i) band.lineTo(p[0], p[1]); else band.moveTo(p[0], p[1]); }
    for (i = n; i >= 0; i--) { p = pt(K.Rl - 9, -am + 2 * am * i / n); band.lineTo(p[0], p[1]); }
    var sl = new T.Path(), hw = 4.6;
    for (i = 0; i <= n; i++) { p = pt(K.Rl + hw, -as + 2 * as * i / n); if (i) sl.lineTo(p[0], p[1]); else sl.moveTo(p[0], p[1]); }
    function cap(a, b0, b1) { var ce = pt(K.Rl, a), d = [-Math.cos(a), Math.sin(a)], t = [Math.sin(a), Math.cos(a)], k, bb;
      for (k = 0; k <= 10; k++) { bb = b0 + (b1 - b0) * k / 10; sl.lineTo(ce[0] + hw * (Math.cos(bb) * d[0] + Math.sin(bb) * t[0]), ce[1] + hw * (Math.cos(bb) * d[1] + Math.sin(bb) * t[1])); } }
    cap(as, 0, PI);
    for (i = n; i >= 0; i--) { p = pt(K.Rl - hw, -as + 2 * as * i / n); sl.lineTo(p[0], p[1]); }
    cap(-as, PI, 2 * PI);
    band.holes.push(sl);
    o.link.add(ext(band, -3.5, 3.5, c.mat("link")));                                         // link plate z -3.5..3.5
    [1, -1].forEach(function (s) {
      P.at(P.cylZ(8, 7, c.mat("link")), K.pin[0], s * K.pin[1], 0, o.link);                 // boss round each rod pin, z -3.5..3.5
      P.at(P.box(12, 8, 7, c.mat("link")), 8, s * K.pin[1], 0, o.link);                    // web x 2..14, joins band and boss
    });
    P.at(P.cylZ(6, 7, c.mat("link")), K.lug[0], K.lug[1], 0, o.link);                       // lug boss x -18..-6 on the band edge (-9), z -3.5..3.5
    P.at(P.cylZ(2.8, 13.5, c.mat("link", "dark")), K.lug[0], K.lug[1], 9.25, o.link);       // lug pin z 3.5..16
    // block in the slot, its pin, the rocker
    o.die = new T.Group(); scene.add(o.die);
    P.at(P.box(8, 10, 6, c.mat("block", "mark")), 0, 0, 0, o.die);                           // block z -3.5..3.5, 8 wide in a 9.2 slot
    P.at(P.cylZ(2.8, 15, c.mat("block", "dark")), 0, 0, -10.5, o.die);                    // pin z -18..-3.5, back to the rocker
    o.rk = new T.Group(); o.rk.position.set(K.Rp[0], K.Rp[1], 0); scene.add(o.rk);          // rotated so local +X points at the block
    P.at(P.box(K.rl, 6, 5, c.mat("block")), K.rl / 2, 0, -15, o.rk);                         // lower arm z -17.5..-12.5
    P.at(P.cylZ(5, 5, c.mat("block")), K.rl, 0, -15, o.rk);
    var ua = new T.Group(); ua.rotation.z = K.dl; o.rk.add(ua);
    P.at(P.box(K.rt, 6, 5, c.mat("block")), K.rt / 2, 0, -15, ua);                           // upper arm
    P.at(P.cylZ(5, 5, c.mat("block")), K.rt, 0, -15, ua);
    P.at(P.cylZ(2.8, 8, c.mat("block", "dark")), K.rt, 0, -10.5, ua);                         // pin z -14.5..-6.5 into the valve rod
    P.at(P.cylZ(8, 5, c.mat("block")), 0, 0, -15, o.rk);                                      // hub z -17.5..-12.5
    P.at(P.cylZ(4, 10, c.mat("block", "dark")), 0, 0, -15, o.rk);                             // fixed pin z -20..-10, starts on the stand face
    // valve rod and stem
    o.vrod = P.rod(2.5, c.mat("valve")); scene.add(o.vrod);
    o.stem = new T.Group(); scene.add(o.stem);
    P.at(P.cylX(3, 37, c.mat("valve")), -18.5, 0, -10, o.stem);                               // stem x -37..0 from its pin, z -13..-7
    P.at(P.cylZ(5, 6, c.mat("valve")), 0, 0, -10, o.stem);                                    // eye z -13..-7
    P.at(P.cylZ(4, 3, c.mat("valve")), -10, 0, -10, o.stem);                                  // collar, as drawn
    // hand lever: local +X is the short arm; knob on the long arm
    o.lev = new T.Group(); o.lev.position.set(K.Hp[0], K.Hp[1], 0); scene.add(o.lev);
    P.at(P.box(K.ra + 6, 6, 4, c.mat("lever")), K.ra / 2, 0, 8, o.lev);                      // short arm z 6..10
    P.at(P.box(150, 5, 4, c.mat("lever")), -75, 0, 8, o.lev);                                 // long arm to x -150
    P.at(P.sphere(5, c.mat("lever")), -155, 0, 8, o.lev);                                     // knob
    P.at(P.cylZ(9, 4, c.mat("lever")), 0, 0, 8, o.lev);                                       // hub z 6..10
    P.at(P.cylZ(4, 12, c.mat("lever", "dark")), 0, 0, 6, o.lev);                              // pivot pin z 0..12, from the stand face
    P.at(P.cylZ(2.8, 10, c.mat("lever", "dark")), K.ra, 0, 12, o.lev);                      // pin z 7..17 for the hanging rod
    o.hang = P.rod(2.5, c.mat("lever")); scene.add(o.hang);
    // supports
    P.at(P.box(118, 20, 40, c.fixed), -135, 36, -20, scene);                                 // frame top x -194..-76, y 26..46, z -40..0
    P.at(P.box(26, 102, 40, c.fixed), -89, -25, -20, scene);                                  // frame upright x -102..-76, y -76..26, z -40..0, under the top
    var gd = P.guideBlock({ w: 16, h: 32, d: 16, hole: 3.5, material: c.fixed }); gd.rotation.z = PI / 2;
    P.at(gd, -60, K.Ys, -10, scene);                                                          // stem guide x -76..-44, y 28..44, z -18..-2, on the frame face
    P.at(P.box(20, 28, 6, c.fixed), K.Hp[0], 60, -3, scene);                                  // lever stand x -92..-72, y 46..74, z -6..0, on the frame top
    P.at(P.box(420, 6, 20, c.fixed), 134, -15, -30, scene);                                   // beam x -76..344, y -18..-12, z -40..-20
    P.at(P.box(24, 16, 20, c.fixed), K.Rp[0], -4, -30, scene);                                // rocker stand x -2..22, y -12..4, z -40..-20, on the beam
    P.at(P.box(28, 82, 20, c.fixed), K.O[0], -59, -30, scene);                                // shaft hanger x 316..344, y -100..-18, z -40..-20
    // notched arc for the hand lever, left of the frame, on a post standing on the frame top
    var q = new T.Shape(), r0 = 128, r1 = 134, a1 = 158 * PI / 180, a2 = 220 * PI / 180, yt = K.Hp[1] + r1 * Math.sin(a1), yb = yt - 8, ai = Math.asin((yb - K.Hp[1]) / r0);
    function hp(r, a) { return [K.Hp[0] + r * Math.cos(a), K.Hp[1] + r * Math.sin(a)]; }
    for (i = 0; i <= n; i++) { p = hp(r1, a2 + (a1 - a2) * i / n); if (i) q.lineTo(p[0], p[1]); else q.moveTo(p[0], p[1]); }
    q.lineTo(-178, yt); q.lineTo(-178, yb);
    for (i = 0; i <= n; i++) { p = hp(r0, (PI - ai) + (a2 - PI + ai) * i / n); q.lineTo(p[0], p[1]); }
    scene.add(ext(q, -6, 0, c.fixed));                                                       // arc z -6..0; beside the frame top (y 26..46) its inner edge is at x <= -203, clear of x -194; lower down only the upright (x >= -102) is near
    P.at(P.box(8, yb - 46, 6, c.fixed), -182, (yb + 46) / 2, -3, scene);                       // post x -186..-178, y 46 (frame top)..yb (arc cap), z -6..0
    for (i = 0; i < 9; i++) {                                                                  // notches on the outer edge, standing 0.5 proud
      var an = a1 + (a2 - a1) * (i + 0.5) / 9, nm = P.box(2.5, 2, 7, c.mat("lever", "dark")); var np = hp(r1 - 1, an);
      nm.rotation.z = an; P.at(nm, np[0], np[1], -3, scene);
    }
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, g = S.controls.g || "part", ht = K.H[g];
    if (g === "full" || g === "part") o.dir = 1; else if (g === "back") o.dir = -1;
    var mv = 0.8 * (dt || 0), d = ht - o.h;
    o.h += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    o.th -= o.dir * S.w * (dt || 0);                                                       // forward gear turns the shaft clockwise in this view
    var q = o.q = K.solve(o.th, o.h, o.q), r = K.rest(q, o.B); o.B = r.B;
    o.link.position.set(q[0], q[1], 0); o.link.rotation.z = q[2];
    o.die.position.set(r.B[0], r.B[1], 0); o.die.rotation.z = q[2];
    o.rk.rotation.z = r.ang;
    var E = K.ecc(o.th), i;
    for (i = 0; i < 2; i++) {
      var pp = K.tf(q, [K.pin[0], i ? -K.pin[1] : K.pin[1]]);
      o.rods[i].position.set(E[i][0], E[i][1], 0); o.rods[i].rotation.z = Math.atan2(pp[1] - E[i][1], pp[0] - E[i][0]);
    }
    o.rot.rotation.z = o.th;
    o.stem.position.set(r.sx, K.Ys, 0);
    o.vrod.span(r.sx, K.Ys, -10, r.T[0], r.T[1], -10);
    o.lev.rotation.z = o.h;
    var H = K.hand(o.h), lg = K.tf(q, K.lug);
    o.hang.span(H[0], H[1], 13, lg[0], lg[1], 13);
    if (o.ch === null || Math.abs(o.ch - o.h) > 0.01 || o.cd !== o.dir) { o.st = K.stats(o.h, -o.dir); o.ch = o.h; o.cd = o.dir; }
    S.set("t", Math.round(o.st.travel * K.mm) + " mm");
    S.set("c", Math.round(o.st.cut * 100) + " %");
    var rpm = S.playing ? o.dir * S.rpm : 0;
    S.set("s", (rpm < 0 ? "−" : rpm > 0 ? "+" : "") + Math.abs(Math.round(rpm)) + " rpm");
  }
});
