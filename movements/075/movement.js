M507.define({
  number: 75,
  title: "Pawl on a swinging bar",
  lede: "A rod moves up and down, and a toothed wheel turns round in steps. A bar on the wheel's shaft swings to and fro, and a finger on its end pushes the teeth. The wheel only ever turns one way.",
  alt: "A big wheel with many slanted teeth. A bar turns on its centre, with a long arm up to the left and a short arm down to the right. An upright rod hangs from the short arm. A finger on the end of the long arm rests in the teeth, and a second finger on a fixed pin rests in the teeth at the upper right.",
  parts: [
    { key: "rod", color: "#5E7387", name: "Rod and crank disc", note: "A small crank at the bottom moves the rod up and down. The rod pulls and pushes the short arm of the bar." },
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "A wheel with slanted teeth, called a ratchet. Watch the red tooth to see it step round." },
    { key: "pawl", color: "#C2503F", name: "Pawl", note: "A finger on the end of the bar, called a pawl. It pushes a tooth on the way forward and slides over the teeth on the way back." },
    { key: "bar", color: "#D9B13B", name: "Swinging arm", note: "Turns loose on the wheel's shaft. The rod rocks it to and fro." },
    { key: "click", color: "#4FA58A", name: "Holding pawl", note: "A second finger on a fixed pin, called a holding pawl. It lets the wheel turn forward and stops it from slipping back." }
  ],
  controls: [{ id: "stroke", label: "Stroke of the rod", value: "mid", options: [["short", "Short"], ["mid", "Medium"], ["long", "Long"]] }],
  speed: { min: 2, max: 40, value: 15, label: "Crank speed", unit: " rpm" },
  readouts: [{ id: "strokes", label: "Strokes" }, { id: "teeth", label: "Wheel" }],
  views: { "3d": [520, 194, 1043], front: [0, -40, 1225], side: [1170, -14, -23] },
  target: [0, -40, -10],
  how: [
    "The crank at the bottom moves the rod up and down. The rod rocks the bar on the wheel's shaft. The long arm of the bar swings to and fro over the top of the wheel.",
    "When the arm swings forward, the pawl on its end pushes a tooth and the wheel turns with it. When the arm swings back, the pawl slides up the slanted teeth and drops into a new gap. The holding pawl on the fixed pin stops the wheel from being dragged back.",
    "The wheel only moves on the forward swing, so it turns in steps. Try Short. The pawl never gets past the next tooth, so the wheel stops after one push. Then try Medium and Long, and count the teeth for each stroke."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the rod cut off below the wheel, so a small crank was added to move it. The plate, the base, the pins, the sizes and the number of teeth were made up. The pawl and holding pawl are drawn as straight fingers instead of Brown's curved ones.",

  init: function () {
    var K = this.K = { N: 36, R: 167, D: 16, RV: 193, LP: 121.5, A0: 147 * Math.PI / 180, RA: 89, AS: -26.6 * Math.PI / 180,
      RC: 225, AC: Math.PI / 4, LC: 85, ROD: 210, rho: { short: 4.5, mid: 10, long: 17 } };
    K.st = 2 * Math.PI / K.N;
    K.ax = K.RA * Math.cos(K.AS); K.ay = K.RA * Math.sin(K.AS);
    K.cx = K.ax; K.cy = K.ay - K.ROD;                                       // crank centre straight under the arm pin
    this.o = { g: 0, psi: 0, phi: 0, k: 0, dp: 0, dc: 0, rho: K.rho.mid };
    var o = this.o;
    o.dp = this.reach(K.RV, K.LP, K.R - K.D);
    o.phi = K.A0 - o.dp;                                                    // nose sits at the root of gap 0, against its face
    this.phys(0, "mid");
    o.g0 = o.g;
  },
  reach: function (rp, L, r) { return Math.acos(Math.max(-1, Math.min(1, (rp * rp + r * r - L * L) / (2 * rp * r)))); },
  rimAt: function (u) { var K = this.K, f = u / K.st + 1e-9; f -= Math.floor(f); return K.R - K.D + K.D * f; },

  // advance the crank by dg and work out the bar, the pawl, the wheel and the click
  phys: function (dg, stroke) {
    var K = this.K, o = this, s = this.o, i, rho = K.rho[stroke] || K.rho.mid;
    s.g += dg; s.rho = rho;
    // crank pin, then the bar angle at which the arm pin is one rod length from it (Newton from the last angle)
    var kx = K.cx + rho * Math.cos(s.g), ky = K.cy + rho * Math.sin(s.g);
    for (i = 0; i < 8; i++) {
      var a = K.AS + s.psi, px = K.RA * Math.cos(a), py = K.RA * Math.sin(a), dx = px - kx, dy = py - ky;
      var f = dx * dx + dy * dy - K.ROD * K.ROD, df = 2 * (dx * -py + dy * px);
      s.psi -= f / df;
    }
    s.kx = kx; s.ky = ky;
    // pawl: nose lies clockwise of its pivot; the wheel's faces stop it moving clockwise, the slopes let it slide back
    var ap = K.A0 + s.psi, u = ap - s.dp - s.phi;
    while (u >= (s.k + 1) * K.st) s.k++;
    if (u < s.k * K.st) {                                                    // the nose would pass the face: it pushes the wheel on
      s.dp = o.reach(K.RV, K.LP, K.R - K.D);
      s.phi = ap - s.dp - s.k * K.st;
      u = s.k * K.st;
    }
    for (i = 0; i < 4; i++) { s.dp = o.reach(K.RV, K.LP, o.rimAt(u)); u = Math.max(s.k * K.st, ap - s.dp - s.phi); }
    s.rn = o.rimAt(u); s.an = ap - s.dp;
    // click on its fixed pin rides the teeth
    var uc = K.AC - s.dc - s.phi;
    for (i = 0; i < 4; i++) { s.dc = o.reach(K.RC, K.LC, o.rimAt(uc)); uc = K.AC - s.dc - s.phi; }
    s.rc = o.rimAt(uc);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    this.init();
    var K = this.K, o = this.o;
    // Layers along z: plate face -30; wheel, pawl and click -22..-6; bar -4..4; crank disc -4..4; rod 4..10.
    o.wheel = new T.Group(); scene.add(o.wheel);
    o.wheel.add(P.ratchet({ teeth: K.N, radius: K.R, depth: K.D, width: 16, material: c.mat("wheel") }));   // z -8..8 in the group
    o.wheel.position.z = -14;                                                // wheel z -22..-6
    P.at(P.cylZ(10, 37.5, c.mat("wheel")), 0, 0, 2.75, o.wheel);                  // shaft z -30..8, plate face to the front collar
    P.at(P.cylZ(22, 2, c.mat("wheel")), 0, 0, 9, o.wheel);                   // hub z -6..-4, between the wheel face and the bar
    P.at(P.cylZ(13, 4, c.mat("wheel", "dark")), 0, 0, 20, o.wheel);         // collar z 4..8, on the bar's front face
    var mg = new T.Group(); mg.rotation.z = -1.75; o.wheel.add(mg);          // the marked tooth starts at the right of the wheel
    var mk = P.at(P.box(26, 5, 1, c.mat("wheel", "mark")), K.R - K.D - 12, 2, 9, mg);   // red mark r 126..152 on one tooth, z -5.5..-4.5
    P.at(P.hoop(125, .8, c.mat("wheel", "dark")), 0, 0, 9, o.wheel);       // web line r 125, z -5.8..-4.2, lifted off the face
    o.mark = mk;

    // swinging bar: long arm to the pawl pin, short arm to the rod pin
    o.bar = new T.Group(); scene.add(o.bar);
    var mb = c.mat("bar");
    function arm(len, ang) { var b = P.box(len, 14, 8, mb); b.position.set(len / 2 * Math.cos(ang), len / 2 * Math.sin(ang), 0); b.rotation.z = ang; o.bar.add(b); }
    arm(K.RV, K.A0); arm(K.RA, K.AS);                                         // bar z -4..4
    P.at(P.cylZ(18, 8, mb), 0, 0, 0, o.bar);                                 // boss round the shaft
    P.at(P.cylZ(10, 8, mb), K.RV * Math.cos(K.A0), K.RV * Math.sin(K.A0), 0, o.bar);
    P.at(P.cylZ(9, 8, mb), K.ax, K.ay, 0, o.bar);
    P.at(P.cylZ(4, 17, mb), K.RV * Math.cos(K.A0), K.RV * Math.sin(K.A0), -12.5, o.bar);   // pawl pin z -21..-4, ends at the bar's back face
    P.at(P.cylZ(4, 8, mb), K.ax, K.ay, 7.5, o.bar);                            // rod pin z 4..12 through the rod's eye
    P.at(P.cylZ(6, 2, c.mat("bar", "dark")), K.ax, K.ay, 11, o.bar);        // pin head z 10..12, on the eye's front face

    // pawl and click, both with their bodies on the side away from the wheel
    o.pawl = P.pawl({ length: K.LP, thick: 7, width: 14, side: 1, material: c.mat("pawl") });
    P.at(o.pawl, 0, 0, -14, scene);                                           // pawl z -21..-7, boss -22..-6
    o.click = P.pawl({ length: K.LC, thick: 7, width: 14, side: 1, material: c.mat("click") });
    P.at(o.click, K.RC * Math.cos(K.AC), K.RC * Math.sin(K.AC), -14, scene);
    P.at(P.cylZ(4, 25.5, c.fixed), K.RC * Math.cos(K.AC), K.RC * Math.sin(K.AC), -17.25, scene);   // click stud z -30..-4, from the plate face
    P.at(P.cylZ(6, 2, c.mat("click", "dark")), K.RC * Math.cos(K.AC), K.RC * Math.sin(K.AC), -5, scene);   // stud head z -6..-4, on the click's front face

    // crank disc and rod
    o.crank = new T.Group(); o.crank.position.set(K.cx, K.cy, 0); scene.add(o.crank);
    var mr = c.mat("rod");
    P.at(P.cylZ(28, 8, mr), 0, 0, 0, o.crank);                               // disc z -4..4
    P.at(P.cylZ(6, 26, mr), 0, 0, -17, o.crank);                             // shaft z -30..-4, plate face to disc back
    P.at(P.box(18, 4, 1, c.mat("rod", "dark")), -15, 0, 5, o.crank);        // dark stripe z 4.5..5.5, lifted off the disc face, opposite the pin
    o.cpin = P.at(P.cylZ(4, 8, mr), 0, 0, 7.5, o.crank);                       // crank pin z 4..12, moved to the chosen throw each frame
    o.chead = P.at(P.cylZ(6, 2, c.mat("rod", "dark")), 0, 0, 11, o.crank);  // pin head z 10..12, on the eye's front face
    o.rod = P.rod(3, mr); scene.add(o.rod);                                   // rod z 4..10
    o.eyeTop = P.at(P.cylZ(8, 6, mr), 0, 0, 7, scene);
    o.eyeBot = P.at(P.cylZ(8, 6, mr), 0, 0, 7, scene);

    // supports
    P.at(P.box(460, 520, 10, c.fixed), 0, -30, -35, scene);                  // plate x -230..230, y -290..230, z -40..-30
    P.at(P.box(500, 12, 130, c.fixed), 0, -296, -35, scene);                 // base x -250..250, y -302..-290, z -100..30; plate stands on y -290
    this.place();
  },

  place: function () {
    var K = this.K, o = this.o;
    o.wheel.rotation.z = o.phi;
    o.bar.rotation.z = o.psi;
    var ap = K.A0 + o.psi, px = K.RV * Math.cos(ap), py = K.RV * Math.sin(ap);
    o.pawl.position.set(px, py, -14);
    o.pawl.rotation.z = Math.atan2(o.rn * Math.sin(o.an) - py, o.rn * Math.cos(o.an) - px);
    var cx = K.RC * Math.cos(K.AC), cy = K.RC * Math.sin(K.AC), ac = K.AC - o.dc;
    o.click.rotation.z = Math.atan2(o.rc * Math.sin(ac) - cy, o.rc * Math.cos(ac) - cx);
    o.crank.rotation.z = o.g;
    o.cpin.position.x = o.rho; o.chead.position.x = o.rho;
    var ax = K.RA * Math.cos(K.AS + o.psi), ay = K.RA * Math.sin(K.AS + o.psi);
    o.rod.span(o.kx, o.ky, 7, ax, ay, 7);
    o.eyeTop.position.set(ax, ay, 7); o.eyeBot.position.set(o.kx, o.ky, 7);
  },

  step: function (c, dt, S) {
    var o = this.o, n = Math.max(1, Math.ceil(Math.abs(S.w * dt) / .01)), i;
    for (i = 0; i < n; i++) this.phys(S.w * dt / n, S.controls.stroke);
    this.place();
    var st = Math.max(0, Math.floor((o.g - o.g0) / (2 * Math.PI) + 1e-6)), tt = Math.max(0, Math.round((this.K.A0 - this.reach(this.K.RV, this.K.LP, this.K.R - this.K.D) - o.phi) / this.K.st));
    S.set("strokes", String(st));
    S.set("teeth", tt + (tt === 1 ? " tooth" : " teeth"));
  }
});
