M507.define({
  number: 104,
  title: "Worm, wheel and slide",
  lede: "A long screw, called a worm, lies across the top of a gear. Turn the worm and the gear turns slowly. Turn the gear instead and it walks along the worm, carrying its slide with it. This is how lathes move a cutting tool in small, exact steps.",
  alt: "A long horizontal screw held at both ends. Under it, a toothed wheel with a red tooth stands on an upright post. The post is fixed to a block that can slide along a long bed marked with short lines.",
  parts: [
    { key: "screw", color: "#5E7387", name: "Worm", note: "A long screw with a hand wheel on one end. Its thread sits in the gaps between the teeth of the worm wheel." },
    { key: "wheel", color: "#C8873A", name: "Worm wheel", note: "A gear under the worm. Watch the red tooth to see how far it has turned." },
    { key: "slide", color: "#D9B13B", name: "Slide", note: "A block with a post that holds the wheel. It runs along the bed. The red pointer shows where it is on the marks." }
  ],
  controls: [{ id: "drive", label: "Turn", value: "screw", options: [["screw", "The worm"], ["wheel", "The worm wheel"]] }],
  readouts: [{ id: "in", label: "Worm" }, { id: "wh", label: "Worm wheel" }, { id: "sl", label: "Slide" }],
  speed: { min: 1, max: 30, value: 12, label: "Turning speed", unit: " rpm" },
  views: { front: [0, -5, 640], "3d": [300, 160, 520], side: [560, 20, 0] },
  target: [0, -5, 0],
  how: [
    "Turn the worm. Its thread slides sideways under the worm wheel, and each thread pushes one tooth along. The worm wheel turns, but only one tooth for each turn of the worm. The slide does not move.",
    "Now turn the worm wheel instead. The worm cannot turn, so the worm wheel has to climb along its thread, like a gear rolling on a rack. The slide goes with it. One full turn of the worm wheel moves the slide the length of its rim.",
    "Try turning the worm, then the worm wheel, and watch the slide and the red tooth each time. When the slide reaches the end of the screw, the turning goes the other way."
  ],
  note: "This model is rebuilt from Brown's drawing. The bed, the two posts that hold the worm, the hand wheel, the marks on the bed, the sizes and the number of teeth were made up. Brown does not say which part is held still; here the slide is held when the worm turns, and the worm is held when the worm wheel turns. The worm wheel has plain straight teeth, as drawn. A real one has slanted, hollowed teeth.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N = 20, PITCH = Math.PI * MD, RW = 18, i;
    var o = this.o = { N: N, th: 0, x: 0, dir: 1, XM: 60 };
    var g = P.spurGear({ teeth: N, module: MD, material: c.mat("wheel") });
    var rp = o.rp = g.pitchRadius;                                              // 60
    o.L = PITCH;                                                                // lead, one thread
    o.base = Math.PI / 2 - g.pitch / 2;                                         // a tooth gap at the top, under the screw

    // slide: block, post and boss, moves along X
    var car = o.car = new T.Group(); scene.add(car);
    P.at(P.box(100, 16, 56, c.mat("slide")), 0, -92, 0, car);                   // block x -50..50, y -100..-84, z -28..28; stands on the bed top y -100
    P.at(P.box(36, 84, 10, c.mat("slide")), 0, -42, -17, car);                  // post x -18..18, y -84..0, z -22..-12; stands on the block top y -84
    P.at(P.cylZ(18, 12, c.mat("slide")), 0, 0, -17, car);                       // boss r 18, z -23..-11, wider than the post so no face is shared
    P.at(P.box(4, 12, 1, c.mat("slide", "mark")), 0, -92, 29, car);             // red pointer on the front, z 28.5..29.5, 0.5 off the face
    // wheel, turns on a shaft in the boss
    var wh = o.wheel = new T.Group(); P.at(wh, 0, 0, 0, car);
    wh.add(g);                                                                  // gear z -8..8
    P.at(P.cylZ(6, 19, c.mat("wheel")), 0, 0, -1.5, wh);                        // shaft z -11..8, boss face to gear face
    P.at(P.cylZ(14, 4, c.mat("wheel")), 0, 0, 10, wh);                          // hub z 8..12
    P.at(P.cylZ(6.5, 1.5, c.mat("wheel", "dark")), 0, 0, 12.25, wh);            // shaft end z 11.5..13
    var mk = new T.Group(); mk.rotation.z = (N - 5) * g.pitch; wh.add(mk);      // red tooth at 3 o'clock at the start
    [-1, 1].forEach(function (k) { P.at(P.box(10, .2 * PITCH, 1, c.mat("wheel", "mark")), rp - 1, 0, k * 9, mk); });   // r 54..64, z 8.5..9.5 off each face

    // screw: axis along X at y = 78, held in two posts
    var sc = o.screw = new T.Group(); sc.position.set(0, rp + RW, 0); scene.add(sc);
    P.at(P.worm({ radius: RW, pitch: PITCH, length: 300, material: c.mat("screw") }), 0, 0, 0, sc);   // x -150..150, tip r 24, root r 10.5
    P.at(P.cylX(6, 340, c.mat("screw")), 0, 0, 0, sc);                          // shaft x -170..170, post face to post face
    P.at(P.cylX(26, 6, c.mat("screw")), -160, 0, 0, sc);                        // hand wheel x -163..-157, r 26
    P.at(P.cylX(4, 6, c.mat("screw")), -166, 18, 0, sc);                        // knob x -169..-163, on the hand wheel face
    P.at(P.box(1, 22, 4, c.mat("screw", "mark")), -156, 14, 0, sc);             // red stripe x -156.5..-155.5, 0.5 off the hand wheel face

    // supports: bed and two posts, c.fixed
    P.at(P.box(400, 12, 60, c.fixed), 0, -106, 0, scene);                       // bed x -200..200, y -112..-100, z -30..30
    [-1, 1].forEach(function (k) { P.at(P.box(20, 190, 40, c.fixed), k * 180, -5, 0, scene); });   // posts x 170..190, y -100..90, z -20..20; stand on the bed top, screw shaft ends at x +-170
    for (i = -6; i <= 6; i++) P.at(P.box(1.5, i % 3 ? 8 : 14, 1, c.mat("slide", "dark")), i * 20, -106, 31, scene);   // marks every 20, z 30.5..31.5, 0.5 off the bed front
  },

  step: function (c, dt, S) {
    var o = this.o, mode = S.controls.drive, w = S.w, rpm = S.playing ? S.rpm : 0, rps = 0;
    if (mode === "wheel") {
      var ww = w / 6;                                                           // the wheel is turned slowly by hand
      if (o.x >= o.XM) o.dir = -1; else if (o.x <= -o.XM) o.dir = 1;
      var dth = o.dir * ww * dt;
      o.th += dth; o.x += o.rp * dth;                                           // the wheel rolls along the fixed thread
      o.x = Math.max(-o.XM, Math.min(o.XM, o.x));
      rps = o.dir * rpm / 6;
    } else {
      o.th += w * dt / o.N;                                                     // one tooth per turn of the screw
    }
    var psi = 2 * Math.PI / o.L * (o.rp * o.th - o.x);                          // screw angle that keeps the thread in the tooth gap
    o.car.position.x = o.x;
    o.wheel.rotation.z = o.base + o.th;
    o.screw.rotation.x = psi;
    function f(v) { return (v > 0 ? "" : v < 0 ? "-" : "") + Math.abs(Math.round(v * 100) / 100); }
    S.set("in", (mode === "wheel" ? "0" : f(rpm)) + " rpm");
    S.set("wh", f(o.th / (2 * Math.PI)) + " turns");
    S.set("sl", Math.round(o.x) + " mm");
  }
});
