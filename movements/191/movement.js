M507.define({
  number: 191,
  title: "Scroll gears",
  lede: "Two gears shaped like snail shells turn each other. The upper one turns steadily, and the lower one starts slow and gets faster all through each turn. Then it drops back to slow and starts again. Machines used this to speed a part up gently.",
  alt: "Two toothed wheels, one above the other, on an upright plate. Each wheel gets wider all the way round and has a small step where its widest part meets its narrowest part. A crank turns the top wheel, and a red stripe marks the bottom wheel.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "A gear whose edge gets farther from its shaft all the way round, like a snail shell. The crank turns it at a steady speed." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "The same shape as the driving gear. Watch its red stripe. It goes round slowly at first, then faster and faster." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the driving gear. In a real machine an engine or a water wheel would do this." }
  ],
  controls: [{ id: "k", label: "Spiral", value: "1.3", options: [["1.3", "As drawn"], ["1.55", "Steeper"], ["1.8", "Steepest"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [330, 170, 760], front: [0, 0, 860], side: [860, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Turn the crank and the blue gear turns steadily. The orange gear turns the other way, shown by a minus sign in the readout. Watch the red stripe on the orange gear. Just after the steps pass each other it moves slowly. It speeds up bit by bit for the whole turn. Then the steps meet again and it is slow once more.",
    "Look at where the teeth touch. Right after the step, the blue gear touches with its narrow part and the orange gear with its wide part. A short lever is driving a long one, so the orange gear turns slowly. As they turn, the blue gear touches farther and farther out and the orange gear closer in. So the orange gear turns faster and faster.",
    "The shafts never move, so where one gear gets wider the other gets narrower by the same amount. Both gears finish each turn together, so the steps always meet. Try As drawn, then Steepest, and watch the driven speed in the readout."
  ],
  note: "This model is rebuilt from Brown's drawing. The edge of each gear is a kind of spiral that lets two equal gears roll on each other without slipping. At the step the driven speed jumps back down all at once. Real teeth would knock there, so the one tooth beside each step is cut short to let the gears pass. The two gears still touch for a moment at the step. The crank, the plate, the sizes and the number of teeth were made up. The choice of spiral was added to show what it changes.",

  /* Pitch curve r(a) = rmin * k^(a / 2pi), a from 0 to 2pi: a logarithmic spiral that grows by k in one turn, closed by a
     straight step. Two equal ones on centres D = rmin + rmax apart roll without slip: when the driver touches at angle th
     (radius r1), the driven touches at angle psi with rmin * k^(psi / 2pi) = D - r1. Rolling needs r1 dth = r2 dpsi, and
     d(ln r)/da is the same on both, so dr1 = -dr2 gives it. Both reach their steps together, once a turn.
     Checked in node over full turns: pitch curves touch only on the line of centres; teeth overlap by under 0.7 (as drawn)
     to 1.4 (steepest) for a moment at the step, nowhere else. */
  _spiral: function (k, D) {
    var rmin = D / (1 + k), b = Math.log(k) / (2 * Math.PI), pts = [], n = 720, i, a, r;
    for (i = 0; i <= n; i++) { a = 2 * Math.PI * i / n; r = rmin * Math.exp(b * a); pts.push([r * Math.cos(a), r * Math.sin(a)]); }
    return { pts: pts, rmin: rmin, b: b, L: (D - 2 * rmin) * Math.sqrt(1 + b * b) / b };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = 180, MD = 6, self = this;
    var o = this.o = { th: -0.055, D: D, sets: {} };                        // opens just before the steps meet, as drawn (no overlap until 358 deg)
    // driving gear and crank, centre y 90: gear z -8..8, shaft z -30..30 (starts at the plate face), crank arm z 30..36, handle z 36..60
    o.g1 = new T.Group(); o.g1.position.y = D / 2; scene.add(o.g1);
    P.at(P.cylZ(6, 60, c.mat("drive")), 0, 0, 0, o.g1);                       // shaft z -30..30
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 10, o.g1);                      // hub z 8..12, on the gear face
    P.at(P.box(52, 12, 6, c.mat("crank")), 22, 0, 33, o.g1);                  // arm x -4..48, z 30..36, on the shaft end
    P.at(P.cylZ(5, 24, c.mat("crank")), 44, 0, 48, o.g1);                     // handle z 36..60, on the arm face
    // driven gear, centre y -90
    o.g2 = new T.Group(); o.g2.position.y = -D / 2; scene.add(o.g2);
    P.at(P.cylZ(6, 38, c.mat("driven")), 0, 0, -11, o.g2);                    // shaft z -30..8, plate face to gear face
    P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 10, o.g2);                     // hub z 8..12, on the gear face
    // one pair for each spiral, only one shown at a time. The driver has a gap at each end of its spiral, the driven a
    // tooth centre, so a driver tooth always meets a driven gap (the driven contact runs along its curve backwards).
    ["1.3", "1.55", "1.8"].forEach(function (key) {
      var sp = self._spiral(+key, D), N = Math.round(sp.L / (Math.PI * MD));
      sp.m1 = P.noncircularGear({ points: sp.pts, teeth: N, phase: .5, open: true, relief: 1, width: 16, material: c.mat("drive") });
      sp.m2 = P.noncircularGear({ points: sp.pts, teeth: N, phase: 0, open: true, relief: 1, width: 16, material: c.mat("driven") });
      var rs = sp.rmin * Math.exp(sp.b * Math.PI), len = rs - 1.25 * sp.m2.pitch / Math.PI - 14;   // stripe at the halfway radius
      sp.st = P.box(len, 5, 1, c.mat("driven", "mark")); sp.st.position.set(-(11 + len / 2), 0, 9);   // red stripe z 8.5..9.5, lifted off the face (z 8)
      o.g1.add(sp.m1); o.g2.add(sp.m2); o.g2.add(sp.st); o.sets[key] = sp;
    });
    // supports: largest gear reaches 116 + 6 = 122 from its shaft, so y -212..212
    P.at(P.box(280, 446, 10, c.fixed), 0, -1, -35, scene);                   // plate x -140..140, y -224..222, z -40..-30; shafts end at z -30
    P.at(P.box(320, 12, 100, c.fixed), 0, -230, -30, scene);                 // base x -160..160, y -236..-224, z -80..20; plate stands on y -224
  },

  step: function (c, dt, S) {
    var o = this.o, k, sp = o.sets[S.controls.k] || o.sets["1.3"], D = o.D;
    for (k in o.sets) o.sets[k].m1.visible = o.sets[k].m2.visible = o.sets[k].st.visible = o.sets[k] === sp;
    o.th += S.w * dt;
    var th = ((o.th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    var r1 = sp.rmin * Math.exp(sp.b * th), r2 = D - r1, psi = Math.log(r2 / sp.rmin) / sp.b;
    o.g1.rotation.z = -Math.PI / 2 - th;                   // the driver touches at its own angle th, turned to point down
    o.g2.rotation.z = Math.PI / 2 - psi;                   // the driven touches at its own angle psi, turned to point up
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : -rpm * r1 / r2));       // minus: the other way from the driver
  }
});
