M507.define({
  number: 351,
  title: "Stamp with a part-toothed pinion",
  lede: "A small gear, called a pinion, with teeth on only part of its rim lifts an upright rod that has a row of teeth. When the last tooth lets go, the rod drops by its own weight and hits the base. Then the gear comes round and lifts it again.",
  alt: "An upright rod with a row of gear teeth on its right side, held by two guides, with a heavy six-sided head at its foot above a base. On the right is a gear with teeth on only part of its rim, meshing with the rod's teeth.",
  parts: [
    { key: "gear", color: "#5E7387", name: "Driving gear", note: "A pinion with teeth on only part of its rim. It turns all the time. Watch the red stripe to count its turns." },
    { key: "rod", color: "#C8873A", name: "Stamp rod", note: "The upright rod with a row of teeth, called a rack. It slides up and down in two guides. Watch it rise slowly and drop fast." },
    { key: "head", color: "#8E7AA8", name: "Stamp head", note: "The heavy foot of the rod. It does the pounding when the rod falls." },
    { key: "anvil", color: "#4FA58A", name: "Base block", note: "The block the head falls onto. It does not move." }
  ],
  controls: [{ id: "k", label: "Teeth on the gear", value: "7", options: [["3", "3 teeth"], ["5", "5 teeth"], ["7", "7 teeth"]] }],
  readouts: [{ id: "h", label: "Rod raised" }, { id: "n", label: "Blows" }],
  views: { "3d": [230, 20, 880], front: [-20, -10, 800], side: [800, -10, 0] },
  target: [-20, -30, 0],
  distance: [320, 2200],
  how: [
    "The gear turns steadily. While its teeth pass the rod, they hook into the rod's teeth and push the rod up. The rod rises at the same speed as the rim of the gear.",
    "Then the last tooth lets go. The smooth part of the rim cannot hold the rod, so nothing holds it up. It drops by its own weight and the head hits the base. It rests there until the first tooth comes round again and drops into the same gap.",
    "The more teeth the gear has, the higher the rod goes and the harder the blow. Try 3 teeth, then 7, and watch how far the rod falls."
  ],
  note: "This model is rebuilt from Brown's drawing. The two guides, the back plate, the base and the sizes were made up. The head is shown six-sided as in the drawing. The rod falls only under its own weight, as in the book, with no spring. The choice of 3 or 5 teeth was added for comparison.",

  // Gear: module 5, 24 teeth, pitch radius 60, centre at the origin, turning clockwise seen from the front.
  // Toothed arc ends at tooth 14 (210 degrees); the first tooth is 15 - k. Rack pitch line x = -60.
  K: function () {
    var MD = 5, N = 24, rp = 60, ra = 65, p = Math.PI * MD, st = 2 * Math.PI / N;
    var dm = Math.acos((rp - .7 * MD) / ra);
    return { MD: MD, N: N, rp: rp, p: p, st: st, dm: dm, I1: 14, XR: -60 - 1.25 * MD - 8 };
  },
  // Lift while in mesh, or -1 when the gear's teeth are clear of the rack. phi: clockwise gear angle.
  drive: function (K, k, phi) {
    var fa = (15 - k) * K.st - Math.PI - K.dm, span = (k - 1) * K.st + 2 * K.dm + .15 * K.st;
    var ph = phi - fa; ph -= 2 * Math.PI * Math.floor(ph / (2 * Math.PI));
    return ph <= span ? K.rp * ph : -1;
  },
  // Free fall under gravity (units per second squared); returns true when the head lands.
  fall: function (o, dt) {
    var n = 8, h = dt / n, landed = false;
    for (var i = 0; i < n; i++) {
      o.v -= 2200 * h;
      o.y += o.v * h;
      if (o.y <= 0) { if (o.v < -60) landed = true; o.y = 0; o.v = 0; }
    }
    return landed;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K();
    var o = this.o = { K: K, phi: 0, y: 0, v: 0, blows: 0, racks: {}, was: false };
    // gear and shaft: gear z -8..8, hub z 8..12, shaft z -30 (plate face) .. 8
    o.gearG = new T.Group(); scene.add(o.gearG);
    o.gears = {};
    [3, 5, 7].forEach(function (k) {
      var g = P.partGear({ teeth: K.N, module: K.MD, width: 16, fromDeg: (15 - k) * 15, toDeg: K.I1 * 15, material: c.mat("gear") });
      o.gearG.add(g); o.gears[k] = g;
    });
    P.at(P.cylZ(6, 38, c.mat("gear")), 0, 0, -11, o.gearG);                       // shaft z -30..8
    P.at(P.cylZ(11, 4, c.mat("gear")), 0, 0, 10, o.gearG);                        // hub z 8..12
    P.at(P.box(30, 5, 1, c.mat("gear", "mark")), 0, 26, 9, o.gearG).rotation.z = Math.PI / 2;   // red stripe y 11..41, z 8.5..9.5, off the face
    // the rod: everything that moves with it is in rodG, drawn at lift 0
    o.rodG = new T.Group(); scene.add(o.rodG);
    var Y0 = -K.rp * K.dm, RT = Y0 + K.p;                                        // rack top at rest
    [3, 5, 7].forEach(function (k) {
      var r = P.rack({ teeth: k + 1, module: K.MD, side: 1, body: 16, thick: 16, material: c.mat("rod") });
      P.at(r, -60, Y0 - k * K.p, 0, o.rodG); r.visible = false; o.racks[k] = r;  // pitch line x = -60; k+1 teeth
    });
    // rod: cylinder radius 5 from y -198 (neck of the head) to 190; rack body box x -82.25..-66.25 hides it where they meet
    P.at(P.cylY(5, 388, c.mat("rod")), K.XR, -4, 0, o.rodG);
    // plain bar under the rack, x -82.25..-66.25, y -141..(rack bottom): a short block that makes the rack look like part of the rod
    var hm = c.mat("head");
    P.at(new T.Mesh(new T.CylinderGeometry(26, 17, 18, 6), hm), K.XR, -225, 0, o.rodG);   // lower half of the head, y -234..-216
    P.at(new T.Mesh(new T.CylinderGeometry(14, 26, 18, 6), hm), K.XR, -207, 0, o.rodG);   // upper half, y -216..-198; the neck cylinder ends here
    P.at(P.cylY(8, 4, c.mat("rod")), K.XR, 192, 0, o.rodG);                       // cap on the top of the rod y 190..194
    // guides, plate and base (c.fixed); plate z -40..-30, guides z -30..14 against it
    P.at(P.guideBlock({ w: 30, h: 20, d: 44, hole: 5.5, hz: 8, material: c.fixed }), K.XR, 156, -8, scene);    // top guide y 146..166; rack top reaches 143.5 at most
    P.at(P.guideBlock({ w: 30, h: 20, d: 44, hole: 5.5, hz: 8, material: c.fixed }), K.XR, -171, -8, scene);   // lower guide y -181..-161; rack bottom at rest -141
    P.at(P.box(270, 450, 10, c.fixed), -20, -27, -35, scene);                  // plate x -155..115, y -252..198, z -40..-30
    P.at(P.box(310, 12, 100, c.fixed), -20, -246, -30, scene);                 // base y -252..-240, z -80..20; plate stands on it
    P.at(P.box(60, 6, 60, c.mat("anvil")), K.XR, -237, 0, scene);              // base block y -240..-234; the head rests on its top face
    this.place(o, 7);
    o.phi = 0; o.y = this.drive(K, 7, 0);                                      // open mid-lift, as in the drawing
  },

  place: function (o, k) {
    var kk; for (kk in o.gears) { o.gears[kk].visible = +kk === k; o.racks[kk].visible = +kk === k; }
    o.gearG.rotation.z = -o.phi;
    o.rodG.position.y = o.y;
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, k = +S.controls.k || 7;
    if (k !== o.k) { if (o.k) { o.y = 0; o.v = 0; } o.k = k; }
    o.phi += S.w * dt;
    var d = this.drive(K, k, o.phi);
    if (d >= 0 && d >= o.y - 1e-6) { o.y = d; o.v = K.rp * S.w; o.was = true; }
    else { o.was = false; if (S.playing && dt > 0 && this.fall(o, dt)) o.blows++; }
    this.place(o, k);
    S.set("h", Math.round(o.y) + " mm");
    S.set("n", String(o.blows));
  }
});
