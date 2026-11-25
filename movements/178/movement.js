M507.define({
  number: 178,
  title: "Variable speed for a slotting tool",
  lede: "A crank turns at a steady speed, but its sliding block is held by a round slot that sits off to one side of the shaft. As the crank turns, it gets longer and shorter. The tool slide moves slowly while it cuts and quickly on the way back, so little time is wasted.",
  alt: "A big round plate with a circular groove. A long slotted crank stands upright from a shaft near the bottom of the groove. A red block slides in the crank slot and in the groove. A connecting rod runs from the end of the crank to a tool slide at the far left, which rides between two rails.",
  parts: [
    { key: "crank", color: "#5E7387", name: "Slotted crank", note: "A long bar with a slot along it. It is fixed to the shaft and turns at a steady speed. It is the only part that is driven." },
    { key: "block", color: "#C2503F", name: "Sliding block", note: "The red block sits in the crank slot and in the round groove at once. Watch how far it is from the shaft as it goes round." },
    { key: "slot", color: "#4FA58A", name: "Circular slot", note: "A round groove in the fixed plate. Its centre is off to one side of the shaft, so the block is near the shaft on one side and far from it on the other." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "A long bar. One end is pinned to the end of the sliding bar on the crank. The other end pulls the tool slide." },
    { key: "slide", color: "#C8873A", name: "Tool slide", note: "A carriage that moves in a straight line between two rails. It carries the cutting tool." }
  ],
  controls: [{ type: "range", id: "e", label: "Slot offset", min: 0, max: 42, step: 1, value: 42, unit: " mm",
    presets: [[0, "None"], [21, "Small"], [42, "Big"]], pauseOnInput: false }],
  readouts: [{ id: "x", label: "Slide" }, { id: "s", label: "Stroke" }],
  opacity: function (key) { return 1; },
  views: { "3d": [174, 147, 576], front: [-95, 0, 620], side: [800, 40, 0] },
  target: [-95, 0, 0],
  how: [
    "The crank turns round at a steady speed. A red block rides in the crank slot. The block is also held in a round groove in the fixed plate. The groove is not centred on the shaft.",
    "Near the bottom of the groove the block is close to the shaft, so the crank is short there and the rod moves slowly. This is the cutting stroke. On the far side the block is far from the shaft, so the crank is long and the rod moves fast. This is the return. The crank itself never changes speed.",
    "Slide the offset to None and the block stays the same distance from the shaft. Then try Small and Large. Watch the Stroke reading and how the tool slide speeds up and slows down."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the slotted crank, the round groove and the start of a rod. The back plate, the rails, the tool slide, the cutting bit, the rod length and the base were made up. The sliding bar that carries the rod pin is drawn along the crank slot. The offset control was added for comparison.",

  K: { R: 150, L: 400, YS: 190, OFF: 40 },

  // block distance from the shaft: where the crank line meets the groove (centre e above the shaft), then the rod pin and the slide
  solve: function (th, e) {
    var K = this.K, ux = Math.cos(th), uy = Math.sin(th), su = -e * uy;
    var d = -su + Math.sqrt(su * su - e * e + K.R * K.R);
    var px = (d + K.OFF) * ux, py = (d + K.OFF) * uy, dy = K.YS - py;
    return { d: d, ux: ux, uy: uy, px: px, py: py, xs: px - Math.sqrt(K.L * K.L - dy * dy) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, K = this.K, scene = c.scene, R = K.R;
    var o = this.o = { th: Math.PI / 2, e: -1, prev: null, lo: 0, cut: 1, dir: 1 };
    var root = new T.Group(); root.scale.set(.5, .5, .5); scene.add(root); o.root = root;
    // back plate x -660..280, y -300..300, z -34..-28; disc R 260 z -28..-24 (face z -24); base y -312..-300 touches the plate bottom
    P.at(P.box(940, 600, 6, c.fixed), -190, 0, -31, root);
    P.at(P.cylZ(260, 4, c.fixed), 0, 0, -26, root);
    P.at(P.box(400, 12, 60, c.fixed), -200, -306, -20, root);                           // x -400..0, y -312..-300, z -50..10
    P.at(P.hoop(222, 1.5, c.fixed), 0, 0, -24, root);                                   // engraved ring on the disc face
    // circular slot: a dark floor 0.5 above the face, and two raised rims; moves up by the offset
    o.slot = new T.Group(); root.add(o.slot);
    var fl = P.mesh(new T.RingGeometry(R - 8.5, R + 8.5, 96), c.mat("slot", "dark")); fl.position.z = -23.5; o.slot.add(fl);
    P.at(P.hoop(R - 12, 3.5, c.mat("slot")), 0, 0, -21.5, o.slot);                           // rims z -25..-18, channel width 17 between them
    P.at(P.hoop(R + 12, 3.5, c.mat("slot")), 0, 0, -21.5, o.slot);
    // crank, local +x along the crank. hub z -24..-8, rails z -10..-4, slot half width 9
    o.crank = new T.Group(); root.add(o.crank);
    var m = c.mat("crank");
    P.at(P.cylZ(26, 16, m), 0, 0, -16, o.crank);
    P.at(P.box(40, 50, 6, m), -8, 0, -7, o.crank);                                       // x -28..12
    P.at(P.box(278, 15, 6, m), 151, 16.5, -7, o.crank);                                   // x 12..290, y 9..24
    P.at(P.box(278, 15, 6, m), 151, -16.5, -7, o.crank);                                  // y -24..-9
    P.at(P.box(8, 50, 6, m), 294, 0, -7, o.crank);                                       // end x 290..298
    P.at(P.cylZ(11, 1, c.mat("crank", "dark")), 0, 0, -3.2, o.crank);
    // slide block and its bar, in the crank slot
    o.blk = new T.Group(); o.crank.add(o.blk);
    P.at(P.box(24, 14, 17.5, c.mat("block")), 0, 0, -13.75, o.blk);                      // z -22.5..-5, floor of the slot at -23.5
    P.at(P.box(47, 13.6, 6, c.mat("block")), 23.5, 0, -7, o.blk);                         // x 0..47, z -10..-4
    P.at(P.cylZ(6, 22.5, c.mat("rod")), K.OFF, 0, 1.75, o.blk);                             // pin z -10..13
    // tool slide: carriage z -10..4 between rails z -10..2; rails y 202.5..212.5 and 167.5..177.5
    [207.5, 172.5].forEach(function (y) {
      P.at(P.box(575, 10, 12, c.fixed), -347.5, y, -4, root);                            // x -635..-60
      [-631, -64].forEach(function (x) { P.at(P.box(8, 10, 18, c.fixed), x, y, -19, root); });   // posts z -28..-10
    });
    o.car = new T.Group(); root.add(o.car);
    P.at(P.box(60, 24, 14, c.mat("slide")), -22, 0, -3, o.car);                          // x -52..8, y -12..12
    P.at(P.box(14, 10, 10, c.mat("slide", "dark")), -59, -7, -3, o.car);                 // cutting bit x -66..-52
    P.at(P.cylZ(4.5, 14, c.mat("rod")), 0, 0, 5, o.car);                                  // hinge z -2..12
    o.rod = P.rod(3.5, c.mat("rod")); root.add(o.rod);
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, e = 2 * (+S.controls.e), i;
    if (e !== o.e) {                                  // slide range, and which direction is the slow one
      o.e = e; var lo = 1e9, nl = 0, nr = 0, pv = null;
      for (i = 0; i <= 720; i++) { var x = this.solve(i * Math.PI / 360, e).xs; lo = Math.min(lo, x); if (pv !== null) { if (x < pv) nl++; else nr++; } pv = x; }
      o.lo = lo; o.cut = nl > nr ? -1 : 1; o.prev = null;
      o.slot.position.y = e;
    }
    o.th += S.w * dt;
    var s = this.solve(o.th, e);
    o.crank.rotation.z = o.th;
    o.blk.position.x = s.d;
    o.car.position.set(s.xs, K.YS, 0);
    o.rod.span(s.px, s.py, 8, s.xs, K.YS, 8);
    if (o.prev !== null && Math.abs(s.xs - o.prev) > 1e-6) o.dir = s.xs > o.prev ? 1 : -1;
    o.prev = s.xs;
    S.set("x", Math.round((s.xs - o.lo) * .5) + " mm");
    S.set("s", o.dir === o.cut ? "Cutting" : "Returning");
  }
});
