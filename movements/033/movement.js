M507.define({
  number: 33,
  title: "Elliptical gears",
  lede: "Two oval gears turn each other. The first one turns steadily, but the second one speeds up and slows down twice in every turn. Machines used this when a part had to move quickly at one moment and slowly at the next.",
  alt: "Two oval toothed gears side by side on an upright plate, their teeth locked together. The left one stands upright and the right one lies level. A crank turns the left gear, and a red stripe marks the right gear.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "An oval gear fixed to the crank's shaft. It turns at a steady speed." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "An oval gear of the same shape. Watch its red stripe. It hurries and then lags, twice in every turn." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the driving gear. In a real machine an engine or a water wheel would do this." }
  ],
  controls: [{ id: "shape", label: "Gear shape", value: "oval", options: [["round", "Nearly round"], ["oval", "Oval"], ["long", "Long oval"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [300, 145, 545], front: [78, 0, 720], side: [770, 0, 0] },
  target: [78, 0, 0],
  how: [
    "Turn the crank and the blue gear turns steadily. Now watch the red stripe on the orange gear. It hurries, then lags, twice in every turn. Both gears still finish each full turn together. A minus sign in the readout means the other way.",
    "The reason is the place where the teeth touch. When a long end of the blue gear meets a flat side of the orange gear, the blue teeth are far from their shaft and the orange teeth are close to theirs. A long lever is driving a short one, so the orange gear turns faster. A quarter of a turn later it is the other way round, and the orange gear turns slower.",
    "The two shafts never move. So where one gear sticks out, the other must be tucked in by the same amount. Try Nearly round, then Long oval. The longer the oval, the more the speed rises and falls."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws true ellipses, each on a shaft through its middle. Two true ellipses held like that cannot stay in mesh, so the ovals here have a slightly different shape that rolls together properly. The crank, the plate that holds the shafts, the sizes and the number of teeth were made up. The choice of shape was added to show what it changes.",

  /* Pitch curve of an oval gear turning on its centre: r(t) = p / (1 - e cos 2t), long half-axis a at t = 0, short half-axis b
     at 90 degrees. It is an ellipse about its focus with the polar angle halved. Two equal ones roll on each other without
     slip on centres a + b apart: if the driver touches at angle th from its short axis, the driven gear touches at angle t2
     from its long axis, with tan t2 = (b / a) tan th. (Checked numerically: r1 + r2 = a + b, and the arc lengths agree.) */
  _oval: function (a, b) {
    var e = (a - b) / (a + b), p = 2 * a * b / (a + b), pts = [], n = 720, i, t, r;
    for (i = 0; i < n; i++) { t = 2 * Math.PI * i / n; r = p / (1 - e * Math.cos(2 * t)); pts.push([r * Math.cos(t), r * Math.sin(t)]); }
    return {
      a: a, b: b, pts: pts,
      r: function (t) { return p / (1 - e * Math.cos(2 * t)); },
      theta2: function (th) { var t2 = Math.atan2(b * Math.sin(th), a * Math.cos(th)); return t2 + 2 * Math.PI * Math.round((th - t2) / (2 * Math.PI)); }
    };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, A = 156, N = 26, self = this;
    var o = this.o = { th: 0, A: A, sets: {} };
    // driving gear and crank: gear z -8..8, shaft z -30..30 (starts at the plate face), crank arm z 30..36, handle z 36..60
    o.g1 = new T.Group(); scene.add(o.g1);
    P.at(P.cylZ(6, 60, c.mat("drive")), 0, 0, 0, o.g1);                       // shaft z -30..30
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 10, o.g1);                      // hub z 8..12, on the gear face
    P.at(P.box(52, 12, 6, c.mat("crank")), 22, 0, 33, o.g1);                  // arm x -4..48, z 30..36, on the shaft end
    P.at(P.cylZ(5, 24, c.mat("crank")), 44, 0, 48, o.g1);                     // handle z 36..60, on the arm face
    // driven gear: shafts are a + b apart for every shape, so they never move
    o.g2 = new T.Group(); o.g2.position.x = A; scene.add(o.g2);
    P.at(P.cylZ(6, 38, c.mat("driven")), 0, 0, -11, o.g2);                    // shaft z -30..8, plate face to gear face
    P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 10, o.g2);                     // hub z 8..12, on the gear face
    // one pair for each shape, only one shown at a time. 26 teeth: a tooth on each long end, a gap on each flat side,
    // so two identical gears mesh when a long end of one meets a flat side of the other.
    [["round", 1.25], ["oval", 1.7], ["long", 2]].forEach(function (s) {
      var b = A / (1 + s[1]), ov = self._oval(A - b, b);
      ov.m1 = P.noncircularGear({ points: ov.pts, teeth: N, phase: 0, width: 16, material: c.mat("drive") });
      ov.m2 = P.noncircularGear({ points: ov.pts, teeth: N, phase: 0, width: 16, material: c.mat("driven") });
      var len = ov.a - 1.25 * ov.m2.pitch / Math.PI - 14;                     // from the hub to 3 short of the tooth roots
      ov.st = P.box(len, 5, 1, c.mat("driven", "mark")); ov.st.position.set(11 + len / 2, 0, 9);   // red stripe z 8.5..9.5, lifted off the face (z 8)
      o.g1.add(ov.m1); o.g2.add(ov.m2); o.g2.add(ov.st); o.sets[s[0]] = ov;
    });
    // supports
    P.at(P.box(406, 250, 10, c.fixed), 78, 0, -35, scene);                    // plate x -125..281, y -125..125, z -40..-30; shafts end at z -30
    P.at(P.box(446, 12, 100, c.fixed), 78, -131, -30, scene);                 // base x -145..301, y -137..-125, z -80..20; plate stands on y -125
  },

  step: function (c, dt, S) {
    var o = this.o, k, ov = o.sets[S.controls.shape] || o.sets.oval;
    for (k in o.sets) o.sets[k].m1.visible = o.sets[k].m2.visible = o.sets[k].st.visible = o.sets[k] === ov;
    o.th += S.w * dt;
    o.g1.rotation.z = Math.PI / 2 + o.th;                  // starts upright: a flat side faces the driven gear
    o.g2.rotation.z = -ov.theta2(o.th);                    // starts level: a long end faces the driver
    var r1 = ov.r(Math.PI / 2 + o.th), r2 = o.A - r1;      // distances from each shaft to the place where the teeth touch
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : -rpm * r1 / r2));
  }
});
