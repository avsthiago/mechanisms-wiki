M507.define({
  number: 132,
  title: "Press with slanting bars",
  lede: "Two slanting bars stand between a top disc and a bottom disc. When the top disc is turned, the bars lean upright and push the bottom disc down. A short twist of the lever gives a strong squeeze, so this was used in presses.",
  alt: "A stone-like frame on two columns holds a round top disc under its beam. A long lever sticks out sideways from the top disc. Two crossing bars run down from the top disc to a smaller disc on a wide flat platen. A small block sits on the floor below.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Lever and top disc", note: "The top disc can only turn. It cannot move up or down. The lever turns it. Watch the red stripe on its rim." },
    { key: "bars", color: "#D9B13B", name: "Slanting bars", note: "Two stiff bars of fixed length. Each end sits in a hole in a disc. They lean at first, then stand more and more upright." },
    { key: "platen", color: "#C8873A", name: "Platen", note: "The bottom disc and the wide block under it. It cannot turn, so it is pushed straight down. Watch it." },
    { key: "blank", color: "#4FA58A", name: "Bed and blank", note: "The block on the floor, and the piece of metal on top of it. The platen squeezes the piece against the block." }
  ],
  controls: [{ id: "swing", label: "Lever swing", value: "f", options: [["f", "Full"], ["h", "Half"]] }],
  readouts: [{ id: "a", label: "Lever" }, { id: "d", label: "Platen down" }],
  views: { "3d": [480, 130, 660], front: [0, -10, 640], side: [640, -10, 0] },
  target: [0, -10, 0],
  distance: [260, 1600],
  how: [
    "Swing the lever. It turns the top disc. The top ends of the bars are in holes in that disc, so they move round with it. The bottom ends are in the bottom disc, which cannot turn.",
    "The bars cannot get longer or shorter. So when their top ends come round above their bottom ends, the bars have to stand more upright. That pushes the bottom disc down. The platen drops fast at first, then slower and slower, and the push gets stronger.",
    "Try the full swing, then the half swing. Watch how far the platen goes down each time, and how the bars lean."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the columns, the floor, the block and the piece of metal, the sizes and the bar holes were made up. Brown draws the lever pushed sideways; here it swings round and back so the motion can repeat. Small guide lugs on the platen slide on the columns so it stays level. The top stalk on the beam is only for looks.",

  K: { R: 38, DELTA0: 130, H0: 60, YD: 30, TURN: { f: 122, h: 61 } },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, rad = Math.PI / 180;
    var d0 = 2 * K.R * Math.sin(K.DELTA0 * rad / 2);
    K.L = Math.sqrt(K.H0 * K.H0 + d0 * d0);                       // bar length, fixed
    var o = this.o = { u: 0, bars: [] };
    function cone(rt, rb, h, m) { return new T.Mesh(new T.CylinderGeometry(rt, rb, h, 40), m); }

    // upper assembly, turns about Y
    o.spin = new T.Group(); scene.add(o.spin);
    P.at(P.cylY(28, 30, c.mat("lever")), 0, 98, 0, o.spin);                 // collar y 83..113, r 28; top touches the cornice
    P.at(cone(28, 44, 31, c.mat("lever")), 0, 67.5, 0, o.spin);             // cone y 52..83
    P.at(P.cylY(50, 22, c.mat("lever")), 0, 41, 0, o.spin);                 // top disc y 30..52, r 50
    P.at(P.cylX(7, 122, c.mat("lever")), 89, 95, 0, o.spin);                // lever x 28..150, y 88..102
    P.at(P.sphere(7, c.mat("lever")), 150, 95, 0, o.spin);                  // rounded tip
    P.at(P.box(6, 20, 1.5, c.mat("lever", "mark")), 0, 41, 50.75, o.spin);  // red stripe on the rim, lifted off the rim
    [0, 180].forEach(function (deg) {
      var a = (K.DELTA0 > 0 ? 135 - K.DELTA0 + deg : 0) * rad;
      P.at(P.cylY(9, 1, c.mat("lever", "dark")), K.R * Math.cos(a), 29.5, K.R * Math.sin(a), o.spin);   // hole, y 29..30
    });

    // platen: small disc y -44..-30, platen y -77..-44; group moves down
    o.platen = new T.Group(); scene.add(o.platen);
    P.at(P.cylY(50, 14, c.mat("platen")), 0, -37, 0, o.platen);             // y -44..-30
    P.at(P.box(170, 33, 80, c.mat("platen")), 0, -60.5, 0, o.platen);       // x -85..85, y -77..-44, z -40..40
    [-1, 1].forEach(function (s) {
      P.at(P.box(6, 33, 30, c.mat("platen")), s * 88, -60.5, -30, o.platen);   // lug x 85..91 touches the column face, z -45..-15
    });
    [135, 315].forEach(function (deg) {
      var a = deg * rad;
      P.at(P.cylY(9, 1, c.mat("platen", "dark")), K.R * Math.cos(a), -29.5, K.R * Math.sin(a), o.platen);   // hole, y -30..-29
    });

    // bars
    for (var k = 0; k < 2; k++) {
      var b = P.rod(5, c.mat("bars")); scene.add(b);
      var s1 = P.at(P.sphere(5, c.mat("bars")), 0, 0, 0, scene), s2 = P.at(P.sphere(5, c.mat("bars")), 0, 0, 0, scene);
      o.bars.push({ rod: b, s1: s1, s2: s2 });
      b.userData.live = true;
    }

    // fixed frame
    var G = -138;
    P.at(P.box(340, 6, 140, c.fixed), 0, G - 3, 0, scene);                  // floor x -170..170, y -144..-138, z -70..70
    P.at(P.box(80, 23, 80, c.mat("blank")), 0, G + 11.5, 0, scene);         // bed x -40..40, y -138..-115, z -40..40
    o.blankTop = G + 23 + 7;
    P.at(P.cylY(30, 7, c.mat("blank")), 0, G + 23 + 3.5, 0, scene);         // blank y -115..-108
    [-1, 1].forEach(function (s) {
      P.at(P.box(28, 12, 38, c.fixed), s * 99, G + 6, -30, scene);          // plinth x 85..113, y -138..-126, z -49..-11
      P.at(P.box(16, 239, 30, c.fixed), s * 99, -6.5, -30, scene);          // column x 91..107, y -126..113, z -45..-15
    });
    P.at(P.box(240, 15, 100, c.fixed), 0, 120.5, 0, scene);                 // cornice x -120..120, y 113..128, z -50..50
    P.at(P.box(270, 22, 90, c.fixed), 0, 139, 0, scene);                    // beam x -135..135, y 128..150, z -45..45
    P.at(P.cylY(17, 16, c.fixed), 0, 158, 0, scene);                        // stalk y 150..166
  },

  place: function (o, alphaDeg) {
    var K = this.K, rad = Math.PI / 180, YT = K.YD;
    var delta = (K.DELTA0 - alphaDeg) * rad;
    var d = 2 * K.R * Math.sin(delta / 2), h = Math.sqrt(K.L * K.L - d * d);
    var down = h - K.H0;
    o.spin.rotation.y = -alphaDeg * rad;
    o.platen.position.y = -down;
    var yb = YT - h;
    for (var k = 0; k < 2; k++) {
      var bot = (135 + 180 * k) * rad, top = (135 - K.DELTA0 + alphaDeg + 180 * k) * rad, B = o.bars[k];
      B.rod.span(K.R * Math.cos(top), YT, K.R * Math.sin(top), K.R * Math.cos(bot), yb, K.R * Math.sin(bot));
      B.s1.position.set(K.R * Math.cos(top), YT, K.R * Math.sin(top));
      B.s2.position.set(K.R * Math.cos(bot), yb, K.R * Math.sin(bot));
    }
    return down;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    if (S.playing) o.u += S.w * dt;
    var f = (1 - Math.cos(o.u)) / 2, alpha = K.TURN[S.controls.swing === "h" ? "h" : "f"] * f;
    var down = this.place(o, alpha);
    S.set("a", Math.round(alpha) + "°");
    S.set("d", down.toFixed(0) + " mm");
  }
});
