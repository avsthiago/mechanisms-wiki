M507.define({
  number: 359,
  title: "Pump drill",
  lede: "A heavy disc spins on a stick, and the stick carries a drill. Press a bar down and the cords unwind, which spins the stick. The disc keeps spinning and winds the cords back up the other way, lifting the bar.",
  alt: "An upright spindle with a drill bit at its lower end and a heavy round disc near the bottom. A crossbar slides on the spindle. Two cords run from the ends of the bar up to the top of the spindle and wind round it.",
  parts: [
    { key: "bar", color: "#5E7387", name: "Crossbar", note: "A bar with a hole, loose on the spindle. You press it down by hand. The cords are tied to its two ends." },
    { key: "cords", color: "#D9B13B", name: "Cords", note: "Two cords from the ends of the bar to the top of the spindle. They wind round the spindle, one way and then the other." },
    { key: "spindle", color: "#4FA58A", name: "Spindle and drill", note: "The stick that spins. The drill bit is fixed to its lower end." },
    { key: "disc", color: "#C8873A", name: "Heavy disc", note: "Fixed to the spindle. Once it is spinning it is hard to stop, so it keeps the spindle turning. Watch the red stripe on it." }
  ],
  controls: [{ id: "m", label: "Disc weight", value: "400", options: [["150", "Light"], ["400", "Medium"], ["900", "Heavy"]] }],
  speed: { min: 1, max: 10, value: 5, label: "Push on the bar", unit: "" },
  readouts: [{ id: "w", label: "Spindle" }, { id: "y", label: "Bar" }, { id: "t", label: "Cord wound" }],
  views: { "3d": [110, 30, 480], front: [0, -22, 720], side: [720, -22, 0] },
  target: [0, -22, 0],
  how: [
    "Look at the cords. They are wound round the top of the spindle and tied to the ends of the bar. When the bar goes down, the cords pull out and unwind. Pulling a cord off makes the spindle spin.",
    "The bar reaches the bottom, but the heavy disc is still spinning. It winds the cords on again, this time the other way round. That lifts the bar back up. Then you press down again, and the spindle turns one way, then the other, without stopping.",
    "Try the light disc, then the heavy one. A heavy disc keeps going longer and gives a steadier spin. Turn the push up or down and watch how fast the spindle goes."
  ],
  note: "This model is rebuilt from Brown's drawing. The hand is not drawn: the model presses the bar down for you while it is moving down. The lengths, the weight of the disc and the amount of rubbing are made up. A stop lets the bar rise only so far.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { r: 7, b: 80, Hc: 50, dBot: 105, Htop: 90, pitch: 22, rc: 8.2, th: 0, w: 0, hand: false, s: 1, bits: [] };
    o.K = o.b * o.b - o.r * o.r; o.L = Math.sqrt(o.dBot * o.dBot + o.K);
    o.th = (o.L - Math.sqrt(o.Hc * o.Hc + o.K)) / o.r;                         // starts with the bar high and the cords wound on
    o.thMax = (o.L - Math.sqrt(40 * 40 + o.K)) / o.r;                          // the bar cannot rise above 10 mm over its start
    o.psi = Math.acos(o.r / o.b);
    var sp = o.sp = new T.Group(); c.scene.add(sp);
    P.at(P.cylY(7, 205, c.mat("spindle")), 0, 2.5, 0, sp);                     // y -100 .. 105
    P.at(P.cylY(11, 20, c.mat("spindle", "dark")), 0, -110, 0, sp);            // chuck, y -120 .. -100
    var bit = new T.Mesh(new T.CylinderGeometry(5, .4, 28, 16), c.mat("spindle")); P.at(bit, 0, -134, 0, sp);   // drill bit, y -148 .. -120
    P.at(P.box(1, 56, 3, c.mat("spindle", "mark")), 7.9, -40, 0, sp);          // stripe down the spindle, outside it by 0.4
    // heavy disc with rounded rim: y -98 .. -72
    var R = 52, pts = [new T.Vector2(0, -13)], k;
    for (k = -6; k <= 6; k++) { var a = k * Math.PI / 12; pts.push(new T.Vector2(R - 13 + 13 * Math.cos(a), 13 * Math.sin(a))); }
    pts.push(new T.Vector2(0, 13));
    var disc = new T.Mesh(new T.LatheGeometry(pts, 64), c.mat("disc")); disc.material = disc.material; P.at(disc, 0, -85, 0, sp);
    P.at(P.box(1, 8, 6, c.mat("disc", "mark")), R + .75, -85, 0, sp);          // stripe on the rim, outside it by 0.25
    P.at(P.box(R - 14, 1, 6, c.mat("disc", "mark")), (R - 14) / 2 + 8, -71, 0, sp);   // stripe on top, 0.5 above the face (y -72)
    // crossbar with a hole for the spindle: y -3 .. 3 at rest
    o.bar = P.at(P.guideBlock({ w: 172, h: 6, d: 10, hole: 8.6, material: c.mat("bar") }), 0, 0, 0, c.scene);
    o.nuts = [-1, 1].map(function (sd) { return P.at(P.cylY(3, 6, c.mat("bar", "dark")), sd * 80, -6, 0, o.bar); });   // bolts under the bar ends, y -9 .. -3
    o.cord = [0, 1].map(function () { return P.at(P.rod(1.4, c.mat("cords")), 0, 0, 0, c.scene); });
    o.helix = [0, 1].map(function () { var m = new T.Mesh(new T.BufferGeometry(), c.mat("cords")); m.userData.live = true; m.frustumCulled = false; sp.add(m); return m; });
  },

  geo: function (th) {
    var o = this.o, W = o.r * Math.abs(th), f = o.L - W, d = Math.max(30, Math.sqrt(Math.max(0, f * f - o.K)));
    return { W: W, f: f, d: d, yb: o.Hc - d, a: (th < 0 ? -1 : 1) * o.r * f / d, ap: o.r * o.r * o.K / (d * d * d) };
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, I = +S.controls.m, Fh = 40 * S.rpm, i, g, h = 0.002;
    if (S.playing && dt > 0) {
      var n = Math.min(40, Math.ceil(dt / h)), hh = dt / n;
      for (i = 0; i < n; i++) {
        g = this.geo(o.th);
        o.hand = g.yb > -30 && g.a * o.w <= 0.5;                                // the hand presses while the bar is above the bottom and not rising
        var Q = (-15 - (o.hand ? Fh : 0)) * g.a, M = I + g.a * g.a;
        var acc = (Q - 40 * o.w - g.a * g.ap * o.w * o.w) / M;
        o.w += acc * hh; o.th += o.w * hh;
        if (Math.abs(o.th) > o.thMax) { o.th = o.thMax * (o.th < 0 ? -1 : 1); o.w *= -.4; }
        if (o.th * (o.th - o.w * hh) < 0) o.s = o.th < 0 ? -1 : 1;
      }
    }
    g = this.geo(o.th);
    var s = o.th < 0 ? -1 : 1, r = o.r, rc = o.rc, W = g.W, yb = g.yb;
    o.bar.position.y = yb;
    o.sp.rotation.y = -o.th;
    var turns = W / (2 * Math.PI * r), hL = o.Htop - o.pitch * turns;
    for (i = 0; i < 2; i++) {
      var lam = i * Math.PI + s * o.psi, lx = rc * Math.cos(lam), lz = rc * Math.sin(lam), side = i ? -1 : 1;
      o.cord[i].span(side * 80, yb + 3, 0, lx, hL, lz);
      var m = o.helix[i], pts = [], N = Math.max(2, Math.ceil(turns * 20)), j;
      m.visible = W > 1.5;
      if (m.visible) {
        for (j = 0; j <= N; j++) { var u = W * j / N, al = i * Math.PI + s * o.psi - s * u / r; pts.push(new T.Vector3(rc * Math.cos(al), o.Htop - o.pitch * u / (2 * Math.PI * r), rc * Math.sin(al))); }
        var geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), N * 3, 1.4, 6, false);
        m.geometry.dispose(); m.geometry = geo;
      }
    }
    S.set("w", Math.round(o.w * 60 / (2 * Math.PI)) + " rpm");
    S.set("y", Math.round(yb + 55) + " mm");
    S.set("t", turns.toFixed(1) + " turns");
  }
});
