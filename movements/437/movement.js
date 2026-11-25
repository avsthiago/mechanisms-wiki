M507.define({
  number: 437,
  title: "Volute wheel",
  lede: "Water is fed into a spiral-shaped casing that curls round a wheel. It sweeps round the wheel and pushes on the little vanes all the way. Then it falls out through slanted buckets near the middle, which push the wheel a second time.",
  alt: "Plan view of a wheel inside a spiral casing. A channel enters at the top left and the casing curls clockwise round the wheel, getting closer to it. The wheel has eight short vanes at its rim, thin spokes, and four slanted fan-shaped buckets near the middle. Blue dots follow the water round the spiral and in through the wheel.",
  parts: [
    { key: "wheel", color: "#C8873A", name: "Wheel and vanes", note: "A hub with spokes and eight short vanes at the rim. The water pushes on the vanes. Watch the red vane go round." },
    { key: "buckets", color: "#D9B13B", name: "Slanted buckets", note: "Four fan-shaped plates near the middle, set at a slant. Water falling through them pushes the wheel a little more." },
    { key: "casing", color: "#4FA58A", name: "Spiral casing", note: "The curling wall round the wheel. It is wide where the water comes in and narrow at the end, so the water stays close to the wheel all the way round." },
    { key: "shaft", color: "#5E7387", name: "Shaft", note: "Joins the wheel to the machinery it drives." }
  ],
  speed: { min: 10, max: 100, value: 60, label: "Water flow", unit: " %" },
  readouts: [{ id: "w", label: "Wheel" }],
  views: { "3d": [317, 173, 680], front: [0, 0, 790], side: [850, 40, 150] },
  target: [0, 0, 0],
  how: [
    "Water comes in along the channel at the top and turns clockwise round the wheel. The casing curls in closer and closer, so the water is always right beside the vanes.",
    "The water pushes on the vanes and the wheel goes round the same way. Then the water slips inward and falls out through the slanted buckets. As it drops through them it gives the wheel a second push.",
    "Try a low flow, then a high one. The wheel turns faster with more water."
  ],
  note: "This model is rebuilt from Brown's drawing, which is a view from above. The floor under the casing, the shaft, the thickness of the walls and the sizes of the vanes and buckets are made up. The wheel speed follows the flow by a simple rule.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { A: 0, ps: [], N: 8 };
    var wm = c.mat("wheel"), bm = c.mat("buckets"), cm = c.mat("casing"), sm = c.mat("shaft");
    o.R = function (s) { return 118 + 72 * (1 - s); };                    // inner radius of the casing, s = 0 at the inlet to 1 after a full turn
    function sp(s, extra) { var a = Math.PI / 2 - 2 * Math.PI * s, r = o.R(s) + (extra || 0); return [r * Math.cos(a), r * Math.sin(a)]; }
    var wall = [[-100, 190], [-50, 190]], outer = [], tongue = [[-100, 124], [-60, 122], sp(.95)];
    for (k = 0; k <= 48; k++) wall.push(sp(.95 * k / 48, 1.75));                // wall centre line, wall r +0..3.5
    scene.add(P.curvedVane({ path: wall, thickness: 3.5, depth: 24, z0: -12, material: cm }));         // z -12..12
    scene.add(P.curvedVane({ path: tongue, thickness: 3.5, depth: 24, z0: -12, material: cm }));
    outer.push([-100, 193.5]);
    for (k = 0; k <= 48; k++) outer.push(sp(.95 * k / 48, 3.5));
    outer.push([-60, 120], [-100, 122]);
    var hole = []; for (k = 0; k < 48; k++) hole.push([111 * Math.cos(k * Math.PI / 24), 111 * Math.sin(k * Math.PI / 24)]);
    scene.add(P.outlinePlate({ points: outer, holes: [hole], depth: 2, z0: -14, material: c.fixed }));  // floor z -14..-12, open over the wheel
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylZ(22, 24, wm), 0, 0, 0, o.wheel);                                                           // hub z -12..12
    P.at(P.cylZ(12, 60, sm), 0, 0, 0, o.wheel);                                                           // shaft z -30..30, through the open floor
    for (i = 0; i < o.N; i++) {
      var g = new T.Group(); g.rotation.z = i * Math.PI / 4; o.wheel.add(g);
      P.at(P.box(66, 3, 4, wm), 55, 0, 0, g);                                                             // spoke x 22..88
      P.at(P.box(22, 4, 20, i === 0 ? c.mat("wheel", "mark") : wm), 99, 0, 0, g);                          // vane x 88..110, z -10..10
    }
    for (i = 0; i < 4; i++) {
      var h = new T.Group(); h.rotation.z = (67.5 + 90 * i) * Math.PI / 180; o.wheel.add(h);
      var w = P.annulus({ rIn: 24, rOut: 66, from: -Math.PI / 8, to: Math.PI / 8, depth: 3, z0: -1.5, material: bm });
      w.rotation.x = .35; w.position.z = -6; h.add(w);                                                    // tilted about its own radius
    }
    o.dots = P.waterDots(150, { radius: 2.4, color: c.spot }); scene.add(o.dots);
    function fresh(p, spread) {
      p.d = -100 - (spread ? Math.random() * 300 : Math.random() * 100); p.y0 = 128 + Math.random() * 58; p.se = .3 + Math.random() * .65; p.z0 = (Math.random() - .5) * 16; p.inW = false;
      p.Lb = 2 * Math.PI * p.se * (p.y0 + 110) / 2;
    }
    o.fresh = fresh;
    for (i = 0; i < 150; i++) { var p = {}; fresh(p, true); p.d += Math.random() * (p.Lb + 180); o.ps.push(p); }
  },

  step: function (c, dt, S) {
    var o = this.o, s = S.w * dt, sb = Math.PI / 4;
    o.A += .11 * s; o.wheel.rotation.z = -o.A;
    for (var i = 0; i < o.ps.length; i++) {
      var p = o.ps[i], x, y, z = p.z0, sc = 1, r, a;
      p.d += 24 * s;
      if (p.d > p.Lb + 80) o.fresh(p, false);
      if (p.d < 0) { x = Math.max(-100, p.d); y = p.y0; if (p.d < -100) sc = 0; }
      else if (p.d < p.Lb) {
        var u = p.d / p.Lb, ss = p.se * u; a = Math.PI / 2 - 2 * Math.PI * ss;
        r = Math.min(p.y0 + (110 - p.y0) * u * u, o.R(ss) - 4);
        x = r * Math.cos(a); y = r * Math.sin(a);
      } else {
        var q = (p.d - p.Lb) / 80;
        if (!p.inW) { p.inW = true; p.b0 = Math.PI / 2 - 2 * Math.PI * p.se + o.A; p.snap = (Math.floor(p.b0 / sb) + .5) * sb; }
        a = p.b0 + (p.snap - p.b0) * Math.min(1, q / .3) - o.A; r = 110 - 80 * q;
        z = -Math.max(0, q - .45) * 90; sc = 1 - Math.max(0, (q - .75) / .25);
        x = r * Math.cos(a); y = r * Math.sin(a);
      }
      o.dots.put(i, x, y, z, sc);
    }
    o.dots.flush();
    S.set("w", (S.playing ? Math.round(S.rpm * .11 * 10) / 10 : 0) + " rpm");
  }
});
