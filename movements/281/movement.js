M507.define({
  number: 281,
  title: "Disc groove and lever",
  lede: "A flat disc has a closed groove cut into its face. A pin on a long swinging arm rides in the groove. As the disc turns, the groove pushes the pin in and out, and the arm swings to and fro.",
  alt: "A round disc on a stand with a heart-shaped groove in its face. A long swinging arm hangs from a pivot at the top right, and a pin on it runs in the groove.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "A flat wheel on a shaft. It does the driving. The groove is cut into its face." },
    { key: "groove", color: "#4FA58A", name: "Groove", note: "A closed channel in the disc. Its shape, near the centre in one place and far from it in another, decides how the lever swings." },
    { key: "lever", color: "#C8873A", name: "Swinging arm", note: "A long bar that swings on a pin at the top. It is driven by the groove." },
    { key: "pin", color: "#C2503F", name: "Pin", note: "Fixed to the arm and sliding in the groove. Watch it. It is pushed in and out as the groove passes by." }
  ],
  controls: [],
  readouts: [{ id: "l", label: "Arm swing" }, { id: "p", label: "Pin from centre" }],
  views: { "3d": [330, 140, 520], front: [0, -20, 580], side: [560, 20, 60] },
  target: [0, -20, 0],
  how: [
    "The pin on the arm sits in the groove and cannot leave it. As the disc turns, the groove carries the pin along with it.",
    "Where the groove is far from the middle of the disc, the pin is pushed outwards and the arm swings one way. Where the groove comes close to the middle, the pin is drawn inwards and the arm swings back. One turn of the disc gives one swing out and back. The groove has two walls, so it pushes the pin both ways and no spring is needed.",
    "Slow the disc down with the speed slider. Follow the red pin round the groove and see where the arm is at its furthest left and furthest right."
  ],
  note: "This model is rebuilt from Brown's drawing. The shape of the groove was worked out from the arm's swing, so the pin always touches both walls. The stand, the base, the post that holds the arm's pivot and all the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { phi: 0, R: 88, PX: 63, PY: 123, L: 97, HW: 4, M: -3.5 * Math.PI / 180, A: 10.5 * Math.PI / 180, K: 0 };
    // lever swing as the disc turns: smooth, one swing out and back per turn. f is scaled to run from -1 to 1.
    function raw(t) { return Math.cos(t) + .6 * Math.cos(2 * t + 1.2); }
    var lo = 1e9, hi = -1e9, tm = 0;
    for (i = 0; i < 3600; i++) { var t = i * Math.PI / 1800, v = raw(t); if (v < lo) lo = v; if (v > hi) { hi = v; tm = t; } }
    o.psi = function (phi) { return o.M + o.A * (2 * (raw(phi + tm) - lo) / (hi - lo) - 1); };
    o.pin = function (psi) { return [o.PX + o.L * Math.sin(psi), o.PY - o.L * Math.cos(psi)]; };   // pin centre, world
    o.groove = [];                                                                // groove centre line, in the disc's own frame
    var N = 360;
    for (i = 0; i < N; i++) {
      var ph = 2 * Math.PI * i / N, p = o.pin(o.psi(ph)), cs = Math.cos(-ph), sn = Math.sin(-ph);
      o.groove.push([p[0] * cs - p[1] * sn, p[0] * sn + p[1] * cs]);
    }
    var A = [], B = [];
    for (i = 0; i < N; i++) {
      var a = o.groove[(i + N - 1) % N], b = o.groove[(i + 1) % N], g = o.groove[i], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty);
      A.push([g[0] - ty / tl * o.HW, g[1] + tx / tl * o.HW]); B.push([g[0] + ty / tl * o.HW, g[1] - tx / tl * o.HW]);
    }
    function meanR(l) { var s = 0; l.forEach(function (p) { s += Math.hypot(p[0], p[1]); }); return s / l.length; }
    var out = meanR(A) > meanR(B) ? A : B, inn = out === A ? B : A;               // outer and inner edge of the groove
    o.ringOut = out.map(function (p, j) { return [p[0] + (o.groove[j][0] - p[0]) * .3 / o.HW, p[1] + (o.groove[j][1] - p[1]) * .3 / o.HW]; });
    o.ringIn = inn.map(function (p, j) { return [p[0] + (o.groove[j][0] - p[0]) * .3 / o.HW, p[1] + (o.groove[j][1] - p[1]) * .3 / o.HW]; });
    function loop(l, s) { var q = new T.Shape(); l.forEach(function (p, j) { var x = p[0] + (s ? 0 : 0), y = p[1]; if (j) q.lineTo(x, y); else q.moveTo(x, y); }); q.closePath(); return q; }
    function ringShape(l1, l2) { var q = loop(l1), h = loop(l2); q.holes.push(h); return q; }

    // supports (c.fixed): base y -171..-144; A-frame z -26..-14 stands on it; post for the pivot z -38..-28
    P.at(P.box(240, 27, 60, c.fixed), -6, -157.5, -10, scene);                    // x -126..114, z -40..20
    var af = new T.Shape();
    [[-90, -144], [-63, -144], [0, -42], [48, -144], [75, -144], [27, 12], [-27, 12]].forEach(function (p, j) { if (j) af.lineTo(p[0], p[1]); else af.moveTo(p[0], p[1]); });
    af.closePath();
    var gf = new T.ExtrudeGeometry(af, { depth: 12, bevelEnabled: false }); gf.translate(0, 0, -26);
    scene.add(P.mesh(gf, c.fixed));                                               // bottom y -144 = base top
    P.at(P.box(12, 275, 10, c.fixed), o.PX, -6.5, -33, scene);                    // x 57..69, y -144..131, z -38..-28

    // disc on its axle
    o.disc = new T.Group(); scene.add(o.disc);
    var md = c.mat("disc");
    P.at(P.cylZ(o.R, 6, md), 0, 0, -3, o.disc);                                   // back plate z -6..0
    var circ = new T.Shape(); circ.absarc(0, 0, o.R, 0, 2 * Math.PI, false);
    circ.holes.push(loop(out));
    var gp = new T.ExtrudeGeometry(circ, { depth: 6, bevelEnabled: false, curveSegments: 72 });
    o.disc.add(P.mesh(gp, md));                                                   // face with the groove cut out, z 0..6
    o.disc.add(P.mesh(new T.ExtrudeGeometry(loop(inn), { depth: 6, bevelEnabled: false }), md));   // island inside the groove, z 0..6
    P.at(P.mesh(new T.ExtrudeGeometry(ringShape(o.ringOut, o.ringIn), { depth: .8, bevelEnabled: false }), c.mat("groove")), 0, 0, 0, o.disc);   // groove floor, z 0..0.8
    P.at(P.cylZ(5, 8, md), 0, 0, -9.6, o.disc);                                   // axle z -13.6..-5.6
    P.at(P.cylZ(12, 3, md), 0, 0, 7.5, o.disc);                                   // hub z 6..9
    P.at(P.cylZ(6.5, .8, c.mat("disc", "dark")), 0, 0, 9.4, o.disc);              // hub cap z 9..9.8

    // lever, in front of the disc
    var ml = c.mat("lever"), mp = c.mat("pin", "mark");
    o.lever = new T.Group(); o.lever.position.set(o.PX, o.PY, 0); scene.add(o.lever);
    P.at(P.armPlate({ length: 262, r0: 4.5, thick: 6, material: ml }), 0, 0, 11, o.lever);   // bar z 8..14
    P.at(P.cylZ(8, 6.8, ml), 0, 0, 11, o.lever);                                  // pivot boss z 7.6..14.4
    P.at(P.cylZ(3, .8, c.mat("lever", "dark")), 0, 0, 14.8, o.lever);
    P.at(P.cylZ(7.5, 6.8, mp), o.L, 0, 11, o.lever);                              // pin boss
    P.at(P.cylZ(3.2, 6.8, mp), o.L, 0, 4.6, o.lever);                             // pin z 1.2..8, runs in the groove
    P.at(P.cylZ(3.5, 35.6, c.mat("lever", "dark")), o.PX, o.PY, -10.2, scene);    // pivot pin z -28..7.6, ends on the post's face
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.phi += S.w * dt;
    var psi = o.psi(o.phi);
    o.disc.rotation.z = o.phi;
    o.lever.rotation.z = psi - Math.PI / 2;                                       // bar points along (sin psi, -cos psi)
    var p = o.pin(psi), rho = Math.hypot(p[0], p[1]);
    var sw = (psi - o.M) * 180 / Math.PI;
    S.set("l", (sw > 0 ? "+" : sw < 0 ? "−" : "") + Math.abs(sw).toFixed(1) + "°");
    S.set("p", Math.round(rho) + " mm");
  }
});
