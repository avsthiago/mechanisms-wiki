(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up. The wheel turns clockwise.
  // The balance axis is straight above the wheel; the long teeth just reach into the little roller on it.
  var RAD = Math.PI / 180, N = 12, R = 100, RB = 75, RI = 55, RPIN = 62.5, PR = 1.5, AY = 106, RR = 7.5, LP = 45.5;
  var REST = Math.asin(Math.sqrt(RR * RR - Math.pow((AY * AY + RR * RR - R * R) / (2 * AY), 2)) / R);   // a resting tooth tip is this far before the top
  var LAG = 14.5 * RAD, NC = 270 * RAD, NH = 16 * RAD, ND = 4, TP = 222 * RAD;   // pins behind the teeth; notch centre, half width, depth; pallet face
  var IB = 1, IW = .04, TAU = 200, CB = .1, CW = 8, H = .0002, START = -1.9;   // START: near the steady swing, so it opens already running
  var KS = { s: 20, m: 39.5, h: 80 };              // balance spring: soft, medium, stiff
  function pol(c, r, a) { return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }
  function toothAngle(k) { return 90 * RAD + REST + k * 2 * Math.PI / N; }
  function wheelOutline() {
    var p = [], O = [0, 0];
    for (var k = 0; k < N; k++) { var a = toothAngle(k); p.push(pol(O, RB, a + 1 * RAD), pol(O, R, a), pol(O, RB, a + 9 * RAD), pol(O, RB, a + 16 * RAD), pol(O, RB, a + 24 * RAD)); }
    return p;
  }
  function pinOutline(k) { var p = [], c = pol([0, 0], RPIN, toothAngle(k) + LAG); for (var i = 0; i < 10; i++) p.push(pol(c, PR, i * 36 * RAD)); return p; }
  function rollerOutline(A) {
    var p = [], n = 30, a0 = NC + NH, a1 = NC - NH + 2 * Math.PI;
    for (var i = 0; i <= n; i++) p.push(pol(A, RR, a0 + (a1 - a0) * i / n));
    p.push(pol(A, RR - ND, NC - NH * .6), pol(A, RR - ND, NC + NH * .6));
    return p;
  }
  function palletOutline(A) { return [pol(A, 9, TP), pol(A, LP, TP), pol(A, LP, TP + 3.5 * RAD), pol(A, 9, TP + 40 * RAD)]; }
  // Bodies: 0 escape wheel (outline 0 the long teeth, then the pins), 1 balance (roller, pallet).
  // The long teeth meet only the roller; the pins stand up from the wheel and meet only the pallet, which swings above the teeth.
  function makeSim(P) {
    var polys = [wheelOutline()], layers = [0], k;
    for (k = 0; k < N; k++) { polys.push(pinOutline(k)); layers.push(1); }
    var s = P.pivotSim({
      bodies: [
        { pivot: [0, 0], I: IW, polys: polys, layers: layers, drag: CW },
        { pivot: [0, AY], I: IB, polys: [rollerOutline([0, AY]), palletOutline([0, AY])], layers: [0, 1], drag: CB, a: START }
      ],
      pairs: [[0, 1]]
    });
    s.t = 0; s.amp = Math.abs(START); s.beats = [];
    s.run = function (h, k, tau) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      b[0].tq = -tau; b[1].tq = -k * b[1].a;                                          // a steady push on the wheel; the coiled spring pulls the balance back
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }

  M507.define({
    number: 293,
    title: "Duplex escapement",
    lede: "One wheel does two jobs here. Its long pointed teeth lean on a small roller on the balance and hold the wheel still. Its short pins give the balance a push, once for every swing there and back. It was used in watches.",
    alt: "A wheel with long pointed teeth round its edge and a ring of short pins standing up from its face. Above the top of the wheel is the axis of a swinging balance. A small roller with a notch sits on that axis where the tip of a tooth touches it, and a long thin arm reaches from the axis down to the pins.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "The mainspring of the watch, not shown, keeps trying to turn it clockwise. The long teeth hold it and the short pins on its face do the pushing. Watch the red dot to see it move on." },
      { key: "roller", color: "#C8873A", name: "Roller and pallet", note: "Both are fixed on the axis of the balance. The small roller has a notch that lets one tooth through. The long arm, called the pallet, is what the pins push." },
      { key: "balance", color: "#D9B13B", name: "Balance wheel", note: "A wheel that swings one way and then the other. It carries the roller and the pallet round with it." },
      { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A coiled strip, fixed to the frame at its outer end and to the balance at its inner end. It always pulls the balance back to the middle." }
    ],
    controls: [{ id: "spring", label: "Balance spring", value: "m", options: [["s", "Soft"], ["m", "Medium"], ["h", "Stiff"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [205, 148, 435], front: [0, 36, 520], side: [560, 36, -5] },
    target: [0, 36, -5],
    how: [
      "The wheel is always trying to turn. The tip of a long tooth leans on the little roller, so the wheel cannot move. The roller turns to and fro with the balance and the tooth just slides on it.",
      "The roller has a notch. When the balance swings anticlockwise the notch comes round, and the tooth slips into it and is carried through. The wheel is free and jumps forward. At once a pin on the wheel catches up with the pallet and pushes it along. That push keeps the balance swinging. Then the next long tooth lands on the roller and the wheel stops again.",
      "On the swing back the notch meets the tooth going the other way. The tooth dips in a little and is pushed out again, so the wheel does not move on. That makes one step for every two beats. The balance spring sets the pace. Try Soft, then Stiff, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing, which shows only the top of the wheel. The rest of the wheel, the balance wheel with its coiled spring, the back plate and the sizes were made up. The pallet is straight here and curved in the drawing. The notch was turned to the place on the roller where it has to be for the wheel to work. The mainspring is left out and its push on the wheel is taken to be steady. The tooth slides on the roller without rubbing, and only the balance and the wheel are slowed a little.",

    makeSim: makeSim, K: { N: N, R: R, AY: AY, TAU: TAU, H: H, KS: KS },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), mr = c.mat("roller"), mb = c.mat("balance"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 15000; i++) o.sim.run(H, KS.m, TAU);                             // run 3 seconds so it opens in its steady swing
      // escape wheel: plate z 0..5 with the long teeth; the pins stand on its face, z 5..13
      o.wheel = new T.Group(); scene.add(o.wheel);
      o.wheel.add(P.outlinePlate({ points: wheelOutline(), depth: 5, material: mw, windows: { count: 4, rIn: 16, rOut: RI, spoke: 10 } }));
      for (i = 0; i < N; i++) { var q = pol([0, 0], RPIN, toothAngle(i) + LAG); P.at(P.cylZ(PR, 8, c.mat("wheel", "dark")), q[0], q[1], 9, o.wheel); }
      var dot = pol([0, 0], 82, toothAngle(0) + 4.5 * RAD);
      P.at(P.cylZ(2.5, 1, c.mat("wheel", "mark")), dot[0], dot[1], 5.5, o.wheel);      // red dot z 5..6 on the face of one long tooth
      P.at(P.cylZ(8, 2, c.mat("wheel", "dark")), 0, 0, 6, o.wheel);                    // hub cap z 5..7, on the face
      P.at(P.cylZ(4, 30, c.fixed), 0, 0, -15, scene);                                  // pin z -30..0, plate face to the back of the wheel
      // everything on the balance axis turns together. Staff z -30 (plate face) .. 14.
      o.bal = new T.Group(); o.bal.position.set(0, AY, 0); scene.add(o.bal);
      P.at(P.cylZ(2.5, 44, mr), 0, 0, -8, o.bal);                                      // staff z -30..14
      o.bal.add(P.outlinePlate({ points: rollerOutline([0, 0]), depth: 5, material: mr }));          // roller z 0..5, level with the long teeth
      o.bal.add(P.outlinePlate({ points: palletOutline([0, 0]), depth: 5, z0: 7, material: mr }));   // pallet z 7..12, clear of the wheel's face, among the pins
      P.at(P.cylZ(9, 7, mr), 0, 0, 10.5, o.bal);                                       // hub of the pallet z 7..14
      P.at(P.hoop(62, 4, mb), 0, 0, -17, o.bal);                                       // rim z -21..-13, behind the wheel
      P.at(P.box(116, 6, 4, mb), 0, 0, -17, o.bal);                                    // bar x -58..58, to the inside of the rim; z -19..-15
      P.at(P.cylZ(5, 4, mb), 0, 0, -26, o.bal);                                        // collar z -28..-24 that holds the inner end of the spring
      // balance spring z -28..-24: inner end on the collar, outer end at radius 46 on a block on the plate
      o.spring = P.spiralSpring({ rIn: 5.4, rOut: 46, width: 4, thick: .8, material: c.mat("spring") });
      o.spring.position.set(0, AY, -26); scene.add(o.spring);
      P.at(P.box(5.6, 6, 6, c.fixed), -49.2, AY, -27, scene);                          // block x -52..-46.4 (spring's outer face at 46.4), z -30..-24, on the plate face
      // back plate and base
      P.at(P.box(250, 300, 6, c.fixed), 0, 35, -33, scene);                            // plate x -125..125, y -115..185, z -36..-30
      P.at(P.box(270, 12, 90, c.fixed), 0, -121, -15, scene);                          // base y -127..-115, z -60..30; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, k = KS[S.controls.spring] || KS.m, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, k, TAU);
      o.wheel.rotation.z = b[0].a; o.bal.rotation.z = b[1].a;
      o.spring.rotation.z = b[1].a; o.spring.set(7 * Math.PI - b[1].a, 1);              // the outer end stays on its block while the inner end turns
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
    }
  });
})();
