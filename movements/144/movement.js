M507.define({
  number: 144,
  title: "Lazy tongs",
  lede: "Strips of metal cross like scissors and are joined by pins. When the right end is pushed in and out a little, the left end moves in and out much further. Toy grabbers and old pumps used this to reach a long way from a small push.",
  alt: "A zigzag of crossed bars joined by pins, with a ring at each end and a rod coming out of each ring. A block stands under the crossing nearest the right end and holds it still.",
  parts: [
    { key: "input", color: "#5E7387", name: "Driving rod", note: "The rod you push and pull. It moves only a short way." },
    { key: "link", color: "#D9B13B", name: "Crossed bars", note: "Equal bars joined in the middle and at the ends. They open and close like scissors." },
    { key: "pin", color: "#C2503F", name: "Pins", note: "Each pin is a hinge. Watch the pins at the top and bottom. They move apart and together as the bars open and close." },
    { key: "output", color: "#4FA58A", name: "Driven rod", note: "The rod at the far end of the zigzag. It moves much further than the right rod." }
  ],
  controls: [{ id: "n", label: "Crossings", value: "3", options: [["3", "3"], ["5", "5"], ["7", "7"]] }],
  readouts: [{ id: "i", label: "Right rod" }, { id: "o", label: "Left rod" }],
  views: { "3d": [30, 70, 360], front: [-40, -30, 400], side: [500, 0, 0] },
  target: [-40, -30, 0],
  how: [
    "Every bar is the same length. Where two bars cross, a pin joins them in the middle. The block holds the crossing nearest the right end still. The two rods can move only away from it or towards it.",
    "When the right rod moves out a little, every diamond in the zigzag gets a little wider. All the widenings add up along the whole chain. The left rod has more diamonds between it and the block, so it moves further.",
    "Try 3 crossings, then 5, then 7. Compare the two readings. The left rod moves three, five or seven times as far as the right rod."
  ],
  note: "This model is rebuilt from Brown's drawing. The block, its base, the two layers of bars, the rod lengths and all the sizes were made up. Brown shows four diamonds. The different numbers of crossings were added for comparison.",

  K: { S: 45, U0: 18, A: 8, NMAX: 7 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { ph: 0, bars: [], tops: [], bots: [], mids: [] };
    function mkbar(L) {
      var g = new T.Group(); scene.add(g);
      P.at(P.box(L, 7, 5, c.mat("link")), 0, 0, 0, g);                                   // z +-2.5
      P.at(P.cylZ(5, 6, c.mat("link")), -L / 2, 0, 0, g);                                // end discs z +-3
      P.at(P.cylZ(5, 6, c.mat("link")), L / 2, 0, 0, g);
      return g;
    }
    function mkpin(m) {
      var g = new T.Group(); scene.add(g);
      P.at(P.cylZ(3, 20, c.mat("pin")), 0, 0, 0, g);                                     // z -10..10
      P.at(P.cylZ(4.2, 1, c.mat("pin")), 0, 0, 10.5, g);                                 // caps z 10..11 and -11..-10
      P.at(P.cylZ(4.2, 1, c.mat("pin")), 0, 0, -10.5, g);
      return g;
    }
    var i;
    for (i = 0; i < K.NMAX; i++) {
      o.bars.push({ a: mkbar(2 * K.S), b: mkbar(2 * K.S) });                             // a: "\" bar, b: "/" bar
    }
    o.hl = { lt: mkbar(K.S), lb: mkbar(K.S), rt: mkbar(K.S), rb: mkbar(K.S) };
    for (i = 0; i <= K.NMAX; i++) { o.tops.push(mkpin()); o.bots.push(mkpin()); }
    for (i = 1; i <= K.NMAX; i++) o.mids.push(mkpin());
    // eyes: ring blocks z -8..8 with a rod each, pins on top
    o.eyeL = new T.Group(); scene.add(o.eyeL);
    P.at(P.cylZ(9, 16, c.mat("output")), 0, 0, 0, o.eyeL);
    P.at(P.cylX(5, 50, c.mat("output")), -25, 0, 0, o.eyeL);
    o.eyeR = new T.Group(); scene.add(o.eyeR);
    P.at(P.cylZ(9, 16, c.mat("input")), 0, 0, 0, o.eyeR);
    P.at(P.cylX(5, 50, c.mat("input")), 25, 0, 0, o.eyeR);
    o.pinL = mkpin(); o.pinR = mkpin();
    // block under the held crossing: plate x -16..16, y -150..8, z -16..-10 (pins end at z -10); base x -70..70, y -156..-150, z -40..-6
    P.at(P.box(32, 158, 6, c.fixed), 0, -71, -13.5, scene);   // plate z -16.5..-10.5
    P.at(P.box(140, 6, 34, c.fixed), 0, -153, -23, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, N = +S.controls.n || 3, s = K.S, i;
    o.ph += S.w * dt;
    var r = K.A * Math.sin(o.ph), u = K.U0 + r / 2;
    var h = Math.sqrt(s * s - u * u), phi = Math.atan2(h, u);
    var ex = -2 * N * u;                         // left eye x; the held crossing is at x = 0
    function put(g, x, y, z, ang) { g.position.set(x, y, z); g.rotation.z = ang || 0; }
    var ZF = -3.5, ZB = 3.5;                     // "/" bars z -6..-1, "\" bars z 1..6
    for (i = 0; i < K.NMAX; i++) {
      var on = i < N, bx = ex + 2 * u * (i + 1);
      o.bars[i].a.visible = o.bars[i].b.visible = on;
      put(o.bars[i].a, bx, 0, ZB, -phi);
      put(o.bars[i].b, bx, 0, ZF, phi);
      o.mids[i].visible = i < N; put(o.mids[i], bx, 0, 0);
    }
    for (i = 0; i <= K.NMAX; i++) {
      var tx = ex + (2 * i + 1) * u, v = i <= N;
      o.tops[i].visible = o.bots[i].visible = v;
      put(o.tops[i], tx, h, 0); put(o.bots[i], tx, -h, 0);
    }
    put(o.hl.lt, ex + u / 2, h / 2, ZF, phi); put(o.hl.lb, ex + u / 2, -h / 2, ZB, -phi);
    var xt = ex + (2 * N + 1) * u, er = ex + (2 * N + 2) * u;
    put(o.hl.rt, xt + u / 2, h / 2, ZB, -phi); put(o.hl.rb, xt + u / 2, -h / 2, ZF, phi);
    put(o.eyeL, ex, 0, 0); put(o.eyeR, er, 0, 0);
    put(o.pinL, ex, 0, 0); put(o.pinR, er, 0, 0);
    var di = Math.round(2 * (u - K.U0)), dn = Math.round(-2 * N * (u - K.U0));
    function sg(n) { return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n) + " mm"; }
    S.set("i", sg(di)); S.set("o", sg(dn));
  }
});
