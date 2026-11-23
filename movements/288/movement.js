(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // anticlockwise. The anchor rocks on a pin straight above the wheel, where the tangents at 33 degrees either side meet.
  var RAD = Math.PI / 180, N = 30, R = 100, RR = 75, AL = 33 * RAD, BE = 45 * RAD, D = R / Math.cos(AL);
  var IW = 1, TAU = 600, CW = 30, IP = 4000, CP = 640, L0 = 280, MP = IP / (L0 * L0), G = 16 * L0, H = .00025, START = .1;
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function toothAngle(k) { return 57 * RAD + k * 2 * Math.PI / N; }
  function tooth(k, rr) { var a = toothAngle(k); return [pol(rr, a - 4 * RAD), pol(R, a), pol(rr, a + 1 * RAD)]; }   // steep front, sloping back
  function wheelOutline() { var p = []; for (var k = 0; k < N; k++) p = p.concat(tooth(k, RR)); return p; }
  // One working face of the anchor: a straight slope through the point where the tangent from the pin touches the
  // tips. It leans 45 degrees from a circle about the pin, so a tooth pressing on it pushes the pallet out of the
  // wheel, and the pallet swinging in pushes the tooth back. s = 1 right-hand pallet, -1 left-hand pallet.
  function face(s) {
    var pa = Math.PI / 2 - s * AL, c = pol(R, pa), u = [-Math.sin(pa), Math.cos(pa)], ti = [-Math.cos(pa), -Math.sin(pa)];
    var f = [Math.sin(BE) * u[0] + Math.cos(BE) * ti[0], Math.sin(BE) * u[1] + Math.cos(BE) * ti[1]], l1 = s > 0 ? 14 : 10, l2 = 6.5;
    return [[c[0] - l1 * f[0], c[1] - l1 * f[1]], [c[0] + l2 * f[0], c[1] + l2 * f[1]]];   // shallow end, deep end
  }
  function anchorOutline() {
    var k = face(1), h = face(-1), p = [h[1], h[0], [-50, D], [-14, D]], i;
    for (i = 1; i < 8; i++) p.push([14 * Math.cos(Math.PI + i * Math.PI / 8), D + 14 * Math.sin(Math.PI + i * Math.PI / 8)]);   // boss round the pin
    p.push([14, D], [50, D], k[1], k[0], [79, 105], [83, 128], [80, D + 30], [-80, D + 30], [-83, 128], [-77, 103]);
    return p;
  }
  // Bodies: 0 escape wheel (one outline per tooth), 1 anchor with the pendulum.
  function makeSim(P) {
    var polys = [], k;
    for (k = 0; k < N; k++) polys.push(tooth(k, RR - 3));
    var s = P.pivotSim({ bodies: [{ pivot: [0, 0], I: IW, polys: polys, drag: CW }, { pivot: [0, D], I: IP, polys: [anchorOutline()], drag: CP, a: START }], pairs: [[0, 1]] });
    s.t = 0; s.amp = START; s.beats = []; s.hi = 0; s.dip = 0; s.rec = [0, 0];
    s.run = function (h, len) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = TAU; b[1].tq = -MP * G * len * Math.sin(b[1].a);                      // the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (b[0].a > s.hi) s.hi = b[0].a; else if (s.hi - b[0].a > s.dip) s.dip = s.hi - b[0].a;   // how far the wheel has been pushed back
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); s.rec = [s.rec[1], s.dip]; s.dip = 0; }
    };
    return s;
  }

  M507.define({
    number: 288,
    title: "Recoil escapement",
    lede: "A weight tries to spin the toothed wheel of a clock. A rocking piece shaped like an anchor lets only one tooth pass for each swing of the pendulum. Each time it catches a tooth it also pushes the wheel back a little, which is why it is called a recoil escapement.",
    alt: "A big wheel with pointed teeth round its rim. Above it sits a wide flat piece shaped like an anchor, on a pin just over the top of the wheel. Its two ends curve down and each ends in a slanted face that reaches in between the teeth, one on the left and one on the right. A pendulum hangs from the same pin.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "A weight, not shown, keeps trying to turn it anticlockwise. Watch the red tooth. It steps forward, and it is pushed back a little before each step." },
      { key: "anchor", color: "#C8873A", name: "Anchor", note: "Rocks on the pin above the wheel. The slanted face on each end is a pallet. The two pallets take turns to catch a tooth." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Fixed to the anchor and swings with it. Its length sets how quickly the anchor rocks." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 240, max: 320, step: 20, value: L0, unit: "",
      presets: [[240, "Short"], [280, "Medium"], [320, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }, { id: "rec", label: "Pushed back" }],
    views: { "3d": [190, 58, 540], front: [0, 25, 500], side: [500, 25, 0] },
    target: [0, 25, 0],
    how: [
      "The weight tries to turn the wheel anticlockwise. A tooth runs up against the slanted face of one pallet and stops. The wheel cannot go on until the pendulum swings that pallet out of the way.",
      "The tooth presses on the slanted face, and that press pushes the pallet outward. This small push at every swing is what keeps the pendulum going. When the pallet lifts clear, the tooth slips past and the other pallet drops in to catch a tooth on the far side. But the pendulum does not stop at once. It carries the pallet a little deeper, and the slanted face pushes the tooth backward. That backward step is the recoil. Watch the red tooth and the Recoil number.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing, which shows the top of the wheel and the anchor. The rest of the wheel, the pendulum, the back plate and the sizes were made up. Brown says the shape of the pallet faces is not necessary to explain, so they are plain straight slopes here. The pendulum hangs in front so that it can be seen. The weight that turns the wheel is left out and its pull is taken to be steady. The teeth slide on the pallets without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, pitch: 2 * Math.PI / N, lens: [240, 280, 320], dir: 1 },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("anchor"), mp = c.mat("pend"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      // wheel z -3..3 with three spokes; one red tooth z -3.6..3.6, proud of both faces
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 6, z0: -3, material: mw, windows: { count: 3, rIn: 16, rOut: 63, spoke: 9 }, start: 55 * RAD }));
      o.wheel.add(P.outlinePlate({ points: tooth(0, RR + 1), depth: 7.2, z0: -3.6, material: c.mat("wheel", "mark") }));
      P.at(P.cylZ(9, 2, c.mat("wheel", "dark")), 0, 0, 4, o.wheel);                   // hub cap z 3..5, on the face
      P.at(P.cylZ(4, 27, c.fixed), 0, 0, -16.5, scene);                               // pin z -30..-3, plate face to the back of the wheel
      // anchor z -3..3, in the plane of the wheel; its pin z -30..-3
      o.anchor = new T.Group(); o.anchor.position.set(0, D, 0); scene.add(o.anchor);
      o.anchor.add(P.outlinePlate({ points: anchorOutline().map(function (q) { return [q[0], q[1] - D]; }), depth: 6, z0: -3, material: ma }));
      P.at(P.cylZ(5, 27, c.fixed), 0, D, -16.5, scene);
      // pendulum in front: boss z 3..13 on the anchor, rod z 7..11, bob z 5..13 (the hub cap ends at z 5 and the bob hangs below the wheel)
      P.at(P.cylZ(10, 10, mp), 0, 0, 8, o.anchor);
      o.rod = P.at(P.box(5, 1, 4, mp), 0, 0, 9, o.anchor);                            // length set each frame
      o.bob = P.at(P.cylZ(22, 8, mp), 0, 0, 9, o.anchor);
      // back plate and base
      P.at(P.box(260, 400, 6, c.fixed), 0, -40, -33, scene);                          // plate x -130..130, y -240..160, z -36..-30
      P.at(P.box(280, 12, 100, c.fixed), 0, -246, -10, scene);                        // base y -252..-240, z -60..40; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l);
      o.wheel.rotation.z = b[0].a; o.anchor.rotation.z = b[1].a;
      o.rod.scale.y = l - 10; o.rod.position.y = -(l - 10) / 2 - 10;                 // rod from the boss (10 below the pin) down to the middle of the bob
      o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp / RAD).toFixed(1) + "°");
      S.set("rec", ((sim.rec[0] + sim.rec[1]) / 2 / RAD).toFixed(1) + "°");           // mean of the last two beats, one on each pallet
    }
  });
})();
