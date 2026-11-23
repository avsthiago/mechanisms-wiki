M507.define({
  number: 406,
  title: "Drawing parabolas",
  lede: "A straight edge, a square and a piece of cord draw a parabola, the curve of a thrown ball. The pencil always stays just as far from a pin as from the straight edge. Curved mirrors and bridge arches use this shape.",
  alt: "A long straight edge lies across the top of a sheet of paper. A square hangs from it, its stock pressed against the straight edge and its long blade pointing down the page. A pin is stuck in the paper beside the blade. A cord runs from the lower end of the blade up its edge to a pencil, and from the pencil to the pin. The pencil draws an arch-shaped curve round the pin.",
  parts: [
    { key: "edge", color: "#4FA58A", name: "Straight edge", note: "Held still on the paper. Its lower edge is the guide line of the curve, called the directrix." },
    { key: "square", color: "#5E7387", name: "Square", note: "Its stock slides along the straight edge, so its blade always points straight down the page. It is turned over to draw the other half." },
    { key: "string", color: "#D9B13B", name: "Cord", note: "Tied to the lower end of the blade and to the pin. It is exactly as long as the blade." },
    { key: "pin", color: "#C8873A", name: "Pin", note: "Stuck in the paper at the focus point of the curve." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Holds the cord tight against the blade. Watch the two distances in the readouts stay equal." }
  ],
  controls: [{ id: "f", label: "Pin to straight edge", value: "40", options: [["25", "Near"], ["40", "Middle"], ["60", "Far"]] }],
  speed: { min: 1, max: 10, value: 3, label: "Speed", unit: " rounds/min" },
  readouts: [{ id: "p", label: "To pin" }, { id: "e", label: "To edge" }],
  views: { "3d": [0, -330, 1000], front: [0, -120, 950], side: [900, -220, 300] },
  target: [0, -120, 0],
  distance: [300, 1600],
  how: [
    "The square slides along the straight edge with its blade pointing down the page. The cord goes from the end of the blade, up along its edge to the pencil, then across to the pin. The pencil keeps the cord tight against the blade and draws one half of the curve. Then the square is turned over for the other half.",
    "The cord is exactly as long as the blade. The part along the blade and the part to the pin always add up to that length. So the pencil is always as far from the pin as it is from the straight edge, and that makes the curve a parabola.",
    "Try the pin near the straight edge, then far from it. A near pin gives a narrow, pointed curve and a far pin gives a wide, flat one."
  ],
  note: "This model is rebuilt from Brown's drawing. The paper, the sizes and the shape of the square's stock are made up. The pin is a flat-headed pin low enough for the blade to pass over it. The square is lifted and turned over at the top of the curve to draw the second half.",

  build: function (c) {
    var T = c.THREE, P = c.P, sc = c.scene, o = this.o = { LB: 400, WB: 36, DL: 2.5, ZF: 3.5, f: null, ph: 0 }, i;
    P.at(P.box(700, 480, 2, c.fixed), 0, -110, -1, sc);                                 // paper: x -350..350, y -350..130, z -2..0
    o.edge = P.at(P.box(640, 55, 5.8, c.mat("edge")), 0, 0, 4.1, sc);                   // straight edge: z 1.2..7, lower face at y = f (set in step)
    o.pin = new T.Group(); sc.add(o.pin);
    P.at(P.cylZ(4.5, .8, c.mat("pin")), 0, 0, .8, o.pin);                               // flat head, z 0.4..1.2, under the blade (z 1.5 and up)
    P.at(P.cylZ(1.2, .4, c.mat("pin")), 0, 0, .2, o.pin);                               // shank showing between head and paper, z 0..0.4
    // square: working line along local -Y from the straight edge, body on +X
    var WB = o.WB, DL = o.DL, LB = o.LB;
    o.sq = new T.Group(); sc.add(o.sq);
    o.flip = new T.Group(); o.sq.add(o.flip);
    P.at(P.outlinePlate({ points: [[DL, -LB - 8], [DL + WB, -LB - 8], [DL + WB, -1], [DL, -1]], depth: 4, z0: -2, material: c.mat("square") }), 0, 0, 0, o.flip);   // blade: z 1.5..5.5 when flat
    var st = [[DL, 0], [DL + WB + 78, 0], [DL + WB + 78, -10]];
    for (i = 1; i <= 12; i++) { var t = i / 12 * Math.PI / 2; st.push([DL + WB + 78 - 78 * Math.sin(t), -10 - 26 * (1 - Math.cos(t))]); }
    st.push([DL, -36]);
    P.at(P.outlinePlate({ points: st, depth: 6.8, z0: -2.3, material: c.mat("square") }), 0, 0, 0, o.flip);   // stock: z 1.2..8 when flat, top face against the straight edge
    P.at(P.sphere(2, c.mat("string")), -1, -LB, 0, o.flip);                             // knot at the end of the blade
    o.s1 = P.at(P.rod(.8, c.mat("string")), 0, 0, 0, sc);
    o.s2 = P.at(P.rod(.8, c.mat("string")), 0, 0, 0, sc);
    o.ink = [0, 1].map(function () { var m = P.inkTrail({ material: c.mat("pencil", "dark"), width: 1.8, max: 900, step: 1 }); sc.add(m); return m; });
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 1, sc);
    o.seq = [["d", -1, 1], ["r", -1, .5], ["f", -1, .7], ["d", 1, 1], ["r", 1, .5], ["f", 1, .7]];
    o.tot = o.seq.reduce(function (s, q) { return s + q[2]; }, 0);
  },

  step: function (c, dt, S) {
    var o = this.o, f = +S.controls.f, i;
    if (f !== o.f) { o.f = f; o.ph = .3 / o.tot; o.fill = true; o.ink.forEach(function (m) { m.clear(); }); o.edge.position.y = f + 27.5; o.pin.position.set(0, -f, 0); }   // edge y f..f+55
    var xm = Math.min(250, Math.sqrt(4 * f * 320));                                     // pencil stays above the end of the blade
    var prev = o.ph; o.ph += S.w * dt / (2 * Math.PI);
    if (Math.floor(o.ph) !== Math.floor(prev)) o.ink.forEach(function (m) { m.clear(); });
    var t = (o.ph - Math.floor(o.ph)) * o.tot, k = 0;
    while (t > o.seq[k][2] && k < o.seq.length - 1) { t -= o.seq[k][2]; k++; }
    var sg = o.seq[k], u = Math.min(1, t / sg[2]), e = function (x) { return .5 - .5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x))); };
    var side = sg[1], x = 0, beta, lift = 0;
    if (sg[0] === "d") { x = side * xm * e(u); beta = side > 0 ? 0 : Math.PI; }
    else if (sg[0] === "r") { x = side * xm * (1 - e(u)); beta = side > 0 ? 0 : Math.PI; }
    else { lift = Math.min(1, 4 * Math.min(u, 1 - u)); beta = (side < 0 ? Math.PI : 0) + (side < 0 ? -1 : 1) * Math.PI * e((u - .2) / .6); }
    var up = 6 * lift, zf = o.ZF + up + (o.DL + o.WB + 78) * Math.abs(Math.sin(beta));
    o.sq.position.set(x, f, 0); o.flip.position.z = zf; o.flip.rotation.y = beta;
    var py = -x * x / (4 * f), ey = f - o.LB, bs = Math.cos(beta) > 0 ? 1 : -1;       // pencil on the parabola; bs: side of the blade's body
    o.s1.span(x - bs, ey, zf, x - bs, py, zf);
    o.s2.span(x, py, zf, 0, -f, 1);
    o.pen.place(x, py, 1 + up, 1); o.pen.rotation.z = Math.atan2(bs, 0);               // leans away from the blade
    if (o.fill && sg[0] === "d") { for (i = 0; i < 40; i++) { var q = x * i / 40; o.ink[0].push(q, -q * q / (4 * f), .8); } o.fill = false; }
    if (sg[0] === "d") o.ink[side < 0 ? 0 : 1].push(x, py, .8);
    S.set("p", (Math.hypot(x, py + f) / 10).toFixed(1) + " cm");
    S.set("e", ((f - py) / 10).toFixed(1) + " cm");
  }
});
