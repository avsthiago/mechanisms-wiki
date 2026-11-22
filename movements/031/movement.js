M507.define({
  number: 31,
  title: "Worm and worm wheel",
  lede: "A screw on a level shaft turns a toothed wheel just below it. Each turn of the screw moves the wheel on by only one tooth. It turns a fast shaft into a very slow and strong one, at right angles to it.",
  alt: "A big upright gear seen face on. Above it, a short screw on a level shaft sits with its thread in a gap between the top teeth. A crank turns the screw, and one tooth of the wheel is red.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Worm", note: "A short screw fixed on the level shaft, also called an endless screw. Watch the red stripe on its shaft to count its turns." },
    { key: "wheel", color: "#C8873A", name: "Worm wheel", note: "A gear, called a worm wheel, whose top teeth sit in the worm's thread. Watch the red tooth creep round, one tooth for each turn of the worm." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the worm. In a real machine an engine would do this." }
  ],
  controls: [{ id: "starts", label: "Worm", value: "1", options: [["1", "One thread"], ["2", "Two threads"]] }],
  readouts: [{ id: "in", label: "Worm" }, { id: "out", label: "Wheel" }],
  views: { "3d": [250, 180, 500], front: [0, 10, 620], side: [620, 10, 0] },
  target: [0, 10, 0],
  how: [
    "Turn the crank and the screw, called a worm, spins on its shaft. Its thread seems to slide sideways along the shaft. The thread sits in a gap between two teeth of the wheel, so it pushes a tooth along.",
    "In one turn of the worm, the thread moves along by the gap from one thread to the next. That gap is the same as the gap from one tooth to the next. So one turn moves the wheel on by one tooth. The wheel cannot turn the worm back, because pushing a tooth only jams it against the thread.",
    "Some worms have two threads wound side by side. Then each turn moves the wheel on by two teeth, so it goes twice as fast. Try One thread, then Two threads, and watch the red tooth."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the plate and bearings that hold the shafts, the sizes and the number of teeth were made up. The wheel has plain straight teeth, as drawn. A real worm wheel has slanted, hollowed teeth so the thread presses along the whole tooth. The worm with two threads was added for comparison.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N = 30, PITCH = Math.PI * MD, RW = 18;
    var o = this.o = { a: 0, wa: 0, N: N, worms: {} };
    // worm wheel: gear z -8..8, centre at the origin
    o.wheel = new T.Group(); scene.add(o.wheel);
    var g = P.spurGear({ teeth: N, module: MD, material: c.mat("wheel") }); o.wheel.add(g);
    var rp = g.pitchRadius;                                                     // 90
    o.base = Math.PI / 2 - g.pitch / 2;                                         // a tooth gap at the top, under the worm
    P.at(P.cylZ(6, 38, c.mat("wheel")), 0, 0, -11, o.wheel);                    // shaft z -30..8, plate face to gear face
    P.at(P.cylZ(14, 4, c.mat("wheel")), 0, 0, 10, o.wheel);                     // hub z 8..12, on the gear face
    P.at(P.cylZ(6.5, 1.5, c.mat("wheel", "dark")), 0, 0, 12.25, o.wheel);       // shaft end z 11.5..13, sunk 0.5 into the hub
    var mk = new T.Group(); mk.rotation.z = (N - 7) * g.pitch; o.wheel.add(mk); // tooth 23, at 3 o'clock at the start
    [-1, 1].forEach(function (k) { P.at(P.box(10, .2 * PITCH, 1, c.mat("wheel", "mark")), rp - 1, 0, k * 9, mk); });   // red tooth, r 84..94, z 8.5..9.5 off each face

    // worms: axis along X at y = rp + RW = 108, z = 0; one for each thread count, only one shown at a time
    [1, 2].forEach(function (s) {
      var w = new T.Group(); w.position.set(0, rp + RW, 0); scene.add(w);
      w.thread = P.at(P.worm({ radius: RW, pitch: PITCH, length: 76, starts: s, material: c.mat("worm") }), 0, 0, 0, w);   // x -38..38, tip r 24, root r 10.5
      P.at(P.cylX(6, 260, c.mat("worm")), 0, 0, 0, w);                          // shaft x -130..130, bearing face to bearing face
      [-1, 1].forEach(function (k) { P.at(P.box(70, 1, 3, c.mat("worm", "mark")), k * 78, 7, 0, w); });   // red stripes x 43..113, y 6.5..7.5, lifted off the shaft
      P.at(P.box(6, 32, 10, c.mat("crank")), -121, 11, 0, w);                   // crank arm x -124..-118, y -5..27 (sweeps r 27.5, plate is 30 away)
      P.at(P.cylX(4, 20, c.mat("crank")), -108, 22, 0, w);                      // handle x -118..-98, on the arm face
      o.worms[s] = w;
    });

    // supports
    [-1, 1].forEach(function (k) { P.at(P.box(20, 24, 42, c.fixed), k * 140, rp + RW, -9, scene); });   // bearings x 130..150, y 96..120, z -30..12; shaft ends at x ±130
    P.at(P.box(340, 280, 10, c.fixed), 0, -10, -35, scene);                     // plate x -170..170, y -150..130, z -40..-30; bearings and wheel shaft end at z -30
    P.at(P.box(380, 12, 100, c.fixed), 0, -156, -30, scene);                    // base x -190..190, y -162..-150, z -80..20; plate stands on y -150
  },

  step: function (c, dt, S) {
    var o = this.o, s = +S.controls.starts || 1, k;
    o.a += S.w * dt; o.wa += S.w * dt * s / o.N;           // the thread moves one tooth per turn for each thread it has
    for (k in o.worms) {
      var w = o.worms[k]; w.visible = +k === s; w.rotation.x = o.a;
      w.thread.rotation.x = o.N * o.wa / +k - o.a;          // thread phase kept in step with the wheel, so switching worms never jumps the wheel
    }
    o.wheel.rotation.z = o.base + o.wa;
    function f(v) { return Math.round(v * 100) / 100 + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm * s / o.N));
  }
});
