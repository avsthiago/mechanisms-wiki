M507.define({
  number: 83,
  title: "Toothed arcs on a rocking shaft",
  lede: "A rod slides back and forth and rocks a shaft. Two toothed arcs on the shaft take turns to push a flat toothed wheel. So the wheel keeps turning one way, with only short pauses.",
  alt: "A wheel lies flat, with a ring of slanted teeth on its top face. Above it a shaft runs from front to back. A toothed arc hangs from the shaft at the front of the wheel and another at the back. A short lever stands up from the front end of the shaft, and a sloping rod joins it to a guide at the right.",
  parts: [
    { key: "rod", color: "#5E7387", name: "Sliding rod", note: "Slides to and fro through a guide that can tip on a pin. It rocks the lever at the front of the shaft." },
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A flat wheel with slanted teeth on its top face, called a ratchet. Watch the red stripe: it only ever turns one way." },
    { key: "arcs", color: "#D9B13B", name: "Toothed arcs", note: "Two arcs with slanted teeth, one over the front of the wheel and one over the back. Their teeth slope opposite ways. The one that is pushing turns red." },
    { key: "shaft", color: "#4FA58A", name: "Rocking shaft", note: "Rocks to and fro, carrying the lever and a holder for each arc. Each arc can slide up and down in its holder." },
    { key: "springs", color: "#8E7AA8", name: "Springs", note: "Press each arc down onto the wheel. They let an arc rise when it slides back over the teeth." }
  ],
  controls: [{ type: "range", id: "stroke", label: "Travel of the rod", min: 2, max: 30, step: 1, value: 20, unit: " mm",
    presets: [[2, "Tiny"], [8, "Short"], [26, "Long"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Rod speed", unit: " a min" },
  readouts: [{ id: "in", label: "Rod" }, { id: "out", label: "Wheel" }],
  views: { "3d": [620, 420, 900], front: [0, 110, 1050], side: [1050, 110, 0] },
  target: [0, 110, 0],
  how: [
    "The rod slides and rocks the shaft to and fro. Both arcs swing with it, so their lowest teeth move left and right over the wheel. The front arc sits over the front edge of the wheel and the back arc over the back edge.",
    "When the arcs swing right, the front arc's teeth catch the wheel's teeth and push the front edge right. When they swing left, the back arc catches and pushes the back edge left. Both pushes turn the wheel the same way. The arc that is not pushing rides up over the slanted teeth, and its springs press it back down.",
    "Watch which arc turns red, and watch the other one lift. Try Tiny. The arcs swing less than one tooth, so they never catch a new tooth and the wheel stops. Then try Short and Long, and compare how far the wheel turns."
  ],
  note: "This model is rebuilt from Brown's description and drawing. Brown draws only the front arc; the back one is added as he describes. The frame over the wheel, the guide for the rod, the holders that let each arc rise, the springs, the number of teeth and all the sizes were made up. An arc swings in a circle while the wheel's teeth lie flat, so the two sets of teeth cannot match perfectly. The arc's teeth were made a little narrower, a little shorter and spaced a little wider, so each arc drops right down into the teeth before it pushes. A real wheel would coast a little between pushes. Here it stops at once.",

  K: { RC: 145, D: 8, N: 36, BASE: 2, TRUNC: 1, LAND: 0.8, ALS: 1.03, YB: 224, LC: 97, GX: 190, GY: 270, CLR: 0.3, SEAT: 0.05, Z: 145, Z0: 142, Z1: 148, HALF: 0.576 },

  init: function (o) {
    var K = this.K;
    K.st = 2 * Math.PI / K.N; K.p = K.RC * K.st;
    K.RT = K.YB - K.BASE - K.TRUNC; K.DA = K.D + 0.5 - K.TRUNC;                             // arc tips stop short of the wheel's roots; its flats clear the wheel's tips
    K.al = 2 * Math.asin(K.Z * Math.tan(K.st / 2) / (K.RT - K.DA / 2)) * K.ALS;             // arc pitch: its faces line up with the wheel's on both sides of the contact
    K.g = Math.hypot(K.GX, K.GY - K.YB); K.phG = Math.atan2(K.GY - K.YB, K.GX); K.d0 = Math.hypot(K.GX, K.GY - K.YB - K.LC);
    o.psi = 0; o.b = 0; o.gam = o.gam0 = 0;
    o.arcs = [{ sg: 1, rev: false, h: 0, push: false }, { sg: -1, rev: true, h: 0, push: false }];
    var best = 1e9, i, g;
    for (i = 0; i < 80; i++) { g = i * K.st / 80; var hh = this.lift(o.arcs[0], 0, g); if (hh < best - 1e-6) { best = hh; o.gam = g; } }   // front arc sits down in the teeth
    this.phys(o, 0); o.gam0 = o.gam;
  },
  // rocking angle for a rod pulled x towards the guide
  beta: function (x) {
    var K = this.K, d = K.d0 - x;
    return K.phG + Math.acos((K.LC * K.LC + K.g * K.g - d * d) / (2 * K.LC * K.g)) - Math.PI / 2;
  },
  // height of the wheel's top at world (x, z), or -Infinity off the toothed ring
  wheelY: function (x, z, gam) {
    var K = this.K, r = Math.hypot(x, z);
    if (r < 125 || r > 160) return -Infinity;
    var f = (Math.atan2(-z, x) - gam) / K.st + 1e-9; f -= Math.floor(f);
    return K.BASE + K.D * (1 - f);
  },
  arcRim: function (a, rev) { var K = this.K, f = (rev ? -a : a) / K.al + 1e-9; f -= Math.floor(f); return K.RT - K.DA * Math.min(1, (1 - f) / K.LAND); },
  // how far an arc must slide up its holder (along its centre line) to clear the wheel's teeth: walk along the arc's
  // toothed edge (slopes, flats and steep faces) and find the deepest point below the wheel's top
  lift: function (A, b, gam, step) {
    var K = this.K, self = this, h = 0, it, zs = [A.sg * K.Z0, A.sg * K.Z, A.sg * K.Z1], sb = Math.sin(b), cb = Math.cos(b), dl = (step || 0.3) / K.RT;
    var l0 = -Math.PI / 2 - b - 0.3, l1 = -Math.PI / 2 - b + 0.3, m;
    function test(cx, cy, l, r) {
      var x = cx + r * Math.cos(l + b), y = cy + r * Math.sin(l + b), j, w;
      for (j = 0; j < 3; j++) { w = self.wheelY(x, zs[j], gam) - y; if (w > m) m = w; }
    }
    for (it = 0; it < 4; it++) {
      var cx = -h * sb, cy = K.YB + h * cb, l, k, q;
      m = -1e9;
      for (l = l0; l <= l1; l += dl) test(cx, cy, l, this.arcRim(l, A.rev));
      for (k = Math.ceil(l0 / K.al); k * K.al <= l1; k++) for (q = 0; q <= 8; q++) test(cx, cy, k * K.al, K.RT - K.DA * q / 8);
      if (m <= 1e-4) break;
      h += m / cb;
    }
    return h;
  },
  // x of an arc's steep face k where it crosses the band of the wheel's tooth faces (y 2..10): [smallest, largest], or null
  faceX: function (A, k, b, h) {
    var K = this.K, w = k * K.al + b, cx = -h * Math.sin(b), cy = K.YB + h * Math.cos(b), c = Math.cos(w), sn = Math.sin(w);
    var y0 = cy + K.RT * sn, y1 = cy + (K.RT - K.DA) * sn;                                      // tip end and root end of the face
    var lo = Math.max(K.BASE, Math.min(y0, y1)), hi = Math.min(K.BASE + K.D, Math.max(y0, y1));
    if (lo > hi) return null;
    var xa = cx + (lo - cy) * c / sn, xb = cx + (hi - cy) * c / sn;
    return [Math.min(xa, xb), Math.max(xa, xb)];
  },
  // the wheel turns only forward; each arc face that would cut into the wheel face in front of it pushes the wheel on
  phys: function (o, b) {
    var K = this.K, self = this, who = null, b0 = o.b;
    o.arcs.forEach(function (A) {
      if (A.h > K.SEAT) return;                                                         // a raised arc only brushes the tops of the faces and slips over them
      var s = A.sg, k, k0 = Math.ceil((-0.35 - b - Math.PI / 2) / K.al), k1 = Math.floor((0.35 - b - Math.PI / 2) / K.al), j, jc;
      for (k = k0; k <= k1; k++) {
        var lam = k * K.al; if (Math.abs(lam + Math.PI / 2) > K.HALF - 0.02) continue;      // only faces on the arc
        var old = self.faceX(A, k, b0, A.h), now = self.faceX(A, k, b, A.h);
        if (!old || !now) continue;
        // the wheel face just ahead of it (front: +x, back: -x): the one with the smallest gap, over the whole arc width
        jc = Math.round((-s * Math.PI / 2 - o.gam) / K.st); var best = null, bg = 0, tw, gap, X, g;
        for (j = jc - 4; j <= jc + 4; j++) {
          var th = j * K.st + o.gam;
          if (Math.abs(th + s * Math.PI / 2) > 0.6) continue;
          if (s > 0) { tw = Math.tan(th + Math.PI / 2); gap = tw * (tw >= 0 ? K.Z0 : K.Z1) - old[1]; }
          else { tw = Math.tan(Math.PI / 2 - th); gap = old[0] - tw * (tw >= 0 ? K.Z1 : K.Z0); }
          if (gap >= -0.01 && (best === null || gap < bg)) { best = j; bg = gap; }
        }
        if (best === null) continue;
        // keep the gap the faces had, up to CLR, so an arc dropping in just behind a face does not kick the wheel
        if (s > 0) { X = now[1] + Math.min(K.CLR, Math.max(0, bg)); g = Math.atan(X / (X >= 0 ? K.Z0 : K.Z1)) - Math.PI / 2 - best * K.st; }
        else { X = now[0] - Math.min(K.CLR, Math.max(0, bg)); g = Math.PI / 2 - Math.atan(X / (X >= 0 ? K.Z1 : K.Z0)) - best * K.st; }
        if (g > o.gam + 1e-12) { o.gam = g; who = A; }
      }
    });
    o.b = b;
    o.arcs.forEach(function (A) {
      A.h = self.lift(A, b, o.gam);
      if (A === who) A.push = true; else if (b !== b0) A.push = false;
    });
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, o = this.o = {};
    this.init(o);
    var mw = c.mat("wheel"), ms = c.mat("shaft"), mr = c.mat("rod"), dk = c.mat("shaft", "dark");

    // wheel: disc y -36..0, toothed ring on top (roots y 2, tips y 10), hub y -50..-36, shaft y -95..-50
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylY(160, 36, mw), 0, -18, 0, o.wheel);
    var ring = P.faceRatchet({ teeth: K.N, rIn: 125, rOut: 160, depth: K.D, base: K.BASE, reverse: true, material: mw });
    ring.rotation.x = -Math.PI / 2; o.wheel.add(ring);                                      // ring back on the disc top, y 0
    P.at(P.cylY(40, 14, mw), 0, -43, 0, o.wheel);
    P.at(P.cylY(10, 45, mw), 0, -72.5, 0, o.wheel);
    P.at(P.box(75, 1, 6, c.mat("wheel", "mark")), 82.5, 1, 0, o.wheel);                    // red stripe r 45..120, y 0.5..1.5, off the disc top

    // rocking shaft at (0, YB), along Z; it rests in the beam (z -12..12) and carries the lever and the two holders
    o.rock = new T.Group(); o.rock.position.set(0, K.YB, 0); scene.add(o.rock);
    P.at(P.cylZ(8, 156, ms), 0, 0, 90, o.rock);                                           // front part z 12..168
    P.at(P.cylZ(8, 145, ms), 0, 0, -84.5, o.rock);                                        // back part z -157..-12
    P.at(P.cylZ(12, 6, ms), 0, 0, -154, o.rock);                                          // back collar z -157..-151
    P.at(P.box(16, 97, 8, ms), 0, 48.5, 164, o.rock);                                     // lever y 0..97, z 160..168
    P.at(P.cylZ(14, 8, ms), 0, 0, 164, o.rock);
    P.at(P.cylZ(10, 8, ms), 0, K.LC, 164, o.rock);
    P.at(P.cylZ(3.5, 17, dk), 0, K.LC, 167.5, o.rock);                                     // lever pin z 160..176
    var ma = c.mat("arcs"), mk = c.mat("arcs", "mark"), msp = c.mat("springs");
    o.arcs.forEach(function (A) {
      var s = A.sg;
      P.at(P.cylZ(18, 12, ms), 0, 0, s * 145, o.rock);                                    // holder boss z 139..151
      P.at(P.box(68, 12, 12, ms), 0, -22, s * 145, o.rock);                               // cross bar x -34..34, y -28..-16, z 139..151
      P.at(P.box(5, 62, 6, ms), 7.5, -47, s * 154, o.rock);                               // guide rails x 5..10 and -10..-5, y -78..-16, z 151..157,
      P.at(P.box(5, 62, 6, ms), -7.5, -47, s * 154, o.rock);                              //   back on the cross bar's face; the slot between them is 10 wide
      P.at(P.box(20, 6, 6, ms), 0, -81, s * 154, o.rock);                                 // slot end y -84..-78
      P.at(P.box(4, 34, 6, ms), 0, -11, s * 154, o.rock);                                 // strip joining boss and rails, y -28..6
      A.slide = new T.Group(); o.rock.add(A.slide);
      A.plate = P.ratchetSector({ radius: K.RT, depth: K.DA, pitch: K.al, from: -Math.PI / 2 - K.HALF, to: -Math.PI / 2 + K.HALF,
        inner: 50, thick: 6, land: K.LAND, reverse: A.rev, windows: true, material: ma });
      P.at(A.plate, 0, 0, s * K.Z, A.slide);                                             // plate z 142..148, top edge y -50
      P.at(P.cylZ(5, 10, dk), 0, -44, s * 153, A.slide);                                  // pins in the slot, z 148..158
      P.at(P.cylZ(5, 10, dk), 0, -60, s * 153, A.slide);
      A.springs = [-22, 22].map(function (x) {
        var sp = P.spring({ radius: 5, wire: 1.3, turns: 6, length: 22, material: msp });
        sp.rotation.z = -Math.PI / 2; P.at(sp, x, -28, s * K.Z, o.rock);                  // from the cross bar (y -28) down to the plate top (y -50 + lift)
        return sp;
      });
    });
    o.ma = ma; o.mk = mk;

    // rod: eye on the lever pin, then through the swivel guide
    o.rod = P.rod(4, mr); scene.add(o.rod);
    o.eye = P.cylZ(8, 6, mr); scene.add(o.eye);                                            // z 169..175
    o.guide = new T.Group(); o.guide.position.set(K.GX, K.GY, 172); scene.add(o.guide);
    P.at(P.box(26, 18, 12, c.mat("rod", "dark")), 0, 0, 0, o.guide);                      // guide block z 166..178, the rod runs through it
    P.at(P.cylZ(4, 4, c.fixed), K.GX, K.GY, 164, scene);                                   // guide pin z 162..166
    P.at(P.box(16, 405, 12, c.fixed), K.GX, 87.5, 156, scene);                             // post x 182..198, y -115..290, z 150..162

    // supports
    P.at(P.box(520, 10, 400, c.fixed), 0, -120, 0, scene);                                // base y -125..-115
    P.at(P.cylY(22, 20, c.fixed), 0, -105, 0, scene);                                      // bearing y -115..-95; the wheel shaft ends on it
    P.at(P.box(20, 351, 24, c.fixed), 215, 60.5, 0, scene);                                // uprights x 205..225 and -225..-205, y -115..236, z -12..12
    P.at(P.box(20, 351, 24, c.fixed), -215, 60.5, 0, scene);
    P.at(P.box(410, 24, 24, c.fixed), 0, K.YB, 0, scene);                                  // beam x -205..205, y 212..236; the shaft parts end on its faces
  },

  step: function (c, dt, S) {
    var K = this.K, o = this.o, self = this, n = Math.max(1, Math.ceil(dt / .004)), i, X = S.controls.stroke;
    for (i = 1; i <= n; i++) { o.psi += S.w * dt / n; this.phys(o, this.beta(X * Math.sin(o.psi))); }
    var x = X * Math.sin(o.psi), b = o.b;
    o.rock.rotation.z = b;
    o.wheel.rotation.y = o.gam;
    o.arcs.forEach(function (A) {
      A.slide.position.y = A.h;
      A.plate.material = A.push ? o.mk : o.ma;
      A.springs.forEach(function (sp) { sp.setLength(22 - A.h); });
    });
    var px = -K.LC * Math.sin(b), py = K.YB + K.LC * Math.cos(b), dx = K.GX - px, dy = K.GY - py, L = Math.hypot(dx, dy);
    o.rod.span(px, py, 172, px + 300 * dx / L, py + 300 * dy / L, 172);
    o.eye.position.set(px, py, 172);
    o.guide.rotation.z = Math.atan2(dy, dx);
    var mm = Math.round(x);
    S.set("in", (mm > 0 ? "+" : mm < 0 ? "−" : "") + Math.abs(mm) + " mm");
    S.set("out", ((o.gam - o.gam0) / (2 * Math.PI)).toFixed(2) + " turns");
  }
});
