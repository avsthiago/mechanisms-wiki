M507.define({
  number: 268,
  title: "Crank and swinging rod",
  lede: "A long rod is joined to a turning crank at one end. Near its other end it slides through a guide that can swing. As the crank goes round, the rod slides back and forth through the guide and its far end swings up and down.",
  alt: "A round disc on the right carries a crank with a pin. A long straight rod is joined to the pin and slides through a small swinging guide at the left, beside a round roller. The far end of the rod is cut off.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Crank disc", note: "A disc with a short arm and a pin on its face. It turns steadily and carries the near end of the rod round in a circle." },
    { key: "rod", color: "#D9B13B", name: "Rod", note: "A long bar joined to the pin. It slides through the guide and tilts. Watch the red end swing up and down." },
    { key: "guide", color: "#4FA58A", name: "Swinging guide", note: "A block on a pin. It holds the rod, turns a little as the rod tilts, and lets the rod slide through it. The wheel beside it stays still." }
  ],
  controls: [{ id: "arm", label: "Crank arm", value: "mid", options: [["short", "Short"], ["mid", "Medium"], ["long", "Long"]] }],
  readouts: [{ id: "h", label: "Rod end height" }, { id: "s", label: "Rod sliding" }],
  views: { "3d": [-60, 120, 780], front: [-200, 0, 750], side: [800, 10, 0] },
  target: [-230, 5, 0],
  distance: [400, 2200],
  how: [
    "The pin on the crank goes round in a circle. The rod is joined to the pin, so its near end goes round too. But the rod must pass through the guide, so it cannot just follow the pin. It tilts, and it slides through the guide at the same time.",
    "When the pin is high, the far end of the rod is low. When the pin is low, the far end is high. The guide works like the middle of a see-saw. The rod also slides a little in and out of the guide, because the pin is sometimes nearer to it and sometimes farther away.",
    "Try the three crank arms. A longer arm makes a bigger circle for the pin, so the far end of the rod swings through a bigger arc."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown also draws the rod in a second position with dotted lines; the model shows that by moving. The base, the posts, the pin that holds the guide, the sizes and the three crank arms were made up. In the drawing the wheel is only a stand beside the guide, so here it stays still.",

  // Units are the engraving's pixels. Crank centre at the origin. Plate z -40..-30; everything turns in front of it.
  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, PIV = { x: -380, y: 48 }, ZR = 22, LR = 520;
    var o = this.o = { a: 0, L0: Math.sqrt(PIV.x * PIV.x + PIV.y * PIV.y), PIV: PIV, ZR: ZR, LR: LR, arms: {} };
    // crank disc z -8..8, shaft z -30..8
    P.at(P.cylZ(72, 16, c.mat("crank")), 0, 0, 0, scene);
    P.at(P.cylZ(7, 38, c.mat("crank")), 0, 0, -11, scene);                          // shaft z -30..8
    [["short", 32], ["mid", 57], ["long", 64]].forEach(function (s) {
      var g = new T.Group(); scene.add(g);
      P.at(P.armPlate({ length: s[1], r0: 13, r1: 11, thick: 6, material: c.mat("crank") }), 0, 0, 11, g);   // z 8..14, on the disc face
      P.at(P.cylZ(8, 16, c.mat("crank")), s[1], 0, 22, g);                          // pin z 14..30
      P.at(P.cylZ(5, 1.5, c.mat("crank", "dark")), 0, 0, 14.75, g);                  // hub dot z 14..15.5
      o.arms[s[0]] = { g: g, r: s[1] };
    });
    o.rod = P.at(P.rod(6, c.mat("rod")), 0, 0, 0, scene);
    o.tip = P.at(P.rod(6.7, c.mat("rod", "mark")), 0, 0, 0, scene);                   // red band on the far end
    // swinging guide: pin from the plate to the block, block turns with the rod
    P.at(P.cylZ(5, 40, c.mat("guide")), PIV.x, PIV.y, -10, scene);                  // z -30..10
    o.block = P.at(P.guideBlock({ w: 28, h: 22, d: 24, hole: 6.6, material: c.mat("guide") }), PIV.x, PIV.y, ZR, scene);   // z 10..34
    // the wheel beside it, still (as drawn)
    P.at(P.cylZ(32, 16, c.mat("guide")), -380, -3, 0, scene);
    P.at(P.cylZ(6, 38, c.mat("guide")), -380, -3, -11, scene);                      // axle z -30..8
    P.at(P.cylZ(10, 4, c.mat("guide")), -380, -3, 10, scene);                       // hub z 8..12
    // supports
    P.at(P.box(700, 240, 10, c.fixed), -225, 0, -35, scene);                          // plate x -575..125, y -120..120, z -40..-30
    P.at(P.box(740, 12, 90, c.fixed), -225, -126, -30, scene);                        // base x -595..145, y -132..-120, z -75..15
  },

  step: function (c, dt, S) {
    var o = this.o, A = o.arms[S.controls.arm] || o.arms.mid, k, px, py, vx, vy, L, ex, ey;
    o.a += S.w * dt;
    for (k in o.arms) o.arms[k].g.visible = o.arms[k] === A;
    var th = 70 * Math.PI / 180 + o.a;
    A.g.rotation.z = th;
    px = A.r * Math.cos(th); py = A.r * Math.sin(th);
    vx = o.PIV.x - px; vy = o.PIV.y - py; L = Math.sqrt(vx * vx + vy * vy); ex = vx / L; ey = vy / L;
    var tx = px + ex * o.LR, ty = py + ey * o.LR;
    o.rod.span(px, py, o.ZR, tx, ty, o.ZR);
    o.tip.span(tx + ex * 0.6, ty + ey * 0.6, o.ZR, tx - ex * 36, ty - ey * 36, o.ZR);
    o.block.position.set(o.PIV.x, o.PIV.y, o.ZR);
    o.block.rotation.z = Math.atan2(ey, ex) - Math.PI / 2;
    S.set("h", Math.round(ty) + " mm");
    S.set("s", Math.round(L - o.L0) + " mm");
  }
});
