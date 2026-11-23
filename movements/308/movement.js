(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // clockwise. The pendulum hangs from a pin at (0, L) straight above the wheel; points on it are given as (distance
  // from the pin, angle from straight down). The locking lever rocks on a fixed pin up and to the right of the wheel.
  // One arm reaches left to the top of the wheel and ends in the stop. Its long tail hangs down past the wheel to the click.
  var RAD = Math.PI / 180, N = 5, R = 50, L = 215, PITCH = 2 * Math.PI / N;
  var AV = [45, 48.5], RSTOP = Math.hypot(AV[0], AV[1] - R), FT = Math.atan2(R - AV[1], -AV[0]), LOCK = 5, DRAW = .12;   // lever pin; the stop's face is a circle about the pin through the tip of the top tooth; it reaches 5 below the tip
  var U = [-.37 / Math.hypot(.37, .93), -.93 / Math.hypot(.37, .93)], NV = [-U[1], U[0]], LT = 145, E0 = [AV[0] + LT * U[0], AV[1] + LT * U[1]];   // direction, side and end of the tail
  var TPI = 20 * RAD, RI = L + R * Math.cos(TPI), XI = 2;                            // a tooth clears the pallet 20 degrees past the bottom; top of the pallet (a circle about the pendulum's pin); its pushing face
  var CP = [2.8, -94.1], CPR = Math.hypot(CP[0], L - CP[1]), CPT = Math.atan2(CP[0], L - CP[1]), C140 = Math.cos(140 * RAD), S140 = Math.sin(140 * RAD);   // click pin on the pendulum
  var IW = .5, TAU = 600, CW = 30, MP = .16, L0 = 375, G = 16 * L0, CPD = 1900, IL = .01, TDL = 3, IC = .0005, TC = .5, H = .00025, START = .1;
  function pp(r, t) { return [r * Math.sin(t), L - r * Math.cos(t)]; }
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function tooth(k) {                              // a curved blade: it leaves the hub pointing well behind its tip and bends forward
    var a = Math.PI / 2 - k * PITCH, rs = [9, 20, 30, 38, 44, 48], f = [], g = [];
    rs.forEach(function (r) { var c = a + 50 * RAD * Math.pow(1 - r / R, 1.6), w = (1.2 + 5 * (1 - r / R)) / r; f.push(pol(r, c + w)); g.unshift(pol(r, c - w)); });
    return f.concat([pol(R, a + 2 * RAD), pol(R, a)], g);   // a small flat tip
  }
  function stopOutline(c) {                        // about the lever pin at c; the tooth presses on the far side from the pin
    var p = [], i, n = 8, f0 = FT + LOCK / RSTOP, f1 = FT - 13 / RSTOP;             // the face leans a little (DRAW), so the tooth holds the stop down
    for (i = 0; i <= n; i++) { var f = f0 + (f1 - f0) * i / n, r = RSTOP * (1 + DRAW * (f - FT)); p.push([c[0] + r * Math.cos(f), c[1] + r * Math.sin(f)]); }
    for (i = n; i >= 0; i -= 4) { var e = f0 + (f1 - f0) * i / n; p.push([c[0] + (RSTOP - 7) * Math.cos(e), c[1] + (RSTOP - 7) * Math.sin(e)]); }
    return p;
  }
  function tailEnd(c) {                            // the last part of the tail, about the lever pin at c
    var e = [c[0] + LT * U[0], c[1] + LT * U[1]], b = [e[0] - 16 * U[0], e[1] - 16 * U[1]];
    return [[e[0] + 2.5 * NV[0], e[1] + 2.5 * NV[1]], [b[0] + 2.5 * NV[0], b[1] + 2.5 * NV[1]], [b[0] - 2.5 * NV[0], b[1] - 2.5 * NV[1]], [e[0] - 2.5 * NV[0], e[1] - 2.5 * NV[1]]];
  }
  function palletOutline() {                       // on the pendulum hanging straight
    var p = [], i, n = 4, t0 = XI / RI, t1 = (XI - 24) / RI;
    for (i = 0; i <= n; i++) p.push(pp(RI, t0 + (t1 - t0) * i / n));
    for (i = n; i >= 0; i--) p.push(pp(RI + 13, t0 + (t1 - t0) * i / n));
    return p;
  }
  function r140(x, y) { return [x * C140 - y * S140, x * S140 + y * C140]; }
  function clickArm(c) { return [r140(0, -3), r140(17, -1.8), r140(17, 1.8), r140(0, 3)].map(function (q) { return [c[0] + q[0], c[1] + q[1]]; }); }   // the finger that meets the tail
  function clickOutline() { return [r140(0, -3), r140(17, -1.8), r140(17, 1.8), r140(0, 3), [14, -2.5], [14, 2.5]]; }                              // finger and tail piece, about its pin
  // Bodies: 0 escape wheel (one outline per tooth), 1 pendulum with its pallet, 2 locking lever (stop and tail), 3 click.
  // The tail and the click lie in front of the wheel and the pallet and meet only each other.
  // The click rides on the pendulum: before every step its pin is moved to where the pendulum has carried it, it is
  // turned by as much as the pendulum turned, and its stop is set against the pendulum. While the click is hard on
  // its stop and pushing the tail, the work of lifting the lever and freeing the tooth is taken from the pendulum.
  function makeSim(P) {
    var cp0 = pp(CPR, CPT + START), ca = Math.cos(START), sa = Math.sin(START);
    var arm = clickArm([0, 0]).map(function (q) { return [cp0[0] + ca * q[0] - sa * q[1], cp0[1] + sa * q[0] + ca * q[1]]; });
    var teeth = [], k; for (k = 0; k < N; k++) teeth.push(tooth(k));
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: teeth, drag: CW, a: 2 * RAD },
        { pivot: [0, L], I: MP * L0 * L0, polys: [palletOutline()], drag: CPD, a: START },
        { pivot: AV, I: IL, polys: [stopOutline(AV), tailEnd(AV)], layers: [0, 1], max: 0, drag: .2 },
        { pivot: cp0, I: IC, polys: [arm], layers: [1], drag: .01, min: 0, max: 1.2 }
      ],
      pairs: [[0, 1], [0, 2], [2, 3]]
    });
    s.t = 0; s.amp = START; s.beats = []; s.pa = START; s.react = 0;
    s.run = function (h, len) {
      var b = s.bodies, p = b[1], lv = b[2], ck = b[3], a0 = p.a, w0 = p.w, l0 = lv.a, wa = b[0].a;
      ck.a += p.a - s.pa; s.pa = p.a;                                                                   // carried round with the pendulum
      var q = pp(CPR, CPT + p.a); ck.pivot[0] = q[0]; ck.pivot[1] = q[1];
      ck.min = p.a - START; ck.max = ck.min + 1.2; if (ck.a < ck.min) ck.a = ck.min;
      s.setI(1, MP * len * len);
      b[0].tq = -TAU; p.tq = -MP * G * len * Math.sin(p.a) + s.react;                 // the weight turns the wheel; the weight of the bob pulls the pendulum back to the middle
      lv.tq = TDL; ck.tq = -TC;                                                       // the lever's own weight drops its stop into the wheel; the click's weight sets it back on its pin
      s.step(h); s.t += h;
      var dp = p.a - a0, work = TDL * Math.max(0, l0 - lv.a) + (s.touch[1] ? TAU * Math.max(0, b[0].a - wa) : 0);   // lifting the lever, and pushing the wheel back a little as the stop slides off
      s.react = s.touch[2] && ck.a <= ck.min + 1e-7 && dp < -1e-12 ? Math.min(3000, work / -dp) : 0;
      if (w0 * p.w < 0) s.amp = Math.abs(p.a);
      if (a0 * p.a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }

  M507.define({
    number: 308,
    title: "Detached pendulum escapement",
    lede: "Here the pendulum swings almost free. A lever holds the escape wheel still. Once in every swing to the left, a small finger on the pendulum, called a pawl, trips the lever, and one tooth gives the pendulum a single push.",
    alt: "A small wheel with five curved teeth, held on a fixed bracket. A wide pendulum frame hangs round it, with a flat bar across below the wheel. On the bar are a small block, just under the wheel, and a little hinged finger lower down. A long lever hangs from a pin above and to the right of the wheel. Its short arm reaches the top of the wheel and its long tail reaches down to the finger.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "A weight, not shown, keeps trying to turn it clockwise. Its teeth are curved blades. Watch the red tooth move on one place for every two beats." },
      { key: "lever", color: "#C8873A", name: "Locking lever", note: "It rocks on a fixed pin. The stop on its short arm drops in front of a tooth at the top of the wheel and holds it. Its long tail hangs down to the pawl." },
      { key: "pallet", color: "#C2503F", name: "Pallet", note: "A block on the pendulum, just under the wheel. It is the only part the wheel ever pushes. Watch a tooth hit its right end." },
      { key: "click", color: "#4FA58A", name: "Pawl", note: "A small finger hinged on the pendulum. Going left it is stiff and pushes the tail of the lever. Going right it tips over and slips under the tail." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "A wide frame that hangs from a pin and carries the pallet and the pawl, with a heavy bob below. Its length sets how quickly it swings." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 340, max: 410, step: 35, value: L0, unit: "",
      presets: [[340, "Short"], [375, "Medium"], [410, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [300, 62, 810], front: [0, 5, 700], side: [700, 5, 0] },
    target: [0, 5, 0],
    how: [
      "The wheel tries to turn clockwise, but the stop on the lever sits in front of the top tooth and holds it. The pendulum swings to and fro below, and for most of the time it touches nothing.",
      "As the pendulum swings to the left, the pawl meets the tail of the lever and pushes it aside. That lifts the stop and the wheel is free. A tooth at the bottom of the wheel runs into the right end of the pallet and pushes the pendulum to the left, the way it is already going. Then the pawl slips out from under the tail, the lever drops back, and the stop catches the next tooth.",
      "On the swing back to the right the pawl only tips over and passes under the tail. Nothing is let go, so the pendulum gets one push for every two beats. Its length sets the pace. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing and description. The top of the pendulum, the bob, the back plate, the pin the lever rests on and the sizes were made up. The exact shape of the lever's short arm and stop is a guess, because the drawing is hard to read there. Of the two small pins beside the pawl in the drawing, only the one it rests on is shown. The pawl is taken to be so light that carrying it costs the pendulum nothing. The weight that turns the wheel is left out and its pull is taken to be steady. The parts slide on each other without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, opts: [340, 375, 410], pitch: PITCH, perBeat: .5, maxd: 1.2, back: 1 * RAD },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ml = c.mat("lever"), mp = c.mat("pend"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      // fixed bracket on the face of the back plate, z -30..-24, as Brown draws it: a block above, an arm down to the wheel, a lug for the lever
      scene.add(P.outlinePlate({ points: [[-22, 108], [22, 108], [22, 70], [30, 64], [54, 58], [56, 40], [36, 36], [14, 48], [9, -8], [-9, -8], [-18, 68], [-22, 68]], depth: 6, z0: -30, material: c.fixed }));
      // wheel z 0..5, hub z -1..6; the red tooth z -0.4..5.4 is proud of both faces
      o.wheel = new T.Group(); scene.add(o.wheel);
      for (i = 0; i < N; i++) o.wheel.add(P.outlinePlate({ points: tooth(i), depth: i ? 5 : 5.8, z0: i ? 0 : -.4, material: i ? mw : c.mat("wheel", "mark") }));
      P.at(P.cylZ(9.5, 7, mw), 0, 0, 2.5, o.wheel);                                   // hub z -1..6
      P.at(P.cylZ(4, .8, c.mat("wheel", "dark")), 0, 0, 6.4, o.wheel);                // cap z 6..6.8, behind the lever (z 7..11)
      P.at(P.cylZ(3.5, 23, c.fixed), 0, 0, -12.5, scene);                             // pin z -24..-1, bracket face to the back of the hub
      // locking lever z 7..11 in front of the wheel; its stop z 0..11 reaches back to the teeth
      o.lever = new T.Group(); o.lever.position.set(AV[0], AV[1], 0); scene.add(o.lever);
      o.lever.add(P.outlinePlate({ points: [[4 * NV[0], 4 * NV[1]], [LT * U[0] + 2.5 * NV[0], LT * U[1] + 2.5 * NV[1]], [LT * U[0] - 2.5 * NV[0], LT * U[1] - 2.5 * NV[1]], [-4 * NV[0], -4 * NV[1]]], depth: 4, z0: 7, material: ml }));   // tail
      o.lever.add(P.outlinePlate({ points: [[0, -4], [-46, 5], [-46, 13], [0, 4]], depth: 4, z0: 7, material: ml }));          // short arm, from the pin to the top of the stop
      o.lever.add(P.outlinePlate({ points: stopOutline([0, 0]), depth: 11, z0: 0, material: ml }));                             // stop z 0..11
      P.at(P.cylZ(7, 4, ml), 0, 0, 9, o.lever);                                       // boss z 7..11
      P.at(P.cylZ(3.5, 1.5, c.mat("lever", "dark")), 0, 0, 11.75, o.lever);           // cap z 11..12.5, on the boss
      P.at(P.cylZ(3, 31, c.fixed), AV[0], AV[1], -8.5, scene);                        // pin z -24..7, bracket face to the back of the lever
      P.at(P.cylZ(2, 35, c.fixed), AV[0] - 12.4, AV[1] - 3.7, -6.5, scene);           // pin the short arm rests on: z -24..11, radius 2, just under the arm's lower edge
      // pendulum z -20..-14, in front of the bracket and behind the wheel; positions below are measured from its pin
      o.pend = new T.Group(); o.pend.position.set(0, L, 0); scene.add(o.pend);
      function local(p) { return p.map(function (q) { return [q[0], q[1] - L]; }); }
      [-1, 1].forEach(function (s) { P.at(P.box(30, 339, 6, mp), s * 135, 34.5 - L, -17, o.pend); });   // side bars x 120..150, y -135..204
      P.at(P.box(300, 22, 6, mp), 0, 0, -17, o.pend);                                 // top bar x -150..150, y 204..226; the side bars end on its under side
      P.at(P.box(240, 73, 6, mp), 0, -83.5 - L, -17, o.pend);                         // cross bar x -120..120 (between the side bars), y -120..-47
      P.at(P.cylZ(12, 3, mp), 0, 0, -12.5, o.pend);                                   // boss z -14..-11 on the face of the top bar
      P.at(P.cylZ(5, 10, c.fixed), 0, L, -25, scene);                                 // pin z -30..-20, back plate face to the back of the top bar
      o.pend.add(P.outlinePlate({ points: local(palletOutline()), depth: 19, z0: -14, material: c.mat("pallet") }));   // pallet z -14..5: on the face of the cross bar, as far forward as the wheel
      P.at(P.cylZ(2.2, 26, c.mat("pend", "dark")), CP[0], CP[1] - L, -1, o.pend);     // click pin z -14..12, from the face of the cross bar
      P.at(P.cylZ(1.8, 25, c.mat("pend", "dark")), CP[0] + 10, CP[1] - 4.35 - L, -1.5, o.pend);   // pin the click's tail rests on: z -14..11, just under the tail
      o.click = new T.Group(); o.click.position.set(CP[0], CP[1] - L, 0); o.pend.add(o.click);
      o.click.add(P.outlinePlate({ points: clickOutline(), depth: 4, z0: 7, material: c.mat("click") }));   // click z 7..11, level with the lever's tail
      o.rod = P.at(P.box(6, 1, 4, mp), 0, 0, -17, o.pend);                            // rod z -19..-15, from the bottom edge of the cross bar down to the bob; length set each frame
      o.bob = P.at(P.cylZ(20, 8, mp), 0, 0, -17, o.pend);                             // bob z -21..-13
      // back plate and base
      P.at(P.box(400, 470, 6, c.fixed), 0, 5, -33, scene);                            // plate x -200..200, y -230..240, z -36..-30
      P.at(P.box(420, 12, 100, c.fixed), 0, -236, -10, scene);                        // base y -242..-230, z -60..40; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l);
      o.wheel.rotation.z = b[0].a; o.pend.rotation.z = b[1].a; o.lever.rotation.z = b[2].a;
      o.click.rotation.z = b[3].a - (b[1].a - START);                                 // how far the click is tipped on the pendulum
      var top = -120 - L, len = l - (L + 120);                                        // rod from the bottom edge of the cross bar (y -120) to the middle of the bob
      o.rod.scale.y = len; o.rod.position.y = top - len / 2; o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp * 180 / Math.PI).toFixed(1) + "°");
    }
  });
})();
