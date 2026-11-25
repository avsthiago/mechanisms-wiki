M507.define({
  number: 378,
  title: "Pendulum saw",
  lede: "A heavy weight on a long rod swings to and fro, like a swing. A cord ties the rod to a saw, so each swing pulls the saw along. The saw cuts a lying log a little deeper with every stroke.",
  alt: "A three-legged stand holds a long swinging rod with a heavy weight at the bottom. A cord runs from the rod to a bow saw hung in an open frame. Two ropes run from the saw over two small wheels on the frame to two weights. Under the saw lies a round log.",
  parts: [
    { key: "pend", color: "#5E7387", name: "Pendulum", note: "A rod that swings from the top of a stand, with a heavy block near the bottom. It swings at its own steady pace." },
    { key: "saw", color: "#C8873A", name: "Saw", note: "A bow saw with a handle at each end. It slides to and fro, and it sinks as the cut gets deeper. Watch the red handle." },
    { key: "rope", color: "#D9B13B", name: "Cord and ropes", note: "One cord joins the rod to the saw. Two ropes hold the saw up from above and run over small wheels to the weights." },
    { key: "weight", color: "#8E7AA8", name: "Weights", note: "They hang on the ropes and keep the saw lightly held. They rise and fall as the saw slides." },
    { key: "log", color: "#E8E2D0", name: "Log", note: "The log being cut. The dark slot shows how far the saw has gone in." }
  ],
  controls: [{ type: "range", id: "len", label: "Where the block sits on the rod", min: 120, max: 170, step: 1, value: 150, unit: " mm", presets: [[120, "High"], [150, "Middle"], [170, "Low"]] }],
  readouts: [{ id: "a", label: "Swing" }, { id: "n", label: "Strokes" }, { id: "d", label: "Cut depth" }],
  speed: false,
  views: { "3d": [187, 217, 432], front: [-5, 112, 470], side: [470, 125, 20] },
  target: [-5, 112, 19],
  how: [
    "The rod swings from the top of the stand. As it swings right it lets the cord go. As it swings left it pulls the cord, and the saw is pulled left with it. The weights on the ropes pull the saw back again.",
    "A pendulum swings at a pace set only by how long it is. A longer pendulum swings more slowly. A small push at each swing keeps it going. Here the push is built in, so no person is needed. Each stroke lets the saw bite a little deeper.",
    "Slide the block up the rod, then down, and count the strokes a minute. A block that is higher up makes a shorter pendulum. It swings faster, so the saw makes more strokes and the cut deepens sooner."
  ],
  note: "This model is rebuilt from Brown's drawing. The swing is worked out from the real motion of a pendulum, with a small push at each swing built in in place of a person. The stand, the frame, the weights, the sizes and the speed of the cut were made up. The frame is simpler than the drawing, and the saw hangs from ropes with no guide frame round it.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = .5, ZP = 19;
    function X(px) { return (px - 330) * K; } function Y(py) { return (550 - py) * K; }
    var o = this.o = { th: .02, w: 0, depth: 0, first: true, rc: 11, ZP: ZP, hz: [X(200), Y(300)], hr: [X(538), Y(300)], piv: [X(105), Y(155)], rodL: 188, att: 100 };
    o.xb = X(380) - 25 + 25;                                                // saw centre at start x 25
    var fx = c.fixed;
    // frame: two uprights on foot plates, a top beam, and braces
    P.at(P.box(600, 8, 150, fx), 0, -4, 5, scene);                          // ground x -300..300, y -8..0
    P.at(P.box(55, 6, 28, fx), -62.5, 3, 0, scene);                         // left foot x -90..-35, y 0..6, z -14..14
    P.at(P.box(57.5, 6, 28, fx), 106.25, 3, 0, scene);                      // right foot x 77.5..135
    P.at(P.box(13.5, 147.5, 28, fx), -60.75, 79.75, 0, scene);              // left upright x -67.5..-54, y 6..153.5
    P.at(P.box(12.5, 147.5, 28, fx), 108.75, 79.75, 0, scene);              // right upright x 102.5..115
    P.at(P.box(182.5, 13.5, 28, fx), 23.75, 146.75, 0, scene);              // top beam x -67.5..115, y 140..153.5
    // two rod braces, one each side
    var b1 = P.rod(2.5, fx); b1.span(-85, 6, 0, -67.5, 50, 0); scene.add(b1);
    var b2 = P.rod(2.5, fx); b2.span(130, 6, 0, 115, 50, 0); scene.add(b2);
    // corner wheels on the front faces of the uprights
    o.hubs = [];
    [o.hz, o.hr].forEach(function (p) {
      P.at(P.cylZ(o.rc, 10, c.mat("rope")), p[0], p[1], ZP, scene);                       // wheel z 14..24, on the upright face z 14
      P.at(P.cylZ(4, 11.5, c.mat("rope", "dark")), p[0], p[1], 20.25, scene);            // hub z 14.5..26
    });
    // tripod on the left: two front legs, one behind
    var hd = [o.piv[0], o.piv[1], ZP];
    [[-155, 0, ZP], [-80, 0, ZP], [X(105), 0, -45]].forEach(function (f) { var l = P.rod(3.5, fx); l.span(hd[0], hd[1], hd[2], f[0], f[1], f[2]); scene.add(l); });
    P.at(P.box(16, 14, 16, fx), hd[0], hd[1] + 7, ZP, scene);                              // head x -120.5..-104.5, z 11..27, y 197.5..211.5, above the wheel pin
    // pendulum
    o.pg = new T.Group(); o.pg.position.set(o.piv[0], o.piv[1], ZP); scene.add(o.pg);
    P.at(P.cylZ(9, 4, c.mat("pend")), 0, 0, -4, o.pg);                                     // wheel z 13..17
    P.at(P.cylY(1.8, o.rodL, c.mat("pend")), 0, -o.rodL / 2, 0, o.pg);                     // rod, z 17.2..20.8
    P.at(P.cylZ(2.5, 9, c.mat("pend", "dark")), 0, 0, 1.5, o.pg);                          // pin z 14.5..23.5... through the wheel
    o.bob = P.at(P.box(22, 22, 6, c.mat("pend")), 0, -150, 0, o.pg);                       // block, z 16..22
    P.at(P.box(22.5, 2.4, 6.5, c.mat("pend", "dark")), 0, -150, 0, o.pg);                  // dark band round it
    P.at(P.sphere(3, c.mat("rope")), 0, -o.att, 0, o.pg);                                   // where the cord is tied
    o.cord = P.rod(1.2, c.mat("rope")); scene.add(o.cord);
    // saw bow, origin at the middle of the blade's lower edge
    o.sg = new T.Group(); scene.add(o.sg);
    var sh = new T.Shape(), N = 16, s = 76 / N; sh.moveTo(-38, 8); sh.lineTo(38, 8); sh.lineTo(38, 4);
    for (var k = 0; k < N; k++) { var x = 38 - k * s; sh.lineTo(x, 0); sh.lineTo(x - s, 4); }
    sh.lineTo(-38, 8);
    var bg = new T.ExtrudeGeometry(sh, { depth: 2.4, bevelEnabled: false }); bg.translate(0, 0, -1.2);
    o.sg.add(new T.Mesh(bg, c.mat("saw", "dark")));                                          // blade z -1.2..1.2
    [-1, 1].forEach(function (sd) {
      P.at(P.box(6, 52, 6, c.mat("saw")), sd * 41, 30, 0, o.sg);                           // arm x 38..44 (inner face meets the blade end), y 4..56
      P.at(P.sphere(4.5, c.mat("saw", sd < 0 ? "mark" : null)), sd * 41, 60, 0, o.sg);    // handle knob
    });
    P.at(P.box(76, 6, 6, c.mat("saw")), 0, 49, 0, o.sg);                                    // top bar y 46..52 between the arms
    P.at(P.sphere(3, c.mat("rope")), 0, 56, 0, o.sg);                                       // eye for the ropes
    P.at(P.sphere(2.5, c.mat("rope")), -41, 25, 4.8, o.sg);                                 // tie for the cord (on the front of the left arm)
    // ropes over the wheels
    o.rl = P.rod(1.2, c.mat("rope")); o.rr = P.rod(1.2, c.mat("rope")); scene.add(o.rl); scene.add(o.rr);
    o.wl = P.rod(1.2, c.mat("rope")); o.wr = P.rod(1.2, c.mat("rope")); scene.add(o.wl); scene.add(o.wr);
    o.al = new T.Mesh(new T.TorusGeometry(o.rc, 1.2, 8, 24, 1), c.mat("rope")); o.al.userData.live = true; scene.add(o.al);
    o.ar = new T.Mesh(new T.TorusGeometry(o.rc, 1.2, 8, 24, 1), c.mat("rope")); o.ar.userData.live = true; scene.add(o.ar);
    o.al.position.set(o.hz[0], o.hz[1], ZP); o.ar.position.set(o.hr[0], o.hr[1], ZP);
    o.wtL = P.at(P.box(8, 22, 8, c.mat("weight")), 0, 0, ZP, scene); o.wtR = P.at(P.box(8, 22, 8, c.mat("weight")), 0, 0, ZP, scene);
    // log lying across the saw's path: axis along z, in two halves with a slot between them
    var lx = 15, ly = 22.5, lr = 22.5, gap = 1.6;
    o.log = { x: lx, y: ly, r: lr };
    P.at(P.cylZ(lr, 40 + ZP - gap, c.mat("log")), lx, ly, (-40 + ZP - gap) / 2, scene);   // z -40..17.4
    P.at(P.cylZ(lr, 40 - ZP - gap, c.mat("log")), lx, ly, (ZP + gap + 40) / 2, scene);     // z 20.6..40
    for (var q = 1; q <= 3; q++) P.at(P.hoop(q * 6, .6, c.mat("log", "dark")), lx, ly, 40.7, scene);   // growth rings on the end
    for (q = 0; q < 8; q++) { var rb = P.box(lr - 5, .8, .8, c.mat("log", "dark")); rb.position.set(lx + (lr - 5) / 2 * Math.cos(q * Math.PI / 4) + 4 * Math.cos(q * Math.PI / 4), ly + ((lr - 5) / 2 + 4) * Math.sin(q * Math.PI / 4), 40.7); rb.rotation.z = q * Math.PI / 4; scene.add(rb); }
    o.slab = new T.Group(); scene.add(o.slab);
    o.slabF = new T.Mesh(new T.ShapeGeometry(new T.Shape()), c.mat("log", "dark")); o.slabF.position.set(lx, ly, ZP - gap / 2 + .4);
    o.slabB = new T.Mesh(new T.ShapeGeometry(new T.Shape()), c.mat("log", "dark")); o.slabB.position.set(lx, ly, ZP + gap / 2 - .4);
    o.slabF.userData.live = o.slabB.userData.live = true; scene.add(o.slabF); scene.add(o.slabB);
    o.lastD = -1;
  },

  step: function (c, dt, S) {
    var o = this.o, L = +S.controls.len, ZP = o.ZP, rc = o.rc, i;
    var g = 760, th = o.th, w = o.w, om = Math.sqrt(g / L), thm = .05;
    if (S.playing && dt > 0) {
      var n = Math.max(1, Math.ceil(Math.min(dt, .05) / .004)), h = Math.min(dt, .05) / n;
      for (i = 0; i < n; i++) {                                     // pendulum with a small push each swing (a van der Pol push)
        var acc = -om * om * Math.sin(th) + .5 * om * (1 - (th / thm) * (th / thm)) * w;
        w += acc * h; th += w * h;
      }
      o.th = th; o.w = w;
    }
    o.pg.rotation.z = th;
    o.bob.position.y = -L; o.pg.children[4].position.y = -L;
    // cord: fixed length from the tie on the rod to the tie on the saw
    var ax = o.piv[0] + o.att * Math.sin(th), ay = o.piv[1] - o.att * Math.cos(th);
    var yb = 45 - o.depth;                                         // blade lower edge
    if (o.first) { o.xb = 25; o.ell = Math.hypot(-16 - ax, yb + 20 - ay); o.first = false; o.len0 = null; }
    var py = yb + 20, px = ax + Math.sqrt(Math.max(1, o.ell * o.ell - (py - ay) * (py - ay)));
    var prevX = o.xb; o.xb = px + 41;
    if (S.playing && dt > 0) o.depth = Math.min(36, o.depth + .02 * Math.abs(o.xb - prevX));
    yb = 45 - o.depth; py = yb + 20; px = ax + Math.sqrt(Math.max(1, o.ell * o.ell - (py - ay) * (py - ay))); o.xb = px + 41;
    o.sg.position.set(o.xb, yb, ZP);
    o.cord.span(ax, ay, ZP, px, py, ZP + 4.8);
    // ropes from the eye on the saw to the two wheels, over them, and down to the weights
    var ex = o.xb, ey = yb + 56;
    function tangent(cx, cy, left) {                               // upper tangent point from the eye to the wheel
      var dx = ex - cx, dy = ey - cy, d = Math.hypot(dx, dy), be = Math.atan2(dy, dx), ga = Math.acos(rc / d);
      var a1 = be + ga, a2 = be - ga, y1 = Math.sin(a1), y2 = Math.sin(a2);
      return y1 > y2 ? a1 : a2;
    }
    var tl = tangent(o.hz[0], o.hz[1]), tr = tangent(o.hr[0], o.hr[1]);
    var lx = o.hz[0] + rc * Math.cos(tl), ly = o.hz[1] + rc * Math.sin(tl), rx = o.hr[0] + rc * Math.cos(tr), ry = o.hr[1] + rc * Math.sin(tr);
    o.rl.span(ex, ey, ZP, lx, ly, ZP); o.rr.span(ex, ey, ZP, rx, ry, ZP);
    var lenL = Math.hypot(ex - lx, ey - ly) + rc * (Math.PI - tl), lenR = Math.hypot(ex - rx, ey - ry) + rc * tr;
    if (!o.len0) o.len0 = [lenL, lenR];
    var dropL = lenL - o.len0[0], dropR = lenR - o.len0[1];         // longer on the saw side means the weight is lifted
    var wl = 72.5 - dropL, wr = 72.5 - dropR;                      // top of each weight
    o.al.geometry.dispose(); o.al.geometry = new c.THREE.TorusGeometry(rc, 1.2, 8, 24, Math.max(.05, Math.PI - tl)); o.al.rotation.z = tl;
    o.ar.geometry.dispose(); o.ar.geometry = new c.THREE.TorusGeometry(rc, 1.2, 8, 24, Math.max(.05, tr)); o.ar.rotation.z = 0;
    var xl = o.hz[0] - rc, xr = o.hr[0] + rc;
    o.wl.span(xl, o.hz[1], ZP, xl, wl, ZP); o.wr.span(xr, o.hr[1], ZP, xr, wr, ZP);
    o.wtL.position.set(xl, wl - 11, ZP); o.wtR.position.set(xr, wr - 11, ZP);
    // kerf: the slab shows the uncut wood below the slot floor
    if (Math.abs(o.depth - o.lastD) > .02) {
      o.lastD = o.depth;
      var lg = o.log, yf = lg.r - o.depth, sh = new c.THREE.Shape(), al = Math.asin(Math.max(-1, Math.min(1, (yf) / lg.r))), pts = [], m = 24;
      for (i = 0; i <= m; i++) { var a = Math.PI - al + (Math.PI + 2 * al) * i / m; pts.push(new c.THREE.Vector2(lg.r * .999 * Math.cos(a), lg.r * .999 * Math.sin(a))); }
      sh = new c.THREE.Shape(pts);
      o.slabF.geometry.dispose(); o.slabF.geometry = new c.THREE.ShapeGeometry(sh);
      o.slabB.geometry.dispose(); o.slabB.geometry = new c.THREE.ShapeGeometry(sh);
    }
    S.set("a", (th > 0 ? "+" : th < 0 ? "−" : "") + Math.abs(th * 180 / Math.PI).toFixed(1) + "°");
    S.set("n", (60 * om / (2 * Math.PI)).toFixed(0) + " a min");
    S.set("d", o.depth.toFixed(1) + " mm");
  }
});
