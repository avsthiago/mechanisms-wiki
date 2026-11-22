M507.define({
  number: 203,
  title: "Curved slotted arm and straight arm",
  lede: "A hook-shaped arm swings to and fro at a steady speed. A pin on a straight arm rides in its curved slot. The straight arm swings too, but slowly at one end of the slot and faster at the other.",
  alt: "A flat hook-shaped arm on a pivot at the lower left, with a long curved slot running up its side and across its top. A straight arm on a pivot at the right reaches left, and a red pin on its end sits in the slot.",
  parts: [
    { key: "curved", color: "#5E7387", name: "Curved arm", note: "A flat arm shaped like a hook, with a curved slot cut through it. It swings on its lower pivot at a steady speed." },
    { key: "straight", color: "#C8873A", name: "Straight arm", note: "Swings on the pivot at the right. Its end is behind the curved arm, and a pin from it pokes through the slot." },
    { key: "pin", color: "#C2503F", name: "Pin", note: "Fixed to the straight arm and held in the slot. Watch it slide along the slot as the curved arm swings." }
  ],
  controls: [{ id: "part", label: "Part of the slot used", value: "most", options: [["top", "Straight end"], ["most", "Most of the slot"], ["curve", "Curved part"]] }],
  readouts: [{ id: "a", label: "Curved arm" }, { id: "b", label: "Straight arm" }],
  views: { "3d": [290, 125, 630], front: [0, -5, 760], side: [780, -5, 0] },
  target: [0, -5, 0],
  how: [
    "The curved arm swings back and forth at a steady speed. The pin must stay in the slot, and the straight arm can only swing round its own pivot. So the pin is pushed up or down, and the straight arm swings with it.",
    "Where the slot runs straight across the top, it mostly slides past the pin. The pin is hardly pushed, so the straight arm creeps. Where the slot curves down, it pushes the pin much harder, and the straight arm moves faster. The same steady swing gives a changing speed.",
    "Try Straight end, then Curved part, and compare the straight arm's speed in the readout. With Most of the slot you see it creep and then hurry in every swing."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show what swings the curved arm, so the model swings it at a steady speed and turns it round at each end. The backing plate, the pivot pins, the sizes and how far the arm swings were made up. The choice of slot part was added to show where the speed changes.",

  K: { PC: [-120, -65.6], PR: [181.6, 94.4], LO: -60, HI: 10, RANGES: { top: [-22, 4], most: [-60, 10], curve: [-60, -36] } },

  /* Centre line of the slot, measured from the curved arm's pivot: a short upright piece, a quarter circle, and a straight piece
     across the top. All of it is tangent, so the pin slides smoothly from one piece to the next. */
  _slot: function () {
    var p = [], cx = 20, cy = 73.6, R = 84, i;
    for (i = 0; i <= 16; i++) p.push([cx - R, cy - 64 + 64 * i / 16]);
    for (i = 1; i <= 60; i++) { var a = Math.PI - Math.PI / 2 * i / 60; p.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    for (i = 1; i <= 14; i++) p.push([cx + 56 * i / 14, cy + R]);
    return p;
  },
  /* Where the slot's centre line meets the circle the pin can move on (radius `len` round the straight arm's pivot), with the
     curved arm turned by th. Of the crossings, the one nearest the last answer (distance `prev` along the slot) is kept. */
  _solve: function (sl, th, prev) {
    var K = this.K, c = Math.cos(th), s = Math.sin(th), p = sl.points, best = null, i, a, b;
    function w(k) { var x = K.PC[0] + p[k][0] * c - p[k][1] * s, y = K.PC[1] + p[k][0] * s + p[k][1] * c; return { x: x, y: y, f: Math.hypot(x - K.PR[0], y - K.PR[1]) - K.len }; }
    a = w(0);
    for (i = 1; i < p.length; i++, a = b) {
      b = w(i);
      if ((a.f < 0) === (b.f < 0)) continue;
      var u = a.f / (a.f - b.f), sv = sl.cum[i - 1] + u * (sl.cum[i] - sl.cum[i - 1]), d = prev == null ? -sv : Math.abs(sv - prev);
      if (!best || d < best.d) best = { s: sv, x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, d: d };
    }
    if (best) best.b = Math.atan2(K.PR[1] - best.y, K.PR[0] - best.x) + Math.PI;   // the arm points left, so near half a turn
    return best;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { th: 0, dir: -1, prev: null };
    // curved arm, outline traced from the engraving, measured from its pivot; z 4..14
    var px = [[145, 475], [100, 460], [60, 430], [30, 385], [17, 320], [22, 270], [32, 250], [75, 200], [125, 170], [200, 157], [250, 165], [272, 185],
      [275, 210], [262, 230], [225, 239], [165, 240], [145, 250], [135, 270], [137, 290], [150, 305], [175, 320], [205, 340], [222, 365], [228, 395],
      [222, 425], [210, 450], [180, 470]];
    var outline = px.map(function (q) { return [(q[0] - 290) * .8 - K.PC[0], (310 - q[1]) * .8 - K.PC[1]]; });
    o.curved = new T.Group(); o.curved.position.set(K.PC[0], K.PC[1], 0); scene.add(o.curved);
    var plate = P.slottedPlate({ outline: outline, smooth: true, slot: this._slot(), half: 10, thick: 10, material: c.mat("curved") });
    P.at(plate, 0, 0, 9, o.curved);                                                           // plate z 4..14
    P.at(P.cylZ(32, 2, c.mat("curved")), 0, 0, 15, o.curved);                                 // boss z 14..16, on the front face
    o.sl = plate.slot;
    // the pin's distance from the straight arm's pivot, taken from the drawing: on the slot where it starts across the top
    var s0 = this._solveStart(); K.len = s0;
    // straight arm z -12..-2, from the pivot (local origin) to the pin at (len, 0)
    o.straight = new T.Group(); o.straight.position.set(K.PR[0], K.PR[1], 0); scene.add(o.straight);
    P.at(P.armPlate({ length: K.len, r0: 40, r1: 18, thick: 10, material: c.mat("straight") }), 0, 0, -7, o.straight);
    P.at(P.cylZ(7, 24, c.mat("pin", "mark")), K.len, 0, 5, o.straight);                     // pin z -7..17, through the slot (curved arm z 4..14)
    P.at(P.cylZ(11, 3, c.mat("pin", "mark")), K.len, 0, 16.5, o.straight);                  // head z 15..18, 1 clear of the curved arm
    // supports: plate x -245..235, y -150..150, z -40..-30; pivot pins start on its face (z -30)
    P.at(P.box(480, 300, 10, c.fixed), -5, 0, -35, scene);
    P.at(P.box(520, 12, 100, c.fixed), -5, -156, -30, scene);                                // base y -162..-150, z -80..20; plate stands on y -150
    P.at(P.cylZ(18, 47, c.fixed), K.PC[0], K.PC[1], -6.5, scene);                             // pivot pin z -30..17, 1 proud of the boss
    P.at(P.cylZ(22, 29, c.fixed), K.PR[0], K.PR[1], -15.5, scene);                            // pivot pin z -30..-1, 1 proud of the straight arm
  },

  // the pin's circle passes through the slot's centre line at x = -86.4 on the straight piece, as drawn
  _solveStart: function () { var K = this.K; return Math.hypot(K.PR[0] + 86.4, K.PR[1] - (K.PC[1] + 73.6 + 84)); },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, D = Math.PI / 180, r = K.RANGES[S.controls.part] || K.RANGES.most;
    var w = S.w * (K.HI - K.LO) * D / Math.PI;               // steady swing: one there-and-back per turn of the speed setting
    o.th += o.dir * w * dt;
    if (o.th > r[1] * D && o.dir > 0) o.dir = -1;
    if (o.th < r[0] * D && o.dir < 0) o.dir = 1;
    var q = this._solve(o.sl, o.th, o.prev), e = 1e-3;
    if (!q) return;
    o.prev = q.s;
    var q2 = this._solve(o.sl, o.th + e, q.s), rate = (q2.b - q.b) / e;   // straight arm turns per unit turn of the curved arm
    o.curved.rotation.z = o.th;
    o.straight.rotation.z = q.b;
    function f(v) { v = Math.round(v * 10) / 10; return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "°/s"; }
    var wa = S.w === 0 ? 0 : o.dir * w;
    S.set("a", f(wa / D));
    S.set("b", f(wa * rate / D));
  }
});
