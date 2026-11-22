M507.define({
  number: 79,
  title: "Two pawls on rocking arms",
  lede: "A rod slides back and forth, and a toothed wheel turns round one way without stopping for long. Two arms share the work. One pushes the wheel while the other goes back for a fresh grip.",
  alt: "A big wheel with a ring of slanted teeth on its front face. Two arms swing on the wheel's shaft, one above and one below. Each arm carries a small finger that rests on the teeth. Two connecting rods join the arm ends to a sliding rod on the right.",
  parts: [
    { key: "rod", color: "#5E7387", name: "Sliding rod", note: "Slides left and right between two rollers. Its end joins both connecting rods." },
    { key: "wheel", color: "#C8873A", name: "Ratchet wheel", note: "Its teeth stand up from its front face, each a slope with a steep back. Watch the red stripe: it only ever turns one way." },
    { key: "pawl", color: "#D9B13B", name: "Pawls", note: "A pawl is a small finger that rests on the teeth. It pushes against a steep face one way and slides up the slopes the other way. It turns red while it pushes." },
    { key: "arms", color: "#4FA58A", name: "Swinging arms", note: "Two arms that swing loose on the wheel's shaft. Each carries one pawl near its end." },
    { key: "links", color: "#8E7AA8", name: "Connecting rods", note: "Join the rod to the arm ends. When the rod moves right they pull the arms together. When it moves left they push them apart." }
  ],
  controls: [{ type: "range", id: "stroke", label: "Travel of the rod", min: 10, max: 80, step: 2, value: 60, unit: " mm",
    presets: [[12, "Tiny"], [36, "Short"], [80, "Long"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Rod speed", unit: " a min" },
  readouts: [{ id: "in", label: "Rod" }, { id: "out", label: "Wheel" }],
  views: { "3d": [380, 200, 640], front: [130, 0, 760], side: [820, 60, 40] },
  target: [130, 0, 0],
  how: [
    "The rod slides right. Both connecting rods pull on the arm ends. The upper arm swings down and the lower arm swings up. The upper pawl catches a steep tooth face and pushes the wheel round. The lower pawl slides back up the slopes and clicks over them.",
    "Then the rod slides left. Now the arms swing apart. The lower pawl catches a tooth and pushes, and the upper pawl slides back. So each pawl pushes on one stroke and rests on the other. The wheel turns the same way all the time, with only a short pause when the rod turns round.",
    "Watch which pawl turns red. Try Tiny. The arms swing less than one tooth, so the pawls never reach a new tooth and the wheel stays still. Then try Short and Long, and count the teeth that pass on each stroke."
  ],
  note: "This model is rebuilt from Brown's drawing. The rollers that guide the rod, the upright plate, the stand, the shape of the pawls and the number of teeth were made up. A real wheel would coast a little between pushes. Here it stops at once.",

  init: function (o) {
    var K = o.K = { RA: 145, LK: 187, XB0: 254, RM: 109, ST: 2 * Math.PI / 32, D: 6, BASE: 2, ZP: 15, L: 26 };
    K.b0 = Math.asin((K.ZP - K.BASE) / K.L); K.bd = Math.asin((K.ZP - K.BASE - K.D) / K.L);    // pawl tilt with its nose at a root, at a tip
    K.d0 = K.L * Math.cos(K.b0) / K.RM; K.dd = K.L * Math.cos(K.bd) / K.RM;                     // how far ahead of the pivot the nose lies, as an angle round the wheel
    o.th = 0; o.psi = 0; o.S = null; o.ready = false;
    o.pw = [{ sg: 1 }, { sg: -1 }];                                                             // top arm, bottom arm
  },
  // Height of the tooth face at a wheel angle (same as the faceRatchet helper).
  face: function (K, a) { var f = a / K.ST + 1e-9; f -= Math.floor(f); return K.BASE + K.D * f; },
  // Move the rod end to xB and work out the arms, the wheel and the pawls. The wheel turns clockwise by th.
  advance: function (o, xB) {
    var K = o.K, self = this, al = Math.acos((K.RA * K.RA + xB * xB - K.LK * K.LK) / (2 * K.RA * xB));
    o.xB = xB; o.al = al;
    o.pw.forEach(function (p) { p.prev = p.a; p.a = p.sg * al; });                              // arm angle, anticlockwise from level
    if (!o.ready) { o.pw.forEach(function (p) { p.g = Math.floor((p.a + o.th - K.d0) / K.ST); }); o.ready = true; }
    // A pawl's nose lies in the gap between the steep faces at g*ST and (g+1)*ST (wheel angles); the nose leads its pivot clockwise.
    // If the arm swings clockwise far enough to carry the nose past the steep face at g*ST, the wheel is pushed along instead.
    var pusher = null;
    o.pw.forEach(function (p) { var need = p.g * K.ST + K.d0 - p.a; if (need > o.th + 1e-12) { o.th = need; pusher = p; } });
    o.pw.forEach(function (p) {
      if (pusher === p) p.push = true; else if (p.a !== p.prev) p.push = false;                // stays red until its arm moves without pushing
      var ap = p.a + o.th, an, b = K.b0, i;
      while (ap - K.dd > (p.g + 1) * K.ST) p.g++;                                                // nose slid back over the top of a tooth into the next gap
      for (i = 0; i < 6; i++) {
        an = Math.min((p.g + 1) * K.ST - 1e-6, Math.max(p.g * K.ST + 1e-6, ap - K.L * Math.cos(b) / K.RM));
        b = Math.asin((K.ZP - self.face(K, an)) / K.L);
      }
      p.an = an; p.b = b;
    });
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o = {};
    this.init(o);
    var K = o.K, mw = c.mat("wheel"), ma = c.mat("arms"), ml = c.mat("links"), mr = c.mat("rod"), dk = c.mat("arms", "dark");
    // wheel, turning on a shaft that starts at the plate face z -30
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylZ(122, 10, mw), 0, 0, -5, o.wheel);                                     // disc z -10..0
    P.at(P.faceRatchet({ teeth: 32, rIn: 97, rOut: 120, depth: K.D, base: K.BASE, material: mw }), 0, 0, 0, o.wheel);   // ring z 0..8, back on the disc face
    P.at(P.cylZ(8, 76, mw), 0, 0, 8, o.wheel);                                        // shaft z -30..46
    P.at(P.cylZ(18, 10, mw), 0, 0, -15, o.wheel);                                     // back hub z -20..-10
    P.at(P.cylZ(18, 20, mw), 0, 0, 10, o.wheel);                                      // front hub z 0..20
    P.at(P.cylZ(12, 6, mw), 0, 0, 43, o.wheel);                                       // collar z 40..46, in front of the bottom arm
    P.at(P.box(70, 6, 1, c.mat("wheel", "mark")), 57, 0, 1, o.wheel);    // red stripe r 22..92, z 0.5..1.5, lifted off the disc face
    // arms: loose on the shaft. Top arm z 22..30, bottom arm z 32..40. Each pawl hangs from two lugs; its pivot is at z 15.
    o.pw.forEach(function (p, k) {
      var z0 = k ? 32 : 22, zc = z0 + 4;
      p.arm = new T.Group(); scene.add(p.arm);
      P.at(P.cylZ(18, 8, ma), 0, 0, zc, p.arm);                                       // boss
      P.at(P.box(K.RA - 12, 12, 8, ma), 12 + (K.RA - 12) / 2 - 6, 0, zc, p.arm);      // bar r 6..139 (meets the boss and the eye)
      P.at(P.cylZ(9, 8, ma), K.RA, 0, zc, p.arm);                                     // eye at the arm end
      var lh = z0 - 11;                                                               // lugs z 11..z0, clear of the tooth tips at z 8
      P.at(P.box(3, 12, lh, ma), K.RM - 7.5, 0, 11 + lh / 2, p.arm);                  // inner lug r 100..103
      P.at(P.box(3, 12, lh, ma), K.RM + 7.5, 0, 11 + lh / 2, p.arm);                  // outer lug r 115..118
      P.at(P.cylX(2, 17, dk), K.RM, 0, K.ZP, p.arm);                                  // pawl pin r 100..118
      P.at(P.cylZ(3, k ? 16.5 : 15.5, dk), K.RA, 0, k ? 39.75 : 29.25, p.arm);                // link pin: top z 22..37, bottom z 32..48
      var po = P.frame(new T.Group(), new T.Vector3(0, -1, 0), new T.Vector3(0, 0, 1)); // reach clockwise, body away from the wheel
      P.at(po, K.RM, 0, K.ZP, p.arm);
      p.pawl = P.pawl({ length: K.L, thick: 5, width: 10, side: 1, material: c.mat("pawl") }); po.add(p.pawl);
      p.link = P.rod(3, ml); scene.add(p.link); p.lz = k ? 44 : 33.5;
      p.e1 = P.cylZ(6, 6, ml); scene.add(p.e1); p.e2 = P.cylZ(6, 6, ml); scene.add(p.e2);
    });
    // rod: a block at the joint, then a round rod to the right. Block z 30..48, rod centre z 39.
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.box(18, 18, 18, mr), 0, 0, 39, o.rod);                                     // block x -9..9
    P.at(P.cylZ(3, 20, c.mat("rod", "dark")), 0, 0, 39, o.rod);                       // joint pin z 29..49
    P.at(P.cylX(5, 120, mr), 69, 0, 39, o.rod);                                       // rod x 9..129 from the joint
    P.at(P.box(10, 16, 16, mr), 134, 0, 39, o.rod);                                   // end x 129..139
    // supports
    P.at(P.box(510, 300, 10, c.fixed), 105, 0, -35, scene);                           // plate x -150..360, y -150..150, z -40..-30; shaft ends at z -30
    P.at(P.box(550, 12, 100, c.fixed), 105, -156, -30, scene);                        // base x -170..380, y -162..-150, z -80..20; plate stands on y -150
    P.at(P.box(20, 40, 61, c.fixed), 320, 0, 0.5, scene);                             // roller post x 310..330, y -20..20, z -30..31, on the plate face
    P.at(P.cylZ(6, 16, c.fixed), 320, 11, 39, scene);                                 // rollers z 31..47 on the post face; they touch the rod (radius 5) at y 5 and -5
    P.at(P.cylZ(6, 16, c.fixed), 320, -11, 39, scene);
    o.mPawl = c.mat("pawl"); o.mMark = c.mat("pawl", "mark");
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, half = S.controls.stroke / 2;
    o.S = o.S === null ? half : o.S + (half - o.S) * Math.min(1, dt * 5);
    o.psi += S.w * dt;
    var xB = K.XB0 + o.S * Math.sin(o.psi);
    this.advance(o, xB);
    o.wheel.rotation.z = -o.th;
    o.rod.position.set(xB, 0, 0);
    o.pw.forEach(function (p) {
      p.arm.rotation.z = p.a;
      p.pawl.rotation.z = -p.b;
      var m = p.push ? o.mMark : o.mPawl;
      p.pawl.children.forEach(function (ch) { ch.material = m; });
      var ex = K.RA * Math.cos(p.a), ey = K.RA * Math.sin(p.a);
      p.link.span(ex, ey, p.lz, xB, 0, p.lz);
      p.e1.position.set(ex, ey, p.lz); p.e2.position.set(xB, 0, p.lz);
    });
    var mm = Math.round(xB - K.XB0);
    S.set("in", (mm > 0 ? "+" : mm < 0 ? "−" : "") + Math.abs(mm) + " mm");
    S.set("out", (o.th / (2 * Math.PI)).toFixed(2) + " turns");
  }
});
