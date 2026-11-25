M507.define({
  number: 453,
  title: "Double lantern-bellows pump",
  lede: "Two round bellows stand side by side on a hollow base, worked by one lever. As one bellows is pulled open it sucks water up the pipe below. At the same time the other is squeezed and pushes its water out of the pipe at the top.",
  alt: "A lever pivoted at the middle on a post. Rods hang from it to the tops of two round folding bellows. The bellows stand on a hollow base cut open at the front. Below the base is a curved chamber with a suction pipe at the bottom. A delivery pipe rises from the middle of the base and bends to the left. Small hinged flaps let water in and out, and blue dots show the water.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Lever and rods", note: "Rocks on a pin in the middle. As one end goes up the other goes down, so the two bellows always move opposite ways." },
    { key: "bellows", color: "#C8873A", name: "Bellows", note: "Round bags with folding leather sides and a stiff top board. Pulling the top up makes room inside; pushing it down squeezes the water out." },
    { key: "valves", color: "#D9B13B", name: "Valves", note: "Four hinged flaps that let water through one way only. Two let water in from below, two let it out to the middle pipe. Watch the red marks." },
    { key: "body", color: "#4FA58A", name: "Base and pipes", note: "The hollow base, the chamber under it with the suction pipe, and the delivery pipe in the middle." }
  ],
  closed: { label: "Pump" },
  readouts: [{ id: "q", label: "Delivered" }, { id: "s", label: "Pushing" }],
  views: { "3d": [328, 204, 704], front: [0, 50, 700], side: [700, 50, 0] },
  target: [0, 25, 0],
  how: [
    "Watch the left bellows open. The flap under it lifts and water rushes up from the suction pipe to fill the space. Meanwhile the right bellows is squeezed. Its water cannot go back down, because its bottom flap is shut, so it pushes open a flap into the middle pipe.",
    "When the lever rocks back, the two bellows swap jobs. One is always filling while the other is emptying. So water leaves the top pipe on every stroke of the lever, not just every other one.",
    "Try pausing just as the lever is level. Two flaps are open and two are shut. Look at which way each one opens and follow the blue dots through it. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the base, pipes and bellows is cut away so the inside shows. The base is drawn as a flat box so all the passages show at once. The post is cut off at the top, as in the drawing. The bend at the top of the delivery pipe, the shape of the flaps and all the sizes were made up. The litres count assumes a made-up size for the bellows.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, bm = c.mat("body"), vm = c.mat("valves"), red = c.mat("valves", "mark"), i;
    var o = this.o = { th: -1.2, dir: 1, q: 0, v: [], Yp: 200, Lr: 84, XB: 95, A: .25, bel: [], H: [null, null] };
    function wall(x0, x1, y0, y1) {
      c.shell(P.at(P.box(x1 - x0, y1 - y0, 50, bm), (x0 + x1) / 2, (y0 + y1) / 2, 25, scene), "closed");   // closed view: the front half, z 0 .. 50
      return P.at(P.box(x1 - x0, y1 - y0, 50, bm), (x0 + x1) / 2, (y0 + y1) / 2, -25, scene);
    }   // walls z -50 .. 0
    wall(-150, -144, 0, 40); wall(144, 150, 0, 40);                          // base ends, y 0 .. 40
    wall(-144, -70, 0, 6); wall(-46, 46, 0, 6); wall(70, 144, 0, 6);       // base floor, suction ports x 46 .. 70 each side
    wall(-144, -120, 34, 40); wall(-70, -16, 34, 40); wall(16, 70, 34, 40); wall(120, 144, 34, 40);   // top plate, open under each bellows and the pipe
    wall(-28, -22, 6, 12); wall(-28, -22, 28, 34); wall(22, 28, 6, 12); wall(22, 28, 28, 34);         // walls of the middle chamber, floor y 6 to plate y 34, ports y 12 .. 28
    wall(16, 22, 40, 116); wall(-40, 16, 110, 116);                          // delivery pipe: right side and top, on the plate (y 40)
    wall(-22, -16, 40, 86); wall(-40, -16, 86, 92);                          // left side, and the spout's floor; spout open at x -40, y 92 .. 110
    var ga = Math.asin(15 / 97), arcL = [], arcR = [], back = [];
    for (i = 0; i <= 24; i++) {                                               // curved chamber under the base: wall centre r 97 (94 .. 100), meets the floor's underside y 0
      var a1 = Math.PI + (Math.PI / 2 - ga) * i / 24, a2 = 1.5 * Math.PI + ga + (Math.PI / 2 - ga) * i / 24;
      arcL.push([97 * Math.cos(a1), 97 * Math.sin(a1)]); arcR.push([97 * Math.cos(a2), 97 * Math.sin(a2)]);
    }
    scene.add(P.curvedVane({ path: arcL, thickness: 6, depth: 50, z0: -50, material: bm }));
    scene.add(P.curvedVane({ path: arcR, thickness: 6, depth: 50, z0: -50, material: bm }));
    scene.add(c.shell(P.curvedVane({ path: arcL, thickness: 6, depth: 50, z0: 0, material: bm }), "closed"));   // closed: front halves, z 0 .. 50
    scene.add(c.shell(P.curvedVane({ path: arcR, thickness: 6, depth: 50, z0: 0, material: bm }), "closed"));
    wall(-21, -15, -170, -95); wall(15, 21, -170, -95);                     // suction pipe x -15 .. 15, its walls reach into the curved wall
    back.push([-150, 40], [-22, 40], [-22, 86], [-40, 86], [-40, 116], [22, 116], [22, 40], [150, 40], [150, 0], [100, 0]);
    for (i = 0; i <= 24; i++) { var b = -(Math.PI / 2 - ga) * i / 24; back.push([100 * Math.cos(b), 100 * Math.sin(b)]); }
    back.push([21, -170], [-21, -170]);
    for (i = 24; i >= 0; i--) { var e = Math.PI + (Math.PI / 2 - ga) * i / 24; back.push([100 * Math.cos(e), 100 * Math.sin(e)]); }
    back.push([-150, 0]);
    scene.add(c.shell(P.prism(back, -54, -50, c.mat("body", "light")), "open"));   // back wall of the cut-away half
    scene.add(c.shell(P.prism(back, -54, -50, bm), "closed"));             // closed: the same back wall in the casing colour, so no pale edge shows
    scene.add(c.shell(P.prism(back, 50, 54, bm), "closed"));               // closed: front wall, z 50 .. 54
    // bellows: base ring y 40 .. 44 on the plate, leather from 44 up to the top board, all cut at z = 0
    [-1, 1].forEach(function (s, k) {
      var g = P.at(new T.Group(), s * o.XB, 40, 0, scene), m = c.mat("bellows");
      g.add(c.shell(P.halfSection({ poly: [[30, 0], [46, 0], [46, 4], [30, 4]], material: bm }), "open"));
      g.add(c.shell(P.wholeSection({ poly: [[30, 0], [46, 0], [46, 4], [36.5, 4], [36.5, 3.5], [33, 3.5], [33, 4], [30, 4]], material: bm, steps: 56 }), "closed"));   // closed: a groove 0.5 deep under the leather (r 33.5 .. 36), so its bottom is not on the ring top
      var lea = P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: m }); g.add(lea);
      lea.children.forEach(function (q) { q.userData.live = true; });
      var lea2 = c.shell(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: m }), "closed"); lea2.rotation.y = Math.PI; g.add(lea2);   // closed: the front half of the leather, set with it
      lea2.children.forEach(function (q) { q.userData.live = true; });
      var top = P.at(new T.Group(), 0, 0, 0, g);
      top.add(c.shell(P.halfSection({ poly: [[0, 0], [46, 0], [46, 6], [0, 6]], material: m }), "open"));
      top.add(c.shell(P.wholeSection({ poly: [[0, 0], [46, 0], [46, 6], [0, 6]], material: m, steps: 56 }), "closed"));
      P.at(P.cylY(4, 6, c.mat("lever", "dark")), 0, 9.5, 0, top);              // eye for the rod, on the board's top (y 6)
      o.bel.push({ g: g, lea: lea, lea2: lea2, top: top, s: s });
    });
    P.at(P.box(18, 100, 13, c.fixed), 0, 200, -11, scene);                 // post, y 150 .. 250, z -17.5 .. -4.5, behind the lever
    o.lever = P.at(new T.Group(), 0, o.Yp, 0, scene);
    P.at(P.box(290, 11, 8, c.mat("lever")), 25, 0, 0, o.lever);             // lever x -120 .. 170, z -4 .. 4
    [-o.XB, 0, o.XB].forEach(function (x) { P.at(P.cylZ(4, 10.5, c.mat("lever", "dark")), x, 0, .75, o.lever); });   // pins, z -4.5 .. 6
    o.rods = [P.rod(2.5, c.mat("lever")), P.rod(2.5, c.mat("lever"))]; o.rods.forEach(function (r) { scene.add(r); });
    // flaps: [hinge x, hinge y, flap centre from hinge, turn sign when opening, which bellows works it (0 left, 1 right), opens when filling]
    [[-71, 7.25, [13, 0], 1, 0, true], [71, 7.25, [-13, 0], -1, 1, true], [-20.75, 29, [0, -9], 1, 0, false], [20.75, 29, [0, -9], -1, 1, false]].forEach(function (d) {
      var g = P.at(new T.Group(), d[0], d[1], 0, scene), side = d[2][0] !== 0;
      P.at(P.box(side ? 26 : 2.5, side ? 2.5 : 18, 44, vm), d[2][0], d[2][1], -24, g);   // flap z -46 .. -2
      P.at(P.box(side ? 5 : 4, side ? 4 : 5, 2, red), d[2][0] * 1.5, d[2][1] * 1.5, -1.5, g);   // red mark z -2.5 .. -.5
      P.at(P.cylZ(1.6, 45, c.mat("valves", "dark")), 0, 0, -24, g);
      o.v.push({ g: g, s: d[3], k: d[4], fill: d[5] });
    });
    var z0 = -44, z1 = -6;
    o.flow = P.pipeDots({ color: c.spot, paths: [
      { pts: [[0, -170], [0, -60]], n: 18, w: 22, z0: z0, z1: z1 },                                   // 0 suction pipe
      { pts: [[0, -60], [-58, -30], [-58, 20], [-95, 60]], n: 22, w: 14, z0: z0, z1: z1 },          // 1 into the left bellows
      { pts: [[0, -60], [58, -30], [58, 20], [95, 60]], n: 22, w: 14, z0: z0, z1: z1 },             // 2 into the right bellows
      { pts: [[-95, 60], [-60, 22], [-25, 20], [-6, 30], [0, 44]], n: 18, w: 12, z0: z0, z1: z1 },  // 3 out of the left bellows
      { pts: [[95, 60], [60, 22], [25, 20], [6, 30], [0, 44]], n: 18, w: 12, z0: z0, z1: z1 },      // 4 out of the right bellows
      { pts: [[0, 44], [0, 101], [-52, 101]], n: 24, w: 14, z0: z0, z1: z1 }                         // 5 up the delivery pipe and a little way out of the spout (x -40)
    ] });
    scene.add(o.flow);
    o.bd = P.waterDots(60, { radius: 2.4, color: c.spot }); scene.add(o.bd);
    o.pd = []; for (i = 0; i < 60; i++) { var r = 30 * Math.sqrt(Math.random()), an = Math.PI * (1 + Math.random()); o.pd.push([r * Math.cos(an), Math.random(), Math.min(-4, r * Math.sin(an))]); }
  },

  step: function (c, dt, S) {
    var o = this.o, i;
    if (S.w) o.dir = S.w > 0 ? 1 : -1;
    o.th += S.w * dt;
    var ph = o.A * Math.sin(o.th), cs = Math.cos(o.th) * o.dir, open = .7 * Math.sqrt(Math.abs(cs));
    var leftIn = cs < 0;                                                      // the left end of the lever is rising: the left bellows fills
    o.lever.rotation.z = ph;
    var dv = 0;
    o.bel.forEach(function (b, k) {
      var px = b.s * o.XB * Math.cos(ph), py = o.Yp + b.s * o.XB * Math.sin(ph), dx = px - b.s * o.XB;
      var top = py - Math.sqrt(o.Lr * o.Lr - dx * dx), H = top - 6 - 40;   // rod keeps its length; board is 6 thick
      if (o.H[k] !== null) dv += Math.abs(H - o.H[k]); o.H[k] = H;
      var n = 8, poly = [], q;
      for (q = 0; q <= n; q++) poly.push([q % 2 ? 44 : 36, 4 + (H - 4) * q / n]);
      for (q = n; q >= 0; q--) poly.push([(q % 2 ? 44 : 36) - 2.5, 4 + (H - 4) * q / n]);
      b.lea.set(poly); b.lea2.set(poly);
      b.top.position.y = H;
      o.rods[k].span(b.s * o.XB, top + 6, 0, px, py, 0);
    });
    o.v.forEach(function (v) { v.g.rotation.z = v.s * ((v.k === 0) === (v.fill === leftIn) ? open : 0); });
    var ds = 1.2 * dv;
    o.flow.move(0, ds); o.flow.move(5, ds);
    o.flow.move(1, leftIn ? ds : 0); o.flow.move(4, leftIn ? ds : 0);
    o.flow.move(2, leftIn ? 0 : ds); o.flow.move(3, leftIn ? 0 : ds);
    o.flow.flush();
    for (i = 0; i < 60; i++) {                                                // water inside each bellows stretches with it
      var d = o.pd[i], k = i < 30 ? 0 : 1;
      o.bd.put(i, (k ? 1 : -1) * o.XB + d[0], 44 + d[1] * (o.H[k] - 6) , d[2], 1);
    }
    o.bd.flush();
    o.q += .01 * dv;                                                          // a made-up size: 1 cm of travel moves 0.1 L
    S.set("q", o.q.toFixed(1) + " L");
    S.set("s", leftIn ? "Right" : "Left");
  }
});
