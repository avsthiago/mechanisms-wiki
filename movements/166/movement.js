M507.define({
  number: 166,
  title: "Crank and slotted rod",
  lede: "A disc turns a pin round in a circle. The pin sits in a wide slot in the head of a rod. The rod slides to and fro, but it stops at the end of each stroke while the pin crosses the slot. A brick press uses this to give the clay time to drop in.",
  alt: "A big round disc with a red pin near its middle. A flat rod lies in front of it, with a tall slotted head at its left end. The pin sits in the slot. The rod runs right to a green block resting on a table.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Crank disc and shaft", note: "A round disc on a shaft. It carries the pin, so the pin goes round in a circle when the disc turns." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The red pin fixed on the disc. Watch it. It travels round in a circle and crosses the slot from side to side." },
    { key: "rod", color: "#C8873A", name: "Slotted rod", note: "A flat rod with a wide slot in its head. The pin pushes the rod only when it meets a side of the slot. In between, the rod rests." },
    { key: "mould", color: "#4FA58A", name: "Brick mould", note: "The block at the far end of the rod. It slides on a table and stands still at each end of its trip." }
  ],
  controls: [{ id: "w", label: "Slot width", value: "25", options: [["12", "Narrow"], ["25", "Medium"], ["38", "Wide"]] }],
  readouts: [{ id: "x", label: "Rod position" }, { id: "s", label: "Stroke" }],
  views: { "3d": [430, 190, 760], front: [190, -30, 780], side: [900, 0, 0] },
  target: [170, -30, 0],
  how: [
    "The disc turns and the red pin goes round in a circle. The pin sits in a wide slot in the rod. When the pin touches a side of the slot, it pushes the rod along. When it is in the middle of the slot, it just slides across and the rod does not move.",
    "So the rod moves, then rests, then moves back, then rests. It rests at both ends of its trip. In a brick press the mould waits at one end while clay drops in, and waits at the other end while the brick is taken out.",
    "Try Narrow, then Wide. A narrow slot gives a long trip and short rests. A wide slot gives a short trip and long rests. Watch the stroke reading change between Moving and Resting."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the slot lying along the rod. Here the slot is tall and runs across the rod, because that is the only shape that lets a pin going round a full circle push the rod and then leave it at rest. The rod runs through a made-up guide and its mould slides on the table. The shaft, the plate, the table, the base and all the sizes were made up. The other slot widths were added for comparison.",

  K: { R: 50, PR: 7, TH0: 148 * Math.PI / 180 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { a: K.TH0, d: 0, moving: false, heads: {} };
    // disc: shaft z -35..-14, disc z -20..-8, hub z -8..-1
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(10, 21, c.mat("disc")), 0, 0, -24.5, o.rot);                               // shaft z -35..-14, starts on the plate face
    P.at(P.cylZ(92, 12, c.mat("disc")), 0, 0, -14, o.rot);                                 // disc z -20..-8
    P.at(P.cylZ(18, 7, c.mat("disc")), 0, 0, -4.5, o.rot);                                 // hub z -8..-1 (rod is z 0..10)
    P.at(P.box(K.R - 18, 6, .8, c.mat("disc", "dark")), 18 + (K.R - 18) / 2, 0, -7.6, o.rot);   // stripe x 18..50 on the disc face, z -8..-7.2
    for (var i = 0; i < 40; i++) {                                                         // faint dotted orbit of the pin, lifted 0.8 off the disc face
      var q = i / 40 * 2 * Math.PI, dt2 = P.at(P.box(3.4, 1.4, .8, c.mat("disc", "dark")), K.R * Math.cos(q), K.R * Math.sin(q), -7.6, o.rot);
      dt2.rotation.z = q + Math.PI / 2;
    }
    var pin = new T.Group(); scene.add(pin); o.pin = pin;
    P.at(P.cylZ(K.PR, 22, c.mat("pin", "mark")), 0, 0, 4, pin);                          // pin z -8..15, starts on the disc face
    P.at(P.cylZ(10, 3, c.mat("pin", "mark")), 0, 0, 15.5, pin);                            // cap z 14..17
    // rod: local origin at the slot centre; heads for three slot widths, z 0..10
    o.rod = new T.Group(); scene.add(o.rod);
    ["12", "25", "38"].forEach(function (k) {
      var s = +k + K.PR, W = s + 14, H = 76, sh = new T.Shape(), hole = new T.Path();
      sh.moveTo(-W, -H); sh.lineTo(W, -H); sh.lineTo(W, H); sh.lineTo(-W, H); sh.lineTo(-W, -H);
      hole.moveTo(-s, -62); hole.lineTo(-s, 62); hole.lineTo(s, 62); hole.lineTo(s, -62); hole.lineTo(-s, -62); sh.holes.push(hole);
      var g = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false });                 // head z 0..10, slot half height 62
      var m = P.mesh(g, c.mat("rod")); o.rod.add(m); o.heads[k] = { mesh: m, W: W };
    });
    o.bar = P.at(P.box(1, 16, 9, c.mat("rod")), 0, 0, 5, o.rod);                           // bar y +-8, z 0.5..9.5, from the head edge to x 330
    P.at(P.box(70, 40, 30, c.mat("mould")), 335, 0, 5, o.rod);                             // mould x 300..370, y -20..20, z -10..20
    // guide for the rod: back wall z -10..-0.5, lower and upper rails z -0.5..10.5, x 140..190
    P.at(P.box(50, 40, 9.5, c.fixed), 165, 0, -5.25, scene);                               // y -20..20, sits on the table top (y -20)
    P.at(P.box(50, 11, 11, c.fixed), 165, -14.5, 5, scene);                                // y -20..-9, rod bottom is -8
    P.at(P.box(50, 11, 11, c.fixed), 165, 14.5, 5, scene);                                 // y 9..20, rod top is 8
    // supports (fixed)
    P.at(P.box(600, 10, 90, c.fixed), 170, -137, -5, scene);                               // base x -130..470, y -142..-132, z -50..40
    P.at(P.box(100, 162, 10, c.fixed), 0, -51, -40, scene);                                // plate x -50..50, y -132..30, z -45..-35
    P.at(P.box(370, 112, 30, c.fixed), 285, -76, 5, scene);                                // table x 100..470, y -132..-20, z -10..20
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, a = +(S.controls.w || 25), R = K.R, k, prev = o.d;
    o.a += S.w * dt;
    var px = R * Math.cos(o.a), py = R * Math.sin(o.a);
    o.d = Math.min(Math.max(o.d, px - a), px + a);                                         // the pin pushes only when it meets a wall
    if (dt > 0) o.moving = Math.abs(o.d - prev) > 1e-9;
    o.rot.rotation.z = o.a;
    o.pin.position.set(px, py, 0);
    o.rod.position.set(o.d, 0, 0);
    for (k in o.heads) o.heads[k].mesh.visible = k === String(a);
    var W = (o.heads[String(a)] || o.heads["25"]).W;
    o.bar.scale.x = 332 - W; o.bar.position.x = W - 2 + (332 - W) / 2;
    var v = Math.round(o.d);
    S.set("x", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm");
    S.set("s", o.moving ? "Moving" : "Resting");
  }
});
