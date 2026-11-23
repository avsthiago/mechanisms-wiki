M507.define({
  number: 243,
  title: "One belt to two upright shafts",
  lede: "One belt takes the turning of a sideways shaft and passes it to two upright shafts at the same time. The belt twists a quarter turn as it goes. This is how a machine can drive shafts that point in different directions from one source.",
  alt: "A flat back plate carries a large pulley in the middle with a smaller pulley on each side of it. A belt runs round all three, then out to two tall upright shafts, one at each end, and straight across between them.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Middle pulley", note: "On the sideways shaft. It does the driving. The belt passes under it." },
    { key: "guide", color: "#4FA58A", name: "Guide pulleys", note: "Two small pulleys that turn the belt so it can reach the upright pulleys. They turn the other way from the middle pulley." },
    { key: "upright", color: "#C8873A", name: "Upright pulleys", note: "One on each tall shaft. The belt wraps half way round each. Watch the stripe on top turn." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One endless flat belt. It runs flat round the upright pulleys and on edge round the others. Watch the red mark go round." }
  ],
  controls: [{ id: "mid", label: "Middle pulley", value: "big", options: [["small", "Small"], ["big", "Big"]] }],
  readouts: [{ id: "mid", label: "Middle" }, { id: "up", label: "Upright shafts" }, { id: "bd", label: "Belt speed" }],
  views: { "3d": [170, 110, 780], front: [0, 15, 800], top: [0, 820, 30] },
  target: [0, 15, 0],
  how: [
    "Turn the middle pulley and the belt moves with it. It goes round the two small pulleys, out to the tall pulley on the left, straight across to the tall pulley on the right, and back. Both tall shafts turn the same way.",
    "The belt moves at the same speed everywhere. A big pulley turns slowly while a small pulley turns fast to keep up. The tall pulleys are bigger than the middle one, so they turn slower. Where the belt goes from a flat pulley to an upright one, it twists a quarter turn.",
    "Try the small middle pulley, then the big one. The belt travels more slowly round the small one, so the tall shafts turn more slowly too."
  ],
  note: "This model is rebuilt from Brown's drawing. The back plate, the bearings, the shafts, the sizes and the red mark were made up. Brown draws the two runs of belt across the top almost on top of each other. Here one run is in front and one behind, so they do not touch.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { s: 0, kind: null, RD: 43.5, DX: 222, GX: 120, BY: 28, MY: -17, ZP: 41.5 };
    var BT = 3, BW = 14;
    // back plate z -80..-70, x -280..280, y -132..167; base y -144..-132, z -80..20
    P.at(P.box(560, 299, 10, c.fixed), 0, 17.5, -75, scene);
    P.at(P.box(560, 12, 100, c.fixed), 0, -138, -30, scene);
    // bearing arms for the upright shafts: z -70..12, lower y -132..-120, upper y 155..167
    [-1, 1].forEach(function (sd) {
      P.at(P.box(28, 12, 82, c.fixed), sd * o.DX, -126, -29, scene);
      P.at(P.box(28, 12, 82, c.fixed), sd * o.DX, 161, -29, scene);
    });
    // upright pulleys: drum centred y 15 (barrel y -16..46, flanges to y -20 and 50), shaft y -120..155
    o.drums = [-1, 1].map(function (sd) {
      var g = new T.Group(); g.position.set(sd * o.DX, 15, 0); scene.add(g);
      var d = P.drum({ radius: 40, length: 62, flange: 5, flangeThick: 4, material: c.mat("upright"), mark: c.mat("upright", "dark") });
      d.rotation.x = -Math.PI / 2; g.add(d);
      P.at(P.cylY(6, 275, c.mat("upright", "dark")), 0, 2.5, 0, g);
      return g;
    });
    // sideways shafts run from the back plate (z -70) to z 52
    function flat(x, y, R, key) {
      var g = new T.Group(); g.position.set(x, y, 0); scene.add(g);
      P.at(P.cylZ(5, 122, c.mat(key, "dark")), 0, 0, -9, g);
      var p = P.pulley({ radius: R, width: 16, material: c.mat(key) }); p.spokes[0].material = c.mat(key, "dark");
      P.at(p, 0, 0, o.ZP, g);
      g.pul = p; return g;
    }
    o.g1 = flat(-o.GX, 0, 26.5, "guide"); o.g2 = flat(o.GX, 0, 26.5, "guide");
    o.mid = flat(0, o.MY, 45.5, "drive");
    o.belt = P.at(P.beltPath({ width: BW, thick: BT, material: c.mat("belt") }), 0, 0, 0, scene);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(12, BT + 2, BW + 1, c.mat("belt", "mark")), 0, 0, 0, o.belt);
  },

  // Common tangent of two circles; each turns ccw (s = 1) or cw (s = -1). Returns the angles of the tangent points on each.
  tangent: function (a, sa, ra, b, sb, rb) {
    var dx = b[0] - a[0], dy = b[1] - a[1], D = Math.sqrt(dx * dx + dy * dy), phi = Math.atan2(dy, dx), k = sa * ra - sb * rb;
    var al = phi + Math.asin(k / D), tx = Math.cos(al), ty = Math.sin(al);
    if (dx * tx + dy * ty < 0) { al = phi - Math.PI - Math.asin(k / D); tx = Math.cos(al); ty = Math.sin(al); }
    function ang(s) { return Math.atan2(-s * tx, s * ty); }
    return [ang(sa), ang(sb)];
  },

  lay: function (kind) {
    var o = this.o, R = kind === "small" ? 31.5 : 45.5, Z = [0, 0, 1], X = [1, 0, 0], Y = [0, 1, 0], PI = Math.PI;
    o.kind = kind; o.R = R + 2.3;
    o.mid.pul.scale.set(R / 45.5, R / 45.5, 1);
    var rg = 29.5, rd = o.RD, zp = o.ZP, rm = o.R;
    var g2 = [o.GX, 0], g1 = [-o.GX, 0], m = [0, o.MY];
    var t1 = this.tangent(g2, 1, rg, m, -1, rm), t2 = this.tangent(m, -1, rm, g1, 1, rg);
    function sw(s, a, b) { return s * ((((s * (b - a)) % (2 * PI)) + 2 * PI) % (2 * PI)); }
    o.belt.set([
      { c: [-o.DX, o.BY, 0], axis: Y, u: [0, 0, 1], r: rd, a0: 0, sweep: -PI },
      { c: [o.DX, o.BY, 0], axis: Y, u: [0, 0, 1], r: rd, a0: PI, sweep: -PI },
      { c: [o.GX, 0, zp], axis: Z, u: X, r: rg, a0: PI / 2, sweep: sw(1, PI / 2, t1[0]) },
      { c: [0, o.MY, zp], axis: Z, u: X, r: rm, a0: t1[1], sweep: sw(-1, t1[1], t2[0]) },
      { c: [-o.GX, 0, zp], axis: Z, u: X, r: rg, a0: t2[1], sweep: sw(1, t2[1], PI / 2) }
    ]);
  },

  step: function (c, dt, S) {
    var o = this.o, kind = S.controls.mid === "small" ? "small" : "big";
    if (o.kind !== kind) this.lay(kind);
    var v = S.w * o.R;                               // band speed = middle pulley radius x its turning speed
    o.s += v * dt;
    o.mid.rotation.z = -o.s / o.R;                   // clockwise
    o.g1.rotation.z = o.g2.rotation.z = o.s / 29.5;    // anticlockwise
    o.drums[0].rotation.y = o.drums[1].rotation.y = -o.s / o.RD;
    o.belt.place(o.mark, o.s);
    var rpm = 30 / Math.PI;
    S.set("mid", Math.round(S.w * rpm) + " rpm");
    S.set("up", Math.round(v / o.RD * rpm) + " rpm");
    S.set("bd", Math.round(v * 0.4) + " cm/s");
  }
});
