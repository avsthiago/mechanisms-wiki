M507.define({
  number: 242,
  title: "Strap brake",
  lede: "A strap goes round a wheel, and a lever tightens it. The harder you pull the lever, the harder the strap grips and the slower the wheel turns. Cranes use this to hold a heavy load that is running down.",
  alt: "A big wheel on a short shaft with a flat strap wrapped round its rim. The two ends of the strap are pinned to a lever that sticks out to the right. A red stripe marks the wheel.",
  parts: [
    { key: "wheel", color: "#C8873A", name: "Brake wheel", note: "The wheel that has to be slowed down. Watch the red stripe to see how fast it turns." },
    { key: "strap", color: "#D9B13B", name: "Strap", note: "A flat band round the wheel. When it is pulled tight it rubs on the rim and slows the wheel." },
    { key: "lever", color: "#4FA58A", name: "Lever", note: "Turns on a fixed pin. Both ends of the strap are pinned to it, close to that pin." }
  ],
  controls: [{ type: "range", id: "pull", label: "Pull on the lever", min: 0, max: 100, step: 1, value: 0, unit: "%", presets: [[0, "Let go"], [30, "Light"], [75, "Hard"]] }],
  speed: { min: 1, max: 30, value: 12, label: "Wheel speed with the strap loose", unit: "rpm" },
  readouts: [{ id: "w", label: "Wheel" }, { id: "t", label: "Strap pull" }],
  views: { "3d": [330, 150, 760], front: [75, -10, 700], side: [720, 0, -20] },
  target: [75, -10, 0],
  how: [
    "The wheel turns and the strap lies round it. The strap has two ends. Both are pinned to the lever, one on each side of the lever's pin. When you pull the end of the lever down, the lever turns about its pin.",
    "Turning the lever moves the two pins so that the strap becomes too short for the loop it has to make. It squeezes the wheel. The rubbing between strap and rim holds the wheel back. A harder pull gives a harder squeeze.",
    "Try Let go, then Light, then Hard. With a light pull the wheel only slows down. With a hard pull it stops. Let go again and it speeds up."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the wheel, the strap and the lever. The stand, the pin the lever turns on, the shaft and the sizes were made up. Something has to push the wheel round, so the model gives it a steady push, as a load running down would. The way the wheel slows is a simple estimate, not a measurement.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, k;
    var o = this.o = { R: 100, r: 102, pc: 0.04, pm: 0.26, a: 0, om: null, n: 50,
      pin: [158, -22], up: [134, 6], lo: [126, -30], end: [250, -9] };
    // wheel: rim z -12..12, shaft from the stand face (z -40) to z 26
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylZ(100, 24, c.mat("wheel")), 0, 0, 0, o.wheel);                       // rim x,y radius 100, z -12..12
    P.at(P.cylZ(86, 1, c.mat("wheel", "dark")), 0, 0, 13, o.wheel);                // recessed look, z 12.5..13.5, lifted off the face
    P.at(P.cylZ(31, 8, c.mat("wheel")), 0, 0, 17, o.wheel);                        // hub z 13..21
    P.at(P.cylZ(17, 66, c.mat("wheel", "dark")), 0, 0, -7, o.wheel);               // shaft z -40..26
    P.at(P.box(55, 6, 1, c.mat("wheel", "mark")), 58, 0, 14.5, o.wheel);           // red stripe x 31..86, z 14..15, above the dark disc and clear of the hub
    // strap: a flat band, z -10..10, mid radius 102 so its inside (100.5) clears the rim
    var pts = []; for (k = 0; k < o.n; k++) pts.push([k, 0]);
    o.strap = P.flatStrip({ points: pts, thick: 3, width: 20, material: c.mat("strap") }); o.strap.userData.live = true; scene.add(o.strap);
    // lever, built in its own frame with the fixed pin at the origin; z 14..20
    o.lever = new T.Group(); o.lever.position.set(o.pin[0], o.pin[1], 0); scene.add(o.lever);
    function bar(ax, ay, bx, by, th, z0, mat) {
      var L = Math.hypot(bx - ax, by - ay), b = P.box(L, 8, th, mat);
      b.rotation.z = Math.atan2(by - ay, bx - ax); return P.at(b, (ax + bx) / 2, (ay + by) / 2, z0, o.lever);
    }
    var lx = o.lo[0] - o.pin[0], ly = o.lo[1] - o.pin[1], ux = o.up[0] - o.pin[0], uy = o.up[1] - o.pin[1], ex = o.end[0] - o.pin[0], ey = o.end[1] - o.pin[1];
    bar(lx, ly, ex, ey, 6, 17, c.mat("lever"));                                      // main bar z 14..20
    bar(0, 0, ux, uy, 4, 17, c.mat("lever"));                                        // short arm to the upper strap pin, z 15..19
    P.at(P.sphere(7, c.mat("lever")), ex, ey, 17, o.lever);                          // handle end
    [[lx, ly], [ux, uy], [0, 0]].forEach(function (p) { P.at(P.cylZ(7, 7, c.mat("lever")), p[0], p[1], 17, o.lever); });   // bosses z 13.5..20.5
    [[lx, ly], [ux, uy]].forEach(function (p) { P.at(P.cylZ(3.5, 33, c.mat("strap", "dark")), p[0], p[1], 5.5, o.lever); });   // strap pins z -11..22, through the strap ends and the lever
    P.at(P.cylZ(4, 3, c.mat("lever", "dark")), 0, 0, 22, o.lever);                   // head of the fixed pin z 20.5..23.5
    // stand: fixed pin from the plate face (z -40) to the lever's back face (z 13.5)
    P.at(P.cylZ(5, 53.5, c.fixed), o.pin[0], o.pin[1], -13.25, scene);              // z -40..13.5
    P.at(P.box(520, 280, 6, c.fixed), 90, -10, -43, scene);                         // plate x -170..350, y -150..130, z -46..-40; shaft and pin end at z -40
    P.at(P.box(540, 12, 100, c.fixed), 90, -156, -40, scene);                       // base x -180..360, y -162..-150, z -90..10; plate stands on y -150
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, i, R = o.r;
    var s = (+S.controls.pull || 0) / 100, phi = s * o.pm;
    var eff = Math.max(0, Math.min(1, (phi - o.pc) / (o.pm - o.pc)));
    function rot(p, f) { var x = p[0] - o.pin[0], y = p[1] - o.pin[1]; return [o.pin[0] + x * Math.cos(f) + y * Math.sin(f), o.pin[1] - x * Math.sin(f) + y * Math.cos(f)]; }
    o.lever.rotation.z = -phi;
    var a = rot(o.up, phi), b = rot(o.lo, phi);
    var rs = R + 5 * (1 - Math.min(1, phi / o.pc));                 // loose strap stands off the rim, then hugs it
    var d1 = Math.hypot(a[0], a[1]), d2 = Math.hypot(b[0], b[1]);
    var t1 = Math.atan2(a[1], a[0]) + Math.acos(Math.min(1, rs / d1)), t2 = Math.atan2(b[1], b[0]) - Math.acos(Math.min(1, rs / d2)) + 2 * Math.PI;
    var pts = [a], m = o.n - 2;
    for (i = 0; i < m; i++) { var q = t1 + (t2 - t1) * i / (m - 1); pts.push([rs * Math.cos(q), rs * Math.sin(q)]); }
    pts.push(b);
    o.strap.setPoints(pts);

    // simple dynamics: steady push D, brake slowing B grows with the squeeze; wheel settles at w*(1 - B/D) or stops
    var wf = S.w, D = 3, B = 6 * eff;
    if (S.playing && wf > 0) {
      if (o.om === null) o.om = wf;
      var step = Math.min(dt, .05), kk = D / wf, tgt = wf * (1 - B / D);
      o.om += (tgt - o.om) * (1 - Math.exp(-kk * step));
      if (o.om < 0 || (tgt <= 0 && o.om < .01)) o.om = 0;
      o.a += o.om * step;
    }
    o.wheel.rotation.z = o.a;
    S.set("w", Math.round((o.om === null ? 0 : o.om) * 60 / (2 * Math.PI)) + " rpm");
    S.set("t", Math.round(eff * 50) + " kg");
  }
});
