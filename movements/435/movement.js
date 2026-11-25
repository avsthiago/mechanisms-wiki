M507.define({
  number: 435,
  title: "Warren's central discharge turbine",
  lede: "Water rushes inward from all round the outside. Fixed curved plates turn it sideways, and it pushes through the buckets of a wheel inside them. The water leaves through the open middle.",
  alt: "Plan view of a turbine. An outer ring of fixed curved plates surrounds a ring of small curved buckets. Inside the buckets are four spokes meeting at a central shaft. Blue dots flow inward through the plates and buckets and drop away at the middle.",
  parts: [
    { key: "guides", color: "#4FA58A", name: "Fixed guides", note: "Curved plates in the outer ring that never move. They send the water inward at a slant, the way the wheel turns." },
    { key: "wheel", color: "#C8873A", name: "Wheel and buckets", note: "A ring of small curved buckets. The water pushes on them and the ring turns. Watch the red bucket go round." },
    { key: "shaft", color: "#5E7387", name: "Spokes and shaft", note: "Four spokes join the ring of buckets to the shaft, which carries the power away." }
  ],
  speed: { min: 10, max: 100, value: 60, label: "Water flow", unit: " %" },
  readouts: [{ id: "w", label: "Wheel" }],
  views: { "3d": [329, 180, 706], front: [0, 0, 820], side: [820, 40, 150] },
  target: [0, 0, 0],
  how: [
    "The water starts outside and moves toward the middle. The fixed plates of the outer ring send it round the wheel at a slant.",
    "Next it runs through the small curved buckets of the wheel. They turn the water again, so it pushes the buckets round. The water then drops out through the open middle, between the spokes.",
    "Try a low flow, then a high one. The wheel speeds up as more water pushes through."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a view from above. The floor under the plates, the spokes and shaft, and the number and curve of the plates and buckets are made up. The wheel speed follows the flow by a simple rule.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { A: 0, Ng: 22, Nb: 32, rg: 200, rgi: 139, rb0: 137, rb1: 113, ps: [] };
    var gm = c.mat("guides"), wm = c.mat("wheel"), sm = c.mat("shaft");
    o.tg = function (r) { var e = (o.rg - r) / (o.rg - o.rgi); return -.65 * Math.pow(e, 1.5); };
    o.tb = function (s) { return -.25 * s + .3 * s * s; };
    P.at(P.annulus({ rIn: 138, rOut: 204, depth: 4, z0: -14, material: c.fixed }), 0, 0, 0, scene);   // fixed floor r 138..204, z -14..-10
    for (i = 0; i < o.Ng; i++) {                                                                       // guides z -10..12, r 139..200
      var path = [];
      for (k = 0; k <= 14; k++) { var r = o.rgi + (o.rg - o.rgi) * k / 14, a = i * 2 * Math.PI / o.Ng + o.tg(r); path.push([r * Math.cos(a), r * Math.sin(a)]); }
      scene.add(P.curvedVane({ path: path, thickness: 3.5, depth: 22, z0: -10, material: gm }));
    }
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(P.annulus({ rIn: 113, rOut: 137, depth: 2, z0: -12, material: wm }));                  // wheel floor z -12..-10
    for (i = 0; i < o.Nb; i++) {
      var pb = [];
      for (k = 0; k <= 8; k++) { var s = k / 8, rr = o.rb0 + (o.rb1 - o.rb0) * s, aa = i * 2 * Math.PI / o.Nb + o.tb(s); pb.push([rr * Math.cos(aa), rr * Math.sin(aa)]); }
      o.wheel.add(P.curvedVane({ path: pb, thickness: 3, depth: 22, z0: -10, material: i === 0 ? c.mat("wheel", "mark") : wm }));
    }
    for (i = 0; i < 4; i++) {                                                                          // four spokes, x 22..118, z -11..-5
      var g = new T.Group(); g.rotation.z = Math.PI / 4 + i * Math.PI / 2; o.wheel.add(g);
      P.at(P.box(96, 12, 6, sm), 70, 0, -8, g);
    }
    P.at(P.cylZ(24, 10, sm), 0, 0, -8, o.wheel);                                                       // collar z -13..-3
    P.at(P.cylZ(12, 60, sm), 0, 0, -5, o.wheel);                                                       // shaft z -35..25
    o.dots = P.waterDots(150, { radius: 2.4, color: c.spot }); scene.add(o.dots);
    for (i = 0; i < 150; i++) o.ps.push({ d: -50 + Math.random() * 300, ch: Math.floor(Math.random() * o.Ng), lat: (Math.random() - .5) * Math.PI / o.Ng, inW: false });
  },

  step: function (c, dt, S) {
    var o = this.o, s = S.w * dt, Lg = o.rg - o.rgi, Lw = o.rgi - o.rb1, sg = 2 * Math.PI / o.Ng, sb = 2 * Math.PI / o.Nb;
    o.A += .25 * s; o.wheel.rotation.z = -o.A;
    for (var i = 0; i < o.ps.length; i++) {
      var p = o.ps[i], z = 0, sc = 1, r, a;
      p.d += 23 * s;
      if (p.d > Lg + Lw + 90) { p.d = -50 - Math.random() * 80; p.ch = Math.floor(Math.random() * o.Ng); p.lat = (Math.random() - .5) * sg * .5; p.inW = false; }
      var ca = (p.ch + .5) * sg + p.lat;
      if (p.d < 0) { r = o.rg - p.d; a = ca; }
      else if (p.d < Lg) { r = o.rg - p.d; a = ca + o.tg(r); }
      else if (p.d < Lg + Lw) {
        r = o.rgi - (p.d - Lg); var q = Math.max(0, Math.min(1, (o.rb0 - r) / (o.rb0 - o.rb1)));
        if (!p.inW) { p.inW = true; p.b0 = ca + o.tg(o.rgi) + o.A; p.snap = (Math.floor(p.b0 / sb) + .5) * sb; }
        var off = p.b0 + (p.snap - p.b0) * Math.min(1, q / .3);
        a = off + o.tb(q) - o.A; p.lastA = a;
      } else { var dd = p.d - Lg - Lw; r = Math.max(14, o.rb1 - dd * .7); a = p.lastA || 0; z = -dd * .9; sc = Math.max(0, 1 - dd / 85); }
      o.dots.put(i, r * Math.cos(a), r * Math.sin(a), z, sc);
    }
    o.dots.flush();
    S.set("w", (S.playing ? Math.round(S.rpm * .25 * 10) / 10 : 0) + " rpm");
  }
});
