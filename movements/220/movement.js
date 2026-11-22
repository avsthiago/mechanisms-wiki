M507.define({
  number: 220,
  title: "Offset cranks with a slot",
  lede: "Two shafts lie side by side, not in a line. A pin on one crank slides up and down a slot in the other. The first shaft turns steadily, but the second one speeds up and slows down.",
  alt: "Two parallel shafts that are shifted sideways from each other. A short crank on the near shaft carries a pin that sits in the long slot of a second crank on the far shaft.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving crank", note: "Turns at a steady speed and carries the pin round in a circle." },
    { key: "driven", color: "#C8873A", name: "Slotted crank", note: "Has a long slot. It is pushed round by the pin and turns faster and slower in each turn." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "Fixed to the driving crank and free to slide in the slot. Watch how far it is from the second shaft." }
  ],
  controls: [{ type: "range", id: "gap", label: "Gap between the shafts", min: 0, max: 40, step: 1, value: 28, unit: " mm",
    presets: [[0, "None"], [14, "Small"], [28, "Medium"], [40, "Big"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }, { id: "reach", label: "Pin reach" }],
  views: { "3d": [190, 120, 230], front: [0, 0, 400], side: [400, 0, 0] },
  target: [0, 0, 0],
  how: [
    "Watch the red pin. The driving crank carries it round in a circle. The pin sits in the slot of the second crank, so it pushes that crank round with it.",
    "As the pin goes round, it slides along the slot. Close to the second shaft it has only a short lever, so the second crank swings fast. Far from the shaft the lever is long and the crank turns slowly. So the second shaft speeds up and slows down in every turn, while the first stays steady.",
    "Try the gap slider. With no gap the shafts are in a line and both turn at the same speed. Then try a big gap and watch the Driven reading swing."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the shafts in the air, so no bearings are drawn. The two cranks lie in neighbouring flat layers and the pin is made long enough to reach through the slot. All sizes are made up. Brown shows one fixed gap, and the slider is added.",

  R: 70,
  // Exact kinematics. Driving angle th, shafts at x = -g/2 and +g/2, g < R so the slotted crank turns all the way round.
  // The pin is at R e^(i th) - g from the second shaft, so its angle is th + atan2(g sin th, R - g cos th).
  kin: function (g, th) {
    var R = this.R, phi = th + Math.atan2(g * Math.sin(th), R - g * Math.cos(th));
    var s2 = R * R - 2 * g * R * Math.cos(th) + g * g;
    return { phi: phi, ratio: (R * R - g * R * Math.cos(th)) / s2, s: Math.sqrt(s2) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, R = this.R, o = this.o = { th: Math.acos(28 / R), Y: -40 };
    // driving crank: plate z 0..8, shaft from the plate's near face z = 8 out to z = 108
    o.g1 = new T.Group(); c.scene.add(o.g1);
    P.at(P.armPlate({ length: R, r0: 18, r1: 11, thick: 8, material: c.mat("drive") }), 0, 0, 4, o.g1);
    P.at(P.cylZ(7, 100, c.mat("drive")), 0, 0, 58, o.g1);                                   // z 8..108
    P.at(P.box(3, 1, 70, c.mat("drive", "dark")), 0, 8, 62, o.g1);                          // stripe 0.5 off the shaft, z 27..97
    // slotted crank: plate z -10..-2, shaft from its far face z = -10 back to z = -110
    o.g2 = new T.Group(); c.scene.add(o.g2);
    o.slot = P.armPlate({ length: 140, r0: 20, r1: 16, thick: 8, slot: { from: 22, to: 118, width: 12 }, material: c.mat("driven") });
    P.at(o.slot, 0, 0, -6, o.g2);
    P.at(P.cylZ(7, 100, c.mat("driven")), 0, 0, -60, o.g2);                                 // z -110..-10
    P.at(P.box(3, 1, 70, c.mat("driven", "dark")), 0, 8, -62, o.g2);                        // stripe, z -97..-27
    // crank pin: body z -10..9 through the slot, head z -11.5..-10 on the far face
    o.pin = new T.Group(); c.scene.add(o.pin);
    P.at(P.cylZ(4, 19, c.mat("pin", "mark")), 0, 0, -.5, o.pin);                       // z -10..9
    P.at(P.cylZ(5.5, 1.5, c.mat("pin", "mark")), 0, 0, 8.75, o.pin);                   // cap on the near face, z 8..9.5
    P.at(P.cylZ(6.5, 1.5, c.mat("pin", "mark")), 0, 0, -10.75, o.pin);
  },

  step: function (c, dt, S) {
    var o = this.o, g = +S.controls.gap, R = this.R, Y = o.Y;
    o.th += S.w * dt;
    var k = this.kin(g, o.th);
    o.g1.position.set(-g / 2, Y, 0); o.g1.rotation.z = o.th;
    o.g2.position.set(g / 2, Y, 0); o.g2.rotation.z = k.phi;
    o.pin.position.set(-g / 2 + R * Math.cos(o.th), Y + R * Math.sin(o.th), 0);
    var rpm = S.w * 60 / (2 * Math.PI);
    S.set("in", rpm.toFixed(1) + " rpm");
    S.set("out", (rpm * k.ratio).toFixed(1) + " rpm");
    S.set("reach", Math.round(k.s) + " mm");
  }
});
