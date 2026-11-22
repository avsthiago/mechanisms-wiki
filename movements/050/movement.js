M507.define({
  number: 50,
  title: "Double universal joint",
  lede: "Two universal joints with a short link between them carry turning round two bends. One joint alone makes the second shaft speed up and slow down in every turn. The second joint undoes that, so the last shaft turns as evenly as the first.",
  alt: "Two shafts slope down to left and right like a roof. Each widens into a fork of broad flat strap, open at the far end. Between them lies a flat link shaped like a pair of spectacles, its two rings open toward the shafts. A heavy flat cross with four broad ends is pinned inside each joint, at the tips of a shaft fork and a ring of the link. Each shaft ends in a small bearing on a post and carries a red pointer.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving shaft", note: "Turns at a steady speed. Its fork is pinned to two ends of the first cross. Watch its red pointer." },
    { key: "driven", color: "#C8873A", name: "Driven shaft", note: "Its fork is pinned to two ends of the second cross. Watch its red pointer and compare it with the one on the driving shaft." },
    { key: "link", color: "#D9B13B", name: "Middle link", note: "Two forks of flat strap made in one piece, like a pair of spectacles with the outer sides left open. It speeds up and slows down twice in every turn." },
    { key: "cross", color: "#8E7AA8", name: "Crosses", note: "Each cross is a flat piece with four broad ends. Two ends are pinned in the link and two in the fork of a shaft." }
  ],
  controls: [
    { type: "range", id: "bend", label: "Bend at each joint", min: 0, max: 45, step: 1, value: 40, unit: "°",
      presets: [[0, "Straight"], [20, "Bent a little"], [40, "As drawn"]] },
    { id: "twist", label: "Forks of the middle link", value: "line", options: [["line", "In line"], ["quarter", "Turned a quarter"]] }
  ],
  readouts: [{ id: "in", label: "Driving" }, { id: "mid", label: "Middle" }, { id: "out", label: "Driven" }],
  views: { "3d": [30, 260, 560], front: [0, -50, 760], side: [760, -50, 0] },
  target: [0, -50, 0],
  how: [
    "The left shaft turns the middle link through the first cross. The link turns the right shaft through the second cross. Each fork can rock on its pair of pins, so the line of shafts can bend at both joints.",
    "A bent joint does not pass turning on evenly. Watch the Middle readout. The link runs faster than the driving shaft twice in every turn, and slower twice. But the second joint is bent just as much, and it does the same thing backwards. Each time the link speeds up, the second joint slows the turning down again by the same amount. So the driven shaft turns evenly.",
    "This only works if the two forks of the link lie flat in line with each other. Try Turned a quarter and watch the Driven readout. Now the second joint adds to the swing and does not take it away. Then try Straight and As drawn with the forks in line."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two shaft ends, the middle link and the two crosses. The flat bars with a pin at each end across the front of his drawing are read here as arms of the crosses seen from the front. The bearings, posts and base, the red pointers and all the sizes were made up. The bend slider and the choice to turn one fork of the link a quarter were added to show why the forks are made in line.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, J = 85;                        // joint centres at x -85 and 85
    var o = this.o = { a: 0.5, J: J, V: function (x, y, z) { return new T.Vector3(x, y, z); } };
    // One shaft with its loop, in the loop's own frame: joint centre at the origin, shaft along -X, pin along Y.
    function shaft(key, x) {
      var g = new T.Group(); g.position.x = x; scene.add(g);
      g.add(P.hookeStrapFork({ back: 96, reach: 30, half: 44, thick: 8, width: 26, shaft: 9, neck: 24, flare: 2, open: true, material: c.mat(key) }));   // open yoke x -100..0, flare x -120..-88
      P.at(P.cylX(9, 50, c.mat(key)), -145, 0, 0, g);                         // shaft x -170..-120, meets the flare at -120
      P.at(P.cylX(13, 10, c.mat(key)), -165, 0, 0, g);                        // collar x -170..-160, against the bearing face
      P.at(P.box(4, 24, 4, c.mat(key, "mark")), -165, 24, 0, g);              // red pointer y 12..36, x -167..-163, inside the collar's width
      return g;
    }
    o.s1 = shaft("drive", -J); o.s3 = shaft("driven", J);
    var fk = o.s1.children[0], cx = { half: 44, tip: fk.inner - 1, headAt: fk.outer + 0.8, end: 20, waist: 6, thick: 12, pin: 2.8, head: 4.4, material: c.mat("cross") };
    o.c1 = P.at(P.hookeWaistCross(cx), -J, 0, 0, scene);                      // arm ends 1 short of the bosses' inner faces
    o.c2 = P.at(P.hookeWaistCross(cx), J, 0, 0, scene);
    // middle link, axis X: a loop round each joint centre and a short flat bridge between them, like spectacles
    o.link = new T.Group(); scene.add(o.link);
    var lk = { back: 76, reach: 30, half: 44, thick: 8, width: 26, pinch: 0, neck: 0, open: true, material: c.mat("link") };
    var ra = P.at(P.hookeStrapFork(lk), -J, 0, 0, o.link); ra.rotation.y = Math.PI;   // yoke open to the left, its back band x -13..-5
    o.rb = P.at(P.hookeStrapFork(lk), J, 0, 0, o.link);                       // yoke open to the right, back band x 5..13
    P.at(P.box(20, 22, 24.8, c.mat("link")), 0, 0, 0, o.link);                // bridge x -10..10, ends inside both bands; y -11..11, z -12.4..12.4, inside the band width of 26
    // supports: a small bearing on each shaft end, hung on a pin from a slim post that slides along the base
    o.t1 = new T.Group(); o.t2 = new T.Group(); o.t1.position.x = -J; o.t2.position.x = J; scene.add(o.t1); scene.add(o.t2);
    [[o.t1, -1], [o.t2, 1]].forEach(function (t) {
      P.at(P.box(22, 30, 24, c.fixed), 181 * t[1], 0, 0, t[0]);               // bearing x 170..192 from the joint, y -15..15, z -12..12; shaft ends at 170
      P.at(P.cylZ(5, 6, c.fixed), 181 * t[1], 0, -15, t[0]);                  // pivot pin z -18..-12, from the bearing's back face to the post
    });
    o.p1 = P.at(P.box(10, 1, 10, c.fixed), 0, 0, -23, scene);               // posts z -28..-18; height set each frame, bottom on the base top y -160
    o.p2 = P.at(P.box(10, 1, 10, c.fixed), 0, 0, -23, scene);
    P.at(P.box(500, 6, 24, c.fixed), 0, -163, -23, scene);                    // base x -250..250, y -166..-160, z -35..-11
  },

  // Two Hooke's joints in a row. At each joint the two pins are at right angles to each other and to their own shafts.
  solve: function (a, b, quarter) {
    var o = this.o, V = o.V, X = V(1, 0, 0), d1 = V(Math.cos(b), Math.sin(b), 0), d3 = V(Math.cos(b), -Math.sin(b), 0);
    var p1 = V(-d1.y * Math.cos(a), d1.x * Math.cos(a), Math.sin(a));        // driving pin, turned by a about the driving shaft
    var q1 = V(0, 0, 0).crossVectors(X, p1).normalize();                     // link's pin at the first joint
    var q2 = quarter ? V(0, 0, 0).crossVectors(X, q1) : q1.clone();          // link's pin at the second joint
    var p3 = V(0, 0, 0).crossVectors(d3, q2).normalize();                    // driven pin
    return { X: X, d1: d1, d3: d3, p1: p1, q1: q1, q2: q2, p3: p3,
      mid: Math.atan2(q1.z, q1.y), out: Math.atan2(p3.z, -d3.y * p3.x + d3.x * p3.y) };
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, b = S.controls.bend * Math.PI / 180, quarter = S.controls.twist === "quarter";
    o.a += S.w * dt;
    var k = this.solve(o.a, b, quarter), e = 1e-4, k2 = this.solve(o.a + e, b, quarter);
    function rate(x, y) { return Math.atan2(Math.sin(y - x), Math.cos(y - x)) / e; }   // speed over driving speed, right now
    P.frame(o.s1, k.d1, k.p1);
    P.frame(o.c1, k.p1, k.q1);
    P.frame(o.link, k.X, k.q1);
    o.rb.rotation.x = quarter ? Math.PI / 2 : 0;
    P.frame(o.c2, k.q2, k.p3);
    P.frame(o.s3, k.d3.clone().negate(), k.p3);
    o.t1.rotation.z = b; o.t2.rotation.z = -b;
    var px = o.J + 181 * Math.cos(b), top = -181 * Math.sin(b) + 9;          // pivot centre; post top 9 above it
    [o.p1, o.p2].forEach(function (p, i) { p.scale.y = top + 160; p.position.set(i ? px : -px, (top - 160) / 2, -23); });
    function f(v) { return (Math.round(v * 10) / 10).toFixed(1) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("mid", f(rpm * rate(k.mid, k2.mid)));
    S.set("out", f(rpm * rate(k.out, k2.out)));
  }
});
