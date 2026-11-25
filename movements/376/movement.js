M507.define({
  number: 376,
  title: "Tread-wheel horse-power",
  lede: "A horse walks inside a big wheel, like a hamster in its wheel, but it never gets anywhere. Its weight turns the wheel, and the wheel turns a shaft that can drive a machine.",
  alt: "A big wooden wheel seen from the front, with a lattice of cross bars. Inside, a horse walks up the floor on the left side while the wheel turns beneath its feet. A shaft runs from the middle of the wheel to a gear at the back.",
  parts: [
    { key: "horse", color: "#5E7387", name: "Horse", note: "It walks up the floor on one side of the wheel. Its weight is what turns the wheel." },
    { key: "wheel", color: "#C8873A", name: "Tread wheel", note: "A drum with a wooden floor inside. The red stripe on the floor lets you watch how fast it goes round." },
    { key: "shaft", color: "#4FA58A", name: "Shaft", note: "Turns with the wheel. The gear on its end can drive a pump, a mill or a saw." }
  ],
  controls: [{ type: "range", id: "pos", label: "Where the horse stands", min: 10, max: 60, step: 1, value: 40, unit: "°", presets: [[15, "Low"], [40, "Part way up"], [60, "High up"]] }],
  speed: { min: 1, max: 8, value: 3, label: "Wheel speed", unit: "rpm" },
  readouts: [{ id: "w", label: "Wheel" }, { id: "v", label: "Horse pace" }, { id: "t", label: "Turning force" }],
  views: { "3d": [342, 182, 714], front: [0, 0, 820], side: [820, 60, -60] },
  target: [0, -5, -20],
  how: [
    "The horse walks up the sloping floor on the left side of the wheel. Each step pushes the floor backwards and down, so the wheel turns and the horse stays in about the same place. Watch the red stripe on the floor go round.",
    "The turning force comes from the horse's weight. At the very bottom of the wheel the weight pushes straight down and turns nothing. The higher up the side the horse stands, the more the weight pulls sideways, and the harder the wheel turns. The wheel turns as fast as the horse walks.",
    "Move the horse low, then part way up, then high, and watch the turning force change. Then raise the wheel speed and see the horse's legs keep up."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel, its bars and the horse. The floor boards, the rim bolts, the shaft, its two bearings, the gear and the base were made up. The horse is a simple blocky shape, and its size, weight and walking pace are made up too. The horse always stays in the place you choose and walks steadily.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var RO = 200, RF = 189, HW = 40;                      // rim radius, floor radius (inner face of the boards), half width
    var o = this.o = { th: 0, ph: 0, RF: RF, legs: [] };
    var W = o.wheel = new T.Group(); scene.add(W);
    var mw = c.mat("wheel");
    // rim: two hoops z = 35..45 and -45..-35, boards between them
    [HW, -HW].forEach(function (z) {
      P.at(P.hoop(RO, 5, mw), 0, 0, z, W);
      for (i = 0; i < 15; i++) { var a = (i + .5) * 2 * Math.PI / 15; P.at(P.sphere(3.4, c.mat("wheel", "dark")), (RO + 1) * Math.cos(a), (RO + 1) * Math.sin(a), z + (z > 0 ? 5 : -5), W); }   // bolts on the outer faces
    });
    for (i = 0; i < 48; i++) {                            // floor boards, radial 189..195, touching the hoops' inner edge
      var ab = i * 2 * Math.PI / 48, bd = P.box(6, 22, 2 * HW, mw);
      P.at(bd, 192 * Math.cos(ab), 192 * Math.sin(ab), 0, W); bd.rotation.z = ab;
    }
    var st = P.box(1, 10, 60, c.mat("wheel", "mark")); P.at(st, 188 * Math.cos(0), 0, 0, W);   // red stripe 0.5 above the floor, on the board at angle 0
    var al = 25 * Math.PI / 180;
    [HW, -HW].forEach(function (z) {                       // lattice of cross bars on each face
      [[0, 6, 0], [Math.PI / 2, 5, 0]].forEach(function (s) {
        [-190, -114, -38, 38, 114, 190].forEach(function (d) {
          var L = 2 * Math.sqrt(198 * 198 - d * d), a = al + s[0];
          var bar = P.box(L, 7, s[1], mw); P.at(bar, -d * Math.sin(a), d * Math.cos(a), z, W); bar.rotation.z = a;
        });
      });
      for (k = 0; k < 4; k++) {                            // short ties from the hub to the corners of the middle cell
        var ak = al + Math.PI / 4 + k * Math.PI / 2, tie = P.box(34, 6, 4, mw);
        P.at(tie, 38 * Math.cos(ak), 38 * Math.sin(ak), z, W); tie.rotation.z = ak;
      }
    });
    P.at(P.cylZ(22, 88, c.mat("shaft")), 0, 0, 0, W);     // hub z -44..44
    // shaft z -134..43, then gear z -130..-114
    P.at(P.cylZ(6, 177, c.mat("shaft")), 0, 0, -45.5, W);
    var gear = P.spurGear({ teeth: 16, module: 6, width: 16, material: c.mat("shaft") }); P.at(gear, 0, 0, -122, W);
    P.at(P.box(30, 4, .8, c.mat("shaft", "mark")), 25, 0, -113.2, W);   // stripe z -113.6..-112.8, just off the gear face
    // supports: two bearings behind the wheel on a base
    var bb = P.bearingBlock({ bore: 8, outer: 24, drop: 210, width: 14, material: c.fixed });
    P.at(bb, 0, 0, -60, scene);                          // z -67..-53, foot y -210
    P.at(P.bearingBlock({ bore: 8, outer: 24, drop: 210, width: 14, material: c.fixed }), 0, 0, -100, scene);   // z -107..-93
    P.at(P.box(330, 12, 200, c.fixed), 0, -216, -45, scene);   // x -165..165, y -222..-210, z -145..55
    // horse, head towards -x, hooves at y = 0, back at about y = 93
    var H = o.horse = new T.Group(); scene.add(H);
    var mh = c.mat("horse"), md = c.mat("horse", "dark");
    P.at(P.box(100, 36, 30, mh), 0, 75, 0, H);
    var neck = P.at(P.box(18, 52, 20, mh), -56, 108, 0, H); neck.rotation.z = .61;
    var head = P.at(P.box(38, 16, 17, mh), -86, 128, 0, H); head.rotation.z = .35;
    P.at(P.box(5, 10, 4, md), -70, 141, 5, H); P.at(P.box(5, 10, 4, md), -70, 141, -5, H);
    var mane = P.at(P.box(5, 50, 6, md), -48, 112, 0, H); mane.rotation.z = .61;
    var tail = P.at(P.box(7, 46, 9, md), 56, 68, 0, H); tail.rotation.z = -.25; o.tail = tail;
    [[-38, 9, 0], [-38, -9, Math.PI], [38, 9, Math.PI], [38, -9, 0]].forEach(function (s) {
      var pv = new T.Group(); pv.position.set(s[0], 57, s[1]); H.add(pv);
      P.at(P.box(11, 28, 10, mh), 0, -14, 0, pv); P.at(P.box(7, 29, 8, mh), 0, -42.5, 0, pv); P.at(P.box(10, 5, 10, md), 0, -55.5, 0, pv);
      o.legs.push({ g: pv, off: s[2] });
    });
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w, phi = (+S.controls.pos) * Math.PI / 180;
    o.th += w * dt;
    o.wheel.rotation.z = o.th;                            // counter-clockwise: the floor on the left moves down while the horse walks up
    var v = w * o.RF;                                      // floor speed under the hooves, units per second
    o.ph += Math.PI * v / (2 * 57 * .4) * dt;              // leg swing so that a foot on the floor moves back as fast as the floor
    var rh = o.RF - 3.7;                                   // lowered a little so the hooves at both ends touch the curved floor
    o.horse.position.set(-rh * Math.sin(phi), -rh * Math.cos(phi), 0);
    o.horse.rotation.z = -phi;
    o.legs.forEach(function (l) {
      var q = o.ph + l.off, th = .4 * Math.sin(q), up = Math.max(0, -Math.cos(q));
      l.g.rotation.z = w > 0 ? th : 0; l.g.scale.y = w > 0 ? 1 - .22 * up : 1;
    });
    var rpm = S.playing ? S.rpm : 0, kmh = rpm * 2 * Math.PI / 60 * 2.84 * 3.6;
    S.set("w", rpm + " rpm");
    S.set("v", kmh.toFixed(1) + " km/h");
    S.set("t", (500 * 9.81 * 2.84 * Math.sin(phi) / 1000).toFixed(1) + " kN·m");
  }
});
