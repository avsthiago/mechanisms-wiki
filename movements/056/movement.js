M507.define({
  number: 56,
  title: "Lever that throws a lathe gear in and out",
  lede: "A lathe can turn its work fast or slow. A lever slides a big gear into mesh with a small one for slow, strong turning. Pull the lever down and the big gear slides back out of the way.",
  alt: "The end of a lathe headstock. A cone pulley at the right carries a small gear. A big gear at the left meshes with it. In front, an upright lever with a curved slot holds the big gear's shaft.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Small gear", note: "It is fixed to the shaft of the cone pulley, so it turns all the time. Its red stripe shows it turning." },
    { key: "pulley", color: "#8E7AA8", name: "Cone pulley", note: "A stepped pulley turned by a belt, left out here. Moving the belt to another step changes the speed." },
    { key: "driven", color: "#C8873A", name: "Big gear", note: "It turns on a short shaft held in a sliding block. Watch the red stripe: it is driven only while its teeth touch the small gear." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "It swings on a pin in the frame. The curved slot in its lower end holds the shaft of the big gear." }
  ],
  controls: [{ id: "lever", label: "Lever", value: "up", options: [["up", "Up, in gear"], ["down", "Down, out of gear"]] }],
  readouts: [{ id: "pul", label: "Pulley" }, { id: "big", label: "Big gear" }],
  views: { "3d": [-360, 200, 800], front: [-20, 10, 950], side: [-950, 10, 0] },
  target: [-20, 10, 0],
  how: [
    "The belt keeps the pulley and the small gear turning. When the lever is up, the big gear is pressed against the small gear. Their teeth lock, so the big gear turns too, slowly and the other way.",
    "The lever swings on a pin. The shaft of the big gear goes through a curved slot in the lever and through a straight slot in the frame. The curved slot is not centred on the pin. One end is farther from the pin than the other. As the lever swings down, the slot slides past the shaft and pulls it closer to the pin. The straight slot lets it move only backward, so the big gear leaves the small one.",
    "Try Down, out of gear. Watch the shaft slide back and the big gear slow to a stop. Then put the lever up and see the teeth find each other again."
  ],
  note: "This model is rebuilt from Brown's drawing. The exact shape of the frame and lever, the sliding block, the tooth counts and the sizes were made up. The far bearing of the pulley shaft and the belt are left out. Real gears might need a small nudge to slide in tooth to gap; the model lines them up as they close.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, NG = 40, NP = 14, i;
    var o = this.o = { a: 0, g: 0, wg: 0, th: 0, TH: .6, PX: -160, PY: -8, dPrev: 99 };
    // small gear and cone pulley on one shaft at x 62
    o.pin = new T.Group(); scene.add(o.pin);
    var gp = P.spurGear({ teeth: NP, module: MD, width: 14, material: c.mat("drive") });
    P.at(gp, 0, 0, -17, o.pin);                                                // small gear z -24..-10
    var gg = P.spurGear({ teeth: NG, module: MD, width: 14, material: c.mat("driven") });
    o.XIN = -(gp.pitchRadius + gg.pitchRadius) + 62;                          // in gear: centres a sum of pitch radii apart (x -100)
    o.XOUT = o.XIN - 22;                                                      // out of gear (x -122), clear of the teeth
    o.pin.position.set(62, 0, 0);
    o.r = NP / NG; o.pg = gg.pitch;
    P.at(P.cylZ(6, 40, c.mat("drive")), 0, 0, -10, o.pin);                    // shaft z -30..10: pulley face, through the frame hole (r 6.5), 2 past its front
    var rfp = gp.pitchRadius - 1.25 * MD;
    P.at(P.box(rfp - 10, 4, 1, c.mat("drive", "mark")), 7 + (rfp - 10) / 2, 0, -9.4, o.pin);   // red stripe z -9.9..-8.9, off the gear face -10
    var cone = P.stepPulley({ radii: [139, 112, 86], width: 20, material: c.mat("pulley"), mark: c.mat("pulley", "mark") });
    P.at(cone, 0, 0, -60, o.pin);                                             // pulley z -90..-30
    // large gear on its shaft, slides along x
    o.gear = new T.Group(); scene.add(o.gear);
    P.at(gg, 0, 0, -17, o.gear);                                              // gear z -24..-10
    P.at(P.cylZ(6, 37.5, c.mat("driven")), 0, 0, -5.25, o.gear);                   // shaft z -24..13.5, through the frame slot and the lever slot
    P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 16, o.gear);                   // collar z 14..18, on the lever's front face
    var rf = gg.pitchRadius - 1.25 * MD;
    P.at(P.box(rf - 14, 5, 1, c.mat("driven", "mark")), 11 + (rf - 14) / 2, 0, -9.4, o.gear);  // red stripe z -9.9..-8.9
    o.block = P.at(P.box(20, 16, 15, c.mat("driven")), o.XIN, 0, 0, scene);   // sliding block y -8..8 (the slot's faces), z -7.5..7.5 inside the frame

    // frame: one casting z -8..8, with a straight slot for the block and a hole for the pulley shaft
    var sh = new T.Shape();
    sh.moveTo(-180, 28.5); sh.lineTo(133, 28.5); sh.lineTo(133, -90);
    sh.quadraticCurveTo(136, -140, 151, -154); sh.lineTo(-36, -154);
    sh.quadraticCurveTo(-16, -128, -16, -80); sh.quadraticCurveTo(-18, -38, -60, -36);
    sh.lineTo(-180, -36); sh.quadraticCurveTo(-198, -36, -198, -4); sh.quadraticCurveTo(-198, 28.5, -180, 28.5);
    var slot = new T.Path(); slot.moveTo(-136, -8); slot.lineTo(-86, -8); slot.lineTo(-86, 8); slot.lineTo(-136, 8); slot.lineTo(-136, -8);
    var hole = new T.Path(); hole.absarc(62, 0, 6.5, 0, 2 * Math.PI, true);
    sh.holes.push(slot, hole);
    var fg = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false, curveSegments: 20 }); fg.translate(0, 0, -8);
    scene.add(P.mesh(fg, c.fixed));                                           // casting z -8..8, bottom y -154
    P.at(P.box(206, 36, 124, c.fixed), 53, -172, -38, scene);                 // foot x -50..156, y -190..-154, z -100..24; casting stands on y -154

    // lever: pivot pin at (-160, -8) on the casting's front face
    o.lever = new T.Group(); o.lever.position.set(o.PX, o.PY, 0); scene.add(o.lever);
    // slot centre line, in the lever's own frame: at lever angle t the shaft (on y = 0, x = XIN .. XOUT) lies on it
    o.slot = [];
    for (i = 0; i <= 24; i++) {
      var t = o.TH * i / 24, u = o.XIN - o.PX - (o.XIN - o.XOUT) * i / 24, v = -o.PY;
      o.slot.push([u * Math.cos(t) + v * Math.sin(t), -u * Math.sin(t) + v * Math.cos(t)]);
    }
    function band(R) {                                                        // outline round the centre line at distance R, round ends
      var L = [], Rt = [], n = o.slot.length, k, a, b, dx, dy, d;
      for (k = 0; k < n; k++) {
        a = o.slot[Math.max(0, k - 1)]; b = o.slot[Math.min(n - 1, k + 1)];
        dx = b[0] - a[0]; dy = b[1] - a[1]; d = Math.hypot(dx, dy);
        L.push([o.slot[k][0] - dy / d * R, o.slot[k][1] + dx / d * R]);
        Rt.push([o.slot[k][0] + dy / d * R, o.slot[k][1] - dx / d * R]);
      }
      function cap(p, from) { var q = []; for (var j = 1; j < 12; j++) { var an = from + Math.PI * j / 12; q.push([p[0] + R * Math.cos(an), p[1] + R * Math.sin(an)]); } return q; }
      var e = o.slot[n - 1], s = o.slot[0];
      var ae = Math.atan2(L[n - 1][1] - e[1], L[n - 1][0] - e[0]), as = Math.atan2(Rt[0][1] - s[1], Rt[0][0] - s[0]);
      return L.concat(cap(e, ae), Rt.reverse(), cap(s, as));
    }
    var pts = band(17);
    for (i = 0; i < 20; i++) pts.push([20 * Math.cos(i * Math.PI / 10), 20 * Math.sin(i * Math.PI / 10)]);
    pts.sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });         // convex hull (monotone chain)
    function cross(O, A, B) { return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]); }
    var lo = [], up = [];
    pts.forEach(function (p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    pts.slice().reverse().forEach(function (p) { while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
    var hull = lo.slice(0, -1).concat(up.slice(0, -1));
    var ls = new T.Shape(hull.map(function (p) { return new T.Vector2(p[0], p[1]); }));
    ls.holes.push(new T.Path(band(6.5).map(function (p) { return new T.Vector2(p[0], p[1]); })));
    var lg = new T.ExtrudeGeometry(ls, { depth: 6, bevelEnabled: false }); lg.translate(0, 0, 8);
    o.lever.add(P.mesh(lg, c.mat("lever")));                                  // plate z 8..14, back face on the casting front 8
    P.at(P.box(10, 174, 6, c.mat("lever")), 0, 99, 11, o.lever);              // handle y 12..186, z 8..14
    var knob = P.at(P.sphere(8, c.mat("lever")), 0, 194, 11, o.lever); knob.scale.set(1, 1.8, 1);   // grip y 180..208
    P.at(P.cylZ(9, 3, c.mat("lever", "dark")), o.PX, o.PY, 15.5, scene);      // pin head z 14..17, on the lever face
  },

  step: function (c, dt, S) {
    var o = this.o, i;
    // lever swings smoothly toward the chosen side
    var goal = S.controls.lever === "down" ? o.TH : 0, dth = goal - o.th, st = 1.1 * dt;
    o.th += Math.abs(dth) < st ? dth : Math.sign(dth) * st;
    o.lever.rotation.z = o.th;
    // shaft = where the slot (turned with the lever) crosses the straight slot's line y = 0
    var ct = Math.cos(o.th), sn = Math.sin(o.th), prev = null, x = o.XIN;
    for (i = 0; i < o.slot.length; i++) {
      var p = o.slot[i], wx = o.PX + p[0] * ct - p[1] * sn, wy = o.PY + p[0] * sn + p[1] * ct;
      if (prev && (prev[1] - 0) * (wy - 0) <= 0) { var f = prev[1] / (prev[1] - wy || 1e-9); x = prev[0] + (wx - prev[0]) * f; break; }
      prev = [wx, wy];
    }
    o.gear.position.x = x; o.block.position.x = x;
    // pulley and small gear turn all the time
    o.a += S.w * dt; o.pin.rotation.z = o.a;
    var d = o.XIN - x, gs = -o.a * o.r + o.pg / 2;                            // gs: angle that meshes with the small gear
    if (d < .01) { o.g = gs; o.wg = -S.w * o.r; }
    else {
      if (S.playing) { o.wg *= Math.exp(-dt / 1.2); o.g += o.wg * dt; }       // coasts and slows down
      if (d < 16 && d < o.dPrev) {                                            // closing in: line a gap up with a tooth
        var e = o.g - gs; e -= o.pg * Math.round(e / o.pg);
        o.g = gs + e * d / o.dPrev;
      }
    }
    o.dPrev = d;
    o.gear.rotation.z = o.g;
    function fm(v) { v = Math.round(v * 10) / 10; if (v === 0) v = 0; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("pul", fm(S.playing ? S.rpm : 0));
    S.set("big", fm(S.playing ? o.wg * 60 / (2 * Math.PI) : 0));
  }
});
