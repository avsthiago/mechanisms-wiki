M507.define({
  number: 266,
  title: "Differential screw",
  lede: "One shaft carries two screws with threads of different spacing. Turning the shaft moves a sliding bearing by only the small difference between them. It gives a very fine, slow and strong push from an ordinary crank.",
  alt: "A level shaft with a crank on its left end. A screw near the left runs through a tall bearing fixed to a base. A second screw near the right runs through a smaller bearing that sits loose on the base and can slide.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Shaft and screws", note: "One shaft with two screws on it. The left thread is spaced a little wider than the right one. The dark stripe shows it turning." },
    { key: "fixed", color: "#4FA58A", name: "Fixed bearing", note: "A nut fixed to the base. As the shaft turns in it, the whole shaft screws itself along." },
    { key: "slide", color: "#C8873A", name: "Sliding bearing", note: "A nut that can slide on the base but cannot turn. Watch the red line on its foot creep along." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the shaft." }
  ],
  controls: [{ id: "p2", label: "Right screw", value: "12", options: [["14", "Same thread"], ["12", "A little finer"], ["8", "Much finer"]] }],
  readouts: [{ id: "s", label: "Shaft moved" }, { id: "b", label: "Bearing moved" }, { id: "t", label: "Per turn" }],
  views: { "3d": [200, 150, 330], front: [0, 35, 360], top: [0, 380, 1] },
  target: [0, 30, 0],
  how: [
    "Turn the crank and the shaft screws itself through the fixed bearing, so the whole shaft slides along. The right screw turns inside the sliding bearing at the same time. The sliding bearing moves too, but much less than the shaft.",
    "Each turn, the left screw carries the shaft forward by one wide thread space. In the same turn the right screw pulls the sliding bearing back by one narrow thread space. What is left over is the small difference between the two, so the bearing creeps.",
    "Try Same thread and the sliding bearing stays still while the shaft moves. Then try A little finer and Much finer, and watch the red line."
  ],
  note: "This model is rebuilt from Brown's drawing. The thread spacings and sizes were made up. Brown does not show how the sliding bearing is kept from turning; here it just rests on the base. A real shaft can only screw so far, so the model turns the crank the other way at each end of its travel.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, Y = 46, P1 = 14;
    var o = this.o = { th: 0, dir: 1, xs: 0, xb: 0, P1: P1, s2: {} };
    function screw(pitch, len, key) {   // tip r 9.5, root r 5 (thread sunk into a core of r 5)
      return P.worm({ radius: 7, pitch: pitch, length: len, addendum: 2.5, dedendum: 2, material: c.mat(key) });
    }
    // shaft group: slides by xs and turns about X
    o.sh = new T.Group(); o.sh.position.y = Y; scene.add(o.sh);
    P.at(P.cylX(4.5, 209, c.mat("shaft")), -7.5, 0, 0, o.sh);                  // plain shaft x -112..97, r 4.5, inside the screw cores (r 5)
    P.at(screw(P1, 75, "shaft"), -72.5, 0, 0, o.sh);                            // left screw x -110..-35
    [14, 12, 8].forEach(function (p) { o.s2[p] = P.at(screw(p, 70, "shaft"), 60, 0, 0, o.sh); });   // right screw x 25..95, one per thread spacing
    P.at(P.box(50, 1, 2, c.mat("shaft", "dark")), -5, 5, 0, o.sh);             // dark stripe x -30..20, y 4.5..5.5 on top of the plain shaft
    P.at(P.box(6, 44, 10, c.mat("crank")), -115, 12, 0, o.sh);                  // crank arm x -118..-112, y -10..34 from the axis; shaft ends on its face
    P.at(P.cylX(3.5, 20, c.mat("crank")), -128, 30, 0, o.sh);                   // handle x -138..-118, on the arm face
    P.at(P.sphere(5, c.mat("crank")), -140, 30, 0, o.sh);                       // knob, centre x -140, overlaps the handle end

    // fixed bearing (a nut on the base): upright x -82..-60, y 0..71, z -14..14, bored at y 46
    var fb = P.guideBlock({ w: 71, h: 22, d: 28, hole: 10, hx: 10.5, material: c.mat("fixed") });
    fb.rotation.z = Math.PI / 2; P.at(fb, -71, 35.5, 0, scene);                 // local x becomes y: centre 35.5 + 10.5 = 46
    P.at(P.box(60, 4, 28, c.mat("fixed")), -30, 2, 0, scene);                   // foot x -60..0, y 0..4, on the base top and the upright's face

    // sliding bearing: foot x 22..85, y 0..10; upright x 42..64, y 10..66, bored at y 46
    o.sl = new T.Group(); scene.add(o.sl);
    P.at(P.box(63, 10, 36, c.mat("slide")), 53.5, 5, 0, o.sl);                  // foot y 0..10 sits on the base top
    var sb = P.guideBlock({ w: 56, h: 22, d: 24, hole: 10, hx: 8, material: c.mat("slide") });
    sb.rotation.z = Math.PI / 2; P.at(sb, 53, 38, 0, o.sl);                     // y 10..66, hole at 38 + 8 = 46
    P.at(P.box(1.2, 9, 1, c.mat("slide", "mark")), 53, 5, 18.5, o.sl);          // red line on the foot front, z 18..19

    P.at(P.box(260, 12, 60, c.fixed), 0, -6, 0, scene);                         // base x -130..130, y -12..0, z -30..30
  },

  step: function (c, dt, S) {
    var o = this.o, p2 = +S.controls.p2 || 12, k;
    for (k in o.s2) o.s2[k].visible = +k === p2;
    var d = o.dir * S.w * dt, xs = o.xs + o.P1 * d / (2 * Math.PI), xb = o.xb + (o.P1 - p2) * d / (2 * Math.PI), rel = xb - xs;
    // limits: shaft travel, bearing on the base, bearing kept fully on the right screw (rel -16..30)
    if (xs > 28 || xs < -28 || xb > 20 || xb < -20 || rel > 30 || rel < -16) { o.dir = -o.dir; }
    else { o.th += d; o.xs = xs; o.xb = xb; }
    o.sh.position.x = o.xs; o.sh.rotation.x = o.th;   // right-hand thread: turning +th about X screws the shaft toward +X
    o.sl.position.x = o.xb;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : (v > 0 ? "+" : "") + v) + " mm"; }
    S.set("s", f(o.xs));
    S.set("b", f(o.xb));
    S.set("t", (o.P1 - p2) + " mm");
  }
});
