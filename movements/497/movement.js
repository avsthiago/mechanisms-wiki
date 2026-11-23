M507.define({
  number: 497,
  title: "Fan blower",
  lede: "A fan spins inside a snail-shaped case. Air is drawn in through round holes in the middle and pushed out of the spout. Blowers like this fed air to forges and furnaces.",
  alt: "A spiral casing with a spout at the bottom right. Inside, three curved blades turn on a shaft. Dots show air coming in at the centre, going round the casing and out of the spout.",
  _hint: "Drag to look around. Pinch or scroll to zoom. The front of the casing is left off so you can see in.",
  parts: [
    { key: "blades", color: "#C8873A", name: "Fan blades", note: "Three curved blades fixed to the hub. They carry the air round and fling it outwards." },
    { key: "casing", color: "#4FA58A", name: "Casing", note: "A snail-shaped case that gets wider as it goes round and ends in the spout. Its front side, with a round opening like the back, is left off here." },
    { key: "shaft", color: "#5E7387", name: "Shaft and hub", note: "Turned by a belt or an engine. It carries the blades. Watch the red stripe on the hub." }
  ],
  closed: { label: "Case" },
  readouts: [{ id: "r", label: "Fan" }, { id: "t", label: "Blade tips" }],
  views: { "3d": [230, 110, 960], front: [45, -5, 990], side: [990, 20, 150] },
  target: [45, -5, 0],
  distance: [380, 2400],
  how: [
    "The blades spin inside a snail-shaped case. Air between the blades is carried round with them and flung outwards to the edge, the way mud is flung off a spinning wheel.",
    "As the air is flung out, the middle is left short of air. Fresh air rushes in through the round openings in the sides to fill the gap. Watch the dots come in at the centre and spiral out.",
    "The case gets wider as it goes round, so there is room for more and more air. It all gathers at the spout and is squeezed out. Try a faster speed and watch the air leave faster. Choose Closed to see the blower as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front side of the casing is left off so you can see in, as in the drawing. The stand, the bearing and the sizes were made up. The air follows a simple rule, not a full model of the flow.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { rot: 0, N: 260, d: [], TH: -0.541, PE: 5.253, blades: [0, 2.094, 4.189].map(function (b) { return b + Math.PI; }) };
    o.rw = function (psi) { return 172 + 28 * Math.min(1, psi / o.PE); };          // casing radius, from the tongue round to the bottom
    o.fb = function (r) { return -.6 * Math.pow(Math.max(0, r - 30) / 135, 1.6); }; // blade angle at radius r: tips lean back
    var mc = c.mat("casing"), vol = [], out = [], ang;
    for (i = 0; i <= 60; i++) { var ps = o.PE * i / 60; ang = o.TH + ps; vol.push([o.rw(ps) * Math.cos(ang), o.rw(ps) * Math.sin(ang)]); }
    var wall = vol.concat([[100, -200], [200, -200], [290, -200]]);
    scene.add(P.curvedVane({ path: wall, thickness: 4, depth: 120, z0: -60, material: mc }));                     // wall z -60..60
    var tx = vol[0][0], ty = vol[0][1];
    scene.add(P.curvedVane({ path: [[tx, ty], [200, ty], [290, ty]], thickness: 4, depth: 120, z0: -60, material: mc }));
    var hole = []; for (i = 0; i < 48; i++) hole.push([75 * Math.cos(i * Math.PI / 24), 75 * Math.sin(i * Math.PI / 24)]);
    scene.add(P.outlinePlate({ points: [[290, ty]].concat(vol, [[290, -200]]), holes: [hole], depth: 3, z0: -63, material: mc }));   // back z -63..-60
    scene.add(c.shell(P.outlinePlate({ points: [[290, ty]].concat(vol, [[290, -200]]), holes: [hole], depth: 3, z0: 60, material: mc }), "closed"));   // closed view: the front, z 60..63
    P.at(P.box(8, 138, 126, mc), 294, -145, 0, scene);                             // flange x 290..298, y -214..-76, z -63..63
    // rotor
    o.rotor = new T.Group(); scene.add(o.rotor);
    var msh = c.mat("shaft");
    P.at(P.cylZ(14, 220, msh), 0, 0, -40, o.rotor);                                // shaft z -150..70, starts at the bearing face
    P.at(P.cylZ(34, 110, msh), 0, 0, 0, o.rotor);                                  // hub z -55..55
    P.at(P.box(18, 5, 1, c.mat("shaft", "mark")), 24, 0, 55.8, o.rotor);           // stripe z 55.3..56.3 on the hub face
    o.blades.forEach(function (b) {
      var path = []; for (k = 0; k <= 16; k++) { var r = 30 + 135 * k / 16, a = b + o.fb(r); path.push([r * Math.cos(a), r * Math.sin(a)]); }
      o.rotor.add(P.curvedVane({ path: path, thickness: 5, depth: 108, z0: -54, material: c.mat("blades") }));     // blades z -54..54
    });
    // stand: base y -214..-202 (top = bottom of the casing wall), bearing x -25..25, y -202..25, z -175..-150
    P.at(P.box(510, 12, 260, c.fixed), 25, -208, -50, scene);                      // x -230..280
    P.at(P.box(50, 227, 25, c.fixed), 0, -88.5, -162.5, scene);
    o.dots = P.waterDots(o.N, { radius: 2.6, color: c.spot, opacity: .85 }); scene.add(o.dots);
    for (i = 0; i < o.N; i++) { var d = { ph: 0 }; this.spawn(d); d.z = d.side * (50 + (d.z0 - 50) * Math.random()); o.d.push(d); }
  },

  spawn: function (d) {
    d.ph = 0; d.side = Math.random() < .5 ? 1 : -1; d.z0 = d.side > 0 ? 170 : 145; d.z = d.side * d.z0;   // the back ones start clear of the bearing
    d.r = 38 + 32 * Math.sqrt(Math.random()); d.a = 2 * Math.PI * Math.random(); d.zt = -50 + 100 * Math.random();
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w, u = w * 165, i, j;
    o.rot += w * dt; o.rotor.rotation.z = o.rot;                                   // anticlockwise seen from the front
    for (i = 0; i < o.N; i++) {
      var d = o.d[i], x, y, s = 1;
      if (d.ph === 0) {                                                             // drawn in through a side opening
        d.z -= d.side * .5 * u * dt; s = Math.min(1, (d.z0 - Math.abs(d.z)) / 30);
        if (Math.abs(d.z) < 50) {
          d.ph = 1; var rel = d.a - o.rot - o.fb(d.r);
          for (j = 0; j < 3; j++) {                                                 // keep clear of the blades
            var g = Math.atan2(Math.sin(rel - o.blades[j]), Math.cos(rel - o.blades[j]));
            if (Math.abs(g) < .15) rel = o.blades[j] + (g < 0 ? -.15 : .15);
          }
          d.c = rel;
        }
        x = d.r * Math.cos(d.a); y = d.r * Math.sin(d.a);
      } else if (d.ph === 1) {                                                      // carried round between two blades and flung out
        d.r += .35 * u * dt; d.z += (d.zt - d.z) * Math.min(1, 2 * dt);
        d.a = o.rot + d.c + o.fb(Math.min(d.r, 165));
        if (d.r >= 168) { d.ph = 2; d.psi = ((d.a - o.TH) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); }
        x = d.r * Math.cos(d.a); y = d.r * Math.sin(d.a);
      } else if (d.ph === 2) {                                                      // round the casing to the spout
        d.psi += .6 * u / d.r * dt;
        d.r = Math.min(Math.max(168, d.r + 10 * dt * (w > 0 ? 1 : 0)), o.rw(d.psi) - 6);
        var a2 = o.TH + d.psi; x = d.r * Math.cos(a2); y = d.r * Math.sin(a2);
        if (d.psi >= o.PE) { d.ph = 3; d.x = x; d.y = Math.max(-195, Math.min(-94, y)); d.yt = -190 + 92 * Math.random(); }
      }
      if (d.ph === 3) {                                                             // out of the spout
        d.x += .6 * u * dt; d.y += (d.yt - d.y) * Math.min(1, .02 * u * dt); x = d.x; y = d.y; s = Math.min(1, (330 - d.x) / 30);
        if (d.x > 330) { this.spawn(d); s = 0; }
      }
      o.dots.put(i, x, y, d.z, Math.max(0, s));
    }
    o.dots.flush();
    S.set("r", (w * 30 / Math.PI).toFixed(0) + " rpm");
    S.set("t", (u / 10).toFixed(0) + " cm/s");
  }
});
