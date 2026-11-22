M507.define({
  number: 424,
  title: "Root's square piston engine",
  lede: "A steam engine with a square box in place of a round cylinder. One piston slides from side to side in the box, and a second piston slides up and down inside the first. Together they carry a pin round in a circle, and the pin turns a crank.",
  alt: "An oblong steam box with its front cover off. Inside, a tall frame slides left and right, and a block inside the frame slides up and down. A pin in the middle of the block turns a crank in front.",
  parts: [
    { key: "box", color: "#4FA58A", name: "Steam box", note: "The oblong box the pistons work in. The dark strips are the ports where steam comes in and goes out." },
    { key: "outer", color: "#C8873A", name: "Side piston", note: "A tall frame that fills the box from top to bottom. Steam on its left or right side pushes it across." },
    { key: "inner", color: "#8E7AA8", name: "Inner piston", note: "A block that fills the frame from side to side. Steam above or below it pushes it up or down." },
    { key: "crank", color: "#5E7387", name: "Crank and shaft", note: "An arm on the shaft. The shaft stays in the middle of the box while the arm goes round." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "Fixed in the middle of the inner piston. Watch it go round in a circle." }
  ],
  closed: { label: "Steam box" },
  readouts: [{ id: "x", label: "Side piston" }, { id: "y", label: "Inner piston" }],
  views: { "3d": [130, 80, 430], front: [0, -6, 440], side: [440, -6, 0] },
  target: [0, -6, 0],
  how: [
    "Watch the two pistons. The tall frame only goes left and right. The block inside it only goes up and down. Yet the pin in the middle of the block goes round in a circle.",
    "The block rides in the frame, so it goes across with the frame and up and down by itself. Moving across and up and down at the same time, with the right timing, makes a circle. Steam pushes each piston in turn, in the direction it is already going.",
    "Look for the moment one piston stops at the end of its slide. The other is then moving at full speed. So the crank always has a push and never sticks at a dead point. Slow the engine down to see it. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front cover is left off so the pistons show, and the crank is drawn in front of the box so it can be seen. The post that holds the shaft, the base and all the sizes were made up. The steam pipes and valves are left out; the blue dots show the steam. Dark dots are fresh steam pushing, and pale dots are used steam leaving.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: -0.8, r: 30 };
    function rect(x0, y0, x1, y1) { return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; }
    // box: outside x +-110, y -76 .. 76 with round top corners; inside x +-100, y +-66; walls z -40 .. 0, back plate z -46 .. -40
    var out, k, a;
    out = [[-110, -76], [110, -76]];
    for (k = 0; k <= 8; k++) { a = k / 8 * Math.PI / 2; out.push([94 + 16 * Math.cos(a), 60 + 16 * Math.sin(a)]); }
    for (k = 0; k <= 8; k++) { a = Math.PI / 2 + k / 8 * Math.PI / 2; out.push([-94 + 16 * Math.cos(a), 60 + 16 * Math.sin(a)]); }
    scene.add(P.outlinePlate({ points: out, holes: [rect(-100, -66, 100, 66)], depth: 40, z0: -40, material: c.mat("box") }));
    scene.add(P.outlinePlate({ points: out, depth: 6, z0: -46, material: c.mat("box") }));
    scene.add(c.shell(P.outlinePlate({ points: out, depth: 14, z0: 0, material: c.mat("box") }), "closed"));   // closed view: front cover z 0..14 over the pin (to z 12) and the arm, with room to spare; the shaft comes out of it
    [-1, 1].forEach(function (s) { P.at(P.box(1, 34, 24, c.mat("box", "dark")), s * 99.5, 0, -20, scene); });   // ports on the side walls, lifted 0.5 off x = +-100
    P.at(P.box(244, 10, 110, c.fixed), 0, -81, -2, scene);                  // base, y -86 .. -76, z -57 .. 53
    P.at(P.box(20, 90, 12, c.fixed), 0, -31, 32, scene);                    // post, y -76 .. 14, z 26 .. 38
    P.at(P.cylZ(5, 16, c.mat("crank")), 0, 0, 18, scene);                   // shaft, z 10 .. 26, ends on the post's back face
    // side piston: a frame x +-69, y +-66 (touches the box's top and bottom), inside x +-55, y +-62; z -40 .. -0.5
    o.B = P.at(new T.Group(), 0, 0, 0, scene);
    o.B.add(P.outlinePlate({ points: rect(-69, -66, 69, 66), holes: [rect(-55, -62, 55, 62)], depth: 39.5, z0: -40, material: c.mat("outer") }));
    [-1, 1].forEach(function (s) { P.at(P.box(44, 1, 24, c.mat("box", "dark")), 0, s * 61.5, -20, o.B); });   // ports in the frame, lifted 0.5 off y = +-62
    // inner piston: a block x +-55, y +-31; z -40 .. -1
    o.C = P.at(new T.Group(), 0, 0, 0, scene);
    o.C.add(P.outlinePlate({ points: rect(-55, -31, 55, 31), depth: 39, z0: -40, material: c.mat("inner") }));
    P.at(P.cylZ(9, 1, c.mat("inner")), 0, 0, -0.5, o.C);                    // boss round the pin, z -1 .. 0
    P.at(P.cylZ(4.5, 12.5, c.mat("pin")), 0, 0, 5.75, o.C);                 // crank pin, z -0.5 .. 12 (inside the boss)
    // crank arm, z 4 .. 10
    o.crank = P.at(new T.Group(), 0, 0, 7, scene);
    var arm = P.armPlate({ length: o.r, r0: 11, r1: 9, thick: 6, material: c.mat("crank") }); o.crank.add(arm);
    // steam: one box in each space, unit size, scaled each frame
    o.st = [];
    for (k = 0; k < 4; k++) {
      var m = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .2, depthWrite: false });
      var b = P.at(P.box(1, 1, 38.5, m), 0, 0, -20.75, scene); b.userData.live = true; o.st.push(c.fluid(b));   // z -40 .. -1.5
    }
    // steam as moving balls, one region for each space; t runs along the way that piston slides
    o.flow = P.steamFlow({ color: c.spot, light: true, count: 320, z0: -35, z1: -5 }); scene.add(o.flow);
    o.bx = 0;
    o.dom = [0, 1].map(function () { return o.flow.domain({ density: .012, pad: 3, f: function (x, out) { out[0] = x; out[1] = -63; out[2] = x; out[3] = 63; } }); })
      .concat([0, 1].map(function () { return o.flow.domain({ density: .012, pad: 3, f: function (y, out) { out[0] = o.bx - 53; out[1] = y; out[2] = o.bx + 53; out[3] = y; } }); }));
    o.bars = [0, 0]; o.kinds = [0]; o.ports = [0];
  },

  step: function (c, dt, S) {
    var o = this.o, r = o.r, st = o.st;
    o.th += S.w * dt;
    var bx = r * Math.cos(o.th), cy = r * Math.sin(o.th), dir = S.w < 0 ? -1 : 1;
    o.B.position.x = bx;
    o.C.position.set(bx, cy, 0);
    o.crank.rotation.z = o.th;
    function put(b, x0, x1, y0, y1, on) {
      b.visible = x1 - x0 > .2 && y1 - y0 > .2;
      b.scale.x = Math.max(.01, x1 - x0); b.scale.y = Math.max(.01, y1 - y0);
      b.position.x = (x0 + x1) / 2; b.position.y = (y0 + y1) / 2; b.material.opacity = on ? .12 : .03;
    }
    var right = -Math.sin(o.th) * dir > 0, up = Math.cos(o.th) * dir > 0;   // which way each piston is going
    put(st[0], -99.5, bx - 69.5, -65.5, 65.5, right);                       // left of the side piston
    put(st[1], bx + 69.5, 99.5, -65.5, 65.5, !right);                       // right of it
    put(st[2], bx - 54.5, bx + 54.5, -61.5, cy - 31.5, up);                 // below the inner piston
    put(st[3], bx - 54.5, bx + 54.5, cy + 31.5, 61.5, !up);                 // above it
    function room(d, t0, t1, port, on) { o.bars[0] = Math.min(t0, t1 - .1); o.bars[1] = t1; o.kinds[0] = on ? 1 : 3; o.ports[0] = port; d.set(o.bars, o.kinds, o.ports, 1); }
    o.bx = bx;
    room(o.dom[0], -99.5, bx - 69.5, -99.5, right); room(o.dom[1], bx + 69.5, 99.5, 99.5, !right);
    room(o.dom[2], -61.5, cy - 31.5, -61.5, up); room(o.dom[3], cy + 31.5, 61.5, 61.5, !up);
    o.flow.update(Math.abs(S.w) * dt);
    function mm(v) { var n = Math.round(v); return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n) + " mm"; }
    S.set("x", mm(bx)); S.set("y", mm(cy));
  }
});
