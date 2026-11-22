M507.define({
  number: 9,
  title: "Cone pulleys",
  lede: "Two cones point opposite ways and are joined by one belt. Sliding the belt along changes the speed of the lower cone little by little, with no jumps. Cotton spinning machines use this to speed up or slow down smoothly.",
  alt: "Two long cones on level shafts, one above the other, pointing opposite ways. A crossed flat belt joins them and can slide along their length.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Upper cone", note: "Turned by an engine at a steady speed. It pulls the belt. Watch its dark stripe." },
    { key: "driven", color: "#C8873A", name: "Lower cone", note: "It points the other way. Its speed depends on where the belt sits along it." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One flat loop of leather, crossed between the cones. It can slide along them but never changes length. Watch the red mark go round." }
  ],
  controls: [{ type: "range", id: "pos", label: "Belt position", min: 0, max: 100, step: 1, value: 50, unit: "%",
    presets: [[0, "Slow"], [50, "Middle"], [100, "Fast"]] }],
  readouts: [{ id: "in", label: "Upper" }, { id: "out", label: "Lower" }],
  views: { "3d": [520, 190, 680], front: [0, 0, 900], side: [900, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The upper cone turns at a steady speed and pulls the belt. The belt is crossed, so it turns the lower cone the other way. Wherever the upper cone is thick, the lower cone is thin.",
    "Each turn of a cone moves the belt once round the cone. On Fast, the belt sits where the upper cone is thick and the lower cone is thin. So the lower cone turns faster than the upper one.",
    "One belt has to fit at every place along the cones. A crossed belt stays the same length if the two sizes add up to the same amount. Straight cones do exactly that. Try Slow, then drag slowly to Fast, and watch the lower speed climb while the belt stays tight."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes and the frame are made up, and the upper cone is taken as the driver. Brown's drawing shows the belt edge on, so you cannot tell if it is crossed. Here it is crossed, because then straight cones keep the belt exactly the same length. With an open belt, straight cones would leave it a little loose in the middle. Real cone drives have a fork to push the belt along; it is left out.",

  build: function (c) {
    var P = c.P, scene = c.scene, T = 3, BW = 12, LEN = 180, o = this.o = { a1: 0, a2: 0, s: 0, Y1: 130, Y2: -130, crossed: true };
    o.R1 = function (x) { return 55 - x * 50 / LEN; };    // radius at the middle of the belt: 80 at the left end, 30 at the right
    o.R2 = function (x) { return 110 - o.R1(x); };        // the two always add up to 110, so a crossed belt keeps one length
    function cone(R, y, key) {
      // the belt rests on the edge nearer the thick end, so the surface sits T/2 plus half the belt width times the slope below R
      var surf = function (z) { return R(z) - T / 2 - Math.abs(R(z + .5) - R(z - .5)) * BW / 2; };
      var hold = P.at(new c.THREE.Group(), 0, y, 0, scene); hold.rotation.y = Math.PI / 2;   // local Z along world X
      var p = P.at(P.lathePulley({ profile: surf, length: LEN, samples: 8, material: c.mat(key), mark: c.mat(key, "dark") }), 0, 0, 0, hold);  // x -90..90
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
    o.a1 += S.w * dt; o.s += v * dt; o.a2 += (o.crossed ? -1 : 1) * v / o.r2 * dt;   // crossed: the lower cone turns the other way
    o.p1.rotation.z = o.a1; o.p2.rotation.z = o.a2;
    o.belt.place(o.mark, o.s);
    var r1 = S.playing ? S.rpm : 0, r2 = r1 * o.r1 / o.r2;
    S.set("in", r1 + " rpm");
    S.set("out", (r2 >= 10 ? Math.round(r2) : +r2.toFixed(1)) + " rpm");
  }
});
