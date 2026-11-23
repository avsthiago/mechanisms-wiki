(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // clockwise. The lever rocks on a pin to the right of the wheel and reaches straight across the wheel to the balance
  // on the left. Its two pallets reach the wheel above and below the pin. The upper pallet only holds. The lower one
  // has a sloping end, so the tooth that slips off it pushes the lever, and the lever pushes the balance.
  var RAD = Math.PI / 180, N = 12, R = 100, RR = 84, PITCH = 2 * Math.PI / N;
  var HA = 39 * RAD, GA = 0, D = R / Math.cos(HA), RL = R * Math.tan(HA);   // the pallets sit HA either side of the pin's direction; pin where the two tangents meet
  var A = [D * Math.cos(GA), D * Math.sin(GA)], E0 = GA + Math.PI - (Math.PI / 2 - HA), X0 = GA + Math.PI + (Math.PI / 2 - HA);   // pin; directions from the pin to the two resting points
  var TP = 17, BANK = 3 * RAD, LOCK = 2 * RAD, DRAW = .2, CUT = 9 * RAD;                  // each pallet reaches past the middle of the lever's swing, so one is always in the way
  var PHI = 8 * RAD, BETA = 12 * RAD, RC = R * Math.sin(PHI) / Math.sin(BETA), DB = R * Math.cos(PHI) + RC * Math.cos(BETA);   // the finger on the balance crosses the tooth tips over 2 * PHI of the wheel and 2 * BETA of the balance
  var LCA = Math.PI, B0 = [-DB, 0], DEL = 5 * RAD, RB = 40;   // balance axis; the finger is on the line of centres when the balance is DEL past its middle; roller
  var AB = Math.hypot(B0[0] - A[0], B0[1] - A[1]), DIR = Math.atan2(B0[1] - A[1], B0[0] - A[0]), RP = 34, PINR = 3, HW = 4.5, FW = 14;   // pin to balance axis; pin circle on the balance, pin radius, half width of the notch
  var LF = (function () { var lo = AB - RP, hi = AB; for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (m * Math.cos(BANK) + Math.sqrt(RP * RP - Math.pow(m * Math.sin(BANK), 2)) < AB) lo = m; else hi = m; } return lo; })();   // fork length: the pin meets the notch with the lever on its stop
  var IB = 1, IL = .08, IW = .04, TAU = 150, CB = .1, CW = 8, H = .0002, START = -2.6;
  var KS = { s: 20, m: 39.5, h: 80 };              // balance spring: soft, medium, stiff
  function pol(c, r, a) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return p.map(function (q) { return [c * q[0] - s * q[1], s * q[0] + c * q[1]]; }); }
  function shift(p, c) { return p.map(function (q) { return [q[0] + c[0], q[1] + c[1]]; }); }
  var T0 = GA + HA;                                // the tooth resting on the upper pallet has its tip here
  function wheelOutline() {
    var p = [];
    for (var k = 0; k < N; k++) { var a = T0 + k * PITCH; p.push(pol([0, 0], RR, a + 2 * RAD), pol([0, 0], R, a), pol([0, 0], R, a + .9 * RAD), pol([0, 0], R - 5, a + 3.5 * RAD), pol([0, 0], RR, a + 17 * RAD)); }   // a solid wedge with a small flat tip
    return p;
  }
  // The two pallets, drawn with the lever in the middle of its swing, about the pin at c. Each is a curved blade. Its
  // resting face is nearly a circle about the pin (it leans a little so the tooth pulls the pallet in). Its end is cut
  // back, so a tooth that slips off the corner runs clear without pushing the lever. Points 0..8 run along the resting
  // face from its corner, 9..17 back along the other face.
  function pallet(entry, c) {
    var p = [], i, n = 8, s = entry ? -1 : 1;
    var ac = entry ? E0 + LOCK - BANK : X0 - LOCK + BANK;                             // angle of the corner
    var far = ac + s * 24 * RAD, r2 = entry ? RL - TP : RL + TP, a2 = entry ? ac - CUT : ac - 2 * BANK + LOCK;   // far end; upper pallet: the back face starts further back than the corner. Lower pallet: it starts ahead, which makes the sloping end
    for (i = 0; i <= n; i++) { var a = ac + (far - ac) * i / n; p.push(pol(c, RL + (entry ? -1 : 1) * DRAW * RL * Math.abs(a - ac), a)); }
    for (i = n; i >= 0; i--) { var b = a2 + (far - a2) * i / n; p.push(pol(c, r2, b)); }
    return p;
  }
  function fork(c) {                               // drawn pointing along -x, then turned to point at the balance
    var x0 = -(LF - 16), x1 = -(LF - 1), xs = -(LF - 8);
    return shift(rot([[x0, FW], [x1 + 4, FW], [x1, HW + 2], [x1 + 2, HW], [xs, HW], [xs, -HW], [x1 + 2, -HW], [x1, -HW - 2], [x1 + 4, -FW], [x0, -FW]], DIR - Math.PI), c);
  }
  function leverOutline() {                        // the bar from the tail, past the pin, up to the fork; about the pin
    var f = fork([0, 0]), bar = rot([[-(LF - 16), -5], [-20, -7], [26, -7], [44, -5], [44, 5], [26, 7], [-20, 7], [-(LF - 16), 5]], DIR - Math.PI);
    return f.concat(bar);
  }
  function bowOutline() {                          // the curved piece that carries the two pallets, outside the tooth tips; about the pin
    var p = [], i, n = 16, a0 = GA + HA + 2 * RAD, a1 = GA - HA - 2 * RAD;
    for (i = 0; i <= n; i++) p.push(pol([0, 0], 112, a0 + (a1 - a0) * i / n));
    for (i = n; i >= 0; i--) p.push(pol([0, 0], 136, a0 + (a1 - a0) * i / n));
    return shift(p, [-A[0], -A[1]]);
  }
  function pin() { var p = [], c = pol(B0, RP, DIR + Math.PI); for (var i = 0; i < 12; i++) p.push(pol(c, PINR, i * 30 * RAD)); return p; }
  function fingerOutline(c) {                      // the finger on the roller; the wheel pushes on its straight side
    var tn = LCA + Math.PI - DEL;
    return [pol(c, RB - 6, tn), pol(c, RC, tn), pol(c, RC, tn + 4 * RAD), pol(c, RB - 6, tn + 26 * RAD)];
  }
  function rollerOutline(c) { var p = []; for (var i = 0; i < 40; i++) p.push(pol(c, RB, i * 9 * RAD)); return p; }
  // Bodies: 0 escape wheel, 1 lever with pallets and fork, 2 balance with its pin, roller and finger.
  // The fork and the pin lie in front of the wheel, the roller and the pallets, and meet only each other.
  function makeSim(P) {
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: [wheelOutline()], drag: CW, a: 1 * RAD },
        { pivot: A, I: IL, polys: [pallet(true, A), pallet(false, A), fork(A)], layers: [0, 0, 1], min: -BANK, max: BANK, a: BANK },
        { pivot: B0, I: IB, polys: [pin(), rollerOutline(B0), fingerOutline(B0)], layers: [1, 0, 0], drag: CB, a: START }
      ],
      pairs: [[0, 1], [1, 2], [0, 2]]
    });
    s.t = 0; s.amp = Math.abs(START); s.beats = [];
    s.run = function (h, key) {
      var b = s.bodies, a0 = b[2].a, w0 = b[2].w, k = KS[key] || KS.m;
      b[0].tq = -TAU; b[2].tq = -k * b[2].a;                                          // a steady push on the wheel; the coiled spring pulls the balance back
      s.step(h); s.t += h;
      if (w0 * b[2].w < 0) s.amp = Math.abs(b[2].a);                                  // the far end of a swing
      if (a0 * b[2].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }   // passing the middle: one beat
    };
    return s;
  }

  M507.define({
    number: 396,
    title: "Reed's anchor and lever escapement",
    lede: "A balance wheel swings to and fro on a coiled spring and keeps the time. A lever holds the escape wheel still between swings. The balance gets a push on every swing: one way through the lever, the other way straight from a tooth of the wheel.",
    alt: "A big balance wheel on the left. A smaller wheel with pointed, leaning teeth on the right overlaps its rim. A straight lever lies across the middle of the toothed wheel. Its left end is a small fork next to a roller on the axis of the balance. Its right end rocks on a pin and carries a curved piece with a hooked tip above and below the wheel.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "The mainspring of the watch, not shown, keeps trying to turn it clockwise. Watch the red dot to see it move on in two steps, one longer than the other." },
      { key: "anchor", color: "#C8873A", name: "Lever and pallets", note: "One piece that rocks on a pin. Its two hooked tips, called pallets, take turns to hold a tooth. The upper one only holds. The lower one has a sloping end that a tooth can push on. The far end of the lever is a fork with a notch." },
      { key: "balance", color: "#D9B13B", name: "Balance wheel", note: "A wheel that swings one way and then the other. The roller on its axis carries a red pin that works the fork, and a long finger with a red dot. Watch a tooth push the finger on one swing and the fork push the pin on the next." },
      { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A coiled strip, fixed to the frame at its outer end and to the balance at its inner end. It always pulls the balance back to the middle." }
    ],
    controls: [{ id: "spring", label: "Balance spring", value: "m", options: [["s", "Soft"], ["m", "Medium"], ["h", "Stiff"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [60, 75, 750], front: [-72, -5, 770], side: [770, -5, -5] },
    target: [-72, -5, -5],
    how: [
      "The escape wheel is always trying to turn, but one pallet of the lever sits in the way of a tooth and holds it. For most of each swing the balance touches nothing at all.",
      "When the balance swings anticlockwise, the red pin on its roller runs into the notch of the fork and knocks the lever over. The upper pallet slides off its tooth and the wheel is free. A tooth next to the roller catches the finger and pushes the balance round. Then the lower pallet stops the wheel.",
      "On the swing back the pin knocks the lever the other way. The end of the lower pallet is sloped. As the tooth slides off it, the tooth pushes the lever, and the fork pushes the pin. So the balance is pushed on both swings, and the wheel is let go only once for each push. Try Soft, then Stiff, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The coiled spring, the back plate, the number of teeth and the sizes were made up. The balance sits closer to the escape wheel than in the drawing, and the finger on its roller is longer and straight, so that a tooth can reach it. The two pins that stop the lever are in the drawing. The mainspring is left out and its push on the wheel is taken to be steady. The parts knock and slide on each other without rubbing, and only the balance and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, opts: ["s", "m", "h"], pitch: PITCH, perBeat: .5, maxd: 1.2 },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), ma = c.mat("anchor"), mb = c.mat("balance"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 15000; i++) o.sim.run(H, "m");                                   // run 3 seconds so it opens in its steady swing
      // escape wheel: plate z 0..6 on a pin from the back plate (face at z -30)
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 6, material: mw, windows: { count: 3, rIn: 18, rOut: 66, spoke: 11 }, start: 30 * RAD }));
      var dot = pol([0, 0], 84, T0 + 9.5 * RAD);
      P.at(P.cylZ(3, 1, c.mat("wheel", "mark")), dot[0], dot[1], 6.5, o.wheel);       // red dot z 6..7 on the face of one tooth
      P.at(P.cylZ(9, 1.4, c.mat("wheel", "dark")), 0, 0, 6.7, o.wheel);                // hub cap z 6..7.4, on the face, clear of the lever that passes in front (z 8..14)
      P.at(P.cylZ(4, 30, c.fixed), 0, 0, -15, scene);                                  // pin z -30..0, plate face to the back of the wheel
      // lever: the bow z 0..6 is level with the wheel, the pallets z -0.6..6.6 stand proud of it, the bar and fork z 8..14 pass in front
      o.anchor = new T.Group(); o.anchor.position.set(A[0], A[1], 0); scene.add(o.anchor);
      o.anchor.add(P.outlinePlate({ points: bowOutline(), depth: 6, material: ma }));
      [true, false].forEach(function (e) {
        o.anchor.add(P.outlinePlate({ points: pallet(e, [0, 0]), depth: 7.2, z0: -.6, material: ma }));
      });
      o.anchor.add(P.outlinePlate({ points: leverOutline(), depth: 6, z0: 8, material: ma }));
      P.at(P.cylZ(7, 8, ma), 0, 0, 4, o.anchor);                                       // boss z 0..8 that joins the bow to the bar
      P.at(P.cylZ(5, 2, c.mat("anchor", "dark")), 0, 0, 15, o.anchor);                 // cap z 14..16, on the face of the bar
      P.at(P.cylZ(4, 30, c.fixed), A[0], A[1], -15, scene);                            // pin z -30..0, plate face to the back of the boss
      // two pins stop the tail of the lever: each just touches a long edge of the tail when the lever is hard over
      [1, -1].forEach(function (s) {
        var q = rot([[36, s * (6 + 2 + .15)]], DIR - Math.PI + s * BANK)[0];           // tail edge is about 6 from the centre line at 36 from the pin; pin radius 2
        P.at(P.cylZ(2, 44, c.fixed), A[0] + q[0], A[1] + q[1], -8, scene);             // pin z -30..14, radius 2
      });
      // balance: everything on its axis turns together. Staff z -30 (plate face) .. 16.
      o.bal = new T.Group(); o.bal.position.set(B0[0], B0[1], 0); scene.add(o.bal);
      P.at(P.cylZ(3, 46, mb), 0, 0, -7, o.bal);                                        // staff z -30..16
      P.at(P.cylZ(RB, 6, mb), 0, 0, 3, o.bal);                                         // roller z 0..6, level with the wheel, behind the fork (z 8..14)
      o.bal.add(P.outlinePlate({ points: fingerOutline([0, 0]), depth: 7.2, z0: -.6, material: mb }));   // finger z -0.6..6.6, proud of both faces of the roller
      var fd = pol([0, 0], 57, LCA + Math.PI - DEL + 5.5 * RAD);
      P.at(P.cylZ(2.5, .8, c.mat("balance", "mark")), fd[0], fd[1], 7, o.bal);         // red dot z 6.6..7.4 on the face of the finger, behind the fork (z 8..14)
      var pc = pol([0, 0], RP, DIR + Math.PI);
      P.at(P.cylZ(PINR, 9, c.mat("balance", "mark")), pc[0], pc[1], 10.5, o.bal);      // red pin z 6..15: from the face of the roller through the fork, 1 proud of it
      P.at(P.hoop(150, 4, mb), 0, 0, -17, o.bal);                                       // rim z -21..-13, behind the wheel and the lever
      P.at(P.box(292, 6, 4, mb), 0, 0, -17, o.bal);                                    // bar x -146..146, to the inside of the rim; z -19..-15
      P.at(P.cylZ(5, 4, mb), 0, 0, -26, o.bal);                                        // collar z -28..-24 that holds the inner end of the spring
      // balance spring z -28..-24: inner end on the collar (radius 5), outer end at radius 56 on a block on the plate
      o.spring = P.spiralSpring({ rIn: 5.4, rOut: 56, width: 4, thick: .8, material: c.mat("spring") });
      o.spring.position.set(B0[0], B0[1], -26); scene.add(o.spring);
      P.at(P.box(5.6, 6, 6, c.fixed), B0[0] - 59.2, B0[1], -27, scene);                // block 56.4..62 left of the axis (spring's outer face at 56.4), z -30..-24, on the plate face
      // back plate and base
      P.at(P.box(520, 330, 6, c.fixed), -70, 0, -33, scene);                           // plate x -330..190, y -165..165, z -36..-30
      P.at(P.box(540, 12, 90, c.fixed), -70, -171, -15, scene);                        // base y -177..-165, z -60..30; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, S.controls.spring);
      o.wheel.rotation.z = b[0].a; o.anchor.rotation.z = b[1].a; o.bal.rotation.z = b[2].a;
      o.spring.rotation.z = b[2].a; o.spring.set(7 * Math.PI - b[2].a, 1);              // the outer end stays on its block while the inner end turns
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
    }
  });
})();
