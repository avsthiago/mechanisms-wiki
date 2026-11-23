M507.define({
  number: 389,
  title: "Eccentric lifting jack",
  lede: "A jack for lifting heavy things a little at a time. Each swing of the handle pushes a toothed bar up by one tooth. A second hook, called the holding pawl, keeps the bar up while the handle swings back.",
  alt: "A tall stand, drawn cut in half, with an upright bar sliding in a slot down its middle. The bar has saw teeth on its right edge and a cup on top. To the right, a round disc on a shaft carries a curved arm whose tip sits under a tooth. Above it a small curved holding pawl also rests against the teeth.",
  parts: [
    { key: "stand", color: "#5E7387", name: "Handle and disc", note: "The handle turns a shaft. The round disc is fixed on the shaft off-centre, so it wobbles up and down. This off-centre disc is called an eccentric." },
    { key: "bar", color: "#C8873A", name: "Toothed bar", note: "Slides up the slot in the stand and carries the load in its cup. Watch the red tooth climb." },
    { key: "pawl", color: "#D9B13B", name: "Pawl", note: "A ring round the disc with a curved arm. Its tip pushes up under one tooth at a time. A hook that pushes like this is called a pawl." },
    { key: "stop", color: "#4FA58A", name: "Holding pawl", note: "Turns on a fixed pin. It slips over the teeth on the way up and drops under one, so the bar cannot sink back." }
  ],
  controls: [{ id: "swing", label: "Handle swing", value: "35", options: [["35", "Short"], ["75", "Long"]] }],
  speed: { min: 5, max: 60, value: 24, label: "Handle speed", unit: " a min" },
  readouts: [{ id: "n", label: "Strokes" }, { id: "y", label: "Raised" }],
  views: { "3d": [234, 397, 1072], front: [20, 315, 950], side: [950, 315, 20] },
  target: [36, 263, 0],
  how: [
    "Swing the handle up and the disc lifts its ring and the curved arm. The tip of the arm is under a tooth, so the bar and its load go up too. Near the top, the holding pawl slips past a tooth.",
    "Swing the handle down and the arm sinks. Now the bar would sink as well, but the holding pawl is under a tooth, so the bar rests on it. The tip of the arm slides down over the teeth and drops under the next one. Then the handle is ready to lift again.",
    "The disc is close to the shaft, so a long swing of the handle moves the arm only a little. That is what makes the push strong. Try Short, then Long: a short swing lifts one tooth, a long swing lifts two."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows the stand cut in half. The handle, the back plate that carries the shafts, the number of teeth and all sizes are made up. Gravity, or a small spring, keeps the tips of both pawls against the teeth. When the bar nears the top, both pawls are lifted clear and the bar is let down, so the lifting can start again.",

  // shapes and sizes shared by build and step
  K: { w: 20, d: 9, p: 13, y0: 20, n: 26, len: 360, O: [76, 330], e: 16, R: 36, Ps: [52, 417] },
  edge: function (y) { var K = this.K; if (y < K.y0 || y >= K.y0 + K.n * K.p) return K.w; var f = (y - K.y0) / K.p; f -= Math.floor(f); return K.w + K.d * (1 - f); },
  // tip of a catch of length L pivoted at (px, py), resting against the bar (bottom at Y); x forced to the root when engaged
  tip: function (px, py, L, Y, root) {
    var x = this.K.w, y = py + Math.sqrt(L * L - (x - px) * (x - px));
    if (!root) for (var k = 0; k < 4; k++) { x = this.edge(y - Y); y = py + Math.sqrt(L * L - (x - px) * (x - px)); }
    return [x, y];
  },
  E: function (th) { var K = this.K; return [K.O[0] + K.e * Math.cos(th), K.O[1] + K.e * Math.sin(th)]; },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, self = this;
    var o = this.o = { ph: 0, eng: -1, strokes: 0, lowering: false, lastTy: null, out: 0 };
    o.Lp = Math.hypot(K.O[0] + K.e - K.w, 395 - K.O[1]);        // lifting catch: tip at the root at y = 395 when the handle is level
    o.Ls = Math.hypot(K.Ps[0] - K.w, 445 - K.Ps[1]);             // holding pawl: tip at the root at y = 445
    o.ys = 445;
    o.Y0 = o.ys - K.y0 - 22 * K.p; o.Y = o.Y0;                   // the 23rd ledge rests on the holding pawl: bar bottom at 129
    o.Ymax = o.Y0 + 6 * K.p;
    // stand, cut in half as Brown draws it: two walls either side of the slot, z -24..24
    var left = [[-21, 0], [-21, 340], [-53, 340], [-53, 120], [-58, 92], [-70, 70], [-88, 57], [-108, 50], [-123, 50], [-123, 25], [-138, 25], [-138, 0]];
    var right = [[31, 0], [150, 0], [150, 25], [135, 25], [135, 50], [114, 50], [94, 57], [76, 70], [64, 92], [59, 120], [59, 268], [31, 268]];
    [left, right].forEach(function (pts) { scene.add(P.outlinePlate({ points: pts, depth: 48, z0: -24, material: c.fixed })); });   // slot x -21..31; bar x -20..29 at the tips
    P.at(P.box(84, 432, 10, c.fixed), 73, 216, -29, scene);      // back plate x 31..115, y 0..432, z -34..-24 (front face on the walls' back face)
    // toothed bar with a cup on top
    var B = o.bar = new T.Group(); scene.add(B);
    var mb = c.mat("bar");
    B.add(P.ratchetRack({ length: K.len, half: K.w, depth: K.d, pitch: K.p, teeth: K.n, from: K.y0, sides: 1, thick: 16, material: mb }));   // z -8..8
    var cup = new T.Mesh(new T.CylinderGeometry(48, 30, 27, 32), mb); cup.position.set(4, K.len + 13.5, 0); B.add(cup);   // y 360..387
    var mk = P.outlinePlate({ points: [[K.w, K.y0 + 17 * K.p], [K.w + K.d, K.y0 + 17 * K.p], [K.w, K.y0 + 18 * K.p - .5]], depth: 1, z0: 8, material: c.mat("bar", "mark") });   // one tooth painted red, z 8..9
    B.add(mk);
    // shaft, eccentric disc and handle (they turn together about O)
    var ms = c.mat("stand");
    P.at(P.cylZ(6, 62, ms), K.O[0], K.O[1], 7, scene);           // shaft z -24..38, from the back plate face
    var G = o.ecc = P.at(new T.Group(), K.O[0], K.O[1], 0, scene);
    P.at(P.cylZ(K.R, 18, ms), K.e, 0, 0, G);                     // disc z -9..9
    P.at(P.cylZ(10, 20, c.mat("stand", "dark")), 0, 0, 0, G);    // boss on the shaft z -10..10
    var H = P.armPlate({ length: 130, r0: 12, r1: 7, thick: 6, material: ms }); H.position.z = 26; G.add(H);   // handle z 23..29
    P.at(P.sphere(10, ms), 130, 0, 26, G);
    // lifting catch: a ring round the disc and a curved arm; local X from the disc centre to the tip, arm on the -Y side of that line
    var mp = c.mat("pawl"), Lp = o.Lp;
    var ring = P.outlinePlate({ points: circ(43, 48), holes: [circ(36.6, 48).reverse()], depth: 12, z0: -6, material: mp });   // strap z -6..6
    function circ(r, n) { var a = []; for (var i = 0; i < n; i++) a.push([r * Math.cos(2 * Math.PI * i / n), r * Math.sin(2 * Math.PI * i / n)]); return a; }
    function arm(L, x0, wd, bow) {
      var lo = [], hi = [], N = 12;
      for (var i = 0; i <= N; i++) { var x = x0 + (L - 8 - x0) * i / N, b = bow * Math.sin(Math.PI * i / N); lo.push([x, -b]); hi.push([x, -b - wd]); }
      return lo.concat([[L, 0]]).concat(hi.reverse());
    }
    o.pawl = P.at(new T.Group(), 0, 0, 0, scene);
    o.pawl.add(ring);
    o.pawl.add(P.outlinePlate({ points: arm(Lp, 38, 9, 5), depth: 11, z0: -5.5, material: mp }));
    // holding pawl on a fixed pin
    var mt = c.mat("stop"), Ls = o.Ls;
    P.at(P.cylZ(4, 32, mt), K.Ps[0], K.Ps[1], -8, scene);        // pin z -24..8, from the back plate face
    o.stop = P.at(new T.Group(), K.Ps[0], K.Ps[1], 0, scene);
    P.at(P.cylZ(8, 11, mt), 0, 0, 0, o.stop);
    o.stop.add(P.outlinePlate({ points: arm(Ls, 0, 8, 4), depth: 11, z0: -5.5, material: mt }));
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, A = (+S.controls.swing) * Math.PI / 180;
    if (o.lowering) {
      o.out = Math.min(1, o.out + dt * 2);
      if (o.out >= 1) o.Y = Math.max(o.Y0, o.Y - 80 * dt);
      if (o.Y <= o.Y0) { o.lowering = false; o.eng = -1; o.lastTy = null; }
    } else {
      o.out = Math.max(0, o.out - dt * 2);
      var prev = Math.sin(o.ph);
      o.ph += S.w * dt;
      if (Math.sin(o.ph) > 0 && prev <= 0 && S.w > 0) o.strokes++;
    }
    var th = A * Math.sin(o.ph), E = this.E(th);
    var tr = this.tip(E[0], E[1], o.Lp, o.Y, true), ty = tr[1];
    // the holding position at or just below the bar: a ledge sitting on the holding pawl
    var hold = o.ys - K.y0 - K.p * Math.ceil((o.ys - K.y0 - o.Y) / K.p - 1e-6);
    if (!o.lowering && o.lastTy !== null) {
      if (o.eng >= 0) {
        // carrying the bar; on the way down the bar follows until a ledge sits on the holding pawl
        o.Y = Math.max(hold, ty - (K.y0 + o.eng * K.p));
        if (ty < o.lastTy && o.Y <= hold + 1e-6) { o.Y = hold; o.eng = -1; }
      } else if (ty > o.lastTy) {
        // moving up, the tip follows the slope in to the root and meets the flat underside of the next tooth up
        var prevLoc = o.lastTy - o.Y, n = Math.ceil((prevLoc - K.y0) / K.p - 1e-6), yn = K.y0 + n * K.p;
        if (n >= 0 && n < K.n && ty - o.Y >= yn) { o.eng = n; o.Y = ty - yn; }
      }
      if (o.Y >= o.Ymax - 1e-6 && o.eng < 0) o.lowering = true;
    }
    o.lastTy = ty;
    // place everything
    o.bar.position.y = o.Y;
    o.ecc.rotation.z = th;
    var t1 = o.eng >= 0 ? tr : this.tip(E[0], E[1], o.Lp, o.Y, false);
    o.pawl.position.set(E[0], E[1], 0);
    o.pawl.rotation.z = Math.atan2(t1[1] - E[1], t1[0] - E[0]) - .45 * o.out;
    var ts = this.tip(K.Ps[0], K.Ps[1], o.Ls, o.Y, Math.abs(o.Y - hold) < 1e-6);
    o.stop.rotation.z = Math.atan2(ts[1] - K.Ps[1], ts[0] - K.Ps[0]) - .5 * o.out;
    S.set("n", o.strokes + "");
    S.set("y", Math.round(o.Y - o.Y0) + " mm");
  }
});
