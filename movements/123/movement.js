M507.define({
  number: 123,
  title: "Double rack and toothed halves",
  lede: "A frame with a toothed bar on each side slides up and down. Two half-wheels take turns to be pushed by the bars, and they turn one centre gear. The centre gear always goes round the same way, so straight pushing and pulling becomes steady turning.",
  alt: "A tall frame with a toothed bar down each side stands in the middle. To the left and right of it is a half-wheel with teeth on its curved edge. Behind each half-wheel is a small gear, and both small gears touch one larger centre gear that is seen through the gap between the bars.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Double rack", note: "A frame with a toothed bar on each side, called a rack. It slides up and down. Watch the red block on it." },
    { key: "sector", color: "#C8873A", name: "Toothed sectors", note: "Two slices of a wheel with teeth on their curved edge, called sectors. Each has a small gear fixed behind it. Both turn the same way all the time." },
    { key: "centre", color: "#4FA58A", name: "Centre gear", note: "The output. It sits behind the frame and is turned by the two small gears. The red stripe shows that it always goes round the same way." }
  ],
  speed: { min: 5, max: 40, value: 15, label: "Up and down", unit: " a min" },
  readouts: [{ id: "y", label: "Frame" }, { id: "who", label: "Pushing" }, { id: "out", label: "Centre gear" }],
  views: { "3d": [330, 120, 640], front: [0, 0, 560], side: [540, 60, 80] },
  viewLabels: { "3d": "3D", front: "Front", side: "Side" },
  target: [0, -25, 10],
  distance: [300, 1500],
  how: [
    "The frame slides up and down. Its two toothed bars face two half-wheels, one on each side. A half-wheel has teeth along only part of its curved edge, so it grips a bar for part of each turn and then lets go.",
    "When the frame rises, the left half-wheel is pushed round. Its teeth run out and the frame stops for a moment. Then the right half-wheel's first tooth meets the other bar, and the frame starts to come down. Now the right half-wheel is pushed round the same way. A small gear fixed behind each half-wheel turns the centre gear, so the centre gear never stops and never turns back.",
    "Slow the speed right down. Follow the red block as the frame goes up and down, and watch the red stripe on the centre gear. The frame changes direction every time, but the stripe never does."
  ],
  note: "This model is rebuilt from Brown's drawing. The two stops on the rack and the curved piece on the centre gear are left out. Here the centre gear keeps the two half-wheels in step, and the teeth are lined up by calculation, so each half-wheel meets its bar after the other has let go. The stand, the guide blocks, the end bars, the sizes and the numbers of teeth were made up. The frame stops and turns round in an instant at each end, which a real one would only manage with a heavy wheel to carry it through. The teeth are left out of the ends of each half-wheel so that they never clash with the bars.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var MD = 4, NS = 32, NP = 22, NC = 30, NR = 18;                  // module, sector teeth, small gear teeth, centre gear teeth, rack teeth
    var RS = NS * MD / 2, RP = NP * MD / 2, RC = NC * MD / 2, D = RP + RC, p = Math.PI * MD, L = NR * p;   // 64, 44, 60, 104, 12.566, 226.2
    var XB = D - RS;                                                // rack pitch lines at x = -+40
    var o = this.o = { theta: 0, H: 84 * Math.PI / 180, RS: RS, p: p, RP: RP, RC: RC, NP: NP, NC: NC };
    var mf = c.mat("frame"), ms = c.mat("sector"), mc = c.mat("centre");

    // frame, z 12..28: two racks, two end bars, two rods, all sliding in y
    var F = o.frame = new T.Group(); scene.add(F);
    [-1, 1].forEach(function (s) {
      var r = P.rack({ teeth: NR, module: MD, side: s, body: 16, thick: 16, material: mf });
      r.position.set(s * XB, -L / 2, 20); F.add(r);                 // pitch line x -+40, root -+35, back -+19, y -113.1..113.1, z 12..28; spaces at y = n*p
    });
    [-1, 1].forEach(function (s) {
      P.at(P.box(100, 8, 16, mf), 0, s * (L / 2 + 4), 20, F);       // end bar x -50..50, y 113.1..121.1 (or -121.1..-113.1), z 12..28, on the rack ends
      P.at(P.cylY(7, 24, mf), 0, s * (L / 2 + 8 + 12), 20, F);      // rod y 121.1..145.1, starts on the end bar's outer face
    });
    P.at(P.box(10, 10, 1, c.mat("frame", "mark")), -27, -50, 29, F);     // red block z 28.5..29.5, lifted .5 off the rack's front face z 28

    // two sectors, each with a small gear behind it, on a shaft; the centre gear
    function wheel(x, withSector) {
      var g = new T.Group(); g.position.set(x, 0, 0); scene.add(g);
      P.at(P.cylZ(7, 40, ms), 0, 0, 8, g);                          // shaft z -12..28, starts at the back plate's face
      P.at(P.spurGear({ teeth: NP, module: MD, width: 14, material: ms }), 0, 0, -3, g);   // small gear z -10..4
      P.at(P.cylZ(12, 8, ms), 0, 0, 8, g);                          // hub z 4..12
      var sec = P.gearSector({ teeth: NS, module: MD, fromDeg: -57, toDeg: 57, width: 16, material: ms });
      P.at(sec, 0, 0, 20, g);                                       // sector z 12..28
      P.at(P.cylZ(14, 4, ms), 0, 0, 30, g);                         // boss z 28..32
      P.at(P.box(40, 3, 1, c.mat("sector", "dark")), 34, 0, 29, g);     // stripe x 14..54, z 28.5..29.5, lifted .5 off the sector face z 28
      return g;
    }
    o.left = wheel(-D); o.right = wheel(D);
    var C = o.centre = new T.Group(); scene.add(C);
    P.at(P.cylZ(7, 24, mc), 0, 0, 0, C);                            // shaft z -12..12, hidden in the gear and boss, starts at the back plate's face
    P.at(P.spurGear({ teeth: NC, module: MD, width: 14, material: mc }), 0, 0, -3, C);   // centre gear z -10..4
    P.at(P.cylZ(12, 4, mc), 0, 0, 6, C);                            // boss z 4..8
    P.at(P.box(30, 4, 1, c.mat("centre", "mark")), 28, 0, 5, C);    // stripe x 13..43, z 4.5..5.5, lifted .5 off the gear face z 4

    // supports
    P.at(P.box(340, 280, 8, c.fixed), 0, 0, -16, scene);            // back plate x -170..170, y -140..140, z -20..-12
    [1, -1].forEach(function (s) {
      [-1, 1].forEach(function (t) {
        P.at(P.box(16, 64, 24, c.fixed), t * 27, s * 98, 0, scene);  // guide block x t*19..t*35, y 66..130, z -12..12: on the plate's face z -12, and the frame's back face z 12 rests on it
      });
    });
  },

  step: function (c, dt, S) {
    var o = this.o, th = o.theta = o.theta + S.w * dt, TP = 2 * Math.PI;
    var u = ((th + Math.PI / 2) % TP + TP) % TP - Math.PI / 2, Y;
    var left = u <= Math.PI / 2;
    Y = left ? o.RS * u : o.RS * (Math.PI - u);
    Y = Math.max(-o.RS * o.H, Math.min(o.RS * o.H, Y));      // the frame waits while neither half-wheel has teeth in reach
    o.frame.position.y = Y;
    o.left.rotation.z = th; o.right.rotation.z = th;
    o.centre.rotation.z = Math.PI / o.NC - th * o.NP / o.NC;
    S.set("y", (Y > 0.5 ? "+" : Y < -0.5 ? "−" : "") + Math.abs(Math.round(Y)) + " mm");
    S.set("who", left ? "Left" : "Right");
    S.set("out", "−" + Math.round(S.w * 30 / Math.PI * o.NP / o.NC) + " rpm");
  }
});
