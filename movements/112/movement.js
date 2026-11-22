M507.define({
  number: 112,
  title: "Persian drill",
  lede: "A rod with a steep screw thread on it spins when a nut is pulled up and down along it. A drill bit at the bottom spins with it, first one way, then the other. One hand makes a plain up and down pull into a quick turning.",
  alt: "An upright thick rod with a steep spiral thread. A wide mushroom-shaped head on top presses against a fixed rest. A wide flat nut sits on the middle. A chuck and a short pointed bit at the bottom touch a block.",
  parts: [
    { key: "nut", color: "#5E7387", name: "Nut", note: "The button held in the hand. It only slides up and down and never turns. Watch how it makes the rod turn." },
    { key: "stock", color: "#C8873A", name: "Drill stock", note: "The rod with the steep thread. It turns freely and goes round first one way, then the other. Watch the red stripes on the head and chuck." },
    { key: "bit", color: "#4FA58A", name: "Bit", note: "A short pointed bit held in a block at the bottom of the rod. It turns with the rod and its point rests on the block." },
    { key: "head", color: "#8E7AA8", name: "Head", note: "The wide round top, pressed against a fixed rest. It turns freely with the rod, and the rest holds it up." }
  ],
  controls: [{ id: "lead", label: "Thread", value: "steep", options: [["steep", "Steep"], ["very", "Very steep"]] }],
  speed: { min: 10, max: 90, value: 30, label: "Pulls", unit: " per min" },
  readouts: [{ id: "rpm", label: "Rod" }, { id: "pos", label: "Nut" }],
  views: { front: [0, 0, 880], "3d": [550, 240, 900], side: [880, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Pull the nut up and the rod spins one way. Push it down and the rod spins the other way. The nut cannot turn, so as it slides along the thread it makes the rod twist under it.",
    "The thread is very steep, so one turn of the rod needs a long slide of the nut. Slide the nut that far and the rod has turned exactly once. The red stripes on the head and the chuck show this. At the end of each pull the nut stops for a moment, and so does the rod, before it turns back.",
    "The bit at the bottom turns with the rod and drills where it touches. Try Steep, then Very steep, and compare how far the rod turns on each pull."
  ],
  note: "This model is rebuilt from Brown's description. There was no picture to copy. The rest above the head, the back plate, the block under the bit and all the sizes were made up. The nut is moved smoothly up and down, as a hand would. A real nut has a small peg or groove that rides in the thread.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { psi: 0, A: 45, Y0: 23, leads: { steep: 70, very: 120 }, worms: {} };
    var stock = o.stock = new T.Group(); scene.add(stock);
    // threaded stock: pitch radius 11.5, tip r 14, core r 9, centred on y 23, y -122..168 (worm axis X turned to Y)
    [["steep", 35], ["very", 60]].forEach(function (e) {
      var w = new T.Group(); w.rotation.z = Math.PI / 2; w.position.y = o.Y0; stock.add(w);
      P.at(P.worm({ radius: 11.5, pitch: e[1], length: 290, starts: 2, addendum: 2.5, dedendum: 2.5, material: c.mat("stock") }), 0, 0, 0, w);
      o.worms[e[0]] = w;
    });
    P.at(P.cylY(9, 8, c.mat("stock")), 0, -126, 0, stock);       // bare core y -130..-122, down to the chuck top
    // mushroom head: collar y 168..185, flat disc y 185..187, dome up to y 230
    P.at(P.cylY(28, 17, c.mat("head")), 0, 176.5, 0, stock);
    P.at(P.cylY(55, 2, c.mat("head")), 0, 186, 0, stock);
    var dome = new T.Mesh(new T.SphereGeometry(55, 40, 14, 0, 2 * Math.PI, 0, Math.PI / 2), c.mat("head")); dome.scale.y = 45 / 55; dome.position.y = 185; stock.add(dome);   // y 185..230
    P.at(P.box(1, 12, 2, c.mat("head", "mark")), 28.7, 176.5, 0, stock);       // red stripe on the collar, lifted off the side
    // chuck y -170..-130 and bit
    P.at(P.cylY(21, 40, c.mat("bit")), 0, -150, 0, stock);
    P.at(P.box(1, 24, 2, c.mat("bit", "mark")), 21.7, -150, 0, stock);          // red stripe on the chuck
    P.at(P.cylY(9, 30, c.mat("bit")), 0, -185, 0, stock);                       // shank y -200..-170
    var cone = new T.Mesh(new T.CylinderGeometry(9, 0, 30, 24), c.mat("bit")); cone.position.y = -215; stock.add(cone);   // y -230..-200

    // nut: a wide spool, centred so its waist sits at y 23 (flanges: top y +10..+30, waist -13..+10, bottom -30..-13)
    var nut = o.nut = new T.Group(); scene.add(nut);
    P.at(P.cylY(52, 20, c.mat("nut")), 0, 20, 0, nut);
    P.at(P.cylY(40, 23, c.mat("nut")), 0, -1.5, 0, nut);
    P.at(P.cylY(55, 17, c.mat("nut")), 0, -21.5, 0, nut);

    // supports
    P.at(P.box(160, 500, 5, c.fixed), 0, 0, -47.5, scene);        // plate x -80..80, y -250..250, z -50..-45
    P.at(P.box(120, 20, 75, c.fixed), 0, 240, -7.5, scene);       // rest above the head x -60..60, y 230..250, z -45..30; dome top touches y 230
    P.at(P.box(120, 20, 90, c.fixed), 0, -240, 0, scene);         // block x -60..60, y -250..-230, z -45..45; bit tip touches y -230
  },

  step: function (c, dt, S) {
    var o = this.o, key = S.controls.lead || "steep", lead = o.leads[key];
    o.psi += S.w * dt;
    var d = o.A * Math.sin(o.psi), y = o.Y0 + d;
    var phi = -2 * Math.PI * d / lead;                 // stock angle from the nut's travel; thread crossing at +X stays under the nut
    o.stock.rotation.y = phi;
    o.nut.position.y = y;
    for (var k in o.worms) o.worms[k].visible = k === key;
    var rpm = -(o.A * S.w * Math.cos(o.psi)) / lead * 60;
    var r = Math.round(rpm);
    S.set("rpm", (r > 0 ? "+" : r < 0 ? "−" : "") + Math.abs(r) + " rpm");
    var p = Math.round(d);
    S.set("pos", (p > 0 ? "+" : p < 0 ? "−" : "") + Math.abs(p) + " mm");
  }
});
