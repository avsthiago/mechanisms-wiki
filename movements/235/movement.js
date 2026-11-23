M507.define({
  number: 235,
  title: "Tappet arm and ratchet wheel",
  lede: "A long arm swings up and down. A hinged hook on its end, called a tappet, catches a tooth of a star-shaped wheel and pushes it round as the arm rises. On the way down the hook folds out of the way. So the wheel only ever turns one way.",
  alt: "A star-shaped wheel with six sharp teeth. Below it a long arm lies almost level, hinged at its right end. A hook is hinged to its left end and points up towards the wheel, held by a small coil spring. A curved spring finger rests on the wheel from above.",
  parts: [
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A star-shaped wheel with six sharp teeth. It is pushed round one tooth at a time. Watch the red mark on its face." },
    { key: "arm", color: "#5E7387", name: "Swinging arm", note: "A long bar hinged at its right end. It swings up and down and carries the tappet." },
    { key: "tappet", color: "#C2503F", name: "Tappet", note: "A hook hinged to the end of the arm. Going up it pushes a tooth. Coming down it folds and slides over the next tooth. Watch it." },
    { key: "click", color: "#4FA58A", name: "Holding pawl", note: "A curved finger on a fixed pin, called a holding pawl. It lets the wheel turn forward and stops it from turning back." },
    { key: "spring", color: "#8E7AA8", name: "Small spring", note: "A coil spring under the tappet. It holds the hook out, and squeezes when the hook folds." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing of the arm", min: 10, max: 45, step: 5, value: 30, unit: "°",
    presets: [[10, "Small"], [30, "Medium"], [45, "Wide"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Swings", unit: " a min" },
  readouts: [{ id: "arm", label: "Arm" }, { id: "wheel", label: "Wheel" }, { id: "teeth", label: "Moved on" }],
  views: { "3d": [270, 149, 465], front: [90, -5, 640], side: [800, 40, 40] },
  target: [90, -5, 0],
  how: [
    "The long arm swings up, then down. A hook called the tappet is hinged to its left end. The hook points up at the star wheel, and a small spring holds it out.",
    "Going up, the tip of the hook pushes against the steep side of a tooth and carries the wheel round. Coming down, it meets the sloping side of the next tooth. The slope pushes the hook back and the spring squeezes. The hook slides over the top, then springs out again. A curved finger on a fixed pin stops the wheel from turning back.",
    "Try the Small swing. The hook never reaches the steep side of a tooth, so the wheel does not move at all. Then try Medium. The wheel moves on exactly one tooth for each swing, however far the arm goes."
  ],
  note: "This model is rebuilt from Brown's drawing. The drawing shows the tappet and the holding pawl as curved shapes. Here they are straight pieces. The plate behind the wheel, the pins, the sizes, and the shape of the star were made up. In the drawing the spring is a thin wire. Here it is a coil.",

  init: function () {
    var K = this.K = { N: 6, R: 60, D: 26, PX: 227, PY: -80, LH: 108.2, LB: 97, BS: -8.8 * Math.PI / 180, PH0: 10 * Math.PI / 180,
      CR: 80, CA: 96 * Math.PI / 180, DC0: 49 * Math.PI / 180 };
    K.st = 2 * Math.PI / K.N; K.root = K.R - K.D;
    K.a0 = Math.atan2(7, -108);
    this.o = { th: 0, rho: 0, phi: 0, k: 0, dc: 0 };
    var o = this.o, u, r0;
    o.phi = K.PH0; o.phi0 = o.phi;
    var T = this.tip(this.joint(0), K.BS); o.k = Math.ceil((T.a - o.phi) / K.st - 1e-9);
    u = 145 * Math.PI / 180 - o.phi; r0 = this.rimAt(u);
    K.LC = Math.sqrt(K.CR * K.CR + r0 * r0 - 2 * K.CR * r0 * Math.cos(K.DC0));
    this.phys(0, 0, 0);
  },
  reach: function (rj, L, r) { return Math.acos(Math.max(-1, Math.min(1, (rj * rj + r * r - L * L) / (2 * rj * r)))); },
  // rim radius at the angle u round the wheel: steep faces on multiples of the pitch, the rim falling from the tip to the root going anticlockwise
  rimAt: function (u) { var K = this.K, f = -u / K.st + 1e-9; f -= Math.floor(f); return K.root + K.D * f; },
  joint: function (rho) {
    var K = this.K, a = K.a0 - rho, x = K.PX + K.LH * Math.cos(a), y = K.PY + K.LH * Math.sin(a);
    return { x: x, y: y, r: Math.hypot(x, y), a: Math.atan2(y, x), arm: a };
  },
  // the tappet tip when it is turned by beta from the arm's own direction
  tip: function (J, beta) {
    var K = this.K, b = J.arm + beta, x = J.x + K.LB * Math.cos(b), y = J.y + K.LB * Math.sin(b);
    return { x: x, y: y, r: Math.hypot(x, y), a: Math.atan2(y, x) };
  },
  // the smallest fold beta (from the stop) that brings the tip outside the wheel's outline
  fold: function (J) {
    var K = this.K, o = this.o, b = K.BS, T = this.tip(J, b), step = .01, hi;
    function inside(t) { return t.r < K.R && t.r < o.self.rimAt(t.a - o.phi); }
    o.self = this;
    if (!inside(T)) return { b: b, T: T };
    while (inside(T) && b < K.BS + 1.6) { b += step; T = this.tip(J, b); }
    hi = b; var lo = b - step, i;
    for (i = 0; i < 12; i++) { var m = (lo + hi) / 2; if (inside(this.tip(J, m))) lo = m; else hi = m; }
    return { b: hi, T: this.tip(J, hi) };
  },

  // h: time step, w: input speed (rad/s), sw: full swing of the arm (radians)
  phys: function (h, w, sw) {
    var K = this.K, o = this.o, i, st = K.st;
    o.th += w * h;
    o.rho = sw * (1 - Math.cos(o.th)) / 2;                                  // arm angle, 0 at the bottom, turning up
    var J = this.joint(o.rho), F;
    o.J = J;
    for (i = 0; i < 4; i++) {
      F = this.fold(J);
      var u = F.T.a - o.phi;
      if (F.T.r >= K.R) o.k = Math.ceil(u / st - 1e-9);                       // outside the teeth: nothing is touching
      else {
        while (u <= (o.k - 1) * st) o.k--;                                     // slid over a tooth top into the next gap
        if (u > o.k * st) o.phi = F.T.a - o.k * st;                            // the steep face stops the tip, so the wheel is pushed round
      }
    }
    F = this.fold(J);
    o.beta = F.b - K.BS; o.at = F.T.a; o.rt = F.T.r; o.folded = o.beta > 1e-6;
    // holding finger: tip anticlockwise of its pin, rides the teeth
    var uc = K.CA + o.dc - o.phi;
    for (i = 0; i < 4; i++) { o.dc = this.reach(K.CR, K.LC, this.rimAt(uc)); uc = K.CA + o.dc - o.phi; }
    o.rc = this.rimAt(uc);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    this.init();
    var K = this.K, o = this.o;
    function side(px, py, nx, ny) { return (nx - px) * -py - (ny - py) * -px < 0 ? 1 : -1; }   // body away from the wheel centre

    // Layers along z: plate -8..0; wheel, tappet, holding finger and spring 2..14; arm 14..22.
    // star wheel
    o.wheel = new T.Group(); o.wheel.position.z = 8; scene.add(o.wheel);
    o.wheel.add(P.ratchet({ teeth: K.N, radius: K.R, depth: K.D, width: 12, reverse: true, material: c.mat("wheel") }));   // z 2..14
    P.at(P.cylZ(8, 18, c.mat("wheel")), 0, 0, 1, o.wheel);                   // shaft z 0..18, from the plate face
    P.at(P.cylZ(14, 4, c.mat("wheel")), 0, 0, 8, o.wheel);                   // hub z 14..18, on the wheel face
    P.at(P.hoop(14, 1, c.mat("wheel", "dark")), 0, 0, 10.5, o.wheel);       // ring round the hub, lifted off its face
    var mg = new T.Group(); mg.rotation.z = 8 * Math.PI / 180; o.wheel.add(mg);   // red stripe along the foot of one tooth
    P.at(P.box(30, 4, 1, c.mat("wheel", "mark")), 32, 0, 7, mg);            // r 17..47, z 14.5..15.5, lifted off the face

    // arm, hinged on a fixed pin at its right end
    var J = o.J, ma = c.mat("arm");
    P.at(P.cylZ(5, 14, c.fixed), K.PX, K.PY, 7, scene);                       // arm pin z 0..14, from the plate face to the arm
    o.arm = new T.Group(); o.arm.position.set(K.PX, K.PY, 18); scene.add(o.arm);
    var bar = new T.Group(); bar.rotation.z = K.a0; o.arm.add(bar);
    P.at(P.box(K.LH, 12, 8, ma), K.LH / 2, 0, 0, bar);                        // arm z 14..22
    P.at(P.box(6, 16, 8, ma), K.LH - 46, 14, 0, bar);                         // bracket under the arm for the spring, y 6..22
    P.at(P.cylZ(3, 8, ma), K.LH - 46, 22, -4, bar);                           // spring pin z 10..14, from the bracket down into the tappet's layer
    P.at(P.cylZ(10, 8, ma), 0, 0, 0, o.arm);                                  // boss round the pin
    P.at(P.cylZ(9, 8, ma), K.LH * Math.cos(K.a0), K.LH * Math.sin(K.a0), 0, o.arm);   // boss round the tappet pin
    P.at(P.cylZ(6, 2, c.mat("arm", "dark")), 0, 0, 5, o.arm);                // pin head z 22..24, on the arm's face
    o.pin = P.at(P.cylZ(4, 13, c.mat("arm", "dark")), J.x, J.y, 14.5, scene);  // tappet pin z 8..21, inside the arm (arm face z 22), through the tappet into the arm
    o.pinHead = P.at(P.cylZ(6, 2, c.mat("arm", "dark")), J.x, J.y, 23, scene);   // z 22..24, on the arm's face

    // tappet
    var tx = o.rt * Math.cos(o.at), ty = o.rt * Math.sin(o.at);
    o.tappet = new T.Group(); scene.add(o.tappet);
    o.tappet.add(P.pawl({ length: K.LB, thick: 8, width: 12, side: side(J.x, J.y, tx, ty), material: c.mat("tappet") }));   // hook z 2..14, boss 1..15
    P.at(P.box(10, 26, 12, c.mat("tappet")), -6, 12, 0, o.tappet);           // tail hanging below the hinge, x -11..-1, y -1..25
    P.at(P.cylZ(2.5, 8, c.mat("tappet", "dark")), -8, 22, 0, o.tappet);      // pin the spring hooks on, inside the tail
    o.spring = P.spring({ radius: 4, wire: 1.2, turns: 7, length: 30, material: c.mat("spring") }); scene.add(o.spring);
    o.spring.position.z = 8;

    // holding finger on a fixed pin
    var cx = K.CR * Math.cos(K.CA), cy = K.CR * Math.sin(K.CA), ac = K.CA + o.dc;
    o.click = P.pawl({ length: K.LC, thick: 7, width: 12, side: side(cx, cy, o.rc * Math.cos(ac), o.rc * Math.sin(ac)), material: c.mat("click") });
    P.at(o.click, cx, cy, 8, scene);
    P.at(P.cylZ(4, 15.5, c.fixed), cx, cy, 7.75, scene);                    // pin z 0..15.5, from the plate face, just through the finger (face z 15)
    P.at(P.cylZ(6, 2, c.mat("click", "dark")), cx, cy, 16, scene);          // pin head z 15..17, on the finger's face

    // supports
    P.at(P.box(342, 240, 8, c.fixed), 91, 10, -4, scene);                    // plate x -80..262, y -110..130, z -8..0
    P.at(P.box(342, 12, 60, c.fixed), 91, -116, 0, scene);                   // base x -80..262, y -122..-110, z -30..30; plate stands on y -110
    this.place();
  },

  place: function () {
    var K = this.K, o = this.o, J = o.J, a = K.a0 - o.rho;
    o.arm.rotation.z = -o.rho;
    o.wheel.rotation.z = o.phi;
    var tau = Math.atan2(o.rt * Math.sin(o.at) - J.y, o.rt * Math.cos(o.at) - J.x);
    o.tappet.position.set(J.x, J.y, 8); o.tappet.rotation.z = tau;
    o.pin.position.set(J.x, J.y, 15); o.pinHead.position.set(J.x, J.y, 23);
    // spring from the bracket on the arm to the pin on the tail of the tappet
    var e1 = [Math.cos(a), Math.sin(a)], e2 = [-e1[1], e1[0]], ex = [Math.cos(tau), Math.sin(tau)], ey = [-ex[1], ex[0]];
    var sx = K.PX + (K.LH - 46) * e1[0] + 22 * e2[0], sy = K.PY + (K.LH - 46) * e1[1] + 22 * e2[1];
    var qx = J.x - 8 * ex[0] + 22 * ey[0], qy = J.y - 8 * ex[1] + 22 * ey[1];
    o.spring.position.set(sx, sy, 8); o.spring.rotation.z = Math.atan2(qy - sy, qx - sx);
    o.spring.setLength(Math.hypot(qx - sx, qy - sy)); o.springLen = Math.hypot(qx - sx, qy - sy);
    var cx = K.CR * Math.cos(K.CA), cy = K.CR * Math.sin(K.CA), ac = K.CA + o.dc;
    o.click.rotation.z = Math.atan2(o.rc * Math.sin(ac) - cy, o.rc * Math.cos(ac) - cx);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, n = Math.max(1, Math.ceil(dt / .004)), i, sw = (+S.controls.swing) * Math.PI / 180;
    for (i = 0; i < n; i++) this.phys(dt / n, S.w, sw);
    this.place();
    var turned = Math.round((o.phi - o.phi0) * 180 / Math.PI), moved = Math.round((o.phi - o.phi0) / K.st);
    S.set("arm", Math.round(o.rho * 180 / Math.PI) + "°");
    S.set("wheel", turned + "°");
    S.set("teeth", moved + (moved === 1 ? " tooth" : " teeth"));
  }
});
