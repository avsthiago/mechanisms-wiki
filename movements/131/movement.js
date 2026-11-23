M507.define({
  number: 131,
  title: "Slotted arm and toothed sector",
  lede: "A turning disc has a pin that slides in a long slot. The slot is cut in an arm that rocks to and fro. The arm carries a part of a gear, called a sector. It pushes a straight bar with gear teeth, called a rack, from side to side.",
  alt: "A round disc with a red pin near its rim. The pin sits in a long slot in an arm that points up and to the right. The arm rocks on a pivot below the disc. A fan-shaped piece of gear is joined to the arm and meshes with a toothed bar that lies across the bottom on a round rod.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "The round disc turns at a steady speed. It is the only part that is driven." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The red pin on the disc. It slides up and down the slot as it goes round. Watch how it pushes the arm to each side." },
    { key: "arm", color: "#C8873A", name: "Slotted arm and sector", note: "The arm and the fan of gear teeth are one piece. They rock together on one pivot." },
    { key: "rack", color: "#4FA58A", name: "Rack", note: "The straight bar with teeth, on a round rod that slides through two blocks. It moves to and fro. Watch the red band on the rod." }
  ],
  controls: [{ type: "range", id: "r", label: "Pin distance from the middle", min: 20, max: 54, step: 1, value: 51, unit: " mm",
    presets: [[25, "Near"], [40, "Medium"], [54, "Far"]] }],
  readouts: [{ id: "d", label: "Disc" }, { id: "a", label: "Sector" }, { id: "x", label: "Rack" }],
  views: { front: [0, -10, 640], "3d": [330, 60, 640], side: [640, -10, 0] },
  target: [40, -30, 0],
  distance: [250, 1400],
  how: [
    "The disc turns round and round. Its red pin slides along the slot and pushes the arm to the left, then to the right. The arm and the sector rock together, and the sector's teeth push the teeth of the rack.",
    "The disc turns all the way round, but the arm only swings to and fro. So the rack does not turn. It slides one way, then back. The farther the pin sits from the middle of the disc, the wider the arm swings, and the longer the rack slides.",
    "Try Near, then Far. Watch the red band on the rod, and see how far it travels each time."
  ],
  note: "This model is rebuilt from Brown's drawing. The backing plate, the base, the pivot pin, the two blocks that hold the rod, the sizes and the number of teeth were made up. The windows in the sector are left out. The choice of pin distance was added to show what it changes.",

  K: { CY: 89, MD: 5, N: 30, NR: 11, YP: -75 },

  // arm angle (from the pivot, anticlockwise from +x) and the pin's distance along the arm, for crank angle psi
  solve: function (psi, r) {
    var K = this.K, px = r * Math.cos(psi), py = K.CY + r * Math.sin(psi);
    return { px: px, py: py, al: Math.atan2(py, px), d: Math.hypot(px, py) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, MD = K.MD, p = Math.PI * MD, L = K.NR * p, i;
    var o = this.o = { psi: -0.05, r: -1, p: p };
    // backing plate x -190..190, y -160..180, z -40..-34; base x -200..200, y -172..-160, z -40..30
    P.at(P.box(380, 340, 6, c.fixed), 0, 10, -37, scene);
    P.at(P.box(400, 12, 70, c.fixed), 0, -166, -5, scene);
    // disc: hub z -34..-16 on the plate face, disc z -28..-22
    o.disc = new T.Group(); o.disc.position.set(0, K.CY, 0); scene.add(o.disc);
    P.at(P.cylZ(14, 18, c.mat("disc")), 0, 0, -25, o.disc);
    P.at(P.cylZ(62, 6, c.mat("disc")), 0, 0, -25, o.disc);
    P.at(P.box(34, 5, 1, c.mat("disc", "light")), -38, 0, -21.5, o.disc);       // stripe z -22..-21 on the disc face, opposite the pin
    o.pin = new T.Group(); o.disc.add(o.pin);
    P.at(P.cylZ(6, 26, c.mat("pin")), 0, 0, -9, o.pin);                          // pin z -22..4, through the slot
    P.at(P.cylZ(9.5, 2.5, c.mat("pin")), 0, 0, 5.25, o.pin);                     // head z 4..6.5, on the arm face
    // arm and sector, one piece. Local +y runs along the arm, z -4..4
    o.rock = new T.Group(); scene.add(o.rock);
    var m = c.mat("arm");
    P.at(P.box(32, 28, 8, m), 0, 14, 0, o.rock);                                 // foot x -16..16, y 0..28
    P.at(P.box(8, 122, 8, m), 12, 89, 0, o.rock);                                // rail x 8..16, y 28..150 (slot half width 8)
    P.at(P.box(8, 122, 8, m), -12, 89, 0, o.rock);                               // rail x -16..-8
    P.at(P.box(32, 15, 8, m), 0, 157.5, 0, o.rock);                              // end y 150..165
    var sec = P.gearSector({ teeth: K.N, module: MD, fromDeg: -155, toDeg: -25, width: 8, material: m });
    o.rock.add(sec);                                                             // teeth at radius 75 +- , z -4..4
    P.at(P.cylZ(14, 6, m), 0, 0, 7, o.rock);                                     // boss z 4..10
    P.at(P.cylZ(6, 1, c.mat("arm", "dark")), 0, 0, 10.5, o.rock);                // cap z 10..11
    P.at(P.cylZ(5, 30, c.fixed), 0, 0, -19, scene);                              // pivot shaft z -34..-4, ends at the arm's back face
    // rack on a round rod; teeth point up, pitch line y = -75, centre sits on x = 0 at rest
    o.rack = new T.Group(); scene.add(o.rack);
    var rk = P.rack({ teeth: K.NR, module: MD, side: 1, body: 24, thick: 8, material: c.mat("rack") });
    rk.rotation.z = Math.PI / 2; rk.position.set(L / 2, K.YP, 0); o.rack.add(rk);   // root y -81.25, bottom y -105.25, z -4..4
    var yr = K.YP - 1.25 * MD - 12;                                              // rod centre y -93.25, through the middle of the body
    P.at(P.cylX(9, 480, c.mat("rack")), 0, yr, 0, o.rack);                       // rod r 9, z -9..9
    P.at(P.cylX(10, 8, c.mat("rack", "mark")), 112, yr, 0, o.rack);              // red band r 10, a little proud of the rod
    // two guide blocks, x +-(142..158), y -113.25..-73.25, z -34..26, plate to the front; hole r 11 round the rod
    [-1, 1].forEach(function (u) {
      var b = P.guideBlock({ w: 40, h: 16, d: 60, hole: 11, hz: 4, material: c.fixed });
      b.rotation.z = Math.PI / 2; b.position.set(u * 150, yr, -4); scene.add(b);
    });
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, r = +S.controls.r, rp = K.N * K.MD / 2, p = o.p;
    if (r !== o.r) { o.r = r; o.pin.position.x = r; }
    o.psi -= S.w * dt;
    var s = this.solve(o.psi, r), R = s.al - Math.PI / 2;
    o.disc.rotation.z = o.psi;
    o.rock.rotation.z = R;
    var x = rp * R;                                          // the pitch circle rolls along the pitch line
    o.rack.position.x = x;
    this.o.slotErr = Math.abs(s.px * -Math.sin(s.al) + s.py * Math.cos(s.al));
    var deg = Math.round(R * 180 / Math.PI), mm = Math.round(x);
    S.set("d", Math.round(Math.abs(S.w) * 60 / (2 * Math.PI)) + " rpm");
    S.set("a", (deg < 0 ? "−" : deg > 0 ? "+" : "") + Math.abs(deg) + "°");
    S.set("x", (mm < 0 ? "−" : mm > 0 ? "+" : "") + Math.abs(mm) + " mm");
  }
});
