(function () {
  // The crown wheel turns about an upright axis. Seen from the front, its near teeth run to the right and its far teeth
  // run to the left. The rocking rod (the verge) points at the viewer, straight over the middle of the wheel, D above the
  // tips of the teeth. One pallet hangs from it over the near teeth and one over the far teeth.
  // The contact is worked out flat, in the view from the front. Each row of teeth is taken as part of a very large wheel
  // (radius RB) about a point far below, so that it runs almost straight; near and far rows are tied to move equally and
  // oppositely. Every time the rows have moved one tooth they are stepped back one tooth, which changes nothing to look at.
  var RAD = Math.PI / 180, N = 21, RO = 100, RI = 88, RM = 94, HT = 10.5, FLAT = 2, D = 15, LP = 25, TP = 4, A0 = 48 * RAD;
  var PITCH = 2 * Math.PI * RM / N, RB = 2000, PA = PITCH / RB;
  var IR = 400, TQ = 7500, CR = 75000, IV0 = 4, MB = .0012, CV = 30, H = .00025, R0 = 100;   // each row of teeth; the rod; one ball
  function big(x, y) { var a = x / RB, r = RB + y; return [r * Math.sin(a), r * Math.cos(a) - RB]; }   // a point of a row: x along it, y above the tips
  function toothOutline(k, far) {                  // steep face in front, a small level tip, long slope behind
    var x0 = (k + (far ? .5 : 0)) * PITCH, s = far ? -1 : 1, p = [], i;
    p.push(big(s * x0, 0), big(s * x0, -HT));
    for (i = 1; i <= 4; i++) p.push(big(s * (x0 - PITCH * i / 4), -HT));
    p.push(big(s * (x0 - FLAT), 0));                                                  // a small level land at the tip
    return p;
  }
  function palletOutline(j) {                      // j = 1 near pallet, hangs to the right; j = -1 far pallet, hangs to the left
    var a = j * A0, c = Math.cos(a), s = Math.sin(a), h = TP / 2;
    return [[-h * c, D - h * s], [LP * s - h * c, D - LP * c - h * s], [LP * s + h * c, D - LP * c + h * s], [h * c, D + h * s]];
  }
  // Bodies: 0 near row of teeth, 1 the rod with both pallets, 2 far row of teeth.
  function makeSim(P) {
    var near = [], far = [], k;
    for (k = -3; k <= 3; k++) { near.push(toothOutline(k, false)); far.push(toothOutline(k, true)); }
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, -RB], I: IR, polys: near, drag: CR, a: -.3 * PA },
        { pivot: [0, D], I: IV0 + 2 * MB * R0 * R0, polys: [palletOutline(1), palletOutline(-1)], layers: [0, 1], drag: CV },
        { pivot: [0, -RB], I: IR, polys: far, layers: far.map(function () { return 1; }), drag: CR, a: .3 * PA }
      ],
      pairs: [[0, 1], [2, 1]],
      links: [{ i: 0, j: 2, gi: 1, gj: 1, c: 0 }, { i: 0, j: 2, gi: -1, gj: -1, c: 0 }]
    });
    s.t = 0; s.amp = 0; s.beats = []; s.teeth = 0; s.ends = [0, 0];
    s.travel = function () { return s.teeth * PITCH - s.bodies[0].a * RB; };          // how far the near teeth have run
    s.run = function (h, rb) {
      var b = s.bodies, w0 = b[1].w;
      s.setI(1, IV0 + 2 * MB * rb * rb);
      b[0].tq = -TQ; b[2].tq = TQ; b[1].tq = 0;                                       // the weight drives the wheel; nothing pulls the balance back
      s.step(h); s.t += h;
      if (b[0].a < -PA) { b[0].a += PA; b[2].a -= PA; s.teeth++; }
      if (b[0].a > 0) { b[0].a -= PA; b[2].a += PA; s.teeth--; }
      if (w0 * b[1].w < 0 && Math.abs(b[1].a - s.ends[1]) > 3 * RAD) {                // the balance turns back: one beat
        s.ends = [s.ends[1], b[1].a]; s.amp = Math.abs(s.ends[1] - s.ends[0]) / 2;
        s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift();
      }
    };
    return s;
  }

  M507.define({
    number: 302,
    title: "Balance-wheel escapement",
    lede: "A wheel with saw teeth round its rim is pulled round by a weight. Two small plates on a rocking rod catch its teeth in turn, so it moves one step at a time. A bar with a heavy ball on each end is fixed to the rod and slows the rocking down.",
    alt: "A wide band seen from the side, with a row of saw teeth along its top edge, standing on an upright shaft. Just above the teeth a rod points straight at you, seen end on as a small circle. Two short flat plates spread down from the rod like an upside-down letter V, one reaching the teeth on the near side and one the teeth on the far side. Behind the band a long bar is fixed across the rod, with a large ball on each end.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Crown wheel", note: "Its teeth stand up round the rim like the points of a crown. A weight, not shown, keeps trying to turn it. The teeth nearest you move to the right. Watch the red tooth go round one step at a time." },
      { key: "verge", color: "#C8873A", name: "Rod and pallets", note: "The rod lies across the top of the wheel and rocks to and fro. One flat plate hangs into the teeth on the near side and the other into the teeth on the far side. The plates are called pallets." },
      { key: "balance", color: "#D9B13B", name: "Balance", note: "A bar with a ball on each end, fixed to the rod. It is heavy and slow to start and to stop. That is what makes each beat take time." }
    ],
    controls: [{ type: "range", id: "rb", label: "Balls on the bar", min: 60, max: 100, step: 10, value: R0, unit: "",
      presets: [[60, "Near the rod"], [80, "Half way"], [100, "At the ends"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [185, 115, 590], front: [0, 8, 590], side: [640, 8, -20] },
    target: [0, 8, -20],
    how: [
      "You are looking along the rocking rod. The weight pulls the crown wheel round, so the teeth nearest you move to the right and the teeth on the far side move to the left. A near tooth presses on the near pallet and pushes it aside. That turns the rod, and it swings the far pallet down into the teeth on the far side.",
      "The near pallet swings up until its tooth slips under the end. The wheel jumps on, but at once a far tooth lands on the far pallet. That tooth pushes the rod back the other way. The heavy balance does not stop at once, so for a moment the pallet even pushes the wheel backwards. Each push and slip is one beat, and the wheel moves on one tooth for every two beats.",
      "Nothing pulls the balance back to the middle. Only its weight sets the pace. With the balls far out, the balance is harder to turn, so the beats come further apart. Try Near the rod, then At the ends, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing and description. Brown shows the band of teeth from the side, the two pallets and the balance. The posts, the base and the sizes were made up, and the weight that turns the wheel is left out. The pallets are spread wider apart than Brown draws them, and the teeth are larger, with small flat tips, so that each tooth is caught in time. Sliding the balls along the bar is made up, though old clocks of this kind were set in a similar way. The touching of teeth and pallets is worked out in the flat view from the front. The parts slide on each other without rubbing, and the rubbing that keeps the swing steady is a simple guess.",

    makeSim: makeSim, K: { H: H, PITCH: PITCH, rbs: [60, 80, 100], RB: RB },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), mv = c.mat("verge"), mb = c.mat("balance"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, R0);                                   // run 5 seconds so it opens in its steady swing
      // crown wheel about the upright axis through the origin; tooth tips at y = 0
      o.wheel = new T.Group(); scene.add(o.wheel);
      var cr = P.sawCrown({ teeth: N, rIn: RI, rOut: RO, base: 31, depth: HT, flat: FLAT, material: mw, markMaterial: c.mat("wheel", "mark") });
      cr.rotation.x = -Math.PI / 2; cr.position.y = -40; o.wheel.add(cr);            // band y -40..-9, teeth y -9..0
      P.at(P.cylY(RO, 6, mw), 0, -43, 0, o.wheel);                                    // disc y -46..-40, the band stands on it
      P.at(P.cylY(14, 2, c.mat("wheel", "dark")), 0, -39, 0, o.wheel);                // hub y -40..-38, on the disc face
      P.at(P.cylY(7, 104, mw), 0, -98, 0, o.wheel);                                   // shaft y -150..-46, base top to the disc
      var pin = P.spurGear({ teeth: 12, module: 3, width: 24, material: mw }); pin.rotation.x = Math.PI / 2;
      P.at(pin, 0, -118, 0, o.wheel);                                                 // small gear y -130..-106 on the shaft, where the clock's wheels would drive it
      // rocking rod along Z, D above the tooth tips, with the two pallets; it turns about Z
      o.verge = new T.Group(); o.verge.position.set(0, D, 0); scene.add(o.verge);
      P.at(P.cylZ(3, 268.5, mv), 0, 0, -30.25, o.verge);                              // rod z -164.5..104, from the far post to the front, 0.5 short of the post face
      [1, -1].forEach(function (j) {
        var pl = P.at(P.box(TP, LP, 16, mv), j * LP / 2 * Math.sin(A0), -LP / 2 * Math.cos(A0), j * RM, o.verge); pl.rotation.z = j * A0;   // pallet over the rim, z 86..102 (near) and -102..-86 (far)
        P.at(P.cylZ(5.5, 20, mv), 0, 0, j * RM, o.verge);                             // boss round the rod where the pallet joins
      });
      // balance on the rod between the posts: bar z -143..-137, balls slide along it
      P.at(P.cylZ(9, 14, mb), 0, 0, -140, o.verge);                                   // hub z -147..-133
      P.at(P.box(6, 212, 6, mb), 0, 0, -140, o.verge);                                // bar, 106 each way from the rod
      o.balls = [1, -1].map(function (j) { return P.at(P.sphere(22, mb), 0, j * R0, -140, o.verge); });
      o.dot = P.at(P.sphere(4, c.mat("balance", "mark")), 0, R0, -117, o.verge);      // red dot on the front of the upper ball, to follow the swing
      // stand: base and two posts that hold the rod; the wheel shaft stands on the base
      P.at(P.box(250, 12, 320, c.fixed), 0, -156, -35, scene);                        // base x -125..125, y -162..-150, z -195..125
      P.at(P.box(20, 177, 10, c.fixed), 0, -61.5, -110, scene);                       // post z -115..-105, y -150..27; rod ends meet its faces
      P.at(P.box(20, 177, 10, c.fixed), 0, -61.5, -170, scene);                       // post z -175..-165, y -150..27
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, rb = S.controls.rb, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0;
      for (var i = 0; i < n; i++) sim.run(H, rb);
      o.wheel.rotation.y = sim.travel() / RM - Math.PI / 2;                           // a tooth tip stands at the near point when the near row is at 0
      o.verge.rotation.z = sim.bodies[1].a;
      o.balls[0].position.y = rb; o.balls[1].position.y = -rb; o.dot.position.y = rb;
      var b = sim.beats, per = b.length > 2 ? (b[b.length - 1] - b[0]) / (b.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp / RAD) + "°");
    }
  });
})();
