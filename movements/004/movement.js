M507.define({
  number: 4,
  title: "Crossed belt to an upright shaft",
  lede: "A belt carries turning from a level shaft to an upright one below it. Two guide pulleys bring the belt down and round to a drum on the upright shaft. Crossing the belt makes it grip the pulleys better.",
  alt: "A large spoked pulley at the top, two small guide pulleys at the bottom left and right, and a drum on an upright shaft between them. A flat belt crosses below the top pulley, runs down to the guide pulleys and wraps once round the drum.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving pulley", note: "The large pulley at the top. Its shaft points straight at you. It turns the same way all the time and pulls the belt along." },
    { key: "driven", color: "#C8873A", name: "Drum", note: "A drum on an upright shaft, between the guide pulleys. The belt wraps once round it. Watch the dark stripe on top." },
    { key: "guide", color: "#4FA58A", name: "Guide pulleys", note: "Two small pulleys on fixed pins. They turn the belt from its slant down to a level run towards the drum." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One flat loop of leather. Between the guide pulleys and the drum each half makes a quarter turn. Watch the red mark go round." }
  ],
  controls: [{ id: "belt", label: "Belt", value: "cross", options: [["cross", "Crossed"], ["open", "Open"]] }],
  readouts: [{ id: "in", label: "Top pulley" }, { id: "out", label: "Drum" }],
  views: { "3d": [430, 190, 700], front: [0, 0, 820], side: [820, 0, 0] },
  target: [0, -20, 0],
  how: [
    "The top pulley pulls the belt down to the guide pulleys. From each one the belt runs level to the drum. It wraps once round the drum and leaves on the other side, a little higher up.",
    "On the level runs the belt makes a quarter turn. That lets it lie flat on the drum, whose shaft stands upright. The top shaft and the drum shaft both lie in one flat plane, at a right angle.",
    "Try crossed, then open. With the open belt it touches less than half of the top pulley. Crossed, it wraps most of the way round, so it grips much better. Watch the drum turn the other way too."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The sizes, the distance between the shafts and the frame are made up. Brown does not say which pulley drives; here the top one does. In his drawing the belt seems to wind round the drum; here it makes exactly one turn. So the right guide pulley sits a little higher than the left one.",

  build: function (c) {
    var P = c.P, scene = c.scene, T = 4, o = this.o = { a: 0, s: 0, T: T,
      D: [0, 120], rD: 60, G1: [-150, -80], G2: [150, -62], rG: 30, rb: 30, zb: -30 };
    o.y1 = o.G1[1] - o.rG; o.rise = o.G2[1] - o.G1[1];          // left run at y -110, right run 18 higher
    // driving pulley, axis Z, rim z -12..12
    o.pd = P.at(P.pulley({ radius: o.rD - T / 2 - 2, width: 24, material: c.mat("drive") }), o.D[0], o.D[1], 0, scene);
    o.pd.spokes[0].material = c.mat("drive", "dark");
    P.at(P.cylZ(7, 88, c.mat("drive")), o.D[0], o.D[1], -28, scene);         // shaft z -72..16, from the boss face to past the pulley
    // guide pulleys, axis Z, rims z -10..10, loose on fixed pins
    o.g = [o.G1, o.G2].map(function (G) {
      var p = P.at(P.pulley({ radius: o.rG - T / 2 - 2, width: 20, material: c.mat("guide") }), G[0], G[1], 0, scene);
      p.spokes[0].material = c.mat("guide", "dark");
      P.at(P.cylZ(4, 86, c.mat("guide", "dark")), G[0], G[1], -29, scene);   // pin z -72..14, thinner than the hub (radius 6.2)
      return p;
    });
    // drum on an upright shaft: barrel y -122..-80, flanges to y -126 and -76, z -66..6
    var hold = P.at(new c.THREE.Group(), 0, o.y1 + o.rise / 2, o.zb, scene); hold.rotation.x = -Math.PI / 2;   // local Z points up
    o.drum = P.at(P.drum({ radius: o.rb - T / 2, length: 42, flange: 8, material: c.mat("driven"), mark: c.mat("driven", "dark") }), 0, 0, 0, hold);
    P.at(P.cylY(5, 80, c.mat("driven")), 0, -100, o.zb, scene);               // shaft y -140..-60, from the bearing top to above the drum
    // frame
    [o.D, o.G1, o.G2].forEach(function (p) { P.at(P.cylZ(16, 12, c.fixed), p[0], p[1], -78, scene); }); // bosses z -84..-72
    P.at(P.box(50, 190, 12, c.fixed), 0, 55, -90, scene);                    // post x -25..25, y -40..150, z -96..-84
    P.at(P.box(360, 60, 12, c.fixed), 0, -70, -90, scene);                   // cross bar x -180..180, y -100..-40, z -96..-84
    [-170, 170].forEach(function (x) { P.at(P.box(20, 100, 12, c.fixed), x, -150, -90, scene); }); // legs x ±(160..180), y -200..-100
    P.at(P.cylY(12, 60, c.fixed), 0, -170, o.zb, scene);                     // bearing y -200..-140
    P.at(P.box(400, 12, 140, c.fixed), 0, -206, -40, scene);                 // base x -200..200, y -212..-200, z -110..30

    o.belt = P.at(P.beltPath({ width: 14, thick: T, material: c.mat("belt"), sameFace: true }), 0, 0, 0, scene);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(12, T + 2, 15, c.mat("belt", "mark")), 0, 0, 0, o.belt);
  },

  // Rebuild the belt for a crossed or open top section. sTop is the way the belt goes round the top pulley (+1 anticlockwise).
  lay: function (crossed) {
    var o = this.o, sTop = crossed ? -1 : 1, Z = [0, 0, 1], X = [1, 0, 0], TAU = 2 * Math.PI, lift = o.T / 2 + .6;
    function tan(a, ra, sa, b, rb, sb) {          // straight run leaving circle a towards circle b: contact angles on each
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy), mu = Math.atan2(dy, dx) - Math.acos((ra * sa - rb * sb) / d);
      return [sa > 0 ? mu : mu + Math.PI, sb > 0 ? mu : mu + Math.PI];
    }
    function sw(from, to, s) { return s * (((s * (to - from)) % TAU + TAU) % TAU); }
    function pt(ctr, r, ang) { return [ctr[0] + r * Math.cos(ang), ctr[1] + r * Math.sin(ang)]; }
    var r1 = tan(o.D, o.rD, sTop, o.G1, o.rG, 1), r2 = tan(o.G2, o.rG, 1, o.D, o.rD, sTop);
    var top = { c: [o.D[0], o.D[1], 0], axis: Z, u: X, r: o.rD, a0: r2[1], sweep: sw(r2[1], r1[0], sTop) };
    var g2 = { c: [o.G2[0], o.G2[1], 0], axis: Z, u: X, r: o.rG, a0: -Math.PI / 2, sweep: sw(-Math.PI / 2, r2[0], 1) };
    if (crossed) {                                  // the two runs cross: find where, and lift one in front of the other there
      var A = pt(o.D, o.rD, r1[0]), B = pt(o.G1, o.rG, r1[1]), C = pt(o.G2, o.rG, r2[0]), E = pt(o.D, o.rD, r2[1]);
      var ux = B[0] - A[0], uy = B[1] - A[1], vx = E[0] - C[0], vy = E[1] - C[1], den = ux * vy - uy * vx;
      top.cross = ((C[0] - A[0]) * vy - (C[1] - A[1]) * vx) / den; top.lift = lift;
      g2.cross = ((C[0] - A[0]) * uy - (C[1] - A[1]) * ux) / den; g2.lift = -lift;
    }
    o.belt.set([
      top,
      { c: [o.G1[0], o.G1[1], 0], axis: Z, u: X, r: o.rG, a0: r1[1], sweep: sw(r1[1], -Math.PI / 2, 1) },
      { c: [0, o.y1, o.zb], axis: [0, 1, 0], u: Z, r: o.rb, a0: 0, sweep: TAU, rise: o.rise },   // one turn round the drum, rising 18
      g2
    ]);
    o.wrap = Math.round(Math.abs(top.sweep) * 180 / Math.PI);
  },

  step: function (c, dt, S) {
    var o = this.o, crossed = S.controls.belt === "cross";
    if (o.crossed !== crossed) { o.crossed = crossed; this.lay(crossed); o.s = 0; }
    var v = S.w * o.rD * (crossed ? 1 : -1);       // the top pulley always turns clockwise; open, the belt runs the other way
    o.a -= S.w * dt; o.s += v * dt;
    o.pd.rotation.z = o.a;
    o.g.forEach(function (p, i) { p.rotation.z = o.s / o.rG; });
    o.drum.rotation.z = o.s / o.rb;
    o.belt.place(o.mark, o.s);
    var r = S.playing ? S.rpm : 0, k = o.rD / o.rb;
    S.set("in", r + " rpm");
    S.set("out", r * k + " rpm");
  }
});
