M507.define({
  number: 503,
  title: "Simple epicyclic bevel train",
  lede: "Two bevel gears face each other on one shaft, with a third gear between them on an arm. The arm always turns at the average of the two gears' speeds. Car axles use the same idea to let the two gears turn at different speeds in a bend.",
  alt: "An upright shaft with a big bevel gear near its top, facing down, and another near its bottom, facing up. Both are loose on the shaft. Between them an arm sticks out sideways from the shaft and carries a smaller bevel gear that meshes with both.",
  parts: [
    { key: "top", color: "#5E7387", name: "Upper gear", note: "Loose on the shaft. Its speed is set by the speed slider. The peg on its back shows it turning." },
    { key: "bottom", color: "#C8873A", name: "Lower gear", note: "Also loose on the shaft. The control sets whether it is held, or turns with or against the upper gear." },
    { key: "side", color: "#D9B13B", name: "Side gear", note: "Turns freely on the arm and touches both big gears. It spins on the arm only when the two big gears move differently." },
    { key: "arm", color: "#4FA58A", name: "Arm and shaft", note: "The arm is fixed to the upright shaft, so they turn together. Watch the red nut on the end of the arm." }
  ],
  controls: [{ id: "bottom", label: "Lower gear", value: "held", options: [["held", "Held still"], ["same", "Same way as the top"], ["other", "Other way"]] }],
  readouts: [{ id: "t", label: "Upper gear" }, { id: "b", label: "Lower gear" }, { id: "a", label: "Arm" }],
  speed: { min: 1, max: 30, value: 8, label: "Upper gear speed", unit: " rpm" },
  views: { "3d": [198, 100, 425], front: [0, 0, 480], side: [480, 30, 40] },
  target: [0, -8, 0],
  how: [
    "The upper gear turns and the lower gear is held still. The side gear is squeezed between them. It rolls on the still gear and is pushed along by the moving one, so it travels round and takes the arm with it.",
    "A rolling gear moves forward at half the speed of its top edge. In the same way, the arm goes round at half the speed of the upper gear. In general the arm's speed is halfway between the speeds of the two big gears.",
    "Try Same way as the top. Both gears now agree, so the side gear stops spinning and everything turns together. Then try Other way. The two speeds cancel, the arm stands still, and the side gear just spins on it."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show what turns the two big gears; here they simply turn at the speeds you choose. The step the shaft stands on, the base, the collars, the pegs on the gears, the sizes and the number of teeth were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 75, NC = 24, NB = 14, r = R * NB / NC;   // side wheel radius 43.75
    var o = this.o = { aD: 0, aC: 0, ND: NC, NC: NC, NB: NB };
    var X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), big = Math.atan2(R, r) * 180 / Math.PI;   // cone half-angles 59.74 and 30.26 degrees
    function gear(key, parent, ax, xl, o2) {             // bevel gear with its cone point where the arm crosses the shaft
      var h = new T.Group(), g = P.bevelGearCone({ radius: o2.radius, teeth: o2.teeth, cone: o2.cone, addendum: 6, hub: o2.hub, hubLength: 16, material: c.mat(key) });
      P.frame(h, xl, ax); parent.add(h); h.add(g); return g;
    }
    o.D = gear("top", scene, Y, X, { radius: R, teeth: NC, cone: big, hub: 16 });                           // top wheel, hub back at y 64.93
    o.C = gear("bottom", scene, new T.Vector3(0, -1, 0), X, { radius: R, teeth: NC, cone: big, hub: 16 });  // bottom wheel, hub back at y -64.93
    var yb = o.D.backY;                                                      // 43.75 + 5.18 + 16 = 64.93
    P.at(P.cylY(4, 9, c.mat("top", "dark")), 55, yb - 4, 0, o.D);            // peg standing on the sloping back of the top wheel
    P.at(P.cylY(4, 9, c.mat("bottom", "dark")), 55, yb - 4, 0, o.C);         // the same under the bottom wheel
    var arm = o.arm = new T.Group(); scene.add(arm);
    P.at(P.cylY(8, 220, c.mat("arm")), 0, 0, 0, arm);                        // shaft y -110..110, stands on the step
    P.at(P.cylY(15, 62, c.mat("arm")), 0, 0, 0, arm);                        // boss y -31..31, between the wheels' inner faces (y -33.3 and 33.3)
    P.at(P.cylY(14, 8, c.mat("arm")), 0, -yb - 4, 0, arm);                   // collar y -72.93..-64.93, the bottom wheel rests on it
    P.at(P.cylY(14, 8, c.mat("arm")), 0, yb + 4, 0, arm);                    // collar y 64.93..72.93, on the top wheel's hub
    o.B = gear("side", arm, X, Y, { radius: r, teeth: NB, cone: 90 - big, hub: 14 });                       // side wheel on the arm, hub back at x 94.02
    P.at(P.cylY(3.5, 8, c.mat("side", "dark")), 30, o.B.backY - 3, 0, o.B);  // peg on the back of the side wheel
    P.at(P.cylX(8, 98, c.mat("arm")), 49, 0, 0, arm);                        // arm x 0..98
    P.at(P.cylX(12, 7, c.mat("arm", "mark")), 101.5, 0, 0, arm);             // red nut x 98..105, on the arm's end, 4 clear of the side wheel's hub
    // supports: a step under the shaft, on a base
    P.at(P.cylY(20, 14, c.fixed), 0, -117, 0, scene);                        // step y -124..-110; the shaft ends on its top
    P.at(P.box(200, 12, 200, c.fixed), 0, -130, 0, scene);                   // base y -136..-124
    o.pB = o.B.rotation.y = P.meshTurn(o.D, o.B);
    o.pC = o.C.rotation.y = P.meshTurn(o.B, o.C);
    o.pairs = [[o.D, o.B], [o.B, o.C]];
  },

  step: function (c, dt, S) {
    var o = this.o, m = S.controls.bottom, kC = m === "same" ? 1 : m === "other" ? -1 : 0, e = o.NC / o.ND;
    o.aD += S.w * dt; o.aC += S.w * kC * dt;
    // seen from the arm the two big wheels turn opposite ways: (top - arm) = -e (bottom - arm), so arm = (top + e bottom) / (1 + e)
    var th = (o.aD + e * o.aC) / (1 + e), spin = (th - o.aD) * o.ND / o.NB;
    o.D.rotation.y = o.aD;
    o.C.rotation.y = o.pC - o.aC;                        // its own axis points down, so the sign flips
    o.arm.rotation.y = th;
    o.B.rotation.y = o.pB + spin;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("t", f(rpm));
    S.set("b", f(rpm * kC));
    S.set("a", f(rpm * (1 + e * kC) / (1 + e)));
  }
});
