M507.define({
  number: 1,
  title: "Pulleys and an open belt",
  lede: "A belt runs round two wheels called pulleys. When one pulley turns, the belt drags the other round with it. Both turn the same way, and the shafts can be far apart.",
  alt: "Two spoked pulleys, one above the other, joined by a flat belt that runs straight up both sides. The lower pulley drives and the upper one follows.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving pulley", note: "The lower pulley. Its shaft is turned by an engine or a motor, and it pulls the belt along." },
    { key: "driven", color: "#C8873A", name: "Driven pulley", note: "The upper pulley. The belt turns it. Watch its dark spoke to see how fast it goes." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "A flat loop of leather. It grips the pulleys and does not slip. Watch the red mark go round." },
    { key: "shaft", color: "#4FA58A", name: "Shafts", note: "Each pulley is fixed to a shaft. The shafts run in bearings on the frame behind." }
  ],
  controls: [{ id: "size", label: "Size of the upper pulley", value: "1", options: [["0.5", "Half"], ["1", "Same"], ["2", "Twice"]] }],
  readouts: [{ id: "in", label: "Lower pulley" }, { id: "out", label: "Upper pulley" }],
  views: { "3d": [440, 170, 800], front: [0, 0, 760], side: [760, 0, 0] },
  target: [0, 20, 0],
  how: [
    "The lower pulley turns and pulls the belt with it. The belt runs up one side and down the other. It drags the upper pulley round in the same direction.",
    "The belt does not slip, so both rims move just as fast as the belt. A pulley twice as wide must turn half as fast to keep up.",
    "Try the upper pulley at half size, then twice the size. Compare its speed with the lower one each time."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the distance between the shafts and the frame behind are made up. Brown draws both pulleys the same size; the other two sizes were added to show the speed change. A real belt stretches and slips a little, so the upper pulley would lose a few turns.",

  build: function (c) {
    var P = c.P, o = this.o = { a1: 0, a2: 0, s: 0, T: 4, R1: 50, Y1: -110, Y2: 120, big: [] }, scene = c.scene;
    o.p1 = P.at(P.pulley({ radius: o.R1 - o.T / 2 - 1, width: 26, material: c.mat("drive") }), 0, o.Y1, 0, scene);
    o.p1.spokes[0].material = c.mat("drive", "dark");
    [0.5, 1, 2].forEach(function (k) {
      var p = P.at(P.pulley({ radius: o.R1 * k - o.T / 2 - 1, width: 26, material: c.mat("driven") }), 0, o.Y2, 0, scene);
      p.spokes[0].material = c.mat("driven", "dark"); p.k = k; o.big.push(p);
    });
    o.belt = P.at(P.belt({ width: 22, thick: o.T, material: c.mat("belt") }), 0, 0, 0, scene);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(14, o.T + 2, 23, c.mat("belt", "mark")), 0, 0, 0, scene);
    // shafts and the frame they run in
    [o.Y1, o.Y2].forEach(function (y) {
      P.at(P.cylZ(7, 86, c.mat("shaft")), 0, y, -20, scene);      // from the front of the bearing (z -63) to just past the pulley (z 23)
      P.at(P.cylZ(16, 14, c.fixed), 0, y, -70, scene);
    });
    P.at(P.box(60, 444, 12, c.fixed), 0, 3, -83, scene);      // upright, standing on the base (top of base is y -219)
    P.at(P.box(180, 12, 80, c.fixed), 0, -225, -50, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, k = +S.controls.size, R2 = o.R1 * k, w2 = S.w / k;
    if (o.k !== k) { o.k = k; o.belt.set(0, o.Y1, o.R1, 0, o.Y2, R2); o.s = 0; }
    o.a1 += S.w * dt; o.a2 += w2 * dt; o.s += S.w * o.R1 * dt;
    o.p1.rotation.z = o.a1;
    o.big.forEach(function (p) { p.visible = p.k === k; p.rotation.z = o.a2; });
    var pt = o.belt.pointAt(o.s);
    o.mark.position.set(pt.x, pt.y, 0); o.mark.rotation.z = pt.a;
    var r1 = S.playing ? S.rpm : 0, r2 = r1 / k;
    S.set("in", r1 + " rpm");
    S.set("out", (r2 % 1 ? r2.toFixed(1) : r2) + " rpm");
  }
});
