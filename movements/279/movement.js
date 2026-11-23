M507.define({
  number: 279,
  title: "Crank and slotted cross-head",
  lede: "A crank pin carries a block that slides up and down in a tall slot. The slotted frame, called a cross-head, is pushed from side to side. So a turning motion becomes a straight to-and-fro motion.",
  alt: "A frame with a tall upright slot and a rod out of each side. In the slot a block made of liners and wedges wraps a round crank pin. Behind it a crank arm turns on a shaft.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank and shaft", note: "A shaft with a short arm on its end. The pin at the far end of the arm goes round in a circle." },
    { key: "wrist", color: "#C2503F", name: "Crank pin", note: "The pin that carries the box. Watch it go round. Its hatched end is drawn as in Brown's picture." },
    { key: "head", color: "#C8873A", name: "Cross-head", note: "A frame with a tall slot. Its two rods slide to and fro through guides, so it can only move sideways." },
    { key: "box", color: "#D9B13B", name: "Sliding block", note: "Wraps the pin and slides up and down in the slot. Two liners hold the pin and two wedges fill the space to the slot. Screws set the wedges." }
  ],
  controls: [{ type: "range", id: "r", label: "Crank throw", min: 20, max: 55, step: 1, value: 55, unit: " mm",
    presets: [[20, "Short"], [38, "Medium"], [55, "Long"]] }],
  readouts: [{ id: "a", label: "Crank turned" }, { id: "x", label: "Cross-head" }, { id: "y", label: "Box in slot" }],
  views: { "3d": [330, 150, 620], front: [0, -5, 680], side: [660, 40, 80] },
  target: [0, -5, -5],
  how: [
    "The crank pin goes round in a circle. The box on the pin goes round with it. But the slot only lets the box slide up and down. So the box pushes the cross-head sideways instead.",
    "The cross-head goes as far to each side as the pin does, no further. It moves fastest when the pin is level with the shaft. It stops for a moment when the pin is at its highest or lowest point. The box is two liners and two wedges. When they wear, the screws push the wedges further in, so the box fills the slot again.",
    "Try a short throw, then a long one. The pin goes round a smaller circle, so the cross-head moves a shorter way. Watch the box slide a shorter way in the slot too."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the cross-head, the box and the pin. The crank arm, its shaft and bearing, the guides, the base and all the sizes were made up. The wedges and screws are drawn but do not move. Brown's picture is a view along the shaft, and the model is built the same way.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { th: Math.PI / 2, SH: 126, SW: 43 };       // slot: half length 126, half width 43
    // supports. base y -165..-155, z -62..28. Guide posts stand on it. Bearing foot sits on it.
    P.at(P.box(350, 10, 90, c.fixed), 0, -160, -17, scene);                       // x -175..175
    [-1, 1].forEach(function (s) {
      P.at(P.box(14, 125, 40, c.fixed), s * 160, -92.5, 0, scene);                // x 153..167, y -155..-30, z -20..20
      var g = P.guideBlock({ w: 60, h: 14, d: 40, hole: 18, material: c.fixed }); g.rotation.z = Math.PI / 2;
      P.at(g, s * 160, 0, 0, scene);                                              // x 153..167, y -30..30, bore along x
    });
    var bear = P.bearingBlock({ bore: 10.8, outer: 22, width: 14, drop: 155, material: c.fixed });
    P.at(bear, 0, 0, -50, scene);                                                 // z -57..-43, foot y -155

    // crank: shaft, hub and an arm that changes length with the throw
    var mc = c.mat("crank");
    o.crank = new T.Group(); scene.add(o.crank);
    P.at(P.cylZ(10, 40, mc), 0, 0, -40, o.crank);                                 // shaft z -60..-20 (through the bearing bore, into the hub)
    P.at(P.cylZ(14, 10, mc), 0, 0, -22, o.crank);                                 // hub z -27..-17
    o.arm = P.at(P.box(1, 20, 8, mc), 0, 0, -22, scene);                          // arm z -26..-18

    // cross-head: frame with a slot and a rod each side
    o.head = new T.Group(); scene.add(o.head);
    var mh = c.mat("head"), sh = new T.Shape();
    [[-65, 148], [65, 148], [94, 21], [94, -21], [65, -148], [-65, -148], [-94, -21], [-94, 21]].forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
    var hole = new T.Path(); hole.moveTo(-o.SW, -o.SH); hole.lineTo(o.SW, -o.SH); hole.lineTo(o.SW, o.SH); hole.lineTo(-o.SW, o.SH); hole.closePath(); sh.holes.push(hole);
    var gh = new T.ExtrudeGeometry(sh, { depth: 30, bevelEnabled: false }); gh.translate(0, 0, -15);   // z -15..15
    o.head.add(P.mesh(gh, mh));
    P.at(P.cylX(17, 125, mh), 152.5, 0, 0, o.head);                               // rods x 90..215 (start inside the body)
    P.at(P.cylX(17, 125, mh), -152.5, 0, 0, o.head);

    // sliding box (z -13..13) round the pin; its centre follows the pin up and down inside the cross-head
    o.box = new T.Group(); o.head.add(o.box);
    var mb = c.mat("box"), mg = c.mat("box", "light");
    function sideShape(sx) {                                                      // liner with its top flange, for one side
      var s = new T.Shape(), a = Math.atan2(Math.sqrt(19 * 19 - 1), 1);
      s.moveTo(sx * 41, 50); s.lineTo(sx * 1, 50); s.lineTo(sx * 1, Math.sqrt(19 * 19 - 1));
      if (sx > 0) s.absarc(0, 0, 19, a, -a, true); else s.absarc(0, 0, 19, Math.PI - a, Math.PI + a, false);
      s.lineTo(sx * 1, -42); s.lineTo(sx * 22, -42); s.lineTo(sx * 32, 42); s.lineTo(sx * 41, 42); s.closePath();
      return s;
    }
    function gibShape(sx) { var s = new T.Shape(); s.moveTo(sx * 41, 42); s.lineTo(sx * 32, 42); s.lineTo(sx * 22, -42); s.lineTo(sx * 41, -42); s.closePath(); return s; }
    [-1, 1].forEach(function (sx) {
      var gl = new T.ExtrudeGeometry(sideShape(sx), { depth: 26, bevelEnabled: false, curveSegments: 24 }); gl.translate(0, 0, -13);
      o.box.add(P.mesh(gl, mb));
      var gg = new T.ExtrudeGeometry(gibShape(sx), { depth: 26, bevelEnabled: false }); gg.translate(0, 0, -13);
      o.box.add(P.mesh(gg, mg));
      var nut = P.mesh(new T.CylinderGeometry(5.5, 5.5, 6, 6), mb); P.at(nut, sx * 36.5, 53, 0, o.box);       // nut y 50..56 sits on the flange
      P.at(P.cylY(3.5, 8, mb), sx * 36.5, 60, 0, o.box);                          // screw end y 56..64
    });
    P.at(P.cylZ(18.8, 38, c.mat("wrist", "mark")), 0, 0, -5, o.box);              // pin z -24..14, a little inside the liners' bore
    var dk = c.mat("wrist", "dark");
    [-12, -6, 0, 6, 12].forEach(function (d) {                                    // hatching on the pin end (z 14, lines lifted to 14.2..15)
      var ln = P.at(P.box(2 * Math.sqrt(18.8 * 18.8 - d * d) - 1, 1.2, .8, dk), -d * Math.SQRT1_2, d * Math.SQRT1_2, 14.6, o.box);
      ln.rotation.z = Math.PI / 4;
    });
  },

  step: function (c, dt, S) {
    var o = this.o, r = +S.controls.r;
    o.th += S.w * dt;
    var cs = Math.cos(o.th), sn = Math.sin(o.th), px = r * cs, py = r * sn;
    o.head.position.x = px;
    o.box.position.y = py;
    o.crank.rotation.z = o.th;
    o.arm.position.set(px / 2, py / 2, -22); o.arm.rotation.z = o.th; o.arm.scale.x = r;
    function sg(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " mm"; }
    var deg = ((o.th * 180 / Math.PI) % 360 + 360) % 360;
    S.set("a", Math.round(deg) + "°");
    S.set("x", sg(px));
    S.set("y", sg(py));
  }
});
