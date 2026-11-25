(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing.
  // The wheel turns clockwise. The anchor rocks on a pin straight above it, the balance is out to the left.
  var RAD = Math.PI / 180, N = 15, R = 100, RR = 76, D = R / Math.cos(30 * RAD);   // anchor pin where the tangents at 30 degrees either side meet
  var RL = R * Math.tan(30 * RAD), TP = 17, BANK = 5 * RAD, LOCK = 2 * RAD, DRAW = .2;   // catch faces lie on a circle of radius RL about the pin
  var LF = 100, RP = 25, PINR = 3, HW = 4.5;       // fork length, pin circle, pin radius, half width of the notch
  var BX = -(LF * Math.cos(BANK) + Math.sqrt(RP * RP - Math.pow(LF * Math.sin(BANK), 2)));   // balance centre: the pin meets the notch with the lever on its stop
  var IB = 1, IL = .02, IW = .04, TAU = 200, CB = .1, CW = 8, H = .0002, START = -3.05;   // START: near the steady swing, so it opens already running
  var KS = { s: 20, m: 39.5, h: 80 };              // balance spring: soft, medium, stiff
  function pol(c, r, a) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
  function wheelOutline() {
    var p = [];
    for (var k = 0; k < N; k++) { var a = (k * 360 / N) * RAD; p.push(pol([0, 0], RR, a + 6 * RAD), pol([0, 0], R, a), pol([0, 0], RR, a + 19 * RAD)); }
    return p;
  }
  // The two pallets, drawn with the anchor level, about the anchor pin at A. Each is a curved block: a catch face that
  // is nearly a circle about the pin (it leans a little so the tooth pulls the pallet in), and a sloping end the tooth
  // slides along to push the anchor over. Points 0..8 run along the catch face from its corner, 9..17 back along the other face.
  function pallet(entry, A) {
    var p = [], i, n = 8;
    var ac = entry ? 210 * RAD + LOCK - BANK : 330 * RAD - LOCK + BANK, s = entry ? -1 : 1;   // angle of the catch corner
    var far = ac + s * 22 * RAD, r2 = entry ? RL - TP : RL + TP, a2 = ac - s * 2 * BANK + s * LOCK;   // other end of the slope
    for (i = 0; i <= n; i++) { var a = ac + (far - ac) * i / n; p.push(pol(A, RL + (entry ? -1 : 1) * DRAW * RL * Math.abs(a - ac), a)); }   // catch face
    for (i = n; i >= 0; i--) { var b = a2 + (far - a2) * i / n; p.push(pol(A, r2, b)); }                                           // back face
    return p;
  }
  function fork(A) {
    var x0 = -(LF - 16), x1 = -(LF + .5), xs = -(LF - 8);                            // back of the fork, tips of the prongs, bottom of the notch
    return [[x0, 9], [x1, 9], [x1, HW + 2.5], [x1 + 2, HW], [xs, HW], [xs, -HW], [x1 + 2, -HW], [x1, -HW - 2.5], [x1, -9], [x0, -9]].map(function (q) { return [q[0] + A[0], q[1] + A[1]]; });
  }
  var TAIL = [[76, -6], [104, -12], [104, 12], [76, 6]];
  function anchorOutline() {                       // the whole piece in one outline about the pin: fork, lever, both pallets, tail
    var A = [0, 0], p = fork(A), i;
    p.push([-78, -5]);
    [pallet(true, A), pallet(false, A)].forEach(function (q) { for (i = 8; i >= 0; i--) p.push(q[i]); for (i = 17; i >= 9; i--) p.push(q[i]); });
    return p.concat(TAIL, [[0, 16], [-40, 9], [-78, 5]]);
  }
  function pin() { var p = []; for (var i = 0; i < 12; i++) p.push(pol([BX + RP, D], PINR, i * 30 * RAD)); return p; }
  // Bodies: 0 escape wheel, 1 anchor with lever and fork, 2 balance with its pin.
  function makeSim(P) {
    var A = [0, D], s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: [wheelOutline()], drag: CW, a: 1 * RAD },
        { pivot: A, I: IL, polys: [pallet(true, A), pallet(false, A), fork(A)], min: -BANK, max: BANK, a: BANK },
        { pivot: [BX, D], I: IB, polys: [pin()], drag: CB, a: START }
      ],
      pairs: [[0, 1], [1, 2]]
    });
    s.t = 0; s.amp = Math.abs(START); s.beats = [];
    s.run = function (h, k, tau) {
      var b = s.bodies, a0 = b[2].a, w0 = b[2].w;
      b[0].tq = -tau; b[2].tq = -k * b[2].a;                                          // a steady push on the wheel; the coiled spring pulls the balance back
      s.step(h); s.t += h;
      if (w0 * b[2].w < 0) s.amp = Math.abs(b[2].a);                                  // the far end of a swing
      if (a0 * b[2].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }   // passing the middle: one beat
    };
    return s;
  }

  M507.define({
    number: 296,
    title: "Lever escapement",
    lede: "A watch keeps time with a small wheel that swings to and fro on a coiled spring. Each swing knocks a rocking lever over, and the lever lets the escape wheel move on by half a tooth. Almost every wind-up watch works this way.",
    alt: "A wheel with pointed, leaning teeth. Above it a flat piece rocks on a pin, with a hooked tip hanging down into the teeth at each side. One arm of the piece reaches left and ends in a small fork. The fork fits round a pin on a little disc, which sits on the axis of a larger swinging wheel with a coiled spring.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "The mainspring of the watch, not shown, keeps trying to turn it clockwise. Watch the red dot to see it move on in small steps." },
      { key: "anchor", color: "#C8873A", name: "Anchor and lever", note: "One flat piece that rocks on a pin. Its two hooked tips, called pallets, take turns to catch a tooth. Its long arm, the lever, ends in a fork with a notch." },
      { key: "balance", color: "#D9B13B", name: "Balance wheel", note: "A wheel that swings one way and then the other. The small disc on its axis carries a pin. Watch the red pin go into the notch of the fork once in every swing." },
      { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A coiled strip, fixed to the frame at its outer end and to the balance at its inner end. It always pulls the balance back to the middle." }
    ],
    controls: [{ id: "spring", label: "Balance spring", value: "m", options: [["s", "Soft"], ["m", "Medium"], ["h", "Stiff"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [189, 173, 499], front: [-46, 45, 560], side: [600, 45, -5] },
    target: [-46, 45, -5],
    how: [
      "The escape wheel is always trying to turn, but the anchor will not let it. One pallet sits in the way of a tooth and holds it. For most of each swing the balance touches nothing at all.",
      "In the middle of the swing the red pin runs into the notch of the fork and knocks the lever over. That lifts the pallet clear of its tooth. The end of the pallet is sloped, so as the tooth slides off it pushes the anchor further the same way. Now the fork gives the pin a small kick, which keeps the balance swinging. The other pallet has dropped in by then and catches the next tooth.",
      "The balance and its spring set the pace, like a weight bouncing on a spring. A stiff spring pulls the balance back harder, so it swings faster and the watch ticks faster. Try Soft, then Stiff, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The balance wheel and its coiled spring, the two pins that stop the lever, the back plate and the sizes were made up. The teeth are straight here and curved in the drawing. The mainspring is left out and its push on the wheel is taken to be steady. The parts knock and slide on each other without rubbing, and only the balance and the wheel are slowed a little.",

    makeSim: makeSim, K: { N: N, R: R, D: D, BX: BX, TAU: TAU, H: H, BANK: BANK, KS: KS },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("anchor"), mb = c.mat("balance"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 15000; i++) o.sim.run(H, KS.m, TAU);                             // run 3 seconds so it opens in its steady swing
      // escape wheel: plate z 0..6 on a pin from the back plate (face at z -30)
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 6, material: mw, windows: { count: 3, rIn: 18, rOut: 62, spoke: 11 } }));
      var dot = pol([0, 0], 83, 9.5 * RAD);
      P.at(P.cylZ(3, 1, c.mat("wheel", "mark")), dot[0], dot[1], 6.5, o.wheel);       // red dot z 6..7 on the face of one tooth
      P.at(P.cylZ(9, 2, c.mat("wheel", "dark")), 0, 0, 7, o.wheel);                    // hub cap z 6..8, on the face
      P.at(P.cylZ(4, 30, c.fixed), 0, 0, -15, scene);                                  // pin z -30..0, plate face to the back of the wheel
      // anchor, lever and fork: one plate z 0..6 on its own pin
      o.anchor = new T.Group(); o.anchor.position.set(0, D, 0); scene.add(o.anchor);
      o.anchor.add(P.outlinePlate({ points: anchorOutline(), depth: 6, material: ma }));
      P.at(P.cylZ(6, 2, c.mat("anchor", "dark")), 0, 0, 7, o.anchor);                  // boss z 6..8, on the face
      P.at(P.cylZ(4, 30, c.fixed), 0, D, -15, scene);                                  // pin z -30..0, plate face to the back of the anchor
      // two pins stop the tail: each just touches a sloping edge of the tail when the lever is hard over
      [1, -1].forEach(function (s) {
        var nx = -6 / Math.hypot(6, 28), ny = s * 28 / Math.hypot(6, 28), x = 90 + 2 * nx, y = s * 9 + 2 * ny, cs = Math.cos(s * BANK), sn = Math.sin(s * BANK);
        P.at(P.cylZ(2, 36, c.fixed), cs * x - sn * y, D + sn * x + cs * y, -12, scene);   // pin z -30..6, radius 2, its side on the tail's edge
      });
      // balance: everything on its axis turns together. Staff z -30 (plate face) .. 12.
      o.bal = new T.Group(); o.bal.position.set(BX, D, 0); scene.add(o.bal);
      P.at(P.cylZ(3, 42, mb), 0, 0, -9, o.bal);                                        // staff z -30..12
      P.at(P.cylZ(30, 4, mb), 0, 0, 10, o.bal);                                        // small disc z 8..12, passes in front of the fork (z 0..6)
      P.at(P.cylZ(PINR, 13, c.mat("balance", "mark")), RP, 0, 6.5, o.bal);             // red pin z 0..13: through the disc, down into the fork, and 1 proud of the front
      P.at(P.hoop(70, 4, mb), 0, 0, -17, o.bal);                                       // rim z -21..-13, behind the wheel and the anchor
      P.at(P.box(132, 6, 4, mb), 0, 0, -17, o.bal);                                    // bar x -66..66, to the inside of the rim; z -19..-15
      P.at(P.cylZ(5, 4, mb), 0, 0, -26, o.bal);                                        // collar z -28..-24 that holds the inner end of the spring
      // balance spring z -28..-24: inner end on the collar (radius 5), outer end at radius 56 on a block on the plate
      o.spring = P.spiralSpring({ rIn: 5.4, rOut: 56, width: 4, thick: .8, material: c.mat("spring") });
      o.spring.position.set(BX, D, -26); scene.add(o.spring);
      P.at(P.box(5.6, 6, 6, c.fixed), BX - 59.2, D, -27, scene);                       // block x -62..-56.4 from the axis (spring's outer face at 56.4), z -30..-24, on the plate face
      // back plate and base
      P.at(P.box(330, 320, 6, c.fixed), -42, 42, -33, scene);                          // plate x -207..123, y -118..202, z -36..-30
      P.at(P.box(350, 12, 90, c.fixed), -42, -124, -15, scene);                        // base y -130..-118, z -60..30; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, k = KS[S.controls.spring] || KS.m, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, k, TAU);
      o.wheel.rotation.z = b[0].a; o.anchor.rotation.z = b[1].a; o.bal.rotation.z = b[2].a;
      o.spring.rotation.z = b[2].a; o.spring.set(7 * Math.PI - b[2].a, 1);              // the outer end stays on its block while the inner end turns
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
    }
  });
})();
