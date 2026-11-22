M507.define({
  number: 108,
  title: "Crossed-groove cylinder",
  lede: "A cylinder has two grooves that wind round it in opposite directions, so they cross each other. A small pointer rides in the groove and slides up and down a rod. The cylinder only ever turns one way, yet the pointer goes up and then comes back down at an even speed.",
  alt: "An upright cylinder between a top plate and a bottom plate, with dark grooves crossing over its surface in a pattern of diamonds. A gear sits under it. A rod at the left carries a sliding block with an arm that ends in a red pointer touching the cylinder.",
  parts: [
    { key: "cyl", color: "#5E7387", name: "Grooved cylinder", note: "The driving part. Its dark grooves wind both ways round it and join at the ends, so they make one long closed track. The gear under it turns it." },
    { key: "shoe", color: "#C2503F", name: "Pointer", note: "A pointed shoe that rides in the groove. Watch it: it is pushed up one way, then down the other way. It is long enough that it does not take the wrong turn where the grooves cross." },
    { key: "carriage", color: "#D9B13B", name: "Sliding block", note: "A block that slides along the upright rod and carries the pointer. It can only move straight up and down." }
  ],
  controls: [{ id: "turns", label: "Grooves", value: "3", options: [["2", "Wide apart"], ["3", "Medium"], ["4", "Close together"]] }],
  readouts: [{ id: "t", label: "Cylinder" }, { id: "s", label: "Pointer" }],
  views: { "3d": [260, 90, 400], front: [0, 0, 540], side: [520, 0, 0] },
  target: [-30, 0, 0],
  how: [
    "Watch the red pointer. It sits in a groove on the cylinder, and the block it is fixed to can only slide up and down the rod. As the cylinder turns, the groove pushes the pointer along.",
    "One groove winds up the cylinder like a screw thread. When it reaches the end, it curves round and winds back the other way. So the pointer is carried to the top, then back to the bottom, at the same even speed. Where the two grooves cross, the pointer keeps going straight on.",
    "The cylinder never changes direction. Try Wide apart, then Close together. Close grooves need more turns for each trip, so the pointer moves more slowly."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the rod, the sliding block, the gear and all the sizes were made up. Brown shows cut grooves. Here they are drawn as dark raised bands, with the pointer resting on them. The grooves have rounded corners at the ends so the pointer turns smoothly. The choice of how far apart the grooves are was added.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 40, HC = 100, L = 140, BR = 1.6;
    var o = this.o = { a: 0, n: 0, groups: {}, L: L, R: R };
    // smooth zig-zag: u in turns of a full up-and-down trip, result 0..1 with rounded ends
    var E = .05;
    o.prof = function (u) {
      var q = Math.abs(((u % 2) + 2) % 2 - 1);           // 1 at u = 0, 0 at u = 1
      q = 1 - q;
      if (q < E) q = q * q / (2 * E) + E / 2; else if (q > 1 - E) q = 1 - ((1 - q) * (1 - q) / (2 * E) + E / 2);
      return (q - E / 2) / (1 - E);
    };
    // cylinder turning about Y, y -100..100
    o.cyl = new T.Group(); scene.add(o.cyl);
    P.at(P.cylY(R, 2 * HC, c.mat("cyl")), 0, 0, 0, o.cyl);                          // y -100..100
    P.at(P.cylY(8, 240, c.mat("cyl")), 0, 0, 0, o.cyl);                             // shaft y -120..120, plate face to plate face
    var gear = P.spurGear({ teeth: 24, module: 4, width: 11.5, material: c.mat("cyl") });
    gear.rotation.x = Math.PI / 2; P.at(gear, 0, -106.25, 0, o.cyl);                // gear y -112..-100.5, ra 52
    P.at(P.box(28, 1, 4, c.mat("cyl", "dark")), 24, 100.75, 0, o.cyl);              // turning mark on the top face, y 100.25..101.25, x 10..38
    [2, 3, 4].forEach(function (N) {
      var g = new T.Group(), pts = [], i, n = N * 80, f, y; o.cyl.add(g);
      for (i = 0; i <= 2 * n; i++) {
        f = 4 * Math.PI * N * i / (2 * n);                // two trips: 4 pi N of turning
        y = L * o.prof((f - Math.PI) / (2 * Math.PI * N)) - L / 2;
        pts.push(new T.Vector3(R * Math.cos(f), y, R * Math.sin(f)));
      }
      var geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 2 * n * 2, BR, 6, false);
      g.add(new T.Mesh(geo, c.mat("cyl", "dark")));       // band centre on the surface, top at r 41.6
      o.groups[N] = g;
    });

    // guide rod, carriage, pointer
    o.slide = new T.Group(); scene.add(o.slide);
    P.at(P.guideBlock({ w: 24, h: 30, d: 24, hole: 5.5, material: c.mat("carriage") }), -115, 0, 0, o.slide);   // x -127..-103, hole round the rod
    P.at(P.box(43, 8, 8, c.mat("carriage")), -81.5, 0, 0, o.slide);                 // arm x -103..-60, on the block face
    var sh = new T.Shape();
    sh.moveTo(-60, -4); sh.lineTo(-60, 4); sh.lineTo(-52, 7); sh.lineTo(-41.2, 7); sh.lineTo(-41.2, -7); sh.lineTo(-52, -7); sh.closePath();
    var sg = new T.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false }); sg.translate(0, 0, -3);
    o.slide.add(new T.Mesh(sg, c.mat("shoe", "mark")));                             // shoe x -60..-41.2, y -7..7, z -3..3; tip 0.4 into the band
    P.at(P.cylY(5, 240, c.fixed), -115, 0, 0, scene);                               // rod y -120..120, x -120..-110, plate face to plate face

    // frame
    P.at(P.box(210, 10, 60, c.fixed), -35, 125, 0, scene);                          // top plate x -140..70, y 120..130, z -30..30
    P.at(P.box(210, 10, 60, c.fixed), -35, -125, 0, scene);                         // bottom plate x -140..70, y -130..-120
  },

  step: function (c, dt, S) {
    var o = this.o, N = +S.controls.turns || 3;
    if (o.n !== N) { o.n = N; o.a = Math.PI * N; for (var k in o.groups) o.groups[k].visible = +k === N; }   // start half way up the stroke
    o.a += S.w * dt;
    o.cyl.rotation.y = o.a;
    var y = o.L * o.prof((o.a) / (2 * Math.PI * N)) - o.L / 2;                      // groove at world angle pi is local angle pi + a
    o.slide.position.y = y;
    S.set("t", ((o.a - Math.PI * N) / (2 * Math.PI)).toFixed(1) + " turns");
    S.set("s", Math.round(y + o.L / 2) + " mm");
  }
});
