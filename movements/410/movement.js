M507.define({
  number: 410,
  title: "Bisecting gauge",
  lede: "Two blocks sit against the two sides of a board, one on each side. A sharp point between them always stays exactly halfway across. Slide the gauge along the board and the point scratches a line down the middle.",
  alt: "A wooden board lying flat with a long crossbar resting across it. A block stands against each side of the board and the bar passes through both. Two short flat arms run from the blocks to a sharp point on the board between them.",
  parts: [
    { key: "bar", color: "#5E7387", name: "Crossbar", note: "A long square bar that lies across the board. The block on the left is fixed to it. The block on the right slides along it." },
    { key: "cheek", color: "#C8873A", name: "Two blocks", note: "They press against the two sides of the board. The right one has a screw on top to lock it in place." },
    { key: "arms", color: "#D9B13B", name: "Two short arms", note: "Both are the same length. Each one turns on a pin in a block, and the two meet at the marking point." },
    { key: "point", color: "#C2503F", name: "Marking point", note: "A sharp point where the arms meet. Watch it. It stays halfway between the blocks and scratches the red line." }
  ],
  controls: [{ id: "board", label: "Board", value: "wide", options: [["wide", "Wide"], ["narrow", "Narrow"], ["taper", "Tapering"]] }],
  speed: { min: 2, max: 16, value: 6, label: "Speed", unit: " cycles/min" },
  readouts: [{ id: "w", label: "Board width" }, { id: "l", label: "Left gap" }, { id: "r", label: "Right gap" }],
  views: { "3d": [230, 200, 300], front: [0, 15, 420], top: [0, 520, 30], side: [520, 40, 0] },
  target: [5, 20, 30],
  distance: [250, 1200],
  how: [
    "Watch the two short arms. They are the same length and each turns on a pin in one of the blocks. They meet at the sharp point.",
    "Two equal arms joined at a point always make a triangle with two equal sides. So the point must sit halfway between the two pins. It does not matter how far apart the blocks are. If the right block slides out, the arms open and the point moves along to stay in the middle.",
    "Try the wide board, then the narrow one. The point is halfway both times. Then try the tapering board. The block slides in as the board narrows, and the line drawn runs at a slant."
  ],
  note: "This model is rebuilt from Brown's drawing. The board is flat and long, with straight ends instead of torn ones. The blocks are cut away where the arms enter them, and the arms are plain bars. For the tapering board the right block is allowed to turn so its face stays flat on the slanting edge, as Brown says. The sizes are made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { XL: -55, BL: 160, LEN: 95, ph: 0, mode: null, reach: 0, G0: 30, G1: -100, slope: 20 / 160, wcur: 110 }, XL = o.XL, mb = c.mat("bar"), mc = c.mat("cheek");
    // boards: plain (scaled) and tapering; top face at y = 0, thickness 30
    o.straight = P.at(P.box(1, 30, 2 * o.BL, c.fixed), 0, -15, 0, c.scene);
    var sh = new T.Shape(); sh.moveTo(XL, -o.BL); sh.lineTo(XL + 75 - 20, -o.BL); sh.lineTo(XL + 75 + 20, o.BL); sh.lineTo(XL, o.BL); sh.closePath();
    var geo = new T.ExtrudeGeometry(sh, { depth: 30, bevelEnabled: false }); geo.rotateX(Math.PI / 2);              // y -30..0
    o.taper = P.at(new T.Mesh(geo, c.fixed), 0, 0, 0, c.scene);
    // gauge, built with the crossbar at z = 0 (moved along the board as a group)
    var g = o.g = new T.Group(); c.scene.add(g);
    P.at(P.box(240, 16, 14, mb), 5, 38, 0, g);                                                                       // bar: x -115..125, y 30..46, z -7..7
    function cheek(group, gapLo, gapHi, sx) {                                                                        // origin at the pivot; the block is x -8..8, web beyond it, cut away between gapLo and gapHi
      P.at(P.box(16, gapLo + 25, 50, mc), 0, (gapLo - 25) / 2, 0, group);                                           // lower y -25..gapLo
      P.at(P.box(16, 55 - gapHi, 50, mc), 0, (gapHi + 55) / 2, 0, group);                                           // upper y gapHi..55
      P.at(P.box(4, 80, 50, mc), sx * 10, 15, 0, group);                                                             // web x 8..12 on the outer side, y -25..55
      P.at(P.cylY(3, gapHi + 14.5, mc), 0, (gapHi - 13.5) / 2, 0, group);                                               // pin up through the arm and block
    }
    o.cl = P.at(new T.Group(), XL - 8, 0, 0, g); cheek(o.cl, 6, 9, -1);
    o.cr = P.at(new T.Group(), 0, 0, 0, g); cheek(o.cr, 9, 12, 1);
    P.at(P.cylY(3, 8, c.mat("cheek", "dark")), 0, 59, 0, o.cr);                                                      // screw stem y 55..63
    P.at(P.cylY(8, 4, c.mat("cheek", "dark")), 0, 65, 0, o.cr);                                                      // knob y 63..67
    function arm(y) { var a = new T.Group(), m = P.armPlate({ length: o.LEN, r0: 5, thick: 3, material: c.mat("arms") }); m.rotation.x = Math.PI / 2; a.add(m); a.position.y = y; g.add(a); return a; }
    o.al = arm(7.5); o.ar = arm(10.5);                                                                               // y 6..9 and 9..12
    o.pt = new T.Group(); g.add(o.pt);
    var cone = new T.Mesh(new T.ConeGeometry(3, 5.75, 16), c.mat("point")); cone.rotation.x = Math.PI; cone.position.y = 3.125; o.pt.add(cone);   // apex y .25, base y 6
    P.at(P.cylY(3.4, 7, c.mat("arms", "dark")), 0, 9, 0, o.pt);                                                       // pin through both arms, y 6..12
    P.at(P.cylY(7, 3, c.mat("arms", "dark")), 0, 13.5, 0, o.pt);                                                      // head y 12..15
    o.line = P.trail({ color: 0xC2503F, max: 700, step: .8 }); c.scene.add(o.line);
  },

  // right edge of the board at world z
  edge: function (z) {
    var o = this.o, m = o.mode;
    return o.XL + (m === "taper" ? 75 + 20 * z / o.BL : m === "narrow" ? 70 : 110);
  },

  // pose of the gauge when its bar is at world z = gz; returns pivots and marking point in the gauge's own frame (bar at z = 0)
  pose: function (gz) {
    var o = this.o, P = this.P, taper = o.mode === "taper", phi = taper ? Math.atan(o.slope) : 0;
    var xr0 = this.edge(gz), px = xr0 + 8 / Math.cos(phi), plx = o.XL - 8, j = P.meet(plx, 0, o.LEN, px, 0, o.LEN, 1);
    return { phi: phi, px: px, plx: plx, jx: j[0], jz: j[1], xr0: xr0 };
  },

  step: function (c, dt, S) {
    var o = this.o, P = this.P = c.P, m = S.controls.board;
    if (m !== o.mode) { o.mode = m; o.ph = 0; o.reach = o.G0; o.line.clear(); o.straight.visible = m !== "taper"; o.taper.visible = m === "taper"; var w = m === "narrow" ? 70 : 110; o.straight.scale.x = w; o.straight.position.x = o.XL + w / 2; }
    o.ph += S.w * dt;
    var gz = o.G0 + (o.G1 - o.G0) * (.5 - .5 * Math.cos(o.ph)), q = this.pose(gz);
    o.g.position.z = gz;
    o.cr.position.set(q.px, 0, 0); o.cr.rotation.y = q.phi;
    function place(a, x0, z0) { var dx = q.jx - x0, dz = q.jz - z0; a.position.x = x0; a.position.z = z0; a.rotation.y = -Math.atan2(dz, dx); }
    place(o.al, q.plx, 0); place(o.ar, q.px, 0);
    o.pt.position.set(q.jx, 0, q.jz);
    // line: where the point has been, from the start down to the farthest the gauge has gone
    o.reach = Math.min(o.reach, gz);
    o.line.clear();
    for (var z = o.G0; z > o.reach + 1.5; z -= 3) { var p = this.pose(z); o.line.push(p.jx, .5, z + p.jz); }
    o.line.push(q.jx, .5, gz + q.jz);
    var wd = q.xr0 - o.XL;
    S.set("w", Math.round(wd) + " mm");
    S.set("l", Math.round(q.jx - o.XL) + " mm");
    S.set("r", Math.round(q.xr0 - q.jx) + " mm");
  }
});
