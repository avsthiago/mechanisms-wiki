M507.define({
  number: 177,
  title: "Uncoupling engines, second form",
  lede: "A pin on one crank arm pushes round a second crank arm through a slot in a ring. Turn the ring so the slot points along the arm and the two arms turn together. Turn it across the arm and the pin slides through the slot, so the second arm stands still.",
  alt: "A long crank arm with a round hub at one end and a slotted disc at the other. The slot lies across the arm, with two curved guide lines above and two below. A pin from a thin driving arm sits in the slot.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving crank", note: "The arm that is always turned by the engine. It carries the crank pin and has no ring of its own." },
    { key: "driven", color: "#C8873A", name: "Driven crank", note: "The long arm with the ring on its end. It turns only when the crank pin pushes on the slot." },
    { key: "wrist", color: "#C2503F", name: "Crank pin", note: "The pin on the driving arm. It sits in the slot of the ring. Watch it." },
    { key: "ring", color: "#4FA58A", name: "Slotted ring", note: "A disc with a straight slot across it. It can be turned on the end of the driven arm. The slot decides whether the pin pushes the arm or slides through." }
  ],
  controls: [{ id: "ring", label: "Ring", value: "uncoupled", options: [["coupled", "Coupled"], ["uncoupled", "Uncoupled"]] }],
  readouts: [{ id: "d", label: "Driving" }, { id: "v", label: "Driven" }, { id: "r", label: "Ring" }],
  views: { "3d": [270, 110, 760], front: [0, 0, 820], side: [720, 60, 40] },
  target: [0, 40, -5],
  how: [
    "The driving arm turns all the time. Its pin sits in the slot of the ring, at the far end of the driven arm. With the slot lying along the arm, the pin leans on the side of the slot and pushes the arm round. Both arms turn together.",
    "Now turn the ring a quarter turn. The slot lies across the arm, in the same direction that the pin is travelling. The pin runs along the slot and out of the other end. The driven arm does not move, so the engine is uncoupled.",
    "Try Coupled and watch the driven arm pick up the pin and turn. Then try Uncoupled and watch it stop. The ring can only turn while the pin is inside it, so it waits for the pin to come round."
  ],
  note: "This model is rebuilt from Brown's drawing. The driving arm is not shown by Brown; a plain one was added. The shaft, the bearing, the stand, the disc under the ring and all the sizes were made up. Brown does not say how the ring is held, so it simply sits on the disc. The double guide lines on the ring are painted on. The ring is allowed to turn only while the pin is inside it.",

  K: { R: 190, RD: 40, WR: 10, H: 20, SLOTS: 2, PHI: Math.PI / 2 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, F = c.fixed;
    var o = this.o = { a: Math.PI / 2, b: Math.PI / 2, phi: K.PHI, vel: 0, turning: false, wait: false, last: Math.PI / 2 };
    var md = c.mat("drive"), mn = c.mat("driven"), mw = c.mat("wrist"), mr = c.mat("ring");

    // driven crank: group at the hub (origin), local +X along the arm
    o.drv = new T.Group(); scene.add(o.drv);
    P.at(P.cylZ(44, 9, mn), 0, 0, 4.5, o.drv);                                        // hub z 0..9
    P.at(P.cylZ(28, 60, mn), 0, 0, -30, o.drv);                                       // stub z -60..0, ends on the bearing face
    P.at(P.box(K.R, 24, 8, mn), K.R / 2, 0, 4, o.drv);                                // arm x 0..190, z 0..8
    P.at(P.cylZ(46, 8, mn), K.R, 0, 4, o.drv);                                        // disc under the ring, z 0..8
    P.at(P.cylZ(15, 1, c.mat("driven", "dark")), 0, 0, 9.5, o.drv);                   // hub mark z 9..10
    // slotted ring, sits on the disc, z 8..22
    o.ring = new T.Group(); o.ring.position.set(K.R, 0, 8); o.drv.add(o.ring);
    var a1 = Math.asin(K.H / K.RD), sx = Math.sqrt(K.RD * K.RD - K.H * K.H);
    [1, -1].forEach(function (s) {
      var sh = new T.Shape();
      sh.moveTo(sx, s * K.H);
      if (s > 0) sh.absarc(0, 0, K.RD, a1, Math.PI - a1, false); else sh.absarc(0, 0, K.RD, Math.PI + a1, 2 * Math.PI - a1, false);
      sh.lineTo(sx * (s > 0 ? -1 : 1), s * K.H); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false, curveSegments: 24 });
      o.ring.add(new T.Mesh(g, mr));                                                  // half ring z 8..22
      var radii = K.SLOTS === 2 ? [24, 31] : [28];
      radii.forEach(function (r) {
        var ar = P.arc(r, 1.2, 1.05, c.mat("ring", "dark"));
        ar.rotation.z = (s > 0 ? Math.PI / 2 : 1.5 * Math.PI) - 0.525;
        ar.position.z = 14.8; o.ring.add(ar);                                         // painted guide arc, centre 0.8 above the face
      });
    });
    // driving crank in front: arm z 25..29, boss z 24..30, shaft z 10..24, wrist pin z 10..24
    o.dr = new T.Group(); scene.add(o.dr);
    P.at(P.cylZ(16, 15, md), 0, 0, 17, o.dr);                                         // shaft z 9.5..24.5 (hub face at 9)
    P.at(P.cylZ(22, 6, md), 0, 0, 27, o.dr);                                          // boss z 24..30
    P.at(P.box(K.R, 12, 4, md), K.R / 2, 0, 27, o.dr);                                // arm z 25..29
    P.at(P.cylZ(K.WR + 3, 6, mw), K.R, 0, 27, o.dr);                                  // wrist boss z 24..30
    o.wr = P.at(P.cylZ(K.WR, 14, mw), K.R, 0, 17, o.dr);                              // wrist pin z 10..24, tip 2 above the disc
    // stand behind the hub; hub at origin
    P.at(P.box(130, 130, 20, F), 0, 0, -70, scene);                                   // bearing x -65..65, y -65..65, z -80..-60
    P.at(P.box(130, 14, 100, F), 0, -72, -60, scene);                                 // base x -65..65, y -79..-65, z -110..-10; bearing sits on it at y -65
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, R = K.R, s = K.H - K.WR, Q = 2 * Math.PI;
    var tgt = S.controls.ring === "uncoupled" ? Math.PI / 2 : 0;
    o.a += S.w * dt;
    function geom(b, a, phi) {
      var cx = R * Math.cos(b), cy = R * Math.sin(b), dx = R * Math.cos(a) - cx, dy = R * Math.sin(a) - cy, th = b + phi;
      return { dd: Math.sqrt(dx * dx + dy * dy), dn: -dx * Math.sin(th) + dy * Math.cos(th) };
    }
    function ok(b, a, phi) { var g = geom(b, a, phi); return Math.abs(g.dn) <= s || g.dd >= K.RD + K.WR; }
    // ring turning, only while the pin is inside it
    var g0 = geom(o.b, o.a, o.phi);
    if (!o.turning && Math.abs(o.phi - tgt) > 1e-6) {
      if (g0.dd < 16) { o.turning = true; o.wait = false; } else o.wait = true;
    }
    if (o.turning) {
      var dp = tgt - o.phi, mv = 3 * dt;
      if (Math.abs(dp) <= mv) { o.phi = tgt; o.turning = false; } else o.phi += dp > 0 ? mv : -mv;
    }
    // the pin pushes the arm only when it leans on the slot or on the ring
    if (!ok(o.b, o.a, o.phi)) {
      var st = 0.0009, done = false;
      for (var k = 1; k < 8000 && !done; k++) {
        var b1 = o.b + k * st, b2 = o.b - k * st;
        if (ok(b1, o.a, o.phi)) { o.b = b1; done = true; }
        else if (ok(b2, o.a, o.phi)) { o.b = b2; done = true; }
      }
    }
    o.drv.rotation.z = o.b; o.dr.rotation.z = o.a; o.ring.rotation.z = o.phi;
    if (dt > 1e-6) { var v = (o.b - o.last) / dt; o.vel += (v - o.vel) * Math.min(1, dt * 8); }
    o.last = o.b;
    if (Math.abs(o.vel) < 0.01) o.vel = 0;
    function f(w) { var v = Math.round(w * 600 / Q) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    S.set("d", f(S.w)); S.set("v", f(o.vel));
    S.set("r", o.turning ? "Turning" : o.wait ? "Waiting" : (Math.abs(o.phi) < 1e-6 ? "Coupled" : "Uncoupled"));
  }
});
