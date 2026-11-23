M507.define({
  number: 365,
  title: "Rod between skewed rollers",
  lede: "A round rod is gripped between two rollers that cross at a slant. When the rollers turn, the rod slides along and spins at the same time. Feeding a rod this way gives it a steady screw-like motion without cutting a thread on it.",
  alt: "An upright round rod squeezed between two long rollers, one in front and one behind. The rollers are tilted opposite ways so they cross like a narrow X. A red mark on the rod shows it sliding and turning.",
  parts: [
    { key: "front", color: "#5E7387", name: "Front roller", note: "A long roller pressed against the front of the rod. It is tilted, so its surface rubs the rod on a slant." },
    { key: "back", color: "#C8873A", name: "Back roller", note: "Pressed against the back of the rod and tilted the other way. It turns the opposite way to the front roller, as a pair of squeezing rollers do." },
    { key: "rod", color: "#4FA58A", name: "Rod", note: "Held only by the two rollers. Watch the red mark: it moves up or down and round at the same time." }
  ],
  controls: [{ type: "range", id: "d", label: "Roller tilt", min: 0, max: 60, step: 1, value: 15, unit: "°",
    presets: [[0, "Level"], [15, "As drawn"], [45, "Steep"]] }],
  readouts: [{ id: "v", label: "Rod slides" }, { id: "w", label: "Rod turns" }],
  views: { "3d": [410, 210, 650], front: [0, 0, 700], side: [700, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Both rollers turn, in opposite directions. Where each one touches the rod, its surface moves square to its own axle. Because the axles are tilted, that movement is on a slant across the rod.",
    "A slanting push has two parts. The up or down part slides the rod along. The sideways part rolls the rod round. The front roller pushes the front of the rod one way and the back roller pushes the back of it the other way, so both work together to spin it. The rod does not slip on either roller. So its surface moves just like the rollers' surfaces, and the red mark runs along a screw-shaped path.",
    "The model turns the rollers back each time the rod reaches the end of its travel. Try Level, where the rod only slides. Then try Steep, where it turns fast and slides slowly."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the rollers and the rod. The tilting brackets, the posts and the feet were made up to hold them, and the sizes are made up too. Real rollers would need springs to squeeze the rod, and a drive to turn them. Here the rollers simply turn back at each end of the rod's travel so it never runs out.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var r = 11, R = 20, Lr = 200, Lrod = 300;
    var o = this.o = { r: r, R: R, travel: 40, y: 0, spinRod: 0, spinF: 0, dir: 1, holders: {}, spins: {} };
    // rod: y -150..150 about its centre; it slides up to 40 either way, so its ends stay within y -190..190
    o.rod = new T.Group(); scene.add(o.rod);
    o.rod.add(P.cylY(r, Lrod, c.mat("rod")));
    P.at(P.box(3, 36, .8, c.mat("rod", "mark")), 0, 40, r + .5, o.rod);                  // red mark on the front, z r+0.1..r+0.9
    // rollers: holder at the roller centre, turned about Z by the tilt; spin group turns about the holder's X (the axle)
    [["front", 1], ["back", -1]].forEach(function (e) {
      var key = e[0], s = e[1], h = new T.Group(), sp = new T.Group();
      h.position.set(0, 0, s * (r + R)); scene.add(h); h.add(sp);
      sp.add(P.cylX(R, Lr, c.mat(key)));                                                  // roller x -100..100
      P.at(P.box(Lr - 10, 3, .8, c.mat(key, "dark")), 0, R + .5, 0, sp);                 // stripe along the roller, y R+0.1..R+0.9
      sp.add(P.cylX(5, 206, c.mat(key)));                                                // axle x -103..103, ends at the bracket arms' inner faces
      // bracket (support), in the holder's frame; its outward side is +z for the front roller, -z for the back one
      [1, -1].forEach(function (q) { P.at(P.box(6, 16, 47, c.fixed), q * 106, 0, s * 16.5, h); });   // arms x 103..109, z from -7 to 40 outward (covers the axle end)
      P.at(P.box(206, 8, 6, c.fixed), 0, 0, s * 37, h);                                  // bar x -103..103 between the arms, y -4..4, z 34..40 outward
      P.at(P.cylZ(4, 12, c.fixed), 0, 0, s * 46, h);                                     // pivot pin z 40..52 outward (world |z| 71..83)
      o.holders[key] = h; o.spins[key] = sp;
    });
    [1, -1].forEach(function (s) {
      P.at(P.box(16, 198, 12, c.fixed), -60, -91, s * 89, scene);                        // post x -68..-52, y -190..8, |z| 83..95 (to one side, so it does not hide the rod)
      P.at(P.box(60, 16, 12, c.fixed), -22, 0, s * 89, scene);                           // arm x -52..8, y -8..8, |z| 83..95, carries the pivot pin
      P.at(P.box(80, 12, 40, c.fixed), -60, -196, s * 89, scene);                        // foot x -100..-20, y -202..-190, |z| 69..109; the rod (|z| < 11) hangs clear between the feet
    });
  },

  // Speeds of the rod for front roller speed wf (rad/s) and tilt d (radians), from no slip at both contacts.
  _rod: function (wf, d, r, R) {
    var v = wf * R * Math.cos(d);            // front roller surface at the contact: wf * (axis x (0, 0, -R)) = wf R (-sin d, cos d, 0)
    var spin = -wf * R * Math.sin(d) / r;    // the front of the rod moves sideways at spin * r
    return { v: v, spin: spin, wb: -wf };    // the back roller, tilted the other way, must turn at the opposite speed
  },

  step: function (c, dt, S) {
    var o = this.o, d = (S.controls.d === undefined ? 15 : +S.controls.d) * Math.PI / 180;
    o.holders.front.rotation.z = d; o.holders.back.rotation.z = -d;
    var k = this._rod(o.dir * S.w, d, o.r, o.R);
    o.y += k.v * dt; o.spinRod += k.spin * dt; o.spinF += o.dir * S.w * dt;
    if (o.y > o.travel) { o.y = o.travel; o.dir = -1; }
    if (o.y < -o.travel) { o.y = -o.travel; o.dir = 1; }
    o.rod.position.y = o.y; o.rod.rotation.y = o.spinRod;
    o.spins.front.rotation.x = o.spinF; o.spins.back.rotation.x = -o.spinF;
    function sg(v) { v = Math.round(v); return (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v); }
    S.set("v", sg(k.v) + " mm/s");
    S.set("w", sg(k.spin * 60 / (2 * Math.PI)) + " rpm");
  }
});
