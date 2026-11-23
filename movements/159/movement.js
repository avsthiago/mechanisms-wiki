M507.define({
  number: 159,
  title: "Treadle, cord and pulley",
  lede: "A foot board, called a treadle, is pressed down. A cord pulls a pin on a big disc and turns it. A cord can only pull, so the weight of the disc carries it on while the treadle comes back up.",
  alt: "A big disc on a stand at the left has a pin near its edge. A cord runs from the pin up and over a small wheel, then straight down to a long treadle board hinged on a stand at the right.",
  parts: [
    { key: "treadle", color: "#5E7387", name: "Treadle", note: "A long board hinged at its right end. A foot presses the free end down. The cord is tied on near the middle." },
    { key: "cord", color: "#D9B13B", name: "Cord", note: "One cord, tied to the treadle and to the pin. It can pull but it cannot push. Watch the red mark slide along it." },
    { key: "wheel", color: "#4FA58A", name: "Small wheel", note: "It turns the cord's path from up and down to along the disc. It spins with the cord, so the cord does not rub." },
    { key: "disc", color: "#C8873A", name: "Disc", note: "The big wheel that is being turned. Its weight keeps it going while the cord has no pull." },
    { key: "peg", color: "#C2503F", name: "Crank pin", note: "A short pin on the disc, with the cord tied to it. Watch it travel round in a circle." }
  ],
  controls: [{ type: "range", id: "pin", label: "Crank pin distance from the centre", min: 20, max: 50, step: 1, value: 35, unit: "% of the radius",
    presets: [[20, "Near the hub"], [35, "Medium"], [50, "Near the rim"]] }],
  speed: { min: 2, max: 30, value: 10, label: "Disc speed", unit: " rpm" },
  readouts: [{ id: "drop", label: "Treadle" }, { id: "cord", label: "Cord" }],
  views: { "3d": [420, 110, 800], front: [140, -35, 740], side: [820, -35, 14] },
  target: [140, -30, 8],
  how: [
    "Press the treadle down. The part of the cord between the treadle and the small wheel gets longer. So the cord on the other side is dragged in, and it pulls the pin up and round. The red mark slides along the cord as it moves.",
    "A cord can pull but it cannot push. Once the pin has passed the point nearest the small wheel, the cord can pull no more. The weight of the disc keeps it turning. The treadle rises and the cord goes slack and sags. When the pin comes round again, the cord goes tight and the next stroke begins.",
    "Try the pin near the hub, then near the rim. Near the rim, the pin travels in a bigger circle. The treadle then has to go down much further to pull it round."
  ],
  note: "This model is rebuilt from Brown's drawing. The stands, the base and the tall post that holds the small wheel were made up. The pin sits nearer the hub than in the drawing, so the treadle does not have to go so low. The disc turns at a steady speed, as a heavy wheel would, and the treadle follows it. The sizes and the amount of sag are made up.",

  K: { R: 73, cx: 130, cy: 131, r: 35, px: 273, py: -66, kz: 7.5, ax: 165, Z: 14, LO: -2 * Math.PI / 180, E: 14, M: 250 },

  // cord length from the peg, over the wheel, to where the straight part leaves the wheel
  tang: function (th, rho) {
    var K = this.K, Px = rho * Math.cos(th), Py = rho * Math.sin(th), dx = K.cx - Px, dy = K.cy - Py, d = Math.hypot(dx, dy);
    var a = Math.atan2(dy, dx) + Math.asin(K.r / d), len = Math.sqrt(d * d - K.r * K.r);
    var Tx = Px + len * Math.cos(a), Ty = Py + len * Math.sin(a), aT = Math.atan2(Ty - K.cy, Tx - K.cx);
    if (aT < 0) aT += 2 * Math.PI;
    return { Px: Px, Py: Py, Tx: Tx, Ty: Ty, len: len, aT: aT, arc: K.r * aT, a: a };
  },
  // height of the cord's knot on the treadle for a treadle angle phi, and the inverse
  ky: function (phi) { var K = this.K, D = K.px - K.ax; return K.py - D * Math.tan(phi) + K.kz / Math.cos(phi); },
  phiOf: function (ky) {
    var a = -.3, b = .9;
    for (var i = 0; i < 40; i++) { var m = (a + b) / 2; if (this.ky(m) > ky) a = m; else b = m; }
    return (a + b) / 2;
  },
  setPin: function (pct) {
    var K = this.K, o = this.o, th, v, mx = -1e9, mn = 1e9;
    o.rho = pct * K.R / 100; o.peg.position.x = o.rho;
    for (var i = 0; i < 1440; i++) {
      th = i * Math.PI / 720; var t = this.tang(th, o.rho); v = t.len + t.arc;
      if (v > mx) { mx = v; o.thF = th; }
      if (v < mn) { mn = v; o.thD = th; }
    }
    o.span = ((o.thF - o.thD) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    o.L = mx + K.cy - this.ky(K.LO);          // cord is just long enough with the treadle at its highest and the peg farthest away
    o.kyLo = this.ky(K.LO); o.pct = pct;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, Z = K.Z, i;
    var o = this.o = { th: null, V0: null, joints: [] };
    var GT = -210;                                                          // ground top
    // supports, all c.fixed. Ground plate x -75..320, y -222..-210, z -35..25
    P.at(P.box(395, 12, 60, c.fixed), 122.5, GT - 6, -5, scene);
    // disc stand: upright x -16..16, y -210..0, z -25..-11; cap r18, z -26..-10, centred on the shaft
    P.at(P.box(32, -GT, 14, c.fixed), 0, GT / 2, -18, scene);
    P.at(P.cylZ(18, 16, c.fixed), 0, 0, -18, scene);
    // wheel post: x 120..140, y -210..131, z -2..6; cap r16, z -3..7
    P.at(P.box(20, K.cy - GT, 8, c.fixed), K.cx, (K.cy + GT) / 2, 2, scene);
    P.at(P.cylZ(16, 10, c.fixed), K.cx, K.cy, 2, scene);
    // treadle hinge post: x 257..289, y -210..-66, z -2..6; cap r18, z -3..7
    P.at(P.box(32, K.py - GT, 8, c.fixed), K.px, (K.py + GT) / 2, 2, scene);
    P.at(P.cylZ(18, 10, c.fixed), K.px, K.py, 2, scene);

    // disc, shaft from the stand face (z -10) to z 12; disc z -7..7, hub z 7..10, peg z 7..21
    o.disc = new T.Group(); scene.add(o.disc);
    P.at(P.cylZ(K.R, 14, c.mat("disc")), 0, 0, 0, o.disc);
    P.at(P.cylZ(10, 3, c.mat("disc")), 0, 0, 8.5, o.disc);
    P.at(P.cylZ(5, 22, c.mat("disc", "dark")), 0, 0, 1, o.disc);
    P.at(P.box(46, 5, 1, c.mat("disc", "dark")), -34, 0, 8, o.disc);        // stripe, z 7.5..8.5
    o.peg = P.at(P.cylZ(4, 14, c.mat("peg")), 28, 0, Z, o.disc);
    // small wheel: shaft z 7..21, wheel z 9..19, cord plane z 14
    P.at(P.cylZ(4, 14, c.mat("wheel", "dark")), K.cx, K.cy, Z, scene);
    o.wheel = new T.Group(); o.wheel.position.set(K.cx, K.cy, Z); scene.add(o.wheel);
    P.at(P.cylZ(K.r, 10, c.mat("wheel")), 0, 0, 0, o.wheel);
    for (i = 0; i < 3; i++) { var a = i * 2 * Math.PI / 3; P.at(P.cylZ(4.5, 11, c.mat("wheel", "dark")), 20 * Math.cos(a), 20 * Math.sin(a), 0, o.wheel); }
    P.at(P.sphere(5, c.mat("wheel", "dark")), 0, 0, 6, o.wheel);
    // treadle: bar 250 long, 7 deep, 8 wide, hinged at its right end (the group origin), z 10..18
    o.tre = new T.Group(); o.tre.position.set(K.px, K.py, Z); scene.add(o.tre);
    P.at(P.box(250, 7, 8, c.mat("treadle")), -125, 0, 0, o.tre);
    P.at(P.cylZ(9, 10, c.mat("treadle")), 0, 0, 0, o.tre);
    P.at(P.cylZ(4, 13, c.mat("treadle", "dark")), K.px, K.py, 13.5, scene);    // hinge pin z 7..20
    o.knot = P.at(P.sphere(4.5, c.mat("cord")), 0, K.kz, 0, o.tre);
    o.ring = P.at(P.hook({ radius: 6, tube: 2, material: c.mat("cord") }), 0, -8.5, 0, o.tre);
    // cord
    var cm = c.mat("cord");
    o.arc = P.at(new T.Mesh(new T.TorusGeometry(K.r, 2.2, 8, 24, 1), cm), K.cx, K.cy, Z, scene);
    o.vert = P.at(P.rod(2.2, cm), 0, 0, 0, scene);
    o.seg = []; for (i = 0; i < 10; i++) o.seg.push(P.at(P.rod(2.2, cm), 0, 0, 0, scene));
    o.j = []; for (i = 0; i < 11; i++) o.j.push(P.at(P.sphere(2.2, cm), 0, 0, 0, scene));
    o.mark = P.at(P.sphere(4.2, c.mat("cord", "mark")), 0, 0, 0, scene);
    this.setPin(35);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, i, TWO = 2 * Math.PI;
    if (S.controls.pin !== o.pct) this.setPin(S.controls.pin);
    if (o.th === null) {                                                     // opening: treadle at its drawn slope, cord tight
      var a = o.thD - o.span - 1, b = o.thD, ph0 = 15 * Math.PI / 180, kyT = this.ky(ph0);
      for (i = 0; i < 50; i++) {
        var m = (a + b) / 2, t0 = this.tang(m, o.rho);
        if (K.cy - (o.L - t0.len - t0.arc) > kyT) b = m; else a = m;
      }
      o.th = (a + b) / 2;
    }
    o.th += S.w * dt;
    var th = o.th, t = this.tang(th, o.rho), x = (((th - o.thD) % TWO) + TWO) % TWO, e = 0;
    if (x < o.span) e = K.E * Math.sin(Math.PI * x / o.span);                // after the peg passes its nearest point the cord goes slack
    var V = o.L - t.len - t.arc - e;                                          // straight part from the wheel down to the knot
    var phi = this.phiOf(K.cy - V);
    if (o.V0 === null) o.V0 = V;
    o.disc.rotation.z = th;
    o.wheel.rotation.z = -(V - o.V0) / K.r;
    o.tre.rotation.z = phi;
    var s = Math.sin(phi), cs = Math.cos(phi), dl = (K.px - K.ax - K.kz * s) / cs;
    o.knot.position.x = -dl; o.ring.position.x = -dl;
    // cord: vertical part
    var Z = K.Z, kx = K.ax, ky = K.cy - V;
    o.vert.span(kx, K.cy, Z, kx, ky, Z);
    // arc, from the right-hand side of the wheel round the top to the tangent point
    o.arc.geometry.dispose(); o.arc.geometry = new c.THREE.TorusGeometry(K.r, 2.2, 8, 24, t.aT);
    // slack part, sagging below the straight line
    var dx = t.Tx - t.Px, dy = t.Ty - t.Py, sl = Math.hypot(dx, dy), nx = dy / sl, ny = -dx / sl, N = 10, h = 0, pts = [], k;
    if (ny > 0) { nx = -nx; ny = -ny; }
    function poly(hh) { var q = [], L = 0, px = 0, py = 0, k; for (k = 0; k <= N; k++) { var u = k / N, X = t.Px + dx * u + nx * hh * 4 * u * (1 - u), Y = t.Py + dy * u + ny * hh * 4 * u * (1 - u); if (k) L += Math.hypot(X - px, Y - py); q.push([X, Y, L]); px = X; py = Y; } return q; }
    if (e > .02) { var lo = 0, hi = 200; for (k = 0; k < 30; k++) { h = (lo + hi) / 2; if (poly(h)[N][2] > sl + e) hi = h; else lo = h; } }
    pts = poly(h);
    for (i = 0; i < N; i++) o.seg[i].span(pts[i][0], pts[i][1], Z, pts[i + 1][0], pts[i + 1][1], Z);
    for (i = 0; i <= N; i++) o.j[i].position.set(pts[i][0], pts[i][1], Z);
    // the red mark stays at one place along the cord, counted from the knot
    var mm = K.M, px, py;
    if (mm <= V) { px = kx; py = K.cy - mm; }
    else if (mm <= V + t.arc) { var an = (mm - V) / K.r; px = K.cx + K.r * Math.cos(an); py = K.cy + K.r * Math.sin(an); }
    else {
      var d = pts[N][2] - (mm - V - t.arc); if (d < 0) d = 0;
      k = 1; while (k < N && pts[k][2] < d) k++;
      var f = (d - pts[k - 1][2]) / ((pts[k][2] - pts[k - 1][2]) || 1);
      px = pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f; py = pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f;
    }
    o.mark.position.set(px, py, Z + 2.4);
    S.set("drop", Math.max(0, (o.kyLo - ky) / 10).toFixed(1) + " cm");
    S.set("cord", e > .5 ? "Slack" : "Taut");
  }
});
