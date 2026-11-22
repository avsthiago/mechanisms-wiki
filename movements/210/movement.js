M507.define({
  number: 210,
  title: "Curved slotted arm and upright bar",
  lede: "Turning a shaft swings a hook-shaped arm with a curved slot. A pin on an upright bar rides in the slot, so the bar slides up and down. Its speed changes even though the shaft turns steadily.",
  alt: "A flat hook-shaped arm fixed on a round shaft, with a curved slot running up its side and across its top. Behind it an upright round bar slides in two guides, and a red pin on the bar sits in the slot.",
  parts: [
    { key: "curved", color: "#5E7387", name: "Curved arm", note: "A flat arm shaped like a hook, fixed to the shaft. It has a curved slot cut through it. The shaft turns it to and fro at a steady speed." },
    { key: "bar", color: "#C8873A", name: "Upright bar", note: "A round bar held by two guides, so it can only slide up and down. It passes behind the curved arm." },
    { key: "pin", color: "#C2503F", name: "Pin", note: "Fixed to the bar and held in the slot. Watch it slide along the slot as the arm turns." }
  ],
  controls: [{ id: "part", label: "Part of the slot used", value: "most", options: [["top", "Straight end"], ["most", "Most of the slot"], ["curve", "Curved part"]] }],
  readouts: [{ id: "a", label: "Curved arm" }, { id: "b", label: "Bar" }],
  views: { "3d": [350, 110, 780], front: [10, 0, 1060], side: [1060, 0, 0] },
  target: [10, 0, 0],
  how: [
    "The shaft turns the curved arm one way and then back, at a steady speed. The pin must stay in the slot, and the guides only let the bar go up and down. So the slot drags the pin, and the bar with it, up or down.",
    "Where the slot runs straight across the top, it mostly slides past the pin. The bar hardly moves. Where the slot curves down the side, it is steep, so it lifts or lowers the pin quickly. The same steady turning gives the bar a changing speed.",
    "Try Straight end, then Curved part, and compare the bar's speed in the readout. With Most of the slot you see the bar creep and then hurry in every swing."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show what turns the shaft, so the model turns it to and fro at a steady speed. The slot does not go all the way round, so the shaft cannot make full turns. The backing plate, the sizes and how far the arm swings were made up. The bar is made longer than drawn so it stays in both guides. The choice of slot part was added to show where the speed changes.",

  K: { SH: [0, -28], BX: 32.8, LO: -60, HI: 10, RANGES: { top: [-22, 4], most: [-60, 10], curve: [-60, -36] } },

  /* Centre line of the slot, measured from the shaft: most of a half circle up the left side, then a straight piece across
     the top. They are tangent, so the pin slides smoothly from one to the other. */
  _slot: function () {
    var p = [], cx = 10.4, cy = 68, R = 88, i, a0 = 225 * Math.PI / 180, a1 = Math.PI / 2;
    for (i = 0; i <= 80; i++) { var a = a0 + (a1 - a0) * i / 80; p.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    for (i = 1; i <= 16; i++) p.push([cx + 64 * i / 16, cy + R]);
    return p;
  },
  /* Where the slot's centre line crosses the bar's line (x = BX), with the arm turned by th. Of the crossings, the one nearest
     the last answer (distance `prev` along the slot) is kept. */
  _solve: function (sl, th, prev) {
    var K = this.K, c = Math.cos(th), s = Math.sin(th), p = sl.points, best = null, i, a, b;
    function w(k) { var x = K.SH[0] + p[k][0] * c - p[k][1] * s, y = K.SH[1] + p[k][0] * s + p[k][1] * c; return { x: x, y: y, f: x - K.BX }; }
    a = w(0);
    for (i = 1; i < p.length; i++, a = b) {
      b = w(i);
      if ((a.f < 0) === (b.f < 0)) continue;
      var u = a.f / (a.f - b.f), sv = sl.cum[i - 1] + u * (sl.cum[i] - sl.cum[i - 1]), d = prev == null ? -sv : Math.abs(sv - prev);
      if (!best || d < best.d) best = { s: sv, y: a.y + (b.y - a.y) * u, d: d };
    }
    return best;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { th: 0, dir: -1, prev: null };
    // curved arm, outline traced from the engraving, measured from the shaft; z 4..14
    var px = [[300, 102], [325, 102], [370, 112], [395, 130], [400, 150], [390, 170], [372, 182], [330, 186], [282, 188], [264, 205], [260, 235],
      [275, 260], [300, 270], [340, 290], [357, 320], [360, 350], [350, 390], [320, 420], [280, 437], [240, 435], [200, 400], [165, 350],
      [147, 300], [147, 250], [165, 200], [200, 150], [240, 120], [275, 106]];
    var outline = px.map(function (q) { return [(q[0] - 272) * .8, (345 - q[1]) * .8]; });
    o.curved = new T.Group(); o.curved.position.set(K.SH[0], K.SH[1], 0); scene.add(o.curved);
    var plate = P.slottedPlate({ outline: outline, smooth: true, slot: this._slot(), half: 10, thick: 10, material: c.mat("curved") });
    P.at(plate, 0, 0, 9, o.curved);                                                           // plate z 4..14
    P.at(P.cylZ(32, 2, c.mat("curved")), 0, 0, 15, o.curved);                                 // boss z 14..16, on the front face
    P.at(P.cylZ(17, 47, c.mat("curved")), 0, 0, -6.5, o.curved);                              // shaft z -30..17, from the plate face to 1 past the boss
    P.at(P.box(26, 4, 1, c.mat("curved", "dark")), 0, 0, 17.5, o.curved);                     // stripe on the shaft end, z 17..18
    o.sl = plate.slot;
    // upright bar: radius 11 on x = BX, centre z -14 (z -25..-3); pin on it z -14..17 through the slot, head z 15..18
    o.bar = new T.Group(); scene.add(o.bar);
    o.y0 = this._solve(o.sl, 0, null).y;                                                      // the pin's height as drawn (128)
    P.at(P.cylY(11, 480, c.mat("bar")), K.BX, 266 - 240 - o.y0, -14, o.bar);                  // bar y -214..266 at rest (local to the pin height)
    P.at(P.cylZ(7, 31, c.mat("pin", "mark")), K.BX, 0, 1.5, o.bar);
    P.at(P.cylZ(11, 3, c.mat("pin", "mark")), K.BX, 0, 16.5, o.bar);
    // guides: x BX -/+ 17, depth z -30..2 (back on the plate face, 2 clear of the arm), top y 188..212, bottom y -202..-178
    [200, -190].forEach(function (y) { var g = P.guideBlock({ w: 34, h: 24, d: 32, hole: 11.5, material: c.fixed }); P.at(g, K.BX, y, -14, scene); });
    // plate x -150..170, y -270..230, z -40..-30; base y -282..-270
    P.at(P.box(320, 500, 10, c.fixed), 10, -20, -35, scene);
    P.at(P.box(360, 12, 100, c.fixed), 10, -276, -30, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, D = Math.PI / 180, r = K.RANGES[S.controls.part] || K.RANGES.most;
    var w = S.w * (K.HI - K.LO) * D / Math.PI;               // steady turning: one there-and-back per turn of the speed setting
    o.th += o.dir * w * dt;
    if (o.th > r[1] * D && o.dir > 0) o.dir = -1;
    if (o.th < r[0] * D && o.dir < 0) o.dir = 1;
    var q = this._solve(o.sl, o.th, o.prev), e = 1e-3;
    if (!q) return;
    o.prev = q.s;
    var q2 = this._solve(o.sl, o.th + e, q.s), rate = (q2.y - q.y) / e;   // bar travel per unit turn of the arm
    o.curved.rotation.z = o.th;
    o.bar.position.y = q.y;
    function f(v, u) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + u; }
    var wa = S.w === 0 ? 0 : o.dir * w;
    S.set("a", f(wa / D, "°/s"));
    S.set("b", f(wa * rate, " mm/s"));
  }
});
