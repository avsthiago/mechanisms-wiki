M507.define({
  number: 198,
  title: "Mangle rack with a jointed rack",
  lede: "A small gear turns steadily in one place, yet the big frame slides to the right and then back to the left. The gear runs round the inside of a loop of teeth. At each end the loop is lifted or lowered on two swinging rods, so the gear's shaft never has to move.",
  alt: "A wide flat frame held between four rollers. On its face hangs a rack shaped like a long loop, with teeth on the inside and a raised oval in the middle. A small gear meshes with the teeth inside the loop. A strap across the loop holds the oval. Two long rods join the loop to the left end of the frame.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear. A shaft from behind turns it the same way all the time, and it never moves from its place. Watch the red stripe to count its turns." },
    { key: "frame", color: "#8E7AA8", name: "Main frame", note: "The frame that slides back and forth between the rollers. It carries the rack on two rods." },
    { key: "rack", color: "#C8873A", name: "Loop rack", note: "A rack is a bar with gear teeth along it. This one is bent into a loop, with teeth round its inside edge. A strap across it holds a pale oval that keeps the pinion against the teeth. It slides with the frame, and rises or falls at each end." },
    { key: "rods", color: "#D9B13B", name: "Rods", note: "Two equal rods, side by side. They let the rack swing up and down while it stays level." },
    { key: "rollers", color: "#4FA58A", name: "Rollers", note: "Four wheels that hold the frame at the top and bottom edges. They let it slide sideways but not up or down." }
  ],
  controls: [{ id: "dir", label: "Pinion turns", value: "cw", options: [["cw", "Clockwise"], ["ccw", "Anticlockwise"]] }],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "pos", label: "Frame" }, { id: "dir", label: "Moving" }],
  views: { "3d": [260, 130, 400], front: [0, 0, 440], side: [460, 0, 0] },
  distance: [300, 1800],
  target: [0, 0, 0],
  how: [
    "A shaft from behind turns the small gear, called a pinion, in its place. It meshes with the teeth along the top of the loop and pushes the loop, and the frame with it, one way.",
    "At the end of the loop the teeth curve round the pinion. The pinion pulls the loop upwards as it turns, and the two rods swing to let it rise. Now the pinion meshes with the bottom teeth, and the same turning pushes the frame the other way. The pinion never moves up or down. The rack does the climbing instead.",
    "Try Clockwise, then Anticlockwise. Watch whether the rack is up or down while the frame moves to the right."
  ],
  note: "This model is rebuilt from Brown's drawing. The rollers' supports, the board behind and all the sizes and numbers of teeth were made up. Brown draws an upright bar across the middle, joined to the rods. Here it is a strap fixed to the rack that holds the oval, because a bar joined to both rods would lock them. The two rods are made the same length so the rack stays level. The pinion's shaft goes back through a slot in the frame.",

  // Sizes. Module 4, pinion 6 teeth (pitch radius 12). The loop's pitch outline: straight runs 2 LH long at y = +-H, half circles
  // of radius H at the ends; 28 + 12 = 40 teeth. The pinion's centre runs on the same shape shrunk to radius RHO = H - RP.
  dims: { MD: 4, NP: 6, RP: 12, H: 24, LH: 28 * Math.PI, RHO: 12, RO: 47, LINK: 250, PY: 40, FW: 166, FH: 75 },

  /** Pinion centre relative to the rack after the pinion has turned v radians clockwise from the right end of the top run.
      It goes left along the top, round the left end, right along the bottom and round the right end. On a straight run
      the pinion turns 1 / RP radians per unit; round an end, RHO / RP radians per radian of swing. */
  path: function (v) {
    var D = this.dims, v1 = 2 * D.LH / D.RP, vE = Math.PI * D.RHO / D.RP, U = 2 * v1 + 2 * vE, b;
    v = ((v % U) + U) % U;
    if (v < v1) return { x: D.LH - D.RP * v, y: D.RHO };
    v -= v1;
    if (v < vE) { b = Math.PI / 2 + v * D.RP / D.RHO; return { x: -D.LH + D.RHO * Math.cos(b), y: D.RHO * Math.sin(b) }; }
    v -= vE;
    if (v < v1) return { x: -D.LH + D.RP * v, y: -D.RHO };
    v -= v1; b = -Math.PI / 2 + v * D.RP / D.RHO;
    return { x: D.LH + D.RHO * Math.cos(b), y: D.RHO * Math.sin(b) };
  },
  U: function () { var D = this.dims; return 4 * D.LH / D.RP + 2 * Math.PI * D.RHO / D.RP; },
  /** Pinion angle: a tooth points straight up at v = 0, into the gap of the rack at the start of the top run. */
  spin: function (v) { return Math.PI / 2 - v; },
  /** Point of the loop's pitch outline at arc length s, anticlockwise from the right end of the top run: {x, y, psi}. */
  outline: function (s) {
    var D = this.dims, a = 2 * D.LH, b = Math.PI * D.H, L = 2 * a + 2 * b, al;
    s = ((s % L) + L) % L;
    if (s < a) return { x: D.LH - s, y: D.H, psi: Math.PI };
    s -= a;
    if (s < b) { al = Math.PI / 2 + s / D.H; return { x: -D.LH + D.H * Math.cos(al), y: D.H * Math.sin(al), psi: al + Math.PI / 2 }; }
    s -= b;
    if (s < a) return { x: -D.LH + s, y: -D.H, psi: 2 * Math.PI };
    s -= a; al = -Math.PI / 2 + s / D.H;
    return { x: D.LH + D.H * Math.cos(al), y: D.H * Math.sin(al), psi: al + Math.PI / 2 };
  },
  /** Teeth on the inside of the loop as [x, y] points going round anticlockwise. Gaps at s = 0, pitch, 2 pitch, ... */
  teeth: function () {
    var D = this.dims, pitch = Math.PI * D.MD, n = Math.round((4 * D.LH + 2 * Math.PI * D.H) / pitch), out = [], i, k;
    var prof = [[0, 1.25], [.23, 1.25], [.39, -1], [.61, -1], [.77, 1.25]];  // gap centred on 0, tooth centred on .5
    for (i = 0; i < n; i++) for (k = 0; k < prof.length; k++) {
      var p = this.outline((i + prof[k][0]) * pitch), off = prof[k][1] * D.MD;
      out.push([p.x + off * Math.sin(p.psi), p.y - off * Math.cos(p.psi)]);
    }
    return out;
  },
  /** Where everything is for a pinion turn v: rack (x, y) in the world, the rods' angle g, the frame's x. */
  pose: function (v) {
    var D = this.dims, p = this.path(v), X = -p.x, Y = -p.y, g = Math.asin(Y / D.LINK);
    return { X: X, Y: Y, g: g, F: X - (D.LINK * Math.cos(g) - D.LINK) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims;
    var o = this.o = { a: 0, v0: 1.56 * D.LH / D.RP, px: null, last: "Still" };   // start as drawn: pinion on the top teeth, near the left

    function stadium(sh, hl, r) { sh.absarc(hl, 0, r, -Math.PI / 2, Math.PI / 2, false); sh.absarc(-hl, 0, r, Math.PI / 2, 1.5 * Math.PI, false); return sh; }

    // pinion, fixed in place: shaft z -34..-5 from the bearing, gear z -5..7, roller z 7..13 (runs on the oval). Nothing in front of it.
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(3.5, 29, c.mat("pinion")), 0, 0, -19.5, o.rot);              // shaft z -34..-5, through the frame's slot (z -26..-20)
    P.at(P.spurGear({ teeth: D.NP, module: D.MD, width: 12, material: c.mat("pinion") }), 0, 0, 1, o.rot);   // z -5..7
    P.at(P.cylZ(7, 6, c.mat("pinion")), 0, 0, 10, o.rot);                    // roller z 7..13, on the gear face
    P.at(P.box(7, 2, 1, c.mat("pinion", "mark")), 11.5, 0, 8, o.rot);         // red stripe on one tooth, x 8..15, z 7.5..8.5, lifted .5 off the face

    // the loop rack: toothed ring z -6..8; pale oval z 9..14 (radius 5 = path radius 12 - roller 7), hung from a strap z 14..18
    o.rack = new T.Group(); scene.add(o.rack);
    var ring = stadium(new T.Shape(), D.LH, D.RO), hole = new T.Path(), tp = this.teeth().reverse();   // holes run clockwise
    tp.forEach(function (q, k) { if (k) hole.lineTo(q[0], q[1]); else hole.moveTo(q[0], q[1]); }); hole.closePath(); ring.holes.push(hole);
    var rg = new T.ExtrudeGeometry(ring, { depth: 14, bevelEnabled: false, curveSegments: 30 }); rg.translate(0, 0, -6);
    o.rack.add(new T.Mesh(rg, c.mat("rack")));
    var isl = new T.ExtrudeGeometry(stadium(new T.Shape(), D.LH, D.RHO - 7), { depth: 5, bevelEnabled: false, curveSegments: 20 }); isl.translate(0, 0, 9);
    o.rack.add(new T.Mesh(isl, c.mat("rack", "light")));
    P.at(P.box(12, 88, 4, c.mat("rack")), 0, 0, 16, o.rack);                  // strap x -6..6, y -44..44, z 14..18; the oval's face (z 14) meets its back
    [38.5, -38.5].forEach(function (y) { P.at(P.box(12, 11, 6, c.mat("rack")), 0, y, 11, o.rack); });   // feet y 33..44, z 8..14, on the ring's solid band (29..47)
    // rod pins z 8..19 on the ring face at (LH + 12, +-40): 41.8 from the end centre, inside the solid band
    [D.PY, -D.PY].forEach(function (y) { P.at(P.cylZ(3.5, 11, c.mat("rack")), D.LH + 12, y, 13.5, o.rack); });

    // the main frame: plate x -166..166, y -75..75, z -26..-20, with a slot y -5..5, x -106..106 for the shaft (frame moves 100.3 each way)
    o.frame = new T.Group(); scene.add(o.frame);
    var fs = new T.Shape(); fs.moveTo(-D.FW, -D.FH); fs.lineTo(D.FW, -D.FH); fs.lineTo(D.FW, D.FH); fs.lineTo(-D.FW, D.FH); fs.closePath();
    var fsl = new T.Path(); fsl.absarc(106, 0, 5, -Math.PI / 2, Math.PI / 2, false); fsl.absarc(-106, 0, 5, Math.PI / 2, 1.5 * Math.PI, false); fsl.closePath(); fs.holes.push(fsl);
    var fg = new T.ExtrudeGeometry(fs, { depth: 6, bevelEnabled: false }); fg.translate(0, 0, -26);
    o.frame.add(new T.Mesh(fg, c.mat("frame")));
    var fx = D.LH + 12 - D.LINK;                                              // rod posts at x = -150, z -20..19 (rack reaches -135.3 at most)
    o.rods = [];
    [D.PY, -D.PY].forEach(function (y) {
      P.at(P.cylZ(3.5, 39, c.mat("frame")), fx, y, -0.5, o.frame);            // post z -20..19, on the plate face
      var r = new T.Group(); P.at(r, fx, y, 0, o.frame);
      P.at(P.box(D.LINK + 10, 7, 3, c.mat("rods")), D.LINK / 2, 0, 20.5, r); // rod z 19..22, from pin to pin plus 5 at each end
      P.at(P.cylZ(2.5, 1, c.mat("rods", "dark")), 0, 0, 23, r);              // pin heads z 22.5..23.5, lifted .5 off the rod
      P.at(P.cylZ(2.5, 1, c.mat("rods", "dark")), D.LINK, 0, 23, r);
      o.rods.push(r);
    });

    // rollers radius 12 at x = +-55, y = +-87: rims touch the frame's edges (y = 75). z -28..-18 round the plate (z -26..-20)
    o.rollers = [];
    [-55, 55].forEach(function (x) { [87, -87].forEach(function (y) {
      var r = new T.Group(); P.at(r, x, y, 0, scene);
      P.at(P.cylZ(12, 10, c.mat("rollers")), 0, 0, -23, r);                  // z -28..-18
      P.at(P.box(8, 2, 1, c.mat("rollers", "dark")), 5, 0, -17, r);           // dark stripe z -17.5..-16.5, lifted .5 off the face
      P.at(P.cylZ(3.5, 14, c.fixed), x, y, -35, scene);                       // axle z -42..-28, from the board face to the roller's back
      r.sgn = y > 0 ? -1 : 1; o.rollers.push(r);
    }); });

    // behind: bearing boss z -42..-34 for the shaft; board x -75..75, y -105..105, z -50..-42
    P.at(P.cylZ(8, 8, c.fixed), 0, 0, -38, scene);
    P.at(P.box(150, 210, 8, c.fixed), 0, 0, -46, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, D = this.dims, sgn = S.controls.dir === "ccw" ? -1 : 1;
    o.a += sgn * S.w * dt;
    var v = o.v0 + o.a, q = this.pose(v);
    o.rot.rotation.z = this.spin(v);
    o.rack.position.set(q.X, q.Y, 0);
    o.frame.position.x = q.F;
    o.rods.forEach(function (r) { r.rotation.z = q.g; });                    // both rods swing together, so the rack stays level
    o.rollers.forEach(function (r) { r.rotation.z = r.sgn * q.F / 12; });
    if (o.px !== null && dt > 0) o.last = Math.abs(q.F - o.px) < 1e-7 ? "Still" : (q.F > o.px ? "Right" : "Left");
    if (!S.playing) o.last = "Still";
    o.px = q.F;
    var r = Math.round(q.F);
    S.set("pos", (r < 0 ? "−" + -r : r) + " mm");
    S.set("dir", o.last);
  }
});
