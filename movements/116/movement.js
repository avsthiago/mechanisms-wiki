M507.define({
  number: 116,
  title: "Double rack instead of a crank",
  lede: "A frame slides back and forth in a straight line, like a drawer. Two toothed bars on the frame turn one shaft, and the shaft always spins the same way. It turns straight pushing and pulling into steady turning, the job a crank does.",
  alt: "A rectangular frame lies on a bed. A toothed bar runs along its front edge, below a shaft, and another toothed bar runs along its back edge, above the shaft. Two gears on the shaft mesh with the bars. Outside each gear a wheel with slanted teeth is fixed to the shaft, and a finger on the gear rests on it.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Sliding frame and racks", note: "A frame with a toothed bar on each long side, called a rack. One bar is below the shaft and the other above it, and they sit side by side in depth. Watch the red block on the frame." },
    { key: "pinion", color: "#C8873A", name: "Loose gears", note: "Two gears that sit loose on the shaft, one for each rack. They turn one way when the frame goes right and the other way when it goes left." },
    { key: "pawl", color: "#D9B13B", name: "Pawls", note: "A pawl is a finger on a gear that rests on the slanted teeth of the ratchet wheel beside it. It pushes one way and slips the other way. The one that turns red is pushing." },
    { key: "shaft", color: "#4FA58A", name: "Shaft and ratchet wheels", note: "The shaft has a ratchet wheel fixed to it at each end of the pair. Each one has slanted teeth. The red mark on the shaft end always goes round the same way." }
  ],
  controls: [{ type: "range", id: "stroke", label: "Length of the stroke", min: 40, max: 160, step: 10, value: 140, unit: " mm",
    presets: [[50, "Short"], [100, "Medium"], [160, "Long"]] }],
  speed: { min: 5, max: 40, value: 15, label: "Strokes", unit: " a min" },
  readouts: [{ id: "x", label: "Frame" }, { id: "t", label: "Shaft" }],
  views: { "3d": [500, 280, 720], front: [0, 0, 760], top: [0, 760, 40] },
  viewLabels: { "3d": "3D", front: "Front", top: "Top" },
  target: [0, 0, 0],
  distance: [250, 1400],
  how: [
    "The frame slides left and right. Its two toothed bars turn two gears on the shaft. Because one bar is below the shaft and the other above it, the gears always turn opposite ways. Each gear has a finger called a pawl that rests on a ratchet wheel, a wheel with slanted teeth. The ratchet wheel is fixed to the shaft.",
    "When the frame goes right, the front gear turns one way. Its pawl catches a tooth and pushes the shaft round. The back gear turns the other way, so its pawl slips over the teeth and clicks. When the frame goes left, the jobs swap. The back gear now pushes the shaft the same way as before. So the shaft never turns back.",
    "Watch the pawl that turns red. After each change of direction there is a short wait before the other pawl catches a tooth. Try the Short stroke, then the Long one, and compare how far the red mark on the shaft goes round with each stroke."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the oval frame with a rod at each end. The bed, the back plate, the red block, the dials on the shaft ends, the sizes and the numbers of teeth were made up. The gears are placed on opposite sides of the shaft so that they turn opposite ways, which is what lets both ratchet wheels turn the shaft the same way. A real shaft would coast a little between pushes. Here it stops at once.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var MD = 5, NP = 24, NR = 20, NRAT = 12;                      // module, pinion teeth, rack teeth, ratchet teeth
    var RP = NP * MD / 2, p = Math.PI * MD, L = NR * p;           // pinion pitch radius 60, rack length 314.2
    var RR = 40, DEP = 7, RV = 47, PL = 28, ZC = 22, ZR = 40;     // ratchet tip radius, tooth depth, pawl pivot radius, pawl length, pinion and ratchet centre z
    var o = this.o = { psi: 0, x: 0, th: 0, RP: RP, p: p, L: L, RV: RV, RR: RR, DEP: DEP, sides: [] };
    var mf = c.mat("frame"), mp = c.mat("pinion"), ms = c.mat("shaft");

    // frame: two racks and two end bars, all sliding in x
    var F = o.frame = new T.Group(); scene.add(F);
    var rf = P.rack({ teeth: NR, module: MD, side: 1, body: 16, thick: 16, material: mf });
    rf.rotation.z = Math.PI / 2; rf.position.set(L / 2, -RP, 22); F.add(rf);      // front rack: teeth up, pitch line y -60, root -66.25, back y -82.25, z 14..30, x -L/2..L/2
    var rb = P.rack({ teeth: NR, module: MD, side: 1, body: 16, thick: 16, material: mf });
    rb.rotation.z = -Math.PI / 2; rb.position.set(-L / 2, RP, -22); F.add(rb);     // back rack: teeth down, pitch line y 60, root 66.25, back y 82.25, z -30..-14
    // round ends: half rings z -30..30, outer radius 82.25, inner radius 66.25 (the rack roots), centred on the rack ends; their end faces (x = +-L/2, y 66.25..82.25 and -82.25..-66.25) are the racks' end faces
    [1, -1].forEach(function (s) {
      var sh = new T.Shape(), a0 = s > 0 ? -Math.PI / 2 : Math.PI / 2;
      sh.absarc(0, 0, 82.25, a0, a0 + Math.PI, false); sh.absarc(0, 0, 66.25, a0 + Math.PI, a0, true); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: 60, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, -30);
      var m = new T.Mesh(g, mf); m.position.x = s * L / 2; F.add(m);
      P.at(P.cylX(8, 40, mf), s * (L / 2 + 82.25 + 18), 0, 0, F);                // rod x L/2+80.25..L/2+120.25, starts just inside the ring's outer point
    });
    P.at(P.box(10, 2, 10, c.mat("frame", "mark")), 0, 83.25, -22, F);            // red block y 82.25..84.25, on the back rack's top face

    // shaft group (turns with the shaft): shaft, two dials with red marks
    var S0 = o.shaft = new T.Group(); scene.add(S0);
    P.at(P.cylZ(7, 113, ms), 0, 0, -3.5, S0);                                       // shaft z -60..53, starts at the back plate's face, ends in the front dial
    [1, -1].forEach(function (sg) {
      P.at(P.cylZ(16, 4, ms), 0, 0, sg * 51, S0);                                   // dial z 49..53 (or -53..-49)
      P.at(P.box(14, 4, 1, c.mat("shaft", "mark")), 10, 0, sg * 54, S0);            // red mark z 53.5..54.5, lifted .5 off the dial face
    });

    // the two sides: pinion (loose), ratchet (fixed to the shaft), pawl (on the pinion)
    var root = RR - DEP, del0 = Math.acos((RV * RV + root * root - PL * PL) / (2 * RV * root));
    [1, -1].forEach(function (sg) {
      var s = { sg: sg, on: false };
      var g = s.pin = new T.Group(); g.position.z = sg * ZC; scene.add(g);
      P.at(P.spurGear({ teeth: NP, module: MD, width: 14, material: mp }), 0, 0, 0, g);          // pinion z 15..29 (sg 1), pitch radius 60
      P.at(P.box(4, 10, 1, c.mat("pinion", "dark")), 0, 59, sg * 7.5, g);                         // dark stripe z 7..8 local, 1 off the outer face
      s.beta = -del0;
      var px = RV * Math.cos(s.beta), py = RV * Math.sin(s.beta);
      P.at(P.cylZ(3.5, 12, mp), px, py, sg * 13, g);                                              // pin z 29..41, from the pinion face into the pawl
      s.pawl = P.at(P.pawl({ length: PL, thick: 7, width: 8, side: -1, material: c.mat("pawl") }), px, py, sg * (ZR - ZC), g);   // pawl z 36..44
      s.rat = P.at(P.ratchet({ teeth: NRAT, radius: RR, depth: DEP, width: 14, reverse: true, material: ms }), 0, 0, sg * ZR, scene);   // ratchet z 33..47
      o.sides.push(s);
      s.nu = -.5 * s.rat.pitch;                                                                   // nose starts half way along a tooth
    });
    o.mPawl = c.mat("pawl"); o.mMark = c.mat("pawl", "mark");

    // supports: bed, rail under the frame, two posts
    P.at(P.box(580, 8, 160, c.fixed), 0, -98, 0, scene);                            // base x -290..290, y -102..-94, z -80..80
    P.at(P.box(524, 11.75, 64, c.fixed), 0, -88.125, 0, scene);                     // rail x -262..262, y -94..-82.25, z -32..32; the frame's underside rests on y -82.25
    P.at(P.box(160, 190, 12, c.fixed), 0, 1, -66, scene);                           // back plate x -80..80, y -94..96, z -72..-60; stands on the base top y -94; shaft ends at z -60
  },

  step: function (c, dt, S) {
    var o = this.o, A = S.controls.stroke / 2, x, dx, dth = 0, i;
    o.psi += S.w * dt;
    x = A * Math.sin(o.psi); dx = x - o.x; o.x = x;
    o.frame.position.x = x;
    var dphi = [dx / o.RP, -dx / o.RP], phi = [x / o.RP - Math.PI / 2, Math.PI / 2 - x / o.RP], need = [0, 0];
    // Each pawl may slide freely one way over its ratchet and is stopped by a tooth face the other way.
    // nu is where the pawl's nose is on its ratchet. The nose cannot pass the next face above it; if the gear tries, the shaft is pushed along.
    for (i = 0; i < 2; i++) {
      var s = o.sides[i], st = s.rat.pitch, f = Math.ceil(s.nu / st - 1e-9) * st, nn = s.nu + dphi[i];
      if (nn > f) need[i] = nn - f;
      if (need[i] > dth) dth = need[i];
    }
    o.th += dth;
    for (i = 0; i < 2; i++) {
      var s2 = o.sides[i], r, del, a;
      s2.nu += dphi[i] - dth;
      s2.on = dth > 1e-9 && need[i] >= dth - 1e-9;
      s2.pin.rotation.z = phi[i];
      r = s2.rat.rimAt(s2.nu); del = s2.pawl.reach(o.RV, r);                          // the nose rides up the slope
      s2.rat.rotation.z = phi[i] + s2.beta + del - s2.nu;
      a = s2.beta + del;
      s2.pawl.rotation.z = Math.atan2(r * Math.sin(a) - o.RV * Math.sin(s2.beta), r * Math.cos(a) - o.RV * Math.cos(s2.beta));
      var m = s2.on ? o.mMark : o.mPawl;
      s2.pawl.children.forEach(function (ch) { ch.material = m; });
    }
    o.shaft.rotation.z = o.th;
    var mm = Math.round(x);
    S.set("x", (mm > 0 ? "+" : mm < 0 ? "−" : "") + Math.abs(mm) + " mm");
    S.set("t", (o.th / (2 * Math.PI)).toFixed(1) + " turns");
  }
});
