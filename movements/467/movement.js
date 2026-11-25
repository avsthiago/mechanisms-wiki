M507.define({
  number: 467,
  title: "Hydrostatic jack",
  lede: "A jack for lifting heavy loads with water. The ram in the middle stands still, and the cylinder slides up over it, carrying a claw. A small hand pump pushes water into the cylinder above the ram, and a screw lets it out again.",
  alt: "A jack cut open down the middle. A hollow box base holds water. A thick ram stands on it, and over the ram slides a cylinder with a cup on top and a hooked claw on its side. On the left, a short hand lever works a small pump on the base.",
  parts: [
    { key: "pump", color: "#5E7387", name: "Pump lever and plunger", note: "Rocking the lever moves a small plunger up and down. Each push down sends a little water into the jack." },
    { key: "cyl", color: "#C8873A", name: "Cylinder and claw", note: "Slides up over the ram. The load sits on the cup at the top or on the claw at the side." },
    { key: "ram", color: "#4FA58A", name: "Ram and base", note: "The ram stands still on the hollow base. A pipe runs up its middle to carry the water to the space above it." },
    { key: "screw", color: "#C2503F", name: "Let-down screw", note: "A screw at the bottom with a winged head. Watch it turn when the load is let down: it opens a hole so the water runs back into the base." }
  ],
  speed: { min: 30, max: 120, value: 90, label: "Pumping", unit: " strokes/min" },
  controls: [{ type: "range", id: "vo", label: "Let-down screw opened", min: 1, max: 5, step: 1, value: 2, unit: "",
    presets: [[1, "A crack"], [2, "A little"], [5, "Wide"]] }],
  closed: { label: "Jack" },
  readouts: [{ id: "lf", label: "Lift" }, { id: "nk", label: "Strokes" }],
  views: { "3d": [523, 284, 1154], front: [-20, 0, 1110], side: [1110, 0, 0] },
  target: [-15, -10, 0],
  how: [
    "Watch the lever on the left rock up and down. Its plunger draws water from the base and pushes it up the pipe in the middle of the ram. The water fills the space between the top of the ram and the top of the cylinder, and pushes the cylinder up.",
    "The plunger is thin and the ram is fat, so each stroke lifts the cylinder only a tiny bit. That is what makes it strong. The small push on the plunger is spread over the much bigger top of the ram, so the cylinder is pushed up many times harder.",
    "When the cylinder is high, the screw at the bottom is turned and the water runs back into the base. Try a crack, then wide open, and compare how gently the load comes down. Choose Closed to see the jack as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. It is cut open down the middle and the water is shown pale blue, with moving dots where it flows. How the pump fits on the base, the post for the lever and the pipes inside the base were made up. Brown's drawing also shows a long handle on the side of the cylinder; here it is taken as a handle for carrying the jack. The pump valves are left out. All sizes were made up, and the cylinder rises by the volume of water pushed in, with no leaks.",

  build: function (c) {
    var T = c.THREE, P = c.P, fx = c.fixed;
    var root = P.at(new T.Group(), 0, -30, 0, c.scene);
    var o = this.o = { root: root, u: 0, th: 0, yq: -112, mode: 0, nk: 0, down: false, wing: 0, XP: -72 };
    var wm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .28, depthWrite: false, side: T.DoubleSide });
    // ground and base: walls 8 thick, open at the front; x -90..70, y -245..-175, z -50..50
    P.at(P.box(330, 10, 130, fx), -35, -250, 0, root);                         // ground y -255..-245
    var mb = c.mat("ram");
    P.at(P.box(160, 8, 100, mb), -10, -241, 0, root);                          // bottom y -245..-237
    P.at(P.box(160, 8, 100, mb), -10, -179, 0, root);                          // top y -183..-175
    P.at(P.box(8, 54, 100, mb), -86, -210, 0, root); P.at(P.box(8, 54, 100, mb), 66, -210, 0, root);   // sides y -237..-183
    P.at(P.box(144, 54, 6, mb), -10, -210, -47, root);                         // back z -50..-44
    c.shell(P.at(P.box(144, 54, 6, mb), -10, -210, 47, root), "closed");       // closed: front z 44..50, between the sides
    c.fluid(c.shell(P.at(P.box(143, 36.5, 93.5, wm), -10, -218.25, 3.25, root), "open"));   // water y -236.5..-200, seen through the open front
    c.fluid(c.shell(P.at(P.box(143, 36.5, 87, wm), -10, -218.25, 0, root), "closed"));     // closed: the same water, z -43.5..43.5, inside the front wall
    // ram, cut open, with its pipe up the middle (bore r 4.5); stands on the base top y -175, top y 90
    P.at(c.shell(P.halfSection({ poly: [[4.5, -175.5], [37, -175.5], [37, 90], [4.5, 90]], material: mb }), "open"), 0, 0, 0, root);
    P.at(c.shell(P.wholeSection({ poly: [[4.5, -175.5], [37, -175.5], [37, 90], [4.5, 90]], material: mb, steps: 56 }), "closed"), 0, 0, 0, root);
    // pipes inside the base
    P.at(P.cylY(4, 15, fx), 0, -197.5, 0, root);                               // y -205..-190 under the ram pipe
    P.at(P.cylX(4, 72, fx), -36, -190, 0, root);                               // x -72..0 from the pump
    P.at(P.cylY(4, 50, fx), o.XP, -208, 0, root);                              // suction y -233..-183
    P.at(P.cylX(4, 35, fx), -17.5, -205, 0, root);                             // x -35..0 to the screw seat
    o.screw = P.at(new T.Group(), -35, -205, 0, root);
    P.at(P.cylX(2.5, 70, c.mat("screw")), -35, 0, 0, o.screw);                 // stem x -105..-35 (through the wall)
    P.at(P.box(4, 22, 6, c.mat("screw")), -72, 0, 0, o.screw);                 // wing x -109..-105, on the stem end
    // cylinder and claw, cut open; inside 37.5 wide from y -160 up to the head at 185
    o.cyl = P.at(new T.Group(), 0, 0, 0, root);
    o.cyl.add(c.shell(P.halfSection({ poly: [[0, 185], [37.5, 185], [37.5, -160], [57, -160], [57, 215], [82, 235], [82, 250], [40, 250], [22, 232], [0, 232]], material: c.mat("cyl") }), "open"));
    o.cyl.add(c.shell(P.wholeSection({ poly: [[0, 185], [37.5, 185], [37.5, -160], [57, -160], [57, 215], [82, 235], [82, 250], [40, 250], [22, 232], [0, 232]], material: c.mat("cyl"), steps: 56 }), "closed"));
    o.cyl.add(P.prism([[56, 45], [56, -95], [95, -85], [122, -60], [130, -30], [125, -8], [112, -8], [108, -25], [95, -38], [75, -38], [64, -5]], -20, 20, c.mat("cyl")));
    var h1 = P.at(P.rod(4, c.mat("cyl")), 0, 0, 0, o.cyl); h1.span(62, 40, 0, 140, 160, 0);
    var h2 = P.at(P.rod(9, c.mat("cyl")), 0, 0, 0, o.cyl); h2.span(140, 160, 0, 175, 214, 0);
    o.wat = P.at(P.halfSection({ poly: [[0, 0], [36.5, 0], [36.5, 1], [0, 1]], material: wm }), 0, 90.5, 0, root);
    // pump: barrel on the base top, x -85..-59, y -175..-130, bore r 9; plunger r 8
    P.at(c.shell(P.halfSection({ poly: [[3, -175.5], [13, -175.5], [13, -130], [8.5, -130], [8.5, -134], [9, -134], [9, -171], [3, -171]], material: c.mat("pump") }), "open"), o.XP, 0, 0, root);
    P.at(c.shell(P.wholeSection({ poly: [[3, -175.5], [13, -175.5], [13, -130], [8.5, -130], [8.5, -134], [9, -134], [9, -171], [3, -171]], material: c.mat("pump"), steps: 56 }), "closed"), o.XP, 0, 0, root);
    o.plg = P.at(P.cylY(8, 40, c.mat("pump")), o.XP, 0, 0, root);
    P.at(P.box(12, 151, 12, fx), -104, -169.5, -14, root);                     // post y -245..-94, z -20..-8
    P.at(P.cylZ(3, 14, c.mat("pump", "dark")), -104, -100, -3, root);         // pivot pin z -10..4
    o.arm = P.at(P.rod(4, c.mat("pump")), 0, 0, 0, root);
    o.hdl = P.at(P.rod(4, c.mat("pump")), 0, 0, 0, root);
    o.grip = P.at(P.rod(7, c.mat("pump")), 0, 0, 0, root);
    o.lk = P.at(P.rod(3, c.mat("pump")), 0, 0, 0, root);
    // water dots
    o.flow = P.steamFlow({ color: c.spot, light: true, count: 150, size: 2.2, z0: -12, z1: -2 }); root.add(o.flow);
    o.dom = o.flow.domain({ density: .02, pad: 1.5, f: function (y, out) { out[0] = -35; out[1] = y; out[2] = 35; out[3] = y; } });
    o.pf = P.steamFlow({ color: c.spot, light: true, count: 80, size: 1.8, z0: -1, z1: 1 }); root.add(o.pf);
    o.pS = o.pf.pipe({ points: [[o.XP, -231], [o.XP, -171]], width: 5, n: 10, speed: .6 });
    o.pD = o.pf.pipe({ points: [[o.XP, -171], [o.XP, -190], [0, -190], [0, 90]], width: 5, n: 34, speed: .35 });
    o.pR = o.pf.pipe({ points: [[0, 90], [0, -205], [-35, -205], [-40, -220]], width: 5, n: 26, speed: .35 });
    o.bars = [0, 0]; o.kinds = [1]; o.ports = [90];
  },

  step: function (c, dt, S) {
    var o = this.o, ratio = (8 / 37) * (8 / 37), flowS = false, flowD = false, flowR = false, ph = 0;
    if (S.playing && dt > 0) {
      if (o.mode === 0) {
        var y0 = o.yq; o.th += S.w * dt;
        ph = .3 * Math.sin(o.th);
        var d = y0 - this.plunger(ph);
        if (d > 0) { o.u += d * ratio; flowD = true; o.down = true; }
        else if (d < 0) { flowS = true; if (o.down) { o.nk++; o.down = false; } }
        if (o.u >= 40) { o.u = 40; o.mode = 1; }
      } else {
        var vo = +S.controls.vo;
        o.u -= 2.2 * vo * dt; o.wing += 3 * dt; flowR = true;
        if (o.u <= 0) { o.u = 0; o.mode = 0; o.nk = 0; }
      }
    }
    if (o.mode === 0) o.wing = Math.max(0, o.wing - 3 * dt);
    ph = .3 * Math.sin(o.th);
    o.yq = this.plunger(ph);
    var F = [-104, -100], E = [F[0] + 32 * Math.cos(ph), F[1] + 32 * Math.sin(ph)], ha = ph + Math.PI + .7;
    var H = [F[0] + 100 * Math.cos(ha), F[1] + 100 * Math.sin(ha)], G = [F[0] + 140 * Math.cos(ha), F[1] + 140 * Math.sin(ha)];
    o.arm.span(F[0], F[1], 0, E[0], E[1], 0); o.hdl.span(F[0], F[1], 0, H[0], H[1], 0); o.grip.span(H[0], H[1], 0, G[0], G[1], 0);
    o.lk.span(E[0], E[1], 0, o.XP, o.yq, 0);
    o.plg.position.y = o.yq - 20;
    o.cyl.position.y = o.u;
    o.wat.scale.y = 94 + o.u;
    o.screw.rotation.x = o.wing;
    o.bars[0] = 90; o.bars[1] = 184.5 + o.u; o.kinds[0] = o.mode ? 3 : 1; o.dom.set(o.bars, o.kinds, o.ports, 1);
    var turn = S.playing ? dt * 3 : 0;
    o.flow.update(flowD || flowR ? turn : 0);
    o.pS.on = flowS; o.pD.on = flowD; o.pR.on = flowR; o.pf.update(turn);
    S.set("lf", o.u.toFixed(1) + " cm");
    S.set("nk", o.mode ? "Letting down" : String(o.nk));
  },

  plunger: function (ph) {                                                      // plunger top, from the lever angle
    var ex = -104 + 32 * Math.cos(ph), ey = -100 + 32 * Math.sin(ph), dx = ex - this.o.XP;
    return ey - Math.sqrt(12 * 12 - dx * dx);
  }
});
