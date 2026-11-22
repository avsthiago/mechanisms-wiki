M507.define({
  number: 162,
  title: "Water-wheel governor",
  lede: "Two balls spin on an upright spindle. When the wheel goes too fast they swing out, and a gear train lifts a gate to let in less water. When it goes too slow the gate is lowered to let in more.",
  alt: "An upright spindle with a ring at its top has two arms hinged in a diamond. A round ball hangs from each side. A sleeve slides on the spindle below them. A level shaft with bevel gears drives the spindle from the left. Two loose bevel gears face each other lower down, with a level shaft between them that runs to a small gate in a frame.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Spindle and top gears", note: "The engine turns the driving shaft. Two bevel gears pass the turning to the upright spindle." },
    { key: "balls", color: "#D9B13B", name: "Balls and arms", note: "The balls swing out as the spindle spins faster. Their arms are hinged, so the sleeve goes up as they rise." },
    { key: "pin", color: "#C2503F", name: "Sleeve and pin", note: "The sleeve slides on the spindle and turns with it. Watch the pin. It rises and falls with the balls." },
    { key: "loose", color: "#4FA58A", name: "Loose gears", note: "Two gears sit loose on the spindle. Each has a small stud. They stay still until the pin pushes a stud." },
    { key: "gate", color: "#C8873A", name: "Lower shaft and gate", note: "The loose gears turn this shaft one way or the other. A screw and wheel slow it down, and a rope lifts or lowers the gate." }
  ],
  controls: [{ id: "load", label: "Weight on the sleeve", value: "drawn", options: [["light", "Light"], ["drawn", "As drawn"], ["heavy", "Heavy"]] }],
  speed: { min: 30, max: 90, value: 60, label: "Engine speed", unit: " rpm" },
  readouts: [{ id: "ang", label: "Ball angle" }, { id: "gate", label: "Gate up" }],
  views: { "3d": [450, 110, 1050], front: [-35, -5, 880], side: [880, -5, 0] },
  target: [-35, -5, 0],
  distance: [500, 2400],
  how: [
    "The engine turns the driving shaft. Two bevel gears pass the turning down to the upright spindle. The spindle carries two balls on hinged arms, and the balls swing outwards as it spins.",
    "When the engine speeds up, the balls swing out and pull the sleeve up. The red pin on the sleeve then catches a stud on the upper loose gear. That gear turns with the spindle and drives the lower shaft, which lifts the gate. When the engine slows, the pin drops and catches the lower gear instead. It turns the shaft the other way, and the gate goes down. In between, the pin touches neither stud and the gate stays still.",
    "Move the speed slider from slow to fast and watch the pin and the gate. Then try a heavy sleeve. The balls need a higher speed before they rise."
  ],
  note: "This model is rebuilt from Brown's drawing. The stand, the wall, the gate with its guides and rope, and the screw and wheel that slow the gate down were made up. The pin is joined to the sleeve by a rod hidden inside the spindle. The balls rise and fall by a simple spring and weight rule, not by a real engine. The engine speed is set by the slider, so the gate does not slow the engine as it would in life. At the end of its travel the rope slips on the drum.",

  K: { LA: 105, TN: 34 * Math.PI / 180, YT: 235, DP: 213, STOP: 22, G: 10, KS: 36.6, TH0: 15 * Math.PI / 180, B: 5, RG: 50, NG: 14, RD: 38, ND: 10, DEL: .43, RR: 14, WN: 12, WR: 9, GT: 36 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, s, i;
    var o = this.o = { th: K.TN, thd: 0, ws: 2 * Math.PI, phi: 0, q: 0, g: 18, eU: false, eL: false, sU: Math.PI, sL: Math.PI };
    var C45 = Math.cos(Math.PI / 4), ysn = K.YT - 2 * K.LA * Math.cos(K.TN);
    var Yc = o.Yc = ysn - K.DP, Yd = o.Yd = Yc + 110, BASE = o.BASE = Yc - 115;
    var yBg = K.RG + 7 * C45, yA = o.yA = .68 * yBg;                   // inner face of a loose gear, from its apex
    var dk = c.mat("drive", "dark"), md = c.mat("drive");
    // stops: the pin may travel +-STOP from its neutral place
    o.thLo = Math.acos((K.YT - ysn + K.STOP) / (2 * K.LA));
    o.thHi = Math.acos((K.YT - ysn - K.STOP) / (2 * K.LA));
    o.ysn = ysn;

    // turning part: spindle, collar, driving gear, arms, balls, sleeve, pin
    o.rot = new T.Group(); scene.add(o.rot);
    P.at(P.cylY(6, K.YT + 14 - (Yc - 85), md), 0, (K.YT + 14 + Yc - 85) / 2, 0, o.rot);         // spindle y Yc-85..YT+14, starts on the bearing top
    P.at(P.sphere(8, md), 0, K.YT + 20, 0, o.rot);
    P.at(P.cylY(11, 14, md), 0, K.YT, 0, o.rot);                                                 // collar y YT-7..YT+7
    P.at(P.box(1.5, 16, 3, dk), 7, Yc + 103, 0, o.rot);                                          // stripe on the spindle, x 6.25..7.75
    o.D = P.bevelGearCone({ radius: K.RD, teeth: K.ND, cone: 45, hubLength: 24, material: md });
    P.at(o.D, 0, Yd, 0, o.rot);
    o.rods = [];
    for (s = 0; s < 4; s++) o.rods.push(P.at(P.rod(3.2, c.mat("balls")), 0, 0, 0, o.rot));
    o.knee = [P.at(P.sphere(5, c.mat("balls", "dark")), 0, 0, 0, o.rot), P.at(P.sphere(5, c.mat("balls", "dark")), 0, 0, 0, o.rot)];
    o.ball = [P.at(P.sphere(28, c.mat("balls")), 0, 0, 0, o.rot), P.at(P.sphere(28, c.mat("balls")), 0, 0, 0, o.rot)];
    o.sleeve = P.at(P.cylY(11, 16, c.mat("pin")), 0, ysn, 0, o.rot);
    o.pin = new T.Group(); o.rot.add(o.pin);
    P.at(P.box(8, 5, 5, c.mat("pin")), 10, 0, 0, o.pin);                                          // arm x 6..14 out of the spindle
    P.at(P.box(6, 28, 6, c.mat("pin", "mark")), 14, 0, 0, o.pin);                                 // pin x 11..17, y -14..14

    // loose gears, level shaft gear (all apex at the same point)
    var mg = c.mat("loose");
    o.gU = new T.Group(); o.gU.position.set(0, Yc, 0); scene.add(o.gU);
    o.U = P.bevelGearCone({ radius: K.RG, teeth: K.NG, cone: 45, hubLength: 20, material: mg }); o.gU.add(o.U);
    o.gL = new T.Group(); o.gL.position.set(0, Yc, 0); o.gL.rotation.x = Math.PI; scene.add(o.gL);
    o.L = P.bevelGearCone({ radius: K.RG, teeth: K.NG, cone: 45, hubLength: 20, material: mg }); o.gL.add(o.L);
    P.at(P.cylY(3, 13, mg), K.RR * Math.cos(o.sU), yA - 5.5, -K.RR * Math.sin(o.sU), o.U);       // stud y yA-12..yA+1, hangs from the face
    P.at(P.cylY(3, 13, mg), K.RR * Math.cos(o.sL), yA - 5.5, -K.RR * Math.sin(o.sL), o.L);
    o.pitch = o.U.pitch;
    var outer = new T.Group(); outer.position.set(0, Yc, 0); outer.rotation.z = Math.PI / 2; scene.add(outer);
    o.M = P.bevelGearCone({ radius: K.RG, teeth: K.NG, cone: 45, hubLength: 20, material: c.mat("gate") }); outer.add(o.M);
    var xb = -(yBg + 20);                                                                           // back of that gear, x -75
    // lower shaft with worm
    o.lsh = new T.Group(); o.lsh.position.set(0, Yc, 0); scene.add(o.lsh);
    var mgt = c.mat("gate");
    P.at(P.cylX(4, -153.5 - xb, mgt), (xb - 153.5) / 2, 0, 0, o.lsh);                                  // x xb..-154, ends on the wall face
    P.at(P.box(12, 1.5, 3, c.mat("gate", "dark")), -143, 5, 0, o.lsh);                              // stripe y 4.25..5.75
    o.worm = P.worm({ radius: 7, pitch: 8, length: 44, material: mgt }); P.at(o.worm, -110, 0, 0, o.lsh);
    // worm wheel, drum, rope, gate
    var m = 8 / Math.PI, ywh = o.ywh = Yc - (7 + m * K.WN / 2);
    o.wheel = new T.Group(); o.wheel.position.set(-110, ywh, 0); scene.add(o.wheel);
    o.gear = P.spurGear({ teeth: K.WN, module: m, width: 10, material: mgt }); o.wheel.add(o.gear);
    P.at(P.cylZ(K.WR, 16, mgt), 0, 0, 18, o.wheel);                                                   // drum z 10..26
    P.at(P.cylZ(3, 15, mgt), 0, 0, 6, o.wheel);                                                       // hub z -1.5..13.5 inside wheel and drum
    P.at(P.box(10, 2, 1.5, c.mat("gate", "dark")), 4, 0, 26.5, o.wheel);                              // stripe on the drum face, z 25.75..27.25
    P.at(P.cylZ(3, 38, mgt), -110, ywh, 5, scene);                                                    // countershaft z -14..24, starts on the back wall
    o.plate = P.at(P.box(6, 24, 20, c.mat("gate")), -99.5, 0, 18, scene);                             // gate x -102.5..-96.5, z 8..28
    P.at(P.box(1.5, 4, 14, c.mat("gate", "dark")), -96, 0, 18, o.plate.parent);
    o.stripe = scene.children[scene.children.length - 1];
    o.rope = P.at(P.rod(1.5, mgt), 0, 0, 0, scene);

    // supports
    P.at(P.box(250, 12, 130, c.fixed), -65, BASE - 6, 0, scene);                                      // base x -190..60, y BASE-12..BASE, z -65..65
    P.at(P.box(40, 30, 40, c.fixed), 0, Yc - 100, 0, scene);                                          // bearing x,z +-20, y Yc-115..Yc-85, on the base
    P.at(P.box(16, Yc + 140 - BASE, 60, c.fixed), -162, (BASE + Yc + 140) / 2, 0, scene);             // wall x -170..-154, y BASE..Yc+140, z -30..30
    P.at(P.box(60, Yc - 5 - BASE, 8, c.fixed), -110, (BASE + Yc - 5) / 2, -18, scene);                // back wall x -140..-80, z -22..-14, y BASE..Yc-5
    [5, 31].forEach(function (z) {
      P.at(P.box(11, 66, 4, c.fixed), -99.5, BASE + 33, z - 2, scene);                                // guide posts x -105..-94, y BASE..BASE+66, z 3..7 and 29..33
    });
    // driving shaft
    o.dsh = new T.Group(); o.dsh.position.set(0, Yd, 0); scene.add(o.dsh);
    var xd = -(K.RD + 7 * C45 + 24);                                                                  // back of the driven gear
    P.at(P.cylX(5, -153.5 - xd, md), (xd - 153.5) / 2, 0, 0, o.dsh);                                      // x xd..-154
    P.at(P.cylX(24, 10, md), -140, 0, 0, o.dsh);                                                      // pulley x -145..-135
    P.at(P.box(1.5, 14, 3, dk), -134.75, 14, 0, o.dsh);                                                // mark on the pulley face x -135, lifted 1
    var outerD = new T.Group(); outerD.position.set(0, Yd, 0); outerD.rotation.z = Math.PI / 2; scene.add(outerD);
    o.Mh = P.bevelGearCone({ radius: K.RD, teeth: K.ND, cone: 45, hubLength: 24, material: md }); outerD.add(o.Mh);
    this.place();
  },

  place: function () {
    var o = this.o, K = this.K, th = o.th, s, sn = Math.sin(th), cs = Math.cos(th);
    var ys = K.YT - 2 * K.LA * cs, rel = ys - o.ysn;
    o.rot.rotation.y = o.phi;
    o.sleeve.position.y = ys;
    o.pin.position.y = o.Yc + rel;
    for (s = 0; s < 2; s++) {
      var sg = s ? -1 : 1, kx = sg * (11 + K.LA * sn), ky = K.YT - K.LA * cs;
      var bx = kx + sg * 34 * sn, by = ky - 34 * cs;
      o.rods[2 * s].span(sg * 11, K.YT, 0, bx, by, 0);
      o.rods[2 * s + 1].span(kx, ky, 0, sg * 11, ys, 0);
      o.knee[s].position.set(kx, ky, 0); o.ball[s].position.set(bx, by, 0);
    }
    o.U.rotation.y = o.q; o.L.rotation.y = o.q;
    o.M.rotation.y = -o.q + o.pitch / 2;
    o.lsh.rotation.x = o.q;
    o.dsh.rotation.x = o.phi;
    o.Mh.rotation.y = -o.phi + o.D.pitch / 2;
    o.wheel.rotation.z = o.gear.pitch / 2 + o.q / K.WN;
    var gy = o.BASE + 3 + o.g;
    o.plate.position.y = gy + 12; o.stripe.position.y = gy + 12;
    o.rope.span(-99.5, o.ywh, 18, -99.5, gy + 24, 18);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, F = { light: .7, drawn: 1, heavy: 1.5 }[S.controls.load] || 1, TP = 2 * Math.PI;
    function wrap(x) { return ((x + Math.PI) % TP + TP) % TP - Math.PI; }
    function mod(x) { return ((x % TP) + TP) % TP; }
    if (S.playing && dt > 0) {
      var n = 12, h = dt / n, j;
      o.ws += (S.w - o.ws) * Math.min(1, dt * 3);
      for (j = 0; j < n; j++) {
        var sn = Math.sin(o.th), cs = Math.cos(o.th);
        o.thd += (o.ws * o.ws * sn * cs - F * (K.G * sn + K.KS * (o.th - K.TH0)) - K.B * o.thd) * h;
        o.th += o.thd * h;
        if (o.th < o.thLo) { o.th = o.thLo; if (o.thd < 0) o.thd = 0; }
        if (o.th > o.thHi) { o.th = o.thHi; if (o.thd > 0) o.thd = 0; }
      }
      o.phi += o.ws * dt;
      var rel = (K.YT - 2 * K.LA * Math.cos(o.th)) - o.ysn, lim = o.yA - 26, dq = 0;
      var aU = o.q + o.sU, aL = -o.q - o.sL;
      if (rel > lim) {
        if (!o.eU && mod(aU - o.phi) < K.DEL) o.eU = true;
        if (o.eU) dq = wrap(o.phi + K.DEL - aU);
      } else o.eU = false;
      if (rel < -lim) {
        if (!o.eL && mod(aL - o.phi) < K.DEL) o.eL = true;
        if (o.eL) dq = -wrap(o.phi + K.DEL - aL);
      } else o.eL = false;
      o.q += dq;
      o.g = Math.max(0, Math.min(K.GT, o.g + K.WR * dq / K.WN));
    }
    this.place();
    S.set("ang", Math.round(o.th * 180 / Math.PI) + "°");
    S.set("gate", o.g.toFixed(0) + " mm");
  }
});
