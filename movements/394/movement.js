M507.define({
  number: 394,
  title: "Parsons's endless rack",
  lede: "A steam piston pushes a long frame in and out. Teeth all round the inside of the frame turn a small gear, always the same way. So the in and out push becomes steady turning, with no crank.",
  alt: "A long flat frame with rounded ends and teeth all round the inside of its opening. A small gear sits inside the opening and meshes with the upper row of teeth. A rod runs from the right end of the frame into a see-through steam cylinder that rocks on two pins.",
  parts: [
    { key: "rack", color: "#5E7387", name: "Endless rack", note: "A frame with teeth all round the inside of its opening, and a rod to the piston. The steam pushes it in and out." },
    { key: "pinion", color: "#C8873A", name: "Pinion", note: "A small gear, called a pinion, on a shaft that stays in one place. It always turns the same way. Watch the red stripe to count its turns." },
    { key: "flanges", color: "#4FA58A", name: "Two flanges", note: "Two round plates behind the gear, one big and one small. They run in a groove on the side of the frame and keep the gear's teeth in mesh." },
    { key: "piston", color: "#D9B13B", name: "Piston", note: "Steam pushes it to and fro inside the cylinder. Its rod is fixed to the frame." }
  ],
  controls: [{ id: "dir", label: "Pinion turns", value: "ccw", options: [["ccw", "Anticlockwise"], ["cw", "Clockwise"]] }],
  speed: { min: 5, max: 40, value: 15 },
  closed: { label: "Cylinder" },
  readouts: [{ id: "turns", label: "Pinion" }, { id: "pos", label: "Piston" }],
  views: { "3d": [168, 105, 497], front: [-110, 0, 480], top: [-70, 800, 40] },
  target: [-56, -17, 16],
  distance: [250, 2000],
  how: [
    "Steam pushes the piston, and the piston rod pushes the frame. The frame has teeth all round the inside of its opening. The small gear, called a pinion, sits inside and meshes with the upper row.",
    "As the frame moves one way, the upper teeth turn the pinion. At the end of the stroke the pinion rolls round the curved end and meets the lower row. Now the frame comes back, and the lower teeth turn the pinion the same way as before. The frame must rise and fall a little for this, so the cylinder rocks on two pins. Two flanges behind the pinion run in a groove on the frame and keep the teeth from slipping out.",
    "Try Anticlockwise, then Clockwise. See which way the frame moves while the pinion is on the upper row. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's description and drawing. Brown shows only the frame, the pinion and the rod. The rocking cylinder, its posts, the bearing and base, and all sizes and numbers of teeth were made up. How the two flanges sit in the groove is our guess: the big one runs against the outer wall and the small one against the inner wall. The pinion is turned at a steady speed for you; in a real engine the steam does the pushing.",

  // Sizes. Module 3, pinion 12 teeth (pitch radius 18). The rack's pitch outline is a stadium: straight runs 2 LH long
  // (14 teeth) at y = +-H, half circles of radius H (11 teeth each) round x = +-LH. The pinion centre runs on the same
  // stadium shrunk by RP (half height HC). Q: rocking pins of the cylinder, this far right of the pinion shaft.
  dims: { MD: 3, NP: 12, RP: 18, H: 33, HC: 15, LH: 21 * Math.PI, NR: 50, RL: 23, RS: 9, QD: 300, PX: -110 },

  segs: function () { var D = this.dims, a = 2 * D.LH, b = Math.PI * D.H; return [a, b, a, b]; },

  /** Point of the pitch outline at arc length s (s = 0 at the right end of the top run, going left, anticlockwise):
      {x, y, psi (direction of travel), end (true on a half circle), cx (that half circle's centre)}. */
  outline: function (s) {
    var D = this.dims, sg = this.segs(), L = sg[0] + sg[1] + sg[2] + sg[3], al;
    s = ((s % L) + L) % L;
    if (s < sg[0]) return { x: D.LH - s, y: D.H, psi: Math.PI };
    s -= sg[0];
    if (s < sg[1]) { al = Math.PI / 2 + s / D.H; return { x: -D.LH + D.H * Math.cos(al), y: D.H * Math.sin(al), psi: al + Math.PI / 2 }; }
    s -= sg[1];
    if (s < sg[2]) return { x: -D.LH + s, y: -D.H, psi: 2 * Math.PI };
    s -= sg[2]; al = -Math.PI / 2 + s / D.H;
    return { x: D.LH + D.H * Math.cos(al), y: D.H * Math.sin(al), psi: al + Math.PI / 2 };
  },

  /** Rolling inside the outline. The pinion centre is RP inside the contact point. Its turn relative to the frame is
      minus (distance its centre has travelled) / RP. sc(s) is that centre distance, piecewise linear in s, so it inverts
      exactly. Returns {L, LC, sc(s), s(sc), centre(s)}. */
  kin: function () {
    var self = this, D = this.dims, sg = this.segs(), k = D.HC / D.H, ss = [0], cc = [0], i;
    for (i = 0; i < 4; i++) { ss.push(ss[i] + sg[i]); cc.push(cc[i] + sg[i] * (i % 2 ? k : 1)); }
    return {
      L: ss[4], LC: cc[4],
      sc: function (s) { var j = 0; s = ((s % ss[4]) + ss[4]) % ss[4]; while (j < 3 && s > ss[j + 1]) j++; return cc[j] + (s - ss[j]) * (cc[j + 1] - cc[j]) / (ss[j + 1] - ss[j]); },
      s: function (v) { var j = 0, n = Math.floor(v / cc[4]); v -= n * cc[4]; while (j < 3 && v > cc[j + 1]) j++; return n * ss[4] + ss[j] + (v - cc[j]) * (ss[j + 1] - ss[j]) / (cc[j + 1] - cc[j]); },
      centre: function (s) { var p = self.outline(s); return { x: p.x - D.RP * Math.sin(p.psi), y: p.y + D.RP * Math.cos(p.psi) }; }
    };
  },

  /** Whole pose for a centre distance v travelled (v = 0 with the pinion mid-way along the top run, as drawn).
      The pinion shaft stays at the world origin of the mechanism; the frame's centre line must pass through the rocking
      pins at (QD, 0), which fixes its tilt: sin(phi) = (centre y) / QD. Returns frame position, tilt, pinion turn
      (relative to the world), and q = where the pins sit along the rod (frame coordinates). */
  pose: function (k, v) {
    var D = this.dims, s0 = 7 * Math.PI * D.MD, v0 = k.sc(s0), s = k.s(v0 + v), p = k.centre(s);
    var ph = Math.asin(p.y / D.QD), c = Math.cos(ph), sn = Math.sin(ph);
    var tx = -(c * p.x - sn * p.y), ty = -(sn * p.x + c * p.y);
    var rel = Math.PI / 2 + Math.PI / D.NP - v / D.RP;                     // a gap faces up at v = 0, round the tooth at x = 0
    return { tx: tx, ty: ty, ph: ph, rot: rel + ph, q: (D.QD - tx) * c - ty * sn, s: s, p: p, rel: rel };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, self = this, i, k;
    var o = this.o = { v: 0, k: this.kin() };
    var pitch = Math.PI * D.MD, mr = c.mat("rack");
    function stadium(path, half, cx, hole) {                                  // closed stadium of half height `half`, ends round x = +-cx
      var f = hole ? -1 : 1;
      path.moveTo(cx, -half * f); path.absarc(cx, 0, half, -Math.PI / 2 * f, Math.PI / 2 * f, hole);
      path.absarc(-cx, 0, half, Math.PI / 2 * f, 1.5 * Math.PI * f, hole);
      return path;
    }
    function ext(sh, z0, z1, m) { var g = new T.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 40 }); g.translate(0, 0, z0); return new T.Mesh(g, m); }

    o.frame = new T.Group(); scene.add(o.frame);
    // front plate z 0..10: outside a stadium of half height 46, inside the toothed pitch outline (tips 3 in, roots 3.75 out)
    function put(s, off) { var p = self.outline(s); return new T.Vector2(p.x + off * Math.sin(p.psi), p.y - off * Math.cos(p.psi)); }
    var edge = [], prof = [[-.5, 1.25], [-.27, 1.25], [-.11, -1], [.11, -1], [.27, 1.25]];
    for (i = 0; i < D.NR; i++) for (k = 0; k < prof.length; k++) edge.push(put((i + prof[k][0]) * pitch, prof[k][1] * D.MD));
    var front = stadium(new T.Shape(), 46, D.LH, false), th = new T.Path();
    edge.slice().reverse().forEach(function (q, j) { if (j) th.lineTo(q.x, q.y); else th.moveTo(q.x, q.y); });
    th.closePath(); front.holes.push(th);
    o.frame.add(ext(front, 0, 10, mr));
    // groove layer z -12..0: outside half height 46, opening half height HC + RL = 38 (the big flange runs on its edge)
    var gl = stadium(new T.Shape(), 46, D.LH, false); gl.holes.push(stadium(new T.Path(), D.HC + D.RL, D.LH, true));
    o.frame.add(ext(gl, -12, 0, mr));
    // inner island z -12..-6, half height HC - RS = 6 (the small flange runs on its edge), on the back plate's face
    o.frame.add(ext(stadium(new T.Shape(), D.HC - D.RS, D.LH, false), -12, -6, mr));
    o.frame.add(ext(stadium(new T.Shape(), 46, D.LH, false), -16, -12, c.mat("rack", "light")));   // back plate z -16..-12, pale so the teeth show against it
    var rodL = D.QD - 105;                                                     // rod x 105..QD in frame coordinates (starts inside the frame's round end, which reaches x = LH + 46 = 112)
    P.at(P.cylX(7, rodL, mr), 105 + rodL / 2, 0, -3, o.frame);                // radius 7, centred on the frame's middle depth z = -3
    o.piston = P.at(P.cylX(19.5, 8, c.mat("piston")), D.QD, 0, -3, o.frame);  // piston x QD-4..QD+4, in the bore (radius 21)

    // pinion: teeth z .5..9.5, big flange z -5.5..0.5 (radius RL), small flange z -11.5..-5.5 (radius RS), hub z 9.5..12
    o.pin = new T.Group(); P.at(o.pin, D.PX, 0, 0, scene);
    P.at(P.spurGear({ teeth: D.NP, module: D.MD, width: 9, material: c.mat("pinion") }), 0, 0, 5, o.pin);
    P.at(P.cylZ(D.RL, 5, c.mat("flanges")), 0, 0, -3, o.pin);                 // big flange z -5.5..-.5, clear of the front plate (z 0..10)
    P.at(P.cylZ(10, 1.2, c.mat("pinion")), 0, 0, 0, o.pin);                   // spacer z -0.6..0.6, radius 10, inside the tooth tips (r 30 from the frame axis at most 25)
    P.at(P.cylZ(D.RS, 6, c.mat("flanges")), 0, 0, -8.5, o.pin);
    P.at(P.cylZ(7, 2.5, c.mat("pinion")), 0, 0, 10.75, o.pin);                // hub z 9.5..12
    P.at(P.cylZ(4, 44.5, c.mat("pinion")), 0, 0, 31.75, o.pin);               // shaft z 9.5..54, ends at the bearing's front face
    P.at(P.box(6, 2.5, 1, c.mat("pinion", "mark")), 10.5, 0, 10, o.pin);     // red stripe x 7.5..13.5 (beside the hub, r 7, inside the roots, r 14.25), z 9.5..10.5
    // bearing z 40..54 on the base (top y -80)
    P.at(P.bearingBlock({ bore: 4.5, outer: 12, drop: 80, width: 14, material: c.fixed }), D.PX, 0, 47, scene);

    // rocking cylinder round the pins at (PX + QD, 0): outside radius 24, bore 21, x -95..95 about the pins, axis along the rod
    o.cyl = c.shell(new T.Group()); P.at(o.cyl, D.PX + D.QD, 0, -3, scene);
    var cy = P.steamCylinder({ radius: 24, length: 190, hole: 7.5, material: c.fixed });
    cy.rotation.z = Math.PI / 2; cy.position.x = -95; o.cyl.add(cy);          // cover with the gland at x = -95, closed end x = 95
    [1, -1].forEach(function (sd) { P.at(P.cylZ(5, 10, c.fixed), 0, 0, sd * 28.5, o.cyl); });   // pins z +-(23.5..33.5), from inside the wall to the posts
    // posts x -8..8 round the pins, z 30.5..38.5 and -44.5..-36.5 (cylinder axis at z -3), y -80..10 on the base
    [1, -1].forEach(function (sd) { P.at(P.box(16, 90, 8, c.fixed), D.PX + D.QD, -35, -3 + sd * 37.5, scene); });
    P.at(P.box(640, 8, 120, c.fixed), -10, -84, 0, scene);                    // base x -330..310, y -88..-80, z -60..60
  },

  step: function (c, dt, S) {
    var o = this.o, D = this.dims, sgn = S.controls.dir === "cw" ? 1 : -1;
    o.v += sgn * S.w * dt * D.RP;
    var q = this.pose(o.k, o.v);
    o.frame.position.set(D.PX + q.tx, q.ty, 0);
    o.frame.rotation.z = q.ph;
    o.pin.rotation.z = q.rot;
    o.cyl.rotation.z = q.ph;
    function f(v, d) { v = Math.round(v * d) / d; return (v < 0 ? "−" + -v : "" + v); }
    S.set("turns", f(-o.v / D.RP / (2 * Math.PI), 10) + " turns");
    S.set("pos", f(D.QD - q.q, 1) + " mm");
  }
});
