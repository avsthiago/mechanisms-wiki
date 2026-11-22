M507.define({
  number: 2,
  title: "Pulleys and a crossed belt",
  lede: "Two pulleys are joined by a belt that crosses over itself between them. The crossing makes the upper pulley turn the opposite way to the lower one. It is a simple way to make a shaft run backwards.",
  alt: "Two spoked pulleys, one above the other, joined by a flat belt that crosses over itself between them. The lower pulley drives and the upper one turns the other way.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving pulley", note: "The lower pulley. Its shaft is turned by an engine or a motor, and it pulls the belt along." },
    { key: "driven", color: "#C8873A", name: "Driven pulley", note: "The upper pulley. The belt turns it the opposite way. Watch its dark spoke to see how fast it goes." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "A flat loop of leather, crossed over between the pulleys. Each half gets a half twist, so the same side always touches the pulleys. Watch the red mark go round." },
    { key: "shaft", color: "#4FA58A", name: "Shafts", note: "Each pulley is fixed to a shaft. The shafts run in bearings on the frame behind." }
  ],
  controls: [{ id: "size", label: "Size of the upper pulley", value: "1", options: [["0.5", "Half"], ["1", "Same"], ["2", "Twice"]] }],
  readouts: [{ id: "in", label: "Lower pulley" }, { id: "out", label: "Upper pulley" }],
  views: { "3d": [440, 170, 800], front: [0, 0, 760], side: [760, 0, 0] },
  target: [0, 20, 0],
  how: [
    "The belt leaves the lower pulley on one side and reaches the upper pulley on the other side. So it pulls the upper pulley round the opposite way. The two halves of the belt rub where they cross.",
    "The belt does not slip, so both rims move just as fast as the belt. A pulley twice as wide turns half as fast.",
    "Try the upper pulley at half size, then twice the size. Watch where the belt crosses. It moves closer to the smaller pulley."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the distance between the shafts and the frame behind are made up. Brown draws both pulleys the same size; the other two sizes were added to show the speed change. His text also describes three pulleys and two belts for running a shaft either way; that is not shown here.",

  build: function (c) {
    var P = c.P, o = this.o = { a1: 0, a2: 0, s: 0, T: 4, R1: 50, Y1: -110, Y2: 120, big: [] }, scene = c.scene;
    o.p1 = P.at(P.pulley({ radius: o.R1 - o.T / 2 - 2, width: 26, material: c.mat("drive") }), 0, o.Y1, 0, scene);
    o.p1.spokes[0].material = c.mat("drive", "dark");
    [0.5, 1, 2].forEach(function (k) {
      var p = P.at(P.pulley({ radius: o.R1 * k - o.T / 2 - 2, width: 26, material: c.mat("driven") }), 0, o.Y2, 0, scene);
      p.spokes[0].material = c.mat("driven", "dark"); p.k = k; o.big.push(p);
    });
    o.belt = P.at(P.belt({ width: 22, thick: o.T, material: c.mat("belt") }), 0, 0, 0, scene);
    o.belt.userData.live = true;
    o.mark = P.at(P.box(14, o.T + 2, 23, c.mat("belt", "mark")), 0, 0, 0, o.belt);
    // shafts and the frame they run in
    [o.Y1, o.Y2].forEach(function (y) {
      P.at(P.cylZ(7, 86, c.mat("shaft")), 0, y, -20, scene);      // from the front of the bearing (z -63) to just past the pulley (z 23)
      P.at(P.cylZ(16, 14, c.fixed), 0, y, -70, scene);            // bearing, z -77..-63
    });
    P.at(P.box(60, 444, 12, c.fixed), 0, 3, -83, scene);          // upright, y -219..225, z -89..-77
    P.at(P.box(180, 12, 80, c.fixed), 0, -225, -50, scene);       // base, top at y -219, z -90..-10
  },

  step: function (c, dt, S) {
    var o = this.o, k = +S.controls.size, R2 = o.R1 * k, w2 = -S.w / k;     // crossed: the upper pulley turns the other way
    if (o.k !== k) { o.k = k; o.belt.set(0, o.Y1, o.R1, 0, o.Y2, R2, true); o.s = 0; }
    o.a1 += S.w * dt; o.a2 += w2 * dt; o.s += S.w * o.R1 * dt;
    o.p1.rotation.z = o.a1;
    o.big.forEach(function (p) { p.visible = p.k === k; p.rotation.z = o.a2; });
    o.belt.place(o.mark, o.s);
    var r1 = S.playing ? S.rpm : 0, r2 = r1 / k;
    S.set("in", r1 + " rpm");
    S.set("out", (r2 % 1 ? r2.toFixed(1) : r2) + " rpm");
  }
});
