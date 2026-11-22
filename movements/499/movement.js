M507.define({
  number: 499,
  title: "Bourdon gauge",
  lede: "A bent metal tube tries to straighten when the pressure inside it rises. Its two free ends spread apart a little. Links, a toothed lever and a small gear turn that small movement into a big swing of the pointer.",
  alt: "A round gauge seen from the front. A flat metal tube bent almost into a ring is held at the top. Its two free ends at the bottom pull two links joined to a toothed lever, which turns a small gear carrying a long pointer over a curved scale.",
  parts: [
    { key: "tube", color: "#C8873A", name: "Bent tube", note: "A flat tube, closed at both ends and held at the top. Pressure inside makes it straighten, so its ends spread apart." },
    { key: "sector", color: "#D9B13B", name: "Links and toothed lever", note: "Each end of the tube pulls a link. The links turn a lever with gear teeth on its top, called a sector." },
    { key: "pinion", color: "#4FA58A", name: "Small gear and pointer", note: "The sector turns this small gear, called a pinion, and the pointer is fixed to its spindle. Watch the red pointer." },
    { key: "dial", color: "#E8E2D0", name: "Scale", note: "Marked from 0 to 10 bar. One bar is about the push of the air around us." },
    { key: "case", color: "#5E7387", name: "Case", note: "Holds everything. The pressure comes in through the stem at the bottom and a thin pipe behind takes it up to the tube." }
  ],
  controls: [{ type: "range", id: "p", label: "Pressure", min: 0, max: 10, step: .1, value: 4, unit: " bar", pauseOnInput: true,
    presets: [[0, "None"], [5, "Half"], [10, "Full"]] }],
  speed: false,
  readouts: [{ id: "p", label: "Pressure" }, { id: "a", label: "Pointer" }],
  views: { "3d": [70, 20, 520], front: [0, -15, 540], side: [540, -15, 40] },
  target: [0, -15, 0],
  how: [
    "The tube is flat, not round, and it is bent almost into a ring. It is held firmly at the top, and both of its ends are free. When steam or water is let in, the pressure tries to make the flat tube round. A flat tube that gets rounder also gets straighter, so the ring opens and its ends spread apart.",
    "The ends move only a little. Each one pulls a link. One link pulls the top of the toothed lever and the other pulls its bottom, so both turn it the same way. The teeth are far from the lever's pin, and they turn a much smaller gear. So the pointer swings much further than the tube's ends move.",
    "When the pressure falls, the springy metal curls back and the pointer returns. Move the pressure from None to Full and watch the gap between the ends of the tube."
  ],
  note: "This model is rebuilt from Brown's drawing. A real tube's ends move about a millimetre; here they move many times more, so that you can see it. The pipe behind the tube, the sizes, the number of teeth and the 0 to 10 bar scale are made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D2R = Math.PI / 180, k;
    var o = this.o = { R0: 100, PHI0: 155 * D2R, E: .0294, Q: [0, -100], A1: 13, A2: 10.4, SY: -73, RATIO: 2.7, A0: 145 * D2R, NS: 121, NR: 14, p: null, key: "" };
    o.Lt = o.R0 * o.PHI0;
    o.l1 = this.dist(this.pin(0, 1), this.end(0, -1)); o.l2 = this.dist(this.pin(0, -1), this.end(0, 1));

    // case: rim r 122 .. 132 from z -15 to 14, a see-through back z -15 .. -11.5, stem below
    var cm = c.mat("case");
    P.at(P.annulus({ rIn: 122, rOut: 132, depth: 29, z0: -15, material: cm }), 0, 0, 0, scene);
    P.at(P.cylZ(121.5, 3, c.fixed), 0, 0, -13, scene);                         // back z -14.5 .. -11.5, clear of the rim
    P.at(P.cylY(8, 12, cm), 0, -137, -1, scene);                                  // neck y -143 .. -131, into the rim
    P.at(P.cylY(16, 14, cm), 0, -150, -1, scene);                                 // nut y -157 .. -143
    P.at(P.cylY(6.5, 38, cm), 0, -176, -1, scene);                                // stem y -195 .. -157
    P.at(P.box(22, 22, 14, cm), 0, 112, -1, scene);                               // block at the top that clamps the tube: y 101 .. 123, into the rim
    var feed = P.pathTube({ path: P.bendPath([[0, -122], [0, -118], [26, -118], [26, -50], [0, -50], [0, 104]], 7, 2), radius: 2.5, material: cm });
    P.at(feed, 0, 0, -9, scene);                                                  // z -11.5 .. -6.5, lies on the back's face

    // the bent tube, rebuilt as it opens
    var NS = o.NS, NR = o.NR, idx = [], i, j;
    for (i = 0; i < NS - 1; i++) for (j = 0; j < NR; j++) { var a = i * NR + j, b = i * NR + (j + 1) % NR; idx.push(a, a + NR, b + NR, a, b + NR, b); }
    for (j = 1; j < NR - 1; j++) { idx.push(0, j, j + 1); var e0 = (NS - 1) * NR; idx.push(e0, e0 + j + 1, e0 + j); }
    var g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array(NS * NR * 3), 3)); g.setIndex(idx);
    o.tube = P.mesh(g, c.mat("tube")); o.tube.userData.live = true; o.tube.frustumCulled = false; scene.add(o.tube);
    o.endPins = [-1, 1].map(function () { return P.at(P.cylZ(2.2, 9, c.mat("tube")), 0, 0, 3.5, scene); });   // z -1 .. 8

    // sector: teeth on top, a pin above the pivot and one below
    o.sector = P.at(new T.Group(), o.Q[0], o.Q[1], 0, scene);
    var sec = P.gearSector({ teeth: 27, module: 2, fromDeg: 62, toDeg: 118, width: 4, material: c.mat("sector") }); o.sector.add(sec);
    P.at(P.box(7, 2 * o.A1 + 6, 4, c.mat("sector")), 0, (o.A1 - o.A2) / 2, 0, o.sector);   // plate from below the low pin to above the high one
    P.at(P.cylZ(5, 4.5, c.mat("sector")), 0, 0, 0, o.sector);
    P.at(P.cylZ(1.6, 10, c.mat("sector", "dark")), 0, o.A1, 3.5, o.sector);          // pins z -2 .. 8
    P.at(P.cylZ(1.6, 10, c.mat("sector", "dark")), 0, -o.A2, 3.5, o.sector);
    P.at(P.cylZ(2, 14.5, c.mat("sector", "dark")), o.Q[0], o.Q[1], -4.25, scene);   // pivot pin z -11.5 .. 2, from the back's face
    o.links = [P.rod(1.4, c.mat("sector")), P.rod(1.4, c.mat("sector"))]; o.links.forEach(function (l) { scene.add(l); });

    // pinion, spindle and pointer
    o.pinion = P.at(new T.Group(), 0, o.SY, 0, scene);
    var pin = P.spurGear({ teeth: 10, module: 2, width: 3, material: c.mat("pinion") }); o.pinion.add(pin);
    P.at(P.cylZ(2, 23.5, c.mat("pinion")), 0, 0, .25, o.pinion);                    // spindle z -11.5 .. 12, from the back's face
    o.base = P.meshTurn(sec, pin); o.pinion.rotation.z = o.base;
    var hand = P.at(new T.Group(), 0, 0, 11, o.pinion); hand.rotation.z = o.A0 - o.base;
    var red = c.mat("pinion", "mark");
    P.at(P.box(132, 2.4, 1.5, red), 52, 0, 0, hand); P.at(P.box(20, 4, 1.5, red), -10, 0, 0, hand); P.at(P.cylZ(4.5, 2.5, red), 0, 0, 0, hand);

    // curved scale round the spindle, z 8 .. 9; ticks at the pointer angle the kinematics give, z 9.5 .. 10
    var dm = c.mat("dial");
    P.at(P.annulus({ rIn: 112, rOut: 134, depth: 1, z0: 8, from: 26 * D2R, to: 154 * D2R, material: dm }), 0, o.SY, 0, scene);
    var ink = c.mat("dial", "dark");
    for (k = 0; k <= 50; k++) {
      var p = k / 5, ang = o.A0 - o.RATIO * this.solve(p), major = k % 5 === 0, rr = major ? 126 : 129;
      var tk = P.box(major ? 14 : 8, major ? 1.6 : .8, .5, ink); tk.rotation.z = ang;
      P.at(tk, rr * Math.cos(ang), o.SY + rr * Math.sin(ang), 9.75, scene);
      if (major && k % 10 === 0) P.at(P.label(String(p), 12, c.ink), 104 * Math.cos(ang), o.SY + 104 * Math.sin(ang), 13, scene);
    }
  },

  dist: function (A, B) { return Math.hypot(A[0] - B[0], A[1] - B[1]); },
  // a point on the tube's centre line: side -1 left, 1 right; u from 0 (the held middle) to 1 (the free end)
  arcPt: function (p, side, u) {
    var o = this.o, R = o.R0 / (1 - o.E * p / 10), th = u * o.Lt / R;
    return [side * R * Math.sin(th), o.R0 - R * (1 - Math.cos(th)), R, th];
  },
  end: function (p, side) { return this.arcPt(p, side, 1); },
  pin: function (psi, up) {                                                         // the sector's high pin (up 1) or low pin (up -1)
    var o = this.o, a = up > 0 ? o.A1 : -o.A2;
    return [o.Q[0] - a * Math.sin(psi), o.Q[1] + a * Math.cos(psi)];
  },
  solve: function (p) {                                                             // sector angle that keeps the left link its length
    var E = this.end(p, -1), lo = -.3, hi = 1, m;
    for (var k = 0; k < 50; k++) { m = (lo + hi) / 2; if (this.dist(this.pin(m, 1), E) < this.o.l1) hi = m; else lo = m; }
    return lo;
  },

  step: function (c, dt, S) {
    var o = this.o, me = this;
    if (o.p === null) o.p = S.controls.p;
    if (S.playing) {                                        // the pressure rises and falls
      o.t = (o.t || 0) + dt;
      var aim = 5 - 4.8 * Math.cos(o.t * .6);
      o.p += (aim - o.p) * Math.min(1, dt * 2);
      S.setControl("p", Math.round(o.p * 10) / 10);
    } else o.p = S.controls.p;
    var p = o.p, key = p.toFixed(3);
    if (key === o.key) return;
    o.key = key;
    // tube: flat section that rounds out a little as the pressure rises
    var pos = o.tube.geometry.attributes.position, NS = o.NS, NR = o.NR, ar = 2.6 + .7 * p / 10, az = 6 - .6 * p / 10, i, j;
    for (i = 0; i < NS; i++) {
      var s = -1 + 2 * i / (NS - 1), side = s < 0 ? -1 : 1, q = this.arcPt(p, side, Math.abs(s)), cx = 0, cy = o.R0 - q[2];
      var nx = cx - q[0], ny = cy - q[1], nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      for (j = 0; j < NR; j++) {
        var f = 2 * Math.PI * j / NR, rc = Math.cos(f) * ar;
        pos.setXYZ(i * NR + j, q[0] + nx * rc, q[1] + ny * rc, Math.sin(f) * az);
      }
    }
    pos.needsUpdate = true; o.tube.geometry.computeVertexNormals();
    var psi = this.solve(p), L = this.end(p, -1), R = this.end(p, 1), U = this.pin(psi, 1), D = this.pin(psi, -1);
    o.endPins[0].position.set(L[0], L[1], 3.5); o.endPins[1].position.set(R[0], R[1], 3.5);
    o.links[0].span(L[0], L[1], 7, U[0], U[1], 7);
    o.links[1].span(R[0], R[1], 7, D[0], D[1], 7);
    o.sector.rotation.z = psi;
    o.pinion.rotation.z = o.base - o.RATIO * psi;
    S.set("p", p.toFixed(1) + " bar");
    S.set("a", Math.round(o.RATIO * psi * 180 / Math.PI) + "°");
  }
});
