M507.define({
  number: 151,
  title: "Worm and right and left screws",
  lede: "A small screw on the top shaft, called a worm, turns a gear, called a worm wheel. The wheel sits on a long shaft with a screw thread wound one way on its left half and the other way on its right half. Two blocks on the threads slide towards each other or away from each other, slowly and with great force.",
  alt: "A long level shaft with a screw thread near each end and a tall thin gear in the middle. Above the wheel, a short screw on a shaft that points at you, ending in a round crank disc. A block sits on each thread.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Worm", note: "A short screw on the top shaft, which drives the wheel. Its round end faces you, with a red stripe so you can count its turns." },
    { key: "wheel", color: "#C8873A", name: "Worm wheel", note: "It sits in the middle of the long shaft and is turned by the worm. Watch the red tooth creep round." },
    { key: "screw", color: "#4FA58A", name: "Driven shaft", note: "The thread on its left half is wound one way. The thread on its right half is wound the other way. The red stripes show it turning." },
    { key: "nuts", color: "#8E7AA8", name: "Nuts", note: "Two violet blocks, one on each thread. They cannot turn, so the threads push them along. Watch how they move." }
  ],
  controls: [{ id: "dir", label: "Turn the worm so the nuts go", value: "in", options: [["in", "Together"], ["out", "Apart"]] }],
  speed: { min: 20, max: 300, value: 120, label: "Worm speed", unit: " rpm" },
  readouts: [{ id: "turns", label: "Worm" }, { id: "gap", label: "Gap" }],
  views: { front: [0, 20, 620], "3d": [280, 175, 480], side: [620, 20, 0] },
  target: [0, -10, 0],
  how: [
    "Turn the crank end of the top screw, the worm. Its thread pushes the teeth of the wheel along, one tooth for each turn. So the wheel turns much more slowly than the worm.",
    "The wheel is fixed to a long shaft, so the shaft turns with it. The left half of the shaft has a thread wound one way. The right half has a thread wound the other way. Each block, called a nut, cannot turn. The thread pushes it along the shaft. The two threads push in opposite ways, so the nuts move together or apart.",
    "The worm is fast and the nuts are slow, so the nuts move a tiny amount for each turn of the worm. Try Together, then Apart, and watch the gap between the nuts."
  ],
  note: "This model is rebuilt from Brown's drawing. The base, the posts at the ends of the long shaft, the plate that holds the worm, the rail that stops the nuts from turning, the crank disc and the sizes were made up. The wheel has plain straight teeth, as drawn. The nuts stop when they reach the end of the threads. In a real machine the worm would jam there.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 5, N = 20, PITCH = Math.PI * MD, RW = 14;
    var SP = 24, SR = 18;                                       // screw thread pitch and pitch radius
    var o = this.o = { a: 0, wa: 0, turns: 0, d: 120, N: N, DMIN: 52, DMAX: 145, LEAD: SP };
    // rig: local X is world -Z, local Z is world +X; holds the wheel and the worm as in a worm-gear pair seen end on
    var rig = new T.Group(); rig.rotation.y = Math.PI / 2; scene.add(rig);
    o.wheel = new T.Group(); rig.add(o.wheel);
    var g = P.spurGear({ teeth: N, module: MD, material: c.mat("wheel") }); o.wheel.add(g);
    var rp = g.pitchRadius;                                                     // 50
    o.base = Math.PI / 2 - g.pitch / 2;                                         // a tooth gap at the top, under the worm
    var mk = new T.Group(); mk.rotation.z = 5 * g.pitch; o.wheel.add(mk);       // tooth 5, facing the viewer at the start
    [-1, 1].forEach(function (k) { P.at(P.box(10, .2 * PITCH, 1, c.mat("wheel", "mark")), rp - 1, 0, k * 9, mk); });   // red tooth, z 8.5..9.5 off each face

    var w = o.worm = new T.Group(); w.position.set(0, rp + RW, 0); rig.add(w);  // worm axis: world z, y 64
    P.at(P.worm({ radius: RW, pitch: PITCH, length: 60, material: c.mat("worm") }), 0, 0, 0, w);   // local x -30..30
    P.at(P.cylX(5, 122, c.mat("worm")), -1, 0, 0, w);                           // shaft local x -62..60: world z -60..62, from the plate face
    P.at(P.cylX(22, 8, c.mat("worm")), -66, 0, 0, w);                           // crank disc local x -70..-62, world z 62..70
    P.at(P.box(1.3, 22, 4, c.mat("worm", "mark")), -70.15, 12, 0, w);           // red stripe on the disc face, local x -70.8..-69.5

    // long screw: world X, turns with the wheel
    var sc = o.screw = new T.Group(); scene.add(sc);
    var wl = P.worm({ radius: SR, pitch: SP, length: 125, material: c.mat("screw") });   // right-hand, x -165..-40
    P.at(wl, -102.5, 0, 0, sc);
    var wr = P.worm({ radius: SR, pitch: SP, length: 125, material: c.mat("screw") });   // mirrored: left-hand, x 40..165
    wr.scale.x = -1; P.at(wr, 102.5, 0, 0, sc);
    var root = wl.root;                                                         // 8.5
    P.at(P.cylX(root, 80, c.mat("screw")), 0, 0, 0, sc);                        // smooth middle x -40..40
    [-1, 1].forEach(function (k) {
      P.at(P.cylX(root, 10, c.mat("screw")), k * 170, 0, 0, sc);                // shaft ends x ±165..±175, end on the post faces
      P.at(P.box(22, 1.3, 4, c.mat("screw", "mark")), k * 27, root + .15, 0, sc);   // red stripes x 16..38, y root-.5..root+.8
    });
    P.at(P.cylX(14, 28, c.mat("wheel")), 0, 0, 0, sc);                          // collar x -14..14, wheel face at ±8
    o.wheelSpin = 0;

    // nuts: slide along x, held from turning by legs on a rail
    o.nuts = [-1, 1].map(function (k) {
      var n = new T.Group(); scene.add(n);
      P.at(P.box(24, 56, 56, c.mat("nuts")), 0, 0, 0, n);                       // y -28..28, thread tip 25.6
      P.at(P.box(24, 62, 8, c.mat("nuts")), 0, -59, 0, n);                      // leg y -90..-28, bottom on the rail top
      return n;
    });

    // supports
    [-1, 1].forEach(function (k) { P.at(P.box(20, 128, 50, c.fixed), k * 185, -36, 0, scene); });   // posts x ±175..±195, y -100..28, z -25..25
    P.at(P.box(350, 10, 16, c.fixed), 0, -95, 0, scene);                        // rail x -175..175, y -100..-90, z -8..8
    P.at(P.box(80, 184, 10, c.fixed), 0, -8, -65, scene);                       // plate x -40..40, y -100..84, z -70..-60; worm shaft ends at z -60
    P.at(P.box(420, 12, 110, c.fixed), 0, -106, -25, scene);                    // base x -210..210, y -112..-100, z -80..30; posts and plate stand on y -100
  },

  step: function (c, dt, S) {
    var o = this.o, sgn = S.controls.dir === "out" ? 1 : -1;
    var dphi = S.w * dt * sgn, dd = o.LEAD * dphi / o.N / (2 * Math.PI), nd = o.d + dd;
    if (dd && (nd > o.DMAX || nd < o.DMIN)) { var lim = nd > o.DMAX ? o.DMAX : o.DMIN; dphi *= (lim - o.d) / dd; }   // stop at the ends of the thread
    o.a += dphi; o.wa += dphi / o.N; o.turns += Math.abs(dphi) / (2 * Math.PI);
    o.d = Math.max(o.DMIN, Math.min(o.DMAX, o.d + o.LEAD * dphi / o.N / (2 * Math.PI)));
    o.worm.rotation.x = o.a;
    o.wheel.rotation.z = o.base + o.wa;
    o.screw.rotation.x = o.wa;
    o.nuts[0].position.x = -o.d; o.nuts[1].position.x = o.d;
    S.set("turns", (Math.round(o.turns * 10) / 10) + " turns");
    S.set("gap", Math.round(2 * o.d - 24) + " mm");
  }
});
