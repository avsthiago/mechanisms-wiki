(function () {
  // Layout (model units, y up). The pendulum hangs from a short spring under a bracket on a back board; its pivot is
  // at (0, PY, 0) and it swings in the XY plane. Parts below the rod are placed by their heights as drawn at T0 inside a
  // group that drops by e, the extra length of the rod. A two-layer bar sits across the top of the bob: brass below,
  // steel above. Warmth bends it up (curvature K grows), lifting the two small weights by dy. The rod's growth is tied to
  // dy so that the shared centre of the bob and weights stays put: (MB + MW) * e = MW * dy. Sizes in the model are made
  // very large so you can see them; the readouts give the real sizes for a seconds pendulum about a metre long.
  var PY = 235, RAD = Math.PI / 180, T0 = 20, MB = 4, MW = 1;    // pivot height, drawing temperature, bob and weights (both together)
  var YBAR = -42, SB = 150, SW = 125, K0 = .00179, KT = 2.13e-4;   // bar centre line, half length, where the weights sit, curvature at T0 and per degree
  var MTOP = -52, MBOT = -209, MC = (MTOP + MBOT) / 2;             // bob
  var ALPHA = 11.5e-6, LM = 1000, AMP = 3 * RAD, PER = 2;
  function pt(k, s) {                                               // point and slope at arc length s along the bar, from its middle
    if (Math.abs(k) < 1e-9) return [s, 0, 0];
    return [Math.sin(k * s) / k, (1 - Math.cos(k * s)) / k, k * s];
  }
  var DY0 = pt(K0, SW)[1], YCEN = (MB * MC + MW * (YBAR + DY0)) / (MB + MW);   // the centre, fixed

  M507.define({
    number: 317,
    title: "Compound-bar pendulum",
    lede: "The bob of this clock pendulum carries a bent bar with a small weight on each end. When it gets warm, the rod gets longer and the bob drops. But the bar bends up and lifts the weights, and that cancels the drop.",
    alt: "The lower end of a pendulum. A tall rounded bob hangs on the rod. Across its top lies a long thin bar, curved up at both ends, with a small square weight near each end. A nut is screwed on under the bob. A red line runs round the bob.",
    parts: [
      { key: "rod", color: "#D9B13B", name: "Pendulum rod", note: "A long steel rod hung from a short spring. In the warm it gets a little longer, which lowers everything that hangs from it." },
      { key: "bob", color: "#4FA58A", name: "Pendulum bob", note: "The main weight of the pendulum. The nut underneath screws up or down to set the clock." },
      { key: "bar", color: "#C8873A", name: "Two-metal bar", note: "A strip of brass with a strip of steel fixed on top. Brass grows more than steel when warm, so the bar bends upwards." },
      { key: "weights", color: "#8E7AA8", name: "Small weights", note: "Two weights clamped near the ends of the bar. They go up and down as the bar bends." },
      { key: "mark", color: "#C2503F", name: "Centre mark", note: "Not a real part. The red line marks the centre of the swing. Watch it stay level with the dark line on the board." }
    ],
    controls: [{ id: "temp", label: "Temperature", value: "20", options: [["5", "5 °C"], ["20", "20 °C"], ["35", "35 °C"]] }],
    speed: false,
    readouts: [{ id: "rod", label: "Rod longer" }, { id: "w", label: "Weights up" }, { id: "plain", label: "Plain bob" }],
    views: { "3d": [274, 40, 587], front: [0, -110, 1150], side: [1150, -110, 0] },
    target: [0, -110, 0],
    how: [
      "Change the temperature and watch the bar. When it is warm, the rod gets longer and the bob drops. At the same time the bar curls up at its ends and lifts the two small weights. The red line stays level with the dark line on the board.",
      "The bar is brass below and steel on top, fixed together along their length. Brass grows more than steel when warm. The bottom gets longer than the top, so the bar has to bend upwards. The weights are small, so they must rise about five times as far as the bob drops to keep the middle of the whole weight in one place.",
      "A pendulum keeps time by its length, so this one keeps the same time warm or cold. The real changes are far too small to see, and the model makes them much bigger. Try 5 °C, then 35 °C, and watch the weights."
    ],
    note: "This model is rebuilt from Brown's drawing, which shows only the bob end of the pendulum. The rod above, its spring, the bracket and the back board were made up, and the rod is drawn much shorter than a real one. The weights are taken as a quarter as heavy as the bob. The bending and the changes in length are made far larger than real ones so that you can see them. The readouts are worked out for a steel rod about a metre long.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mr = c.mat("rod"), mb = c.mat("bob"), mw = c.mat("weights");
      var o = this.o = { t: 0, T: T0 };
      // back board and bracket
      P.at(P.box(260, 520, 6, c.fixed), 0, -5, -57, scene);                           // x -130..130, y -265..255, z -60..-54
      P.at(P.box(40, 20, 64, c.fixed), 0, PY + 10, -22, scene);                         // bracket y 235..255, z -54..10, on the board's face
      var ref = P.arc(PY - YCEN, 1.2, 16 * RAD, c.mat("mark", "dark"));
      ref.rotation.z = -98 * RAD; P.at(ref, 0, PY, -52.3, scene);                       // tube z -53.5..-51.1, 0.5 off the board's face
      // pendulum
      o.pend = new T.Group(); o.pend.position.set(0, PY, 0); scene.add(o.pend);
      P.at(P.box(10, 16, 1.2, c.mat("rod", "dark")), 0, -8, 0, o.pend);               // spring y 0..-16 below the bracket's face
      P.at(P.box(14, 6, 8, mr), 0, -19, 0, o.pend);                                    // clamp y -16..-22
      o.rod = P.at(P.cylY(5, 1, mr), 0, 0, 0, o.pend);                                 // from -22 down to the bar's top, set each frame
      o.hang = new T.Group(); o.pend.add(o.hang);                                      // drawn at the heights it has at T0; dropped by e
      var prof = [[0, MBOT], [56.5, MBOT], [56.5, -80], [54, -66], [47, -56], [36, MTOP], [0, MTOP]].map(function (q) { return new T.Vector2(q[0], q[1]); });
      o.hang.add(new T.Mesh(new T.LatheGeometry(prof, 64), mb));                         // bob y -209..-52
      P.at(P.cylY(12, 7, mb), 0, MTOP + 3.5, 0, o.hang);                               // boss y -52..-45, 1 into the bar, under the bar's middle
      P.at(P.box(28, 14, 28, c.mat("bob", "dark")), 0, MBOT - 7, 0, o.hang);           // nut y -223..-209 under the bob
      P.at(P.cylY(6, 24, mb), 0, MBOT - 26, 0, o.hang);                                // screw end y -247..-223
      o.bar = new T.Group(); o.bar.position.y = YBAR; o.hang.add(o.bar);               // bar centre line at -42: brass -46..-42, steel -42..-38
      var pts = []; for (var i = 0; i <= 40; i++) pts.push([0, 0]);
      o.brass = P.flatStrip({ points: pts, thick: 4, width: 10, material: c.mat("bar") }); o.brass.userData.live = true; o.bar.add(o.brass);
      o.steel = P.flatStrip({ points: pts, thick: 4, width: 10, material: c.mat("bar", "dark") }); o.steel.userData.live = true; o.bar.add(o.steel);
      o.w = [-1, 1].map(function (s) {
        var g = new T.Group(); o.bar.add(g);
        P.at(P.box(26, 26, 22, mw), 0, 0, 0, g);                                       // clamped on the bar
        P.at(P.cylY(3, 5, c.mat("weights", "dark")), 0, 15.5, 0, g);                   // clamping screw y 13..18 on the top face
        return g;
      });
      o.mark = P.at(P.hoop(58, 1.2, c.mat("mark")), 0, YCEN - PY, 0, o.pend);         // ring 0.3 off the bob's side (radius 56.5)
      o.mark.rotation.x = Math.PI / 2;
    },

    step: function (c, dt, S) {
      var o = this.o, Tt = +S.controls.temp, i;
      if (S.playing) o.t += dt;
      o.T += (Tt - o.T) * Math.min(1, dt * 1.5);
      var dT = o.T - T0, K = K0 + KT * dT, dy = pt(K, SW)[1] - DY0, e = MW * dy / (MB + MW);
      o.pend.rotation.z = AMP * Math.sin(2 * Math.PI * o.t / PER);
      o.hang.position.y = -PY - e;
      var top = -22, bot = YBAR + 3.5 - PY - e; o.rod.scale.y = top - bot; o.rod.position.y = (top + bot) / 2;
      var b = [], s = [];
      for (i = 0; i <= 40; i++) {
        var u = -SB + 2 * SB * i / 40, q = pt(K, Math.abs(u)), x = u < 0 ? -q[0] : q[0], a = u < 0 ? -q[2] : q[2], nx = -Math.sin(a), ny = Math.cos(a);
        b.push([x - 2 * nx, q[1] - 2 * ny]); s.push([x + 2 * nx, q[1] + 2 * ny]);
      }
      o.brass.setPoints(b); o.steel.setPoints(s);
      var w = pt(K, SW);
      o.w[0].position.set(-w[0], w[1], 0); o.w[0].rotation.z = -w[2];
      o.w[1].position.set(w[0], w[1], 0); o.w[1].rotation.z = w[2];
      function sg(v, d) { var t = v.toFixed(d); return (+t > 0 ? "+" : +t < 0 ? "−" : "") + t.replace("-", ""); }
      var drod = ALPHA * LM * dT;
      S.set("rod", sg(drod, 2) + " mm");
      S.set("w", sg(drod * (MB + MW) / MW, 2) + " mm");
      S.set("plain", sg(-86400 * ALPHA * dT / 2, 0) + " s a day");
    }
  });
})();
