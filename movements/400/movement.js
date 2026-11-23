M507.define({
  number: 400,
  title: "Four-motion feed",
  lede: "This moves the cloth along under a sewing machine needle, one stitch at a time. A small toothed spur rises, pushes forward, drops and slides back. Its path is a box shape, drawn in red as it runs.",
  alt: "A long forked bar lies level above a turning shaft with a cam on it. A second bar sits inside the fork, pivoted at its left end, and sticks out at the right with small teeth on top. A coil spring sits at the left end of the forked bar. Above the teeth is a strip of cloth on a see-through table.",
  parts: [
    { key: "cam", color: "#5E7387", name: "Cam", note: "Turns with the shaft. A raised part of its edge lifts the feed bar. The sloping face on its right side pushes the forked bar forward." },
    { key: "fork", color: "#C8873A", name: "Forked bar", note: "Slides left and right in two guides. The cam pushes it to the right; the spring pushes it back." },
    { key: "feed", color: "#4FA58A", name: "Feed bar", note: "Pivoted inside the fork, so it slides with it and can also tip up. It carries the toothed spur. Watch the red tooth." },
    { key: "spring", color: "#D9B13B", name: "Spring", note: "Squeezed when the forked bar goes forward. It pushes the bar back." },
    { key: "cloth", color: "#E8E2D0", name: "Cloth", note: "Lies on the table. The spur teeth grip it from below while they move forward." }
  ],
  controls: [{ id: "st", label: "Stitch length", value: "long", options: [["long", "Long"], ["short", "Short"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Shaft speed", unit: "rpm" },
  readouts: [{ id: "fed", label: "Cloth fed" }, { id: "st", label: "Stitch length" }],
  views: { "3d": [30, 45, 650], front: [8, 15, 660], top: [0, 760, 60] },
  target: [8, 15, 0],
  how: [
    "Watch the red tooth. It goes up, forward, down and back, then waits. Those are the four motions. The red line shows its box-shaped path.",
    "The shaft turns the cam. First a raised part of the cam's edge lifts the feed bar, so the teeth come up through the table and grip the cloth. Next the sloping face on the cam's side pushes the forked bar forward. The feed bar goes with it and carries the cloth one stitch. Then the raised part passes, and the feed bar drops by its own weight. Last, the spring pushes the forked bar back while the teeth are below the cloth.",
    "A nut on the rod by the spring stops the forked bar on its way back. Try Long, then Short. With Short the bar stops early, the cam meets it later, and each stitch is shorter."
  ],
  note: "This model is rebuilt from Brown's description and drawing. The two guides for the forked bar, the bearings, the base, the table and cloth, the stop nut and all sizes and timings were made up. Brown's drawing shows the cam only from the front, so its exact shape is our guess: a raised part on its edge to lift, and a sloping face on its side to push.",

  // Positions along the shaft (x) and heights (y). The shaft runs along x at y = 0, z = 0. The forked bar's offset xa is 0
  // when it rests against the cam's face; the feed bar pivots at (PX + xa, PY). The shoe under the feed bar is HU below
  // the pivot and starts at SX; R0 the cam's plain radius; the face cam's ring spans radius 16..38.
  K: { PX: -150, PY: 64, HU: 18, SX: 54, R0: 40, LOBE: 16, A0: 2, AR: 16, XF: 90, TIP: [342.5, 15], SHOEW: 4, LUGW: 4, LUGR: 22, YT: 0,
       STOP: { long: 1, short: -8 } },

  /** Smooth step 0..1 over [a, b] degrees, then hold; down again over [c, d]. Cycloid ramps, so the motion starts and stops gently. */
  ramp: function (t, a, b, c, d) {
    function cy(x) { return x - Math.sin(2 * Math.PI * x) / (2 * Math.PI); }
    t = ((t % 360) + 360) % 360;
    if (t <= a || t >= d) return 0;
    if (t < b) return cy((t - a) / (b - a));
    if (t <= c) return 1;
    return 1 - cy((t - c) / (d - c));
  },
  /** Cam edge radius and face height at phase tau (degrees; tau = shaft turn when that part is at the top). */
  lift: function (tau) { return this.K.R0 + this.K.LOBE * this.ramp(tau, 10, 50, 200, 240); },
  face: function (tau) { return this.K.A0 + this.K.AR * this.ramp(tau, 70, 160, 250, 330); },

  /** State for shaft turn t (degrees) and stop setting. H is the highest cam point under the shoe (shoe 2 SHOEW wide),
      xa the forked bar's offset (pressed on the face cam under the lug, or held by the stop nut), beta the feed bar's tilt
      about its pivot (0 when it rests on the fork's cross piece), tip the red tooth's tip. */
  state: function (t, stop) {
    var K = this.K, H = 0, A = 0, b, r, D = Math.PI / 180;
    for (b = -14; b <= 14; b += .25) {
      r = this.lift(t + b);
      if (Math.abs(r * Math.sin(b * D)) <= K.SHOEW) H = Math.max(H, r * Math.cos(b * D));
      if (Math.abs(b) <= Math.asin(K.LUGW / K.LUGR) / D) A = Math.max(A, this.face(t + b));
    }
    var xa = Math.max(A - K.A0, -stop);
    var d = K.SX + xa - (K.PX + xa), k = H - K.PY, R = Math.hypot(d, k);
    var beta = Math.max(0, Math.atan2(k, d) + Math.asin(K.HU / R));
    var c = Math.cos(beta), s = Math.sin(beta), px = K.PX + xa;
    return { H: H, A: A, xa: xa, beta: beta, tip: [px + K.TIP[0] * c - K.TIP[1] * s, K.PY + K.TIP[0] * s + K.TIP[1] * c] };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, self = this;
    var o = this.o = { t: 0, st: null, fed: 0, xa: null, stroke: 0 };
    var mc = c.mat("cam"), mf = c.mat("fork"), mb = c.mat("feed");
    // base x -240..260, y -80..-70, z -50..50
    P.at(P.box(500, 10, 100, c.fixed), 10, -75, 0, scene);
    // shaft x -7..173 (ends at the bearings' outer faces), bearings at x 0 and 166 (x -7..7 and 159..173)
    o.cam = new T.Group(); scene.add(o.cam);
    P.at(P.cylX(6, 180, mc), 83, 0, 0, o.cam);
    [0, 166].forEach(function (x) { var bb = P.bearingBlock({ bore: 6.5, outer: 13, drop: 70, width: 14, material: c.fixed }); bb.rotation.y = Math.PI / 2; P.at(bb, x, 0, 0, scene); });
    // cam body x 50..90: its edge is the lift profile. Built in a frame whose local Z is the shaft (world x).
    var inner = new T.Group(); inner.rotation.y = Math.PI / 2; o.cam.add(inner);
    var pts = [], i;
    for (i = 0; i < 720; i++) { var q = i / 2, r = self.lift(90 - q); pts.push([-r * Math.cos(q * Math.PI / 180), r * Math.sin(q * Math.PI / 180)]); }
    // inner local (x, y, z) -> world (z, y, -x), so this point sits at world (y, z) = r (sin q, cos q). Turned by -t about x it
    // is at angle q + t from the front; the top shows q = 90 - t, so tau = 90 - q = t, as state() expects.
    pts.reverse();
    var body = P.outlinePlate({ points: pts, depth: 40, z0: 50, material: mc });
    inner.add(body);
    // face cam on the body's right face, x 90..90 + face(tau), radius 16..38
    var fc = P.faceCam({ rIn: 16, rOut: 38, n: 720, material: c.mat("cam", "light"), rise: function (a) { return self.face(a * 180 / Math.PI - 90); } });   // local angle a is q = 180 - a, so tau = a - 90
    fc.position.z = K.XF; inner.add(fc);
    P.at(P.cylX(12, 12, mc), 44, 0, 0, o.cam);                               // hub x 38..50
    P.at(P.box(10, 2.5, 1, c.mat("cam", "dark")), 30, 0, 6.5, o.cam);        // stripe on the shaft, z 6..7, x 25..35

    // forked bar: solid end x -216..-180, tines x -180..140 at z 5..11 and -11..-5, y 56..75; foot x -200..-183, y 21..56;
    // cross piece x 92..120, y 46..56 under the feed bar; lug x 92..104, y 22..46, z -4..4 against the face cam
    o.fork = new T.Group(); scene.add(o.fork);
    P.at(P.box(36, 19, 22, mf), -198, 65.5, 0, o.fork);
    [8, -8].forEach(function (z) { P.at(P.box(320, 19, 6, mf), -20, 65.5, z, o.fork); });
    P.at(P.box(17, 35, 22, mf), -191.5, 38.5, 0, o.fork);
    P.at(P.box(28, 10, 22, mf), 106, 51, 0, o.fork);
    P.at(P.box(12, 24, 8, mf), 98, 34, 0, o.fork);
    P.at(P.cylX(3, 93, mf), -136.5, 38, 0, o.fork);                          // rod x -183..-90 from the foot through the bracket
    o.nut = P.at(P.cylX(6, 6, c.mat("fork", "dark")), 0, 38, 0, o.fork);       // stop nut, placed in step()
    P.at(P.cylZ(3, 24, mf), K.PX, K.PY, 0, o.fork);                           // pivot pin z -12..12 through both tines and the feed bar
    // spring from the foot's face (x -183) to the bracket's face (x -140), round the rod
    o.spring = P.spring({ radius: 6, wire: 1.2, turns: 7, length: 43, material: c.mat("spring") });
    P.at(o.spring, -183, 38, 0, scene);
    // bracket x -140..-125, y -70..54, z -10..10, hole for the rod at y 38
    var br = P.guideBlock({ w: 124, h: 15, d: 20, hole: 3.6, hx: 46, material: c.fixed }); br.rotation.z = Math.PI / 2; P.at(br, -132.5, -8, 0, scene);

    // feed bar in its own frame: pivot at the origin, along +x; body y -8..8 (56..72), shoe x 204..222 down to -18,
    // spur teeth on top at x 310..345, sloped end to x 366; z -4..4
    o.feed = new T.Group(); P.at(o.feed, K.PX, K.PY, 0, scene);
    var fp = [[-10, -8], [204, -8], [204, -18], [222, -18], [222, -8], [336, -8], [366, 6], [366, 8], [345, 8]];
    for (i = 3; i >= 0; i--) { var s0 = 310 + i * 7; fp.push([s0 + 7, 8], [s0 + 5.5, 15], [s0 + 3.5, 15], [s0, 8]); }   // four teeth x 310..338, flat tips
    fp.push([-10, 8]);
    P.at(P.outlinePlate({ points: fp, depth: 8, z0: -4, material: mb }), 0, 0, 0, o.feed);
    P.at(P.outlinePlate({ points: [[338, 8], [345, 8], [343.5, 15], [341.5, 15]], depth: 9, z0: -4.5, material: c.mat("feed", "mark") }), 0, 0, 0, o.feed);   // red tooth x 338..345, a little wider than the bar

    // guides for the forked bar at x -110 and -30: frames (x thickness 10) with a window y 55.5..92, z -11.5..11.5, on posts behind
    [-110, -30].forEach(function (x) {
      var g = P.outlinePlate({ points: [[-40, 45], [20, 45], [20, 100], [-40, 100]], holes: [[[-11.5, 55.5], [11.5, 55.5], [11.5, 92], [-11.5, 92]]], depth: 10, z0: -5, material: c.fixed });
      g.rotation.y = -Math.PI / 2; P.at(g, x, 0, 0, scene);                   // local x -> world z
      P.at(P.box(10, 115, 12, c.fixed), x, -12.5, -34, scene);                // post y -70..45, z -40..-28
    });

    // table above the spur: two strips z 5.5..40 and -40..-5.5, x 130..250, top at YT; posts at x 240..250
    var r0 = this.state(0, K.STOP.long);
    K.YT = Math.round(r0.tip[1] + 14.5);                       // the raised teeth reach about 2 into the cloth
    [22.75, -22.75].forEach(function (z) {
      P.at(P.box(120, 4, 34.5, c.fixed), 190, K.YT - 2, z, scene);
      P.at(P.box(10, K.YT - 4 + 70, 10, c.fixed), 245, (K.YT - 4 - 70) / 2, z + (z > 0 ? 12 : -12), scene);   // from the base to the strip's underside
    });
    // cloth on the table, x 130..250, 2.5 thick, with dark stitch marks that move along
    P.at(P.box(120, 2.5, 72, c.mat("cloth")), 190, K.YT + 1.25, 0, scene);
    o.marks = [];
    for (i = 0; i < 5; i++) o.marks.push(P.at(P.box(8, 1, 3, c.mat("cloth", "dark")), 0, K.YT + 3.5, 0, scene));   // y YT+3..YT+4, lifted .5 off the cloth
    // the spur's path, drawn in front of the machine
    o.trail = P.trail({ max: 900, step: .3 }); scene.add(o.trail);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, stop = K.STOP[S.controls.st] === undefined ? K.STOP.long : K.STOP[S.controls.st];
    if (S.controls.st !== o.st) { o.st = S.controls.st; o.trail.clear(); o.xa = null; }
    o.t += S.w * dt * 180 / Math.PI;
    var q = this.state(o.t, stop);
    o.cam.rotation.x = -o.t * Math.PI / 180;
    o.fork.position.x = q.xa;
    o.nut.position.x = -125 + stop + 3;                                        // nut x -125+stop .. -119+stop on the rod
    o.spring.position.x = -183 + q.xa; o.spring.setLength(43 - q.xa);
    o.feed.position.x = K.PX + q.xa; o.feed.rotation.z = q.beta;
    if (o.xa !== null && q.xa > o.xa && q.tip[1] > K.YT) o.fed += q.xa - o.xa;  // the teeth hold the cloth while above the table
    o.xa = q.xa;
    var off = o.fed % 24;
    o.marks.forEach(function (m, i) { m.position.x = 134 + (i * 24 + off) % 112; });
    o.trail.push(q.tip[0], q.tip[1], 42);
    S.set("fed", Math.round(o.fed) + " mm");
    S.set("st", (K.AR + Math.min(0, stop)) + " mm");
  }
});
