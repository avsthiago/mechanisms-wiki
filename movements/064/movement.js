M507.define({
  number: 64,
  title: "Jumping cam",
  lede: "A worm wheel turns slowly and steadily, but the cam in front of it stands still, then jumps forward. A pin and a hollow shaft with half of its end cut away let the cam run ahead of the wheel. This gives a quick, sudden move from a slow, steady drive.",
  alt: "A toothed wheel stands upright with a screw on a level shaft under it. In front of the wheel is a red cam shaped like a letter D. A long yellow lever lies across the top of the cam, and a curly flat spring above presses the lever down onto it.",
  parts: [
    { key: "worm", color: "#5E7387", name: "Worm", note: "A screw on the driving shaft, also called an endless screw. Each turn moves the wheel on by one tooth." },
    { key: "wheel", color: "#C8873A", name: "Worm wheel", note: "Turns slowly and never stops. Its shaft carries a short pin at the front end. The pin is what pushes the cam." },
    { key: "sleeve", color: "#E8E2D0", name: "Hollow shaft", note: "A tube that turns freely on the wheel's shaft. Half of its front end is cut away, so the pin has half a turn of room." },
    { key: "cam", color: "#8E7AA8", name: "Cam", note: "Fixed on the hollow shaft. Its edge climbs slowly on one side and drops straight down on the other. Watch it jump." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "Turns on a pin at its left end. Its wheel, called a roller, rides on the edge of the cam." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "A flat strip of springy steel fixed at its left end. It presses the lever down on the cam." }
  ],
  controls: [],
  speed: { min: 20, max: 200, value: 120, label: "Worm", unit: " rpm" },
  readouts: [{ id: "wheel", label: "Wheel" }, { id: "cam", label: "Cam" }, { id: "jumps", label: "Jumps" }],
  views: { "3d": [210, 230, 690], front: [-95, 25, 800], side: [720, 25, 0] },
  target: [-95, 25, 0],
  how: [
    "The worm turns the wheel slowly, and the wheel's shaft turns with it. A pin on that shaft pushes the edge of the hollow shaft, so the cam creeps round too. As it goes, the cam lifts the roller and bends the spring.",
    "Just past the highest point, the roller reaches the straight side of the cam. Now the spring pushes the cam forward instead of holding it back. The cam jumps nearly half a turn on its own, far faster than the pin. Then it waits, still, until the pin catches up and pushes it again.",
    "The cut in the hollow shaft gives the cam room to run ahead. Slow the speed right down and watch the gap between the pin and the cut edge open with each jump."
  ],
  note: "This model is rebuilt from Brown's drawing. The plate, the bearings, the block that holds the spring, the sizes and the number of teeth were made up. The cam's outline follows the drawing. The lever and roller are taken as having no weight, and the cam settles after its jump because of a little made-up rubbing.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N = 28, i;
    var K = this.K = { N: N, PX: -322, PY: 115, L: 344, RR: 11, PR: 3.5, RS: 17, A: 400, B: 1500, C: 2.5, XC: -157, NT: 720 };
    K.d0 = Math.asin(K.PR / K.RS);                                          // pin touches the cut edge this far behind it
    var o = this.o = { phi: 0, th: 0, w: 0, wa: 0, jumps: 0, armed: true };

    // Layers along z: plate face -30; wheel -8..8, hub 8..12; hollow shaft 13..62; cam and roller 28..40;
    // lever and spring 41..47; cut part of the hollow shaft 48..62 with the pin at 55.
    // worm wheel, its shaft and the pin
    o.wheel = new T.Group(); scene.add(o.wheel);
    var g = P.spurGear({ teeth: N, module: MD, material: c.mat("wheel") }); o.wheel.add(g);   // a tooth at the bottom, over the worm
    var rp = g.pitchRadius, rf = rp - 1.25 * MD;                            // 84, 76.5
    P.at(P.cylZ(9, 92, c.mat("wheel")), 0, 0, 16, o.wheel);                 // shaft z -30..62, plate face to the front end
    P.at(P.cylZ(22, 4, c.mat("wheel")), 0, 0, 10, o.wheel);                 // hub z 8..12, on the gear face
    P.at(P.box(rf - 27, 5, 1, c.mat("wheel", "dark")), 24 + (rf - 27) / 2, 0, 9, o.wheel);   // stripe r 24..73.5, z 8.5..9.5, lifted off the face
    var pin = P.cylX(K.PR, K.RS, c.mat("wheel"));                           // pin r 0..17, z 51.5..58.5, pointing up at the start
    var pg = new T.Group(); pg.rotation.z = Math.PI / 2; o.wheel.add(pg);
    P.at(pin, K.RS / 2, 0, 55, pg);

    // hollow shaft and cam: turn together by th; cut edge K.d0 ahead of the pin when the pin pushes
    o.cam = new T.Group(); scene.add(o.cam);
    o.sleeves = {};
    [["half", Math.PI + 2 * K.d0], ["none", 2 * K.d0]].forEach(function (s) {
      var sl = P.cutSleeve({ rIn: 9.3, rOut: K.RS, len: 49, cutLen: 14, open: s[1], material: c.mat("sleeve") });   // z 13..62, cut part 48..62
      sl.position.z = 13; sl.rotation.z = Math.PI / 2 + K.d0; o.cam.add(sl); o.sleeves[s[0]] = sl;
    });
    // cam outline from the drawing (model units, cam frame): a slow climb round the left, a straight drop on the right
    var raw = [[60, 140], [30, 139], [-15, 133], [-40, 122], [-58, 100], [-70, 45], [-65, -5], [-45, -40], [-5, -60], [35, -57], [60, -50]];
    var pts = raw.map(function (p) { return [p[0] * .75, p[1] * .75]; }), poly = [];
    function cr(p0, p1, p2, p3, t) {
      var t2 = t * t, t3 = t2 * t;
      return [0, 1].map(function (k) { return .5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3); });
    }
    for (i = 0; i < pts.length - 1; i++) for (var k = 0; k < 12; k++) poly.push(cr(pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)], k / 12));
    var a = pts[pts.length - 1], b = pts[0];
    for (k = 0; k < 24; k++) poly.push([a[0] + (b[0] - a[0]) * k / 24, a[1] + (b[1] - a[1]) * k / 24]);   // the straight side
    var sh = new T.Shape(); sh.moveTo(poly[0][0], poly[0][1]); for (i = 1; i < poly.length; i++) sh.lineTo(poly[i][0], poly[i][1]);
    var hole = new T.Path(); hole.absarc(0, 0, K.RS - .1, 0, 2 * Math.PI, true); sh.holes.push(hole);
    var cg = new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false, curveSegments: 32 }); cg.translate(0, 0, 28);
    o.cam.add(new T.Mesh(cg, c.mat("cam")));                                // cam z 28..40, on the hollow shaft

    // lever angle for each cam angle: the lowest angle at which the roller clears the cam
    function inside(x, y) { var q = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var p = poly[i], r = poly[j]; if ((p[1] > y) !== (r[1] > y) && x < (r[0] - p[0]) * (y - p[1]) / (r[1] - p[1]) + p[0]) q = !q; } return q; }
    function dist(x, y) {
      var m = 1e9;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var p = poly[j], r = poly[i], dx = r[0] - p[0], dy = r[1] - p[1], t = Math.max(0, Math.min(1, ((x - p[0]) * dx + (y - p[1]) * dy) / (dx * dx + dy * dy)));
        var ex = p[0] + t * dx - x, ey = p[1] + t * dy - y; m = Math.min(m, ex * ex + ey * ey);
      }
      return Math.sqrt(m);
    }
    K.tab = [];
    for (i = 0; i < K.NT; i++) {
      var th = i / K.NT * 2 * Math.PI, cs = Math.cos(-th), sn = Math.sin(-th), lo = -.6, hi = .3;
      for (k = 0; k < 28; k++) {
        var be = (lo + hi) / 2, x = K.PX + K.L * Math.cos(be), y = K.PY + K.L * Math.sin(be), u = cs * x - sn * y, v = sn * x + cs * y;
        if (!inside(u, v) && dist(u, v) >= K.RR) hi = be; else lo = be;
      }
      K.tab.push(hi);
    }
    K.bmin = Math.min.apply(null, K.tab);

    // lever: turns about its pin at (-322, 115); roller centre K.L along it
    o.lever = new T.Group(); o.lever.position.set(K.PX, K.PY, 0); scene.add(o.lever);
    P.at(P.box(K.L + 24, 16, 6, c.mat("lever")), K.L / 2, 0, 44, o.lever);   // bar x -12..356, y -8..8, z 41..47
    P.at(P.cylZ(10, 7, c.mat("lever")), 0, 0, 44, o.lever);                // boss z 40.5..47.5
    P.at(P.cylZ(K.RR, 12, c.mat("lever")), K.L, 0, 34, o.lever);           // roller z 28..40, in the cam's plane
    P.at(P.cylZ(3, 13.5, c.mat("lever", "dark")), K.L, 0, 34.25, o.lever);  // roller pin z 27.5..41, ends on the bar
    P.at(P.cylZ(4, 70.5, c.fixed), K.PX, K.PY, 5.25, scene);               // lever pin z -30..40.5, plate face to boss
    P.at(P.cylZ(4, 1, c.mat("lever", "dark")), 0, 0, 48, o.lever);          // pin head z 47.5..48.5, on the boss face

    // flat spring: clamped in a block at x -280, its curl rests on the lever at x -157
    P.at(P.box(54, 18, 77, c.fixed), -307, 181, 8.5, scene);              // block x -334..-280, y 172..190, z -30..47
    o.spring = P.at(P.flatStrip({ points: this.springPts(0), thick: 5, width: 6, material: c.mat("spring") }), 0, 0, 44, scene);   // z 41..47
    o.spring.userData.live = true;

    // worm under the wheel: axis along X at y = -(rp + 18) = -102
    o.worm = new T.Group(); o.worm.position.set(0, -(rp + 18), 0); scene.add(o.worm);
    P.at(P.worm({ radius: 18, pitch: Math.PI * MD, length: 76, material: c.mat("worm") }), 0, 0, 0, o.worm);   // x -38..38, tip r 24
    P.at(P.cylX(6, 220, c.mat("worm")), 0, 0, 0, o.worm);                  // shaft x -110..110, bearing face to bearing face
    [-1, 1].forEach(function (s) { P.at(P.box(50, 1, 3, c.mat("worm", "dark")), s * 72, 7, 0, o.worm); });   // stripes x 47..97, y 6.5..7.5, lifted off the shaft
    [-1, 1].forEach(function (s) { P.at(P.box(20, 24, 42, c.fixed), s * 120, -102, -9, scene); });   // bearings x 110..130, y -114..-90, z -30..12

    // supports
    P.at(P.box(490, 340, 10, c.fixed), -100, 30, -35, scene);              // plate x -345..145, y -140..200, z -40..-30
    P.at(P.box(530, 12, 100, c.fixed), -100, -146, -30, scene);            // base x -365..165, y -152..-140, z -80..20; plate stands on y -140
    this.place();
  },

  beta: function (th) {
    var K = this.K, u = ((th / (2 * Math.PI)) % 1 + 1) % 1 * K.NT, i = Math.floor(u), f = u - i, t = K.tab;
    return [t[i] * (1 - f) + t[(i + 1) % K.NT] * f, (t[(i + 1) % K.NT] - t[(i + K.NT - 1) % K.NT]) / 2 / (2 * Math.PI / K.NT)];
  },

  springPts: function (be) {
    var K = this.K, yb = K.PY + (K.XC - K.PX) * Math.tan(be) + 8 / Math.cos(be) + 2.5 + 8, p = [], i;   // centre of the curl, which rests on the bar
    var ya = 181, yt = yb - 8;
    for (i = 0; i <= 24; i++) { var u = i / 24; p.push([-280 + (K.XC + 280) * u, ya + (yt - ya) * (3 * u * u - 2 * u * u * u)]); }
    for (i = 1; i <= 12; i++) { var a = -Math.PI / 2 + i / 12 * 5 * Math.PI / 3; p.push([K.XC + 8 * Math.cos(a), yb + 8 * Math.sin(a)]); }
    return p;
  },

  place: function () {
    var o = this.o, be = this.beta(o.th)[0];
    o.wheel.rotation.z = o.phi; o.worm.rotation.x = -this.K.N * o.phi; o.cam.rotation.z = o.th;
    o.lever.rotation.z = be; o.spring.setPoints(this.springPts(be));
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, tight = false, ws = S.w / K.N, n, h, i, k;
    for (k in o.sleeves) o.sleeves[k].visible = (k === "none") === tight;
    if (S.playing) {
      n = Math.ceil(dt * 600); h = dt / n;
      for (i = 0; i < n; i++) {
        o.phi += ws * h;
        var q = this.beta(o.th), tau = -(K.A + K.B * (q[0] - K.bmin)) * q[1];   // spring force on the roller, turned into a twist on the cam
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
    S.set("cam", f(S.playing ? o.w * 60 / (2 * Math.PI) : 0, 1));
    S.set("jumps", String(o.jumps));
  }
});
