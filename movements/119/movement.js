M507.define({
  number: 119,
  title: "Endless rack",
  lede: "A small gear turns steadily one way, yet the long bar beside it slides to the right and then back to the left. The gear runs along the top of the bar, round its end and back along the bottom. This is a way to turn a steady turning into a back and forth push.",
  alt: "A long flat bar with rounded ends has teeth all round its edge. It sits between a top beam and a bottom beam, with a rod sticking out of each end. A small gear meshes with the teeth on top of the bar. Its shaft passes through a long slot in an upright bar.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear. It turns the same way all the time. Watch the red stripe to count its turns." },
    { key: "rack", color: "#C8873A", name: "Endless rack", note: "A long bar with teeth all the way round its edge, and a rod out of each end. It slides left and right in two posts. It cannot turn." },
    { key: "bar", color: "#4FA58A", name: "Slotted bar", note: "It stands still. The pinion's shaft slides up and down in its slot, so the pinion can pass from the top of the rack to the bottom." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the pinion. In a real machine an engine would do this." }
  ],
  controls: [{ id: "dir", label: "Pinion turns", value: "ccw", options: [["ccw", "Anticlockwise"], ["cw", "Clockwise"]] }],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "turns", label: "Pinion" }, { id: "pos", label: "Bar" }],
  views: { "3d": [450, 230, 720], front: [0, 0, 800], side: [800, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Turn the crank and the small gear, called a pinion, turns with it. It meshes with the teeth along the top of the rack. Along the top it pushes the rack one way.",
    "At the end of the rack the pinion rolls round the curved end. Its shaft slides down the slot to the underside. Along the bottom the same turning pushes the rack the other way. The pinion never changes direction, but the rack goes out and comes back. A rod out of each end keeps it moving in a straight line.",
    "Try Anticlockwise, then Clockwise. See which way the bar moves while the pinion is on the top run."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the two posts, the top beam, the base and all the sizes and numbers of teeth were made up. The two holes Brown draws in the rack were left out. The pinion's shaft is held only by the slot, as Brown describes. The teeth round the curved ends are spaced evenly along the loop, so they mesh well but are not exact gear teeth.",

  // Sizes. Module 6, pinion 8 teeth, pitch 6 pi. The rack's pitch outline runs anticlockwise from the right end of the top run:
  // the top run (length 2 LH, heading left), a half circle round the left end (radius H), the bottom run, the right end.
  dims: { MD: 6, NP: 8, RP: 24, H: 36, LH: 12 * Math.PI, NR: 20 },

  segs: function () { var D = this.dims, a = 2 * D.LH, b = Math.PI * D.H; return [a, b, a, b]; },

  /** Point of the pitch outline at arc length s: {x, y, psi (direction of travel, unwrapped from pi)}. */
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

  /** Rolling kinematics. The pinion centre is one pinion radius to the right of the direction of travel (outside the rack).
      With the contact at arc length s, the pinion has turned u = s / RP + psi - pi (no slip). u grows linearly in s on each
      segment, so it inverts exactly. Returns {U, L, u(s), s(u), centre(s)}. */
  kin: function () {
    var self = this, D = this.dims, sg = this.segs(), L = sg[0] + sg[1] + sg[2] + sg[3];
    var ss = [0, sg[0], sg[0] + sg[1], 2 * sg[0] + sg[1], L], psis = [Math.PI, Math.PI, 2 * Math.PI, 2 * Math.PI, 3 * Math.PI];
    var uu = ss.map(function (s, k) { return s / D.RP + psis[k] - Math.PI; });
    return {
      L: L, U: uu[4],
      u: function (s) { return s / D.RP + self.outline(s).psi - Math.PI; },
      s: function (v) {
        var k = 0; while (k < 3 && v > uu[k + 1]) k++;
        return ss[k] + (v - uu[k]) / (uu[k + 1] - uu[k]) * (ss[k + 1] - ss[k]);
      },
      centre: function (s) { var p = self.outline(s); return { x: p.x + D.RP * Math.sin(p.psi), y: p.y - D.RP * Math.cos(p.psi) }; }
    };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, self = this, i;
    var o = this.o = { a: 0, k: this.kin() };
    o.uStart = D.LH / D.RP;                                                   // pinion mid-way along the top run (s = LH)
    var pitch = Math.PI * D.MD;

    // pinion z 0..14 in the rack's plane, hub z 14..17, shaft z 14..44 through the slot (bar z 18..26), crank arm z 44..50, handle z 50..72
    o.pin = new T.Group(); scene.add(o.pin);
    o.rot = new T.Group(); o.pin.add(o.rot);
    P.at(P.spurGear({ teeth: D.NP, module: D.MD, width: 14, material: c.mat("pinion") }), 0, 0, 7, o.rot);   // z 0..14
    P.at(P.cylZ(10, 3, c.mat("pinion")), 0, 0, 15.5, o.rot);                  // hub z 14..17, on the gear face
    P.at(P.box(13, 3, 1, c.mat("pinion", "mark")), 15.5, 0, 15, o.rot);       // red stripe x 9..22, z 14.5..15.5, lifted .5 off the face
    P.at(P.cylZ(6, 30, c.mat("pinion")), 0, 0, 29, o.rot);                    // shaft z 14..44
    P.at(P.box(40, 10, 6, c.mat("crank")), 14, 0, 47, o.rot);                 // arm x -6..34, z 44..50, on the shaft end
    P.at(P.cylZ(4.5, 22, c.mat("crank")), 28, 0, 61, o.rot);                  // handle z 50..72, on the arm face

    // The rack: a flat slab z 0..14 whose edge is the toothed pitch outline (teeth point outward, tips 6 out, roots 7.5 in).
    function put(s, off) { var p = self.outline(s); return new T.Vector2(p.x + off * Math.sin(p.psi), p.y - off * Math.cos(p.psi)); }
    var edge = [], prof = [[-.5, -1.25], [-.27, -1.25], [-.11, 1], [.11, 1], [.27, -1.25]], k;
    for (i = 0; i < D.NR; i++) for (k = 0; k < prof.length; k++) edge.push(put((i + prof[k][0]) * pitch, prof[k][1] * D.MD));
    var rg = new T.ExtrudeGeometry(new T.Shape(edge), { depth: 14, bevelEnabled: false });
    o.rack = new T.Group(); scene.add(o.rack);
    o.rack.add(new T.Mesh(rg, c.mat("rack")));
    var tip = D.LH + D.H + D.MD;                                              // outer tooth tips at the ends, x = 70.3
    [-1, 1].forEach(function (sd) { P.at(P.cylX(6, 230, c.mat("rack")), sd * (D.LH + D.H - 4 + 115), 0, 7, o.rack); });   // rods x 69.7..299.7 start inside the solid slab (solid to x 56.8 or more), z 1..13

    // slotted bar x -13..13, y -100..100, z 18..26; slot 14 wide, shaft centres y -60..60 (radius 6)
    var bs = new T.Shape(); bs.moveTo(-13, -100); bs.lineTo(13, -100); bs.lineTo(13, 100); bs.lineTo(-13, 100); bs.closePath();
    var sl = new T.Path(); sl.absarc(0, -60, 7, Math.PI, 2 * Math.PI, false); sl.absarc(0, 60, 7, 0, Math.PI, false); sl.closePath(); bs.holes.push(sl);
    var bg = new T.ExtrudeGeometry(bs, { depth: 8, bevelEnabled: false }); bg.translate(0, 0, 18);
    scene.add(new T.Mesh(bg, c.mat("bar")));

    // supports. Base x -210..210, y -110..-100, z -3..27; top beam y 100..110, same footprint, on the posts and the bar.
    P.at(P.box(420, 10, 30, c.fixed), 0, -105, 12, scene);
    P.at(P.box(420, 10, 30, c.fixed), 0, 105, 12, scene);
    [-187, 187].forEach(function (x) {
      // post x ±(181..193), y -100..100, z -3..17, with a window y -8..8 for the rod (radius 6, z 1..13)
      P.at(P.box(12, 92, 20, c.fixed), x, -54, 7, scene);                    // y -100..-8, on the base
      P.at(P.box(12, 92, 20, c.fixed), x, 54, 7, scene);                     // y 8..100, under the top beam
      P.at(P.box(12, 16, 4, c.fixed), x, 0, -1, scene);                      // cheek z -3..1
      P.at(P.box(12, 16, 4, c.fixed), x, 0, 15, scene);                      // cheek z 13..17
    });
  },

  step: function (c, dt, S) {
    var o = this.o, D = this.dims, k = o.k, sgn = S.controls.dir === "cw" ? -1 : 1;
    o.a += sgn * S.w * dt;
    var u = (o.uStart + o.a) % k.U; if (u < 0) u += k.U;
    var s = k.s(u), ct = k.centre(s);
    o.pin.position.y = ct.y;
    o.rack.position.x = -ct.x;                                                // the pinion's centre stays on x = 0
    o.rot.rotation.z = u + Math.PI + Math.PI / 2 - Math.PI / D.NP;
    function f(v, d) { v = Math.round(v * d) / d; return (v < 0 ? "−" + -v : v); }
    S.set("turns", f(o.a / (2 * Math.PI), 10) + " turns");
    S.set("pos", f(-ct.x, 1) + " mm");
  }
});
