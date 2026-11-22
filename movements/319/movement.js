(function () {
  // Layout (model units). Seen from the front (+Z), balance staff on the Z axis. Back plate face z -34; balance spring
  // z -14..-8; balance z -4..4 (weights -7..7). The bar runs up and down. Each half of the rim is a two-layer strip
  // (brass outside, steel inside) fixed to one end of the bar and free at the other. At T0 it is a circle of radius R;
  // warmth makes its curvature larger (K = 1/R + KT * dT), so it curls inwards and carries its weight nearer the middle.
  // Rate goes as 1 / sqrt(I). The model's curl is made very large; the readouts scale it down so that the balance
  // just cancels the loss of a plain balance (taken as 11 s a day for each degree warmer) at the hot setting.
  var RAD = Math.PI / 180, R = 112, HW = 7.5, SW = 118 * RAD * R, SB = 178, KT = 4.2e-5, T0 = 20;
  var A0 = Math.PI / 2 - Math.asin(HW / R), AMP = 120 * RAD, PER = 2.5, LOSS = 11, NS = 40;
  function arc(K, s) {                                   // point, inward normal at arc length s along the upper half, from its fixed end
    var p0 = [R * Math.cos(A0), R * Math.sin(A0)], t0 = [Math.sin(A0), -Math.cos(A0)], n0 = [-Math.cos(A0), -Math.sin(A0)];
    var a = K * s, f = Math.sin(a) / K, g = (1 - Math.cos(a)) / K;
    return { x: p0[0] + t0[0] * f + n0[0] * g, y: p0[1] + t0[1] * f + n0[1] * g,
             nx: -t0[0] * Math.sin(a) + n0[0] * Math.cos(a), ny: -t0[1] * Math.sin(a) + n0[1] * Math.cos(a) };
  }
  function inertia(K) {                                  // weights 1 each, each half of the rim 0.5, bar and hub 0.4 spread along the bar
    var I = 2 * 0.4 * R * R / 3, q = arc(K, SB);
    I += 2 * (q.x * q.x + q.y * q.y);
    for (var i = 0; i < NS; i++) { var p = arc(K, SW * (i + .5) / NS); I += 2 * .5 / NS * (p.x * p.x + p.y * p.y); }
    return I;
  }
  var I0 = inertia(1 / R), FH = inertia(1 / R + KT * 15) / I0 - 1, SC = (2 * LOSS * 15 / 86400) / -FH;   // real share of the model's change

  M507.define({
    number: 319,
    title: "Compensation balance",
    lede: "The balance wheel of a good watch has a rim cut into two halves. Each half is made of brass and steel fixed together. When it gets warm the halves curl inwards, and the watch keeps the same time.",
    alt: "A balance wheel seen face on. A straight bar runs up and down through a round hub, with a small screw at each end. From the top end a curved strip runs round the right side, and from the bottom end another runs round the left side. Each strip carries a block about half way along and stops short of the bar.",
    parts: [
      { key: "bar", color: "#5E7387", name: "Bar and hub", note: "The middle of the balance. The screws at its ends are for setting the watch. The rim halves are fixed to its ends." },
      { key: "rim", color: "#C8873A", name: "Rim halves", note: "Each half is brass on the outside and steel on the inside, fixed together. The free end can curl in or out." },
      { key: "weights", color: "#8E7AA8", name: "Weights", note: "Two small weights on the rim. Watch them move in towards the middle when it gets warm." },
      { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A fine coiled spring behind the wheel. It pulls the wheel back towards the middle, so it keeps swinging." }
    ],
    controls: [{ id: "temp", label: "Temperature", value: "20", options: [["5", "5 °C"], ["20", "20 °C"], ["35", "35 °C"]] }],
    speed: false,
    readouts: [{ id: "plain", label: "Plain wheel" }, { id: "this", label: "This wheel" }],
    views: { "3d": [170, 110, 560], front: [0, 0, 600], side: [600, 0, 0] },
    target: [0, 0, 0],
    how: [
      "The wheel swings to and fro on its spring. Change the temperature and watch the free ends of the rim. When it is warm they curl inwards and bring the weights nearer the middle. When it is cold they open outwards.",
      "Heat slows a plain watch. The wheel gets a little bigger and the spring gets a little weaker. A wheel with its weight far out is slow to turn, and one with its weight near the middle is quick. So pulling the weights in speeds the wheel up again. The brass outside grows more than the steel inside, and that bends each half inwards.",
      "The real movement is far too small to see, and the model makes it much bigger. Try 5 °C, then 35 °C, and compare the plain wheel with this one."
    ],
    note: "This model is rebuilt from Brown's drawing. The spring, the block that holds it, the back plate and the sizes were made up. The wheel swings far more slowly than a real one. The curling is made far larger than real so that you can see it. The readouts take a plain wheel and steel spring to lose 11 seconds a day for each degree warmer, and size the real curling to cancel that at the hot setting.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mb = c.mat("bar"), i;
      var o = this.o = { t: 0, T: T0 };
      o.bal = new T.Group(); scene.add(o.bal);
      P.at(P.box(2 * HW, 2 * (R + 4), 8, mb), 0, 0, 0, o.bal);                         // bar y -116..116, z -4..4 (covers the rim's ends)
      P.at(P.cylZ(26, 10, mb), 0, 0, 0, o.bal);                                        // hub z -5..5
      [-14, 14].forEach(function (x) { P.at(P.cylZ(3, 1, c.mat("bar", "dark")), x, 0, 5.5, o.bal); });   // screw heads z 5..6 on the hub's face
      [1, -1].forEach(function (s) {
        P.at(P.cylY(4, 12, mb), 0, s * (R + 10), 0, o.bal);                           // timing screw y 116..128 out of the bar's end
        P.at(P.cylY(7, 6, c.mat("bar", "dark")), 0, s * (R + 19), 0, o.bal);           // its head y 128..134
      });
      P.at(P.cylZ(3, 48, mb), 0, 0, -10, o.bal);                                       // staff z -34..14 from the back plate's face
      P.at(P.cylZ(6, 6, mb), 0, 0, -11, o.bal);                                        // collet z -14..-8 for the spring's inner end
      var pts = []; for (i = 0; i <= NS; i++) pts.push([0, 0]);
      o.halves = [0, 1].map(function (k) {
        var g = new T.Group(); g.rotation.z = k * Math.PI; o.bal.add(g);                // the lower half is the upper one turned half round
        var h = { brass: P.flatStrip({ points: pts, thick: 4, width: 8, material: c.mat("rim") }), steel: P.flatStrip({ points: pts, thick: 4, width: 8, material: c.mat("rim", "dark") }), w: new T.Group() };
        h.brass.userData.live = h.steel.userData.live = true; g.add(h.brass); g.add(h.steel); g.add(h.w);
        h.w.add(P.outlinePlate({ points: [[-17, -14], [25, -17], [25, 17], [-17, 14]], depth: 14, z0: -7, material: c.mat("weights") }));   // straddles the rim, z -7..7
        P.at(P.cylX(3, 5, c.mat("weights", "dark")), 27.5, 0, 0, h.w);                  // screw x 25..30 on its outer face
        return h;
      });
      // balance spring behind the wheel, outer end in a stud on the back plate
      o.spr = P.spiralSpring({ rIn: 6.4, rOut: 50, width: 6, thick: 1.2, material: c.mat("spring") }); P.at(o.spr, 0, 0, -11, scene);
      P.at(P.box(7.4, 10, 26, c.fixed), -54.3, 0, -21, scene);                          // stud x -58..-50.6 (spring's outer face), z -34..-8
      P.at(P.box(320, 320, 6, c.fixed), 0, 0, -37, scene);                              // back plate z -40..-34
    },

    step: function (c, dt, S) {
      var o = this.o, Tt = +S.controls.temp, i;
      o.T += (Tt - o.T) * Math.min(1, dt * 1.5);
      var dT = o.T - T0, K = 1 / R + KT * dT, I = inertia(K);
      if (S.playing) o.t += dt * Math.sqrt(I0 / I);
      var th = AMP * Math.sin(2 * Math.PI * o.t / PER);
      o.bal.rotation.z = th;
      o.spr.rotation.z = th; o.spr.set(-(5 * 2 * Math.PI + Math.PI) - th, 1);          // outer end stays at 180 degrees on its stud
      var b = [], st = [];
      for (i = 0; i <= NS; i++) { var p = arc(K, SW * i / NS); b.push([p.x - 2 * p.nx, p.y - 2 * p.ny]); st.push([p.x + 2 * p.nx, p.y + 2 * p.ny]); }
      var q = arc(K, SB);
      o.halves.forEach(function (h) {
        h.brass.setPoints(b); h.steel.setPoints(st);
        h.w.position.set(q.x, q.y, 0); h.w.rotation.z = Math.atan2(-q.ny, -q.nx);      // local x points outwards
      });
      function sg(v) { var r = Math.round(v); return (r > 0 ? "+" : r < 0 ? "−" : "") + Math.abs(r) + " s a day"; }
      var plain = -LOSS * dT, comp = plain - 86400 * .5 * SC * (I / I0 - 1);
      S.set("plain", sg(plain)); S.set("this", sg(comp));
    }
  });
})();
