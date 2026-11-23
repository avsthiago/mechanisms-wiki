M507.define({
  number: 413,
  title: "Adjustable friction gearing",
  lede: "Two wheels without teeth drive each other by rubbing. The upper wheel has a rubber edge squeezed between two metal plates. Tighten the nut and the rubber swells into the groove below, so it grips harder.",
  alt: "Seen edge on: a big wheel with a deep V-shaped groove and a crank handle, and above it a smaller wheel whose rubber V-edge sits in that groove. The rubber is held between two metal plates by a nut on the end of the upper shaft. Both shafts run to an upright on the right.",
  parts: [
    { key: "low", color: "#5E7387", name: "Grooved wheel", note: "Turned by the crank. Its rim has a deep V-shaped groove. Watch its red stripe." },
    { key: "plates", color: "#C8873A", name: "Plates and upper shaft", note: "Two metal plates hold the rubber disc. The right one is fixed to the shaft; the left one slides. Watch the red stripe on the left plate." },
    { key: "rubber", color: "#4FA58A", name: "Rubber disc", note: "A disc of rubber with a V-shaped edge. Squeezed from the sides, it gets thinner and grows wider, so the edge pushes deeper into the groove." },
    { key: "nut", color: "#D9B13B", name: "Nut", note: "Screwed onto the end of the upper shaft. Turning it pushes the left plate in and squeezes the rubber." }
  ],
  controls: [{ type: "range", id: "nut", label: "Nut tightened", min: 0, max: 2, step: .05, value: 0, unit: " turns", presets: [[0, "Loose"], [1, "Half"], [2, "Tight"]] }],
  readouts: [{ id: "a", label: "Grooved wheel" }, { id: "b", label: "Rubber wheel" }, { id: "s", label: "Slip" }],
  views: { "3d": [-210, 20, 880], front: [0, 0, 800], side: [-800, 30, 0] },
  target: [10, -25, 0],
  how: [
    "Turn the crank and the grooved wheel turns. The rubber edge of the upper wheel sits in its groove. Rubbing between the two carries the turn up, and the upper wheel goes the other way.",
    "The upper wheel drives some machine, and that machine pushes back. If the rubber presses only lightly on the sides of the groove, it cannot carry that load. It slips and the upper wheel turns slower than it should. Screwing up the nut squeezes the rubber between the plates. It grows wider, wedges harder into the V, and grips.",
    "Try Loose, then Half, then Tight, and watch the slip readout. Then turn the speed up: at Half the grip holds when it is slow and slips when it is fast."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the upper wheel cut in half; here it is shown whole so you can see it turn. The upright, the base, the sizes and the angle of the V were made up. How hard the rubber grips and how hard the machine pushes back are made up too, chosen so the slip is easy to see. The rubber is drawn round all the way; really it would flatten a little where it presses into the groove.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = Math.sqrt(3);
    var o = this.o = { aL: 0, aU: 0, wU: 0, yL: -100, yU: 100, nutT: -1, K: K };
    // grooved wheel: axis along world X; local z of the lathe runs along world x. Rim r 150 from x -40..40, V groove 26 deep
    // each side (r = 105 + 1.73 |x|, from 105 at x 0 to 150 at x +-26)
    var lw = new T.Group(); lw.position.set(0, o.yL, 0); lw.rotation.y = Math.PI / 2; scene.add(lw);
    o.low = new T.Group(); lw.add(o.low);
    o.low.add(P.lathePulley({ points: [[150, -40], [150, -26], [150, -26], [105, 0], [105, 0], [150, 26], [150, 26], [150, 40]], material: c.mat("low") }));
    P.at(P.cylZ(30, 20, c.mat("low")), 0, 0, 50, o.low);                     // hub x 40..60, on the right face
    P.at(P.cylZ(12, 90, c.mat("low")), 0, 0, 105, o.low);                    // shaft x 60..150, to the upright's face
    P.at(P.box(6, 100, 1, c.mat("low", "mark")), 0, 85, -40.5, o.low);       // red stripe r 35..135 on the left face, x -41..-40
    P.at(P.cylZ(6, 22, c.mat("low")), 0, -105, -51, o.low);                  // crank stem x -62..-40 at r 105, drawn at the bottom
    P.at(P.cylZ(8, 22, c.mat("low", "dark")), 0, -105, -73, o.low);          // handle x -84..-62

    // upper wheel group: axis along world X through (0, yU)
    var uw = new T.Group(); uw.position.set(0, o.yU, 0); uw.rotation.y = Math.PI / 2; scene.add(uw);
    o.up = new T.Group(); uw.add(o.up);
    P.at(P.cylZ(9, 214, c.mat("plates")), 0, 0, 43, o.up);                   // shaft x -64..150 (left end threaded, right end at the upright)
    P.at(P.cylZ(56, 6, c.mat("plates")), 0, 0, 18, o.up);                    // right plate x 15..21, fixed to the shaft
    for (var i = 0; i < 4; i++) P.at(P.hoop(9.2, .8, c.mat("plates", "dark")), 0, 0, -58 + i * 5, o.up);   // thread marks x -58..-43
    o.lp = new T.Group(); o.up.add(o.lp);                                    // left plate x -6..0 in its own group, moved by step
    P.at(P.cylZ(56, 6, c.mat("plates")), 0, 0, -3, o.lp);
    P.at(P.box(44, 5, 1, c.mat("plates", "mark")), 0, 32, -6.5, o.lp);       // red stripe r 10..54, x -7..-6, on its outer face
    o.nut = P.mesh(new T.CylinderGeometry(15, 15, 12, 6), c.mat("nut")); o.nut.rotation.x = Math.PI / 2;   // hex nut x -12..0 of its group
    o.ng = new T.Group(); o.ng.add(o.nut); o.nut.position.z = -12; o.up.add(o.ng);   // the nut sits on the left plate: x -18..-6 of the plate group
    o.rub = null;

    // fixed: upright x 150..160, y -260..130; base y -270..-260 under it all
    P.at(P.box(10, 390, 80, c.fixed), 155, -65, 0, scene);                   // x 150..160, y -260..130; shafts end at x 150
    P.at(P.box(320, 10, 320, c.fixed), 40, -265, 0, scene);                  // x -120..200, y -270..-260; upright stands on y -260; wheel bottom y -250
  },

  // rubber outline for a squeeze of `sq` (axial) and swell `e` (radial): faces at x sq-15 and 15, V edge centred on x 0
  // (r = 95 + e - 1.73 |x|, cut flat at 89 + e), so it stays in the middle of the groove
  rubber: function (c, sq, e) {
    var K = this.o.K, zl = -15 + sq, zr = 15, tip = 95 + e, flat = 89 + e, w = (tip - flat) / K;
    var sl = tip + K * zl, sr = tip - K * zr;
    return c.P.lathePulley({ points: [[sl, zl], [sl, zl], [flat, -w], [flat, -w], [flat, w], [flat, w], [sr, zr], [sr, zr]], material: c.mat("rubber") });
  },

  step: function (c, dt, S) {
    var o = this.o, n = +S.controls.nut, t = n / 2, sq = 2 * n, e = n;
    if (n !== o.nutT) {
      if (o.rub) { o.up.remove(o.rub); o.rub.children.forEach(function (m) { m.geometry.dispose(); }); }
      o.rub = this.rubber(c, sq, e); o.rub.children.forEach(function (m) { m.userData.live = true; }); o.up.add(o.rub);
      o.lp.position.z = -15 + sq;                                            // left plate x sq-21 .. sq-15, against the rubber
      o.ng.position.z = -15 + sq;                                           // nut x sq-33..sq-21, on the plate
      o.nutT = n;
    }
    // rubbing: the rubber rolls on the groove sides at about r 81 against r 119, so the upper wheel should turn 119/81 as fast
    var ratio = 119 / 81, wL = S.w, ideal = wL * ratio;
    var cap = (4 + 46 * t) * Math.PI / 30;                                   // fastest the grip can drive the machine, rad/s
    var target = Math.sign(ideal) * Math.min(Math.abs(ideal), cap);
    o.wU += (target - o.wU) * (1 - Math.exp(-dt / .3));
    o.aL += wL * dt; o.aU -= o.wU * dt;
    o.low.rotation.z = o.aL;
    o.up.rotation.z = o.aU;
    o.nut.rotation.y = n * 2 * Math.PI;                                     // nut turned on its thread

    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var k = 30 / Math.PI;
    S.set("a", f(wL * k));
    S.set("b", f(-o.wU * k));
    S.set("s", (Math.abs(ideal) > 1e-6 ? Math.max(0, Math.round(100 * (1 - Math.abs(o.wU) / Math.abs(ideal)))) : 0) + " %");
  }
});
