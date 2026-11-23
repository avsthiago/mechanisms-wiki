M507.define({
  number: 24,
  title: "Spur gears",
  lede: "Two gears pass turning from one shaft to the next. The teeth lock together, so they cannot slip. By changing the size of one gear you can make the second shaft turn faster or slower.",
  alt: "Two flat gears side by side, their teeth locked together. Each turns on a short shaft sticking out of an upright plate. A crank turns the left gear, and a red stripe marks the right gear.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "Fixed to the crank's shaft. One turn of the crank turns it once." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "Its teeth fit into the gaps of the driving gear. Watch the red stripe to count its turns." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the driving gear. In a real machine an engine or a water wheel would do this." }
  ],
  controls: [{ id: "size", label: "Driven gear", value: "brown", options: [["brown", "A little bigger"], ["same", "Same size"], ["big", "Twice as big"], ["small", "Half as big"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [240, 135, 510], front: [30, 0, 720], side: [720, 0, 0] },
  target: [30, 0, 0],
  how: [
    "Turn the crank and the left gear turns with it. Its teeth push on the teeth of the right gear, so that gear turns too. The two gears always turn opposite ways. A minus sign in the readout means the other way.",
    "Each tooth of the driving gear pushes one tooth of the driven gear past the meeting point. So a driven gear with twice as many teeth needs two turns of the driving gear to go round once. It turns at half the speed, but it can push twice as hard.",
    "Try Same size, then Twice as big, then Half as big. Watch the red stripe and count how often it goes round."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two gears. The crank, the plate that holds the shafts, the sizes and the number of teeth were made up. The choice of gear size was added to show what it changes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N1 = 20, XD = -90;
    var o = this.o = { a: 0, N1: N1, sets: {} };
    // driving gear and crank: gear z -8..8, shaft z -30..30 (starts at the plate face), crank arm z 30..36, handle z 36..60
    o.g1 = new T.Group(); o.g1.position.set(XD, 0, 0); scene.add(o.g1);
    var g1 = P.spurGear({ teeth: N1, module: MD, material: c.mat("drive") }); o.g1.add(g1);
    P.at(P.cylZ(6, 60, c.mat("drive")), 0, 0, 0, o.g1);                       // shaft z -30..30
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 10, o.g1);                      // hub z 8..12, on the gear face
    P.at(P.box(52, 12, 6, c.mat("crank")), 22, 0, 33, o.g1);                  // arm x -4..48, z 30..36, on the shaft end
    P.at(P.cylZ(5, 24, c.mat("crank")), 44, 0, 48, o.g1);                     // handle z 36..60, on the arm face
    // driven gears: one for each size, only one shown at a time
    [["brown", 26], ["same", 20], ["big", 40], ["small", 10]].forEach(function (s) {
      var g = new T.Group(), gear = P.spurGear({ teeth: s[1], module: MD, material: c.mat("driven") });
      g.add(gear);
      g.position.set(XD + g1.pitchRadius + gear.pitchRadius, 0, 0); scene.add(g);   // centres a sum of pitch radii apart
      P.at(P.cylZ(6, 38, c.mat("driven")), 0, 0, -11, g);                     // shaft z -30..8, plate face to gear face
      P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 10, g);                      // hub z 8..12, on the gear face
      var rf = gear.pitchRadius - 1.25 * MD;
      P.at(P.box(rf - 14, 5, 1, c.mat("driven", "mark")), 11 + (rf - 14) / 2, 0, 9, g);   // red stripe x 11..rf-3, z 8.5..9.5, lifted off the face
      o.sets[s[0]] = { g: g, N: s[1], pitch: gear.pitch };
    });
    // supports
    P.at(P.box(410, 300, 10, c.fixed), 30, 0, -35, scene);                    // plate x -175..235, y -150..150, z -40..-30; shafts end at z -30
    P.at(P.box(450, 12, 100, c.fixed), 30, -156, -30, scene);                 // base x -195..255, y -162..-150, z -80..20; plate stands on y -150
  },

  step: function (c, dt, S) {
    var o = this.o, k, cur = o.sets[S.controls.size] || o.sets.brown, r = o.N1 / cur.N;
    o.a += S.w * dt;
    for (k in o.sets) o.sets[k].g.visible = o.sets[k] === cur;
    o.g1.rotation.z = o.a;
    cur.g.rotation.z = -o.a * r + cur.pitch / 2;           // opposite way, speed in inverse ratio of teeth, half a tooth offset to mesh
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : -rpm * r));
  }
});
