M507.define({
  number: 348,
  title: "Two strokes per turn",
  lede: "A disc with two slots that cross at right angles turns on a shaft. Two pins on a long rod sit one in each slot. The rod is pushed up and down twice for every turn of the disc, which is handy where a part must work faster than the shaft turns.",
  alt: "A round disc with a cross-shaped slot turns on a shaft. A long upright rod lies across its face. Two pins on the rod ride in the two arms of the cross, and the top of the rod slides on a fixed pin held in a long slot.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Slotted disc", note: "Turns on the shaft. It has two slots that cross at right angles in the middle." },
    { key: "rod", color: "#C8873A", name: "Connecting rod", note: "The long upright bar that does the work. Watch it rise and fall twice for each turn of the disc." },
    { key: "slides", color: "#D9B13B", name: "Slides", note: "Two small blocks, one in each slot. Each one is joined to the rod by a pin and slides in and out as the disc turns." },
    { key: "guide", color: "#4FA58A", name: "Guide pin", note: "Does not move. It runs in the long slot at the top of the rod and keeps the rod upright." }
  ],
  controls: [{
    type: "range", id: "gap", label: "Gap between the two pins", min: 30, max: 66, step: 2, value: 56, unit: " mm",
    presets: [[36, "Narrow"], [56, "Medium"], [66, "Wide"]]
  }],
  readouts: [{ id: "turns", label: "Turned" }, { id: "strokes", label: "Rod strokes" }, { id: "h", label: "Rod height" }],
  views: { "3d": [210, 120, 720], front: [0, 40, 740], side: [700, 40, 40] },
  target: [0, 70, 0],
  how: [
    "The disc turns and the two slides move in and out along their slots. They are fixed to the rod by pins, so they drag it up and down. The slot arms are at right angles, so while one slide is near the middle the other is far out.",
    "First one slot pulls the rod down, then the other slot pushes it up. Each takes its turn in a half turn of the disc. So the rod makes two full strokes in one turn. The same idea drove the needle of a sewing machine and the blades of a saw.",
    "The slider changes the gap between the two pins. Try a narrow gap, then a wide one, and watch how far the rod travels. The number of strokes does not change."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show what holds the rod, so a fixed pin in a long slot at the top of the rod was added to keep it upright. The rod tilts a little as it moves, because it must swing a little to let both pins stay in their slots. The shaft, the support behind it and all the sizes were made up.",

  // Position of the two pins for disc angle th and pin gap d. The rod is a straight line through both pins and
  // through the fixed guide point (0, YG). s1 and s2 are how far each pin sits from the disc centre along its slot.
  kin: function (th, d, YG) {
    var ux = Math.cos(th), uy = Math.sin(th), vx = -uy, vy = ux, k;
    var phi = Math.atan2(-(d + YG) * Math.cos(th), YG * Math.sin(th));
    for (k = 0; k < 8; k++) {
      var f = -YG * d * Math.cos(phi - th) + d * d / 2 * Math.sin(2 * phi);
      var fp = YG * d * Math.sin(phi - th) + d * d * Math.cos(2 * phi);
      phi -= f / fp;
    }
    var s1 = d * Math.cos(phi), s2 = d * Math.sin(phi);
    var p1 = [s1 * ux, s1 * uy], p2 = [s2 * vx, s2 * vy];
    var rx = p1[0] - p2[0], ry = p1[1] - p2[1], L = Math.hypot(rx, ry);
    rx /= L; ry /= L;
    return { s1: s1, s2: s2, p1: p1, p2: p2, rx: rx, ry: ry, t: (0 - p1[0]) * rx + (YG - p1[1]) * ry };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var R = 88, HL = 74, HW = 7, YG = 170, DMIN = 30, DMAX = 66, TH0 = 27 * Math.PI / 180;
    var o = this.o = { th: 0, R: R, YG: YG, TH0: TH0, turns: 0 };
    // disc z -10..0 with a cross-shaped slot cut right through; shaft z -20..-10; support bar z -30..-20
    var sh = new T.Shape(), cr = [[HL, -HW], [HL, HW], [HW, HW], [HW, HL], [-HW, HL], [-HW, HW], [-HL, HW], [-HL, -HW], [-HW, -HW], [-HW, -HL], [HW, -HL], [HW, -HW]];
    sh.absarc(0, 0, R, 0, 2 * Math.PI, false);
    var hole = new T.Path(); cr.forEach(function (q, k) { if (k) hole.lineTo(q[0], q[1]); else hole.moveTo(q[0], q[1]); }); hole.closePath(); sh.holes.push(hole);
    var dg = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false, curveSegments: 48 }); dg.translate(0, 0, -10);
    o.disc = new T.Group(); scene.add(o.disc);
    o.disc.add(new T.Mesh(dg, c.mat("disc")));
    P.at(P.cylZ(4, 2.4, c.mat("disc", "dark")), 48, 48, 0.2, o.disc);               // dark dot on the face, z -1..1.4, clear of the rod at z 2
    P.at(P.cylZ(6, 10, c.mat("disc")), 0, 0, -15, scene);                           // shaft z -20..-10
    P.at(P.box(40, 300, 10, c.fixed), 0, 40, -25, scene);                            // support bar x -20..20, y -110..190, z -30..-20
    // slides, one in each slot: z -8..2, touching the rod's underside at z 2
    o.s1 = P.at(P.box(12, 12, 10, c.mat("slides")), 0, 0, -3, scene);
    o.s2 = P.at(P.box(12, 12, 10, c.mat("slides")), 0, 0, -3, scene);
    // rod z 2..10, a slot along it for the fixed guide pin; the rod's local origin is the first pin
    var lo = 1e9, hi = -1e9, a, d;
    for (d = DMIN; d <= DMAX; d += 6) for (a = 0; a < 360; a += 4) {
      var k = this.kin(TH0 + a * Math.PI / 180, d, YG); lo = Math.min(lo, k.t); hi = Math.max(hi, k.t);
    }
    var y0 = -DMAX - 24, y1 = hi + 40, w = 15, rs = new T.Shape();
    rs.moveTo(-w, y0); rs.lineTo(w, y0); rs.lineTo(w, y1); rs.lineTo(-w, y1); rs.closePath();
    var sl = new T.Path(), sw = 6, s0 = lo - 8, s1 = hi + 8;
    sl.moveTo(-sw, s0); sl.lineTo(sw, s0); sl.lineTo(sw, s1); sl.lineTo(-sw, s1); sl.closePath(); rs.holes.push(sl);
    var rg = new T.ExtrudeGeometry(rs, { depth: 8, bevelEnabled: false }); rg.translate(0, 0, 2);
    o.rod = new T.Group(); scene.add(o.rod);
    o.rod.add(new T.Mesh(rg, c.mat("rod")));
    o.h1 = P.at(P.cylZ(6, 1.2, c.mat("slides", "dark")), 0, 0, 10.6, o.rod);        // pin heads z 10..11.2, on the rod face
    o.h2 = P.at(P.cylZ(6, 1.2, c.mat("slides", "dark")), 0, -50, 10.6, o.rod);
    // fixed guide pin z -20..11 through the rod's slot, head on top
    P.at(P.cylZ(4.5, 31, c.mat("guide")), 0, YG, -4.5, scene);
    P.at(P.cylZ(8, 1.2, c.mat("guide")), 0, YG, 11.6, scene);                       // head z 11..12.2
  },

  step: function (c, dt, S) {
    var o = this.o, d = +S.controls.gap;
    o.th += S.w * dt;
    var th = o.TH0 + o.th, k = this.kin(th, d, o.YG), ang = Math.atan2(k.ry, k.rx);
    o.disc.rotation.z = th;
    o.s1.position.set(k.p1[0], k.p1[1], -3); o.s1.rotation.z = th;
    o.s2.position.set(k.p2[0], k.p2[1], -3); o.s2.rotation.z = th;
    o.rod.position.set(k.p1[0], k.p1[1], 0); o.rod.rotation.z = ang - Math.PI / 2;
    o.h2.position.y = -d;
    S.set("turns", (o.th / (2 * Math.PI) + 0).toFixed(1) + " turns");
    S.set("strokes", Math.floor(2 * o.th / (2 * Math.PI) + 1e-6) + "");
    S.set("h", Math.round(k.p1[1]) + " mm");
  }
});
