M507.define({
  number: 484,
  title: "Spiral on a cylinder",
  lede: "A broad blade is wound round a drum, like the thread of a screw. When wind or water flows along the drum, it pushes on the slanted blade and the drum turns. The shaft can then drive a machine.",
  alt: "A drum on a shaft between two uprights, with one broad spiral blade wound round it. Blue dots flow along the drum from left to right.",
  parts: [
    { key: "blade", color: "#C8873A", name: "Spiral blade", note: "A thin blade wound round the drum, like a screw thread. The flow pushes on its slanted face." },
    { key: "drum", color: "#5E7387", name: "Drum", note: "Carries the blade and turns with it. Watch the red stripe to see it go round." },
    { key: "shaft", color: "#4FA58A", name: "Shaft", note: "Runs through the drum and turns in the two uprights. It carries the turning out to a machine." }
  ],
  controls: [{ id: "turns", label: "Blade", value: "1", options: [["0.5", "Half a turn"], ["1", "One turn"], ["2", "Two turns"]] }],
  speed: { min: 1, max: 30, value: 12, label: "Flow", unit: " of 30" },
  readouts: [{ id: "v", label: "Flow" }, { id: "r", label: "Drum" }],
  views: { "3d": [424, 187, 909], front: [0, -45, 1020], side: [1000, -30, 140] },
  target: [0, -45, 0],
  how: [
    "The water runs along the drum, from one end to the other. Each bit of water meets the slanted blade and pushes on it. A push on a slant is partly a sideways push, so the blade swings round and the drum turns with it.",
    "Watch the dots. They move in straight lines and never cut through the blade. As the drum turns, the blade seems to slide along with the water, like a screw turning in a nut. In one turn of the drum, the water moves on by one twist of the blade.",
    "Try the blade setting. With half a turn of blade, the drum turns slowly. With two turns, the twists are closer together, so the drum must spin faster to keep up with the same flow."
  ],
  note: "This model is rebuilt from Brown's drawing. The base, the flow and its speed were made up. Here the drum turns exactly in step with the flow. A real one slips a little and turns a bit slower, and it needs a stronger flow to drive a load.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, L = 320, RI = 52, RO = 140, i;
    var o = this.o = { L: L, RI: RI, RO: RO, rot: 0, blades: {}, N: 260, d: [] };
    o.rotor = new T.Group(); scene.add(o.rotor);
    P.at(P.cylX(RI, L, c.mat("drum")), 0, 0, 0, o.rotor);                         // drum x -160..160
    P.at(P.cylX(10, 340, c.mat("shaft")), 0, 0, 0, o.rotor);                       // shaft x -170..170, ends at the uprights' inner faces
    P.at(P.box(40, 1.2, 6, c.mat("drum", "mark")), -130, -RI - 1.3, 0, o.rotor);   // stripe y -53.9..-52.7, lifted off the drum
    ["0.5", "1", "2"].forEach(function (k) {
      var b = P.helixFlight({ rIn: RI - 2, rOut: RO, length: L, pitch: L / +k, thickness: 3, hand: 1, material: c.mat("blade") });
      b.position.x = -L / 2; b.visible = k === "1"; o.rotor.add(b); o.blades[k] = b;
    });
    // uprights x 170..225 and -225..-170, y -218..67, z -25..25; base y -230..-218 (upright bottoms = base top)
    [-1, 1].forEach(function (s) { P.at(P.box(55, 285, 50, c.fixed), s * 197.5, -75.5, 0, scene); });
    P.at(P.box(520, 12, 160, c.fixed), 0, -224, 0, scene);
    o.dots = P.waterDots(o.N, { radius: 2.4, color: c.spot, opacity: .8 });
    scene.add(o.dots);
    for (i = 0; i < o.N; i++) o.d.push({ x: -165 + 330 * Math.random(), r: RI + 5 + (RO + 30 - RI - 5) * Math.sqrt(Math.random()), a: 2 * Math.PI * Math.random() });
  },

  step: function (c, dt, S) {
    var o = this.o, turns = +S.controls.turns, v = S.w * o.L / (2 * Math.PI);    // flow speed: one turn of a one-turn blade per drum turn
    Object.keys(o.blades).forEach(function (k) { o.blades[k].visible = k === S.controls.turns; });
    o.rot -= 2 * Math.PI * v * turns / o.L * dt;                                     // no slip: the blade keeps pace with the water
    o.rotor.rotation.x = o.rot;
    for (var i = 0; i < o.N; i++) {
      var d = o.d[i]; d.x += v * dt; if (d.x > 165) d.x -= 330;
      var s = Math.min(1, (d.x + 165) / 20, (165 - d.x) / 20);
      o.dots.put(i, d.x, d.r * Math.cos(d.a), d.r * Math.sin(d.a), Math.max(0, s));
    }
    o.dots.flush();
    S.set("v", Math.round(v) + " cm/s");
    S.set("r", (S.w * turns * 60 / (2 * Math.PI)).toFixed(1) + " rpm");
  }
});
