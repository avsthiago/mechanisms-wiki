M507.define({
  number: 51,
  title: "Universal joint",
  lede: "A universal joint lets one shaft turn another that meets it at an angle. Each shaft ends in a fork of heavy flat strap, open at the far side. A cross pinned between the two forks joins them, so the turning goes round the bend.",
  alt: "Two shafts slope down to left and right like a shallow roof. Each widens into a fork of broad flat strap that curves round like an oval but stays open at the far end. The two forks reach past each other, and a heavy flat cross with four broad ends is pinned between them at the tips of the forks. Each shaft ends in a small bearing on a post and carries a red pointer.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving shaft", note: "Turns at a steady speed. Its fork is pinned to two ends of the cross. Watch its red pointer." },
    { key: "driven", color: "#C8873A", name: "Driven shaft", note: "Its fork is pinned to the other two ends of the cross. Watch its red pointer run ahead and fall back when the joint is bent." },
    { key: "cross", color: "#D9B13B", name: "Cross", note: "A flat piece with four arms, narrow in the middle and broad at the ends. Two ends are pinned in each fork, so the forks can tilt against each other and still turn together." }
  ],
  controls: [{ type: "range", id: "bend", label: "Bend between the shafts", min: 0, max: 45, step: 1, value: 40, unit: "°",
    presets: [[0, "Straight"], [20, "Bent a little"], [40, "As drawn"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [30, 220, 500], front: [0, -30, 720], side: [720, -30, 0] },
  target: [0, -30, 0],
  how: [
    "The left shaft turns, and its fork carries two ends of the cross round with it. The other two ends are pinned in the fork of the right shaft, so that shaft has to turn too. Each fork can rock on its own pair of pins. The open side of each fork leaves room for the other fork to swing past. That is what lets the two shafts meet at an angle.",
    "When the shafts lie in one straight line, both turn at the same speed. When they are bent, the driven shaft still makes one turn for each turn of the driving shaft, but not evenly. Twice in every turn it runs faster than the driving shaft, and twice it runs slower. The cross has to wobble as it goes round, and the wobble pushes the driven shaft ahead and then lets it fall back.",
    "Try Straight, then Bent a little, then As drawn. Watch the Driven readout and the two red pointers. The more the joint is bent, the more the speed swings."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two shaft ends, their forks and the cross. The bearings, posts and base, the red pointers and all the sizes were made up. The bend slider was added to show what the angle changes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { a: 0.55, V: function (x, y, z) { return new T.Vector3(x, y, z); } };
    // One shaft with its loop, in the loop's own frame: joint centre at the origin, shaft along -X, pin along Y.
    function FK(m) { return { back: 96, reach: 30, half: 44, thick: 8, width: 26, shaft: 9, neck: 24, flare: 2, open: true, material: m }; }
    function shaft(key) {
      var g = new T.Group(); scene.add(g);
      g.add(P.hookeStrapFork(FK(c.mat(key))));                      // open yoke x -100..0, bosses at y +-44; flare x -120..-88
      P.at(P.cylX(9, 70, c.mat(key)), -155, 0, 0, g);                         // shaft x -190..-120, meets the flare at -120
      P.at(P.cylX(13, 10, c.mat(key)), -185, 0, 0, g);                        // collar x -190..-180, against the bearing face
      P.at(P.box(4, 24, 4, c.mat(key, "mark")), -185, 24, 0, g);              // red pointer y 12..36, x -187..-183, inside the collar's width
      return g;
    }
    o.s1 = shaft("drive"); o.s2 = shaft("driven");
    var fk = o.s1.children[0];                                                 // bosses' faces at +-38 and +-50 from the centre
    o.cross = P.hookeWaistCross({ half: 44, tip: fk.inner - 1, headAt: fk.outer + 0.8, end: 20, waist: 6, thick: 12, pin: 2.8, head: 4.4, material: c.mat("cross") });
    scene.add(o.cross);
    // supports: a small bearing on each shaft end, hung on a pin from a slim post that slides along the base
    o.t1 = new T.Group(); o.t2 = new T.Group(); scene.add(o.t1); scene.add(o.t2);
    [[o.t1, -1], [o.t2, 1]].forEach(function (t) {
      P.at(P.box(22, 30, 24, c.fixed), 201 * t[1], 0, 0, t[0]);               // bearing x 190..212 from the joint, y -15..15, z -12..12; shaft ends at 190
      P.at(P.cylZ(5, 6, c.fixed), 201 * t[1], 0, -15, t[0]);                  // pivot pin z -18..-12, from the bearing's back face to the post
    });
    o.p1 = P.at(P.box(10, 1, 10, c.fixed), 0, 0, -23, scene);               // posts z -28..-18; height set each frame, bottom on the base top y -130
    o.p2 = P.at(P.box(10, 1, 10, c.fixed), 0, 0, -23, scene);
    P.at(P.box(460, 6, 24, c.fixed), 0, -133, -23, scene);                    // base x -230..230, y -136..-130, z -35..-11
  },

  // Hooke's joint: the driven pin is at right angles to both the driving pin and the driven shaft.
  solve: function (a, h) {
    var o = this.o, V = o.V, d1 = V(Math.cos(h), Math.sin(h), 0), d2 = V(Math.cos(h), -Math.sin(h), 0);
    var p1 = V(-d1.y * Math.cos(a), d1.x * Math.cos(a), Math.sin(a));        // driving pin, turned by a about the driving shaft
    var p2 = V(0, 0, 0).crossVectors(d2, p1).normalize();                    // driven pin
    return { d1: d1, d2: d2, p1: p1, p2: p2, out: Math.atan2(p2.z, -d2.y * p2.x + d2.x * p2.y) };
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, h = S.controls.bend * Math.PI / 360;            // each shaft droops by half the bend
    o.a += S.w * dt;
    var k = this.solve(o.a, h), e = 1e-4, k2 = this.solve(o.a + e, h);
    var r = Math.atan2(Math.sin(k2.out - k.out), Math.cos(k2.out - k.out)) / e;   // driven speed over driving speed, right now
    P.frame(o.s1, k.d1, k.p1);
    P.frame(o.cross, k.p1, k.p2);
    P.frame(o.s2, k.d2.clone().negate(), k.p2);
    o.t1.rotation.z = h; o.t2.rotation.z = -h;
    var px = 201 * Math.cos(h), py = -201 * Math.sin(h), top = py + 9;       // pivot centre; post top 9 above it
    [o.p1, o.p2].forEach(function (p, i) { p.scale.y = top + 130; p.position.set(i ? px : -px, (top - 130) / 2, -23); });
    function f(v) { return (Math.round(v * 10) / 10).toFixed(1) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm * r));
  }
});
