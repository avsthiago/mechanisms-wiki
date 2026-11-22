M507.define({
  number: 128,
  title: "Three wipers and a frame",
  lede: "A shaft with three arms turns round and round. The arms push on two stops inside a frame, one after another. So the frame slides to and fro while the shaft keeps turning one way.",
  alt: "A wide frame with rounded corners and a knob on each side. Inside it a shaft with three arms, each ending in a ball. One stop hangs from the top of the frame on the right. Another rises from the bottom on the left.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Shaft and arms", note: "The shaft turns one way all the time, clockwise. Three arms stick out of it, spread evenly round." },
    { key: "wipers", color: "#D9B13B", name: "Balls on the arms", note: "Each arm ends in a ball, called a wiper. It pushes on a stop. Watch the red ball go round." },
    { key: "frame", color: "#C8873A", name: "Frame", note: "A frame with a window. A stop hangs from the top and another rises from the bottom. Rods on its ends slide in fixed guides, so the frame only moves left and right." }
  ],
  readouts: [{ id: "x", label: "Frame" }, { id: "t", label: "Shaft" }],
  views: { front: [0, 0, 1100], "3d": [450, 260, 950], side: [1000, 0, 0] },
  target: [0, -10, 0],
  distance: [400, 2600],
  how: [
    "The shaft turns clockwise. Its three arms end in balls. Watch the red ball go round.",
    "A ball coming up on the right meets the stop that hangs from the top. It pushes the stop, and the whole frame, to the right. Then it slips past the end of the stop. At that moment a ball at the bottom meets the stop that rises from the bottom. It pulls the frame back to the left.",
    "The balls take turns, so one is always touching a stop. The frame goes right and left three times in every turn of the shaft. Press pause and see which ball is touching which stop."
  ],
  note: "This model is rebuilt from Brown's drawing. The guides for the end rods, the post for the shaft, the base, the thickness of the frame and all the sizes were made up. The stops are drawn with straight faces. The frame is held by the balls alone: one ball is always touching a stop, so it cannot wander.",

  // Shaft at the origin. Frame position f is measured from the drawn state. Stops: top stop left face x = XT, tip y = YT; bottom stop right face x = XB, tip y = YB.
  K: { R: 85, r: 15, XT: 89, YT: 30, XB: -56, YB: -41, A0: 30 },

  // Lowest and highest frame position allowed by the balls, with the shaft turned clockwise by th.
  bounds: function (th) {
    var K = this.K, L = -1e9, U = 1e9, j, a, bx, by, dy;
    for (j = 0; j < 3; j++) {
      a = K.A0 * Math.PI / 180 - th + j * 2 * Math.PI / 3; bx = K.R * Math.cos(a); by = K.R * Math.sin(a);
      dy = by - K.YT;
      if (dy >= 0) L = Math.max(L, bx + K.r - K.XT);
      else if (-dy < K.r) L = Math.max(L, bx + Math.sqrt(K.r * K.r - dy * dy) - K.XT);
      dy = by - K.YB;
      if (dy <= 0) U = Math.min(U, bx - K.r - K.XB);
      else if (dy < K.r) U = Math.min(U, bx - Math.sqrt(K.r * K.r - dy * dy) - K.XB);
    }
    return [L, U];
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i;
    var o = this.o = { th: 0, f: 0, t0: 0 };
    // shaft group: shaft z -50 (post face) .. 28, hub z -8..8, arms z -5..5, balls z -8..8
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(16, 78, c.mat("shaft")), 0, 0, -11, o.rot);                  // shaft z -50..28
    P.at(P.cylZ(37, 16, c.mat("shaft")), 0, 0, 0, o.rot);                    // hub z -8..8
    P.at(P.box(3, 26, 1, c.mat("shaft", "dark")), 0, 0, 28.5, o.rot);        // mark on the shaft end, z 28..29
    P.at(P.box(4, 18, 1, c.mat("shaft", "dark")), 0, 27, 8.5, o.rot);        // stripe on the hub face, z 8..9, y 18..36
    for (i = 0; i < 3; i++) {
      var g = new T.Group(); g.rotation.z = (K.A0 + 120 * i) * Math.PI / 180; o.rot.add(g);
      P.at(P.box(K.R, 9, 10, c.mat("shaft")), K.R / 2, 0, 0, g);              // arm x 0..R, z -5..5
      P.at(P.cylZ(K.r, 16, i ? c.mat("wipers") : c.mat("wipers", "mark")), K.R, 0, 0, g);   // ball z -8..8
    }
    // frame: outer x -187..209, y -152..148, z -18..18; window x -146..175, y -122..115 with two stops
    o.frame = new T.Group(); scene.add(o.frame);
    var sh = new T.Shape(), x0 = -187, x1 = 209, y0 = -152, y1 = 148, rc = 40;
    sh.moveTo(x0 + rc, y0); sh.lineTo(x1 - rc, y0); sh.absarc(x1 - rc, y0 + rc, rc, -Math.PI / 2, 0, false);
    sh.lineTo(x1, y1 - rc); sh.absarc(x1 - rc, y1 - rc, rc, 0, Math.PI / 2, false);
    sh.lineTo(x0 + rc, y1); sh.absarc(x0 + rc, y1 - rc, rc, Math.PI / 2, Math.PI, false);
    sh.lineTo(x0, y0 + rc); sh.absarc(x0 + rc, y0 + rc, rc, Math.PI, 1.5 * Math.PI, false);
    var w = new T.Path();
    [[-146, -122], [K.XB - 40, -122], [K.XB - 40, K.YB], [K.XB, K.YB], [K.XB, -122], [175, -122], [175, 115],
      [K.XT + 40, 115], [K.XT + 40, K.YT], [K.XT, K.YT], [K.XT, 115], [-146, 115]].forEach(function (p, j) { if (j) w.lineTo(p[0], p[1]); else w.moveTo(p[0], p[1]); });
    w.closePath(); sh.holes.push(w);
    var fg = new T.ExtrudeGeometry(sh, { depth: 36, bevelEnabled: false }); fg.translate(0, 0, -18);
    o.frame.add(P.mesh(fg, c.mat("frame")));                                  // frame z -18..18
    P.at(P.cylX(12, 120, c.mat("frame")), -230, 0, 0, o.frame);               // left rod x -290..-170, starts inside the bar
    P.at(P.cylX(12, 110, c.mat("frame")), 245, 0, 0, o.frame);                // right rod x 190..300
    // supports: a guide on a post at each end, a post behind the shaft, a base
    [-250, 252].forEach(function (x) {
      var gb = P.guideBlock({ w: 30, h: 24, d: 30, hole: 12.5, material: c.fixed }); gb.rotation.z = Math.PI / 2;
      P.at(gb, x, 0, 0, scene);                                               // guide x +-12 about centre, y -15..15, z -15..15
      P.at(P.box(24, 155, 30, c.fixed), x, -92.5, 0, scene);                  // post y -170..-15, same x and z as the guide
    });
    P.at(P.box(600, 12, 140, c.fixed), 0, -176, 0, scene);                    // base x -300..300, y -182..-170, z -70..70
    P.at(P.box(70, 205, 10, c.fixed), 0, -67.5, -55, scene);                  // shaft post x -35..35, y -170..35, z -60..-50; the shaft ends on its face
    o.f = Math.min(Math.max(0, this.bounds(0)[0]), this.bounds(0)[1]);
    this.place(o);
  },

  place: function (o) {
    o.rot.rotation.z = -o.th;
    o.frame.position.x = o.f;
  },

  step: function (c, dt, S) {
    var o = this.o, n = Math.max(1, Math.ceil(Math.abs(S.w * dt) / 0.01)), i, b;
    if (S.playing) for (i = 0; i < n; i++) {
      o.th += S.w * dt / n;
      b = this.bounds(o.th);
      o.f = Math.min(Math.max(o.f, b[0]), b[1]);
    }
    this.place(o);
    var v = Math.round(o.f);
    S.set("x", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm");
    S.set("t", (o.th / (2 * Math.PI)).toFixed(1) + " turns");
  }
});
