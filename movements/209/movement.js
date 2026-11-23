M507.define({
  number: 209,
  title: "Rolling contact with guide teeth",
  lede: "Two oval wheels turn each other by rolling, edge on edge, with no teeth over half their rims. Rolling alone would fail at one point in every turn, so a few teeth carry the motion past it. The second wheel speeds up and slows down as it goes.",
  alt: "Two oval gears side by side on shafts near one end of each. The left one lies level and the right one hangs down from its shaft. Each has teeth along about half of its edge and a smooth rim on the rest. A curved tongue on the left gear dips into a fork on the right gear where they meet.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving gear", note: "An oval gear that turns at a steady speed on a shaft near one end. Its smooth half pushes the other gear by rolling against it." },
    { key: "driven", color: "#C8873A", name: "Driven gear", note: "An oval gear of the same shape. It turns fast when it touches near its shaft and slowly when it touches far out. Watch its red stripe." },
    { key: "catch", color: "#D9B13B", name: "Fork and tongue", note: "A fork on the driven gear and a curved tongue on the driving gear. The tongue dips into the fork just as the first teeth meet, so they meet in the right place." }
  ],
  readouts: [{ id: "out", label: "Driven" }, { id: "how", label: "Touching" }],
  views: { "3d": [260, 130, 600], front: [10, -30, 640], side: [640, -30, 0] },
  target: [10, -30, 0],
  how: [
    "The left gear turns steadily. Along the smooth halves the two rims simply roll on each other without slipping. Along the other halves the teeth take over. Watch the Touching readout change between rims and teeth.",
    "Each gear turns on a point near one end, so the distance from shaft to rim keeps changing. Where one gear is long, the other is short by the same amount, so they always touch. A smooth rim can only push while the touching point moves out along it. When the long end of the left gear meets the short end of the right one, the push dies. Without teeth the right gear would stop there.",
    "The tongue and the fork make sure the first teeth meet tooth to gap and not tooth to tooth. Slow the speed right down and watch the Driven readout. It is fastest when the gears touch near the right gear's shaft."
  ],
  note: "This model is rebuilt from Brown's drawing. Each gear is a true ellipse turning on a point near one end, called a focus. That is the shape that lets two equal ovals roll together on fixed shafts. The plate and base that hold the shafts, the sizes, the number of teeth and the shapes of the tongue and fork were made up. The fork's slot was cut to the tongue's exact path, so the two never rub.",

  /* Kinematics. Both pitch curves are the ellipse r(phi) = p / (1 + e cos phi) about a focus (half long axis A, nearest point
     on local +X), on shafts 2A apart: the driver at (-A, 0), the driven at (A, 0). With the eccentric angle E, r = A(1 - e cos E).
     The driver turns clockwise by alpha (rotation.z, falling); its contact sits at local angle phi1 = -alpha. The driven
     contact has E2 = pi - E1, so r2 = A(1 + e cos E1) = 2A - r1, and arc length from the nearest point is L/2 - s1, so the
     rims roll without slip; the driven rotation is beta = pi - phi2.
     A smooth rim can only push the other while the contact on the driver moves away from its shaft (s1 from 0 to L/2): the
     driver's teeth cover the other half, s1 from L/2 - 1.5 pitch to L + .5 pitch, with a gap on the driven wheel for each.
     The tongue's tip stands out past the driver's rim in front of the teeth, and the fork's slot on the driven wheel is cut
     wherever the tongue passes (with 0.6 to spare), found by stepping one turn. Checked in node over three turns: rims and
     teeth never cut into each other, the smooth rims only touch where a push is possible, the tongue never touches the fork. */
  _kin: function () {
    var TAU = 2 * Math.PI, A = 100, e = .6, p = A * (1 - e * e), NT = 30, i, j;
    var NE = 4000, Es = [], cum = [0], pts = [];
    for (i = 0; i <= NE; i++) { var E = TAU * i / NE, r = A * (1 - e * Math.cos(E)), ph = phiOf(E); pts.push([r * Math.cos(ph), r * Math.sin(ph)]); if (i) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); }
    var L = cum[NE], pitch = L / NT, md = pitch / Math.PI, add = md, ded = 1.25 * md;
    function phiOf(E) { var n = Math.round(E / TAU), F = E - n * TAU; return n * TAU + 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(F / 2), Math.sqrt(1 - e) * Math.cos(F / 2)); }
    function EOf(ph) { var n = Math.round(ph / TAU), F = ph - n * TAU; return n * TAU + 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(F / 2), Math.sqrt(1 + e) * Math.cos(F / 2)); }
    function at(s, off) {                                  // point at arc length s from the nearest point, pushed off along the outward normal
      s = ((s % L) + L) % L;
      var lo = 0, hi = NE; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
      var a = pts[lo], b = pts[lo + 1], l = cum[lo + 1] - cum[lo] || 1e-9, f = (s - cum[lo]) / l, tx = (b[0] - a[0]) / l, ty = (b[1] - a[1]) / l;
      return [a[0] + (b[0] - a[0]) * f + ty * off, a[1] + (b[1] - a[1]) * f - tx * off];
    }
    // outlines: plain rim (the pitch curve) with a toothed stretch. Tooth shape as in P.spurGear.
    var prof = [[-.5, -ded], [-.27, -ded], [-.11, add], [.11, add], [.27, -ded], [.5, -ded]];
    function outline(centres, s0, s1) {                    // teeth at the given arc lengths, roots from s0 to s1, plain rim elsewhere
      var out = [], s, k;
      for (s = s1; s < s0 + L - 1e-9; s += .5) out.push(at(s, 0));
      out.push(at(s0, 0)); out.push(at(s0, -ded));
      centres.forEach(function (c) { for (k = 0; k < prof.length; k++) out.push(at(c + prof[k][0] * pitch, prof[k][1])); });
      out.push(at(s1, -ded));
      return out;
    }
    var J0 = -1, J1 = 15, dc = [], gc = [];
    for (j = J0; j <= J1; j++) dc.push(L / 2 + j * pitch);
    for (j = J1 - 1; j >= J0; j--) gc.push(L / 2 - (L / 2 + (j + .5) * pitch));
    var drive = outline(dc, L / 2 + (J0 - .5) * pitch, L / 2 + (J1 + .5) * pitch);
    var driven = outline(gc, -(J1 + .5) * pitch, -(J0 - .5) * pitch);
    function beta(alpha) { var E2 = Math.PI - EOf(-alpha); return Math.PI - phiOf(E2); }
    function contact(alpha) {                              // where the driver touches: arc length on its rim, and distances to both shafts
      var E1 = EOf(-alpha), r1 = A * (1 - e * Math.cos(E1)), k = Math.floor(E1 / TAU), F = E1 - k * TAU, s = k * L + cum[Math.round(F / TAU * NE)];
      return { s: s, r1: r1, r2: 2 * A - r1 };
    }
    // tongue on the driver's front, round tip of radius TR at radius RT on the far end (local -X), joined to the rim by an arm
    var TR = 4.5, RT = A * (1 + e) + 7, tongue = [], CLR = .6;
    for (i = 0; i <= 16; i++) { var g = -Math.PI / 2 + Math.PI * i / 16; tongue.push([-RT - TR * Math.cos(g), TR * Math.sin(g)]); }
    tongue.push([-RT + 26, -TR], [-RT + 26, TR]);
    tongue = [[-RT + 26, TR]].concat(tongue.slice(0, 17).reverse(), [[-RT + 26, -TR]]);
    // fork on the driven's front: a plate round its nearest point, out to FH past the rim, with the tongue's path cut out
    var NB = 2880, fork = new Float64Array(NB), FW = .62, FH = 22, tp = [];
    for (i = 0; i < tongue.length; i++) { var q0 = tongue[i], q1 = tongue[(i + 1) % tongue.length], n = Math.max(1, Math.ceil(Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) / .4)); for (j = 0; j < n; j++) tp.push([q0[0] + (q1[0] - q0[0]) * j / n, q0[1] + (q1[1] - q0[1]) * j / n]); }
    for (i = 0; i < NB; i++) {
      var a = i / NB * TAU, aa = Math.atan2(Math.sin(a), Math.cos(a)), rr = p / (1 + e * Math.cos(a));
      fork[i] = Math.abs(aa) < FW ? rr + FH * Math.pow(Math.cos(aa / FW * Math.PI / 2), .5) : 0;
    }
    for (i = 0; i < 7200; i++) {
      var al = -TAU * i / 7200, b = beta(al), ca = Math.cos(al), sa = Math.sin(al), cb = Math.cos(-b), sb = Math.sin(-b);
      for (j = 0; j < tp.length; j++) {
        var X = tp[j][0] * ca - tp[j][1] * sa - 2 * A, Y = tp[j][0] * sa + tp[j][1] * ca, x = X * cb - Y * sb, y = X * sb + Y * cb, r = Math.hypot(x, y);
        var k = Math.round((Math.atan2(y, x) / TAU + 1) * NB) % NB, kk;
        for (kk = k - 2; kk <= k + 2; kk++) { var mm = ((kk % NB) + NB) % NB; if (fork[mm] > 0 && r - CLR < fork[mm]) fork[mm] = Math.max(0, r - CLR); }
      }
    }
    var forkPoly = []; for (i = -NB / 2; i < NB / 2; i++) { var f2 = fork[(i + NB) % NB], a2 = i / NB * TAU; if (f2 > 0) forkPoly.push([f2 * Math.cos(a2), f2 * Math.sin(a2)]); }
    return { A: A, e: e, p: p, L: L, pitch: pitch, md: md, beta: beta, contact: contact, drive: drive, driven: driven, tongue: tongue, RT: RT, fork: fork, forkPoly: forkPoly, NB: NB,
      plainDrive: function (s) { s = ((s % L) + L) % L; return s > L / 2 + (J1 + .5) * pitch - L && s < L / 2 + (J0 - .5) * pitch; }, at: at, phiOf: phiOf, EOf: EOf };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this._kin(), A = K.A;
    var o = this.o = { K: K, a0: -Math.PI + 16 * Math.PI / 180 };
    o.a = o.a0;
    function plate(pts, z0, z1, mat) {
      var sh = new T.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return new T.Mesh(g, mat);
    }
    // driving wheel at (-A, 0): wheel z -8..8, shaft z -40..8 (from the plate face), hub z 8..12, tongue z 9..17 on a boss z 8..9
    o.g1 = new T.Group(); o.g1.position.x = -A; scene.add(o.g1);
    o.g1.add(plate(K.drive, -8, 8, c.mat("drive")));
    P.at(P.cylZ(6, 48, c.mat("drive")), 0, 0, -16, o.g1);
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 10, o.g1);
    o.g1.add(plate(K.tongue, 9, 17, c.mat("catch")));
    P.at(P.cylZ(4, 1, c.mat("catch")), -K.RT + 22, 0, 8.5, o.g1);              // boss z 8..9 at the arm's root, inside the rim
    // driven wheel at (A, 0): wheel z -8..8, shaft z -40..8, hub z 8..12, fork z 9..17 held by the hub (it runs into the fork)
    o.g2 = new T.Group(); o.g2.position.x = A; scene.add(o.g2);
    o.g2.add(plate(K.driven, -8, 8, c.mat("driven")));
    P.at(P.cylZ(6, 48, c.mat("driven")), 0, 0, -16, o.g2);
    P.at(P.cylZ(11, 4, c.mat("driven")), 0, 0, 10, o.g2);
    o.g2.add(plate(K.forkPoly.concat([[0, 0]]), 9, 17, c.mat("catch")));
    var len = A * (1 + K.e) - 1.25 * K.md - 22;
    P.at(P.box(len, 5, 1, c.mat("driven", "mark")), -(13 + len / 2), 0, 9, o.g2);   // red stripe along the long end, z 8.5..9.5 off the face (z 8)
    // supports
    P.at(P.box(500, 360, 10, c.fixed), 10, -30, -45, scene);                 // plate x -240..260, y -210..150, z -50..-40; shafts end at z -40
    P.at(P.box(540, 12, 110, c.fixed), 10, -216, -40, scene);                // base x -260..280, y -222..-210, z -95..15; plate stands on y -210
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K;
    o.a -= S.w * dt;                                       // the driving wheel turns clockwise
    var b = K.beta(o.a);
    o.g1.rotation.z = o.a; o.g2.rotation.z = b;
    var ct = K.contact(o.a), rpm = S.playing ? Math.round(S.rpm * ct.r1 / ct.r2 * 10) / 10 : 0;
    S.set("out", rpm + " rpm");
    S.set("how", K.plainDrive(ct.s) ? "Rims" : "Teeth");
  }
});
