M507.define({
  number: 425,
  title: "Eccentric rotary engine",
  lede: "This steam engine has no piston going up and down. A round piston sits off-centre on the shaft and touches the cylinder wall at one place. Steam pushes on one side of it and turns the shaft round and round.",
  alt: "A round cylinder on a foot, drawn with its front cover off. Inside, a big orange disc sits off-centre on a shaft and touches the wall at the bottom. A yellow plate slides down from a tall slot at the top and rests on the disc, between two pipes.",
  parts: [
    { key: "case", color: "#4FA58A", name: "Cylinder", note: "The round casing with a pipe on each side of the top. It stands still. The front cover is left off so you can see inside." },
    { key: "piston", color: "#C8873A", name: "Piston", note: "A round disc fixed off-centre on the shaft. Watch its red stripe. It always touches the wall at one place, and that place travels round." },
    { key: "gate", color: "#D9B13B", name: "Sliding plate", note: "A plate that slides up and down in a slot between the two pipes. It rests on the piston and keeps fresh steam apart from used steam." }
  ],
  controls: [{ id: "steam", label: "Steam enters by", value: "right", options: [["left", "Left pipe"], ["right", "Right pipe"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "rpm", label: "Shaft" }, { id: "lift", label: "Plate lifted" }],
  views: { "3d": [145, 120, 590], front: [0, 26, 620], side: [640, 26, 0] },
  target: [0, 40, 0],
  how: [
    "Look at the orange piston. The shaft does not go through its middle, so the piston swings round off-centre. It always touches the cylinder wall at one place, and that place travels round the wall.",
    "A yellow plate slides down from the top and rests on the piston. The plate and the touching place split the space into two rooms. Steam comes in beside the plate and fills one room, shown as dark blue dots. It cannot get past the plate, so it pushes the piston round. The pale dots in the other room are used steam, leaving by the other pipe.",
    "The plate must rise and fall once in every turn to let the piston pass under it. The readout shows how far it is lifted. Now let the steam in by the left pipe. The rooms swap over and the shaft turns the other way. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front cover is left off, and the steam is drawn as small blue balls so you can see it move. Brown does not show what holds the plate down on the piston, so here it simply follows it. The sizes, the shape of the foot and the choice of pipe were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 100, r = 78, e = 22, W = 112, mc = c.mat("case");
    var o = this.o = { th: 0, R: R, r: r, e: e, hw: 5.5, len: 70 };
    function arc(cx, cy, rad, a0, a1, n) { var p = [], i, a; for (i = 0; i <= n; i++) { a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); } return p; }
    var deg = 180 / Math.PI, y40 = Math.sqrt(R * R - 1600), y22 = Math.sqrt(R * R - 484), y6 = Math.sqrt(R * R - 36), yo = Math.sqrt(W * W - 52 * 52);
    var ao = Math.atan2(yo, 52) * deg, ai = Math.atan2(y40, 40) * deg;
    // outside of the casing: wall 12 thick round the bore, pipe necks with lips at y 132..140, foot y -130..-118
    var outer = [[52, 132], [52, yo]].concat(arc(0, 0, W, ao, -60, 40), [[56, -118], [95, -118], [95, -130], [-95, -130], [-95, -118], [-56, -118]], arc(0, 0, W, 240, 180 - ao, 40), [[-52, yo], [-52, 132], [-60, 132], [-60, 140]]);
    // main wall: the outside, then down the left pipe (x -40), round the bore the long way and up the right pipe (x 40)
    var body = outer.concat([[-40, 140], [-40, y40]], arc(0, 0, R, 180 - ai, 360 + ai, 90), [[40, 140], [60, 140], [60, 132]]);
    // middle piece between the pipes (x -22..22) with the tower for the plate (x -18..18, top y 182); slot x -6..6, top y 174
    var mid = arc(0, 0, R, Math.atan2(y6, 6) * deg, Math.atan2(y22, 22) * deg, 6).concat([[22, 140], [18, 140], [18, 182], [-18, 182], [-18, 140], [-22, 140]], arc(0, 0, R, 180 - Math.atan2(y22, 22) * deg, 180 - Math.atan2(y6, 6) * deg, 6), [[-6, 174], [6, 174]]);
    var back = outer.concat([[-18, 140], [-18, 182], [18, 182], [18, 140], [60, 140], [60, 132]]);
    scene.add(P.outlinePlate({ points: body, depth: 40, z0: -20, material: mc }));     // walls z -20..20
    scene.add(P.outlinePlate({ points: mid, depth: 40, z0: -20, material: mc }));
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: c.mat("case", "light") }), "open"));   // back cover z -26..-20, behind the walls; pale so the steam shows
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: mc }), "closed"));   // closed view: the same back cover in the casing colour
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: 20, material: mc }), "closed"));   // closed view: front cover z 20..26 on the walls
    // piston and shaft turn about the cylinder's centre; the piston's own centre is 22 off, so 22 + 78 = 100 touches the wall
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylZ(r, 36, c.mat("piston")), e, 0, -2, o.rot);                             // z -20..16, on the back cover
    P.at(P.cylZ(14, 104, c.mat("piston")), 0, 0, -8, o.rot);                           // shaft z -60..44
    P.at(P.cylZ(20, 3, c.mat("piston", "dark")), 0, 0, 17.5, o.rot);                   // collar z 16..19, on the piston face
    P.at(P.box(72, 5, 1, c.mat("piston", "mark")), 60, 0, 17, o.rot);                  // stripe x 24..96, z 16.5..17.5, lifted off the face (z 16)
    // sliding plate: x -5.5..5.5 in the slot (x -6..6), z -20..16
    o.gate = P.at(P.box(11, o.len, 36, c.mat("gate")), 0, 0, -2, scene);
    // steam: flat sheets at z 15, inside the depth of the piston so they never share a face with it
    function sm(op) { return new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide }); }
    o.live = sm(.14); o.used = sm(.04);
    o.fl = P.at(P.ribbon({ material: o.used }), 0, 0, 15, scene); o.fr = P.at(P.ribbon({ material: o.live }), 0, 0, 15, scene);
    o.pl = P.at(P.ribbon({ n: 8, material: o.used }), 0, 0, 15, scene); o.pr = P.at(P.ribbon({ n: 8, material: o.live }), 0, 0, 15, scene);
    [o.fl, o.fr, o.pl, o.pr].forEach(function (m) { c.fluid(m); });   // the steam still shows faintly when the cylinder is closed
    o.pl.set(function (x) { return [x, Math.sqrt(R * R - x * x), x, 140]; }, -40, -22);
    o.pr.set(function (x) { return [x, Math.sqrt(R * R - x * x), x, 140]; }, 22, 40);
    // steam as moving balls: one ring-shaped region between the piston and the wall, cut by the plate and the touching place
    o.flow = P.steamFlow({ color: c.spot, count: 340, z0: -14, z1: 12 }); scene.add(o.flow);
    o.dom = o.flow.domain({ density: .012, pad: .02, f: function (a, out) {
      var d = a - o.al, s = e * Math.sin(d), q = e * Math.cos(d) + Math.sqrt(r * r - s * s), ca = Math.cos(a), sa = Math.sin(a);
      out[0] = q * ca; out[1] = q * sa; out[2] = R * ca; out[3] = R * sa;
    } });
    o.bars = [0, 0, 0]; o.kinds = [0, 0]; o.ports = [Math.PI / 2 + .31, 2.5 * Math.PI - .31];   // the pipe mouths, 18 degrees each side of the plate
    o.pipeL = o.flow.pipe({ points: [[-31, 168], [-31, 96]], width: 13 }); o.pipeR = o.flow.pipe({ points: [[31, 168], [31, 96]], width: 13 });
  },

  step: function (c, dt, S) {
    var o = this.o, dir = S.controls.steam === "left" ? 1 : -1, R = o.R, r = o.r, e = o.e;
    o.th += dir * S.w * dt;
    var al = -Math.PI / 2 + o.th, cx = e * Math.cos(al), cy = e * Math.sin(al);        // starts touching at the bottom, as drawn
    o.rot.rotation.z = al;
    // the plate's flat end rests on the highest point of the piston that lies under it
    var xm = Math.max(-o.hw, Math.min(o.hw, cx)), yb = cy + Math.sqrt(r * r - (xm - cx) * (xm - cx));
    o.gate.position.y = yb + o.len / 2;
    // rooms: from the plate (at 90 degrees) round to the touching place, one on each side
    var an = al - Math.PI / 2; an -= 2 * Math.PI * Math.floor(an / (2 * Math.PI)); an += Math.PI / 2;   // 90..450 degrees
    var da = Math.asin(6 / R);
    function f(a) { var d = a - al, s = e * Math.sin(d), q = e * Math.cos(d) + Math.sqrt(r * r - s * s), ca = Math.cos(a), sa = Math.sin(a); return [q * ca, q * sa, R * ca, R * sa]; }
    o.fl.set(f, Math.PI / 2 + da, an); o.fr.set(f, an, 2.5 * Math.PI - da);
    o.fl.material = o.pl.material = dir > 0 ? o.live : o.used;
    o.fr.material = o.pr.material = dir > 0 ? o.used : o.live;
    o.al = al; o.bars[0] = Math.PI / 2 + da; o.bars[1] = an; o.bars[2] = 2.5 * Math.PI - da;
    o.kinds[0] = dir > 0 ? 1 : 3; o.kinds[1] = dir > 0 ? 3 : 1;
    o.dom.set(o.bars, o.kinds, o.ports, 2);
    o.pipeL.out = dir < 0; o.pipeR.out = dir > 0;
    o.flow.update(Math.abs(S.w) * dt);
    var rpm = S.playing ? dir * S.rpm : 0;
    S.set("rpm", (rpm < 0 ? "−" + -rpm : rpm) + " rpm");
    S.set("lift", Math.round(yb - (R - 2 * e)) + " mm");
  }
});
