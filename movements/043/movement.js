M507.define({
  number: 43,
  title: "Skew bevel gears",
  lede: "Two cone-shaped gears join shafts that cross at an angle but do not meet. One shaft passes under the other. The teeth are cut on a slant across each gear, so they can still fit together.",
  alt: "A big cone-shaped gear on a level shaft meshes with a small one on a second level shaft that passes underneath at a right angle. The teeth of both gears slant instead of pointing at the middle. Each shaft is held between two posts. One tooth of the big gear is red.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Big gear", note: "On the upper shaft. It does the driving. Its teeth slant across the cone instead of pointing at the middle." },
    { key: "driven", color: "#C8873A", name: "Small gear", note: "On the lower shaft, which passes under the upper one. It has half as many teeth, so it turns twice as fast. One tooth is dark so you can count its turns." },
    { key: "tooth", color: "#C2503F", name: "Marked tooth", note: "One tooth of the big gear painted red. Watch it meet the small gear once in every turn." }
  ],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [500, 300, 520], front: [0, 10, 760], side: [760, 10, 0] },
  target: [0, 10, 0],
  how: [
    "The big gear turns on the upper shaft. The small gear sits on the lower shaft, which passes underneath and points a different way. If the two shafts met, ordinary bevel gears would do the job. Here they miss each other, so the teeth have to be different.",
    "Look at the teeth. They do not point at the middle of the gear. They slant past it. Where the two gears meet, a tooth of one lies along a gap of the other. As they turn, the teeth push and also slide along each other. Gears like this are called skew bevel gears.",
    "The small gear has half as many teeth, so it turns twice for each turn of the big one. Watch the red tooth and the dark tooth. They meet again only after the small gear has gone round twice."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows a big and a small gear on two shafts that pass each other. The posts, the base, the sizes, the right angle between the shafts and the number of teeth were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = 180 / Math.PI, N1 = 32, N2 = 16, A1 = 40, A2 = 10;
    var o = this.o = { a: 0, r: N1 / N2 };
    // Shafts at a right angle, A1 + A2 = 50 apart. tan(lean of large gear) = N1 / N2, and A1 / A2 = tan(lean1) / tan(lean2) = 4,
    // so the two gears touch along one straight line through the origin.
    var lean1 = Math.atan2(N1, N2) * D, all = new T.Group(); all.rotation.y = Math.PI; scene.add(all);   // half turn so the small gear faces the viewer
    function holder(x, y, z, pos) {
      var h = new T.Group(); h.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(x[0], x[1], x[2]), new T.Vector3(y[0], y[1], y[2]), new T.Vector3(z[0], z[1], z[2])));
      h.position.set(0, pos, 0); all.add(h);
      var spin = new T.Group(); h.add(spin); return spin;
    }
    o.g1 = holder([0, -1, 0], [0, 0, -1], [1, 0, 0], A1);       // large gear's shaft: level, along X, at y 40
    o.g1.add(P.skewBevelGear({ throat: A1, angle: lean1, from: 70, to: 130, teeth: N1, material: c.mat("drive"), mark: c.mat("tooth") }));
    P.at(P.cylZ(8, 300, c.mat("drive")), 0, 0, 0, o.g1);        // shaft x -150..150, ends at the post faces
    o.g2 = holder([0, 1, 0], [1, 0, 0], [0, 0, -1], -A2);       // small gear's shaft: level, along Z, at y -10
    o.g2.add(o.pinion = P.skewBevelGear({ throat: A2, angle: 90 - lean1, from: 70, to: 130, teeth: N2, material: c.mat("driven"), mark: c.mat("driven", "dark") }));
    P.at(P.cylZ(8, 300, c.mat("driven")), 0, 0, 0, o.g2);       // shaft z -150..150, ends at the post faces
    // supports
    [-1, 1].forEach(function (sd) {
      P.at(P.box(16, 160, 36, c.fixed), sd * 158, -20, 0, scene);   // posts x 150..166, y -100..60, z -18..18; upper shaft ends at x 150
      P.at(P.box(36, 110, 16, c.fixed), 0, -45, sd * 158, scene);   // posts z 150..166, y -100..10, x -18..18; lower shaft ends at z 150
    });
    P.at(P.box(370, 12, 370, c.fixed), 0, -106, 0, scene);          // base x,z -185..185, y -112..-100; posts stand on y -100
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.a += S.w * dt;
    o.g1.rotation.z = o.a;
    o.g2.rotation.z = -o.a * o.r + o.pinion.pitch / 2;  // speed in inverse ratio of teeth, half a tooth offset to mesh
    function f(v) { return Math.round(v * 10) / 10 + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm * o.r));
  }
});
