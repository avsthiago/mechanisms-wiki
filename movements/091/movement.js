M507.define({
  number: 91,
  title: "Triangular eccentric",
  lede: "A rounded, three-cornered cam turns on a shaft inside a square frame. Its sides push the frame up and down, and the frame rests for a moment at each end. Steam engines in France used this to open and close their valves in jerks.",
  alt: "A square frame with a rod sticking out of the top and another out of the bottom. Inside it a cam shaped like a rounded triangle turns on a shaft at its lowest corner.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Triangular cam", note: "A rounded triangle fixed on the shaft at one corner. All its widths are the same. The red peg marks one corner. Watch it go round." },
    { key: "yoke", color: "#C8873A", name: "Yoke", note: "A square frame whose flat top and bottom just touch the cam. The cam pushes it up and down. It cannot move sideways." },
    { key: "rods", color: "#4FA58A", name: "Rods", note: "Fixed to the top and bottom of the yoke. They slide through fixed guides, so they move in a straight line." }
  ],
  readouts: [{ id: "x", label: "Rod travel" }],
  views: { "3d": [230, 150, 580], front: [0, 0, 860], side: [860, 0, 0] },
  target: [0, -20, 0],
  how: [
    "The shaft turns, and the cam turns with it. The cam is a rounded triangle, and every way you measure across it gives the same width. Watch the red peg go round.",
    "The frame inside is exactly that wide, so the cam always touches both its top and its bottom. When a flat arc of the cam slides along one side, the frame stays still. When a corner swings round, the frame is pushed up or down. So the rods rest, move, rest, and move back.",
    "Watch the readout while the cam turns. The travel stays at its top value for a part of each turn, then drops to its bottom value and stays there. Press pause at the top and the bottom to see the cam touch."
  ],
  note: "This model is rebuilt from Brown's drawing. The guides for the rods, the bearing behind the shaft, the base and the sizes were made up. The corners of the cam are rounded so the shaft hub sits inside the cam. The frame is made square-cornered and wide enough for the cam to turn all the way round.",

  K: { w: 70, r: 16 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, w = K.w, r = K.r, W = w + 2 * r, D = Math.PI / 180;
    var o = this.o = { a: 0 };
    var V = [[0, 0], [w / 2, w * Math.sqrt(3) / 2], [-w / 2, w * Math.sqrt(3) / 2]], TH = [90, 210, 330];
    function nrm(a) { a %= 360; return a < 0 ? a + 360 : a; }
    function pt(phi) {                                                         // boundary point whose outward normal points at phi degrees
      phi = nrm(phi); var u = [Math.cos(phi * D), Math.sin(phi * D)], i, d;
      for (i = 0; i < 3; i++) { d = Math.abs(((phi - TH[i] + 540) % 360) - 180); if (d <= 30) return [V[i][0] + (w + r) * u[0], V[i][1] + (w + r) * u[1]]; }
      for (i = 0; i < 3; i++) { d = Math.abs(((phi - TH[i] - 180 + 540) % 360) - 180); if (d <= 30) return [V[i][0] + r * u[0], V[i][1] + r * u[1]]; }
    }
    o.h = function (phi) { var p = pt(phi); return p[0] * Math.cos(phi * D) + p[1] * Math.sin(phi * D); };   // support function: farthest reach of the cam along phi
    // cam: Reuleaux triangle (corners on arcs of radius w) grown by r, so it is W wide everywhere; shaft sits at the lowest corner
    o.rot = new T.Group(); scene.add(o.rot);
    var sh = new T.Shape(), i, p;
    for (i = 0; i < 360; i += 2) { p = pt(i + .01); if (i) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); }
    var cg = new T.ExtrudeGeometry(sh, { depth: 22, bevelEnabled: false }); cg.translate(0, 0, -11);
    o.rot.add(P.mesh(cg, c.mat("cam")));                                       // cam z -11..11, a little wider than the yoke
    P.at(P.cylZ(12.5, 65, c.mat("cam")), 0, 0, -12.5, o.rot);                  // shaft z -45 bearing face .. 20
    P.at(P.cylZ(12, 32, c.mat("cam")), 0, 0, 0, o.rot);                        // hub z -16..16, inside the rounded corner
    P.at(P.box(3, 20, 1, c.mat("cam", "dark")), 0, 0, 20.5, o.rot);            // key mark on the shaft end, z 20..21
    P.at(P.cylZ(3.5, 7, c.mat("cam", "mark")), V[1][0], V[1][1], 14.5, o.rot); // red peg z 11..18 on one corner
    // yoke: frame x +-106, y +-65, window x +-92.3, y +-51.3 (0.3 clear of the cam); rods up and down
    o.yoke = new T.Group(); scene.add(o.yoke);
    var fr = new T.Shape(), hole = new T.Path();
    fr.moveTo(-106, -65); fr.lineTo(106, -65); fr.lineTo(106, 65); fr.lineTo(-106, 65); fr.lineTo(-106, -65);
    hole.moveTo(-92.3, -51.3); hole.lineTo(-92.3, 51.3); hole.lineTo(92.3, 51.3); hole.lineTo(92.3, -51.3); hole.lineTo(-92.3, -51.3);
    fr.holes.push(hole);
    var yg = new T.ExtrudeGeometry(fr, { depth: 18, bevelEnabled: false }); yg.translate(0, 0, -9);
    o.yoke.add(P.mesh(yg, c.mat("yoke")));                                     // yoke z -9..9
    [1, -1].forEach(function (s) { P.at(P.cylY(7, 108, c.mat("rods")), 0, s * 111, 0, o.yoke); });   // rods |y| 57..165, starting in the frame bar
    // supports: guides |y| 102..126 behind-held by arms, back plate with the bearing, base
    [1, -1].forEach(function (s) {
      P.at(P.guideBlock({ w: 24, h: 24, d: 24, hole: 7.5, material: c.fixed }), 0, s * 114, 0, scene);   // guide x -12..12, y 102..126, z -12..12
      P.at(P.box(24, 24, 33, c.fixed), 0, s * 114, -28.5, scene);                                        // arm z -45..-12
    });
    P.at(P.box(60, 380, 10, c.fixed), 0, -20, -50, scene);                       // back plate x -30..30, y -210..170, z -55..-45; shaft ends on its face
    P.at(P.box(260, 12, 110, c.fixed), 0, -216, -15, scene);                   // base x -130..130, y -222..-210, z -70..40
  },

  step: function (c, dt, S) {
    var o = this.o, a;
    o.a += S.w * dt;
    a = o.a * 180 / Math.PI;
    o.rot.rotation.z = o.a;                                                    // at the start the corner with the shaft points down, as drawn
    // the yoke is as wide as the cam, so it sits halfway between the cam's top and bottom reach
    var yc = (o.h(90 - a) - o.h(270 - a)) / 2;
    o.yoke.position.y = yc;
    var v = Math.round(yc);
    S.set("x", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm");
  }
});
