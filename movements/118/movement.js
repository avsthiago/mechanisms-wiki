M507.define({
  number: 118,
  title: "Doubling the stroke",
  lede: "A small gear rides between two toothed bars, called racks. The lower rack is fixed and the upper one can slide. When the gear is pushed along, the upper rack moves twice as far as the gear's centre. A short push gives a long stroke.",
  alt: "A toothed gear sits between a long toothed bar above and a shorter toothed bar below. A slanting rod from the left is joined to the gear's centre. At the far left a crank with a pin swings the rod. Everything stands against an upright plate.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank", note: "An arm that turns on a shaft in the plate. Its pin goes round in a circle and pushes the rod." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "A bar from the crank pin to the centre of the gear. It pushes the gear to and fro along the racks." },
    { key: "pinion", color: "#8E7AA8", name: "Gear", note: "The small gear. It is carried by the rod and rolls along the fixed rack, so it turns as it moves. The red stripe shows the turning." },
    { key: "fixrack", color: "#4FA58A", name: "Fixed rack", note: "The lower toothed bar. It never moves. It makes the gear turn as the gear is pushed along it." },
    { key: "toprack", color: "#C8873A", name: "Sliding rack", note: "The upper toothed bar. It slides in a guide and moves twice as far as the gear's centre. Watch it." }
  ],
  controls: [{ id: "throw", label: "Crank arm", value: "60", options: [["30", "Short"], ["60", "Medium"], ["90", "Long"]] }],
  readouts: [{ id: "g", label: "Gear centre" }, { id: "t", label: "Upper rack" }],
  views: { "3d": [300, 200, 760], front: [-30, 0, 900], side: [900, 0, 0] },
  target: [-30, 0, 0],
  distance: [300, 1800],
  how: [
    "The crank pushes the rod, and the rod carries the gear to and fro. The gear rolls on the fixed lower rack, so it turns as it goes. Its top teeth push the upper rack along.",
    "Think of the gear's centre moving a certain way. The top of a rolling gear moves twice as fast as its centre. So the upper rack goes twice as far as the gear's centre, in the same direction. Check the two readings: one is always double the other.",
    "Try Short, then Long. The gear's centre travels farther each time, and the top rack always travels twice that."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the rod, the gear and the two racks. The crank, the upright plate, the guide strip above the sliding rack, the base under the fixed rack and all the sizes and tooth counts were made up. The choice of crank arm was added to show the doubling at different strokes.",

  // Module 6, pinion 12 teeth (pitch radius 36). Pinion centre y = 0, lower pitch line y = -36, upper pitch line y = 36.
  // Gap centres of the fixed rack sit on x = n*p; the pinion has a tooth at the bottom when its centre x = 0 (and at the top).
  K: { MD: 6, NP: 12, L: 300, XC: -300, RX: 120 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, MD = K.MD, p = Math.PI * MD, rp = K.NP * MD / 2;
    var o = this.o = { a: 0, p: p, rp: rp };
    // pinion: gear z -8..8, hub z 8..12, spindle z 8..22, cap z 22..25
    o.pin = new T.Group(); scene.add(o.pin);
    P.at(P.spurGear({ teeth: K.NP, module: MD, material: c.mat("pinion") }), 0, 0, 0, o.pin);
    P.at(P.cylZ(10, 4, c.mat("pinion")), 0, 0, 10, o.pin);                                     // hub z 8..12
    P.at(P.box(20, 5, 1, c.mat("pinion", "mark")), 15, 0, 9, o.pin);                          // red stripe x 5..25, z 8.5..9.5, off the face
    o.spindle = P.at(P.cylZ(5, 13.5, c.mat("rod")), 0, 0, 15.25, scene);                        // spindle z 8.5..22, follows the gear's centre
    o.cap = P.at(P.cylZ(8, 3, c.mat("rod")), 0, 0, 23.5, scene);                              // cap z 22..25
    // fixed rack: teeth up, pitch line y -36, root y -43.5, body bottom y -67.5 (base top), x -188.5..188.5, z -8..8
    var fr = P.rack({ teeth: 20, module: MD, side: -1, body: 24, thick: 16, material: c.mat("fixrack") });
    fr.rotation.z = -Math.PI / 2; fr.position.set(-10 * p, -36, 0); scene.add(fr);
    // sliding rack: teeth down, pitch line y 36, root y 43.5, body top y 63.5 (guide underside), z -8..8
    o.top = new T.Group(); scene.add(o.top);
    var tr = P.rack({ teeth: 26, module: MD, side: 1, body: 20, thick: 16, material: c.mat("toprack") });
    tr.rotation.z = -Math.PI / 2; tr.position.set(0, 36, 0); o.top.add(tr);
    P.at(P.box(16, 6, 1, c.mat("toprack", "dark")), 13 * p, 53.5, 9, o.top);                  // dark stripe, z 8.5..9.5, off the front face
    P.at(P.box(16, 6, 1, c.mat("toprack", "dark")), 6 * p, 53.5, 9, o.top);
    P.at(P.box(16, 6, 1, c.mat("toprack", "dark")), 20 * p, 53.5, 9, o.top);
    // connecting rod: group at the crank pin, local +X toward the gear, bar z 12..20
    o.rod = new T.Group(); scene.add(o.rod);
    o.bar = P.at(P.box(1, 14, 8, c.mat("rod")), 0, 0, 16, o.rod);
    P.at(P.cylZ(11, 8, c.mat("rod")), 0, 0, 16, o.rod);
    o.eye2 = P.at(P.cylZ(11, 8, c.mat("rod")), 0, 0, 16, o.rod);
    // crank: shaft z -10..8 on the plate face, arm z 0..8, hub cap z 8..11, pin z 8..22 and cap z 22..25
    o.crank = new T.Group(); o.crank.position.set(K.XC, 0, 0); scene.add(o.crank);
    P.at(P.cylZ(7, 17, c.mat("crank", "dark")), 0, 0, -1.5, o.crank);                         // shaft z -10..7, inside the disc
    P.at(P.cylZ(16, 7.5, c.mat("crank")), 0, 0, 3.75, o.crank);                               // disc z 0..7.5
    P.at(P.cylZ(10, 3.5, c.mat("crank")), 0, 0, 9.25, o.crank);                               // hub cap z 7.5..11
    o.arm = P.at(P.box(1, 20, 7.5, c.mat("crank")), 0, 0, 3.75, o.crank);                     // arm z 0..7.5
    o.pdisc = P.at(P.cylZ(13, 7.5, c.mat("crank")), 0, 0, 3.75, o.crank);
    o.cpin = new T.Group(); o.crank.add(o.cpin);
    P.at(P.cylZ(9, 4.5, c.mat("rod")), 0, 0, 9.75, o.cpin);                                   // spacer z 7.5..12
    P.at(P.cylZ(5.5, 15, c.mat("crank")), 0, 0, 14.5, o.cpin);                                 // pin z 7..22
    P.at(P.cylZ(8, 3, c.mat("crank")), 0, 0, 23.5, o.cpin);                                   // cap z 22..25
    // supports
    P.at(P.box(680, 202, 12, c.fixed), -40, 11, -16, scene);                                  // back plate x -380..300, y -90..112, z -22..-10; shafts end at z -10
    P.at(P.box(520, 22.5, 42, c.fixed), 0, -78.75, -1, scene);                                // base x -260..260, y -90..-67.5, z -22..20; fixed rack stands on y -67.5
    P.at(P.box(520, 11.5, 30, c.fixed), 0, 69.25, -7, scene);                                 // guide strip x -260..260, y 63.5..75, z -22..8; sliding rack slides under y 63.5
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, R = +(S.controls.throw || 60), a, cs, s, rt, xc, th, px, py;
    o.a += S.w * dt;
    a = o.a; s = Math.sin(a); cs = Math.cos(a);
    rt = Math.sqrt(K.L * K.L - R * R * s * s);
    xc = K.XC + R * cs + rt;                                   // pinion centre x, within +-R of 0
    px = K.XC + R * cs; py = R * s;
    o.crank.rotation.z = a;
    o.arm.scale.x = R; o.arm.position.x = R / 2;
    o.pdisc.position.x = R; o.cpin.position.x = R;
    o.rod.position.set(px, py, 0);
    o.rod.rotation.z = Math.atan2(-py, xc - px);
    o.bar.scale.x = K.L; o.bar.position.x = K.L / 2; o.eye2.position.x = K.L;
    o.pin.position.x = o.spindle.position.x = o.cap.position.x = xc;
    o.pin.rotation.z = -Math.PI / 2 - xc / o.rp;                // rolls on the fixed rack
    o.top.position.x = 2 * xc - 13 * o.p;                       // twice the pinion centre's travel
    function sg(n) { n = Math.round(n); return (n < 0 ? "−" : n > 0 ? "+" : "") + Math.abs(n) + " mm"; }
    S.set("g", sg(xc)); S.set("t", sg(2 * xc));
  }
});
