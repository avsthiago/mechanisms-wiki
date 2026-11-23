M507.define({
  number: 85,
  title: "Ore stamp",
  lede: "A heavy upright rod is lifted by curved arms on a turning shaft, then dropped. It falls by its own weight and hits the rock below. Mills like this once crushed ore to get the metal out.",
  alt: "A tall frame with a curved back. On its left an upright rod with a heavy bell-shaped foot slides in two guides. A small block sticks out of the rod, and two curved arms on a shaft beside it catch under the block in turn.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Driving shaft and wipers", note: "The shaft turns all the time. Its curved arms, called wipers, catch under the block on the rod and lift it." },
    { key: "stamp", color: "#C8873A", name: "Stamp", note: "A heavy rod with a thick foot. It slides up and down in two guides on the frame." },
    { key: "tappet", color: "#C2503F", name: "Lifting block", note: "A block fixed to the rod, called a tappet. Watch the wiper slide under it, lift it, then slip away." },
    { key: "die", color: "#4FA58A", name: "Die", note: "The hard block the stamp lands on. The ore to be crushed lies on top of it." }
  ],
  controls: [{ id: "n", label: "Wipers on the shaft", value: "2", options: [["1", "One"], ["2", "Two"], ["3", "Three"]] }],
  readouts: [{ id: "t", label: "Shaft" }, { id: "b", label: "Blows" }],
  views: { "3d": [460, 140, 900], front: [30, 20, 1020], side: [1020, 20, 0] },
  target: [30, 20, 0],
  distance: [320, 2600],
  how: [
    "The shaft turns clockwise. A wiper comes round under the block on the rod and lifts the whole stamp. Then the tip of the wiper slips out from under the block.",
    "Nothing holds the stamp up now, so it drops by its own weight and hits the die with a bang. It lies there until the next wiper comes round. The wiper's edge is curved so it pushes straight up at a steady pace, without shoving the rod sideways.",
    "Each wiper gives one blow every turn of the shaft. Try one wiper, then three, and count the blows in one turn."
  ],
  note: "This model is rebuilt from Brown's drawing. The die, the bearing that holds the shaft, the shape of the wipers, the sizes and the weight of the stamp were made up. The block sits in front of the rod so the wipers can pass beside it. One and three wipers were added for comparison.",

  // Shaft at (0, SY). Wipers: arms whose working edge is an involute of a circle of radius RB, so they lift the block at x = -RB.
  K: { SY: 90, RB: 45, TM: 1.15, DL: .32, RH: 16, X0: -59, X1: -31, REST: 96, G: 2500 },

  // Outline of one wiper in shaft coordinates, starting angle gam.
  wiper: function (gam) {
    var K = this.K, pts = [], i, t;
    function inv(g, t) { var a = g + t; return [K.RB * (Math.cos(a) + t * Math.sin(a)), K.RB * (Math.sin(a) - t * Math.cos(a))]; }
    for (i = 0; i <= 24; i++) pts.push(inv(gam, K.TM * i / 24));                          // working edge, out to the tip
    for (i = 24; i >= 0; i--) { t = (K.TM - K.DL) * i / 24; pts.push(inv(gam + K.DL, t)); } // back edge, in to the base circle
    pts.push([K.RH * Math.cos(gam + K.DL + .3), K.RH * Math.sin(gam + K.DL + .3)]);          // web down to the hub
    pts.push([K.RH * Math.cos(gam - .3), K.RH * Math.sin(gam - .3)]);
    return pts;
  },
  // Highest point of the wipers under the block's span of x, with the shaft turned clockwise by th. -1e9 if none.
  support: function (o, th) {
    var K = this.K, best = -1e9, c = Math.cos(-th), s = Math.sin(-th);
    o.outs.forEach(function (pts) {
      var w = pts.map(function (p) { return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; });
      for (var i = 0; i < w.length; i++) {
        var a = w[i], b = w[(i + 1) % w.length];
        if (a[0] >= K.X0 && a[0] <= K.X1 && a[1] > best) best = a[1];
        [K.X0, K.X1].forEach(function (x) {
          if ((a[0] - x) * (b[0] - x) < 0) { var y = a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); if (y > best) best = y; }
        });
      }
    });
    return best + K.SY;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, self = this;
    var o = this.o = { th: 0, y: 0, v: 0, blows: 0, sets: {}, outs: [] };
    // shaft and wipers: shaft z -18 (bracket face) .. 26, wipers z 11..21 in front of the rod
    o.shaft = new T.Group(); o.shaft.position.set(0, K.SY, 0); scene.add(o.shaft);
    P.at(P.cylZ(9, 44, c.mat("shaft")), 0, 0, 4, o.shaft);                   // shaft z -18..26
    P.at(P.cylZ(16, 14, c.mat("shaft")), 0, 0, 16, o.shaft);                 // hub z 9..23
    P.at(P.box(3, 12, 1, c.mat("shaft", "dark")), 0, 0, 23.5, o.shaft);     // mark on the hub face, z 23..24
    o.gam = Math.PI - 1;                                                    // first wiper part-way through a lift, as drawn
    [1, 2, 3].forEach(function (n) {
      var g = new T.Group(), outs = [];
      for (var j = 0; j < n; j++) {
        var pts = self.wiper(o.gam + 2 * Math.PI * j / n), sh = new T.Shape();
        pts.forEach(function (p, i) { if (i) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
        var geo = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false }); geo.translate(0, 0, 11);   // z 11..21
        g.add(P.mesh(geo, c.mat("shaft"))); outs.push(pts);
      }
      o.shaft.add(g); o.sets[n] = { g: g, outs: outs };
    });
    // stamp: drawn at rest (block underside y 96, foot on the die at y -205)
    o.stamp = new T.Group(); scene.add(o.stamp);
    P.at(P.cylY(7.5, 376, c.mat("stamp")), -45, 32, 0, o.stamp);            // rod y -156..220
    P.at(P.mesh(new T.CylinderGeometry(23, 40, 49, 40), c.mat("stamp")), -45, -180.5, 0, o.stamp);   // foot y -205..-156
    P.at(P.box(28, 10, 34, c.mat("tappet")), -45, 101, 7, o.stamp);         // block x -59..-31, y 96..106, z -10..24, over the wipers
    // die on the base
    P.at(P.box(100, 15, 90, c.mat("die")), -45, -212.5, 0, scene);         // y -220..-205, on the base top
    // frame: column x 75..95, two arms with guides, a bracket for the shaft and a curved back
    P.at(P.box(360, 12, 140, c.fixed), 60, -226, 0, scene);                // base x -120..240, y -232..-220, z -70..70
    P.at(P.box(20, 432, 60, c.fixed), 85, -4, 0, scene);                   // column x 75..95, y -220..212, z -30..30
    P.at(P.guideBlock({ w: 145, h: 22, d: 28, hole: 8, hx: -47.5, material: c.fixed }), 2.5, 201, 0, scene);   // top arm x -70..75, y 190..212
    P.at(P.guideBlock({ w: 145, h: 20, d: 28, hole: 8, hx: -47.5, material: c.fixed }), 2.5, -23, 0, scene);   // lower arm x -70..75, y -33..-13
    P.at(P.box(95, 50, 12, c.fixed), 27.5, K.SY, -24, scene);              // shaft bracket x -20..75, y 65..115, z -30..-18
    var b = new T.Shape();                                                  // curved back x 95.., y -220..212
    b.moveTo(95, -220); b.lineTo(222, -220); b.lineTo(222, -212);
    b.quadraticCurveTo(140, -150, 135, 80); b.quadraticCurveTo(132, 190, 110, 212); b.lineTo(95, 212); b.closePath();
    var bg = new T.ExtrudeGeometry(b, { depth: 24, bevelEnabled: false }); bg.translate(0, 0, -12);
    scene.add(P.mesh(bg, c.fixed));                                         // z -12..12, against the column's right face
    o.n = 2; o.outs = o.sets[2].outs;
    o.y = Math.max(0, this.support(o, 0) - K.REST);                         // open with the stamp on the wiper, as drawn
    this.place(o);
  },

  place: function (o) {
    var k; for (k in o.sets) o.sets[k].g.visible = +k === o.n;
    o.shaft.rotation.z = -o.th;
    o.stamp.position.y = o.y;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, n = +S.controls.n || 2, i, sub = 10, h = dt / sub;
    if (n !== o.n) { o.n = n; o.outs = o.sets[n].outs; }
    if (S.playing) for (i = 0; i < sub; i++) {
      var s0 = this.support(o, o.th) - K.REST;
      o.th += S.w * h;
      var s1 = this.support(o, o.th) - K.REST;
      o.v -= K.G * h; o.y += o.v * h;
      if (o.y < s1) { o.y = s1; o.v = Math.max(o.v, (s1 - s0) / h); }   // a wiper under the block carries it
      if (o.y <= 0) { if (o.v < -100) o.blows++; o.y = 0; o.v = 0; }     // lands on the die
    }
    this.place(o);
    S.set("t", (o.th / (2 * Math.PI)).toFixed(1) + " turns");
    S.set("b", String(o.blows));
  }
});
