(function () {
  // Flat layout in model units, wheel centre at the origin, y up, as in Brown's drawing. The wheel turns clockwise.
  // The pallet arms hang from a pin above the right-hand edge of the wheel and reach down to where the pins of the
  // wheel are moving almost straight away from that pin.
  var RAD = Math.PI / 180, N = 30, RS = 100, FX = 115, FY = 161, SR = 4, PITCH = 2 * Math.PI * RS / N, SEP = 1.5 * PITCH;
  var Q0 = [RS * Math.cos(-10 * RAD), RS * Math.sin(-10 * RAD)];                     // half way between the two pallets
  var RHO = Math.hypot(Q0[0] - FX, Q0[1] - FY), AS = Math.atan2(Q0[1] - FY, Q0[0] - FX);
  var GAM = 4 * RAD, LAM = 1 * RAD, TP = 4.5, WID = 9 * RAD;                           // slope, catch, thickness and length of a pallet, seen from the pin
  var IW = .05, TAU = 60, CW = 4, MP = .02, G = 5000, CP = 75, H = .00025, START = -5.5 * RAD, L0 = 280;   // START: near the steady swing
  function pol(c, r, a) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
  function pinAngle(k) { return -10 * RAD + (SEP / 2 + SR + 1) / RS + k * PITCH / RS; }   // at the start one pin is just short of the upper pallet
  // Two forms of pin, both cut from the same round pin. The round side leads. Form 0 is half the pin. Form 1 is only a thin
  // slice off its leading side.
  function pinForm(k) { return k >= 8 && k < 23 ? 0 : 1; }                            // at the start the half-round pins are on the left of the wheel, as drawn
  function pinOutline(k) {
    var a = pinAngle(k), c = pol([0, 0], RS, a), p = [], half = pinForm(k) ? 60 * RAD : 90 * RAD;
    for (var i = 0; i <= 8; i++) p.push(pol(c, SR, a - Math.PI / 2 - half + 2 * half * i / 8));
    return p;
  }
  // Upper pallet (j = 1): nearer the pin, on the right of the path of the pins. Lower pallet (j = -1): further from the pin,
  // on the left of the path. The top face of each is part of a circle about the pin: a pin of the wheel rests there.
  // The end of each is cut on a slope, and the pin of the wheel runs down it and pushes the pallet aside.
  function palletOutline(j) {
    var F = [FX, FY], r = RHO - j * SEP / 2, a0 = AS + j * (GAM - LAM) / 2, p = [], i;
    for (i = 0; i <= 4; i++) p.push(pol(F, r, a0 + j * WID * i / 4));
    for (i = 4; i >= 0; i--) p.push(pol(F, r + TP, a0 - j * GAM + j * (WID + GAM) * i / 4));
    return p;
  }
  function armOutline(j) {                         // a straight strip from near the pin down over its pallet; local to the pin
    var r = RHO - j * SEP / 2 + TP, a0 = AS + j * 4.5 * RAD, a1 = AS + j * 11.5 * RAD, p = [], i;
    p.push(pol([0, 0], 30, a0), pol([0, 0], 30, a1));
    for (i = 0; i <= 4; i++) p.push(pol([0, 0], r, a1 + (a0 - a1) * i / 4));
    return p;
  }
  function rimOutline() { var p = []; for (var i = 0; i < 72; i++) p.push(pol([0, 0], RS + 13, i * 5 * RAD)); return p; }
  // Bodies: 0 wheel (one outline per pin), 1 the two pallets with the arms and the pendulum.
  function makeSim(P) {
    var polys = [], k;
    for (k = 0; k < N; k++) polys.push(pinOutline(k));
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: polys, drag: CW },
        { pivot: [FX, FY], I: MP * L0 * L0, polys: [palletOutline(1), palletOutline(-1)], drag: CP, a: START }
      ],
      pairs: [[0, 1]]
    });
    s.t = 0; s.amp = -START; s.beats = [];
    s.run = function (h, len) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = -TAU; b[1].tq = -MP * G * len * Math.sin(b[1].a);                    // the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }

  M507.define({
    number: 304,
    title: "Pin-wheel escapement",
    lede: "This escape wheel has a ring of small pins on its face instead of teeth. Two pallets on a pair of swinging arms let the pins past one at a time. If a pin is damaged, a new one can be fitted. A broken tooth would spoil a whole toothed wheel.",
    alt: "A big wheel with five spokes and a ring of small pins standing out of its rim. The pins on the left are half-round and the pins on the right are thin slices. Above the right-hand edge of the wheel is a round boss on a pin. Two flat arms hang down from the boss, side by side, to the edge of the wheel. Each arm has a small block behind its lower end, and the pins of the wheel pass down between the two arms. A pendulum hangs from the boss.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Pin wheel", note: "A weight, not shown, keeps trying to turn it clockwise. Its pins are cut to two shapes. Half of them are half-round and half are thin slices. Watch the red pin go down between the arms." },
      { key: "arms", color: "#C8873A", name: "Pallet arms", note: "Two arms fixed to one boss that swings on the pin at the top. A small block behind the end of each arm is a pallet. The right arm carries the upper pallet and the left arm the lower one." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Fixed to the pallet arms and swings with them. Its length sets how quickly they rock." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 220, max: 340, step: 20, value: L0, unit: "",
      presets: [[220, "Short"], [280, "Medium"], [340, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [270, 40, 760], front: [22, -5, 760], side: [767, -5, 0] },
    target: [22, -5, 0],
    how: [
      "The wheel is always trying to turn, so the pins on the right move downward. A pin comes down onto the top face of the upper pallet and rests there. The wheel cannot move.",
      "The pallets swing with the pendulum. The top face of each is part of a circle drawn round the pin at the top. So the pallet can slide along under a resting pin without pushing the wheel back or letting it creep forward. When the end of the face slides out from under the pin, the pin runs down the sloping end and pushes the pallet aside. That push keeps the pendulum swinging. The wheel moves on a little, until another pin lands on the lower pallet. On the swing back the same thing happens there.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart and the wheel turns more slowly. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing and description. Brown says only that the pins have two forms and that the form on the right is the better one. Here the round side of every pin leads. The pins on the left of his drawing are half-round, and the pins on the right are thin slices, which leave the pallets more room. The exact shape of the pallets, the pendulum, the back plate and the sizes were made up. The pallets are small blocks behind the arms, so the arms themselves pass in front of the pins. The pendulum hangs in front so that it can be seen. The weight that turns the wheel is left out and its pull is taken to be steady. The pins slide on the pallets without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, pitch: PITCH / RS, lens: [220, 280, 340], dir: -1, dead: .25 * RAD },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("arms"), mp = c.mat("pend"), ms = c.mat("wheel", "dark"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 12000; i++) o.sim.run(H, L0);                                    // run 3 seconds so it opens in its steady swing
      // wheel: rim and spokes z -3..3; pins z 3..9 on the front face
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: rimOutline(), depth: 6, z0: -3, material: mw, windows: { count: 5, rIn: 28, rOut: RS - 12, spoke: 10 }, start: 20 * RAD }));
      for (i = 0; i < N; i++) o.wheel.add(P.outlinePlate({ points: pinOutline(i), depth: 6, z0: 3, material: c.mat("wheel", i ? "light" : "mark") }));
      P.at(P.cylZ(22, 2, mw), 0, 0, 4, o.wheel);                                       // hub z 3..5, on the face
      P.at(P.cylZ(8, 1.5, ms), 0, 0, 5.75, o.wheel);                                   // hub cap z 5..6.5, on the hub
      P.at(P.cylZ(4, 27, c.fixed), 0, 0, -16.5, scene);                                // pin z -30..-3, plate face to the back of the wheel
      // pallets z 3.6..10 among the pins (clear of the wheel face at 3); arms z 10..14 in front of the pins, on the front faces of the pallets
      o.arms = new T.Group(); o.arms.position.set(FX, FY, 0); scene.add(o.arms);
      [1, -1].forEach(function (j) {
        o.arms.add(P.outlinePlate({ points: palletOutline(j).map(function (q) { return [q[0] - FX, q[1] - FY]; }), depth: 6.4, z0: 3.6, material: ma }));
        o.arms.add(P.outlinePlate({ points: armOutline(j), depth: 4, z0: 10, material: ma }));
        P.at(P.cylZ(5, 1, c.mat("arms", "dark")), j * 24, 0, 15, o.arms);              // screw head z 14.5..15.5, on the boss
      });
      P.at(P.cylZ(38, 5, ma), 0, 0, 12, o.arms);                                       // boss z 9.5..14.5, round the tops of both arms
      P.at(P.cylZ(5, 39.5, c.fixed), FX, FY, -10.25, scene);                           // pin z -30..9.5, plate face to the back of the boss; it stands clear of the wheel
      // pendulum in front: boss z 14.5..22.5 on the arms' boss, rod z 16.5..20.5, bob z 15.5..21.5
      P.at(P.cylZ(10, 8, mp), 0, 0, 18.5, o.arms);
      o.rod = P.at(P.box(5, 1, 4, mp), 0, 0, 18.5, o.arms);                            // length set each frame
      o.bob = P.at(P.cylZ(22, 6, mp), 0, 0, 18.5, o.arms);
      // back plate and base
      P.at(P.box(310, 440, 6, c.fixed), 22, -5, -33, scene);                           // plate x -133..177, y -225..215, z -36..-30
      P.at(P.box(330, 12, 100, c.fixed), 22, -231, -10, scene);                        // base y -237..-225, z -60..40; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l);
      o.wheel.rotation.z = b[0].a; o.arms.rotation.z = b[1].a;
      o.rod.scale.y = l - 10; o.rod.position.y = -(l - 10) / 2 - 10;                  // rod from the boss (10 below the pin) down to the middle of the bob
      o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp * 180 / Math.PI).toFixed(1) + "°");
    }
  });
})();
