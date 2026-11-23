M507.define({
  number: 25,
  title: "Bevel gears",
  lede: "Two gears with sloping teeth turn the motion round a corner. Here an upright shaft drives a level one. When both gears are the same size they are called mitre gears.",
  alt: "A bevel gear on an upright shaft meshes with a bevel gear on a level shaft at a right angle. The upright shaft hangs from an arm of an L-shaped stand, and the level shaft ends at the stand's post with a red pointer near its end.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "On the upright shaft. It does the driving. The dark stripe on its shaft shows it turning." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "Its sloping teeth fit into the teeth of the driving gear, at a right angle to it." },
    { key: "out", color: "#4FA58A", name: "Driven shaft", note: "The level shaft, turned by the driven gear. Watch the red pointer to see how fast it goes." }
  ],
  controls: [{ id: "pair", label: "Gear sizes", value: "mitre", options: [["mitre", "Equal (mitre)"], ["down", "Big drives small"], ["up", "Small drives big"]] }],
  readouts: [{ id: "in", label: "Upright" }, { id: "out", label: "Level" }],
  views: { "3d": [170, 230, 760], front: [-50, 40, 820], side: [820, 60, 120] },
  target: [-50, 40, 0],
  how: [
    "Each gear is cut on a slope, like a slice off the side of a cone. The teeth of one fit into the teeth of the other where the two slopes touch. So the upright shaft turns the level shaft, at a right angle to it.",
    "Imagine each slope carried on inwards until it comes to a point. Both points meet at the same spot, where the two shafts would cross. That is what lets the teeth roll smoothly on each other. Equal gears each slope at half a right angle, like the cut ends that meet in the corner of a picture frame. That cut is called a mitre.",
    "With equal gears both shafts turn at the same speed. A big gear driving one half its size makes it turn twice as fast. Try Equal, then Big drives small, then Small drives big, and watch the red pointer."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws one pair of about equal size. The stand, the sizes, the number of teeth and the two unequal pairs were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = 180 / Math.PI;
    var o = this.o = { a: 0, sets: {} };
    // Each pair shares its pitch-cone apex at the origin. tan(cone of the top gear) = top radius / side radius, so the two cones add to 90 degrees.
    function pair(id, r1, n1, r2, n2) {
      var s = { g: new T.Group(), n1: n1, n2: n2 }, cone1 = Math.atan2(r1, r2) * D;
      scene.add(s.g);
      s.top = P.bevelGearCone({ radius: r1, teeth: n1, cone: cone1, material: c.mat("drive") }); s.g.add(s.top);
      var b1 = s.top.backY, L1 = 240 - b1;
      P.at(P.cylY(12, L1, c.mat("drive")), 0, b1 - 10 + L1 / 2, 0, s.top);               // upright shaft y b1-10..230, ends at the arm's underside
      P.at(P.box(2, 36, 5, c.mat("drive", "dark")), 13, 200, 0, s.top);                 // stripe x 12..14 off the shaft, y 182..218
      var outer = new T.Group(); outer.rotation.z = Math.PI / 2; s.g.add(outer);         // local +Y points to world -X
      s.side = P.bevelGearCone({ radius: r2, teeth: n2, cone: 90 - cone1, material: c.mat("driven") }); outer.add(s.side);
      var b2 = s.side.backY, L2 = 240 - b2;
      P.at(P.cylY(12, L2, c.mat("out")), 0, b2 - 10 + L2 / 2, 0, s.side);               // level shaft x -(b2-10)..-230, ends at the post's face
      P.at(P.cylY(26, 5, c.mat("out")), 0, 205, 0, s.side);                              // disc, local y 202.5..207.5
      P.at(P.box(42, 5, 7, c.mat("out", "mark")), 23, 200, 0, s.side);                   // pointer local y 197.5..202.5, on the disc face towards the gear
      o.sets[id] = s;
    }
    pair("mitre", 90, 24, 90, 24);
    pair("down", 120, 32, 60, 16);
    pair("up", 60, 16, 120, 32);
    // stand, an upside-down L
    P.at(P.box(16, 408, 40, c.fixed), -238, 46, 0, scene);       // post x -246..-230, y -158..250, z -20..20; level shaft ends at x -230
    P.at(P.box(250, 20, 40, c.fixed), -105, 240, 0, scene);      // arm x -230..20, y 230..250, z -20..20; meets the post at x -230; upright shaft ends at y 230
    P.at(P.box(420, 12, 180, c.fixed), -50, -164, 0, scene);     // base x -260..160, y -170..-158, z -90..90; post stands on y -158
  },

  step: function (c, dt, S) {
    var o = this.o, k, cur = o.sets[S.controls.pair] || o.sets.mitre, r = cur.n1 / cur.n2;
    o.a += S.w * dt;
    for (k in o.sets) o.sets[k].g.visible = o.sets[k] === cur;
    cur.top.rotation.y = o.a;
    cur.side.rotation.y = -o.a * r + cur.side.pitch / 2;   // speed in inverse ratio of teeth, half a tooth offset to mesh
    function f(v) { return Math.round(v * 10) / 10 + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm * r));
  }
});
