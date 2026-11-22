M507.define({
  number: 327,
  title: "Roller guide for a piston rod",
  lede: "Two small wheels on the cross-head roll along straight bars instead of sliding. They keep the piston rod running straight and rub much less than a sliding block would. It was used on small engines in France.",
  alt: "A long connecting rod runs down from a crank to a crossbar with a wheel at each end. The wheels roll between two upright bars. A piston rod goes down from the crossbar. A big flywheel stands behind.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Flywheel and crank", note: "A heavy wheel on a shaft, with a short arm and a pin on its front end. The weight of the wheel keeps the crank turning evenly." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "A long rod from the crank pin down to the cross-head. It leans a little from side to side." },
    { key: "head", color: "#C8873A", name: "Cross-head", note: "A crossbar fixed to the piston rod, with a wheel at each end. It can only go up and down." },
    { key: "rollers", color: "#8E7AA8", name: "Rollers", note: "Two wheels that roll along the guide bars. The dark stripe on each shows it turn. They turn in opposite ways." },
    { key: "wrist", color: "#C2503F", name: "Cross-head pin", note: "Holds the connecting rod to the cross-head. Watch it go straight up and down." },
    { key: "piston", color: "#4FA58A", name: "Piston rod and piston", note: "Goes down from the cross-head through the base into the cylinder." }
  ],
  controls: [{ type: "range", id: "r", label: "Crank throw", min: 14, max: 34, step: 1, value: 30, unit: " mm",
    presets: [[14, "Short"], [24, "Medium"], [34, "Long"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "p", label: "Cross-head" }, { id: "n", label: "Rollers turned" }, { id: "t", label: "Rod leans" }],
  views: { "3d": [420, 100, 800], front: [0, 60, 900], side: [900, 60, 30] },
  target: [0, 60, 0],
  how: [
    "The cross-head has a wheel at each end. The two wheels run between two straight bars. As the connecting rod pushes the cross-head up and down, the wheels roll along the bars.",
    "A rolling wheel does not rub. The wheel on the left rolls on its left side and the wheel on the right rolls on its right side, so they turn in opposite ways. The rod leans a little, and the bars take its sideways push.",
    "The wheels turn once each time the cross-head travels as far as the distance round the rim. Try a short throw, then a long one. Watch the stripes and the number of turns. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the rod, the cross-head with its rollers and the bars. The flywheel is drawn behind. The frame, the cross-beam, the bearing, the crank arm, the cylinder with its cover and all the sizes were made up. The cylinder is see-through so the piston can be seen. The rollers turn at exactly the rate needed to roll without slipping.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: Math.PI / 2, YS: 170, L: 170, R: 16 };
    var YS = o.YS;
    // guide bars: x 60..76 and -76..-60, y -66..130, z -10..10. Slab top y -66 is their foot, beam bottom y 130 their top.
    [-1, 1].forEach(function (s) { P.at(P.box(16, 196, 20, c.fixed), s * 68, 32, 0, scene); });
    P.at(P.box(260, 10, 20, c.fixed), 0, 135, 0, scene);                          // beam x -130..130, y 130..140
    c.shell(P.at(P.guideBlock({ w: 190, h: 10, d: 60, hole: 6.5, material: c.fixed }), 0, -71, 0, scene));   // slab x -95..95, y -76..-66, z -30..30
    c.shell(P.at(P.mesh(new T.CylinderGeometry(30, 30, 100, 40, 1, true), c.fixed), 0, -126, 0, scene));
    c.shell(P.at(P.cylY(30, 1, c.fixed), 0, -176.5, 0, scene), "closed");          // closed view: bottom cover y -177..-176, under the tube      // cylinder y -176..-76
    P.at(P.bearingBlock({ bore: 6.8, outer: 16, width: 20, drop: 30, material: c.fixed }), 0, YS, 0, scene);   // foot y 140, z -10..10

    // crank: shaft z -46..16, flywheel z -48..-32, hub z 13..19, arm z 13.5..18.5, pin z 14..28
    var mc = c.mat("crank"), cr = o.crank = new T.Group(); cr.position.set(0, YS, 0); scene.add(cr);
    P.at(P.cylZ(6, 62, mc), 0, 0, -15, cr);
    var fw = P.pulley({ radius: 125, width: 16, rim: 9, spokes: 6, hub: 14, material: mc });
    fw.spokes[0].material = c.mat("crank", "dark");
    P.at(fw, 0, 0, -40, cr);
    P.at(P.cylZ(10, 6, mc), 0, 0, 16, cr);
    o.arm = P.at(P.box(1, 12, 5, mc), 0, 0, 16, cr);
    o.cpin = P.at(P.cylZ(4, 14, mc), 0, 0, 21, cr);
    o.boss1 = P.at(P.cylZ(7, 6, c.mat("rod")), 0, 0, 23, scene);                 // rod eyes z 20..26
    o.link = P.rod(2.5, c.mat("rod")); scene.add(o.link);

    // cross-head: bar between roller centres x +-43.5 (roller radius 16 touches the bar faces at +-60)
    var hd = o.head = new T.Group(); scene.add(hd);
    var mh = c.mat("head");
    P.at(P.box(87, 10, 10, mh), 0, 0, 0, hd);
    P.at(P.cylZ(9, 16, mh), 0, 0, 0, hd);                                         // hub z -8..8
    P.at(P.cylZ(4, 35, c.mat("wrist", "mark")), 0, 0, 10.5, hd);                  // pin z -7..28
    P.at(P.cylZ(7, 6, c.mat("rod")), 0, 0, 23, hd);                               // lower rod eye z 20..26
    P.at(P.cylY(5, 120, c.mat("piston")), 0, -60, 0, hd);                         // y -120..0
    P.at(P.cylY(28, 8, c.mat("piston")), 0, -120, 0, hd);                         // piston y -124..-116
    o.roll = [-1, 1].map(function (s) {
      var g = new T.Group(); g.position.set(s * 43.5, 0, 0); hd.add(g);
      P.at(P.cylZ(16, 16, c.mat("rollers")), 0, 0, 0, g);                         // z -8..8
      P.at(P.box(13, 3, 17.2, c.mat("rollers", "dark")), 8, 0, 0, g);              // stripe, 0.6 proud each face
      P.at(P.cylZ(4, 19, mh), 0, 0, 0, g);                                         // nut z -9.5..9.5
      return g;
    });
  },

  step: function (c, dt, S) {
    var o = this.o, r = +S.controls.r;
    o.th += S.w * dt;
    var px = r * Math.cos(o.th), py = o.YS + r * Math.sin(o.th);
    var yc = py - Math.sqrt(o.L * o.L - px * px);
    o.crank.rotation.z = o.th;
    o.arm.position.x = r / 2; o.arm.scale.x = r; o.cpin.position.x = r;
    o.head.position.y = yc;
    o.roll[0].rotation.z = yc / o.R; o.roll[1].rotation.z = -yc / o.R;           // rolling without slipping on a fixed bar
    o.boss1.position.set(px, py, 23);
    o.link.span(px, py, 23, 0, yc, 23);
    function sg(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " mm"; }
    var tn = yc / (2 * Math.PI * o.R);
    S.set("p", sg(yc - (o.YS - o.L)));
    S.set("n", (tn >= 0 ? "+" : "−") + Math.abs(tn).toFixed(2) + " turns");
    S.set("t", Math.round(Math.asin(px / o.L) * 180 / Math.PI) + "°");
  }
});
