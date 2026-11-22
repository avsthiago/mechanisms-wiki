M507.define({
  number: 77,
  title: "Lever with two pawls",
  lede: "A lever rocks back and forth beside a wheel with a ring of pins. Two rods hang from the lever and push the pins round. One pushes on each swing, so the wheel keeps turning the same way nearly all the time.",
  alt: "A wheel with four spokes and a ring of short pins near its rim. To its right stands an upright lever that turns on a pin near its middle. Two rods run from the lever to the wheel, one from above the pin and one from below it, and each ends in a hooked tip among the pins.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Lever", note: "Rocks to and fro on a pin. One rod is joined above the pin and one below it, so their ends move opposite ways." },
    { key: "wheel", color: "#C8873A", name: "Wheel with pins", note: "Turns on its own shaft. A ring of short pins stands out from its face. Watch the red spoke to see that it only ever goes one way." },
    { key: "pawl", color: "#D9B13B", name: "Pawls", note: "Two rods with a hooked tip, called pawls. Each tip pushes a pin on one swing and slides back over the pins on the next. The one pushing turns red." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing of the lever", min: 10, max: 60, step: 5, value: 40, unit: "°",
    presets: [[15, "Tiny"], [40, "Medium"], [60, "Wide"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Rocking speed", unit: " a min" },
  readouts: [{ id: "lev", label: "Lever" }, { id: "turns", label: "Wheel" }],
  views: { "3d": [330, 150, 560], front: [-10, 0, 640], side: [640, 30, 60] },
  target: [-10, 0, 0],
  how: [
    "The lever rocks to and fro on its pin. The upper rod is joined above the pin and the lower rod below it. So when one rod moves left, the other moves right.",
    "Each rod ends in a hooked tip that rests between the pins. A light spring holds it down. When a rod moves left, the flat front of its tip pushes a pin and turns the wheel. When it moves right, the sloped back of its tip rides up over the pins behind it and drops into the next gap. While one rod slides back, the other pushes. So the wheel turns on both swings, with only a short pause each time the lever changes direction.",
    "The rod that is pushing turns red. Try Tiny. The tips no longer slide back past a pin, so the wheel hardly moves. Then try Wide and watch it run almost without stopping."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show how the rods catch the wheel. Here the circles in his drawing are short pins, and each rod ends in a hooked tip that drops between them. The raised ring the tips rest on, the springs, the plate and base, the number of pins and all the sizes were made up.",

  // WX wheel centre x; N pins at radius RH, radius RP; tips rest on a ring of radius RF; FX, FY the lever's pin
  K: { WX: -70, N: 24, RH: 87, RP: 4, RF: 82, FX: 95, FY: 54, HN: 7, ZR: 5 },

  // the outline of a pawl's tip in its own frame: x along the rod from the eye, y towards the wheel (flat front, sloped back)
  nose: function (L) { var K = this.K; return [[L - 20, -2.3], [L - 6, -2.3], [L, K.HN], [L - 20, 2.3]]; },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, self = this, st = 2 * Math.PI / K.N, i;
    var o = this.o = { th: 0, psi: 0, W: 0, pawls: [] };
    var mw = c.mat("wheel"), ml = c.mat("lever");

    // wheel: rim r 73..97, z -6..0; raised ring r 74..82, z -0.5..9 (the tips rest on its edge); pins r 4 at r 87, z -1..9.5
    o.wheel = new T.Group(); o.wheel.position.set(K.WX, 0, 0); scene.add(o.wheel);
    function ring(r0, r1, z0, z1) {
      var sh = new T.Shape(); sh.absarc(0, 0, r1, 0, 2 * Math.PI, false);
      var h = new T.Path(); h.absarc(0, 0, r0, 0, 2 * Math.PI, true); sh.holes.push(h);
      var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 48 }); g.translate(0, 0, z0);
      o.wheel.add(new T.Mesh(g, mw));
    }
    ring(73, 97, -6, 0);
    ring(74, K.RF, -.5, 9);                                                     // inner face r 74, clear of the rim's r 73
    var mpin = c.mat("wheel", "dark");
    for (i = 0; i < K.N; i++) P.at(P.cylZ(K.RP, 10.5, mpin), K.RH * Math.cos(i * st), K.RH * Math.sin(i * st), 4.25, o.wheel);   // pins z -1..9.5, set into the rim
    o.spokes = new T.Group(); o.wheel.add(o.spokes);                            // turned at the end so the spokes start upright
    P.at(P.box(150, 12, 4, mw), 0, 0, -3, o.spokes);                             // spokes x -75..75, z -5..-1, ends inside the rim
    P.at(P.box(12, 150, 4, mw), 0, 0, -3, o.spokes);
    P.at(P.cylZ(17, 16, mw), 0, 0, 0, o.spokes);                                // hub z -8..8
    P.at(P.cylZ(10, 4, mw), 0, 0, 10, o.spokes);                                // collar z 8..12, on the hub face
    P.at(P.box(50, 5, 1, c.mat("wheel", "mark")), 45, 0, 0, o.spokes);           // red stripe on a spoke, x 20..70, z -0.5..0.5, lifted off the spoke face (z -1)
    P.at(P.cylZ(6, 22, c.fixed), K.WX, 0, -19, scene);                          // shaft z -30..-8, plate face to the back of the hub

    // lever: pivots at (FX, FY); bar z 8..16, in front of the rods (z 3..7)
    o.lever = new T.Group(); o.lever.position.set(K.FX, K.FY, 0); scene.add(o.lever);
    P.at(P.box(14, 198, 8, ml), 0, -55, 12, o.lever);                           // bar, local y -154..44
    P.at(P.cylZ(7, 8, ml), 0, 44, 12, o.lever);                                 // rounded top
    P.at(P.cylZ(5, 3, c.mat("lever", "dark")), 0, 0, 17.5, o.lever);            // pin head z 16..19, on the bar face
    P.at(P.cylZ(6, 38, c.fixed), K.FX, K.FY, -11, scene);                       // pin z -30..8, plate face to the back of the bar

    // pawls: an eye on a pin behind the lever, a rod, and a hooked tip; a yellow and a red copy, shown in turn
    var mp = c.mat("pawl"), mk = c.mat("pawl", "mark");
    [[31, 56], [-36, 27]].forEach(function (d) {
      var a0 = d[1] * Math.PI / 180, ex = K.FX, ey = K.FY + d[0], tx = K.WX + K.RF * Math.cos(a0), ty = K.RF * Math.sin(a0);
      var s = { d: d[0], L: Math.hypot(tx - ex, ty - ey), g: Math.atan2(ty - ey, tx - ex) };
      // which way of turning the rod is "towards the wheel": y of the tip's frame points there
      var nx = -Math.sin(s.g), ny = Math.cos(s.g);
      s.sy = ((K.WX - tx) * nx + (0 - ty) * ny) > 0 ? 1 : -1;
      s.grp = new T.Group(); scene.add(s.grp);
      s.cp = [mp, mk].map(function (m) {
        var g = new T.Group(); s.grp.add(g);
        P.at(P.cylZ(4.5, 4, m), 0, 0, K.ZR, g);                                 // eye z 3..7
        P.at(P.cylX(2, s.L - 13, m), (s.L - 13) / 2, 0, K.ZR, g);               // rod x 0..L-13, ends inside the tip
        var sh = new T.Shape();
        self.nose(s.L).forEach(function (p, j) { if (j) sh.lineTo(p[0], s.sy * p[1]); else sh.moveTo(p[0], s.sy * p[1]); });
        var ng = new T.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: false }); ng.translate(0, 0, K.ZR - 2.5);   // tip z 2.5..7.5
        g.add(new T.Mesh(ng, m));
        return g;
      });
      s.cp[1].visible = false;
      P.at(P.cylZ(2, 7, c.mat("lever", "dark")), 0, s.d, 8.5, o.lever);         // pin z 5..12, from the middle of the eye into the bar (z 8..16)
      P.at(P.cylZ(3, 2, c.mat("lever", "dark")), 0, s.d, 17, o.lever);           // its head z 16..18, on the bar face
      o.pawls.push(s);
    });

    // supports
    P.at(P.box(310, 224, 10, c.fixed), -30, 0, -35, scene);                     // plate x -185..125, y -112..112, z -40..-30; shaft and pin end at z -30
    P.at(P.box(350, 12, 100, c.fixed), -30, -118, -30, scene);                  // base x -205..145, y -124..-112, z -80..20; plate stands on y -112

    // let the tips settle among the pins, run two strokes, and start from there
    o.pawls.forEach(function (s) { s.g -= s.sy * .3; s.g = self.settle(s, 0, o.W); });
    for (i = 0; i < 400; i++) { o.psi += 2 * Math.PI / 200; this.phys(20 * Math.PI / 180 * Math.sin(o.psi)); }
    o.psi = 0; this.phys(0); o.W0 = o.W;
    o.spokes.rotation.z = -o.W0;
  },

  // how far the tip and rod of pawl s cut into the pins or the raised ring, for rod angle g and wheel angle W (<= 0 when clear)
  pen: function (s, th, g, W) {
    var K = this.K, st = 2 * Math.PI / K.N, ex = K.FX - s.d * Math.sin(th), ey = K.FY + s.d * Math.cos(th);
    var cx = Math.cos(g), cy = Math.sin(g), nx = -cy * s.sy, ny = cx * s.sy;
    var pts = this.nose(s.L).map(function (p) { return [ex + p[0] * cx + p[1] * nx, ey + p[0] * cy + p[1] * ny]; });
    var rodB = [ex + (s.L - 20) * cx, ey + (s.L - 20) * cy];
    function dseg(px, py, a, b) {
      var vx = b[0] - a[0], vy = b[1] - a[1], t = ((px - a[0]) * vx + (py - a[1]) * vy) / (vx * vx + vy * vy);
      t = Math.max(0, Math.min(1, t)); return Math.hypot(px - a[0] - t * vx, py - a[1] - t * vy);
    }
    function worst(px, py, r) {                                                 // r minus the gap from the point to the tip and rod
      var m = Infinity, j;
      for (j = 0; j < pts.length; j++) m = Math.min(m, dseg(px, py, pts[j], pts[(j + 1) % pts.length]));
      return Math.max(r - m, r + 2 - dseg(px, py, [ex, ey], rodB));
    }
    var p = worst(K.WX, 0, K.RF), k;
    for (k = 0; k < K.N; k++) {
      var a = W + k * st, px = K.WX + K.RH * Math.cos(a), py = K.RH * Math.sin(a);
      if (Math.hypot(px - pts[2][0], py - pts[2][1]) < 60) p = Math.max(p, worst(px, py, K.RP));
    }
    return p;
  },

  // the rod's angle once its spring has pressed the tip down onto the wheel; null when it cannot lift clear (its front is against a pin)
  settle: function (s, th, W) {
    var self = this, g0 = s.g, DG = .002, i, a, b, g;
    function bis(clear, hit) { for (var j = 0; j < 24; j++) { var m = (clear + hit) / 2; if (self.pen(s, th, m, W) > 0) hit = m; else clear = m; } return clear; }
    var p0 = this.pen(s, th, g0, W);
    if (p0 > 0) {                                                               // cut in: lift the tip (turn the rod away from the wheel)
      var last = p0;
      for (i = 1; i <= 40; i++) {
        g = g0 - s.sy * i * DG; var p = this.pen(s, th, g, W);
        if (p <= 0) return bis(g, g + s.sy * DG);
        if (i === 1 && p >= last) return null;                                 // lifting only digs the front in deeper
        last = p;
      }
      return null;
    }
    for (i = 1; i <= 300; i++) {                                                // clear: the spring turns it towards the wheel until it touches
      g = g0 + s.sy * i * DG;
      if (this.pen(s, th, g, W) > 0) return bis(g - s.sy * DG, g);
    }
    return g;
  },

  // one step of the motion for a lever angle th; works on o without touching meshes
  phys: function (th) {
    var self = this, o = this.o, st = 2 * Math.PI / this.K.N, W = o.W, who = null, it;
    o.th = th;
    for (it = 0; it < 3; it++) {
      var again = false;
      o.pawls.forEach(function (s) {
        if (self.settle(s, th, W) !== null) return;
        var lo = W, hi = W + st / 2, j;                                          // it pushes: turn the wheel (only forward) just far enough to let it through
        if (self.settle(s, th, hi) === null) hi = W + st;
        for (j = 0; j < 24; j++) { var m = (lo + hi) / 2; if (self.settle(s, th, m) === null) lo = m; else hi = m; }
        W = hi; who = s; again = true;
      });
      if (!again) break;
    }
    o.W = W;
    o.pawls.forEach(function (s) { var g = self.settle(s, th, W); if (g !== null) s.g = g; s.on = s === who; });
  },

  step: function (c, dt, S) {
    var K = this.K, o = this.o, A = S.controls.swing * Math.PI / 360, n = Math.max(1, Math.ceil(dt / .004)), i;
    for (i = 1; i <= n; i++) { o.psi += S.w * dt / n; this.phys(A * Math.sin(o.psi)); }
    o.lever.rotation.z = o.th;
    o.wheel.rotation.z = o.W;
    o.pawls.forEach(function (s) {
      s.grp.position.set(K.FX - s.d * Math.sin(o.th), K.FY + s.d * Math.cos(o.th), 0);
      s.grp.rotation.z = s.g;
      s.cp[0].visible = !s.on; s.cp[1].visible = s.on;
    });
    var deg = Math.round(o.th * 180 / Math.PI);
    S.set("lev", (deg > 0 ? "+" : deg < 0 ? "−" : "") + Math.abs(deg) + "°");
    S.set("turns", ((o.W - o.W0) / (2 * Math.PI)).toFixed(2) + " turns");
  }
});
