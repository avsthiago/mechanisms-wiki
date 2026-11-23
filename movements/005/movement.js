M507.define({
  number: 5,
  title: "Belt with a tightening pulley",
  lede: "Two pulleys are joined by a belt that is a little too loose. A small pulley on a lever can be pressed against it. Pressed in, it pulls the belt tight and the upper pulley turns. Let go, the belt hangs loose and the upper pulley stops.",
  alt: "Two spoked pulleys, one above the other, joined by an open flat belt. On the left a small pulley on a lever with a handle presses the belt inwards.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving pulley", note: "The lower pulley. An engine keeps it turning all the time." },
    { key: "driven", color: "#C8873A", name: "Driven pulley", note: "The upper pulley. It only turns when the belt is tight. Watch its dark spoke." },
    { key: "jockey", color: "#4FA58A", name: "Tightening pulley", note: "A small pulley on a lever. Push the handle and it presses the belt in. Watch it take up the loose belt." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "A flat loop of leather. It is a little too long to be tight on its own. Watch the red mark go round." }
  ],
  controls: [{ type: "range", id: "press", label: "Push on the handle", min: 0, max: 1, step: 0.01, value: 1, unit: "",
    presets: [[0, "Let go"], [0.5, "Half way"], [1, "Pressed in"]] }],
  readouts: [{ id: "in", label: "Lower pulley" }, { id: "out", label: "Upper pulley" }, { id: "belt", label: "Belt" }],
  views: { "3d": [440, 170, 760], front: [0, 0, 760], side: [760, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The lower pulley pulls the belt round, and the belt pulls the upper pulley. That only works if the belt grips both pulleys. A loose belt slides over them.",
    "The belt is made a little too long. When the small pulley is pressed in, it bends the belt inwards and takes up the extra length. Now the belt is tight and grips. When it is let go, the extra length hangs loose on the other side.",
    "Try let go, then half way, then pressed in. Half way, the belt is still a bit loose and slips, so the upper pulley turns slowly. Watch the bulge on the right side shrink as the speed goes up."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the frame and the lever that holds the small pulley are made up. Brown does not show where the lever is pivoted. A real loose belt sags on both sides; here all the slack is shown on the right side.",

  build: function (c) {
    var P = c.P, scene = c.scene, T = 4, o = this.o = { a1: 0, a2: 0, aj: 0, s: 0, T: T,
      L: [0, -130], rL: 40, U: [0, 130], rU: 60, rJ: 22, pv: [-75, -100], arm: 80, fOff: 0.01, fOn: -0.38, Rb: 300 };
    o.p1 = P.at(P.pulley({ radius: o.rL - T / 2 - 2, width: 24, material: c.mat("drive") }), o.L[0], o.L[1], 0, scene);
    o.p2 = P.at(P.pulley({ radius: o.rU - T / 2 - 2, width: 24, material: c.mat("driven") }), o.U[0], o.U[1], 0, scene);
    o.p1.spokes[0].material = c.mat("drive", "dark"); o.p2.spokes[0].material = c.mat("driven", "dark");
    [[o.L, "drive"], [o.U, "driven"]].forEach(function (q) {
      P.at(P.cylZ(7, 86, c.mat(q[1])), q[0][0], q[0][1], -20, scene);        // shaft z -63..23, from the bearing face to past the pulley
      P.at(P.cylZ(16, 14, c.fixed), q[0][0], q[0][1], -70, scene);           // bearing z -77..-63
    });
    // lever: arm from the pivot up to pulley B, handle out to the left; it lies at z -19..-11, behind the belt
    o.lever = new c.THREE.Group(); P.at(o.lever, o.pv[0], o.pv[1], -15, scene);
    var lm = c.mat("jockey");
    P.at(P.cylZ(7, 8, lm), 0, 0, 0, o.lever);                                  // boss at the pivot
    P.at(P.box(8, o.arm, 8, lm), 0, o.arm / 2, 0, o.lever);                    // arm, local y 0..80
    var hd = P.at(new c.THREE.Group(), 0, o.arm, 0, o.lever); hd.rotation.z = 2 * Math.PI / 3;
    P.at(P.box(6, 70, 6, lm), 0, 35, 0, hd);                                   // handle, 70 long from the pin, pointing down-left
    P.at(P.cylZ(5, 8, c.mat("jockey", "dark")), 0, 70, 0, hd);                 // grip at the end
    o.jockey = P.at(P.pulley({ radius: o.rJ - T / 2 - 2, width: 18, spokes: 3, material: lm }), 0, o.arm, 15, o.lever);   // rim z -9..9
    o.jockey.spokes[0].material = c.mat("jockey", "dark");
    P.at(P.cylZ(4, 23, c.mat("jockey", "dark")), 0, o.arm, 15.5, o.lever);    // pin z -11..12, from the arm face to past B
    P.at(P.cylZ(5, 58, c.fixed), o.pv[0], o.pv[1], -48, scene);              // pivot pin z -77..-19, upright face to lever back
    // frame
    P.at(P.box(150, 419, 12, c.fixed), -35, -9.5, -83, scene);               // upright x -110..40, y -219..200, z -89..-77
    P.at(P.box(190, 12, 80, c.fixed), -35, -225, -50, scene);                // base x -130..60, y -231..-219, z -90..-10

    o.belt = P.at(P.beltPath({ width: 14, thick: T, material: c.mat("belt") }), 0, 0, 0, scene);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(12, T + 2, 15, c.mat("belt", "mark")), 0, 0, 0, o.belt);
    o.Lfull = this.loop(1, 0).len;              // the belt is exactly long enough to be tight with B pressed fully in
    o.Eoff = o.Lfull - this.loop(0, 0).len;     // spare length with B let go
  },

  // Centre of pulley B for a push t (0..1).
  jockeyAt: function (t) {
    var o = this.o, f = o.fOff + (o.fOn - o.fOff) * t;
    return { f: f, x: o.pv[0] - o.arm * Math.sin(f), y: o.pv[1] + o.arm * Math.cos(f) };
  },

  // The belt loop for push t, with the right side bowed out by h. Circles in travel order, all in the XY plane.
  loop: function (t, h) {
    var o = this.o, TAU = 2 * Math.PI, J = this.jockeyAt(t);
    function tan(a, ra, sa, b, rb, sb) {
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy), mu = Math.atan2(dy, dx) - Math.acos((ra * sa - rb * sb) / d);
      return [sa > 0 ? mu : mu + Math.PI, sb > 0 ? mu : mu + Math.PI];
    }
    function pt(q, ang) { return [q.c[0] + q.r * Math.cos(ang), q.c[1] + q.r * Math.sin(ang)]; }
    var low = { c: o.L, r: o.rL, s: 1 }, up = { c: o.U, r: o.rU, s: 1 }, C = [low];
    if (h > 0) {                                  // a big circle of radius Rb, set so it stands h out from the straight right side
      var g = tan(o.L, o.rL, 1, o.U, o.rU, 1), A = pt(low, g[0]), B = pt(up, g[1]), n = [Math.cos(g[0]), Math.sin(g[0])];
      C.push({ c: [(A[0] + B[0]) / 2 + n[0] * (h - o.Rb), (A[1] + B[1]) / 2 + n[1] * (h - o.Rb)], r: o.Rb, s: 1 });
    }
    C.push(up);
    var l = tan(o.U, o.rU, 1, o.L, o.rL, 1), P1 = pt(up, l[0]), P2 = pt(low, l[1]);
    var dx = P2[0] - P1[0], dy = P2[1] - P1[1], side = ((J.x - P1[0]) * dy - (J.y - P1[1]) * dx) / Math.sqrt(dx * dx + dy * dy);
    if (side < o.rJ) C.push({ c: [J.x, J.y], r: o.rJ, s: -1 });          // B reaches the belt and bends it in
    var len = 0, wraps = [], i;
    var tg = C.map(function (q, k) { var q2 = C[(k + 1) % C.length]; return tan(q.c, q.r, q.s, q2.c, q2.r, q2.s); });
    for (i = 0; i < C.length; i++) {
      var q = C[i], arr = tg[(i + C.length - 1) % C.length][1], dep = tg[i][0];
      var sw = q.s * (((q.s * (dep - arr)) % TAU + TAU) % TAU), e = pt(q, dep), nx = C[(i + 1) % C.length], st = pt(nx, tg[i][1]);
      len += Math.abs(sw) * q.r + Math.sqrt((st[0] - e[0]) * (st[0] - e[0]) + (st[1] - e[1]) * (st[1] - e[1]));
      wraps.push({ c: [q.c[0], q.c[1], 0], axis: [0, 0, 1], u: [1, 0, 0], r: q.r, a0: arr, sweep: sw });
    }
    return { wraps: wraps, len: len, J: J };
  },

  lay: function (t) {
    var o = this.o, cfg = this.loop(t, 0), e = o.Lfull - cfg.len;
    if (e > 0.01) {                               // spare length: find the bow that uses it up
      var lo = 0, hi = 150;
      for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (this.loop(t, m).len < o.Lfull) lo = m; else hi = m; }
      cfg = this.loop(t, lo);
    }
    o.belt.set(cfg.wraps);
    o.lever.rotation.z = cfg.J.f;
    o.grip = Math.max(0, Math.min(1, Math.sqrt(Math.max(0, 1 - e / o.Eoff))));  // grows with how far B bends the belt: none let go, full when tight
  },

  step: function (c, dt, S) {
    var o = this, q = this.o, t = +S.controls.press;
    if (q.t !== t) { q.t = t; o.lay(t); }
    var v = S.w * q.rL * q.grip;                   // the belt only moves as fast as its grip lets it
    q.a1 += S.w * dt; q.s += v * dt; q.a2 += v / q.rU * dt; q.aj -= v / q.rJ * dt;
    q.p1.rotation.z = q.a1; q.p2.rotation.z = q.a2; q.jockey.rotation.z = q.aj;
    q.belt.place(q.mark, q.s);
    var r1 = S.playing ? S.rpm : 0, r2 = r1 * q.rL / q.rU * q.grip;
    S.set("in", r1 + " rpm");
    S.set("out", (r2 % 1 ? r2.toFixed(1) : r2) + " rpm");
    S.set("belt", q.grip > .99 ? "Tight" : q.grip > 0 ? "Slipping" : "Slack");
  }
});
