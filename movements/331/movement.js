M507.define({
  number: 331,
  title: "Slotted cross-head engine",
  lede: "A crank pin works in a slot cut across the cross-head. The pin slides along the slot while it pushes the cross-head up and down. The cross-head runs between two upright pillars, so it can only move straight.",
  alt: "An engine frame with two upright pillars and a cross-beam on top. A wide block with a long slot slides up and down between the pillars. A crank pin sits in the slot, and a large flywheel stands behind.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Flywheel and crank", note: "A heavy wheel on a shaft, with a short arm. The weight of the wheel keeps the crank turning evenly." },
    { key: "wrist", color: "#C2503F", name: "Crank pin", note: "The pin on the end of the arm. Watch it go round and slide to and fro in the slot." },
    { key: "yoke", color: "#C8873A", name: "Slotted cross-head", note: "A wide block with a long slot. The pillars on each side hold it, so it only goes up and down." },
    { key: "piston", color: "#4FA58A", name: "Piston rod and piston", note: "Goes down from the cross-head through the base into the cylinder." }
  ],
  controls: [{ type: "range", id: "r", label: "Crank throw", min: 14, max: 34, step: 1, value: 30, unit: " mm",
    presets: [[14, "Short"], [24, "Medium"], [34, "Long"]] }],
  readouts: [{ id: "y", label: "Cross-head" }, { id: "x", label: "Pin in slot" }, { id: "s", label: "Stroke" }],
  closed: { label: "Cylinder" },
  views: { "3d": [320, 120, 560], front: [0, -20, 640], side: [620, -20, -10] },
  target: [0, -20, -10],
  how: [
    "The crank pin goes round in a circle. The slot is just wide enough for the pin. The pin can slide to and fro along the slot, but it pushes the cross-head up and down.",
    "There is no connecting rod, so nothing leans and nothing pushes the cross-head sideways. The cross-head goes fastest when the pin is level with the shaft. It stops for a moment when the pin is at its highest and lowest points.",
    "Try a short throw, then a long one. Watch how far the cross-head goes, and how far the pin slides along the slot. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The cylinder, its cover, the base, the beam that carries the shaft, the crank arm and all the sizes were made up. The crossed braces between the pillars are left out so the crank can be seen. The cylinder is see-through so the piston can be seen.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: 0.25 };
    // pillars x +-(57..77), y -110..66, z -34..12. Entablature x -85..85, y 66..82, same z. Slab y -120..-110.
    [-1, 1].forEach(function (s) { P.at(P.box(20, 176, 46, c.fixed), s * 67, -22, -11, scene); });
    P.at(P.box(170, 16, 46, c.fixed), 0, 74, -11, scene);
    P.at(P.guideBlock({ w: 190, h: 10, d: 70, hole: 6.5, hz: 10, material: c.fixed }), 0, -115, -10, scene);   // x -95..95, z -45..25
    c.shell(P.at(P.mesh(new T.CylinderGeometry(30, 30, 80, 40, 1, true), c.fixed), 0, -160, 0, scene));               // tube y -200..-120
    c.shell(P.at(P.cylY(30, 2, c.fixed), 0, -201, 0, scene), "closed");                                         // closed view: bottom cover y -202..-200
    // girder between the pillars at the back: x -57..57, y -44..-30, z -34..-18; bearing stands on it (foot y -30), z -34..-18
    P.at(P.box(114, 14, 16, c.fixed), 0, -37, -26, scene);
    P.at(P.bearingBlock({ bore: 6.8, outer: 16, width: 16, drop: 30, material: c.fixed }), 0, 0, -26, scene);

    // crank: shaft z -62..-16, flywheel z -64..-48, hub z -17..-11, arm z -16.5..-11.5, pin z -16..12
    var mc = c.mat("crank"), cr = o.crank = new T.Group(); scene.add(cr);
    P.at(P.cylZ(6, 46, mc), 0, 0, -39, cr);
    var fw = P.pulley({ radius: 125, width: 16, rim: 9, spokes: 6, hub: 14, material: mc });
    fw.spokes[0].material = c.mat("crank", "dark");
    P.at(fw, 0, 0, -56, cr);
    P.at(P.cylZ(13, 6, mc), 0, 0, -14, cr);
    o.arm = P.at(P.box(1, 16, 5, mc), 0, 0, -14, cr);
    o.pin = P.at(P.cylZ(9, 28, c.mat("wrist", "mark")), 0, 0, -2, cr);
    o.dot = P.at(P.cylZ(3, 1, c.mat("wrist", "dark")), 0, 0, 12.5, cr);

    // cross-head: block x -56..56, y -22..22 with a lug below, z -10..10; slot x +-46, y +-9.5
    var ys = o.yoke = new T.Group(); scene.add(ys);
    var sh = new T.Shape();
    [[-56, 22], [56, 22], [56, -22], [15, -22], [15, -34], [-15, -34], [-15, -22], [-56, -22]].forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
    var hole = new T.Path(); hole.moveTo(-46, -9.5); hole.lineTo(46, -9.5); hole.lineTo(46, 9.5); hole.lineTo(-46, 9.5); hole.closePath(); sh.holes.push(hole);
    var gy = new T.ExtrudeGeometry(sh, { depth: 20, bevelEnabled: false }); gy.translate(0, 0, -10);
    ys.add(P.mesh(gy, c.mat("yoke")));
    P.at(P.cylY(6, 132, c.mat("piston")), 0, -94, 0, ys);                         // y -160..-28
    P.at(P.cylY(28, 8, c.mat("piston")), 0, -160, 0, ys);                         // piston y -164..-156
  },

  step: function (c, dt, S) {
    var o = this.o, r = +S.controls.r;
    o.th += S.w * dt;
    var px = r * Math.cos(o.th), py = r * Math.sin(o.th);
    o.crank.rotation.z = o.th;
    o.arm.position.x = r / 2; o.arm.scale.x = r; o.pin.position.x = r; o.dot.position.x = r;
    o.yoke.position.y = py;
    function sg(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " mm"; }
    S.set("y", sg(py));
    S.set("x", sg(px));
    S.set("s", Math.round(2 * r) + " mm");
  }
});
