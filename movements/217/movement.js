/* Nos. 217 and 218 are two halves of one machine, so both pages build the whole of it from the shared function below.
   No. 218's file loads this one and calls window.M507WoolComb with its own wording, views and starting moment. */
(function () {
  var D = Math.PI / 180, TP = 2 * Math.PI;
  function rot(x, y, a) { var c = Math.cos(a), s = Math.sin(a); return [c * x - s * y, s * x + c * y]; }
  function wrap(a) { return a - TP * Math.floor((a + Math.PI) / TP); }

  // Sizes. The roller shaft is at the origin. All angles in radians.
  var K = { rmin: 33, L: 45, bC: 64 * D, W: 7, RC: 108, N: 8, RF: 36, ND: 5, FL: 3 * D, QR: 45, QA: 68 * D, NA: 115 * D,
    ER: 55, EA: 30 * D, rE: 2.5, PR: 58, lift: 1.5 };
  (function () {
    // The lever swings a quarter turn between the dimple (stud nearest the cam centre) and the point (furthest). The
    // cam centre sits where both ends of that swing land exactly on the heart's smallest and largest radius.
    var b1 = K.bC - 45 * D;
    K.a = K.L * Math.cos(b1) + Math.sqrt(Math.pow(K.L * Math.cos(b1), 2) - (K.L * K.L - K.rmin * K.rmin));
    K.rmax = Math.sqrt(K.a * K.a + K.L * K.L - 2 * K.a * K.L * Math.cos(K.bC + 45 * D));
    K.k = (K.rmax - K.rmin) / Math.PI;
    K.ox = K.a * Math.cos(-90 * D + K.bC); K.oy = K.a * Math.sin(-90 * D + K.bC);      // cam centre, below right of the roller
    K.pitch = TP / K.N; K.root = K.RF - K.ND;
    K.Q0 = [K.QR * Math.cos(K.QA), K.QR * Math.sin(K.QA)];                            // catch pivot on the lever
    K.N0 = [K.root * Math.cos(K.NA), K.root * Math.sin(K.NA)];                         // catch nose, seated
    K.E0 = [K.ER * Math.cos(K.EA), K.ER * Math.sin(K.EA)];                             // pin the lifting piece strikes
    var ae = [0, -K.L]; ae = rot(ae[0], ae[1], -45 * D);
    K.thE = Math.atan2(ae[1] - K.oy, ae[0] - K.ox) - Math.PI;                         // cam angle when the stud is at the point
  })();

  var G = {
    stud: function (l) { return rot(0, -K.L, l); },
    // lever angle (0 as drawn in No. 218, + towards the cam centre) that puts the stud on the groove's centre line
    lever: function (th) {
      function f(l) { var s = G.stud(l), dx = s[0] - K.ox, dy = s[1] - K.oy; return Math.hypot(dx, dy) - (K.rmin + K.k * Math.abs(wrap(Math.atan2(dy, dx) - th))); }
      var lo = -46 * D, hi = 46 * D, flo = f(lo), i, m, fm;
      for (i = 0; i < 50; i++) { m = (lo + hi) / 2; fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; }
      return (lo + hi) / 2;
    },
    // a point of the catch (given seated, lever at 0) for lever angle l and lift g (the catch turns back by g about its pivot)
    cp: function (p, l, g) { var q = rot(K.Q0[0], K.Q0[1], l), v = rot(p[0] - K.Q0[0], p[1] - K.Q0[1], l - g); return [q[0] + v[0], q[1] + v[1]]; },
    rN: function (l, g) { var n = G.cp(K.N0, l, g); return Math.hypot(n[0], n[1]); },
    gForR: function (l, r) { var lo = -.4, hi = .8, i, m; for (i = 0; i < 40; i++) { m = (lo + hi) / 2; if (G.rN(l, m) < r) lo = m; else hi = m; } return (lo + hi) / 2; },
    // rim of the notch wheel at angle u from a notch: a narrow V notch at every multiple of the pitch
    rimAt: function (u) { var f = Math.abs(u / K.pitch - Math.round(u / K.pitch)) * K.pitch; return f >= K.FL ? K.RF : K.root + K.ND * f / K.FL; },
    flankU: function (r) { return Math.max(0, Math.min(K.FL, (r - K.root) / K.ND * K.FL)); },
    // how far the lifting piece holds the nose out, s degrees of cam turn after the stud reaches the point
    S: [-7, -1, 6, 12],
    rt: function (s) {
      var S = G.S, top = K.RF + K.lift;
      if (s < S[0] || s > S[3]) return 0;
      if (s < S[1]) return K.root - 2 + (top + 2 - K.root) * (s - S[0]) / (S[1] - S[0]);
      if (s < S[2]) return top;
      return top - 2 * (s - S[2]) / (S[3] - S[2]);
    },
    // Outline of the lifting piece on the cam face, in the cam's own frame: for each ray from the cam centre, the lowest
    // point the pin reaches while it is held at the lift above. So the pin touches it where the lift is set and never cuts it.
    lugOutline: function () {
      var path = [], s, out = [], a, i;
      for (s = G.S[0]; s <= G.S[3] + 1e-9; s += .25) {
        var th = K.thE - s * D, l = G.lever(th), e = G.cp(K.E0, l, G.gForR(l, G.rt(s)));
        path.push(rot(e[0] - K.ox, e[1] - K.oy, -th));
      }
      var angs = path.map(function (p) { return wrap(Math.atan2(p[1], p[0]) - Math.PI); });
      var lo = Math.min.apply(null, angs) - .2, hi = Math.max.apply(null, angs) + .2;
      for (a = lo; a <= hi; a += .004) {
        var ux = Math.cos(a + Math.PI), uy = Math.sin(a + Math.PI), m = 1e9;
        for (i = 0; i < path.length; i++) {
          var c = path[i], pr = c[0] * ux + c[1] * uy, cr = c[0] * uy - c[1] * ux;
          if (Math.abs(cr) < K.rE && pr > 0) m = Math.min(m, pr - Math.sqrt(K.rE * K.rE - cr * cr));
        }
        if (m < 1e8) out.push([m * ux, m * uy]);
      }
      return out;
    }
  };

  // Machine state: s is the cam's turn in degrees since the stud last reached the point; w the notch wheel's angle.
  function newState() {
    var s = 180, l = G.lever(K.thE - s * D), n = G.cp(K.N0, l, 0);
    return { s: s, l: l, g: 0, w: Math.atan2(n[1], n[0]), inN: true, rn: K.root, wRef: null, phase: "Forward", dl: 0 };
  }
  function advance(st, ds) {
    var steps = Math.max(1, Math.ceil(Math.abs(ds) / .25)), i;
    for (i = 0; i < steps; i++) {
      st.s += ds / steps;
      var th = K.thE - st.s * D, lp = st.l, l = G.lever(th), ss = wrap(st.s * D) / D, rl = G.rt(ss), r, n, an, j;
      st.l = l;
      if (st.inN) {
        // in a notch: the catch's spring keeps the nose as low as the notch lets it; it never climbs a side by itself,
        // so a side it presses on is pushed, and the wheel turns with the lever
        n = G.cp(K.N0, l, st.g);
        r = Math.max(rl, K.root, Math.min(st.rn, G.rimAt(Math.atan2(n[1], n[0]) - st.w)));
        st.g = G.gForR(l, r); n = G.cp(K.N0, l, st.g); an = Math.atan2(n[1], n[0]);
        var u = an - st.w, c = Math.round(u / K.pitch) * K.pitch, fu = G.flankU(r);
        st.w = an - Math.max(c - fu, Math.min(c + fu, u)); st.rn = r;
        if (r >= K.RF - 1e-6) st.inN = false;
      } else {
        // lifted or riding on the plain rim: the wheel stands still
        r = Math.max(rl, K.root);
        for (j = 0; j < 6; j++) { st.g = G.gForR(l, r); n = G.cp(K.N0, l, st.g); r = Math.max(rl, G.rimAt(Math.atan2(n[1], n[0]) - st.w)); }
        st.g = G.gForR(l, r); st.rn = r;
        if (r < K.RF - 1e-6) { st.inN = true; st.wRef = st.w; }
      }
      if (l !== lp) st.dl = l - lp;
      st.phase = !st.inN ? "Resting" : st.dl > 0 ? "Back" : "Forward";
    }
  }

  window.M507WoolComb = function (page) {
    return {
      number: page.number, title: page.title, lede: page.lede, alt: page.alt, how: page.how, note: page.note,
      parts: page.parts,
      readouts: [{ id: "roll", label: "Roller" }, { id: "phase", label: "Now" }],
      views: page.views, target: page.target,
      opacity: page.opacity, distance: page.distance,

      build: function (c) {
        var T = c.THREE, P = c.P, scene = c.scene;
        var o = this.o = { st: newState() };
        // run from the dimple through one whole cycle, then on to this page's opening moment
        var s0 = page.start(K, G); while (s0 < 540) s0 += 360;
        advance(o.st, s0 - o.st.s);

        function shape(pts) { var sh = new T.Shape(); pts.forEach(function (p, i) { if (i) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); }); return sh; }
        function ext(sh, depth, m, z, parent) { return P.at(P.mesh(new T.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 64 }), m), 0, 0, z, parent); }

        // Layers along z: cam z -16..0 with the groove floor at -6, lifting piece z 0..5; notch wheel z 8..14;
        // lever z 16..22; catch z 24..29; roller z 23..60; front strut z 70..80; back post z -36..-26.

        // cam (grooved heart): base z -16..-6, the layer with the groove z -6..0, island z -6..0
        var mc = c.mat("cam");
        o.cam = new T.Group(); o.cam.position.set(K.ox, K.oy, 0); scene.add(o.cam);
        var outerW = P.heartCurve({ rmin: K.rmin, rmax: K.rmax, offset: K.W }), innerW = P.heartCurve({ rmin: K.rmin, rmax: K.rmax, offset: -K.W });
        var disc = new T.Shape(); disc.absarc(0, 0, K.RC, 0, TP, false);
        ext(disc, 10, mc, -16, o.cam);
        var top = new T.Shape(); top.absarc(0, 0, K.RC, 0, TP, false);
        var hole = new T.Path(); outerW.slice().reverse().forEach(function (p, i) { if (i) hole.lineTo(p[0], p[1]); else hole.moveTo(p[0], p[1]); });
        top.holes.push(hole);
        ext(top, 6, mc, -6, o.cam);
        ext(shape(innerW), 6, mc, -6, o.cam);
        var fo = P.heartCurve({ rmin: K.rmin, rmax: K.rmax, offset: K.W - .5 }), fi = P.heartCurve({ rmin: K.rmin, rmax: K.rmax, offset: -(K.W - .5) });
        var floor = shape(fo), fh = new T.Path(); fi.slice().reverse().forEach(function (p, i) { if (i) fh.lineTo(p[0], p[1]); else fh.moveTo(p[0], p[1]); });
        floor.holes.push(fh);
        ext(floor, .6, c.mat("cam", "dark"), -5.7, o.cam);                       // dark strip on the groove floor z -5.7..-5.1
        [[K.W, K.W + 1.5], [-K.W - 1.5, -K.W]].forEach(function (b) {          // pale rims along both edges of the groove z 0..1
          var ro = P.heartCurve({ rmin: K.rmin, rmax: K.rmax, offset: b[1] }), ri = P.heartCurve({ rmin: K.rmin, rmax: K.rmax, offset: b[0] });
          var rs = shape(ro), rh = new T.Path(); ri.slice().reverse().forEach(function (p, i) { if (i) rh.lineTo(p[0], p[1]); else rh.moveTo(p[0], p[1]); });
          rs.holes.push(rh); ext(rs, 1, c.mat("cam", "light"), 0, o.cam);
        });
        P.at(P.cylZ(10, 3, mc), 0, 0, 1.5, o.cam);                                // hub z 0..3 on the island
        P.at(P.cylZ(2.5, 1, c.mat("cam", "dark")), 5, 0, 3.5, o.cam);            // dark dot z 3..4 on the hub
        var lug = G.lugOutline(), lugIn = lug.map(function (p) { var r = Math.hypot(p[0], p[1]), q = Math.max(14, r - 6); return [p[0] * q / r, p[1] * q / r]; });
        ext(shape(lug.concat(lugIn.slice().reverse())), 5, c.mat("cam", "light"), 0, o.cam);   // lifting piece z 0..5 on the island
        P.at(P.cylZ(6, 10, mc), 0, 0, -21, o.cam);                                // cam shaft z -26..-16, from the back post to the cam

        // lever, turning loose on the roller shaft: hub z 15.5..22.5, arms z 16..22, stud z -4.5..16 (groove floor -6), passing outside the wheel
        var ml = c.mat("lever");
        o.lever = new T.Group(); scene.add(o.lever);
        var lo = P.armPlate({ length: K.L, r0: 8, r1: 7, thick: 6, material: ml }); lo.rotation.z = -Math.PI / 2; P.at(lo, 0, 0, 19, o.lever);
        var up = P.armPlate({ length: K.PR, r0: 8, r1: 5, thick: 6, material: ml }); up.rotation.z = K.QA; P.at(up, 0, 0, 19, o.lever);
        P.at(P.cylZ(9, 7, ml), 0, 0, 19, o.lever);
        P.at(P.cylZ(K.W - .6, 20.5, ml), 0, -K.L, 5.75, o.lever);                 // stud in the groove
        P.at(P.cylZ(2.5, 7.5, c.mat("lever", "dark")), K.Q0[0], K.Q0[1], 25.75, o.lever);    // catch pivot pin z 22..29.5
        P.at(P.cylZ(4, 1, c.mat("lever", "dark")), K.Q0[0], K.Q0[1], 30, o.lever);      // its head z 29.5..30.5, clear of the catch face
        var pp = [K.PR * Math.cos(K.QA), K.PR * Math.sin(K.QA)];
        P.at(P.cylZ(2.5, 7, ml), pp[0], pp[1], 25.5, o.lever);                    // spring post z 22..29

        // notch wheel and roller on the roller shaft: shaft z 7.5..69.5 (the strut boss's back face), wheel z 8..14, hub z 14..15,
        // roller z 23..60 in front of the lever
        var mw = c.mat("wheel");
        o.wheel = new T.Group(); scene.add(o.wheel);
        var ws = new T.Shape(), i;                                                 // round wheel with a narrow V notch at each multiple of the pitch
        for (i = 0; i < K.N; i++) {
          var a0 = i * K.pitch;
          if (i) ws.lineTo(K.RF * Math.cos(a0 - K.FL), K.RF * Math.sin(a0 - K.FL)); else ws.moveTo(K.RF * Math.cos(a0 - K.FL), K.RF * Math.sin(a0 - K.FL));
          ws.lineTo(K.root * Math.cos(a0), K.root * Math.sin(a0));
          ws.lineTo(K.RF * Math.cos(a0 + K.FL), K.RF * Math.sin(a0 + K.FL));
          ws.absarc(0, 0, K.RF, a0 + K.FL, a0 + K.pitch - K.FL, false);
        }
        ext(ws, 6, mw, 8, o.wheel);                                                // wheel z 8..14
        P.at(P.cylZ(4.5, 62, mw), 0, 0, 38.5, o.wheel);
        P.at(P.cylZ(9, 1, mw), 0, 0, 14.5, o.wheel);                              // hub z 14..15, 0.5 clear of the lever hub
        P.at(P.cylZ(12, 37, mw), 0, 0, 41.5, o.wheel);                            // roller z 23..60, 0.5 clear of the lever hub
        P.at(P.box(2, 1, 35, c.mat("wheel", "dark")), 0, 13, 41.5, o.wheel);       // dark line along the roller y 12.5..13.5, 0.5 off its surface

        // catch: drawn seated with the lever as in No. 218, turning about its pivot
        var mk = c.mat("catch");
        o.catchG = new T.Group(); scene.add(o.catchG);
        var cg = new T.Group(); cg.position.set(-K.Q0[0], -K.Q0[1], 0); o.catchG.add(cg);
        var band = new T.Shape(); band.absarc(0, 0, 44, 62 * D, 119 * D, false); band.absarc(0, 0, 37.5, 119 * D, 62 * D, true);
        ext(band, 5, mk, 24, cg);                                                  // band over the rim z 24..29
        var dq = [K.E0[0] - K.Q0[0], K.E0[1] - K.Q0[1]];
        var tail = P.armPlate({ length: Math.hypot(dq[0], dq[1]), r0: 6, r1: 5, thick: 4, material: mk });
        tail.rotation.z = Math.atan2(dq[1], dq[0]); P.at(tail, K.Q0[0], K.Q0[1], 26.5, cg);   // tail to the pin z 24.5..28.5
        var na = K.NA, nose = [[K.root, 0], [K.RF, -1.1], [39.5, -2.4], [39.5, 2.4], [K.RF, 1.1]].map(function (p) { return [p[0] * Math.cos(na) - p[1] * Math.sin(na), p[0] * Math.sin(na) + p[1] * Math.cos(na)]; });
        ext(shape(nose), 20, mk, 8.5, cg);                                         // nose z 8.5..28.5, reaching back into the wheel's notches
        P.at(P.cylZ(K.rE, 22.5, mk), K.E0[0], K.E0[1], 13.25, cg);                // pin z 2..24.5, down to the lifting piece, clear of the groove rims
        var gk = [45 * Math.cos(92 * D), 45 * Math.sin(92 * D)];
        P.at(P.cylZ(3.2, 4, mk), gk[0], gk[1], 26.5, cg);                          // knob on top z 24.5..28.5, the spring's seat
        o.gk = gk; o.pp = pp;
        o.spring = P.spring({ radius: 2.6, wire: .7, turns: 6, length: 20, material: c.mat("spring") });
        o.springG = new T.Group(); scene.add(o.springG); P.at(o.spring, 0, 0, 0, o.springG);

        // supports (edges): base x -100..185, y -162..-150, z -40..84; back post x ox-12..ox+12, y -150..oy+14, z -36..-26,
        // standing on the base top y -150 (the cam's lowest edge is y oy-108 = -139.6). In front, z 70..80: a post
        // x -94..-80, y -150..-20 on the base, and an arm from its right face (x -80, y -35..-23) up to a round boss (radius 10)
        // round the roller shaft, which ends on the boss's back face z 69.5. The arm points down and to the left, the one
        // direction the lever, the catch and the spring never sweep.
        P.at(P.box(285, 12, 124, c.fixed), 42.5, -156, 22, scene);
        var bh = K.oy + 14 + 150; P.at(P.box(24, bh, 10, c.fixed), K.ox, -150 + bh / 2, -31, scene);
        P.at(P.box(14, 130, 10, c.fixed), -87, -85, 75, scene);
        ext(shape([[-80, -35], [-80, -23], [0, 6], [0, -6]]), 10, c.fixed, 70, scene);
        P.at(P.cylZ(10, 11, c.fixed), 0, 0, 75, scene);                          // boss z 69.5..80.5, proud of the arm faces
        this.place();
      },

      place: function () {
        var o = this.o, st = o.st, th = K.thE - st.s * D;
        o.cam.rotation.z = th;
        o.lever.rotation.z = st.l;
        o.wheel.rotation.z = st.w;
        var q = rot(K.Q0[0], K.Q0[1], st.l);
        o.catchG.position.set(q[0], q[1], 0); o.catchG.rotation.z = st.l - st.g;
        var a = G.cp(o.gk, st.l, st.g), b = rot(o.pp[0], o.pp[1], st.l), dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
        var r0 = 3.2;                                                               // spring from the knob's edge to the post's edge
        o.springG.position.set(a[0] + dx / len * r0, a[1] + dy / len * r0, 26.5);
        o.springG.rotation.z = Math.atan2(dy, dx);
        o.spring.setLength(len - r0 - 2.5);
      },

      step: function (c, dt, S) {
        var o = this.o, st = o.st;
        advance(st, S.w * dt / D);
        this.place();
        var t = st.wRef === null ? 0 : Math.round(-(st.w - st.wRef) / D);
        S.set("roll", (t > 0 ? "+" : t < 0 ? "−" : "") + Math.abs(t) + "°");
        S.set("phase", st.phase);
      }
    };
  };
  window.M507WoolComb.K = K; window.M507WoolComb.G = G; window.M507WoolComb.newState = newState; window.M507WoolComb.advance = advance;

  var parts = function (camNote) {
    return [
      { key: "cam", color: "#5E7387", name: "Grooved cam", note: camNote },
      { key: "lever", color: "#D9B13B", name: "Lever", note: "Swings loose on the roller shaft. A stud on its lower end runs in the groove, and the catch hangs from its upper end." },
      { key: "catch", color: "#C2503F", name: "Catch", note: "A hooked piece on the top of the lever. Its nose drops into the notches of the wheel. Watch it lift and fall." },
      { key: "wheel", color: "#C8873A", name: "Notch wheel and roller", note: "Fixed to the roller. It turns only while the catch sits in one of its notches." },
      { key: "spring", color: "#4FA58A", name: "Spring", note: "Presses the catch down, so its nose stays on the wheel." }
    ];
  };
  window.M507WoolComb.parts = parts;

  M507.define(window.M507WoolComb({
    number: 217,
    title: "Wool-comb roller cam",
    lede: "A disc with a heart-shaped groove in its face drives the roller of a wool-combing machine. Each turn moves the roller back a little, then forward twice as far, then holds it still. So the combed wool is fed out in steps.",
    alt: "A round disc with a heart-shaped groove cut in its face, the point of the heart at the top and a small dip at the bottom. A stud on a lever rides in the groove. Above and to the left, in front of the disc, a notched wheel with a hooked catch on top.",
    parts: parts("A disc with a groove shaped like a heart. The groove swings the lever. A pale raised piece near the middle lifts the catch once each turn."),
    how: [
      "The disc turns at a steady speed. A stud on the end of a lever sits in its groove. Where the groove comes closer to the centre, the stud is pulled in. Where it goes further out, the stud is pushed out. So the lever swings to and fro once each turn.",
      "Follow the stud round the heart. From the left side to the dip at the bottom, the groove moves in, so the lever swings back a little. From the dip round to the point at the top, it moves out, twice as far. A catch on the lever drives a notched wheel and the roller with it. At the point, a raised piece on the disc lifts the catch out of its notch. From the point back to the left side, the lever swings back with the catch sliding over the rim, so the roller rests.",
      "Watch the Now reading and the stud in the groove together. Back, Forward and Resting each belong to one stretch of the heart. Then pick the cam and watch the raised piece pass under the catch's pin."
    ],
    note: "This model is rebuilt from Brown's drawing and description. Brown shows the cam and the lever on two separate drawings, so how they sit together was made up. The cam is placed behind the lever, with its centre below and to the right of the roller. Brown puts the lifting projection on the back of the cam's wheel; here it is a raised piece on the front face, shaped so the catch lifts and falls at the right moments. The pin it strikes, the spring on the catch, the roller, the shafts and the stands were made up. Brown says the roller goes back a third of a turn and forward two thirds. With as many notches as his drawing shows, the lever cannot swing that far, so here it goes back one notch and forward two, which keeps his one to two share.",
    views: { "3d": [150, 15, 560], front: [65, -32, 400], side: [600, 0, 40] },
    target: [55, -28, 0], distance: [250, 1800],
    start: function (K) { return ((K.thE + 90 * D) / D % 360 + 360) % 360; }        // heart upright, its point at the top, as drawn
  }));
})();
