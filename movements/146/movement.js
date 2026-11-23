M507.define({
  number: 146,
  title: "Crank pin in a grooved yoke",
  lede: "A disc turns steadily and its pin runs in a groove cut in a yoke. The yoke slides up and down on a rod. If the groove is curved the right way, the yoke moves at the same speed all the way up and all the way down.",
  alt: "A round disc with a red pin near its top edge, behind a wide flat yoke. A dark groove is cut across the yoke face and the pin sits in it. A rod fixed to the yoke slides through a guide above and a guide below.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Crank disc", note: "A disc on a shaft. It turns at a steady speed and carries the pin round with it." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The red pin stands out from the disc and sits in the groove. Watch it travel along the groove." },
    { key: "yoke", color: "#C8873A", name: "Grooved yoke", note: "A wide flat bar with a dark groove in its face. The pin pushes on the groove and the yoke goes up and down." },
    { key: "rod", color: "#4FA58A", name: "Rod", note: "Fixed to the yoke above and below. Two guides hold it, so it can only slide straight up and down." }
  ],
  controls: [{ id: "g", label: "Groove", value: "shaped", options: [["straight", "Straight"], ["shaped", "Shaped"]] }],
  readouts: [{ id: "v", label: "Yoke speed" }, { id: "y", label: "Yoke height" }],
  opacity: function (key) { return key === "disc" ? .4 : 1; },
  views: { "3d": [320, 100, 780], front: [0, 0, 640], side: [800, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The disc turns at a steady speed and the red pin goes round in a circle. The pin sits in a groove in the yoke. The yoke can only move up and down, so the pin pushes it that way.",
    "With a straight groove, the yoke speeds up and slows down as the pin goes round. It is fastest in the middle of each stroke and stops for a moment at the top and the bottom. With the shaped groove, the pin is steered up and down the curve. The yoke then moves at nearly the same speed for the whole stroke. It turns round quickly at each end.",
    "Watch the speed reading while the disc turns. Try Straight, then Shaped, and compare how much the speed changes."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show the shape of the groove. It was worked out here so that the yoke moves almost evenly, which makes a curve like a figure of eight lying on its side. The groove is cut into the yoke face, with a dark floor. The guides, the plate behind the shaft, the base and all the sizes were made up. The disc is drawn in front, as in the drawing, but made see-through so the groove shows behind it. The yoke has a slot in the middle for the shaft.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var r = 56, K = 0.96, AK = Math.asin(K), W = 3.2, SW = 10, SL = 56, HH = 80, HL = 108;
    var o = this.o = { a: 1.45, r: r, K: K, AK: AK };
    o.Y = function (a) { return r * Math.asin(K * Math.sin(a)) / AK; };               // yoke height for a disc angle: nearly linear in the angle
    o.curve = function (a) { return { x: r * Math.cos(a), y: r * Math.sin(a) - o.Y(a) }; };   // the peg in the yoke's own frame: this is the groove centre-line
    // disc in front of the yoke: shaft z -30..22, disc z 8..22, hub z 22..24, peg z 3..24 (reaches back into the groove, whose floor is z 2)
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(8, 52, c.mat("disc")), 0, 0, -4, o.rot);                               // shaft z -30..22, ends on the plate face at z -30
    P.at(P.cylZ(80, 14, c.mat("disc")), 0, 0, 15, o.rot);                              // disc z 8..22
    P.at(P.cylZ(14, 2, c.mat("disc")), 0, 0, 23, o.rot);                               // hub z 22..24
    P.at(P.box(r - 14, 6, .6, c.mat("disc", "dark")), 14 + (r - 14) / 2, 0, 22.7, o.rot);   // stripe x 14..r, z 22.4..23.0
    P.at(P.cylZ(3, 21, c.mat("pin", "mark")), r, 0, 13.5, o.rot);                      // peg z 3..24, one unit proud of the groove floor
    // yoke frame: rounded plate x +-108, y +-80, central slot for the shaft. Back layer z -2..2 (dark groove floor), front layer z 2..6
    o.yoke = new T.Group(); scene.add(o.yoke);
    function outer() {
      var s = new T.Shape(), q = 28, x = HL, y = HH;
      s.moveTo(-x + q, -y); s.lineTo(x - q, -y); s.absarc(x - q, -y + q, q, -Math.PI / 2, 0, false); s.lineTo(x, y - q); s.absarc(x - q, y - q, q, 0, Math.PI / 2, false);
      s.lineTo(-x + q, y); s.absarc(-x + q, y - q, q, Math.PI / 2, Math.PI, false); s.lineTo(-x, -y + q); s.absarc(-x + q, -y + q, q, Math.PI, 1.5 * Math.PI, false);
      return s;
    }
    function ext(shape, z0, depth, m) { var g = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, z0); return P.mesh(g, m); }
    function mir(L, sx, sy) { return L.map(function (p) { return new T.Vector2(p.x * sx, p.y * sy); }); }
    function slotHole(R) {                                                              // the shaft slot, with an optional bump R (a list from the slot out and back) on each side
      var pts = [], t, i, Rm = R ? mir(R, -1, 1) : [], Rr = R ? R.slice().reverse() : [];
      for (t = 0; t <= Math.PI + 1e-6; t += Math.PI / 12) pts.push(new T.Vector2(SW * Math.cos(t), SL + SW * Math.sin(t)));
      pts = pts.concat(Rm);
      for (t = Math.PI; t <= 2 * Math.PI + 1e-6; t += Math.PI / 12) pts.push(new T.Vector2(SW * Math.cos(t), -SL + SW * Math.sin(t)));
      return new T.Path(pts.concat(Rr));
    }
    var back = outer(); back.holes.push(slotHole(null));
    o.yoke.add(ext(back, -2, 4, c.mat("yoke", "dark")));                                // z -2..2, y -80..80
    // groove outlines
    function edge(a, s) { var p = o.curve(a), q = o.curve(a + 1e-4), dx = q.x - p.x, dy = q.y - p.y, d = Math.sqrt(dx * dx + dy * dy); return new T.Vector2(p.x + s * W * dy / d, p.y - s * W * dx / d); }
    var Tl = [], a, p, prev, k, yb;
    for (a = 0; a < Math.PI / 2; a += .01) { p = edge(a, 1); if (p.x <= SW) { yb = prev.y + (p.y - prev.y) * (prev.x - SW) / (prev.x - p.x); Tl.push(new T.Vector2(SW, yb)); break; } Tl.push(p); prev = p; }
    Tl.reverse();                                                                       // from the slot edge out to the tip of the groove
    var R = Tl.concat(mir(Tl.slice(0, Tl.length - 1), 1, -1).reverse());                // out along the top edge, back along the bottom edge
    var Rs = [new T.Vector2(SW, W), new T.Vector2(r, W)];                               // straight groove: half width W, rounded end
    for (k = 6; k >= -6; k--) Rs.push(new T.Vector2(r + W * Math.cos(k * Math.PI / 12), W * Math.sin(k * Math.PI / 12)));
    Rs.push(new T.Vector2(r, -W), new T.Vector2(SW, -W));
    o.gs = new T.Group(); o.gc = new T.Group(); o.yoke.add(o.gs); o.yoke.add(o.gc);
    var fs = outer(); fs.holes.push(slotHole(Rs)); o.gs.add(ext(fs, 2, 4, c.mat("yoke")));   // z 2..6
    var fc = outer(); fc.holes.push(slotHole(R)); o.gc.add(ext(fc, 2, 4, c.mat("yoke")));
    var I = [], pp = null, inside = false;                                              // islands of yoke left between the two arms of the shaped groove
    for (a = 0; a < Math.PI / 2; a += .004) {
      p = edge(a, -1);
      if (!inside && p.y > 0 && pp) { I.push(new T.Vector2(pp.x + (p.x - pp.x) * (-pp.y) / (p.y - pp.y), 0)); inside = true; }
      if (inside && p.y <= 0) { I.push(new T.Vector2(pp.x + (p.x - pp.x) * pp.y / (pp.y - p.y), 0)); break; }
      if (inside) I.push(p);
      pp = p;
    }
    o.islandX = I[I.length - 1].x;
    var poly = I.concat(mir(I.slice(1, I.length - 1), 1, -1).reverse());
    [1, -1].forEach(function (sx) { o.gc.add(ext(new T.Shape(mir(poly, sx, 1)), 2, 4, c.mat("yoke"))); });
    [1, -1].forEach(function (s) { P.at(P.cylY(8, 126, c.mat("rod")), 0, s * 143, 0, o.yoke); });   // rods |y| 80..206, from the bar faces; z -8..8
    // supports: guides y 142..160 and -160..-142, arms back to a plate, plate on a base
    [1, -1].forEach(function (s) {
      P.at(P.guideBlock({ w: 24, h: 18, d: 24, hole: 8.8, material: c.fixed }), 0, s * 151, 0, scene);   // guide x -12..12, y 142..160, z -12..12
      P.at(P.box(24, 18, 18, c.fixed), 0, s * 151, -21, scene);                        // arm z -30..-12, y 142..160
    });
    P.at(P.box(90, 318, 10, c.fixed), 0, 0, -35, scene);                               // plate x -45..45, y -159..159, z -40..-30
    [1, -1].forEach(function (s) { P.at(P.box(65, 12, 30, c.fixed), s * 57.5, -165, -45, scene); });   // feet x 25..90 and -90..-25, y -171..-159, z -60..-30
  },

  step: function (c, dt, S) {
    var o = this.o, r = o.r, shaped = (S.controls.g || "shaped") === "shaped", y, v, d;
    o.gs.visible = !shaped; o.gc.visible = shaped;
    o.a += S.w * dt;
    o.rot.rotation.z = o.a;
    if (shaped) {                                                                      // the peg sits on the groove centre-line, so the yoke height is the peg height minus the groove height
      y = o.Y(o.a); d = o.K * Math.cos(o.a) / Math.sqrt(1 - Math.pow(o.K * Math.sin(o.a), 2)) * r / o.AK;
    } else { y = r * Math.sin(o.a); d = r * Math.cos(o.a); }
    o.yoke.position.y = y;
    v = Math.round(d * S.w); y = Math.round(y);
    S.set("v", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm/s");
    S.set("y", (y < 0 ? "−" : y > 0 ? "+" : "") + Math.abs(y) + " mm");
  }
});
