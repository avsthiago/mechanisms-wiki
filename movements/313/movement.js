(function () {
  // Worked out flat in a "lying down" layout: escape wheel centre at the origin, the lever level above the wheel
  // with its foot on the right, the balance up and to the left. The wheel turns clockwise. Everything that is built
  // goes into one group that is turned a quarter turn clockwise, so on the page the lever stands upright on the
  // right with its foot at the bottom and the balance is at the top right, as in Brown's drawing.
  var RAD = Math.PI / 180, N = 12, R = 100, RT = 84, AX = -102.5, AY = 108, RB = 46, RP = 57;   // wheel; balance axis; roller; reach of the pallet
  var LC = Math.atan2(AY, AX), TL = LC - 45 * RAD;                                              // line of centres; tip angle of the tooth held by the stop
  var DX = R * Math.cos(TL), DY = R * Math.sin(TL), LOCK = 3, DW = 5, BX = 150, BY = AY - 6;    // face of the stop, how far it reaches below the tip, foot of the lever
  var SR = 8.4, SP = 1.6, TIPX = AX + 7, KX = TIPX + 46, XB = 40, STH = 2, DT = 4, SIG = 42 * RAD;   // stud circle and size, end of the thin spring, hook, block that holds the thin spring, thicknesses, stud angle
  var LO = KX - TIPX, LE = BX - TIPX;                                                           // thin spring beyond the hook; foot to the end of the thin spring
  var IB = 1, IW = .02, ID = .005, IG = .0005, TAU = 100, CB = .1, CW = 4, TD = 20, KD = 200, KT = 6, TS = .2, H = .0002, START = -3.4;
  var KS = { s: 20, m: 39.5, h: 80 };              // balance spring: soft, medium, stiff
  function pol(c, r, a) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
  function wheelOutline() {
    var p = [], O = [0, 0];
    for (var k = 0; k < N; k++) { var a = TL + k * 2 * Math.PI / N; p.push(pol(O, RT, a + 1 * RAD), pol(O, R, a), pol(O, R, a + 1 * RAD), pol(O, R - 5, a + 4 * RAD), pol(O, RT, a + 19 * RAD)); }   // a solid wedge with a small flat tip
    return p;
  }
  function palletOutline(A) {                      // the block that sticks out of the roller; the wheel pushes on its straight side
    var tn = LC + Math.PI;
    return [pol(A, RB - 6, tn), pol(A, RP, tn), pol(A, RP, tn + 5 * RAD), pol(A, RB - 6, tn + 24 * RAD)];
  }
  function rollerOutline(A) { var p = []; for (var i = 0; i < 40; i++) p.push(pol(A, RB, i * 9 * RAD)); return p; }
  function studOutline() { var p = [], c = pol([AX, AY], SR, SIG); for (var i = 0; i < 10; i++) p.push(pol(c, SP, i * 36 * RAD)); return p; }
  function stopOutline() { return [[DX, DY - LOCK], [DX + DW, DY - LOCK], [DX + DW, AY - 1], [DX, AY - 1]]; }
  function thinOutline() { return [[TIPX, AY - STH / 2], [KX, AY - STH / 2], [KX, AY + STH / 2], [TIPX, AY + STH / 2]]; }
  // Bodies: 0 escape wheel, 1 balance (roller with its pallet, stud), 2 lever with the stop, 3 the end of the thin spring beyond the hook.
  // The stud and the thin spring lie in front of the wheel and the roller and meet only each other.
  // The tie keeps the thin spring from rising above the line of the lever: lifting it lifts both.
  function makeSim(P) {
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: [wheelOutline()], drag: CW },
        { pivot: [AX, AY], I: IB, polys: [rollerOutline([AX, AY]), palletOutline([AX, AY]), studOutline()], layers: [0, 0, 1], drag: CB, a: START },
        { pivot: [BX, BY], I: ID, polys: [stopOutline()], max: 0, drag: .05 },
        { pivot: [KX, AY], I: IG, polys: [thinOutline()], layers: [1], drag: .06 }
      ],
      pairs: [[0, 1], [0, 2], [1, 3]],
      links: [{ i: 3, j: 2, gi: LO, gj: -LE, c: 0 }]
    });
    s.t = 0; s.amp = Math.abs(START); s.beats = [];
    s.run = function (h, key) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w, k = KS[key] || KS.m;
      b[0].tq = -TAU; b[1].tq = -k * b[1].a;                                         // a steady push on the wheel; the coiled spring pulls the balance back
      b[2].tq = TD - KD * b[2].a;                                                    // the lever's own spring presses its stop into the wheel
      b[3].tq = -TS - KT * (b[3].a - b[2].a * LE / LO);                               // the thin spring presses against the tip of the lever
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }

  M507.define({
    number: 313,
    title: "Spring-detent chronometer escapement",
    lede: "This is the escapement of a ship's chronometer, a very exact clock once used to find a ship's place at sea. A small stop on a springy lever holds the escape wheel. The balance frees it for a moment, takes one push, and then swings on its own.",
    alt: "A wheel with saw teeth. Above it to the right is a round roller with a small block sticking out, on the axis of a swinging balance. A long thin lever stands upright on the right of the wheel, fixed in a block at its foot. A small stop on the lever catches a tooth. A second, thinner strip lies along the lever, passes under a hook at its top end and reaches almost to the axis of the balance.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "The mainspring, not shown, keeps trying to turn it clockwise. Watch the red dot to see it move on one tooth at a time." },
      { key: "detent", color: "#C8873A", name: "Lever and stop", note: "A springy lever fixed at its foot. The small stop on its side blocks one tooth of the wheel. A hook at its top end reaches over the thin spring." },
      { key: "thin", color: "#C2503F", name: "Passing spring", note: "A weak strip fixed on the lever. Its end sticks out past the hook. Pushed towards the lever, it carries the lever with it. Pushed the other way, it bends alone." },
      { key: "balance", color: "#D9B13B", name: "Balance", note: "A wheel that swings one way and then the other. On its axis are a big roller with a block the wheel pushes, and a little stud that flicks the passing spring." },
      { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A coiled strip, fixed to the frame at its outer end and to the balance at its inner end. It always pulls the balance back to the middle." }
    ],
    controls: [{ id: "spring", label: "Balance spring", value: "m", options: [["s", "Soft"], ["m", "Medium"], ["h", "Stiff"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [225, 60, 610], front: [40, 2, 680], side: [720, 2, -5] },
    target: [40, 2, -5],
    how: [
      "The escape wheel is always trying to turn. One tooth rests on the small stop on the lever, so the wheel cannot move. For most of its swing the balance touches nothing at all.",
      "When the balance swings anticlockwise, the little stud near its axis catches the end of the passing spring and presses it against the hook. The lever has to move too, and the stop lets go of its tooth. The wheel jumps forward. Another tooth, waiting beside the big roller, runs into the block on the roller and gives the balance a push. The lever springs back in time to catch the next tooth.",
      "On the swing back the stud only bends the passing spring away from the lever and slips past. Nothing is let go, so the wheel moves one tooth for every two beats. The balance spring sets the pace. Try Soft, then Stiff, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The balance wheel with its coiled spring, the back plate, the number of teeth and the sizes were made up. The lever is straight here and bowed in the drawing, and the passing spring points straight at the axis of the balance. Both springs are shown as stiff strips on hinges, the lever at its foot and the passing spring at the hook, instead of bending along their length. The mainspring is left out and its push on the wheel is taken to be steady. The parts knock and slide on each other without rubbing, and only the balance and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, opts: ["s", "m", "h"], pitch: 2 * Math.PI / N, perBeat: .5, maxd: 1.2 },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), md = c.mat("detent"), mb = c.mat("balance"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 15000; i++) o.sim.run(H, "m");                                   // run 3 seconds so it opens in its steady swing
      var root = new T.Group(); root.rotation.z = -Math.PI / 2; scene.add(root);       // the quarter turn; everything below is in the lying-down layout
      // escape wheel: plate z 0..5 on a pin from the back plate (face at z -30)
      o.wheel = new T.Group(); root.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 5, material: mw, windows: { count: 4, rIn: 16, rOut: 64, spoke: 10 } }));
      var dot = pol([0, 0], 85, TL + 9 * RAD);
      P.at(P.cylZ(2.5, 1, c.mat("wheel", "mark")), dot[0], dot[1], 5.5, o.wheel);      // red dot z 5..6 on the face of one tooth
      P.at(P.cylZ(8, 2, c.mat("wheel", "dark")), 0, 0, 6, o.wheel);                    // hub cap z 5..7, on the face
      P.at(P.cylZ(4, 30, c.fixed), 0, 0, -15, root);                                   // pin z -30..0, plate face to the back of the wheel
      // balance: everything on its axis turns together. Staff z -30 (plate face) .. 20.
      o.bal = new T.Group(); o.bal.position.set(AX, AY, 0); root.add(o.bal);
      P.at(P.cylZ(3, 50, mb), 0, 0, -5, o.bal);                                        // staff z -30..20
      P.at(P.cylZ(RB, 5, mb), 0, 0, 2.5, o.bal);                                       // big roller z 0..5, level with the wheel
      o.bal.add(P.outlinePlate({ points: palletOutline([0, 0]), depth: 6, z0: -.5, material: c.mat("balance", "dark") }));   // pallet z -0.5..5.5, proud of both faces of the roller
      P.at(P.cylZ(SR - SP, 4, mb), 0, 0, 17, o.bal);                                   // small disc z 15..19, radius 6.8, level with the passing spring
      P.at(P.cylZ(SP, 4, c.mat("balance", "dark")), SR * Math.cos(SIG), SR * Math.sin(SIG), 17, o.bal);   // stud z 15..19, on the edge of the small disc
      P.at(P.hoop(70, 4, mb), 0, 0, -17, o.bal);                                       // rim z -21..-13, behind the wheel
      P.at(P.box(132, 6, 4, mb), 0, 0, -17, o.bal);                                    // bar x -66..66, to the inside of the rim; z -19..-15
      P.at(P.cylZ(5, 4, mb), 0, 0, -26, o.bal);                                        // collar z -28..-24 that holds the inner end of the spring
      o.spring = P.spiralSpring({ rIn: 5.4, rOut: 52, width: 4, thick: .8, material: c.mat("spring") });
      o.spring.position.set(AX, AY, -26); root.add(o.spring);                          // balance spring z -28..-24
      P.at(P.box(5.6, 6, 6, c.fixed), AX - 55.2, AY, -27, root);                       // block 52.4..58 from the axis (spring's outer face at 52.4), z -30..-24, on the plate face
      // lever: hinged at its foot (BX, BY); the strip z 7..12 runs in front of the wheel from the foot block to the hook
      o.det = new T.Group(); o.det.position.set(BX, BY, 0); root.add(o.det);
      var tipY = AY - STH / 2 - DT / 2 - .2, len = Math.hypot(BX - KX, tipY - BY), sl = Math.atan2(tipY - BY, KX - BX);   // the strip's top face ends just under the passing spring
      var strip = P.at(P.box(len, DT, 5, md), (KX - BX) / 2, (tipY - BY) / 2, 9.5, o.det); strip.rotation.z = sl - Math.PI;   // z 7..12
      var topAt = function (x) { return BY + (tipY - BY) * (BX - x) / (BX - KX); };   // height of the strip's centre line above x
      P.at(P.box(DW, topAt(DX) - (DY - LOCK), 12, md), DX + DW / 2 - BX, (topAt(DX) + DY - LOCK) / 2 - BY, 6, o.det);   // stop x DX..DX+5, z 0..12, from 3 below the tooth tip up into the strip
      P.at(P.box(8, AY + 2 - topAt(XB), 11.5, md), XB - BX, (AY + 2 + topAt(XB)) / 2 - BY, 12.75, o.det);   // block that holds the passing spring: x 36..44, z 7..18.5, from the strip up past the spring
      P.at(P.box(5, AY + 3 - tipY, 7.5, md), KX + 1 - BX, (AY + 3 + tipY) / 2 - BY, 10.75, o.det);         // hook post: z 7..14.5, behind the passing spring (z 15..18)
      P.at(P.box(5, 2.4, 12, md), KX + 1 - BX, AY + STH / 2 + .7 - BY, 13, o.det);                          // hook top: on the spring's far face, 2.4 thick, z 7..19, over the passing spring
      P.at(P.box(16, 20, 43, c.fixed), BX + 8, BY, -8.5, root);                        // foot block x 150..166 (the strip ends on its face), z -30..13, on the plate face
      P.at(P.cylZ(2, 42, c.fixed), 70, topAt(70) - DT / 2 - 2, -9, root);              // pin the lever rests against: z -30..12, radius 2, its side on the strip's face
      // passing spring z 15..18: from its block, under the hook, to its free end
      o.thin = P.flatStrip({ points: [[XB, AY], [KX, AY], [TIPX, AY]], thick: STH, width: 3, material: c.mat("thin") });
      o.thin.position.z = 16.5; o.thin.userData.live = true; root.add(o.thin);
      // back plate and base, set square on the page
      P.at(P.box(310, 376, 6, c.fixed), 40, 2, -33, scene);                            // plate x -115..195, y -186..190, z -36..-30
      P.at(P.box(330, 12, 90, c.fixed), 40, -192, -15, scene);                         // base y -198..-186, z -60..30; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, S.controls.spring);
      o.wheel.rotation.z = b[0].a; o.bal.rotation.z = b[1].a; o.det.rotation.z = b[2].a;
      o.spring.rotation.z = b[1].a; o.spring.set(7 * Math.PI - b[1].a, 1);              // the outer end stays on its block while the inner end turns
      var u = -b[2].a, g = b[3].a;                                                      // rise of the lever, bend of the passing spring
      o.thin.setPoints([[XB, AY + (BX - XB) * u], [KX, AY + (BX - KX) * u], [KX - LO * Math.cos(g), AY - LO * Math.sin(g)]]);
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
    }
  });
})();
