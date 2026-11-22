M507.define({
  number: 73,
  title: "Spring ratchet drive",
  lede: "A wheel turns all the time, but the toothed wheel in front of it moves on by just one tooth each turn. A springy finger on the turning wheel is pressed into the teeth by a strong fixed spring. This gives a small, sure step once a turn.",
  alt: "A big round disc with a smaller toothed wheel in front of it on the same shaft. A thin curved spring is fixed to the disc near its edge, with a hooked tip. A stronger curved spring rises from a fixed block at the lower left, and its end rests in the teeth.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving wheel", note: "The big disc. It turns loose on the shaft and carries the springy finger round with it." },
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with slanted teeth, called a ratchet. It is fixed to the shaft. Watch the red tooth step round." },
    { key: "finger", color: "#C2503F", name: "Spring finger", note: "A thin bent spring fixed to the driving wheel. On its own it stays clear of the teeth. Watch its hooked tip." },
    { key: "spring", color: "#4FA58A", name: "Strong spring", note: "Fixed to the block. It squeezes the finger into the teeth as it passes. Its end also rests in the teeth so the wheel cannot slip back." }
  ],
  controls: [{ id: "dir", label: "Turn the driving wheel", value: "fwd", options: [["fwd", "Forwards"], ["back", "Backwards"]] }],
  readouts: [{ id: "turns", label: "Driving wheel" }, { id: "teeth", label: "Ratchet wheel" }],
  views: { "3d": [506, 185, 939], front: [-40, -10, 1069], side: [1078, -10, -23] },
  target: [-40, -10, -10],
  how: [
    "The big disc turns all the time and carries the thin spring finger round with it. Most of the way round, the finger's hooked tip stays clear of the teeth. The ratchet wheel stands still.",
    "On the left, the finger slides in under the strong spring. The strong spring is much stiffer, so it squeezes the finger's tip down into a gap between the teeth. The tip now pushes a tooth along, and the ratchet wheel turns with the disc. As soon as the tip gets past the end of the strong spring, the finger springs back out and the ratchet wheel stops. The end of the strong spring drops into the teeth and holds it there.",
    "So the ratchet wheel moves one tooth for each turn of the disc. Try Backwards. The tip is still squeezed into the teeth, but now it slides over the slopes, and the ratchet wheel does not move at all."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate, the base, the sizes and the number of teeth were made up. The end of the strong spring is bent in a little more than in the drawing, so it can rest in the teeth. The tip of the finger is wide, so the strong spring can press on it while the rest of the finger passes behind.",

  init: function () {
    var K = this.K = { N: 10, R: 120, D: 24, RD: 185, RB: 158, AA: 85 * Math.PI / 180, XI: 80 * Math.PI / 180, HK: 26, H: 14,
      HN: Math.asin(6 / 110), RK: 5, CT: 8 }, i, j;
    K.st = 2 * Math.PI / K.N; K.root = K.R - K.D; K.free = K.RB - K.HK;
    K.AN = K.AA - K.XI - K.HN;                                               // nose centre, on the driving wheel, at the start
    // strong spring: centre line from the clamp up to the knob at its end (world, at rest)
    var pts = [[-195.5, -245], [-195.5, -190]], tab = [[214, 236], [207, 210], [200, 180], [194, 152], [188, 134], [182, 127.5], [175, 127], [156, 127], [152, 118], [150, 101]];
    for (i = 0; i < tab.length - 1; i++) for (j = 0; j < (i < tab.length - 3 ? 6 : 3); j++) {
      var f = j / (i < tab.length - 3 ? 6 : 3), a = (tab[i][0] + (tab[i + 1][0] - tab[i][0]) * f) * Math.PI / 180, r = tab[i][1] + (tab[i + 1][1] - tab[i][1]) * f;
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    var last = tab[tab.length - 1]; pts.push([last[1] * Math.cos(last[0] * Math.PI / 180), last[1] * Math.sin(last[0] * Math.PI / 180)]);
    // bending shape along the free part: 0 at the top of the block (y -135), 1 at the knob
    var len = [0], tot = 0;
    for (i = 1; i < pts.length; i++) { tot += pts[i][1] > -135 ? Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) : 0; len.push(tot); }
    K.C = pts.map(function (p, i) { var s = len[i] / tot; return { x: p[0], y: p[1], r: Math.hypot(p[0], p[1]), a: Math.atan2(p[1], p[0]), s: s * s * (3 - s) / 2 }; });
    var tip = K.C[K.C.length - 1]; K.nx = tip.x / tip.r; K.ny = tip.y / tip.r;
    this.o = { th: 0, phi: 0, k: 0, dc: 0 };
    var o = this.o;
    o.phi = K.AN - K.HN - 3.5 * K.st;                                         // any start; one silent turn below settles everything
    o.k = Math.floor((K.AN - K.HN - o.phi) / K.st + 1e-9);
    for (i = 0; i < 2000; i++) this.phys(2 * Math.PI / 2000);
    o.th = 0; o.phi0 = o.phi;
  },
  rimAt: function (u) { var K = this.K, f = u / K.st + 1e-9; f -= Math.floor(f); return K.root + K.D * f; },
  wrap: function (a) { return Math.atan2(Math.sin(a), Math.cos(a)); },

  // turn the driving wheel clockwise by d (radians; negative turns it back)
  phys: function (d) {
    var K = this, Kk = this.K, o = this.o, i, j;
    o.th += d;
    var an = Kk.AN - o.th, lead = an - Kk.HN, trail = an + Kk.HN;
    // how far in the strong spring would press the tip if it did not bend (lug top below each spring point over the tip)
    var dem = Kk.free, hit = -1;
    for (i = 0; i < Kk.C.length; i++) {
      var p = Kk.C[i], da = this.wrap(p.a - an);
      if (Math.abs(da) <= Kk.HN && p.r - Kk.CT / 2 - Kk.H < dem) { dem = p.r - Kk.CT / 2 - Kk.H; hit = i; }
    }
    function rimSpan(lo) { var m = 0; for (j = 0; j <= 4; j++) { var u = lo + (trail - o.phi - lo) * j / 4; m = Math.max(m, K.rimAt(u)); } return m; }
    // the tip's front edge against the faces
    var ul = lead - o.phi;
    while (ul >= (o.k + 1) * Kk.st) o.k++;
    for (i = 0; i < 3 && ul < o.k * Kk.st; i++) {
      var rn = Math.max(dem, rimSpan(o.k * Kk.st + 1e-6));
      if (rn < Kk.R - .5) { o.phi = lead - o.k * Kk.st; ul = o.k * Kk.st; }   // pressed into a gap: it pushes the ratchet wheel round
      else o.k--;                                                              // riding high: it slips over the tooth
    }
    o.rn = Math.max(dem, rimSpan(lead - o.phi));
    o.db = Math.max(0, Kk.free - o.rn);                                       // how far the finger is bent in
    // the strong spring bends out where the tip or the teeth push on it
    var dc = 0;
    if (hit >= 0 && o.rn > dem) dc = Math.max(dc, (o.rn - dem) / Math.max(.2, Kk.C[hit].s));
    for (i = 0; i < Kk.C.length; i++) {
      var q = Kk.C[i], need = i === Kk.C.length - 1 ? this.rimAt(q.a - o.phi) + Kk.RK - q.r : (q.r < Kk.R + 6 ? this.rimAt(q.a - o.phi) + Kk.CT / 2 - q.r : -1);
      if (need > 0 && q.s > .05) dc = Math.max(dc, need / q.s);
    }
    o.dc = dc;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    this.init();
    var K = this.K, o = this.o;
    // Layers along z: plate face -30; driving wheel -24..-12 with its boss -30..-24; finger -10..-2;
    // ratchet -10..10; finger tip -10..10; strong spring 0.5..9.5.
    o.drive = new T.Group(); scene.add(o.drive);
    var md = c.mat("drive");
    P.at(P.cylZ(K.RD, 12, md), 0, 0, -18, o.drive);                           // disc z -24..-12
    P.at(P.cylZ(26, 6, md), 0, 0, -27, o.drive);                              // boss z -30..-24, on the plate face
    var sg = new T.Group(); sg.rotation.z = 265 * Math.PI / 180; o.drive.add(sg);
    P.at(P.box(55, 6, 1, c.mat("drive", "dark")), 152, 0, -11, sg);         // dark stripe r 125..180, z -11.5..-10.5, lifted off the face

    // finger: a thin spring fixed to the disc, with a wide hooked tip
    var mf = c.mat("finger");
    P.at(P.box(16, 16, 10, mf), K.RB * Math.cos(K.AA + .05), K.RB * Math.sin(K.AA + .05), -7, o.drive);   // clamp z -12..-2, on the disc face
    o.strip = P.flatStrip({ points: this.fingerPts(0), thick: 5, width: 8, material: mf });
    o.strip.userData.live = true; o.strip.position.z = -6; o.drive.add(o.strip);   // z -10..-2
    o.tip = new T.Group(); o.tip.rotation.z = K.AN; o.drive.add(o.tip);
    o.hook = P.at(P.box(K.HK, 12, 8, mf), 0, 0, -6, o.tip);                  // hook z -10..-2, from the tip's underside up to the strip
    o.lug = P.at(P.box(K.H, 12, 20, mf), 0, 0, 0, o.tip);                    // tip z -10..10, pushes the teeth and meets the strong spring

    // ratchet wheel on the shaft
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(P.ratchet({ teeth: K.N, radius: K.R, depth: K.D, width: 20, material: c.mat("wheel") }));   // z -10..10
    P.at(P.cylZ(9, 43.5, c.mat("wheel")), 0, 0, -7.75, o.wheel);                  // shaft z -30..14, from the plate face through the disc
    P.at(P.cylZ(22, 4, c.mat("wheel")), 0, 0, 12, o.wheel);                  // hub z 10..14, on the wheel face
    var mk = new T.Group(); mk.rotation.z = -Math.PI / 2 - o.phi + K.st / 2; o.wheel.add(mk);
    P.at(P.box(28, 5, 1, c.mat("wheel", "mark")), 78, 0, 11, mk);           // red mark r 64..92, z 10.5..11.5, lifted off the face

    // strong spring, clamped to the block's right face
    o.spring = P.flatStrip({ points: this.springPts(0), thick: K.CT, width: 9, material: c.mat("spring") });
    o.spring.userData.live = true; o.spring.position.z = 5; scene.add(o.spring);   // z 0.5..9.5; clamped part x -200..-192
    o.knob = P.at(P.cylZ(K.RK, 9, c.mat("spring")), 0, 0, 5, scene);

    // supports
    P.at(P.box(110, 110, 50, c.fixed), -255, -190, -5, scene);               // block x -310..-200, y -245..-135, z -30..20; on the plate face and the base
    P.at(P.box(560, 475, 10, c.fixed), -40, -7.5, -35, scene);               // plate x -320..240, y -245..230, z -40..-30
    P.at(P.box(600, 12, 130, c.fixed), -40, -251, -35, scene);               // base x -340..260, y -257..-245, z -100..30; plate and block stand on y -245
    this.place();
  },

  fingerPts: function (db) {
    var K = this.K, p = [], i, n = 16;
    for (i = 0; i <= n; i++) {
      var x = i / n, a = K.AA - x * K.XI, r = K.RB - db * x * x * (3 - x) / 2;
      p.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return p;
  },
  springPts: function (dc) {
    var K = this.K;
    return K.C.map(function (q) { return [q.x + dc * q.s * K.nx, q.y + dc * q.s * K.ny]; });
  },

  place: function () {
    var K = this.K, o = this.o;
    o.drive.rotation.z = -o.th;
    o.wheel.rotation.z = o.phi;
    o.strip.setPoints(this.fingerPts(o.db));
    o.hook.position.x = o.rn + K.HK / 2; o.lug.position.x = o.rn + K.H / 2;
    o.spring.setPoints(this.springPts(o.dc));
    var t = K.C[K.C.length - 1];
    o.knob.position.set(t.x + o.dc * K.nx, t.y + o.dc * K.ny, 5);
  },

  step: function (c, dt, S) {
    var o = this.o, d = S.w * dt * (S.controls.dir === "back" ? -1 : 1), n = Math.max(1, Math.ceil(Math.abs(d) / .003)), i;
    for (i = 0; i < n; i++) this.phys(d / n);
    this.place();
    var tu = o.th / (2 * Math.PI), turns = tu < 0 ? -Math.floor(-tu + 1e-6) : Math.floor(tu + 1e-6), tt = Math.round((o.phi0 - o.phi) / this.K.st);
    S.set("turns", (turns < 0 ? "−" + -turns : turns) + (Math.abs(turns) === 1 ? " turn" : " turns"));
    S.set("teeth", tt + (tt === 1 ? " tooth" : " teeth"));
  }
});
