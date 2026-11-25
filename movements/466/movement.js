M507.define({
  number: 466,
  title: "Hydrostatic press",
  lede: "A small hand pump pushes water under a wide, heavy plunger called a ram. The ram rises and squeezes a bale against the top of the frame. A gentle push on the pump handle becomes a huge push on the bale.",
  alt: "A press cut open down the middle. On the left, a wide ram sits in a thick cylinder full of water and lifts a plate that squeezes a bale under a heavy top beam. On the right, a hand pump stands in a tank of water, with a pipe running to the bottom of the press cylinder.",
  parts: [
    { key: "pump", color: "#5E7387", name: "Pump handle and plunger", note: "The handle moves a thin plunger up and down in the pump. Each push down sends a little water to the press." },
    { key: "ram", color: "#C8873A", name: "Ram and plate", note: "A wide solid plunger with a plate on top. Water pushes up under it, and it lifts the bale." },
    { key: "valve", color: "#C2503F", name: "Valves", note: "Two small balls that let water pass one way only. Watch them lift in turn: the lower one as the plunger rises, the one in the pipe as it goes down." },
    { key: "frame", color: "#4FA58A", name: "Cylinders and frame", note: "The press cylinder, the columns and the top beam, and the pump barrel. They hold still and take the push." },
    { key: "bale", color: "#E8E2D0", name: "Bale", note: "Cloth or cotton being squeezed flat between the plate and the top beam." }
  ],
  controls: [{ type: "range", id: "rd", label: "Ram width", min: 24, max: 60, step: 6, value: 36, unit: " cm",
    presets: [[24, "Small"], [36, "As drawn"], [60, "Big"]] }],
  closed: { label: "Cylinders" },
  readouts: [{ id: "gn", label: "Push made" }, { id: "nk", label: "Strokes" }, { id: "up", label: "Ram raised" }],
  views: { "3d": [526, 284, 1117], front: [5, 0, 1070], side: [1070, 0, 0] },
  target: [5, 0, 0],
  how: [
    "Watch the pump. When the plunger rises, the lower ball lifts and water comes up from the tank. When it goes down, that ball shuts, the ball in the pipe lifts, and the water is pushed along the pipe under the ram.",
    "Water cannot be squeezed smaller, and it presses equally hard on every bit of surface it touches. The ram has far more surface than the plunger, so it gets a far bigger push. Brown's example: a ram 30 times wider than the plunger has 900 times its area, and pushes 900 times harder. The price is distance. The ram rises only a tiny bit for each stroke.",
    "Try a small ram, then a big one. Watch how much harder the big ram pushes, and how many more strokes it needs to rise the same distance. Choose Closed to see the press as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The press and pump are cut open down the middle. The water is shown pale blue, and the moving dots show it flowing. The guide for the top of the plunger is left out. When the bale is fully squeezed, a tap on the pipe opens and lets the water back into the tank so the ram sinks; Brown does not show this tap. All sizes were made up, and the push is worked out from the areas alone, with no rub in the parts.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed, X0 = -140, X1 = 115;
    var o = this.o = { X0: X0, X1: X1, th: 0, yt: 35, yp: 150, mode: 0, nk: 0, rr: 0, down: false, lift: 0, sv: 0, dv: 0, out: 0 };
    var wm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .28, depthWrite: false, side: T.DoubleSide });
    // press cylinder (cut open) and its water; ram, plate, columns, top beam, bale
    o.cyl = P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: c.mat("frame") }), X0, 0, 0, scene);
    o.cyl2 = c.shell(P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: c.mat("frame") }), X0, 0, 0, scene), "closed"); o.cyl2.rotation.y = Math.PI;   // closed: the front half, set with it
    o.wat = P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1]], material: wm }), X0, 0, 0, scene);
    o.ram = P.at(new T.Group(), X0, 0, 0, scene);                                 // origin at the ram's top
    o.ramB = P.at(P.cylY(1, 255, c.mat("ram")), 0, -127.5, 0, o.ram);
    P.at(P.box(160, 15, 90, c.mat("ram")), 0, 7.5, -15, o.ram);                 // plate, z -60..30
    [-90, 90].forEach(function (dx) { P.at(P.cylY(8, 205, c.mat("frame")), X0 + dx, 72.5, -30, scene); });   // columns y -30..175
    P.at(P.box(210, 50, 90, c.mat("frame")), X0, 200, -15, scene);               // top beam y 175..225
    var dome = new T.Mesh(new T.SphereGeometry(85, 32, 10, 0, 2 * Math.PI, 0, Math.PI / 2), c.mat("frame")); dome.scale.set(1, .4, .45); P.at(dome, X0, 225, -15, scene);
    o.bale = [];
    for (var i = 0; i < 4; i++) o.bale.push(P.at(P.box(62, 1, 80, c.mat("bale")), X0 + (i % 2 ? 32 : -32), 0, -15, scene));
    // pump barrel (cut open), its water, flange on two bars across the tank
    P.at(c.shell(P.halfSection({ poly: [[4, -85], [22, -85], [22, -32.5], [34, -32.5], [34, -26], [22, -26], [22, 70], [14, 70], [14, 90], [7, 90], [7, 68], [9, 68], [9, -80], [4, -80]], material: c.mat("frame") }), "open"), X1, 0, 0, scene);
    P.at(c.shell(P.wholeSection({ poly: [[4, -85], [22, -85], [22, -32.5], [34, -32.5], [34, -26], [22, -26], [22, 70], [14, 70], [14, 90], [7, 90], [7, 68], [9, 68], [9, -80], [4, -80]], material: c.mat("frame"), steps: 56 }), "closed"), X1, 0, 0, scene);
    P.at(P.halfSection({ poly: [[0, -79.5], [8.5, -79.5], [8.5, 67.5], [0, 67.5]], material: wm }), X1, 0, 0, scene);
    P.at(P.box(32, 8, 40, fx), 77, -36, 0, scene);                               // bar x 61..93, y -40..-32
    P.at(P.box(92, 8, 40, fx), 183, -36, 0, scene);                              // bar x 137..229
    o.plg = P.at(P.cylY(6.5, 190, c.mat("pump")), X1, 0, 0, scene);
    o.link = P.at(P.rod(4, c.mat("pump")), 0, 0, 0, scene);
    o.lever = P.at(P.rod(5, c.mat("pump")), 0, 0, 0, scene);
    o.grip = P.at(P.rod(7, c.mat("pump")), 0, 0, 0, scene);
    o.pin = P.at(P.cylZ(5, 14, c.mat("pump", "dark")), 0, 0, 0, scene);
    // tank: bottom y -230..-222, side walls x 55..61 and 229..235 up to y -40, back wall z -60..-54
    P.at(P.box(180, 8, 120, fx), 145, -226, 0, scene);
    P.at(P.box(6, 182, 120, fx), 58, -131, 0, scene); P.at(P.box(6, 182, 120, fx), 232, -131, 0, scene);
    P.at(P.box(168, 182, 6, fx), 145, -131, -57, scene);
    P.at(P.box(167, 96, 113, wm), 145, -173.5, 3, scene);                        // water y -221.5..-125.5
    P.at(P.cylY(4, 123, fx), X1, -146.5, 0, scene);                              // suction pipe y -208..-85
    P.at(P.sphere(7, fx), X1, -212, 0, scene);                                   // strainer
    // pipe to the press, with the valve box and the let-down tap; closed: solid, so the valve in the box is hidden
    c.shell(P.at(P.cylX(4, 37, fx), 74.5, -10, 0, scene));                                // x 56..93
    c.shell(P.at(P.box(22, 20, 20, fx), 45, -10, 0, scene));                              // valve box x 34..56
    c.shell(P.at(P.cylX(4, 4, fx), 32, -10, 0, scene));                                   // x 30..34
    c.shell(P.at(P.cylY(4, 124, fx), 30, -68, 0, scene));                                 // y -130..-6
    c.shell(P.at(P.cylX(4, 113, fx), -26.5, -130, 0, scene));                             // x -83..30
    c.shell(P.at(P.cylX(4, 25, fx), 42.5, -130, 0, scene));                               // tap pipe x 30..55, ends at the tank wall
    o.tap = P.at(P.box(4, 16, 4, c.mat("valve", "dark")), 42, -118, 0, scene);
    P.at(P.cylY(3, 45, fx), 40, 22.5, -8, scene);                                // post for the swinging link, y 0..45
    P.at(P.sphere(8, c.mat("frame")), 40, 45, -8, scene);
    o.sv = P.at(P.sphere(4.5, c.mat("valve")), X1, -76, 0, scene);
    o.dv = P.at(P.sphere(4.5, c.mat("valve")), 45, -15, 0, scene);
    // water dots
    o.pf = P.steamFlow({ color: c.spot, light: true, count: 70, size: 2, z0: -1.5, z1: 1.5 }); scene.add(o.pf);
    o.pS = o.pf.pipe({ points: [[X1, -206], [X1, -70]], width: 6, n: 14, speed: .5 });
    o.pD = o.pf.pipe({ points: [[X1 - 6, -10], [30, -10], [30, -130], [-124, -130]], width: 6, n: 30, speed: .35 });
    o.pR = o.pf.pipe({ points: [[-124, -130], [30, -130], [70, -130]], width: 6, n: 16, speed: .4 });
  },

  shape: function (rd) {
    var o = this.o, rr = rd / 2, rb = rr + 6;
    var cp = [[0, -245], [57, -245], [57, -85], [110, -85], [110, -30], [44, -30], [44, 10], [rr + .6, 10], [rr + .6, -5], [rb, -5], [rb, -232], [0, -232]];
    o.cyl.set(cp); o.cyl2.set(cp);
    o.wat.set([[0, -231.5], [rb - .5, -231.5], [rb - .5, -5.5], [0, -5.5]]);
    o.ramB.scale.set(rr, 1, rr);
    o.rr = rr;
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, rd = +S.controls.rd;
    if (rd / 2 !== o.rr) this.shape(rd);
    var gain = (rd / 13) * (rd / 13), flowD = false, flowS = false, flowR = false;
    if (S.playing && dt > 0) {
      if (o.mode === 0) {
        var y0 = o.yp; o.th += S.w * dt * 2; o.yp = 150 + 20 * Math.sin(o.th);
        var d = y0 - o.yp;                                                       // plunger moving down by d
        if (d > 0) { o.yt += d / gain; flowD = true; o.down = true; }
        else if (d < 0) { flowS = true; if (o.down) { o.nk++; o.down = false; } }
        if (o.yt >= 85) { o.yt = 85; o.mode = 1; }
      } else {
        o.yt -= Math.abs(S.w) * dt * 8; flowR = true;
        if (o.yt <= 35) { o.yt = 35; o.mode = 0; o.nk = 0; }
      }
    }
    var yt = o.yt, yp = o.yp, X0 = o.X0, X1 = o.X1;
    o.ram.position.y = yt;
    var hb = 160 - yt, hr = (hb - 2) / 2;
    o.bale.forEach(function (b, i) { b.scale.y = hr; b.position.y = yt + 15 + (i < 2 ? hr / 2 : hr * 1.5 + 2); });
    o.plg.position.y = yp - 95;
    var q = P.meet(40, 45, 121, X1, yp, 62, 1), ux = (X1 - q[0]) / 62, uy = (yp - q[1]) / 62;
    o.link.span(40, 45, -8, q[0], q[1], -8);
    o.lever.span(q[0], q[1], 8, q[0] + 170 * ux, q[1] + 170 * uy, 8);
    o.grip.span(q[0] + 170 * ux, q[1] + 170 * uy, 8, q[0] + 215 * ux, q[1] + 215 * uy, 8);
    o.pin.position.set(X1, yp, 2);
    o.sv.position.y += ((flowS ? -68 : -76) - o.sv.position.y) * Math.min(1, dt * 20);
    o.dv.position.y += ((flowD ? -7 : -15) - o.dv.position.y) * Math.min(1, dt * 20);
    o.tap.rotation.z = o.mode ? Math.PI / 2 : 0;
    o.pS.on = flowS; o.pD.on = flowD; o.pR.on = flowR;
    o.pf.update(S.playing ? Math.abs(S.w) * dt * 2 : 0);
    S.set("gn", "× " + (gain < 10 ? gain.toFixed(1) : Math.round(gain)));
    S.set("nk", o.mode ? "Letting down" : String(o.nk));
    S.set("up", ((yt - 35) / 1).toFixed(1) + " cm");
  }
});
