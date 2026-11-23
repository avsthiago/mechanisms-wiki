M507.define({
  number: 78,
  title: "Lever with two pawls, second form",
  lede: "A handle on top of a stand rocks up and down. Two hooked arms hang from it and pull on the teeth of a wheel. One pulls when the handle goes down, the other when it comes up, so the wheel keeps turning one way.",
  alt: "A stand shaped like the letter A holds a big wheel with slanted teeth. A short lever rocks on a pin at the top of the stand, with a long handle to the right. Two hooked arms hang from the ends of the lever and catch the teeth, one on the left side of the wheel and one near the top.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Lever and handle", note: "Rocks on a pin at the top of the stand. When the handle goes down, the left end of the lever goes up." },
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with slanted teeth, called a ratchet. Watch the red stripe to see that it only turns one way." },
    { key: "pawl", color: "#D9B13B", name: "Pawls", note: "Two hooked arms, called pawls. Each one pulls a tooth on one stroke and slides back over the teeth on the next. The one pulling turns red." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing of the handle", min: 30, max: 60, step: 5, value: 50, unit: "°",
    presets: [[30, "Small"], [55, "Wide"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Rocking speed", unit: " a min" },
  readouts: [{ id: "lev", label: "Handle" }, { id: "turns", label: "Wheel" }],
  views: { "3d": [-250, 170, 500], front: [20, 30, 720], side: [720, 40, 40] },
  target: [20, 30, 0],
  how: [
    "Push the handle down and the lever tips on its pin. Its left end goes up, and the right end near the pin goes down. Lift the handle and the opposite happens.",
    "Each end of the lever carries a hooked arm, called a pawl. Its hook sits behind a tooth. The left pawl pulls a tooth up the left side when the handle goes down. The top pawl pulls a tooth across the top when the handle comes up. Both pulls turn the wheel the same way. While one pawl pulls, the other slides back over the slanted teeth and clicks into a new gap.",
    "The pawl that is pulling turns red. The left pawl hangs almost straight down, so it pulls further than the top one. Try Small. The top pawl never slides back far enough to catch a tooth, so the wheel waits on the up stroke. Then try Wide and watch both pawls share the work."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows one side of the stand. A second side behind the wheel and a base were added to hold the shaft. The wheel was made wide so the two pawls can sit side by side and pass each other. The shape of the hooks, the number of teeth and all the sizes were made up. In a real machine a light spring would hold each hook against the teeth.",

  K: { R: 87.5, D: 6, N: 40, PY: 107, EX: 38, LEFT: 145, TOP: 114 },

  rim: function (u) { var K = this.K, st = 2 * Math.PI / K.N, f = u / st + 1e-9; f -= Math.floor(f); return K.R - K.D + K.D * f; },
  // nose position: on a circle of radius r round the wheel centre, one pawl length from the eye; take the crossing nearest a
  cross: function (qx, qy, L, r, a) {
    var dd = Math.hypot(qx, qy), b = Math.atan2(qy, qx), g = Math.acos(Math.max(-1, Math.min(1, (r * r + dd * dd - L * L) / (2 * r * dd))));
    function near(x) { return Math.abs(Math.atan2(Math.sin(x - a), Math.cos(x - a))); }
    return near(b + g) < near(b - g) ? b + g : b - g;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, self = this, st = 2 * Math.PI / K.N;
    var o = this.o = { th: 0, psi: 0, W: 0, pawls: [] };
    var mw = c.mat("wheel"), ml = c.mat("lever");

    // wheel: ratchet z -12..12, wide enough for the two pawls side by side; hub r 16 z -14..14; shaft z -16..16 between the two sides of the stand
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(P.ratchet({ teeth: K.N, radius: K.R, depth: K.D, width: 24, material: mw }));
    P.at(P.cylZ(16, 28, mw), 0, 0, 0, o.wheel);                                 // hub z -14..14
    P.at(P.cylZ(6, 32, mw), 0, 0, 0, o.wheel);                                  // shaft z -16..16, ends at the inner faces of the stand
    P.at(P.box(52, 5, 1, c.mat("wheel", "mark")), 44, 0, 13, o.wheel);          // red stripe x 18..70, z 12.5..13.5, lifted off the face (z 12)

    // lever: pivots at (0, PY); bar z 28..34, in front of the stand (z 16..26)
    o.lever = new T.Group(); o.lever.position.set(0, K.PY, 0); scene.add(o.lever);
    P.at(P.box(92, 14, 6, ml), 0, 0, 31, o.lever);                              // bar x -46..46
    P.at(P.cylZ(7, 6, ml), -46, 0, 31, o.lever);                                // rounded ends
    P.at(P.cylZ(7, 6, ml), 46, 0, 31, o.lever);
    P.at(P.box(98, 9, 4, ml), 98, -2, 31, o.lever);                             // handle x 49..147, z 29..33, its end inside the bar's rounded end
    P.at(P.cylZ(6, 3, c.mat("lever", "dark")), 0, 0, 35.5, o.lever);            // pin head z 34..37, on the bar face
    P.at(P.cylZ(4, 2, c.mat("lever", "dark")), -K.EX, 0, 35, o.lever);          // eye pin heads z 34..36
    P.at(P.cylZ(4, 2, c.mat("lever", "dark")), K.EX, 0, 35, o.lever);
    P.at(P.cylZ(4, 2, c.fixed), 0, K.PY, 27, scene);                            // pivot pin z 26..28, front face of the stand to the back of the bar

    // pawls: start with the left hook behind a tooth (handle level)
    var mp = c.mat("pawl");
    [[-1, K.LEFT, 13, .25, 2.1, 6.5], [1, K.TOP, 22, .35, 1, -6.5]].forEach(function (d) {   // side, nose angle, bow, lean and steepness of the claw, z
      var s = { e: d[0], a: d[1] * Math.PI / 180, h: d[2], lean: d[3], steep: d[4], z: d[5] };
      o.pawls.push(s);
    });
    var lp = o.pawls[0], tp = o.pawls[1];
    o.W = o.W0 = lp.a - 10 * st; lp.u = 10 * st;                                 // left nose down at the root, against a tooth face
    tp.u = tp.a - o.W;
    o.pawls.forEach(function (s) {
      var r = self.rim(s.u), qx = s.e * K.EX, qy = K.PY;
      s.L = Math.hypot(r * Math.cos(s.a) - qx, r * Math.sin(s.a) - qy); s.r = r;
      // a yellow and a red copy, shown in turn: swapping materials at run time would undo the engine's one-sided twins (flicker where the claw meets a tooth)
      s.g = new T.Group(); scene.add(s.g);
      var hk = { length: s.L, reach: s.h, thick: 7, width: 10, claw: 4, lean: s.lean * s.h, steep: s.steep, side: -1 };
      s.gy = P.hookPawl(Object.assign({ material: mp }, hk)); s.g.add(s.gy);   // left pawl z 1.9..11.1, top pawl z -11.1..-1.9: side by side on the wheel, so they pass each other
      s.gr = P.hookPawl(Object.assign({ material: c.mat("pawl", "mark") }, hk)); s.gr.visible = false; s.g.add(s.gr);
      s.outline = s.gy.outline;
      var pl = 30 - s.z; P.at(P.cylZ(3, pl, c.mat("lever", "dark")), 0, 0, pl / 2, s.g);   // pin from the middle of the pawl's boss to z 30, inside the bar (z 28..34)
    });

    // stand: two sides shaped like an A, z 16..26 (front) and -26..-16 (back), on a base
    var sh = new T.Shape(), hole = new T.Path();
    function xc(y) { return -59 + 59 * (y + 95) / 202; }                       // centre line of the left leg, foot (-59, -95) to apex (0, 107)
    sh.moveTo(xc(-95) - 10, -95); sh.lineTo(xc(-95) + 10, -95); sh.lineTo(xc(-12) + 10, -12); sh.lineTo(-xc(-12) - 10, -12);
    sh.lineTo(-xc(-95) - 10, -95); sh.lineTo(-xc(-95) + 10, -95); sh.lineTo(-xc(115) + 12, 117); sh.lineTo(xc(115) - 12, 117); sh.closePath();
    hole.moveTo(xc(12) + 10, 12); hole.lineTo(0, 68); hole.lineTo(-xc(12) - 10, 12); hole.closePath(); sh.holes.push(hole);
    var ag = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false });
    var front = new T.Mesh(ag, c.fixed); front.position.z = 16; scene.add(front);   // z 16..26, feet on y -95
    var back = new T.Mesh(ag, c.fixed); back.position.z = -26; scene.add(back);     // z -26..-16
    P.at(P.box(180, 8, 80, c.fixed), 0, -99, 0, scene);                         // base x -90..90, y -103..-95, z -40..40; both sides stand on y -95
  },

  // one step of the motion for a lever angle th; works on o without touching meshes
  phys: function (th) {
    var K = this.K, o = this.o, self = this, st = 2 * Math.PI / K.N, req = o.W, who = null;
    o.th = th;
    function solve(s, W) {
      var r = self.rim(s.u), a = s.a, u = s.u, i;
      for (i = 0; i < 4; i++) { a = self.cross(s.qx, s.qy, s.L, r, a); u = s.u + Math.atan2(Math.sin(a - W - s.u), Math.cos(a - W - s.u)); r = self.rim(u); }
      a = self.cross(s.qx, s.qy, s.L, r, a);
      var u2 = s.u + Math.atan2(Math.sin(a - W - s.u), Math.cos(a - W - s.u));
      if (Math.abs(self.rim(u2) - r) > .5) {                                    // the nose is sliding down a tooth face: put it on the face
        var Fc = Math.floor(Math.max(u, u2) / st + 1e-9) * st, ph = W + Fc, ex = Math.cos(ph), ey = Math.sin(ph), eq = ex * s.qx + ey * s.qy;
        r = eq - Math.sqrt(Math.max(0, eq * eq - s.qx * s.qx - s.qy * s.qy + s.L * s.L));
        r = Math.max(K.R - K.D, Math.min(K.R, r)); a = ph; u2 = Fc;
        return { a: a, u: u2, r: r, face: true };
      }
      return { a: a, u: u2, r: r };
    }
    o.pawls.forEach(function (s) {
      s.qx = s.e * K.EX * Math.cos(th); s.qy = K.PY + s.e * K.EX * Math.sin(th);
      var F = Math.floor(s.u / st + 1e-9) * st, f = solve(s, o.W);
      s.F = F; s.on = false;
      // the hook would pass the tooth face, or climb up it (the claw holds it down): it pulls the wheel instead, at the depth it sits
      if (f.u < F || (f.face && f.r > s.r + 1e-6)) {
        var ae = self.cross(s.qx, s.qy, s.L, s.r, s.a), w = ae - (f.face ? f.u : F);
        w = o.W + Math.atan2(Math.sin(w - o.W), Math.cos(w - o.W));
        if (w < req) { req = w; who = s; }
      }
    });
    o.W = req;                                                                   // the wheel only ever turns one way (W falls)
    o.pawls.forEach(function (s) {
      var f = solve(s, o.W);
      if (f.u < s.F) { f.u = s.F; f.r = s.r; f.a = self.cross(s.qx, s.qy, s.L, f.r, s.a); }
      else if (f.face && f.r > s.r) { f.r = s.r; f.a = self.cross(s.qx, s.qy, s.L, f.r, s.a); }
      s.u = f.u; s.a = f.a; s.r = f.r; s.on = s === who;
    });
  },

  step: function (c, dt, S) {
    var K = this.K, o = this.o, A = S.controls.swing * Math.PI / 360, n = Math.max(1, Math.ceil(dt / .004)), i;
    for (i = 1; i <= n; i++) { o.psi += S.w * dt / n; this.phys(A * Math.sin(o.psi)); }
    o.lever.rotation.z = o.th;
    o.wheel.rotation.z = o.W;
    o.pawls.forEach(function (s) {
      var nr = s.r;
      s.g.position.set(s.qx, s.qy, s.z);
      s.g.rotation.z = Math.atan2(nr * Math.sin(s.a) - s.qy, nr * Math.cos(s.a) - s.qx);
      s.gr.visible = s.on; s.gy.visible = !s.on;
    }, this);
    var deg = Math.round(o.th * 180 / Math.PI);
    S.set("lev", (deg > 0 ? "+" : deg < 0 ? "−" : "") + Math.abs(deg) + "°");
    S.set("turns", ((o.W0 - o.W) / (2 * Math.PI)).toFixed(2) + " turns");
  }
});
