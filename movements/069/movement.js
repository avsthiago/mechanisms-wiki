M507.define({
  number: 69,
  title: "One-tooth driver",
  lede: "A small wheel with one tooth turns a big toothed wheel one tooth at a time. Between pushes, the round edge of the small wheel sits between two teeth and holds the big wheel still. It is a simple way to make a wheel turn very slowly, in steps.",
  alt: "A big wheel with many pointed teeth all round, and a small round wheel at its upper right, both on short shafts in an upright plate. The small wheel has a short red tooth between two cut-outs, and a crank.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "A small round wheel with a single tooth between two cut-outs, turned by the crank. Watch the red tooth push the big wheel." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "A big wheel with pointed teeth all round. The dark stripe shows how far it has turned." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the small wheel. In a real machine an engine would do this." }
  ],
  readouts: [{ id: "in", label: "Driving gear" }, { id: "out", label: "Driven gear" }],
  views: { "3d": [240, 140, 600], front: [-10, 0, 660], side: [660, 0, 0] },
  target: [-10, -10, 0],
  how: [
    "Turn the crank and the small wheel goes round steadily. Once each turn, its tooth catches a tooth of the big wheel. It pushes the big wheel on by one tooth, then lets go.",
    "The rest of the time the round edge of the small wheel rests between two teeth, touching both tips. So the big wheel cannot turn either way. The cut-outs beside the tooth let the tips swing past while the big wheel moves.",
    "The big wheel moves one tooth for each turn of the crank, so it turns very slowly. Count the turns and the teeth moved. Then slow the speed right down to watch the tooth take over from the round edge."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the plate and the sizes were made up, and the cut-outs were worked out so nothing rubs. Brown draws the tooth sticking well out past the round edge. A tooth that long would push the big wheel more than one tooth, and the round edge would then hit a tip. So here the tooth only just reaches past the edge. It gives the big wheel a small knock as it starts to push.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = 150, R = 120, DEPTH = 14, N = 30, ST = 2 * Math.PI / N, CL = .6, DEG = Math.PI / 180;
    // the round edge touches the two tips either side of the gap facing it, so its radius is their distance less a small gap
    var RL = Math.sqrt(D * D + R * R - 2 * D * R * Math.cos(ST / 2)) - CL;
    function rim(g) {                                       // plain pointed teeth; at rest a gap faces the small wheel (local -X)
      var u = (g - Math.PI + ST / 2) / ST; u -= Math.floor(u); u = Math.min(u, 1 - u);
      return R - DEPTH * 2 * u;
    }
    // tooth length found by trial: the shortest that still catches a tip, so each push moves the wheel exactly one tooth
    var dr = P.oneToothDrive({ dist: D, drivenR: rim, finger: { base: 12, tip: 29.15, half: 4 }, lockR: RL, clear: CL, dir: 1, pitch: ST });
    var AX = -35, AY = -20, PHI = 206 * DEG;               // the small wheel sits up and to the right of the big one, as Brown draws it
    var o = this.o = { dr: dr, st: ST, phi: PHI, b0: 30 * DEG - PHI };   // its tooth starts pointing up and to the right, away from the teeth
    o.b = o.b0;
    function plate(shape, mat) { var g = new T.ExtrudeGeometry(shape, { depth: 16, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, -8); return new T.Mesh(g, mat); }
    // big toothed wheel: disc z -8..8, shaft z -30..8 (plate face to disc face), hub z 8..12
    o.g2 = new T.Group(); o.g2.position.set(AX, AY, 0); scene.add(o.g2);
    o.g2.add(plate(dr.drivenShape(), c.mat("driven")));
    P.at(P.cylZ(6, 38, c.mat("driven")), 0, 0, -11, o.g2);                // shaft z -30..8
    P.at(P.cylZ(12, 4, c.mat("driven")), 0, 0, 10, o.g2);                 // hub z 8..12
    P.at(P.box(80, 5, 1, c.mat("driven", "dark")), 56, 0, 9, o.g2);        // dark stripe x 16..96, z 8.5..9.5, lifted off the face
    // small one-tooth wheel: disc z -8..8, shaft z -30..30, hub z 8..12, crank arm z 30..36, handle z 36..60
    o.g1 = new T.Group(); o.g1.position.set(AX + D * Math.cos(PHI - Math.PI), AY + D * Math.sin(PHI - Math.PI), 0); scene.add(o.g1);
    o.g1.add(plate(dr.driverShape(), c.mat("drive")));
    P.at(P.cylZ(6, 60, c.mat("drive")), 0, 0, 0, o.g1);                   // shaft z -30..30
    P.at(P.cylZ(10, 4, c.mat("drive")), 0, 0, 10, o.g1);                  // hub z 8..12
    P.at(P.box(18, 5, 1, c.mat("drive", "mark")), 20, 0, 9, o.g1);         // red stripe x 11..29 along the tooth, z 8.5..9.5, lifted off the face
    P.at(P.box(44, 10, 6, c.mat("crank")), -18, 0, 33, o.g1);             // arm x -40..4, z 30..36, on the shaft end
    P.at(P.cylZ(5, 24, c.mat("crank")), -34, 0, 48, o.g1);                // handle z 36..60, on the arm face
    // supports
    P.at(P.box(330, 270, 10, c.fixed), -10, -15, -35, scene);             // plate x -175..155, y -150..120, z -40..-30; shafts end at z -30
    P.at(P.box(370, 12, 100, c.fixed), -10, -156, -30, scene);            // base x -195..175, y -162..-150, z -80..20; plate stands on y -150
  },

  step: function (c, dt, S) {
    var o = this.o, t;
    o.b += S.w * dt;                                       // the small wheel turns anticlockwise, as Brown's arrow shows
    t = o.dr.theta(o.b);
    o.g1.rotation.z = o.phi + o.b;
    o.g2.rotation.z = o.phi + t;
    var turns = (o.b - o.b0) / (2 * Math.PI), n = Math.floor(Math.abs(t) / o.st + 1e-6);
    S.set("in", turns.toFixed(1) + " turns");
    S.set("out", n + (n === 1 ? " tooth" : " teeth"));
  }
});
