M507.define({
  number: 270,
  title: "Anti-friction pulley bearing",
  lede: "A rope pulls a pulley round, and the pulley has to turn on its shaft. Rubbing metal on metal wastes effort and wears out. Here the pulley rides on a ring of small rollers, so the surfaces roll over each other and do not rub.",
  alt: "Two equal pulleys side by side with a rope hanging over each. On the left the pulley is seen from the outside, with a round plate and bolts round the middle. On the right it is cut open: six small rollers sit in a ring round the shaft.",
  parts: [
    { key: "pulley", color: "#5E7387", name: "Pulley", note: "The big wheel the rope runs over. On the right its hub is cut open so you can see inside. The rope turns it." },
    { key: "rollers", color: "#C8873A", name: "Rollers", note: "Six small cylinders between the shaft and the pulley. Each one spins on its own axis and also travels round the shaft. Watch the red stripe on one roller." },
    { key: "shaft", color: "#4FA58A", name: "Shaft", note: "The thick pin in the middle that carries the pulley. It is held fixed to the back plate." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "Runs over the top of each pulley and hangs down both sides. The red marks show how fast it moves." }
  ],
  controls: [{ id: "shaft", label: "Shaft", value: "0", options: [["0", "Held still"], ["0.5", "Turns the same way"], ["-0.5", "Turns the other way"]] }],
  readouts: [{ id: "p", label: "Pulley" }, { id: "o", label: "Rollers round" }, { id: "s", label: "Rollers spin" }],
  views: { "3d": [330, 150, 1050], front: [0, -60, 1180], side: [900, -60, 0] },
  target: [0, -60, 0],
  distance: [500, 2800],
  how: [
    "On the left you see the pulley from outside: a round plate with bolts, and the end of the shaft in the middle. On the right the same pulley is cut open. Between the shaft and the wheel there are six small rollers.",
    "The rope turns the wheel. The wheel's hole rolls on the rollers, and the rollers roll on the shaft. Nothing slides. A roller travels round the shaft more slowly than the wheel turns, and spins on its own axis faster than the wheel.",
    "Try the three settings for the shaft. Held still, the rollers circle round it. If the shaft turns too, the rollers circle faster or slower, but they never slide."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows a pulley from outside and the same pulley cut open, with a rope over each. The back plate and base, the shaft ends, the bolts, the number and size of the rollers and the speeds were made up. The rollers have no cage to hold them apart here. Brown draws the rope ends hanging down; here they carry on out of view.",

  // Rolling without slipping: the roller touches the shaft and the pulley hole, and both touching points move with those surfaces.
  kin: function (wo, ws) {
    var K = this.K;
    return { wc: (K.Ro * wo + K.Ri * ws) / (K.Ri + K.Ro), wr: (K.Ro * wo - K.Ri * ws) / (2 * K.r) };
  },
  K: { Ri: 30.8, r: 29.6, Ro: 90, R: 130, Rr: 133, X: 145, N: 6, Lh: 250, gap: 120 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i;
    var o = this.o = { po: 0, ps: 0, pc: 0, pr: 0, u: 0, roll: [], mk: [] };
    function ring(Ro, Ri, depth, m) {                       // flat ring, axis Z, z -depth/2..depth/2
      var sh = new T.Shape(), h = new T.Path(); sh.absarc(0, 0, Ro, 0, 2 * Math.PI, false);
      if (Ri > 0) { h.absarc(0, 0, Ri, 0, 2 * Math.PI, true); sh.holes.push(h); }
      var g = new T.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 64 }); g.translate(0, 0, -depth / 2);
      return new T.Mesh(g, m);
    }
    function wheel(xc, hole) {                              // pulley wheel z -15..15 with flanges
      var g = new T.Group(); g.position.set(xc, 0, 0); scene.add(g);
      var spin = new T.Group(); g.add(spin);
      spin.add(ring(K.R, hole, 30, c.mat("pulley")));
      P.at(ring(K.R + 8, K.R, 3, c.mat("pulley")), 0, 0, -13.5, spin);          // flanges z -15..-12 and 12..15, outside the rim
      P.at(ring(K.R + 8, K.R, 3, c.mat("pulley")), 0, 0, 13.5, spin);
      var arc = P.arc(K.Rr, 3, Math.PI, c.mat("rope")); arc.position.set(xc, 0, 0); scene.add(arc);   // rope over the top, tube centre radius 133
      [-1, 1].forEach(function (sd) { var s = P.rod(3, c.mat("rope")); s.span(xc + sd * K.Rr, 0, 0, xc + sd * K.Rr, -K.Lh, 0); scene.add(s); });
      return { g: g, spin: spin };
    }
    // back plate and base
    P.at(P.box(600, 420, 10, c.fixed), 0, -60, -25, scene);                    // plate x -300..300, y -270..150, z -30..-20
    P.at(P.box(660, 12, 100, c.fixed), 0, -276, -30, scene);                   // base y -282..-270, z -80..20; plate stands on y -270; ropes end at -250
    // left pulley: seen from outside
    var L = wheel(-K.X, 29), R = wheel(K.X, K.Ro);
    var plate = ring(75, 29, 2, c.mat("pulley", "light")); P.at(plate, 0, 0, 16, L.spin);   // hub plate z 15..17
    for (i = 0; i < 6; i++) { var a = i * Math.PI / 3 + .3; P.at(P.cylZ(5, 2, c.mat("pulley", "dark")), 54 * Math.cos(a), 54 * Math.sin(a), 18, L.spin); }   // bolts z 17..19
    P.at(P.box(30, 5, 1, c.mat("pulley", "mark")), 100, 0, 15.5, L.spin);       // red stripe on the wheel face z 15..16 would touch: centre 15.5 lifted off by half
    // shafts, one fixed to the plate for each pulley (z -20..24), the left one has a marked end
    o.shaftL = new T.Group(); o.shaftL.position.set(-K.X, 0, 0); scene.add(o.shaftL);
    P.at(P.cylZ(28, 44, c.mat("shaft")), 0, 0, 2, o.shaftL);                    // z -20..24, from the plate face
    for (i = 0; i < 6; i++) { var b = i * Math.PI / 3; P.at(P.cylZ(7, 1, c.mat("shaft", "dark")), 18 * Math.cos(b), 18 * Math.sin(b), 24.5, o.shaftL); }   // lobes z 24..25
    o.shaftR = new T.Group(); o.shaftR.position.set(K.X, 0, 0); scene.add(o.shaftR);
    P.at(P.cylZ(K.Ri, 44, c.mat("shaft")), 0, 0, 2, o.shaftR);                  // z -20..24
    P.at(P.box(K.Ri - 6, 4, 1, c.mat("shaft", "mark")), (K.Ri - 6) / 2 + 2, 0, 24.5, o.shaftR);   // red stripe on the shaft end, z 24..25
    o.L = L; o.R = R;
    // rollers in the cut-open pulley
    for (i = 0; i < K.N; i++) {
      var rg = new T.Group(); scene.add(rg);
      var rl = new T.Group(); rg.add(rl);
      P.at(P.cylZ(K.r, 24, c.mat("rollers")), 0, 0, 0, rl);                     // z -12..12
      P.at(P.box(K.r * 1.3, 4, 1, c.mat("rollers", i ? "dark" : "mark")), 0, 0, 12.5, rl);   // stripe z 12..13
      P.at(P.cylZ(4, 1, c.mat("rollers", "dark")), 0, 0, 13, rl);
      o.roll.push({ g: rg, spin: rl });
    }
    // marks on the ropes
    for (i = 0; i < 4; i++) { o.mk.push(P.at(P.sphere(5.5, c.mat("rope", "mark")), 0, 0, 0, scene)); }
    // direction arrow on the left face
    var arr = P.arc(100, 2, 70 * Math.PI / 180, c.mat("pulley", "dark")); arr.rotation.z = 145 * Math.PI / 180; P.at(arr, -K.X, 0, 17, scene);
    var ca = 215 * Math.PI / 180, tx = -Math.sin(ca), ty = Math.cos(ca);
    var cone = new T.Mesh(new T.ConeGeometry(7, 16, 12), c.mat("pulley", "dark")); cone.rotation.z = Math.atan2(-tx, ty);
    P.at(cone, -K.X + 100 * Math.cos(ca) + tx * 7, 100 * Math.sin(ca) + ty * 7, 17, scene);
    this.place();
  },

  ropePoint: function (xc, s) {                             // distance s along the loop: up the right side, over the top, down the left
    var K = this.K, Lt = 2 * K.Lh + Math.PI * K.Rr + K.gap; s = ((s % Lt) + Lt) % Lt;
    if (s < K.Lh) return [xc + K.Rr, -K.Lh + s];
    s -= K.Lh; if (s < Math.PI * K.Rr) { var a = s / K.Rr; return [xc + K.Rr * Math.cos(a), K.Rr * Math.sin(a)]; }
    s -= Math.PI * K.Rr; if (s < K.Lh) return [xc - K.Rr, -s];
    return null;
  },

  place: function () {
    var K = this.K, o = this.o, i, orbit = K.Ri + K.r, Lt = 2 * K.Lh + Math.PI * K.Rr + K.gap;
    o.L.spin.rotation.z = o.po; o.R.spin.rotation.z = o.po;
    o.shaftL.rotation.z = o.ps; o.shaftR.rotation.z = o.ps;
    for (i = 0; i < K.N; i++) {
      var a = o.pc + i * 2 * Math.PI / K.N, r = o.roll[i];
      r.g.position.set(K.X + orbit * Math.cos(a), orbit * Math.sin(a), 0); r.spin.rotation.z = o.pr;
    }
    [[-K.X, 0], [K.X, 2]].forEach(function (q) {
      for (var j = 0; j < 2; j++) {
        var pt = this.ropePoint(q[0], o.u + j * Lt / 2), m = o.mk[q[1] + j];
        if (pt) { m.visible = true; m.position.set(pt[0], pt[1], 0); } else m.visible = false;
      }
    }, this);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, k = +S.controls.shaft || 0, ws = k * S.w, kn = this.kin(S.w, ws);
    o.po += S.w * dt; o.ps += ws * dt; o.pc += kn.wc * dt; o.pr += kn.wr * dt; o.u += S.w * K.Rr * dt;
    this.place();
    function f(w) { var v = Math.round(w * 30 / Math.PI); return (v < 0 ? "−" : "") + Math.abs(v) + " rpm"; }
    S.set("p", f(S.w)); S.set("o", f(kn.wc)); S.set("s", f(kn.wr));
  }
});
