(function () {
  // Layout, front view (Y up, discs in the XY plane). Stud wheel on the left turns clockwise in steps. The driving wheel
  // on the right turns anticlockwise all the time and overlaps the stud wheel in front. On its back face stand a rim with
  // an opening and an arm (the tappet) that points at the middle of the opening.
  var PI = Math.PI;
  var AX = -75, RA = 85, RHO = 72, RS = 4, CX = 75, RC = 92, W = 5, CD = RS + W, RIM = 5, SAMPLES = 2880;

  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function segDist(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function polyDist(p, poly) {                                // signed: negative inside
    var d = 1e9, inside = false, i, j;
    for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      d = Math.min(d, segDist(p, poly[j], poly[i]));
      if ((poly[i][1] > p[1]) !== (poly[j][1] > p[1]) && p[0] < (poly[j][0] - poly[i][0]) * (p[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) inside = !inside;
    }
    return inside ? -d : d;
  }

  // All the geometry and motion for one stud count, worked out from contact.
  function kin(N) {
    // A resting stud sits a little inside the arm's reach, so the flat side of the arm strikes it. The stud leaves off the
    // round tip one stud spacing later. ain + ax = one spacing; ax sets the reach of the arm.
    var al = PI / N, ain = 0.8 * al, ax = 2 * al - ain, d = CX - AX, k;
    var Rr = Math.sqrt(RHO * RHO + d * d - 2 * RHO * d * Math.cos(ax)), L = Rr - CD;
    function stud(b) { return [AX + RHO * Math.cos(b), RHO * Math.sin(b)]; }
    function phiC(b) {                                        // arm angle at which it touches a stud at angle b
      var s = stud(b), x = s[0] - CX, y = s[1], r = Math.hypot(x, y), psi = Math.atan2(y, x);
      if (psi < 0) psi += 2 * PI;
      if (Math.sqrt(r * r - CD * CD) <= L) return psi - Math.asin(CD / r);
      return psi - Math.acos(Math.min(1, (L * L + r * r - CD * CD) / (2 * L * r)));
    }
    var bIn = ain, bOut = -ax, phE = phiC(bIn), phX = phiC(bOut), span = phX - phE;
    function beta(ph) { var lo = bOut, hi = bIn, i, m; for (i = 0; i < 40; i++) { m = (lo + hi) / 2; if (phiC(m) > ph) lo = m; else hi = m; } return (lo + hi) / 2; }
    function thetaLocal(q) { return q <= 0 ? 0 : q >= span ? 2 * al : bIn - beta(phE + q); }
    // rim: its outside just touches the resting stud that is waiting to be struck
    var s0 = stud(bIn), Ro = Math.hypot(s0[0] - CX, s0[1]) - RS, Ri = Ro - RIM;
    // opening: wide enough for the stud that passes through it, found by following the push
    var om = 0, j;
    for (j = 0; j <= 400; j++) {
      var q = span * j / 400, ph = phE + q, sp = stud(bIn - thetaLocal(q)), r = Math.hypot(sp[0] - CX, sp[1]);
      if (r - RS < Ro && r + RS > Ri) { var rel = Math.atan2(sp[1], sp[0] - CX) - ph; rel = Math.atan2(Math.sin(rel), Math.cos(rel)); om = Math.max(om, Math.abs(rel) + Math.asin(Math.min(1, RS / Math.max(r, Ri)))); }
    }
    om += 0.03;
    // arm outline, local: along +X, flat pushing face at y = +W, round tip, back edge widening toward the hub
    var tap = [[-10, W], [L, W]];
    for (k = 1; k < 12; k++) tap.push([L + W * Math.sin(k * PI / 12), W * Math.cos(k * PI / 12)]);
    tap.push([L, -W], [0, -W - 7], [-10, -W - 7]);
    function rimDist(p, ph) {                                 // distance from a world point to the rim (0 = touching)
      var x = p[0] - CX, y = p[1], r = Math.hypot(x, y), rel = Math.atan2(y, x) - ph;
      rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      if (Math.abs(rel) >= om) return Math.max(Ri - r, r - Ro, 0);
      var e1 = rot([Ri, 0], ph + om), e2 = rot([Ro, 0], ph + om), f1 = rot([Ri, 0], ph - om), f2 = rot([Ro, 0], ph - om), q2 = [x, y];
      return Math.min(segDist(q2, e1, e2), segDist(q2, f1, f2));
    }
    return { N: N, al: al, L: L, phE: phE, span: span, tap: tap, Ro: Ro, Ri: Ri, om: om, bIn: bIn, stud: stud, thetaLocal: thetaLocal, rimDist: rimDist };
  }
  function lookup(K, a) {                                     // state at driver turn a, counted from the drawn position
    var b = a + PI - K.phE, n = Math.floor(b / (2 * PI)), q = b - n * 2 * PI;   // drawn position: arm points straight at the stud wheel
    return { phi: PI + a, theta: -(n * 2 * K.al + K.thetaLocal(q)), turns: Math.floor(a / (2 * PI)), steps: n + (q >= K.span ? 1 : 0) };
  }

  M507.define({
    number: 70,
    title: "Tappet and studs with a locking rim",
    lede: "A wheel that turns all the time moves a second wheel on by one small step in each turn. Between steps a rim on the driving wheel locks the second wheel, so it cannot drift. Counters use steps like this.",
    alt: "Two discs on an upright plate. The right disc sits in front of the left one and overlaps it. The right disc is see-through, showing a raised rim and a short arm on its back face. The left disc has a ring of short studs, and one stud sits against the outside of the rim.",
    parts: [
      { key: "drive", color: "#5E7387", name: "Driving wheel", note: "It turns all the time. It is shown see-through so you can see the rim and the arm on its back face." },
      { key: "studs", color: "#C8873A", name: "Stud wheel", note: "A disc with short studs standing out of its face. It moves one stud at a time. Watch the red stud." },
      { key: "tappet", color: "#D9B13B", name: "Tappet arm", note: "Fixed to the back of the driving wheel. Once in each turn it catches a stud and pushes it along. An arm like this is called a tappet." },
      { key: "rim", color: "#4FA58A", name: "Rim", note: "A raised ring on the back of the driving wheel. A stud resting on its outside cannot move, so the stud wheel is locked. A gap in the rim lets a stud through." }
    ],
    controls: [{ id: "n", label: "Studs on the wheel", value: "10", options: [["8", "8"], ["10", "10"], ["12", "12"]] }],
    readouts: [{ id: "t", label: "Driver" }, { id: "s", label: "Stud wheel" }],
    views: { "3d": [-330, 170, 560], front: [0, -10, 640], side: [-640, -10, 0] },
    target: [0, -10, 0],
    opacity: function (key) { return key === "drive" ? 0.45 : 1; },
    how: [
      "The driving wheel turns all the time. Once in each turn the arm on its back sweeps past the stud wheel. It catches a stud and pushes it down. That moves the stud wheel on by exactly one stud.",
      "The rest of the time a stud rests against the outside of the rim. The stud wheel cannot turn, because that stud would have to go into the rim. The gap in the rim is right in front of the arm. So the stud wheel is only free while the arm is pushing. The stud goes in through the gap and comes out again through the same gap.",
      "So the stud wheel needs as many turns of the driver as it has studs to go round once. Try 8 studs, then 12, and watch how the rim gets bigger or smaller to fit."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown does not give sizes, so the sizes of the wheels, the rim, the gap and the arm, and the upright plate that holds them were made up. The driving wheel is see-through here, as Brown draws the rim in dotted lines. The choice of 8 or 12 studs was added to show what it changes.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { a: 0, N: null, sets: {}, K: {} };
      function extrude(sh, z0, z1, m) {
        var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 48 }); g.translate(0, 0, z0);
        return P.mesh(g, m);
      }
      function poly(pts) { var sh = new T.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath(); return sh; }
      [8, 10, 12].forEach(function (N) {
        var K = o.K[N] = kin(N), s = { root: new T.Group() };
        scene.add(s.root);
        // stud wheel: disc z -8..0, studs z 0..13 (stop short of the driving wheel's back face z 14), hub z 0..6, shaft z -30..-8
        s.A = P.studWheel({ radius: RA, width: 8, studs: N, ring: RHO, studRadius: RS, studLength: 13, start: K.bIn,
          material: c.mat("studs"), studMaterial: c.mat("studs", "dark"), markMaterial: c.mat("studs", "mark") });
        s.A.position.set(AX, 0, 0); s.root.add(s.A);
        P.at(P.cylZ(10, 6, c.mat("studs")), 0, 0, 3, s.A);                  // hub z 0..6
        P.at(P.cylZ(6, 22, c.mat("studs")), 0, 0, -19, s.A);                // shaft z -30..-8
        // driving wheel: plate z 14..22, hub z 22..26, shaft z -30..1 into the arm hub; rim and arm z 1..14 on its back
        s.C = new T.Group(); s.C.position.set(CX, 0, 0); s.root.add(s.C);
        P.at(P.cylZ(RC, 8, c.mat("drive")), 0, 0, 18, s.C);                 // plate z 14..22
        P.at(P.cylZ(10, 4, c.mat("drive")), 0, 0, 24, s.C);                 // hub z 22..26
        P.at(P.cylZ(6, 31, c.mat("drive")), 0, 0, -14.5, s.C);              // shaft z -30..1
        var rim = new T.Shape();
        rim.absarc(0, 0, K.Ro, K.om, 2 * PI - K.om, false); rim.absarc(0, 0, K.Ri, 2 * PI - K.om, K.om, true); rim.closePath();
        s.C.add(extrude(rim, 1, 14, c.mat("rim")));                          // rim z 1..14, against the plate back z 14
        s.C.add(extrude(poly(K.tap), 1, 14, c.mat("tappet")));               // arm z 1..14
        P.at(P.cylZ(10, 13, c.mat("tappet")), 0, 0, 7.5, s.C);               // arm hub z 1..14
        o.sets[N] = s;
      });
      P.at(P.box(380, 230, 10, c.fixed), 0, -10, -35, scene);                // plate x -190..190, y -125..105, z -40..-30; shafts end at z -30
      P.at(P.box(420, 12, 100, c.fixed), 0, -131, -30, scene);               // base y -137..-125, z -80..20; plate stands on y -125
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
