M507.define({
  number: 221,
  title: "Elliptical gear and swinging pinion",
  lede: "An oval gear turns steadily and drives a gear through a small gear, called a pinion, on a swinging arm. The arm rises and falls to keep the pinion in mesh with the oval. The driven gear turns round, but its speed keeps changing.",
  alt: "An upright oval gear turning on a shaft near its top end, with a plate behind it that has an oval groove cut in it. A small pinion meshes with the oval. On the same axle, just behind, a bigger gear meshes with a gear at the top left. An arm joins that gear's centre to the pinion's axle.",
  parts: [
    { key: "oval", color: "#5E7387", name: "Driving gear", note: "The driving gear. It is an oval, and it turns on a shaft near one end, so the edge where its teeth are comes nearer and goes further away." },
    { key: "pinion", color: "#4FA58A", name: "Pinion", note: "A small gear meshing with the oval. It is fixed on one axle with the gear behind it." },
    { key: "big", color: "#8E7AA8", name: "Big gear behind the pinion", note: "Fixed on the pinion's axle, so it turns with the pinion. It meshes with the driven gear and turns it." },
    { key: "wheel", color: "#C8873A", name: "Driven gear", note: "The gear that is driven. Its shaft does not move. Watch its red mark: it hurries and lags." },
    { key: "arm", color: "#D9B13B", name: "Swinging arm", note: "Hangs from the driven gear's shaft and carries the pinion's axle. It swings so the pinion stays in mesh with both gears." },
    { key: "plate", color: "#E8E2D0", name: "Grooved plate", note: "Fixed behind the oval gear and turns with it. A pin on the end of the pinion's axle runs in its groove, so the teeth never go too deep or slip apart." }
  ],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [381, 226, 920], front: [20, -20, 1250], side: [1250, -20, -30] },
  target: [20, -20, -30],
  how: [
    "The oval gear turns steadily on a shaft near one end. Its teeth come nearer and go further from the shaft as it turns. The pinion meshes with it, so the pinion has to move in and out. It rides on an arm that swings about the driven gear's shaft.",
    "The pinion turns the driven gear through the gear fixed behind it on the same axle. When the far end of the oval meets the pinion, its teeth move fast and the driven gear hurries. Near the shaft end the teeth move slowly and it lags. The arm's swing adds a little push or drag of its own.",
    "A pin behind the pinion runs in the groove of the plate. The groove follows the oval at exactly the right distance, so the teeth stay at the right depth. Watch the Driven readout and the red mark as the oval goes round."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown's drawing is unclear about the pinion. One gear touching both the oval and the driven gear would let the oval hit it. Here the pinion meshes with the oval, and a bigger gear on its axle, a little further back, meshes with the driven gear. The oval is a true ellipse. Its shaft sits at the special point near one end that is called a focus. The bracket holding the driven gear, the sizes and the number of teeth were made up.",

  /** Pure geometry, shared with the node test. Units: model units, radians. */
  geo: function () {
    if (this._g) return this._g;
    var g = { MD: 6, NA: 34, NBB: 26, NP: 15, NC: 40, K: .83, tilt: -12 * Math.PI / 180, D: [50, -40] }, n = 2880, i;
    g.rA = g.NA * g.MD / 2; g.rBB = g.NBB * g.MD / 2; g.rP = g.NP * g.MD / 2; g.Larm = g.rA + g.rBB;
    g.A = [g.D[0] - 183, g.D[1] + 140];
    // ellipse (half axes a along y, b = K a along x) with its upper focus on the shaft; perimeter = NC pitches of module MD
    function per(a) { var b = g.K * a, c = Math.sqrt(a * a - b * b), s = 0, p = [b, -c + 0]; for (var k = 1; k <= n; k++) { var t = 2 * Math.PI * k / n, q = [b * Math.cos(t), -c + a * Math.sin(t)]; s += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return s; }
    var want = g.NC * Math.PI * g.MD, a = want / (2 * Math.PI * .9);
    for (i = 0; i < 30; i++) a *= want / per(a);
    g.a = a; g.b = g.K * a; g.c = Math.sqrt(a * a - g.b * g.b);
    g.pts = []; g.cum = [0];
    for (i = 0; i < n; i++) { var t = 2 * Math.PI * i / n; g.pts.push([g.b * Math.cos(t), -g.c + a * Math.sin(t)]); }
    for (i = 0; i < n; i++) { var p0 = g.pts[i], p1 = g.pts[(i + 1) % n]; g.cum.push(g.cum[i] + Math.hypot(p1[0] - p0[0], p1[1] - p0[1])); }
    g.L = g.cum[n]; g.n = n;
    this._g = g; return g;
  },
  /** Point on the oval's pitch curve at arc length s (in the gear's own frame), with its outward normal. */
  at: function (s) {
    var g = this.geo(), L = g.L, n = g.n, lo = 0, hi = n, t, f;
    s = ((s % L) + L) % L;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (g.cum[mid] <= s) lo = mid; else hi = mid; }
    f = (s - g.cum[lo]) / (g.cum[lo + 1] - g.cum[lo]); t = 2 * Math.PI * (lo + f) / n;
    var x = g.b * Math.cos(t), y = -g.c + g.a * Math.sin(t), nx = g.a * Math.cos(t), ny = g.b * Math.sin(t), m = Math.hypot(nx, ny);
    return [x, y, nx / m, ny / m];
  },
  /** World position of the pinion centre when the oval is at angle th and the contact is at arc length s. */
  centre: function (th, s) {
    var g = this.geo(), q = this.at(s), r = g.rP, ang = th + g.tilt, c = Math.cos(ang), sn = Math.sin(ang);
    var x = q[0] + r * q[2], y = q[1] + r * q[3];
    return [g.D[0] + c * x - sn * y, g.D[1] + sn * x + c * y, g.D[0] + c * q[0] - sn * q[1], g.D[1] + sn * q[0] + c * q[1]];
  },
  /** Find arc length s near s0 where the pinion centre is exactly one arm length from the wheel's shaft. */
  solveS: function (th, s0) {
    var g = this.geo(), self = this;
    function f(s) { var p = self.centre(th, s); return Math.hypot(p[0] - g.A[0], p[1] - g.A[1]) - g.Larm; }
    var h = 1, k, best = null;
    for (k = 0; k < 200 && best === null; k++) {
      [s0 - k * h, s0 + k * h].forEach(function (a) { if (best === null && f(a) * f(a + h) <= 0) best = a; });
    }
    var lo = best, hi = best + h, flo = f(lo);
    for (k = 0; k < 50; k++) { var m = (lo + hi) / 2, fm = f(m); if (fm * flo <= 0) hi = m; else { lo = m; flo = fm; } }
    return (lo + hi) / 2;
  },
  /** Advance state st = {th, s, beta, alpha} to oval angle th; returns pinion and wheel angles. */
  solve: function (st, th) {
    var g = this.geo(), T = 2 * Math.PI;
    function unwrap(prev, v) { return prev === undefined ? v : v + T * Math.round((prev - v) / T); }
    st.th = th; st.s = this.solveS(th, st.s);
    var p = this.centre(th, st.s);
    st.B = [p[0], p[1]]; st.contact = [p[2], p[3]];
    st.beta = unwrap(st.beta, Math.atan2(p[3] - p[1], p[2] - p[0]));      // from pinion centre to the contact with the oval
    st.alpha = unwrap(st.alpha, Math.atan2(p[1] - g.A[1], p[0] - g.A[0])); // from the wheel's shaft to the pinion centre
    var stP = T / g.NP, stA = T / g.NA;
    // rolling on the oval: pinion-frame contact angle = half a pitch - s / rP (a tooth of the oval meets a gap of the pinion)
    st.phiB = st.beta - (stP / 2 - st.s / g.rP);
    // rolling of the big gear on the wheel: wheel-frame contact angle = half a pitch - (rBB / rA) * big-gear-frame contact angle
    st.phiA = st.alpha - (stA / 2 - (g.rBB / g.rA) * (st.alpha + Math.PI - st.phiB));
    return st;
  },
  /** Starting arc length: the solution with the pinion up and to the right of the oval's shaft, as drawn. */
  start: function () {
    var g = this.geo(), best = null, by = -1e9, s, self = this;
    for (s = 0; s < g.L; s += 2) {
      var p0 = this.centre(0, s), p1 = this.centre(0, s + 2), f0 = Math.hypot(p0[0] - g.A[0], p0[1] - g.A[1]) - g.Larm, f1 = Math.hypot(p1[0] - g.A[0], p1[1] - g.A[1]) - g.Larm;
      if (f0 * f1 <= 0 && p0[0] > g.D[0] - 40 && p0[1] > by) { by = p0[1]; best = s; }
    }
    return this.solve({ s: best }, 0);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, g = this.geo(), self = this, i;
    var o = this.o = { st: this.start() };
    // oval gear and its plate turn about the shaft at D
    o.c = new T.Group(); o.c.position.set(g.D[0], g.D[1], 0); scene.add(o.c);
    o.ci = new T.Group(); o.ci.rotation.z = g.tilt; o.c.add(o.ci);
    var gear = P.noncircularGear({ points: g.pts, teeth: g.NC, width: 14, material: c.mat("oval") });
    gear.position.z = -25; o.ci.add(gear);                                     // oval z -32..-18, held in front of the big gear's plane by its shaft
    var cMD = gear.pitch / Math.PI;
    // grooved plate: back layer z -62..-58; front layer z -58..-50 is an outer band and an inner island with the groove between
    function offShape(d, hole) {
      var sh = hole ? new T.Path() : new T.Shape(), k, N = 360;
      for (k = 0; k <= N; k++) {
        var t = 2 * Math.PI * (hole ? N - k : k) / N, nx = g.a * Math.cos(t), ny = g.b * Math.sin(t), m = Math.hypot(nx, ny);
        var x = g.b * Math.cos(t) + d * nx / m, y = -g.c + g.a * Math.sin(t) + d * ny / m;
        if (k) sh.lineTo(x, y); else sh.moveTo(x, y);
      }
      return sh;
    }
    var GW = 6.5, rim = g.rP + GW + 10;
    function ext(sh, depth, z, m) { var ge = new T.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false }); ge.translate(0, 0, z); var me = new T.Mesh(ge, m); o.ci.add(me); return me; }
    ext(offShape(rim), 4, -62, c.mat("plate"));                                // back layer z -62..-58
    var band = offShape(rim); band.holes.push(offShape(g.rP + GW, true));
    ext(band, 8, -58, c.mat("plate"));                                         // outer band z -58..-50, inside edge = groove's outer wall
    ext(offShape(g.rP - GW), 8, -58, c.mat("plate"));                          // inner island z -58..-50, edge = groove's inner wall
    P.at(P.cylZ(8, 52, c.mat("oval")), 0, 0, -40, o.c);                        // shaft z -66..-14: support plate face, through the plate, to the hub
    P.at(P.cylZ(12, 4, c.mat("oval")), 0, 0, -16, o.c);                        // hub z -18..-14 on the gear face
    var len = g.a + g.c - 1.25 * cMD - 20;
    P.at(P.box(5, len, 1, c.mat("oval", "mark")), 0, -12 - len / 2, -17, o.ci);  // red stripe z -17.5..-16.5, lifted off the face, towards the far end
    // big gear (z -48..-34) and pinion (z -31..-19) on one axle; pin z -56..-48 in the groove (floor at z -58)
    o.b = new T.Group(); scene.add(o.b);
    P.at(P.spurGear({ teeth: g.NBB, module: g.MD, width: 14, material: c.mat("big") }), 0, 0, -41, o.b);
    P.at(P.spurGear({ teeth: g.NP, module: cMD, width: 12, material: c.mat("pinion") }), 0, 0, -25, o.b);
    P.at(P.cylZ(5.5, 51.5, c.mat("pinion")), 0, 0, -30.25, o.b);              // axle and pin z -56..-4.5, ends just inside the arm (arm front face z -4)
    // wheel z -48..-34 on a shaft z -48..-2 that ends at the hanger's back face (the oval never reaches this shaft)
    o.a = new T.Group(); o.a.position.set(g.A[0], g.A[1], 0); scene.add(o.a);
    P.at(P.spurGear({ teeth: g.NA, module: g.MD, width: 14, material: c.mat("wheel") }), 0, 0, -41, o.a);
    P.at(P.cylZ(7, 46, c.mat("wheel")), 0, 0, -25, o.a);                      // shaft z -48..-2
    var rfA = g.rA - 1.25 * g.MD;
    P.at(P.box(rfA - 30, 5, 1, c.mat("wheel", "mark")), 18 + (rfA - 30) / 2, 0, -33, o.a);   // red stripe x 18..rf-12, z -33.5..-32.5, lifted off the face
    // arm z -10..-4 from the wheel's shaft to the pinion's axle
    o.arm = new T.Group(); o.arm.position.set(g.A[0], g.A[1], -7); scene.add(o.arm);
    P.at(P.box(g.Larm, 12, 6, c.mat("arm")), g.Larm / 2, 0, 0, o.arm);
    P.at(P.cylZ(12, 6, c.mat("arm")), 0, 0, 0, o.arm);
    P.at(P.cylZ(12, 6, c.mat("arm")), g.Larm, 0, 0, o.arm);
    // supports
    this._sup(c);
    o.T = T;
  },
  _sup: function (c) {
    var P = c.P, scene = c.scene, g = this.geo(), ax = g.A[0], ay = g.A[1];
    P.at(P.box(580, 570, 10, c.fixed), 20, -25, -71, scene);                  // support plate x -270..310, y -310..260, z -76..-66; oval shaft ends at z -66
    P.at(P.box(620, 12, 110, c.fixed), 20, -316, -21, scene);                 // base y -322..-310, z -76..34; plate stands on y -310; grooved plate reaches y -300
    // gallows bracket for the wheel's shaft: block out from the plate above everything that moves, then a hanger in front
    P.at(P.box(24, 12, 76, c.fixed), ax, 254, -28, scene);                    // top block x ax±12, y 248..260, z -66..10, touches the plate face z -66
    P.at(P.box(24, 248 - ay + 12, 12, c.fixed), ax, (248 + ay - 12) / 2, 4, scene);   // hanger y ay-12..248, z -2..10; shaft ends at z -2
  },

  step: function (c, dt, S) {
    var o = this.o, g = this.geo(), st = o.st;
    this.solve(st, st.th + S.w * dt);
    o.c.rotation.z = st.th;
    o.b.position.set(st.B[0], st.B[1], 0); o.b.rotation.z = st.phiB;
    o.a.rotation.z = st.phiA;
    o.arm.rotation.z = st.alpha;
    var w = S.playing ? S.rpm : 0, e = 1e-3, nx = this.solve({ s: st.s, beta: st.beta, alpha: st.alpha }, st.th + e);
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("in", f(w));
    S.set("out", f(w * (nx.phiA - st.phiA) / e));
  }
});
