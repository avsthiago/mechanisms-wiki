(function () {
  // Sizes (model units). The crown wheel turns about the upright Y axis; its tooth tips are at height YT.
  // The spindle lies along X at height YT + D, straight over a diameter, and carries two flat pallets.
  var N = 15, RI = 92, RO = 100, YB = 16, HT = 24, YT = YB + HT, D = 30, L = 50, S0 = 6, TP = 3, A = 51 * Math.PI / 180;
  var XA = 58, XB = 112;                         // the pallets reach from x = 58 to 112 out from the middle, each side
  var P2 = 2 * Math.PI / N, IW = 1, TAU = 2000, CW = 2, CV = 300, H = .0005;

  // Pallet j (1 at x > 0, where the teeth run towards -z; 2 at x < 0, where they run towards +z) leans at angle b from
  // straight down, in the plane of z and height. gap() is the least distance from the tip edge of tooth k to the face
  // of that pallet (minus half its thickness); null when the tooth is not over the pallet at all.
  function palletAngle(j, ph) { return j === 1 ? -A - ph : A - ph; }
  function gap(j, k, th, ph) {
    var psi = (k + 1) * P2 + th, c0 = Math.cos(psi), s0 = Math.sin(psi), b = palletAngle(j, ph), best = null;
    if ((j === 1 && c0 < .5) || (j === 2 && c0 > -.5)) return null;
    [RI, RO].forEach(function (r) {
      var x = r * c0, z = -r * s0;
      if (Math.abs(x) < XA || Math.abs(x) > XB) return;
      var c = z * Math.cos(b) - D * Math.sin(b), s = z * Math.sin(b) + D * Math.cos(b);
      if (s < S0 || s > L) return;
      c = (j === 1 ? c : -c) - TP / 2;
      if (best === null || c < best) best = c;
    });
    return best;
  }
  function Sim() { this.th = 0; this.w = 0; this.ph = 0; this.W = 0; this.side = 0; this.beats = []; this.t = 0; this.amp = 0; }
  Sim.prototype.step = function (h, Iv) {
    // free motion: the weight turns the wheel, a little rub slows both parts
    this.w += (TAU - CW * this.w) / IW * h; this.W -= CV * this.W / Iv * h;
    var w0 = this.W;
    this.th += this.w * h; this.ph += this.W * h; this.t += h;
    // contacts: push the tooth and the pallet apart along the contact, sharing the move by their inertias; no bounce
    for (var it = 0; it < 3; it++) for (var j = 1; j <= 2; j++) for (var k = 0; k < N; k++) {
      var C = gap(j, k, this.th, this.ph); if (C === null || C >= 0 || C < -6) continue;
      var e = 1e-6, Ct = gap(j, k, this.th + e, this.ph), Cp = gap(j, k, this.th, this.ph + e);
      if (Ct === null || Cp === null) continue;
      var gt = (Ct - C) / e, gp = (Cp - C) / e, den = gt * gt / IW + gp * gp / Iv; if (den <= 0) continue;
      var lam = -C / den; this.th += lam * gt / IW; this.ph += lam * gp / Iv;
      var vn = gt * this.w + gp * this.W; if (vn < 0) { var mu = -vn / den; this.w += mu * gt / IW; this.W += mu * gp / Iv; }
      if (j !== this.side) { this.side = j; this.beats.push(this.t); if (this.beats.length > 6) this.beats.shift(); }
    }
    if (w0 * this.W < 0) this.amp = Math.abs(this.ph);                                 // the far end of a swing
  };
  function inertia(r) { return 60 + .1 * r * r; }   // the spindle and bar, plus two weights at distance r

  M507.define({
    number: 234,
    title: "Verge escapement",
    lede: "A crown wheel with saw teeth is pulled round by a weight. Two small flaps on a rocking rod let it move only one tooth at a time. This is the oldest kind of clock escapement.",
    alt: "A wheel lies flat on an upright shaft, with saw teeth standing up round its rim like a crown. A level rod runs across just above it, with two flat flaps hanging down into the teeth on opposite sides of the wheel. A bar with a weight at each end sits across one end of the rod and swings it to and fro.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Crown wheel", note: "Its teeth stand up round the rim like the points of a crown. A weight, not shown, keeps trying to turn it. Watch the red tooth go round one step at a time." },
      { key: "verge", color: "#C8873A", name: "Rod and flaps", note: "The rod is called the verge. Its two flaps, called pallets, stick out at an angle to each other and catch the teeth on opposite sides of the wheel." },
      { key: "bar", color: "#D9B13B", name: "Swinging bar", note: "A bar with a weight near each end, fixed across the rod. It makes the rod slow and steady to swing, like the wheel of a watch." }
    ],
    controls: [{ type: "range", id: "r", label: "Weights on the bar, distance from the rod", min: 25, max: 95, step: 5, value: 60, unit: "",
      presets: [[30, "Near"], [60, "Middle"], [90, "Far"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [340, 283, 400], front: [0, 40, 640], side: [640, 60, 0] },
    target: [0, 20, 0],
    how: [
      "The weight pulls the crown wheel round. A tooth on one side of the wheel presses on a flap and pushes it away. That turns the rod, so the flap on the other side swings down into the teeth there.",
      "The first flap swings far enough for its tooth to slip past the end. The wheel jumps forward, but a tooth on the other side at once lands on the second flap. Teeth on opposite sides run opposite ways, so this tooth pushes the rod back the other way. The wheel even moves back a little while the rod slows down. Each push and slip is one beat, and the wheel creeps round one tooth for every two beats.",
      "The bar with weights sets how fast the rod can swing. Weights far out make it slow to start and stop, so the beats come slower and the wheel turns more slowly. Try Near, then Far, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel and the rod with its flaps. The swinging bar with its weights, the posts, the base and the sizes were made up, and the weight that turns the wheel is left out. The rubbing that keeps the swing steady is a simple guess.",

    Sim: Sim, gap: gap, inertia: inertia,
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, mw = c.mat("wheel"), mv = c.mat("verge"), mb = c.mat("bar");
      var o = this.o = { sim: new Sim() };
      for (var i = 0; i < 12000; i++) o.sim.step(H, inertia(60));                    // run 6 seconds so it opens in its steady swing
      // crown wheel: local Z of the helper is world Y
      o.wheel = new T.Group(); scene.add(o.wheel);
      var cr = P.sawCrown({ teeth: N, rIn: RI, rOut: RO, base: YB, depth: HT, material: mw, markMaterial: c.mat("wheel", "mark") });
      cr.rotation.x = -Math.PI / 2; o.wheel.add(cr);                                  // band y 0..16, teeth y 16..40
      P.at(P.cylY(RO, 8, mw), 0, -4, 0, o.wheel);                                     // disc y -8..0, the band stands on it
      P.at(P.cylY(8, 74, mw), 0, -45, 0, o.wheel);                                    // shaft y -82..-8, base top to the disc
      P.at(P.cylY(14, 2, c.mat("wheel", "dark")), 0, 1, 0, o.wheel);                  // hub y 0..2, on the disc face
      // verge: a rod along X at height YT + D, with the two pallets; local frame turns about X
      o.verge = new T.Group(); o.verge.position.set(0, YT + D, 0); scene.add(o.verge);
      P.at(P.cylX(5, 350, mv), 0, 0, 0, o.verge);                                     // rod x -175..175, ends at the post faces
      [1, 2].forEach(function (j) {
        var b = palletAngle(j, 0), xs = j === 1 ? 1 : -1, g = new T.Group(); g.rotation.x = -b; o.verge.add(g);   // local -Y points along the pallet
        P.at(P.box(XB - XA, L - S0 + 4, TP, mv), xs * (XA + XB) / 2, -(S0 + L) / 2 + 2, 0, g);   // flap from s = 4 to L, half-thickness TP/2 each side
      });
      // swinging bar across the rod near its right end, with two weights
      o.bar = new T.Group(); o.bar.position.set(150, YT + D, 0); scene.add(o.bar);
      P.at(P.box(10, 10, 210, mb), 0, 0, 0, o.bar);                                   // bar z -105..105
      P.at(P.cylX(9, 12, mb), 0, 0, 0, o.bar);                                        // boss round the rod
      o.wts = [1, -1].map(function (s) { return P.at(P.cylZ(14, 18, mb), 0, 0, s * 60, o.bar); });   // weights slide along the bar
      // stand: base, two posts that hold the rod, the wheel shaft stands on the base
      P.at(P.box(420, 12, 220, c.fixed), 0, -88, 0, scene);                          // base y -94..-82
      P.at(P.box(20, 168, 30, c.fixed), 185, 2, 0, scene);                           // post x 175..195, y -82..86; rod (y 70) ends at x 175
      P.at(P.box(20, 168, 30, c.fixed), -185, 2, 0, scene);                          // post x -195..-175, y -82..86
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, r = S.controls.r, Iv = inertia(r), n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0;
      for (var i = 0; i < n; i++) sim.step(H, Iv);
      o.wheel.rotation.y = sim.th;
      o.verge.rotation.x = sim.ph; o.bar.rotation.x = sim.ph;
      o.wts.forEach(function (w, i) { w.position.z = (i ? -1 : 1) * r; });
      var b = sim.beats, per = b.length > 2 ? (b[b.length - 1] - b[0]) / (b.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
    }
  });
})();
