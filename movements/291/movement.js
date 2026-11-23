(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns clockwise.
  // The balance is up and to the left, its big roller just reaching in between two teeth. The long spring lies level
  // over the wheel from its foot on the right, with the stop hanging under it.
  var RAD = Math.PI / 180, N = 12, R = 100, RT = 78, AX = -57, AY = 114, RRL = 38, NB = 26;   // wheel, balance axis, roller, bottom of its notch
  var LC = Math.atan2(AY, AX), TL = LC - 45 * RAD;                                              // line of centres; tip angle of the tooth held by the stop
  var DX = R * Math.cos(TL), DY = R * Math.sin(TL), LOCK = 3, DW = 5, BX = 260, BY = 108;      // face of the stop, how far it reaches below the tip, foot of the spring
  var SR = 8.4, SP = 1.6, KX = -4, TIPX = AX + 7, STH = 2, DT = 4, SIG = 45 * RAD;                   // stud circle and size, hook, end of the thin spring, its thickness, thickness of the long one, stud angle
  var LO = KX - TIPX, LE = BX - TIPX;                                                           // thin spring beyond the hook; foot to the end of the thin spring
  var IB = 1, IW = .02, ID = .005, IG = .0005, TAU = 100, CB = .1, CW = 4, TD = 20, KD = 200, KT = 2, TS = .2, H = .0002, START = -3.4;   // START: near the steady swing, so it opens already running
  var KS = { s: 20, m: 39.5, h: 80 };              // balance spring: soft, medium, stiff
  function pol(c, r, a) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
  function wheelOutline() {
    var p = [], O = [0, 0];
    for (var k = 0; k < N; k++) { var a = TL + k * 2 * Math.PI / N; p.push(pol(O, RT, a + 5 * RAD), pol(O, R, a), pol(O, RT, a + 22 * RAD)); }
    return p;
  }
  function rollerOutline(A) {                     // round, with a notch; the wheel pushes on the straight side of the notch
    var p = [], tn = LC + Math.PI, n = 32;
    for (var i = 0; i <= n; i++) p.push(pol(A, RRL, tn + 330 * RAD * i / n));
    p.push(pol(A, NB, tn + 356 * RAD), pol(A, NB, tn));
    return p;
  }
  function studOutline() { var p = [], c = pol([AX, AY], SR, SIG); for (var i = 0; i < 10; i++) p.push(pol(c, SP, i * 36 * RAD)); return p; }
  function stopOutline() { return [[DX, DY - LOCK], [DX + DW, DY - LOCK], [DX + DW, BY - 2], [DX, BY - 2]]; }
  function thinOutline() { return [[TIPX, AY - STH / 2], [KX, AY - STH / 2], [KX, AY + STH / 2], [TIPX, AY + STH / 2]]; }
  // Bodies: 0 escape wheel, 1 balance (roller, stud), 2 long spring with the stop, 3 the end of the thin spring beyond the hook.
  // The stud and the thin spring lie above the wheel and the roller and meet only each other.
  // The tie keeps the thin spring from rising above the line of the long spring: lifting it lifts both.
  function makeSim(P) {
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: [wheelOutline()], drag: CW },
        { pivot: [AX, AY], I: IB, polys: [rollerOutline([AX, AY]), studOutline()], layers: [0, 1], drag: CB, a: START },
        { pivot: [BX, BY], I: ID, polys: [stopOutline()], max: 0, drag: .05 },
        { pivot: [KX, AY], I: IG, polys: [thinOutline()], layers: [1], drag: .002 }
      ],
      pairs: [[0, 1], [0, 2], [1, 3]],
      links: [{ i: 3, j: 2, gi: LO, gj: -LE, c: 0 }]
    });
    s.t = 0; s.amp = Math.abs(START); s.beats = [];
    s.run = function (h, k, tau) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      b[0].tq = -tau; b[1].tq = -k * b[1].a;                                          // a steady push on the wheel; the coiled spring pulls the balance back
      b[2].tq = TD - KD * b[2].a;                                                    // the long spring presses its stop down
      b[3].tq = -TS - KT * (b[3].a - b[2].a * LE / LO);                               // the thin spring presses up under the hook
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }

  M507.define({
    number: 291,
    title: "Chronometer escapement",
    lede: "This escapement was made for chronometers, the very exact clocks once used to find a ship's place at sea. A small stop on a springy strip holds the escape wheel. The balance frees it for a moment, takes one push, and then swings on its own.",
    alt: "A wheel with saw teeth. Up and to the left is a round roller with a notch, on the axis of a swinging balance. A long thin strip lies level across the top of the wheel, fixed in a block at its right end. A small stop hangs under the strip and catches a tooth. A second, thinner strip lies along the top of the first, passes under a hook at its left end and reaches almost to the axis of the balance.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "The mainspring, not shown, keeps trying to turn it clockwise. Watch the red dot to see it move on one tooth at a time." },
      { key: "detent", color: "#C8873A", name: "Long spring and stop", note: "A springy strip fixed at its right end. The small stop under it blocks one tooth of the wheel. A hook at its left end reaches over the thin spring." },
      { key: "thin", color: "#C2503F", name: "Thin spring", note: "A weak strip fixed on the long spring. Its end sticks out past the hook. Pushed down, it bends alone. Pushed up, it meets the hook and lifts the long spring with it." },
      { key: "balance", color: "#D9B13B", name: "Balance wheel", note: "A wheel that swings one way and then the other. On its axis are a big roller with a notch, which the wheel pushes, and a little stud that flicks the thin spring." },
      { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A coiled strip, fixed to the frame at its outer end and to the balance at its inner end. It always pulls the balance back to the middle." }
    ],
    controls: [{ id: "spring", label: "Balance spring", value: "m", options: [["s", "Soft"], ["m", "Medium"], ["h", "Stiff"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [215, 100, 585], front: [72, 44, 660], side: [700, 44, -5] },
    target: [72, 44, -5],
    how: [
      "The escape wheel is always trying to turn. One tooth rests against the small stop under the long spring, so the wheel cannot move. For most of its swing the balance touches nothing at all.",
      "When the balance swings anticlockwise, the little stud near its axis catches the end of the thin spring and lifts it. The thin spring meets the hook, so the long spring rises too and the stop lets go of its tooth. The wheel jumps forward. Another tooth, waiting beside the big roller, runs into the straight side of the notch and gives the balance a push. The stop drops back in time to catch the next tooth.",
      "On the swing back the stud only bends the thin spring down and slips past. Nothing is let go, so the wheel moves one tooth for every two beats. The balance spring sets the pace. Try Soft, then Stiff, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The balance wheel with its coiled spring, the back plate and the sizes were made up. Both springs are shown as stiff strips on hinges, the long one at its foot and the thin one at the hook, instead of bending along their length. The mainspring is left out and its push on the wheel is taken to be steady. The parts knock and slide on each other without rubbing, and only the balance and the wheel are slowed a little.",

    makeSim: makeSim, K: { N: N, R: R, TAU: TAU, H: H, KS: KS },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), md = c.mat("detent"), mb = c.mat("balance"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 15000; i++) o.sim.run(H, KS.m, TAU);                             // run 3 seconds so it opens in its steady swing
      // escape wheel: plate z 0..5 on a pin from the back plate (face at z -30)
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 5, material: mw, windows: { count: 4, rIn: 16, rOut: 60, spoke: 10 } }));
      var dot = pol([0, 0], 85, TL + 9 * RAD);
      P.at(P.cylZ(2.5, 1, c.mat("wheel", "mark")), dot[0], dot[1], 5.5, o.wheel);      // red dot z 5..6 on the face of one tooth
      P.at(P.cylZ(8, 2, c.mat("wheel", "dark")), 0, 0, 6, o.wheel);                    // hub cap z 5..7, on the face
      P.at(P.cylZ(4, 30, c.fixed), 0, 0, -15, scene);                                  // pin z -30..0, plate face to the back of the wheel
      // balance: everything on its axis turns together. Staff z -30 (plate face) .. 13.
      o.bal = new T.Group(); o.bal.position.set(AX, AY, 0); scene.add(o.bal);
      P.at(P.cylZ(3, 43, mb), 0, 0, -8.5, o.bal);                                      // staff z -30..13
      o.bal.add(P.outlinePlate({ points: rollerOutline([0, 0]), depth: 5, material: mb }));   // big roller z 0..5, level with the wheel
      P.at(P.cylZ(SR - SP, 4, mb), 0, 0, 10, o.bal);                                   // small disc z 8..12, radius 6.8, level with the thin spring
      P.at(P.cylZ(SP, 4, c.mat("balance", "dark")), SR * Math.cos(SIG), SR * Math.sin(SIG), 10, o.bal);   // stud z 8..12, on the edge of the small disc
      P.at(P.hoop(70, 4, mb), 0, 0, -17, o.bal);                                       // rim z -21..-13, behind the wheel
      P.at(P.box(132, 6, 4, mb), 0, 0, -17, o.bal);                                    // bar x -66..66, to the inside of the rim; z -19..-15
      P.at(P.cylZ(5, 4, mb), 0, 0, -26, o.bal);                                        // collar z -28..-24 that holds the inner end of the spring
      o.spring = P.spiralSpring({ rIn: 5.4, rOut: 52, width: 4, thick: .8, material: c.mat("spring") });
      o.spring.position.set(AX, AY, -26); scene.add(o.spring);                         // balance spring z -28..-24
      P.at(P.box(5.6, 6, 6, c.fixed), AX - 55.2, AY, -27, scene);                      // block x -58..-52.4 from the axis (spring's outer face at 52.4), z -30..-24, on the plate face
      // long spring: hinged at its foot (BX, BY); the strip runs from the foot block to the hook, a little uphill
      o.det = new T.Group(); o.det.position.set(BX, BY, 0); scene.add(o.det);
      var tipY = AY - STH / 2 - DT / 2 - .2, len = Math.hypot(BX - KX, tipY - BY), sl = Math.atan2(tipY - BY, KX - BX);   // the strip's top face ends just under the thin spring
      var strip = P.at(P.box(len, DT, 5, md), (KX - BX) / 2, (tipY - BY) / 2, 2.5, o.det); strip.rotation.z = sl - Math.PI;   // z 0..5, top face just under the thin spring at the hook
      var topAt = function (x) { return BY + (tipY - BY) * (BX - x) / (BX - KX); };   // height of the strip's centre line above x
      P.at(P.box(DW, topAt(DX) - (DY - LOCK), 5, md), DX + DW / 2 - BX, (topAt(DX) + DY - LOCK) / 2 - BY, 2.5, o.det);   // stop x DX..DX+5, from 3 below the tooth tip up into the strip
      P.at(P.box(8, AY + 2 - topAt(143), 11.5, md), 143 - BX, (AY + 2 + topAt(143)) / 2 - BY, 5.75, o.det);   // block that holds the thin spring: x 139..147, z 0..11.5, from the strip up past the thin spring
      P.at(P.box(5, AY + 3 - tipY, 7.5, md), KX + 1 - BX, (AY + 3 + tipY) / 2 - BY, 3.75, o.det);              // hook post: x -5.5..-0.5, z 0..7.5, behind the thin spring (z 8..11)
      P.at(P.box(5, 2.4, 12, md), KX + 1 - BX, AY + STH / 2 + .7 - BY, 6, o.det);                               // hook top: on the thin spring's top face, 2.4 thick, z 0..12, over the thin spring
      P.at(P.box(16, 20, 36, c.fixed), BX + 8, BY, -12, scene);                        // foot block x 260..276 (the strip ends on its face), z -30..6, on the plate face
      // thin spring z 8..11: from its block, under the hook, to its free end
      o.thin = P.flatStrip({ points: [[143, AY], [KX, AY], [TIPX, AY]], thick: STH, width: 3, material: c.mat("thin") });
      o.thin.position.z = 9.5; o.thin.userData.live = true; scene.add(o.thin);
      // back plate and base
      P.at(P.box(430, 310, 6, c.fixed), 72, 42, -33, scene);                           // plate x -143..287, y -113..197, z -36..-30
      P.at(P.box(450, 12, 90, c.fixed), 72, -119, -15, scene);                         // base y -125..-113, z -60..30; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, k = KS[S.controls.spring] || KS.m, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, k, TAU);
      o.wheel.rotation.z = b[0].a; o.bal.rotation.z = b[1].a; o.det.rotation.z = b[2].a;
      o.spring.rotation.z = b[1].a; o.spring.set(7 * Math.PI - b[1].a, 1);              // the outer end stays on its block while the inner end turns
      var u = -b[2].a, g = b[3].a;                                                      // rise of the long spring, bend of the thin one
      o.thin.setPoints([[143, AY + (BX - 143) * u], [KX, AY + (BX - KX) * u], [KX - LO * Math.cos(g), AY - LO * Math.sin(g)]]);
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
    }
  });
})();
