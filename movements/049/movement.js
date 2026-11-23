M507.define({
  number: 49,
  title: "Ratchets turning one way from a rocking shaft",
  lede: "A level shaft rocks back and forth, like a pump handle. Two ratchets turn that rocking into steady turning of an upright shaft. The upright shaft always turns the same way, whichever way the handle swings.",
  alt: "Two bevel gears face each other on a level shaft and both mesh with a bevel gear on an upright shaft above them. Outside each side gear is a ratchet wheel, and an arm on the shaft carries a pawl that rests on it. A handle hangs from the middle of the level shaft.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Rocking shaft", note: "The handle rocks this shaft one way, then the other. The two arms are fixed to it and swing with it." },
    { key: "gears", color: "#C8873A", name: "Side gears and ratchets", note: "Two gears that sit loose on the rocking shaft. Each has a wheel with slanted teeth fixed to it, called a ratchet wheel." },
    { key: "pawl", color: "#D9B13B", name: "Pawls", note: "A pawl is a finger that rests on the ratchet teeth. It pushes one way and slips the other way. Watch for the one that turns red: it is pushing." },
    { key: "top", color: "#4FA58A", name: "Driven shaft", note: "The upright shaft, turned by both side gears in turn. The dark pointer shows that it always goes the same way." }
  ],
  controls: [{ type: "range", id: "swing", label: "Swing of the handle", min: 10, max: 120, step: 5, value: 60, unit: "°",
    presets: [[15, "Tiny"], [40, "Small"], [90, "Wide"]] }],
  speed: { min: 5, max: 60, value: 20, label: "Rocking speed", unit: " a min" },
  readouts: [{ id: "in", label: "Handle" }, { id: "out", label: "Upright" }],
  views: { "3d": [400, 280, 920], front: [0, 30, 900], side: [900, 60, 120] },
  target: [0, 30, 0],
  how: [
    "The handle rocks the level shaft one way, then the other. Two sloping gears sit loose on that shaft, facing each other. Both fit into a third gear on the upright shaft. Each loose gear has a wheel with slanted teeth fixed to it, called a ratchet wheel.",
    "An arm at each end of the rocking shaft carries a finger called a pawl. When the shaft swings one way, one pawl catches a ratchet tooth and pushes its gear round. The other pawl slides up the slanted teeth and clicks over them. When the shaft swings back, the pawls swap jobs. The two gears sit on opposite sides of the upright gear, so both pushes turn it the same way.",
    "The pawl that is pushing turns red. After each change of direction there is a short wait while the pawl drops back onto a tooth. Try the Tiny swing. The pawls can no longer reach the next tooth, so the upright shaft stops. Then try Wide and compare."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows no handle, so one was added to rock the shaft. The frame, the bar that holds the top of the upright shaft, the disc with the dark pointer, the sizes and the numbers of teeth were made up. A real upright shaft would coast a little between pushes. Here it stops at once.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var RG = 100, NT = 24, RR = 58, RV = 80, PL = 45, ZR = 139;   // bevel pitch radius and teeth, ratchet tip radius, pawl pivot radius, pawl length, ratchet centre along the shaft
    var o = this.o = { psi: 0, phi: 0, th: 0, RV: RV, drive: 0, sides: [] };
    var ms = c.mat("shaft"), mg = c.mat("gears"), mt = c.mat("top");

    // upright gear and shaft: axis Y, pitch-cone apex at the origin, teeth facing down
    o.top = P.bevelGearCone({ radius: RG, teeth: NT, cone: 45, material: mt }); scene.add(o.top);
    var b1 = o.top.backY, L1 = 240 - b1;
    P.at(P.cylY(12, L1, mt), 0, b1 - 10 + L1 / 2, 0, o.top);           // upright shaft y b1-10..230, ends at the underside of the top bar
    P.at(P.cylY(26, 5, mt), 0, 195, 0, o.top);                          // disc y 192.5..197.5
    P.at(P.box(42, 5, 7, c.mat("top", "dark")), 23, 200, 0, o.top);    // pointer y 197.5..202.5, sits on the disc's top face

    // side gears: same apex, axes along the level shaft, teeth facing each other
    [1, -1].forEach(function (sg) {
      var outer = new T.Group(); outer.rotation.z = -sg * Math.PI / 2; scene.add(outer);   // local +Y points to world +X (right) or -X (left)
      var g = P.bevelGearCone({ radius: RG, teeth: NT, cone: 45, material: mg }); outer.add(g);
      o.sides.push({ sg: sg, gear: g });
    });
    o.gp = o.top.pitch;

    // F: a frame whose local Z is the level shaft (world X). Local Y is world Y, local X is world -Z. rotation.z here is a turn about the shaft.
    var F = new T.Group(); F.rotation.y = Math.PI / 2; scene.add(F);
    o.shaft = new T.Group(); F.add(o.shaft);
    P.at(P.cylZ(12, 340, ms), 0, 0, 0, o.shaft);                        // level shaft, world x -170..170, ends at the inner faces of the posts
    P.at(P.box(10, 150, 10, ms), 0, -75, 0, o.shaft);                   // handle y -150..0 at rest, hangs between the two gears
    P.at(P.sphere(12, c.mat("shaft", "dark")), 0, -150, 0, o.shaft);    // grip, lowest point y -162, clear of the base top at -170

    o.sides.forEach(function (s) {
      var sg = s.sg, dir = -sg;                                         // dir: which way round the nose lies from the pivot (right pawl -1, left pawl +1)
      // ratchet fixed to the gear: world x 128..150 (right), covers the gear's hub (x 129..149)
      s.rat = P.at(P.ratchet({ teeth: 16, radius: RR, depth: 7, width: 22, reverse: sg < 0, material: mg }), 0, 0, sg * ZR, F);
      // arm fixed on the shaft: world x 154..162, 4 clear of the ratchet and 8 clear of the post
      P.at(P.cylZ(20, 10, ms), 0, 0, sg * 158, o.shaft);                // boss x 153..163
      P.at(P.box(14, 96, 8, ms), 0, 44, sg * 158, o.shaft);             // arm, radius -4..92
      P.at(P.cylZ(4, 25, ms), 0, RV, sg * 142.5, o.shaft);                // pivot pin x 130..155, ends inside the arm
      s.pawl = P.at(P.pawl({ length: PL, thick: 7, width: 14, side: -dir, material: c.mat("pawl") }), 0, RV, sg * ZR, o.shaft);   // x 132..146, over the ratchet
      s.dir = dir; s.d0 = s.pawl.reach(RV, RR - 7);                     // angle from pivot to nose when the nose is down in a tooth
      s.u = dir * -.5 * s.rat.pitch;                                    // where the nose is on its ratchet: start half way along a tooth
      s.on = false;
    });

    // frame: two posts, a bar across the top, a base
    P.at(P.box(16, 416, 40, c.fixed), 178, 38, 0, scene);               // post x 170..186, y -170..246, z -20..20; level shaft ends at x 170
    P.at(P.box(16, 416, 40, c.fixed), -178, 38, 0, scene);              // post x -186..-170, y -170..246
    P.at(P.box(340, 16, 40, c.fixed), 0, 238, 0, scene);                // top bar x -170..170, y 230..246; meets the posts at x -170 and 170; upright shaft ends at y 230
    P.at(P.box(440, 12, 180, c.fixed), 0, -176, 0, scene);              // base x -220..220, y -182..-170, z -90..90; posts stand on y -170
    o.mPawl = c.mat("pawl"); o.mMark = c.mat("pawl", "mark");
  },

  step: function (c, dt, S) {
    var o = this.o, A = S.controls.swing * Math.PI / 360;               // half the full swing, in radians
    o.psi += S.w * dt;
    var phi = A * Math.sin(o.psi), dphi = phi - o.phi, dth = 0;
    o.phi = phi;
    // Each pawl may slide freely one way over its ratchet and is stopped by a tooth face the other way.
    // u is the angle of the nose round its ratchet. If the swing would carry the nose past a face, the ratchet (and so the gear) is pushed along instead.
    o.sides.forEach(function (s) {
      var st = s.rat.pitch, d = s.dir, v = -d * s.u;                    // v only ever grows when the pawl slips
      var face = Math.floor(v / st + 1e-9) * st, nv = v - d * dphi;
      if (nv < face) { dth = face - nv; s.on = true; } else if (dphi !== 0) s.on = false;
    });
    o.th += dth;
    o.top.rotation.y = o.th;
    o.sides.forEach(function (s) {
      var d = s.dir, i, r, del, u;
      s.u += dphi - d * dth;                                            // right ratchet turns by -th, left by +th
      s.gear.rotation.y = -o.th + o.gp / 2;                             // equal gears: same speed as the upright gear, half a tooth offset to mesh
      s.rat.rotation.z = Math.PI / 2 + phi + d * s.d0 - s.u;
      for (i = 0, del = s.d0; i < 3; i++) { u = s.u + d * (del - s.d0); r = s.rat.rimAt(u); del = s.pawl.reach(o.RV, r); }   // lift of the nose on the slope
      var a = Math.PI / 2 + d * del;
      s.pawl.rotation.z = Math.atan2(r * Math.sin(a) - o.RV, r * Math.cos(a));
      var m = s.on ? o.mMark : o.mPawl;
      s.pawl.children.forEach(function (ch) { ch.material = m; });
    });
    o.shaft.rotation.z = phi;
    var deg = Math.round(phi * 180 / Math.PI);
    S.set("in", (deg > 0 ? "+" : deg < 0 ? "−" : "") + Math.abs(deg) + "°");
    S.set("out", (o.th / (2 * Math.PI)).toFixed(2) + " turns");
  }
});
