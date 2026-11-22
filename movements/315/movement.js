(function () {
  // Layout (model units, y up). The pendulum hangs from a short wire under a fixed block; the wire's lower end is the
  // pivot at (0, PY, 0), straight above the spindle. The spindle carries a level arm of two bars; the rod passes
  // between the bars and the arm pushes it round. The rod can slide along between the bars, so its tilt is set by the
  // speed alone: for a weight on a light rod, cos(tilt) = g / (w^2 * L), with L the real length to the weight.
  var PY = 195, LB = 252, LT = 360, AY = -94, G = 9.81, LREAL = .25;   // pivot height, pivot to bob centre, pivot to rod tip, arm height, g, real length (m)
  var RAD = Math.PI / 180;
  function tilt(rpm) { var w = rpm * 2 * Math.PI / 60, c = G / (w * w * LREAL); return c >= 1 ? 0 : Math.acos(c); }

  M507.define({
    number: 315,
    title: "Conical pendulum",
    lede: "A pendulum that goes round in a circle instead of swinging to and fro. Its rod sweeps out a cone. A clock driven this way runs smoothly, with no tick at all.",
    alt: "A rod hangs from a thin wire under a block. Near its lower end it carries a heavy round weight. The rod leans out to one side. Its end passes between two bars of an arm on top of an upright shaft. The shaft has a flat disc and a bevel gear on it and stands in a block on the floor.",
    parts: [
      { key: "spindle", color: "#5E7387", name: "Driving shaft", note: "An upright shaft turned by the clock's wheels through the bevel gear at its foot. It carries the arm round." },
      { key: "arm", color: "#C8873A", name: "Arm", note: "Two bars on top of the shaft with a gap between them. The rod lies in the gap and can slide along it, so the arm pushes the rod round but does not fix how far out it goes." },
      { key: "rod", color: "#D9B13B", name: "Pendulum rod", note: "The rod hangs from a short piece of round wire. The wire bends easily in any direction, so the rod can lean any way." },
      { key: "bob", color: "#8E7AA8", name: "Pendulum bob", note: "The heavy weight on the rod. Watch it go round in a circle and climb a little when you turn up the speed." }
    ],
    controls: [],
    speed: { min: 61, max: 66, value: 62, label: "Shaft speed" },
    readouts: [{ id: "cone", label: "Lean" }, { id: "rise", label: "Bob rises" }],
    views: { "3d": [330, 170, 780], front: [70, 0, 880], side: [880, 0, 70] },
    target: [70, -5, 0],
    how: [
      "The driving shaft turns the arm. The arm pushes the rod round, and the rod leans out and sweeps a cone. The heavy weight, called the bob, goes round in a level circle. It never stops and turns back, so nothing ticks.",
      "Going round in a circle needs a pull towards the middle. The leaning rod gives it: the weight hangs from the wire, and the lean turns part of that pull inwards. Faster turning needs more inward pull, so the rod leans further and the bob climbs. A real pendulum about as long as a ruler would have to turn about once a second.",
      "Below a certain speed the rod hangs straight. Just above it, a small change in speed makes a big change in lean. Move the speed from the slowest to the fastest and watch the cone open up."
    ],
    note: "This model is rebuilt from Brown's drawing. The bars of the arm are made up, so that the rod can slide out as it leans further; Brown does not show how the rod's end is held. The block on the floor and the sizes were made up, and the clock wheels that drive the bevel gear are left out. The lean is worked out for a pendulum as long as a ruler, treating the rod as weightless. The speeds are only those at which the rod still reaches the arm.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, ms = c.mat("spindle"), ma = c.mat("arm"), mr = c.mat("rod"), mb = c.mat("bob");
      var o = this.o = { psi: 0, th: tilt(62) };
      // fixed block the wire hangs from
      P.at(P.box(110, 22, 50, c.fixed), 0, PY + 21, 0, scene);                          // y 205..227
      P.at(P.box(16, 10, 16, c.fixed), 0, PY + 5, 0, scene);                            // clamp y 195..205 under the block; the wire leaves its bottom face at the pivot
      // pendulum: yaw, then lean, then un-yaw, so the rod leans out without twisting round its own length
      o.yaw = new T.Group(); o.yaw.position.set(0, PY, 0); scene.add(o.yaw);
      o.lean = new T.Group(); o.yaw.add(o.lean);
      o.unyaw = new T.Group(); o.lean.add(o.unyaw);
      var pd = o.unyaw;
      P.at(P.cylY(1.2, 22, mr), 0, -11, 0, pd);                                         // wire y 0..-22, from the clamp face at the pivot
      P.at(P.cylY(5, 10, mr), 0, -27, 0, pd);                                          // collar y -22..-32
      P.at(P.cylY(3, LT - 32, mr), 0, -(LT + 32) / 2, 0, pd);                          // rod y -32..-LT
      P.at(P.sphere(3, mr), 0, -LT, 0, pd);                                            // rounded end
      P.at(P.cylY(22, 68, mb), 0, -LB, 0, pd);                                         // bob y -218..-286
      P.at(P.cylY(23, 6, c.mat("bob", "dark")), 0, -LB, 0, pd);                         // band round the middle, 1 proud of the side
      // spindle, disc, gear and arm turn together
      o.spin = new T.Group(); scene.add(o.spin);
      P.at(P.box(18, 22, 18, ms), 0, AY - 3, 0, o.spin);                               // boss y -108..-86 on top of the spindle
      P.at(P.cylY(4, 87, ms), 0, -151.5, 0, o.spin);                                   // spindle y -108..-195
      P.at(P.cylY(56, 8, ms), 0, -124, 0, o.spin);                                     // disc y -128..-120
      P.at(P.box(4, 1, 30, c.mat("spindle", "mark")), 40, -119.5, 0, o.spin);          // red stripe on the disc top, y -120..-119
      var gear = P.bevelGearCone({ radius: 26, teeth: 20, cone: 55, hub: 7, hubLength: 14, material: ms });
      P.at(gear, 0, -128 - gear.backY, 0, o.spin);                                      // top of its hub on the disc's underside at y -128
      // arm: two bars with the rod's gap between them, z -6..-3 and 3..6
      [-4.5, 4.5].forEach(function (z) { P.at(P.box(262, 4, 3, ma), 99, AY, z, o.spin); });   // x -32..230, y -96..-92
      P.at(P.box(4, 4, 12, ma), 229, AY, 0, o.spin);                                   // cross piece joining the bar ends, x 227..231
      // foot the spindle stands in
      P.at(P.cylY(9, 8, c.fixed), 0, -199, 0, scene);                                  // socket y -203..-195, the spindle ends on its top face
      P.at(P.box(90, 20, 60, c.fixed), 0, -213, 0, scene);                              // block y -223..-203
    },

    step: function (c, dt, S) {
      var o = this.o;
      if (S.playing) { o.psi += S.w * dt; var t = tilt(S.rpm); o.th += (t - o.th) * Math.min(1, dt * 1.5); }
      o.spin.rotation.y = o.psi;
      o.yaw.rotation.y = o.psi; o.lean.rotation.z = o.th; o.unyaw.rotation.y = -o.psi;
      S.set("cone", Math.round(o.th / RAD) + "°");
      S.set("rise", (LREAL * (1 - Math.cos(o.th)) * 100).toFixed(1) + " cm");
    }
  });
})();
