M507.define({
  number: 106,
  title: "Grooved cam, first form",
  lede: "A groove runs round the outside of a turning drum, slanting from one side to the other and back. A pin on a sliding rod sits in the groove. The rod slides to and fro along the drum at one steady speed each way, once for every turn.",
  alt: "A wide drum on a horizontal shaft, seen from the front. A smooth groove curves round its face like a gentle S. Above it a straight rod slides through two hanging guides, and a short arm from the rod ends in a pin that sits in the groove at the top of the drum.",
  parts: [
    { key: "drum", color: "#5E7387", name: "Grooved drum", note: "A wide drum that turns on its shaft. The groove cut round its outside is the only thing that moves the rod." },
    { key: "pin", color: "#C2503F", name: "Pin", note: "A short peg that fits in the groove. Watch it: it slides along the drum and back once for each turn." },
    { key: "rod", color: "#C8873A", name: "Sliding rod", note: "Runs through two guides above the drum. The pin carries it to and fro, side to side." }
  ],
  controls: [{ id: "stroke", label: "How far the rod slides", value: "20", options: [["12", "Short"], ["20", "Medium"], ["30", "Long"]] }],
  readouts: [{ id: "pos", label: "Rod position" }, { id: "vel", label: "Rod speed" }],
  views: { "3d": [330, 170, 520], front: [0, 30, 640], side: [640, 40, 10] },
  target: [0, 30, 0],
  how: [
    "Watch the pin. The drum turns, and the groove slides past underneath it. The groove leans to one side, so its wall pushes the pin sideways. The pin pushes the rod. After half a turn the groove has leaned as far as it goes, and the rod is at the far end.",
    "Then the groove leans back the other way, and the other wall pushes the pin home. The groove is cut so the rod moves the same distance in every second of turning. The speed reading stays the same all the way along, and only its sign changes. It dips only for a moment at each end, where the rod turns round.",
    "A spring is not needed, because the pin cannot leave the groove. Try Short, Medium and Long. A longer slide means the rod has to go faster to cover it in the same turn."
  ],
  note: "This model is rebuilt from Brown's drawing. The pin, the arm, the rod, the two guides, the ceiling, the shaft supports and the base were made up. So were the depth and width of the groove. The groove is shaped so the pin moves at a steady speed, except for a short, smooth turn at each end. The choice of stroke was added to show how the speed changes.",

  G: { N: 1, R: 70, DEPTH: 5, HW: 5, L: 90, RP: 3, E: .08 },

  // smooth triangle wave, period 1, peaks +1 at whole numbers and -1 at halves, corners rounded over a width E either side
  wave: function (u) {
    var E = this.G.E, d = Math.abs(u - Math.round(u)), t;
    if (d < E) t = 1 - 4 * (d * d / (2 * E) + E / 2);
    else if (.5 - d < E) { var e = .5 - d; t = -1 + 4 * (e * e / (2 * E) + E / 2); }
    else t = 1 - 4 * d;
    return t / (1 - 2 * E);
  },
  pathX: function (phi, A) { return A * this.wave(this.G.N * phi / (2 * Math.PI) + .5 - this.G.N / 4); },

  build: function (c) {
    var T = c.THREE, P = c.P, G = this.G, scene = c.scene;
    var o = this.o = { th: 0, A: null, dyn: [] };
    o.drum = new T.Group(); scene.add(o.drum);
    // end caps x -48..-45 and 45..48 (grooved surface runs x -45..45); shaft x -70..70, ends on the bearing faces
    P.at(P.cylX(7, 140, c.mat("drum")), 0, 0, 0, o.drum);
    P.at(P.cylX(G.R, 3, c.mat("drum", "light")), -46.5, 0, 0, o.drum);
    P.at(P.cylX(G.R, 3, c.mat("drum", "light")), 46.5, 0, 0, o.drum);
    // dark stripes on the cap faces, x 48..49.4 and -49.4..-48, y 10..66
    P.at(P.box(1.4, 56, 6, c.mat("drum", "dark")), 48.7, 38, 0, o.drum);
    P.at(P.box(1.4, 56, 6, c.mat("drum", "dark")), -48.7, 38, 0, o.drum);
    // follower group: rod y 96..104 (round, radius 4), arm x +-3.5, y 74..100, pin y 66..76 (groove floor is y 65)
    o.fol = new T.Group(); scene.add(o.fol);
    P.at(P.cylX(4, 200, c.mat("rod")), 0, 100, 0, o.fol);
    P.at(P.box(7, 26, 7, c.mat("rod")), 0, 87, 0, o.fol);
    P.at(P.cylY(G.RP, 10, c.mat("pin", "mark")), 0, 71, 0, o.fol);
    // guides at x 52..64 and -64..-52: top block y 104.5..140, z -12..12; cheeks y 91..104.5, z +-4.5..12; bottom block y 91..95.5, z -4.5..4.5
    [58, -58].forEach(function (x) {
      P.at(P.box(12, 35.5, 24, c.fixed), x, 122.25, 0, scene);
      P.at(P.box(12, 13.5, 7.5, c.fixed), x, 97.75, 8.25, scene);
      P.at(P.box(12, 13.5, 7.5, c.fixed), x, 97.75, -8.25, scene);
      P.at(P.box(12, 4.5, 9, c.fixed), x, 93.25, 0, scene);
    });
    // ceiling x -130..130, y 140..156, z -82..30; back plate x -130..130, y -84..140, z -82..-72; base x -130..130, y -96..-84, z -82..80
    P.at(P.box(260, 16, 112, c.fixed), 0, 148, -26, scene);
    P.at(P.box(260, 224, 10, c.fixed), 0, 28, -77, scene);
    P.at(P.box(260, 12, 162, c.fixed), 0, -90, -1, scene);
    // bearing blocks x 70..84 and -84..-70, y -84..22, z -15..15 (shaft ends on their inner faces)
    P.at(P.box(14, 106, 30, c.fixed), 77, -31, 0, scene);
    P.at(P.box(14, 106, 30, c.fixed), -77, -31, 0, scene);
  },

  makeDrum: function (c, A) {
    var T = c.THREE, P = c.P, G = this.G, o = this.o, self = this;
    o.dyn.forEach(function (m) { o.drum.remove(m); m.geometry.dispose(); });
    var m = P.groovedDrum({ radius: G.R, depth: G.DEPTH, length: G.L, halfWidth: G.HW, material: c.mat("drum"), floorMaterial: c.mat("drum", "dark"),
      path: function (phi) { return self.pathX(phi, A); } });
    o.dyn = m.children.slice();
    o.dyn.forEach(function (k) { o.drum.add(k); });
    o.A = A;
  },

  step: function (c, dt, S) {
    var o = this.o, G = this.G, TP = 2 * Math.PI, A = +S.controls.stroke;
    if (A !== o.A) this.makeDrum(c, A);
    o.th += S.w * dt;
    var phi = Math.PI / 2 - o.th;                       // the angle round the drum that is at the top, under the pin
    var x = this.pathX(phi, A), h = .002;
    o.drum.rotation.x = o.th;
    o.fol.position.x = x;
    var dxdphi = (this.pathX(phi + h, A) - this.pathX(phi - h, A)) / (2 * h);
    var v = -dxdphi * S.w;
    S.set("pos", (x > .05 ? "+" : "") + x.toFixed(0) + " mm");
    S.set("vel", (v > .05 ? "+" : "") + v.toFixed(0) + " mm/s");
  }
});
