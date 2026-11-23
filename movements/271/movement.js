M507.define({
  number: 271,
  title: "Lever with two pawls on a ratchet bar",
  lede: "A lever rocks to and fro. Two small catches, called pawls, hang from it and hook the teeth of a long bar. One pawl pulls the bar along on the way up and the other pulls on the way down. So the bar keeps moving, almost without a pause.",
  alt: "A long flat bar with fine saw teeth lies on a low table. On the right, a tall post carries a lever that has a long handle slanting up to the right. Two long catches hang from the lever and lie along the bar with their tips on the teeth. At the left end a strip runs from the bar to a small reel.",
  parts: [
    { key: "lever", color: "#D9B13B", name: "Swinging arm", note: "Rocks about a pin on the post. A hand on the long handle moves it. The two pawls hang from it, one above the pin and one below." },
    { key: "pawls", color: "#C2503F", name: "Two pawls", note: "Two long catches. Watch them: while one pulls a tooth along, the other slides back over the teeth, then they swap." },
    { key: "bar", color: "#C8873A", name: "Ratchet bar", note: "A bar with saw teeth. Each tooth has a long slope and a short steep face. The red marks show how far it has moved." },
    { key: "reel", color: "#4FA58A", name: "Strip and reel", note: "A strip is clamped to the end of the bar and runs to a small reel. The reel spins as the strip is pulled off it." }
  ],
  controls: [{ id: "swing", label: "Lever swing", value: "0.34", options: [["0.22", "Small"], ["0.34", "Medium"], ["0.46", "Big"]] }],
  speed: { min: 1, max: 30, value: 8, label: "Rocking speed", unit: " rpm" },
  readouts: [{ id: "bar", label: "Bar" }, { id: "lever", label: "Lever" }, { id: "who", label: "Pulling" }],
  views: { "3d": [-20, 110, 860], front: [-175, 0, 780], side: [700, 20, 0] },
  target: [-175, 0, 0],
  distance: [400, 2500],
  how: [
    "Watch the lever rock about its pin. One pawl hangs from a point above the pin and the other from a point below it. When the lever turns, the two points move opposite ways: one goes left while the other goes right.",
    "A pawl that is moved right hooks a tooth on its steep face and drags the bar along with it. At the same moment the other pawl is moved left. It slides up the long slope of a tooth and drops into the next gap. When the lever turns back, the two swap jobs. So the bar is pulled on both strokes and only pauses for an instant while the pawls change over.",
    "Try the three swings. With a small swing each pawl pulls the bar only about one tooth. With a large swing it pulls several teeth, and the bar goes faster."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows a bar on a table, a post with a lever, two long pawls and a reel. The table, post, base, clamps, pin positions, the size of the teeth and the lever swings were made up. The bar is shown as an endless strip: only its teeth and red marks slide along, so it never runs out. Brown's drawing does not say which way the bar moves. Here it moves to the right, pulling the strip off the reel.",

  init: function () {
    var K = this.K = { p: 10, w: 2, d: 6, Q: [0, 55], piv: [[0, 79], [0, 31]], u0: [-252, -146], A: .34 };
    K.L = K.piv.map(function (pv, i) { var u = K.u0[i]; return Math.hypot(u - pv[0], this.prof(u) - pv[1]); }, this);
    this.o = { xbar: 0, phi: 0, a: 0, up: [0, 0], nose: [[0, 0], [0, 0]], psi: [0, 0], which: "None" };
    this.settle(0, 1);
    this.o.up = this.o.nose.map(function (n) { return n[0] - this.o.xbar; }, this);
  },
  prof: function (u) {                                                  // height of the bar top at bar position u: slope down, then a short steep rise
    var K = this.K, f = ((u % K.p) + K.p) % K.p;
    return f <= K.p - K.w ? K.d * (1 - f / (K.p - K.w)) : K.d * (f - (K.p - K.w)) / K.w;
  },
  pivot: function (i, phi) {
    var K = this.K, c = Math.cos(phi), s = Math.sin(phi), dx = K.piv[i][0] - K.Q[0], dy = K.piv[i][1] - K.Q[1];
    return [K.Q[0] + c * dx - s * dy, K.Q[1] + s * dx + c * dy];
  },
  nosePos: function (i, P, xbar) {                                      // bar position u where the pawl's tip meets the bar (the distance falls as u grows)
    var K = this.K, L = K.L[i], lo = P[0] - L - xbar - 1, hi = P[0] - xbar + 1, j;
    for (j = 0; j < 60; j++) {
      var m = (lo + hi) / 2, g = Math.hypot(xbar + m - P[0], this.prof(m) - P[1]) - L;
      if (g > 0) lo = m; else hi = m;
    }
    return (lo + hi) / 2;
  },
  settle: function (phi, init) {
    var K = this.K, o = this.o, it, i; o.phi = phi; o.pulled = [false, false];
    for (it = 0; it < 6; it++) {
      var moved = false;
      for (i = 0; i < 2; i++) {
        var P = this.pivot(i, phi), u = this.nosePos(i, P, o.xbar), f = ((u % K.p) + K.p) % K.p;
        if (!init && f > K.p - K.w + 1e-9 && u > o.up[i] + 1e-12) {      // climbing a steep face: the pawl pulls the bar instead
          var uh = o.up[i], yh = this.prof(uh), xn = P[0] - Math.sqrt(K.L[i] * K.L[i] - (P[1] - yh) * (P[1] - yh)), nb = xn - uh;   // the tip holds its place on the face and the bar goes with the pawl
          if (nb > o.xbar) { o.xbar = nb; o.pulled[i] = true; moved = true; }
          u = this.nosePos(i, P, o.xbar);
        }
        o.up[i] = u; o.nose[i] = [o.xbar + u, this.prof(u)];
      }
      if (!moved) break;
    }
  },
  noseAng: function (i) { var P = this.pivot(i, this.o.phi), n = this.o.nose[i]; return Math.atan2(n[1] - P[1], n[0] - P[0]); },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, K, o;
    this.init(); K = this.K; o = this.o;
    var mb = c.mat("bar"), ml = c.mat("lever");
    // Layers along z: post -14..6; table -14..22; reel arm -14..6; lever 6..12; pawls 12..18 (hubs 11..19); bar, strip, reel 8..20.
    P.at(P.box(520, 12, 70, c.fixed), -220, -106, 5, scene);              // base x -480..40, y -112..-100, z -30..40
    P.at(P.box(313, 49, 36, c.fixed), -173.5, -32.5, 4, scene);           // table x -330..-17, y -57..-8, z -14..22
    P.at(P.box(45, 43, 36, c.fixed), -287, -78.5, 4, scene);              // leg x -310..-265, y -100..-57
    P.at(P.box(50, 43, 36, c.fixed), -90, -78.5, 4, scene);               // leg x -115..-65, y -100..-57
    P.at(P.box(34, 175, 20, c.fixed), 0, -12.5, -4, scene);               // post x -17..17, y -100..75, z -14..6; table end face at x -17
    P.at(P.box(130, 49, 20, c.fixed), -395, -32.5, -4, scene);            // reel arm x -460..-330, y -57..-8, z -14..6; table end face at x -330
    P.at(P.box(45, 43, 20, c.fixed), -437.5, -78.5, -4, scene);           // reel arm leg x -460..-415, y -100..-57
    // bar: teeth slide along (they only move by part of a tooth, as if the bar went on for ever); clamps hide the ends
    var sh = new T.Shape(), p = K.p, w = K.w, d = K.d, k;
    sh.moveTo(-330, -8); sh.lineTo(-330, d);
    for (k = -33; k < -2; k++) { sh.lineTo((k + 1) * p - w, 0); sh.lineTo((k + 1) * p, d); }
    sh.lineTo(-20, -8); sh.closePath();
    var bg = new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false }); bg.translate(0, 0, 8);
    o.bar = new T.Mesh(bg, mb); scene.add(o.bar);                          // z 8..20, x -330..-20 plus the slide
    P.at(P.box(25.5, 19.5, 16, c.mat("bar", "dark")), -317.75, 2.25, 14, scene);   // left clamp x -330..-305, y -8..12, z 6..22; on the table top y -8
    P.at(P.box(33, 19.5, 16, c.mat("bar", "dark")), -25.5, 2.25, 14, scene);    // right clamp x -42..-9, y -8..12, z 6..22; touches the post face
    P.at(P.box(105, 2, 12, c.mat("reel")), -382.5, -1, 14, scene);         // strip x -435..-330, y -2..0, z 8..20, from the reel top to the clamp
    o.marks = [];
    for (i = 0; i < 6; i++) o.marks.push(P.at(P.box(8, 5, 1, c.mat("bar", "mark")), 0, -3, 20.5, scene));   // z 20..21, off the front face
    // reel
    o.reel = new T.Group(); o.reel.position.set(-435, -37, 14); scene.add(o.reel);
    P.at(P.cylZ(35, 12, c.mat("reel")), 0, 0, 0, o.reel);                  // z 8..20, top at y -2 under the strip
    P.at(P.cylZ(6, 2, c.mat("reel", "dark")), 0, 0, 7, o.reel);            // hub z 20..22
    P.at(P.box(28, 5, 1, c.mat("reel", "mark")), 15, 0, 6.8, o.reel);      // red stripe z 20..21
    P.at(P.cylZ(6, 18, c.fixed), -435, -37, 5, scene);                      // axle z -4..14... from the arm face z 6 into the reel
    // lever on the post
    o.lever = new T.Group(); o.lever.position.set(K.Q[0], K.Q[1], 9); scene.add(o.lever);
    P.at(P.box(10, 48, 5, ml), 0, 0, 0, o.lever);                          // upright between the two pawl pins, local y -24..24, z 6..12
    P.at(P.cylZ(10, 6, ml), 0, 0, 0, o.lever);                             // boss at the pin
    P.at(P.cylZ(8, 6, ml), 0, 24, 0, o.lever); P.at(P.cylZ(8, 6, ml), 0, -24, 0, o.lever);
    var hl = Math.hypot(108, 70), hb = P.box(hl, 8, 5, ml); hb.position.set(54, 35, 0); hb.rotation.z = Math.atan2(70, 108); o.lever.add(hb);   // handle up to the right
    P.at(P.cylZ(6, 6, ml), 108, 70, 0, o.lever);
    P.at(P.cylZ(4, 13, c.mat("lever", "dark")), K.Q[0], K.Q[1], 6.5, scene);    // pin z 0..12, into the post face z 6
    // pawls
    o.pawl = [];
    for (i = 0; i < 2; i++) {
      var pw = P.pawl({ length: K.L[i], thick: 5, width: 6, side: -1, material: c.mat("pawls") });
      scene.add(pw); o.pawl.push(pw);
      pw.pin = P.at(P.cylZ(2.5, 8, c.mat("lever", "dark")), 0, 0, 16, scene);   // pin z 12..20
    }
    this.place();
  },

  place: function () {
    var K = this.K, o = this.o, i, p = K.p;
    o.bar.position.x = ((o.xbar % p) + p) % p;
    o.lever.rotation.z = o.phi;
    for (i = 0; i < 2; i++) {
      var P = this.pivot(i, o.phi);
      o.pawl[i].position.set(P[0], P[1], 15); o.pawl[i].rotation.z = this.noseAng(i); o.pawl[i].pin.position.set(P[0], P[1], 16);
    }
    o.reel.rotation.z = -o.xbar / 35;
    var W = 398, S = W / 6;
    for (i = 0; i < 6; i++) { var x = -440 + (((o.xbar + i * S) % W) + W) % W; o.marks[i].position.x = x; }
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, A = +S.controls.swing || .34, da = S.w * dt, n = Math.max(1, Math.ceil(Math.abs(da) / .01)), i, x0 = o.xbar, pl = [false, false];
    for (i = 0; i < n; i++) { o.a += da / n; this.settle(A * Math.sin(o.a)); if (o.pulled[0]) pl[0] = true; if (o.pulled[1]) pl[1] = true; }
    if (dt === 0) this.settle(A * Math.sin(o.a));
    if (pl[0] || pl[1]) o.which = pl[0] && pl[1] ? "Both" : pl[0] ? "Upper pawl" : "Lower pawl";
    this.place();
    var deg = Math.round(o.phi * 180 / Math.PI);
    S.set("bar", (o.xbar / K.p).toFixed(1) + " teeth");
    S.set("lever", (deg < 0 ? "−" : deg > 0 ? "+" : "") + Math.abs(deg) + "°");
    S.set("who", o.which);
  }
});
