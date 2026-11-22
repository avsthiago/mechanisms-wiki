M507.define({
  number: 6,
  title: "Rocking segment and crossed belts",
  lede: "A lever rocks a half wheel up and down. A belt tied to the half wheel turns two pulleys below it, first one way and then back. The pulleys turn further than the lever does.",
  alt: "A level bar with a knob at each end, fixed to a half wheel that hangs below its pivot. Two belt runs leave the half wheel, cross, and go down to two spoked pulleys. The belt passes round the outside of each pulley and along the bottom from one to the other.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Lever and half wheel", note: "A bar with a knob at each end, fixed to a half wheel, called a segment. They rock together on one pivot." },
    { key: "belt", color: "#D9B13B", name: "Belt", note: "One band with both ends tied to the half wheel. It crosses, goes round both pulleys and along the bottom between them." },
    { key: "pulleys", color: "#C8873A", name: "Pulleys", note: "Two spoked wheels of the same size. Watch the red spoke on each: they always turn the same way." }
  ],
  controls: [{ type: "range", id: "swing", label: "How far the lever rocks", min: 5, max: 40, step: 1, value: 25, unit: "°",
    presets: [[10, "10°"], [25, "25°"], [40, "40°"]] }],
  speed: { min: 2, max: 30, value: 10, label: "Rocking speed", unit: " a min" },
  readouts: [{ id: "lev", label: "Lever" }, { id: "pul", label: "Pulleys" }],
  views: { "3d": [420, 120, 640], front: [0, 30, 720], side: [720, 30, 0] },
  target: [0, 20, 0],
  how: [
    "Push one knob down and the half wheel rocks. One belt end is wound onto its rim and the other end is let off. Both pulleys turn. Rock the lever back and they turn back.",
    "The belt is one band, so every part of it moves the same distance. The half wheel is bigger than the pulleys. So when the lever rocks a little, the pulleys swing further. Both pulleys sit on the same side of the belt loop, so they turn the same way.",
    "The belt never goes slack. Whatever one end lets off, the other end winds in, so the loop keeps the same length. Try 10°, then 40°, and watch the red spokes swing further than the lever."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not say how the belt is fixed. Here it is one band with both ends tied to the half wheel near the lever, and it grips each pulley without slipping. In a real machine it could also be nailed to each pulley rim. The sizes, the back board and the shafts are made up.",

  build: function (c) {
    var P = c.P, T = c.THREE, scene = c.scene, o = this.o = { th: 0, phi: null,
      O: [0, 130], R: 70, r: 45, L: [-120, -80], Rt: [120, -80], tube: 2.5, zA: 6, zB: -6, tie: -8 * Math.PI / 180 };
    var lm = c.mat("lever"), bm = c.mat("belt");

    // frame: a base slab and an upright back board standing on it
    P.at(P.box(400, 20, 110, c.fixed), 0, -160, -2, scene);       // base x -200..200, y -170..-150, z -57..53
    P.at(P.box(380, 360, 8, c.fixed), 0, 30, -28, scene);         // board x -190..190, y -150..210 (sits on base top -150), z -32..-24

    // lever and half wheel, rocking about O; rim outside radius R - tube, so the belt centre lies on R
    o.seg = P.at(new T.Group(), o.O[0], o.O[1], 0, scene);
    var ro = o.R - o.tube, ri = ro - 8, sh = new T.Shape(), hole = new T.Path();
    sh.absarc(0, 0, ro, Math.PI, 2 * Math.PI, false); sh.lineTo(ri, 0); sh.absarc(0, 0, ri, 2 * Math.PI, Math.PI, true); sh.closePath();
    var rg = new T.ExtrudeGeometry(sh, { depth: 24, bevelEnabled: false, curveSegments: 40 }); rg.translate(0, 0, -12);
    o.seg.add(P.mesh(rg, lm));                                     // rim z -12..12
    P.at(P.cylZ(15, 26, lm), 0, 0, 0, o.seg);                      // hub z -13..13
    for (var k = 0; k < 5; k++) {
      var a = Math.PI + (k + .5) * Math.PI / 5, sl = ri - 15 + 2, mid = 15 + sl / 2 - 1, s = P.box(sl, 6, 8, lm);
      s.position.set(mid * Math.cos(a), mid * Math.sin(a), 0); s.rotation.z = a; o.seg.add(s);
    }
    P.at(P.box(300, 9, 10, lm), 0, 0, 0, o.seg);                   // lever x -150..150 through the hub
    [-1, 1].forEach(function (sd) { P.at(P.sphere(10, c.mat("lever", "dark")), sd * 155, 0, 0, o.seg); });   // knobs
    P.at(P.cylZ(6, 11, c.fixed), o.O[0], o.O[1], -18.5, scene);    // pivot shaft z -24..-13, board face to hub back

    // pulleys: rim outside r - tube, width 24 (z -12..12), hub z -10.8..10.8
    o.pl = []; [o.L, o.Rt].forEach(function (p) {
      var g = P.at(P.pulley({ radius: o.r - o.tube, width: 24, material: c.mat("pulleys") }), p[0], p[1], 0, scene);
      g.spokes[0].material = c.mat("pulleys", "mark"); o.pl.push(g);
      P.at(P.cylZ(5, 13.2, c.fixed), p[0], p[1], -17.4, scene);   // shaft z -24..-10.8, board face to hub back
    });

    // tangent points of the crossed runs. Run A: half wheel right side to left pulley's left side; run B mirrors it.
    var dx = o.L[0] - o.O[0], dy = o.L[1] - o.O[1], d = Math.sqrt(dx * dx + dy * dy);
    o.tA = Math.atan2(dy, dx) + Math.acos((o.R + o.r) / d);       // on the half wheel, about -57°
    o.tB = Math.PI - o.tA;                                         // mirror, about 237°
    function onC(cn, rr, ang) { return [cn[0] + rr * Math.cos(ang), cn[1] + rr * Math.sin(ang)]; }
    var sA = onC(o.O, o.R, o.tA), pA = onC(o.L, o.r, o.tA + Math.PI), sB = onC(o.O, o.R, o.tB), pB = onC(o.Rt, o.r, o.tB - Math.PI);
    P.at(P.rod(o.tube, bm), 0, 0, 0, scene).span(sA[0], sA[1], o.zA, pA[0], pA[1], o.zA);
    P.at(P.rod(o.tube, bm), 0, 0, 0, scene).span(sB[0], sB[1], o.zB, pB[0], pB[1], o.zB);
    // round the outside and bottom of each pulley (these wraps stay put while the pulleys turn under them)
    var wL = P.arc(o.r, o.tube, 1.5 * Math.PI - (o.tA + Math.PI), bm); wL.rotation.z = o.tA + Math.PI; P.at(wL, o.L[0], o.L[1], o.zA, scene);
    var wR = P.arc(o.r, o.tube, (o.tB - Math.PI) + Math.PI / 2, bm); wR.rotation.z = -Math.PI / 2; P.at(wR, o.Rt[0], o.Rt[1], o.zB, scene);
    // bottom run from the left pulley to the right one, stepping from the front lane to the back lane
    P.at(P.rod(o.tube, bm), 0, 0, 0, scene).span(o.L[0], o.L[1] - o.r, o.zA, o.Rt[0], o.Rt[1] - o.r, o.zB);
    // the wraps on the half wheel change length as it rocks
    o.wA = P.at(P.mesh(new T.BufferGeometry(), bm), o.O[0], o.O[1], o.zA, scene); o.wA.userData.live = true;
    o.wB = P.at(P.mesh(new T.BufferGeometry(), bm), o.O[0], o.O[1], o.zB, scene); o.wB.userData.live = true;
    o.kA = P.at(P.sphere(4.5, bm), 0, 0, 0, o.seg); o.kB = P.at(P.sphere(4.5, bm), 0, 0, 0, o.seg);   // knots where the ends are tied
    o.kA.position.set(o.R * Math.cos(o.tie), o.R * Math.sin(o.tie), o.zA);
    o.kB.position.set(-o.R * Math.cos(o.tie), o.R * Math.sin(o.tie), o.zB);
  },

  step: function (c, dt, S) {
    var o = this.o, A = (+S.controls.swing) * Math.PI / 180;
    o.th += S.w * dt;
    var phi = A * Math.sin(o.th);
    if (phi !== o.phi) {
      o.phi = phi;
      o.seg.rotation.z = phi;
      // wrap A: from the tangent point up to the tie, which has turned with the half wheel; wrap B mirrors it
      var a0 = o.tA, a1 = phi + o.tie, b0 = Math.PI - o.tie + phi, b1 = o.tB;
      o.wA.geometry.dispose(); o.wA.geometry = new c.THREE.TorusGeometry(o.R, o.tube, 8, 24, a1 - a0); o.wA.rotation.z = a0;
      o.wB.geometry.dispose(); o.wB.geometry = new c.THREE.TorusGeometry(o.R, o.tube, 8, 24, b1 - b0); o.wB.rotation.z = b0;
      // belt moves R * phi; both pulleys turn the opposite way to the half wheel by R / r times as much
      var q = -phi * o.R / o.r;
      o.pl[0].rotation.z = q; o.pl[1].rotation.z = q;
    }
    var dl = Math.round(phi * 180 / Math.PI), dp = Math.round(-phi * o.R / o.r * 180 / Math.PI);
    S.set("lev", dl + "°");
    S.set("pul", dp + "°");
  }
});
