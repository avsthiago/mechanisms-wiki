M507.define({
  number: 320,
  title: "Endless-chain maintaining power",
  lede: "A clock weight hangs in a loop of one endless rope. You can pull the rope to wind the weight back up, and the weight keeps driving the clock while you do it. So the clock never stops or loses time during winding.",
  alt: "Two wheels side by side on a clock plate, each with a rope pulley in front. One endless rope hangs over both. A big weight hangs in one loop of the rope on a pulley, and a small weight hangs in the other loop. The left pulley has a toothed ratchet wheel and a catch.",
  parts: [
    { key: "going", color: "#5E7387", name: "Going wheel", note: "The right wheel. It drives the clock's hands, so it must never stop. Its pulley is rough, so the rope cannot slip. Watch the red spoke." },
    { key: "ratchet", color: "#4FA58A", name: "Ratchet pulley", note: "The left pulley, with a toothed wheel on its face. It can turn only one way, the way that winds the weight up." },
    { key: "click", color: "#E8E2D0", name: "Striking wheel and holding pawl", note: "The left wheel and the holding pawl on it, a small catch. It drops into the ratchet teeth, so the big weight cannot pull the left pulley round." },
    { key: "rope", color: "#D9B13B", name: "Endless rope", note: "One rope joined into a loop. Watch the red marks to see which way it runs." },
    { key: "big", color: "#8E7AA8", name: "Big weight", note: "The weight that runs the clock. It hangs on a pulley in the right loop of the rope." },
    { key: "small", color: "#C8873A", name: "Small weight", note: "Only heavy enough to keep the rope tight on the pulleys." }
  ],
  speed: { label: "Going wheel", min: 1, max: 6, value: 2 },
  readouts: [{ id: "g", label: "Going wheel" }, { id: "p", label: "Ratchet pulley" }, { id: "h", label: "Big weight" }],
  views: { "3d": [430, 90, 1060], front: [0, -30, 1180], side: [1180, -30, 0] },
  target: [0, -30, 0],
  how: [
    "The big weight hangs in a loop of rope. One side of that loop goes up over the going wheel's pulley. The other side goes up over the ratchet pulley. The holding pawl stops the ratchet pulley, so only the going wheel can give way. The weight slowly sinks and turns the going wheel.",
    "To wind, a hand pulls down on the rope at the far left. The ratchet pulley turns the free way, and its teeth slip under the holding pawl. The rope is drawn up over it, and the big weight rises. The small weight goes down to take up the rope. The rope over the going wheel is never touched, so the weight still pulls on it the whole time.",
    "Watch the readouts as the model winds itself every so often. The going wheel's speed never changes, even while the big weight rises. Try a faster going wheel and see the winding come round more often."
  ],
  note: "This model is rebuilt from Brown's drawing. The hand that pulls the rope is left out; the rope simply runs when it is pulled. The clock train, the pendulum and the striking train are left out, so the striking wheel stands still. The holding pawl is pivoted on the striking wheel, as Brown suggests. The two crossing ropes run in two layers so they do not rub. The plate, the sizes, the tooth counts and how far the weight moves were made up.",

  // fixed sizes: pulley centres, rope radii (rope lies at these radii), weight travel
  K: { cp: [-95, 150, -4], cP: [95, 150, 4], xw: -75, zw: 4, xW: 55, zW: -4, R1: 55, r2: 38, R3: 78, yW0: -90, yw0: -50, lo: -135, hi: -72, PULL: 4 },

  // the rope loop for the two weights at heights yW (big) and yw (small); loop order: ratchet pulley (anticlockwise),
  // small pulley (anticlockwise), going pulley (clockwise), big pulley (clockwise), back to the start
  geo: function (yW, yw) {
    var K = this.K, W2 = 2 * Math.PI, i;
    var C = [[K.cp[0], K.cp[1], K.cp[2], K.R1], [K.xw, yw, K.zw, K.r2], [K.cP[0], K.cP[1], K.cP[2], -K.R1], [K.xW, yW, K.zW, -K.R3]];
    var ref = [0, Math.PI, Math.PI, 0], m = [];
    function tan(a, b) {                     // common tangent leaving circle a towards circle b, both signed radii (+ anticlockwise)
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), be = Math.atan2(dy, dx), g = Math.acos((a[3] - b[3]) / L), t = be + g;
      if (-Math.sin(t) * dx + Math.cos(t) * dy < 0) t = be - g;
      return t;
    }
    function pt(c, a) { return [c[0] + Math.abs(c[3]) * Math.cos(a), c[1] + Math.abs(c[3]) * Math.sin(a), c[2]]; }
    for (i = 0; i < 4; i++) m.push(tan(C[i], C[(i + 1) % 4]));
    var wraps = [], a0s = [], S = [], acc = 0;
    for (i = 0; i < 4; i++) {
      var c = C[i], arr = m[(i + 3) % 4] + (c[3] > 0 ? 0 : Math.PI), dep = m[i] + (c[3] > 0 ? 0 : Math.PI);
      var a0 = arr - W2 * Math.round((arr - ref[i]) / W2), a1;
      if (c[3] > 0) a1 = a0 + (((dep - a0) % W2) + W2) % W2; else a1 = a0 - (((a0 - dep) % W2) + W2) % W2;
      wraps.push({ c: [c[0], c[1], c[2]], r: Math.abs(c[3]), a0: a0, a1: a1 }); a0s.push(a0);
    }
    for (i = 0; i < 4; i++) {
      S.push(acc);
      var w = wraps[i], n = wraps[(i + 1) % 4], p = pt(C[i], w.a1), q = pt(C[(i + 1) % 4], n.a0);
      acc += Math.abs(w.a1 - w.a0) * w.r + Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    }
    return { wraps: wraps, a0: a0s, S: S, L: acc, start: pt(C[0], wraps[0].a0) };
  },

  // heights of both weights for rope run over the going pulley (sg) and over the ratchet pulley (sw):
  // the loop keeps its length, and the rope between the two upper pulleys gains sw and loses sg
  solve: function (sg, sw) {
    var o = this.o, K = this.K, self = this, y = [o.yW, o.yw], it;
    function F(a, b) { var g = self.geo(a, b); return [g.S[2] + K.R1 * (g.a0[2] + g.a0[0]) + sg - sw - o.K1, g.L - o.L0]; }
    for (it = 0; it < 6; it++) {
      var f = F(y[0], y[1]); if (Math.abs(f[0]) + Math.abs(f[1]) < 1e-7) break;
      var fa = F(y[0] + .01, y[1]), fb = F(y[0], y[1] + .01);
      var j11 = (fa[0] - f[0]) / .01, j21 = (fa[1] - f[1]) / .01, j12 = (fb[0] - f[0]) / .01, j22 = (fb[1] - f[1]) / .01, det = j11 * j22 - j12 * j21;
      y[0] -= (j22 * f[0] - j12 * f[1]) / det; y[1] -= (-j21 * f[0] + j11 * f[1]) / det;
    }
    o.yW = y[0]; o.yw = y[1];
    return this.geo(y[0], y[1]);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, k;
    var o = this.o = { sg: 0, sw: 0, phase: "run", yW: K.yW0, yw: K.yw0 };
    var g0 = this.geo(K.yW0, K.yw0);
    o.L0 = g0.L; o.K1 = g0.S[2] + K.R1 * (g0.a0[2] + g0.a0[0]); o.ap0 = g0.a0[0];
    o.w0 = K.r2 * g0.a0[1] - g0.S[1] - K.R1 * g0.a0[0]; o.W0 = g0.S[3] + K.R1 * g0.a0[0] + K.R3 * g0.a0[3];

    // clock plate: x -195..195, y 55..245, z -40..-30; every arbor starts on its front face z = -30
    P.at(P.box(390, 190, 10, c.fixed), 0, 150, -35, scene);

    // going wheel: great wheel z -20..-12, hub -12..-2.5, rope pulley -2.5..10.5 (rope at z 4), collar 10.5..13, arbor -30..13
    o.going = P.at(new T.Group(), K.cP[0], K.cP[1], 0, scene);
    P.at(P.spurGear({ teeth: 54, module: 3, width: 8, material: c.mat("going") }), 0, 0, -16, o.going);
    P.at(P.cylZ(5, 42.5, c.mat("going", "dark")), 0, 0, -8.75, o.going);
    P.at(P.cylZ(14, 9.5, c.mat("going")), 0, 0, -7.25, o.going);
    var pg = P.at(P.ropeWheel({ radius: K.R1, tube: 2.5, spokes: 4, material: c.mat("going") }), 0, 0, 4, o.going);
    pg.spokes[0].material = c.mat("going", "mark");
    P.at(P.cylZ(9, 2.5, c.mat("going")), 0, 0, 11.75, o.going);

    // striking wheel (stands still): wheel z -20..-12, arbor -30..12; stud for the catch at radius 68, z -12..2
    var st = P.at(new T.Group(), K.cp[0], K.cp[1], 0, scene);
    P.at(P.spurGear({ teeth: 54, module: 3, width: 8, material: c.mat("click") }), 0, 0, -16, st);
    P.at(P.cylZ(5, 41.5, c.mat("click", "dark")), 0, 0, -9.25, st);
    P.at(P.cylZ(8, 3, c.mat("click")), 0, 0, 10.5, st);                       // collar z 9..12, on the ratchet's front face
    o.pivA = 50 * Math.PI / 180; o.pivR = 68;
    var px = o.pivR * Math.cos(o.pivA), py = o.pivR * Math.sin(o.pivA);
    P.at(P.cylZ(3, 14, c.mat("click")), px, py, -5, st);

    // ratchet pulley (turns only to wind): rope pulley z -10.5..2.5 (rope at z -4), boss -1..3, ratchet wheel 3..9
    o.rp = P.at(new T.Group(), K.cp[0], K.cp[1], 0, scene);
    P.at(P.ropeWheel({ radius: K.R1, tube: 2.5, spokes: 4, material: c.mat("ratchet") }), 0, 0, -4, o.rp);
    P.at(P.cylZ(12, 4, c.mat("ratchet")), 0, 0, 1, o.rp);
    o.rat = P.at(P.ratchet({ teeth: 16, radius: 46, depth: 6, width: 6, reverse: true, tip: 1.5, material: c.mat("ratchet") }), 0, 0, 6, o.rp);
    // catch: hub z 2..10 on the stud's end, body z 3..9 in the ratchet's plane, body on the side away from the wheel
    o.clickL = 63;
    o.click = P.at(P.pawl({ length: o.clickL, thick: 6, width: 6, side: -1, material: c.mat("click") }), K.cp[0] + px, K.cp[1] + py, 6, scene);
    o.rim = 40;
    var an0 = o.pivA + o.click.reach(o.pivR, 40);
    o.phi0 = an0 + .002;                                                     // a tooth face rests against the catch's nose

    // small weight: pulley z 0..8, straps z -3.5..-0.5 and 8.5..11.5 from y 8 down to the weight's top at -50, weight -50..-140
    o.sm = new T.Group(); o.sm.position.set(K.xw, K.yw0, K.zw); scene.add(o.sm);
    o.smP = P.at(P.sheave({ radius: K.r2, material: c.mat("small"), holes: c.mat("small", "dark") }), 0, 0, 0, o.sm);
    [-1, 1].forEach(function (s) { P.at(P.box(8, 58, 3, c.mat("small")), 0, -21, s * 6, o.sm); });
    P.at(P.cylZ(3, 15, c.mat("small")), 0, 0, 0, o.sm);                      // pin ends at the straps' outer faces
    P.at(P.box(50, 90, 30, c.mat("small")), 0, -95, 0, o.sm);
    // big weight: pulley z -8..0, straps z -10.5..-7.5 and 0.5..3.5 from y 10 down to the weight's top at -100, weight -100..-180
    o.bg = new T.Group(); o.bg.position.set(K.xW, K.yW0, K.zW); scene.add(o.bg);
    o.bgP = P.at(P.sheave({ radius: K.R3, material: c.mat("big"), holes: c.mat("big", "dark") }), 0, 0, 0, o.bg);
    [-1, 1].forEach(function (s) { P.at(P.box(12, 110, 3, c.mat("big")), 0, -45, s * 6, o.bg); });
    P.at(P.cylZ(4, 15, c.mat("big")), 0, 0, 0, o.bg);
    P.at(P.box(150, 80, 60, c.mat("big")), 0, -140, 0, o.bg);

    o.rope = P.at(P.ropePath({ tube: 2.5, material: c.mat("rope"), mark: c.mat("rope", "mark"), marks: 3 }), 0, 0, 0, scene);
    // marks start on the far-left rope, on the right loop's going side, and on the rope that crosses up to the ratchet pulley
    var S = g0.S, wr = g0.wraps;
    function arcL(i) { return Math.abs(wr[i].a1 - wr[i].a0) * wr[i].r; }
    o.u = [(S[0] + arcL(0) + S[1]) / 2, (S[2] + arcL(2) + S[3]) / 2, (S[3] + arcL(3) + g0.L) / 2];
    this.place(g0);
  },

  place: function (g) {
    var o = this.o, K = this.K, L = g.L;
    o.rope.markS = o.u.map(function (u) { var s = (u + o.sw - K.R1 * (g.a0[0] - o.ap0)) % L; return s < 0 ? s + L : s; });
    o.rope.set(g.wraps.concat([g.start]));
    o.sm.position.y = o.yw; o.bg.position.y = o.yW;
    o.smP.rotation.z = (K.r2 * g.a0[1] - g.S[1] - K.R1 * g.a0[0] + o.sw - o.w0) / K.r2;
    o.bgP.rotation.z = (g.S[3] + K.R1 * g.a0[0] - o.sw + K.R3 * g.a0[3] - o.W0) / K.R3;
    o.going.rotation.z = -o.sg / K.R1;
    var phi = o.phi0 + o.sw / K.R1, r = o.rim, an, k;
    o.rp.rotation.z = phi;
    for (k = 0; k < 3; k++) { an = o.pivA + o.click.reach(o.pivR, r); r = o.rat.rimAt(an - phi); }
    o.rim = r; an = o.pivA + o.click.reach(o.pivR, r);
    o.click.rotation.z = Math.atan2(r * Math.sin(an) - o.pivR * Math.sin(o.pivA), r * Math.cos(an) - o.pivR * Math.cos(o.pivA));
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, dg = S.w * dt, sw0 = o.sw, step = 2 * Math.PI / 16;
    o.sg += K.R1 * dg;
    if (o.phase !== "run") {
      o.sw += K.PULL * K.R1 * dg;
      if (o.phase === "stop" && o.sw >= o.swEnd) { o.sw = o.swEnd; o.phase = "run"; }    // the hand lets go as a tooth drops under the catch
    }
    var g = this.solve(o.sg, o.sw);
    if (o.phase === "run" && o.yW <= K.lo) o.phase = "wind";
    else if (o.phase === "wind" && o.yW >= K.hi) { o.phase = "stop"; o.swEnd = K.R1 * step * Math.ceil(o.sw / K.R1 / step - 1e-6); }
    this.place(g);
    if (dt > 0) {
      var f = 30 / Math.PI / dt;
      S.set("g", (Math.round(dg * f * 10) / 10) + " rpm");
      S.set("p", (Math.round(-(o.sw - sw0) / K.R1 * f * 10) / 10 || 0) + " rpm");
    }
    S.set("h", ((o.yW - K.lo) / 10).toFixed(1) + " cm");
  }
});
