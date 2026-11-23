M507.define({
  number: 15,
  title: "White's pulleys",
  lede: "Two blocks, each with one wheel cut with three grooves of different sizes. One rope winds back and forth between them, so six ropes share the weight. The grooves are sized so each wheel turns as one piece and the rope never rubs.",
  alt: "Two pulley blocks, one hung from a beam and one carrying a weight. Each holds a wheel with three grooves stepping down in size. One rope runs back and forth between the grooves and down to a small winch.",
  parts: [
    { key: "upper", color: "#4FA58A", name: "Upper block", note: "Hangs from the beam and does not move. The rope's end is tied to the bottom of it." },
    { key: "lower", color: "#E8E2D0", name: "Lower block", note: "Holds the weight and goes up with it." },
    { key: "sheaves", color: "#C8873A", name: "Grooved wheels", note: "Each wheel has three grooves. The bottom one has sizes 1, 3 and 5, the top one 2, 4 and 6. The dark stripe shows them turn." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One long rope from the tied end to the winch. Each part has a red mark: the nearer the winch, the faster it runs." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "100 kg, shared by the six ropes that hold up the lower block." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "Winds in the rope. It does the job of a hand pulling." }
  ],
  controls: [{ id: "k", label: "Each block has", value: "solid", options: [["solid", "One grooved wheel"], ["loose", "Loose pulleys"]] }],
  readouts: [{ id: "r", label: "Rope pulled" }, { id: "l", label: "Weight raised" }],
  views: { "3d": [460, 80, 760], front: [-30, -30, 900], side: [900, -30, 0] },
  target: [-30, -30, 0],
  how: [
    "Count the ropes between the two blocks. There are six, and all six hold up the lower block. So the winch only has to pull a sixth of the weight.",
    "Now lift the weight a little, say 1 cm. Every rope between the blocks must get 1 cm shorter. Start at the tied end. The first rope needs 1 cm, so 1 cm of rope runs round the first bottom groove. The next rope needs its own 1 cm as well, so 2 cm run over the first top groove. Then 3, 4, 5 and 6 cm. That is why the winch pulls in 6 cm.",
    "A groove twice as big carries twice as much rope in one turn. So grooves sized 1, 3 and 5 below, and 2, 4 and 6 above, let each wheel turn as one solid piece with no rubbing. Try loose pulleys: they are all the same size, so each one has to spin at its own speed."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown gives the power as 1 to 7. Counting the ropes in his drawing, six hold up the lower block, which gives 1 to 6, and that is what the model shows. Brown leaves the end of the rope hanging; a small winch was added to pull it. The weight, the sizes and where the rope's end is tied are made up. Real wheels still rub a little on their pins.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, u = 8, n, GY = -300;
    var o = this.o = { u: u, R0: 28, YU: 100, YL0: -120, TRAVEL: 240, th: 0, loose: {}, wraps: { solid: {}, loose: {} }, a6: {}, t1: {}, t2: {}, rods: [] };
    function zn(k) { return 35 - 10 * k; }                       // groove k sits at z 35-10k; 1 at the front, 6 at the back
    o.zn = zn;
    o.U = new T.Group(); o.U.position.y = o.YU; scene.add(o.U);
    o.L = new T.Group(); scene.add(o.L);
    // blocks: upper wheel spans z -35 .. 25 (centre -5), lower z -25 .. 35 (centre 5); straps 1/2 clear of each end
    var bu = P.at(P.ropeBlock({ radius: 52, width: 60, strap: 8, material: c.mat("upper") }), 0, 0, -5, o.U);    // straps y ±65
    P.at(P.ropeBlock({ radius: 44, width: 60, strap: 8, material: c.mat("lower"), up: false }), 0, 0, 5, o.L);   // straps y ±57
    P.at(P.box(240, 16, 80, c.fixed), -30, o.YU + bu.hookEdge + 8, 0, scene);   // beam, y 218 .. 234; hook top at 218
    o.tie = [-5, o.YU - 66, 26];
    P.at(P.sphere(4.5, c.mat("rope")), o.tie[0], o.tie[1], o.tie[2], scene);  // the rope's end, tied to the bottom corner of the front strap
    // solid grooved wheels; each groove 20 wide: flange, sloped side, bottom, sloped side, flange
    function wheel(ks, grp) {
      var pts = [];
      ks.forEach(function (k, i) {
        var z0 = zn(k) - 10, F = k * u + 3.5, B = k * u - 2.2;
        if (i > 0) pts.push([F, z0]);
        pts.push([F, z0], [F, z0 + 4], [B, z0 + 7], [B, z0 + 13], [F, z0 + 16], [F, z0 + 20]);
        if (i < ks.length - 1) pts.push([F, z0 + 20]);
      });
      return P.at(P.lathePulley({ points: pts, material: c.mat("sheaves"), mark: c.mat("sheaves", "dark") }), 0, 0, 0, grp);
    }
    o.wU = wheel([6, 4, 2], o.U); o.wL = wheel([5, 3, 1], o.L);
    // loose pulleys, all one size, each free on the pin
    for (n = 1; n <= 6; n++) {
      o.loose[n] = P.at(P.sheave({ radius: o.R0, width: 14, material: c.mat("sheaves"), holes: c.mat("sheaves", "dark") }), 0, 0, zn(n), n % 2 ? o.L : o.U);
    }
    // ground and winch; the winch stands in line with groove 6
    P.at(P.box(440, 8, 140, c.fixed), -40, GY - 4, 0, scene);                  // ground, y -308 .. -300
    o.w = P.at(P.winch({ height: 40, material: c.mat("winch"), handle: c.mat("winch", "dark"), rope: c.mat("rope") }), -170, GY + 40, zn(6), scene);
    // rope wraps for both kinds, and where the loose end leaves groove 6 for the drum (outer tangent of the two circles)
    ["solid", "loose"].forEach(function (kind) {
      var r6 = kind === "solid" ? 6 * u : o.R0, x2 = -170, y2 = GY + 40, r2 = o.w.ropeRadius;
      var dx = -x2, dy = o.YU - y2, L = Math.sqrt(dx * dx + dy * dy), ph = Math.atan2(dy, dx), ac = Math.acos((r6 - r2) / L);
      var th = Math.cos(ph + ac) > Math.cos(ph - ac) ? ph + ac : ph - ac, nx = Math.cos(th), ny = Math.sin(th);
      o.t1[kind] = [-r6 * nx, o.YU - r6 * ny]; o.t2[kind] = [x2 - r2 * nx, y2 - r2 * ny];
      o.a6[kind] = Math.atan2(-ny, -nx);
      for (var k = 1; k <= 6; k++) {
        var r = kind === "solid" ? k * u : o.R0, wr = P.arc(r, 2.2, k === 6 ? o.a6[kind] : Math.PI, c.mat("rope"));
        if (k % 2) wr.rotation.z = Math.PI;                                       // under the bottom grooves, over the top ones
        o.wraps[kind][k] = P.at(wr, 0, 0, zn(k), k % 2 ? o.L : o.U);
      }
    });
    for (n = 0; n < 7; n++) { o.rods.push(P.rod(2.2, c.mat("rope"))); scene.add(o.rods[n]); }
    o.beads = [];
    for (n = 0; n < 7; n++) { o.beads.push(P.sphere(4.5, c.mat("rope", "mark"))); scene.add(o.beads[n]); }   // one mark per rope part
    // weight, hung from the lower block's hook
    P.at(P.cylY(2.5, 16, c.mat("weight")), 0, -110, 5, o.L);                    // stem, centred on the hook's lower edge
    P.at(P.sphere(30, c.mat("weight")), 0, -140, 5, o.L);                       // ball, top at -110
  },

  step: function (c, dt, S) {
    var o = this.o, u = o.u, kind = S.controls.k === "loose" ? "loose" : "solid", solid = kind === "solid", k, i;
    o.th += S.w * dt;
    var pull = o.TRAVEL * (.5 - .5 * Math.cos(o.th)), lift = pull / 6, yl = o.YL0 + lift;
    o.L.position.y = yl;
    o.wU.visible = o.wL.visible = solid;
    for (k = 1; k <= 6; k++) {
      o.loose[k].visible = !solid; o.wraps.solid[k].visible = solid; o.wraps.loose[k].visible = !solid;
      o.loose[k].rotation.z = k * lift / o.R0;      // groove k passes k times as much rope as the weight rises, measured on its own block
    }
    o.wU.rotation.z = o.wL.rotation.z = lift / u;   // groove k has radius k*u, so every groove on a wheel agrees
    o.w.drum.rotation.z = pull / o.w.ropeRadius;

    // the rope's path from the tied end to the drum: straight runs and wraps
    var segs = [], prev = o.tie;
    function line(b) { segs.push({ a: prev, b: b, len: Math.hypot(b[0] - prev[0], b[1] - prev[1], b[2] - prev[2]) }); prev = b; }
    for (k = 1; k <= 6; k++) {
      var r = solid ? k * u : o.R0, z = o.zn(k);
      if (k % 2) { line([-r, yl, z]); segs.push({ c: [0, yl, z], r: r, a0: Math.PI, a1: 2 * Math.PI, len: Math.PI * r }); prev = [r, yl, z]; }
      else {
        var a1 = k === 6 ? o.a6[kind] : Math.PI;
        line([r, o.YU, z]); segs.push({ c: [0, o.YU, z], r: r, a0: 0, a1: a1, len: a1 * r });
        prev = [r * Math.cos(a1), o.YU + r * Math.sin(a1), z];
      }
    }
    line([o.t2[kind][0], o.t2[kind][1], o.zn(6)]);
    for (i = 0, k = 0; i < segs.length; i++) if (!segs[i].c) { var g = segs[i]; o.rods[k++].span(g.a[0], g.a[1], g.a[2], g.b[0], g.b[1], g.b[2]); }
    // one red mark fixed on the rope per straight part, first placed at the middle of that part; s counts from the tied end
    if (!o.beadS) { o.beadS = []; for (var acc = 0, j0 = 0; j0 < segs.length; j0++) { if (!segs[j0].c) o.beadS.push(acc + segs[j0].len / 2); acc += segs[j0].len; } }
    o.beads.forEach(function (bd, m) {
      var s = o.beadS[m], j = 0;
      while (j < segs.length && s > segs[j].len) { s -= segs[j].len; j++; }
      bd.visible = j < segs.length;
      if (!bd.visible) return;
      var q = segs[j], f = s / q.len;
      if (q.c) { var a = q.a0 + (q.a1 - q.a0) * f; bd.position.set(q.c[0] + q.r * Math.cos(a), q.c[1] + q.r * Math.sin(a), q.c[2]); }
      else bd.position.set(q.a[0] + (q.b[0] - q.a[0]) * f, q.a[1] + (q.b[1] - q.a[1]) * f, q.a[2] + (q.b[2] - q.a[2]) * f);
    });

    S.set("r", Math.round(pull / 10) + " cm");
    S.set("l", (lift / 10).toFixed(1) + " cm");
  }
});
