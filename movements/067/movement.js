M507.define({
  number: 67,
  title: "Jumping tumbler",
  lede: "A worm wheel turns slowly and steadily. A heavy curved weight, called a tumbler, is rolled up with it, then tips over and falls forward on its own. A slow, steady drive gives a sudden, quick move.",
  alt: "A toothed wheel stands upright with a screw on a level shaft under it. In front of it is a big violet weight shaped like a thick new moon, with its two points hanging down on each side of the middle.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Worm", note: "A screw on the driving shaft, also called an endless screw. Each turn moves the wheel on by one tooth." },
    { key: "wheel", color: "#C8873A", name: "Worm wheel", note: "Turns slowly and never stops. Its shaft carries a short pin at the front end. The pin is what rolls the tumbler up." },
    { key: "sleeve", color: "#4FA58A", name: "Hollow shaft", note: "A tube that turns freely on the wheel's shaft. Half of its front end is cut away, so the pin has half a turn of room." },
    { key: "tumbler", color: "#8E7AA8", name: "Tumbler", note: "A heavy curved weight fixed to the hollow shaft. Most of it lies on one side of the shaft. Watch it tip over and fall." }
  ],
  controls: [],
  speed: { min: 20, max: 200, value: 120, label: "Worm", unit: " rpm" },
  readouts: [{ id: "wheel", label: "Wheel" }, { id: "tumbler", label: "Tumbler" }, { id: "jumps", label: "Jumps" }],
  views: { "3d": [330, 170, 700], front: [0, 0, 720], side: [720, 0, 0] },
  target: [0, 0, 0],
  how: [
    "The worm turns the wheel slowly, and the wheel's shaft turns with it. A pin on that shaft pushes the edge of the hollow shaft. So the heavy part of the tumbler is rolled slowly up the right side.",
    "Once the heavy part passes over the top, its own weight pulls it forward. It tips over and falls much faster than the pin can follow. The cut in the hollow shaft lets it fall half a turn, until the far edge of the cut stops it with its heavy part at the bottom. Then it waits until the pin comes round and rolls it up again.",
    "Slow the speed right down and watch the pin: after each fall it has to travel half a turn before it touches the hollow shaft again."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate, the bearings, the sizes and the number of teeth were made up. The tumbler's outline follows the drawing. Its swing dies away because of a little made-up rubbing.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N = 28, R = 155, D = Math.PI / 180;
    var K = this.K = { N: N, PR: 3.5, RS: 17, G: 30, C: 1.5, A0: -10 * D };
    K.d0 = Math.asin(K.PR / K.RS);                                          // pin touches the cut edge this far behind it
    var o = this.o = { phi: 0, th: 0, w: 0, jumps: 0, armed: true };

    // Layers along z: plate face -30; wheel -8..8, hub 8..12; hollow shaft 13..64; tumbler 30..46 (clear of the
    // worm, which ends at z 24); cut part of the hollow shaft 50..64, pin at 57.
    o.wheel = new T.Group(); scene.add(o.wheel);
    var g = P.spurGear({ teeth: N, module: MD, material: c.mat("wheel") }); o.wheel.add(g);   // a tooth at the bottom, over the worm
    var rp = g.pitchRadius, rf = rp - 1.25 * MD;                            // 84, 76.5
    P.at(P.cylZ(9, 94, c.mat("wheel")), 0, 0, 17, o.wheel);                 // shaft z -30..64, plate face to the front end
    P.at(P.cylZ(22, 4, c.mat("wheel")), 0, 0, 10, o.wheel);                 // hub z 8..12, on the gear face
    P.at(P.box(rf - 27, 5, 1, c.mat("wheel", "dark")), 24 + (rf - 27) / 2, 0, 9, o.wheel);   // stripe r 24..73.5, z 8.5..9.5, lifted off the face
    var pg = new T.Group(); pg.rotation.z = Math.PI / 2; o.wheel.add(pg);
    P.at(P.cylX(K.PR, K.RS, c.mat("wheel")), K.RS / 2, 0, 57, pg);           // pin r 0..17, z 53.5..60.5, pointing up at the start

    // hollow shaft and tumbler: turn together by th; cut edge K.d0 ahead of the pin when the pin pushes
    o.body = new T.Group(); scene.add(o.body);
    o.sleeves = {};
    [["half", Math.PI + 2 * K.d0], ["none", 2 * K.d0]].forEach(function (s) {
      var sl = P.cutSleeve({ rIn: 9.3, rOut: K.RS, len: 51, cutLen: 14, open: s[1], material: c.mat("sleeve") });   // z 13..64, cut part 50..64
      sl.position.z = 13; sl.rotation.z = Math.PI / 2 + K.d0; o.body.add(sl); o.sleeves[s[0]] = sl;
    });
    // tumbler: a disc of radius R with a big round bite taken from below (centre 0.9 R down, radius 1.1 R),
    // leaving a hub of radius 0.28 R round the shaft; heavy side up, turned as drawn
    var hr = .28 * R, cy = -.9 * R, cr = 1.1 * R;
    var yh = (hr * hr - cr * cr + cy * cy) / (2 * cy), xh = Math.sqrt(hr * hr - yh * yh);           // bite meets hub
    var yc = (R * R - cr * cr + cy * cy) / (2 * cy), xc = Math.sqrt(R * R - yc * yc);               // bite meets rim (the points)
    var sh = new T.Shape();
    sh.moveTo(xc, yc);
    sh.absarc(0, 0, R, Math.atan2(yc, xc), Math.PI - Math.atan2(yc, xc), false);                     // rim, over the top
    sh.absarc(0, cy, cr, Math.atan2(yc - cy, -xc), Math.atan2(yh - cy, -xh), true);                   // bite, left point to hub
    sh.absarc(0, 0, hr, Math.atan2(yh, -xh), Math.atan2(yh, xh) + 2 * Math.PI, false);                // hub, round under the shaft
    sh.absarc(0, cy, cr, Math.atan2(yh - cy, xh), Math.atan2(yc - cy, xc), true);                     // bite, hub to right point
    var hole = new T.Path(); hole.absarc(0, 0, K.RS - .1, 0, 2 * Math.PI, true); sh.holes.push(hole);
    var tg = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false, curveSegments: 64 }); tg.translate(0, 0, 30);
    var tm = new T.Mesh(tg, c.mat("tumbler")); tm.rotation.z = K.A0; o.body.add(tm);                 // z 30..46, on the hollow shaft

    // worm under the wheel: axis along X at y = -(rp + 18) = -102
    o.worm = new T.Group(); o.worm.position.set(0, -(rp + 18), 0); scene.add(o.worm);
    P.at(P.worm({ radius: 18, pitch: Math.PI * MD, length: 76, material: c.mat("worm") }), 0, 0, 0, o.worm);   // x -38..38, tip r 24
    P.at(P.cylX(6, 220, c.mat("worm")), 0, 0, 0, o.worm);                  // shaft x -110..110, bearing face to bearing face
    [-1, 1].forEach(function (s) { P.at(P.box(50, 1, 3, c.mat("worm", "dark")), s * 72, 7, 0, o.worm); });   // stripes x 47..97, y 6.5..7.5, lifted off the shaft
    [-1, 1].forEach(function (s) { P.at(P.box(20, 24, 42, c.fixed), s * 120, -102, -9, scene); });   // bearings x 110..130, y -114..-90, z -30..12

    // supports: low enough that the tumbler (r 155) clears the base
    P.at(P.box(300, 275, 10, c.fixed), 0, -27.5, -35, scene);              // plate x -150..150, y -165..110, z -40..-30
    P.at(P.box(340, 12, 100, c.fixed), 0, -171, -30, scene);               // base x -170..170, y -177..-165, z -80..20; plate stands on y -165
    this.place();
  },

  place: function () {
    var o = this.o;
    o.wheel.rotation.z = o.phi; o.worm.rotation.x = -this.K.N * o.phi; o.body.rotation.z = o.th;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, tight = false, ws = S.w / K.N, n, h, i, k;
    for (k in o.sleeves) o.sleeves[k].visible = (k === "none") === tight;
    if (S.playing) {
      n = Math.ceil(dt * 600); h = dt / n;
      for (i = 0; i < n; i++) {
        o.phi += ws * h;
        var tau = K.G * Math.sin(o.th + K.A0);                              // heavy part past the top pulls forward, before it holds back
        o.w += (tau - K.C * o.w) * h; o.th += o.w * h;
        var d = o.th - o.phi, top = tight ? 0 : Math.PI;
        if (d <= 0) { o.th = o.phi; if (o.w < ws) o.w = ws; }               // the pin pushes the cut edge
        else if (d >= top) { o.th = o.phi + top; if (o.w > ws) o.w = ws; }    // the far edge reaches the pin
        d = o.th - o.phi;
        if (d < .01) o.armed = true; else if (o.armed && d > 1) { o.armed = false; o.jumps++; }
      }
    }
    this.place();
    function f(v, p) { v = Math.round(v * p) / p; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("wheel", f(S.playing ? S.rpm / K.N : 0, 10));
    S.set("tumbler", f(S.playing ? o.w * 60 / (2 * Math.PI) : 0, 1));
    S.set("jumps", String(o.jumps));
  }
});
