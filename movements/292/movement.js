(function () {
  // Flat layout in model units, wheel centre at the origin, y up, as in Brown's drawing. The wheel turns clockwise.
  // The pallet arms hang from a pin high above the wheel and reach down to its right-hand edge, where the studs
  // are moving almost straight away from the pin.
  var RAD = Math.PI / 180, N = 30, RS = 100, FX = 15, FY = 201, SR = 3, PITCH = 2 * Math.PI * RS / N;
  var Q0 = [RS * Math.cos(29 * RAD), RS * Math.sin(29 * RAD)];                       // where the studs meet the pallets
  var RHO = Math.hypot(Q0[0] - FX, Q0[1] - FY), AS = Math.atan2(Q0[1] - FY, Q0[0] - FX);
  var GAM = 4 * RAD, LAM = 1 * RAD, TP = 6, WID = 9 * RAD;                           // slope, catch, thickness and length of a pallet, seen from the pin
  var IW = .05, TAU = 60, CW = 2, MP = .02, G = 5000, CP = 75, H = .0005, START = 5.5 * RAD, L0 = 280;   // START: near the steady swing
  function pol(c, r, a) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
  function studAngle(k) { return 29 * RAD + (PITCH / 4 + SR + 1) / RS + k * PITCH / RS; }   // at the start one stud is just short of the inner pallet
  function studOutline(k) {                         // half-round: the round side leads, the flat side trails
    var a = studAngle(k), c = pol([0, 0], RS, a), p = [];
    for (var i = 0; i <= 8; i++) p.push(pol(c, SR, a - Math.PI + i * 22.5 * RAD));
    return p;
  }
  // Pallet 1 (front, the outer one): its resting face is a circle about the pin, on the right of the stud's path, and
  // its sloping end runs outward to the left. Pallet 2 (back, the inner one) is the mirror of it, half a stud space nearer the pin.
  function palletOutline(j) {
    var F = [FX, FY], s = j === 1 ? 1 : -1, r = RHO + s * PITCH / 4, a0 = AS + s * (GAM - LAM) / 2, p = [], i;
    for (i = 0; i <= 4; i++) p.push(pol(F, r, a0 + s * WID * i / 4));
    for (i = 4; i >= 0; i--) p.push(pol(F, r + TP, a0 - s * GAM + s * (WID + GAM) * i / 4));
    return p;
  }
  // A pallet with its arm up to the pin, in one outline: the same resting face, slope and outer face as above.
  function armOutline(j) {
    var F = [FX, FY], s = j === 1 ? 1 : -1, r = RHO + s * PITCH / 4, a0 = AS + s * (GAM - LAM) / 2, p = [], i;
    for (i = 0; i <= 4; i++) p.push(pol(F, r, a0 + s * 6 * RAD * i / 4));
    p.push(pol(F, 14, a0 - s * 12 * RAD), pol(F, 14, a0 + s * 27 * RAD));
    for (i = 4; i >= 0; i--) p.push(pol(F, r + TP, a0 - s * GAM + s * (WID + GAM) * i / 4));
    return p.map(function (q) { return [q[0] - FX, q[1] - FY]; });
  }
  function rimOutline() { var p = []; for (var i = 0; i < 72; i++) p.push(pol([0, 0], RS + 6, i * 5 * RAD)); return p; }
  // Bodies: 0 wheel (studs on the front, then the same again on the back), 1 pallet arms with the pendulum.
  function makeSim(P) {
    var polys = [], layers = [], k;
    for (k = 0; k < N; k++) { polys.push(studOutline(k)); layers.push(0); }
    for (k = 0; k < N; k++) { polys.push(studOutline(k)); layers.push(1); }
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: polys, layers: layers, drag: CW },
        { pivot: [FX, FY], I: MP * L0 * L0, polys: [palletOutline(1), palletOutline(2)], layers: [0, 1], drag: CP, a: START }
      ],
      pairs: [[0, 1]]
    });
    s.t = 0; s.amp = START; s.beats = [];
    s.run = function (h, len, tau) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = -tau; b[1].tq = -MP * G * len * Math.sin(b[1].a);                    // the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }

  M507.define({
    number: 292,
    title: "Stud escapement",
    lede: "This escapement was made for big clocks, such as the clock in a tower. Small studs stand out from both faces of a wheel. Two pallets on a swinging frame, one in front of the wheel and one behind, let the studs past one at a time.",
    alt: "A big wheel with a ring of small studs on its rim, on both faces. A pin high above the wheel carries two long arms that reach down to the right-hand edge of the wheel. Each arm ends in a short curved block, one in front of the rim and one behind it. A pendulum hangs from the same pin.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Stud wheel", note: "A weight, not shown, keeps trying to turn it clockwise. It has the same ring of studs on its front and on its back. Watch the red stud to see it move on." },
      { key: "arms", color: "#C8873A", name: "Pallet arms", note: "Two arms fixed together that swing on the pin at the top. The block at the end of each arm is a pallet. One works on the front studs and the other on the back studs." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Fixed to the pallet arms and swings with them. Its length sets how quickly they rock." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 220, max: 340, step: 20, value: L0, unit: "",
      presets: [[220, "Short"], [280, "Medium"], [340, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [170, 115, 585], front: [20, 60, 600], side: [860, 20, -5] },
    target: [20, 60, -5],
    how: [
      "The wheel is always trying to turn. A stud runs up against the curved face of a pallet and rests there, so the wheel cannot move.",
      "The pallets swing with the pendulum. Each curved face is part of a circle drawn round the pin at the top. So the pallet can slide along under a resting stud without pushing the wheel back or letting it creep forward. When the end of the face slides out from under the stud, the stud runs down the sloping end and pushes the pallet aside. That push keeps the pendulum swinging. The wheel moves on a little, until a stud on its other face lands on the other pallet.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart and the wheel turns more slowly. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing, which shows part of the wheel and the two pallets. The rest of the wheel, the pendulum, the back plate and the sizes were made up. The studs are half-round here. The pendulum hangs in front so that it can be seen. The weight that turns the wheel is left out and its pull is taken to be steady. The studs slide on the pallets without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { N: N, RS: RS, TAU: TAU, H: H, L0: L0 },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("arms"), mp = c.mat("pend"), ms = c.mat("wheel", "dark"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 6000; i++) o.sim.run(H, L0, TAU);                                // run 3 seconds so it opens in its steady swing
      // wheel: rim and spokes z -3..3; studs z 3..9 on the front and z -9..-3 on the back
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: rimOutline(), depth: 6, z0: -3, material: mw, windows: { count: 4, rIn: 16, rOut: RS - 6, spoke: 10 }, start: 45 * RAD }));
      for (i = 0; i < N; i++) {
        o.wheel.add(P.outlinePlate({ points: studOutline(i), depth: 6, z0: 3, material: i ? ms : c.mat("wheel", "mark") }));
        o.wheel.add(P.outlinePlate({ points: studOutline(i), depth: 6, z0: -9, material: ms }));
      }
      P.at(P.cylZ(9, 2, c.mat("wheel", "dark")), 0, 0, 4, o.wheel);                    // hub cap z 3..5, on the face
      P.at(P.cylZ(4, 27, c.fixed), 0, 0, -16.5, scene);                                // pin z -30..-3, plate face to the back of the wheel
      // pallet arms: front arm and pallet in one plate z 4..9; back arm z -15..-10, behind the back studs, with its pallet z -10..-4 on it
      o.arms = new T.Group(); o.arms.position.set(FX, FY, 0); scene.add(o.arms);
      o.arms.add(P.outlinePlate({ points: armOutline(1), depth: 5, z0: 4, material: ma }));
      o.arms.add(P.outlinePlate({ points: armOutline(2), depth: 5, z0: -15, material: ma }));
      o.arms.add(P.outlinePlate({ points: palletOutline(2).map(function (q) { return [q[0] - FX, q[1] - FY]; }), depth: 6, z0: -10, material: ma }));
      P.at(P.cylZ(15, 24, ma), 0, 0, -3, o.arms);                                      // hub z -15..9, joins the two arms
      P.at(P.cylZ(5, 15, c.fixed), FX, FY, -22.5, scene);                              // pin z -30..-15, plate face to the back of the hub
      // pendulum in front: boss z 9..17 on the hub, rod z 11..15, bob z 10..16 (the front studs end at z 9)
      P.at(P.cylZ(10, 8, mp), 0, 0, 13, o.arms);
      o.rod = P.at(P.box(5, 1, 4, mp), 0, 0, 13, o.arms);                              // length set each frame
      o.bob = P.at(P.cylZ(22, 6, mp), 0, 0, 13, o.arms);
      // back plate and base
      P.at(P.box(280, 404, 6, c.fixed), 15, 22, -33, scene);                           // plate x -125..155, y -180..224, z -36..-30
      P.at(P.box(300, 12, 100, c.fixed), 15, -186, -10, scene);                        // base y -192..-180, z -60..40; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l, TAU);
      o.wheel.rotation.z = b[0].a; o.arms.rotation.z = b[1].a;
      o.rod.scale.y = l - 10; o.rod.position.y = -(l - 10) / 2 - 10;                  // rod from the boss (10 below the pin) down to the middle of the bob
      o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp * 180 / Math.PI).toFixed(1) + "°");
    }
  });
})();
