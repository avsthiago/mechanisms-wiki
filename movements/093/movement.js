M507.define({
  number: 93,
  title: "Crank in a slotted yoke",
  lede: "A crank turns a peg round in a circle. The peg slides along a long slot in a yoke. The yoke moves only up and down, and it carries a straight rod with it. No jointed connecting rod is needed.",
  alt: "A round crank disc with a red peg, behind a long horizontal frame with a slot. The peg sits in the slot. An upright rod is fixed to the frame and passes through a guide above and below.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Crank disc", note: "A disc fixed on a shaft. The peg is fixed near its edge, so it travels round in a circle when the shaft turns." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The red pin that sits in the slot. Watch it. It goes round in a circle and slides to and fro along the slot." },
    { key: "yoke", color: "#C8873A", name: "Slotted yoke", note: "A flat frame with a long slot. The peg pushes its sides up and down, but the peg is free to slide along the slot." },
    { key: "rod", color: "#4FA58A", name: "Rod", note: "Fixed to the yoke, above and below. It slides through two fixed guides, so it only moves straight up and down." }
  ],
  controls: [{ id: "r", label: "Peg distance from the shaft", value: "66", options: [["30", "Near"], ["48", "Middle"], ["66", "As drawn"]] }],
  readouts: [{ id: "y", label: "Rod travel" }],
  views: { "3d": [230, 120, 590], front: [0, 0, 1000], side: [1000, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The shaft turns, and the red peg goes round in a circle. The peg sits in the slot of the yoke. The slot is long and straight, and it lies across the way the rod moves.",
    "When the peg goes up, it lifts the yoke. When it goes down, it lowers the yoke. When it moves left or right, it just slides along the slot and does not push. So the rod goes only up and down. It is fastest when the peg is level with the shaft, and it stops for a moment at the top and the bottom.",
    "The rod travels twice as far as the peg is from the shaft. Try Near, then As drawn, and watch the travel change."
  ],
  note: "This model is rebuilt from Brown's drawing. The guides, the plate behind the shaft, the base and all the sizes were made up. The disc is drawn behind the yoke so that the peg can be seen in the slot. The other peg distances were added for comparison.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { a: 0.72, pegs: {} };
    // crank: shaft z -30..-12 (plate face to disc face), disc z -26..-12, hub z -12..-10
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(10, 18, c.mat("disc")), 0, 0, -21, o.rot);                             // shaft z -30..-12
    P.at(P.cylZ(80, 14, c.mat("disc")), 0, 0, -19, o.rot);                             // disc z -26..-12
    P.at(P.cylZ(14, 2, c.mat("disc")), 0, 0, -11, o.rot);                              // hub z -12..-10 (rod is z -8..8)
    ["30", "48", "66"].forEach(function (k) {
      var r = +k, g = new T.Group();
      P.at(P.box(r - 14, 6, .8, c.mat("disc", "dark")), 14 + (r - 14) / 2, 0, -11.6, g);   // dark stripe on the disc face, z -12..-11.2, x 14..r
      P.at(P.cylZ(8, 20.5, c.mat("pin", "mark")), r, 0, -2.25, g);                          // peg z -12..8, through the slot (yoke z -6..6)
      o.rot.add(g); o.pegs[k] = g;
    });
    // yoke: long slot (inner half length 76, half width 8.3), rounded ends, outer half length 88, half height 20; z -6..6
    o.yoke = new T.Group(); scene.add(o.yoke);
    function stadium(path, L, h, rev) {
      var m = L - h;
      if (!rev) { path.moveTo(-m, -h); path.lineTo(m, -h); path.absarc(m, 0, h, -Math.PI / 2, Math.PI / 2, false); path.lineTo(-m, h); path.absarc(-m, 0, h, Math.PI / 2, 3 * Math.PI / 2, false); }
      else { path.moveTo(-m, -h); path.absarc(-m, 0, h, 3 * Math.PI / 2, Math.PI / 2, true); path.lineTo(m, h); path.absarc(m, 0, h, Math.PI / 2, -Math.PI / 2, true); path.lineTo(-m, -h); }
    }
    var sh = new T.Shape(), hole = new T.Path();
    stadium(sh, 88, 20, false); stadium(hole, 76, 8.3, true); sh.holes.push(hole);
    var yg = new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false, curveSegments: 32 }); yg.translate(0, 0, -6);
    o.yoke.add(P.mesh(yg, c.mat("yoke")));                                             // yoke z -6..6, y -20..20
    [1, -1].forEach(function (s) { P.at(P.cylY(8, 166, c.mat("rod")), 0, s * 97, 0, o.yoke); });   // rods |y| 14..180, starting inside the yoke wall (slot edge at 8.3)
    // supports: guides y 90..110 and -110..-90, arms back to a plate, plate on a base
    [1, -1].forEach(function (s) {
      P.at(P.guideBlock({ w: 24, h: 20, d: 24, hole: 8.8, material: c.fixed }), 0, s * 100, 0, scene);   // guide x -12..12, y 90..110, z -12..12
      P.at(P.box(24, 20, 18, c.fixed), 0, s * 100, -21, scene);                        // arm z -30..-12, y 90..110
    });
    P.at(P.box(90, 220, 10, c.fixed), 0, 0, -35, scene);                               // plate x -45..45, y -110..110, z -40..-30
    [1, -1].forEach(function (s) { P.at(P.box(65, 12, 30, c.fixed), s * 57.5, -116, -45, scene); });   // feet x 25..90 and -90..-25, y -122..-110, z -60..-30; the rod (x -8..8) hangs clear between them
  },

  step: function (c, dt, S) {
    var o = this.o, k = S.controls.r || "66", r = +k, kk;
    for (kk in o.pegs) o.pegs[kk].visible = kk === k;
    o.a += S.w * dt;
    o.rot.rotation.z = o.a;                                                            // peg starts up and to the right, as drawn
    var y = r * Math.sin(o.a);                                                         // the yoke follows the peg's height only
    o.yoke.position.y = y;
    var v = Math.round(y);
    S.set("y", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm");
  }
});
