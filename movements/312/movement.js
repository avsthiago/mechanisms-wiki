(function () {
  // Flat layout in model units, wheel centre at the origin, y up, measured from Brown's drawing. The wheels turn
  // clockwise, half a tooth (20 degrees) for each beat. Angle 0 of the wheels is where a tooth of the big wheel rests
  // on the stop of the right-hand pallet. s = 1 means the right-hand pallet, s = -1 the left-hand one.
  var RAD = Math.PI / 180, N = 9, PITCH = 2 * Math.PI / N, R = 87, RIM = 75, RP = 20, RR = 11, PSI = 9 * RAD;   // big wheel; small wheel; where a tooth is stopped on the right (149 degrees on the left)
  var XF = 15, GAM = 35 * RAD;                                                                              // the lifting slope of a pallet at rest: it crosses the level of the wheel centre XF out, leaning GAM
  var CX = 9, CY = 240, PY = 252, BY = 30, HW = 4, BR = 3.5, BOB = 142, DU = .012;                          // pallet pins; pendulum pin; height of the fork pins; unlocking takes DU more swing
  var IW = 3, TAU = 300, CW = 150, IPAL = 10, WT = 485, IP = 3000, CP = 400, H = .00025, START = .059;
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function rot(p, c, a) { var x = p[0] - c[0], y = p[1] - c[1], k = Math.cos(a), n = Math.sin(a); return [c[0] + k * x - n * y, c[1] + n * x + k * y]; }
  function ring(c, r, n) { var p = []; for (var i = 0; i < n; i++) p.push([c[0] + r * Math.cos(i * 2 * Math.PI / n), c[1] + r * Math.sin(i * 2 * Math.PI / n)]); return p; }
  function pivot(s) { return [s * CX, CY]; }
  // How far a pallet is swung out when a tooth of the small wheel holds it, the wheels being locked: the tooth tip,
  // level with the wheel centre, lies on the lifting slope.
  function lift(s) {
    var lo = 0, hi = .2;
    for (var i = 0; i < 40; i++) {
      var a = (lo + hi) / 2, f = rot([s * XF, 0], pivot(s), s * a), n = rot([-s * Math.cos(GAM), s * Math.sin(GAM)], [0, 0], s * a);
      if ((s * RP - f[0]) * n[0] + (0 - f[1]) * n[1] < 0) lo = a; else hi = a;
    }
    return lo;
  }
  // Nose of a pallet: its sloping face is pushed aside by a tooth of the small wheel, like a wedge. The slope ends just
  // below the tooth's last position, so the tooth holds the pallet there until the pendulum takes it away.
  function nose(s) {
    var t = Math.tan(GAM);
    return [[XF - .4 * t, -.4], [XF + 13, -.4], [XF + 13, 8.6], [XF + 8.6 * t, 8.6]].map(function (p) { return [s * p[0], s * p[1]]; });
  }
  // Stop: a small block whose working face lies along the path it swings on, so a tooth pressing on it neither helps
  // nor hinders the pallet. With the pallet held up, the tooth tip sits DU of swing from the inner end. The inner end
  // is cut back along the way the tooth moves, so the tooth leaves without pushing the block aside.
  function stop(s) {
    var A = s > 0 ? PSI : PSI + 140 * RAD, S = pol(R, A), c = pivot(s), d = Math.hypot(S[0] - c[0], S[1] - c[1]), u = [(S[0] - c[0]) / d, (S[1] - c[1]) / d], t = [-s * u[1], s * u[0]];
    var e = DU * d, f = 12, w = [6 * (Math.sin(A) + .25 * t[0]), 6 * (-Math.cos(A) + .25 * t[1])];
    return [[S[0] - e * t[0], S[1] - e * t[1]], [S[0] + f * t[0], S[1] + f * t[1]], [S[0] + f * t[0] + w[0], S[1] + f * t[1] + w[1]], [S[0] - e * t[0] + w[0], S[1] - e * t[1] + w[1]]]
      .map(function (p) { return rot(p, c, -s * lift(s)); });
  }
  function forkPin(s) { return [s * (HW + BR + .3), s * BY]; }
  function tooth(k) { var a = PSI + k * PITCH; return [pol(R, a), pol(RIM - 1, a + 1 * RAD), pol(RIM - 3, a + 13 * RAD), pol(R - .3, a + 1.3 * RAD)]; }   // big wheel: the tip leads
  function cog(k) { var a = k * PITCH; return [pol(RP, a), pol(RP - .2, a + 5 * RAD), pol(RR, a + 15 * RAD), pol(RR, a - 14 * RAD)]; }                 // small wheel
  function elbow(s) { var q = stop(s); return [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4 + 3 * s, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4]; }
  // The right-hand pallet runs down to its stop and sends a level arm in to the small wheel. The left-hand one runs
  // down to its stop, then hooks round under the wheel centre and comes up to the small wheel from below.
  function bars(s) {
    var e = elbow(s), n = [s * (XF + 11), s * 4], f = forkPin(s);
    if (s > 0) return [[pivot(s), e, [e[0] + 3, e[1] - 12]], [e, n], [[28, 5], f]];
    return [[pivot(s), e, [-86, 2], [-74, -28], [-50, -34], n], [[-32, -14], f]];
  }
  // Bodies: 0 the wheels (small wheel layer 0, big wheel layer 1), 1 and 2 the pallets (nose 0, stop 1, fork pin 9),
  // 3 the pendulum (9).
  function makeSim(P) {
    var wp = [], wl = [], k;
    for (k = 0; k < N; k++) { wp.push(cog(k)); wl.push(0); }
    for (k = 0; k < N; k++) { wp.push(tooth(k)); wl.push(1); }
    function pal(s) { return { pivot: pivot(s), I: IPAL, weight: WT, lift: lift(s), polys: [nose(s), stop(s), ring(forkPin(s), BR, 12)], layers: [0, 1, 9] }; }
    return P.gravitySim({ wheel: { polys: wp, layers: wl, I: IW, drag: CW }, pallets: [pal(-1), pal(1)],
      pend: { pivot: [0, PY], I: IP, drag: CP, pull: 16 * IP, polys: [[[-HW, -BY - 14], [HW, -BY - 14], [HW, BY + 14], [-HW, BY + 14]]], layers: [9] },
      step: -PITCH / 2, start: START });
  }

  M507.define({
    number: 312,
    title: "Bloxam's gravity escapement",
    lede: "A weight tries to turn a big wheel and a small wheel on one shaft. Two hanging arms, called pallets, take turns to stop a tooth of the big wheel. The small wheel lifts each pallet a little, and the pallet then pushes the pendulum with its own weight as it falls back. The wheels never touch the pendulum, so every push is the same.",
    alt: "A big wheel with nine thin spokes, a rim of straight bars and a small pointed tooth at each corner. A small star wheel sits at its centre. Two long arms hang from pins high above the wheel and spread out to either side of it. Each ends in a small dark block beside the rim and sends a branch in to the small wheel: the right-hand one straight across, the left-hand one hooking round underneath. A pendulum rod hangs down the middle between two pins on the branches.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Big wheel", note: "A weight, not shown, keeps trying to turn it clockwise. The stops on the two pallets take turns to catch one of its nine teeth. Watch the red tooth." },
      { key: "lift", color: "#4FA58A", name: "Small wheel", note: "A small star wheel fixed on the same shaft. As it turns, one of its points slides along the sloping nose of a pallet and pushes the pallet outward." },
      { key: "pallets", color: "#C8873A", name: "Pallets", note: "Two arms that hang from pins at the top. Each has a dark stop for the big wheel, a sloping nose for the small wheel and a fork pin that pushes the pendulum." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Swings between the fork pins of the two pallets. It pushes each pallet off its tooth, and is pushed back by the pallet's weight." }
    ],
    controls: [{ type: "range", id: "drive", label: "Pull of the weight on the wheels", min: .5, max: 2, step: .1, value: 1, unit: "",
      presets: [[.5, "Weak"], [1, "Medium"], [2, "Strong"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }, { id: "jump", label: "Step time" }],
    views: { "3d": [250, 60, 800], front: [0, 38, 840], side: [840, 38, 0] },
    target: [0, 38, 0],
    how: [
      "Start with the pallet whose stop has a tooth of the big wheel resting on it. The wheels cannot turn. A point of the small wheel sits under the nose of this pallet and holds it pushed out a little way.",
      "The pendulum swings out and meets the fork pin of that pallet. It carries the pallet further out, and the stop slides off the tooth. The wheels jump on. As they turn, a point of the small wheel slides along the nose of the other pallet and pushes it out, and the next tooth lands on that pallet's stop. Then the pendulum swings back and the first pallet falls with it. The point that held it has moved away, so it falls further than it was carried. That extra fall is the push that keeps the pendulum swinging.",
      "The push comes from the weight of the pallet, not from the wheels. Try Weak, then Strong. The wheels jump faster, but the pendulum swings just as far as before. A clock like this keeps good time even when the pull on its wheels changes."
    ],
    note: "This model is rebuilt from Brown's drawing. The small wheel is larger than Brown shows, so you can see it lift the pallets. The two pallets hang from two pins side by side, where Brown draws one. The shape of the noses and stops, the place of the fork pins, the pendulum, the back plate, the rest pins, the base and all the sizes were made up. The weight that turns the wheels is left out. Nothing rubs in this model. Only the air slows the pendulum and the wheels.",

    makeSim: makeSim, K: { H: H, TAU: TAU, step: -PITCH / 2, lift: lift, DU: DU },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mp = c.mat("pallets"), my = c.mat("pend"), mw = c.mat("wheel"), ml = c.mat("lift"), i, s;
      var o = this.o = { sim: makeSim(P), pal: [] };
      for (i = 0; i < 20000; i++) o.sim.run(H, TAU);                                 // run 5 seconds so it opens in its steady swing
      // big wheel z -9..-5 (teeth half a unit proud each side), small wheel z -3.5..3.5 in the plane of the pallets
      o.wheel = new T.Group(); scene.add(o.wheel);
      for (i = 0; i < N; i++) {
        var a = PSI + i * PITCH;
        o.wheel.add(P.outlinePlate({ points: tooth(i), depth: 5, z0: -9.5, material: i ? mw : c.mat("wheel", "mark") }));
        o.wheel.add(P.outlinePlate({ points: P.strokeOutline([pol(8, a), pol(RIM, a)], 3.5), depth: 4, z0: -9, material: mw }));              // spoke
        o.wheel.add(P.outlinePlate({ points: P.strokeOutline([pol(RIM, a), pol(RIM, a + PITCH)], 4), depth: 4, z0: -9, material: mw }));      // one straight bar of the rim
        o.wheel.add(P.outlinePlate({ points: cog(i), depth: 7, z0: -3.5, material: ml }));
      }
      P.at(P.cylZ(RR + .5, 7, ml), 0, 0, 0, o.wheel);                                // body of the small wheel z -3.5..3.5
      P.at(P.cylZ(4, 1, c.mat("lift", "dark")), RR - 5, 0, 3.6, o.wheel);            // dot z 3.1..4.1 on its face, to show it turning
      P.at(P.cylZ(10, 6.5, mw), 0, 0, -6.75, o.wheel);                               // hub z -10..-3.5, up to the back of the small wheel
      P.at(P.cylZ(4, 20, mw), 0, 0, -20, o.wheel);                                   // shaft z -30..-10, from the face of the back plate to the hub
      // pallets z -3..3; the stops stand back into the big wheel (z -9.5..-3); fork pins z 3..20
      for (s = -1; s <= 1; s += 2) {
        var g = new T.Group(), pv = pivot(s), f = forkPin(s), e = elbow(s);
        g.position.set(pv[0], pv[1], 0); scene.add(g); o.pal.push(g);
        var loc = function (q) { return q.map(function (v) { return [v[0] - pv[0], v[1] - pv[1]]; }); };
        var plate = function (q, z0, d, m) { g.add(P.outlinePlate({ points: loc(q), depth: d, z0: z0, material: m })); };
        bars(s).forEach(function (q, k) { plate(P.strokeOutline(q, k ? 5 : 7), -3, 6, mp); });
        plate(nose(s), -3, 6, mp);
        plate(stop(s), -9.5, 6.5, c.mat("pallets", "dark"));
        P.at(P.cylZ(8, 7, mp), 0, 0, 0, g);                                          // boss z -3.5..3.5
        P.at(P.cylZ(BR, 17, mp), f[0] - pv[0], f[1] - pv[1], 11.5, g);               // fork pin z 3..20, reaching forward past the pendulum rod
        P.at(P.cylZ(3.5, 26.5, c.fixed), pv[0], pv[1], -16.75, scene);               // pin z -30..-3.5, back plate to the back of the boss
        var d = Math.hypot(e[0] - pv[0], e[1] - pv[1]), nx = s * (e[1] - pv[1]) / d, ny = -s * (e[0] - pv[0]) / d;
        P.at(P.cylZ(3, 33, c.fixed), pv[0] + .4 * (e[0] - pv[0]) + 6.5 * nx, pv[1] + .4 * (e[1] - pv[1]) + 6.5 * ny, -13.5, scene);   // rest pin z -30..3, touching the inner edge of the long bar, above the wheel
      }
      // pendulum in front: rod z 14..18, hanging from the cheek of the bracket
      o.pend = new T.Group(); o.pend.position.set(0, PY, 0); scene.add(o.pend);
      P.at(P.box(2 * HW, PY + BOB + 3.5, 4, my), 0, (3.5 - PY - BOB) / 2, 16, o.pend);   // rod from 3.5 above its pin down to the middle of the bob
      P.at(P.cylZ(6, 4.5, my), 0, 0, 16.25, o.pend);                                 // boss z 14..18.5
      P.at(P.cylZ(24, 8, my), 0, -PY - BOB, 16, o.pend);                             // bob z 12..20, lowest point y -166
      // back plate, bracket and base
      P.at(P.box(60, 452, 6, c.fixed), 0, 42, -33, scene);                           // plate y -184..268, z -36..-30
      P.at(P.box(32, 12, 60, c.fixed), 0, 262, 0, scene);                            // bracket y 256..268, z -30..30, from the face of the plate
      P.at(P.box(16, 14, 4, c.fixed), 0, 249, 12, scene);                            // cheek y 242..256, z 10..14; the pendulum hangs on its front face
      P.at(P.box(240, 12, 110, c.fixed), 0, -190, -5, scene);                        // base y -196..-184, z -60..50; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, b = sim.bodies, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0;
      for (var i = 0; i < n; i++) sim.run(H, TAU * S.controls.drive);
      o.wheel.rotation.z = b[0].a; o.pal[0].rotation.z = b[1].a; o.pal[1].rotation.z = b[2].a; o.pend.rotation.z = b[3].a;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp / RAD).toFixed(1) + "°");
      S.set("jump", sim.jump.toFixed(2) + " s");
    }
  });
})();
