M507.define({
  number: 252,
  title: "Two rollers moved by oblique slots",
  lede: "Two rollers sit side by side in a straight slot. A frame with two slanting slots slides up and down below them. Each slanting slot pushes its roller sideways, so the two rollers move apart and together by the same amount.",
  alt: "A horizontal slotted bar with two round rollers in it. Below, a triangular frame with two slanting slots slides up and down. A pin from each roller runs in a slanting slot.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Sliding frame", note: "A triangle-shaped frame with a slanting slot in each arm. A rod below it slides up and down in a guide." },
    { key: "guide", color: "#4FA58A", name: "Straight slot", note: "A fixed bar with a level slot. The roller pins can only slide along it." },
    { key: "roller", color: "#C8873A", name: "Rollers", note: "Watch these two. Each has a pin that goes through the straight slot and the slanting slot at once." }
  ],
  controls: [{ id: "k", label: "Slots lean", value: "b", options: [["a", "A little"], ["b", "As drawn"], ["c", "A lot"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Strokes", unit: " a min" },
  readouts: [{ id: "f", label: "Frame" }, { id: "g", label: "Rollers apart" }],
  views: { "3d": [400, -40, 1000], front: [0, -150, 1080], side: [980, -150, 100] },
  target: [0, -150, 0],
  how: [
    "The frame moves straight up and down. The rollers can only move left and right, because their pins sit in the level slot. Each pin also sits in a slanting slot in the frame.",
    "When the frame rises, the slanting slots lean in toward each other and push the pins apart. When the frame sinks, the slots pull the pins back together. Both slots lean the same amount, so both rollers move the same distance.",
    "A slot that leans more pushes the rollers further for the same frame stroke. Try the three slot angles and watch how far apart the rollers get."
  ],
  note: "This model is rebuilt from Brown's drawing. The slanting slots, the sliding rod and its guide, the stand and the thickness of the plates were made up. The roller pins stick out behind the frame so you can see them in the slots. The rollers are kept clear of each other at every setting.",

  build: function (c) {
    var T = c.THREE, P = c.P, i, s;
    var o = this.o = { th: 0, H0: 205, AMP: 35, sets: {}, rollers: [] };
    var KS = { a: .25, b: .4, c: .6 };
    o.KS = KS;
    // frame group: local y = 0 is the top of the base bar; the group sits at world y = -h
    o.fr = new T.Group(); c.scene.add(o.fr);
    var fm = c.mat("frame");
    P.at(P.box(2 * 190, 22, 10, fm), 0, -11, -10, o.fr);          // base bar x -190..190, y -22..0, z -15..-5
    P.at(P.box(36, 30, 12, fm), 0, -37, -10, o.fr);                // block under the bar, y -52..-22, z -16..-4
    P.at(P.cylY(5, 85, c.mat("frame", "dark")), 0, -94.5, -10, o.fr); // rod, y -137..-52
    Object.keys(KS).forEach(function (key) {
      var k = KS[key], g = new T.Group(), sq = Math.sqrt(1 + k * k), hw = 24 * sq;
      function xc(y) { return -60 + k * (y - o.H0); }
      [-1, 1].forEach(function (sd) {
        var ol = [[xc(-12) - hw, -12], [xc(-12) + hw, -12], [xc(275) + hw, 275], [xc(275) - hw, 275]].map(function (p) { return [sd * p[0], p[1]]; });
        var sl = [[sd * xc(40), 40], [sd * xc(262), 262]];
        P.at(P.slottedPlate({ outline: ol, slot: sl, half: 9, thick: 8, material: fm }), 0, 0, -10, g);   // z -14..-6
      });
      g.visible = false; o.fr.add(g); o.sets[key] = g;
    });
    // straight slot bar: rails above and below the slot, x -250..260
    var gm = c.mat("guide");
    P.at(P.box(510, 26, 8, gm), 5, 22, 0, c.scene);               // y 9..35, z -4..4
    P.at(P.box(510, 26, 8, gm), 5, -22, 0, c.scene);              // y -35..-9
    P.at(P.box(50, 18, 8, gm), -225, 0, 0, c.scene);              // closes the slot, x -250..-200
    // rollers: pin through both slots, disc in front
    for (s = -1; s <= 1; s += 2) {
      var r = new T.Group();
      P.at(P.cylZ(8, 29, c.mat("roller", "dark")), 0, 0, -1, r);       // pin z -15.5..13.5
      P.at(P.cylZ(36, 8, c.mat("roller")), 0, 0, 10, r);              // disc z 6..14
      P.at(P.cylZ(11, 2, c.mat("roller", "dark")), 0, 0, 15, r);      // pin head z 14..16
      P.at(P.box(3, 9, 1, c.mat("roller", "dark")), 0, 29, 14.8, r);  // tick on the rim, z 14.3..15.3
      c.scene.add(r); o.rollers.push(r);
    }
    // stand: ground slab, column at the left end, guide for the rod
    P.at(P.box(552, 12, 80, c.fixed), 0, -394, 0, c.scene);        // y -400..-388
    P.at(P.box(28, 422, 20, c.fixed), -262, -177, 0, c.scene);   // x -276..-248, y -388..34 (1 under the bar top), z -10..10
    P.at(P.guideBlock({ w: 36, h: 90, d: 30, hole: 5.8, material: c.fixed }), 0, -343, -10, c.scene);  // y -388..-298, z -25..5
  },

  step: function (c, dt, S) {
    var o = this.o, key = S.controls.k || "b", k = o.KS[key];
    o.th += S.w * dt;
    var h = o.H0 + o.AMP * Math.cos(o.th);
    o.fr.position.y = -h;
    ["a", "b", "c"].forEach(function (q) { o.sets[q].visible = q === key; });
    var px = 60 - k * (h - o.H0);                          // half the roller spacing
    o.rollers[0].position.x = -px; o.rollers[1].position.x = px;
    S.set("f", (o.H0 - h >= 0 ? "+" : "−") + Math.abs(o.H0 - h).toFixed(0) + " mm");
    S.set("g", (2 * px).toFixed(0) + " mm");
  }
});
