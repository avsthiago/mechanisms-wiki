M507.define({
  number: 455,
  title: "Old rotary pump",
  lede: "A drum turns inside a round casing and carries two hinged flaps, called valves. Each valve sweeps water round from the pipe at the bottom to the pipe at the top. A fixed block folds each valve shut so it can pass and start again.",
  alt: "A round casing with its front cover off, a pipe entering at the bottom and a pipe leaving at the upper right. A hollow orange drum in the middle carries two green curved flaps that reach out to the casing wall, one at the left and one at the right. A yellow block fills the space between drum and wall at the lower right.",
  parts: [
    { key: "case", color: "#5E7387", name: "Cylinder", note: "The round casing. It stands still. Water comes in by the pipe at the bottom and leaves by the pipe at the upper right. The front cover is left off so you can see inside." },
    { key: "drum", color: "#C8873A", name: "Drum", note: "The middle part. It turns on its shaft and carries the two valves. Watch its red stripe to see it turn." },
    { key: "valve", color: "#4FA58A", name: "Valves", note: "Two curved flaps hinged on the drum. Each one swings out until its edge rubs the casing wall, and pushes the water in front of it. One has a red edge to follow." },
    { key: "block", color: "#D9B13B", name: "Abutment", note: "A fixed block that touches the drum. It stops water slipping back from the top pipe to the bottom pipe. Its sloping top folds each valve flat against the drum." }
  ],
  closed: { label: "Case" },
  readouts: [{ id: "rpm", label: "Drum" }, { id: "valve", label: "Red valve" }],
  views: { "3d": [315, 146, 633], front: [20, -15, 720], side: [740, -15, 0] },
  target: [20, -15, 0],
  how: [
    "Look at the two green valves. Each is a curved flap hinged on the drum. It swings out until its edge touches the casing wall. Then it works like a door across the space between drum and wall.",
    "The drum turns and each valve pushes the water in front of it, shown as blue dots. The water goes up the left side, over the top and out by the upper pipe. Behind the valve the space grows, and that pulls new water up the bottom pipe.",
    "The yellow block fills the space between the two pipes, so the water cannot go round again. But the valve must get past it. Follow the red valve. The sloping top of the block folds it flat into a hollow in the drum. Once past the block it swings out again and takes the next load. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front cover is left off, and the water is drawn as small blue balls so you can see it move. Brown does not show what swings the valves out, so here they simply open as far as the wall and the block let them. The exact slope of the block, the hollow drum with its web and shaft, and all the sizes were made up. A little water between the top pipe and the block has to slip past the valve as it folds, and the model does not show that.",

  /* Geometry, all about the shaft at the origin, angles in radians anticlockwise from +X.
     Casing bore 100. Drum 54. Each valve is a curved plate 4 thick whose outside lies on the drum surface when it is
     folded; it runs 60 degrees anticlockwise from its hinge (hinge centre at radius 52) and swings outward about it.
     The abutment: left face x = 9.5 (in line with the inlet pipe wall), then an arc of radius 54.5 round the drum from
     -79.96 to -55 degrees, then a straight slope out to the bore at -22 degrees.
     _wallr(a) is how far the chamber reaches from the shaft in direction a. _open(th) is the largest swing of a valve
     whose hinge is at angle th that keeps every point of it inside the chamber, found by halving. */
  _K: (function () {
    var D = Math.PI / 180, K = { R: 100, r: 54, rf: 52, RS: 54.5, gam: 60 * D, xF: 9.5 };
    K.aF = -Math.acos(K.xF / K.R); K.aS0 = -Math.acos(K.xF / K.RS); K.aS1 = -55 * D; K.aB = -22 * D;
    K.A = [K.RS * Math.cos(K.aS1), K.RS * Math.sin(K.aS1)]; K.B = [K.R * Math.cos(K.aB), K.R * Math.sin(K.aB)];
    K.TT = K.aF - K.aB + 2 * Math.PI;                       // the chamber, measured clockwise from the left face of the abutment
    return K;
  })(),
  _wallr: function (a) {
    var K = this._K; a = Math.atan2(Math.sin(a), Math.cos(a));
    if (a <= K.aF || a >= K.aB) return K.R;
    if (a <= K.aS0) return K.xF / Math.cos(a);
    if (a <= K.aS1) return K.RS;
    var dx = K.B[0] - K.A[0], dy = K.B[1] - K.A[1];
    return (K.A[0] * dy - K.A[1] * dx) / (Math.cos(a) * dy - Math.sin(a) * dx);
  },
  _pt: function (th, be, rho, phi, out) {                   // a point of the valve (radius rho, angle phi from the hinge when folded) swung out by be
    var K = this._K, x = rho * Math.cos(phi) - K.rf, y = rho * Math.sin(phi), cb = Math.cos(be), sb = Math.sin(be);
    var X = x * cb + y * sb + K.rf, Y = -x * sb + y * cb, ct = Math.cos(th), st = Math.sin(th);
    out[0] = X * ct - Y * st; out[1] = X * st + Y * ct; return out;
  },
  _fits: function (th, be) {
    var K = this._K, p = [0, 0], i;
    for (i = 0; i <= 61; i++) {
      this._pt(th, be, i < 61 ? K.r : K.r - 4, K.gam * Math.min(i, 60) / 60, p);
      if (Math.hypot(p[0], p[1]) > this._wallr(Math.atan2(p[1], p[0])) + 1e-9) return false;
    }
    return true;
  },
  _reach: function (th) {                                   // the first swing, coming from folded, at which the valve would touch something
    var lo = 0, hi = 0, i, m;
    while (hi < 2.2 && this._fits(th, hi)) { lo = hi; hi += .035; }
    if (hi >= 2.2) return lo;
    for (i = 0; i < 22; i++) { m = (lo + hi) / 2; if (this._fits(th, m)) lo = m; else hi = m; }
    return lo;
  },
  /* A valve cannot begin to open until its whole length has left the abutment: hinge 60 degrees past the corner. From
     there it swings out steadily over the next 34 degrees of the drum's turn, or as far as the walls allow if that is less. */
  _open: function (th) {
    var K = this._K, D = Math.PI / 180, past = K.aS0 - K.gam - .5 * D - th; past = Math.atan2(Math.sin(past), Math.cos(past));
    var be = this._reach(th), u = past / (34 * D);
    if (past < 0) return past > -62 * D ? Math.min(be, .03) : be;      // still under the abutment, or being folded by its slope
    return u < 1 ? Math.min(be, .012 + (this._full - .012) * (.5 - .5 * Math.cos(Math.PI * u))) : be;
  },
  _full: 0,

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this._K, self = this, D = Math.PI / 180, R = K.R, W = 110, mc = c.mat("case"), i;
    var o = this.o = { th: 0, th0: 9 * D };
    function arc(rad, a0, a1, n) { var p = [], j, a; for (j = 0; j <= n; j++) { a = (a0 + (a1 - a0) * j / n) * D; p.push([rad * Math.cos(a), rad * Math.sin(a)]); } return p; }
    // outlet pipe along 38 degrees: bore 28 wide, walls 10 thick, out to 165 from the shaft
    var u = [Math.cos(38 * D), Math.sin(38 * D)], n = [-u[1], u[0]];
    function op(d, s) { return [d * u[0] + s * n[0], d * u[1] + s * n[1]]; }
    var aI = Math.asin(14 / R) / D, aO = Math.asin(24 / W) / D;                 // where the pipe walls meet the bore and the outside
    var aLi = Math.atan2(-Math.sqrt(R * R - 42 * 42), -42) / D + 360, aLo = Math.atan2(-Math.sqrt(W * W - 52 * 52), -52) / D + 360;   // inlet left wall x -52..-42
    var aRi = K.aF / D, aRo = Math.atan2(-Math.sqrt(W * W - 19.5 * 19.5), 19.5) / D;                                                    // inlet right wall x 9.5..19.5
    // wall from the inlet round the left and the top to the outlet
    var wallA = [[-42, -150], [-52, -150]].concat(arc(W, aLo, 38 + aO, 70), [op(165, 24), op(165, 14)], arc(R, 38 + aI, aLi, 70));
    // wall from the outlet down the right to the inlet
    var wallB = [op(165, -14), op(165, -24)].concat(arc(W, 38 - aO, aRo, 40), [[19.5, -150], [K.xF, -150]], arc(R, aRi, 38 - aI, 40));
    var back = [op(165, 24)].concat(arc(W, 38 + aO, aLo, 70), [[-52, -150], [19.5, -150]], arc(W, aRo, 38 - aO, 40), [op(165, -24)]);
    scene.add(P.outlinePlate({ points: wallA, depth: 40, z0: -20, material: mc }));               // walls z -20..20
    scene.add(P.outlinePlate({ points: wallB, depth: 40, z0: -20, material: mc }));
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: c.mat("case", "light") }), "open"));   // back cover z -26..-20, pale so the water shows
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: mc }), "closed"));   // closed: the same back cover in the casing colour
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: 20, material: mc }), "closed"));          // closed: front cover z 20..26, on the walls; the shaft comes out through it
    // abutment z -20..20: left face x 9.5, arc 54.5 round the drum, slope to the bore at -22 degrees, then along the bore
    var blk = arc(K.RS, K.aS0 / D, K.aS1 / D, 14).concat(arc(R, K.aB / D, K.aF / D, 30));
    scene.add(P.outlinePlate({ points: blk, depth: 39, z0: -19.5, material: c.mat("block") }));
    // drum: ring 34..54 with a hollow for each folded valve, z -20..16, on a web and a shaft
    o.rot = new T.Group(); scene.add(o.rot);
    var ring = [], G = K.gam / D;
    [0, 180].forEach(function (h) {
      ring.push([K.r * Math.cos((h - 2.5) * D), K.r * Math.sin((h - 2.5) * D)], [49.5 * Math.cos((h - 2.5) * D), 49.5 * Math.sin((h - 2.5) * D)],
        [49.5 * Math.cos((h + G + 2) * D), 49.5 * Math.sin((h + G + 2) * D)]);
      ring = ring.concat(arc(K.r, h + G + 2, h + 177.5, 40));
    });
    var bore = arc(34, 0, 357, 60);
    var dg = new T.Group(); dg.rotation.z = o.th0; o.rot.add(dg);
    dg.add(P.outlinePlate({ points: ring, holes: [bore], depth: 36, z0: -20, material: c.mat("drum") }));
    P.at(P.cylZ(34, 5, c.mat("drum", "light")), 0, 0, -17.25, dg);                        // web z -20..-15, on the back cover
    P.at(P.cylZ(15, 31, c.mat("drum")), 0, 0, .5, dg);                                   // hub z -15..16, on the web
    P.at(P.cylZ(9, 104, c.mat("drum", "dark")), 0, 0, -8, dg);                           // shaft z -60..44
    var st = new T.Group(); st.rotation.z = 120 * D; dg.add(st);
    P.at(P.box(13, 4, 1, c.mat("drum", "mark")), 43.5, 0, 17, st);                       // stripe r 37..50, z 16.5..17.5, lifted off the ring face (z 16)
    // valves: plate between radius 50 and 54, 60 degrees long, with a round knuckle of radius 2 on the hinge; z -20..17
    var fp = arc(K.r, 0, G, 24).concat(arc(K.r - 4, G, 0, 24)).map(function (p) { return [p[0] - K.rf, p[1]]; });
    var ed = arc(K.r - .8, 1, G - 1, 24).concat(arc(K.r - 3.2, G - 1, 1, 24)).map(function (p) { return [p[0] - K.rf, p[1]]; });
    o.flap = [0, 1].map(function (k) {
      var arm = new T.Group(); arm.rotation.z = o.th0 + k * Math.PI; o.rot.add(arm);
      var g = new T.Group(); g.position.x = K.rf; arm.add(g);
      g.add(P.outlinePlate({ points: fp, depth: 37, z0: -20, material: c.mat("valve") }));
      P.at(P.cylZ(2, 37, c.mat("valve")), 0, 0, -1.5, g);
      P.at(P.cylZ(1.2, 1, c.mat("valve", "dark")), 0, 0, 17.5, g);                       // pin head z 17..18, on the knuckle face
      if (!k) g.add(P.outlinePlate({ points: ed, depth: 1, z0: 17.5, material: c.mat("valve", "mark") }));   // red edge z 17.5..18.5, lifted off the valve face (z 17)
      return g;
    });
    // how far the edge of an open valve trails behind its hinge
    this._full = this._reach(Math.PI / 2);
    var be = this._full, tp = this._pt(Math.PI / 2, be, K.r, K.gam, [0, 0]);
    o.full = be; o.del = Math.atan2(tp[1], tp[0]) - Math.PI / 2;
    // water as moving balls between the drum and the wall, measured clockwise from the left face of the abutment
    o.flow = P.steamFlow({ color: c.spot, even: true, count: 340, size: 2.6, z0: -14, z1: 12 }); scene.add(o.flow);
    o.dom = o.flow.domain({ density: .0135, pad: .05, drain: .5, f: function (t, out) {
      var a = K.aF - t, w = self._wallr(a);
      out[0] = K.r * Math.cos(a - o.del); out[1] = K.r * Math.sin(a - o.del); out[2] = w * Math.cos(a); out[3] = w * Math.sin(a);
    } });
    o.tIn = K.aF - aLi * D + 2 * Math.PI; o.tOut0 = K.aF - (38 + aI) * D + 2 * Math.PI; o.tOut1 = K.aF - (38 - aI) * D + 2 * Math.PI;
    o.bars = [0, 0, 0, 0]; o.kinds = [0, 0, 0]; o.ports = [0, 0, 0];
    o.flow.pipe({ points: [[-16, -175], [-16, -98]], width: 36, n: 22 });
    o.flow.pipe({ points: [op(98, 0), op(195, 0)], width: 20, n: 12 });                  // runs outward from the port
  },

  step: function (c, dt, S) {
    var o = this.o, K = this._K, TP = 2 * Math.PI, k, n = 0, ts = [];
    o.th -= S.w * dt;                                                                    // clockwise, as the arrows in the drawing
    o.rot.rotation.z = o.th;
    for (k = 0; k < 2; k++) {
      var th = o.th0 + k * Math.PI + o.th, be = this._open(th);
      o.flap[k].rotation.z = -be;
      if (!k) o.be = be;
      var t = K.aF - (th + o.del); t -= TP * Math.floor(t / TP);
      if (t > .02 && t < o.tOut1) ts.push(t);                                            // a door across the chamber until it has passed the outlet
    }
    ts.sort(function (a, b) { return a - b; });
    o.bars[0] = 0; for (k = 0; k < ts.length; k++) o.bars[k + 1] = ts[k]; n = ts.length + 1; o.bars[n] = K.TT;
    for (k = 0; k < n; k++) {
      var b0 = o.bars[k], b1 = o.bars[k + 1];
      if (b0 < o.tIn) { o.kinds[k] = 1; o.ports[k] = Math.max(b0, Math.min(b1, o.tIn / 2)); }
      else if (b1 > o.tOut0) { o.kinds[k] = 3; o.ports[k] = Math.max(b0, Math.min(b1, (o.tOut0 + o.tOut1) / 2)); }
      else { o.kinds[k] = 2; o.ports[k] = b0; }
    }
    o.dom.set(o.bars, o.kinds, o.ports, n);
    o.flow.update(Math.abs(S.w) * dt);
    var rpm = S.playing ? -S.rpm : 0;
    S.set("rpm", (rpm < 0 ? "−" + -rpm : rpm) + " rpm");
    S.set("valve", o.be < .04 ? "shut" : o.be > o.full - .02 ? "open" : "half open");
  }
});
