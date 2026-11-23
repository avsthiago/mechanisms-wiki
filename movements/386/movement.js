M507.define({
  number: 386,
  title: "Folding library ladder",
  lede: "A ladder whose rounds are hinged to its two side pieces. When folded, the rounds shut up inside the sides and the whole ladder becomes one round pole. That makes it easy to store.",
  alt: "A ladder with two upright side pieces and four rounds between them. The rounds lean, the right side piece rises, and the ladder folds into a single pole.",
  parts: [
    { key: "sides", color: "#5E7387", name: "Side pieces", note: "Two long uprights. Each has a slot down its inner face, deep enough to hold the folded rounds." },
    { key: "rounds", color: "#C8873A", name: "Rounds", note: "The steps. Each one is hinged at both ends, one end on each side piece. They are all the same length and stay parallel." },
    { key: "pivots", color: "#C2503F", name: "Hinge pins", note: "The pins the rounds swing on. Watch the red heads as the rounds tip over." }
  ],
  controls: [{ id: "fold", label: "Folding", type: "range", min: 0, max: 100, step: 1, value: 0, unit: "%", presets: [[0, "Open"], [45, "Partly open"], [100, "Closed"]], pauseOnInput: true }],
  readouts: [{ id: "gap", label: "Gap" }, { id: "ang", label: "Rounds lean" }],
  views: { "3d": [63, 14, 855], front: [0, 50, 1000], side: [1000, 50, 0] },
  target: [-14, 3, 0],
  distance: [150, 2000],
  how: [
    "The ladder starts open, with the rounds flat between the sides. Then the rounds tip over, one by one in step. The right side piece slides up and in, and the gap between the sides gets smaller until the sides meet.",
    "All four rounds are the same length and are hinged the same distance apart on both sides. So they always stay parallel to each other. As they tip, the right side moves along a small circle: it comes in and goes up. When the rounds stand upright, they lie in the slots and the sides close into one pole.",
    "Slide the folding bar from Open to Partly open to Closed. Watch the gap and the lean of the rounds in the readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the ladder open, half open and closed, so the model moves through all three. The number of rounds, their spacing and the shape of the slots were made up. The side pieces are drawn square instead of half round. The notch at the top of each side piece is left out.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: 0, was: false, LK: 84, wp: 34, HL: 205, ys: [-150, -50, 50, 150], rd: [], pin: [] };
    var root = o.root = new T.Group(); root.position.x = -50; scene.add(root);
    var ms = c.mat("sides"), mr = c.mat("rounds"), mp = c.mat("pivots");
    function post() {
      var g = new T.Group();
      P.at(P.box(22, 2 * o.HL, 44, ms), -23, 0, 0, g);                        // body x -34..-12
      P.at(P.box(12, 2 * o.HL, 7, ms), -6, 0, 18.5, g);                        // front lip x -12..0, z 15..22
      P.at(P.box(12, 2 * o.HL, 7, ms), -6, 0, -18.5, g);                       // back lip z -22..-15
      return g;
    }
    o.L = post(); root.add(o.L);
    o.R = post(); o.R.scale.x = 1; root.add(o.R);                              // right post is the same shape; its inner face (slot side) is turned to face left in step()
    o.R.rotation.y = Math.PI;                                                  // body now on +x side, lips facing -x
    o.ys.forEach(function (y, i) {
      var g = new T.Group(); root.add(g);
      P.at(P.box(o.LK, 9, 29, mr), o.LK / 2, 0, 0, g);                        // bar from pin to pin, z -14.5..14.5
      P.at(P.cylZ(4.5, 29, mr), 0, 0, 0, g); P.at(P.cylZ(4.5, 29, mr), o.LK, 0, 0, g);
      o.rd.push(g);
      [0, 1].forEach(function (k) {
        var p = new T.Group(); root.add(p);
        P.at(P.cylZ(3.5, 46, mp), 0, 0, 0, p);
        P.at(P.cylZ(5.5, 1.5, mp), 0, 0, 23.75, p); P.at(P.cylZ(5.5, 1.5, mp), 0, 0, -23.75, p);
        o.pin.push(p);
      });
    });
  },

  step: function (c, dt, S) {
    var o = this.o, LK = o.LK, i;
    function sm(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    var phiMax = Math.acos(12.8 / LK), fold;
    if (S.playing) {
      if (!o.was) { var t = Math.max(0, Math.min(1, S.controls.fold / 100)); o.th = (.1 + .3 * (.5 - Math.sin(Math.asin(1 - 2 * t) / 3))) * 2 * Math.PI; }
      o.th += S.w * dt * .2;
      var p = (o.th / (2 * Math.PI)) % 1;
      fold = 100 * (sm(.1, .4, p) - sm(.6, .9, p));
      S.setControl("fold", Math.round(fold));
    } else fold = S.controls.fold;
    o.was = S.playing;
    var phi = fold / 100 * phiMax, s = Math.max(.8, LK * Math.cos(phi) - 12), rise = LK * Math.sin(phi);
    o.L.position.x = 0;
    o.R.position.set(s, rise, 0);                                                // inner face of the right post at x = s
    for (i = 0; i < 4; i++) {
      var y = o.ys[i];
      o.rd[i].position.set(-6, y, 0); o.rd[i].rotation.z = phi;
      o.pin[2 * i].position.set(-6, y, 0);
      o.pin[2 * i + 1].position.set(-6 + LK * Math.cos(phi), y + rise, 0);
    }
    S.set("gap", Math.round(s * .3) + " cm");
    S.set("ang", Math.round(phi * 57.3) + "°");
  }
});
