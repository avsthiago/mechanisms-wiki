M507.define({
  number: 46,
  title: "Fusee and spring box",
  lede: "A coiled spring drives this watch. A spring pulls hard when it is wound tight and weakly when it is nearly run down. The cone, called a fusee, evens this out, so the watch gets the same turning force from start to finish.",
  alt: "A round box with a coiled spring inside stands on the left. A chain is wound round it and runs across to a stepped cone on the right, thin end up. Two bars on the base show the spring's pull and the turning force on the cone.",
  parts: [
    { key: "barrel", color: "#5E7387", name: "Spring box", note: "A round box with the spring inside. The spring turns the box, and the box pulls on the chain." },
    { key: "fusee", color: "#C8873A", name: "Fusee", note: "A cone with one spiral step cut round it for the chain to lie on. Its shaft turns the wheels of the watch." },
    { key: "spring", color: "#8E7AA8", name: "Spring", note: "A long steel strip coiled inside the box. Its inner end is hooked to the dark post, which stands still. Watch the coils pack tight when it is wound and open out as it runs down." },
    { key: "bars", color: "#4FA58A", name: "Force bars", note: "Two bars that grow and shrink with force. The left bar is how hard the spring pulls the chain. The right bar is the turning force on the fusee's shaft." },
    { key: "chain", color: "#D9B13B", name: "Chain", note: "Joins the box to the fusee. As the watch runs it comes off the fusee and winds onto the box. Watch the red link." }
  ],
  controls: [{ id: "body", label: "Chain winds on", value: "fusee", options: [["fusee", "Fusee"], ["drum", "Plain drum"]] }],
  readouts: [{ id: "pull", label: "Spring pull" }, { id: "lever", label: "Lever" }],
  closed: { label: "Spring box" },
  views: { "3d": [0, 280, 530], front: [0, 0, 620], top: [0, 620, 1] },
  target: [0, -8, 0],
  how: [
    "First the watch is wound up. The fusee is turned quickly, and it pulls the chain off the spring box and up its spiral step. That turns the box and coils the spring tight. Then the spring pulls the chain back, and the fusee turns slowly the other way. This is the watch running.",
    "A tight spring pulls hard, so the left bar is long. But the chain then leaves from the thin top of the fusee, close to the shaft. That is a short lever, so the hard pull turns the shaft only gently. As the spring runs down its pull fades, and the chain moves down to the wide part, which is a longer lever. Pull times lever stays the same, so the right bar does not move.",
    "Try Plain drum. Now the lever never changes, so the turning force fades with the spring and the right bar shrinks. A watch built like that would not keep even time. Choose Closed to put the lid on the spring box, as in a real watch."
  ],
  note: "This model is rebuilt from Brown's drawing. The spring seen through the open top of the box, the base, the two force bars and the quick winding back up were added. The sizes and the force numbers are made up. Brown draws the fusee with even steps. Here its curve was worked out so the force stays even, so the steps get narrower towards the top. The wheels of the watch that the fusee drives are left out.",

  /* All the geometry of the chain, with no drawing, so it can be checked on its own.
     Angles are measured anticlockwise seen from above: a point at angle t on radius r round an upright axis at x0 is (x0 + r cos t, y, -r sin t). */
  makeKin: function () {
    var TAU = 2 * Math.PI, K = { XB: -100, XF: 86, RB: 68, TC: 1.8, YB: -40, H: 16, N: 5, RD: 56, PB: 18, YEND: 34, PITCH: 10 };
    var D = K.XF - K.XB, RC0 = 80 + K.TC, RC1 = 40 + K.TC, W = 7.75 * Math.PI, W0 = Math.PI;
    var A = (Math.pow(RC0 / RC1, 2) - 1) / W;                    // radius of the chain's middle line: RC0 / sqrt(1 + A * angle)
    var RBc = K.RB + K.TC, LB = Math.hypot(RBc, K.PB / TAU);     // chain on the box: length per radian of its helix
    function table(rc) {                                         // length of chain lying on the spiral from 0 to each angle
      var d = .005, n = Math.ceil(32 / d), S = new Float64Array(n + 1), i;
      function sp(p) { var dr = (rc(p + 1e-4) - rc(p - 1e-4)) / 2e-4; return Math.sqrt(rc(p) * rc(p) + dr * dr + K.H * K.H / (TAU * TAU)); }
      for (i = 1; i <= n; i++) S[i] = S[i - 1] + d * (sp((i - 1) * d) + 4 * sp((i - .5) * d) + sp(i * d)) / 6;
      return {
        len: function (w) { var x = w / d, k = Math.min(n - 1, Math.floor(x)); return S[k] + (S[k + 1] - S[k]) * (x - k); },
        inv: function (s) { var lo = 0, hi = n; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (S[m] > s) hi = m; else lo = m; } return (lo + (s - S[lo]) / (S[hi] - S[lo])) * d; }
      };
    }
    var fu = { rc: function (p) { return RC0 / Math.sqrt(1 + A * Math.max(0, p)); }, w0: W0, W: W };
    var dr = { rc: function () { return K.RD + K.TC; } };
    fu.t = table(fu.rc); dr.t = table(dr.rc);
    dr.w0 = dr.t.inv(fu.t.len(W0)); dr.W = dr.t.inv(fu.t.len(W));     // the drum takes up the same length of chain as the fusee
    K.modes = { fusee: fu, drum: dr };
    K.RC0 = RC0; K.A = A; K.RBc = RBc; K.LB = LB;
    K.LTOT = fu.t.len(W) + 200 + .75 * TAU * LB;                 // enough chain to leave most of a turn on the box when fully wound
    K.count = Math.floor(K.LTOT / K.PITCH);
    K.wallRadius = function (p) { return fu.rc(p) - K.TC; };
    K.y = function (p) { return K.YB + K.H * (p / TAU + .5); };  // height of the chain at spiral angle p
    /* Everything that follows from w, the spiral angle where the chain leaves the fusee or drum. */
    K.state = function (mode, w) {
      var m = K.modes[mode], b = m.rc(w), th = -Math.acos((RBc - b) / D);         // both tangent points are at this angle, on the front
      var s = { m: m, w: w, th: th, b: b, Lf: m.t.len(w), beta: th + w };
      s.fx = K.XF + b * Math.cos(th); s.fy = K.y(w); s.fz = -b * Math.sin(th);
      s.bx = K.XB + RBc * Math.cos(th); s.bz = -RBc * Math.sin(th);
      var flat = Math.hypot(s.fx - s.bx, s.fz - s.bz), Ls = flat, i;
      for (i = 0; i < 4; i++) { s.by = K.YEND - K.PB * (K.LTOT - s.Lf - Ls) / LB / TAU; Ls = Math.hypot(flat, s.fy - s.by); }
      s.Ls = Ls;
      s.alpha = (s.Lf + Ls) / LB + th;                           // the box turns by the chain paid off, over its radius
      s.pull = 1 + A * s.Lf / (2 * RC0);                         // spring pull in N: grows evenly with the chain taken off the box
      s.lever = b * 8 / RC0;                                     // mm from the shaft to the chain
      s.turn = s.pull * s.lever;
      return s;
    };
    /* Middle of the chain at distance d from its end on the fusee: [x, y, z, tangent x, y, z, normal x, z]. */
    K.point = function (s, d) {
      var t, r, y, x0;
      if (d <= s.Lf) { var p = s.m.t.inv(d); t = s.beta - p; r = s.m.rc(p); y = K.y(p); x0 = K.XF; }
      else if (d <= s.Lf + s.Ls) {
        var f = (d - s.Lf) / s.Ls;
        return [s.fx + (s.bx - s.fx) * f, s.fy + (s.by - s.fy) * f, s.fz + (s.bz - s.fz) * f, s.bx - s.fx, s.by - s.fy, s.bz - s.fz, Math.cos(s.th), -Math.sin(s.th)];
      } else { var g = (d - s.Lf - s.Ls) / LB; t = s.th - g; r = RBc; y = s.by + K.PB * g / TAU; x0 = K.XB; }
      return [x0 + r * Math.cos(t), y, -r * Math.sin(t), Math.sin(t), 0, Math.cos(t), Math.cos(t), -Math.sin(t)];
    };
    K.alpha0 = K.state("fusee", W0).alpha;
    return K;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.makeKin(), HP = Math.PI / 2;
    var o = this.o = { K: K, f: 0, dir: 1 };
    // spring box: a cup, wall x 62..68 from the axis, y -40..40, floor y -40..-34, open at the top. Stands on the pedestal at y -40.
    o.box = new T.Group(); o.box.position.set(K.XB, 0, 0); scene.add(o.box);
    var cup = P.lathePulley({ points: [[68, -40], [68, -40], [68, 40], [68, 40], [62, 40], [62, 40], [62, -34], [62, -34]], material: c.mat("barrel") });
    cup.rotation.x = -HP; o.box.add(cup);                                             // lathe axis Z -> upright
    c.shell(P.at(P.box(8, 1, 4, c.mat("barrel", "dark")), 65, 40.5, 0, o.box), "open");               // dark stud on the rim x 61..69, y 40..41, where the spring's outer end is held
    c.shell(P.at(P.cylY(68, 3, c.mat("barrel")), 0, 41.5, 0, o.box), "closed");       // closed view: lid y 40..43 on the rim; the post comes up through it
    c.shell(P.at(P.box(8, 1, 4, c.mat("barrel", "dark")), 60, 44, 0, o.box), "closed");  // dark stud x 56..64, y 43.5..44.5, lifted off the lid
    // post: stands still in the middle of the box, y -34 (on the floor) .. 85; the spring's inner end touches it at radius 9
    P.at(P.cylY(9, 119, c.mat("spring", "dark")), K.XB, 25.5, 0, scene);
    // spring: strip y -32..38 inside the cup, inner face on the post (radius 9), outer face on the wall (radius 62)
    o.spring = P.spiralSpring({ rIn: 9.8, rOut: 61.2, width: 70, thick: 1.6, material: c.mat("spring") });
    o.spring.rotation.x = -HP; o.spring.position.set(K.XB, 3, 0); scene.add(o.spring);
    // fusee and plain drum share one shaft: y -60 (on the base) .. 85. Bodies y -40..40.
    o.fg = new T.Group(); o.fg.position.set(K.XF, 0, 0); scene.add(o.fg);
    P.at(P.cylY(7, 145, c.mat("fusee")), 0, 12.5, 0, o.fg);                           // shaft y -60..85
    o.fusee = new T.Group(); o.fg.add(o.fusee);
    var fz = P.fusee({ radius: K.wallRadius, turns: K.N, pitch: K.H, hand: -1, material: c.mat("fusee") });
    fz.rotation.x = -HP; fz.position.y = K.YB; o.fusee.add(fz);                       // y -40..40
    P.at(P.box(26, 1, 5, c.mat("fusee", "dark")), 23, 40.5, 0, o.fusee);              // stripe x 10..36, y 40..41 on the top face
    o.drum = new T.Group(); o.fg.add(o.drum);
    P.at(P.cylY(K.RD, 80, c.mat("fusee")), 0, 0, 0, o.drum);                          // y -40..40
    P.at(P.box(42, 1, 5, c.mat("fusee", "dark")), 31, 40.5, 0, o.drum);               // stripe x 10..52, y 40..41 on the top face
    // chain
    o.chain = P.linkChain({ count: K.count, length: 9, height: 7, thick: 3, material: c.mat("chain"), alt: c.mat("chain", "dark"), mark: c.mat("chain", "mark"), markAt: 70 });
    scene.add(o.chain);
    // force bars lying on the base in front: y -60..-52, z 98..110, growing to the right from x -168 and x 6
    o.barPull = P.at(P.box(1, 8, 12, c.mat("bars")), 0, -56, 104, scene);
    o.barTurn = P.at(P.box(1, 8, 12, c.mat("bars")), 0, -56, 104, scene);
    // supports
    P.at(P.box(370, 10, 215, c.fixed), 0, -65, 12.5, scene);                          // base x -185..185, y -70..-60, z -95..120
    P.at(P.cylY(22, 20, c.fixed), K.XB, -50, 0, scene);                               // pedestal y -60..-40, base top to the box's underside
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, mode = S.controls.body === "drum" ? "drum" : "fusee", m = K.modes[mode], i, p;
    // o.f is how far it is wound, 0..1. It runs down at the speed chosen and is wound back up five times as fast.
    o.f += (o.dir > 0 ? 5 : -1) * S.w * dt / (m.W - m.w0);
    if (o.f >= 1) { o.f = 1; o.dir = -1; } else if (o.f <= 0) { o.f = 0; o.dir = 1; }
    var s = K.state(mode, m.w0 + o.f * (m.W - m.w0));
    o.fusee.visible = mode === "fusee"; o.drum.visible = mode === "drum";
    o.fg.rotation.y = s.beta;
    o.box.rotation.y = s.alpha;
    o.spring.set(8 * Math.PI + s.alpha - K.alpha0, .75 + .6 * (s.pull - 1));     // four coils when run down, one more for each turn of the box
    for (i = 0; i < K.count; i++) { p = K.point(s, (i + .5) * K.PITCH); o.chain.put(i, p[0], p[1], p[2], p[3], p[4], p[5], p[6], 0, p[7]); }
    var lp = 60 * s.pull, lt = 12 * s.turn;
    o.barPull.scale.x = lp; o.barPull.position.x = -168 + lp / 2;
    o.barTurn.scale.x = lt; o.barTurn.position.x = 6 + lt / 2;
    S.set("pull", s.pull.toFixed(1) + " N");
    S.set("lever", s.lever.toFixed(1) + " mm");
  }
});
