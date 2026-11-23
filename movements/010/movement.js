M507.define({
  number: 10,
  title: "Curved cone pulleys",
  lede: "Two curved cones point opposite ways and are joined by one belt. The upper one is hollowed in, the lower one bulges out. Sliding the belt along changes the lower speed smoothly, and the belt stays just as tight everywhere.",
  alt: "Two long curved cones on level shafts, one above the other, pointing opposite ways. The upper one has hollowed sides, the lower one bulging sides. An open flat belt joins them and can slide along their length.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Upper cone", note: "Its sides are hollowed in. An engine turns it at a steady speed, and it pulls the belt. Watch its dark stripe." },
    { key: "driven", color: "#C8873A", name: "Lower cone", note: "Its sides bulge out. Its speed depends on where the belt sits along it." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One flat loop of leather, not crossed. It can slide along the cones but never changes length. Watch the red mark go round." }
  ],
  controls: [{ type: "range", id: "pos", label: "Belt position", min: 0, max: 100, step: 1, value: 50, unit: "%",
    presets: [[0, "Slow"], [50, "Middle"], [100, "Fast"]] }],
  readouts: [{ id: "in", label: "Upper" }, { id: "out", label: "Lower" }],
  views: { "3d": [520, 190, 680], front: [0, 0, 900], side: [900, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The upper cone turns at a steady speed and pulls the belt. The belt turns the lower cone the same way. Wherever the upper cone is thick, the lower cone is thin.",
    "Each turn of a cone moves the belt once round the cone. On Fast, the belt sits where the upper cone is thick and the lower cone is thin, so the lower cone turns faster. On Slow it turns slower.",
    "A belt that is not crossed needs a little extra length between a big and a small pulley. So the two sizes cannot simply add up to the same amount everywhere. In the middle, where the cones are closest in size, they must be a little fatter. That is why the sides curve. Try Slow, Middle and Fast. The belt stays just as tight at every place."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes and the frame are made up, and the upper cone is taken as the driver. Brown does not give the curves. Here the upper curve was chosen to look like his drawing. The lower curve was then worked out from the exact length of an open belt, so the belt is the same length at every place. Its bulge came out of that sum, not from tracing the drawing. Real cone drives have a fork to push the belt along; it is left out.",

  build: function (c) {
    var P = c.P, scene = c.scene, T = 3, BW = 12, LEN = 180, o = this.o = { a1: 0, a2: 0, s: 0, Y1: 130, Y2: -130, crossed: false };
    // radius at the middle of the belt. Upper: 80 at the left end, 30 at the right, sagging in between so its side is hollow.
    o.R1 = function (x) { return 30 + 50 * Math.pow(Math.max(0, 1 - (x + LEN / 2) / LEN), 1.6); };
    o.C = o.Y1 - o.Y2; o.L0 = this.len(80, 30);          // the belt length, set by the two ends (875 mm)
    var self = this;
    o.R2 = function (x) { return self.match(o.R1(x)); }; // lower: whatever keeps the open belt L0 long (30 .. 66 in the middle .. 80)
    function cone(R, y, key) {
      // the belt rests on the edge nearer the thick end, so the surface sits T/2 plus half the belt width times the slope below R
      var surf = function (z) { return R(z) - T / 2 - Math.abs(R(z + .5) - R(z - .5)) * BW / 2; };
      var hold = P.at(new c.THREE.Group(), 0, y, 0, scene); hold.rotation.y = Math.PI / 2;   // local Z along world X
      var p = P.at(P.lathePulley({ profile: surf, length: LEN, samples: 48, material: c.mat(key), mark: c.mat(key, "dark") }), 0, 0, 0, hold);  // x -90..90
      P.at(P.cylX(7, 260, c.mat(key)), 0, y, 0, scene);                 // shaft x -130..130, from upright face to upright face
      return p;
    }
    o.p1 = cone(o.R1, o.Y1, "drive");
    o.p2 = cone(o.R2, o.Y2, "driven");
    // frame
    [-1, 1].forEach(function (sd) { P.at(P.box(14, 390, 36, c.fixed), sd * 137, -35, 0, scene); });  // uprights x ±(130..144), y -230..160, z -18..18
    P.at(P.box(320, 12, 120, c.fixed), 0, -236, 0, scene);                                        // base x -160..160, y -242..-230, z -60..60

    o.hold = P.at(new c.THREE.Group(), 0, 0, 0, scene); o.hold.rotation.y = Math.PI / 2;  // belt plane upright, across the shafts
    o.belt = P.at(P.belt({ width: BW, thick: T, material: c.mat("belt") }), 0, 0, 0, o.hold);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(10, T + 2, BW + 1, c.mat("belt", "mark")), 0, 0, 0, o.belt);
    o.x = null;
  },

  // Exact length of an open belt round radii a and b at centre distance C.
  len: function (a, b) {
    var C = this.o.C, d = a - b;
    return 2 * Math.sqrt(C * C - d * d) + Math.PI * (a + b) + 2 * d * Math.asin(d / C);
  },
  // The lower radius that makes the belt exactly L0 long with upper radius a.
  match: function (a) {
    var lo = 5, hi = 150;
    for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (this.len(a, m) < this.o.L0) lo = m; else hi = m; }
    return (lo + hi) / 2;
  },
  // Belt centre x for the slider: 0% at the right end (small on top, slow), 100% at the left end (fast). Belt x -80..80.
  xFor: function (v) { return 80 - 1.6 * v; },
  place: function (x) {
    var o = this.o; o.x = x; o.r1 = o.R1(x); o.r2 = o.R2(x);
    o.hold.position.x = x;
    o.belt.set(0, o.Y1, o.r1, 0, o.Y2, o.r2, o.crossed);
  },

  step: function (c, dt, S) {
    var o = this.o, xt = this.xFor(+S.controls.pos);
    if (o.x === null) this.place(xt);
    else if (o.x !== xt) { var d = xt - o.x, mv = 120 * dt; this.place(Math.abs(d) <= mv ? xt : o.x + Math.sign(d) * mv); }
    var v = S.w * o.r1;                                      // belt speed = radius x turning speed
    o.a1 += S.w * dt; o.s += v * dt; o.a2 += v / o.r2 * dt;     // open belt: both cones turn the same way
    o.p1.rotation.z = o.a1; o.p2.rotation.z = o.a2;
    o.belt.place(o.mark, o.s);
    var r1 = S.playing ? S.rpm : 0, r2 = r1 * o.r1 / o.r2;
    S.set("in", r1 + " rpm");
    S.set("out", (r2 >= 10 ? Math.round(r2) : +r2.toFixed(1)) + " rpm");
  }
});
