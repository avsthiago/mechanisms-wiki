M507.define({
  number: 225,
  title: "Ratchet wheel and swinging pawl",
  lede: "An arm on a tall post swings up and down. A small finger on its end, called a pawl, pushes a toothed wheel round a little on every downward swing. So a to-and-fro swing becomes turning that only goes one way, in steps.",
  alt: "A toothed wheel with sloping teeth on the left. On the right an upright post carries a long arm hinged at its top. The arm reaches over to the left and a small finger at its end rests in a gap between two teeth at the top of the wheel.",
  parts: [
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with sloping teeth. It is pushed round one step at a time. Watch the red mark on its face." },
    { key: "arm", color: "#5E7387", name: "Swinging arm", note: "Hinged at the top of the post. It swings up and down, and carries the pawl on its end." },
    { key: "pawl", color: "#C2503F", name: "Pawl", note: "A finger hinged to the end of the arm. It rests on the teeth. Going down it pushes a tooth. Going up it rides over the teeth. Watch it." },
    { key: "post", color: "#4FA58A", name: "Post", note: "The fixed upright that holds the arm at its top." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing of the arm", min: 10, max: 60, step: 5, value: 30, unit: "°",
    presets: [[10, "Tiny"], [30, "Medium"], [50, "Wide"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Swings", unit: " a min" },
  readouts: [{ id: "arm", label: "Arm" }, { id: "wheel", label: "Wheel" }, { id: "teeth", label: "Moved on" }],
  views: { "3d": [330, 170, 760], front: [45, 0, 830], side: [900, 40, 40] },
  target: [45, 0, 0],
  how: [
    "The arm swings down, then up, again and again. A small finger called a pawl is hinged to its end. It rests in the gap between two teeth of the wheel.",
    "Going down, the pawl pushes against the steep side of a tooth and carries the wheel round with it. Going up, it meets the sloping side of the next tooth. It lifts, slides over the top and drops into the next gap. The wheel stays where it is. So the wheel only ever turns one way.",
    "Try the Tiny swing. The pawl rises and falls in the same gap and the wheel does not move. Then try Wide. The pawl now passes two teeth on every swing and the wheel moves on two teeth each time."
  ],
  note: "This model is rebuilt from Brown's drawing. In the drawing the pawl is the shaped end of the arm itself. Here it is a separate finger hinged to the arm, so that it can lift over the teeth. Its own weight keeps it down. The base, the plate behind the wheel, the sizes and the number of teeth were made up. A little rubbing in the wheel's shaft stops it slipping back.",

  init: function () {
    var K = this.K = { N: 20, R: 110, D: 14, PX: 150, PY: 162, LA: 120, JX: 39, JY: 116, LB: 64, U0: 0.02 };
    K.st = 2 * Math.PI / K.N; K.root = K.R - K.D;
    K.a0 = Math.atan2(K.JY - K.PY, K.JX - K.PX);
    this.o = { th: 0, g: 0, phi: 0, k: 0, at: 0, rt: 0, J: null };
    var o = this.o, J = this.joint(0);
    var u = K.U0 * K.st, i, at = J.a;
    for (i = 0; i < 6; i++) at = J.a + this.reach(J.r, K.LB, this.rimAt(u));
    o.phi = at - u; o.phi0 = o.phi; o.k = 0; o.at = at; o.rt = this.rimAt(u); o.J = J;
    o.teeth = 0;
  },
  reach: function (rj, L, r) { return Math.acos(Math.max(-1, Math.min(1, (rj * rj + r * r - L * L) / (2 * rj * r)))); },
  // rim radius at the angle u round the wheel: the rim climbs from the root to the tip, then drops at the steep face on each multiple of the pitch
  rimAt: function (u) { var K = this.K, f = u / K.st + 1e-9; f -= Math.floor(f); return K.root + K.D * f; },
  joint: function (g) {
    var K = this.K, a = K.a0 + g, x = K.PX + K.LA * Math.cos(a), y = K.PY + K.LA * Math.sin(a);
    return { x: x, y: y, r: Math.hypot(x, y), a: Math.atan2(y, x) };
  },

  // h: time step, w: input speed (rad/s), sw: full swing of the arm (radians)
  phys: function (h, w, sw) {
    var K = this.K, o = this.o, i;
    o.th += w * h;
    o.g = sw * (1 - Math.cos(o.th)) / 2;                                    // arm angle, 0 at the top, turning down
    var J = this.joint(o.g), at = o.at;
    for (i = 0; i < 6; i++) {
      var u = at - o.phi;
      while (u >= (o.k + 1) * K.st) o.k++;                                  // slid over the tooth top into the next gap
      if (u < o.k * K.st) { o.phi = at - o.k * K.st; u = o.k * K.st; }      // the steep face stops the pawl, so the wheel is pushed
      var rt = this.rimAt(Math.min(u, (o.k + 1) * K.st - 1e-6));
      at = J.a + this.reach(J.r, K.LB, rt);
      o.rt = rt;
    }
    o.at = at; o.J = J;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    this.init();
    var K = this.K, o = this.o;
    function side(px, py, nx, ny) { return (nx - px) * -py - (ny - py) * -px < 0 ? 1 : -1; }   // pawl body away from the wheel centre

    // Layers along z: plate -8..0; wheel, pawl and post 2..14; arm 14..22.
    // wheel
    o.wheel = new T.Group(); o.wheel.position.z = 8; scene.add(o.wheel);
    o.wheel.add(P.ratchet({ teeth: K.N, radius: K.R, depth: K.D, width: 12, material: c.mat("wheel") }));   // z 2..14
    P.at(P.cylZ(10, 18, c.mat("wheel")), 0, 0, 1, o.wheel);                  // shaft z 0..18, from the plate face
    P.at(P.cylZ(24, 4, c.mat("wheel")), 0, 0, 8, o.wheel);                   // hub z 14..18, on the wheel face
    P.at(P.hoop(24, 1, c.mat("wheel", "dark")), 0, 0, 10.5, o.wheel);       // ring round the hub, lifted off its face
    var mg = new T.Group(); mg.rotation.z = Math.PI / 2 - o.phi; o.wheel.add(mg);   // red mark starts at the top
    P.at(P.box(34, 5, 1, c.mat("wheel", "mark")), K.root - 22, 0, 7, mg);    // red mark z 14.5..15.5, lifted off the face

    // post and arm
    P.at(P.box(14, 320, 12, c.mat("post")), K.PX, 2, 8, scene);              // post x 143..157, y -158..162, z 2..14
    P.at(P.cylZ(7, 12, c.mat("post")), K.PX, K.PY, 8, scene);                // rounded top
    o.arm = new T.Group(); o.arm.position.set(K.PX, K.PY, 18); scene.add(o.arm);
    var ma = c.mat("arm"), bar = new T.Group(); bar.rotation.z = K.a0; o.arm.add(bar);
    P.at(P.box(K.LA, 12, 8, ma), K.LA / 2, 0, 0, bar);                       // arm z 14..22
    P.at(P.cylZ(10, 8, ma), 0, 0, 0, o.arm);                                  // boss round the hinge
    P.at(P.cylZ(9, 8, ma), K.LA * Math.cos(K.a0), K.LA * Math.sin(K.a0), 0, o.arm);   // boss round the pawl pin
    P.at(P.cylZ(4, 14, c.mat("post", "dark")), 0, 0, -4, o.arm);             // hinge pin z 8..22 (inside post), from the post into the arm
    P.at(P.cylZ(6, 2, c.mat("arm", "dark")), 0, 0, 5, o.arm);                // pin head z 22..24, on the arm's face
    var J = o.J, nb = [o.rt * Math.cos(o.at), o.rt * Math.sin(o.at)];
    o.pin = P.at(P.cylZ(4, 13, c.mat("arm", "dark")), J.x, J.y, 14.5, scene);  // pawl pin z 8..21, inside the arm (arm face z 22)
    o.pinHead = P.at(P.cylZ(6, 2, c.mat("arm", "dark")), J.x, J.y, 23, scene);   // z 22..24, on the arm's face
    o.pawl = P.pawl({ length: K.LB, thick: 7, width: 12, side: side(J.x, J.y, nb[0], nb[1]), material: c.mat("pawl") });
    P.at(o.pawl, J.x, J.y, 8, scene);                                         // pawl z 2..14, boss 1..15

    // supports
    P.at(P.box(44, 180, 8, c.fixed), 0, -68, -4, scene);                     // column behind the wheel x -22..22, y -158..22, z -8..0
    P.at(P.box(340, 12, 80, c.fixed), 30, -164, 0, scene);                   // base x -140..200, y -170..-158, z -40..40; column and post stand on y -158
    this.place();
  },

  place: function () {
    var K = this.K, o = this.o, J = o.J;
    o.arm.rotation.z = o.g;
    o.wheel.rotation.z = o.phi;
    o.pawl.position.set(J.x, J.y, 8);
    o.pawl.rotation.z = Math.atan2(o.rt * Math.sin(o.at) - J.y, o.rt * Math.cos(o.at) - J.x);
    o.pin.position.set(J.x, J.y, 15); o.pinHead.position.set(J.x, J.y, 23);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, n = Math.max(1, Math.ceil(dt / .004)), i, sw = (+S.controls.swing) * Math.PI / 180;
    for (i = 0; i < n; i++) this.phys(dt / n, S.w, sw);
    this.place();
    var turned = Math.round((o.phi0 - o.phi) * 180 / Math.PI), moved = Math.round((o.phi0 - o.phi) / K.st);
    S.set("arm", Math.round(o.g * 180 / Math.PI) + "°");
    S.set("wheel", turned + "°");
    S.set("teeth", moved + (moved === 1 ? " tooth" : " teeth"));
  }
});
