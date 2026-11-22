M507.define({
  number: 81,
  title: "Part-toothed gear and spring rack",
  lede: "A gear with teeth on only part of its rim lifts a toothed rod, then lets it go. A spring snaps the rod back down, ready for the next lift. A steady turn becomes a slow lift and a quick drop.",
  alt: "An upright rod with gear teeth along part of its length, held in two guides. A gear on the right has teeth on only part of its rim. Above the rod a coil spring joins the top guide to a plate on the rod's top end.",
  parts: [
    { key: "gear", color: "#5E7387", name: "Driving gear", note: "A gear with teeth on only part of its rim, the rest left smooth. Watch the red stripe to count its turns." },
    { key: "rod", color: "#C8873A", name: "Toothed rod", note: "A straight bar with teeth, called a rack. It slides up and down in two fixed guides." },
    { key: "spring", color: "#4FA58A", name: "Spring", note: "Hooked between the top guide and the plate on top of the rod. It stretches as the rod goes up and pulls it back down." }
  ],
  controls: [{ id: "k", label: "Teeth on the gear", value: "7", options: [["3", "3 teeth"], ["5", "5 teeth"], ["7", "7 teeth"]] }],
  readouts: [{ id: "h", label: "Rod" }, { id: "n", label: "Lifts" }],
  views: { "3d": [500, 120, 1150], front: [-20, 20, 1600], side: [1600, 20, 0] },
  target: [-20, -40, 0],
  distance: [320, 2600],
  how: [
    "The gear turns clockwise all the time. While its teeth pass the rod, they hook into the rod's teeth and push the rod up. The spring above stretches as the rod rises.",
    "Then the last tooth leaves the rod. The smooth part of the rim is too small to touch the rod's teeth, so nothing holds the rod up. The spring pulls it straight back down to its stop. It waits there until the first tooth comes round again and drops into the same gap as before.",
    "The more teeth the gear has, the higher the rod goes and the shorter it rests. Try 3 teeth, then 7, and watch how high the rod climbs."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown's spring pushes the rod down; here it hangs from the top guide and pulls, which needs the same few parts. The plate behind, the guides, the stop under the rod, the sizes and the number of teeth were made up. The choice of 3 or 5 teeth was added for comparison.",

  // Gear: module 5, 24 teeth, pitch radius 60, centre at the origin, turning clockwise seen from the front.
  // Toothed arc ends at tooth 14 (210 degrees); the first tooth is 15 - k. Rack pitch line x = -60.
  K: function () {
    var MD = 5, N = 24, rp = 60, ra = 65, p = Math.PI * MD, st = 2 * Math.PI / N;
    var dm = Math.acos((rp - .7 * MD) / ra);       // a gear tooth tip enters the band of rack teeth at 180 +- dm degrees
    return { MD: MD, N: N, rp: rp, p: p, st: st, dm: dm, I1: 14, XR: -60 - 1.25 * MD - 8 };
  },
  // Lift while in mesh, or -1 when the gear's teeth are clear of the rack. phi: clockwise gear angle.
  drive: function (K, k, phi) {
    var fa = (15 - k) * K.st - Math.PI - K.dm, span = (k - 1) * K.st + 2 * K.dm + .15 * K.st;   // leading tooth enters .. trailing tooth's back corner is clear
    var ph = phi - fa; ph -= 2 * Math.PI * Math.floor(ph / (2 * Math.PI));
    return ph <= span ? K.rp * ph : -1;
  },
  // Advance the rod by dt with the spring and gravity when free; returns true when it lands on its stop.
  fall: function (o, dt) {
    var n = 8, h = dt / n, landed = false;
    for (var i = 0; i < n; i++) {
      o.v += -(100 * (o.y + 40) + 2000) * h;     // stretched spring (already pulling at rest) plus weight
      o.y += o.v * h;
      if (o.y <= 0) { if (o.v < -20) landed = true; o.y = 0; o.v = 0; }
    }
    return landed;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K();
    var o = this.o = { K: K, phi: 0, y: 0, v: 0, lifts: 0, racks: {}, was: false };
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
    var Y0 = -K.rp * K.dm, BOT = -141;                                           // gap for the leading tooth; rack bottom at rest
    [3, 5, 7].forEach(function (k) {
      var g = new T.Group(), r = P.rack({ teeth: k + 1, module: K.MD, side: 1, body: 16, thick: 16, material: c.mat("rod") });
      P.at(r, -60, Y0 - k * K.p, 0, g);                                          // pitch line x = -60; teeth k+1 above the bar
      var low = Y0 - k * K.p - BOT;                                              // plain bar below the teeth, down to the stop
      if (low > .5) P.at(P.box(16, low, 16, c.mat("rod")), K.XR, BOT + low / 2, 0, g);   // x -82.25..-66.25 = body behind the roots
      o.rodG.add(g); o.racks[k] = g;
    });
    var RT = Y0 + K.p, HEAD = 246;                                               // rack top at rest; head plate bottom at rest
    P.at(P.cylY(5, HEAD + 10 - RT, c.mat("rod")), K.XR, (HEAD + 10 + RT) / 2, 0, o.rodG);   // rod y RT..256 (top of the head)
    P.at(P.cylY(5, BOT + 322, c.mat("rod")), K.XR, (BOT - 322) / 2, 0, o.rodG);   // tail y -322..-141, stays in the lower guide
    P.at(P.box(44, 10, 30, c.mat("rod")), K.XR, HEAD + 5, 0, o.rodG);             // head plate y 246..256
    // spring from the top guide (top face y 166) to the head (bottom face y 246 at rest)
    o.spring = P.spring({ radius: 12, wire: 2, turns: 12, length: 150, material: c.mat("spring") });
    o.spring.rotation.z = Math.PI / 2; P.at(o.spring, K.XR, 166, 0, scene);
    // supports: plate z -40..-30, guides z -30..14 against it
    P.at(P.guideBlock({ w: 30, h: 20, d: 44, hole: 5.5, hz: 8, material: c.fixed }), K.XR, 156, -8, scene);   // top guide y 146..166, z -30..14; rack top reaches 141
    P.at(P.guideBlock({ w: 30, h: 10, d: 44, hole: 5.5, hz: 8, material: c.fixed }), K.XR, -146.5, -8, scene); // lower guide and stop y -151.5..-141.5, rack rests 0.5 above
    P.at(P.box(270, 510, 10, c.fixed), -20, -85, -35, scene);                   // plate x -155..115, y -340..170, z -40..-30
    P.at(P.box(310, 12, 100, c.fixed), -20, -346, -30, scene);                  // base y -352..-340, z -80..20; plate stands on it
    this.place(o, 7);
    o.phi = 0; o.y = this.drive(K, 7, 0);                                       // open mid-lift, as in the drawing
  },

  place: function (o, k) {
    var kk; for (kk in o.gears) { o.gears[kk].visible = +kk === k; o.racks[kk].visible = +kk === k; }
    o.gearG.rotation.z = -o.phi;
    o.rodG.position.y = o.y;
    o.spring.setLength(80 + o.y);
  },

  step: function (c, dt, S) {
    var o = this.o, K = o.K, k = +S.controls.k || 7;
    if (k !== o.k) { if (o.k) { o.y = 0; o.v = 0; } o.k = k; }
    o.phi += S.w * dt;
    var d = this.drive(K, k, o.phi);
    if (d >= 0 && d >= o.y - 1e-6) { o.y = d; o.v = K.rp * S.w; if (!o.was) o.lifts++; o.was = true; }
    else { o.was = d >= 0 && o.was; if (S.playing) this.fall(o, dt); }
    this.place(o, k);
    S.set("h", d >= 0 && d >= o.y - 1e-6 ? "lifting" : o.y > 0.5 ? "falling" : "resting");
    S.set("n", String(o.lifts));
  }
});
