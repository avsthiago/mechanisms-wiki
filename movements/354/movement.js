M507.define({
  number: 354,
  title: "Cross-head with a shaped groove",
  lede: "A crank turns a peg round in a circle. The peg runs in a looped groove cut in a cross-head, and the cross-head carries a rod up and down. The groove is shaped so the rod moves at one steady speed, instead of slowing down near each end.",
  alt: "A round crank disc in front of a cross-head shaped like a bow tie. A looped groove in the cross-head crosses itself in the middle, and a red peg on the back of the disc runs in it. An upright rod fixed to the cross-head slides through a guide above and below.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Crank disc", note: "A disc fixed on a shaft. The peg is fixed near its edge, on the back. The disc is drawn see-through so you can watch the peg." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The red pin that runs in the groove. Watch it go round the loop and cross over in the middle." },
    { key: "yoke", color: "#C8873A", name: "Cross-head", note: "A plate with a groove in its front face. The groove is one endless loop that crosses itself in the middle, like a figure eight." },
    { key: "rod", color: "#D9B13B", name: "Rod", note: "Fixed to the cross-head, above and below. It slides through two fixed guides, so it only moves straight up and down." }
  ],
  controls: [{ id: "g", label: "Cross-head", value: "shaped", options: [["shaped", "Shaped groove"], ["plain", "Straight slot"]] }],
  readouts: [{ id: "v", label: "Rod speed" }, { id: "y", label: "Rod height" }],
  views: { "3d": [243, 128, 521], front: [0, 10, 400], side: [620, 10, 0] },
  target: [0, -5, 0],
  how: [
    "The shaft turns, and the red peg goes round in a circle. The peg runs in a groove in the cross-head. The groove is a loop that bulges up on one side and down on the other, and crosses itself in the middle.",
    "With a straight slot, the rod copies the peg's height. The peg climbs fast when it is level with the shaft, but hardly climbs at the top and bottom. So the rod speeds up and slows down. The shaped groove pushes the rod a little ahead or holds it back at each point. That makes the rod climb by the same amount for every bit the crank turns. It only stops for an instant to turn back.",
    "Watch the rod speed. Try the shaped groove, then the straight slot, and compare how the speed changes."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not give the shape of the groove, so it was worked out here: the loop is the path the peg takes when the rod moves at a steady speed. The guides, the plate behind them, the front bearing, the base and all the sizes were made up. The crank disc is drawn see-through so the peg can be seen. The straight slot was added for comparison.",

  // Rod height as a fraction of the crank radius for crank angle a: a zigzag, rising at a steady rate from -1 to 1
  // while the peg goes from bottom to top, and falling at the same rate on the way back.
  _tri: function (a) {
    a = Math.atan2(Math.sin(a), Math.cos(a));
    return Math.abs(a) <= Math.PI / 2 ? 2 * a / Math.PI : (a > 0 ? 1 : -1) * (2 - 2 * Math.abs(a) / Math.PI);
  },
  // Centre line of the groove in the cross-head's own frame: where the peg is, less how far the cross-head has moved.
  _curve: function (R, n) {
    var pts = [], i, a;
    for (i = 0; i < n; i++) { a = -Math.PI + 2 * Math.PI * i / n; pts.push([R * Math.cos(a), R * Math.sin(a) - R * this._tri(a)]); }
    return pts;
  },
  _dist: function (pts, closed, x, y) {
    var best = 1e9, n = pts.length, i;
    for (i = 0; i < (closed ? n : n - 1); i++) {
      var p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], L = dx * dx + dy * dy;
      var t = L ? Math.max(0, Math.min(1, ((x - p[0]) * dx + (y - p[1]) * dy) / L)) : 0;
      var ex = p[0] + t * dx - x, ey = p[1] + t * dy - y, d = ex * ex + ey * ey;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  },
  // Outer edge of the set of points within d of the centre line, found along rays from the origin (from outside in).
  _outer: function (pts, closed, d, n, tmax) {
    var out = [], i, self = this;
    for (i = 0; i < n; i++) {
      var f = 2 * Math.PI * i / n, cx = Math.cos(f), cy = Math.sin(f), t = tmax;
      while (t > 0 && self._dist(pts, closed, t * cx, t * cy) >= d) t -= .5;
      var lo = t, hi = t + .5;
      for (var k = 0; k < 20; k++) { var m = (lo + hi) / 2; if (self._dist(pts, closed, m * cx, m * cy) < d) lo = m; else hi = m; }
      out.push([lo * cx, lo * cy]);
    }
    return out;
  },
  // Island left inside one loop of the groove, found along rays from a point inside it (from inside out).
  _island: function (pts, d, ox, oy, n) {
    var out = [], i, self = this;
    for (i = 0; i < n; i++) {
      var f = 2 * Math.PI * i / n, cx = Math.cos(f), cy = Math.sin(f), t = 0;
      while (self._dist(pts, true, ox + t * cx, oy + t * cy) >= d) t += .5;
      var lo = Math.max(0, t - .5), hi = t;
      for (var k = 0; k < 20; k++) { var m = (lo + hi) / 2; if (self._dist(pts, true, ox + m * cx, oy + m * cy) >= d) lo = m; else hi = m; }
      out.push([ox + lo * cx, oy + lo * cy]);
    }
    return out;
  },
  // Outlines for both cross-heads. R crank radius, h half the groove width, rim wall outside the groove.
  _shapes: function (R, h, rim) {
    var loop = this._curve(R, 480), slot = [[-R, 0], [R, 0]];
    return {
      shaped: { line: loop, outline: this._outer(loop, true, h + rim, 240, R + h + rim + 6), groove: this._outer(loop, true, h, 240, R + h + 6),
        islands: [this._island(loop, h, R / 2, 0, 120), this._island(loop, h, -R / 2, 0, 120)] },
      plain: { line: slot, outline: this._outer(slot, false, h + rim, 960, R + h + rim + 6), groove: this._outer(slot, false, h, 960, R + h + 6), islands: [] }
    };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, self = this;
    var R = 70, h = 5, rim = 7, L = 180;
    var o = this.o = { R: R, a: 1.35, yokes: {} };
    var sh = this._shapes(R, h, rim);
    // crank: disc z 2..12, hub z 12..18, shaft z 12..44 (ends at the bearing's front face; bearing z 30..44)
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(82, 10, c.mat("disc")), 0, 0, 7, o.rot);                                  // disc z 2..12
    P.at(P.cylZ(12, 6, c.mat("disc")), 0, 0, 15, o.rot);                                  // hub z 12..18
    P.at(P.cylZ(6, 32, c.mat("disc")), 0, 0, 28, o.rot);                                  // shaft z 12..44
    P.at(P.box(R - 14, 6, .8, c.mat("disc", "dark")), 12 + (R - 14) / 2, 0, 12.6, o.rot);  // stripe on the front face, z 12.2..13, x 12..68
    P.at(P.cylZ(4.5, 8, c.mat("pin", "mark")), R, 0, -2, o.rot);                         // peg z -6..2, into the groove (floor at z -8)
    // cross-heads: back plate z -14..-8, walls z -8..0 (groove open towards the disc), rods z -12..-2
    ["shaped", "plain"].forEach(function (k) {
      var s = sh[k], g = new T.Group(), m = c.mat("yoke");
      g.add(P.outlinePlate({ points: s.outline, depth: 6, z0: -14, material: m }));                            // floor z -14..-8
      g.add(P.outlinePlate({ points: s.outline, holes: [s.groove], depth: 8, z0: -8, material: m }));          // outer wall z -8..0
      s.islands.forEach(function (isl) { g.add(P.outlinePlate({ points: isl, depth: 8, z0: -8, material: m })); });   // walls inside each loop
      var top = s.outline[s.outline.length / 4][1];                                      // outline height straight above the middle (a quarter of the rays round points up)
      P.at(P.cylY(5, L, c.mat("rod")), 0, top - 1 + L / 2, -7, g);                        // upper rod y top-1 .. top-1+L
      P.at(P.cylY(5, L, c.mat("rod")), 0, -(top - 1 + L / 2), -7, g);                     // lower rod
      scene.add(g); o.yokes[k] = g;
    });
    // supports. guides: x -11..11, y 101..117 and -117..-101, z -18..4; arms z -20..-18; plate z -30..-20
    [1, -1].forEach(function (s) {
      P.at(P.guideBlock({ w: 22, h: 16, d: 22, hole: 5.6, material: c.fixed }), 0, s * 109, -7, scene);
      P.at(P.box(22, 16, 2, c.fixed), 0, s * 109, -19, scene);                           // arm z -20..-18
    });
    P.at(P.box(60, 267, 10, c.fixed), 0, -16.5, -25, scene);                             // plate x -30..30, y -150..117, z -30..-20
    [1, -1].forEach(function (s) { P.at(P.box(60, 12, 90, c.fixed), s * 50, -156, 5, scene); });   // bars x 20..80, y -162..-150, z -40..50; the rod (x -5..5) hangs clear between them
    P.at(P.box(40, 12, 14, c.fixed), 0, -156, 37, scene);                                // cross bar x -20..20, z 30..44 (rod is at z -12..-2)
    P.at(P.bearingBlock({ bore: 6.6, outer: 13, width: 14, drop: 150, material: c.fixed }), 0, 0, 37, scene);   // bearing z 30..44, foot at y -150
  },

  opacity: function (key) { return key === "disc" ? .3 : 1; },

  step: function (c, dt, S) {
    var o = this.o, k = S.controls.g || "shaped", R = o.R, kk;
    for (kk in o.yokes) o.yokes[kk].visible = kk === k;
    o.a += S.w * dt;
    o.rot.rotation.z = o.a;
    var y, dy;
    if (k === "plain") { y = R * Math.sin(o.a); dy = R * Math.cos(o.a); }
    else { y = R * this._tri(o.a); dy = (Math.cos(o.a) >= 0 ? 1 : -1) * 2 * R / Math.PI; }
    o.yokes[k].position.y = y;
    function sg(v) { v = Math.round(v); return (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v); }
    S.set("v", sg(dy * S.w) + " mm/s");
    S.set("y", sg(y) + " mm");
  }
});
