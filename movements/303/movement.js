(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // clockwise. The pallet frame hangs from a pin above the wheel, and its two straight arms reach down to the
  // tips of the teeth on each side. Everything is worked out for a wheel turning anticlockwise and then mirrored (x to -x).
  var RAD = Math.PI / 180, N = 30, R = 100, RR = 89.5, AY = 160, PK = 39 * RAD;        // PK: 8.5 teeth lie between the two pallets; where the mirrored right-hand pallet meets the tips
  var TP = 5.5, MU = 1 * RAD, NU = 3 * RAD, EXT = 13 * RAD, ARM = 9 * RAD;             // pallet thickness; the slope is crossed between -MU and +NU of swing; outer end; middle of the arm
  var IW = 1, TAU = 600, CW = 30, IP = 6500, CP = 1000, L0 = 310, MP = IP / (L0 * L0), G = 16 * L0, H = .00025, START = -.08;
  var QK = [R * Math.cos(PK), R * Math.sin(PK)], RHO = Math.hypot(QK[0], QK[1] - AY);   // both resting faces lie on one circle about the pin
  function mir(p) { return p.map(function (q) { return [-q[0], q[1]]; }); }
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function pin(r, a) { return [r * Math.cos(a), AY + r * Math.sin(a)]; }
  function psi(q) { return Math.atan2(q[1] - AY, q[0]); }
  function cross(a0, rad) {                        // point on the tip circle, just past angle a0, that is rad from the pin
    var lo = a0, hi = a0 + .3, f = function (a) { return Math.hypot(R * Math.cos(a), R * Math.sin(a) - AY) - rad; }, s = f(lo) > 0;
    for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if ((f(m) > 0) === s) lo = m; else hi = m; }
    return pol(R, lo);
  }
  // Teeth are short wedges with a small flat tip. The front face leans a little forward, so that only the front corner
  // of the tip meets a pallet; the back slopes away to a wide root.
  function grow(p) { var x = 0, y = 0; p.forEach(function (q) { x += q[0] / p.length; y += q[1] / p.length; }); return p.map(function (q) { return [x + (q[0] - x) * 1.15, y + (q[1] - y) * 1.15]; }); }   // a little bigger all round, so the red mark stands clear of the tooth sides
  function tooth0(k, rr) { var a = PK + k * 2 * Math.PI / N; return [pol(rr, a - 5.2 * RAD), pol(R, a - 1.1 * RAD), pol(R, a), pol(rr, a - .9 * RAD)]; }
  function tooth(k, rr) { return mir(tooth0(k, rr)); }
  function wheelOutline() { var p = []; for (var k = 0; k < N; k++) p = p.concat(tooth0(k, RR)); return mir(p); }
  // A pallet is a short curved block whose two long faces are circles about the pin, so a tooth resting on one is
  // neither pushed back nor let forward as the block slides. Its end is cut on a slope: the tooth runs down the slope
  // and pushes the block aside. s = 1: left-hand pallet, the tooth rests on its outer face. s = -1: right-hand pallet,
  // the tooth rests on its inner face.
  function palletOutline(s) {
    var a0 = s > 0 ? psi(QK) : psi([-QK[0], QK[1]]), r2 = RHO - s * TP, a2 = psi(cross(s > 0 ? PK : Math.PI - PK, r2)), p = [], i, n = 12;
    var c1 = a0 + s * MU, c2 = a2 - s * NU, far = a0 + s * EXT;                       // corner of the resting face, far corner of the slope, outer end
    for (i = 0; i <= n; i++) p.push(pin(RHO, c1 + (far - c1) * i / n));
    for (i = n; i >= 0; i--) p.push(pin(r2, c2 + (far - c2) * i / n));
    return mir(p);
  }
  function frameOutline() {                        // two straight arms from the pin, each ending inside the outer end of its pallet
    var a1 = psi(QK) + ARM, a2 = psi([-QK[0], QK[1]]) - ARM, hw = 8, e1 = RHO - 1, e2 = RHO + TP - 1, t = Math.tan((a1 - a2) / 2), b = Math.asin(hw / 15), p = [], i;
    function arm(a, u, v) { return [u * Math.cos(a) - v * Math.sin(a), AY + u * Math.sin(a) + v * Math.cos(a)]; }   // u along the arm, v across it
    p.push(arm(a1, 15 * Math.cos(b), hw), arm(a1, e1, hw), arm(a1, e1, -hw), arm(a1, hw / t, -hw), arm(a2, e2, hw), arm(a2, e2, -hw), arm(a2, 15 * Math.cos(b), -hw));
    for (i = 1; i < 12; i++) p.push(pin(15, a2 - b + (a1 + 2 * b - a2 - 2 * Math.PI) * i / 12));   // round the top of the boss
    return mir(p);
  }
  // Bodies: 0 escape wheel (one outline per tooth), 1 the two pallets with the pendulum.
  function makeSim(P) {
    var polys = [], k;
    for (k = 0; k < N; k++) polys.push(tooth(k, RR - 3));
    var s = P.pivotSim({ bodies: [{ pivot: [0, 0], I: IW, polys: polys, drag: CW }, { pivot: [0, AY], I: IP, polys: [palletOutline(1), palletOutline(-1)], drag: CP, a: START }], pairs: [[0, 1]] });
    s.t = 0; s.amp = -START; s.beats = [];
    s.run = function (h, len) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = -TAU; b[1].tq = -MP * G * len * Math.sin(b[1].a);                     // the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }

  M507.define({
    number: 303,
    title: "Dead-beat pendulum escapement",
    lede: "A weight tries to spin the toothed wheel of a clock. Two pallets on a rocking frame let one tooth pass for each swing of the pendulum. Between steps the wheel stands perfectly still and is never pushed back. That is why it is called dead-beat, and why it keeps good time.",
    alt: "A wheel with short blunt teeth all round it and four spokes. Above the wheel is a pin. Two straight arms spread down from the pin, one to each side, like an upside-down letter V. Each arm ends in a small curved block that turns in towards the teeth. A pendulum hangs from the same pin, down across the front of the wheel.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "A weight, not shown, keeps trying to turn it clockwise. Watch the red tooth. It steps forward and then stands dead still." },
      { key: "anchor", color: "#C8873A", name: "Pallet frame", note: "Two arms that hang from the pin at the top and rock with the pendulum. The curved block on the end of each arm is a pallet. The two pallets take turns to catch a tooth." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Fixed to the pallet frame and swings with it. Its length sets how quickly the frame rocks." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 270, max: 350, step: 20, value: L0, unit: "",
      presets: [[270, "Short"], [310, "Medium"], [350, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [225, 10, 690], front: [0, -22, 725], side: [725, -22, 0] },
    target: [0, -22, 0],
    how: [
      "The weight tries to turn the wheel clockwise. The tip of a tooth lands on the curved face of a pallet and rests there. The wheel cannot move.",
      "Each resting face is part of a circle drawn round the pin at the top. On the left pallet it is the outer face, and on the right pallet it is the inner face. So as the frame rocks, the face slides past the tooth without pushing it back or letting it creep forward. The wheel stays dead still. When the end of the face slides clear, the tooth runs along the short sloping end and pushes the pallet aside. That push keeps the pendulum swinging. Then a tooth on the other side lands on the other pallet.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing and description. The back plate, the base, the bob and the sizes were made up. The teeth are wedges with a narrow flat tip, where Brown drew square pegs, and the pallets are slimmer, so that a pallet has room to drop in between two teeth. Brown draws the pendulum twice, hanging straight and swung to one side. Here it is one pendulum that swings. It hangs in front so that it can be seen. The weight that turns the wheel is left out and its pull is taken to be steady. The teeth slide on the pallets without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, pitch: 2 * Math.PI / N, lens: [270, 310, 350], dir: -1, dead: .2 * RAD },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("anchor"), mp = c.mat("pend"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      // wheel z -3..3 with four spokes; one red tooth z -3.6..3.6, proud of both faces
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 6, z0: -3, material: mw, windows: { count: 4, rIn: 20, rOut: 74, spoke: 10 }, start: 40 * RAD }));
      o.wheel.add(P.outlinePlate({ points: grow(tooth(0, RR + 1)), depth: 7.2, z0: -3.6, material: c.mat("wheel", "mark") }));
      P.at(P.cylZ(9, 2, c.mat("wheel", "dark")), 0, 0, 4, o.wheel);                   // hub cap z 3..5, on the face
      P.at(P.cylZ(4, 27, c.fixed), 0, 0, -16.5, scene);                               // pin z -30..-3, plate face to the back of the wheel
      // pallet frame z -3..3; the pallets z -3.6..3.6 are set into the ends of its arms, proud of both faces
      o.anchor = new T.Group(); o.anchor.position.set(0, AY, 0); scene.add(o.anchor);
      function local(p) { return p.map(function (q) { return [q[0], q[1] - AY]; }); }
      o.anchor.add(P.outlinePlate({ points: local(frameOutline()), depth: 6, z0: -3, material: ma }));
      o.anchor.add(P.outlinePlate({ points: local(palletOutline(1)), depth: 7.2, z0: -3.6, material: ma }));
      o.anchor.add(P.outlinePlate({ points: local(palletOutline(-1)), depth: 7.2, z0: -3.6, material: ma }));
      P.at(P.cylZ(5, 27, c.fixed), 0, AY, -16.5, scene);                              // pin z -30..-3, plate face to the back of the boss
      // pendulum in front: boss z 3..13 on the frame, rod z 7..11, bob z 5..13 (the hub cap ends at z 5 and the bob hangs below the wheel)
      P.at(P.cylZ(10, 10, mp), 0, 0, 8, o.anchor);
      o.rod = P.at(P.box(5, 1, 4, mp), 0, 0, 9, o.anchor);                            // length set each frame
      o.bob = P.at(P.cylZ(18, 8, mp), 0, 0, 9, o.anchor);
      // back plate and base
      P.at(P.box(290, 420, 6, c.fixed), 0, -22, -33, scene);                          // plate x -145..145, y -232..188, z -36..-30
      P.at(P.box(310, 12, 100, c.fixed), 0, -238, -10, scene);                        // base y -244..-232, z -60..40; the plate stands on it
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
    }
  });
})();
