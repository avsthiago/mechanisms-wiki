(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // clockwise. The ring hangs round the wheel on the pendulum rod, which swings on a pin high above.
  var RAD = Math.PI / 180, N = 7, R = 100, RR = 58, AY = 300, PITCH = 2 * Math.PI / N, UC = 6 * RAD;   // UC: how far the tip overhangs the front of the tooth
  var RI = 126, RO = 146, GP = 6, HP = 14, LOCK = 1 * RAD;                           // ring; a pallet's slope is GP wide and HP tall
  var XE = R - AY * (-GP / (2 * AY) + LOCK / 2);                                      // corner of the right-hand pallet with the pendulum hanging straight
  var IW = 3, TAU = 300, CW = 30, IP = 16000, CP = 2560, L0 = 620, MP = IP / (L0 * L0), G = 16 * L0, H = .00025, START = .05, KS = .62;
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function back(k) {                               // tip of tooth k, then its long curved back down to the foot of the next tooth
    var a = k * PITCH, p = [pol(R, a)];
    for (var i = 1; i <= 16; i++) { var t = i / 16; p.push(pol(RR + (R - RR) * (1 - t) * (1 - t), a + t * (PITCH + UC))); }
    return p;
  }
  function tooth(k) { var a = k * PITCH; return back(k).concat([pol(RR - 10, a + PITCH + UC), pol(RR - 10, a + UC), pol(RR, a + UC)]); }
  function wheelOutline() { var p = []; for (var k = 0; k < N; k++) p = p.concat(back(k)); return p; }
  // Right-hand pallet: a flat top the tooth lands on, and a sloping end that the tooth runs down, pushing the ring to
  // the right. The left-hand pallet is the same shape turned upside down: a flat underside and a slope going up.
  function palletOutline(s) { return [[XE, 0], [XE - GP, -HP], [RI + 2, -HP], [RI + 2, 0]].map(function (q) { return [s * q[0], s * q[1]]; }); }
  // Bodies: 0 escape wheel (one outline per tooth), 1 ring with its two pallets, rod and bob.
  function makeSim(P) {
    var polys = [], k;
    for (k = 0; k < N; k++) polys.push(tooth(k));
    var s = P.pivotSim({ bodies: [{ pivot: [0, 0], I: IW, polys: polys, drag: CW, a: .2 }, { pivot: [0, AY], I: IP, polys: [palletOutline(1), palletOutline(-1)], drag: CP, a: START }], pairs: [[0, 1]] });
    s.t = 0; s.amp = START; s.beats = []; s.hi = -.2; s.dip = 0; s.rec = [0, 0];
    s.run = function (h, len) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = -TAU; b[1].tq = -MP * G * len * Math.sin(b[1].a);                     // the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (-b[0].a > s.hi) s.hi = -b[0].a; else if (s.hi + b[0].a > s.dip) s.dip = s.hi + b[0].a;   // how far the wheel has been pushed back
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); s.rec = [s.rec[1], s.dip]; s.dip = 0; }
    };
    return s;
  }

  M507.define({
    number: 290,
    title: "Pendulum escapement",
    lede: "Here the pendulum rod carries a ring that hangs right round the escape wheel. Two small ledges inside the ring take turns to catch a tooth. Each swing of the pendulum lets the wheel move on by half a tooth.",
    alt: "A small wheel with seven hooked teeth sits inside a round ring. The ring is part of a long pendulum rod that hangs from a pin high above and carries on below the ring. Two small ledges stick inward from the ring, one on the left and one on the right, level with the middle of the wheel.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "A weight, not shown, keeps trying to turn it clockwise. Watch the red tooth go round in steps." },
      { key: "ring", color: "#C8873A", name: "Ring and ledges", note: "The ring swings from side to side with the pendulum. The ledge on each side is a pallet. When one ledge slides in under a tooth, the other slides out." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "The rod hangs from the pin at the top, with the ring fixed in the middle of it and a weight at the bottom. Its length sets the pace." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 540, max: 700, step: 20, value: L0, unit: "",
      presets: [[540, "Short"], [620, "Medium"], [700, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }, { id: "rec", label: "Pushed back" }],
    views: { "3d": [153, 60, 437], front: [0, 35, 465], side: [465, 35, 0] },
    target: [0, 35, 0],
    how: [
      "The weight tries to turn the wheel clockwise. On the right, the tip of a tooth comes down onto the flat top of a ledge and stops. The wheel cannot move.",
      "The pendulum swings the ring to the right and the ledge slides out from under the tooth. The tooth runs down the sloping end of the ledge and pushes it further the same way. That push keeps the pendulum swinging. The wheel turns until a tooth on the left comes up under the other ledge, which has just moved in. On the swing back the same thing happens on the left. The flat faces also move the resting tooth a little each swing, so the wheel is pushed back slightly. The Recoil number shows how far.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown gives no description beyond the name, so how the ledges work is worked out from the picture. The sloping ends of the ledges, the weight at the bottom of the rod, the pin at the top, the back plate and the sizes were made up. The backs of the teeth are hollowed more than drawn so that the ledges have room. The weight that turns the wheel is left out and its pull is taken to be steady. The teeth slide on the ledges without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, pitch: PITCH, lens: [540, 620, 700], dir: -1 },
    build: function (c) {
      var T = c.THREE, P = c.P, mw = c.mat("wheel"), mr = c.mat("ring"), mp = c.mat("pend"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      var root = new T.Group(); root.scale.set(KS, KS, KS); root.position.y = 35; c.scene.add(root);   // the layout is shown at 0.62 and lifted to sit round the origin
      // wheel z -3..3; one red tooth z -3.6..3.6, proud of both faces
      o.wheel = new T.Group(); root.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 6, z0: -3, material: mw }));
      o.wheel.add(P.outlinePlate({ points: back(0).slice(0, 8).concat([pol(RR + 14, UC)]).map(function (q) { return [q[0] * 1.012, q[1] * 1.012]; }), depth: 7.2, z0: -3.6, material: c.mat("wheel", "mark") }));
      P.at(P.cylZ(12, 2, c.mat("wheel", "dark")), 0, 0, 4, o.wheel);                  // hub cap z 3..5, on the face
      P.at(P.cylZ(5, 27, c.fixed), 0, 0, -16.5, root);                                // pin z -30..-3, plate face to the back of the wheel
      // ring z -3..3 round the wheel, ledges z -3.6..3.6 set into it; all hang from the pin at (0, AY)
      o.pend = new T.Group(); o.pend.position.set(0, AY, 0); root.add(o.pend);
      var sh = new T.Shape(), hole = new T.Path(); sh.absarc(0, -AY, RO, 0, 2 * Math.PI, false); hole.absarc(0, -AY, RI, 0, 2 * Math.PI, true); sh.holes.push(hole);
      var rg = new T.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false, curveSegments: 48 }); rg.translate(0, 0, -3); o.pend.add(new T.Mesh(rg, mr));
      [1, -1].forEach(function (s) { o.pend.add(P.outlinePlate({ points: palletOutline(s).map(function (q) { return [q[0], q[1] - AY]; }), depth: 7.2, z0: -3.6, material: mr })); });
      // rod z -2..2: upper piece from the boss down to the top of the ring, lower piece from the bottom of the ring to the bob
      P.at(P.cylZ(11, 6, mp), 0, 0, 0, o.pend);                                       // boss z -3..3 on the pin
      P.at(P.box(7, AY - RO - 10, 4, mp), 0, -(AY - RO + 10) / 2, 0, o.pend);         // y 10..154 below the pin: boss edge to the ring's top at 154
      o.rod = P.at(P.box(7, 1, 4, mp), 0, 0, 0, o.pend);                              // from the ring's bottom at 446 below the pin; length set each frame
      o.bob = P.at(P.cylZ(26, 8, mp), 0, 0, 0, o.pend);                               // z -4..4
      P.at(P.cylZ(5, 27, c.fixed), 0, AY, -16.5, root);                               // pin z -30..-3, plate face to the back of the boss
      // back plate and base
      P.at(P.box(340, 790, 6, c.fixed), 0, -60, -33, root);                           // plate x -170..170, y -455..335, z -36..-30
      P.at(P.box(370, 14, 110, c.fixed), 0, -462, -10, root);                         // base y -469..-455, z -65..45; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l);
      o.wheel.rotation.z = b[0].a; o.pend.rotation.z = b[1].a;
      var top = AY + RO;                                                              // the ring's bottom, measured down from the pin
      o.rod.scale.y = l - top; o.rod.position.y = -(l + top) / 2;                    // lower rod from the ring down to the middle of the bob
      o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp / RAD).toFixed(1) + "°");
      S.set("rec", ((sim.rec[0] + sim.rec[1]) / 2 / RAD).toFixed(1) + "°");           // mean of the last two beats, one on each ledge
    }
  });
})();
