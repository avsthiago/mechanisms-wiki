M507.define({
  number: 473,
  title: "Water air-pump",
  lede: "A simple pump for sucking bad air out of a deep pit. A tub hangs upside down in a bigger tub of water, and two levers lift it and let it down. Two flaps that only open upward make the air go one way.",
  alt: "A wooden frame with two long levers on top. Ropes from the levers cross and hold up a barrel that stands upside down in a larger tub of water. Both tubs are cut open down the middle. A pipe comes up through the bottom of the big tub to just above the water.",
  parts: [
    { key: "vat", color: "#4FA58A", name: "Water tub", note: "The big tub, filled with water nearly to the top. The water seals the bottom of the upper tub so no air can sneak in underneath." },
    { key: "bell", color: "#C8873A", name: "Upper tub", note: "Stands upside down in the water. It has a short pipe with a flap on top. Lifting it makes room for air inside; lowering it squeezes the air out." },
    { key: "pipe", color: "#5E7387", name: "Suction pipe", note: "Comes from the pit and rises through the water to just above its surface. It ends in a flap." },
    { key: "flaps", color: "#C2503F", name: "Flaps", note: "Two little lids that can only open upward. Watch them take turns: the lower one opens as the tub rises, the upper one as it falls." },
    { key: "levers", color: "#D9B13B", name: "Levers", note: "Two long bars on pins at the top of the frame. Pulling down the hanging handles raises the upper tub on its crossed ropes." }
  ],
  controls: [{ id: "stroke", label: "Stroke", value: "full", options: [["short", "Short"], ["full", "Full"]] }],
  speed: { min: 4, max: 30, value: 12, label: "Pumping", unit: " a min" },
  readouts: [{ id: "p", label: "Inside" }, { id: "v", label: "Gas drawn" }],
  closed: { label: "Tubs" },
  views: { "3d": [252, 163, 541], front: [0, 25, 620], side: [620, 25, 0] },
  target: [0, 25, 0],
  how: [
    "Watch the upper tub go up and down in the water. As it rises, the flap on the pipe opens and gas from the pit flows up into the tub. As it falls, that flap shuts, the flap on top opens, and the gas is pushed out into the open air.",
    "The water acts as a seal. Air cannot get in under the rim of the upper tub, so the only ways in and out are the two flaps. Lifting the tub leaves more room inside, so the air in it thins out and the gas from the pit is pushed in to fill it. Lowering the tub squeezes that gas, and it can only escape through the top. Brown says this pump was used to clear a heavy, choking gas out of a deep shaft.",
    "Try a short stroke, then a full one. Count how much gas each stroke draws out. Choose Closed to see the tubs as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Both tubs are cut open down the middle so the inside shows. The frame is drawn with two top beams so the ropes can pass between them, and the board under the tub, the way the pipe leaves the tub and all the sizes were made up. The dots show the gas. The water inside the upper tub dips and rises a little with the pressure; this is made bigger so you can see it.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { th: Math.PI / 2, A: .286, yB: -30, vy: 0, yi: 0, drawn: 0, t: 0, Lr: 0 };
    var water = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .4, depthWrite: false, side: T.DoubleSide });
    o.water = P.halfSection({ poly: [[5.3, -90.5], [40, -90.5], [40, 0], [5.3, 0]], steps: 32, material: water }); o.water.position.z = .3; scene.add(c.shell(o.water, "open"));   // reshaped every frame
    var ring = new T.Mesh(new T.RingGeometry(40, 52.8, 48), water); ring.rotation.x = -Math.PI / 2; scene.add(c.shell(ring, "closed"));   // closed view: the water line between the two tubs, r 40 (inside the upper tub's wall) .. 52.8
    // frame
    P.at(P.box(300, 6, 140, c.fixed), 0, -123, 0, scene);                        // ground, y -126 .. -120
    [-1, 1].forEach(function (s) {
      P.at(P.box(30, 25, 40, c.fixed), s * 71, -107.5, 0, scene);              // foot, x 56 .. 86, y -120 .. -95
      P.at(P.box(16, 235, 32, c.fixed), s * 70, 22.5, 0, scene);               // upright, x 62 .. 78, y -95 .. 140, z -16 .. 16
      P.at(P.box(48, 8, 40, c.fixed), s * 32, -99.5, 0, scene);                  // board under the tub, x 8 .. 56 (meets the foot at 56), y -103 .. -95
      P.at(P.box(180, 16, 10, c.fixed), 0, 148, s * 12, scene);                // top beam, y 140 .. 156, z 7 .. 17 (front) and -17 .. -7 (back)
      [-1, 1].forEach(function (t) { P.at(P.box(12, 20, 10, c.fixed), s * 60, 166, t * 12, scene); });   // pin blocks on the beams, y 156 .. 176
      P.at(P.cylZ(2.5, 14, c.mat("levers", "dark")), s * 60, 170, 0, scene);   // pin, z -7 .. 7 between the blocks
    });
    // water tub: wall r 48 .. 52 at the floor rising to 54 .. 58 at the top, y -95 .. 12, hole for the pipe
    scene.add(c.shell(P.halfSection({ poly: [[5.5, -95], [52, -95], [58, 12], [54, 12], [48, -91], [5.5, -91]], steps: 32, material: c.mat("vat") }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: [[5.5, -95], [52, -95], [58, 12], [54, 12], [48, -91], [5.5, -91]], material: c.mat("vat") }), "closed"));   // closed view: the whole tub
    [-80, -40, 0].forEach(function (y) { var r = 52 + 6 * (y + 95) / 107, hp = [[r, y - 3], [r + 1.4, y - 3], [r + 1.4, y + 3], [r, y + 3]];
      scene.add(c.shell(P.halfSection({ poly: hp, material: c.mat("vat", "dark") }), "open")); scene.add(c.shell(P.wholeSection({ poly: hp, material: c.mat("vat", "dark") }), "closed")); });   // hoops, standing 1.4 off the wall
    // suction pipe: up the middle to y 6, cut open; below the tub it turns toward the back
    scene.add(c.shell(P.halfSection({ poly: [[3.5, -112], [5, -112], [5, 6], [3.5, 6]], material: c.mat("pipe") }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: [[3.5, -112], [5, -112], [5, 6], [3.5, 6]], material: c.mat("pipe") }), "closed"));   // closed view: the whole pipe, seen below the tub
    P.at(P.sphere(5, c.mat("pipe")), 0, -112, 0, scene);
    P.at(P.cylZ(5, 90, c.mat("pipe")), 0, -112, -45, scene);                    // z -90 .. 0, bottom y -117 above the ground at -120
    o.flapLo = P.at(new T.Group(), -7, 6, 0, scene);                            // hinge on the left edge of the pipe's top
    P.at(P.cylY(7, 1.5, c.mat("flaps")), 7, 1.25, 0, o.flapLo);                  // y 6 .. 7.5, resting on the pipe top
    // upper tub, its origin at the bottom rim; open below, head on top with a short pipe and flap
    o.bell = P.at(new T.Group(), 0, o.yB, 0, scene);
    o.prof = [[0, 40], [25, 42], [50, 44], [75, 42], [100, 38]];
    var bp = [[37, 0], [40, 0], [42, 25], [44, 50], [42, 75], [38, 100], [5, 100], [5, 96], [35, 96], [39, 75], [41, 50], [39, 25]];
    o.bell.add(c.shell(P.halfSection({ poly: bp, steps: 32, material: c.mat("bell") }), "open"));
    o.bell.add(c.shell(P.wholeSection({ poly: bp, material: c.mat("bell") }), "closed"));   // closed view: the whole upper tub
    [12, 50, 88].forEach(function (y) { var r = y < 50 ? 40 + 4 * y / 50 : 44 - 6 * (y - 50) / 50, hp = [[r + .7, y - 3], [r + 2, y - 3], [r + 2, y + 3], [r + .7, y + 3]];
      o.bell.add(c.shell(P.halfSection({ poly: hp, material: c.mat("bell", "dark") }), "open")); o.bell.add(c.shell(P.wholeSection({ poly: hp, material: c.mat("bell", "dark") }), "closed")); });
    o.bell.add(c.shell(P.halfSection({ poly: [[5, 100], [7.5, 100], [7.5, 110], [5, 110]], material: c.mat("bell") }), "open"));   // short pipe on the head
    o.bell.add(c.shell(P.wholeSection({ poly: [[5, 100], [7.5, 100], [7.5, 110], [5, 110]], material: c.mat("bell") }), "closed"));
    o.flapHi = P.at(new T.Group(), -9, 110, 0, o.bell);
    P.at(P.cylY(9, 1.5, c.mat("flaps")), 9, 1.25, 0, o.flapHi);
    [-1, 1].forEach(function (s) { var e = P.hook({ radius: 6, tube: 1.8, material: c.mat("bell", "dark") }); P.at(e, s * 18, 106, 0, o.bell); });   // eyes, bottom edge at 98.2 inside the head
    // levers: left pin x -60, right pin x 60, both at y 170; inner arm 85, outer arm 70
    o.lev = [-1, 1].map(function (s) {
      var g = P.at(new T.Group(), s * 60, 170, s * -4, scene);                  // left lever z 2 .. 6, right z -6 .. -2
      P.at(P.box(155, 6, 4, c.mat("levers")), -s * 7.5, 0, 0, g);              // x from the pin: inner end at -s * 85, outer at s * 70
      return g;
    });
    o.ropes = [0, 1].map(function () { return P.at(P.rod(1.1, c.mat("levers", "dark")), 0, 0, 0, scene); });
    o.hang = [0, 1].map(function () { return P.at(P.rod(1.1, c.mat("levers", "dark")), 0, 0, 0, scene); });
    o.hand = [0, 1].map(function () { var h = P.cylX(3, 36, c.mat("levers")); h.rotation.y = .5; return P.at(h, 0, 0, 0, scene); });
    // rope length: tub at mid stroke with the levers level
    o.Lr = Math.hypot(25 + 18, 170 - (-54 + 112), 4);
    // gas dots: in the pipe, inside the tub, and puffs leaving the top
    o.gas = P.waterDots(130, { radius: 2.3, color: "#6F7C88", opacity: .8 }); scene.add(o.gas);
    o.pp = 0; o.room = []; o.out = [];
    for (i = 0; i < 40; i++) o.out.push({ on: false });
    for (i = 0; i < 22; i++) o.room.push(this.cell(Math.random()));
  },

  cell: function (u) { var a = Math.PI + Math.random() * Math.PI, r = 6 + Math.random() * 26; return { u: u, x: r * Math.cos(a), z: r * Math.sin(a) - 1 }; },

  step: function (c, dt, S) {
    var o = this.o, me = this, i;
    var A = S.controls.stroke === "short" ? .14 : .286;
    o.A += (A - o.A) * Math.min(1, dt * 2);
    o.th += S.w * dt;
    var phi = o.A * Math.sin(o.th), dphi = o.A * Math.cos(o.th) * S.w;
    // tub height from the rope: left lever's inner end down to the right-hand eye
    var xi = -60 + 85 * Math.cos(phi), yi = 170 + 85 * Math.sin(phi);
    var yB = yi - Math.sqrt(Math.max(0, o.Lr * o.Lr - (xi + 18) * (xi + 18) - 16)) - 112;
    var vy = dt > 0 ? (yB - o.yB) / dt : 0; o.yB = yB; o.bell.position.y = yB;
    o.vy += (vy - o.vy) * Math.min(1, dt * 8);
    o.lev[0].rotation.z = phi; o.lev[1].rotation.z = -phi;
    var pr = -o.vy / (24 * Math.max(.3, Math.abs(S.w)) * o.A / .286 + 1e-6);   // +1 squeezing hard, -1 sucking hard
    pr = Math.max(-1, Math.min(1, pr));
    o.yi = 3 * Math.max(-1, Math.min(1, -pr));                                  // water inside dips when squeezed, rises when sucking (made bigger)
    var lo = o.vy > .5 ? Math.min(1, o.vy / 20) : 0, hi = o.vy < -.5 ? Math.min(1, -o.vy / 20) : 0;
    o.flapLo.rotation.z = 1.0 * lo; o.flapHi.rotation.z = 1.0 * hi;   // each flap lifts on its hinge
    // ropes, hanging ropes and handles
    [0, 1].forEach(function (k) {
      var s = k ? 1 : -1, p = k ? -phi : phi;
      var ix = s * 60 - s * 85 * Math.cos(p), iy = 170 + 85 * Math.sin(phi);
      var ox = s * 60 + s * 70 * Math.cos(phi), oy = 170 - 70 * Math.sin(phi);
      o.ropes[k].span(ix, iy, -s * 4, s * 18, yB + 112, 0);   // crossed: each lever lifts the far eye
      o.hang[k].span(ox, oy, -s * 4, ox, oy - 140, -s * 4);
      o.hand[k].position.set(ox, oy - 143, -s * 4);
    });
    // gas: room inside the tub from the water inside up to the underside of the head
    var head = yB + 96, Hh = head - o.yi;
    if (dt > 0 && S.playing) {
      o.t += dt;
      if (o.vy > .5) {                                                          // gas flows up the pipe and in
        o.pp += o.vy * dt * .45;
        while (o.pp >= 1) { o.pp -= 1; o.room.push(this.cell(Math.random() * .15)); if (o.room.length > 80) o.room.shift(); }
        o.drawn += o.vy * dt * 4.5;
      }
      var want = Math.round(Hh * .45);
      while (o.room.length > want && o.vy < -.5) {                              // the most crowded top gas leaves by the upper flap
        var bi = 0; o.room.forEach(function (q, n) { if (q.u > o.room[bi].u) bi = n; });
        o.room.splice(bi, 1);
        for (i = 0; i < o.out.length; i++) if (!o.out[i].on) { var q = o.out[i]; q.on = true; q.x = (Math.random() - .5) * 6; q.y = yB + 112; q.z = -2 - Math.random() * 3; q.vx = (Math.random() - .5) * 14; q.vy = 30 + Math.random() * 15; q.age = 0; break; }
      }
      o.room.forEach(function (q) { q.u = Math.min(1, q.u + dt * .05 * Math.random()); });
      o.out.forEach(function (q) { if (!q.on) return; q.age += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.age > 1.4) q.on = false; });
    }
    var n = 0;
    for (i = 0; i < 14; i++, n++) {                                             // in the pipe, moving only while the lower flap is open
      var f = (i + (o.pp % 1)) / 14, y = -112 + f * 116;
      o.gas.put(n, 0, y, -2, 1);
    }
    o.room.forEach(function (q) { if (n < 120) { o.gas.put(n, q.x, o.yi + 2 + q.u * (Hh - 5), q.z, 1); n++; } });
    for (; n < 90; n++) o.gas.put(n, 0, 0, 0, 0);
    o.out.forEach(function (q, k) { o.gas.put(90 + k, q.x || 0, q.y || 0, q.z || 0, q.on ? 1 - q.age / 1.6 : 0); });
    o.gas.flush();
    // water: one section from the tub floor round the rim of the upper tub to the water inside
    var R = function (y) { return 48 + 6 * (y + 91) / 103 - .5; }, B = o.prof, pts = [[5.3, -90.5], [R(-90.5), -90.5], [R(0), 0]];
    function br(h) { for (var k = 1; k < B.length; k++) if (h <= B[k][0]) return B[k - 1][1] + (B[k][1] - B[k - 1][1]) * (h - B[k - 1][0]) / (B[k][0] - B[k - 1][0]); return B[B.length - 1][1]; }
    var top = -yB;                                                               // the water line in the tub's own height
    pts.push([br(top) + .3, 0]);
    for (var h = Math.floor(top / 5) * 5; h > 0; h -= 5) pts.push([br(h) + .3, yB + h]);
    pts.push([40.3, yB - .3], [36.7, yB - .3]);
    var ih = o.yi - yB;
    for (h = 5; h < ih; h += 5) pts.push([br(h) - 3.3, yB + h]);
    pts.push([br(ih) - 3.3, o.yi], [5.3, o.yi]);
    o.water.set(pts);
    S.set("p", (pr > 0 ? "+" : pr < 0 ? "−" : "") + Math.abs(pr * .5).toFixed(1) + " kPa");
    S.set("v", Math.round(o.drawn) + " L");
  }
});
