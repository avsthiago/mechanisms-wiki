M507.define({
  number: 375,
  title: "Edge runners",
  lede: "Two heavy stone wheels roll round and round in a shallow pan. They crush or grind whatever is in the pan. A level shaft turns an upright shaft through bevel gears, and the upright shaft carries the wheels.",
  alt: "A square frame stands over a round pan. An upright shaft in the frame carries a level axle with a heavy wheel on each end. The wheels stand in the pan. At the top, a big flat bevel gear on the upright shaft meshes with a smaller one on a level shaft.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Bevel gears and shafts", note: "The level shaft turns the upright one through two bevel gears. The upright shaft turns more slowly than the level one. Watch the red pointer on the end of the level shaft." },
    { key: "runner", color: "#C8873A", name: "Runners", note: "The two heavy wheels. Each one rolls on the pan and also turns round the upright shaft. The red stripe on each shows how fast it spins." },
    { key: "axle", color: "#8E7AA8", name: "Axle and hub", note: "A level bar through a block on the upright shaft. Each wheel turns freely on one end of it." },
    { key: "pan", color: "#4FA58A", name: "Pan", note: "The round trough the wheels roll in. It stays still. The grain to be crushed lies on its floor." }
  ],
  controls: [{ type: "range", id: "slide", label: "Slide the axle sideways", min: -14, max: 14, step: 0.5, value: 0, unit: " mm", presets: [[-14, "Right wheel in"], [-3.75, "Equal paths"], [0, "As drawn"], [14, "Left wheel in"]] }],
  readouts: [{ id: "l", label: "Left wheel" }, { id: "r", label: "Right wheel" }, { id: "s", label: "Driving shaft" }],
  speed: { min: 1, max: 30, value: 10, label: "Level shaft speed", unit: " rpm" },
  views: { "3d": [288, 272, 618], front: [0, 115, 700], side: [700, 130, 0] },
  target: [0, 115, 0],
  how: [
    "The level shaft at the top turns the big flat gear. The big gear is on the upright shaft, so it carries the axle round and round. The wheels at the ends of the axle roll in a circle round the pan.",
    "The big gear has twice as many teeth as the small one, so the upright shaft turns once for every two turns of the level shaft. Each wheel rolls without sliding, so a wheel that is farther from the shaft has farther to go and spins faster. Look at the red stripes.",
    "Try sliding the axle. Choose Right wheel in, then Left wheel in, and see which wheel spins faster. The two wheels are different distances from the shaft, so they spin at different speeds."
  ],
  note: "This model is rebuilt from Brown's drawing. The wheels are drawn a little different distances from the shaft, and that is kept. The frame, the pan's shape, the bearings and the sizes were made up. The level shaft gets a pointer so you can see it turn. The pan is empty. In a real mill the wheels also rub sideways on the grain, because the outer edge of each wheel has farther to go than the inner edge.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = .55;
    function X(px) { return (px - 307) * K; } function Y(py) { return (485 - py) * K; }
    var o = this.o = { a: 0, rw: 107 * K, w: 65 * K, rL0: 119.5 * K, rR0: 133 * K };
    var rw = o.rw, w = o.w, AP = 220.45;                           // apex of the bevel pair: wheel hub bottom (y 156.75) sits on the beam top
    // frame
    P.at(P.box(330, 8, 120, c.fixed), 0, -37, 0, scene);                           // ground x -165..165, y -41..-33, z -60..60
    P.at(P.box(21, 170.5, 40, c.fixed), -136.5, 52.25, 0, scene);                  // left leg x -147..-126, y -33..137.5, z -20..20
    P.at(P.box(23.6, 170.5, 40, c.fixed), 131.8, 52.25, 0, scene);                 // right leg x 120..143.6, y -33..137.5
    P.at(P.guideBlock({ w: 290.6, h: 19.25, d: 40, hole: 7.5, hx: 1.7, material: c.fixed }), -1.7, 147.125, 0, scene);   // beam x -147..143.6, y 137.5..156.75
    var post = P.guideBlock({ w: 88.25, h: 9.5, d: 40, hole: 7.5, hx: AP - 200.875, material: c.fixed });   // post, hole along X
    post.rotation.z = Math.PI / 2; P.at(post, 126.75, 200.875, 0, scene);          // x 122..131.5, y 156.75..245, z -20..20
    // pan: a frustum with a low rim and a boss in the middle
    var pan = P.lathePulley({ points: [[100, -33], [118, 0]], material: c.mat("pan") }); pan.rotation.x = -Math.PI / 2; scene.add(pan);   // y -33..0
    P.at(P.cylY(20, 12, c.mat("pan")), 0, 5, 0, scene);                            // boss y -1..11, pokes out of the floor (y 0)
    var rs = new T.Shape(); rs.absarc(0, 0, 118, 0, 2 * Math.PI, false); var rh = new T.Path(); rh.absarc(0, 0, 112, 0, 2 * Math.PI, true); rs.holes.push(rh);
    var lg = new T.ExtrudeGeometry(rs, { depth: 12, bevelEnabled: false, curveSegments: 64 }); lg.rotateX(-Math.PI / 2);
    P.at(new T.Mesh(lg, c.mat("pan")), 0, -2, 0, scene);                           // rim y -2..10
    // bevel pair: wheel (24 teeth) on the upright shaft, pinion (12 teeth) on the level shaft, common apex
    var pair = new T.Group(); pair.position.set(0, AP, 0); pair.rotation.z = Math.PI; scene.add(pair);
    o.top = P.bevelGearCone({ radius: 90.75, teeth: 24, cone: Math.atan2(2, 1) * 180 / Math.PI, hubLength: 12, material: c.mat("drive") }); pair.add(o.top);
    var outer = new T.Group(); outer.rotation.z = Math.PI / 2; pair.add(outer);
    o.side = P.bevelGearCone({ radius: 45.375, teeth: 12, cone: Math.atan2(1, 2) * 180 / Math.PI, hubLength: 12, material: c.mat("drive") }); outer.add(o.side);
    var b2 = o.side.backY, xe = 145;
    P.at(P.cylY(7, xe - b2 + 10, c.mat("drive")), 0, (b2 - 10 + xe) / 2, 0, o.side);                  // level shaft x b2-10 .. 145, through the post (x 122..131.5)
    P.at(P.cylY(16, 4, c.mat("drive")), 0, xe - 2, 0, o.side);                                          // disc x 141..145
    P.at(P.box(26, 1, 5, c.mat("drive", "mark")), 9, xe + 1, 0, o.side);                                // red pointer x 145.5..146.5
    // upright shaft assembly, turns with the big gear
    o.G = new T.Group(); scene.add(o.G);
    P.at(P.cylY(7, 100, c.mat("drive")), 0, 128.75, 0, o.G);                                            // shaft y 78.75..178.75: from the hub top, through the beam
    P.at(P.box(w, 40, 36, c.mat("axle")), 0, rw, 0, o.G);                                               // hub block x -17.9..17.9, y 38.9..78.9
    o.ax = P.at(P.cylX(6, 1, c.mat("axle")), 0, rw, 0, o.G);
    o.wh = [];
    [-1, 1].forEach(function (sd) {
      var g = new T.Group(); o.G.add(g);
      P.at(P.cylX(rw, w, c.mat("runner")), 0, 0, 0, g);
      P.at(P.cylX(11, w + 27.5, c.mat("axle")), 0, 0, 0, g);                                            // boss, 13.75 out of each face
      P.at(P.box(w * .55, 2.4, 7, c.mat("runner", "mark")), 0, rw + .2, 0, g);                          // red stripe
      o.wh.push({ g: g, sd: sd });
    });
  },

  step: function (c, dt, S) {
    var o = this.o, d = +S.controls.slide, rL = o.rL0 - d, rR = o.rR0 + d;
    o.a += S.w * dt / 2;                                                // wheel gear turns half as fast as the pinion
    o.top.rotation.y = o.a;
    o.side.rotation.y = -2 * o.a + o.side.pitch / 2;
    o.G.rotation.y = -o.a;
    var gL = o.wh[0], gR = o.wh[1];
    gL.g.position.set(-rL, o.rw, 0); gR.g.position.set(rR, o.rw, 0);
    gL.g.rotation.x = -rL / o.rw * o.a; gR.g.rotation.x = rR / o.rw * o.a;   // rolling without slipping on the floor
    o.ax.scale.y = rL + rR - o.w - 27.5; o.ax.position.x = (rR - rL) / 2;
    var rpm = S.playing ? S.rpm : 0;
    function f(v) { return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + " rpm"; }
    S.set("s", f(rpm / 2)); S.set("l", f(-rpm / 2 * rL / o.rw)); S.set("r", f(rpm / 2 * rR / o.rw));
  }
});
