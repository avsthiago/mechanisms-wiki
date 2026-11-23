M507.define({
  number: 329,
  title: "Gear guide for a piston rod",
  lede: "A small gear rolls round inside a fixed ring of teeth twice its size. One point on the edge of the small gear goes straight up and down, with no sideways wobble at all. The piston rod is pinned to that point, so it needs no other guide.",
  alt: "A large flywheel with four spokes, and in front of it a fixed ring with teeth on the inside, held on two sloping legs. A small toothed wheel half as wide rolls inside the ring, carried on a pin by a plate on the main shaft. An upright piston rod is pinned to the edge of the small gear and goes down into a cylinder.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Shaft, plate and flywheel", note: "The main shaft turns the flywheel and a round plate. A pin on the plate carries the small gear round in a circle." },
    { key: "wheel", color: "#C8873A", name: "Small gear", note: "A gear half as wide as the ring. It turns on the plate's pin and rolls round inside the ring." },
    { key: "ring", color: "#4FA58A", name: "Fixed ring", note: "A ring with teeth on the inside, held still by the two legs. The small gear rolls round it." },
    { key: "rod", color: "#D9B13B", name: "Piston rod", note: "Pinned to the edge of the small gear. It goes down into the cylinder, where the steam pushes the piston." },
    { key: "dot", color: "#C2503F", name: "Red dot", note: "A point on the small gear. Watch the line it draws. Use the control to move it." }
  ],
  controls: [{ id: "k", label: "Red dot", value: "1", options: [["1", "On the edge"], ["0.5", "Halfway in"], ["0", "At the centre"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "p", label: "Piston" }, { id: "s", label: "Dot sideways" }],
  views: { "3d": [330, 180, 920], front: [0, 10, 940], side: [940, 10, -20] },
  target: [0, 10, 0],
  how: [
    "The plate on the shaft carries the small gear round in a circle. Its teeth roll on the teeth of the fixed ring. As it is carried round one way, the rolling makes it spin the other way, at the same speed.",
    "The ring is exactly twice as wide as the small gear. Because of that, a point on the edge of the small gear does not go round in a loop. It slides up and down along a straight line across the middle of the ring. The piston rod is pinned to that point, so it moves straight up and down. Nothing pushes it sideways, so it needs no slide.",
    "Try the red dot on the edge, then halfway in, then at the centre. Only a point on the edge draws a straight line. The others draw an oval or a circle. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The cylinder, its cover, the base, the bearing behind the flywheel, the arm that carries the pin on the small gear, the tooth counts and all the sizes were made up. The cylinder is drawn see-through so the piston shows. The red dot and its line were added to show the path.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var YC = 75, MD = 4, ND = 40, NB = 20, RB = NB * MD / 2, RD = ND * MD / 2;  // ring pitch radius 80, small gear 40
    var o = this.o = { ph: 139 * Math.PI / 180, YC: YC, RB: RB, LR: 228, k: null, paths: {} };
    // fixed ring: z 0..16, outside radius 91; lugs at x +-100 z 0..16; the legs touch their back face z 0
    var mr = c.mat("ring"), ring = P.internalGear({ teeth: ND, module: MD, width: 16, rim: 6, material: mr });
    P.at(ring, 0, YC, 8, scene);
    [-100, 100].forEach(function (x) {
      P.at(P.cylZ(13, 16, mr), x, YC, 8, scene);                              // lug z 0..16
      P.at(P.cylZ(5, 2, c.mat("ring", "dark")), x, YC, 17, scene);            // pin head z 16..18
    });
    // legs: slanted plates z -16..0 from under each lug (top edge y 75 at the lug centre, hidden by the lug) to the base top y -240
    [-1, 1].forEach(function (s) {
      var sh = new T.Shape();
      sh.moveTo(s * 90, YC); sh.lineTo(s * 110, YC); sh.lineTo(s * 202, -240); sh.lineTo(s * 180, -240); sh.closePath();
      var g = new T.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false }); g.translate(0, 0, -16);
      scene.add(P.mesh(g, c.fixed));
    });
    // shaft, plate and flywheel: shaft z -66..-12, plate z -12..-4 radius 58, crank pin z -4..18 at radius 40, flywheel z -50..-38
    var mc = c.mat("crank");
    o.crank = new T.Group(); o.crank.position.set(0, YC, 0); scene.add(o.crank);
    P.at(P.cylZ(8, 54, mc), 0, 0, -39, o.crank);
    P.at(P.cylZ(58, 8, mc), 0, 0, -8, o.crank);
    P.at(P.box(44, 5, 1, c.mat("crank", "dark")), -30, 0, -3.5, o.crank);     // dark stripe on the plate's front face, z -4..-3
    P.at(P.cylZ(6, 23, mc), RD - RB, 0, 7.5, o.crank);                            // crank pin x 40, z -4..18
    var fw = P.pulley({ radius: 150, width: 12, rim: 12, spokes: 4, hub: 16, material: mc });
    fw.spokes[0].material = c.mat("crank", "dark");
    P.at(fw, 0, 0, -44, o.crank); fw.rotation.z = -o.ph;                      // spokes upright and level at the start, as drawn
    // small gear: gear z 2..14, hub z 14..18, arm z 17..20 from its centre to the edge point (local -x), boss at the end
    var mw = c.mat("wheel");
    o.wheel = new T.Group(); scene.add(o.wheel);
    var hs = [];
    for (i = 0; i < 4; i++) {
      var a1 = i * Math.PI / 2 + .18, a2 = (i + 1) * Math.PI / 2 - .18, b1 = i * Math.PI / 2 + .1, b2 = (i + 1) * Math.PI / 2 - .1, p = new T.Path();
      p.absarc(0, 0, 31, b2, b1, true); p.lineTo(12 * Math.cos(a1), 12 * Math.sin(a1)); p.absarc(0, 0, 12, a1, a2, false); p.closePath(); hs.push(p);
    }
    var gear = P.spurGear({ teeth: NB, module: MD, width: 12, holes: hs, material: mw });
    o.gear = P.at(gear, 0, 0, 8, o.wheel); o.pitchB = gear.pitch;
    P.at(P.cylZ(9, 4, mw), 0, 0, 16, o.wheel);                                  // hub z 14..18
    P.at(P.box(RB, 8, 3, mw), -RB / 2, 0, 18.5, o.wheel);                       // arm x -40..0, z 17..20
    P.at(P.cylZ(6, 3, mw), -RB, 0, 18.5, o.wheel);                              // boss at the edge point, z 17..20
    // marks: the red dot for "halfway" and "centre" lies on the arm (z 20..22); for "edge" it is the red cap on the wrist pin (z 31..33)
    o.dot = P.at(P.cylZ(4, 2, c.mat("dot", "mark")), 0, 0, 21, o.wheel);
    // piston rod: eye z 24..30 round the wrist pin, rod radius 4 at z 27 (z 23..31), piston inside the cylinder
    var my = c.mat("rod");
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.cylZ(3, 12, my), 0, 0, 26, o.rod);                                   // wrist pin z 20..32
    P.at(P.cylZ(8, 6, my), 0, 0, 27, o.rod);                                    // eye z 24..30
    o.cap = P.at(P.cylZ(4, 2, c.mat("dot", "mark")), 0, 0, 33, o.rod);          // red cap z 32..34
    P.at(P.cylY(4, o.LR - 8, my), 0, -8 - (o.LR - 8) / 2, 27, o.rod);          // rod y -LR..-8, z 23..31
    P.at(P.cylY(34, 10, my), 0, -o.LR, 27, o.rod);                              // piston, 10 thick, bore 37
    // traced paths: x = RB(1-k)cos(ph), y = RB(1+k)sin(ph) about the ring centre, thin dark tubes just in front of each dot
    [["1", 1, 35.5], ["0.5", .5, 21.5], ["0", 0, 21.5]].forEach(function (e) {
      var m, k = e[1];
      if (k === 1) m = P.at(P.cylY(1, 2 * RB * 2, c.mat("dot", "dark")), 0, YC, e[2], scene);
      else {
        var pts = [];
        for (var j = 0; j < 96; j++) { var a = j * 2 * Math.PI / 96; pts.push(new T.Vector3(RB * (1 - k) * Math.cos(a), YC + RB * (1 + k) * Math.sin(a), e[2])); }
        m = P.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts, true), 160, .7, 6, true), c.mat("dot", "dark")); scene.add(m);
      }
      o.paths[e[0]] = m;
    });
    // supports. Base y -252..-240, x -215..215, z -100..70
    P.at(P.box(430, 12, 170, c.fixed), 0, -246, -15, scene);
    // shaft bearing behind the flywheel: z -80..-66 (the shaft ends at its front face), foot on the base top
    P.at(P.bearingBlock({ bore: 8.5, outer: 16, width: 14, drop: YC + 240, material: c.fixed }), 0, YC, -73, scene);
    // cylinder: open tube y -240..-66 on the base, radius 37, axis z 27; cover y -66..-60 and gland y -60..-48, holes for the rod
    c.shell(P.at(P.mesh(new T.CylinderGeometry(37, 37, 174, 40, 1, true), c.fixed), 0, -153, 27, scene));
    c.shell(P.at(P.guideBlock({ w: 86, h: 6, d: 86, hole: 5, material: c.fixed }), 0, -63, 27, scene));
    c.shell(P.at(P.guideBlock({ w: 22, h: 12, d: 22, hole: 5, material: c.fixed }), 0, -54, 27, scene));
  },

  step: function (c, dt, S) {
    var o = this.o, k = +(S.controls.k || 1), key = S.controls.k || "1";
    o.ph += S.w * dt;
    var ph = o.ph, RB = o.RB, cx = RB * Math.cos(ph), cy = o.YC + RB * Math.sin(ph);
    o.crank.rotation.z = ph;
    o.wheel.position.set(cx, cy, 0);
    o.wheel.rotation.z = -ph;                                  // rolls inside a ring twice its size: spins back as fast as it is carried
    o.gear.rotation.z = o.pitchB / 2;                          // half a tooth, so its teeth sit in the ring's gaps
    var wy = o.YC + 2 * RB * Math.sin(ph);                     // edge point: x stays 0
    o.rod.position.set(0, wy, 0);
    o.dot.position.x = -RB * k; o.dot.visible = k < 1; o.cap.visible = k === 1;
    for (var p in o.paths) o.paths[p].visible = p === key;
    var dx = RB * (1 - k) * Math.cos(ph);
    function sg(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " mm"; }
    S.set("p", sg(wy - o.YC)); S.set("s", sg(dx));
  }
});
