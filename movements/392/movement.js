M507.define({
  number: 392,
  title: "Gig saw with a spring",
  lede: "A thin saw blade goes up and down through a table. A crank wheel under the table pulls the bottom of the blade. A springy arm above holds the top, so the blade stays tight without any heavy frame.",
  alt: "A saw blade standing upright through a slot in a table. Below the table a round wheel with a crank turns a rod joined to the bottom of the blade. Above, a long thin arm reaches over from the right and holds the top of the blade.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Crank wheel", note: "Turns under the table. The crank pin near its rim goes round in a circle." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "Joins the crank pin to the bottom of the blade. It swings from side to side while its top end goes straight up and down." },
    { key: "blade", color: "#C8873A", name: "Saw blade", note: "Slides up and down in two guides, one above the table and one below. Watch the red mark rise and fall." },
    { key: "arm", color: "#4FA58A", name: "Spring arm", note: "A thin strip fixed at its right end. Its left end holds the top of the blade and bends up and down with it." }
  ],
  controls: [{ type: "range", id: "stroke", label: "Length of stroke", min: 20, max: 60, step: 1, value: 52, unit: " mm", presets: [[20, "Short"], [36, "Medium"], [52, "Long"]] }],
  readouts: [{ id: "h", label: "Blade" }, { id: "n", label: "Cuts" }],
  views: { "3d": [298, 256, 583], front: [30, 120, 640], side: [650, 120, 40] },
  target: [25, 107, -2],
  how: [
    "The wheel turns. The crank pin goes round in a circle, and the rod pushes and pulls the bottom of the blade. The blade is held in guides, so it can only move straight up and down.",
    "The blade cuts on the way down and rubs on the way up, so it must never go slack. The long arm above is a spring. It pulls the top of the blade up gently and bends a little each stroke. That keeps the blade straight and tight, and there is no moving frame to carry.",
    "The blade travels twice as far as the crank pin is from the middle of the wheel. Try the Short stroke, then the Long one, and watch how much the arm has to bend."
  ],
  note: "This model is rebuilt from Brown's drawing. The base, the upright post that holds the arm, the table slot and the guides are made up so it stands. The blade is drawn plain, without teeth. A real arm would also pull the blade a tiny bit sideways as it bends. That is left out.",

  build: function (c) {
    var T = c.THREE, P = c.P, sc = c.scene, i;
    var o = this.o = { th: 0, L: 84, YT: 170, Y0: 254, AX: 123.5, N: 16 };
    // ground, upright and table (all see-through supports)
    P.at(P.box(120, 6, 36, c.fixed), 0, -47, -10, sc);                  // base: x -60..60, y -50..-44, z -28..8
    P.at(P.box(12, 172, 8, c.fixed), 0, 41, -13, sc);                   // upright behind: y -44..128, z -17..-9, holds the wheel and the table
    P.at(P.box(84, 10, 48, c.fixed), -48, 133, 0, sc);                  // table, left of the slot: x -90..-6, y 128..138
    P.at(P.box(146, 10, 48, c.fixed), 67, 133, 0, sc);                  // table, right of the slot: x -6..140
    P.at(P.box(4, 88, 16, c.fixed), -27, 84, 0, sc);                    // lower guide plates: y 40..128
    P.at(P.box(4, 88, 16, c.fixed), 27, 84, 0, sc);
    P.at(P.box(4, 86, 16, c.fixed), -27, 181, 0, sc);                   // upper guide plates: y 138..224
    P.at(P.box(4, 86, 16, c.fixed), 27, 181, 0, sc);
    P.at(P.box(10, 128, 14, c.fixed), 129, 202, 0, sc);                 // post for the spring arm: x 124..134, y 138..266
    // wheel: rim, spokes, hub, axle to the upright
    var wm = c.mat("wheel");
    o.wheel = new T.Group(); sc.add(o.wheel);
    P.at(P.hoop(39, 3, wm), 0, 0, 0, o.wheel);
    for (i = 0; i < 4; i++) { var sp = P.box(76, 5, 4, wm); sp.rotation.z = i * Math.PI / 4; o.wheel.add(sp); }
    P.at(P.cylZ(8, 10, wm), 0, 0, 0, o.wheel);                          // hub z -5..5
    P.at(P.cylZ(4, 4, wm), 0, 0, -7, sc);                               // axle z -9..-5 ends on the upright's face
    o.arm = P.at(P.rod(2.5, wm), 0, 0, 0, sc);                          // crank arm
    o.pin = P.at(P.cylZ(3, 12, c.mat("rod", "dark")), 0, 0, 10, sc);    // crank pin z 4..16
    o.con = P.at(P.rod(2.5, c.mat("rod")), 0, 0, 0, sc);                // connecting rod
    o.wrist = P.at(P.cylZ(3, 9, c.mat("rod", "dark")), 0, 0, 12.5, sc); // wrist pin z 8..17
    // blade and its two blocks
    var bm = c.mat("blade");
    o.low = P.at(P.box(44, 16, 16, bm), 0, 0, 0, sc);
    o.up = P.at(P.box(44, 14, 16, bm), 0, 0, 0, sc);
    o.blade = P.at(P.box(2, 170, 8, bm), 0, 0, 0, sc);                  // x -1..1, runs from the lower block to the arm
    o.mark = P.at(P.box(2.8, 10, 9.6, c.mat("blade", "mark")), 0, 0, 0, sc);
    // spring arm
    var pts = [], k; for (k = 0; k < o.N; k++) pts.push([-8 + (o.AX + 8) * k / (o.N - 1), o.Y0]);
    o.strip = P.at(P.flatStrip({ points: pts, thick: 3, width: 8, material: c.mat("arm") }), 0, 0, 0, sc);
  },

  step: function (c, dt, S) {
    var o = this.o, r = (+S.controls.stroke) / 2, i;
    o.th += S.w * dt;
    var a = o.th + 165 * Math.PI / 180, px = r * Math.cos(a), py = r * Math.sin(a);
    var yc = py + Math.sqrt(o.L * o.L - px * px);
    o.wheel.rotation.z = o.th;
    o.arm.span(0, 0, 8, px, py, 8);
    o.pin.position.set(px, py, 10);
    o.con.span(px, py, 14, 0, yc, 14);
    o.wrist.position.set(0, yc, 12.5);
    o.low.position.y = yc;
    o.up.position.y = yc + 96;
    o.blade.position.y = yc + 85;                       // from yc to yc + 170
    o.mark.position.y = yc + 56;
    var d = yc + o.YT - o.Y0, pts = [];                 // how far the arm's left end is lifted
    for (i = 0; i < o.N; i++) {
      var x = -8 + (o.AX + 8) * i / (o.N - 1), u = (o.AX - x) / (o.AX + 8);   // 0 at the post, 1 at the free end
      pts.push([x, o.Y0 + d * (3 * u * u - u * u * u) / 2]);
    }
    o.strip.setPoints(pts);
    S.set("h", Math.round(yc - (o.L - r)) + " mm");
    S.set("n", Math.floor(o.th / (2 * Math.PI)) + "");
  }
});
