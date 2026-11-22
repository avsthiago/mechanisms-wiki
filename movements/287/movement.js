M507.define({
  number: 287,
  title: "Spring governor",
  lede: "Two balls are fixed to the middle of two bowed steel springs that spin with a spindle. As the speed rises, the balls pull the springs further out. The springs get shorter from end to end, so they lift a sleeve that can work the engine's steam valve.",
  alt: "An upright spindle with a collar near the top and a sliding sleeve near the bottom. Two flat springs bow outwards between the collar and the sleeve, like the sides of a barrel. A flattened ball sits on the middle of each spring. A ring in a groove on the sleeve works a lever on a post.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Spindle and top collar", note: "The engine turns the spindle. The top collar is fixed to it and holds the upper ends of the springs." },
    { key: "springs", color: "#D9B13B", name: "Springs", note: "Flat steel strips, bowed outwards. They bend further when the balls pull, and spring back when the pull drops." },
    { key: "balls", color: "#8E7AA8", name: "Balls", note: "Fixed to the middle of each spring. Watch them swing out and up as the speed rises." },
    { key: "sleeve", color: "#C8873A", name: "Sliding sleeve", note: "It slides up and down the spindle and holds the lower ends of the springs. It turns with them." },
    { key: "lever", color: "#4FA58A", name: "Ring and lever", note: "The ring sits in the groove of the sleeve and does not turn. It moves the lever, which would go to the steam valve." }
  ],
  controls: [{ id: "k", label: "Springs", value: "mid", options: [["soft", "Soft"], ["mid", "Medium"], ["stiff", "Stiff"]] }],
  speed: { min: 40, max: 160, value: 100, label: "Engine speed", unit: " rpm" },
  readouts: [{ id: "out", label: "Balls out" }, { id: "lift", label: "Sleeve up" }],
  views: { "3d": [430, 150, 760], front: [-20, 0, 860], side: [860, 0, 0] },
  target: [-20, 0, 0],
  distance: [400, 2400],
  how: [
    "The engine turns the spindle. The springs and balls spin round with it. Spinning things try to fly outwards, so the balls pull the middle of each spring away from the spindle.",
    "A spring cannot get longer. So when its middle bows further out, its two ends must come closer together. The top end is fixed, so the sleeve at the bottom is pulled up. When the engine slows, the springs straighten and push the sleeve back down. The ring and lever pass this up and down movement on to the steam valve.",
    "Move the speed slider up and down and watch the balls and the sleeve. Then try soft springs. They let the balls fly out at a lower speed. Stiff springs hold them in until the engine runs faster."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows two springs, so there are two here. The floor, the bearing, the ring, the lever and its post were made up. Each spring is drawn as half a wave whose length never changes. Its stiffness is worked out as if it only bends, which is close enough for small changes in its bow. The ball and sleeve weights, the spring strengths and the rub that calms the motion were chosen to look right. Stops keep the springs from going straight or bowing too far.",

  // RC: spring ends from the axis; YT: top ends; BO: ball centre outside the spring; D0: natural bow
  K: { RC: 34, YT: 165, BO: 13, D0: 18, KS: 376, m: 1, ms: .5, g: 9810, C: 14, DMIN: 4, DMAX: 78, PX: -175, A: 129, LK: 40, LUGX: -46, NP: 25 },
  len: function (H, d) {
    var n = 64, s = 0, i;
    for (i = 0; i <= n; i++) { var t = i / n, w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2), v = Math.PI * d * Math.cos(Math.PI * t); s += w * Math.sqrt(H * H + v * v); }
    return s / (3 * n);
  },
  // spring end-to-end height for a bow d, by bisection on the fixed length
  Hof: function (d) {
    var lo = 0, hi = this.L, i;
    for (i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (this.len(m, d) > this.L) hi = m; else lo = m; }
    return (lo + hi) / 2;
  },
  H: function (d) { var T = this.tab, f = Math.max(0, Math.min(T.length - 1.001, d * 2)), i = Math.floor(f); return T[i] + (T[i + 1] - T[i]) * (f - i); },
  lever: function (lugY) {   // lever angle that keeps the link to the ring lug at its fixed length, lever end above the lug
    var K = this.K, dx = K.LUGX - K.PX, dy = lugY - this.py, D = Math.sqrt(dx * dx + dy * dy);
    var a = (K.A * K.A - K.LK * K.LK + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, K.A * K.A - a * a)), ux = dx / D, uy = dy / D;
    return Math.atan2(a * uy + hh * ux, a * ux - hh * uy);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, k, s, i;
    this.L = this.len(273.5, 30);                                     // length of each spring: bow 30 over a height of 273.5, as drawn
    this.tab = []; for (i = 0; i <= 170; i++) this.tab.push(this.Hof(i / 2));
    var o = this.o = { a: 0, d: 30, dd: 0, ws: 100 * Math.PI / 30 };
    this.ys0 = K.YT - this.H(30);
    this.py = this.ys0 - 50 + K.LK;                                   // lever pivot: ring centre at rest plus the link
    var md = c.mat("drive"), mv = c.mat("sleeve"), ml = c.mat("lever");
    o.spin = new T.Group(); scene.add(o.spin);
    P.at(P.cylY(7, 396, md), 0, -12, 0, o.spin);                      // spindle y -210..186, foot on the bearing top
    P.at(P.box(2, 40, 4, c.mat("drive", "dark")), 8, 60, 0, o.spin);  // stripe x 7..9
    P.at(P.cylY(41, 15, md), 0, 172.5, 0, o.spin);                    // top collar y 165..180; spring tops meet its underside
    P.at(P.cylY(34, 6, md), 0, 183, 0, o.spin);                       // ring y 180..186
    P.at(P.cylY(14, 8, md), 0, 190, 0, o.spin);                       // neck y 186..194
    var dome = P.at(P.sphere(13, md), 0, 194, 0, o.spin); dome.scale.y = .8;   // dome top y 204.4
    P.at(P.sphere(4, md), 0, 207, 0, o.spin);
    P.at(P.cylY(18, 8, md), 0, -196, 0, o.spin);                      // lower collar y -200..-192
    o.spring = []; o.ball = [];
    for (k = 0; k < 2; k++) {
      var pts = []; for (i = 0; i < K.NP; i++) pts.push([0, -i]);
      var sp = P.flatStrip({ points: pts, thick: 3, width: 14, material: c.mat("springs") }); sp.userData.live = true;
      o.spin.add(sp); o.spring.push(sp);
      var b = new T.Group(); o.spin.add(b); o.ball.push(b);
      var bb = P.sphere(30, c.mat("balls")); bb.scale.y = .62; b.add(bb);
      var band = P.hoop(30.8, 1.4, c.mat("balls", "dark")); band.rotation.x = Math.PI / 2; b.add(band);   // round the widest part, 0.8 proud
    }
    o.sleeve = new T.Group(); o.spin.add(o.sleeve);                    // local y 0 = top face, where the springs end
    P.at(P.cylY(45, 15, mv), 0, -7.5, 0, o.sleeve);                    // collar y -15..0
    P.at(P.cylY(12, 53, mv), 0, -41.5, 0, o.sleeve);                   // tube y -68..-15
    P.at(P.cylY(30, 11, mv), 0, -37.5, 0, o.sleeve);                   // flange y -43..-32
    P.at(P.cylY(30, 11, mv), 0, -62.5, 0, o.sleeve);                   // flange y -68..-57
    o.ring = new T.Group(); scene.add(o.ring);                         // centre 50 under the sleeve top: y -56..-44, 1 clear of both flanges
    o.ring.add(new T.Mesh(new T.LatheGeometry([new T.Vector2(13, -6), new T.Vector2(27, -6), new T.Vector2(27, 6), new T.Vector2(13, 6), new T.Vector2(13, -6)], 40), ml));
    P.at(P.box(24, 10, 8, ml), -38, 0, 0, o.ring);                     // lug x -50..-26
    P.at(P.cylZ(3, 22, ml), K.LUGX, 0, 0, o.ring);                     // lug pin z -11..11
    o.lev = new T.Group(); o.lev.position.set(K.PX, this.py, 0); scene.add(o.lev);
    P.at(P.box(K.A + 12, 9, 8, ml), K.A / 2, 0, 0, o.lev);           // lever z -4..4
    P.at(P.cylZ(3, 22, ml), K.A, 0, 0, o.lev);                        // end pin z -11..11
    P.at(P.cylZ(5, 11, ml), 0, 0, .5, o.lev);                         // pivot pin z -5..6, ends on the post face
    o.lk = P.rod(2.5, ml); scene.add(o.lk);
    P.at(P.box(270, 10, 120, c.fixed), -75, -235, 0, scene);           // floor x -210..60, y -240..-230, z -60..60
    P.at(P.box(40, 20, 40, c.fixed), 0, -220, 0, scene);               // bearing y -230..-210, on the floor
    var pTop = this.py + 15;
    P.at(P.box(24, pTop + 230, 35, c.fixed), K.PX, (pTop - 230) / 2, -22.5, scene);   // post y -230..pivot+15, z -40..-5
    this.place();
  },

  place: function () {
    var o = this.o, K = this.K, d = o.d, H = this.H(d), ys = K.YT - H, k, s, i;
    o.spin.rotation.y = o.a;
    for (k = 0; k < 2; k++) {
      s = k ? 1 : -1;
      var pts = [];
      for (i = 0; i < K.NP; i++) { var t = i / (K.NP - 1); pts.push([s * (K.RC + d * Math.sin(Math.PI * t)), K.YT - H * t]); }
      o.spring[k].setPoints(pts);
      o.ball[k].position.set(s * (K.RC + d + K.BO), K.YT - H / 2, 0);
    }
    o.sleeve.position.y = ys;
    var yr = ys - 50;
    o.ring.position.y = yr;
    var phi = this.lever(yr);
    o.lev.rotation.z = phi;
    o.lk.span(K.PX + K.A * Math.cos(phi), this.py + K.A * Math.sin(phi), 8, K.LUGX, yr, 8);
    return ys;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, n = 10, j, self = this, ks = K.KS * ({ soft: .6, mid: 1, stiff: 1.6 }[S.controls.k] || 1);
    function Hp(d) { return (self.H(d + .25) - self.H(d - .25)) / .5; }
    function M(d) { var h = Hp(d); return 2 * K.m * (1 + h * h / 4) + K.ms * h * h; }
    if (S.playing && dt > 0) {
      var h = dt / n;
      o.ws += (S.w - o.ws) * Math.min(1, dt * 4);
      for (j = 0; j < n; j++) {
        var d = o.d, Md = M(d), dM = (M(d + .25) - M(d - .25)) / .5;
        var Q = 2 * K.m * o.ws * o.ws * (K.RC + d + K.BO) + (K.m + K.ms) * K.g * Hp(d) - 2 * ks * (d - K.D0);
        o.dd += ((Q - .5 * dM * o.dd * o.dd) / Md - K.C * o.dd) * h;
        o.d += o.dd * h;
        if (o.d < K.DMIN) { o.d = K.DMIN; if (o.dd < 0) o.dd = 0; }
        if (o.d > K.DMAX) { o.d = K.DMAX; if (o.dd > 0) o.dd = 0; }
      }
      o.a += o.ws * dt;
    }
    var ys = this.place();
    S.set("out", Math.round(K.RC + o.d + K.BO) + " mm");
    S.set("lift", Math.round(ys - this.ys0) + " mm");
  }
});
