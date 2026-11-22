M507.define({
  number: 44,
  title: "Stepped gears",
  lede: "Each gear is made of several thin gears fixed side by side, each turned a little from the one beside it, so the teeth make steps like a staircase. As a tooth on one thin gear lets go, a tooth on the next is already pushing, so the push never has a gap. Strong, smooth gears like this drove ships' propellers.",
  alt: "Two wide gears seen edge on, one above the other on level shafts held between two posts. Each is made of four thin gears side by side, with the teeth of each one set a little further round than the last. One row of teeth on the upper gear is red.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "The upper gear. It is several thin gears fixed together, each turned a part of a tooth from the one beside it." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "The lower gear. Its steps go the opposite way, so each thin gear fits the one above it." },
    { key: "tooth", color: "#C2503F", name: "Marked teeth", note: "One tooth on each thin gear is painted red. Watch them reach the meeting place one after another." }
  ],
  controls: [{ id: "steps", label: "Thin gears in each gear", value: "4", options: [["1", "1"], ["2", "2"], ["4", "4"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [400, 170, 560], front: [0, -10, 800], side: [700, -20, 0] },
  target: [0, -20, 0],
  how: [
    "The upper gear turns and its teeth push the lower gear round the other way. Both gears are the same size, so they turn at the same speed. A minus sign in the readout means the other way.",
    "Follow the red teeth. They do not reach the lower gear together. The one at one end arrives first, then its neighbour, then the next. Each thin gear takes up the push just after the one before it. So a fresh tooth is always coming into place, and the push stays steady.",
    "With one plain gear, each tooth meets its partner along its whole length at once, with a small knock. Try 1, then 2, then 4, and watch how the red teeth arrive."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows four thin gears in each gear. The posts, the base, the sizes and the number of teeth were made up. The choice of 1 or 2 thin gears was added for comparison.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N = 20, W = 128, R = N * MD / 2;
    var o = this.o = { a: 0, pitch: 2 * Math.PI / N, sets: { "1": [], "2": [], "4": [] } };
    // each wheel turns about world X: the group's local Z points along world X. Wheel x -64..64.
    function wheel(key, y, stagger, mark) {
      var g = new T.Group(), k; g.position.set(0, y, 0); g.rotation.set(0, Math.PI / 2, 0); scene.add(g);
      for (k in o.sets) {
        var gear = P.steppedGear({ teeth: N, module: MD, width: W, steps: +k, stagger: stagger, material: c.mat(key), mark: mark });
        g.add(gear); o.sets[k].push(gear);
      }
      P.at(P.cylZ(7, 260, c.mat(key)), 0, 0, 0, g);                               // shaft x -130..130, ends at the post faces
      [-1, 1].forEach(function (sd) { P.at(P.cylZ(14, 8, c.mat(key)), 0, 0, sd * 68, g); });   // collars x 64..72 and -72..-64, on the wheel faces
      P.at(P.box(34, 5, 1, c.mat(key, "dark")), 32, 0, 65, g);                    // stripe r 15..49, x 64.5..65.5, lifted off the face at 64
      return g;
    }
    o.g1 = wheel("drive", R, 1, c.mat("tooth"));        // centres 2R apart: the sum of the pitch radii
    o.g2 = wheel("driven", -R, -1, null);               // steps the other way, so every thin gear meshes with the one above it
    // supports
    [-1, 1].forEach(function (sd) { P.at(P.box(16, 230, 40, c.fixed), sd * 138, -25, 0, scene); });  // posts x 130..146, y -140..90, z -20..20; shafts end at x 130
    P.at(P.box(340, 12, 120, c.fixed), 0, -146, 0, scene);                        // base x -170..170, y -152..-140, z -60..60; posts stand on y -140
  },

  step: function (c, dt, S) {
    var o = this.o, k, cur = o.sets[S.controls.steps] ? S.controls.steps : "4";
    o.a += S.w * dt;
    for (k in o.sets) o.sets[k].forEach(function (m) { m.visible = k === cur; });
    o.g1.rotation.z = o.a;
    o.g2.rotation.z = -o.a + o.pitch / 2;               // equal gears: same speed, opposite way, half a tooth offset to mesh
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : -rpm));
  }
});
