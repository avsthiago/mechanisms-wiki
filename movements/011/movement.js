M507.define({
  number: 11,
  title: "Belt to a shaft at right angles, without guide pulleys",
  lede: "A belt carries turning from one level shaft to another that crosses it at a right angle. The belt simply twists a quarter turn on each side, so no guide pulleys are needed. The catch is that it only works one way round.",
  alt: "A wide drum on a level shaft at the top, and a spoked pulley below and to the right whose shaft points at you. One flat belt runs straight between them, twisting a quarter turn on each side.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Upper drum", note: "A wide drum on the top shaft, which runs from left to right. It turns all the time and pulls the belt. Watch the dark stripe on its end." },
    { key: "driven", color: "#C8873A", name: "Lower pulley", note: "A spoked pulley on a shaft that points straight at you. It sits to the right of the drum and out in front of it. Watch its dark spoke." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One flat loop of leather. Each run makes a quarter twist between the pulleys. Watch the red mark go round." }
  ],
  controls: [{ id: "dir", label: "Turn the drum", value: "1", options: [["1", "Forwards"], ["-1", "Backwards"]] }],
  speed: { min: 1, max: 30, value: 6 },
  readouts: [{ id: "in", label: "Drum" }, { id: "out", label: "Lower pulley" }, { id: "belt", label: "Belt" }],
  views: { "3d": [440, 160, 640], front: [0, -60, 880], side: [880, -60, 0] },
  target: [0, -60, 0],
  how: [
    "The drum pulls the belt down its front. The belt runs to the right side of the lower pulley and goes round under it. Then it climbs straight up and runs back to the back of the drum.",
    "A belt stays put on a pulley only if it arrives straight, in line with the middle of the rim. Here each run leaves one pulley exactly in line with the middle of the other. That is why the lower pulley sits to one side and out in front. Each run twists a quarter turn on the way.",
    "Try forwards, then backwards. Backwards, each run arrives at a slant, so the belt creeps sideways across the rims and falls off. Switch back before it falls and watch it creep back to the middle. Pick forwards to put a fallen belt back on."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the distance between the shafts and the frame are made up. Brown does not say which pulley drives; here the drum does. How fast the belt creeps sideways is worked out from where each run lands, as if the belt never slid sideways on a rim. A real belt slides a little, so it may creep off more slowly.",

  build: function (c) {
    var P = c.P, scene = c.scene, T = 3, o = this.o = { a: 0, b: 0, s: 0, T: T, W: 20,
      rU: 45, fU: 80, yU: 100, rL: 60, fL: 40, yL: -140, eU: 0, eL: 0, off: null, dir: null };
    o.xL = o.rL; o.zL = o.rU;      // the down run leaves the drum's front (z = rU) straight into the lower pulley's mid-plane,
                                   // and the up run leaves the pulley's left side (x = 0) straight into the drum's mid-plane
    // upper drum, axis X, face x -40..40, radius 43.5 so the belt's middle sits at 45
    o.du = P.at(new c.THREE.Group(), 0, o.yU, 0, scene);
    o.du.add(P.cylX(o.rU - T / 2 - 2, o.fU, c.mat("drive")));
    P.at(P.box(1.5, 36, 5, c.mat("drive", "dark")), o.fU / 2 + .75, 20, 0, o.du);   // stripe on the right end, x 40..41.5
    P.at(P.cylX(7, 260, c.mat("drive")), 0, o.yU, 0, scene);                     // shaft x -130..130, ends at the uprights' inner faces
    // lower pulley, axis Z, rim z 25..65, hub z 27..63
    o.pl = P.at(P.pulley({ radius: o.rL - T / 2 - 2, width: o.fL, material: c.mat("driven") }), o.xL, o.yL, o.zL, scene);
    o.pl.spokes[0].material = c.mat("driven", "dark");
    P.at(P.cylZ(7, 60, c.mat("driven")), o.xL, o.yL, 30, scene);                // shaft z 0..60, from the post face into the hub
    // frame
    [-140, 140].forEach(function (x) { P.at(P.box(20, 340, 30, c.fixed), x, -55, 0, scene); }); // uprights x ±(130..150), y -225..115, z -15..15
    // post sits just behind where a belt fallen off the back of the pulley hangs (belt z 2..22)
    P.at(P.box(44, 105, 24, c.fixed), o.xL, -162.5, -12, scene);                 // post x 38..82, y -215..-110 (on the foot), z -24..0
    P.at(P.box(70, 10, 40, c.fixed), o.xL, -220, -12, scene);                    // foot x 25..95, y -225..-215, z -32..8
    P.at(P.box(340, 12, 130, c.fixed), 0, -231, 15, scene);                      // base x -170..170, y -237..-225, z -50..80

    o.belt = P.at(P.beltPath({ width: o.W, thick: T, material: c.mat("belt"), sameFace: true }), 0, 0, 0, scene);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(12, T + 2, o.W + 1, c.mat("belt", "mark")), 0, 0, 0, o.belt);
    this.lay();
  },

  // Lay the belt with its middle eU along the drum and eL along the lower pulley. Each straight run touches both rims
  // tangentially as seen along each shaft; the tangent points depend on each other, so they are found by repeating.
  lay: function (pointsOnly) {
    var o = this.o, TAU = 2 * Math.PI;
    var U = { c: [o.eU, o.yU, 0], axis: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], r: o.rU, s: 1 };
    var L = { c: [o.xL, o.yL, o.zL + o.eL], axis: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], r: o.rL, s: -1 };
    function pt(g, th) { var a = Math.cos(th), b = Math.sin(th); return [0, 1, 2].map(function (k) { return g.c[k] + g.r * (a * g.u[k] + b * g.v[k]); }); }
    function tan(g, Q, k) {          // k = -1 leaving towards Q, +1 arriving from Q
      var q = [Q[0] - g.c[0], Q[1] - g.c[1], Q[2] - g.c[2]], x = q[0] * g.u[0] + q[1] * g.u[1] + q[2] * g.u[2], y = q[0] * g.v[0] + q[1] * g.v[1] + q[2] * g.v[2];
      return Math.atan2(y, x) + k * g.s * Math.acos(g.r / Math.sqrt(x * x + y * y));
    }
    var uS = -Math.PI / 2, uE = Math.PI / 2, lS = 0, lE = Math.PI;
    for (var i = 0; i < 8; i++) {
      var Ue = pt(U, uE), Us = pt(U, uS), Ls = pt(L, lS), Le = pt(L, lE);
      uE = tan(U, Ls, -1); lS = tan(L, Ue, 1); lE = tan(L, Us, -1); uS = tan(U, Le, 1);
    }
    function mod(a) { return ((a % TAU) + TAU) % TAU; }
    o.P = { Ue: pt(U, uE), Us: pt(U, uS), Ls: pt(L, lS), Le: pt(L, lE) };
    if (pointsOnly) return;
    o.belt.set([
      { c: U.c, axis: U.axis, u: U.u, r: U.r, a0: uS, sweep: mod(uE - uS) },     // over the top of the drum, back to front
      { c: L.c, axis: L.axis, u: L.u, r: L.r, a0: lS, sweep: -mod(lS - lE) }     // under the lower pulley, right side to left
    ]);
  },

  // How fast the middle of the belt moves along a pulley's face, per unit of belt: the run arriving from point F lands at A.
  creep: function (F, A, k) {
    var d = [F[0] - A[0], F[1] - A[1], F[2] - A[2]];
    return d[k] / Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  },

  step: function (c, dt, S) {
    var o = this.o, dir = +S.controls.dir, v = dir * S.w * o.rU;
    if (o.dir !== dir) { o.dir = dir; if (dir > 0 && o.off) { o.off = null; o.eU = o.eL = 0; this.lay(); } }
    o.a += dir * S.w * dt;
    o.du.rotation.x = o.a;
    var moved = false;
    if (o.off) {                     // fallen: slide clear of the rim, then hang still
      var t = o.off, e = t.k === "U" ? "eU" : "eL", st = 90 * dt;
      if (o[e] !== t.to) { o[e] = Math.abs(t.to - o[e]) < st ? t.to : o[e] + st * Math.sign(t.to - o[e]); moved = true; }
    } else if (v && (dir < 0 || o.eU || o.eL)) {      // forwards with the belt centred, nothing creeps
      var ds = Math.abs(v) * dt, n = Math.ceil(ds / 1), h = ds / n, p;
      for (var i = 0; i < n; i++) {
        p = o.P;
        if (dir > 0) { o.eL += h * this.creep(p.Ue, p.Ls, 2); o.eU += h * this.creep(p.Le, p.Us, 0); }
        else { o.eU += h * this.creep(p.Ls, p.Ue, 0); o.eL += h * this.creep(p.Us, p.Le, 2); }
        if (Math.abs(o.eU) < .01) o.eU = 0;
        if (Math.abs(o.eL) < .01) o.eL = 0;
        this.lay(true);
      }
      moved = true;
      var clear = o.W / 2 + 3;
      if (Math.abs(o.eL) > o.fL / 2) o.off = { k: "L", to: Math.sign(o.eL) * (o.fL / 2 + clear) };
      else if (Math.abs(o.eU) > o.fU / 2) o.off = { k: "U", to: Math.sign(o.eU) * (o.fU / 2 + clear) };
    }
    if (v && !o.off) { o.s += v * dt; o.b -= v / o.rL * dt; }
    if (moved) this.lay();
    o.pl.rotation.z = o.b;
    o.belt.place(o.mark, o.s);
    var r = S.playing ? S.rpm : 0;
    S.set("in", r + " rpm");
    S.set("out", (o.off ? 0 : Math.round(r * o.rU / o.rL * 10) / 10) + " rpm");
    S.set("belt", o.off ? "off" : (Math.abs(o.eU) > .5 || Math.abs(o.eL) > .5) ? "sliding" : "on");
  }
});
