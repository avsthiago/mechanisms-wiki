M507.define({
  number: 403,
  title: "Cyclograph of three rules",
  lede: "Three flat rules fastened together draw a circle arc without using its centre. That helps when the centre would fall far off the paper. Two pins and a pencil are all it needs.",
  alt: "Two long rules cross near the top to make a wide upside-down V, with a third rule fastened across them lower down. Two short pins stand in the paper, one inside each sloping rule. A pencil sits in the corner where the rules cross and draws an arc as the frame slides against the pins.",
  parts: [
    { key: "rules", color: "#5E7387", name: "Sloping rules", note: "Two rules crossing at the top. Their inner edges make a fixed corner, and the pencil sits in that corner." },
    { key: "brace", color: "#D9B13B", name: "Brace", note: "A third rule fastened across the other two. It keeps the corner from opening or closing." },
    { key: "pins", color: "#4FA58A", name: "Pins", note: "Two short pins stuck in the paper at the ends of the arc. The rules are pushed against them all the time." },
    { key: "pencil", color: "#C2503F", name: "Pencil", note: "Held in the corner of the rules. Watch the line it leaves." }
  ],
  controls: [{ type: "range", id: "h", label: "Height of the arc", min: 40, max: 110, step: 5, value: 75, unit: " mm", presets: [[45, "Low"], [75, "Medium"], [105, "High"]] }],
  speed: { min: 1, max: 12, value: 4, label: "Speed", unit: " sweeps/min" },
  readouts: [{ id: "a", label: "Corner" }, { id: "r", label: "Radius" }],
  views: { "3d": [347, -150, 743], front: [0, -40, 860], side: [860, -200, 300] },
  target: [0, -40, 0],
  distance: [300, 1600],
  how: [
    "Mark the two ends of the arc and its highest point. Lay the rules from the ends up to the top point and fasten them, with the brace across. Push a pin in at each end. Now slide the frame so both rules always touch their pins. The pencil in the corner draws the arc.",
    "The corner of the rules never changes its angle. A rule from old geometry says that every point that sees the two pins at the same angle lies on one circle. So the corner can only move along that circle, and the pencil draws part of it.",
    "Try a low arc, then a high one. A higher arc makes a sharper corner and a smaller circle."
  ],
  note: "This model is rebuilt from Brown's drawing. The paper, the size of the rules and the thin guide lines were added. The rules are drawn longer than Brown's so the pins stay on them for most of the arc; the last bit near each pin is not drawn. The pencil sits a little inside the corner so it clears the rules; the pins touch the rules at the same little distance, which keeps the drawn line a true circle.",

  build: function (c) {
    var P = c.P, o = this.o = { C: 150, RP: 3.5, W: 22, h: null, ph: 0 };
    P.at(P.box(760, 520, 2, c.fixed), 0, -40, -1, c.scene);                        // paper: x -380..380, y -300..220, z -2..0
    o.pinA = P.at(P.cylZ(o.RP, 4.8, c.mat("pins")), -o.C, 0, 2.4, c.scene);         // pin z 0..4.8, under the brace (z 5.7 and up)
    o.pinB = P.at(P.cylZ(o.RP, 4.8, c.mat("pins")), o.C, 0, 2.4, c.scene);
    o.frame = new c.THREE.Group(); c.scene.add(o.frame);
    o.guide = new c.THREE.Group(); c.scene.add(o.guide);
    o.ink = P.inkTrail({ material: c.mat("pencil", "dark"), width: 1.6, max: 3000, step: 1 }); c.scene.add(o.ink);
    o.pen = P.at(P.pencil({ material: c.mat("pencil"), tip: c.mat("pencil", "dark") }), 0, 0, 1, c.scene);
    o.c = c;
  },

  shape: function (h) {
    var o = this.o, c = o.c, P = c.P, C = o.C, RP = o.RP, W = o.W, s = Math.hypot(C, h), i;
    [o.frame, o.guide].forEach(function (g) { while (g.children.length) { var m = g.children.pop(); if (m.geometry) m.geometry.dispose(); } });
    o.R = (C * C + h * h) / (2 * h); o.oy = h - o.R; o.al = Math.asin(C / o.R); o.fm = .8 * o.al;
    o.u1 = Math.atan2(-h, -C);                                                         // direction from the corner to the left pin at the start
    var le = 2 * o.R * Math.sin((o.fm + o.al) / 2) + 22, over = 55;                     // rule reaches past the farthest pin by 22
    function rule(sx, z0, key) {                                                        // working line through the corner, body outside it
      var ux = sx * -C / s, uy = -h / s, nx = sx * -h / s, ny = C / s, pts = [];
      [[-over, RP], [le, RP], [le, RP + W], [-over, RP + W]].forEach(function (q) { pts.push([q[0] * ux + q[1] * nx, q[0] * uy + q[1] * ny]); });
      if (sx < 0) pts.reverse();
      return P.at(P.outlinePlate({ points: pts, depth: 4, z0: z0, material: c.mat(key) }), 0, 0, 0, o.frame);
    }
    rule(1, 1.4, "rules");                                                              // z 1.4..5.4
    rule(-1, 1.7, "rules");                                                             // z 1.7..5.7, laid over the first where they cross
    var tb = 1.12 * s, yb = -tb * h / s;                                               // brace top edge, on the paper's y axis of the frame
    function edgeX(q, y) { var t = (q * C / s - y) * s / h; return t * C / s + q * h / s; }   // |x| of a line in a rule, q from its working line
    var bw = 2 * edgeX(RP + W, yb - 22) + 24;                                           // reaches past both rules' outer edges
    P.at(P.box(bw, 22, 3.5, c.mat("brace")), 0, yb - 11, 7.45, o.frame);               // brace y yb-22..yb, z 5.7..9.2, resting on the upper rule
    [-1, 1].forEach(function (sx) { P.at(P.cylZ(3.2, 1, c.mat("brace", "dark")), sx * edgeX(RP + W / 2, yb - 11), yb - 11, 9.7, o.frame); });   // screw heads z 9.2..10.2
    var dm = c.mat("pins", "dark");                                                     // thin guide lines on the paper, z 0.3..0.5
    for (i = -C; i < C; i += 12) P.at(P.box(6, .8, .2, dm), i + 3, 0, .4, o.guide);
    for (i = 0; i < h - 2; i += 12) P.at(P.box(.8, Math.min(6, h - i), .2, dm), 0, i + 3, .4, o.guide);
    o.ink.clear();
  },

  step: function (c, dt, S) {
    var o = this.o, h = +S.controls.h;
    if (h !== o.h) { o.h = h; this.shape(h); o.ph = 0; }
    o.ph += S.w * dt / (2 * Math.PI);
    var f = o.fm * Math.sin(2 * Math.PI * o.ph), x = o.R * Math.sin(f), y = o.oy + o.R * Math.cos(f);
    var rot = Math.atan2(0 - y, -o.C - x) - o.u1;                                     // the left rule's working line always passes through the left pin
    o.frame.position.set(x, y, 0); o.frame.rotation.z = rot;
    o.pen.place(x, y, 1, -1); o.pen.rotation.z = rot;
    o.ink.push(x, y, .8);
    S.set("a", Math.round(2 * Math.atan2(o.C, h) * 180 / Math.PI) + "°");
    S.set("r", (o.R / 10).toFixed(1) + " cm");
  }
});
