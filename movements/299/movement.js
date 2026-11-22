(function () {
  // Sizes (model units), in the model's own frame: the crown wheel turns about the upright Y axis and its tooth tips are
  // at height YT. The rocking rod lies along X at height YT + D, straight over a diameter, and carries two arms.
  // The whole model is then turned a quarter turn, so the opening view looks along the rod as Brown's drawing does.
  var N = 7, RI = 88, RO = 100, YB = 40, HT = 45, YT = 74, D = 16, L = 40, S0 = 7, TP = 5, A = 52 * Math.PI / 180;
  var XA = 70, XB = 106;                         // the arms reach from x = 70 to 106 out from the middle, each side
  var P2 = 2 * Math.PI / N, IW = 1, TAU = 600, CW = 2, CV = 40, H = .0005, G = 2776, MB = .019;

  // Arm j (1 at x > 0, where the teeth run towards -z; 2 at x < 0, where they run towards +z) leans at angle b from
  // straight down, in the plane of z and height. gap() is the least distance from the tip edge of tooth k to the face
  // of that arm (minus half its thickness); null when the tooth is not under the arm at all.
  function armAngle(j, ph) { return j === 1 ? -A - ph : A - ph; }
  function gap(j, k, th, ph) {
    var psi = (k + 1) * P2 + th, c0 = Math.cos(psi), s0 = Math.sin(psi), b = armAngle(j, ph), best = null;
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
  function Sim() { this.th = 0; this.w = 0; this.ph = .6; this.W = 0; this.side = 0; this.beats = []; this.t = 0; this.amp = 0; this.maxd = 0; }
  Sim.prototype.step = function (h, len) {
    // free motion: the weight turns the wheel, gravity pulls the pendulum back, a little rub slows both
    var w0 = this.W, Iv = 12 + MB * len * len;                                                      // the rod and arms, plus the bob at the end of the pendulum
    this.w += (TAU - CW * this.w) / IW * h; this.W += (-MB * G * len * Math.sin(this.ph) - CV * this.W) / Iv * h;
    this.th += this.w * h; this.ph += this.W * h; this.t += h;
    // contacts: push the tooth and the arm apart along the contact, sharing the move by their inertias; no bounce
    for (var it = 0; it < 3; it++) for (var j = 1; j <= 2; j++) for (var k = 0; k < N; k++) {
      var C = gap(j, k, this.th, this.ph); if (C === null || C >= 0 || C < -8) continue;
      var e = 1e-6, Ct = gap(j, k, this.th + e, this.ph), Cp = gap(j, k, this.th, this.ph + e);
      if (Ct === null || Cp === null) continue;
      if (it === 2 && -C > this.maxd) this.maxd = -C;
      var gt = (Ct - C) / e, gp = (Cp - C) / e, den = gt * gt / IW + gp * gp / Iv; if (den <= 0) continue;
      var lam = -C / den; this.th += lam * gt / IW; this.ph += lam * gp / Iv;
      var vn = gt * this.w + gp * this.W; if (vn < 0) { var mu = -vn / den; this.w += mu * gt / IW; this.W += mu * gp / Iv; }
      if (j !== this.side) { this.side = j; this.beats.push(this.t); if (this.beats.length > 6) this.beats.shift(); }
    }
    if (w0 * this.W < 0 && Math.abs(this.ph) > .2) this.amp = Math.abs(this.ph);                                 // the far end of a swing
  };

  M507.define({
    number: 299,
    title: "Old clock escapement",
    lede: "A wheel with big saw teeth round its rim is pulled round by a weight. Two arms on a rocking rod catch its teeth in turn, so it moves one step at a time. A pendulum on the rod sets the pace. Old clocks kept time this way.",
    alt: "A wide upright band, like a crown, with a few big saw teeth cut in its top edge. Just above it a rod points straight at you, seen end on as a small circle. Two short arms spread down from the rod, one to each side. One arm reaches a tooth on the near side of the band and the other a tooth on the far side. A pendulum hangs from the rod behind the band.",
    parts: [
      { key: "wheel", color: "#5E7387", name: "Crown wheel", note: "Its teeth stand up round the rim like the points of a crown. A weight, not shown, keeps trying to turn it. Watch the red stripe go round one step at a time." },
      { key: "verge", color: "#C8873A", name: "Rod and arms", note: "The rod lies across the top of the wheel. One arm hangs into the teeth on the near side and the other into the teeth on the far side. The arms are called pallets." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Fixed to the rod, so the two rock together. Its length sets how quickly they rock." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 100, max: 200, step: 10, value: 150, unit: "",
      presets: [[100, "Short"], [150, "Medium"], [200, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: { "3d": [90, 170, 500], front: [0, 0, 540], side: [560, 0, 0] },
    target: [0, -10, 0],
    how: [
      "You are looking along the rocking rod. The weight pulls the crown wheel round, so the teeth nearest you move to the right and the teeth on the far side move to the left. A near tooth presses on one arm and pushes it away. That turns the rod and swings the other arm down into the teeth on the far side.",
      "The first arm swings up until its tooth slips under the end. The wheel jumps on, but at once a far tooth lands on the second arm. That tooth pushes the rod back the other way. The pendulum does not stop at once, so for a moment the arm even pushes the wheel backwards. Each push and slip is one beat, and the wheel moves on one tooth for every two beats.",
      "The pendulum decides how long each swing takes. A long pendulum swings more slowly, so the beats come further apart and the wheel turns more slowly. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown shows only the band of teeth and the two arms on their rod. The pendulum, the posts, the base, the shaft under the wheel and the sizes were made up, and the weight that turns the wheel is left out. The arms are a little shorter than Brown draws them, so that each tooth is caught in time. The pendulum must be given a swing to start, as in a real clock. The rubbing that keeps the swing steady is a simple guess.",

    Sim: Sim, gap: gap, armAngle: armAngle,
    K: { N: N, P2: P2, H: H, RI: RI, RO: RO, YT: YT, HT: HT, D: D, L: L, S0: S0, TP: TP, XA: XA, XB: XB },
    build: function (c) {
      var T = c.THREE, P = c.P, mw = c.mat("wheel"), mv = c.mat("verge"), mp = c.mat("pend");
      var o = this.o = { sim: new Sim() };
      for (var i = 0; i < 12000; i++) o.sim.step(H, 150);                            // run 6 seconds so it opens in its steady swing
      // everything is built in the frame of the sizes above, then turned so that local x (the rod) points at the viewer
      var root = new T.Group(); root.rotation.y = -Math.PI / 2; root.position.set(0, 0, 40); c.scene.add(root);
      // crown wheel: local Z of the helper is the upright axis
      o.wheel = new T.Group(); root.add(o.wheel);
      var cr = P.sawCrown({ teeth: N, rIn: RI, rOut: RO, base: YB, depth: HT, material: mw });
      cr.rotation.x = -Math.PI / 2; cr.position.y = YT - HT - YB; o.wheel.add(cr);    // band y -11..29, teeth y 29..74
      var mk = P.at(P.box(1, 4, 26, c.mat("wheel", "mark")), (RO + .5) * Math.cos(.85 * P2), (RO + .5) * Math.sin(.85 * P2), 52, cr); mk.rotation.z = .85 * P2;   // thin red stripe on the outside of one tooth, radius RO..RO + 1
      P.at(P.cylY(RO, 8, mw), 0, -15, 0, o.wheel);                                    // disc y -19..-11, the band stands on it
      P.at(P.cylY(8, 131, mw), 0, -84.5, 0, o.wheel);                                 // shaft y -150..-19, base top to the disc
      P.at(P.cylY(14, 2, c.mat("wheel", "dark")), 0, -10, 0, o.wheel);                // hub y -11..-9, on the disc face
      // rod along local X at height YT + D, with the two arms; it turns about X
      o.verge = new T.Group(); o.verge.position.set(0, YT + D, 0); root.add(o.verge);
      P.at(P.cylX(4.5, 237, mv), -6.5, 0, 0, o.verge);                                // rod x -125..112, from the face of the first post
      P.at(P.cylX(4.5, 30, mv), -160, 0, 0, o.verge);                                 // rod x -175..-145, between the two posts
      [1, 2].forEach(function (j) {
        var b = armAngle(j, 0), xs = j === 1 ? 1 : -1, g = new T.Group(); g.rotation.x = -b; o.verge.add(g);   // local -Y points along the arm
        P.at(P.box(XB - XA, L - S0 + 4, TP, mv), xs * (XA + XB) / 2, -(S0 + L) / 2 + 2, 0, g);   // arm from s = 3 to L, half-thickness TP/2 each side
        P.at(P.cylX(9, XB - XA + 4, mv), xs * (XA + XB) / 2, 0, 0, o.verge);          // boss round the rod where the arm joins
      });
      // pendulum on the rod between the posts
      o.pend = new T.Group(); o.pend.position.set(-160, YT + D, 0); root.add(o.pend);
      P.at(P.cylX(9, 12, mp), 0, 0, 0, o.pend);                                       // boss round the rod, x -166..-154
      o.rod = P.at(P.box(5, 1, 5, mp), 0, 0, 0, o.pend);                              // length set each frame
      o.bob = P.at(P.cylX(16, 10, mp), 0, 0, 0, o.pend);                              // bob x -165..-155
      // stand: base and two posts that hold the rod; the wheel shaft stands on the base
      P.at(P.box(340, 12, 240, c.fixed), -40, -156, 0, root);                        // base x -210..130, y -162..-150
      P.at(P.box(20, 252, 30, c.fixed), -135, -24, 0, root);                         // post x -145..-125, y -150..102; rod ends meet its faces
      P.at(P.box(20, 252, 30, c.fixed), -185, -24, 0, root);                         // post x -195..-175, y -150..102
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0;
      for (var i = 0; i < n; i++) sim.step(H, l);
      o.wheel.rotation.y = sim.th;
      o.verge.rotation.x = sim.ph; o.pend.rotation.x = sim.ph;
      o.rod.scale.y = l - 9; o.rod.position.y = -(l - 9) / 2 - 9;                    // from the boss down to the middle of the bob
      o.bob.position.y = -l;
      var b = sim.beats, per = b.length > 2 ? (b[b.length - 1] - b[0]) / (b.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
    }
  });
})();
