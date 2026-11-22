M507.define({
  number: 326,
  title: "Slide guide for a piston rod",
  lede: "A block slides up and down in a tall slot cut in the engine frame. It carries the piston rod, so the rod can only move straight. A rod from the crank pushes the block, and the flywheel keeps everything turning smoothly.",
  alt: "A tall tapered engine frame with a slot down the middle. A block slides in the slot. A rod joins the block to a crank on top of the frame, and a large flywheel stands behind.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Flywheel and crank", note: "A heavy wheel on a shaft, with a short arm and a pin on the front end. The weight of the wheel keeps the crank turning evenly." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "Joins the crank pin to the slide. It leans one way, then the other, as the crank turns." },
    { key: "slide", color: "#C8873A", name: "Slide", note: "A block that fits the slot in the frame. The slot stops it leaning, so it can only go up and down." },
    { key: "wrist", color: "#C2503F", name: "Slide pin", note: "Holds the connecting rod to the slide. Watch it go straight up and down while the crank pin goes round." },
    { key: "piston", color: "#4FA58A", name: "Piston rod and piston", note: "Goes down from the slide through the base into the cylinder. It is pushed and pulled by the steam." }
  ],
  controls: [{ type: "range", id: "r", label: "Crank throw", min: 14, max: 34, step: 1, value: 28, unit: " mm",
    presets: [[14, "Short"], [24, "Medium"], [34, "Long"]] }],
  closed: { label: "Cylinder" },
  readouts: [{ id: "p", label: "Slide" }, { id: "t", label: "Rod leans" }, { id: "s", label: "Stroke" }],
  views: { "3d": [363, 100, 704], front: [0, -5, 720], side: [900, 0, 20] },
  target: [0, -5, 0],
  how: [
    "The crank pin goes round in a circle. The connecting rod joins it to the slide, and the slide can only go up and down. So the turning pin pushes and pulls the slide along a straight line.",
    "The rod is never quite upright. It leans one way, then the other. A leaning rod pushes the slide against the side of the slot. The slot wall is planed flat and true, so it takes that push and the piston rod is not bent.",
    "The slide goes fastest when the crank is level and stops for a moment at the top and bottom. Try a short throw, then a long one. Watch how far the slide goes and how much the rod leans. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the frame, the slot, the slide, the crank and the flywheel. The cylinder, its cover, the base, the bearing, the crank arm, the rod and all the sizes were made up. The cylinder is drawn see-through so the piston can be seen.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: 0.15, YS: 86, L: 140 };
    var YS = o.YS, L = o.L;
    // frame: legs of a tapered A-shape with a slot open at the bottom, flared cap on top. z -20..20, y -112..66.
    var fs = new T.Shape();
    [[-70, -112], [-13, -112], [-13, 10], [13, 10], [13, -112], [70, -112], [42, 50], [52, 50], [52, 66], [-52, 66], [-52, 50], [-42, 50]].forEach(function (p, k) { if (k) fs.lineTo(p[0], p[1]); else fs.moveTo(p[0], p[1]); });
    var fg = new T.ExtrudeGeometry(fs, { depth: 40, bevelEnabled: false }); fg.translate(0, 0, -20);
    scene.add(P.mesh(fg, c.fixed));
    // base plate with a hole for the piston rod: x -95..95, y -122..-112, z -30..30. The frame stands on its top face.
    c.shell(P.at(P.guideBlock({ w: 190, h: 10, d: 60, hole: 6.5, material: c.fixed }), 0, -117, 0, scene));
    // cylinder: open tube under the base, y -222..-122, radius 30 (base is its cover)
    c.shell(P.at(P.mesh(new T.CylinderGeometry(30, 30, 100, 40, 1, true), c.fixed), 0, -172, 0, scene));
    c.shell(P.at(P.cylY(30, 1, c.fixed), 0, -222.5, 0, scene), "closed");          // closed view: bottom cover y -223..-222, under the tube
    // bearing on the cap: foot y 66, shaft axis y 86, z -15..15
    P.at(P.bearingBlock({ bore: 6.8, outer: 16, width: 30, drop: 20, material: c.fixed }), 0, YS, 0, scene);

    // crank group: shaft z -42..22, flywheel z -43..-27, hub z 19..25, arm z 19.5..24.5
    var mc = c.mat("crank"), cr = o.crank = new T.Group(); cr.position.set(0, YS, 0); scene.add(cr);
    P.at(P.cylZ(6, 64, mc), 0, 0, -10, cr);
    var fw = P.pulley({ radius: 125, width: 16, rim: 9, spokes: 6, hub: 14, material: mc });
    fw.spokes[0].material = c.mat("crank", "dark");
    P.at(fw, 0, 0, -35, cr);
    P.at(P.cylZ(10, 6, mc), 0, 0, 22, cr);
    o.arm = P.at(P.box(1, 12, 5, mc), 0, 0, 22, cr);
    o.cpin = P.at(P.cylZ(4, 14, mc), 0, 0, 27, cr);                              // z 20..34
    o.boss1 = P.at(P.cylZ(7, 6, c.mat("rod")), 0, 0, 29, scene);                 // rod eyes z 26..32
    o.boss2 = P.at(P.cylZ(7, 6, c.mat("rod")), 0, 0, 29, scene);
    o.link = P.rod(2.5, c.mat("rod")); scene.add(o.link);

    // slide in the slot: x -12..12, y -20..20, z -17..17 (slot walls at +-13, frame faces at z +-20)
    var sl = o.slide = new T.Group(); scene.add(sl);
    P.at(P.box(24, 40, 34, c.mat("slide")), 0, 0, 0, sl);
    P.at(P.cylZ(5, 24, c.mat("wrist", "mark")), 0, 0, 22, sl);                   // z 10..34
    P.at(P.cylY(6, 110, c.mat("piston")), 0, -65, 0, sl);                         // y -120..-10
    P.at(P.cylY(28, 8, c.mat("piston")), 0, -120, 0, sl);                         // piston y -124..-116, inside the tube
  },

  step: function (c, dt, S) {
    var o = this.o, r = +S.controls.r;
    o.th += S.w * dt;
    var px = r * Math.cos(o.th), py = o.YS + r * Math.sin(o.th);
    var yc = py - Math.sqrt(o.L * o.L - px * px);
    o.crank.rotation.z = o.th;
    o.arm.position.x = r / 2; o.arm.scale.x = r; o.cpin.position.x = r;
    o.slide.position.y = yc;
    o.boss1.position.set(px, py, 29); o.boss2.position.set(0, yc, 29);
    o.link.span(px, py, 29, 0, yc, 29);
    function sg(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " mm"; }
    S.set("p", sg(yc - (o.YS - o.L)));
    S.set("t", Math.round(Math.asin(px / o.L) * 180 / Math.PI) + "°");
    S.set("s", Math.round(2 * r) + " mm");
  }
});
