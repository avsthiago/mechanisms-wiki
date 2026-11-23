M507.define({
  number: 387,
  title: "Self-levelling wharf steps",
  lede: "A ladder joins a wharf to a floating boat. As the tide goes down, the boat sinks and the ladder slopes more and more. Its steps stay flat the whole time, so they are always safe to stand on.",
  alt: "A wharf with a railing on the right and a boat on the water on the left. A ladder made of two long bars, one above the other, runs from a post on the wharf to a post on the boat. Flat steps hang between the lower bars, each held by a slanting rod from the upper bar.",
  parts: [
    { key: "posts", color: "#5E7387", name: "Wharf posts", note: "Upright posts on the edge of the wharf. The ladder bars turn on pins in them." },
    { key: "bars", color: "#D9B13B", name: "String pieces and hand rails", note: "The lower bars carry the steps; the upper bars are the hand rails. The four bars and the two pairs of posts form a frame whose sides stay parallel." },
    { key: "steps", color: "#C8873A", name: "Steps", note: "Each step turns on a pin at its back edge. Watch the red stripe on one step: it stays flat." },
    { key: "rods", color: "#4FA58A", name: "Rods", note: "Each rod hangs from the hand rail and holds up the front edge of one step." },
    { key: "boat", color: "#8E7AA8", name: "Boat and its posts", note: "Floats up and down with the tide. Its posts stay upright, and it drifts in a little as the ladder tips." }
  ],
  controls: [{ type: "range", id: "low", label: "How far the tide falls", min: 40, max: 140, step: 5, value: 110, unit: " cm",
    presets: [[50, "A little"], [110, "Normal"], [140, "A lot"]] }],
  speed: { min: 1, max: 12, value: 4, label: "Tide speed", unit: " a min" },
  readouts: [{ id: "t", label: "Tide down" }, { id: "s", label: "Ladder slope" }],
  views: { "3d": [-20, 140, 1000], front: [-110, 40, 820], side: [-760, 120, 380] },
  target: [-150, 30, 0],
  how: [
    "At high tide the boat is level with the wharf and the ladder lies flat. As the water falls, the boat sinks and the far end of the ladder goes down. The steps stay flat all the same.",
    "Each step turns on a pin at its back edge, in the lower bar. A rod hangs from the hand rail straight above that pin and holds the front edge. The rod, the step and the bit of post between the bars make a triangle that cannot change shape. The bars only slide that triangle along without turning it, because the posts on the boat stay upright like the posts on the wharf.",
    "Try a small fall of tide, then a large one. The ladder tips further, but the red step stays flat."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows the ladder at high and at low tide. Here the tide moves between the two. The boat is allowed to drift in towards the wharf as the ladder tips, since the ladder cannot stretch. The width of the ladder, the pins, the wharf and all sizes are made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { Lg: 320, H: 130, Y0: 20, ph: 0, n: 7, sp: 40, s0: 40, w: 30, steps: [], rods: [] };
    // wharf: top at y = 0, front face at x = -15
    P.at(P.box(265, 220, 220, c.fixed), 117.5, -110, 0, scene);               // x -15..250, y -220..0, z -110..110
    var mp = c.mat("posts");
    [-60.5, 60.5].forEach(function (z) {
      P.at(P.box(20, 175, 16, mp), 0, 87.5, z, scene);                       // post x -10..10, y 0..175 (on the wharf top), z ±52.5..68.5
      P.at(P.sphere(12, mp), 0, 185, z, scene);
      [o.Y0, o.Y0 + o.H].forEach(function (y) { P.at(P.cylZ(3.5, 25, mp), 0, y, Math.sign(z) * 57.5, scene); });   // pivot pins z 44..70 into bar and post
      // railing on the wharf (scenery): far post, two rails and a cross brace
      P.at(P.box(16, 175, 16, c.fixed), 150, 87.5, z, scene);                // x 142..158, y 0..175
      P.at(P.sphere(12, c.fixed), 150, 185, z, scene);
      P.at(P.box(132, 12, 10, c.fixed), 76, 146, z, scene);                  // rail x 10..142 (post faces), y 140..152
      P.at(P.box(132, 12, 10, c.fixed), 76, 27, z, scene);                   // rail x 10..142, y 21..33
      var dl = Math.hypot(132, 107), an = Math.atan2(107, 132);
      var d1 = P.at(P.box(dl, 8, 6, c.fixed), 76, 86.5, z, scene); d1.rotation.z = an;
      var d2 = P.at(P.box(dl, 8, 6, c.fixed), 76, 86.5, z + Math.sign(z) * .8, scene); d2.rotation.z = -an;   // set 0.8 apart so the crossing faces never share a plane
    });
    // the four bars: local X along the bar from its pivot on the wharf post, centre lines y = 0
    var mb = c.mat("bars");
    o.bars = [];
    [[o.Y0, -48], [o.Y0, 48], [o.Y0 + o.H, -48], [o.Y0 + o.H, 48]].forEach(function (q) {
      var g = P.at(new T.Group(), 0, q[0], 0, scene);
      P.at(P.box(o.Lg + 24, 10, 8, mb), o.Lg / 2, 0, q[1], g);               // x -12..Lg+12, z ±44..52
      o.bars.push(g);
    });
    // steps: board from the pivot at its back edge (x = 0) out to x = -w, z -40..40; pins into the string bars
    var ms = c.mat("steps");
    for (var i = 0; i < o.n; i++) {
      var s = P.at(new T.Group(), 0, 0, 0, scene);
      P.at(P.box(o.w, 5, 80, ms), -o.w / 2, 0, 0, s);                         // board x -30..0, y -2.5..2.5
      P.at(P.cylZ(2.5, 96, ms), 0, 0, 0, s);                                  // pivot pin z -48..48, ends inside the bars
      P.at(P.cylZ(2.5, 88, ms), -o.w, 0, 0, s);                               // front pin for the rods, z -44..44
      if (i === 3) P.at(P.box(o.w - 6, 1, 6, c.mat("steps", "mark")), -o.w / 2, 3, 0, s);   // red stripe y 2.5..3.5, sitting on the board top
      o.steps.push(s);
      var mr = c.mat("rods");
      o.rods.push([P.at(P.rod(1.5, mr), 0, 0, 0, scene), P.at(P.rod(1.5, mr), 0, 0, 0, scene)]);
      o.rods[i].pins = [-1, 1].map(function (sd) { var p = P.at(P.cylZ(2.2, 6, mr), 0, 0, sd * 43, scene); return p; });   // rod eye pins z ±40..46, into the rail
    }
    // boat: origin at its post's lower pivot; deck at y = -20, keel at -48, water line at -35
    var B = o.boat = new T.Group(); scene.add(B);
    var mbo = c.mat("boat");
    var hull = P.outlinePlate({ points: [[-64, -20], [54, -20], [40, -48], [-50, -48]], depth: 160, z0: -80, material: mbo });
    B.add(hull);
    [-60.5, 60.5].forEach(function (z) {
      P.at(P.box(16, 185, 16, mbo), 0, 62.5, z, B);                           // post y -30..155, foot inside the hull
      P.at(P.sphere(12, mbo), 0, 165, z, B);
      [0, o.H].forEach(function (y) { P.at(P.cylZ(3.5, 25, mbo), 0, y, Math.sign(z) * 57.5, B); });
    });
    // water: a see-through block whose top is the tide level
    var wm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .28, depthWrite: false });
    o.water = P.at(P.box(470, 1, 260, wm), -250.5, 0, 0, scene);              // x -485.5..-15.5, clear of the wharf face
  },

  step: function (c, dt, S) {
    var o = this.o, low = +S.controls.low;
    o.ph += S.w * dt;
    var drop = low * (.5 - .5 * Math.cos(o.ph)), al = Math.asin(drop / o.Lg), ux = -Math.cos(al), uy = -Math.sin(al);
    o.bars.forEach(function (g) { g.rotation.z = Math.PI + al; });
    var Bx = o.Lg * ux, By = o.Y0 + o.Lg * uy;
    o.boat.position.set(Bx, By, 0);
    for (var i = 0; i < o.n; i++) {
      var s = o.s0 + i * o.sp, Sx = s * ux, Sy = o.Y0 + s * uy, Ex = Sx - o.w, Ry = Sy + o.H;
      o.steps[i].position.set(Sx, Sy, 0);                                     // steps never turn: the rod triangle keeps them flat
      o.rods[i][0].span(Sx, Ry, -42, Ex, Sy, -42); o.rods[i][1].span(Sx, Ry, 42, Ex, Sy, 42);
      o.rods[i].pins[0].position.set(Sx, Ry, -43); o.rods[i].pins[1].position.set(Sx, Ry, 43);
    }
    var lvl = By - 35, hgt = lvl + 220;
    o.water.scale.y = hgt; o.water.position.y = -220 + hgt / 2;
    S.set("t", Math.round(drop) + " cm");
    S.set("s", Math.round(al * 180 / Math.PI) + "°");
  }
});
