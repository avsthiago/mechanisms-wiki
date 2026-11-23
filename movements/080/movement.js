M507.define({
  number: 80,
  title: "Hooked pawls moving a rack",
  lede: "A lever rocks to and fro, and a toothed bar climbs upward in small steps. Two hooks hang from the lever and take turns to lift the bar. Rocking is turned into a straight, one-way push.",
  alt: "An upright bar with saw teeth on both edges and a long slot down its middle. Behind it a level lever with a ball on each end rocks on a pin that passes through the slot. Two hooked bars hang from the lever and cross in front of the bar, each hooking into the teeth on the far edge.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Rocking lever", note: "Rocks on a fixed pin. The heavy balls on its ends keep it swinging evenly." },
    { key: "bar", color: "#C8873A", name: "Rack", note: "A bar with gear teeth along it, called a rack. It has teeth on both edges and a slot in the middle. The lever's pin passes through the slot, so the bar can slide up past it." },
    { key: "pawl", color: "#D9B13B", name: "Hooked pawls", note: "Each hook, called a pawl, hangs from one end of the lever and reaches across to the teeth on the far edge. It turns red while it lifts the bar." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing of the lever", min: 2, max: 20, step: 1, value: 12, unit: "°",
    presets: [[4, "Tiny"], [9, "Small"], [16, "Wide"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Rocking speed", unit: " a min" },
  readouts: [{ id: "in", label: "Lever" }, { id: "out", label: "Rack" }],
  views: { "3d": [460, 0, 860], front: [0, -70, 1080], side: [1060, -70, 0] },
  target: [0, -70, 0],
  how: [
    "Each tooth on the bar has a flat underside and a sloping top. A hook hangs from each end of the lever. The two hooks cross over and grip the teeth on the far edge of the bar.",
    "When the right end of the lever rises, its hook lifts the bar by the tooth it holds. At the same time the left end goes down. Its hook slides down the sloping teeth and drops in under a lower one. Then the lever rocks back, and the hooks swap jobs. So the bar rises on every swing and never slips back.",
    "Watch which hook turns red. When the teeth run out, the hooks are lifted off and the bar drops back to start again. Try Tiny. The hooks cannot reach the next tooth, so the bar stops. Then try Wide and compare."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate, the pin's mounting, the guides at the foot of the bar, the sizes and the number of teeth were made up. The guides hold the bar lightly, so it stays put between lifts. Lifting the hooks and dropping the bar back at the end was added so the model can run without stopping.",

  init: function (o) {
    var K = o.K = { A: 56, W: 28, D: 6, P: 10.5, N: 16, Y0: -206, RP: 2.5, TRAVEL: 0 };
    K.L = Math.sqrt(Math.pow(K.A + K.W + K.RP, 2) + Math.pow(K.Y0 + 9 * K.P - K.RP, 2));   // hook length: peg just under the ninth ledge at rest
    o.yb = 0; o.psi = 0; o.phi = 0; o.amp = null; o.phase = "run"; o.lift = 0; o.ready = false;
    o.hk = [{ sx: 1 }, { sx: -1 }];                                                          // hook hung from the left end (grips the right edge), from the right end
  },
  // Distance of the bar's edge from its centre line at a height on the bar (the ratchetRack helper's edgeAt).
  edge: function (K, y) { if (y < K.Y0 || y >= K.Y0 + K.N * K.P) return K.W; var f = (y - K.Y0) / K.P; f -= Math.floor(f); return K.W + K.D * (1 - f); },
  // Peg centre for a hook whose pivot is q, with the peg X from the centre line on its edge.
  tip: function (o, h, X) { var dx = h.sx * X - h.qx; return o.K.L * o.K.L > dx * dx ? h.qy - Math.sqrt(o.K.L * o.K.L - dx * dx) : h.qy; },
  // Rock the lever to phi and work out the bar and the hooks. Ledges on the bar sit at Y0 + n*P (bar coordinates).
  advance: function (o, phi, dt) {
    var K = o.K, self = this, run = o.phase === "run";
    o.hk.forEach(function (h) { h.qx = -h.sx * K.A * Math.cos(phi); h.qy = -h.sx * K.A * Math.sin(phi); h.prev = h.qy; });
    if (!o.ready) { o.hk.forEach(function (h) { h.n = Math.floor((self.tip(o, h, K.W + K.RP) + K.RP - o.yb - K.Y0) / K.P - 1e-6) + 1; }); o.ready = true; }
    if (run) {
      // Each peg sits under ledge n. If its hook rises past that ledge, the bar is lifted with it.
      var lifter = null;
      o.hk.forEach(function (h) { var need = self.tip(o, h, K.W + K.RP) - (K.Y0 + h.n * K.P - K.RP); if (need > o.yb + 1e-9) { o.yb = need; lifter = h; } });
      o.hk.forEach(function (h) {
        if (lifter === h) h.on = true; else if (h.qy !== h.last) h.on = false;
      });
    } else if (o.phase === "lift") { o.lift = Math.min(1, o.lift + dt * 3); if (o.lift === 1) o.phase = "drop"; }
    else if (o.phase === "drop") { o.yb = Math.max(0, o.yb - dt * 80); if (o.yb === 0) { o.phase = "lower"; o.ready = false; } }
    else if (o.phase === "lower") { o.lift = Math.max(0, o.lift - dt * 3); if (o.lift === 0) o.phase = "run"; }
    o.hk.forEach(function (h) {
      // a peg going down slides out over the sloping top of the tooth below, then drops in under its ledge
      if (o.ready) while (h.n > 0 && self.tip(o, h, K.W + K.D + K.RP) - o.yb < K.Y0 + (h.n - 1) * K.P - K.RP) h.n--;
    });
    if (run && o.hk.some(function (h) { return h.n <= 1; })) { o.phase = "lift"; o.hk.forEach(function (h) { h.on = false; }); }
    o.hk.forEach(function (h) {
      h.last = h.qy;
      var X = K.W + K.RP, y, i;
      if (o.phase === "drop") { X = K.W + K.D + K.RP + 6; y = self.tip(o, h, X); }
      else {
        if (!o.ready) h.n = Math.floor((self.tip(o, h, K.W + K.RP) + K.RP - o.yb - K.Y0) / K.P - 1e-6) + 1;
        for (i = 0; i < 8; i++) {
          y = self.tip(o, h, X);
          var s = Math.min(K.Y0 + h.n * K.P - K.RP, y - o.yb);                                // peg centre on the bar, not above its ledge
          X = self.edge(K, s + K.RP - 1e-6) + K.RP;
        }
        X += o.lift * (K.W + K.D + K.RP + 6 - X);
        y = self.tip(o, h, X);
        // swinging out or back in, the curl of the hook rises a little and nudges the bar up with it
        if (!run && X < K.W + K.D + K.RP) o.yb = Math.max(o.yb, y - (K.Y0 + h.n * K.P - K.RP));
      }
      h.X = X; h.ty = y;
    });
    if (o.phase === "lower" && !o.ready && o.lift === 0) o.ready = true;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o = {};
    this.init(o);
    var K = o.K, mb = c.mat("bar"), ml = c.mat("lever"), dk = c.mat("lever", "dark");
    // bar: z -5..5. Rack y -206..10 with a slot round the fixed pin, head above, narrow foot below.
    o.bar = new T.Group(); scene.add(o.bar);
    P.at(P.ratchetRack({ length: 216, half: K.W, depth: K.D, pitch: K.P, teeth: K.N, from: 0, sides: 2, thick: 10,
      slot: { from: 17, to: 211, half: 5 }, material: mb }), 0, K.Y0, 0, o.bar);                // rack y -206..10; slot y -189..5, the pin (radius 5) at its top end
    var hs = new T.Shape(); hs.moveTo(-K.W, 0); hs.lineTo(K.W, 0); hs.lineTo(42, 32); hs.lineTo(-42, 32); hs.closePath();
    var hg = new T.ExtrudeGeometry(hs, { depth: 10, bevelEnabled: false }); hg.translate(0, 0, -5);
    P.at(P.mesh(hg, mb), 0, 10, 0, o.bar);                                                    // flared head y 10..42, sits on the rack top
    P.at(P.box(46, 144, 10, mb), 0, -278, 0, o.bar);                                          // foot x -23..23, y -350..-206, under the rack
    // lever: behind the bar, z -14..-8, rocking on the fixed pin at the origin
    o.lever = new T.Group(); scene.add(o.lever);
    var ls = new T.Shape(); ls.moveTo(-128, -4); ls.lineTo(-20, -9); ls.lineTo(20, -9); ls.lineTo(128, -4); ls.lineTo(128, 4); ls.lineTo(20, 9); ls.lineTo(-20, 9); ls.lineTo(-128, 4); ls.closePath();
    var lg = new T.ExtrudeGeometry(ls, { depth: 6, bevelEnabled: false }); lg.translate(0, 0, -14);
    o.lever.add(P.mesh(lg, ml));
    P.at(P.cylZ(10, 21, ml), 0, 0, -18.5, o.lever);                                           // boss z -29..-8, 1 clear of the plate
    P.at(P.sphere(15, ml), -138, 0, -11, o.lever);                                            // balls z -26..4, clear of the plate face at -30
    P.at(P.sphere(15, ml), 138, 0, -11, o.lever);
    P.at(P.cylZ(2.5, 24, dk), -K.A, 0, 4, o.lever);                                           // left hook pin z -8..16, from the lever face
    P.at(P.cylZ(2.5, 32, dk), K.A, 0, 8, o.lever);                                            // right hook pin z -8..24
    // hooks: left one in the plane z 12, right one at z 20, both in front of the bar (bar front z 5)
    o.hk.forEach(function (h, k) {
      var zp = k ? 20 : 12, qx = -h.sx * K.A, X = K.W + K.RP, ty = K.Y0 + 9 * K.P - K.RP;
      var tx = h.sx * X - qx, tyr = ty, cx = tx + h.sx * 7, ae = h.sx > 0 ? Math.PI / 6 : 5 * Math.PI / 6, m = c.mat("pawl");
      h.g = new T.Group(); scene.add(h.g); h.a0 = Math.atan2(tyr, tx);
      P.at(P.cylZ(5, 5, m), 0, 0, zp, h.g);                                                   // eye round the pin
      var sk = P.rod(2.5, m); h.g.add(sk); sk.span(0, 0, zp, cx + 7 * Math.cos(ae), tyr + 7 * Math.sin(ae), zp);
      var hook = P.at(P.arc(7, 2.5, 7 * Math.PI / 6, m), cx, tyr, zp, h.g);                  // curl from the shank end round under to the peg
      hook.rotation.z = h.sx > 0 ? Math.PI : 5 * Math.PI / 6;
      P.at(P.cylZ(K.RP, zp + 3, m), tx, tyr, (zp - 3) / 2, h.g);                              // peg z -3..zp, reaches back into the teeth
      h.zp = zp;
    });
    // fixed parts
    P.at(P.cylZ(5, 38.5, dk), 0, 0, -10.75, scene);                                          // lever pin z -30..8.5 through the boss and the slot
    P.at(P.cylZ(9, 2.5, dk), 0, 0, 7.25, scene);                                             // washer z 6..8.5, 1 clear of the bar
    P.at(P.box(320, 420, 10, c.fixed), 0, -150, -35, scene);                                 // plate x -160..160, y -360..60, z -40..-30
    P.at(P.box(360, 12, 100, c.fixed), 0, -366, -40, scene);                                 // base y -372..-360, z -90..10; plate stands on y -360
    P.at(P.box(14, 25, 34, c.fixed), 30, -242.5, -13, scene);                                // foot guides x 23..37, y -255..-230, z -30..4, on the plate face,
    P.at(P.box(14, 25, 34, c.fixed), -30, -242.5, -13, scene);                               // touching the foot's sides at x 23 and -23
    o.mPawl = c.mat("pawl"); o.mMark = c.mat("pawl", "mark");
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, amp = S.controls.swing * Math.PI / 180;
    o.amp = o.amp === null ? amp : o.amp + (amp - o.amp) * Math.min(1, dt * 5);
    if (o.phase === "run") o.psi += S.w * dt;                                                 // the lever waits while the bar is reset
    var phi = o.amp * Math.sin(o.psi);
    this.advance(o, phi, S.playing ? dt : 0);
    o.lever.rotation.z = phi;
    o.bar.position.y = o.yb;
    o.hk.forEach(function (h) {
      h.g.position.set(h.qx, h.qy, 0);
      h.g.rotation.z = Math.atan2(h.ty - h.qy, h.sx * h.X - h.qx) - h.a0;
      var m = h.on ? o.mMark : o.mPawl;
      h.g.children.forEach(function (ch) { ch.material = m; });
    });
    var deg = Math.round(phi * 180 / Math.PI);
    S.set("in", (deg > 0 ? "+" : deg < 0 ? "−" : "") + Math.abs(deg) + "°");
    S.set("out", "+" + Math.round(o.yb) + " mm");
  }
});
