M507.define({
  number: 434,
  title: "Fourneyron turbine",
  lede: "Water is fed into the middle of a wheel. Fixed curved plates turn it sideways, and it rushes outward into the curved buckets of the wheel. The buckets are pushed round, and the water leaves at the rim.",
  alt: "Plan view of a turbine. In the middle, a ring of fixed curved plates. Around it, a wheel with many curved buckets. Blue dots show water flowing out through the plates and the buckets.",
  parts: [
    { key: "guides", color: "#4FA58A", name: "Fixed guides", note: "Curved plates that never move. They send the water out at a slant, in the direction the wheel turns." },
    { key: "wheel", color: "#C8873A", name: "Wheel and buckets", note: "The outer ring of curved buckets. The water pushes on them and the wheel turns. Watch the red bucket go round." },
    { key: "shaft", color: "#5E7387", name: "Shaft and arms", note: "The wheel hangs from arms on a shaft. The shaft carries the power away." }
  ],
  speed: { min: 10, max: 100, value: 60, label: "Water flow", unit: " %" },
  readouts: [{ id: "w", label: "Wheel" }],
  views: { "3d": [329, 180, 705], front: [0, 0, 820], side: [820, 40, 150] },
  target: [0, 0, 0],
  how: [
    "Water comes down into the middle and spreads outward. First it runs between the fixed plates. They are curved, so the water comes out sideways, going round as well as out.",
    "Then it runs through the buckets of the wheel. The buckets bend the other way, so the water has to change direction. That change pushes on each bucket, and the wheel turns. The water leaves at the rim with little speed left.",
    "Try a low flow, then a high one. More water means a faster wheel."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a view from above. The floor under the guides, the arms and shaft below, and the number and curve of the plates are made up. The speed of the wheel follows the flow by a simple rule.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, j;
    var o = this.o = { A: 0, Ng: 11, Nb: 24, r0: 30, r1: 140, r1w: 141, r2: 190, ps: [] };
    var gm = c.mat("guides"), wm = c.mat("wheel"), sm = c.mat("shaft");
    o.tg = function (r) { var t = (r - o.r0) / (o.r1 - o.r0); return -1.4 * Math.pow(t, 1.5); };       // guide angle at radius r
    o.tb = function (s) { return -.2 * s + .55 * s * s; };                                              // bucket angle, s = 0..1 across the wheel
    // fixed floor under the guides: annulus r 16..138, z -14..-10, hole clear of the shaft (r 12)
    P.at(P.annulus({ rIn: 16, rOut: 138, depth: 4, z0: -14, material: c.fixed }), 0, 0, 0, scene);
    for (i = 0; i < o.Ng; i++) {                                                                        // guides stand on the floor: z -10..12
      var path = [], k;
      for (k = 0; k <= 16; k++) { var r = o.r0 + (o.r1 - o.r0) * k / 16, a = i * 2 * Math.PI / o.Ng + o.tg(r); path.push([r * Math.cos(a), r * Math.sin(a)]); }
      scene.add(P.curvedVane({ path: path, thickness: 3.5, depth: 22, z0: -10, material: gm }));
    }
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(P.annulus({ rIn: 141, rOut: 190, depth: 2, z0: -12, material: wm }));                  // wheel floor z -12..-10, touches bucket feet
    for (i = 0; i < o.Nb; i++) {
      var pb = [];
      for (k = 0; k <= 10; k++) { var s = k / 10, rr = o.r1w + (o.r2 - o.r1w) * s, aa = i * 2 * Math.PI / o.Nb + o.tb(s); pb.push([rr * Math.cos(aa), rr * Math.sin(aa)]); }
      o.wheel.add(P.curvedVane({ path: pb, thickness: 3, depth: 22, z0: -10.5, material: i === 0 ? c.mat("wheel", "mark") : wm }));
    }
    for (j = 0; j < 4; j++) {                                                                           // four arms under the floor and posts up to the wheel floor
      var g = new T.Group(); g.rotation.z = j * Math.PI / 2; o.wheel.add(g);
      P.at(P.box(157, 10, 6, sm), 86.5, 0, -19, g);                                                     // x 8..165, z -22..-16 (floor bottom is -14)
      P.at(P.cylZ(3, 4, sm), 165, 0, -14, g);                                                           // z -16..-12
    }
    P.at(P.cylZ(12, 70, sm), 0, 0, -3, o.wheel);                                                        // shaft z -38..32, runs through the floor hole (r 16)
    // water: spray from above the middle, through guides, through buckets, off the rim
    o.dots = P.waterDots(150, { radius: 2.4, color: c.spot }); scene.add(o.dots);
    for (i = 0; i < 150; i++) o.ps.push({ d: -50 + Math.random() * 400, ch: Math.floor(Math.random() * o.Ng), lat: (Math.random() - .5) * .5 * 2 * Math.PI / o.Ng, inW: false, b0: 0, off: 0 });
  },

  step: function (c, dt, S) {
    var o = this.o, s = S.w * dt, Lg = o.r1 - o.r0, Lb = o.r2 - o.r1w, sg = 2 * Math.PI / o.Ng, sb = 2 * Math.PI / o.Nb;
    o.A += .2 * s; o.wheel.rotation.z = -o.A;
    for (var i = 0; i < o.ps.length; i++) {
      var p = o.ps[i], x, y, z = 0, sc = 1, r, a;
      p.d += 23 * s;
      if (p.d > Lg + Lb + 40) { p.d = -50 - Math.random() * 80; p.ch = Math.floor(Math.random() * o.Ng); p.lat = (Math.random() - .5) * sg * .5; p.inW = false; }
      var ca = (p.ch + .5) * sg + p.lat;
      if (p.d < 0) { r = o.r0 + 4; a = ca + o.tg(r) * .0; z = -p.d * .8; a = ca; }
      else if (p.d < Lg) { r = o.r0 + p.d; a = ca + o.tg(r); }
      else if (p.d < Lg + Lb) {
        var q = (p.d - Lg) / Lb; r = o.r1w + p.d - Lg;
        if (!p.inW) { p.inW = true; p.b0 = ca + o.tg(o.r1) + o.A; p.snap = (Math.floor(p.b0 / sb) + .5) * sb; }
        var k = Math.min(1, q / .3), off = p.b0 + (p.snap - p.b0) * k;
        a = off + o.tb(q) - o.A; p.lastA = a;
      } else { var dd = p.d - Lg - Lb; r = o.r2 + dd; a = (p.lastA === undefined ? 0 : p.lastA); z = -dd * .5; sc = Math.max(0, 1 - dd / 40); }
      x = r * Math.cos(a); y = r * Math.sin(a);
      o.dots.put(i, x, y, z, sc);
    }
    o.dots.flush();
    S.set("w", (S.playing ? Math.round(S.rpm * .2 * 10) / 10 : 0) + " rpm");
  }
});
