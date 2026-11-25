M507.define({
  number: 55,
  title: "Two speeds from one pinion",
  lede: "One small gear turns two bigger gears that share the same centre. One turns one way, the other turns the other way, and each at its own speed. So one drive can give two speeds at once.",
  alt: "A big ring with teeth on its inside edge. In its centre sits an ordinary gear on the same axis. A small gear with a crank sits between them on the left, its teeth locked into both. A dark stripe marks the centre gear and a red stripe marks the ring.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Pinion", note: "The small driving gear, turned by the crank. It stays in one place and touches both other gears at once." },
    { key: "driven", color: "#C8873A", name: "Inner gear", note: "An ordinary gear in the middle, pushed by the outside of the pinion. Watch the dark stripe. It turns the opposite way to the pinion." },
    { key: "ring", color: "#4FA58A", name: "Ring", note: "A big ring with its teeth on the inside, pushed by the other side of the pinion. Watch the red stripe. It turns the same way as the pinion, but slowly." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the pinion. In a real machine an engine would do this." }
  ],
  controls: [{ id: "size", label: "Inner gear", value: "mid", options: [["small", "Small"], ["mid", "Medium"], ["big", "Big"]] }],
  readouts: [{ id: "in", label: "Pinion" }, { id: "a", label: "Inner gear" }, { id: "c", label: "Ring" }],
  views: { "3d": [331, 190, 710], front: [0, 0, 820], side: [800, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Turn the crank and the small gear, called a pinion, turns. Its teeth reach the inner gear on one side and the ring on the other. Both start to turn, but in opposite ways. A minus sign in the readout means the other way.",
    "The inner gear touches the outside of the pinion, so it turns against it, like any two gears side by side. The ring wraps round the pinion, so it is carried the same way. The ring has many more teeth than the inner gear, so it turns much more slowly.",
    "Try Small, then Medium, then Big. The ring stays the same and turns at almost the same speed. The inner gear slows down a lot as it grows. Watch the two stripes."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the three gears. The crank, the plate, the post that holds the pinion, the spokes of the ring and its hollow shaft, the sizes and the number of teeth were made up. The choice of inner gear size was added to show how it sets the speeds.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, NC = 40;
    var o = this.o = { a: 0, NC: NC, sets: {} };
    // ring at the origin, z -8..8, with spokes z -13..-8 and a hollow shaft z -30..-13 to the plate
    o.ring = new T.Group(); scene.add(o.ring);
    var ring = P.internalGear({ teeth: NC, module: MD, rim: 12, material: c.mat("ring") }); o.ring.add(ring);
    var Ro = ring.outerRadius, rt = ring.pitchRadius - MD;                    // Ro 139.5, tooth tips at 114
    P.at(P.cylZ(22, 5, c.mat("ring")), 0, 0, -10.5, o.ring);                  // back hub z -13..-8
    [0, 1, 2].forEach(function (i) {                                          // three spokes z -13..-8, r 0..Ro-3, touching the ring's back face
      var sp = P.box(Ro - 3, 12, 5, c.mat("ring")), g = new T.Group();
      sp.position.set((Ro - 3) / 2, 0, -10.5); g.add(sp); g.rotation.z = Math.PI / 6 + i * 2 * Math.PI / 3; o.ring.add(g);
    });
    P.at(P.cylZ(14, 17, c.mat("ring")), 0, 0, -21.5, o.ring);                 // hollow shaft z -30..-13, plate face to the hub
    P.at(P.box(Ro - 2 - (rt + 2), 3.5, 1, c.mat("ring", "mark")), (Ro + rt) / 2, 0, 9, o.ring);   // stripe on tooth 0, x 116..137.5, z 8.5..9.5
    o.ringPitchR = ring.pitchRadius;

    // inner gear and pinion sets; teeth: inner + 2 * pinion = ring
    [["small", 12, 14], ["mid", 20, 10], ["big", 24, 8]].forEach(function (s) {
      var set = { NA: s[1], NB: s[2] };
      // inner gear z -7..7, 1 clear of the ring's spokes; its shaft runs inside the ring's hollow shaft
      set.ga = new T.Group(); scene.add(set.ga);
      var ga = P.spurGear({ teeth: s[1], module: MD, width: 14, material: c.mat("driven") }); set.ga.add(ga);
      P.at(P.cylZ(6, 1, c.mat("driven")), 0, 0, -7.5, set.ga);               // shaft stub z -8..-7, ring hub to gear
      P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 9, set.ga);                 // hub z 7..11, on the gear face
      var rf = ga.pitchRadius - 1.25 * MD;
      P.at(P.box(rf - 14, 5, 1, c.mat("driven", "dark")), 11 + (rf - 14) / 2, 0, 8, set.ga);   // stripe x 11..rf-3, z 7.5..8.5
      // pinion z -7..7 on a shaft held from the front; crank arm z 10..16, handle z 16..28
      var px = -(ring.pitchRadius - s[2] * MD / 2);                         // ring pitch radius minus pinion pitch radius
      set.gp = new T.Group(); set.gp.position.x = px; scene.add(set.gp);
      var gp = P.spurGear({ teeth: s[2], module: MD, width: 14, material: c.mat("drive") }); set.gp.add(gp);
      P.at(P.cylZ(6, 37, c.mat("drive")), 0, 0, 11.5, set.gp);               // shaft z -7..30, gear back face to post face
      P.at(P.cylZ(11, 3, c.mat("drive")), 0, 0, 8.5, set.gp);                // hub z 7..10, on the gear face
      P.at(P.box(52, 12, 6, c.mat("crank")), 22, 0, 13, set.gp);             // arm x -4..48, z 10..16, on the hub
      P.at(P.cylZ(5, 12, c.mat("crank")), 44, 0, 22, set.gp);                // handle z 16..28, on the arm face, clear of the post
      set.post = P.at(P.box(16, 180, 10, c.fixed), px, -80, 35, scene);      // post x px±8, y -170..10, z 30..40; stands on the base
      set.pitchA = ga.pitch; set.pitchB = gp.pitch;
      o.sets[s[0]] = set;
    });

    // supports
    P.at(P.box(340, 340, 10, c.fixed), 0, 0, -35, scene);                     // plate x -170..170, y -170..170, z -40..-30; hollow shaft ends at z -30
    P.at(P.box(380, 12, 130, c.fixed), 0, -176, -15, scene);                  // base x -190..190, y -182..-170, z -80..50; plate and post stand on y -170
  },

  step: function (c, dt, S) {
    var o = this.o, k, cur = o.sets[S.controls.size] || o.sets.mid, s;
    o.a += S.w * dt;
    for (k in o.sets) { s = o.sets[k]; s.ga.visible = s.gp.visible = s.post.visible = s === cur; }
    // the pinion has a gap at angles 0 and 180, where the inner gear and the ring each have a tooth
    cur.gp.rotation.z = o.a + cur.pitchB / 2;
    cur.ga.rotation.z = -o.a * cur.NB / cur.NA;            // opposite way, speed in inverse ratio of teeth
    o.ring.rotation.z = o.a * cur.NB / o.NC;               // same way, speed in inverse ratio of teeth
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("a", f(rpm === 0 ? 0 : -rpm * cur.NB / cur.NA));
    S.set("c", f(rpm * cur.NB / o.NC));
  }
});
