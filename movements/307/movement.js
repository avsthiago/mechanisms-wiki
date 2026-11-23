(function () {
  // Flat layout in model units, escape wheel centre at the origin, y up, as in Brown's drawing. The wheel turns
  // clockwise. The pendulum hangs from a pin at (0, L) straight above the wheel. Its lower end is a broad plate with
  // an opening for the shaft of the wheel. Points on the pendulum are given as (distance from the pin, angle from
  // straight down). The wheel lies in front of the plate: three short teeth near the hub push the two pallets, and
  // three long teeth further forward are caught by the two stops.
  var RAD = Math.PI / 180, RT = 80, L = 260, RS = Math.hypot(RT, L), TH0 = Math.atan(RT / L), CT = .012;   // long teeth; pin height; the stops' faces lie on a circle about the pin through the tooth tips; how far a stop reaches past the tip with the pendulum straight
  var RPN = 32, TP = 20 * RAD, YP = RPN * Math.cos(TP), RA = L - YP, RB = L + YP, XA = -3, XB = 8;      // short teeth; a short tooth slips past a pallet 20 degrees past the top or bottom; pallet faces
  var IW = 1.5, TAU = 600, CW = 40, MP = .16, L0 = 385, G = 16 * L0, CP = 3000, H = .00025, START = .09;
  function pp(r, t) { return [r * Math.sin(t), L - r * Math.cos(t)]; }
  function pol(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
  // Long tooth k, tip at 180 - 120 k degrees. The last part is bent forward so that only the tip can touch a stop.
  function longTooth(k) { var a = (180 - 120 * k) * RAD; return [pol(9, a + 75 * RAD), pol(62, a + 26 * RAD), pol(RT, a + 1.3 * RAD), pol(RT, a), pol(54, a + 15 * RAD), pol(9, a - 55 * RAD)]; }
  function shortTooth(k) { var a = (180 - 120 * k) * RAD; return [pol(11, a + 50 * RAD), pol(RPN, a + 3.5 * RAD), pol(RPN, a), pol(11, a - 30 * RAD)]; }
  function block(r0, r1, t0, t1) { var p = [], i, n = 4; for (i = 0; i <= n; i++) p.push(pp(r0, t0 + (t1 - t0) * i / n)); for (i = n; i >= 0; i--) p.push(pp(r1, t0 + (t1 - t0) * i / n)); return p; }
  function stopLeft() { return block(RS, RS - 10, -TH0 + CT, -TH0 - .12); }       // the tooth comes up under it
  function stopRight() { return block(RS, RS + 10, TH0 - CT, TH0 + .12); }        // the tooth comes down on top of it
  function palletTop() { return block(RA, RA - 12, XA / RA, (XA + 9) / RA); }       // a short tooth at the top pushes its left side
  function palletBottom() { return block(RB, RB + 12, XB / RB, (XB - 9) / RB); }    // a short tooth at the bottom pushes its right side
  // Bodies: 0 escape wheel (long teeth in front, short teeth behind them), 1 pendulum (stops reach the long teeth, pallets only the short ones).
  function makeSim(P) {
    var s = P.pivotSim({
      bodies: [{ pivot: [0, 0], I: IW, polys: [longTooth(0), longTooth(1), longTooth(2), shortTooth(0), shortTooth(1), shortTooth(2)], layers: [1, 1, 1, 0, 0, 0], drag: CW, a: 2 * RAD },
        { pivot: [0, L], I: MP * L0 * L0, polys: [stopLeft(), stopRight(), palletTop(), palletBottom()], layers: [1, 1, 0, 0], drag: CP, a: START }],
      pairs: [[0, 1]]
    });
    s.t = 0; s.amp = START; s.beats = [];
    s.run = function (h, len) {
      var b = s.bodies, a0 = b[1].a, w0 = b[1].w;
      s.setI(1, MP * len * len);
      b[0].tq = -TAU; b[1].tq = -MP * G * len * Math.sin(b[1].a);                     // the weight turns the wheel; the weight of the bob pulls the pendulum back to the middle
      s.step(h); s.t += h;
      if (w0 * b[1].w < 0) s.amp = Math.abs(b[1].a);
      if (a0 * b[1].a < 0) { s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
    };
    return s;
  }
  function flaskOutline() {                        // the broad lower end of the pendulum and its neck, hanging straight
    var r = [], i;
    for (i = -90; i <= 40; i += 10) r.push([118 * Math.cos(i * RAD), 8 + 62 * Math.sin(i * RAD)]);
    r.push([68, 84], [46, 108], [32, 132], [26, 165], [23, 205], [22, 268], [14, 280]);
    var l = r.slice(1).reverse().map(function (q) { return [-q[0], q[1]]; });
    return r.concat(l);
  }
  function openingOutline() {                      // long opening for the shaft of the wheel, x -70..70, y -30..30
    var p = [], i;
    for (i = -90; i <= 90; i += 15) p.push([40 + 30 * Math.cos(i * RAD), 30 * Math.sin(i * RAD)]);
    for (i = 90; i <= 270; i += 15) p.push([-40 + 30 * Math.cos(i * RAD), 30 * Math.sin(i * RAD)]);
    return p;
  }

  M507.define({
    number: 307,
    title: "Three-legged escapement with stops",
    lede: "A weight tries to spin a wheel with three long teeth. Two small stops on the pendulum take turns to catch a long tooth and hold the wheel still. Each time a stop lets go, a short tooth near the hub gives the pendulum a small push.",
    alt: "The lower end of a pendulum, shaped like a flask with a long opening across it. In front of it is a wheel with three long thin teeth. The tip of the left tooth sits under a small block on the pendulum, and a second block sits at the same height on the right. Near the hub are three short teeth, with a small block just above them and another just below.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Escape wheel", note: "A weight, not shown, keeps trying to turn it clockwise. It has three long teeth that are caught by the stops, and three short teeth near the hub that do the pushing. Watch the red tooth." },
      { key: "pallet", color: "#C8873A", name: "Pallets", note: "Two small blocks on the pendulum, one above the hub and one below. A short tooth pushes one of them each time the wheel is let go." },
      { key: "stop", color: "#4FA58A", name: "Stops", note: "Two taller blocks on the pendulum, one on each side. They take turns to catch the tip of a long tooth and hold the wheel still." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "It hangs from a pin and carries the stops and the pallets. The shaft of the wheel passes through its long opening. Its length sets how quickly it swings." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 350, max: 420, step: 35, value: L0, unit: "",
      presets: [[350, "Short"], [385, "Medium"], [420, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [240, 115, 650], front: [0, 62, 700], side: [700, 62, 0] },
    target: [0, 62, 0],
    how: [
      "The wheel tries to turn clockwise. The tip of a long tooth is caught by a stop on the pendulum, so the wheel stands still. The face of the stop is part of a circle round the pin of the pendulum. So the stop can slide along the tip without moving the wheel.",
      "As the pendulum swings through the middle, the stop slides off the tip and the wheel is free. A short tooth near the hub runs into a pallet and pushes it the way the pendulum is already going. That push keeps the pendulum swinging. Then the short tooth slips past, and the next long tooth lands on the other stop. On the swing back the other pallet gets the push.",
      "The pendulum sets the pace. A long pendulum swings more slowly, so the beats come further apart. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The top of the pendulum, the bob, the back plate and the sizes were made up. The pendulum here is much shorter than a real one would be. Because of that the two stops are tilted, where the drawing shows them level, and the long teeth are bent forward at the end so that only their tips touch the stops. In the drawing the teeth are straight. The weight that turns the wheel is left out and its pull is taken to be steady. The teeth slide on the stops and pallets without rubbing, and only the pendulum and the wheel are slowed a little.",

    makeSim: makeSim, K: { H: H, opts: [350, 385, 420], pitch: 120 * RAD, perBeat: .5, maxd: 1.2, back: 1 * RAD },
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), mk = c.mat("wheel", "mark"), mp = c.mat("pend"), i;
      var o = this.o = { sim: makeSim(P) };
      for (i = 0; i < 20000; i++) o.sim.run(H, L0);                                   // run 5 seconds so it opens in its steady swing
      // wheel, in front of the pendulum plate (z -8..-2): short teeth z 0..5, long teeth z 7..11, hub z -0.5..11.5
      o.wheel = new T.Group(); scene.add(o.wheel);
      for (i = 0; i < 3; i++) {
        o.wheel.add(P.outlinePlate({ points: shortTooth(i), depth: i ? 5 : 5.6, z0: i ? 0 : -.3, material: i ? mw : mk }));      // the red pair is a little thicker
        o.wheel.add(P.outlinePlate({ points: longTooth(i), depth: i ? 4 : 4.6, z0: i ? 7 : 6.7, material: i ? mw : mk }));
      }
      P.at(P.cylZ(12, 12, mw), 0, 0, 5.5, o.wheel);                                   // hub z -0.5..11.5
      P.at(P.cylZ(5, 2, c.mat("wheel", "dark")), 0, 0, 12.5, o.wheel);                // cap z 11.5..13.5, on the hub
      P.at(P.cylZ(4, 29.5, c.fixed), 0, 0, -15.25, scene);                            // shaft z -30..-0.5, from the back plate through the opening to the back of the hub
      // pendulum: everything hangs from the pin at (0, L); positions below are measured from the pin
      o.pend = new T.Group(); o.pend.position.set(0, L, 0); scene.add(o.pend);
      function local(p) { return p.map(function (q) { return [q[0], q[1] - L]; }); }
      o.pend.add(P.outlinePlate({ points: local(flaskOutline()), holes: [local(openingOutline())], depth: 6, z0: -8, material: mp }));   // plate z -8..-2
      o.pend.add(P.outlinePlate({ points: local(palletTop()), depth: 7, z0: -2, material: c.mat("pallet") }));      // pallets z -2..5: on the face of the plate, as far forward as the short teeth
      o.pend.add(P.outlinePlate({ points: local(palletBottom()), depth: 7, z0: -2, material: c.mat("pallet") }));
      o.pend.add(P.outlinePlate({ points: local(stopLeft()), depth: 13, z0: -2, material: c.mat("stop") }));        // stops z -2..11: on the face of the plate, as far forward as the long teeth
      o.pend.add(P.outlinePlate({ points: local(stopRight()), depth: 13, z0: -2, material: c.mat("stop") }));
      P.at(P.cylZ(12, 3, mp), 0, 0, -.5, o.pend);                                     // boss z -2..1 on the face of the plate
      P.at(P.cylZ(5, 22, c.fixed), 0, L, -19, scene);                                 // pin z -30..-8, back plate face to the back of the pendulum
      o.rod = P.at(P.box(6, 1, 4, mp), 0, 0, -5, o.pend);                             // rod z -7..-3, from just inside the bottom edge of the plate down to the bob; length set each frame
      o.bob = P.at(P.cylZ(20, 8, mp), 0, 0, -5, o.pend);                              // bob z -9..-1
      // back plate and base
      P.at(P.box(310, 500, 6, c.fixed), 0, 50, -33, scene);                           // plate x -155..155, y -200..300, z -36..-30
      P.at(P.box(330, 12, 100, c.fixed), 0, -206, -10, scene);                        // base y -212..-200, z -60..40; the plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0, b = sim.bodies;
      for (var i = 0; i < n; i++) sim.run(H, l);
      o.wheel.rotation.z = b[0].a; o.pend.rotation.z = b[1].a;
      var top = -53 - L, len = l - (L + 53);                                          // rod from 1 inside the bottom edge of the plate (y -54) to the middle of the bob
      o.rod.scale.y = len; o.rod.position.y = top - len / 2; o.bob.position.y = -l;
      var bt = sim.beats, per = bt.length > 2 ? (bt[bt.length - 1] - bt[0]) / (bt.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + (sim.amp * 180 / Math.PI).toFixed(1) + "°");
    }
  });
})();
