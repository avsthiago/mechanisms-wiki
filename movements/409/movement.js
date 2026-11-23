M507.define({
  number: 409,
  title: "Proportional compasses",
  lede: "Two long legs cross like a pair of scissors and have a sharp point at each of their four ends. The two points at the top are always a set fraction as far apart as the two points at the bottom. Measure something with one end and copy it, bigger or smaller, with the other end.",
  alt: "Two flat legs crossed in an X, each with a long slot and a sharp point at both ends. A round slide with rings sits where they cross. Short ticks of a scale run along one leg beside the slot.",
  parts: [
    { key: "legs", color: "#5E7387", name: "Two legs", note: "Two flat bars with a long slot in each. They cross and turn about the slide, and each ends in a sharp point." },
    { key: "slide", color: "#C8873A", name: "Slide and screw", note: "A pin through both slots, with a ring on each side. It can be moved along the slots and locked with a screw." },
    { key: "scale", color: "#E8E2D0", name: "Scale", note: "Ticks along one leg. The ring points at the tick for the ratio you have chosen." },
    { key: "gap", color: "#C2503F", name: "Gaps", note: "Red lines joining each pair of points. Watch how the long one always grows with the short one." }
  ],
  controls: [{ type: "range", id: "ratio", label: "Ratio of the gaps", min: 1, max: 3, step: 0.1, value: 1.3, unit: "", presets: [[1, "Same size"], [2, "Double"], [3, "Three times"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "s", label: "Short end" }, { id: "l", label: "Long end" }, { id: "r", label: "Ratio" }],
  views: { "3d": [150, -130, 880], front: [0, -23, 900], side: [900, -23, 120] },
  target: [0, -23, 0],
  distance: [250, 1400],
  how: [
    "The slide holds the two legs together where they cross. The legs open and close about it. Watch the two red lines. When one gets longer, so does the other.",
    "Each pair of points is the same angle apart as seen from the slide. So the gap at each end depends on how far the points are from the slide. If the long ends are twice as far from the slide as the short ends, their gap is always twice as big.",
    "Loosen the screw and move the slide along the slots. Try the same size, then double, then three times, and compare the two gaps."
  ],
  note: "This model is rebuilt from Brown's drawing. The two legs are drawn plain, with the slots, slide and a scale along one leg. The red lines and the opening and closing were added to show the ratio. The sizes and the scale marks are made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, i, o = this.o = { L: 420, ph: 0, a: null };
    var L = o.L, hw = 17;
    var pts = [[0, 0], [55, -hw], [L - 55, -hw], [L, 0], [L - 55, hw], [55, hw]];
    var slots = [{ x0: 100, x1: 215, y: 0, w: 10 }];
    o.leg1 = P.at(P.rulerPlate({ points: pts, slots: slots, z0: -4, depth: 4, material: c.mat("legs") }), 0, 0, 0, c.scene);   // z -4..0
    o.leg2 = P.at(P.rulerPlate({ points: pts, slots: slots, z0: 0, depth: 4, material: c.mat("legs") }), 0, 0, 0, c.scene);    // z 0..4
    for (i = 0; i <= 4; i++) {                                                   // ticks on the front leg for ratios 1, 1.5 ... 3
      var rt = 1 + i * .5, ax = L / (1 + rt), tall = i % 2 === 0 ? 10 : 6;
      P.at(P.box(1, tall, .6, c.mat("scale")), ax, 6.5 + tall / 2, 4.3, o.leg2);                  // z 4..4.6
    }
    var sl = new T.Group(); c.scene.add(sl);
    P.at(P.cylZ(4.6, 8, c.mat("slide")), 0, 0, 0, sl);                                 // pin through both slots, z -4..4
    P.at(P.cylZ(14, 3, c.mat("slide")), 0, 0, 5.5, sl);                                // front collar, z 4..7
    P.at(P.cylZ(9, 1.2, c.mat("slide", "dark")), 0, 0, 7.6, sl);                       // ring, z 7..8.2
    P.at(P.cylZ(4, 1.2, c.mat("slide")), 0, 0, 8.8, sl);                               // screw head, z 8.2..9.4
    P.at(P.cylZ(10, 3, c.mat("slide")), 0, 0, -5.5, sl);                               // back nut, z -7..-4
    o.rodU = P.at(P.rod(1.4, c.mat("gap")), 0, 0, 0, c.scene); o.rodL = P.at(P.rod(1.4, c.mat("gap")), 0, 0, 0, c.scene);
    o.cap = []; for (i = 0; i < 4; i++) o.cap.push(P.at(P.sphere(2.6, c.mat("gap")), 0, 0, 0, c.scene));
  },

  step: function (c, dt, S) {
    var o = this.o, L = o.L, rt = +S.controls.ratio, tgt = L / (1 + rt);
    if (o.a === null) o.a = tgt;
    o.a += (tgt - o.a) * Math.min(1, dt * 6);
    o.ph += S.w * dt;
    var a = o.a, b = L - a, h = (19 + 9 * Math.cos(o.ph)) * Math.PI / 180, sn = Math.sin(h), cs = Math.cos(h);
    o.leg1.position.set(-a * sn, a * cs, 0); o.leg1.rotation.z = -Math.PI / 2 + h;      // upper tip up-left, runs down-right
    o.leg2.position.set(a * sn, a * cs, 0); o.leg2.rotation.z = -Math.PI / 2 - h;      // upper tip up-right, runs down-left
    var zz = 6;
    o.rodU.span(-a * sn, a * cs, zz, a * sn, a * cs, zz); o.rodL.span(-b * sn, -b * cs, zz, b * sn, -b * cs, zz);
    o.cap[0].position.set(-a * sn, a * cs, zz); o.cap[1].position.set(a * sn, a * cs, zz); o.cap[2].position.set(-b * sn, -b * cs, zz); o.cap[3].position.set(b * sn, -b * cs, zz);
    S.set("s", Math.round(2 * a * sn) + " mm");
    S.set("l", Math.round(2 * b * sn) + " mm");
    S.set("r", "1 : " + (b / a).toFixed(1));
  }
});
