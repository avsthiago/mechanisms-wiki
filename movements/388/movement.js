M507.define({
  number: 388,
  title: "Planing machine feed rollers",
  lede: "A board is pulled through a planing machine between two rollers. The smooth roller below holds it up. The toothed roller above bites into it and pushes it along.",
  alt: "A long board between two rollers. The lower roller is big and smooth. The upper roller has teeth round its rim and presses on the top of the board.",
  parts: [
    { key: "lower", color: "#5E7387", name: "Smooth roller", note: "A big smooth roller under the board. It is turned by the machine and carries the board forward. Watch the red stripe on its face." },
    { key: "upper", color: "#C8873A", name: "Toothed roller", note: "A smaller roller with teeth. It presses down on the board and its teeth grip the wood. The board turns it." },
    { key: "board", color: "#4FA58A", name: "Board", note: "The wood being fed in. It moves to the right. The red mark on its face travels with it." }
  ],
  controls: [{ id: "t", label: "Board thickness", value: "28", options: [["16", "Thin"], ["28", "Medium"], ["44", "Thick"]] }],
  readouts: [{ id: "bd", label: "Board" }, { id: "lo", label: "Smooth roller" }, { id: "up", label: "Toothed roller" }],
  views: { "3d": [374, 205, 803], front: [0, 10, 920], side: [920, 10, 0] },
  target: [0, 0, 0],
  distance: [150, 2000],
  how: [
    "The board slides to the right between the two rollers. The smooth roller turns clockwise under it. The toothed roller turns the other way above it. Both rollers touch the board.",
    "The smooth roller is driven, so it pushes the board along by rubbing against it. The teeth of the upper roller dig into the wood, so they cannot slip. The board turns the toothed roller. The toothed roller is smaller, so it spins faster than the smooth one.",
    "Try a thin board and then a thick one. The upper roller rides up on the thick board, so it always presses on the wood. The speeds of the rollers do not change."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows only the rollers and the board. The side plates that hold the shafts were added, and the spring or weight that presses the toothed roller down is left out. The teeth only touch the board here. In a real machine they dig in a little. The board is drawn long and the marks on it show it moving.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { a: 0, s: 0, thick: 0, RL: 90, TOOTH: 22 };
    var mb = c.mat("board");
    o.low = new T.Group(); o.low.position.y = -o.RL; scene.add(o.low);
    P.at(P.cylZ(o.RL, 120, c.mat("lower")), 0, 0, 0, o.low);              // z -60..60
    P.at(P.cylZ(10, 144, c.mat("lower", "dark")), 0, 0, 0, o.low);         // shaft z -72..72
    P.at(P.cylZ(22, 1, c.mat("lower", "dark")), 0, 0, 60.7, o.low);
    P.at(P.box(66, 6, 1, c.mat("lower", "mark")), 44, 0, 61.4, o.low);     // red stripe, hub to rim
    o.up = new T.Group(); scene.add(o.up);
    o.gear = P.spurGear({ teeth: o.TOOTH, module: 6.5, width: 120, material: c.mat("upper") });
    o.up.add(o.gear);                                                     // z -60..60
    o.ra = o.gear.pitchRadius + 6.5; o.rp = o.gear.pitchRadius;
    P.at(P.cylZ(10, 144, c.mat("upper", "dark")), 0, 0, 0, o.up);
    P.at(P.cylZ(18, 1, c.mat("upper", "dark")), 0, 0, 60.7, o.up);
    P.at(P.box(50, 5, 1, c.mat("upper", "dark")), 30, 0, 61.4, o.up);
    // board and its marks
    o.board = P.at(P.box(1, 1, 110, mb), 0, 0, 0, scene);                 // x -340..340, z -55..55
    o.ticks = new T.Group(); scene.add(o.ticks);
    o.tk = [];
    for (var i = -7; i <= 7; i++) { var tk = P.box(3, 1, 1.5, c.mat("board", "dark")); tk.position.set(i * 50, 0, 56); o.ticks.add(tk); o.tk.push(tk); }
    o.red = P.at(P.box(8, 1, 1.5, c.mat("board", "mark")), 0, 0, 57, scene);
    // arrow
    var dk = c.mat("board", "dark");
    P.at(P.box(60, 3, 3, dk), -190, -16, 0, scene);
    var cone = new T.Mesh(new T.ConeGeometry(7, 18, 16), dk); cone.rotation.z = -Math.PI / 2; P.at(cone, -151, -16, 0, scene);
    // side plates, fixed: z 72..84 and -84..-72
    [78, -78].forEach(function (z) { P.at(P.box(24, 330, 12, c.fixed), 0, 10, z, scene); });   // x -12..12, y -155..175
  },

  step: function (c, dt, S) {
    var o = this.o, T = +S.controls.t, v = S.w * o.RL, rpm = S.playing ? S.rpm : 0;
    o.s += v * dt;
    o.low.rotation.z -= S.w * dt;                                          // clockwise: top of the roller moves right
    o.up.rotation.z += v / o.rp * dt;                                      // the board turns it the other way
    o.up.position.y = T + o.ra;                                            // teeth tips just touch the top of the board
    o.board.scale.set(680, T, 1); o.board.position.y = T / 2;
    o.ticks.position.set(o.s % 50, T / 2, 0); o.red.position.set(-300 + (o.s % 600), T / 2, 57);
    o.tk.forEach(function (k) { k.scale.y = T * .5; }); o.red.scale.y = T * .6;
    S.set("bd", Math.round(v * .3) + " cm/s");
    S.set("lo", Math.round(rpm) + " rpm");
    S.set("up", (Math.round(rpm * o.RL / o.rp) ? "-" : "") + Math.round(rpm * o.RL / o.rp) + " rpm");
  }
});
