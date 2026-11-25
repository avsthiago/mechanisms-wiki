M507.define({
  number: 166,
  title: "Crank and slotted rod",
  lede: "A disc turns a pin round in a circle. The pin sits in a long slot in the end of a rod. The rod pulls a mould to and fro, but at each end of the trip the pin slides along the slot and the mould waits. A brick press uses this to give the clay time to drop in.",
  alt: "A big round disc with a red pin near its edge. A flat rod lies across the disc with a rounded slotted loop around the pin, and runs right to a green mould on a table.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Crank disc and shaft", note: "A round disc on a shaft. It carries the pin, so the pin goes round in a circle when the disc turns." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The red pin fixed on the disc. Watch it slide along the slot at each end of the trip." },
    { key: "rod", color: "#C8873A", name: "Slotted rod", note: "A rod with a long slot in its end. The pin pulls or pushes it only when it reaches an end of the slot. In between, the rod waits." },
    { key: "mould", color: "#4FA58A", name: "Brick mould", note: "The block at the far end of the rod. It slides on a table and stands still at each end of its trip." }
  ],
  controls: [{ id: "w", label: "Slot length", value: "23", options: [["10", "Short"], ["23", "As drawn"], ["45", "Long"]] }],
  readouts: [{ id: "x", label: "Mould position" }, { id: "s", label: "Stroke" }],
  views: { "3d": [497, 170, 773], front: [150, -20, 800], side: [950, 0, 0] },
  target: [150, -20, 0],
  how: [
    "The disc turns and the red pin goes round in a circle. The rod has a long slot in its end, and the pin sits in it. The far end of the rod is pinned to a mould that slides on a table.",
    "Near the middle of the trip the pin presses on an end of the slot and drags the rod and mould along. Near each end of the trip the pin is moving across more than along, so it just slides down the slot and the mould stands still. In a brick press the mould waits at one end while clay drops in, and at the other while the brick is taken out.",
    "Try Short, then Long. A short slot gives a long trip and short rests. A long slot gives a short trip and long rests. Watch the stroke reading change between Moving and Resting."
  ],
  note: "This model is rebuilt from Brown's drawing. The table, the mould, the plate behind the disc and all the sizes were made up. The short and long slots were added for comparison.",

  K: { R: 50, PR: 9, TH0: 144 * Math.PI / 180, L1: 300, Y0: 12 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i;
    var o = this.o = { a: K.TH0, X: 0, moving: false, heads: {} };
    // disc: shaft z -35..-14, disc z -20..-8, hub z -8..-1; rod z 0..10; mould and table z -30..-1 behind the rod
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(10, 21, c.mat("disc")), 0, 0, -24.5, o.rot);                               // shaft z -35..-14, starts on the plate face
    P.at(P.cylZ(92, 12, c.mat("disc")), 0, 0, -14, o.rot);                                 // disc z -20..-8
    P.at(P.cylZ(18, 7, c.mat("disc")), 0, 0, -4.5, o.rot);                                 // hub z -8..-1 (rod is z 0..10)
    P.at(P.box(K.R - 18, 6, .8, c.mat("disc", "dark")), 18 + (K.R - 18) / 2, 0, -7.6, o.rot);   // stripe x 18..50 on the disc face, z -8..-7.2
    for (i = 0; i < 40; i++) {                                                             // dotted orbit of the pin, as Brown draws it, lifted 0.8 off the disc face
      var q = i / 40 * 2 * Math.PI, dt2 = P.at(P.box(3.4, 1.4, .8, c.mat("disc", "dark")), K.R * Math.cos(q), K.R * Math.sin(q), -7.6, o.rot);
      dt2.rotation.z = q + Math.PI / 2;
    }
    o.pin = new T.Group(); scene.add(o.pin);
    P.at(P.cylZ(K.PR, 22, c.mat("pin", "mark")), 0, 0, 4, o.pin);                          // pin z -8..15, starts on the disc face
    P.at(P.cylZ(12, 3, c.mat("pin", "mark")), 0, 0, 15.5, o.pin);                          // cap z 14..17
    // rod: local origin at the mould pin, local +x towards the crank pin; one loop for each slot length, z 0..10
    o.rod = new T.Group(); scene.add(o.rod);
    ["10", "23", "45"].forEach(function (k) {
      var L2 = K.L1 + +k, a0 = K.L1 - K.PR, a1 = L2 + K.PR, r = K.PR + .5, ro = r + 11, sh = new T.Shape(), hole = new T.Path();
      // outer loop: a rounded slot shape round the pin; the bar runs into its near end
      sh.moveTo(a0, -ro); sh.lineTo(a1, -ro); sh.absarc(a1, 0, ro, -Math.PI / 2, Math.PI / 2, false); sh.lineTo(a0, ro); sh.absarc(a0, 0, ro, Math.PI / 2, 1.5 * Math.PI, false);
      hole.moveTo(a0, -r); hole.lineTo(a1, -r); hole.absarc(a1, 0, r, -Math.PI / 2, Math.PI / 2, false); hole.lineTo(a0, r); hole.absarc(a0, 0, r, Math.PI / 2, 1.5 * Math.PI, false);
      sh.holes.push(hole);
      var m = P.mesh(new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false, curveSegments: 16 }), c.mat("rod"));   // z 0..10
      o.rod.add(m); o.heads[k] = m;
    });
    P.at(P.box(K.L1 - K.PR - 18, 10, 9, c.mat("rod")), (K.L1 - K.PR - 18) / 2, 0, 5, o.rod);   // bar x 0..273, ends inside the loop (its near edge is at 300 - 9 - 20.5 = 270.5); z 0.5..9.5, inset so no face lies on the loop's
    P.at(P.cylZ(9, 10, c.mat("rod")), 0, 0, 5, o.rod);                                     // eye round the mould pin, z 0..10
    // mould: pinned to the rod end; its front face (z -1) is just behind the rod
    o.mould = new T.Group(); scene.add(o.mould);
    P.at(P.box(80, 40, 29, c.mat("mould")), 30, 0, -15.5, o.mould);                       // mould x -10..70 about the pin, y -20..20, z -30..-1
    P.at(P.cylZ(4, 13, c.mat("mould", "dark")), 0, 0, 5.5, o.mould);                      // pin z -1..12, from the mould face through the eye
    // supports (fixed)
    P.at(P.box(600, 10, 90, c.fixed), 170, -137, -5, scene);                               // base x -130..470, y -142..-132, z -50..40
    P.at(P.box(100, 162, 10, c.fixed), 0, -51, -40, scene);                                // plate x -50..50, y -132..30, z -45..-35
    P.at(P.box(260, 124, 29, c.fixed), 345, -70, -15.5, scene);                            // table x 215..475, y -132..-8 (mould bottom is Y0 - 20 = -8), z -30..-1
    this.solve(23, true);
  },

  // the mould moves only when the pin reaches an end of the slot: |pin - mould pin| stays within L1..L2
  solve: function (f, start) {
    var o = this.o, K = this.K, px = K.R * Math.cos(o.a), py = K.R * Math.sin(o.a), dy = py - K.Y0, L2 = K.L1 + f;
    var d = Math.hypot(px - o.X, dy);
    if (start || d > L2) o.X = px + Math.sqrt(L2 * L2 - dy * dy);                         // as drawn: the pin at the far end of the slot
    else if (d < K.L1) o.X = px + Math.sqrt(K.L1 * K.L1 - dy * dy);
    this.px = px; this.py = py;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, f = +(S.controls.w || 23), k, prev = o.X;
    o.a += S.w * dt;
    this.solve(f, false);
    if (dt > 0) o.moving = Math.abs(o.X - prev) > 1e-9;
    o.rot.rotation.z = o.a;
    o.pin.position.set(this.px, this.py, 0);
    o.rod.position.set(o.X, K.Y0, 0); o.rod.rotation.z = Math.atan2(this.py - K.Y0, this.px - o.X);
    o.mould.position.set(o.X, K.Y0, 0);
    for (k in o.heads) o.heads[k].visible = k === String(f);
    var v = Math.round(o.X - 300);
    S.set("x", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm");
    S.set("s", o.moving ? "Moving" : "Resting");
  }
});
