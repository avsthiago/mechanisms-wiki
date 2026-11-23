M507.define({
  number: 273,
  title: "Toggle rods",
  lede: "Four rods slide in guides, and four links join their ends into a diamond. When the two side rods are pushed together, the diamond gets taller and pushes the top and bottom rods apart. Pulling the side rods apart does the opposite.",
  alt: "A diamond of four links. A rod slides in a guide at each corner: two level rods at the left and right and two upright rods at the top and bottom.",
  parts: [
    { key: "side", color: "#5E7387", name: "Side rods", note: "The left and right rods. They slide level in their guides and are the ones being pushed." },
    { key: "upright", color: "#C8873A", name: "Top and bottom rods", note: "They slide up and down. They move apart when the side rods come together." },
    { key: "link", color: "#D9B13B", name: "Links", note: "Four bars of the same length that join the rod ends into a diamond." },
    { key: "pin", color: "#C2503F", name: "Pins", note: "The four joints. Watch them: each one slides straight along its rod's guide." }
  ],
  controls: [{ id: "shape", label: "Diamond shape", value: "54", options: [["54", "Tall"], ["45", "Square"], ["36", "Wide"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Pushes", unit: " a min" },
  readouts: [{ id: "s", label: "Side gap" }, { id: "u", label: "Top gap" }],
  views: { "3d": [330, 200, 780], front: [0, 0, 850], side: [800, 40, 0] },
  target: [0, 0, 0],
  how: [
    "The four links are all the same length, so the corners always make a diamond. The side corners can only move left and right. The top and bottom corners can only move up and down.",
    "If the side corners move together, the diamond has to get taller. The top and bottom corners then move apart. The reverse also holds. The distance moved is not always equal. A tall diamond moves its top and bottom corners less than its sides.",
    "Try the three diamond shapes. In the square shape both pairs of rods move the same distance. In the others, watch which pair moves more."
  ],
  note: "This model is rebuilt from Brown's drawing. The guides, the cross-shaped stand behind them, the length of the rods and how far they push were made up. The links are drawn in two layers so that they can cross at each pin.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { th: 0, L: 150, LR: 120, AMP: 10 * Math.PI / 180, rods: [], links: [], pins: [], g: 0 }, i;
    var mk = function (key) { return c.mat(key); };
    var rodKeys = ["side", "side", "upright", "upright"];   // left, right, top, bottom
    for (i = 0; i < 4; i++) o.rods.push(P.at(P.rod(8, mk(rodKeys[i])), 0, 0, 0, c.scene));
    // links: AC and BD in front layer, CB and DA behind. Each is a flat bar scaled along x and turned.
    var layer = [10.5, -10.5, 10.5, -10.5];
    for (i = 0; i < 4; i++) {
      var b = P.box(1, 14, 5, mk("link")); b.position.z = layer[i]; c.scene.add(b); o.links.push(b);   // z 8..13 or -13..-8
    }
    for (i = 0; i < 8; i++) o.pins.push(P.at(P.cylZ(11, 2, c.mat("pin")), 0, 0, i < 4 ? 14 : -14, c.scene));   // heads z 13..15 and -15..-13
    // stand: a cross behind the diamond with a guide on each arm
    P.at(P.box(350, 44, 15, c.fixed), 0, 0, -24.5, c.scene);        // x -175..175, y -22..22, z -32..-17
    P.at(P.box(44, 350, 15, c.fixed), 0, 0, -24.5, c.scene);        // x -22..22, y -175..175
    [-1, 1].forEach(function (sd) {
      var gh = P.guideBlock({ w: 34, h: 22, d: 34, hole: 8.6, material: c.fixed });  // horizontal rod: turn so the hole runs along x
      gh.rotation.z = Math.PI / 2; P.at(gh, sd * 160, 0, 0, c.scene);                  // x 149..171 (and mirrored), y -17..17, z -17..17
      P.at(P.guideBlock({ w: 34, h: 22, d: 34, hole: 8.6, material: c.fixed }), 0, sd * 160, 0, c.scene);   // y 149..171
    });
  },

  step: function (c, dt, S) {
    var o = this.o, L = o.L, mean = (+S.controls.shape || 54) * Math.PI / 180;
    o.th += S.w * dt;
    var phi = mean + o.AMP * Math.sin(o.th), a = L * Math.cos(phi), h = L * Math.sin(phi), i;
    var N = [[-a, 0], [a, 0], [0, h], [0, -h]];    // left, right, top, bottom
    var dir = [[-1, 0], [1, 0], [0, 1], [0, -1]];
    for (i = 0; i < 4; i++) o.rods[i].span(N[i][0], N[i][1], 0, N[i][0] + dir[i][0] * o.LR, N[i][1] + dir[i][1] * o.LR, 0);
    var pairs = [[0, 2], [1, 3], [1, 2], [0, 3]];   // AC, BD front layer; CB, DA behind
    for (i = 0; i < 4; i++) {
      var p = N[pairs[i][0]], q = N[pairs[i][1]], l = o.links[i];
      l.scale.x = L; l.position.x = (p[0] + q[0]) / 2; l.position.y = (p[1] + q[1]) / 2; l.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]);
    }
    for (i = 0; i < 8; i++) o.pins[i].position.x = N[i % 4][0], o.pins[i].position.y = N[i % 4][1];
    S.set("s", (2 * a).toFixed(0) + " mm");
    S.set("u", (2 * h).toFixed(0) + " mm");
  }
});
