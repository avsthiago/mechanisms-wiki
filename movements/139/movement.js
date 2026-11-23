M507.define({
  number: 139,
  title: "Sliding internal rack",
  lede: "A small gear turns steadily one way, yet the frame around it slides to the right and then back to the left. The gear runs along the bottom row of teeth, round the end of the toothed ring, and back along the top row. This makes a steady turning into a back and forth push.",
  alt: "A tall rectangular frame on two small wheels, with a rod sticking out of each side. Inside it hangs an oval ring with teeth all round its inside edge. A small gear sits in the middle of the ring and meshes with the teeth along the bottom. Its shaft goes back to a plate and forward to a crank.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear, called a pinion. It turns the same way all the time. Watch the red stripe to count its turns." },
    { key: "ring", color: "#C8873A", name: "Toothed ring", note: "An oval ring with teeth all round the inside. It can slide up and down inside the frame, but it cannot slide sideways." },
    { key: "frame", color: "#4FA58A", name: "Frame", note: "The box that holds the ring. It rolls on two wheels, and a rod out of each side keeps it moving in a straight line. This is the part that goes back and forth." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the pinion. In a real machine an engine would do this." }
  ],
  controls: [{ id: "dir", label: "Pinion turns", value: "cw", options: [["cw", "Clockwise"], ["ccw", "Anticlockwise"]] }],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "turns", label: "Pinion" }, { id: "pos", label: "Frame" }, { id: "slide", label: "Ring" }],
  views: { front: [0, 0, 1000], "3d": [520, 240, 880], side: [1000, 0, 0] },
  target: [0, -20, 0],
  distance: [300, 2000],
  how: [
    "Turn the crank and the small gear, called a pinion, turns with it. The pinion stays in one place. It meshes with the teeth along the bottom of the ring. The bottom of a clockwise gear moves left, so it pushes the ring and the frame to the left.",
    "At the end of the ring the pinion rolls round the curved end. The ring slides up inside the frame, so the pinion comes to the top row. The top of a clockwise gear moves right, so now the frame goes right. The pinion never changes direction, but the frame goes out and comes back.",
    "Try Clockwise, then Anticlockwise. See which way the frame moves while the pinion is on the bottom row."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the plate behind, the base, the posts, the sizes and the number of teeth were made up. Brown also draws two small levers and a bar across the top of the frame. They were left out, because here the teeth alone guide the ring up and down. The frame is taller than in the drawing, so the ring has room to slide. The teeth round the curved ends are spaced evenly along the loop, so they mesh well but are not exact gear teeth.",

  // Sizes. Module 6, pinion 13 teeth (pitch radius 39). The ring's pitch outline runs anticlockwise from the right end of the top run:
  // the top run (length 2 LH, heading left), a half circle round the left end (radius H), the bottom run, the right end.
  // The pinion sits inside the outline, one pinion radius to the left of the direction of travel. NR teeth in all: 4 LH + 2 pi H = NR pi MD.
  dims: { MD: 6, NP: 13, RP: 39, H: 72, LH: 18 * Math.PI, NR: 36, BODY: 8 },

  segs: function () { var D = this.dims, a = 2 * D.LH, b = Math.PI * D.H; return [a, b, a, b]; },

  /** Point of the pitch outline at arc length s: {x, y, psi (direction of travel)}. */
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

  /** Rolling kinematics, pinion inside the ring. With the contact at arc length s the pinion's centre (in the ring's frame) is one pinion
      radius to the left of the outline. Rolling without slip: the pinion has turned clockwise u = s / RP - (psi - pi), linear in s on each
      segment, so it inverts exactly. The pinion's own angle (anticlockwise) is pi/2 - pi/NP - u, which puts a gap of the pinion at every rack tooth. */
  kin: function () {
    var self = this, D = this.dims, sg = this.segs(), L = sg[0] + sg[1] + sg[2] + sg[3];
    var ss = [0, sg[0], sg[0] + sg[1], 2 * sg[0] + sg[1], L], psis = [Math.PI, Math.PI, 2 * Math.PI, 2 * Math.PI, 3 * Math.PI];
    var uu = ss.map(function (s, k) { return s / D.RP - (psis[k] - Math.PI); });
    return {
      L: L, U: uu[4], ss: ss,
      s: function (v) {
        var k = 0; while (k < 3 && v > uu[k + 1]) k++;
        return ss[k] + (v - uu[k]) / (uu[k + 1] - uu[k]) * (ss[k + 1] - ss[k]);
      },
      centre: function (s) { var p = self.outline(s); return { x: p.x - D.RP * Math.sin(p.psi), y: p.y + D.RP * Math.cos(p.psi) }; },
      angle: function (u) { return Math.PI / 2 - Math.PI / D.NP - u; }
    };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, self = this, i, k;
    var kn = this.kin();
    var o = this.o = { a: 0, k: kn };
    o.u0 = kn.ss[0] / D.RP;
    // start mid-way along the bottom run: s = 2 LH + pi H + LH
    var sStart = 3 * D.LH + Math.PI * D.H;
    o.u0 = sStart / D.RP - Math.PI;                                          // u at psi = 2 pi
    var pitch = Math.PI * D.MD, YR = D.H - D.RP;                              // the pinion centre rides y -33..33 in the ring's frame
    o.YR = YR;

    // pinion z -8..8, hub z 8..12, shaft z -30..44 (back end on the plate's face), crank arm z 44..50, handle z 50..72
    o.pin = new T.Group(); scene.add(o.pin);
    P.at(P.spurGear({ teeth: D.NP, module: D.MD, width: 16, material: c.mat("pinion") }), 0, 0, 0, o.pin);
    P.at(P.cylZ(10, 4, c.mat("pinion")), 0, 0, 10, o.pin);                   // hub z 8..12
    P.at(P.box(18, 4, 1, c.mat("pinion", "mark")), 21, 0, 9, o.pin);          // red stripe x 12..30, z 8.5..9.5, lifted .5 off the face
    P.at(P.cylZ(6, 74, c.mat("pinion")), 0, 0, 7, o.pin);                    // shaft z -30..44
    var cr = new T.Group(); scene.add(cr); o.cr = cr;
    P.at(P.box(40, 10, 6, c.mat("crank")), 14, 0, 47, cr);                   // arm x -6..34, z 44..50, on the shaft end
    P.at(P.cylZ(4.5, 22, c.mat("crank")), 28, 0, 61, cr);                    // handle z 50..72, on the arm face

    // frame group moves in x; the ring group slides in y inside it
    o.frame = new T.Group(); scene.add(o.frame);
    o.ring = new T.Group(); o.frame.add(o.ring);
    // ring: a flat slab z -8..8 with a toothed hole (teeth point inward, tips 6 inside the pitch line, roots 7.5 outside it)
    function put(s, off) { var p = self.outline(s); return new T.Vector2(p.x + off * Math.sin(p.psi), p.y - off * Math.cos(p.psi)); }
    var prof = [[-.5, -1.25], [-.27, -1.25], [-.11, 1], [.11, 1], [.27, -1.25]];
    var hole = [];
    for (i = 0; i < D.NR; i++) for (k = 0; k < prof.length; k++) hole.push(put((i + prof[k][0]) * pitch, -prof[k][1] * D.MD));
    var RO = 1.25 * D.MD + D.BODY, outer = [], sg = this.segs(), a0 = 0, n, j;
    sg.forEach(function (len, q) {
      n = q % 2 ? 36 : 1;
      for (j = 0; j < n; j++) outer.push(put(a0 + len * j / n, RO));
      a0 += len;
    });
    var sh = new T.Shape(outer); sh.holes.push(new T.Path(hole));
    var rg = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false });
    rg.translate(0, 0, -8);
    o.ring.add(new T.Mesh(rg, c.mat("ring")));                               // z -8..8, outer half height 87.5, outer half width 143.9

    // frame: one flat piece z -8..8 round the ring. Inner half width 146.5, inner half height 123, bars 12 thick.
    var FW = 146.5, FH = 123, FT = 12;
    P.at(P.box(2 * (FW + FT), FT, 16, c.mat("frame")), 0, FH + FT / 2, 0, o.frame);     // top bar x -158.5..158.5, y 123..135
    P.at(P.box(2 * (FW + FT), FT, 16, c.mat("frame")), 0, -FH - FT / 2, 0, o.frame);    // bottom bar y -135..-123
    P.at(P.box(FT, 2 * FH, 16, c.mat("frame")), -FW - FT / 2, 0, 0, o.frame);           // left upright x -158.5..-146.5, y -123..123
    P.at(P.box(FT, 2 * FH, 16, c.mat("frame")), FW + FT / 2, 0, 0, o.frame);            // right upright x 146.5..158.5
    // side rods x 158.5..358.5 (left: -358.5..-158.5), radius 6, on the uprights' outer faces
    [-1, 1].forEach(function (sd) { P.at(P.cylX(6, 200, c.mat("frame")), sd * (FW + FT + 100), 0, 0, o.frame); });
    // wheels: bracket x +-110 +-7, y -161..-135, z -8..8, under the bottom bar; wheel radius 18 on an axle at y -153, discs z 8..14 and -14..-8
    o.wheels = [];
    [-110, 110].forEach(function (x) {
      P.at(P.box(14, 26, 16, c.mat("frame")), x, -148, 0, o.frame);
      P.at(P.cylZ(3, 28, c.mat("frame")), x, -153, 0, o.frame);                           // axle z -14..14
      [1, -1].forEach(function (zs) {
        var w = new T.Group(); w.position.set(x, -153, zs * 11); o.frame.add(w);
        P.at(P.cylZ(18, 6, c.mat("frame")), 0, 0, 0, w);                                  // disc z 8..14 or -14..-8
        P.at(P.box(10, 3, 1, c.mat("frame", "dark")), 11, 0, zs * 4, w);                // mark, lifted .5 off the outer face (z 14 or -14)
        o.wheels.push(w);
      });
    });

    // supports. Base x -290..290, y -181..-171, z -40..16; rail surface is the base top (wheels touch it at y -171).
    P.at(P.box(580, 10, 56, c.fixed), 0, -176, -12, scene);
    P.at(P.box(580, 311, 10, c.fixed), 0, -15.5, -35, scene);                // plate y -171..140, z -40..-30; the shaft ends on its face
    [-268, 268].forEach(function (x) {
      // post x +-(262..274), z -10..10, rod at y 0 (radius 6): window y -8..8
      P.at(P.box(12, 163, 20, c.fixed), x, -89.5, 0, scene);                // y -171..-8, on the base
      P.at(P.box(12, 22, 20, c.fixed), x, 19, 0, scene);                    // y 8..30
      P.at(P.box(12, 16, 4, c.fixed), x, 0, 8, scene);                      // cheek z 6..10
      P.at(P.box(12, 16, 4, c.fixed), x, 0, -8, scene);                     // cheek z -10..-6
    });
  },

  step: function (c, dt, S) {
    var o = this.o, D = this.dims, kn = o.k, sgn = S.controls.dir === "ccw" ? -1 : 1;
    o.a += sgn * S.w * dt;
    var u = (o.u0 + o.a) % kn.U; if (u < 0) u += kn.U;
    var s = kn.s(u), ct = kn.centre(s);
    var th = kn.angle(u);
    o.pin.rotation.z = th; o.cr.rotation.z = th;
    o.frame.position.x = -ct.x;                                               // the pinion's centre stays at the origin
    o.ring.position.y = -ct.y;
    o.wheels.forEach(function (w) { w.rotation.z = -o.frame.position.x / 18; });
    function f(v, d) { v = Math.round(v * d) / d; return (v < 0 ? "−" + -v : v); }
    S.set("turns", f(o.a / (2 * Math.PI), 10) + " turns");
    S.set("pos", f(-ct.x, 1) + " mm");
    S.set("slide", f(o.YR - (-ct.y) , 1) + " mm");
  }
});
