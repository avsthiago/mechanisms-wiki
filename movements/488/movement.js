M507.define({
  number: 488,
  title: "Screw propeller",
  lede: "Two twisted blades on a shaft at the back of a boat. Each blade is a short piece of a screw thread. As it turns, it screws itself forwards through the water, like a bolt turning in a nut, and pushes the boat along.",
  alt: "A propeller with two broad blades on a horizontal shaft, seen from the side. Blue dots stream past it from left to right and speed up behind it.",
  _hint: "Drag to look around. Pinch or scroll to zoom. The boat is to the left and heads that way.",
  parts: [
    { key: "blades", color: "#C8873A", name: "Blades", note: "Two broad blades, each a slice of a screw thread. Their slant pushes the water backwards as they turn." },
    { key: "hub", color: "#8E7AA8", name: "Hub", note: "The thick boss that holds the blades on the shaft. Watch the red stripe to follow it round." },
    { key: "shaft", color: "#5E7387", name: "Shaft", note: "Comes out of the back of the boat. The engine turns it." }
  ],
  controls: [{ id: "pitch", label: "Pitch", value: "330", options: [["200", "Fine"], ["330", "As drawn"], ["520", "Coarse"]] }],
  readouts: [{ id: "p", label: "Advance per turn" }, { id: "v", label: "Boat" }],
  views: { "3d": [-150, 70, 560], front: [0, 0, 740], side: [-740, 0, 1] },
  viewLabels: { side: "End-on" },
  target: [-10, 0, 0],
  distance: [300, 2000],
  how: [
    "Look at one blade. It is not flat but twisted, like one turn of a screw cut short. As the shaft turns, the slanted faces sweep through the water and shove it backwards, to the right. Watch the dots speed up behind the blades.",
    "A screw turning in a nut moves along by one thread each turn. The propeller tries to do the same in the water, so each turn should carry the boat forward by one twist of the blade. That distance is called the pitch. Water gives way a little, so the boat moves a bit less. That loss is called slip.",
    "Try a coarse pitch. The blades lie at a steeper slant, so each turn moves the boat further, but each turn is harder work for the engine. A fine pitch is easy to turn but moves the boat less. Compare how fast the dots leave."
  ],
  note: "This model is rebuilt from Brown's drawing. The bearing on the left, the blade shape and the sizes were made up. The flow uses a simple rule: the water reaches the blades at the speed of the screw, and leaves faster than it came. Slip is set at one quarter.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 150, i;
    var o = this.o = { R: R, rot: 0, props: {}, N: 220, d: [] };
    o.rotor = new T.Group(); scene.add(o.rotor);
    var mh = c.mat("hub"), ms = c.mat("shaft");
    c.mat("blades").side = T.DoubleSide;
    P.at(P.cylX(12, 195, ms), -5.5, 0, 0, o.rotor);                               // shaft x -103..92, starts at the bearing's face
    P.at(P.cylX(24, 64, mh), 0, 0, 0, o.rotor);                                    // boss x -32..32
    P.at(P.cylX(16, 18, mh), 41, 0, 0, o.rotor);                                   // collar x 32..50
    P.at(P.cylX(15, 14, mh), 99, 0, 0, o.rotor);                                   // end cap x 92..106
    P.at(P.box(40, 5, 1, c.mat("hub", "mark")), 0, 0, 24.8, o.rotor);              // stripe z 24.3..25.3, between the blades
    ["200", "330", "520"].forEach(function (k) {
      var g = new T.Group(); g.visible = k === "330"; o.rotor.add(g); o.props[k] = g;
      for (var b = 0; b < 2; b++) {
        var bl = P.screwBlade({ rIn: 22, rOut: R, pitch: +k, thickness: 3, material: c.mat("blades"),
          halfWidth: function (u) { return Math.min(28 * Math.PI / +k + 2 * u, (.3 + .45 * Math.pow(u, 1.2)) * Math.sqrt(Math.max(0, 1 - Math.pow(u, 6)))); } });   // root kept inside the boss
        bl.rotation.x = b * Math.PI; g.add(bl);
      }
    });
    // stern bearing x -170..-103, ends where the shaft starts
    P.at(P.cylX(30, 67, c.fixed), -136.5, 0, 0, scene);
    o.dots = P.waterDots(o.N, { radius: 2.2, color: c.spot, opacity: .8 }); scene.add(o.dots);
    for (i = 0; i < o.N; i++) o.d.push({ x: -240 + 540 * Math.random(), r0: 42 + 150 * Math.sqrt(Math.random()), a: 2 * Math.PI * Math.random() });
  },

  step: function (c, dt, S) {
    var o = this.o, p = +S.controls.pitch, s = S.w * p / (2 * Math.PI), vin = .75 * s, vout = 1.25 * s, i;   // s: screw speed in cm/s
    Object.keys(o.props).forEach(function (k) { o.props[k].visible = k === S.controls.pitch; });
    o.rot += S.w * dt; o.rotor.rotation.x = o.rot;
    function sm(x, a, b) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    for (i = 0; i < o.N; i++) {
      var d = o.d[i], inside = d.r0 < 173, v = inside ? vin + (vout - vin) * sm(d.x, -110, 110) : vin;
      d.x += v * dt;
      if (inside) d.a += .12 * S.w * sm(d.x, 30, 200) * dt;                           // a little swirl behind the blades
      if (d.x > 300) { d.x -= 540; d.r0 = 42 + 150 * Math.sqrt(Math.random()); }
      var r = inside ? d.r0 * Math.sqrt(.75 / (.75 + .5 * sm(d.x, -110, 110))) : d.r0;                     // the stream narrows as it speeds up
      o.dots.put(i, d.x, r * Math.cos(d.a), r * Math.sin(d.a), Math.max(0, Math.min(1, (d.x + 240) / 30, (300 - d.x) / 30)));
    }
    o.dots.flush();
    S.set("p", (p / 100).toFixed(1) + " m");
    S.set("v", (vin * .036).toFixed(1) + " km/h");
  }
});
