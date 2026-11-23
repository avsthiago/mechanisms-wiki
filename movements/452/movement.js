M507.define({
  number: 452,
  title: "Double-acting pump",
  lede: "A pump that moves water on the way down and on the way up. The cylinder is closed at both ends, so the piston has water on both sides. One side draws water in while the other side pushes it out.",
  alt: "A pump body cut open at the front. A piston slides up and down in a closed cylinder, moved by a rod through the top. A passage on the right brings water up from a pipe below. A passage on the left carries it out of a pipe at the top. Four hinged flaps, two at each end of the cylinder, let water in and out. Blue dots show the water moving.",
  parts: [
    { key: "rod", color: "#5E7387", name: "Piston rod", note: "Moves the piston. It slides through a tight packed collar on the top, called a stuffing box, so no water leaks out." },
    { key: "piston", color: "#C8873A", name: "Piston", note: "Fits the cylinder closely. It has water above it and below it." },
    { key: "valves", color: "#D9B13B", name: "Valves", note: "Four hinged flaps that let water through one way only. Watch the red marks to see which two open on each stroke." },
    { key: "body", color: "#4FA58A", name: "Pump body", note: "The closed cylinder and the passages round it. Water comes in on the right and leaves on the left." }
  ],
  closed: { label: "Pump" },
  readouts: [{ id: "q", label: "Delivered" }, { id: "s", label: "Stroke" }],
  views: { "3d": [160, 70, 690], front: [0, 32, 620], side: [620, 32, 0] },
  target: [0, 10, 0],
  how: [
    "Watch the piston go down. Above it the space gets bigger, so water is drawn in through the top right flap. Below it the space gets smaller, so water is pushed out through the bottom left flap.",
    "On the way up it is the other way round. The bottom right flap lets water in under the piston, and the top left flap lets it out above. The flaps only open one way, so water always comes in on the right and leaves on the left. No stroke is wasted.",
    "Try pausing at the very top or bottom of a stroke. All four flaps are shut there, because the piston stops for a moment. Then watch the delivered count climb on both strokes. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the pump is cut away so the inside shows. The body is drawn as a flat box, with a square piston to match, so all the passages show at once. The handle on the rod, the shape of the flaps and all the sizes were made up. The litres count assumes a made-up size for the piston.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, bm = c.mat("body"), vm = c.mat("valves"), red = c.mat("valves", "mark");
    var o = this.o = { th: Math.PI, dir: 1, q: 0, p: 0, v: [] };
    function wall(x0, x1, y0, y1) {
      c.shell(P.at(P.box(x1 - x0, y1 - y0, 36, bm), (x0 + x1) / 2, (y0 + y1) / 2, 18, scene), "closed");   // closed view: the front half, z 0 .. 36
      return P.at(P.box(x1 - x0, y1 - y0, 36, bm), (x0 + x1) / 2, (y0 + y1) / 2, -18, scene);
    }   // walls z -36 .. 0
    wall(-46, -40, -70, 70); wall(40, 46, -70, 70);                       // cylinder walls, bore x -40 .. 40, y -70 .. 70
    wall(-46, -38, 70, 76); wall(-20, 20, 70, 76); wall(38, 46, 70, 76);   // top cover, ports x -38 .. -20 and 20 .. 38
    wall(-46, -38, -76, -70); wall(-20, 20, -76, -70); wall(38, 46, -76, -70);   // bottom cover, same ports
    wall(-12, -5.5, 76, 114); wall(5.5, 12, 76, 114);                     // stuffing box, sits on the top cover (y 76); bore x -5.5 .. 5.5
    wall(-16, -5.5, 114, 120); wall(5.5, 16, 114, 120);                   // gland on the stuffing box (y 114)
    wall(-52, -12, 96, 102); wall(12, 80, 96, 102);                       // ceiling of the top chambers, meets the stuffing box at x -12 and 12
    wall(-3, 3, -96, -76);                                                 // divider under the cylinder, bottom cover y -76 down to the floor y -96
    wall(-80, 52, -102, -96);                                              // floor, open over the suction pipe x 52 .. 74
    wall(46, 52, -150, -102); wall(74, 80, -150, -102);                   // suction pipe walls, up to the floor's underside y -102
    wall(-80, -74, -96, 150);                                              // left outer wall, from the floor's top y -96, and the delivery pipe's outer side
    wall(-52, -46, 102, 150);                                              // delivery pipe's inner side, on top of the ceiling y 102
    wall(74, 80, -102, 96);                                                // right outer wall, from the suction pipe y -102 to the ceiling y 96
    scene.add(c.shell(P.prism([[-80, -102], [46, -102], [46, -150], [80, -150], [80, 102], [-46, 102], [-46, 150], [-80, 150]], -40, -36, c.mat("body", "light")), "open"));   // back half's back wall
    scene.add(c.shell(P.prism([[-80, -102], [46, -102], [46, -150], [80, -150], [80, 102], [-46, 102], [-46, 150], [-80, 150]], -40, -36, bm), "closed"));   // closed: the same back wall in the casing colour, so no pale strip shows
    scene.add(c.shell(P.prism([[-80, -102], [46, -102], [46, -150], [80, -150], [80, 102], [-46, 102], [-46, 150], [-80, 150]], 36, 40, bm), "closed"));   // closed: front wall, z 36 .. 40
    // closed: fill the stuffing box bore round the rod (rod z -23 .. -13), x -5.5 .. 5.5, y 76 .. 120
    c.shell(P.at(P.box(11, 44, 48.5, bm), 0, 98, 11.75, scene), "closed");     // z -12.5 .. 36, in front of the rod
    c.shell(P.at(P.box(11, 44, 12.5, bm), 0, 98, -29.75, scene), "closed");    // z -36 .. -23.5, behind it
    // piston x -39.5 .. 39.5, z -35.5 .. -0.5 (clear of the bore and the back wall); rod at z -18 runs up through the stuffing box
    o.pis = P.at(new T.Group(), 0, 0, 0, scene);
    P.at(P.box(79, 20, 35, c.mat("piston")), 0, 0, -18, o.pis);
    P.at(P.cylY(5, 160, c.mat("rod")), 0, 90, -18, o.pis);                 // rod y 10 .. 170 above the piston centre
    P.at(P.cylX(4.5, 56, c.mat("rod")), 0, 170, -18, o.pis);               // handle
    // flap valves: [hinge x, hinge y, which way the flap lies (-1 to the left), turn sign when opening, opens on the down stroke]
    [[39, 68.75, -1, 1, true], [-39, 77.25, 1, 1, false], [-39, -77.25, 1, -1, true], [39, -68.75, -1, -1, false]].forEach(function (d) {
      var g = P.at(new T.Group(), d[0], d[1], 0, scene);
      P.at(P.box(20, 2.5, 32, vm), d[2] * 10, 0, -18, g);                 // flap z -34 .. -2, rests on the cover face beside its port
      P.at(P.box(5, 4, 2, red), d[2] * 15, 0, -1.5, g);                    // red mark z -2.5 .. -0.5
      P.at(P.cylZ(1.6, 33, c.mat("valves", "dark")), 0, 0, -18, g);        // hinge pin
      o.v.push({ g: g, s: d[3], down: d[4], a: 0 });
    });
    var z0 = -32, z1 = -5;
    o.flow = P.pipeDots({ color: c.spot, paths: [
      { pts: [[63, -150], [63, -86]], n: 14, w: 16, z0: z0, z1: z1 },                         // 0 suction pipe
      { pts: [[60, -86], [60, 86], [29, 86], [29, 62]], n: 44, w: 16, z0: z0, z1: z1 },      // 1 up the right side, in at the top
      { pts: [[63, -86], [29, -86], [29, -62]], n: 12, w: 12, z0: z0, z1: z1 },              // 2 in at the bottom
      { pts: [[-29, 62], [-29, 86], [-63, 86]], n: 12, w: 12, z0: z0, z1: z1 },              // 3 out at the top
      { pts: [[-29, -62], [-29, -86], [-60, -86], [-60, 86]], n: 44, w: 16, z0: z0, z1: z1 },   // 4 out at the bottom, up the left side
      { pts: [[-63, 86], [-63, 158]], n: 16, w: 16, z0: z0, z1: z1 }                          // 5 delivery pipe, a little way out of its open top (y 150)
    ] });
    scene.add(o.flow);
    o.cylDots = P.waterDots(60, { radius: 2.4, color: c.spot }); scene.add(o.cylDots);
    o.cd = []; for (var i = 0; i < 60; i++) o.cd.push([-35 + 70 * Math.random(), Math.random(), z0 + (z1 - z0) * Math.random()]);
  },

  step: function (c, dt, S) {
    var o = this.o, i;
    if (S.w) o.dir = S.w > 0 ? 1 : -1;
    var th0 = o.th; o.th += S.w * dt;
    var p = 40 * Math.sin(o.th), dp = p - 40 * Math.sin(th0), cs = Math.cos(o.th) * o.dir;
    var down = cs < 0, open = .7 * Math.sqrt(Math.abs(cs));
    o.pis.position.y = p;
    o.v.forEach(function (v) { v.g.rotation.z = v.s * (v.down === down ? open : 0); });
    var ds = 2 * Math.abs(dp);                                             // water runs about twice as fast in the passages as the piston
    o.flow.move(0, ds); o.flow.move(5, ds);
    o.flow.move(1, down ? ds : 0); o.flow.move(4, down ? ds : 0);
    o.flow.move(2, down ? 0 : ds); o.flow.move(3, down ? 0 : ds);
    o.flow.flush();
    for (i = 0; i < 60; i++) {                                             // water in the cylinder stretches and squeezes with the piston
      var d = o.cd[i], y = i < 30 ? p + 12 + d[1] * (56 - p) : -68 + d[1] * (p - 12 + 68 - 2);
      o.cylDots.put(i, d[0], y, d[2], 1);
    }
    o.cylDots.flush();
    o.q += .005 * Math.abs(dp);                                            // a made-up piston: each mm of travel moves 5 cm3
    S.set("q", o.q.toFixed(1) + " L");
    S.set("s", down ? "Down" : "Up");
  }
});
