M507.define({
  number: 197,
  title: "Mangle rack",
  lede: "A small gear turns steadily one way, yet the big square frame slides to the right and then back to the left. The gear runs along the top of a row of pins, round the end pin and back along the bottom. Mangles, machines that press wet washing, used this to push a heavy box of rollers back and forth.",
  alt: "A flat square frame with a long rounded plate in its middle. A straight row of round pins stands out of the plate. A small gear meshes with the pins from above. A curved guide stands at each end of the row. The gear's short shaft runs in a narrow slot in a thin see-through bar.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear. An engine turns it the same way all the time. Watch the red stripe to count its turns." },
    { key: "frame", color: "#C8873A", name: "Square frame", note: "The frame that slides back and forth. It carries the pale plate of pins and a pale curved guide at each end." },
    { key: "pins", color: "#C2503F", name: "Row of pins", note: "Round pins that act as the teeth of the rack. The pinion's teeth catch them from above and from below." },
    { key: "rollers", color: "#4FA58A", name: "Rollers", note: "Four wheels that hold the frame at the top and bottom edges. They let it slide sideways but not up or down." }
  ],
  controls: [{ id: "dir", label: "Pinion turns", value: "cw", options: [["cw", "Clockwise"], ["ccw", "Anticlockwise"]] }],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "pos", label: "Frame" }, { id: "dir", label: "Moving" }],
  views: { "3d": [280, 140, 480], front: [0, 0, 390], side: [420, 0, 0] },
  distance: [300, 1800],
  target: [0, 0, 0],
  how: [
    "An engine turns the small gear, called a pinion, always the same way. Its teeth catch the pins along the top of the row. Along the top it pushes the frame one way.",
    "At the end of the row the pinion holds on to the last pin and swings round it. The curved guide keeps it from slipping off. Its shaft slides down a narrow slot to the underside. Along the bottom the same turning pushes the frame the other way. The pinion never changes direction, but the frame goes out and comes back.",
    "Try Clockwise, then Anticlockwise. See which way the frame moves while the pinion is on top of the pins."
  ],
  note: "This model is rebuilt from Brown's drawing. The slotted bar that holds the shaft, the rollers, the board behind and all the sizes and numbers of teeth were made up. Brown also says the frame could stand still while a shaft with a universal joint carries the pinion round the pins. That version is not shown.",

  // Sizes. Module 5, pinion 10 teeth (pitch radius 25, pitch 5 pi). 11 pins on the line y = 0 from x = -LH to LH.
  dims: { MD: 5, NP: 10, RP: 25, LH: 25 * Math.PI, NPIN: 11, RPIN: 3 },

  /** Pinion centre relative to the frame after the pinion has turned v radians clockwise from the left end of the top run.
      Top run: rolls right (10 teeth = one turn). Right end: swings round the end pin, turning half a turn. Bottom run: rolls
      left. Left end: swings back up. One trip is v = 6 pi. */
  path: function (v) {
    var D = this.dims, v1 = 2 * D.LH / D.RP, U = 2 * v1 + 2 * Math.PI, b;
    v = ((v % U) + U) % U;
    if (v < v1) return { x: -D.LH + D.RP * v, y: D.RP };
    v -= v1;
    if (v < Math.PI) { b = Math.PI / 2 - v; return { x: D.LH + D.RP * Math.cos(b), y: D.RP * Math.sin(b) }; }
    v -= Math.PI;
    if (v < v1) return { x: D.LH - D.RP * v, y: -D.RP };
    v -= v1; b = -Math.PI / 2 - v;
    return { x: -D.LH + D.RP * Math.cos(b), y: D.RP * Math.sin(b) };
  },
  /** Pinion angle (rotation.z): a gap points straight down at v = 0, so it holds the first pin. */
  spin: function (v) { var st = 2 * Math.PI / this.dims.NP; return -Math.PI / 2 - st / 2 - v; },
  U: function () { var D = this.dims; return 4 * D.LH / D.RP + 2 * Math.PI; },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, i;
    var o = this.o = { a: 0, v0: (D.LH - 37) / D.RP, px: null, last: "Still" };   // start as drawn: pinion on top, a little left of the middle

    // pinion z 7..19, stripe z 19.5..20.5, hub z 19..22, shaft z 19..32 through the slot (bar z 24..28), collar z 28.5..31
    o.pin = new T.Group(); scene.add(o.pin);
    o.rot = new T.Group(); o.pin.add(o.rot);
    P.at(P.spurGear({ teeth: D.NP, module: D.MD, width: 12, material: c.mat("pinion") }), 0, 0, 13, o.rot);   // z 7..19, clear of the plate face (z 6)
    P.at(P.cylZ(9, 3, c.mat("pinion")), 0, 0, 20.5, o.rot);                   // hub z 19..22, on the gear face
    P.at(P.box(10, 3, 1, c.mat("pinion", "mark")), 14, 0, 20, o.rot);         // red stripe x 9..19, z 19.5..20.5, lifted .5 off the face
    P.at(P.cylZ(3, 13, c.mat("pinion")), 0, 0, 25.5, o.rot);                  // shaft z 19..32
    P.at(P.cylZ(5, 2.5, c.mat("pinion")), 0, 0, 29.75, o.rot);                // collar z 28.5..31, .5 clear of the bar face

    // the sliding frame: plate x -142..142, y -71..71, z -6..0; oval plate z 0..6 on its face; pins z 6..18.5; guides z 0..18.5
    o.frame = new T.Group(); scene.add(o.frame);
    P.at(P.box(284, 142, 6, c.mat("frame")), 0, 0, -3, o.frame);
    var ov = new T.Shape(); ov.absarc(D.LH, 0, 20, -Math.PI / 2, Math.PI / 2, false); ov.absarc(-D.LH, 0, 20, Math.PI / 2, 1.5 * Math.PI, false);
    o.frame.add(new T.Mesh(new T.ExtrudeGeometry(ov, { depth: 6, bevelEnabled: false, curveSegments: 24 }), c.mat("frame", "light")));   // z 0..6, round ends 20 past the end pins
    var pitch = Math.PI * D.MD;
    for (i = 0; i < D.NPIN; i++) P.at(P.cylZ(D.RPIN, 12.5, c.mat("pins")), -D.LH + i * pitch, 0, 12.25, o.frame);   // z 6..18.5, on the oval's face
    // curved guides: rings round each end pin, inner radius 55 (pinion tip 30 + swing radius 25), outer 62, 150 degrees wide
    [1, -1].forEach(function (sd) {
      var a0 = sd > 0 ? -75 * Math.PI / 180 : 105 * Math.PI / 180, a1 = a0 + 150 * Math.PI / 180, g = new T.Shape();
      g.absarc(sd * D.LH, 0, 62, a0, a1, false); g.absarc(sd * D.LH, 0, 55, a1, a0, true);
      var gg = new T.ExtrudeGeometry(g, { depth: 18.5, bevelEnabled: false, curveSegments: 30 });
      o.frame.add(new T.Mesh(gg, c.mat("frame", "light")));                           // z 0..18.5, standing on the plate face; outer edge x = 140.5 < 142
    });

    // rollers radius 14 at x = -34 and 34, y = 85 and -85: rims touch the frame's edges (y = 71). z -8..2 round the plate (z -6..0)
    o.rollers = [];
    [-34, 34].forEach(function (x) { [85, -85].forEach(function (y) {
      var r = new T.Group(); P.at(r, x, y, 0, scene);
      P.at(P.cylZ(14, 10, c.mat("rollers")), 0, 0, -3, r);                    // z -8..2
      P.at(P.box(10, 2.5, 1, c.mat("rollers", "dark")), 6, 0, 3, r);          // dark stripe z 2.5..3.5, lifted .5 off the face
      P.at(P.cylZ(4, 24, c.fixed), x, y, -20, scene);                         // axle z -32..-8, from the board face to the roller's back
      r.sgn = y > 0 ? -1 : 1; o.rollers.push(r);
    }); });

    // thin slotted bar (a see-through support) x -7..7, y -112..112, z 24..28; slot 7 wide for the shaft (radius 3), centres y -25..25
    var bs = new T.Shape(); bs.moveTo(-7, -112); bs.lineTo(7, -112); bs.lineTo(7, 112); bs.lineTo(-7, 112); bs.closePath();
    var sl = new T.Path(); sl.absarc(0, -25, 3.5, Math.PI, 2 * Math.PI, false); sl.absarc(0, 25, 3.5, 0, Math.PI, false); sl.closePath(); bs.holes.push(sl);
    var bg = new T.ExtrudeGeometry(bs, { depth: 4, bevelEnabled: false }); bg.translate(0, 0, 24);
    scene.add(new T.Mesh(bg, c.fixed));
    P.at(P.box(14, 12, 56, c.fixed), 0, 106, -4, scene);                      // foot y 100..112, z -32..24: from the board face to the bar's back; rollers reach y 99
    P.at(P.box(14, 12, 56, c.fixed), 0, -106, -4, scene);

    // board behind: x -60..60, y -112..112, z -40..-32
    P.at(P.box(120, 224, 8, c.fixed), 0, 0, -36, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, D = this.dims, sgn = S.controls.dir === "ccw" ? -1 : 1;
    o.a += sgn * S.w * dt;
    var v = o.v0 + o.a, p = this.path(v), x = -p.x;                            // the pinion's shaft stays on x = 0
    o.pin.position.y = p.y;
    o.rot.rotation.z = this.spin(v);
    o.frame.position.x = x;
    o.rollers.forEach(function (r) { r.rotation.z = r.sgn * x / 14; });     // rolling on the frame's edge
    if (o.px !== null && dt > 0) o.last = !S.playing || Math.abs(x - o.px) < 1e-7 ? "Still" : (x > o.px ? "Right" : "Left");
    if (!S.playing) o.last = "Still";
    o.px = x;
    var r = Math.round(x);
    S.set("pos", (r < 0 ? "−" + -r : r) + " mm");
    S.set("dir", o.last);
  }
});
