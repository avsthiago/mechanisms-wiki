(function () {
  // Flat layout in model units, wheel centre at the origin, y up, measured from Brown's drawing. The wheel turns
  // clockwise, half a tooth (6 degrees) for each beat. Angle 0 of the wheel is where a tooth rests against the hook of
  // the right-hand pallet. s = 1 means the right-hand pallet, s = -1 the left-hand one.
  var RAD = Math.PI / 180, N = 30, PITCH = 2 * Math.PI / N, R = 100, RR = 90, RUN = 5.5 * RAD;              // wheel; a tooth slides RUN along the slope before the hook
  var CX = 9.5, CY = 161, PY = 176, TX = 22, TY = -114, HW = 4, BR = 3.5, BOB = 175, LIFT = 2 * RAD, DU = .014;   // pallet pins; pendulum pin; tail pins; the wheel lifts a pallet LIFT; unlocking takes DU more
  var IW = 3, TAU = 900, CW = 600, IPAL = 5, WT = 485, IP = 3000, CP = 480, H = .00025, START = .062;
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function rot(p, c, a) { var x = p[0] - c[0], y = p[1] - c[1], k = Math.cos(a), n = Math.sin(a); return [c[0] + k * x - n * y, c[1] + n * x + k * y]; }
  function ring(c, r, n) { var p = []; for (var i = 0; i < n; i++) p.push([c[0] + r * Math.cos(i * 2 * Math.PI / n), c[1] + r * Math.sin(i * 2 * Math.PI / n)]); return p; }
  function pivot(s) { return [s * CX, CY]; }
  function hookAt(s) { return (s > 0 ? 35 : 137) * RAD; }
  // A tooth is a solid wedge with a small flat tip. Its front is upright just under the tip, where it meets a hook,
  // and its back falls away quickly enough for a hook to drop in behind it.
  function grow(p) { var x = 0, y = 0; p.forEach(function (q) { x += q[0] / p.length; y += q[1] / p.length; }); return p.map(function (q) { return [x + (q[0] - x) * 1.25, y + (q[1] - y) * 1.25]; }); }   // a little bigger all round, so the red mark stands clear of the tooth sides
  function tooth(k) { var a = hookAt(1) + k * PITCH; return [pol(RR, a - 4.6 * RAD), pol(R - 2.7, a), pol(R, a), pol(R, a + 1 * RAD), pol(RR, a + 4.5 * RAD)]; }
  // The working block under a pallet arm, drawn first with the pallet lifted by the wheel: a slope the tooth tip has
  // slid along, ending at the tip (S), then a short hook face that lies along the path the block swings on, so a tooth
  // pressing on it neither helps nor hinders the pallet. With the pallet at rest the slope starts just outside the tip
  // circle, so a tooth runs in under it.
  function block(s) {
    var A = hookAt(s), S = pol(R, A), c = pivot(s), d = Math.hypot(S[0] - c[0], S[1] - c[1]), m = [-s * (S[1] - c[1]) / d, s * (S[0] - c[0]) / d], v = [Math.sin(A), -Math.cos(A)];
    var E0 = rot(pol(R + .8, A + RUN + 1 * RAD), c, s * LIFT), h = DU * d, E2 = [S[0] - h * m[0], S[1] - h * m[1]], E3 = [E2[0] + 5.5 * v[0], E2[1] + 5.5 * v[1]];
    return [E0, S, E2, E3, [E3[0] + 15 * m[0], E3[1] + 15 * m[1]], [E0[0] + 11 * m[0], E0[1] + 11 * m[1]]].map(function (p) { return rot(p, c, -s * LIFT); });
  }
  function tailPin(s) { return [s * TX, TY]; }
  function armDir(s) { var q = block(s), x = (q[1][0] + q[4][0]) / 2 - s * CX, y = (q[1][1] + q[4][1]) / 2 - CY, l = Math.hypot(x, y); return [x / l, y / l]; }   // the arm runs from its pin out over the block
  function along(s, l, off) { var d = armDir(s); return [s * CX + l * d[0] + off * s * -d[1], CY + l * d[1] + off * s * d[0]]; }                                    // a point l along the arm and off to its outer side
  // Bodies: 0 the wheel, 1 and 2 the pallets (block layer 0, tail pin 9), 3 the pendulum with its cross bar (9).
  function makeSim(P) {
    var wp = [], k;
    for (k = 0; k < N; k++) wp.push(tooth(k));
    function pal(s) { return { pivot: pivot(s), I: IPAL, weight: WT, lift: LIFT, polys: [block(s), ring(tailPin(s), BR, 12)], layers: [0, 9] }; }
    var w = TX - BR - .3;
    return P.gravitySim({ wheel: { polys: wp, I: IW, drag: CW }, pallets: [pal(-1), pal(1)],
      pend: { pivot: [0, PY], I: IP, drag: CP, pull: 16 * IP, polys: [[[-w, TY - 7], [w, TY - 7], [w, TY + 7], [-w, TY + 7]]], layers: [9] },
      step: -PITCH / 2, start: START });
  }

  M507.define({
    number: 309,
    title: "Mudge's gravity escapement",
    lede: "A weight tries to turn the toothed wheel. Two weighted arms, called pallets, take turns to stop it. The wheel lifts each arm a little, and the arm then pushes the pendulum with its own weight as it falls back. The wheel never touches the pendulum, so every push is the same.",
    alt: "A wheel with thirty pointed teeth. Above it two arms slope down to left and right from two pins set side by side, like a roof over the wheel. Each arm carries a ball weight on a short stalk and has a small notched block underneath that rests on the teeth. From each pin a long thin tail hangs down across the wheel to a pin near the bottom. A pendulum hangs down the middle, with a short bar across it between the two tail pins.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "A weight, not shown, keeps trying to turn it clockwise. Its teeth lift the pallets and are then stopped by them. Watch the red tooth." },
      { key: "pallets", color: "#C8873A", name: "Pallets", note: "Two arms, each turning on its own pin. Under each arm is a slope that ends in a hook. A long tail hangs down from each to a pin beside the pendulum." },
      { key: "weights", color: "#8E7AA8", name: "Weights", note: "A ball on each pallet arm. Its weight pulls the arm down towards the wheel, and that is what pushes the pendulum." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Swings between the two tail pins. It lifts each pallet off its tooth, and is pushed back by the pallet's weight." }
    ],
    controls: [{ type: "range", id: "drive", label: "Pull of the weight on the wheel", min: .5, max: 2, step: .1, value: 1, unit: "",
      presets: [[.5, "Weak"], [1, "Medium"], [2, "Strong"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }, { id: "jump", label: "Step time" }],
    views: { "3d": [230, 20, 730], front: [0, -12, 770], side: [770, -12, 0] },
    target: [0, -12, 0],
    how: [
      "Each pallet is an arm with a ball weight, turning on its own pin at the top. Under the arm is a sloping face that ends in a small hook. A tooth of the wheel slides along the slope and lifts the arm. Then the tooth runs into the hook, and the wheel stops.",
      "A long tail hangs from each pallet down to a pin beside the pendulum. The pendulum swings out, meets the pin and lifts the arm a little more. The hook comes clear of the tooth. The wheel jumps on and lifts the other arm. Then the pendulum swings back and the first arm falls with it. No tooth holds it up now, so it falls further than it was carried. That extra fall is the push that keeps the pendulum swinging.",
      "The push comes from the weight of the pallet, not from the wheel. Try Weak, then Strong. The wheel jumps faster, but the pendulum swings just as far as before. A clock like this keeps good time even when the pull on its wheel changes."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown does not draw the pendulum, so the rod, the bar across it that meets the two tail pins, and the bob were made up. The tails hang closer together than drawn. The exact shape of the slopes and hooks, the back plate, the rest pins, the base and all the sizes were made up. The weight that turns the wheel is left out. Nothing rubs in this model. Only the air slows the pendulum and the wheel.",

    makeSim: makeSim, K: { H: H, TAU: TAU, step: -PITCH / 2, DU: DU },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mp = c.mat("pallets"), my = c.mat("pend"), mw = c.mat("wheel"), i, s, pts = [];
      var o = this.o = { sim: makeSim(P), pal: [] };
      for (i = 0; i < 20000; i++) o.sim.run(H, TAU);                                 // run 5 seconds so it opens in its steady swing
      // wheel z -3..3 with four spokes; the red tooth is half a unit proud each side
      o.wheel = new T.Group(); scene.add(o.wheel);
      for (i = 0; i < N; i++) pts = pts.concat(tooth(i));
      o.wheel.add(P.outlinePlate({ points: pts, depth: 6, z0: -3, material: mw, windows: { count: 4, rIn: 16, rOut: 78, spoke: 8 }, start: 40 * RAD }));
      o.wheel.add(P.outlinePlate({ points: grow(tooth(0)), depth: 7, z0: -3.5, material: c.mat("wheel", "mark") }));
      P.at(P.cylZ(11, 7, c.mat("wheel", "dark")), 0, 0, 0, o.wheel);                 // hub z -3.5..3.5
      P.at(P.cylZ(4, 26.5, mw), 0, 0, -16.75, o.wheel);                              // shaft z -30..-3.5, from the face of the back plate to the back of the hub
      // pallets: arm and block z -3..3 in the plane of the wheel, tail z 5..9 in front of the wheel, tail pin z 9..20
      for (s = -1; s <= 1; s += 2) {
        var g = new T.Group(), pv = pivot(s), tp = tailPin(s), w = along(s, 78, 30);
        g.position.set(pv[0], pv[1], 0); scene.add(g); o.pal.push(g);
        var loc = function (q) { return q.map(function (v) { return [v[0] - pv[0], v[1] - pv[1]]; }); };
        var plate = function (q, z0, d, m) { g.add(P.outlinePlate({ points: loc(q), depth: d, z0: z0, material: m })); };
        plate(P.strokeOutline([pv, along(s, 128, 0)], 9), -2.5, 5, mp);                // arm, 4.5 each side of its middle line
        plate(block(s), -2.7, 5.4, mp);
        plate(P.strokeOutline([pv, tp], 6), 5, 4, mp);                               // tail
        P.at(P.cylZ(7.5, 13, mp), 0, 0, 3, g);                                       // boss z -3.5..9.5, joining arm and tail
        P.at(P.cylZ(BR, 11, mp), tp[0] - pv[0], tp[1] - pv[1], 14.5, g);             // tail pin z 9..20, reaching forward past the bar on the pendulum
        plate(P.strokeOutline([along(s, 78, 4), along(s, 78, 18)], 5), -2.3, 4.6, c.mat("weights", "dark"));   // stalk from the arm to the ball
        P.at(P.sphere(15, c.mat("weights")), w[0] - pv[0], w[1] - pv[1], 0, g);      // ball weight
        P.at(P.cylZ(3.5, 26.5, c.fixed), pv[0], pv[1], -16.75, scene);               // pin z -30..-3.5, back plate to the back of the boss
        var q = along(s, 42, -7.5);
        P.at(P.cylZ(3, 33, c.fixed), q[0], q[1], -13.5, scene);                      // rest pin z -30..3, touching the underside of the arm, outside the wheel
      }
      // pendulum in front: rod and cross bar z 14..18, hanging from the cheek of the bracket
      o.pend = new T.Group(); o.pend.position.set(0, PY, 0); scene.add(o.pend);
      P.at(P.box(2 * HW, PY + BOB + 3.5, 4, my), 0, (3.5 - PY - BOB) / 2, 16, o.pend);   // rod from 3.5 above its pin down to the middle of the bob
      P.at(P.box(2 * (TX - BR - .3), 14, 5, my), 0, TY - PY, 16, o.pend);            // cross bar z 13.5..18.5, between the two tail pins
      P.at(P.cylZ(6, 4.5, my), 0, 0, 16.25, o.pend);                                 // boss z 14..18.5
      P.at(P.cylZ(24, 8, my), 0, -PY - BOB, 16, o.pend);                             // bob z 12..20, lowest point y -199
      // back plate, bracket and base
      P.at(P.box(60, 409, 6, c.fixed), 0, -12.5, -33, scene);                        // plate y -217..192, z -36..-30
      P.at(P.box(32, 12, 60, c.fixed), 0, 186, 0, scene);                            // bracket y 180..192, z -30..30, from the face of the plate
      P.at(P.box(16, 14, 4, c.fixed), 0, 173, 12, scene);                            // cheek y 166..180, z 10..14; the pendulum hangs on its front face
      P.at(P.box(260, 12, 110, c.fixed), 0, -223, -5, scene);                        // base y -229..-217, z -60..50; the plate stands on it
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
