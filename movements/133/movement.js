M507.define({
  number: 133,
  title: "Sector press",
  lede: "A hand crank turns a small gear. Its teeth drive a larger toothed wheel, called a sector, which swings about its shaft. A long rod links the sector to a flat block above, called the platen, and pushes it up and down. A press like this squeezes with great force.",
  alt: "Two tall posts stand under a cap, with a flat block hanging between them. At the foot of the frame a toothed fan-shaped wheel turns on a shaft. A small gear with a crank handle meshes with its teeth, and a long rod joins the fan to the block.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank and pinion", note: "The handle turns a small gear, called a pinion. Its teeth push on the teeth of the sector." },
    { key: "sector", color: "#C8873A", name: "Toothed sector", note: "A big wheel with teeth on only part of its rim. It swings back and forth and carries the lower end of the rod." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "A long bar. Its foot is pinned to the sector and its top is pinned to the platen, so it pushes the platen up and pulls it down." },
    { key: "platen", color: "#C8873A", name: "Platen", note: "The flat block that does the pressing. It slides straight up and down between the posts. Watch it." }
  ],
  controls: [{ id: "pin", label: "Pinion", value: "mid", options: [["small", "Small"], ["mid", "Medium"], ["large", "Big"]] }],
  readouts: [{ id: "c", label: "Crank" }, { id: "p", label: "Platen" }],
  views: { front: [60, 190, 1150], "3d": [640, 350, 1030], side: [1150, 190, 0] },
  target: [60, 190, 0],
  distance: [500, 2800],
  how: [
    "Swing the crank. The small gear turns, and its teeth push the teeth of the sector. The sector swings about its shaft. The rod is pinned near the sector's edge, so it moves up and down as the sector swings.",
    "The rod lifts the platen when the sector swings one way and lets it down when it swings back. The sector is much bigger than the pinion, so the crank turns many times for one swing of the sector. A long, easy swing of the handle gives a short, strong push.",
    "Try Small, then Medium, then Large. The sector swings the same amount each time. Watch how far the crank has to turn."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the back plate and the base, the sizes, the number of teeth and the length of the crank were made up. Brown draws no work under the platen, so none is shown. Brown shows the crank turning; here it swings back and forth so the sector can swing. The choice of pinion size was added to show what it changes.",

  // Module 7. Sector 60 teeth (pitch radius 210) centred on the origin; pinion sits on the line 54 degrees above the x axis,
  // which is 9 sector teeth, so a sector tooth points at the pinion when the sector is at rest.
  K: { MD: 7, NS: 60, PA: 3 * Math.PI / 180, PR: 85, L: 288.4, PH: 54, MID: 21, AMP: 24 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, d2r = Math.PI / 180;
    var o = this.o = { a: 0, sets: {} };
    // sector group: gear z -5..5, pivot at the origin
    var sg = o.sector = new T.Group(); scene.add(sg);
    var sec = P.gearSector({ teeth: K.NS, module: K.MD, fromDeg: -8, toDeg: 85, width: 10, material: c.mat("sector") });
    sg.add(sec); K.rp = sec.pitchRadius;
    P.at(P.cylZ(10, 47, c.mat("sector")), 0, 0, -6.5, sg);                   // shaft z -30..17, from the back plate face
    P.at(P.cylZ(28, 8, c.mat("sector")), 0, 0, 9, sg);                       // hub z 5..13, on the sector face
    P.at(P.cylZ(9, 17, c.mat("sector")), K.PR * Math.cos(K.PA), K.PR * Math.sin(K.PA), 13.5, sg);   // pin boss z 5..22, on the sector face
    var st = new T.Group(); st.rotation.z = 35 * d2r; sg.add(st);
    P.at(P.box(110, 5, 1, c.mat("sector", "mark")), 95, 0, 6, st);          // red stripe r 40..150, z 5.5..6.5, off the face
    // pinions: three sizes, each on the 54 degree line
    [["small", 9], ["mid", 12], ["large", 18]].forEach(function (s) {
      var N = s[1], g = new T.Group(), gear = P.spurGear({ teeth: N, module: K.MD, width: 10, material: c.mat("crank") });
      var dist = K.rp + gear.pitchRadius, th0 = ((234 - 180 / N) % (360 / N) + 360 / N) % (360 / N);
      g.position.set(dist * Math.cos(K.PH * d2r), dist * Math.sin(K.PH * d2r), 0); scene.add(g);
      var spin = new T.Group(); g.add(spin);
      spin.add(gear);
      P.at(P.cylZ(6, 50, c.mat("crank")), 0, 0, -5, spin);                  // shaft z -30..20, from the back plate face
      P.at(P.cylZ(11, 4, c.mat("crank")), 0, 0, 7, spin);                   // hub z 5..9, on the gear face
      var rf = gear.pitchRadius - 1.25 * K.MD;
      P.at(P.box(rf - 14, 5, 1, c.mat("crank", "mark")), 11 + (rf - 14) / 2, 0, 6, spin);   // red stripe x 11..rf-3, z 5.5..6.5
      var arm = new T.Group(); arm.rotation.z = -th0 * d2r; spin.add(arm);   // crank points right when the model rests
      P.at(P.box(100, 10, 6, c.mat("crank")), 40, 0, 19, arm);              // arm x -10..90, z 16..22
      P.at(P.cylZ(6, 18, c.mat("crank")), 80, 0, 31, arm);                  // handle z 22..40, on the arm face
      o.sets[s[0]] = { g: g, spin: spin, N: N, th0: th0 * d2r };
    });
    // platen group: origin at the rod's top pin (platen bottom is 22 above it)
    var pg = o.platen = new T.Group(); scene.add(pg);
    P.at(P.box(186, 22, 50, c.mat("platen")), 0, 33, 0, pg);                // platen x -93..93, y 22..44 above the pin, z -25..25
    P.at(P.box(20, 34, 16, c.mat("rod")), 0, 5, 16, pg);                      // lug y -12..22, z 8..24, hangs from the platen bottom (y 22)
    P.at(P.cylZ(7, 4, c.mat("rod")), 0, 0, 26, pg);                           // pin head z 24..28
    o.rod = P.rod(5, c.mat("rod")); scene.add(o.rod);
    o.pinHead = P.at(P.cylZ(7, 4, c.mat("rod")), 0, 0, 24, scene);            // pin head z 22..26 on the sector pin
    // supports
    P.at(P.box(390, 380, 10, c.fixed), 55, 140, -35, scene);                  // back plate x -140..250, y -50..330, z -40..-30; shafts end at z -30
    P.at(P.box(430, 12, 100, c.fixed), 55, -56, -30, scene);                  // base x -160..270, y -62..-50, z -80..20; plate stands on y -50
    [-110, 110].forEach(function (x) {
      P.at(P.box(30, 490, 22, c.fixed), x, 195, -19, scene);                  // post x +-95..125, y -50..440, z -30..-8; on the base top and plate face
    });
    P.at(P.box(280, 40, 22, c.fixed), 0, 460, -19, scene);                    // beam x -140..140, y 440..480, z -30..-8; on the post tops
    P.at(P.box(310, 20, 30, c.fixed), 0, 490, -19, scene);                    // cap x -155..155, y 480..500, z -34..-4; on the beam top
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, d2r = Math.PI / 180, cur = o.sets[S.controls.pin] || o.sets.mid, k;
    o.a += S.w * dt;
    var dl = (K.MID + K.AMP * Math.sin(o.a + Math.asin(-K.MID / K.AMP))) * d2r;   // sector swing, 0 at rest, ccw positive
    for (k in o.sets) o.sets[k].g.visible = o.sets[k] === cur;
    o.sector.rotation.z = dl;
    cur.spin.rotation.z = cur.th0 - (K.NS / cur.N) * dl;                          // opposite way, speeds in inverse ratio of teeth
    var ph = K.PA + dl, px = K.PR * Math.cos(ph), py = K.PR * Math.sin(ph);
    var yp = py + Math.sqrt(K.L * K.L - px * px);                                // platen pin rises as the rod's foot swings
    o.platen.position.set(0, yp, 0);
    o.rod.span(px, py, 16, 0, yp, 16);
    o.pinHead.position.set(px, py, 24);
    var lo = K.PR * Math.sin(K.PA - 3 * d2r) + Math.sqrt(K.L * K.L - Math.pow(K.PR * Math.cos(K.PA - 3 * d2r), 2));
    var crank = -(K.NS / cur.N) * dl / d2r;
    S.set("c", (crank < 0 ? "−" : "") + Math.abs(Math.round(crank)) + "°");
    S.set("p", Math.round(yp - lo) + " mm");
  }
});
