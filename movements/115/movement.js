M507.define({
  number: 115,
  title: "Two pinions and a double rack",
  lede: "Two equal small gears, called pinions, sit one above the other, with their teeth locked together. A frame with teeth on its top and bottom edges surrounds them. When the pinions turn, both edges of the frame are pushed the same way, so the frame slides along evenly.",
  alt: "Two gears stacked one above the other, meshed together, inside an oval frame. The frame has teeth along its inner top and bottom edges, and each gear meshes with one of them. A handle on the upper gear rocks to and fro, and a red stripe marks each gear.",
  parts: [
    { key: "pin", color: "#5E7387", name: "Two pinions", note: "Two gears of the same size, locked together, so they turn opposite ways. Watch the red stripes." },
    { key: "rack", color: "#C8873A", name: "Double rack", note: "A frame with a row of teeth on its top edge and another on its bottom edge. Each row meshes with one pinion, and the whole frame slides sideways." },
    { key: "handle", color: "#D9B13B", name: "Handle", note: "Rocks the upper pinion to and fro. In a real machine an engine or a lever would do this." }
  ],
  controls: [{ type: "range", id: "swing", label: "How far the pinions turn", min: 0.1, max: 0.25, step: 0.05, value: 0.2, unit: " turns",
    presets: [[0.1, "Short"], [0.15, "Medium"], [0.25, "Long"]] }],
  readouts: [{ id: "turns", label: "Pinion" }, { id: "trav", label: "Rack" }],
  views: { front: [0, 0, 1000], "3d": [450, 230, 800], side: [900, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Rock the handle and the upper pinion turns. Its teeth push on the teeth of the lower pinion, so that one turns the opposite way. Each pinion pushes on its own row of teeth in the frame.",
    "The top of one pinion and the bottom of the other move in the same direction. So both rows of teeth are pushed the same way, with equal force and equal speed. The frame stays straight and does not twist. The red stripes show that the pinions turn opposite ways, and the minus sign in the readout means left.",
    "Try Short, then Medium, then Long. A longer turn of the pinions carries the frame further, in a straight line. Watch the frame and the readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the gears, the oval frame and short rod ends. The handle, the back post, the guides for the rod ends, the base, the sizes and the number of teeth were made up. The frame has rod ends so it can be guided. The pinions and the frame rock to and fro instead of turning round, and the choice of how far they turn was added.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, NP = 12, RP = NP * MD / 2, PI = Math.PI * MD;
    var o = this.o = { a: 0, A: 0.25, rp: RP, pitch: 2 * PI / NP };
    var yT = RP, yB = -RP;                                                   // pinion centres y 36 and -36, they touch at y 0
    // pinions: width z -8..8, shaft z -30 (plate face) to 8 or 30, red stripe on the front face
    o.g1 = new T.Group(); o.g1.position.set(0, yT, 0); scene.add(o.g1);
    o.g2 = new T.Group(); o.g2.position.set(0, yB, 0); scene.add(o.g2);
    [o.g1, o.g2].forEach(function (g) {
      g.add(P.spurGear({ teeth: NP, module: MD, width: 14, material: c.mat("pin") }));
      P.at(P.cylZ(10, 4, c.mat("pin")), 0, 0, 9, g);                          // hub z 7..11, on the gear face (gear z -7..7)
      P.at(P.box(RP - 1.25 * MD - 14, 4, 1, c.mat("pin", "mark")), 10 + (RP - 1.25 * MD - 14) / 2 + 3, 0, 8, g);   // stripe x 13..~22, z 7.5..8.5, lifted off the hub-level face z 7
    });
    P.at(P.cylZ(6, 60, c.mat("pin")), 0, 0, 0, o.g1);                         // upper shaft z -30..30, starts at the plate face
    P.at(P.cylZ(6, 38, c.mat("pin")), 0, 0, -11, o.g2);                       // lower shaft z -30..8, plate face to gear face
    P.at(P.box(52, 12, 6, c.mat("handle")), 22, 0, 33, o.g1);                 // arm x -4..48, z 30..36, on the shaft end
    P.at(P.cylZ(5, 24, c.mat("handle")), 44, 0, 48, o.g1);                    // handle z 36..60, on the arm face
    // frame: an oval ring. x is measured from the frame centre. Top rack 10 teeth (x -5P..5P), bottom rack 11 teeth (x -5.5P..5.5P); the wheels have a tooth at the top and a gap at the bottom, so the racks are half a pitch apart
    var fr = o.frame = new T.Group(); scene.add(fr);
    var rt = P.rack({ teeth: 10, module: MD, body: 16, thick: 16, material: c.mat("rack") });
    rt.rotation.z = -Math.PI / 2;                                             // along +X, teeth point down
    P.at(rt, -5 * PI, 2 * RP, 0, fr);                                       // pitch line y 72, root y 79.5, body y 79.5..95.5
    var rb = P.rack({ teeth: 11, module: MD, body: 16, thick: 16, material: c.mat("rack") });
    rb.rotation.z = Math.PI / 2;                                              // along -X, teeth point up
    P.at(rb, 5.5 * PI, -2 * RP, 0, fr);                                         // pitch line y -72, root y -79.5, body y -95.5..-79.5
    var ex = 5.5 * PI;                                                        // frame half length, 103.7
    [-1, 1].forEach(function (s) {
      var sh = new T.Shape(), a0 = s > 0 ? -Math.PI / 2 : Math.PI / 2;        // half ring round the end, outer radius 95.5, inner 79.5, flush with the rack bodies
      sh.absarc(0, 0, 95.5, a0, a0 + Math.PI, false); sh.lineTo(s * 0 + 79.5 * Math.cos(a0 + Math.PI), 79.5 * Math.sin(a0 + Math.PI));
      sh.absarc(0, 0, 79.5, a0 + Math.PI, a0, true); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false, curveSegments: 28 }); g.translate(0, 0, -8);
      P.at(new T.Mesh(g, c.mat("rack")), s * ex, 0, 0, fr);                   // ring ends at x +-103.7, z -8..8
      P.at(P.box(.5 * PI, 16, 16, c.mat("rack")), s * (5.25 * PI), 87.5, 0, fr);   // fills the top rack to the ring, x 5P..5.5P, y 79.5..95.5
      P.at(P.cylX(6, 135, c.mat("rack")), s * (ex + 87.5 + 67.5), 0, 0, fr);  // stub x 191..326 from the middle of the ring band (inside it), on the axis y 0
    });
    // supports: slim back post for the shafts, a guide at each end for the stubs, base
    P.at(P.box(28, 180, 10, c.fixed), 0, -30, -35, scene);                    // post x -14..14, y -120..60, z -40..-30; shafts end at z -30
    [-1, 1].forEach(function (s) {
      var gx = s * 258.5;                                                     // guide x 249..268 (mirrored), inside the stub at every swing
      P.at(P.box(19, 114, 16, c.fixed), gx, -63, 0, scene);                   // lower block y -120..-6, z -8..8; stub underside is y -6
      P.at(P.box(19, 10, 16, c.fixed), gx, 11, 0, scene);                     // upper block y 6..16; stub top is y 6
      P.at(P.box(19, 136, 8, c.fixed), gx, -52, -12, scene);                  // web behind the stub, y -120..16, z -16..-8, shares the blocks' back face z -8
    });
    P.at(P.box(580, 12, 100, c.fixed), 0, -126, -30, scene);                  // base x -290..290, y -132..-120, z -80..20; post and guides stand on y -120
  },

  step: function (c, dt, S) {
    var o = this.o, tgt = S.controls.swing === undefined ? .25 : +S.controls.swing;
    o.A += (tgt - o.A) * Math.min(1, dt * 4);                                  // eases to the chosen swing so the frame never jumps
    o.a += S.w * dt;
    var th = o.A * 2 * Math.PI * Math.sin(o.a);                                // upper pinion angle, counter-clockwise
    o.g1.rotation.z = th;
    o.g2.rotation.z = -th + o.pitch / 2;                                       // opposite way, half a tooth offset so teeth fit the gaps
    o.frame.position.x = -th * o.rp;                                           // top of a counter-clockwise wheel moves left; rolls on the pitch line
    var turns = Math.round(th / (2 * Math.PI) * 100) / 100, mm = Math.round(o.frame.position.x);
    function sg(v, u) { return (v < 0 ? "−" + -v : (v === 0 ? "0" : v)) + u; }
    S.set("turns", sg(turns, " turns"));
    S.set("trav", sg(mm, " mm"));
  }
});
