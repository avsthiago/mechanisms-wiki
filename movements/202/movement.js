M507.define({
  number: 202,
  title: "Worm and wheel for heavy work",
  lede: "A long screw lies under a big wheel that has many fine teeth. Several threads of the screw press on several teeth at once. The load is shared, so the wheel turns very slowly, very smoothly and with great strength.",
  alt: "A big upright wheel with very many fine teeth, seen face on. Under it a long screw on a level shaft has its thread in the teeth along the bottom. One tooth of the wheel is red.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Worm", note: "A long screw on a level shaft, also called an endless screw. Its many threads sit in many teeth at once. Watch the red stripes on its shaft to count turns." },
    { key: "wheel", color: "#C8873A", name: "Worm wheel", note: "A big wheel with very fine teeth. Watch the red tooth creep round, a tiny step for each turn of the worm." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the worm. In a real machine an engine would do this." }
  ],
  controls: [{ id: "starts", label: "Worm", value: "1", options: [["1", "One thread"], ["2", "Two threads"]] }],
  readouts: [{ id: "in", label: "Worm" }, { id: "out", label: "Wheel" }],
  views: { "3d": [230, 125, 470], front: [0, -10, 640], side: [620, -10, 0] },
  target: [0, -15, 0],
  how: [
    "Turn the crank and the long screw, called a worm, spins on its shaft. Its thread seems to slide sideways along the shaft. Here the thread is fine and the worm is long, so about ten threads sit in ten teeth of the wheel at the same moment.",
    "One turn of the worm moves the wheel on by just one tooth. Because many teeth carry the push together, each one takes only a small share. That is why this kind of worm is used when the work is heavy, or when the wheel must turn steadily.",
    "Some worms have two threads wound side by side. Then each turn moves the wheel on by two teeth, so it goes twice as fast. Try One thread, then Two threads, and watch the red tooth."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the plate and bearings that hold the shafts, the sizes and the number of teeth were made up. The wheel has plain straight teeth. A real wheel of this kind has its teeth hollowed round the worm so the screw wraps around it. The worm with two threads was added for comparison.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 3, N = 64, PITCH = Math.PI * MD, RW = 30;
    var o = this.o = { a: 0, wa: 0, N: N, worms: {} };
    // worm wheel: gear z -6..6, centre at the origin
    o.wheel = new T.Group(); scene.add(o.wheel);
    var g = P.spurGear({ teeth: N, module: MD, width: 12, material: c.mat("wheel") }); o.wheel.add(g);
    var rp = g.pitchRadius; o.st = g.pitch;                                      // 96
    P.at(P.cylZ(8, 36, c.mat("wheel")), 0, 0, -12, o.wheel);                    // shaft z -30..6, plate face to gear face
    P.at(P.cylZ(26, 4, c.mat("wheel")), 0, 0, 8, o.wheel);                      // hub ring z 6..10, on the gear face
    P.at(P.cylZ(14, 1.5, c.mat("wheel", "dark")), 0, 0, 10.25, o.wheel);        // shaft end z 9.5..11, sunk 0.5 into the hub
    var mk = new T.Group(); mk.rotation.z = 16 * g.pitch; o.wheel.add(mk);      // tooth 16, at 3 o'clock at the start
    P.at(P.box(10, .2 * PITCH, 1, c.mat("wheel", "mark")), rp - 1, 0, 6.5 + .5, mk);   // red tooth, r 91..101, z 6.5..7.5 off the face z 6

    // worms: axis along X at y = -(rp + RW) = -126, z = 0
    [1, 2].forEach(function (s) {
      var w = new T.Group(); w.position.set(0, -(rp + RW), 0); scene.add(w);
      w.thread = P.at(P.worm({ radius: RW, pitch: PITCH, length: 100, starts: s, material: c.mat("worm") }), 0, 0, 0, w);   // x -50..50, tip r 33, root r 26
      P.at(P.cylX(8, 260, c.mat("worm")), 0, 0, 0, w);                          // shaft x -130..130, bearing face to bearing face
      [-1, 1].forEach(function (k) { P.at(P.box(60, 1, 3, c.mat("worm", "mark")), k * 90, 9, 0, w); });   // red stripes x 60..120, y 8.5..9.5, lifted off the shaft top y 8
      P.at(P.box(6, 32, 10, c.mat("crank")), -121, 11, 0, w);                   // crank arm x -124..-118, y -5..27
      P.at(P.cylX(4, 20, c.mat("crank")), -108, 22, 0, w);                      // handle x -118..-98, on the arm face
      o.worms[s] = w;
    });

    // supports
    [-1, 1].forEach(function (k) { P.at(P.box(20, 24, 42, c.fixed), k * 140, -(rp + RW), -9, scene); });   // bearings x 130..150, y -138..-114, z -30..12; shaft ends at x +-130
    P.at(P.box(340, 270, 10, c.fixed), 0, -15, -35, scene);                     // plate x -170..170, y -150..120, z -40..-30; bearings and wheel shaft end at z -30
    P.at(P.box(380, 12, 100, c.fixed), 0, -156, -30, scene);                    // base x -190..190, y -162..-150, z -80..20; plate stands on y -150
  },

  step: function (c, dt, S) {
    var o = this.o, s = +S.controls.starts || 1, k;
    o.a += S.w * dt; o.wa += S.w * dt * s / o.N;
    for (k in o.worms) {
      var w = o.worms[k]; w.visible = +k === s; w.rotation.x = o.a;
      w.thread.rotation.x = o.N * o.wa / +k - o.a;
    }
    o.wheel.rotation.z = -Math.PI / 2 + (s === 2 ? o.st / 2 : 0) - o.wa;       // worm is under the wheel; wheel turns clockwise
    function f(v) { return Math.round(v * 100) / 100 + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm * s / o.N));
  }
});
