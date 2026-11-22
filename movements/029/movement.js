M507.define({
  number: 29,
  title: "Spiral disc wheel",
  lede: "A disc with a raised spiral on its face turns a gear on a shaft at right angles to it. Each turn of the disc moves the gear on by just one tooth. It is a simple way to make a fast shaft drive a very slow one.",
  alt: "A big upright disc with a raised spiral rib on its front face. A gear on an upright shaft stands in front of the disc on the right, with its lower teeth sitting in the spiral.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "The driving wheel. It turns on a shaft that points straight at you." },
    { key: "thread", color: "#8E7AA8", name: "Spiral thread", note: "A raised rib that winds out from the middle. Where it passes the gear, it creeps outward as the disc turns, and pushes a tooth along." },
    { key: "gear", color: "#C8873A", name: "Gear", note: "An ordinary gear. One of its teeth sits in the spiral. Watch the red tooth move on one step per turn of the disc." },
    { key: "shaft", color: "#4FA58A", name: "Driven shaft", note: "The slow shaft that the gear turns. It stands upright, at right angles to the disc's shaft." }
  ],
  controls: [{ id: "n", label: "Gear size", value: "20", options: [["12", "Small"], ["20", "Middle"], ["30", "Big"]] }],
  readouts: [{ id: "d", label: "Disc" }, { id: "g", label: "Gear" }],
  views: { "3d": [250, 270, 540], front: [0, 0, 760], side: [760, 30, 40] },
  target: [20, -10, 20],
  how: [
    "Watch the place where the spiral passes under the gear. As the disc turns, the rib there slides outward, away from the middle. It pushes the tooth in front of it, so the gear turns slowly.",
    "The rib is a spiral, so in one turn of the disc it moves out by the gap between two turns. That gap is the same as the gap between two teeth. So one turn of the disc moves the gear on by one tooth. When the rib reaches its outer end, its inner end has already come round to catch the next tooth.",
    "A gear with more teeth needs more turns of the disc to go all the way round. Try the small gear, then the big one. Compare how many disc turns each one needs for one gear turn."
  ],
  note: "This model is rebuilt from Brown's drawing. As in the drawing, the spiral makes a little over one turn, so its two ends overlap where one tooth is handed on to the next. The stand, the bearings, the sizes and the number of teeth were made up. Brown shows one gear; the other two sizes were added for comparison.",

  build: function (c) {
    var P = c.P, T = c.THREE || THREE, scene = c.scene, o = this.o = { a: Math.PI / 2 };
    var MD = 5, PITCH = Math.PI * MD, ZP = 1.1 * MD, H = 2.1 * MD;        // tooth size, pitch line and rib top above the disc face
    o.a0 = o.a; o.XG = 88;                                               // gear centre sits over the middle of the spiral's travel
    var r0 = o.XG - PITCH / 2;                                           // spiral runs r0 .. r0 + pitch, plus the overlap

    // disc, turning about Z; front face at z = 0, back at z = -10
    o.disc = new T.Group(); scene.add(o.disc);
    P.at(P.cylZ(120, 10, c.mat("disc")), 0, 0, -5, o.disc);                       // z -10 .. 0
    P.at(P.cylZ(15, 7.5, c.mat("disc")), 0, 0, 3.25, o.disc);                     // hub, z -0.5 .. 7 (sunk 0.5 into the disc)
    P.at(P.cylZ(8, 47.5, c.mat("disc", "dark")), 0, 0, -16.25, o.disc);           // shaft, z -40 (post face) .. 7.5
    var rib = P.spiralRib({ r0: r0, pitch: PITCH, from: 0, to: 2 * Math.PI + 40 * Math.PI / 180, width: .26 * PITCH, height: H + .5, material: c.mat("thread") });
    P.at(rib, 0, 0, -.5, o.disc);                                                  // rib z -0.5 .. H, sunk 0.5 into the face

    // stand: base top y = -140; disc post y -140 .. 16, z -64 .. -40 (front face meets the shaft end)
    P.at(P.box(290, 10, 180, c.fixed), 0, -145, 15, scene);                       // base x -145 .. 145, y -150 .. -140, z -75 .. 105
    P.at(P.box(40, 156, 24, c.fixed), 0, -62, -52, scene);                        // post x -20 .. 20, y -140 .. 16, z -64 .. -40

    // three gears of different sizes, one shown at a time; each with its shaft and a tall bearing block
    o.sets = {};
    [12, 20, 30].forEach(function (N) {
      var s = new T.Group(), g = P.spurGear({ teeth: N, module: MD, width: 16, material: c.mat("gear") }), rp = g.pitchRadius, zc = ZP + rp;
      var tilt = new T.Group(); tilt.rotation.x = -Math.PI / 2; tilt.position.set(o.XG, 0, zc); s.add(tilt);   // gear axis along world Y; local +Y points at the disc
      var spin = new T.Group(); tilt.add(spin); spin.add(g);
      [-1, 1].forEach(function (k) { P.at(P.box(2 * MD, .2 * PITCH, 1, c.mat("gear", "mark")), rp, 0, k * 9, spin); });   // red tooth marks, 0.5 off each face (faces at z ±8)
      P.at(P.cylY(9, 24, c.mat("gear")), 0, 0, 0, tilt).rotation.x = Math.PI / 2;  // boss through the gear
      P.at(P.cylY(5, 170, c.mat("shaft")), o.XG, 25, zc, s);                       // shaft y -60 (block top) .. 110
      P.at(P.box(24, 80, 24, c.fixed), o.XG, -100, zc, s);                         // bearing block y -140 .. -60, sits on the base
      s.spin = spin; s.N = N; s.visible = false; scene.add(s); o.sets[N] = s;
    });
  },

  step: function (c, dt, S) {
    var o = this.o, N = +S.controls.n, a, k;
    o.a += S.w * dt; a = o.a;
    o.disc.rotation.z = -a;                                   // clockwise seen from the front: the rib at the gear moves outward
    for (k in o.sets) {
      var s = o.sets[k]; s.visible = +k === N;
      s.spin.rotation.z = Math.PI / 2 - a / s.N;              // rack-like drive: rib moves pitch per turn, gear turns one tooth
    }
    var turns = (a - o.a0) / (2 * Math.PI);
    S.set("d", turns.toFixed(1) + " turns");
    S.set("g", (turns / N).toFixed(2) + " turns");
  }
});
