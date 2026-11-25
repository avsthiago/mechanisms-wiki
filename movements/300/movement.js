(function () {
  // Sizes (model units). The two escape wheels share one arbor along Z at (0, YC), one wheel at z = -G and one at z = +G.
  // They turn clockwise seen from the front, so their lowest teeth run towards -x. The teeth of one wheel sit half way
  // between the teeth of the other. The balance staff lies along X through the origin, under the wheels.
  // The pallet is a half disc fixed square on the staff between the wheels: a slab from x = -TH/2 to TH/2, round below
  // and cut straight across the top. The cut is sloped: on the side the teeth come from it is low, on the far side high.
  var N = 12, R = 100, RR = 70, G = 20, TH = 14, SL = .4, LOCK = 1.5, FOOT = 9, RD = 27, NS = 7;
  var H0 = -SL * TH / 2 - LOCK, YC = R + H0, P2 = 2 * Math.PI / N, QS = Math.sqrt(1 + SL * SL);
  var IW = .06, TAU = 28, CW = .3, KS = 40, CB = .3, H = .0005;

  // A tooth ends in a foot: a short arc of the tip circle from its toe (in front) back to its heel. foot() gives
  // point i of NS along the foot of tooth k on wheel w (0 at z = -G, 1 at z = +G), as [x, y, angle past the lowest point].
  function foot(w, k, i, th) {
    var a = th + k * P2 + (w ? P2 / 2 : 0); a -= 2 * Math.PI * Math.round(a / (2 * Math.PI));
    var b = a - FOOT / R * i / (NS - 1);
    return [-R * Math.sin(b), YC - R * Math.cos(b), a];
  }
  // gap(): how far the foot of that tooth is from the pallet (negative when it is inside); null when nowhere near.
  // Inside the slab, a point is pushed out through the sloped top, or, for the toe, back out of the face it came in by,
  // whichever is nearer.
  function gap(w, k, th, ph) {
    var best = null, zs = w ? G : -G, cp = Math.cos(ph), sp = Math.sin(ph);
    for (var i = 0; i < NS; i++) {
      var p = foot(w, k, i, th); if (Math.abs(p[2]) > .5) return null;
      var x = p[0]; if (Math.abs(x) >= TH / 2) continue;
      var v = -zs * sp + p[1] * cp;                                  // height of the point above the pallet's middle line, in the pallet's own frame
      var c = (v + SL * x) / QS;                                     // distance above the sloped top
      if (i === 0) c = Math.max(c, x - TH / 2);                      // the toe may instead be just inside the face
      if (best === null || c < best) best = c;
    }
    return best;
  }
  function Sim() { this.th = -.2; this.w = 0; this.ph = -.5; this.W = 0; this.beats = []; this.t = 0; this.amp = 0; this.maxd = 0; }
  Sim.prototype.step = function (h, Ib) {
    var a0 = this.ph, w0 = this.W;
    this.w += (TAU - CW * this.w) / IW * h; this.W += (-KS * this.ph - CB * this.W) / Ib * h;   // the weight turns the wheels; the balance spring pulls the balance back
    this.th += this.w * h; this.ph += this.W * h; this.t += h;
    for (var it = 0; it < 3; it++) for (var w = 0; w < 2; w++) for (var k = 0; k < N; k++) {
      var C = gap(w, k, this.th, this.ph); if (C === null || C >= 0) continue;
      var e = 1e-6, Ct = gap(w, k, this.th + e, this.ph), Cp = gap(w, k, this.th, this.ph + e);
      if (Ct === null || Cp === null) continue;
      if (it === 2 && -C > this.maxd) this.maxd = -C;
      var gt = (Ct - C) / e, gp = (Cp - C) / e, den = gt * gt / IW + gp * gp / Ib; if (den <= 0) continue;
      var lam = -C / den; this.th += lam * gt / IW; this.ph += lam * gp / Ib;
      var vn = gt * this.w + gp * this.W; if (vn < 0) { var mu = -vn / den; this.w += mu * gt / IW; this.W += mu * gp / Ib; }
    }
    if (w0 * this.W < 0 && Math.abs(this.ph) > .2) this.amp = Math.abs(this.ph);             // the far end of a swing
    if (a0 * this.ph < 0) { this.beats.push(this.t); if (this.beats.length > 6) this.beats.shift(); }   // passing the middle: one beat
  };

  // Outline of one tooth as [radius, angle behind the toe]: the foot along the tip circle, then a stem up to the rim.
  var TOOTH = [[R, 0], [R, FOOT / R], [RR, .16], [RR, .03], [R - 4, (FOOT - 5) / R], [R - 4, .005]];
  function outline(step) {                         // the same outline as closely spaced points, for checking
    var out = [];
    TOOTH.forEach(function (a, i) {
      var b = TOOTH[(i + 1) % TOOTH.length], n = Math.ceil(Math.hypot(b[0] - a[0], (b[1] - a[1]) * R) / step);
      for (var j = 0; j < n; j++) out.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]);
    });
    return out;
  }

  var PARTS = [
    { key: "front", color: "#5E7387", name: "Front wheel", note: "One of the two escape wheels. A weight, not shown, keeps trying to turn both. Each tooth ends in a small foot. Watch the red tooth." },
    { key: "back", color: "#C8873A", name: "Back wheel", note: "The second escape wheel, fixed on the same shaft. Its teeth sit half way between the teeth of the front wheel." },
    { key: "pallet", color: "#C2503F", name: "Half disc", note: "A half disc fixed on the balance shaft, between the two wheels. Its flat sides stop the teeth. Its straight top edge is cut on a slope, and the teeth slide over it. It is called the pallet." },
    { key: "balance", color: "#D9B13B", name: "Balance wheel", note: "A ring with weights on a long shaft. It swings to and fro and rocks the half disc with it." },
    { key: "spring", color: "#4FA58A", name: "Balance spring", note: "A fine coiled spring. It always pulls the balance wheel back towards the middle, so the wheel keeps swinging." }
  ];

  // The whole machine. No. 301 is the side elevation of the same thing: its file loads this one and calls
  // window.M507TwoWheel with its own wording and views. page.partText (optional) gives other names and notes by part key.
  window.M507TwoWheel = function (page) {
    return {
    number: page.number, title: page.title, lede: page.lede, alt: page.alt, how: page.how, note: page.note,
    parts: PARTS.map(function (q) { var t = (page.partText || {})[q.key] || {}; return { key: q.key, color: q.color, name: t.name || q.name, note: t.note || q.note }; }),
    controls: [{ type: "range", id: "ib", label: "Weights on the balance wheel", min: .5, max: 2, step: .1, value: 1, unit: "",
      presets: [[.5, "Light"], [1, "Medium"], [2, "Heavy"]] }],
    speed: false,
    readouts: [{ id: "beat", label: "Beats" }, { id: "swing", label: "Swing" }],
    views: page.views, target: page.target, distance: page.distance, opacity: page.opacity,

    Sim: Sim, gap: gap, foot: foot, outline: outline(1),
    K: { N: N, R: R, RR: RR, G: G, TH: TH, SL: SL, RD: RD, YC: YC, P2: P2, H: H, FOOT: FOOT },
    build: function (c) {
      var T = c.THREE, P = c.P, mp = c.mat("pallet"), mb = c.mat("balance"), i, w;
      var o = this.o = { sim: new Sim(), wheels: [] };
      for (i = 0; i < 12000; i++) o.sim.step(H, 1);                                  // run 6 seconds so it opens in its steady swing
      // the two escape wheels, each 4 thick: the back one from z = -G - 2 to -G + 2, the front one from G - 2 to G + 2
      for (w = 0; w < 2; w++) {
        var mw = c.mat(w ? "front" : "back"), g = new T.Group(); g.position.set(0, YC, w ? G : -G); c.scene.add(g); o.wheels.push(g);
        for (i = 0; i < N; i++) {
          var sh = new T.Shape(), base = -Math.PI / 2 - i * P2 - (w ? P2 / 2 : 0);
          TOOTH.forEach(function (q, j) { var a = base + q[1], x = q[0] * Math.cos(a), y = q[0] * Math.sin(a); if (j) sh.lineTo(x, y); else sh.moveTo(x, y); });
          var tg = new T.ExtrudeGeometry(sh, { depth: 4, bevelEnabled: false }); tg.translate(0, 0, -2);
          g.add(new T.Mesh(tg, w && !i ? c.mat("front", "mark") : mw));
        }
        var rs = new T.Shape(), rh = new T.Path(); rs.absarc(0, 0, RR + 2, 0, 2 * Math.PI, false); rh.absarc(0, 0, RR - 8, 0, 2 * Math.PI, true); rs.holes.push(rh);
        var rg = new T.ExtrudeGeometry(rs, { depth: 3.6, bevelEnabled: false, curveSegments: 48 }); rg.translate(0, 0, -1.8); g.add(new T.Mesh(rg, mw));   // rim, a little thinner than the teeth
        for (i = 0; i < 4; i++) { var sp = P.at(P.box(54, 7, 3.2, mw), 0, 0, 0, g); sp.rotation.z = i * Math.PI / 2 + .6; sp.translateX(36); }                // spokes from 9 to 63
        P.at(P.cylZ(11, 8, mw), 0, 0, 0, g);                                         // hub, 4 each side of the wheel's middle
      }
      o.arbor = P.at(P.cylZ(4, 70, c.mat("front")), 0, YC, -5, c.scene);             // shaft z -40..30, from the face of the post through both wheels
      P.at(P.cylZ(7, 1, c.mat("front", "dark")), 0, 0, 4.5, o.wheels[1]);            // dot on the front hub, z 4..5 from the wheel's middle
      // balance shaft along X with the half disc, the balance wheel and the spring collar; it all turns about X
      o.staff = new T.Group(); c.scene.add(o.staff);
      P.at(P.cylX(3.5, 280, mb), 0, 0, 0, o.staff);                                  // shaft x -140..140, ends at the faces of its posts
      var pos = [], M = 28, ring = [-1, 1].map(function (e) {
        var x = e * TH / 2, vt = -SL * x, be = Math.asin(vt / RD), pts = [];
        for (var j = 0; j <= M; j++) { var a = Math.PI - be + (Math.PI + 2 * be) * j / M; pts.push([x, RD * Math.sin(a), RD * Math.cos(a)]); }   // x, height, sideways
        return pts;
      });
      function tri(a, b, d) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], d[0], d[1], d[2]); }   // one winding is enough, the material draws both sides
      for (i = 0; i < M; i++) {
        tri(ring[0][i], ring[0][i + 1], ring[1][i + 1]); tri(ring[0][i], ring[1][i + 1], ring[1][i]);       // the round edge
        tri([-TH / 2, -RD / 2, 0], ring[0][i], ring[0][i + 1]); tri([TH / 2, -RD / 2, 0], ring[1][i], ring[1][i + 1]);   // the two flat sides
      }
      tri([-TH / 2, -RD / 2, 0], ring[0][M], ring[0][0]); tri([TH / 2, -RD / 2, 0], ring[1][M], ring[1][0]);
      tri(ring[0][0], ring[0][M], ring[1][M]); tri(ring[0][0], ring[1][M], ring[1][0]);                     // the sloped top
      var dg = new T.BufferGeometry(); dg.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); dg.computeVertexNormals();
      o.staff.add(new T.Mesh(dg, mp));                                               // half disc x -7..7, radius RD about the shaft
      P.at(P.cylX(5, 6, mb), 107, 0, 0, o.staff);                                    // spring collar x 104..110
      var hoop = P.hoop(52, 3.5, mb); hoop.rotation.y = Math.PI / 2; P.at(hoop, 122, 0, 0, o.staff);   // balance rim x 118.5..125.5
      P.at(P.box(4, 100, 5, mb), 122, 0, 0, o.staff); P.at(P.box(4, 5, 100, mb), 122, 0, 0, o.staff);   // two cross spokes, 50 each way, x 120..124
      P.at(P.cylX(8, 9, mb), 122, 0, 0, o.staff);                                    // hub x 117.5..126.5
      o.wts = [0, 1, 2, 3].map(function (k) { var a = k * Math.PI / 2 + Math.PI / 4; return P.at(P.sphere(7, mb), 122, 52 * Math.cos(a), 52 * Math.sin(a), o.staff); });
      P.at(P.sphere(3, c.mat("balance", "mark")), 126.5, 52, 0, o.staff);            // red dot on the rim, to follow the swing
      // balance spring x 105..109: inner end on the collar, outer end on a post straight below
      o.sp = new T.Group(); o.sp.position.set(107, 0, 0); c.scene.add(o.sp);
      o.spring = P.spiralSpring({ rIn: 5.5, rOut: 30, width: 4, thick: 1, material: c.mat("spring") }); o.spring.rotation.y = Math.PI / 2; o.sp.add(o.spring);
      // stand
      var fx = c.fixed; if (page.standOpacity) { fx = c.fixed.clone(); fx.opacity = page.standOpacity; fx.depthWrite = false; }   // a page may draw the stand fainter
      P.at(P.box(320, 10, 120, fx), 0, -75, 0, c.scene);                       // base x -160..160, y -80..-70, z -60..60
      P.at(P.box(10, 80, 14, fx), -145, -30, 0, c.scene);                      // post x -150..-140, y -70..10; the balance shaft ends at its face
      P.at(P.box(10, 80, 14, fx), 145, -30, 0, c.scene);                       // post x 140..150, y -70..10
      P.at(P.box(6, 39.5, 6, fx), 107, -50.25, 0, c.scene);                    // spring post y -70..-30.5, its top meets the outer end of the spring
      P.at(P.box(24, YC + 84, 10, fx), 0, (YC + 14 - 70) / 2, -45, c.scene);   // post z -50..-40, y -70..YC + 14; the wheels' shaft ends at its face
    },

    step: function (c, dt, S) {
      var o = this.o, sim = o.sim, Ib = S.controls.ib, n = S.playing ? Math.round(Math.min(dt, .05) / H) : 0;
      for (var i = 0; i < n; i++) sim.step(H, Ib);
      o.wheels[0].rotation.z = -sim.th; o.wheels[1].rotation.z = -sim.th; o.arbor.rotation.y = -sim.th;
      o.staff.rotation.x = -sim.ph; o.sp.rotation.x = -sim.ph;
      o.spring.set(7.5 * Math.PI + sim.ph);                                          // the outer end stays on its post
      var k = Math.sqrt(Ib); o.wts.forEach(function (m) { m.scale.set(k, k, k); });
      var b = sim.beats, per = b.length > 2 ? (b[b.length - 1] - b[0]) / (b.length - 1) : 0;
      S.set("beat", per > 0 ? Math.round(60 / per) + " a min" : "–");
      S.set("swing", "±" + Math.round(sim.amp * 180 / Math.PI) + "°");
    }
  };
  };

  M507.define(window.M507TwoWheel({
    number: 300,
    title: "Two-wheel escapement",
    lede: "Two toothed wheels sit side by side on one shaft, and a weight tries to turn them. A half disc on the rocking shaft of a balance wheel stands in their way. It lets one tooth past at a time, first from one wheel and then from the other.",
    alt: "A big wheel seen face on, with long hooked teeth all round it and a second wheel just like it close behind, its teeth showing in the gaps. Below the wheels a thin shaft runs from left to right. In the middle of the shaft, under the lowest teeth, is a small upright slab, which is a half disc seen edge on. A ring-shaped balance wheel with a coiled spring sits on the right end of the shaft.",
    how: [
      "The lowest teeth of both wheels run from right to left, just above the balance shaft. The half disc stands across their path. When the balance is turned one way, the front corner of the half disc is up and the back corner is down. A tooth of the front wheel runs into the flat side of the disc and stops. It presses along the shaft, so it cannot turn the balance.",
      "The balance swings back and the front corner dips. When the top edge drops below the tooth, the tooth moves on over it. The edge is sloped, so the tooth pushes it further down as it slides across. That push keeps the balance swinging. Once the tooth is clear, both wheels jump on until a tooth of the back wheel hits the flat side, where the back corner is now up. On the next swing the same thing happens on the back wheel.",
      "The balance wheel and its spring set the pace. Heavy weights make the balance slow to turn, so the beats come further apart. Try Light, then Heavy, and count the beats."
    ],
    note: "This model is rebuilt from Brown's two drawings and his description. Brown shows the wheels, the shaft and the half disc. The balance wheel, the balance spring and its post, the posts, the base, the slope on the half disc and all the sizes were made up. The weight that turns the wheels is left out. Rubbing between a resting tooth and the disc is left out, and the rubbing that keeps the swing steady is a simple guess.",
    views: { "3d": [268, 196, 574], front: [0, 50, 660], side: [660, 50, 0] },
    target: [0, 50, 0]
  }));
})();
