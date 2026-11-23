M507.define({
  number: 142,
  title: "Changing the stroke of a guide bar",
  lede: "A big disc carries a gear round a small fixed gear, called a pinion. The gear is made to spin as it travels, so a crank pin on it moves closer to the centre, then farther away. A rod joins the pin to a bar that slides up and down, and the bar's stroke grows and shrinks. Silk machines use this to lay thread evenly on a bobbin.",
  alt: "A big round disc with a small gear fixed at its centre. A bigger gear sits low on the disc and meshes with the small one. A flat crank with a round pin is bolted on the big gear. A rod runs from the pin straight down to a bar that slides through a block.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "The big disc, turned by the handle on its back. It turns on a fixed shaft and carries the big gear round with it. The dark stripe shows how far it has turned." },
    { key: "gear", color: "#C8873A", name: "Gear", note: "A gear that spins freely on a stud on the disc. As the disc carries it round, its teeth roll round the small pinion and turn it." },
    { key: "pinion", color: "#4FA58A", name: "Fixed pinion", note: "A small gear, called a pinion, that never turns, because it is fixed to the shaft. The big gear has to roll round it." },
    { key: "crank", color: "#C2503F", name: "Crank and pin", note: "A short plate bolted on the big gear. Its pin goes round with the gear. Watch how far the pin is from the centre of the disc." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod and guide bar", note: "The rod joins the crank pin to the guide bar. The bar can only slide up and down through the block, so it copies the up and down motion of the pin." }
  ],
  controls: [{ id: "size", label: "Gear size", value: "20", options: [["12", "Small"], ["16", "Medium"], ["20", "Big"]] }],
  readouts: [{ id: "disc", label: "Disc" }, { id: "gear", label: "Gear" }, { id: "stroke", label: "Stroke" }],
  views: { front: [0, -220, 1420], "3d": [640, -100, 1300], side: [1300, -220, 0] },
  target: [0, -220, 0],
  how: [
    "Turn the disc and the big gear is carried round the small pinion. The pinion cannot turn, so the teeth of the big gear roll round it. That makes the big gear spin on its own stud as well.",
    "The crank pin is on the big gear. When the spin brings the pin near the centre of the disc, the bar only moves a short way up and down. When the spin carries the pin far from the centre, the bar moves a long way. The stroke changes a little on every turn of the disc.",
    "Try the small gear, then the big one. Watch the stroke reading. A small gear spins faster as it goes round, so the stroke changes faster."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows no frame. The back plate, the base, the shaft, the handle, the guide block, the rod and bar lengths, the stud and bolt heads, the sizes and the tooth counts were made up. The drawing's dotted ring on the disc was left out. The choice of gear size was added to show what it changes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, N1 = 8;
    var o = this.o = { a: 0, N1: N1, MD: MD, L: 170, BAR: 310, sets: {} };
    // fixed shaft z -60..17 from the plate face to inside the pinion; pinion z 3..17
    P.at(P.cylZ(8, 76, c.mat("pinion", "dark")), 0, 0, -21.5, scene);        // shaft z -59.5..16.5, ends hidden inside disc hub and pinion
    var pinion = P.spurGear({ teeth: N1, module: MD, width: 14, material: c.mat("pinion") });
    P.at(pinion, 0, 0, 10, scene);                                            // z 3..17
    P.at(P.cylZ(4.5, 3, c.mat("pinion", "dark")), 0, 0, 18.5, scene);         // shaft end z 17..20, on the pinion face
    // disc and carrier: disc z -8..0, hub z -60..-8 on the plate, handle on the back
    o.car = new T.Group(); scene.add(o.car);
    P.at(P.cylZ(160, 8, c.mat("disc")), 0, 0, -4, o.car);                     // disc z -8..0, r 160
    P.at(P.cylZ(14, 52, c.mat("disc")), 0, 0, -34, o.car);                    // hub z -60..-8
    P.at(P.box(6, 50, 1, c.mat("disc", "dark")), 0, 125, 1, o.car);          // stripe y 100..150, z 0.5..1.5
    P.at(P.cylZ(6, 32, c.mat("disc")), 0, 135, -24, o.car);                   // handle z -40..-8 on the disc back
    P.at(P.cylZ(8, 6, c.mat("disc")), 0, 135, -43, o.car);                    // knob z -46..-40
    // spur gears, one per size; only one shown
    var k, sizes = [12, 16, 20];
    for (k = 0; k < sizes.length; k++) {
      var N2 = sizes[k], gear = P.spurGear({ teeth: N2, module: MD, width: 14, material: c.mat("gear") });
      var d = gear.pitchRadius + pinion.pitchRadius, e = 0.75 * gear.pitchRadius;
      var carrierPos = new T.Group(); carrierPos.position.set(0, -d, 0); o.car.add(carrierPos);
      P.at(P.cylZ(6, 27, c.mat("disc", "dark")), 0, 0, 13.5, carrierPos);     // stud z 0..27 on the disc face, through the gear and crank
      P.at(P.cylZ(9, 4, c.mat("disc", "dark")), 0, 0, 25, carrierPos);        // bolt head z 23..27, on the crank face
      var g = new T.Group(); carrierPos.add(g);
      P.at(gear, 0, 0, 10, g);                                                // gear z 3..17
      var cr = new T.Group(); g.add(cr);
      P.at(P.box(e + 20, 14, 6, c.mat("crank")), e / 2, 0, 20, cr);           // crank plate x -10..e+10, z 17..23, on the gear face
      P.at(P.cylZ(4.5, 15, c.mat("crank")), e, 0, 30.5, cr);                  // pin z 23..38
      P.at(P.cylZ(8, 3, c.mat("crank", "mark")), e, 0, 38.5, cr);                // red cap z 37..40
      o.sets[N2] = { top: carrierPos, g: g, cr: cr, N: N2, d: d, e: e, psi0: Math.PI / 2 + Math.PI / N2 };
      cr.rotation.z = -Math.PI / 2 - o.sets[N2].psi0;                          // pin points straight down at the start
    }
    // rod, guide bar, guide block
    o.rod = P.at(P.box(12, o.L, 6, c.mat("rod")), 0, 0, 33, scene);          // z 30..36
    o.eye1 = P.at(P.cylZ(9, 6, c.mat("rod")), 0, 0, 33, scene);               // eye on the crank pin, z 30..36
    o.eye2 = P.at(P.cylZ(9, 6, c.mat("rod")), 0, 0, 33, scene);               // eye on the bar top
    P.at(P.cylZ(8, 3, c.mat("rod", "mark")), 0, 0, 37.5, o.eye2);             // cap z 36..39, local to eye
    o.eye2.children[0].position.set(0, 0, 4.5);
    o.bar = P.at(P.cylY(6, o.BAR, c.mat("rod")), 0, 0, 33, scene);          // bar z 27..39
    P.at(P.guideBlock({ w: 44, h: 40, d: 108, hole: 6.5, hz: 39, material: c.fixed }), 0, -335, -6, scene);   // x -22..22, y -355..-315, z -60..48; bar passes at z 33
    // plate and base
    P.at(P.box(420, 820, 10, c.fixed), 0, -220, -65, scene);                 // plate x -210..210, y -630..190, z -70..-60
    P.at(P.box(460, 12, 120, c.fixed), 0, -636, -50, scene);                 // base y -642..-630; the bar (z 27..39) ends at y -617 at the lowest, clear above it, z -110..10
  },

  step: function (c, dt, S) {
    var o = this.o, N2 = +S.controls.size, k, cur = o.sets[N2] || o.sets[20], L = o.L;
    for (k in o.sets) o.sets[k].top.visible = o.sets[k] === cur;
    o.a += S.w * dt;
    var th = o.a, ratio = o.N1 / cur.N;
    o.car.rotation.z = th;
    cur.g.rotation.z = cur.psi0 + ratio * th;                                 // rolls on the fixed pinion: absolute angle is psi0 + (1 + N1/N2) * th
    var a = th - Math.PI / 2, psi = cur.psi0 + (1 + ratio) * th, pa = psi - Math.PI / 2 - cur.psi0;   // pin angle in the world: gear angle plus the pin's place on the gear
    var px = cur.d * Math.cos(a) + cur.e * Math.cos(pa);
    var py = cur.d * Math.sin(a) + cur.e * Math.sin(pa);
    var dy = Math.sqrt(L * L - px * px), by = py - dy;
    o.eye1.position.set(px, py, 33);
    o.eye2.position.set(0, by, 33);
    o.rod.position.set(px / 2, (py + by) / 2, 33);
    o.rod.rotation.z = Math.atan2(px, -dy) + 0;
    o.bar.position.set(0, by - 9 - o.BAR / 2 + 1, 33);
    function f(v) { v = Math.round(v * 10) / 10; if (v === 0) v = 0; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("disc", f(rpm));
    S.set("gear", f(rpm * (1 + ratio)));
    S.set("stroke", Math.round(2 * Math.hypot(px, py)) + " mm");
  }
});
