(function () {
  // Flat shapes in model units, star-wheel centre at the origin, y up, laid out as in Brown's drawing.
  var NS = 6, RT = 75, RV = 34, AP = [55, -165];   // star points and valleys, pivot of the pallet piece
  function starOutline() { var p = []; for (var i = 0; i < 2 * NS; i++) { var a = (-137.5 + 30 * i) * Math.PI / 180, r = i % 2 ? RV : RT; p.push([r * Math.cos(a), r * Math.sin(a)]); } return p; }
  var ANCHOR = [                                   // the pallet piece, anticlockwise round its outline
    [-62.5, -52.5], [-62.5, -90], [-55, -140], [-40, -200], [5, -230], [60, -230], [105, -200], [155, -140], [195, -85],
    [215, -30], [190, 25], [135, 52.5], [120, 55],                // outer edge of the arm
    [92, 22],                                                   // pallet C, the tip of the hook
    [130, 17.5], [155, 2.5], [167.5, -35], [135, -67.5], [45, -86], [0, -86], [-22, -62],   // inside of the loop
    [-30, -46]];                                                 // pallet B, the flat top on the left
  function area(p) { var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
  if (area(ANCHOR) < 0) ANCHOR.reverse();
  var STAR = starOutline();
  function inside(x, y, p) {
    for (var i = 0, j = p.length - 1, c = false; i < p.length; j = i++)
      if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
    return c;
  }
  function nearestEdge(x, y, p) {                  // distance to the nearest edge and its outward normal (p anticlockwise)
    var best = 1e9, n = null;
    for (var i = 0; i < p.length; i++) {
      var a = p[i], b = p[(i + 1) % p.length], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
      var t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)), qx = a[0] + t * dx - x, qy = a[1] + t * dy - y, d = Math.hypot(qx, qy);
      if (d < best) { best = d; var l = Math.sqrt(L2); n = [dy / l, -dx / l]; }
    }
    return { d: best, n: n };
  }
  function rot(p, a, cx, cy) { var c = Math.cos(a), s = Math.sin(a); return p.map(function (v) { var x = v[0] - cx, y = v[1] - cy; return [cx + c * x - s * y, cy + s * x + c * y]; }); }

  // The pendulum is heavy, so the small kicks from the star hardly change its swing: the pallet piece is moved by the
  // pendulum (an even swing about PC, PA either way), and only the star is pushed about by the contacts.
  var IS = 1, TAU = 1500, CS = 3, G = 2776, H = .0005, PC = 9 * Math.PI / 180, PA = 10 * Math.PI / 180;
  function Sim(len) { this.th = 0; this.w = 0; this.psi = -Math.PI / 2; this.ph = PC - PA; this.t = 0; this.len = len; this.maxd = 0; }
  Sim.prototype.contacts = function () {         // every corner of one part that is inside the other, with depth and normal
    var out = [], S = rot(STAR, this.th, 0, 0), Q = rot(ANCHOR, this.ph, AP[0], AP[1]), i, e;
    for (i = 0; i < S.length; i += 2) if (inside(S[i][0], S[i][1], Q)) { e = nearestEdge(S[i][0], S[i][1], Q); out.push({ p: S[i], d: e.d, n: e.n, star: true }); }
    for (i = 0; i < Q.length; i++) if (Math.hypot(Q[i][0], Q[i][1]) < RT + 1 && inside(Q[i][0], Q[i][1], S)) { e = nearestEdge(Q[i][0], Q[i][1], S); out.push({ p: Q[i], d: e.d, n: e.n, star: false }); }
    return out;
  };
  Sim.prototype.step = function (h) {
    this.psi += Math.sqrt(G / this.len) * h; this.ph = PC + PA * Math.sin(this.psi);
    this.w += (TAU - CS * this.w) / IS * h; this.th += this.w * h; this.t += h;
    for (var it = 0; it < 4; it++) {
      var cs = this.contacts(); if (!cs.length) break;
      for (var k = 0; k < cs.length; k++) {
        var c = cs[k], p = c.p, n = c.n;
        var gt = (c.star ? 1 : -1) * (n[0] * -p[1] + n[1] * p[0]);   // how fast the gap opens as the star turns
        if (Math.abs(gt) < 1e-6) continue;
        this.th += c.d / gt; if (it === 3) this.maxd = Math.max(this.maxd, c.d);
        if (gt * this.w < 0) this.w = 0;                                // no bounce
      }
    }
  };

  M507.define({
    number: 238,
    title: "Pallet escapement",
    lede: "A star-shaped wheel is held by a rocking piece with two catches. Each rock lets the star turn half a point. A pendulum sets the pace, so the wheel moves in steady steps.",
    alt: "A small six-pointed star wheel turns on a pin. Below and to the right hangs a big flat piece shaped like a hook, pivoted on a pin. Its flat top on the left catches one point of the star, and the curled tip of its arm reaches up round the right side of the star to catch another. A pendulum hangs from the pivot.",
    parts: [
      { key: "star", color: "#5E7387", name: "Escape wheel", note: "A star-shaped wheel, called an escape wheel. A weight, not shown, keeps trying to turn it. Watch the red point to follow it round." },
      { key: "anchor", color: "#C8873A", name: "Pallets", note: "Rocks on its pin. Its flat top on the left and the hooked tip of its arm are the two catches, called pallets." },
      { key: "pend", color: "#D9B13B", name: "Pendulum", note: "Fixed to the pallet piece and swings with it. Its length sets how quickly it rocks." }
    ],
    controls: [{ type: "range", id: "len", label: "Pendulum length", min: 100, max: 250, step: 10, value: 180, unit: "",
      presets: [[120, "Short"], [180, "Medium"], [240, "Long"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "star", label: "Star" }],
    views: { "3d": [190, 0, 540], front: [20, -75, 590], side: [600, -75, 20] },
    target: [20, -75, 0],
    how: [
      "The weight tries to turn the star wheel anticlockwise. A point of the star rests on the flat top of the pallet piece and cannot move. The pendulum swings the piece the other way, the flat top drops away, and the star turns.",
      "As the piece rocks, its hooked arm swings in on the far side of the star. A second point runs into the hook and stops. When the pendulum swings back, the hook moves out and the flat top comes back up to catch the next point. Each swing lets the star move on by half a point. Watch closely and you will see the star pushed back a little each time, before it moves on.",
      "The pendulum decides the pace. A long pendulum swings more slowly, so the beats come further apart and the star turns more slowly. Try Short, then Long, and count the beats."
    ],
    note: "This model is rebuilt from Brown's drawing. The pendulum, the pins, the base plate and the weight that drives the star (left out) were made up. The points of the star were made longer and the hook was brought a little closer so that both catches reach the points. In a real clock each push of a point also gives the pendulum a small kick that keeps it going. Here the pendulum is taken to be heavy, so it swings evenly and the kicks are left out.",

    Sim: Sim, star: STAR, anchor: ANCHOR, AP: AP,
    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, K = .6;
      var o = this.o = { sim: new Sim(180) };
      for (var i = 0; i < 12000; i++) o.sim.step(H);                                   // run 6 seconds so it opens in its steady swing
      var root = new T.Group(); root.scale.set(K, K, K); scene.add(root);             // the layout is in the drawing's units, shown at 0.6
      function slab(pts, depth, z0, m) {
        var sh = new T.Shape(); pts.forEach(function (q, i) { if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
        var g = new T.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false }); g.translate(0, 0, z0); return new T.Mesh(g, m);
      }
      // star wheel z 0..14 on a pin from the plate (z -30) ; red point on the first tip
      o.star = new T.Group(); root.add(o.star);
      o.star.add(slab(STAR, 14, 0, c.mat("star")));
      var tip = [[RT * Math.cos(-137.5 * Math.PI / 180), RT * Math.sin(-137.5 * Math.PI / 180)]];
      P.at(P.cylZ(5, 1, c.mat("star", "mark")), tip[0][0] * .8, tip[0][1] * .8, 14.5, o.star);   // dot z 14..15 near the first point, on the face
      P.at(P.cylZ(10, 2, c.mat("star", "dark")), 0, 0, 15, o.star);                  // pin head z 14..16, on the face
      P.at(P.cylZ(6, 30, c.fixed), 0, 0, -15, root);                                // pin z -30..0, plate face to the star's back
      // pallet piece z 0..14, pivots on A; the pendulum rod and bob hang from it
      o.anchor = new T.Group(); o.anchor.position.set(AP[0], AP[1], 0); root.add(o.anchor);
      o.anchor.add(slab(ANCHOR.map(function (q) { return [q[0] - AP[0], q[1] - AP[1]]; }), 14, 0, c.mat("anchor")));
      P.at(P.cylZ(16, 2, c.mat("anchor", "dark")), 0, 0, 15, o.anchor);              // boss ring z 14..16 on the face, as drawn round the pin
      P.at(P.cylZ(9, 3, c.mat("anchor", "light")), 0, 0, 17.5, o.anchor);            // pin end z 16..19
      P.at(P.cylZ(8, 30, c.fixed), AP[0], AP[1], -15, root);                         // pin z -30..0, plate face to the piece's back
      var mp = c.mat("pend");
      o.rod = P.at(P.box(8, 1, 6, mp), 0, 0, -3, o.anchor);                          // rod z -6..0, behind the piece; length set each frame
      o.bob = P.at(P.cylZ(24, 10, mp), 0, 0, -5, o.anchor);                          // bob z -10..0
      P.at(P.box(420, 540, 10, c.fixed), 50, -155, -35, root);                       // plate x -160..260, y -425..115, z -40..-30
      P.at(P.box(460, 12, 120, c.fixed), 50, -431, -10, root);                       // base y -437..-425, z -70..50; plate stands on it
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, l = S.controls.len, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0;
      sim.len = l;
      for (var i = 0; i < n; i++) sim.step(H);
      o.star.rotation.z = sim.th; o.anchor.rotation.z = sim.ph;
      o.rod.scale.y = l - 20; o.rod.position.y = -(l - 20) / 2 - 20;                // rod from the boss (20 below the pin) down to the bob
      o.bob.position.y = -l;
      var T = 2 * Math.PI / Math.sqrt(G / l);                                         // time of one full swing, there and back
      S.set("beat", Math.round(120 / T) + " a min");                                  // two beats to a full swing
      S.set("star", (10 / T).toFixed(1) + " rpm");                                    // a sixth of a turn for each full swing
    }
  });
})();
