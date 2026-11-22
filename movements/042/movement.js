M507.define({
  number: 42,
  title: "Slanting gears on crossed shafts",
  lede: "Two gears pass turning between shafts that cross at an angle, one above the other. The upper gear has slanting teeth. The slant lines its teeth up with the teeth of the gear below, even though the two shafts point different ways.",
  alt: "A gear with slanting teeth on a level shaft, seen edge on, rests on top of a gear with straight teeth. The lower gear's shaft is also level but points off at an angle, so more of its side is seen. Each shaft is held between two posts. One tooth of the upper gear is red.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "The upper gear. Its teeth are cut on a slant, like part of a screw thread." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "The lower gear, on a shaft that points a different way. Its teeth lie in line with the slanting teeth where the two meet." },
    { key: "tooth", color: "#C2503F", name: "Marked tooth", note: "One slanting tooth painted red. Watch it come down and slide across the lower teeth." }
  ],
  controls: [{ id: "angle", label: "Shafts cross at", value: "half", options: [["half", "Half a right angle"], ["right", "A right angle"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [340, 200, 680], front: [0, -16, 780], side: [780, -16, 0] },
  target: [0, -16, 0],
  how: [
    "The upper gear turns on a level shaft. Its teeth are cut on a slant. The gear below sits on a shaft that points a different way. Where the two meet, the slanting teeth lie in line with the lower teeth, so they fit together.",
    "As the upper gear turns, each slanting tooth pushes a lower tooth along and slides across it at the same time. The two only touch at a small spot, so this drive suits light loads. The rule is simple. The slant of the upper teeth plus the slant of the lower teeth equals the angle between the shafts.",
    "With the shafts at half a right angle the lower teeth are straight, so the upper slant does it all. Try A right angle. Now the lower gear has slanting teeth too, and the two slants add up to a right angle."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows a slanting-tooth gear above a straight-tooth gear on a shaft at an angle. The posts, the base, the sizes, the angles and the number of teeth were made up. The right-angle pair was added to show how the slants add up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MN = 6, H = 45, MT = MN / Math.cos(H * Math.PI / 180), N1 = 16, Y1 = 64, W = 36;
    var o = this.o = { a: 0, N1: N1, sets: {} };
    function dress(g, key, len) {
      P.at(P.cylZ(7, len, c.mat(key)), 0, 0, 0, g);                               // shaft, ends at the post faces
      [-1, 1].forEach(function (sd) { P.at(P.cylZ(14, 8, c.mat(key)), 0, 0, sd * 22, g); });   // collars 18..26 along the shaft, on the gear faces
    }
    // upper gear: left-handed, turning about world X (local Z along world X). Matching the normal tooth size MN needs module MN / cos(slant).
    o.g1 = new T.Group(); o.g1.position.set(0, Y1, 0); o.g1.rotation.set(0, Math.PI / 2, 0); scene.add(o.g1);
    var g1 = P.helicalGear({ teeth: N1, module: MT, width: W, helix: -H, material: c.mat("drive"), mark: c.mat("tooth") }); o.g1.add(g1);
    dress(o.g1, "drive", 240);                                                    // shaft x -120..120
    P.at(P.box(36, 5, 1, c.mat("drive", "dark")), 34, 0, 19, o.g1);               // stripe r 16..52, x 18.5..19.5, lifted off the face at 18
    [-1, 1].forEach(function (sd) { P.at(P.box(16, 244, 36, c.fixed), sd * 128, -38, 0, scene); });   // posts x 120..136, y -160..84, z -18..18; shaft ends at x 120
    // lower wheels: the angle between the shafts is the sum of the two slants (same hand)
    function lower(id, N2, mod, helix) {
      var beta = (H - helix) * Math.PI / 180, s = { g: new T.Group(), N: N2 };
      var gear = P.helicalGear({ teeth: N2, module: mod, width: W, helix: helix, material: c.mat("driven") });
      var y2 = Y1 - g1.pitchRadius - gear.pitchRadius;                            // centres a sum of pitch radii apart
      s.pitch = gear.pitch;
      s.spin = new T.Group(); s.spin.position.set(0, y2, 0); s.spin.rotation.set(0, Math.PI / 2 - beta, 0); s.g.add(s.spin);   // local Z along the lower shaft
      s.spin.add(gear); dress(s.spin, "driven", 220);                             // shaft -110..110 along its own line
      var rs = gear.pitchRadius - 1.25 * mod - 19;
      P.at(P.box(rs, 5, 1, c.mat("driven", "dark")), 16 + rs / 2, 0, 19, s.spin); // stripe on the face, lifted 0.5
      var posts = new T.Group(); posts.rotation.y = -beta; s.g.add(posts);       // local X along the lower shaft
      var top = y2 + 20;
      [-1, 1].forEach(function (sd) { P.at(P.box(16, top + 160, 36, c.fixed), sd * 118, (top - 160) / 2, 0, posts); });   // posts 110..126 along the shaft, y -160..top; shaft ends at 110
      scene.add(s.g); o.sets[id] = s;
    }
    lower("half", 20, MN, 0);            // straight teeth: shafts at 45 degrees
    lower("right", 16, MT, -H);          // slanting teeth of the same hand: shafts at 90 degrees
    P.at(P.box(320, 12, 300, c.fixed), 0, -166, 0, scene);                        // base x -160..160, y -172..-160, z -150..150; posts stand on y -160
  },

  step: function (c, dt, S) {
    var o = this.o, k, cur = o.sets[S.controls.angle] || o.sets.half, r = o.N1 / cur.N;
    o.a += S.w * dt;
    for (k in o.sets) o.sets[k].g.visible = o.sets[k] === cur;
    o.g1.rotation.z = o.a;
    cur.spin.rotation.z = -o.a * r + cur.pitch / 2;     // speed in inverse ratio of teeth, half a tooth offset to mesh
    function f(v) { return Math.round(v * 10) / 10 + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm * r));
  }
});
