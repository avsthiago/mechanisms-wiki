M507.define({
  number: 111,
  title: "Differential screw",
  lede: "A hollow screw turns in a fixed nut. A thinner screw with finer threads sits inside it and cannot turn. The block on the lower end of the thin screw creeps down by a tiny step for each turn of the handle. This gives very fine and very strong movement, as in a micrometer.",
  alt: "An upright thick screw with a cross handle on top turns in a fixed nut. A thinner screw with finer threads comes out of its lower end and carries a red block, held beside an upright post.",
  parts: [
    { key: "handle", color: "#5E7387", name: "Handle", note: "A cross bar with knobs, fixed to the hollow screw. Turn it and the hollow screw turns with it." },
    { key: "outer", color: "#C8873A", name: "Hollow screw", note: "A thick screw with a hole down its middle. Its outside thread runs in the fixed nut, so it moves down as it turns. The thinner screw is inside it." },
    { key: "inner", color: "#D9B13B", name: "Inner screw", note: "A thinner screw inside the hollow one. It cannot turn, so it is pulled along by the hollow screw, but it also slides back a little through it." },
    { key: "die", color: "#8E7AA8", name: "Die", note: "The block on the end of the inner screw. It slides along an upright post so it cannot turn. Watch how little it moves." }
  ],
  controls: [{ id: "inner", label: "Inner thread", value: "10", options: [["11", "Almost the same"], ["10", "Close"], ["8", "Different"], ["6", "Far apart"]] }],
  readouts: [{ id: "t", label: "Handle" }, { id: "o", label: "Hollow screw" }, { id: "d", label: "Die" }],
  views: { "3d": [380, 55, 520], front: [0, -45, 580], side: [580, -45, 0] },
  target: [0, -45, 0],
  distance: [200, 1100],
  how: [
    "Turn the handle. The hollow screw turns in the fixed nut and moves down, one step of its thread for each turn. The thin screw inside cannot turn, so it is carried along with it.",
    "But the thin screw is threaded into the hollow one. As the hollow screw turns, the thin screw is wound backwards through it, by one step of its own finer thread for each turn. The die moves down by the big step, then back up by the small step. What is left is the difference, which is tiny.",
    "A tiny movement for a full turn of the handle means the handle can push very hard. Try Almost the same, then Far apart. Watch the die and its reading."
  ],
  note: "This model is rebuilt from Brown's drawing. The nut and its post, the base, the guide for the die, the handle, the sizes and the thread spacings were made up. Both threads run the same way, because that is what makes the movement the difference of the two steps. The handle turns one way and back so the travel stays on the page. The thread inside the hollow screw is left out, and the part of the thin screw inside the hollow one is hidden. The four inner threads were added for comparison.",

  K: { PO: 12, TURNS: 3, LEN: 150, CY: 30 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { u: 0, d: 0, inners: {} };

    // outer assembly: thread y -45..105 at rest (centre CY = 30), moves down by PO per turn and spins about Y
    o.outer = new T.Group(); o.outer.position.y = K.CY; scene.add(o.outer);
    o.spin = new T.Group(); o.outer.add(o.spin);
    var h = new T.Group(); h.rotation.z = Math.PI / 2; o.spin.add(h);                         // axis X turned to Y
    P.at(P.worm({ radius: 22, pitch: K.PO, length: K.LEN, addendum: 3, dedendum: 4, material: c.mat("outer") }), 0, 0, 0, h);   // local y -75..75, tip r 25, root r 18
    P.at(P.cylY(14, 12, c.mat("handle")), 0, 81, 0, o.spin);                                  // hub y 75..87, on the screw's top end
    P.at(P.box(100, 8, 10, c.mat("handle")), 0, 81, 0, o.spin);                               // bar x -50..50, y 77..85
    P.at(P.box(40, .5, 6, c.mat("handle", "dark")), 25, 85.25, 0, o.spin);                    // dark stripe on the bar top, y 85..85.5
    [-1, 1].forEach(function (k) { P.at(P.cylY(6, 14, c.mat("handle")), k * 50, 81, 0, o.spin); });   // knobs y 74..88

    // inner screw and die: slide down by (PO - inner pitch) per turn, never spin
    o.inner = new T.Group(); scene.add(o.inner);
    [11, 10, 8, 6].forEach(function (p) {
      var g = new T.Group(); g.rotation.z = Math.PI / 2; g.position.y = -50.25; o.inner.add(g);
      P.at(P.worm({ radius: 11, pitch: p, length: 180.5, addendum: 2.5, dedendum: 3, material: c.mat("inner") }), 0, 0, 0, g);   // y -140.5..40, tip r 13.5, root r 8; foot sunk .5 into the die
      g.visible = false; o.inners[p] = g;
    });
    P.at(P.box(44, 36, 44, c.mat("die")), 0, -158, 0, o.inner);                                // die x -22..22, y -176..-140, z -22..22
    P.at(P.box(17.5, 20, 20, c.mat("die")), 30.75, -158, 0, o.inner);                          // tab x 22..39.5 reaching the post

    // fixed parts
    P.at(P.guideBlock({ w: 80, h: 40, d: 80, hole: 27, material: c.fixed }), 0, 20, 0, scene);   // nut x -40..40, y 0..40, z -40..40
    P.at(P.box(20, 230, 60, c.fixed), 50, -85, 0, scene);                                       // post x 40..60, y -200..30, z -30..30; die tab slides on x 40
    P.at(P.box(180, 12, 100, c.fixed), 10, -206, 0, scene);                                     // base x -80..100, y -212..-200, z -50..50; post stands on y -200
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, pi = +S.controls.inner || 10, k;
    if (S.playing) o.u += S.w * dt;
    var n = K.TURNS * (1 - Math.cos(o.u)) / 2;                      // handle turns so far
    var want = (K.PO - pi) * n;
    o.d += (want - o.d) * Math.min(1, dt * 8);                        // only eases when the control is changed
    if (Math.abs(want - o.d) < .01) o.d = want;
    for (k in o.inners) o.inners[k].visible = +k === pi;
    o.spin.rotation.y = -n * 2 * Math.PI;                             // right-hand thread: clockwise from above goes down
    o.outer.position.y = K.CY - K.PO * n;
    o.inner.position.y = -o.d;
    S.set("t", n.toFixed(1) + " turns");
    S.set("o", Math.round(K.PO * n) + " mm");
    S.set("d", o.d.toFixed(1) + " mm");
  }
});
