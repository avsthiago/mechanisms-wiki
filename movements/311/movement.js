(function () {
  // Flat layout in model units, wheel centre at the origin, y up, measured from Brown's drawing. The wheels turn
  // clockwise, one sixth of a turn for each beat. Angle 0 of the wheels is where a leg of the front wheel rests on the
  // stop of the right-hand pallet. s = 1 means the right-hand pallet, s = -1 the left-hand one.
  var RAD = Math.PI / 180, R = 100, LW = 11, RP = 16, PR = 3, PSI = 30 * RAD, BL = 5 * RAD, BC = 58 * RAD;   // legs; lifting pins; where a leg is stopped; where a pin stops and where it starts to lift
  var CX = 12, CY = 231, PY = 245, BY = -214, HW = 4, BR = 3.5, BOB = 258, DU = .014;                      // pallet pins; pendulum pin; bottom pins; unlocking takes DU more swing
  var IW = 3, TAU = 300, CW = 40, IPAL = 15, WT = 485, IP = 3000, CP = 480, H = .00025, START = .0665;
  var XF = RP * Math.cos(BC) + PR;                                                                        // the lifting face of a pallet at rest
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  function rot(p, c, a) { var x = p[0] - c[0], y = p[1] - c[1], k = Math.cos(a), n = Math.sin(a); return [c[0] + k * x - n * y, c[1] + n * x + k * y]; }
  function ring(c, r, n) { var p = []; for (var i = 0; i < n; i++) p.push([c[0] + r * Math.cos(i * 2 * Math.PI / n), c[1] + r * Math.sin(i * 2 * Math.PI / n)]); return p; }
  function pivot(s) { return [s * CX, CY]; }
  // How far a pallet is swung out when a pin holds it, the wheel being locked: the lifting face just touches the pin.
  function lift(s) {
    var c = pol(RP, s > 0 ? BL : Math.PI + BL), lo = 0, hi = .2;
    for (var i = 0; i < 40; i++) { var a = (lo + hi) / 2, f = rot([s * XF, 0], pivot(s), s * a); if (((c[0] - f[0]) * -s * Math.cos(a) + (c[1] - f[1]) * -Math.sin(a)) < PR) lo = a; else hi = a; }
    return lo;
  }
  function nose(s) { return [[s * XF, -s * 6], [s * (XF + 11), -s * 6], [s * (XF + 11), s * 19], [s * XF, s * 19]]; }
  // Stop: a small block whose working face lies along the path it swings on, so a leg pressing on it neither helps
  // nor hinders the pallet. With the pallet held by its pin, the leg tip sits DU of swing from the inner end. The
  // inner end is cut back along the way the leg tip moves, so the tip leaves without pushing the block aside.
  function stop(s) {
    var A = s > 0 ? PSI : Math.PI - PSI, S = pol(R, A), c = pivot(s), d = Math.hypot(S[0] - c[0], S[1] - c[1]), u = [(S[0] - c[0]) / d, (S[1] - c[1]) / d], t = [-s * u[1], s * u[0]];
    var e = DU * d, f = 14, w = [7 * (Math.sin(A) + .25 * t[0]), 7 * (-Math.cos(A) + .25 * t[1])];
    return [[S[0] - e * t[0], S[1] - e * t[1]], [S[0] + f * t[0], S[1] + f * t[1]], [S[0] + f * t[0] + w[0], S[1] + f * t[1] + w[1]], [S[0] - e * t[0] + w[0], S[1] - e * t[1] + w[1]]]
      .map(function (p) { return rot(p, c, -s * lift(s)); });
  }
  function beatPin(s) { return [s * (HW + BR + .3), BY]; }
  // A leg is a broad bar that ends in a stout spur that points the way the wheels turn, so that only the point of the spur meets a stop.
  var XT = Math.sqrt(R * R - 13.5 * 13.5), DL = Math.atan2(13.5, XT);
  function leg(th) { return [[XT, -13.5], [XT + .6, LW / 2], [6, LW / 2], [6, -LW / 2], [XT - 7.5, -LW / 2]].map(function (p) { return rot(p, [0, 0], th + DL); }); }
  function frontLeg(k) { return leg(PSI + k * 120 * RAD); }
  function backLeg(k) { return leg(PSI + (60 + k * 120) * RAD); }
  function pinAt(k) { return pol(RP, BL + k * 120 * RAD); }
  function elbow(s) { var q = stop(s); return [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4 + 3 * s, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4]; }
  function limb(s, y) { var e = elbow(s), b = beatPin(s); return [e[0] + (b[0] - e[0]) * (e[1] - y) / (e[1] - b[1]), y]; }   // point on the lower limb at height y
  // Bodies: 0 the wheels (pins layer 0, front legs layer 1, back legs layer 2), 1 and 2 the pallets (lifting face 0,
  // stop 2 on the left and 1 on the right, bottom pin 9), 3 the pendulum (9).
  function makeSim(P) {
    var wp = [], wl = [], k;
    for (k = 0; k < 3; k++) { wp.push(ring(pinAt(k), PR, 16)); wl.push(0); }
    for (k = 0; k < 3; k++) { wp.push(frontLeg(k)); wl.push(1); }
    for (k = 0; k < 3; k++) { wp.push(backLeg(k)); wl.push(2); }
    function pal(s) { return { pivot: pivot(s), I: IPAL, weight: WT, lift: lift(s), polys: [nose(s), stop(s), ring(beatPin(s), BR, 12)], layers: [0, s > 0 ? 1 : 2, 9] }; }
    return P.gravitySim({ wheel: { polys: wp, layers: wl, I: IW, drag: CW }, pallets: [pal(-1), pal(1)],
      pend: { pivot: [0, PY], I: IP, drag: CP, pull: 16 * IP, polys: [[[-HW, BY - 14], [HW, BY - 14], [HW, BY + 14], [-HW, BY + 14]]], layers: [9] },
      step: -60 * RAD, start: START });
  }

  M507.define({
    number: 311,
    title: "Double three-legged gravity escapement",
    lede: "A weight tries to turn two three-legged wheels on one shaft. Two hanging frames, called pallets, take turns to stop a leg. The wheels lift each pallet a little, and the pallet then pushes the pendulum with its own weight as it falls back. The wheels never touch the pendulum, so every push is the same.",
    alt: "Two long frames hang side by side from pins at the top and bulge outward like a tall diamond, meeting again at the bottom on either side of a pendulum rod. In the middle of the diamond are two wheels with three thin legs each, one in front of the frames and one behind, and three small pins round their centre. Each frame has a small dark block at its widest point, where a leg rests, and an arm that reaches in to the pins.",
    parts: [
      { key: "front", color: "#5E7387", name: "Front wheel", note: "Three thin legs on the wheel shaft. A weight, not shown, keeps trying to turn it clockwise. Its legs are stopped by the right-hand pallet. Watch the red leg." },
      { key: "back", color: "#8E7AA8", name: "Back wheel", note: "Three more legs on the same shaft, set half way between the front ones. Its legs are stopped by the left-hand pallet. It also carries the lifting pins." },
      { key: "pins", color: "#4FA58A", name: "Lifting pins", note: "Three pins between the two wheels. As the wheels turn, one pin pushes a pallet outward a little and then holds it there." },
      { key: "pallets", color: "#C8873A", name: "Pallets", note: "Two frames that hang from pins at the top, between the two wheels. Each has a dark stop for the legs, an arm for the lifting pins and a pin at the bottom that pushes the pendulum." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Swings between the bottom pins of the two pallets. It pushes each pallet off its leg, and is pushed back by the pallet's weight." },
      { key: "fly", color: "#E8E2D0", name: "Fly", note: "A flat blade on the wheel shaft. It has to beat the air as it turns, so the wheels cannot jump too fast and bang into the stops." }
    ],
    controls: [{ type: "range", id: "drive", label: "Pull of the weight on the wheels", min: .5, max: 2, step: .1, value: 1, unit: "",
      presets: [[.5, "Weak"], [1, "Medium"], [2, "Strong"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }, { id: "jump", label: "Step time" }],
    views: { "3d": [330, 0, 1040], front: [0, -22, 1090], side: [1090, -22, 0] },
    target: [0, -22, 0],
    how: [
      "Start with the pallet whose stop has a leg resting on it. The wheels cannot turn. A green pin near the middle holds this pallet pushed out a little way.",
      "The pendulum swings out and meets the pin at the bottom of that pallet. It carries the pallet further out, and the stop slides off the leg. The wheels jump on. As they turn, another green pin pushes the other pallet out, and a leg of the other wheel lands on its stop. Then the pendulum swings back and the first pallet falls with it. Its lifting pin has moved away, so it falls further than it was carried. That extra fall is the push that keeps the pendulum swinging.",
      "The push comes from the weight of the pallet, not from the wheels. Try Weak, then Strong. The wheels jump faster, but the pendulum swings just as far as before. A clock like this keeps good time even when the pull on its wheels changes."
    ],
    note: "This model is rebuilt from Brown's drawing. The lifting pins are larger and further from the middle than Brown shows, so you can see them work. The pendulum hangs in front, where Brown shows it behind. The fly is shorter than drawn and is fixed to the wheels. The spurs on the ends of the legs, the shape of the arms, the back plate, the rest pins, the bob, the base and all the sizes were made up. The weight that turns the wheels is left out. Nothing rubs in this model. Only the air slows the pendulum and the fly.",

    makeSim: makeSim, K: { H: H, TAU: TAU, step: -60 * RAD, lift: lift, DU: DU },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mp = c.mat("pallets"), my = c.mat("pend"), i, s;
      var o = this.o = { sim: makeSim(P), pal: [] };
      for (i = 0; i < 20000; i++) o.sim.run(H, TAU);                                 // run 5 seconds so it opens in its steady swing
      // wheels: back wheel z -10..-6, front wheel z 6..10, pins between them standing on the back hub
      o.wheel = new T.Group(); scene.add(o.wheel);
      for (i = 0; i < 3; i++) {
        o.wheel.add(P.outlinePlate({ points: frontLeg(i), depth: 4, z0: 6, material: i ? c.mat("front") : c.mat("front", "mark") }));
        o.wheel.add(P.outlinePlate({ points: backLeg(i), depth: 4, z0: -10, material: c.mat("back") }));
        P.at(P.cylZ(PR, 11), 0, 0, 0, o.wheel).material = c.mat("pins");             // pin z -5.5..5.5, from the back hub to the front hub
        o.wheel.children[o.wheel.children.length - 1].position.set(pinAt(i)[0], pinAt(i)[1], 0);
      }
      P.at(P.cylZ(9, 5, c.mat("front")), 0, 0, 8, o.wheel);                          // front hub z 5.5..10.5, half a unit proud of the legs
      P.at(P.cylZ(RP + PR + 1, 5, c.mat("back")), 0, 0, -8, o.wheel);                // back hub z -10.5..-5.5, wide enough to carry the pins
      P.at(P.cylZ(4, 42, c.mat("back")), 0, 0, -9, o.wheel);                         // shaft z -30..12, from the face of the back plate
      P.at(P.box(14, 240, 3, c.mat("fly")), 0, 0, -20, o.wheel);                     // fly z -21.5..-18.5, 120 each way
      P.at(P.cylZ(10, 4, c.mat("fly")), 0, 0, -20, o.wheel);                         // its boss z -22..-18
      // pallets z -3..3, between the wheels; the right stop stands forward into the front wheel (z 3..10.5), the left one back (z -10.5..-3)
      for (s = -1; s <= 1; s += 2) {
        var g = new T.Group(), pv = pivot(s), e = elbow(s), b = beatPin(s);
        g.position.set(pv[0], pv[1], 0); scene.add(g); o.pal.push(g);
        var loc = function (q) { return q.map(function (v) { return [v[0] - pv[0], v[1] - pv[1]]; }); };
        var plate = function (q, z0, d, m) { g.add(P.outlinePlate({ points: loc(q), depth: d, z0: z0, material: m })); };
        plate(P.strokeOutline([pv, e, b], 7), -3, 6, mp);                            // the long bent bar from the top pin round to the bottom pin
        plate(P.strokeOutline([e, [s * 55, s > 0 ? 22 : 16], [s * (XF + 9), s * 7]], 6), -3, 6, mp);   // arm in to the lifting pins
        plate(P.strokeOutline([[s * (XF + 13), s * 5], limb(s, -80)], 5), -3, 6, mp);                   // brace down to the lower limb
        plate(nose(s), -3, 6, mp);
        plate(stop(s), s > 0 ? 3 : -10.5, 7.5, c.mat("pallets", "dark"));
        P.at(P.cylZ(8, 7, mp), 0, 0, 0, g);                                          // boss z -3.5..3.5
        P.at(P.cylZ(BR, 17, mp), b[0] - pv[0], b[1] - pv[1], 11.5, g);               // bottom pin z 3..20, reaching forward past the pendulum rod
        P.at(P.cylZ(3.5, 26.5, c.fixed), pv[0], pv[1], -16.75, scene);               // pin z -30..-3.5, back plate to the back of the boss
        var q = limb(s, -170), d = Math.hypot(e[0] - b[0], e[1] - b[1]), nx = -s * (e[1] - b[1]) / d, ny = s * (e[0] - b[0]) / d;
        P.at(P.cylZ(3, 33, c.fixed), q[0] + 6.5 * nx, q[1] + 6.5 * ny, -13.5, scene);   // rest pin z -30..3, touching the inner edge of the limb
      }
      // pendulum in front: rod z 14..18, hanging from the cheek of the bracket
      o.pend = new T.Group(); o.pend.position.set(0, PY, 0); scene.add(o.pend);
      P.at(P.box(2 * HW, PY + BOB + 3.5, 4, my), 0, (3.5 - PY - BOB) / 2, 16, o.pend);   // rod from 3.5 above its pin down to the middle of the bob
      P.at(P.cylZ(6, 4.5, my), 0, 0, 16.25, o.pend);                                 // boss z 14..18.5
      P.at(P.cylZ(24, 8, my), 0, -PY - BOB, 16, o.pend);                             // bob z 12..20, lowest point y -282
      // back plate, bracket and base
      P.at(P.box(60, 568, 6, c.fixed), 0, -16, -33, scene);                          // plate y -300..268, z -36..-30
      P.at(P.box(32, 12, 60, c.fixed), 0, 255, 0, scene);                            // bracket y 249..261, z -30..30, from the face of the plate
      P.at(P.box(16, 14, 4, c.fixed), 0, 242, 12, scene);                            // cheek y 235..249, z 10..14; the pendulum hangs on its front face
      P.at(P.box(240, 12, 110, c.fixed), 0, -306, -5, scene);                        // base y -312..-300, z -60..50; the plate stands on it
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
