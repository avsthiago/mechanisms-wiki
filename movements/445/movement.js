/* Nos. 445 and 446 are two moments of one machine, so both pages build the whole of it from the shared function below.
   No. 446's file loads this one and calls window.M507Column with its own wording, views and opening moment. */
(function () {
  // 1 model unit stands for 1 cm, so g is 981 units/s². Section cut on z = 0, the front half taken away.
  var G = 981, YO = 39, GAP = 88, LCH = 300, ACH = 1800, AT = 2880, AO = 380, K = .0023, AL = 3.5e-4, BE = .2, PC = 112, DT = 1 / 600;
  var HEAD = { low: 113, medium: 123, high: 133 };
  // One time step: channel speed w, water level yu in the upper tube, cone height c on the plate.
  function sim(s, h) {
    var thr = Math.max(0, Math.min(1, (GAP - s.c) / 15)), qf = AO * Math.sqrt(2 * G * Math.max(0, s.yu - YO)), q = qf * thr;
    s.w += (G * (s.yh - s.yu) / LCH - K * s.w * Math.abs(s.w)) * h;               // the long channel speeds up or slows down
    s.yu += (ACH * s.w - q) / AT * h; s.q = q; s.thr = thr;
    if (s.brk) { s.c -= 6 * s.c * h; if (s.c < 5) s.brk = 0; }                     // the cone gives way and washes off the plate
    else {
      s.c += (AL * qf * (.2 + 1.6 * s.c / GAP) - BE * s.c) * h;                     // the falling water piles up on the plate, slowly at first, faster once a cone has formed
      if (s.c >= GAP) { s.c = GAP; if (!s.blk) { s.blk = 1; s.tb = s.t; s.per = s.t - s.t0; s.t0 = s.t; } }
    }
    if (s.blk && s.yu - YO > PC) { s.blk = 0; s.brk = 1; }                         // the column above is heavy enough to burst it
    s.t += h;
  }

  // Outline (r, y) of the falling water, the cone and the sheet off the rim, for P.halfSection. Returns the outline and its widest radius.
  function shape(s) {
    var on = s.q > 1 && !s.blk, v0 = Math.sqrt(2 * G * Math.max(1, s.yu - YO)), rj0 = on ? 10.6 * Math.sqrt(Math.max(.05, s.thr)) : 0;
    var yc = -49 + s.c, cn = Math.max(1, s.c), f = Math.min(1, s.c / GAP), wb = on ? (1 - f) * (1 - f) * s.thr : 0, hb = 1 + 34 * wb, ys = YO, top, ya = [], k, y, r;
    function jet(y) { return y >= YO ? rj0 : rj0 * Math.sqrt(v0 / Math.sqrt(v0 * v0 + 2 * G * (YO - y))); }          // the stream narrows as it speeds up
    var rt = Math.max(jet(yc), .6, 10.6 * f * f * f * f);                          // cone tip: as wide as the stream landing on it, filling the hole when it gets there
    if (s.blk) ys = YO + Math.min(1, (s.t - s.tb) / .15) * Math.max(0, s.yu - 10 - YO);   // plugged: the cone runs on up inside the column in the small tube
    top = s.blk ? Math.max(ys, YO + .5) : rj0 > .5 ? 43 : yc;
    function R(y) {
      if (s.blk && y > YO) return 10.6 - 7.6 * Math.pow((y - YO) / (top - YO), .6);
      var cone = y <= yc ? rt + (29.5 - rt) * Math.pow((yc - y) / cn, 2.2) : 0, j = on && y >= yc ? jet(y) : 0;   // tall and narrow, flaring only at the foot
      var bell = on && y < hb - 49 ? jet(y) + (31 - jet(y)) * Math.pow(Math.sin(Math.PI / 2 * (hb - 49 - y) / hb), .6) : 0;   // with little or no cone the stream spreads out like an umbrella over the plate
      return Math.max(cone, j, bell, .6);
    }
    for (k = 0; k <= 40; k++) ya.push(top - (top + 47.5) * k / 40);
    if (yc < top && yc > -47.5) ya.push(yc);
    ya.sort(function (a, b) { return b - a; });
    var p = [[0, -48.5], [0, top]];
    ya.forEach(function (y) { p.push([R(y), y]); });
    // the sheet off the rim: thick and thrown outwards while the stream falls, thin and straight while the cone holds
    var th = s.blk ? .8 : Math.max(.8, Math.min(4, s.q / 40000)), u = s.blk ? 3 : (8 + 32 * wb) * Math.min(1, s.q / 150000), tf = Math.sqrt(2 * 74 / G);
    p.push([31.5, -48.5]);
    for (k = 0; k <= 8; k++) { r = tf * k / 8; p.push([30.5 + th + u * r, -50 - G * r * r / 2]); }
    for (k = 8; k >= 1; k--) { r = tf * k / 8; p.push([30.5 + u * r, -50 - G * r * r / 2]); }
    p.push([29.6, -51.5], [28.6, -49.6], [28.6, -48.5]);
    return { p: p, max: 30.5 + th + u * tf, u: u };
  }

  // The sheet off the rim can spread wider than the tube is deep (z -30..30): squeeze whatever lies beyond the plate's rim water (|z| 28.6)
  // into |z| 28.6..29.5, leaving the stream, the cone and the water round the rim as they are.
  function squeeze(g, max) {
    if (max <= 29.5) return;
    var geo = g.children[0].geometry, a = geo.attributes.position.array, k = .9 / (max - 28.6), i, z;
    for (i = 2; i < a.length; i += 3) { z = Math.abs(a[i]); if (z > 28.6) a[i] = (a[i] < 0 ? -1 : 1) * (28.6 + (z - 28.6) * k); }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
  }

  function parts(plateNote) {
    return [
      { key: "upper", color: "#5E7387", name: "Channel and upper tube", note: "Brings water from the reservoir. The small tube at its end has a round hole in its floor." },
      { key: "lower", color: "#4FA58A", name: "Lower tube", note: "A wider tube with a hole in its top, under the hole above. Water leaves it at the bottom on the right." },
      { key: "plate", color: "#C8873A", name: "Round plate", note: plateNote }
    ];
  }

  window.M507Column = function (page) {
    return {
      number: page.number, title: page.title, lede: page.lede, alt: page.alt, how: page.how, note: page.note, parts: page.parts,
      controls: [{ id: "sup", label: "Water supply", value: "medium", options: [["low", "Small"], ["medium", "Medium"], ["high", "Big"]] }],
      speed: { min: 10, max: 100, value: page.speed || 60, label: "Time speed", unit: " %" },
      closed: { label: "Tubes" },
      readouts: [{ id: "col", label: "Column" }, { id: "cone", label: "Cone" }, { id: "cyc", label: "Beats" }],
      views: { "3d": [100, 65, 660], front: [5, 7, 580], side: [580, 20, -80] },
      target: [5, 12, -15], distance: [250, 1600],

      build: function (c) {
        var T = c.THREE, P = c.P, scene = c.scene, i;
        var s = { w: 0, yu: 123, yh: 123, c: 0, blk: 0, brk: 0, t: 0, t0: 0, tb: 0, per: 3.3, q: 0, thr: 1 };
        for (i = 0; i < 30 / DT; i++) sim(s, DT);                                  // settle into the beat
        for (i = 0; i < 20 / DT && !page.start(s); i++) sim(s, DT);                // then on to this page's moment
        var o = this.o = { s: s, acc: 0, sacc: 0 };
        var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .45, depthWrite: false, side: T.DoubleSide });
        var mu = c.mat("upper"), ml = c.mat("lower");
        function wall(pts, m) { c.shell(P.at(P.prism(pts, 0, 30, m), 0, 0, 0, scene), "closed"); return P.at(P.prism(pts, -30, 0, m), 0, 0, 0, scene); }       // cut walls, z -30..0; no back plates, so the inside stays open as in the drawing. Closed view adds the front half, z 0..30
        // channel floor y 89..93; upper tube inner x -24..24, floor y 39..43 with a hole x -11..11, right wall up to y 165
        wall([[-216, 89], [-28, 89], [-28, 93], [-216, 93]], mu);
        wall([[-28, 39], [-24, 39], [-24, 93], [-28, 93]], mu); wall([[24, 39], [28, 39], [28, 165], [24, 165]], mu);
        wall([[-24, 39], [-11, 39], [-11, 43], [-24, 43]], mu); wall([[11, 39], [24, 39], [24, 43], [11, 43]], mu);
        // lower tube inner x -60..60, top y -19..-15 with a hole x -27..27, floor top y -147; outlet to the right under a roof at y -112..-108
        wall([[-64, -147], [-60, -147], [-60, -15], [-64, -15]], ml); wall([[60, -108], [64, -108], [64, -15], [60, -15]], ml);
        wall([[-60, -19], [-27, -19], [-27, -15], [-60, -15]], ml); wall([[27, -19], [60, -19], [60, -15], [27, -15]], ml);
        wall([[-64, -151], [150, -151], [150, -147], [-64, -147]], ml); wall([[60, -112], [150, -112], [150, -108], [60, -108]], ml);
        // closed view: back and front plates, z -32..-30 and 30..32, round the upper tube and channel (walls up to y 165) and round the lower tube
        var pu = [[-216, 89], [-28, 89], [-28, 39], [28, 39], [28, 165], [-216, 165]], pl = [[-64, -151], [150, -151], [150, -108], [64, -108], [64, -15], [-64, -15]];
        [pu, pl].forEach(function (q, k) { [-32, 30].forEach(function (z) { c.shell(P.at(P.prism(q, z, z + 2, k ? ml : mu), 0, 0, 0, scene), "closed"); }); });
        // round plate on a stem standing on the floor (y -147); plate top y -49, radius 28
        var plp = [[0, -146], [10, -146], [10, -145], [5, -138], [5, -62], [9, -56], [9, -54], [28, -54], [28, -49], [0, -49]];
        c.shell(P.at(P.halfSection({ poly: plp, material: c.mat("plate") }), 0, 0, 0, scene), "open");
        c.shell(P.at(P.wholeSection({ poly: plp, material: c.mat("plate") }), 0, 0, 0, scene), "closed");   // closed view: the whole plate, seen through the hole in the top
        P.at(P.halfSection({ poly: [[28, -53.5], [28.8, -53.5], [28.8, -49.5], [28, -49.5]], material: c.mat("plate", "mark"), steps: 4 }), 0, 0, 0, scene).rotation.y = -.15;   // red patch on the rim, 0.8 proud
        // water
        o.chan = P.ribbon({ material: wat, depth: 29 }); o.chan.position.z = -15; scene.add(o.chan);
        o.tube = P.ribbon({ material: wat, depth: 29 }); o.tube.position.z = -15; scene.add(o.tube);
        o.chan2 = c.shell(P.ribbon({ material: wat, depth: 29 }), "closed"); o.chan2.position.z = 15; scene.add(o.chan2);   // closed view: front halves of the water, z 0.5..29.5
        o.tube2 = c.shell(P.ribbon({ material: wat, depth: 29 }), "closed"); o.tube2.position.z = 15; scene.add(o.tube2);
        o.jet = P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1], [0, 1]], material: wat, steps: 24 }), 0, 0, 0, scene);
        o.jet.children.forEach(function (m) { m.userData.live = true; });
        o.jet2 = c.shell(P.at(P.halfSection({ poly: [[0, 0], [1, 0], [1, 1], [0, 1]], material: wat, steps: 24 }), 0, 0, 0, scene), "closed");   // closed view: front half of the stream
        o.jet2.rotation.y = Math.PI; o.jet2.children.forEach(function (m) { m.userData.live = true; });
        o.jet2.children[1].material = o.jet2.children[2].material = new T.MeshBasicMaterial({ visible: false });   // its cut faces would double the first half's
        o.pool = P.at(P.prism([[-60, -146.5], [150, -146.5], [150, -126], [-60, -126]], -29.5, -.5, wat), 0, 0, 0, scene);
        o.pool2 = c.shell(P.at(P.prism([[-60, -146.5], [150, -146.5], [150, -126], [-60, -126]], .5, 29.5, wat), 0, 0, 0, scene), "closed");
        o.fIn = P.steamFlow({ color: c.spot, count: 30, z0: -26, z1: -4 }); scene.add(o.fIn);
        o.fIn.pipe({ points: [[-216, 108], [-60, 108], [-14, 80], [0, 46]], width: 24, n: 30, speed: 1 / 270 });
        o.fOut = P.steamFlow({ color: c.spot, count: 16, z0: -26, z1: -4 }); scene.add(o.fOut);
        o.fOut.pipe({ points: [[62, -136], [162, -136]], width: 16, n: 18, speed: 1 / 100 });   // runs a little way out of the open end (x 150)
        o.drops = P.dropPool({ count: 60, radius: 2, color: c.spot, opacity: .85, parent: scene });
        o.spl = P.dropPool({ count: 100, radius: 2, color: c.spot, opacity: .85, parent: scene });   // splash thrown up from the top of the column while the hole is plugged
        [o.chan, o.tube, o.chan2, o.tube2, o.jet, o.jet2, o.pool, o.pool2].forEach(c.fluid); o.drops.drops.concat(o.spl.drops).forEach(function (d) { c.fluid(d.m); });   // water shows faintly through the closed tubes
      },

      step: function (c, dt, S) {
        var o = this.o, s = o.s, h = S.playing ? dt * S.rpm / 100 : 0, n = Math.round(h / DT), i, R = Math.random;
        s.yh = HEAD[S.controls.sup] || 123;
        for (i = 0; i < n; i++) sim(s, DT);
        o.chan.set(function (x) { var u = Math.max(0, Math.min(1, (x + 90) / 65)); u = u * u * (3 - 2 * u); return [x, 93.5, x, Math.max(96, s.yh + (s.yu - s.yh) * u)]; }, -216, -24.6, 40);
        o.tube.set(function (x) { return [x, 43.5, x, s.yu]; }, -23.5, 23.5, 2);
        if (o.chan2.visible) { o.chan2.set(function (x) { var u = Math.max(0, Math.min(1, (x + 90) / 65)); u = u * u * (3 - 2 * u); return [x, 93.5, x, Math.max(96, s.yh + (s.yu - s.yh) * u)]; }, -216, -24.6, 40); o.tube2.set(function (x) { return [x, 43.5, x, s.yu]; }, -23.5, 23.5, 2); }
        // stream from the hole onto the cone on the plate, and the sheet pouring over the rim
        var sh = shape(s), sz = Math.min(1, 29.5 / sh.max), cl = S.controls["case"] === "closed" && !S.iso;
        o.jet.set(sh.p); squeeze(o.jet, sh.max); if (o.jet2.visible) { o.jet2.set(sh.p); squeeze(o.jet2, sh.max); }
        o.fIn.update(Math.abs(s.w) * h); o.fOut.update(s.q / 1800 * h);
        o.acc += s.q / 4000 * h;
        while (o.acc >= 1) { o.acc--; var a = Math.PI * R(), ca = Math.cos(a), sa = Math.sin(a); o.drops.emit(31 * ca, -50, -31 * sa * sz, (sh.u + 15) * ca, 0, -(sh.u + 15) * sa * sz, G); }
        o.sacc += s.blk && s.yu - s.yh > 4 ? 120 * h : 0;
        while (o.sacc >= 1) { o.sacc--; o.spl.emit((R() * 2 - 1) * 15, s.yu, cl ? (R() * 2 - 1) * 24 : -2 - 24 * R(), (R() * 2 - 1) * 12, 200 + 100 * R(), 0, G); }
        o.spl.step(h, G, function (q, d) { return d.vy < 0 && q.y < s.yu; });
        var col = Math.round(s.yu - s.yh);
        S.set("col", (col > 0 ? "+" : col < 0 ? "−" : "") + Math.abs(col) + " cm");
        S.set("cone", Math.round(s.c) + " cm");
        S.set("cyc", Math.round(60 / Math.max(.5, s.per)) + " a min");
      }
    };
  };
  window.M507Column.parts = parts;

  M507.define(window.M507Column({
    number: 445,
    title: "Oscillating water column",
    lede: "Water falls from a small tube onto a round plate inside a wider tube. Nothing in it moves, yet the water beats by itself. Each beat pushes the water in the small tube up above the reservoir it came from.",
    alt: "Cut-away drawing. A channel from the left ends in a small upright tube with a round hole in its floor. A stream falls from the hole into a wider tube below. It spreads out over a round plate on a stem and pours off its edge all round, into a pool that runs out to the right.",
    parts: parts("Sits under the falling stream. Water piles up on it into a cone, until the cone reaches the hole above. The red patch marks its rim."),
    how: [
      "Water runs along the channel and falls through the hole in the small tube. It lands on the round plate and spreads out like an umbrella. It pours off the edge all round into the pool below.",
      "The falling water slowly piles up on the plate in a cone. The cone grows tall and narrow until it reaches up into the hole and plugs it. The water in the long channel is still moving, so it heaps up in the small tube, higher than the reservoir. Then its weight bursts the cone, the stream falls again and a new beat starts.",
      "Watch the Column reading go above zero each time the hole is plugged. Try a small supply, then a big one, and compare the beats. Choose Closed to see the tubes as they look from outside."
    ],
    note: "This model is rebuilt from Brown's drawings and description. The tubes are drawn square and cut down the middle, and the stem under the plate is made up. How fast the cone grows, and how much it can hold back before it bursts, are chosen so the beat works; Brown gives no figures. The rise and fall of the water in the channel are worked out from its weight and speed. The shape of the cone and the splash at the top of the small tube are drawn to look like Brown's figures.",
    start: function (s) { return !s.blk && !s.brk && s.c > 8 && s.c < 14; }   // stream falling freely and spreading, the cone hardly begun, as drawn
  }));
})();
