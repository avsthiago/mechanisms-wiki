M507.define({
  number: 428,
  title: "India-rubber rotary engine",
  lede: "This steam engine has no pistons. A rubber lining sits inside the casing, and three rollers on arms press it against the wall. Steam gets in behind the rubber and squeezes the rollers round.",
  alt: "A round casing on a foot with a pipe at each side, drawn with its front cover off. A yellow rubber band lines the inside. Three orange rollers on arms from a central shaft press the band against the wall, and the band bulges inwards between two of them.",
  parts: [
    { key: "case", color: "#4FA58A", name: "Cylinder", note: "The stiff casing with a pipe at each side. It stands still. The front cover is left off so you can see inside." },
    { key: "rubber", color: "#D9B13B", name: "Rubber lining", note: "A band of india-rubber fixed to the casing only at the two pipes. Steam behind it pushes it inwards, away from the wall." },
    { key: "roll", color: "#C8873A", name: "Rollers", note: "Three rollers on arms fixed to the shaft. Each one presses the rubber flat against the wall. Watch the red dot on one roller as it rolls along." }
  ],
  controls: [{ id: "steam", label: "Top steam enters by", value: "left", options: [["left", "Left pipe"], ["right", "Right pipe"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "rpm", label: "Shaft" }, { id: "spin", label: "Each roller" }],
  views: { "3d": [130, 100, 500], front: [0, -8, 530], side: [600, -8, 0] },
  target: [0, -8, 0],
  how: [
    "Look at the yellow band. It is a rubber lining, fixed to the casing only at the two pipes. Three rollers press it flat against the wall. Where a roller presses, no steam can get past.",
    "Steam comes in between the rubber and the wall, shown as dark blue dots. It pushes the rubber inwards behind a roller. The bulging rubber squeezes the back of the roller and drives it forward. The roller runs on round the wall, and its arm turns the shaft.",
    "The top half and the bottom half each have a way in and a way out. When a roller reaches the far pipe, the steam behind it escapes and the rubber springs back to the wall. Watch the red dot. Each roller spins backwards as it rolls along the rubber. Then swap the pipes and see the shaft turn the other way. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front cover is left off, and the steam is drawn as small blue balls so you can see it move. How far the rubber bulges inwards was made up. The model does not work out the real stretch of the rubber. The round casing, the straight pipes, the sizes and the choice of pipe were also made up.",

  /* Shape of the lining. Angles in radians about the shaft. base(a) is where the outside of the relaxed lining lies:
     on the wall (radius 100), and inside each pipe mouth running out to a point at radius 118 where it is clamped.
     sag is how far steam pushes it in. In each half the steam travels from the inlet (u = 0) to the outlet (u = pi);
     the lining bulges in from the inlet up to the leading roller, eases down to nothing at each roller, and lies flat
     ahead of the leading roller. The bulge behind the leading roller goes flat while that roller crosses the outlet. Near every roller the lining can come in no further than the roller's own surface,
     so it wraps the roller exactly. */
  _G: Math.asin(.22),
  _base: function (a) {
    var d = Math.abs(Math.atan2(Math.sin(a), Math.abs(Math.cos(a)))), G = this._G;      // angle from the nearer pipe
    return d < G ? 100 + 18 * (1 - d / G) * (1 - d / G) : 100;
  },
  _rho: function (a, dir, rollers) {
    var D = Math.PI / 180, PI = Math.PI, G = this._G, k;
    function sm(x) { x = Math.max(0, Math.min(1, x)); return .5 - .5 * Math.cos(PI * x); }
    function wrap(x) { return x - 2 * PI * Math.floor(x / (2 * PI)); }
    var top = Math.sin(a) >= 0, fin = (dir < 0) === top ? PI : 0, u = wrap(dir * (a - fin)), L1 = -1, L2 = -1;
    for (k = 0; k < rollers.length; k++) { var uk = wrap(dir * (rollers[k] - fin)); if (uk < PI) { if (uk > L1) { L2 = L1; L1 = uk; } else if (uk > L2) L2 = uk; } }
    var sag = 0, base = this._base(a);
    if (u < PI && L1 >= 0 && u < L1) {
      var f = sm((PI - L1) / G);                                                   // the bulge behind the leading roller flattens as it crosses the outlet
      sag = 15 * sm((u - G) / (20 * D)) * (u > L2 ? f * sm((L1 - u) / (25 * D)) : sm((L2 - u) / (25 * D)));
    }
    for (k = 0; k < rollers.length; k++) {                                              // rollers: radius 14, centres at radius 82
      var d = Math.atan2(Math.sin(a - rollers[k]), Math.cos(a - rollers[k])), s = 82 * Math.sin(d);
      if (Math.abs(s) < 14 && Math.cos(d) > 0) sag = Math.min(sag, Math.max(0, base - 4 - (82 * Math.cos(d) + Math.sqrt(196 - s * s))));
    }
    return base - sag;
  },

  _wallr: function (a) {                                   // the stiff wall: radius 100, or the roof of a pipe inside its mouth
    var d = Math.abs(Math.atan2(Math.sin(a), Math.abs(Math.cos(a))));
    return d < this._G ? Math.min(22 / Math.max(1e-6, Math.abs(Math.sin(a))), 150 / Math.abs(Math.cos(a))) : 100;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 100, W = 112, mc = c.mat("case"), D = Math.PI / 180;
    var o = this.o = { th: 0 };
    function arc(cx, cy, rad, a0, a1, n) { var p = [], i, a; for (i = 0; i <= n; i++) { a = (a0 + (a1 - a0) * i / n) * D; p.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); } return p; }
    var G = this._G / D, ao = Math.asin(34 / W) / D, xo = W * Math.cos(ao * D), foot = [[-56, -118], [-95, -118], [-95, -130], [95, -130], [95, -118], [56, -118]];
    // top wall: pipe roof y 22..34 out to x 150, outside radius 112, inside radius 100
    var top = [[150, 22], [150, 34], [xo, 34]].concat(arc(0, 0, W, ao, 180 - ao, 50), [[-xo, 34], [-150, 34], [-150, 22]], arc(0, 0, R, 180 - G, G, 60));
    var bot = [[-150, -22], [-150, -34], [-xo, -34]].concat(arc(0, 0, W, 180 + ao, 240, 16), foot, arc(0, 0, W, 300, 360 - ao, 16), [[xo, -34], [150, -34], [150, -22]], arc(0, 0, R, 360 - G, 180 + G, 60));
    var back = [[150, 34], [xo, 34]].concat(arc(0, 0, W, ao, 180 - ao, 50), [[-xo, 34], [-150, 34], [-150, -34], [-xo, -34]], arc(0, 0, W, 180 + ao, 240, 16), foot, arc(0, 0, W, 300, 360 - ao, 16), [[xo, -34], [150, -34]]);
    scene.add(P.outlinePlate({ points: top, depth: 40, z0: -20, material: mc }));      // walls z -20..20
    scene.add(P.outlinePlate({ points: bot, depth: 40, z0: -20, material: mc }));
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: c.mat("case", "light") }), "open"));   // back cover z -26..-20; pale so the steam shows
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: -26, material: mc }), "closed"));   // closed view: the same back cover in the casing colour
    scene.add(c.shell(P.outlinePlate({ points: back, depth: 6, z0: 20, material: mc }), "closed"));   // closed view: front cover z 20..26 on the walls
    [-1, 1].forEach(function (s) { P.at(P.box(34, 5, 40, mc), s * 133, 0, 0, scene); });   // plate in each pipe, x 116..150, y -2.5..2.5; the lining is clamped to its tip
    // lining: 4 thick, z -19..15, drawn again every frame
    o.band = [0, 1].map(function () { return P.at(P.ribbon({ n: 180, depth: 34, material: c.mat("rubber") }), 0, 0, -2, scene); });
    // shaft, arms and rollers
    o.rot = new T.Group(); scene.add(o.rot);
    var mr = c.mat("roll");
    P.at(P.cylZ(13, 104, mr), 0, 0, -8, o.rot);                                        // shaft z -60..44
    P.at(P.cylZ(22, 36, mr), 0, 0, -2, o.rot);                                         // boss z -20..16, on the back cover
    P.at(P.cylZ(17, 3, c.mat("roll", "dark")), 0, 0, 17.5, o.rot);                     // collar z 16..19, on the boss face
    o.ang = [180, 60, -60].map(function (a) { return a * D; });                        // as drawn: one roller at the left pipe
    o.roll = o.ang.map(function (a, k) {
      var arm = new T.Group(); arm.rotation.z = a; o.rot.add(arm);
      P.at(P.box(60, 10, 14, mr), 50, 0, -2, arm);                                     // arm x 20..80, z -9..5, from inside the boss to inside the roller
      var g = new T.Group(); g.position.x = 82; arm.add(g);
      P.at(P.cylZ(14, 36, mr), 0, 0, -2, g);                                           // roller z -20..16
      P.at(P.cylZ(5, 2, c.mat("roll", "dark")), 0, 0, 17, g);                          // pin head z 16..18, on the roller face
      P.at(P.cylZ(2.5, 1, c.mat("roll", k === 1 ? "mark" : "dark")), 9, 0, 17, g);     // dot z 16.5..17.5, lifted off the face (z 16)
      return g;
    });
    function sm(op) { return new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide }); }
    o.live = sm(.14); o.used = sm(.04); o.shut = sm(.09);
    // steam as moving balls between the lining and the wall, one region for each half, measured from that half's inlet
    o.flow = P.steamFlow({ color: c.spot, count: 260, size: 2.4, z0: -14, z1: 12 }); scene.add(o.flow);
    o.dir = -1; o.ra = [0, 0, 0];
    var self = this;
    o.dom = [0, 1].map(function (h) { return o.flow.domain({ density: .035, pad: .12, drain: .5, f: function (u, out) {
      var a = ((o.dir < 0) === (h === 0) ? Math.PI : 0) + o.dir * u, r = self._rho(a, o.dir, o.ra), w = self._wallr(a), ca = Math.cos(a), sa = Math.sin(a);
      out[0] = r * ca; out[1] = r * sa; out[2] = w * ca; out[3] = w * sa;
    } }); });
    o.bars = [0, 0, 0, 0]; o.kinds = [1, 2, 3]; o.ports = [.1, 0, Math.PI - .1];
    o.fp = [[-1, 1], [1, -1], [1, 1], [-1, -1]].map(function (s) { return o.flow.pipe({ points: [[s[0] * 175, s[1] * 12.5], [s[0] * 124, s[1] * 12.5]], width: 12, n: 10 }); });
    o.fill = [0, 1, 2, 3, 4, 5].map(function (i) { return c.fluid(P.at(P.ribbon({ n: 120, material: i % 3 === 0 ? o.live : i % 3 === 1 ? o.shut : o.used }), 0, 0, 15, scene)); });
  },

  step: function (c, dt, S) {
    var o = this.o, self = this, dir = S.controls.steam === "right" ? 1 : -1, PI = Math.PI, G = this._G, h, k;
    o.th += dir * S.w * dt;
    o.rot.rotation.z = o.th;
    var ra = o.ang.map(function (a) { return a + o.th; });
    for (k = 0; k < 3; k++) o.roll[k].rotation.z = -o.th * 96 / 14;                     // rolls without slipping on the lining (radius 96)
    function wall(a) { var d = Math.abs(Math.atan2(Math.sin(a), Math.abs(Math.cos(a)))); return d < G ? Math.min(22 / Math.max(1e-6, Math.abs(Math.sin(a))), 150 / Math.abs(Math.cos(a))) : 100; }
    function wrap(x) { return x - 2 * PI * Math.floor(x / (2 * PI)); }
    for (h = 0; h < 2; h++) {                                                          // h = 0 top half, 1 bottom half
      var a0 = h * PI;
      o.band[h].set(function (a) { var r = self._rho(a, dir, ra), ca = Math.cos(a), sa = Math.sin(a); return [(r - 4.6) * ca, (r - 4.6) * sa, (r - .6) * ca, (r - .6) * sa]; }, a0 + 1e-4, a0 + PI - 1e-4);
      // steam, measured from the inlet of this half: fresh up to the first roller, shut in between two rollers, used beyond the last
      var fin = (dir < 0) === (h === 0) ? PI : 0, L1 = 0, L2 = 0;
      for (k = 0; k < 3; k++) { var uk = wrap(dir * (ra[k] - fin)); if (uk < PI - G && uk > G) { if (uk > L1) { L2 = L1; L1 = uk; } else if (uk > L2) L2 = uk; } }
      var f = function (u) { var a = fin + dir * u, r = self._rho(a, dir, ra), w = wall(a), ca = Math.cos(a), sa = Math.sin(a); return [r * ca, r * sa, w * ca, w * sa]; };
      if (!L2) { L2 = L1; }
      o.fill[h * 3].set(f, 1e-4, L2); o.fill[h * 3 + 1].set(f, L2, L1); o.fill[h * 3 + 2].set(f, L1, PI - 1e-4);
      o.dir = dir; for (k = 0; k < 3; k++) o.ra[k] = ra[k];
      o.bars[0] = 1e-4; o.bars[1] = Math.max(1e-4, L2); o.bars[2] = Math.max(1e-4, L1); o.bars[3] = PI - 1e-4;
      o.dom[h].set(o.bars, o.kinds, o.ports, 3);
    }
    for (k = 0; k < 4; k++) o.fp[k].out = (k < 2) === (dir > 0);
    o.flow.update(Math.abs(S.w) * dt);
    var rpm = S.playing ? dir * S.rpm : 0, sp = Math.round(-rpm * (96 / 14 - 1));
    S.set("rpm", (rpm < 0 ? "−" + -rpm : rpm) + " rpm");
    S.set("spin", (sp < 0 ? "−" + -sp : sp) + " rpm");
  }
});
