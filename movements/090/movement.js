M507.define({
  number: 90,
  title: "Eccentric with a yoke",
  lede: "A round disc is fixed on a shaft, but set off its centre. This is called an eccentric. It turns inside a long, flat frame called a yoke, and pushes it from side to side. The rods on the yoke slide in straight guides and never tilt.",
  alt: "A round disc on a shaft, set off-centre, inside a tall oval frame. A straight rod sticks out of each side of the frame and slides through a fixed guide.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Eccentric disc", note: "A round disc fixed on the shaft away from its centre. The red peg marks the centre of the disc. Watch it circle round the shaft." },
    { key: "yoke", color: "#C8873A", name: "Yoke", note: "A tall frame whose straight inner sides just touch the disc. The disc can slide up and down inside it, but it pushes the yoke left and right." },
    { key: "rods", color: "#4FA58A", name: "Rods", note: "Fixed to the yoke on each side. They slide through fixed guides, so they move in a straight line." }
  ],
  controls: [{ id: "e", label: "Offset of the disc", value: "28", options: [["14", "Small"], ["28", "As drawn"], ["38", "Big"]] }],
  readouts: [{ id: "x", label: "Rod travel" }],
  views: { "3d": [250, 160, 620], front: [0, 0, 860], side: [860, 0, 0] },
  target: [0, -10, 0],
  how: [
    "The shaft turns, and the disc turns with it. The disc is not centred on the shaft, so its centre swings round in a small circle. Watch the red peg.",
    "The yoke's inner sides are straight and upright. When the disc's centre moves up or down, the disc just slides along them. When it moves left or right, it pushes the yoke with it. So the yoke and its rods go only left and right, and the rods never tilt.",
    "The rods travel twice as far as the disc's centre sits from the shaft. Try Small, then Large, and watch the travel change."
  ],
  note: "This model is rebuilt from Brown's drawing. The guides for the rods, the bearing behind the shaft, the base and the sizes were made up. The yoke is made tall enough for the largest offset. The other offsets were added for comparison.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 60;
    var o = this.o = { a: 0, discs: {} };
    // shaft (z -45 bearing face .. 20) and one disc for each offset
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(12.5, 65, c.mat("disc")), 0, 0, -12.5, o.rot);                         // shaft z -45..20
    P.at(P.box(3, 20, 1, c.mat("disc", "dark")), 0, 0, 20.5, o.rot);                   // key mark on the shaft end, z 20..21
    P.at(P.cylZ(20, 32, c.mat("disc")), 0, 0, 0, o.rot);                               // hub z -16..16
    ["14", "28", "38"].forEach(function (k) {
      var e = +k, g = new T.Group();
      P.at(P.cylZ(R, 22, c.mat("disc")), e, 0, 0, g);                                  // disc z -11..11, a little wider than the yoke
      P.at(P.cylZ(3.5, 7, c.mat("disc", "mark")), e, 0, 14.5, g);                      // red peg z 11..18, through the hub face at 16
      o.rot.add(g); o.discs[k] = g;
    });
    // yoke: straight inner sides 0.3 clear of the disc, rounded ends; rods on both sides
    o.yoke = new T.Group(); scene.add(o.yoke);
    function stadium(path, hx, hy, ry, rev) {                                          // straight sides x = +-hx for |y| < hy, half-ellipse ends
      if (!rev) { path.moveTo(hx, -hy); path.lineTo(hx, hy); path.absellipse(0, hy, hx, ry, 0, Math.PI, false); path.lineTo(-hx, -hy); path.absellipse(0, -hy, hx, ry, Math.PI, 2 * Math.PI, false); }
      else { path.moveTo(hx, -hy); path.absellipse(0, -hy, hx, ry, 0, -Math.PI, true); path.lineTo(-hx, hy); path.absellipse(0, hy, hx, ry, Math.PI, 0, true); }
    }
    var sh = new T.Shape(), hole = new T.Path();
    stadium(sh, 70.3, 55, 78, false); stadium(hole, R + .3, 55, 60, true); sh.holes.push(hole);
    var yg = new T.ExtrudeGeometry(sh, { depth: 18, bevelEnabled: false, curveSegments: 40 }); yg.translate(0, 0, -9);
    o.yoke.add(P.mesh(yg, c.mat("yoke")));                                             // yoke z -9..9, inner height 230, outer 266
    [1, -1].forEach(function (s) { P.at(P.cylX(7, 125, c.mat("rods")), s * 132.5, 0, 0, o.yoke); });   // rods |x| 70..195, starting in the yoke side
    // supports: guides at |x| 125..145, posts under them, bearing behind the shaft, base
    [1, -1].forEach(function (s) {
      var b = P.guideBlock({ w: 24, h: 20, d: 24, hole: 7.5, material: c.fixed }); b.rotation.z = Math.PI / 2;
      P.at(b, s * 135, 0, 0, scene);                                                   // guide x 125..145, y -12..12, z -12..12
      P.at(P.box(20, 138, 24, c.fixed), s * 135, -81, 0, scene);                       // post y -150..-12
    });
    P.at(P.box(60, 175, 10, c.fixed), 0, -62.5, -50, scene);                           // bearing x -30..30, y -150..25, z -55..-45
    P.at(P.box(340, 12, 110, c.fixed), 0, -156, -15, scene);                           // base x -170..170, y -162..-150, z -70..40
  },

  step: function (c, dt, S) {
    var o = this.o, k = S.controls.e || "28", e = +k, kk;
    for (kk in o.discs) o.discs[kk].visible = kk === k;
    o.a += S.w * dt;
    o.rot.rotation.z = o.a;                                                            // starts with the disc's centre to the right, as drawn
    var x = e * Math.cos(o.a);                                                         // the yoke follows the disc's centre sideways only
    o.yoke.position.x = x;
    var v = Math.round(x);
    S.set("x", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm");
  }
});
