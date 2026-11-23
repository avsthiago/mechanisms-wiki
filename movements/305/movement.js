(function () {
  // Flat layout in model units, y up. The small disc turns anticlockwise about the origin and carries one pin, E from its
  // centre. The pendulum is a flat plate that hangs from a pin L above the disc. Two pallets stand in an opening in the
  // plate: one above and to the left of the disc, one below and to the right. A point of the pendulum is given by its
  // distance r from the top pin and its angle f to the right of straight down.
  var RAD = Math.PI / 180, L = 240, E = 14, PR = 5, GAP = 1, LOCK = 1.5, WIN = 52, RT = 30;   // pin circle, pin radius, play above and below the pin, catch, half-width and half-height of the opening
  var XF = PR / 2 - LOCK;                          // the upright faces stand this far either side of the middle line
  var IW = .005, TAU = 3, CW = .15, MP = .02, G = 5000, CP = 75, H = .00025, START = .09, L0 = 400;
  function pt(r, f) { return [r * Math.sin(f), L - r * Math.cos(f)]; }
  // Upper pallet (j = 1): its level face looks down and its upright face looks right. Lower pallet (j = -1): its level
  // face looks up and its upright face looks left. The level faces are parts of circles about the top pin, so they slide
  // past a resting pin without moving it.
  function palletOutline(j) {
    var r0 = L - j * (PR + GAP), r1 = L - j * (RT + 2), f0 = -j * XF / L, f1 = -j * (WIN + 2) / L, p = [], i;
    for (i = 0; i <= 6; i++) p.push(pt(r0, f0 + (f1 - f0) * i / 6));
    for (i = 6; i >= 0; i--) p.push(pt(r1, f0 + (f1 - f0) * i / 6));
    return p;
  }
  function windowOutline() {                       // the opening in the plate; local to the top pin
    var p = [], i;
    for (i = 0; i <= 8; i++) p.push(pt(L - RT, (-1 + i / 4) * WIN / L));
    for (i = 8; i >= 0; i--) p.push(pt(L + RT, (-1 + i / 4) * WIN / L));
    return p.map(function (q) { return [q[0], q[1] - L]; });
  }
  function plateOutline() {                        // the pear-shaped plate; local to the top pin
    var half = [[9, -8], [9, -105], [12, -138], [22, -168], [40, -196], [58, -220], [70, -246], [68, -272], [57, -295], [47, -312], [44, -326]], p = half.slice(), i;
    for (i = half.length - 1; i >= 0; i--) p.push([-half[i][0], half[i][1]]);
    return p;
  }
  function pinOutline() { var p = []; for (var i = 0; i < 24; i++) p.push([E + PR * Math.cos(i * 15 * RAD), PR * Math.sin(i * 15 * RAD)]); return p; }
  // Bodies: 0 the disc with its pin, 1 the pendulum with the two pallets.
  function makeSim(P) {
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: [pinOutline()], drag: CW, a: .05 },
        { pivot: [0, L], I: MP * L0 * L0, polys: [palletOutline(1), palletOutline(-1)], drag: CP, a: START }
      ],
      pairs: [[0, 1]]
    });
    s.t = 0; s.amp = START; s.beats = [];
    s.run = function (h, len) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = TAU; b[1].tq = -MP * G * len * Math.sin(b[1].a);                     // the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }

  M507.define({
    number: 305,
    title: "Single-pin escapement",
    lede: "Most escape wheels have many teeth. This one is a tiny disc with a single pin set off its centre. The disc makes half a turn for each swing of the pendulum, and the pin gives the pendulum a push on the way round.",
    alt: "A flat pendulum shaped like a pear, narrow at the top where it hangs from a pin and wide lower down. In the wide part is an opening. Two square blocks stand in the opening, one in its upper left corner and one in its lower right corner. Behind the opening is a small disc with one pin near its edge, and the pin sits between the two blocks. Two round weights are fixed near the bottom of the plate, and a rod with a bob hangs below.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Disc and pin", note: "A weight, not shown, keeps trying to turn the little disc anticlockwise. The red pin stands out of its face, away from the centre. Watch the pin go round half a turn at a time." },
      { key: "pallets", color: "#C8873A", name: "Pallets", note: "Two blocks fixed in the opening of the pendulum. Each has a level face, where the pin rests, and an upright face, where the pin pushes." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "A flat plate that swings on the pin at the top and carries the two pallets. Its length sets how quickly it swings." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 350, max: 450, step: 25, value: L0, unit: "",
      presets: [[350, "Short"], [400, "Medium"], [450, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [265, 15, 850], front: [0, 0, 880], side: [880, 0, 0] },
    target: [0, 0, 0],
    how: [
      "The disc is always trying to turn anticlockwise. The pin is on the right of the disc and wants to rise, but it is stopped under the level face of the upper pallet. The pendulum swings on, and the level face just slides over the pin. The disc stands dead still.",
      "When the pendulum swings to the left, the corner of the upper pallet slides off the pin. The pin is free to go over the top of its circle. On the way it presses on the upright face of the pallet and pushes the pendulum further to the left. Half a turn later the pin is coming down on the left, and it lands on the level face of the lower pallet. On the swing back, that pallet slides away, and the pin goes round underneath and pushes the pendulum to the right.",
      "The pendulum sets the pace, and the disc makes half a turn for every beat. A long pendulum swings more slowly, so the beats come further apart. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing and description. The shapes of the two pallets were worked out from his words, as plain blocks with one level and one upright face. The level faces are very slightly curved, as parts of circles round the top pin, so that the resting pin is not moved. The rod and bob under the plate, the back plate, the base and the sizes were made up. The two round pieces near the bottom of the plate are taken to be weights. The weight that turns the disc is left out and its pull is taken to be steady. The pin slides on the pallets without rubbing, and only the pendulum and the disc are slowed a little.",

    makeSim: makeSim, K: { H: H, pitch: 2 * Math.PI, lens: [350, 400, 450], dir: 1, dead: .5 * RAD },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("pallets"), mp = c.mat("pend"), i, b;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      for (i = 0, b = o.sim.bodies; i < 12000 && !(Math.cos(b[0].a) > .98 && b[1].a > .07 && b[1].w < 0); i++) o.sim.run(H, L0);   // then on to the moment Brown drew: pendulum to the right, pin on the right of the disc
      // disc z -10..-6 behind the pendulum; its pin z -6..5 reaches forward through the opening, past the pallets
      o.wheel = new T.Group(); scene.add(o.wheel);
      P.at(P.cylZ(E + 7, 4, mw), 0, 0, -8, o.wheel);
      P.at(P.cylZ(PR, 11, c.mat("wheel", "mark")), E, 0, -.5, o.wheel);
      P.at(P.cylZ(3, 20, c.fixed), 0, 0, -20, scene);                                 // pin z -30..-10, plate face to the back of the disc
      // pendulum plate z -3..3 with its opening; the pallets z -4..4 stand in the opening, proud of both faces
      o.pend = new T.Group(); o.pend.position.set(0, L, 0); scene.add(o.pend);
      function local(p) { return p.map(function (q) { return [q[0], q[1] - L]; }); }
      o.pend.add(P.outlinePlate({ points: plateOutline(), holes: [windowOutline()], depth: 6, z0: -3, material: mp }));
      o.pend.add(P.outlinePlate({ points: local(palletOutline(1)), depth: 8, z0: -4, material: ma }));
      o.pend.add(P.outlinePlate({ points: local(palletOutline(-1)), depth: 8, z0: -4, material: ma }));
      P.at(P.cylZ(14, 7.2, mp), 0, 0, 0, o.pend);                                     // ring at the top z -3.6..3.6, round the end of the plate
      P.at(P.cylZ(4, 1, c.mat("pend", "dark")), 0, 0, 4.1, o.pend);                   // dot z 3.6..4.6 on the ring
      [-1, 1].forEach(function (j) {
        P.at(P.cylZ(14, 3, mp), j * 27, -306, 4.5, o.pend);                           // round weight z 3..6, on the front face of the plate
        P.at(P.cylZ(4, 1, c.mat("pend", "dark")), j * 27, -306, 6.5, o.pend);         // dot z 6..7 on the weight
      });
      o.rod = P.at(P.box(5, 1, 4, mp), 0, 0, 0, o.pend);                              // z -2..2, from the bottom edge of the plate (326 below the pin); length set each frame
      o.bob = P.at(P.cylZ(20, 8, mp), 0, 0, 0, o.pend);                               // z -4..4
      P.at(P.cylZ(4, 26.4, c.fixed), 0, L, -16.8, scene);                             // pin z -30..-3.6, plate face to the back of the ring
      // back plate and base
      P.at(P.box(210, 510, 6, c.fixed), 0, 5, -33, scene);                            // plate x -105..105, y -250..260, z -36..-30
      P.at(P.box(230, 12, 100, c.fixed), 0, -256, -10, scene);                        // base y -262..-250, z -60..40; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l);
      o.wheel.rotation.z = b[0].a; o.pend.rotation.z = b[1].a;
      o.rod.scale.y = l - 326; o.rod.position.y = -(l + 326) / 2;                    // from the plate's bottom edge down to the middle of the bob
      o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp * 180 / Math.PI).toFixed(1) + "°");
    }
  });
})();
