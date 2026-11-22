M507.define({
  number: 109,
  title: "Screw-cutting by a guide screw",
  lede: "A long guide screw pulls a small carriage steadily down the frame. The carriage holds a cutter that scratches a thread into a rod turning beside it. The gears at the bottom decide how close together the new threads are.",
  alt: "Two upright screws between a top bar and a wide base. The left one is a thick guide screw with a small block on it. An arm from the block carries a red cutter to the right-hand rod, which has a dark spiral thread above the cutter. Gears at the bottom link the two.",
  parts: [
    { key: "guide", color: "#5E7387", name: "Guide screw", note: "A long thick screw. It turns the gear at its foot and pulls the carriage along as it spins." },
    { key: "blank", color: "#C8873A", name: "Rod to be cut", note: "A smooth rod, turned by the second gear. The dark spiral on it is the thread the cutter has made so far." },
    { key: "carriage", color: "#D9B13B", name: "Carriage", note: "A block with a tooth that fits the guide screw. It cannot turn, so it slides along as the screw spins. Its arm carries the cutter across to the rod." },
    { key: "cutter", color: "#C2503F", name: "Cutter", note: "A sharp tool held against the rod. Watch it: it moves along at a steady speed and draws the thread behind it." }
  ],
  controls: [{ id: "wheels", label: "Change gears", value: "same", options: [["fine", "Small gear on the rod"], ["same", "Same size"], ["coarse", "Big gear on the rod"]] }],
  speed: { min: 5, max: 60, value: 40, label: "Guide screw", unit: "rpm" },
  readouts: [{ id: "turns", label: "Rod" }, { id: "pitch", label: "Thread" }],
  views: { "3d": [330, 190, 640], front: [0, 10, 700], side: [700, 10, 0] },
  target: [0, 10, 0],
  how: [
    "The guide screw turns, and a tooth on the carriage sits in its thread. The carriage cannot turn, so it is pulled along the screw. Its arm carries the cutter down beside the rod at a steady speed.",
    "Two gears at the foot make the rod turn with the screw. While the rod turns, the cutter moves along it, so the cutter draws a spiral. The distance the cutter moves in one turn of the rod is the gap between threads. When the cutter gets to the end, it is pulled back and a new rod starts.",
    "A big gear on the rod makes it turn slowly, so the cutter moves a long way in each turn and the threads are far apart. A small gear does the opposite. Try the three choices and compare the dark spirals."
  ],
  note: "This model is rebuilt from Brown's drawing. The top bar, the base, the guide rod that stops the carriage turning, the tooth, the sizes and the tooth counts of the gears were made up. Brown draws the two gears as one wide gear. Here they meet directly, so the new thread winds the opposite way to the guide thread; real machines add a third gear to fix that. The cutter is pulled back and the carriage wound up to start a new rod, which Brown does not show. The choice of gears was added to show what it changes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 5, XG = -75, XB = 75, PG = 24, YC = 12, YTOP = 72, LCUT = 144, RB = 16, RBAND = 16.6;
    var o = this.o = { PG: PG, A: 2 * Math.PI * LCUT / PG, e: 0, phase: "cut", sets: {}, last: "", YTOP: YTOP };
    o.a = o.amax = o.A * .4;
    // base: x -190..190, y -134..-124, z -115..115. Shafts and wheel collars start at y -124.
    P.at(P.box(380, 10, 230, c.fixed), 0, -129, 0, scene);
    // top bar: x -115..115, y 140..156, z -110..20. Shafts end at y 140.
    P.at(P.box(230, 16, 130, c.fixed), 0, 148, -45, scene);
    // fixed guide rod: y -124..140 at z -100, base top to bar bottom
    P.at(P.cylY(4, 264, c.fixed), 0, 8, -100, scene);

    // guide screw: spins about its own axis. Shaft y -102..140, worm y -98..122 (centre 12), collar y -124..-118, hub y -102..-98
    o.gs = new T.Group(); o.gs.position.set(XG, 0, 0); scene.add(o.gs);
    P.at(P.cylY(9, 6, c.mat("guide")), 0, -121, 0, o.gs);
    P.at(P.cylY(6, 242, c.mat("guide")), 0, 19, 0, o.gs);
    P.at(P.cylY(11, 4, c.mat("guide")), 0, -100, 0, o.gs);
    var wh = new T.Group(); wh.rotation.z = Math.PI / 2; wh.position.set(0, YC, 0); o.gs.add(wh);   // worm axis X becomes world Y
    wh.add(P.worm({ radius: 18, pitch: PG, length: 220, material: c.mat("guide") }));
    // rod to be cut: shaft y -102..140, rod y -98..118 radius 16, collar and hub like the guide screw
    o.bs = new T.Group(); o.bs.position.set(XB, 0, 0); scene.add(o.bs);
    P.at(P.cylY(9, 6, c.mat("blank")), 0, -121, 0, o.bs);
    P.at(P.cylY(6, 242, c.mat("blank")), 0, 19, 0, o.bs);
    P.at(P.cylY(11, 4, c.mat("blank")), 0, -100, 0, o.bs);
    P.at(P.cylY(RB, 216, c.mat("blank")), 0, 10, 0, o.bs);

    // change wheels, one pair for each choice: gears y -118..-102, centres 150 apart
    [["fine", 40, 20], ["same", 30, 30], ["coarse", 20, 40]].forEach(function (s) {
      var g1 = new T.Group(), g2 = new T.Group();
      var a = P.spurGear({ teeth: s[1], module: MD, material: c.mat("guide") }), b = P.spurGear({ teeth: s[2], module: MD, material: c.mat("blank") });
      [[g1, a, "guide", s[1]], [g2, b, "blank", s[2]]].forEach(function (q) {
        var m = q[1]; m.rotation.x = Math.PI / 2; m.position.y = -110; q[0].add(m);   // gear y -118..-102
        var rf = m.pitchRadius - 1.25 * MD;
        P.at(P.box(rf - 16, 1, 5, c.mat(q[2], "mark")), 12 + (rf - 16) / 2, -101, 0, q[0]);   // red stripe y -101.5..-100.5, lifted off the gear face
        (q[2] === "guide" ? o.gs : o.bs).add(q[0]);
      });
      var N1 = s[1], N2 = s[2], Pc = PG * N2 / N1, turns = LCUT / Pc, n = Math.ceil(turns * 48), hw = Math.max(1.2, .17 * Pc);
      var c0 = -Math.PI - b.pitch / 2;
      // dark thread: a strip on the rod surface at radius 16.6, the path the cutter takes in the rod's own frame
      var pos = [], idx = [], i, f, th, y;
      for (i = 0; i <= n; i++) {
        f = i / n; th = c0 - f * o.A * N1 / N2; y = YTOP - f * LCUT;
        pos.push(-RBAND * Math.cos(th), y + hw, -RBAND * Math.sin(th), -RBAND * Math.cos(th), y - hw, -RBAND * Math.sin(th));
        if (i < n) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
      }
      var geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      var bm = c.mat("blank", "dark").clone(); bm.side = T.DoubleSide;
      var band = new T.Mesh(geo, bm); o.bs.add(band);
      o.sets[s[0]] = { g1: g1, g2: g2, N1: N1, N2: N2, Pc: Pc, c0: c0, band: band, n: n };
    });

    // carriage: nut around the guide screw (x -105..-45, z -30..30, y +-18), tooth into the thread, arm, tool slide, guide lug
    o.car = new T.Group(); scene.add(o.car);
    P.at(P.guideBlock({ w: 60, d: 60, h: 36, hole: 27, material: c.mat("carriage") }), XG, 0, 0, o.car);   // nut, hole wider than the thread tip (25.6)
    o.tooth = P.at(P.box(18, 8, 8, c.mat("carriage")), XG + 20, 0, 0, o.car);                            // tooth x -64..-46 (inner end x -64 sits in the thread gap), nut face at -45
    P.at(P.box(87, 10, 10, c.mat("carriage")), -3.5, 0, 0, o.car);                                       // arm x -47..40, y -5..5, z -5..5, starts inside the nut
    P.at(P.box(10, 8, 90, c.mat("carriage")), 0, 0, -45, o.car);                                         // lug bar x -5..5, z -90..0, y -4..4 (inside the arm height)
    P.at(P.guideBlock({ w: 20, d: 20, h: 14, hole: 4.5, material: c.mat("carriage") }), 0, 0, -100, o.car);   // lug block z -110..-90 round the fixed rod
    o.tool = new T.Group(); o.car.add(o.tool);
    P.at(P.box(8, 16, 12, c.mat("carriage")), 44, 0, 0, o.tool);                                         // tool post x 40..48, touches the arm end
    P.at(P.box(10, 6, 6, c.mat("cutter")), 53, 0, 0, o.tool);                                            // cutter x 48..58, tip 1 inside the rod surface (x 59)
  },

  step: function (c, dt, S) {
    var o = this.o, k, s = o.sets[S.controls.wheels] || o.sets.same, key = S.controls.wheels;
    if (key !== o.last) {
      o.last = key;
      if (o.fresh) { o.a = o.amax = 0; o.phase = "cut"; o.e = 0; }
      o.fresh = true;
    }
    var rate = 1 / .35, w = S.playing ? S.w : 0;
    if (o.phase === "cut") {
      o.e = Math.max(0, o.e - rate * dt);
      if (o.e === 0) { o.a += w * dt; if (o.a > o.amax) o.amax = o.a; }
      if (o.a >= o.A) { o.a = o.A; o.amax = o.A; o.phase = "back"; }
    } else if (S.playing) {                                  // cutter lifted, machine run backwards to bring the carriage up
      o.e = Math.min(1, o.e + rate * dt);
      if (o.e === 1) o.a -= 20 * dt;
      if (o.a <= 0) { o.a = 0; o.amax = 0; o.phase = "cut"; }
    }
    for (k in o.sets) { var q = o.sets[k], on = q === s; q.g1.visible = q.g2.visible = q.band.visible = on; }
    o.gs.rotation.y = o.a;                                    // guide screw and its wheel
    o.bs.rotation.y = s.c0 - o.a * s.N1 / s.N2;               // rod turns the other way, speeds in inverse ratio of teeth
    o.car.position.y = o.YTOP - o.PG * o.a / (2 * Math.PI);   // the tooth rides the thread: one pitch for each turn
    o.tool.position.x = -14 * o.e; o.tooth.position.x = -55 + 16 * o.e;
    var seg = Math.min(s.n, Math.floor(o.amax / o.A * s.n));
    s.band.geometry.setDrawRange(0, 6 * seg);
    S.set("turns", Math.round(o.a * s.N1 / s.N2 / (2 * Math.PI) * 10) / 10 + " turns");
    S.set("pitch", Math.round(s.Pc / 4 * 10) / 10 + " mm");
  }
});
