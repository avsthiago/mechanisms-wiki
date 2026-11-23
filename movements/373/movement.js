M507.define({
  number: 373,
  title: "Roberts's friction test",
  lede: "A loaded wagon stands on top of a big turning wheel, tied to a spring balance with a dial. The dial shows how hard the wheel drags the wagon along. It proves that the drag depends on the load, not on the speed.",
  alt: "A big spoked wheel on a wooden frame, turned by a belt on a smaller pulley in front of it. A small four-wheeled wagon full of logs rests on top of the big wheel. A rod from the wagon runs to a round dial with a pointer, standing on a shelf fixed to an upright post.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Big wheel", note: "It turns under the wagon like a moving road. Its top moves towards the left." },
    { key: "drive", color: "#D9B13B", name: "Belt and pulleys", note: "The small pulley turns the big pulley through the belt. The big pulley is fixed to the big wheel." },
    { key: "wagon", color: "#C8873A", name: "Wagon", note: "It stays in place while its wheels spin on the big wheel. The faster the big wheel, the faster they spin." },
    { key: "load", color: "#8E7AA8", name: "Load", note: "Logs piled in the wagon. A heavy load presses the wagon's wheels harder on their axles and on the big wheel." },
    { key: "rod", color: "#4FA58A", name: "Rod", note: "Holds the wagon back. It pulls on a cord inside the dial." },
    { key: "dial", color: "#E8E2D0", name: "Spring dial", note: "A coiled spring inside winds up as the rod pulls. Watch the red pointer to read the pull." }
  ],
  controls: [{ id: "load", label: "Wagon load", value: "light", options: [["light", "Light"], ["heavy", "Heavy"]] }],
  speed: { min: 2, max: 40, value: 12, label: "Big wheel" },
  readouts: [{ id: "v", label: "Rim speed" }, { id: "f", label: "Spring pull" }],
  views: { "3d": [110, 145, 1000], front: [10, 35, 1040], side: [1000, 85, 160] },
  target: [10, 35, 0],
  how: [
    "The belt turns the big wheel, and its top runs under the wagon's wheels. The wagon's wheels spin, but the wagon does not go anywhere. The rod holds it back.",
    "Wheels never roll for free. Their axles rub and their rims squash a little. So the big wheel drags the wagon to the left. The rod pulls back on a spring inside the dial, and the pointer shows how hard.",
    "Speed the big wheel up or slow it down, and watch the pointer. It stays where it is. Now switch to a heavy load. The pointer swings round at once, because the drag grows with the weight, not with the speed."
  ],
  note: "This model is rebuilt from Brown's drawing and description. The small driving pulley and its crank, the cord inside the dial, the sizes and how hard the wheel drags the wagon were made up. Brown draws a screw through the post behind the dial; it is left out. The frame's sloping legs are drawn upright.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var R = 150, RW = 26, HALF = 51.5;                       // big wheel rim, wagon wheel radius, half the wagon's axle spacing
    var o = this.o = { a: 0, F: 10, R: R, RW: RW, HALF: HALF, CH: Math.sqrt((R + RW) * (R + RW) - HALF * HALF), loads: {}, spin: 0 };

    // big wheel and its pulley, on one axle about z
    var w = o.wheel = new T.Group(); scene.add(w);
    var wm = c.mat("wheel");
    var big = P.pulley({ radius: R, width: 60, rim: 10, spokes: 4, hub: 22, material: wm });
    big.rotation.z = Math.PI / 4; w.add(big);                // rim r 140..150, z -30..30
    P.at(P.cylZ(8, 140, wm), 0, 0, 12, w);                   // axle z -58..82: from the back bearing's back face to the pulley's front
    var dm = c.mat("drive");
    P.at(P.pulley({ radius: 70, width: 20, rim: 6, spokes: 5, material: dm }), 0, 0, 72, w);   // pulley z 62..82, fixed to the axle

    // small driving pulley with a crank, on its own bearing up to the left
    var dv = o.drv = new T.Group(); dv.position.set(-260, 120, 0); scene.add(dv);
    P.at(P.pulley({ radius: 30, width: 20, rim: 5, spokes: 4, material: dm }), 0, 0, 72, dv);  // z 62..82
    P.at(P.cylZ(6, 38, dm), 0, 0, 63, dv);                   // shaft z 44..82, from the bearing's back face
    P.at(P.box(10, 44, 6, dm), 0, 17, 85, dv);               // crank arm y -5..39, z 82..88, on the shaft end
    P.at(P.cylZ(4, 18, c.mat("drive", "dark")), 0, 32, 97, dv);   // handle z 88..106
    o.belt = P.at(P.belt({ width: 18, thick: 3, material: dm }), 0, 0, 72, scene);
    o.belt.set(0, 0, 71.5, -260, 120, 31.5, false);         // rides on both pulley rims

    // wagon: its axle line's middle point is the origin of the group; wheels at x = +-HALF rest on the big wheel
    var wg = o.wagon = new T.Group(); scene.add(wg);
    var gm = c.mat("wagon"), body = new T.Shape();
    body.moveTo(-68, 4); body.lineTo(68, 4); body.lineTo(86, 40); body.lineTo(-86, 40); body.closePath();
    var bg = new T.ExtrudeGeometry(body, { depth: 28, bevelEnabled: false }); bg.translate(0, 0, -14);
    wg.add(new T.Mesh(bg, gm));                               // tray y 4..40, z -14..14, on the axles (radius 4)
    o.wheels = [];
    [-HALF, HALF].forEach(function (x) {
      P.at(P.cylZ(4, 48, gm), x, 0, 0, wg);                   // axle z -24..24
      [-20, 20].forEach(function (z) {
        var h = new T.Group(); h.position.set(x, 0, z); wg.add(h); o.wheels.push(h);
        h.add(P.cylZ(RW, 8, gm));                             // wheel z +-4 about its place: 16..24 and -24..-16, on the rim (z -30..30)
        P.at(P.box(RW - 6, 4, 1, c.mat("wagon", "dark")), (RW - 6) / 2 + 3, 0, z > 0 ? 4.5 : -4.5, h);   // stripe lifted .5 off the outer face
      });
    });
    [["light", 6, 22], ["heavy", 9, 50]].forEach(function (q) {   // logs standing in the tray, their feet sunk into it
      var g = new T.Group(); wg.add(g); o.loads[q[0]] = g;
      for (i = 0; i < q[1]; i++) {
        var hgt = q[2] * (.7 + .3 * ((i * 7) % 5) / 4), x = -72 + 144 * (i + .5) / q[1];
        var log = P.box(144 / q[1] - 3, hgt + 6, 22, c.mat("load", i % 2 ? "light" : null));
        log.position.set(x, 34 + (hgt + 6) / 2, 0); log.rotation.z = ((i * 5) % 3 - 1) * .08; g.add(log);   // from y 34 up
      }
    });

    // rod from the wagon's right end into the dial
    o.rod = P.rod(3, c.mat("rod")); scene.add(o.rod);
    o.att = new T.Vector3(); o.Q = new T.Vector3(226, 189, 0);    // the cord leaves the top of a drum (radius 4) on the dial's spindle

    // spring dial on its shelf
    var dg = new T.Group(); dg.position.set(226, 185, 0); scene.add(dg);
    var dmat = c.mat("dial");
    dg.add(P.cylZ(70, 20, dmat));                             // case r 70, z -10..10
    P.at(P.box(60, 10, 18, dmat), 0, -65, 0, dg);             // foot y -70..-60 (world 115..125), z -9..9 (inside the case's faces), on the shelf
    for (i = 0; i <= 12; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 18, len = i % 3 ? 7 : 13;
      var tk = P.box(len, 2, 1, c.mat("dial", "dark")); tk.position.set((62 - len / 2) * Math.cos(ang), (62 - len / 2) * Math.sin(ang), 11); tk.rotation.z = ang; dg.add(tk);   // ticks z 10.5..11.5
    }
    o.ptr = new T.Group(); o.ptr.position.z = 13; dg.add(o.ptr);
    P.at(P.box(52, 4, 2, c.mat("dial", "mark")), 22, 0, 0, o.ptr);   // pointer z 12..14, r -4..48
    P.at(P.cylZ(5, 3, c.mat("dial", "dark")), 0, 0, 15.5, dg);   // spindle cap z 14..17

    // supports
    [-52, 52].forEach(function (z) {
      P.at(P.bearingBlock({ bore: 8.6, outer: 18, width: 12, drop: 20, material: c.fixed }), 0, 0, z, scene);   // z +-(46..58), foot on the beam at y -20
      P.at(P.box(490, 30, 12, c.fixed), 55, -35, z, scene);     // beam x -190..300, y -50..-20; ends on the post's face
      P.at(P.box(24, 150, 12, c.fixed), -178, -125, z, scene);  // leg x -190..-166, y -200..-50, under the beam
    });
    P.at(P.box(24, 440, 116, c.fixed), 312, 20, 0, scene);     // post x 300..324, y -200..240, z -58..58
    P.at(P.box(150, 10, 60, c.fixed), 225, 110, 0, scene);     // shelf x 150..300, y 105..115, z -30..30, on the post's face
    P.at(P.bearingBlock({ bore: 6.6, outer: 14, post: 20, width: 12, drop: 320, material: c.fixed }), -260, 120, 50, scene);   // z 44..56, foot on the floor
    P.at(P.box(680, 10, 200, c.fixed), 5, -205, 10, scene);    // floor x -335..345, y -210..-200, z -90..110
  },

  step: function (c, dt, S) {
    var o = this.o, heavy = S.controls.load === "heavy";
    var w = S.w;                                              // the big wheel's speed, rad/s; anticlockwise, so its top runs left
    o.a += w * dt;
    o.wheel.rotation.z = o.a;
    o.drv.rotation.z = o.a * 70 / 30;                         // the belt runs at the same speed on both pulleys
    var target = w > 0 ? (heavy ? 20 : 10) : 0;               // newtons: about one fiftieth of 100 kg or 50 kg
    o.F += (target - o.F) * (1 - Math.exp(-(dt || 0) / .35)); // the spring and pointer settle quickly
    var phi = o.F * 3 * Math.PI / 180;                        // 3 degrees of pointer per newton
    o.ptr.rotation.z = -Math.PI / 2 + phi;
    // the cord unwinds phi * 4 from its drum, so the wagon slides that far left; its wheels stay on the big wheel's rim
    var d = 4 * phi, psi = Math.asin(d / o.CH);
    o.wagon.position.set(-o.CH * Math.sin(psi), o.CH * Math.cos(psi), 0);
    o.wagon.rotation.z = psi;
    o.spin -= w * dt * o.R / o.RW;                            // the wagon's wheels roll on the rim, the other way round
    o.wheels.forEach(function (h) { h.rotation.z = o.spin; });
    for (var k in o.loads) o.loads[k].visible = (k === "heavy") === heavy;
    o.wagon.updateMatrixWorld(true); o.att.set(86, 20, 0); o.wagon.localToWorld(o.att);
    o.rod.span(o.att.x, o.att.y, 0, o.Q.x, o.Q.y, 0);
    var v = S.playing ? S.rpm * 2 * Math.PI / 60 * .75 : 0;  // rim taken as .75 m from the axle
    S.set("v", (Math.round(v * 10) / 10) + " m/s");
    S.set("f", Math.round(o.F) + " N");
  }
});
