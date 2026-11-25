M507.define({
  number: 362,
  title: "Traverse by an oblique groove",
  lede: "A pin rides in a slanting groove cut round a turning cylinder. As the cylinder turns, the groove pushes the pin sideways, first one way and then back. The pin carries a shaft and a drum with it, so they slide to and fro once for every turn.",
  alt: "Two horizontal shafts in three upright posts. The lower shaft carries a cylinder with a slanting groove cut round it. A pin standing on the end of the upper shaft rests in that groove. A tall drum sits on the upper shaft.",
  parts: [
    { key: "cyl", color: "#5E7387", name: "Grooved cylinder", note: "Fixed to the lower shaft, which is turned by the crank. The groove goes round it in a slant, like a tilted ring." },
    { key: "pin", color: "#C2503F", name: "Pin", note: "Stands on the end of the upper shaft and sits in the groove. Watch it move sideways as the cylinder turns." },
    { key: "upper", color: "#C8873A", name: "Upper shaft and drum", note: "Slides along its two posts but does not turn. The pin pulls it to and fro. The red band shows how far it has moved." }
  ],
  controls: [{ id: "g", label: "Groove slant", value: "10", options: [["5", "Gentle"], ["10", "Steep"]] }],
  readouts: [{ id: "c", label: "Cylinder" }, { id: "d", label: "Drum moved" }],
  views: { "3d": [190, 139, 429], front: [-10, 30, 700], top: [-10, 800, 2] },
  target: [-10, 30, 0],
  distance: [300, 1500],
  how: [
    "Look at the groove on the cylinder. It does not go straight round. It wanders from one end of the cylinder to the other and back again. The pin is held in the groove, so it must follow it.",
    "When the cylinder turns, the part of the groove under the pin moves sideways. The pin goes with it, and takes the upper shaft and the drum along. After one full turn the groove has gone to one end and come back, so the drum has slid out and back once.",
    "Try the gentle slant, then the steep one. A steeper groove wanders further, so the drum slides further each turn."
  ],
  note: "This model is rebuilt from Brown's drawing. The groove is a closed loop round the cylinder, as Brown describes. The upper shaft is kept from turning so the pin always points down. The posts, base, crank and all sizes were added or made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, i, o = this.o = { th: 0, g: null, XC: 59, R: 45 };
    function post(x0, x1, yTop, holes) {                           // upright with a hole for each shaft; y -81 .. yTop
      var w = x1 - x0, cx = (x0 + x1) / 2, y = -81;
      function plain(a, b) { if (b > a) P.at(P.box(w, b - a, 30, c.fixed), cx, (a + b) / 2, 0, c.scene); }
      holes.forEach(function (hy) {
        plain(y, hy - 12);
        var m = P.guideBlock({ w: 24, h: w, d: 30, hole: 5.8, material: c.fixed }); m.rotation.z = Math.PI / 2; P.at(m, cx, hy, 0, c.scene);
        y = hy + 12;
      });
      plain(y, yTop);
    }
    post(-98, -78, 80, [64]); post(10, 30, 80, [0, 64]); post(90, 110, 14, [0]);   // z -15 .. 15
    P.at(P.box(224, 8, 44, c.fixed), 6, -85, 0, c.scene);          // base: y -89 .. -81, top meets the posts' feet
    // upper shaft, drum and pin: slides along X
    var um = c.mat("upper"), us = o.us = new T.Group(); us.position.y = 64; c.scene.add(us);
    P.at(P.cylX(5, 192, um), -34, 0, 0, us);                        // x -130 .. 62, passes through the holes
    P.at(P.cylX(64, 52, um), -44, 0, 0, us);                        // drum x -70 .. -18 (y 0 .. 128)
    P.at(P.cylX(64.7, 3, c.mat("upper", "mark")), -34, 0, 0, us);   // red band round the drum, 0.7 outside it
    P.at(P.cylY(2.2, 49, c.mat("pin")), 49, 1.5, 0, us);            // pin y 41 .. 90, tip 1 above the groove floor
    // lower shaft and the cylinders with an oblique groove
    var cm = c.mat("cyl"), lg = o.lg = new T.Group(); c.scene.add(lg);
    P.at(P.cylX(5, 116, cm), 66, 0, 0, lg);                         // x 8 .. 124
    P.at(P.box(4, 24, 6, cm), 114, -12, 0, lg); P.at(P.cylX(3, 10, cm), 121, -24, 0, lg);   // crank arm x 112..116
    o.cyl = {};
    [5, 10].forEach(function (A) {
      var g = new T.Group();
      g.add(P.groovedDrum({ radius: o.R, depth: 5, length: 34, halfWidth: 3, path: function (f) { return -A * Math.cos(f); }, material: cm, floorMaterial: c.mat("cyl", "dark"), n: 360 }));
      g.position.x = o.XC; lg.add(g); o.cyl[A] = g;
    });
    P.at(P.cylX(o.R, 2, cm), o.XC - 18, 0, 0, lg); P.at(P.cylX(o.R, 2, cm), o.XC + 18, 0, 0, lg);   // end caps x 40..42 and 76..78 flush with the grooved surface
  },

  step: function (c, dt, S) {
    var o = this.o, A = +S.controls.g;
    if (A !== o.g) { o.g = A; o.th = 0; o.cyl[5].visible = A === 5; o.cyl[10].visible = A === 10; }
    o.th += S.w * dt;
    var shift = o.XC - A * Math.cos(o.th) - 49;
    o.lg.rotation.x = o.th; o.us.position.x = shift;
    S.set("c", Math.round(S.playing ? S.rpm : 0) + " rpm");
    S.set("d", Math.round(shift) + " mm");
  }
});
