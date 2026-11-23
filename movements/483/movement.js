M507.define({
  number: 483,
  title: "Dry gas meter",
  lede: "This meter counts gas without any water inside. Gas fills two pairs of leather bellows in turn, pushing their plates back and forth. The plates work a valve that sends the gas to the next bellows, and every fill is counted.",
  alt: "A frame with a shelf near the top. Below the shelf, two round leather bellows sit side by side, each split in two by a round plate in the middle. Upright rods behind the bellows are rocked by the plates. Above the shelf, a round valve sits under a small bridge, with a crank on top joined by links to the rods.",
  parts: [
    { key: "bellows", color: "#E8E2D0", name: "Bellows", note: "Leather bags, two on each side. Each fills with gas and then is squeezed empty again. Their size is known." },
    { key: "plates", color: "#C8873A", name: "Plates and upright rods", note: "Each moving plate is pushed back and forth by the gas. Arms turn the upright rod behind it a little each way." },
    { key: "links", color: "#D9B13B", name: "Crank and links", note: "Links from the two rods turn a crank. Its two pins are a quarter turn apart, so the crank never gets stuck. Watch the red mark." },
    { key: "valve", color: "#4FA58A", name: "Valve", note: "Turns with the crank. It lets gas into the bags that are filling and out of the bags that are emptying." }
  ],
  speed: { min: 2, max: 30, value: 10, label: "Gas flow", unit: " turns/min" },
  readouts: [{ id: "f", label: "Fills" }, { id: "v", label: "Gas" }],
  views: { "3d": [100, 60, 620], front: [0, -10, 620], side: [620, -10, -20] },
  target: [0, -10, -20],
  how: [
    "Each moving plate splits its side into two leather bags. The valve lets gas into one bag, and the gas pushes the plate along. The bag on the other side of the plate is squeezed, and its gas goes out to the house. Then the valve swaps them over.",
    "The plates cannot turn anything by themselves, so each one rocks an upright rod behind it. Links from the tops of the two rods turn the crank, and the crank turns the valve. The two sides move a quarter turn apart, so one plate is always pushing hard while the other turns round at the end of its stroke.",
    "Each bag holds a known amount of gas, so every fill counts the same. Change the gas flow: the plates move faster, but the gas counted for each fill stays the same."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown's valve is a slide valve; here it is drawn as a round valve that turns, and its passages are not shown. The arms, the links, the bridge over the valve, the sizes and the amount of gas per turn are made up. The counter is left out; the readouts do its job.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed, k;
    var o = this.o = { phi: 0, turns: 0, XF: 70, ZF: -95, ARM: 95, CR: 18, LK: 70, YC: -40, bags: [] };
    // frame: base y -150 .. -140, uprights x 140 .. 150 up to y 130, shelf y 50 .. 58 between them
    P.at(P.box(300, 10, 180, fx), 0, -145, -20, scene);                             // x -150 .. 150, z -110 .. 70
    [-1, 1].forEach(function (s) { P.at(P.box(10, 270, 120, fx), s * 145, -5, 0, scene); });   // y -140 .. 130, z -60 .. 60
    P.at(P.box(280, 8, 120, fx), 0, 54, 0, scene);                                   // x -140 .. 140, z -60 .. 60
    P.at(P.box(8, 190, 168, fx), 0, -45, 0, scene);                                  // middle wall x -4 .. 4, y -140 .. 50, z -84 .. 84
    [-1, 1].forEach(function (s) { P.at(P.box(4, 168, 168, fx), s * 138, -40, 0, scene); });   // end walls x 136 .. 140, y -124 .. 44
    P.at(P.cylY(7, 70, fx), -118, 93, 0, scene);                                     // gas inlet, y 58 .. 128
    for (k = 0; k < 4; k++) P.at(P.cylY(8.2, 2, fx), -118, 117 + 3.5 * k, 0, scene);   // thread
    // valve: fixed seat y 58 .. 64, turning cover y 64 .. 78, spindle up through a bridge to the crank
    P.at(P.cylY(24, 6, fx), 0, 61, 0, scene);
    o.cover = P.at(new T.Group(), 0, 0, 0, scene);
    P.at(P.cylY(20, 6, c.mat("valve")), 0, 67, 0, o.cover);
    P.at(P.cylY(13, 8, c.mat("valve")), 0, 74, 0, o.cover);
    P.at(P.box(6, 1, 4, c.mat("valve", "dark")), 15, 70.7, 0, o.cover);              // mark on the cover step, y 70.2 .. 71.2
    [-1, 1].forEach(function (s) { P.at(P.box(8, 38, 12, fx), s * 32, 77, 0, scene); });   // bridge legs x 28 .. 36, y 58 .. 96
    P.at(P.guideBlock({ w: 72, h: 8, d: 12, hole: 3, material: fx }), 0, 100, 0, scene);  // bridge top y 96 .. 104
    // crank: disc y 108 .. 112 on the spindle, two pins a quarter turn apart
    o.crank = P.at(new T.Group(), 0, 0, 0, scene);
    P.at(P.cylY(2.5, 30, c.mat("links")), 0, 93, 0, o.crank);                        // spindle y 78 .. 108
    P.at(P.cylY(24, 4, c.mat("links")), 0, 110, 0, o.crank);
    P.at(P.box(10, 1, 4, c.mat("links", "mark")), -14, 112.5, 0, o.crank);           // red mark, y 112 .. 113
    [0, 1].forEach(function (i) { var a = i * Math.PI / 2; P.at(P.cylY(2, 10, c.mat("links", "dark")), o.CR * Math.cos(a), 117, -o.CR * Math.sin(a), o.crank); });   // pins y 112 .. 122
    o.links = [P.rod(1.6, c.mat("links")), P.rod(1.6, c.mat("links"))]; o.links.forEach(function (l) { scene.add(l); });
    // rods behind the bellows, each with three arms; top guides hang from the shelf's back edge
    o.sides = [-1, 1].map(function (s) {
      var g = P.at(new T.Group(), s * o.XF, 0, o.ZF, scene), pm = c.mat("plates");
      P.at(P.cylY(3, 262, pm), 0, -9, 0, g);                                        // rod y -140 .. 122
      [47, -126.5].forEach(function (y) { P.at(P.box(5, 3, o.ARM, pm), 0, y, o.ARM / 2, g); });   // arms to the plate
      P.at(P.box(5, 3, o.ARM, pm), 0, 116, o.ARM / 2, g);                           // top arm, y 114.5 .. 117.5
      P.at(P.cylY(1.8, 6, c.mat("plates", "dark")), 0, 120, o.ARM, g);               // pin for the link, y 117 .. 123
      P.at(P.box(8, 8, 28, fx), s * o.XF, 54, -74, scene);                          // guide arm z -88 .. -60, on the shelf's back face
      P.at(P.guideBlock({ w: 14, h: 8, d: 14, hole: 3.5, material: fx }), s * o.XF, 54, o.ZF, scene);   // guide z -102 .. -88
      var plate = P.at(new T.Group(), s * o.XF, o.YC, 0, scene);
      P.at(P.cylX(80, 6, pm), 0, 0, 0, plate);                                      // plate x -3 .. 3 about its centre, y -120 .. 40
      P.at(P.box(8, 5, 16, pm), 0, 82.5, 0, plate);                                 // brackets with slots for the arm pins, y 40 .. 45
      P.at(P.box(8, 4.5, 16, pm), 0, -82.25, 0, plate);                             // y -124.5 .. -120
      P.at(P.box(4, 10, 1, c.mat("plates", "mark")), 0, 0, 81, plate);             // red mark on the plate's front edge, z 80.5 .. 81.5
      return { s: s, g: g, plate: plate, x: s * o.XF };
    });
    // leather bags, rebuilt as the plates move
    for (k = 0; k < 4; k++) { var m = P.mesh(new T.BufferGeometry(), c.mat("bellows")); m.rotation.z = -Math.PI / 2; m.position.y = o.YC; m.userData.live = true; scene.add(m); o.bags.push(m); }
  },

  // where the arm tip goes for a crank pin at (px, pz): returns the rod's turn
  rock: function (s, px, pz) {
    var o = this.o, q = this.P.meet(s * o.XF, o.ZF, o.ARM, px, pz, o.LK, -s);
    return Math.atan2(q[0] - s * o.XF, q[1] - o.ZF);
  },

  bag: function (m, x0, x1) {                                     // one leather bag between two faces: a fold whose sides keep their length
    var L = Math.abs(x1 - x0), half = L / 2, w = 78 - Math.sqrt(Math.max(0, 44 * 44 - half * half)), pts = [], k;
    for (k = 0; k <= 12; k++) { var u = k / 12, f = 1 - Math.abs(2 * u - 1); pts.push(new this.T.Vector2(78 - (78 - w) * Math.pow(f, .8), Math.min(x0, x1) + L * u)); }
    m.geometry.dispose(); m.geometry = new this.T.LatheGeometry(pts, 40);
  },

  step: function (c, dt, S) {
    var o = this.o, me = this;
    me.P = c.P; me.T = c.THREE;
    o.phi += S.w * dt; o.turns += S.w * dt / (2 * Math.PI);
    o.cover.rotation.y = o.crank.rotation.y = o.phi;
    o.sides.forEach(function (sd, i) {
      var a = o.phi + (sd.s > 0 ? 0 : Math.PI / 2), px = o.CR * Math.cos(a), pz = -o.CR * Math.sin(a);
      var psi = me.rock(sd.s, px, pz), tx = sd.s * o.XF + o.ARM * Math.sin(psi), tz = o.ZF + o.ARM * Math.cos(psi);
      sd.g.rotation.y = psi;
      sd.plate.position.x = tx;
      o.links[i].span(px, 119.5, pz, tx, 119.5, tz);
      var xi = sd.s * 4, xp = tx, xe = sd.s * 136;
      me.bag(o.bags[2 * i], xi, xp - sd.s * 3);
      me.bag(o.bags[2 * i + 1], xp + sd.s * 3, xe);
    });
    S.set("f", String(Math.floor(o.turns * 4)));
    S.set("v", (o.turns * 2).toFixed(1) + " L");
  }
});
