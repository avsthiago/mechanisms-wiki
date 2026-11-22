M507.define({
  number: 175,
  title: "One turn for each stroke",
  lede: "The piston of an engine pushes a rod to and fro. Each push, in or out, is one stroke. This linkage turns a shaft exactly once for every stroke. A plain crank would turn it only once for every two strokes.",
  alt: "A tall frame with a slotted tower on the right. A crank arm turns at the upper left, and a faint dotted circle shows the path of its pin. A rod runs from the pin down to a block that slides up and down in a guide on the right. Behind the frame, a big gear and a small gear with a red arm join the two.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Big crank", note: "A big gear behind the frame with an arm in front. The pin on the arm goes round the dotted circle. The rod pushes it. It turns once for every two strokes." },
    { key: "crank", color: "#C8873A", name: "Small crank", note: "A small gear behind the frame with a red arm on its back. It has half as many teeth, so it turns twice as fast. Watch the red arm. It turns once for each stroke." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "A flat bar from the pin on the big crank to the sliding block. It swings a little as the crank turns." },
    { key: "block", color: "#4FA58A", name: "Piston block", note: "The block stands for the end of the piston rod. It can only slide up and down in the slot of the tall tower." }
  ],
  controls: [],
  readouts: [{ id: "st", label: "Strokes" }, { id: "cr", label: "Crank" }],
  views: { front: [25, -50, 1250], "3d": [450, 20, 1250], side: [1150, -50, 0] },
  target: [25, -50, 0],
  how: [
    "The block goes up and down. The rod turns the big crank. Two gears behind the frame, one big and one small, join the big crank to the small red one. Look at them from the 3d view.",
    "The big gear has twice as many teeth as the small one, so the small crank goes round twice for each turn of the big one. The big crank turns once for each two strokes. So the small red crank turns once for each stroke.",
    "Watch the readouts. Each time the block reaches the top or the bottom, the stroke count goes up by one. The crank count goes up by one at the same time."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows one crank, a dotted circle, a rod and a slot. He does not show how one turn per stroke is got. The two gears behind the frame, which double the turns, are made up. So are the small red crank, the base, the window panel and all the sizes. The slot is cut in the tower as drawn. The rod is longer and the slot closer than drawn, so that the rod can reach the pin all the way round.",

  K: { MD: 4, RP: 88, XG: 150, L: 260, TH0: -52 * Math.PI / 180, NS: 22, NB: 44 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, MD = K.MD, o = this.o = { phi: 0 };
    var pb = 2 * Math.PI / K.NB, ps = 2 * Math.PI / K.NS;
    o.g0 = K.TH0 + 31 * pb;                                                    // direction of small gear: 201.6 deg, on a big tooth
    var rc = 88 + 44;                                                           // 44 teeth * 2 + 22 * 2, pitch radii 88 + 44 = 132 / 2 ... see below
    rc = K.NB * MD / 2 + K.NS * MD / 2;                                         // 88 + 44 = 132
    o.bx = rc * Math.cos(o.g0); o.by = rc * Math.sin(o.g0);
    // big crank: gear z -52..-40 behind the plate, shaft z -52..-30, arm and pin in front
    o.big = new T.Group(); scene.add(o.big);
    P.at(P.spurGear({ teeth: K.NB, module: MD, width: 12, material: c.mat("wheel") }), 0, 0, -46, o.big);
    P.at(P.cylZ(6, 23, c.mat("wheel")), 0, 0, -40.5, o.big);                      // shaft z -52..-30
    P.at(P.cylZ(14, 6, c.mat("wheel")), 0, 0, -27, o.big);                      // hub z -30..-24
    P.at(P.box(K.RP, 12, 6, c.mat("wheel")), K.RP / 2, 0, -27, o.big);          // arm x 0..88, z -30..-24, on the plate face
    P.at(P.cylZ(6, 32, c.mat("rod")), K.RP, 0, -8, o.big);                      // pin z -24..8
    P.at(P.cylZ(8, 2, c.mat("rod")), K.RP, 0, 9, o.big);                        // cap z 8..10
    o.big.rotation.z = K.TH0;
    // small crank on its own axis: gear z -52..-40, shaft through the plate, red arm in front
    o.sm = new T.Group(); o.sm.position.set(o.bx, o.by, 0); scene.add(o.sm);
    P.at(P.spurGear({ teeth: K.NS, module: MD, width: 12, material: c.mat("crank") }), 0, 0, -46, o.sm);
    P.at(P.cylZ(6, 17.5, c.mat("crank")), 0, 0, -48.75, o.sm);                       // shaft z -58..-40, from the plate back
    P.at(P.box(40, 10, 6, c.mat("crank", "mark")), 16, 0, -55, o.sm);                   // arm x -4..36, z -58..-52, on the gear back face
    P.at(P.cylZ(7, 7, c.mat("crank", "dark")), 36, 0, -55, o.sm);               // tip knob
    // faint dotted circle: dashes lifted 2.8 off the plate face
    var N = 48, i, a;
    for (i = 0; i < N; i++) {
      a = i * 2 * Math.PI / N;
      var d = P.box(10, 1.6, 1, c.mat("wheel", "dark")); d.position.set(K.RP * Math.cos(a), K.RP * Math.sin(a), -27.2); d.rotation.z = a + Math.PI / 2; scene.add(d);
    }
    // rod: bar z 2..8
    o.rod = new T.Group(); scene.add(o.rod);
    o.bar = P.at(P.box(1, 12, 6, c.mat("rod")), 0, 0, 5, o.rod);
    P.at(P.cylZ(9, 6, c.mat("rod")), 0, 0, 5, o.rod);
    o.eye2 = P.at(P.cylZ(9, 6, c.mat("rod")), 0, 0, 5, o.rod);
    // piston block in the tower slot: slot x 138..162, walls z -40..-10; block z -38..-12
    o.head = new T.Group(); o.head.position.x = K.XG; scene.add(o.head);
    P.at(P.box(22, 20, 26, c.mat("block")), 0, 0, -25, o.head);                  // x +-11, z -38..-12, 1 off each slot side
    P.at(P.cylZ(5, 20.5, c.mat("block")), 0, 0, -1.75, o.head);                       // pin z -12..8
    P.at(P.cylZ(8, 2, c.mat("block")), 0, 0, 9, o.head);                         // cap z 8..10
    // frame: body x -150..120, y -350..130, z -40..-30; tower x 120..180, y -350..260, z -40..-10, slot x 138..162, y -330..220
    P.at(P.box(18, 610, 30, c.fixed), 129, -45, -25, scene);                     // tower left wall x 120..138, y -350..260
    P.at(P.box(18, 610, 30, c.fixed), 171, -45, -25, scene);                     // tower right wall x 162..180
    P.at(P.box(24, 40, 30, c.fixed), 150, 240, -25, scene);                      // top cap y 220..260
    P.at(P.box(24, 20, 30, c.fixed), 150, -340, -25, scene);                     // bottom cap y -350..-330
    P.at(P.box(270, 480, 10, c.fixed), -15, -110, -35, scene);                   // body x -150..120, y -350..130
    P.at(P.box(85, 175, 2, c.fixed), 67.5, -147.5, -28.5, scene);                  // window panel x 25..110, y -235..-60, z -30..-28, on the plate face
    P.at(P.box(390, 12, 100, c.fixed), 25, -356, -45, scene);                    // base x -170..220, y -362..-350, z -95..5; walls stand on y -350
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    o.phi += S.w * dt;
    var phi = o.phi, th = K.TH0 + phi;
    o.big.rotation.z = th;
    o.sm.rotation.z = o.g0 + Math.PI - Math.PI / K.NS - 2 * phi + 0;           // gap faces the big gear at the start, then turns twice as fast the other way
    var px = K.RP * Math.cos(th), py = K.RP * Math.sin(th);
    var dx = K.XG - px, ys = py - Math.sqrt(K.L * K.L - dx * dx), psi = Math.atan2(ys - py, dx);
    o.rod.position.set(px, py, 0); o.rod.rotation.z = psi;
    o.bar.scale.x = K.L + 22; o.bar.position.x = (K.L - 22) / 2; o.eye2.position.x = K.L;
    o.head.position.y = ys;
    var turns = phi / Math.PI, strokes = Math.floor(turns + 1e-6);
    S.set("st", Math.max(0, strokes) + (strokes === 1 ? " stroke" : " strokes"));
    S.set("cr", (Math.round(turns * 10) / 10).toFixed(1) + " turns");
  }
});
