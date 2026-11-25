M507.define({
  number: 459,
  title: "Wind-driven well lift",
  lede: "A wind wheel turns a screw that hangs between two toothed wheels. The screw drives one wheel at a time, so one bucket is wound up while the other goes down. Each bucket that reaches the top knocks a lever, which swings the screw over to the other wheel and sends the buckets back the other way.",
  alt: "A flat wind wheel on top of an upright shaft. Lower down the shaft carries a screw that hangs between two wheels with pegs round them. A rope runs over a pulley behind each wheel and holds a bucket at each end, one near the top beside a trough and one down in a well. Below the screw a three-armed lever is pivoted under a small sliding block that holds the bottom end of the screw.",
  parts: [
    { key: "wind", color: "#5E7387", name: "Wind wheel and screw", note: "The wind turns the flat wheel at the top, always the same way. Its shaft carries a screw, also called a worm. A loose joint above the screw lets its bottom end swing a little to the left or right." },
    { key: "wheel", color: "#C8873A", name: "Worm wheels", note: "Two wheels with pegs, one each side of the screw. The screw pushes the pegs of whichever wheel it leans against. A pulley is fixed behind each wheel. Watch the red marks." },
    { key: "bucket", color: "#4FA58A", name: "Buckets and rope", note: "One rope runs over both pulleys with a bucket on each end. When one bucket goes up the other must go down." },
    { key: "tappet", color: "#D9B13B", name: "Tappet", note: "A lever with three arms. A rising bucket lifts one of the side arms. The heavy upper arm then tips over to the other side and pushes the step across. Watch its red pin." },
    { key: "step", color: "#8E7AA8", name: "Sliding step", note: "A small block that holds the bottom end of the screw. It slides left or right, and takes the screw from one wheel to the other." }
  ],
  speed: { min: 30, max: 150, value: 90, label: "Wind wheel", unit: "rpm" },
  readouts: [{ id: "rpm", label: "Wind wheel" }, { id: "drive", label: "Screw drives" }, { id: "h", label: "Left bucket" }],
  views: { "3d": [407, 150, 872], front: [0, -85, 980], side: [980, -85, -5] },
  target: [0, -72, 0],
  how: [
    "Look at the screw between the two orange wheels. It leans towards one of them, and its thread pushes that wheel's pegs down. The wheel turns its pulley and winds the rope. One bucket comes up full and the other goes down empty.",
    "Near the top the bucket catches on a hook, tips over and pours into the trough. It also lifts one arm of the yellow lever, called the tappet. When the tappet's heavy upper arm passes upright it falls over to the other side. Its red pin pushes the purple step across, and the screw swings over to the other wheel.",
    "The wind wheel never changes direction. But the screw now pushes the other wheel's pegs down, on the opposite side of the rope, so the rope runs back the other way. Watch the tappet each time a bucket arrives. Then make the wind stronger with the speed slider and see the buckets change over sooner."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show the well, how the bucket tips, or how the tappet finishes its swing once the screw has let go. Here a hook on each trough tips the bucket, the upper arm of the tappet is heavy and falls over by its own weight, and its pin has some free play in the step. The screw also nudges a wheel a little as it slides in between two pegs. The well, the troughs, the back board, the number of pegs and all the sizes were made up.",

  /* Numbers used by build, step and the test. Worm wheels at (+-D, 0); the screw hangs from the joint at (0, yc) and its
     bottom end sits in the step at height ys, so a step shift xs moves the screw by xs * yc / (yc - ys) at wheel height.
     Rope: centre line radius rp on each pulley; a bucket's rope end (the bar across its handle) is 6 above its rim and
     the rim is 15 in radius. The hook stops the outer edge of the rim at height yh; from there the bucket turns about it. */
  _K: { D: 49.77, rw: 35, N: 12, rp: 14, yc: 52, ys: -72, ds: 9, half: 2.2, La: 40, Px: 0, Py: -144, yh: -139.3, rim: 15, up: 6, T: 175, low: -300, zr: -22, ywc: -20 },
  /* Bucket on the left rope when its rope end would hang at height yB. Returns [Ex, Ey, tilt, Bx, By, wrap]: the outer
     rim point, the tilt about it, the rope end and the angle at which the rope leaves the pulley. The free rope length
     (quarter wrap + straight part) is kept exactly. */
  _pose: function (yB, out) {
    var K = this._K, xr = -(K.D + K.rp), Ex = xr - K.rim, L = Math.PI / 2 * K.rp - yB, lo = 0, hi = 1.15, i, t = 0, self = this;
    function len(tau, o) {
      var Bx = Ex + K.rim * Math.cos(tau) - K.up * Math.sin(tau), By = K.yh + K.rim * Math.sin(tau) + K.up * Math.cos(tau);
      var d = Math.hypot(Bx + K.D, By), g = Math.atan2(By, Bx + K.D); if (g < 0) g += 2 * Math.PI;
      var th = g - Math.acos(K.rp / d);
      if (o) { o[3] = Bx; o[4] = By; o[5] = th; }
      return K.rp * (th - Math.PI / 2) + Math.sqrt(d * d - K.rp * K.rp);
    }
    if (yB - K.up <= K.yh) { out[0] = Ex; out[1] = yB - K.up; out[2] = 0; out[3] = xr; out[4] = yB; out[5] = Math.PI; return out; }
    for (i = 0; i < 40; i++) { t = (lo + hi) / 2; if (len(t) > L) lo = t; else hi = t; }
    out[0] = Ex; out[1] = K.yh; out[2] = t; len(t, out); return out;
  },
  _psiM: Math.asin(.28),                                    // the tappet swings this far each side of upright: 40 * sin = 11.2 = the step's travel (9) + the pin's free play each side (2.2)
  /* One step of the whole machine, without any drawing. st = {tw (screw angle), pu (pulley angle, clockwise), s (rope
     travel), psi, om (tappet angle and speed), xs (step), wl, wr (water in the buckets)}. dth is how far the screw
     turned, dtl the time for the tappet to fall in. */
  _advance: function (st, dth, dtl) {
    var K = this._K, pm = this._psiM, pitch = 2 * Math.PI / K.N, p = K.rw * pitch, i;
    st.tw += dth;
    var xw = st.xs * K.yc / (K.yc - K.ys), eng = xw < -.27 ? -1 : xw > .27 ? 1 : 0;
    if (eng) {
      // pegs of the driven wheel sit midway between two turns of the thread; while the screw is only part way in they may be off by a shrinking amount
      var g = Math.min(1, (Math.abs(xw) - .27) / 3.5), want = eng < 0 ? (K.ywc + p / 2) / K.rw - st.tw / K.N : Math.PI - K.ywc / K.rw + st.tw / K.N;
      var err = -st.pu - want; err -= pitch * Math.round(err / pitch);
      var band = (1 - g) * pitch / 2;
      if (Math.abs(err) > band) { var corr = err - (err > 0 ? band : -band); st.pu += corr; st.s += K.rp * corr; }
    }
    st.eng = eng;
    var L = this._pose(K.low + st.s, st.L), R = this._pose(K.low + K.T - st.s, st.R);
    // tappet: each side arm rests on the bar of its bucket; the upper arm is heavy and falls away from upright
    var cl = Math.atan2(L[4] + 4 - K.Py, K.Px - L[3]), cr = Math.atan2(R[4] + 4 - K.Py, K.Px - R[3]);
    var p0 = st.psi;
    for (i = 0; i < 4 && dtl > 0; i++) {
      st.om += (70 * Math.sin(st.psi - pm) - 5 * st.om) * dtl / 4; st.psi += st.om * dtl / 4;
      if (st.psi < 0) { st.psi = 0; st.om = 0; } if (st.psi > 2 * pm) { st.psi = 2 * pm; st.om = 0; }
    }
    if (st.psi < cl) { st.om = Math.max(st.om, dtl > 0 ? Math.min(3, (Math.min(cl, 2 * pm) - p0) / dtl) : 0); st.psi = Math.min(cl, 2 * pm); }   // pushed up by the left bucket, and keeps that speed
    if (st.psi > 2 * pm - cr) { st.om = Math.min(st.om, dtl > 0 ? Math.max(-3, (Math.max(2 * pm - cr, 0) - p0) / dtl) : 0); st.psi = Math.max(2 * pm - cr, 0); }
    var pin = K.La * Math.sin(st.psi - pm);                 // the pin has 2.2 of free play each side between the prongs of the step
    st.xs = Math.max(-K.ds, Math.min(K.ds, Math.max(pin - K.half, Math.min(pin + K.half, st.xs))));
    return st;
  },
  _start: function () {
    var K = this._K, p = K.rw * 2 * Math.PI / K.N;
    return { tw: 0, pu: -(K.ywc + p / 2) / K.rw, s: 146, psi: 0, om: 0, xs: -K.ds, wl: 1, wr: 0, eng: -1, L: [0, 0, 0, 0, 0, 0], R: [0, 0, 0, 0, 0, 0] };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this._K, fx = c.fixed, D = Math.PI / 180, pm = this._psiM, i, zr = K.zr;
    var o = this.o = { st: this._start() };
    // wind wheel, shaft and coupling sleeve: turn about the upright axis
    var mw = c.mat("wind"), md = c.mat("wind", "dark");
    o.spin = new T.Group(); scene.add(o.spin);
    P.at(P.cylY(12, 28, mw), 0, 126, 0, o.spin);                                        // hub y 112..140
    for (i = 0; i < 12; i++) {
      var vg = new T.Group(); vg.rotation.y = i * 30 * D; o.spin.add(vg);
      var v = P.at(P.box(64, 26, 2, i ? mw : c.mat("wind", "mark")), 60, 126, 0, vg); v.rotation.x = 35 * D;   // slanted vane, r 28..92
    }
    [113, 139].forEach(function (y) { [30, 91].forEach(function (r) { var h = P.at(P.hoop(r, 2, md), 0, y, 0, o.spin); h.rotation.x = Math.PI / 2; }); });
    P.at(P.cylY(5, 28, md), 0, 98, 0, o.spin);                                          // shaft y 84..112, down to the top of the bearing
    P.at(P.cylY(5, 12, md), 0, 62, 0, o.spin);                                          // shaft y 56..68, from the underside of the bearing
    P.at(P.cylY(9, 26, mw), 0, 43, 0, o.spin);                                          // coupling sleeve y 30..56; the screw hangs from a joint inside it at y 52
    // screw: hangs from the joint, leans with the step, turns with the shaft
    o.lean = new T.Group(); o.lean.position.y = K.yc; scene.add(o.lean);
    o.screw = new T.Group(); o.lean.add(o.screw);
    P.at(P.cylY(4.5, 124, md), 0, -62, 0, o.screw);                                     // shaft from the joint down to the step
    var worm = P.worm({ radius: 11, pitch: K.rw * 2 * Math.PI / K.N, length: 84, addendum: 2.5, dedendum: 2.5, material: mw, coreMaterial: md });
    worm.rotation.z = -Math.PI / 2; P.at(worm, 0, K.ywc - K.yc, 0, o.screw);            // thread y 22..-62, core 8.5, tips 13.5
    P.at(P.sphere(5, md), 0, -124, 0, o.screw);                                         // ball end, half sunk in the step
    // worm wheels with their pulleys
    o.wheels = [-1, 1].map(function (s) {
      var g = new T.Group(), m = c.mat("wheel"); g.position.x = s * K.D; scene.add(g);
      P.at(P.cylZ(20, 10, m), 0, 0, 0, g);                                              // hub z -5..5
      for (var k = 0; k < K.N; k++) {
        var a = new T.Group(); a.rotation.z = k * 2 * Math.PI / K.N; g.add(a);
        P.at(P.cylX(4.5, 13.5, m), 24.75, 0, 0, a);                                     // peg r 18..31.5 with a round end reaching 36
        P.at(P.sphere(4.5, m), 31.5, 0, 0, a);
      }
      P.at(P.box(12, 3, 1, c.mat("wheel", "mark")), 10, 0, 6, g);                       // stripe z 5.5..6.5, lifted off the hub face (z 5)
      P.at(P.cylZ(K.rp - 1.2, 8, m), 0, 0, zr, g);                                      // pulley drum z -26..-18; rope centre line at radius 14
      P.at(P.cylZ(17, 1.5, m), 0, 0, zr - 4.75, g); P.at(P.cylZ(17, 1.5, m), 0, 0, zr + 4.75, g);   // flanges
      P.at(P.cylZ(4, 47, c.mat("wheel", "dark")), 0, 0, -16.5, g);                      // axle z -40..7, from the face of the back board
      return g;
    });
    // rope and buckets
    var mb = c.mat("bucket"), mbd = c.mat("bucket", "dark");
    o.rope = P.ropePath({ tube: 1.2, material: mbd }); scene.add(o.rope);
    o.wm = new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .8, depthWrite: false });
    o.bk = [-1, 1].map(function (s) {
      var g = new T.Group(); scene.add(g);                                              // origin on the outer edge of the rim; the bucket is built to its inner side
      var cup = new T.Mesh(new T.CylinderGeometry(K.rim, 11, 32, 28, 1, true), mb); cup.position.set(-s * K.rim, -16, 0); g.add(cup);
      P.at(P.cylY(11, 2, mb), -s * K.rim, -31, 0, g);                                   // bottom y -32..-30
      var rimh = P.at(P.hoop(K.rim, 1, mbd), -s * K.rim, 0, 0, g); rimh.rotation.x = Math.PI / 2;
      P.at(P.cylZ(1.5, 20, mbd), -s * K.rim, K.up, 0, g);                               // bar across the handle, z -10..10 about the rope; it strikes the tappet
      [-1, 1].forEach(function (e) { var r = P.rod(1, mbd); r.span(-s * K.rim, 0, e * K.rim, -s * K.rim, K.up, e * 9); g.add(r); });
      g.water = P.at(P.cylY(12.5, 2, o.wm), -s * K.rim, -5, 0, g);
      return g;
    });
    // tappet: hub on a pivot, two forked side arms either side of the rope, a heavy upper arm with a pin
    var mt = c.mat("tappet");
    o.tap = new T.Group(); o.tap.position.set(K.Px, K.Py, 0); scene.add(o.tap);
    P.at(P.cylZ(7, 37, mt), 0, 0, -13.5, o.tap);                                        // hub z -32..5
    P.at(P.cylZ(3, 8, c.mat("tappet", "dark")), 0, 0, -36, o.tap);                      // pivot z -40..-32, from the back board
    [[Math.PI, 0], [2 * pm, 0]].forEach(function (q) {
      var a = new T.Group(); a.rotation.z = q[0]; o.tap.add(a);
      [-7, 7].forEach(function (e) { P.at(P.box(82, 5, 3, mt), 41, 0, zr + e, a); });   // two bars z -30.5..-27.5 and -16.5..-13.5, the rope runs between them
    });
    var ua = new T.Group(); ua.rotation.z = Math.PI / 2 + pm; o.tap.add(ua);
    P.at(P.box(K.La, 5, 5, mt), K.La / 2, 0, 0, ua);                                    // upper arm, z -2.5..2.5
    P.at(P.sphere(5, mt), 16, 0, 0, ua);                                                // its weight
    P.at(P.cylZ(2, 10, c.mat("tappet", "mark")), K.La, 0, 0, ua);                       // pin z -5..5, between the prongs of the step
    // step: block y -92..-72 on the shelf, with two prongs hanging in front of the shelf
    var ms = c.mat("step");
    o.step = new T.Group(); scene.add(o.step);
    P.at(P.box(30, 20, 29, ms), 0, -82, -5.5, o.step);                                  // z -20..9; its back part rests on the shelf (top y -92)
    [-1, 1].forEach(function (s) { P.at(P.box(3, 26, 8, ms), s * (K.half + 3.5), -105, 0, o.step); });   // prongs x 4.2..7.2 (pin radius 2 + play 2.2), y -118..-92, z -4..4
    // supports and scenery
    P.at(P.box(140, 348, 4, fx), 0, -90, -42, scene);                                   // back board x -70..70, y -264..84, z -44..-40, standing on the well's back wall
    P.at(P.box(72, 16, 52, fx), 0, 76, -14, scene);                                     // top bearing x -36..36, y 68..84, z -40..12
    P.at(P.box(60, 6, 31, fx), 0, -95, -24.5, scene);                                   // shelf x -30..30, y -98..-92, z -40..-9
    P.at(P.box(161, 86, 4, fx), 0, -307, -42, scene);                                   // well back wall x -80.5..80.5, y -350..-264
    P.at(P.box(161, 6, 78, fx), 0, -353, -5, scene);                                    // well floor y -356..-350, z -44..34
    [-1, 1].forEach(function (s) {
      P.at(P.box(69.5, 180, 78, fx), s * 115.25, -266, -5, scene);                      // side of the well and bank x 80.5..150, y -356..-176, z -44..34
      P.at(P.box(4, 26, 78, fx), s * 148, -163, -5, scene);                             // trough walls y -176..-150 on the bank: outer x 146..150
      P.at(P.box(4, 26, 78, fx), s * 82.5, -163, -5, scene);                            // inner x 80.5..84.5
      P.at(P.box(61.5, 26, 4, fx), s * 115.25, -163, -42, scene);                       // back z -44..-40, between them
      P.at(P.box(61.5, 26, 4, fx), s * 115.25, -163, 32, scene);                        // front z 30..34
      P.at(P.box(4, 14.7, 8, fx), s * 82.5, -142.65, zr, scene);                        // hook post x 80.5..84.5, y -150..-135.3, on the inner wall
      P.at(P.box(2.1, 4, 8, fx), s * 79.45, K.yh + 2, zr, scene);                       // hook lip x 78.4..80.5, y -139.3..-135.3; the rim (x 78.77) stops under it
      P.at(P.box(60.5, 17.5, 69, o.tw = o.tw || new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .2, depthWrite: false })), s * 115.25, -166.75, -5, scene);   // trough water y -175.5..-158
    });
    P.at(P.box(160, 59.5, 73, o.tw), 0, -319.75, -3, scene);                            // well water y -349.5..-290, 0.5 clear of the walls
    o.pool = P.dropPool({ count: 90, radius: 2.4, color: c.spot, opacity: .85, parent: scene });
    o.acc = 0;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this._K, st = o.st, pm = this._psiM, zr = K.zr, i;
    var tl = S.playing ? Math.min(dt, .04) : 0;
    this._advance(st, S.w * dt, tl);
    o.spin.rotation.y = st.tw; o.screw.rotation.y = st.tw;
    o.lean.rotation.z = Math.asin(st.xs / (K.yc - K.ys));
    o.wheels[0].rotation.z = o.wheels[1].rotation.z = -st.pu;
    o.tap.rotation.z = -st.psi; o.step.position.x = st.xs;
    var L = st.L, R = st.R;
    o.bk[0].position.set(L[0], L[1], zr); o.bk[0].rotation.z = L[2];
    o.bk[1].position.set(-R[0], R[1], zr); o.bk[1].rotation.z = -R[2];
    o.rope.set([[L[3], L[4], zr], { c: [-K.D, 0, zr], r: K.rp, a0: L[5], a1: Math.PI / 2 }, { c: [K.D, 0, zr], r: K.rp, a0: Math.PI / 2, a1: Math.PI - R[5] }, [-R[3], R[4], zr]]);
    // water: a bucket fills when its rim is under the well water, and pours once it has tipped far enough
    o.acc += tl;
    var drop = o.acc > .03; if (drop) o.acc = 0;
    for (i = 0; i < 2; i++) {
      var q = i ? R : L, key = i ? "wr" : "wl", sg = i ? 1 : -1;
      if (q[1] < -293) st[key] = 1;
      if (q[2] > .3 && st[key] > 0 && tl > 0) {
        st[key] = Math.max(0, st[key] - tl / .5);
        if (drop) o.pool.emit(sg * 80, K.yh - 3, zr + 16 * (Math.random() - .5), sg * (22 + 14 * Math.random()), 0, 0);
      }
      o.bk[i].water.visible = st[key] > .02; o.bk[i].water.scale.set(.6 + .4 * st[key], 1, .6 + .4 * st[key]); o.bk[i].water.position.y = -5 - 18 * (1 - st[key]);
    }
    o.pool.step(tl, 300, function (p) { return p.y < -158; });
    S.set("rpm", (S.playing ? S.rpm : 0) + " rpm");
    S.set("drive", st.eng < 0 ? "left" : st.eng > 0 ? "right" : "none");
    S.set("h", ((L[4] - K.low) / 100).toFixed(1) + " m");
  }
});
