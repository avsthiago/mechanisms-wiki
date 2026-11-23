M507.define({
  number: 68,
  title: "Single tooth and notched wheel",
  lede: "A wheel with one tooth turns a notched wheel one notch at a time. Between pushes, the round edge of the first wheel holds the notched wheel still. So no extra catch is needed to stop it.",
  alt: "Two discs of about the same size side by side on short shafts in an upright plate. The left disc has one small red tooth on its edge. The right disc has small notches round its edge, with a shallow hollow between each pair. A crank turns the left disc.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "A round disc with one small tooth on its edge, turned by the crank. Watch the red tooth slip into a notch once each turn." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "It has small notches round its edge, with a shallow hollow between each pair. The dark stripe shows how far it has turned." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the driving gear. In a real machine an engine would do this." }
  ],
  readouts: [{ id: "in", label: "Driving gear" }, { id: "out", label: "Driven gear" }],
  views: { "3d": [260, 150, 560], front: [0, 0, 620], side: [620, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Turn the crank and the left wheel goes round steadily. Once each turn, its tooth slips into a notch of the right wheel. It pushes that wheel round by one notch, then slides out again.",
    "The rest of the time the right wheel cannot move. One of its hollows fits closely round the edge of the left wheel, which keeps turning inside it. Beside the tooth the edge is cut back a little. That lets the corners of the notched wheel swing past while it moves.",
    "Watch the two readouts. Each turn of the crank moves the wheel exactly one notch. Slow the speed right down to see the tooth go in and come out."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the plate that holds the shafts and the sizes were made up. The cut-backs beside the tooth and the curve of the hollows were worked out so the tooth moves the wheel exactly one notch and nothing rubs. As in a real one, the tooth gives the wheel a small knock as it goes in.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = 150, RL = 74, CL = .6, N = 10, ST = 2 * Math.PI / N, DEG = Math.PI / 180;
    var ETA = 4 * DEG, RBOT = 65, SHIFT = -2.07 * DEG, RH = RL + CL;
    // notched wheel outline: hollows that are arcs round the driver's centre when locked, and small round-bottomed notches;
    // the notches sit a little off centre between hollows so the tooth moves the wheel exactly one notch (found by trial)
    function rim(g) {
      var k = Math.round((g - ST / 2 - SHIFT) / ST), psi = g - (ST / 2 + SHIFT + k * ST), u, j, ph;
      if (Math.abs(psi) < ETA) { u = psi / ETA; return RBOT + 2.5 * (1 - Math.sqrt(Math.max(0, 1 - u * u))); }
      j = Math.round((g - SHIFT) / ST); ph = g - j * ST;
      return D * Math.cos(ph) - Math.sqrt(RH * RH - D * D * Math.sin(ph) * Math.sin(ph));
    }
    var dr = P.oneToothDrive({ dist: D, drivenR: rim, finger: { base: 45, tip: 74, half: 4 }, lockR: RL, clear: CL, dir: -1, pitch: ST });
    var o = this.o = { dr: dr, st: ST, b0: 48 * DEG, b: 48 * DEG };       // the tooth starts up and to the right, as Brown draws it
    function plate(shape, mat) { var g = new T.ExtrudeGeometry(shape, { depth: 16, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, -8); return new T.Mesh(g, mat); }
    // toothed wheel: disc z -8..8, shaft z -30..30 (from the plate face), hub z 8..12, crank arm z 30..36, handle z 36..60
    o.g1 = new T.Group(); o.g1.position.set(-D / 2, 0, 0); scene.add(o.g1);
    o.g1.add(plate(dr.driverShape(), c.mat("drive")));
    P.at(P.cylZ(6, 60, c.mat("drive")), 0, 0, 0, o.g1);                   // shaft z -30..30
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 10, o.g1);                  // hub z 8..12, on the disc face
    P.at(P.box(26, 5, 1, c.mat("drive", "mark")), 61, 0, 9, o.g1);         // red stripe x 48..74 along the tooth, z 8.5..9.5, lifted off the face
    P.at(P.box(52, 12, 6, c.mat("crank")), -22, 0, 33, o.g1);             // arm x -48..4, z 30..36, on the shaft end
    P.at(P.cylZ(5, 24, c.mat("crank")), -44, 0, 48, o.g1);                // handle z 36..60, on the arm face
    // notched wheel: disc z -8..8, shaft z -30..8 (plate face to disc face), hub z 8..12
    o.g2 = new T.Group(); o.g2.position.set(D / 2, 0, 0); scene.add(o.g2);
    o.g2.add(plate(dr.drivenShape(), c.mat("driven")));
    P.at(P.cylZ(6, 38, c.mat("driven")), 0, 0, -11, o.g2);                // shaft z -30..8
    P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 10, o.g2);                 // hub z 8..12
    P.at(P.box(46, 5, 1, c.mat("driven", "dark")), 37, 0, 9, o.g2);        // dark stripe x 14..60, z 8.5..9.5, lifted off the face
    // supports
    P.at(P.box(350, 210, 10, c.fixed), 0, 0, -35, scene);                 // plate x -175..175, y -105..105, z -40..-30; shafts end at z -30
    P.at(P.box(390, 12, 100, c.fixed), 0, -111, -30, scene);              // base x -195..195, y -117..-105, z -80..20; plate stands on y -105
  },

  step: function (c, dt, S) {
    var o = this.o, t;
    o.b -= S.w * dt;                                       // the toothed wheel turns clockwise, as Brown's arrow shows
    t = o.dr.theta(o.b);
    o.g1.rotation.z = o.b;
    o.g2.rotation.z = t;
    var turns = (o.b0 - o.b) / (2 * Math.PI), n = Math.floor(Math.abs(t) / o.st + 1e-6);
    S.set("in", turns.toFixed(1) + " turns");
    S.set("out", n + (n === 1 ? " notch" : " notches"));
  }
});
