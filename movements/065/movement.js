(function () {
  // Layout, front view (Y up, discs in the XY plane). Driving disc on the left turns clockwise, stud wheel on the right
  // turns anticlockwise in steps. The stop lever pivots on a fixed pin below, between the two.
  var PI = Math.PI, D2R = PI / 180;
  var CX = -75, DX = 75, RC = 70, RD = 72, RHO = 60, RS = 5, W = 5, CD = RS + W;   // CD: tappet face to stud centre
  var PV = [0, -70], RN = 5, PSIN = -60 * D2R;              // lever pivot, nose radius, where the nose meets the disc
  var LEAD = 0.12, SAMPLES = 2880;                          // opening state: tappet just before it reaches a stud

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

  // All the geometry and motion for one stud count. Everything is worked out from contact, then stored per driver angle.
  function kin(N) {
    // A resting stud sits a little inside the arm's reach, so the flat side of the arm strikes it. The stud leaves off the
    // round tip one stud spacing later. ain + ax = one spacing; ax sets the reach of the arm.
    var al = PI / N, ain = 0.8 * al, ax = 2 * al - ain, d = DX - CX, k;
    var Rr = Math.sqrt(RHO * RHO + d * d - 2 * RHO * d * Math.cos(ax)), L = Rr - CD;
    function stud(b) { return [DX + RHO * Math.cos(b), RHO * Math.sin(b)]; }
    function phiC(b) {                                        // tappet angle at which it touches a stud at angle b
      var s = stud(b), x = s[0] - CX, y = s[1], r = Math.hypot(x, y), psi = Math.atan2(y, x);
      if (Math.sqrt(r * r - CD * CD) <= L) return psi + Math.asin(CD / r);            // on its flat side
      return psi + Math.acos(Math.min(1, (L * L + r * r - CD * CD) / (2 * L * r)));    // on its round tip
    }
    var bIn = PI - ain, bOut = PI + ax, phE = phiC(bIn), phX = phiC(bOut), span = phE - phX;
    function beta(ph) { var lo = bIn, hi = bOut, i, m; for (i = 0; i < 40; i++) { m = (lo + hi) / 2; if (phiC(m) > ph) lo = m; else hi = m; } return (lo + hi) / 2; }
    function thetaLocal(q) { return q < LEAD ? 0 : q > LEAD + span ? 2 * al : beta(phE + LEAD - q) - bIn; }

    // tappet outline, local: arm along +X, flat pushing face at y = -W, round tip, back edge widening toward the hub
    var tap = [[0, -W], [L, -W]];
    for (k = 1; k < 12; k++) tap.push([L + W * Math.sin(k * PI / 12), -W * Math.cos(k * PI / 12)]);
    tap.push([L, W], [0, W + 7], [-8, W + 7], [-8, -W]);

    // notch: a flat-bottomed dip in the rim with sloping sides, placed so it passes the lever nose during the push
    var dep = 18, ramp = 11 * D2R, u0 = PSIN - phE - 3 * D2R, u2 = PSIN - phX + 1 * D2R, u1 = u0 + ramp, u3 = u2 + ramp;   // closes just after the arm lets go
    function R(u) {
      u = Math.atan2(Math.sin(u), Math.cos(u));
      if (u <= u0 || u >= u3) return RC;
      if (u < u1) return RC - dep * (u - u0) / ramp;
      if (u > u2) return RC - dep * (u3 - u) / ramp;
      return RC - dep;
    }
    var prof = [], NP = 1440;
    for (k = 0; k < NP; k++) { var uu = k * 2 * PI / NP, rr = R(uu); prof.push([rr * Math.cos(uu), rr * Math.sin(uu)]); }

    // lever, local to the pivot, drawn in its locked position (angle 0): nose on the rim, tooth between two studs
    var t = bIn + PI / N, best = 1e9; for (k = 0; k < N; k++) { var cand = bIn + PI / N + k * 2 * PI / N; if (Math.abs(cand - 265 * D2R) < best) { best = Math.abs(cand - 265 * D2R); t = cand; } }
    var ur = [Math.cos(t), Math.sin(t)], vt = [-ur[1], ur[0]];
    function onD(r, s) { return [DX + r * ur[0] + s * vt[0] - PV[0], r * ur[1] + s * vt[1] - PV[1]]; }
    var nose = [CX + (RC + RN) * Math.cos(PSIN) - PV[0], (RC + RN) * Math.sin(PSIN) - PV[1]];
    var lev = { nose: nose, end: onD(80, 0), hub: 9, hw: 5,
      tooth: [onD(50, 0), onD(72, -11), onD(82, -11), onD(82, 11), onD(72, 11)] };
    function levDist(p) {                                     // distance from a local point to the lever's outline
      return Math.min(segDist(p, [0, 0], nose) - lev.hw, segDist(p, [0, 0], lev.end) - lev.hw, Math.hypot(p[0], p[1]) - lev.hub, polyDist(p, lev.tooth));
    }
    function toLocal(p, lam) { return rot([p[0] - PV[0], p[1] - PV[1]], -lam); }
    function studsClear(th, lam) {
      for (var i = 0; i < N; i++) { var b = bIn + 2 * al * i + th; if (levDist(toLocal(stud(b), lam)) < RS - 1e-4) return false; }
      return true;
    }
    function noseClear(ph, lam) {                              // left arm of the lever stays outside the disc outline
      var a = rot(nose, lam), j, i;
      for (j = 0; j <= 20; j++) {
        var f = j / 20, p = [PV[0] + a[0] * f - CX, PV[1] + a[1] * f], q = rot(p, -ph), r = Math.hypot(q[0], q[1]);
        if (r > RC + lev.hw + 1) continue;
        var u = Math.atan2(q[1], q[0]);
        if (r < R(u)) return false;
        var c = Math.round(((u + 2 * PI) % (2 * PI)) / (2 * PI) * NP), m = 1e9;
        for (i = -40; i <= 40; i++) m = Math.min(m, segDist(q, prof[(c + i + 2 * NP) % NP], prof[(c + i + 1 + 2 * NP) % NP]));
        if (m < lev.hw - 1e-4) return false;
      }
      return true;
    }
    function bisect(ok, lo, hi, wantHigh) {                    // ok(lo) or ok(hi) true; find the edge
      for (var i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (ok(m) === wantHigh) lo = m; else hi = m; }
      return wantHigh ? lo : hi;
    }
    var LMIN = -0.6, th = [], lam = [], prev = 0;
    for (k = 0; k <= SAMPLES; k++) {
      var q = k * 2 * PI / SAMPLES, ph = phE + LEAD - q, tl = thetaLocal(q), lS, lC;
      lS = studsClear(tl, 0) ? 0 : bisect(function (l) { return studsClear(tl, l); }, LMIN, 0, true);     // studs push the tooth down to here
      lC = noseClear(ph, 0) && !noseClear(ph, -0.004) ? 0 :                                                  // on the plain rim
        noseClear(ph, LMIN) ? LMIN : bisect(function (l) { return noseClear(ph, l); }, LMIN, 0, false);    // the rim lifts the lever to here
      prev = Math.max(lC, Math.min(prev, lS));
      th.push(tl); lam.push(prev);
    }
    return { N: N, al: al, L: L, phE: phE, span: span, tap: tap, prof: prof, lev: lev, th: th, lam: lam,
      stud: stud, bIn: bIn, R: R, levDist: levDist, toLocal: toLocal, thetaLocal: thetaLocal };
  }
  function lookup(K, a) {                                     // state at driver turn a (radians, counted from the start)
    var n = Math.floor(a / (2 * PI)), q = a - n * 2 * PI, f = q / (2 * PI) * SAMPLES, i = Math.min(SAMPLES - 1, Math.floor(f)), r = f - i;
    return { phi: K.phE + LEAD - a, theta: n * 2 * K.al + K.thetaLocal(q), lam: K.lam[i] * (1 - r) + K.lam[i + 1] * r, turns: n, steps: n + (q > LEAD + K.span ? 1 : 0) };
  }

  M507.define({
    number: 65,
    title: "Tappet and studs with a stop lever",
    lede: "A wheel that turns all the time moves a second wheel on by one small step in each turn. Between steps the second wheel is locked, so it cannot drift. Counters and machines that feed work forward in steps use this.",
    alt: "Two discs side by side on an upright plate. The left disc carries an arm that sweeps over the face of the right disc, which has a ring of short studs. Below them a lever on a pin has a pointed tooth between two studs at one end and rests against the rim of the left disc at the other.",
    parts: [
      { key: "drive", color: "#5E7387", name: "Driving disc", note: "It turns all the time. A notch cut in its rim lets the stop lever move, but only while the arm is pushing." },
      { key: "studs", color: "#C8873A", name: "Stud wheel", note: "A disc with short studs standing out of its face. It moves one stud at a time. Watch the red stud." },
      { key: "tappet", color: "#D9B13B", name: "Tappet arm", note: "Fixed to the driving disc, it reaches over the stud wheel. Once in each turn it catches a stud and pushes it along. An arm like this is called a tappet." },
      { key: "lever", color: "#4FA58A", name: "Stop lever", note: "It rocks on a fixed pin. Its tooth sits between two studs and locks the stud wheel. The rim of the driving disc holds it there." }
    ],
    controls: [{ id: "n", label: "Studs on the wheel", value: "10", options: [["8", "8"], ["10", "10"], ["12", "12"]] }],
    readouts: [{ id: "t", label: "Driver" }, { id: "s", label: "Stud wheel" }],
    views: { "3d": [300, 160, 560], front: [0, -15, 640], side: [640, -15, 0] },
    target: [0, -15, 0],
    how: [
      "The driving disc turns all the time. Once in each turn its arm sweeps over the stud wheel, catches a stud and pushes it down. That moves the stud wheel on by exactly one stud. Then the arm swings clear and the stud wheel stops.",
      "While the stud wheel waits, the tooth of the stop lever sits between two studs. The lever cannot tip, because its other end is pressed against the rim of the driving disc. Just as the arm starts to push, a notch in the rim reaches the lever. A stud shoves the tooth down and the lever's other end rises into the notch. As the notch moves on, its sloping side pushes that end down again, and the tooth comes back up in front of the next stud.",
      "So the stud wheel needs as many turns of the driver as it has studs to go round once. Try 8 studs, then 12, and count the turns for one trip of the red stud."
    ],
    note: "This model is rebuilt from Brown's drawing. Brown does not give sizes, so the sizes of the discs, the arm, the notch and the lever, the shape of the tooth and the upright plate that holds it all were made up. The choice of 8 or 12 studs was added to show what it changes.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { a: 0, N: null, sets: {}, K: {} };
      function extrude(pts, z0, z1, m) {
        var sh = new T.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
        var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, z0);
        return P.mesh(g, m);
      }
      function capsule(a, b, hw) {
        var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), pts = [], k;
        for (k = 0; k <= 12; k++) { var t = ang + PI / 2 + k * PI / 12; pts.push([a[0] + hw * Math.cos(t), a[1] + hw * Math.sin(t)]); }
        for (k = 0; k <= 12; k++) { var t2 = ang - PI / 2 + k * PI / 12; pts.push([b[0] + hw * Math.cos(t2), b[1] + hw * Math.sin(t2)]); }
        return pts;
      }
      [8, 10, 12].forEach(function (N) {
        var K = o.K[N] = kin(N), s = { root: new T.Group() };
        scene.add(s.root);
        // driving disc: disc z 4..14, hub z 14..22 on its face, shaft z -30..4 from the plate face to the disc back
        s.C = new T.Group(); s.C.position.set(CX, 0, 0); s.root.add(s.C);
        s.C.add(extrude(K.prof, 4, 14, c.mat("drive")));
        P.at(P.cylZ(10, 8, c.mat("drive")), 0, 0, 18, s.C);                   // hub z 14..22
        P.at(P.cylZ(6, 34, c.mat("drive")), 0, 0, -13, s.C);                  // shaft z -30..4
        s.C.add(extrude(K.tap, 13.5, 20, c.mat("tappet")));                      // arm z 14..20, flat on the disc face, under the hub top
        // stud wheel: disc z -6..0, studs z 0..24, hub z 0..8, shaft z -30..-6
        s.D = P.studWheel({ radius: RD, width: 6, studs: N, ring: RHO, studRadius: RS, studLength: 24, start: K.bIn,
          material: c.mat("studs"), studMaterial: c.mat("studs", "dark"), markMaterial: c.mat("studs", "mark") });
        s.D.position.set(DX, 0, 0); s.root.add(s.D);
        P.at(P.cylZ(10, 8, c.mat("studs")), 0, 0, 4, s.D);                    // hub z 0..8
        P.at(P.cylZ(6, 24, c.mat("studs")), 0, 0, -18, s.D);                  // shaft z -30..-6
        // stop lever: z 4..14 (in front of the stud wheel face z 0, level with the driving disc), boss z 14..17
        var lv = K.lev; s.L = new T.Group(); s.L.position.set(PV[0], PV[1], 0); s.root.add(s.L);
        s.L.add(extrude(capsule([0, 0], lv.nose, lv.hw), 4, 14, c.mat("lever")));
        s.L.add(extrude(capsule([0, 0], lv.end, lv.hw), 4, 14, c.mat("lever")));
        s.L.add(extrude(lv.tooth, 4, 14, c.mat("lever")));
        P.at(P.cylZ(lv.hub, 10, c.mat("lever")), 0, 0, 9, s.L);              // hub z 4..14
        P.at(P.cylZ(6, 3, c.mat("lever")), 0, 0, 15.5, s.L);                  // boss z 14..17
        o.sets[N] = s;
      });
      P.at(P.cylZ(5, 34, c.fixed), PV[0], PV[1], -13, scene);                 // lever pin z -30..4, plate face to lever back
      P.at(P.box(380, 240, 10, c.fixed), 0, -10, -35, scene);                 // plate x -190..190, y -130..110, z -40..-30; shafts end at z -30
      P.at(P.box(420, 12, 100, c.fixed), 0, -136, -30, scene);                // base y -142..-130, z -80..20; plate stands on y -130
    },

    step: function (c, dt, S) {
      var o = this.o, N = +S.controls.n || 10, k;
      if (N !== o.N) { o.N = N; o.a = 0; for (k in o.sets) o.sets[k].root.visible = +k === N; }
      o.a += S.w * dt;
      var K = o.K[N], s = o.sets[N], st = lookup(K, o.a);
      s.C.rotation.z = st.phi;
      s.D.rotation.z = st.theta;
      s.L.rotation.z = st.lam;
      S.set("t", st.turns + (st.turns === 1 ? " turn" : " turns"));
      S.set("s", st.steps + (st.steps === 1 ? " stud" : " studs"));
    },
    kin: kin, lookup: lookup
  });
})();
