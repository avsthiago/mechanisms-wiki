M507.define({
  number: 419,
  title: "Self-rocking cradle",
  lede: "A small wheel turns round and round, and a cradle rocks gently from side to side. A rod makes a bigger wheel swing to and fro. Two belts from that wheel pull the cradle one way, then the other.",
  alt: "A cradle rocker with a curved bottom stands on the floor, with a tall post at each end. Between the posts, a small wheel at the bottom is joined by a rod to a bigger wheel above. Two belts run over the top of the bigger wheel to the tops of the posts.",
  parts: [
    { key: "small", color: "#5E7387", name: "Small wheel", note: "Turns round and round all the time. Watch the red crank pin on its face." },
    { key: "big", color: "#C8873A", name: "Big wheel", note: "Never goes all the way round. The rod swings it one way and then back again." },
    { key: "link", color: "#D9B13B", name: "Connecting rod", note: "Joins the crank pin on the small wheel to a pin near the rim of the big wheel." },
    { key: "bands", color: "#E8E2D0", name: "Belts", note: "Two bendy belts. Each is tied to the big wheel at one end and to the top of a post at the other." },
    { key: "cradle", color: "#4FA58A", name: "Cradle rocker", note: "The curved bottom of the cradle, with a post at each end. It rolls on the floor." }
  ],
  controls: [{ type: "range", id: "a", label: "Crank pin distance from the centre", min: 8, max: 30, step: 1, value: 30, unit: " mm", presets: [[10, "Short"], [20, "Medium"], [30, "As drawn"]] }],
  readouts: [{ id: "big", label: "Big wheel" }, { id: "rock", label: "Cradle" }],
  views: { "3d": [130, 100, 920], front: [0, 45, 940], side: [920, 45, 40] },
  target: [0, 45, 0],
  how: [
    "Watch the small wheel at the bottom. It turns all the way round. The rod joins its crank pin to the big wheel, but the big wheel cannot follow it round. It swings one way, then back, once for each turn of the small wheel.",
    "The two belts cross over the top of the big wheel. When it swings one way, it winds one belt on and lets the other belt off. The winding belt pulls its post towards the middle, and the cradle rolls over a little on its curved bottom. When the big wheel swings back, the other belt pulls the other way.",
    "The further the crank pin is from the middle of the small wheel, the more the big wheel swings, and the more the cradle rocks. Try a short crank, then the crank as drawn, and watch how far the cradle tips."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not say what turns the small wheel; in a real cradle it would be a spring or a weight, like in a clock. The stand that holds the two wheels, the floor and all the sizes were made up. The cradle itself is not drawn, only its rocker and posts.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { th: 1.75, B: [0, 144], rB: 85.5, rb: 87, A: [0, -28], b: 162, cr: 56, Rr: 274, O0: [0, 121], post: 155, ptop: 225, att: Math.PI / 3 };
    // middle of the big wheel's swing, for the crank as drawn; the straps are tied so they are tight there
    var lo = 1e9, hi = -1e9;
    for (i = 0; i < 360; i++) { var r = this.bpin(30, i * Math.PI / 180); lo = Math.min(lo, r.ang); hi = Math.max(hi, r.ang); }
    o.mid = (lo + hi) / 2; o.L0 = [this.band(0, 0, -1).len, this.band(0, 0, 1).len];
    // small wheel
    var ms = c.mat("small");
    o.ag = new T.Group(); o.ag.position.set(o.A[0], o.A[1], 0); scene.add(o.ag);
    P.at(P.cylZ(40, 12, ms), 0, 0, 0, o.ag);                                          // disc z -6..6
    P.at(P.cylZ(8, 36, ms), 0, 0, -12, o.ag);                                         // shaft z -30..6
    o.apin = P.at(P.cylZ(4, 18.5, c.mat("small", "mark")), 30, 0, 15.25, o.ag);       // crank pin z 6..24.5
    // big wheel, rim wide enough for both straps side by side
    var mb = c.mat("big");
    o.bg = new T.Group(); o.bg.position.set(o.B[0], o.B[1], 0); scene.add(o.bg);
    var sh = new T.Shape(), hole = new T.Path();
    sh.absarc(0, 0, o.rB, 0, 2 * Math.PI, false); hole.absarc(0, 0, o.rB - 10, 0, 2 * Math.PI, true); sh.holes.push(hole);
    var rg = new T.ExtrudeGeometry(sh, { depth: 24, bevelEnabled: false, curveSegments: 64 }); rg.translate(0, 0, -12);
    o.bg.add(new T.Mesh(rg, mb));                                                     // rim z -12..12
    o.bg.add(P.cylZ(o.rB - 9, 6, mb));                                                // web z -3..3
    P.at(P.cylZ(14, 18, mb), 0, 0, 3, o.bg);                                          // hub z -6..12
    P.at(P.cylZ(8, 30, mb), 0, 0, -15, o.bg);                                         // shaft z -30..0
    P.at(P.cylZ(4, 21.5, c.mat("big", "dark")), o.cr, 0, 13.75, o.bg);               // pin z 3..24.5, from the web
    P.at(P.cylZ(10, 4, c.mat("big", "dark")), o.cr, 0, 5, o.bg);                     // boss for the pin z 3..7, on the web
    // rod
    o.link = P.armPlate({ length: o.b, r0: 8, r1: 8, thick: 5, material: c.mat("link") }); P.at(o.link, 0, 0, 20, scene);   // z 17.5..22.5
    // straps: a part wound on the rim and a straight part to the post
    var mband = c.mat("bands");
    o.wrap = []; o.free = [];
    for (i = 0; i < 2; i++) {
      o.wrap.push(P.at(new T.Mesh(new T.BufferGeometry(), mband), o.B[0], o.B[1], 0, scene)); o.wrap[i].userData.live = true;
      o.free.push(P.at(P.box(1, 2, 8, mband), 0, 0, i ? -6 : 6, scene));            // left strap z 2..10, right strap z -10..-2
    }
    // cradle rocker and posts, built in their rest place and rolled as one
    var mc = c.mat("cradle");
    o.cg = new T.Group(); scene.add(o.cg);
    var rk = new T.Shape(), a0 = Math.asin(185 / o.Rr);
    rk.moveTo(-185, -81); rk.lineTo(185, -81);
    rk.absarc(o.O0[0], o.O0[1], o.Rr, -Math.PI / 2 + a0, -Math.PI / 2 - a0, true);
    var rkg = new T.ExtrudeGeometry(rk, { depth: 40, bevelEnabled: false, curveSegments: 48 }); rkg.translate(0, 0, -20);
    o.cg.add(new T.Mesh(rkg, mc));                                                    // rocker y -153..-81, z -20..20
    [-1, 1].forEach(function (sd) {
      P.at(P.box(16, 302, 20, mc), sd * o.post, 70, 0, o.cg);                          // post y -81..221, z -10..10
      P.at(P.cylZ(5, 24, c.mat("cradle", "dark")), sd * o.post, o.ptop, 0, o.cg);       // knob the strap is tied to, y 220..230
    });
    // stand and floor (not part of the movement)
    P.at(P.box(120, 393, 10, c.fixed), 0, 43.5, -35, scene);                          // stand x -60..60, y -153..240, z -40..-30
    P.at(P.box(560, 10, 110, c.fixed), 0, -158, -5, scene);                           // floor y -163..-153, z -60..50
  },

  meet: function (ax, ay, ra, bx, by, rb) {      // two circles meet; the point on the right of A to B
    var dx = bx - ax, dy = by - ay, d = Math.sqrt(dx * dx + dy * dy) || 1e-9, a = (ra * ra - rb * rb + d * d) / (2 * d);
    var h = Math.sqrt(Math.max(0, ra * ra - a * a)), ux = dx / d, uy = dy / d;
    return [ax + a * ux + h * uy, ay + a * uy - h * ux];
  },
  bpin: function (a, th) {
    var o = this.o, pa = [o.A[0] + a * Math.cos(th), o.A[1] + a * Math.sin(th)], pb = this.meet(pa[0], pa[1], o.b, o.B[0], o.B[1], o.cr);
    return { pa: pa, pb: pb, ang: Math.atan2(pb[1] - o.B[1], pb[0] - o.B[0]) };
  },
  postTop: function (e, sd) {                    // knob of a post when the cradle has rolled by e (anticlockwise; it rolls left)
    var o = this.o, px = sd * o.post - o.O0[0], py = o.ptop - o.O0[1], cs = Math.cos(e), sn = Math.sin(e);
    return [o.O0[0] - o.Rr * e + cs * px - sn * py, o.O0[1] + sn * px + cs * py];
  },
  band: function (e, beta, sd) {                 // strap length needed: straight part plus the part on the rim
    var o = this.o, Q = this.postTop(e, sd), dx = Q[0] - o.B[0], dy = Q[1] - o.B[1], d = Math.hypot(dx, dy), ac = Math.acos(o.rb / d), an = Math.atan2(dy, dx);
    var tau = sd < 0 ? an - ac : an + ac, att = Math.PI / 2 + sd * o.att + beta;   // the left strap is tied right of the top, the right one left of it
    return { len: Math.sqrt(d * d - o.rb * o.rb) + o.rb * (sd < 0 ? tau - att : att - tau), tau: tau, att: att, Q: Q };
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, self = this, i;
    o.th += S.w * dt;                                                                  // anticlockwise, as Brown's arrow shows
    var a = S.controls.a, r = this.bpin(a, o.th), beta = r.ang - o.mid;
    function root(sd) {                          // roll at which this strap is exactly tight
      var lo = -.6, hi = .6, flo = self.band(lo, beta, sd).len - o.L0[sd < 0 ? 0 : 1];
      for (var k = 0; k < 50; k++) { var m = (lo + hi) / 2, fm = self.band(m, beta, sd).len - o.L0[sd < 0 ? 0 : 1]; if (flo * fm <= 0) hi = m; else { lo = m; flo = fm; } }
      return (lo + hi) / 2;
    }
    // the cradle's weight keeps it as near upright as both straps allow
    var eL = root(-1), eR = root(1), e = eR <= eL ? Math.min(Math.max(0, eR), eL) : (eL + eR) / 2;
    o.ag.rotation.z = o.th;
    o.apin.position.set(a, 0, 15.25);
    o.bg.rotation.z = r.ang;
    o.link.position.set(r.pa[0], r.pa[1], 20); o.link.rotation.z = Math.atan2(r.pb[1] - r.pa[1], r.pb[0] - r.pa[0]);
    var cs = Math.cos(e), sn = Math.sin(e);
    o.cg.rotation.z = e;
    o.cg.position.set(o.O0[0] - o.Rr * e - (cs * o.O0[0] - sn * o.O0[1]), o.O0[1] - (sn * o.O0[0] + cs * o.O0[1]), 0);
    for (i = 0; i < 2; i++) {
      var sd = i ? 1 : -1, bd = this.band(e, beta, sd), t0 = Math.min(bd.tau, bd.att), t1 = Math.max(bd.tau, bd.att);
      var shp = new T.Shape(); shp.absarc(0, 0, o.rB + 2.5, t0, t1, false); shp.absarc(0, 0, o.rB + .5, t1, t0, true);   // lifted off the rim
      var g = new T.ExtrudeGeometry(shp, { depth: 8, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, i ? -10 : 2);
      o.wrap[i].geometry.dispose(); o.wrap[i].geometry = g;
      var tx = o.B[0] + o.rb * Math.cos(bd.tau), ty = o.B[1] + o.rb * Math.sin(bd.tau), Q = bd.Q;
      var f = o.free[i]; f.position.set((tx + Q[0]) / 2, (ty + Q[1]) / 2, sd < 0 ? 6 : -6);
      f.scale.x = Math.hypot(Q[0] - tx, Q[1] - ty); f.rotation.z = Math.atan2(Q[1] - ty, Q[0] - tx);
    }
    var bd = Math.round(beta * 180 / Math.PI), ed = e * 180 / Math.PI;
    S.set("big", (bd > 0 ? "+" : bd < 0 ? "−" : "") + Math.abs(bd) + "°");
    S.set("rock", (ed > .05 ? "+" : ed < -.05 ? "−" : "") + Math.abs(ed).toFixed(1) + "°");
  }
});
