M507.define({
  number: 135,
  title: "Triangular tappet",
  lede: "A rounded, three-cornered tappet turns on a shaft inside a frame. It pushes the frame up and down, and the frame rests for an instant at the end of each stroke. A steam engine at the Paris Mint used this to slide its valve quickly from one end to the other.",
  alt: "A big round disc with a frame in front of it. A rod with a nut sticks out of the top of the frame and another out of the bottom. Inside the frame a rounded triangle turns on a shaft near its middle.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Triangular tappet", note: "A rounded triangle fixed on the shaft. Every way you measure across it gives the same width. The red peg marks one corner. Watch it go round." },
    { key: "yoke", color: "#C8873A", name: "Frame", note: "A curved-sided frame whose flat top and bottom just touch the tappet. The tappet pushes it up and down. It cannot move sideways." },
    { key: "rods", color: "#4FA58A", name: "Valve rods", note: "Fixed to the top and bottom of the frame with nuts. They slide through fixed guides, so they move in a straight line." }
  ],
  readouts: [{ id: "x", label: "Rod travel" }],
  views: { front: [0, 0, 860], "3d": [240, 170, 600], side: [860, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The shaft turns, and the tappet turns with it. The tappet is a rounded triangle, and every way you measure across it gives the same width. Watch the red peg go round.",
    "The frame around it is exactly that wide, so the tappet always touches both its top and its bottom. When a flat arc of the tappet slides along one side, the frame stays still. When a corner swings round, the frame is pushed quickly up or down. So the rods rest, move, rest, and move back.",
    "Watch the readout while the tappet turns. The travel stays at its top value for a moment, then drops to its bottom value and stays there. Press pause at each end to see the tappet touch the frame."
  ],
  note: "This model is rebuilt from Brown's drawing. In the drawing the big round disc sits behind the frame. Here it is a fixed backing plate, and it holds the shaft. The guides for the rods, the arms that hold them, the narrow plate behind the disc, the base and all the sizes were made up. The corners of the tappet are rounded so the shaft hub sits inside it. The frame is made wide enough for the tappet to turn all the way round.",

  K: { w: 70, r: 16 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, w = K.w, r = K.r, W = w + 2 * r, D = Math.PI / 180;
    var o = this.o = { a: 0 };
    var cy = w * Math.sqrt(3) / 6;                                             // shaft sits at the middle of the triangle
    var V = [[0, -cy], [w / 2, w * Math.sqrt(3) / 2 - cy], [-w / 2, w * Math.sqrt(3) / 2 - cy]], TH = [90, 210, 330];
    function nrm(a) { a %= 360; return a < 0 ? a + 360 : a; }
    function pt(phi) {                                                         // boundary point whose outward normal points at phi degrees
      phi = nrm(phi); var u = [Math.cos(phi * D), Math.sin(phi * D)], i, d;
      for (i = 0; i < 3; i++) { d = Math.abs(((phi - TH[i] + 540) % 360) - 180); if (d <= 30) return [V[i][0] + (w + r) * u[0], V[i][1] + (w + r) * u[1]]; }
      for (i = 0; i < 3; i++) { d = Math.abs(((phi - TH[i] - 180 + 540) % 360) - 180); if (d <= 30) return [V[i][0] + r * u[0], V[i][1] + r * u[1]]; }
    }
    o.h = function (phi) { var p = pt(phi); return p[0] * Math.cos(phi * D) + p[1] * Math.sin(phi * D); };   // farthest reach of the tappet from the shaft along phi
    o.rot = new T.Group(); scene.add(o.rot);
    var sh = new T.Shape(), i, p;
    for (i = 0; i < 360; i += 2) { p = pt(i + .01); if (i) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); }
    var cg = new T.ExtrudeGeometry(sh, { depth: 22, bevelEnabled: false }); cg.translate(0, 0, -11);
    o.rot.add(P.mesh(cg, c.mat("cam")));                                       // tappet z -11..11, a little wider than the frame
    P.at(P.cylZ(12.5, 57, c.mat("cam")), 0, 0, -8.5, o.rot);                   // shaft z -37 (disc face) .. 20
    P.at(P.cylZ(12, 32, c.mat("cam")), 0, 0, 0, o.rot);                        // hub z -16..16
    P.at(P.box(10, 10, 1, c.mat("cam", "dark")), 0, 0, 20.5, o.rot);           // square shaft end mark, z 20..21
    P.at(P.cylZ(3.5, 7, c.mat("cam", "mark")), V[1][0], V[1][1], 14.5, o.rot); // red peg z 11..18 on one corner
    // frame: outer x +-106 (bulging to 114 at mid-height), y +-65; window x +-92.3, y +-51.3 (0.3 clear of the tappet)
    o.yoke = new T.Group(); scene.add(o.yoke);
    var fr = new T.Shape(), hole = new T.Path();
    fr.moveTo(-106, -65); fr.lineTo(106, -65); fr.quadraticCurveTo(122, 0, 106, 65); fr.lineTo(-106, 65); fr.quadraticCurveTo(-122, 0, -106, -65);
    hole.moveTo(-92.3, -51.3); hole.lineTo(-92.3, 51.3); hole.lineTo(92.3, 51.3); hole.lineTo(92.3, -51.3); hole.lineTo(-92.3, -51.3);
    fr.holes.push(hole);
    var yg = new T.ExtrudeGeometry(fr, { depth: 18, bevelEnabled: false }); yg.translate(0, 0, -9);
    o.yoke.add(P.mesh(yg, c.mat("yoke")));                                     // frame z -9..9
    [1, -1].forEach(function (s) {
      P.at(P.cylY(7, 108, c.mat("rods")), 0, s * 111, 0, o.yoke);              // rods |y| 57..165, starting in the frame bar
      P.at(P.mesh(new T.CylinderGeometry(11, 11, 15, 6), c.mat("rods")), 0, s * 72.5, 0, o.yoke);   // hex nut |y| 65..80, on the frame face
    });
    // supports: round backing disc, narrow plate behind it, guides with arms, base
    P.at(P.cylZ(115, 8, c.fixed), 0, 57, -41, scene);                          // disc centre y 57, radius 115 (y -58..172), z -45..-37
    P.at(P.box(60, 380, 10, c.fixed), 0, -20, -50, scene);                     // plate x -30..30, y -210..170, z -55..-45; disc sits on its face
    [1, -1].forEach(function (s) {
      P.at(P.guideBlock({ w: 24, h: 24, d: 24, hole: 7.5, material: c.fixed }), 0, s * 114, 0, scene);   // guide x -12..12, |y| 102..126, z -12..12
    });
    P.at(P.box(24, 24, 25, c.fixed), 0, 114, -24.5, scene);                    // upper arm z -37..-12, on the disc face
    P.at(P.box(24, 24, 33, c.fixed), 0, -114, -28.5, scene);                   // lower arm z -45..-12, on the plate face
    P.at(P.box(260, 12, 110, c.fixed), 0, -216, -15, scene);                   // base x -130..130, y -222..-210, z -70..40
  },

  step: function (c, dt, S) {
    var o = this.o, a;
    o.a += S.w * dt;
    a = o.a * 180 / Math.PI + 180;                                             // start with a corner pointing up, as drawn
    o.rot.rotation.z = o.a + Math.PI;
    var yc = (o.h(90 - a) - o.h(270 - a)) / 2;                                 // frame is as wide as the tappet, so it sits halfway between its top and bottom reach
    o.yoke.position.y = yc;
    var v = Math.round(yc);
    S.set("x", (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + " mm");
  }
});
