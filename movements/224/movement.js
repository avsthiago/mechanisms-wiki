M507.define({
  number: 224,
  title: "Expanding pulley",
  lede: "A belt pulley that can be made bigger or smaller without taking it off its shaft. Its rim is cut into six pieces on sliding arms. Turning a small gear pushes all six pieces out together, or pulls them in.",
  alt: "A pulley rim cut into six curved pieces, each on a straight arm that slides in a guide. In the middle a gear with six curved slots holds a stud from each arm. A small gear at the top meshes with the gear.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Pulley body", note: "Fixed to the shaft and turns with it. Its six spokes carry the guides the arms slide in, and the small gear's pin." },
    { key: "wheel", color: "#C8873A", name: "Slotted gear", note: "A gear that turns loosely on the shaft. Its six curved slots hold the studs on the arms." },
    { key: "pinion", color: "#C2503F", name: "Small gear", note: "Turn it with a key on its square end. Watch it turn the slotted gear." },
    { key: "rim", color: "#4FA58A", name: "Rim pieces", note: "Six curved pieces that together make the rim the belt runs on. They move out and in with the arms." },
    { key: "arms", color: "#D9B13B", name: "Arms", note: "Each arm slides straight in and out in its guide. A dark stud on its inner end sits in one of the slots." }
  ],
  controls: [{ type: "range", id: "turn", label: "Turn the small gear", min: 0, max: 270, step: 5, value: 240, unit: "°",
    presets: [[0, "Smallest"], [135, "Middle"], [270, "Largest"]] }],
  readouts: [{ id: "pin", label: "Small gear" }, { id: "size", label: "Size" }],
  views: { "3d": [160, 120, 690], front: [0, 0, 730], side: [720, 30, -20] },
  target: [0, 0, -20],
  how: [
    "Turn the small gear and it turns the big slotted gear the other way. The arms cannot turn with the gear, because each one is held in a straight guide. They can only slide in and out.",
    "Each slot curves outwards as it goes round. When the gear turns, the slot slides past the stud and pushes it further out, or lets it come in. All six slots are the same, so all six arms move together and the rim stays round.",
    "A bigger pulley moves the belt faster at the same speed of turning. Try Smallest, then Largest, and watch the gaps in the rim open up."
  ],
  note: "This model is rebuilt from Brown's drawing. The shaft, its bearing, the spokes behind the arms, the sizes and the number of teeth were made up. Brown does not say how the small gear is turned; here it has a square end for a key. The pulley is shown turning so you can see that the whole thing goes round together.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var NC = 36, NP = 12, MD = 4.4;
    var o = this.o = {
      spin: 0, u: (+this.controls[0].value) / 270, NC: NC, NP: NP,
      R1: 28, PSI: Math.PI / 2, L: 124, arms: [], segs: []
    };
    o.K = 34 / o.PSI;                                       // slot radius goes 28 .. 62 over a quarter turn
    var root = o.root = new T.Group(); scene.add(root);    // everything that turns with the shaft

    // body: shaft and hub, a disc and six spokes, all z -22..-12 except the shaft
    P.at(P.cylZ(16, 76, c.mat("frame")), 0, 0, -28, root);                  // shaft z -66..10, through the bearing at z -60..-46
    P.at(P.cylZ(40, 10, c.mat("frame")), 0, 0, -17, root);                  // disc r 40, z -22..-12
    o.th = [];
    for (i = 0; i < 6; i++) {
      var th = i * Math.PI / 3, sp = new T.Group(); sp.rotation.z = th; root.add(sp); o.th.push(th);
      P.at(P.box(102, 26, 10, c.mat("frame")), 89, 0, -17, sp);              // spoke x 38..140 along the arm, z -22..-12
      P.at(P.box(20, 6, 8.5, c.mat("frame")), 128, 9.5, -7.75, sp);          // cheek x 118..138, y 6.5..12.5, z -12..-3.5, on the spoke face
      P.at(P.box(20, 6, 8.5, c.mat("frame")), 128, -9.5, -7.75, sp);         // cheek y -12.5..-6.5; the arm (y -6..6) slides between
      P.at(P.box(12, 25, 3.5, c.mat("frame")), 128, 0, -1.75, sp);           // strap x 122..134, z -3.5..0, across the cheek tops
      P.at(P.cylZ(5, 1, c.mat("frame", "dark")), 128, 0, .5, sp);             // rivet head z 0..1 on the strap face
    }
    // plate behind the small gear, between the arms at 60 and 120 degrees
    var ps = new T.Shape(), a0 = 70 * Math.PI / 180, a1 = 110 * Math.PI / 180;
    ps.absarc(0, 0, 140, a0, a1, false); ps.absarc(0, 0, 78, a1, a0, true);
    var pg = new T.ExtrudeGeometry(ps, { depth: 10, bevelEnabled: false, curveSegments: 24 }); pg.translate(0, 0, -22);
    root.add(new T.Mesh(pg, c.mat("frame")));                                // plate z -22..-12

    // slotted wheel: slot i centre line at radius R1 + K psi, angle th_i + psi, psi 0..PSI (in the wheel's own frame)
    function slot(phi) {
      var h = 5.5, n = 40, pts = [], j, A = [], B = [];
      function cen(p) { var r = o.R1 + o.K * p; return [r * Math.cos(phi + p), r * Math.sin(phi + p)]; }
      function tan(p) { var r = o.R1 + o.K * p, x = o.K * Math.cos(phi + p) - r * Math.sin(phi + p), y = o.K * Math.sin(phi + p) + r * Math.cos(phi + p), l = Math.hypot(x, y); return [x / l, y / l]; }
      for (j = 0; j <= n; j++) {
        var p = o.PSI * j / n, q = cen(p), t = tan(p);
        A.push([q[0] - h * t[1], q[1] + h * t[0]]); B.push([q[0] + h * t[1], q[1] - h * t[0]]);
      }
      function cap(p, sgn) {      // half circle round the end, from the +normal side to the -normal side
        var q = cen(p), t = tan(p), out = [];
        for (var s = 1; s < 12; s++) { var a = Math.PI * s / 12, cn = Math.cos(a), sn = Math.sin(a) * sgn;
          out.push([q[0] + h * (cn * -t[1] + sn * t[0]), q[1] + h * (cn * t[0] + sn * t[1])]); }
        return out;
      }
      pts = A.concat(cap(o.PSI, 1), B.reverse(), cap(0, -1).reverse());
      var path = new T.Path(); path.moveTo(pts[0][0], pts[0][1]);
      for (j = 1; j < pts.length; j++) path.lineTo(pts[j][0], pts[j][1]);
      path.closePath();
      return path;
    }
    var holes = [];
    for (i = 0; i < 6; i++) holes.push(slot(o.th[i]));
    o.wheel = new T.Group(); o.wheel.position.z = 3; root.add(o.wheel);
    var wg = P.spurGear({ teeth: NC, module: MD, width: 10, bore: 16.5, holes: holes, material: c.mat("wheel") });
    o.wheel.add(wg);                                                          // wheel z -2..8, turns on the shaft (r 16)
    o.cd = wg.pitchRadius;

    // small gear on a pin from the plate, centres a sum of pitch radii apart (79.2 + 26.4)
    o.pin = new T.Group(); root.add(o.pin);
    var pgear = P.spurGear({ teeth: NP, module: MD, width: 10, material: c.mat("pinion") });
    o.cd += pgear.pitchRadius; o.pin.position.set(0, o.cd, 3); o.pitchP = pgear.pitch; o.pitchW = wg.pitch;
    o.pin.add(pgear);                                                         // z -2..8
    P.at(P.cylZ(5, 22, c.mat("pinion")), 0, 0, -4, o.pin);                   // pin z -15..7 inside; from the plate face z -12 (local -15) up
    P.at(P.box(10, 10, 6, c.mat("pinion")), 0, 0, 8, o.pin);                 // square end z 8..14 on the gear face
    P.at(P.box(3, 7, 1, c.mat("pinion", "dark")), 0, 2, 11.5, o.pin);         // mark z 14..15, lifted off the square end

    // arms and rim pieces, each in a group turned to its spoke; the arm slides along local +X
    var RC = 178, BETA = 25 * Math.PI / 180;
    var rs = new T.Shape(); rs.absarc(0, 0, RC + 8, -BETA, BETA, false); rs.absarc(0, 0, RC, BETA, -BETA, true);
    var rg = new T.ExtrudeGeometry(rs, { depth: 40, bevelEnabled: false, curveSegments: 40 }); rg.translate(0, 0, -30);   // z -30..10
    for (i = 0; i < 6; i++) {
      var g = new T.Group(); g.rotation.z = o.th[i]; root.add(g);
      var slide = new T.Group(); g.add(slide);                              // slide.position.x = stud radius
      P.at(P.box(o.L + 8, 12, 8, c.mat("arms")), (o.L - 8) / 2, 0, -8, slide);   // arm x -8..L from the stud, y -6..6, z -12..-4 on the body face
      P.at(P.cylZ(4, 14, c.mat("arms", "dark")), 0, 0, 3, slide);              // stud z -4..10, through the slot (wheel z -2..8)
      var seg = new T.Mesh(rg, c.mat("rim")); seg.position.x = o.L - RC; slide.add(seg);   // inner face crosses the arm end at x L
      o.arms.push(slide);
    }
    // supports: a bearing behind the pulley and a base
    var br = P.bearingBlock({ bore: 16.5, outer: 30, drop: 200, width: 14, material: c.fixed });
    P.at(br, 0, 0, -53, scene);                                               // z -60..-46, foot at y -200
    P.at(P.box(140, 12, 90, c.fixed), 0, -206, -53, scene);                   // base y -212..-200, z -98..-8; rim reaches y -194 at most
  },

  step: function (c, dt, S) {
    var o = this.o, i, tgt = (+S.controls.turn) / 270, d = tgt - o.u, mx = .45 * dt;
    o.u += Math.max(-mx, Math.min(mx, d));
    o.spin += S.w * dt;
    o.root.rotation.z = o.spin;
    var psi = o.PSI * o.u, rho = o.R1 + o.K * psi;                         // stud on slot and on its radial guide: exact
    o.wheel.rotation.z = -psi;                                               // wheel angle in the body
    o.pin.rotation.z = psi * o.NC / o.NP + o.pitchP / 2;                     // opposite way, three times as far; half a tooth to mesh at the top
    for (i = 0; i < 6; i++) o.arms[i].position.x = rho;
    var ri = rho + o.L, rmin = o.R1 + o.L;
    S.set("pin", Math.round(o.u * 270) + "°");
    S.set("size", Math.round(100 * ri / rmin) + "%");
  }
});
