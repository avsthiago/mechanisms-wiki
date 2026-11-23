(function () {
  // Layout, front view (Y up, discs in the XY plane). Stud wheel on the left turns clockwise in steps. The driving wheel
  // on the right turns anticlockwise all the time and overlaps the stud wheel in front. On its back face stand a rim with
  // two gaps and an arm (the tappet). Three studs sit inside the rim: the upper and lower ones rest against its inner
  // face, and the arm's flat face strikes the middle one. That stud slides out along the arm and leaves off the round tip
  // exactly where the lower stud was, so the wheel moves on one stud spacing in each turn.
  var PI = Math.PI;
  var AX = -85, RA = 95, RHO = 80, RS = 4, CX = 65, W = 5, CD = RS + W, RIM = 14;

  function segDist(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function wrap(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }

  // All the geometry and motion for one stud count, worked out from contact.
  function kin(N) {
    var sp = 2 * PI / N;
    function stud(b) { return [AX + RHO * Math.cos(b), RHO * Math.sin(b)]; }
    function polar(p) { var x = p[0] - CX, y = p[1]; var a = Math.atan2(y, x); return [Math.hypot(x, y), a < 0 ? a + 2 * PI : a]; }
    // resting studs at +sp and -sp touch the inner face of the rim; the arm's round tip just reaches them, so the struck
    // stud leaves the tip exactly at -sp
    var d1 = polar(stud(sp))[0], Ri = d1 + RS, Ro = Ri + RIM, L = d1 - CD;
    var phE = polar(stud(sp))[1], phX = 2 * PI - phE;          // arm in line with the upper and with the lower resting stud
    function gap(b, ph) { return segDist(stud(b), [CX, 0], [CX + L * Math.cos(ph), L * Math.sin(ph)]) - CD; }
    function bAt(ph) {                                          // angle of the struck stud for arm angle ph
      if (ph <= phE) return 0;
      if (ph >= phX) return -sp;
      var bm = 0, gm = 1e9, i, b, g;
      for (i = 0; i <= 64; i++) { b = -sp + 2 * sp * i / 64; g = gap(b, ph); if (g < gm) { gm = g; bm = b; } }
      if (gm >= 0) return ph < PI ? 0 : -sp;
      var lo = -sp, hi = bm, m;                                 // lower edge of the arm's reach: the stud sits just ahead of it
      for (i = 0; i < 44; i++) { m = (lo + hi) / 2; if (gap(m, ph) >= 0) lo = m; else hi = m; }
      return Math.min(0, lo);
    }
    // gaps in the rim, as angles measured from the arm: wide enough for the entering and the leaving stud
    var ng = [[1e9, -1e9], [1e9, -1e9]], j, ph;
    for (j = 0; j <= 600; j++) {
      ph = phE + (phX - phE) * j / 600;
      var b = bAt(ph);
      [b + 2 * sp, b - sp].forEach(function (bb, q) {
        var pr = polar(stud(bb));
        if (pr[0] + RS > Ri && pr[0] - RS < Ro) {
          var rel = wrap(pr[1] - ph), w2 = Math.asin(Math.min(1, RS / Math.max(pr[0], Ri)));
          ng[q][0] = Math.min(ng[q][0], rel - w2); ng[q][1] = Math.max(ng[q][1], rel + w2);
        }
      });
    }
    ng.forEach(function (g) { g[0] -= 0.03; g[1] += 0.03; });
    function rimDist(p, ph) {                                  // distance from a world point to the rim (0 = touching or inside)
      var pr = polar(p), r = pr[0], rel = wrap(pr[1] - ph), q;
      for (q = 0; q < 2; q++) if (rel > ng[q][0] && rel < ng[q][1]) {
        return Math.min.apply(null, [ng[q][0], ng[q][1]].map(function (e) {
          return segDist([r * Math.cos(rel), r * Math.sin(rel)], [Ri * Math.cos(e), Ri * Math.sin(e)], [Ro * Math.cos(e), Ro * Math.sin(e)]);
        }));
      }
      return Math.max(Ri - r, r - Ro, 0);
    }
    return { N: N, sp: sp, L: L, Ri: Ri, Ro: Ro, phE: phE, phX: phX, ng: ng, stud: stud, bAt: bAt, gap: gap, rimDist: rimDist };
  }
  var START = PI - 0.2;                                       // drawn position: arm pointing at the stud wheel, about to strike
  function lookup(K, a) {                                     // state at driver turn a, counted from the drawn position
    var ph = START + a, n = Math.floor((ph - K.phE) / (2 * PI)), q = ph - n * 2 * PI;
    var b = K.bAt(q), done = q >= K.phX ? 1 : 0;
    return { phi: ph, theta: -(n * K.sp - b), turns: Math.floor(a / (2 * PI)), steps: n + done };
  }

  M507.define({
    number: 71,
    title: "Tappet and studs with an inner locking rim",
    lede: "A wheel that turns all the time moves a second wheel on by one small step in each turn. Between steps two studs rest against the inside of a rim on the driving wheel, so the second wheel cannot drift. Counters use steps like this.",
    alt: "Two discs on an upright plate. The right disc sits in front of the left one and overlaps it. The right disc is see-through, showing a raised ring with two gaps and a short arm on its back face. The left disc has a ring of short studs, and three of them sit inside the ring.",
    parts: [
      { key: "drive", color: "#5E7387", name: "Driving wheel", note: "It turns all the time. It is shown see-through so you can see the rim and the arm on its back face." },
      { key: "studs", color: "#C8873A", name: "Stud wheel", note: "A disc with short studs standing out of its face. It moves one stud at a time. Watch the red stud." },
      { key: "tappet", color: "#D9B13B", name: "Tappet arm", note: "Fixed to the back of the driving wheel. Once in each turn it strikes the middle stud and pushes it down. An arm like this is called a tappet." },
      { key: "rim", color: "#4FA58A", name: "Rim", note: "A raised ring on the back of the driving wheel. Two studs rest against its inside, so the stud wheel is locked. Two gaps in the rim let studs in and out." }
    ],
    controls: [{ id: "n", label: "Studs on the wheel", value: "10", options: [["8", "8"], ["10", "10"], ["12", "12"]] }],
    readouts: [{ id: "t", label: "Driver" }, { id: "s", label: "Stud wheel" }],
    views: { "3d": [-330, 170, 600], front: [0, 0, 700], side: [-700, 0, 0] },
    target: [0, 0, 0],
    opacity: function (key) { return key === "drive" ? 0.45 : 1; },
    how: [
      "The driving wheel turns all the time. Three studs sit inside its rim. Once in each turn the arm on its back strikes the middle one and pushes it down. The stud slides out along the arm and drops off its round tip. By then the stud wheel has moved on by exactly one stud.",
      "The rest of the time the upper and lower studs rest against the inside of the rim. The stud wheel cannot turn either way, because one of them would have to push out through the rim. The two gaps in the rim sit on each side of the arm. While the arm pushes, the lower stud leaves through one gap and a new stud comes in through the other.",
      "So the stud wheel needs as many turns of the driver as it has studs to go round once. Try 8 studs, then 12, and watch how the rim gets bigger or smaller to fit."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown does not give sizes, so the sizes of the wheels, the rim, the gaps and the arm, and the upright plate that holds them were made up. The driving wheel is see-through here, as Brown draws the rim in dotted lines. The arm has a round tip so it lets go of each stud gently. For a short time while a gap sweeps past a resting stud, the rim only holds the wheel one way. The choice of 8 or 12 studs was added to show what it changes.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { a: 0, N: null, sets: {}, K: {} };
      function extrude(sh, z0, z1, m) {
        var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 48 }); g.translate(0, 0, z0);
        return P.mesh(g, m);
      }
      [8, 10, 12].forEach(function (N) {
        var K = o.K[N] = kin(N), s = { root: new T.Group() };
        scene.add(s.root);
        // stud wheel: disc z -8..0, studs z 0..13 (stop short of the driving wheel's back face z 14), hub z 0..6, shaft z -30..-8
        s.A = P.studWheel({ radius: RA, width: 8, studs: N, ring: RHO, studRadius: RS, studLength: 13, start: 0,
          material: c.mat("studs"), studMaterial: c.mat("studs", "dark"), markMaterial: c.mat("studs", "mark") });
        s.A.position.set(AX, 0, 0); s.root.add(s.A);
        P.at(P.cylZ(10, 6, c.mat("studs")), 0, 0, 3, s.A);                  // hub z 0..6
        P.at(P.cylZ(6, 22, c.mat("studs")), 0, 0, -19, s.A);                // shaft z -30..-8
        // driving wheel: plate z 14..22, hub z 22..26, shaft z -30..1 into the arm hub; rim and arm z 1..14 on its back
        s.C = new T.Group(); s.C.position.set(CX, 0, 0); s.root.add(s.C);
        P.at(P.cylZ(K.Ro + 6, 8, c.mat("drive")), 0, 0, 18, s.C);             // plate z 14..22, a little wider than the rim
        P.at(P.cylZ(10, 4, c.mat("drive")), 0, 0, 24, s.C);                 // hub z 22..26
        P.at(P.cylZ(6, 31, c.mat("drive")), 0, 0, -14.5, s.C);              // shaft z -30..1, clear of the stud wheel's edge
        // rim in two pieces: the short one between the gaps, and the long one round the rest
        [[K.ng[1][1], K.ng[0][0] + 2 * PI], [K.ng[0][1], K.ng[1][0]]].forEach(function (r) {
          var sh = new T.Shape();
          sh.absarc(0, 0, K.Ro, r[0], r[1], false); sh.absarc(0, 0, K.Ri, r[1], r[0], true); sh.closePath();
          s.C.add(extrude(sh, 1, 14, c.mat("rim")));                         // rim z 1..14, against the plate back z 14
        });
        var tap = new T.Shape();                                             // arm along +X, width 2W, round tip centred at L
        tap.moveTo(0, -W); tap.lineTo(K.L, -W); tap.absarc(K.L, 0, W, -PI / 2, PI / 2, false); tap.lineTo(0, W); tap.closePath();
        s.C.add(extrude(tap, 1, 14, c.mat("tappet")));                       // arm z 1..14
        P.at(P.cylZ(10, 13, c.mat("tappet")), 0, 0, 7.5, s.C);               // arm hub z 1..14
        o.sets[N] = s;
      });
      P.at(P.box(420, 290, 10, c.fixed), 0, 0, -35, scene);                  // plate x -210..210, y -145..145, z -40..-30; shafts end at z -30
      P.at(P.box(460, 12, 100, c.fixed), 0, -151, -30, scene);               // base y -157..-145, z -80..20; plate stands on y -145
    },

    step: function (c, dt, S) {
      var o = this.o, N = +S.controls.n || 10, k;
      if (N !== o.N) { o.N = N; o.a = 0; for (k in o.sets) o.sets[k].root.visible = +k === N; }
      o.a += S.w * dt;
      var K = o.K[N], s = o.sets[N], st = lookup(K, o.a);
      s.C.rotation.z = st.phi;
      s.A.rotation.z = st.theta;
      S.set("t", st.turns + (st.turns === 1 ? " turn" : " turns"));
      S.set("s", st.steps + (st.steps === 1 ? " stud" : " studs"));
    },
    kin: kin, lookup: lookup
  });
})();
