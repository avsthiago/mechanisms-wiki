/* No. 27, multiple gearing: three rollers on a small driver slide in grooves across a larger wheel.
   Kinematics. Wheel centre O at the origin, driver centre C at (0, -R), rollers on a circle of radius R about C.
   That circle passes through O. A roller at driver angle a (measured from the direction C to O) sits at
   (-R sin a, -R + R cos a) = -2R sin(a/2) * (cos(a/2), sin(a/2)).
   So it always lies on the line through O at angle a/2: a groove that turns at exactly half the driver's speed.
   Rollers 120 degrees apart on the driver need grooves 60 degrees apart: three grooves right across the wheel.
   Each roller stays in its own groove and slides 2R each side of the centre. */
M507.define({
  number: 27,
  title: "Multiple gearing",
  lede: "A small driver with three arms has a roller on each arm. The rollers slide in grooves cut across a bigger wheel and push it round. The big wheel turns exactly half as fast, and it needs no teeth.",
  alt: "A large wheel with three straight grooves crossing at its centre. In front of it, lower down, a small three-armed driver carries three rollers that sit in the grooves and turn the wheel.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driver", note: "A small plate with three arms on its own shaft. Its shaft is set below the middle of the big wheel." },
    { key: "wheel", color: "#C8873A", name: "Grooved wheel", note: "Three straight grooves cross at its middle. It turns once for every two turns of the driver." },
    { key: "rollers", color: "#D9B13B", name: "Rollers", note: "One on the end of each arm. Each one sits in a groove and pushes on its side. Watch the red one slide right across the wheel and back." }
  ],
  controls: [],
  readouts: [{ id: "in", label: "Driver" }, { id: "out", label: "Wheel" }, { id: "d", label: "Roller from centre" }],
  views: { "3d": [400, 130, 640], front: [0, -10, 760], side: [760, -10, 40] },
  target: [0, -10, 30],
  how: [
    "Watch the red roller. As the driver turns, the roller slides along its groove, through the middle of the wheel and out to the far edge. Then it slides back again. It never leaves that groove.",
    "A roller can only slide along its groove, so as it goes round it has to push the groove sideways. That push turns the wheel. Each roller's circle passes right through the middle of the wheel. Because of that, the wheel turns once for every two turns of the driver, at a steady speed.",
    "A push at the very middle cannot turn a wheel, so a roller does no work as it crosses there. The other two rollers are far out in their grooves at that moment and keep the wheel going. Change the speed and check that the wheel always shows half the driver's speed."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown gives no sizes. The distance between the two shafts was chosen so that each roller passes exactly through the middle of the wheel, which gives the steady half speed. The small knob Brown draws at the middle of the wheel was left out so the rollers can pass. The stand was made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = Math.PI / 180, k, j;
    var R = 60, RR = 9, H = RR + .6, RW = 135;      // roller circle, roller radius, half width of a groove, wheel radius
    var o = this.o = { th: 0, R: R, rollers: [] };

    // grooved wheel: back plate z -10..0, six raised sectors z 0..12 leaving three grooves across the middle
    o.wheel = new T.Group(); scene.add(o.wheel);
    var mw = c.mat("wheel");
    P.at(P.cylZ(RW, 10, c.mat("wheel", "light")), 0, 0, -5, o.wheel);     // plate z -10..0, pale so the grooves and pockets show
    P.at(P.cylZ(20, 12, mw), 0, 0, -16, o.wheel);                         // hub z -22..-10, on the back of the plate
    P.at(P.cylZ(8, 58, mw), 0, 0, -51, o.wheel);                          // shaft z -80..-22, ends at the back post's face
    function wedge(h, rw) {                                               // outline of a sector between two grooves, centred on angle 0
      var b = 30 * D - Math.asin(h / rw), s = new T.Shape();
      s.moveTo(2 * h, 0); s.lineTo(rw * Math.cos(b), -rw * Math.sin(b)); s.absarc(0, 0, rw, -b, b, false); s.lineTo(2 * h, 0);
      return s;
    }
    var shape = wedge(H, RW); shape.holes.push(wedge(H + 12, RW - 12));   // a rim of ribs round an open pocket, as in the drawing
    var geo = new T.ExtrudeGeometry(shape, { depth: 12, bevelEnabled: false, curveSegments: 24 });
    for (j = 0; j < 6; j++) { var w = P.mesh(geo, mw); w.rotation.z = (30 + 60 * j) * D; o.wheel.add(w); }   // z 0..12

    // driver: three-armed plate z 16..24 in front of the sectors, shaft running forward
    o.driver = new T.Group(); o.driver.position.set(0, -R, 0); scene.add(o.driver);
    var md = c.mat("drive"), plate = new T.Shape();
    for (k = 0; k < 3; k++) {
      var a = (90 + 120 * k) * D, m = a + 60 * D;
      plate.absarc(R * Math.cos(a), R * Math.sin(a), 15, a - 100 * D, a + 100 * D, false);
      var n = a + 120 * D, nx = R * Math.cos(n) + 15 * Math.cos(n - 100 * D), ny = R * Math.sin(n) + 15 * Math.sin(n - 100 * D);
      plate.quadraticCurveTo(16 * Math.cos(m), 16 * Math.sin(m), nx, ny);  // hollow side between two arms
    }
    var pg = P.mesh(new T.ExtrudeGeometry(plate, { depth: 8, bevelEnabled: false, curveSegments: 16 }), md);
    P.at(pg, 0, 0, 16, o.driver);                                         // z 16..24
    P.at(P.cylZ(15, 12, md), 0, 0, 30, o.driver);                         // collar z 24..36
    P.at(P.cylZ(7, 114, md), 0, 0, 93, o.driver);                         // shaft z 36..150, ends at the front post's face
    for (k = 0; k < 3; k++) {
      var g = new T.Group(), mr = c.mat("rollers", k === 0 ? "mark" : undefined), ar = (90 + 120 * k) * D;
      P.at(P.cylZ(RR, 12, mr), 0, 0, 7, g);                               // roller z 1..13, clear of the plate at z 0
      P.at(P.cylZ(4, 3, c.mat("rollers", "dark")), 0, 0, 14.5, g);        // stud z 13..16, up to the back of the driver plate
      var nut = P.mesh(new T.CylinderGeometry(8, 8, 5, 6), mr);          // in the roller's colour, so it shows from the front nut.rotation.x = Math.PI / 2;
      P.at(nut, 0, 0, 26.5, g);                                           // nut z 24..29, on the front of the driver plate
      P.at(g, R * Math.cos(ar), R * Math.sin(ar), 0, o.driver);
    }

    // stand: not part of the movement
    P.at(P.box(120, 12, 262, c.fixed), 0, -164, 35, scene);               // base x -60..60, y -170..-158, z -96..166
    P.at(P.box(36, 178, 16, c.fixed), 0, -69, -88, scene);                // back post y -158..20, z -96..-80: wheel shaft ends at z -80
    P.at(P.box(28, 116, 16, c.fixed), 0, -100, 158, scene);               // front post y -158..-42, z 150..166: driver shaft ends at z 150
  },

  step: function (c, dt, S) {
    var o = this.o; o.th += S.w * dt;
    o.driver.rotation.z = o.th;
    o.wheel.rotation.z = o.th / 2;                                        // see the note at the top of the file
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", rpm + " rpm");
    S.set("out", Math.round(rpm * 50) / 100 + " rpm");
    S.set("d", (Math.abs(2 * o.R * Math.sin(o.th / 2)) / 10).toFixed(1) + " cm");
  }
});
