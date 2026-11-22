M507.define({
  number: 377,
  title: "Tread-mill",
  lede: "A person climbs steps on the outside of a big drum. Their weight turns the drum, like a person on a never-ending staircase. A gear on the shaft passes the turning on to a machine, such as a pump or a mill.",
  alt: "A big drum lying on its side, covered with boards. A person grips a handrail and steps up the boards on the front of the drum. At the left end of the drum a big gear on the shaft turns a small gear.",
  parts: [
    { key: "person", color: "#5E7387", name: "Person", note: "Steps up the boards and holds the rail. Their weight is what turns the drum." },
    { key: "drum", color: "#C8873A", name: "Drum with boards", note: "A wide wheel with wooden steps all round its edge. The red stripe on one board shows how fast it turns." },
    { key: "gears", color: "#4FA58A", name: "Gears and shaft", note: "The big driving gear turns with the drum and drives the small driven gear, the output. Watch its red stripe." }
  ],
  controls: [{ type: "range", id: "pos", label: "Where the person steps", min: 30, max: 45, step: 1, value: 38, unit: "°", presets: [[30, "Near the top"], [38, "Part way down"], [45, "Well down the side"]] }],
  speed: { min: 1, max: 10, value: 4, label: "Drum speed", unit: "rpm" },
  readouts: [{ id: "d", label: "Drum" }, { id: "g", label: "Small gear" }, { id: "t", label: "Turning force" }],
  views: { "3d": [-1180, 220, 380], front: [0, 100, 1200], side: [1200, 110, 0] },
  target: [0, 130, 60],
  how: [
    "The person stands on one board and holds the rail. Their weight pushes the board down, so the drum turns and the next board comes up under their other foot. They step up all the time but stay in the same place.",
    "The turning force depends on where they stand. At the very top their weight pushes straight at the shaft and turns nothing. The further round the front they stand, the more their weight pulls the drum round. The big gear has twice as many teeth as the small one, so the small gear turns twice as fast.",
    "Try standing near the top, then well down the side, and watch the turning force. Then change the drum speed and see how fast the feet have to move."
  ],
  note: "This model is rebuilt from Brown's drawing. The shaft, the two bearings, the base and the small output gear were made up. So were the slanted posts that hold the rail, and the sizes of the drum, boards and gears. The person is a simple blocky figure. They walk steadily, one step for each board, and stay where you place them.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, R = 200, NB = 28;
    var o = this.o = { th: 0, ph: 0, R: R, NB: NB };
    var W = o.drum = new T.Group(); scene.add(W);
    var md = c.mat("drum");
    // drum: axis X, x -75..75. Boards radial 194..200, hoops at each end, a cross of arms and a hub at each end
    for (i = 0; i < NB; i++) {
      var a = i * 2 * Math.PI / NB, b = P.box(150, 6, 40, md);
      P.at(b, 0, 197 * Math.cos(a), 197 * Math.sin(a), W);   // local y = radial, z = tangential
      b.rotation.x = a;                                          // thin side faces the axis
    }
    [72, -72].forEach(function (x) {
      var h = P.hoop(197, 5, md); h.rotation.y = Math.PI / 2; P.at(h, x, 0, 0, W);
      var h2 = P.box(8, 380, 8, md); P.at(h2, x * 0.9, 0, 0, W);                    // arm along Y: x thickness 8
      var h3 = P.box(6, 8, 380, md); P.at(h3, x * 0.9, 0, 0, W);                    // arm along Z: x thickness 6
      P.at(P.cylX(18, 26, md), x * 0.9, 0, 0, W);
    });
    var st = P.box(100, .8, 8, c.mat("drum", "mark")); P.at(st, 0, 200.9, 0, W);   // stripe on the top board, 0.5 above its face
    // shaft x -135..110 through bearings at x = -122 and x = 95
    P.at(P.cylX(7, 245, c.mat("gears")), -12.5, 0, 0, W);
    var wr = new T.Group(); wr.rotation.y = Math.PI / 2; P.at(wr, -100, 0, 0, W);   // gear plate x -108..-92
    var big = P.spurGear({ teeth: 14, module: 20, width: 16, material: c.mat("gears") }); wr.add(big);
    var pr = big.pitchRadius, sm = P.spurGear({ teeth: 7, module: 20, width: 16, material: c.mat("gears") });
    // output gear on its own short shaft behind, centre z = -(pitch radii), x = -100
    var og = o.out = new T.Group(); og.position.set(-100, 0, -(pr + sm.pitchRadius)); og.rotation.y = Math.PI / 2; scene.add(og);
    o.pin = new T.Group(); og.add(o.pin); o.pin.add(sm);
    P.at(P.cylZ(6, 26, c.mat("gears")), 0, 0, -21, o.pin);                       // shaft x from gear face (-108) out to -134 (z -34..-8 maps to x -134..-108 after the turn)
    P.at(P.box(30, 4, .8, c.mat("gears", "mark")), 22, 0, 8.4, o.pin);           // stripe on the x = -92 face of the small gear, lifted 0.4
    P.at(P.box(30, 4, .8, c.mat("gears", "mark")), 22, 0, 0, wr);
    o.big = big; o.sm = sm;
    // supports
    var bb = P.bearingBlock({ bore: 8, outer: 24, drop: 215, width: 14, material: c.fixed }); bb.rotation.y = Math.PI / 2; P.at(bb, -122, 0, 0, scene);   // x -129..-115, foot y -215
    var b2 = P.bearingBlock({ bore: 8, outer: 24, drop: 215, width: 14, material: c.fixed }); b2.rotation.y = Math.PI / 2; P.at(b2, 95, 0, 0, scene);     // x 88..102
    var b3 = P.bearingBlock({ bore: 8, outer: 24, drop: 215, width: 14, material: c.fixed }); b3.rotation.y = Math.PI / 2; P.at(b3, -122, 0, -(pr + sm.pitchRadius), scene);
    P.at(P.box(315, 12, 440, c.fixed), -17.5, -221, -70, scene);                 // x -175..140, y -227..-215, z -290..150
    // handrail on two slanted posts: foot (z 200, y -213.5), top (z 70, y 380)
    [-145, 105].forEach(function (x) { P.at(P.rod(5, c.fixed), 0, 0, 0, scene).span(x, -213.5, 200, x, 380, 70); });
    P.at(P.rod(5, c.fixed), 0, 0, 0, scene).span(-145, 380, 70, 105, 380, 70);
    // person
    var mp = c.mat("person"), mk = c.mat("person", "dark");
    o.rod = []; for (i = 0; i < 8; i++) o.rod.push(P.at(P.rod(6, mp), 0, 0, 0, scene));   // 2 legs x 2, 2 arms x 2
    o.shoe = [P.at(P.box(14, 6, 24, mk), 0, 0, 0, scene), P.at(P.box(14, 6, 24, mk), 0, 0, 0, scene)];
    o.torso = P.at(P.box(40, 80, 22, mp), 0, 0, 0, scene);
    o.head = P.at(P.sphere(17, mp), 0, 0, 0, scene);
    o.cap = P.at(P.box(30, 9, 30, mk), 0, 0, 0, scene);
    o.hand = [P.at(P.sphere(6, mk), 0, 0, 0, scene), P.at(P.sphere(6, mk), 0, 0, 0, scene)];
  },

  step: function (c, dt, S) {
    var o = this.o, R = o.R, w = S.w, psi = (+S.controls.pos) * Math.PI / 180, hd = Math.PI / o.NB;
    o.th += w * dt;
    o.drum.rotation.x = o.th;                              // the top moves toward the front, so boards on the front go down under the feet
    o.pin.rotation.z = -o.th * 2 + o.sm.pitch / 2;         // twice as fast, opposite way, half a tooth over so the teeth mesh
    if (w > 0) o.ph += w / (4 * hd) * dt;
    var L1 = 72, L2 = 72, A1 = 56, A2 = 56;
    var hip = { z: R * Math.sin(psi) + 4, y: R * Math.cos(psi) + 118 };
    function ik(ax, ay, bx, by, l1, l2, fwd) {              // elbow or knee between two points in the (z, y) plane
      var dz = bx - ax, dy = by - ay, d = Math.min(Math.sqrt(dz * dz + dy * dy), l1 + l2 - .01), a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
      var h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), mz = ax + dz / Math.sqrt(dz * dz + dy * dy) * a, my = ay + dy / Math.sqrt(dz * dz + dy * dy) * a;
      var nz = -dy / Math.sqrt(dz * dz + dy * dy), ny = dz / Math.sqrt(dz * dz + dy * dy);
      var s = fwd === "z" ? (nz < 0 ? 1 : -1) : (ny < 0 ? 1 : -1);
      return { z: mz + s * h * nz, y: my + s * h * ny };
    }
    function seg(r, x, p, q) { r.span(x, p.y, p.z, x, q.y, q.z); }
    var k, x, off;
    for (k = 0; k < 2; k++) {
      x = k ? 11 : -11; off = k ? .5 : 0;
      var p = (o.ph + off) % 1, dl, lift = 0;
      if (p < .5) dl = -hd + 2 * hd * (p / .5);
      else { var u = (p - .5) / .5; dl = hd - 2 * hd * (.5 - .5 * Math.cos(Math.PI * u)); lift = 20 * Math.sin(Math.PI * u); }
      var ang = psi + dl, rr = R + 3 + lift, foot = { z: rr * Math.sin(ang), y: rr * Math.cos(ang) };
      var kn = ik(hip.z, hip.y, foot.z, foot.y, L1, L2, "z");
      seg(o.rod[k * 2], x, hip, kn); seg(o.rod[k * 2 + 1], x, kn, foot);
      o.shoe[k].position.set(x, foot.y + 3, foot.z - 4); o.shoe[k].rotation.x = ang;
    }
    var sh = { z: hip.z, y: hip.y + 76 }, rail = { z: 70, y: 380 };
    for (k = 0; k < 2; k++) {
      x = k ? 24 : -24;
      var el = ik(sh.z, sh.y, rail.z, rail.y, A1, A2, "y");
      seg(o.rod[4 + k * 2], x, sh, el); seg(o.rod[5 + k * 2], x, el, rail);
      o.hand[k].position.set(x, rail.y, rail.z);
    }
    o.torso.position.set(0, hip.y + 38, hip.z); o.head.position.set(0, sh.y + 22, sh.z - 2); o.cap.position.set(0, sh.y + 38, sh.z - 2);
    var rpm = S.playing ? S.rpm : 0;
    S.set("d", rpm + " rpm");
    S.set("g", (rpm === 0 ? 0 : -2 * rpm) + " rpm");
    S.set("t", Math.round(70 * 9.81 * 1.3 * Math.sin(psi)) + " N·m");
  }
});
