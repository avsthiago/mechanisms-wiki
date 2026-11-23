M507.define({
  number: 150,
  title: "Expansion cams for a valve",
  lede: "Four cams of different size sit side by side on one turning shaft. Slide the shaft's cam stack along, and a different cam sits under the lever. A bigger cam lifts the lever higher, so the valve rod moves further.",
  alt: "A shaft seen from its end, with four round cams on it, each a little bigger than the one in front. A long lever rests on one cam and is held at its far end on a post. A rod hangs from the middle of the lever and slides in a guide.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Driving shaft", note: "It turns all the time. The dark mark on its end shows the turn." },
    { key: "cams", color: "#C8873A", name: "Four cams", note: "Each is a round plate with one bulge. The bulges are different sizes. The whole stack slides along the shaft." },
    { key: "key", color: "#C2503F", name: "Sliding key", note: "A long strip along the shaft. It makes the cams turn with the shaft, yet lets them slide. Watch it turn." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "Held by a pin at its right end. Its left end rests on the cam that is lined up with it." },
    { key: "rod", color: "#4FA58A", name: "Valve rod", note: "Hangs from the middle of the lever and slides up and down in a guide. It works the valve." }
  ],
  controls: [{ id: "cam", label: "Cam in use", value: "1", options: [["0", "Smallest"], ["1", "Small"], ["2", "Big"], ["3", "Biggest"]] }],
  readouts: [{ id: "lift", label: "Lever lift" }, { id: "rod", label: "Rod travel" }],
  views: { front: [80, 30, 560], "3d": [270, 160, 430], side: [580, 40, 0] },
  target: [80, 0, 0],
  distance: [300, 2400],
  how: [
    "The shaft turns. Each cam turns with it, and each has one bulge. When a bulge comes round to the top, it pushes the left end of the lever up. When the bulge has passed, the lever drops back.",
    "The valve rod hangs from the middle of the lever, so it moves up and down with the lever, but only about half as far. Only the cam that is lined up with the lever matters. The others turn past beside it without touching.",
    "Try Smallest, then Biggest. Watch the cam stack slide, then watch the lever and the rod. A bigger bulge gives a longer stroke."
  ],
  note: "This model is rebuilt from Brown's drawing. The number of cams, their sizes and the shape of each bulge were made up. The lever's pin post, the guide for the rod, the bearing wall behind the shaft and the base were added to hold it up. Brown draws the lever from the side. Here the lever's end is a small pointed foot, and the lever height is worked out exactly from the edge of the cam under it. When a big bulge rises beside the foot, it lifts the lever by its bar. The long key along the shaft is drawn to show how the cams slide yet turn with the shaft.",

  G: { B: 45, TH: [10, 20, 30, 40], W: 1.2, PX: 190, PY: 48, L: 190, XR: 96, T: 18 },

  // edge of cam i at cam angle a: round base with one smooth bulge centred on angle 0
  radius: function (i, a) {
    var G = this.G, W = G.W * 1.0, d = Math.atan2(Math.sin(a), Math.cos(a));
    return G.B + (Math.abs(d) < W ? G.TH[i] * .5 * (1 + Math.cos(Math.PI * d / W)) : 0);
  },

  // height of cam i's edge at horizontal position x when the cam has turned by th (finds the boundary point above x)
  edge: function (i, x, th) {
    var phi = Math.PI / 2, k, r;
    for (k = 0; k < 8; k++) { r = this.radius(i, phi - th); phi = Math.acos(Math.max(-1, Math.min(1, x / r))); }
    return this.radius(i, phi - th) * Math.sin(phi);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene, i;
    var o = this.o = { th: 0, sz: null, cams: [] };
    o.rot = new T.Group(); scene.add(o.rot);
    // shaft z -70..90 (back end on the wall face); end mark z 90..91.4; key y 10..16 (shaft surface r 12 hides its lower part)
    P.at(P.cylZ(12, 160, c.mat("shaft")), 0, 0, 10, o.rot);
    P.at(P.box(3, 20, 1.4, c.mat("shaft", "dark")), 0, 0, 90.7, o.rot);
    P.at(P.box(5, 6, 130, c.mat("key")), 0, 13, 5, o.rot);                      // key z -60..70, y 10..16
    o.stack = new T.Group(); o.rot.add(o.stack);
    for (i = 0; i < 4; i++) {
      var sh = new T.Shape(), n = 720, j;
      for (j = 0; j < n; j++) { var a = 2 * Math.PI * j / n, r = this.radius(i, a); if (j) sh.lineTo(r * Math.cos(a), r * Math.sin(a)); else sh.moveTo(r, 0); }
      var m = P.mesh(new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false }), c.mat("cams"));
      P.at(m, 0, 0, this.zl(i) - 8, o.stack);                                   // cam i: local z centre zl(i) +-8, 2 gap between
      if (i < 3) P.at(P.cylZ(20, 2, c.mat("cams", "dark")), 0, 0, this.zl(i) - 9, o.stack);   // spacer collar between cams, fills the 2 gap exactly
    }
    // lever parts, positioned each frame
    o.bar = P.rod(4, c.mat("lever")); scene.add(o.bar);
    o.eyeL = P.hook({ radius: 8, tube: 3, material: c.mat("lever") }); scene.add(o.eyeL);
    o.foot = P.sphere(3, c.mat("lever", "dark")); scene.add(o.foot);
    P.at(P.hook({ radius: 10, tube: 3, material: c.mat("lever") }), G.PX, G.PY, 0, scene);
    P.at(P.cylZ(4, 18, c.fixed), G.PX, G.PY, -1, scene);                       // pin z -10..8, starts on the post face
    P.at(P.box(30, 200, 10, c.fixed), G.PX, -30, -15, scene);                  // post x 175..205, y -130..70, z -20..-10
    o.eyeR = P.hook({ radius: 8, tube: 3, material: c.mat("rod") }); scene.add(o.eyeR);
    o.rodm = new T.Group(); scene.add(o.rodm);
    P.at(P.cylY(3.5, 175, c.mat("rod")), G.XR, -87.5, 0, o.rodm);              // rod below its eye: y -175..0 local
    var gb = P.guideBlock({ w: 30, h: 24, d: 24, hole: 4, material: c.fixed });
    P.at(gb, G.XR, -80, 0, scene);                                             // guide x 81..111, y -92..-68, z -12..12
    P.at(P.box(20, 38, 10, c.fixed), G.XR, -111, -17, scene);                  // post x 86..106, y -130..-92, z -22..-12
    P.at(P.box(100, 170, 20, c.fixed), 0, -45, -80, scene);                    // bearing wall x -50..50, y -130..40, z -90..-70; shaft ends on its face
    P.at(P.box(360, 12, 130, c.fixed), 70, -136, -25, scene);                  // base x -110..250, y -142..-130, z -90..40
  },

  // Lever angle f below level (foot at PX - L cos f, PY - L sin f): the largest f at which the bar from the pin to the
  // foot stays 4 clear of the edges of the cams under it, so a bulge beside the foot lifts the bar instead of cutting it.
  clear: function (under, th, f) {
    var G = this.G, fx = G.PX - G.L * Math.cos(f), fy = G.PY - G.L * Math.sin(f), dx = G.PX - fx, dy = G.PY - fy, dd = dx * dx + dy * dy, k, j;
    for (k = 0; k < under.length; k++) for (j = 0; j < 240; j++) {
      var a = 2 * Math.PI * j / 240, r = this.radius(under[k], a), px = r * Math.cos(a + th), py = r * Math.sin(a + th);
      var t = Math.max(0, Math.min(1, ((px - fx) * dx + (py - fy) * dy) / dd)), ex = fx + t * dx - px, ey = fy + t * dy - py;
      if (ex * ex + ey * ey < 16) return false;
    }
    return true;
  },
  drop: function (under, th) {
    var lo = -0.6, hi, k;
    if (!under.length) under = [0];
    for (hi = lo; hi < 0.8; hi += 0.01) if (!this.clear(under, th, hi)) break;
    lo = hi - 0.01;
    for (k = 0; k < 20; k++) { var m = (lo + hi) / 2; if (this.clear(under, th, m)) lo = m; else hi = m; }
    return lo;
  },

  // local z of the centre of cam i in the stack (smallest in front)
  zl: function (i) { return 27 - 18 * i; },

  step: function (c, dt, S) {
    var o = this.o, G = this.G, i, k = +S.controls.cam || 0;
    var goal = -this.zl(k);
    if (o.sz === null) o.sz = goal;
    var d = goal - o.sz, mv = 70 * dt; o.sz += Math.abs(d) < mv ? d : (d > 0 ? mv : -mv);
    o.stack.position.z = o.sz;
    o.th += S.w * dt; o.rot.rotation.z = o.th;
    // contact: the lowest the lever can hang with its whole bar (radius 4) clear of every cam under it (plates at z -4..4)
    var under = [];
    for (i = 0; i < 4; i++) { var zc = this.zl(i) + o.sz; if (zc + 8 > -4 && zc - 8 < 4) under.push(i); }
    var f = this.drop(under, o.th), tx = G.PX - G.L * Math.cos(f), ky = G.PY - G.L * Math.sin(f);
    o.bar.span(G.PX, G.PY, 0, tx, ky, 0);
    o.foot.position.set(tx, ky, 0);
    o.eyeL.position.set(tx, ky + 11, 0);
    // valve rod: vertical at XR, its eye on the lever line
    var yE = G.PY + (ky - G.PY) * (G.PX - G.XR) / (G.PX - tx);
    o.eyeR.position.set(G.XR, yE, 0); o.rodm.position.y = yE;
    var rest = G.PY;
    if (o.ky0 === undefined) o.ky0 = G.PY - G.L * Math.sin(this.drop([0], -Math.PI / 2));   // bulge at the bottom: foot on the round part
    S.set("lift", Math.round(ky - o.ky0) + " mm");
    S.set("rod", Math.round(yE - rest) + " mm");
  }
});
