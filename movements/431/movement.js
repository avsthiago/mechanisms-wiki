M507.define({
  number: 431,
  title: "Undershot water-wheel",
  lede: "A stream runs under the wheel and pushes the flat boards at the bottom. The wheel turns with the stream. No hill is needed, only a river that keeps flowing.",
  alt: "Water wheel with flat boards round its rim, standing in a fast stream. On the left a gate holds back a deep pool and lets water run under it toward the wheel.",
  parts: [
    { key: "float", color: "#C8873A", name: "Floats", note: "Flat boards that stick out of the rim. The stream pushes the ones at the bottom." },
    { key: "frame", color: "#5E7387", name: "Rim, spokes and shaft", note: "Two rings and spokes hold the floats. The shaft takes the turning away to a machine." },
    { key: "gate", color: "#D9B13B", name: "Sluice gate", note: "A board that slides up and down. Lifting it lets more water run under it. It is turned by the handles on top." },
    { key: "mark", color: "#C2503F", name: "Red mark", note: "Watch it to follow one float round." }
  ],
  controls: [{ id: "flow", label: "Water flow", value: "high", options: [["low", "Low"], ["high", "High"]] }],
  speed: false,
  readouts: [{ id: "rpm", label: "Wheel" }, { id: "gate", label: "Gate" }],
  views: { "3d": [185, 96, 418], front: [0, -5, 470], side: [470, 0, 30] },
  target: [-10, -10, 0],
  how: [
    "On the left, a deep pool is held back by a gate. Water squeezes out under the gate and runs fast down the stream. The floats at the bottom of the wheel dip into it.",
    "The stream pushes each float along as it passes. That pushes the whole wheel round. The wheel turns more slowly than the water, because it takes some of the push for itself.",
    "Try Low flow, then High flow. Watch the gate rise and the wheel speed up."
  ],
  note: "This model is rebuilt from Brown's drawing. The stone bed, the back wall that holds the shaft, the gate frame and the water are made up. The wheel speed is chosen to look right: it moves at about half the speed of the stream, and the gate and handles move together.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, s;
    var o = this.o = { a: 0, om: -1, open: -1, accU: 0, accD: 0, cx: 10, R: 86, handles: null };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .5, depthWrite: false });
    // bed (z -46..46): top at y -72 to x -90, slopes to y -98 at x -25, flat after. Back wall z -54..-46 (touches bed side faces)
    P.at(P.prism([[-200, -130], [-200, -72], [-90, -72], [-25, -98], [160, -98], [160, -130]], -46, 46, c.fixed), 0, 0, 0, scene);
    P.at(P.box(380, 170, 8, c.fixed), -10, -45, -50, scene);          // x -200..180, y -130..40, z -54..-46
    // water (z -38..38), one body 1 above the bed
    P.at(P.prism([[-200, -71], [-200, 0], [-90, 0], [-90, -68], [-55, -80], [160, -80], [160, -97], [-25, -97], [-90, -71]], -38, 38, wat), 0, 0, 0, scene);
    // gate frame: two posts on the bed (y -72..66) at x -112..-90, z 38..46 and -46..-38, beam y 66..72 on top of them
    P.at(P.box(22, 138, 8, c.fixed), -101, -3, 42, scene);
    P.at(P.box(22, 138, 8, c.fixed), -101, -3, -42, scene);
    var gm = c.mat("gate");
    P.at(P.box(22, 6, 92, gm), -101, 69, 0, scene);                   // y 66..72, z -46..46
    o.plate = P.at(P.box(4, 70, 74, gm), -101, 0, 0, scene);          // z -37..37, x -103..-99
    o.rod = P.rod(2.5, gm); scene.add(o.rod);
    var h = o.handles = new T.Group(); h.position.set(-101, 100, 0); h.scale.set(.7, .7, .7); scene.add(h);
    var bar = P.rod(2.5, gm); bar.span(-38, 0, 0, 38, 0, 0); h.add(bar);
    [-1, 1].forEach(function (sg) {
      var a = P.rod(2.5, gm); a.span(sg * 38, 0, 0, sg * 48, 10, 0); h.add(a);
      var b = P.rod(2.5, gm); b.span(sg * 48, 10, 0, sg * 58, 14, 0); h.add(b);
      P.at(P.sphere(4, gm), sg * 38, 0, 0, h); P.at(P.sphere(4, gm), sg * 48, 10, 0, h);
    });
    P.at(P.cylY(6, 6, gm), 0, 0, 0, h);
    // wheel: axis z at (10, 0); floats z -25..25, rings z +-20
    var g = o.wheel = new T.Group(); g.position.set(o.cx, 0, 0); scene.add(g);
    var fm = c.mat("float"), frm = c.mat("frame");
    for (s = -1; s <= 1; s += 2) {
      P.at(P.hoop(58, 2.5, frm), 0, 0, s * 20, g);                    // outer edge r 60.5 touches the floats' inner edge
      for (i = 0; i < 8; i++) {
        var an = i * Math.PI / 4, sp = P.rod(2.2, frm);
        sp.span(10 * Math.cos(an), 10 * Math.sin(an), s * 20, 57 * Math.cos(an), 57 * Math.sin(an), s * 20); g.add(sp);
      }
    }
    P.at(P.cylZ(11, 46, frm), 0, 0, 0, g);                            // z -23..23
    P.at(P.cylZ(5, 76, frm), 0, 0, -8, g);                            // z -46..30, ends on the back wall face
    for (i = 0; i < 16; i++) {
      var f = new T.Group(); f.rotation.z = i * Math.PI / 8; g.add(f);
      P.at(P.box(25.5, 3, 50, fm), 73.25, 0, 0, f);                   // r 60.5..86, z -25..25
    }
    P.at(P.box(10, 2.4, 1.5, c.mat("mark")), 73.25, 0, 25.75, g.children[g.children.length - 16]);   // z 25..26.5
    o.up = P.dropPool({ count: 90, radius: 1.8, color: c.spot, opacity: .9, parent: scene });
    o.down = P.dropPool({ count: 170, radius: 1.8, color: c.spot, opacity: .9, parent: scene });
  },

  step: function (c, dt, S) {
    var o = this.o, high = S.controls.flow === "high", sim = S.playing ? dt : 0;
    var rpm = high ? 7 : 3, openT = high ? 40 : 14;
    if (o.om < 0) { o.om = rpm * Math.PI / 30; o.open = openT; }
    o.om += (rpm * Math.PI / 30 - o.om) * Math.min(1, sim * 1.2);
    var prev = o.open; o.open += (openT - o.open) * Math.min(1, sim * 2);
    o.a += o.om * sim; o.wheel.rotation.z = o.a;                       // anticlockwise, as drawn
    o.plate.position.y = -72 + o.open + 35;
    var top = -72 + o.open + 70;
    o.rod.span(-101, top, 0, -101, 100, 0);
    o.handles.rotation.y += (o.open - prev) * .12;
    var vs = 2 * o.om * o.R, vu = vs * .22;                            // stream speed: twice the float speed
    o.accD += sim * (high ? 36 : 24); o.accU += sim * (high ? 9 : 6);
    while (o.accD >= 1) { o.accD -= 1; o.down.emit(-88, -69, (Math.random() - .5) * 70, vs, -vs * .343, 0, 0); }
    while (o.accU >= 1) { o.accU -= 1; o.up.emit(-198, 1.5, (Math.random() - .5) * 70, vu, 0, 0, 0); }
    o.down.step(sim, 0, function (p, d) { if (p.x > -55 && d.vy !== 0) { d.vy = 0; p.y = -79; } return p.x > 155; });
    o.up.step(sim, 0, function (p) { return p.x > -92; });
    S.set("rpm", (o.om * 30 / Math.PI).toFixed(1) + " rpm");
    S.set("gate", Math.round(o.open / 40 * 100) + "%");
  }
});
