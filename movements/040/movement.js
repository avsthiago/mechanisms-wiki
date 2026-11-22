M507.define({
  number: 40,
  title: "Herringbone gears",
  lede: "Two gears with V-shaped teeth pass turning from one shaft to the next. Each tooth slides into its partner a little at a time, so the gears run smoothly. The two halves of the V push sideways against each other, so the gears stay in place on their shafts.",
  alt: "Two equal gears seen edge on, one above the other on level shafts held between two posts. Their teeth make V shapes across the rims and lock together where the gears meet. One tooth of the upper gear is red.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "The upper gear. Each tooth slants one way to the middle of the rim, then back the other way, making a V." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "The lower gear. Its V teeth fit into the gaps between the V teeth of the upper gear." },
    { key: "tooth", color: "#C2503F", name: "Marked tooth", note: "One tooth painted red. Watch it pass through the place where the gears meet." }
  ],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [300, 135, 470], front: [0, -10, 740], side: [640, -20, 0] },
  target: [0, -20, 0],
  how: [
    "The upper gear turns and its teeth push the lower gear round the other way. Both gears are the same size, so they turn at the same speed. A minus sign in the readout means the other way.",
    "Look at where the gears meet. The point of each V goes in first. The touching spots then slide outwards along both arms of the V. Before that tooth lets go, the point of the next one has already started. So some tooth is always carrying the push, and the gears run quietly.",
    "A slanting tooth also pushes its gear sideways along the shaft. Here one arm of the V pushes to the left and the other pushes to the right, so the two pushes cancel. Follow the red tooth round and see how it lines up with the lower teeth as it meets them. The name comes from the bones of a herring, which make the same pattern."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two gears on their shafts. The posts, the base, the sizes, the amount of slant and the number of teeth were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N = 20, W = 44, R = N * MD / 2;
    var o = this.o = { a: 0, pitch: 2 * Math.PI / N };
    // each gear turns about world X: the group's local Z points along world X. Gear x -22..22.
    function wheel(key, y, hand, mark) {
      var g = new T.Group(); g.position.set(0, y, 0); g.rotation.set(0, Math.PI / 2, 0); scene.add(g);
      g.add(P.helicalGear({ teeth: N, module: MD, width: W, helix: 40 * hand, herringbone: true, material: c.mat(key), mark: mark }));
      P.at(P.cylZ(7, 180, c.mat(key)), 0, 0, 0, g);                               // shaft x -90..90, ends at the post faces
      [-1, 1].forEach(function (sd) { P.at(P.cylZ(14, 8, c.mat(key)), 0, 0, sd * 26, g); });   // collars x 22..30 and -30..-22, on the gear faces
      P.at(P.box(34, 5, 1, c.mat(key, "dark")), 32, 0, 23, g);                    // stripe r 15..49, x 22.5..23.5, lifted off the face at 22
      return g;
    }
    o.g1 = wheel("drive", R, 1, c.mat("tooth"));        // centres 2R apart: the sum of the pitch radii
    o.g2 = wheel("driven", -R, -1, null);               // V the other way up, so the teeth agree where the gears meet
    // supports
    [-1, 1].forEach(function (sd) { P.at(P.box(16, 230, 40, c.fixed), sd * 98, -25, 0, scene); });   // posts x 90..106, y -140..90, z -20..20; shafts end at x 90
    P.at(P.box(260, 12, 120, c.fixed), 0, -146, 0, scene);                        // base x -130..130, y -152..-140, z -60..60; posts stand on y -140
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.a += S.w * dt;
    o.g1.rotation.z = o.a;
    o.g2.rotation.z = -o.a + o.pitch / 2;               // equal gears: same speed, opposite way, half a tooth offset to mesh
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : -rpm));
  }
});
