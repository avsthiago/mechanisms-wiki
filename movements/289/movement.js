(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // anticlockwise. The anchor hangs from a pin high above the wheel and its arms reach down round both sides.
  var RAD = Math.PI / 180, N = 30, R = 100, RR = 62, AY = 210, PK = 15 * RAD;        // PK: where the right-hand pallet meets the tips
  var TP = 7, MU = .5 * RAD, NU = 1.5 * RAD, EXT = 6 * RAD;                          // pallet thickness; the slope is crossed between -MU and +NU of swing
  var IW = 1, TAU = 600, CW = 30, IP = 22000, CP = 3520, L0 = 370, MP = IP / (L0 * L0), G = 16 * L0, H = .00025, START = .045;
  var QK = [R * Math.cos(PK), R * Math.sin(PK)], RHO = Math.hypot(QK[0], QK[1] - AY);   // both resting faces lie on one circle about the pin
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function pin(r, a) { return [r * Math.cos(a), AY + r * Math.sin(a)]; }
  function psi(q) { return Math.atan2(q[1] - AY, q[0]); }
  function cross(a0, rad) {                        // point on the tip circle, just past angle a0, that is rad from the pin
    var lo = a0, hi = a0 + .3, f = function (a) { return Math.hypot(R * Math.cos(a), R * Math.sin(a) - AY) - rad; }, s = f(lo) > 0;
    for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if ((f(m) > 0) === s) lo = m; else hi = m; }
    return pol(R, lo);
  }
  // Teeth lean forward: the front flank is undercut so that only the tip meets a pallet.
  function tooth(k, rr) { var a = PK + k * 2 * Math.PI / N; return [pol(rr, a - 16.5 * RAD), pol(74, a - 8.6 * RAD), pol(R, a), pol(rr, a - 10.5 * RAD)]; }
  function wheelOutline() { var p = []; for (var k = 0; k < N; k++) p = p.concat(tooth(k, RR)); return p; }
  // A pallet is a short curved block whose two long faces are circles about the pin, so a tooth resting on one is
  // neither pushed back nor let forward as the block slides. Its end is cut on a slope: the tooth runs down the slope
  // and pushes the block aside. s = 1: right-hand pallet, the tooth rests on its lower face. s = -1: left-hand pallet,
  // the tooth rests on its upper face.
  function palletOutline(s) {
    var a0 = s > 0 ? psi(QK) : psi([-QK[0], QK[1]]), r2 = RHO - s * TP, a2 = psi(cross(s > 0 ? PK : Math.PI - PK, r2)), p = [], i, n = 12;
    var c1 = a0 + s * MU, c2 = a2 - s * NU, far = a0 + s * EXT;                       // corner of the resting face, far corner of the slope, outer end
    for (i = 0; i <= n; i++) p.push(pin(RHO, c1 + (far - c1) * i / n));
    for (i = n; i >= 0; i--) p.push(pin(r2, c2 + (far - c2) * i / n));
    return p;
  }
  function frameOutline() {                        // the two arms as one arc round the wheel, a stem up to the pin and a boss on it
    var p = [], i, e = Math.asin(8 / 126), b = Math.asin(8 / 13);
    for (i = 0; i <= 20; i++) p.push(pol(126, 6 * RAD + (Math.PI / 2 - e - 6 * RAD) * i / 20));
    for (i = 0; i <= 12; i++) p.push(pin(13, -Math.PI / 2 + b + (2 * Math.PI - 2 * b) * i / 12));
    for (i = 0; i <= 20; i++) p.push(pol(126, Math.PI / 2 + e + (Math.PI / 2 - e - 6 * RAD) * i / 20));
    for (i = 0; i <= 40; i++) p.push(pol(112, 174 * RAD - 168 * RAD * i / 40));
    return p;
  }
  // Bodies: 0 escape wheel (one outline per tooth), 1 the two pallets with the pendulum.
  function makeSim(P) {
    var polys = [], k;
    for (k = 0; k < N; k++) polys.push(tooth(k, RR - 3));
    var s = P.pivotSim({ bodies: [{ pivot: [0, 0], I: IW, polys: polys, drag: CW }, { pivot: [0, AY], I: IP, polys: [palletOutline(1), palletOutline(-1)], drag: CP, a: START }], pairs: [[0, 1]] });
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
    number: 289,
    title: "Dead-beat escapement",
    lede: "A weight tries to spin the toothed wheel of a clock. A rocking anchor lets one tooth pass for each swing of the pendulum. Between steps the wheel stands perfectly still and is never pushed back, so this is called a dead-beat escapement. It keeps better time than the older kind.",
    alt: "A wheel with many slanting pointed teeth. A curved arm arches over the top of the wheel and down both sides, and hangs by a straight stem from a pin high above. Each end of the arm carries a small curved block that reaches in between the teeth. A pendulum hangs from the same pin.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "A weight, not shown, keeps trying to turn it anticlockwise. Watch the red tooth. It steps forward and then stands dead still." },
      { key: "anchor", color: "#C8873A", name: "Anchor", note: "Hangs from the pin at the top and rocks with the pendulum. The small block on each end is a pallet. The two pallets take turns to catch a tooth." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Fixed to the anchor and swings with it. Its length sets how quickly the anchor rocks." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 330, max: 410, step: 20, value: L0, unit: "",
      presets: [[330, "Short"], [370, "Medium"], [410, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [211, 85, 602], front: [0, 60, 640], side: [640, 60, 0] },
    target: [0, 60, 0],
    how: [
      "The weight tries to turn the wheel anticlockwise. The tip of a tooth lands on the long curved face of a pallet and rests there. The wheel cannot move.",
      "That curved face is part of a circle drawn round the pin at the top. So as the anchor rocks, the face slides along under the tooth without pushing it back or letting it creep forward. The wheel stays dead still. When the end of the face slides out from under the tooth, the tooth runs along the short sloping end and pushes the pallet aside. That push keeps the pendulum swinging. Then a tooth on the other side lands on the other pallet.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The pendulum, the back plate and the sizes were made up. The pallets sit a little higher on the wheel than Brown drew them, so that the teeth meet them more squarely, and the teeth are thinner and lean further forward so that the pallets have room. The pendulum hangs in front so that it can be seen. The weight that turns the wheel is left out and its pull is taken to be steady. The teeth slide on the pallets without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, pitch: 2 * Math.PI / N, lens: [330, 370, 410], dir: 1 },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("anchor"), mp = c.mat("pend"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      // wheel z -3..3 with four spokes; one red tooth z -3.6..3.6, proud of both faces
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 6, z0: -3, material: mw, windows: { count: 4, rIn: 15, rOut: 50, spoke: 12 }, start: 45 * RAD }));
      o.wheel.add(P.outlinePlate({ points: tooth(0, RR + 1).map(function (q) { return [q[0] * 1.012, q[1] * 1.012]; }), depth: 7.2, z0: -3.6, material: c.mat("wheel", "mark") }));
      P.at(P.cylZ(9, 2, c.mat("wheel", "dark")), 0, 0, 4, o.wheel);                   // hub cap z 3..5, on the face
      P.at(P.cylZ(4, 27, c.fixed), 0, 0, -16.5, scene);                               // pin z -30..-3, plate face to the back of the wheel
      // anchor frame z -3..3; the pallets z -3.6..3.6 are set into its ends, proud of both faces
      o.anchor = new T.Group(); o.anchor.position.set(0, AY, 0); scene.add(o.anchor);
      function local(p) { return p.map(function (q) { return [q[0], q[1] - AY]; }); }
      o.anchor.add(P.outlinePlate({ points: local(frameOutline()), depth: 6, z0: -3, material: ma }));
      o.anchor.add(P.outlinePlate({ points: local(palletOutline(1)), depth: 7.2, z0: -3.6, material: ma }));
      o.anchor.add(P.outlinePlate({ points: local(palletOutline(-1)), depth: 7.2, z0: -3.6, material: ma }));
      P.at(P.cylZ(5, 27, c.fixed), 0, AY, -16.5, scene);                              // pin z -30..-3, plate face to the back of the boss
      // pendulum in front: boss z 3..13 on the anchor, rod z 7..11, bob z 5..13 (the hub cap ends at z 5 and the bob hangs below the wheel)
      P.at(P.cylZ(10, 10, mp), 0, 0, 8, o.anchor);
      o.rod = P.at(P.box(5, 1, 4, mp), 0, 0, 9, o.anchor);                            // length set each frame
      o.bob = P.at(P.cylZ(22, 8, mp), 0, 0, 9, o.anchor);
      // back plate and base
      P.at(P.box(290, 480, 6, c.fixed), 0, 0, -33, scene);                            // plate x -145..145, y -240..240, z -36..-30
      P.at(P.box(310, 12, 100, c.fixed), 0, -246, -10, scene);                        // base y -252..-240, z -60..40; the plate stands on it
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
