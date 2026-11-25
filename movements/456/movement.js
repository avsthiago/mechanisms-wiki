M507.define({
  number: 456,
  title: "Cary's rotary pump",
  lede: "A drum turns inside a round casing and carries two sliding bars, called pistons. A fixed heart-shaped track slides each piston out to sweep water round, and pulls it back in to pass a block at the bottom. The water is pushed up a side passage and out of a spout.",
  alt: "A round casing with its front cover off. Inside is an orange ring-shaped drum with two green bars sticking out of it on opposite sides. In the middle a yellow heart-shaped plate with a groove surrounds the shaft. A pipe enters at the bottom left. A passage leaves at the bottom right, runs up the right side and bends over into a spout.",
  parts: [
    { key: "case", color: "#5E7387", name: "Cylinder", note: "The casing, the pipes and the block at the bottom that touches the drum. It all stands still. The front cover is left off so you can see inside." },
    { key: "drum", color: "#C8873A", name: "Drum", note: "A ring fixed to the shaft by two guide bars. It turns and carries the pistons round. Watch its red stripe." },
    { key: "piston", color: "#4FA58A", name: "Sliding pistons", note: "Two bars that slide in and out between the guide bars. A pin on the inner end of each one runs in the groove of the cam. One has a red dot on its pin." },
    { key: "cam", color: "#D9B13B", name: "Heart cam", note: "A fixed plate round the shaft with a heart-shaped groove. It does not turn. The groove is close to the shaft at the bottom and far from it everywhere else." }
  ],
  closed: { label: "Case" },
  readouts: [{ id: "rpm", label: "Drum" }, { id: "out", label: "Red piston" }],
  views: { "3d": [321, 123, 589], front: [46, -27, 670], side: [700, -27, 0] },
  target: [46, -27, 0],
  how: [
    "Look at the two green pistons. They turn with the orange drum. Each has a pin on its inner end, and the pin runs in the groove of the yellow cam. The cam stands still, so the groove steers each pin as it goes round.",
    "Over the top the groove is far from the shaft. There the piston is pushed out until it touches the casing, and it sweeps the water along in front of it, shown as blue dots. Behind it the space grows and new water is drawn up the pipe on the left.",
    "At the bottom a block fills the space between drum and casing, so the water must leave by the passage on the right. There the groove dips in towards the shaft and pulls the piston back into the drum. Follow the red dot. The piston slides in to pass the block, then out again on the other side. Choose Closed to see the pump as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front cover is left off, and the water is drawn as small blue balls so you can see it move. Brown shows a heart cam with the pistons bearing on it. Here it is drawn as a groove, so that it can pull the pistons in as well as push them out. The groove dips more gently than in the drawing, so a piston starts to slide in sooner than Brown shows. The exact shapes of the cam, the block and the passages, and all the sizes, were made up.",

  /* All about the shaft at the origin, angles in radians anticlockwise from +X.
     Bore 92, drum 70. A piston's round end (radius 5) has its centre at _rc(a) when the piston points along a:
     65 (level with the drum) within 10 degrees of the middle of the block at -88 degrees, 87 (touching the bore)
     from 80 degrees away onward, and in between two matched parabolas (speeding up, then slowing down).
     The pin (radius 3) is 48 nearer the shaft, so its centre follows _rc - 48: from 17 to 39. The groove walls are that
     path pushed 3 to each side along its normal, so the pin fits the groove exactly all the way round. */
  _K: { R: 92, rd: 70, tip: 5, L: 48, pin: 3, mid: -88 * Math.PI / 180, flat: 10 * Math.PI / 180, ramp: 70 * Math.PI / 180 },
  _rc: function (a) {
    var K = this._K, d = Math.abs(Math.atan2(Math.sin(a - K.mid), Math.cos(a - K.mid))), x = Math.max(0, Math.min(1, (d - K.flat) / K.ramp));
    return 65 + 22 * (x < .5 ? 2 * x * x : 1 - 2 * (1 - x) * (1 - x));
  },
  _off: function (a, w) {                                   // point of the pin path at angle a, pushed out by w along the normal
    var h = 1e-5, r = this._rc(a) - this._K.L, dr = (this._rc(a + h) - this._rc(a - h)) / (2 * h), ca = Math.cos(a), sa = Math.sin(a);
    var tx = dr * ca - r * sa, ty = dr * sa + r * ca, tl = Math.hypot(tx, ty);
    return [r * ca + w * ty / tl, r * sa - w * tx / tl];
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this._K, self = this, D = Math.PI / 180, R = K.R, W = 102, Q = 122, S = 134, mc = c.mat("case"), i;
    var o = this.o = { th: 0 };
    function arc(cx, cy, rad, a0, a1, n) { var p = [], j, a; for (j = 0; j <= n; j++) { a = (a0 + (a1 - a0) * j / n) * D; p.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); } return p; }
    var aL = Math.atan2(-Math.sqrt(R * R - 62 * 62), -62) / D + 360, aLo = Math.atan2(-Math.sqrt(W * W - 72 * 72), -72) / D + 360;   // inlet pipe left wall x -72..-62
    var aM = -43.6, aH = Math.atan2(Math.sqrt(W * W - 92 * 92), 92) / D, aE0 = -98, aE1 = -78, yE = -Math.sqrt(R * R - 22 * 22), aEb = Math.atan2(-Math.sqrt(S * S - 100), -10) / D;
    o.aE0 = aE0 * D; o.TT = (360 - (aE1 - aE0)) * D; o.tIn = (aE0 - (aL - 360)) * D; o.tOut = (aE0 - aM + 360) * D;
    // casing wall from the outlet opening round the top to the inlet pipe, with the left wall of the rising passage and the bend over the spout
    var main = arc(0, 0, R, aM, aL, 90).concat([[-62, -170], [-72, -170]], arc(0, 0, W, aLo, aH, 80), [[92, 80]], arc(128, 80, 36, 180, 0, 24), [[164, 45], [154, 45]],
      arc(128, 80, 26, 0, 180, 24), [[102, 0]], arc(0, 0, W, 0, aM, 16));
    // outer wall of the passage: radius 122..134 from the block up to the level of the shaft, then upright x 122..134 with a round top
    var outer = arc(0, 0, S, aE1, 0, 24).concat(arc(128, 80, 6, 0, 180, 10), arc(0, 0, Q, 0, aE1, 24));
    // the block that touches the drum (radius 70, from -98 to -78 degrees), with the right wall of the inlet pipe (x -22..-10) below it
    var block = arc(0, 0, K.rd, aE1, aE0, 10).concat([[-22, yE], [-22, -170], [-10, -170]], arc(0, 0, S, aEb, aE1, 8));
    var back = [[-72, -170]].concat(arc(0, 0, W, aLo, aH, 80), [[92, 80]], arc(128, 80, 36, 180, 0, 24), [[164, 45], [134, 45]], arc(0, 0, S, 0, aEb, 30), [[-10, -170]]);
    [main, outer, block].forEach(function (p) { scene.add(P.outlinePlate({ points: p, depth: 40, z0: -20, material: mc })); });   // walls z -20..20
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: c.mat("case", "light") }), "open"));   // back cover z -26..-20, pale so the water shows
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: mc }), "closed"));   // closed: the same back cover in the casing colour
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: 20, material: mc }), "closed"));          // closed: front cover z 20..26, on the walls; the shaft comes out through it
    // cam, fixed on the back cover, z -20..-15: the island inside the groove and the rim outside it
    var n = 360, isl = [], gi = [], go = [];
    for (i = 0; i < n; i++) { var a = 2 * Math.PI * i / n; isl.push(this._off(a, -K.pin)); gi.push(this._off(a, K.pin)); go.push(this._off(a, K.pin + 2.5)); }
    scene.add(P.outlinePlate({ points: isl, holes: [arc(0, 0, 8, 0, 354, 60)], depth: 5, z0: -20, material: c.mat("cam") }));
    scene.add(P.outlinePlate({ points: go, holes: [gi], depth: 5, z0: -20, material: c.mat("cam") }));
    // drum: ring 58..70, z -20..16, joined to the hub by two guide bars
    o.rot = new T.Group(); scene.add(o.rot);
    var md = c.mat("drum");
    o.rot.add(P.annulus({ rIn: 58, rOut: K.rd, depth: 36, z0: -20, material: md }));
    [-1, 1].forEach(function (s) { P.at(P.box(116, 7, 30.5, md), 0, s * 8.5, .75, o.rot); });   // bars y 5..12, z -14.5..16, clear of the cam (top at -15); ends inside the ring
    P.at(P.cylZ(12, 30.5, md), 0, 0, .75, o.rot);                                       // hub z -14.5..16
    P.at(P.cylZ(7, 104, c.mat("drum", "dark")), 0, 0, -8, o.rot);                       // shaft z -60..44, through the hole in the cam (radius 8)
    var sg = new T.Group(); sg.rotation.z = 90 * D; o.rot.add(sg);
    P.at(P.box(8, 3, 1, c.mat("drum", "mark")), 64, 0, 17, sg);                         // stripe r 60..68, z 16.5..17.5, lifted off the ring face (z 16)
    // pistons along the drum's X: measured from the pin, shank -4..28.5 (z -14.5..17), blade 28.5..48 (z -19.5..17) and a round end of radius 5 at 48
    o.pis = [0, 1].map(function (k) {
      var arm = new T.Group(); arm.rotation.z = k * Math.PI; o.rot.add(arm);
      var g = new T.Group(), m = c.mat("piston"); arm.add(g);
      P.at(P.box(32.5, 10, 31.5, m), 12.25, 0, 1.25, g);
      P.at(P.box(19.5, 10, 36.5, m), 38.25, 0, -1.25, g);
      P.at(P.cylZ(K.tip, 36.5, m), K.L, 0, -1.25, g);
      P.at(P.cylZ(K.pin, 5, c.mat("piston", "dark")), 0, 0, -17, g);                    // pin z -19.5..-14.5, in the groove
      P.at(P.cylZ(K.pin, 1, c.mat("piston", k ? "dark" : "mark")), 0, 0, 17.5, g);      // pin head z 17..18, on the piston face
      return g;
    });
    // water as moving balls between the drum and the bore, measured clockwise from the left edge of the block
    o.flow = P.steamFlow({ color: c.spot, even: true, count: 340, size: 2.5, z0: -14, z1: 12 }); scene.add(o.flow);
    o.dom = o.flow.domain({ density: .02, pad: .07, drain: .5, f: function (t, out) {
      var a = o.aE0 - t, ca = Math.cos(a), sa = Math.sin(a); out[0] = K.rd * ca; out[1] = K.rd * sa; out[2] = R * ca; out[3] = R * sa;
    } });
    o.bars = [0, 0, 0, 0]; o.kinds = [0, 0, 0]; o.ports = [0, 0, 0];
    o.flow.pipe({ points: [[-42, -195], [-42, -84]], width: 30, n: 18, speed: .4 });
    var path = [[97 * Math.cos(-61 * D), 97 * Math.sin(-61 * D)]].concat(arc(0, 0, 112, -56, 0, 8), arc(128, 80, 16, 180, 0, 8), [[144, 45], [144, -30]]);
    o.flow.pipe({ points: path, width: 15, n: 46, speed: .2 });                         // runs from the drum to the spout
  },

  step: function (c, dt, S) {
    var o = this.o, K = this._K, TP = 2 * Math.PI, D = Math.PI / 180, k, ts = [];
    o.th -= S.w * dt;                                                                   // clockwise, as the arrows in the drawing
    var a0 = 60 * D + o.th;                                                             // the pistons start as drawn
    o.rot.rotation.z = a0;
    for (k = 0; k < 2; k++) {
      var a = a0 + k * Math.PI, rc = this._rc(a);
      o.pis[k].position.x = rc - K.L;
      if (!k) o.out = rc - 65;
      var t = o.aE0 - a; t -= TP * Math.floor(t / TP);
      if (rc > 86.99 && t < o.TT) ts.push(t);                                           // a door across the chamber only while it touches the bore
    }
    ts.sort(function (x, y) { return x - y; });
    var n = ts.length + 1;
    o.bars[0] = 0; for (k = 0; k < ts.length; k++) o.bars[k + 1] = ts[k]; o.bars[n] = o.TT;
    for (k = 0; k < n; k++) {
      o.kinds[k] = k === 0 ? 1 : k === n - 1 ? 3 : 2;
      o.ports[k] = k === 0 ? Math.min(o.tIn / 2, o.bars[1]) : k === n - 1 ? Math.max((o.tOut + o.TT) / 2, o.bars[k]) : o.bars[k];
    }
    o.dom.set(o.bars, o.kinds, o.ports, n);
    o.flow.update(Math.abs(S.w) * dt);
    var rpm = S.playing ? -S.rpm : 0;
    S.set("rpm", (rpm < 0 ? "−" + -rpm : rpm) + " rpm");
    S.set("out", Math.round(o.out) + " mm out");
  }
});
