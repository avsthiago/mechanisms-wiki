M507.define({
  number: 95,
  title: "Tilted disc and rod",
  lede: "A disc is fixed on an upright shaft, but set at a slant. As the shaft turns, the disc wobbles, and an upright rod resting on it is pushed up and lets itself down again. A turning motion becomes a straight up-and-down one.",
  alt: "An upright shaft passes through a bearing block on a wall. On top of the shaft sits a flat round disc, tilted to one side. An upright rod, held by two guides on a post, rests on the high edge of the disc.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Shaft and tilted disc", note: "The shaft turns in its bearing. The disc is fixed to it at a slant, so its edge goes up and down as it turns." },
    { key: "rod", color: "#C8873A", name: "Rod", note: "It rests on the disc by its own weight and slides up and down in two guides. Its rounded end rubs along the disc." },
    { key: "mark", color: "#C2503F", name: "Marker ring", note: "A ring on the rod. Watch it rise and fall, once for every turn of the shaft." }
  ],
  controls: [{ id: "tilt", label: "Slant of the disc", value: "13", options: [["6", "Small"], ["13", "As drawn"], ["22", "Steep"]] }],
  readouts: [{ id: "w", label: "Shaft" }, { id: "t", label: "Rod travel" }],
  views: { "3d": [820, 240, 720], front: [20, 90, 1150], side: [1150, 90, 0] },
  target: [40, 90, 0],
  distance: [400, 2600],
  how: [
    "The rod stands over the edge of the disc, and its rounded end rests on the top face. When the high side of the disc is under the rod, the rod is at its highest. Half a turn later the low side is under it and the rod has sunk.",
    "The rod always sits exactly on the disc, so its height is just the height of the disc surface beneath it. The disc is flat and tilted, so the height rises and falls smoothly, once for each turn. The rod moves straight up and down, never sideways.",
    "The steeper the slant, the farther the rod moves. Try Small, then Steep, and watch the red ring and the travel reading."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the round end on the rod, the two guides and the post that holds them, the hub, the collar and the end of the shaft were made up. Brown shows the rod resting on the disc with no guide, so a guide was added to keep it upright. The rod is held down only by its weight. The Small and Steep slants were added for comparison.",

  // Units: 1 unit is 1 mm. Shaft on the Y axis; bearing centre at y 0.
  K: { HY: 85, R: 125, T: 8, XR: 100, RR: 6, RL: 200, MK: 175 },

  // Height of the centre of the rod's round end when the shaft is turned by th and the disc is tilted by a (radians).
  // Disc top face: plane through the hub with normal n = (-sin a cos th, cos a, sin a sin th); the ball sits 1 radius above it along n.
  tip: function (th, a) {
    var K = this.K, ny = Math.cos(a);
    return K.HY + (K.T / 2) / ny + K.XR * Math.tan(a) * Math.cos(th) + K.RR / ny;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { th: 0, a: 13 * Math.PI / 180, goal: 13 * Math.PI / 180 };
    // shaft, collar, hub and disc turn together
    o.shaft = new T.Group(); scene.add(o.shaft);
    P.at(P.cylY(16, 160, c.mat("disc")), 0, -50, 0, o.shaft);                          // shaft y -130..30, through the bearing hole
    P.at(P.cylY(22, 10, c.mat("disc")), 0, -33, 0, o.shaft);                           // collar y -38..-28, under the bearing face
    P.at(P.mesh(new T.CylinderGeometry(30, 16, 50, 40), c.mat("disc")), 0, 53, 0, o.shaft);   // hub y 28..78, from the bearing top into the disc
    o.disc = new T.Group(); o.disc.position.set(0, K.HY, 0); o.shaft.add(o.disc);      // tilts about the hub centre
    P.at(P.cylY(K.R, K.T, c.mat("disc")), 0, 0, 0, o.disc);                            // disc y -4..4 in its own frame
    P.at(P.box(90, 1, 8, c.mat("disc", "dark")), 75, K.T / 2 + 1, 0, o.disc);          // stripe on the top face, x 30..120, lifted 0.5..1.5
    // the rod: round end at the local origin, then the shaft of the rod upward
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.sphere(K.RR, c.mat("rod")), 0, 0, 0, o.rod);
    P.at(P.cylY(4, K.RL, c.mat("rod")), 0, K.RL / 2, 0, o.rod);
    P.at(P.cylY(6.5, 5, c.mat("mark")), 0, K.MK, 0, o.rod);                           // marker ring, above the upper guide at all times
    o.rod.position.x = K.XR;
    // supports (all fixed)
    P.at(P.guideBlock({ w: 104, h: 56, d: 60, hole: 16.5, hx: -24, material: c.fixed }), 24, 0, 0, scene);   // bearing x -28..76, y -28..28, z -30..30
    P.at(P.box(104, 190, 90, c.fixed), 128, -75, 0, scene);                            // wall x 76..180, y -170..20, z -45..45
    P.at(P.box(20, 210, 24, c.fixed), 150, 125, 0, scene);                             // post x 140..160, y 20..230, on the wall top
    P.at(P.guideBlock({ w: 65, h: 14, d: 30, hole: 4.5, hx: -7.5, material: c.fixed }), 107.5, 175, 0, scene);   // lower guide x 75..140, y 168..182
    P.at(P.guideBlock({ w: 65, h: 14, d: 30, hole: 4.5, hx: -7.5, material: c.fixed }), 107.5, 215, 0, scene);   // upper guide x 75..140, y 208..222
    this.place(o);
  },

  place: function (o) {
    o.shaft.rotation.y = o.th;
    o.disc.rotation.z = o.a;
    o.rod.position.y = this.tip(o.th, o.a);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    o.goal = (+S.controls.tilt || 13) * Math.PI / 180;
    o.a += (o.goal - o.a) * Math.min(1, dt * 8);
    if (Math.abs(o.goal - o.a) < 1e-4) o.a = o.goal;
    o.th += S.w * dt;
    this.place(o);
    var mid = this.tip(Math.PI / 2, o.a), d = o.rod.position.y - mid;
    S.set("w", Math.round(S.w * 30 / Math.PI) + " rpm");
    S.set("t", (d >= 0 ? "+" : "") + d.toFixed(1) + " mm");
  }
});
