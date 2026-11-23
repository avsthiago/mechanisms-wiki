M507.define({
  number: 216,
  title: "Inner and outer part-toothed wheels",
  lede: "A big ring with teeth on the inside and an inner gear with teeth on the outside are fixed together and turn steadily. They take turns driving one small gear. The small gear goes slowly one way, then quickly back.",
  alt: "A big upright ring with teeth on the inside of its top half. In its middle sits an inner gear with teeth on its bottom half only. A small gear below the middle meshes with the inner gear and, in turn, with the ring. A crank turns the ring and inner gear together.",
  parts: [
    { key: "ring", color: "#5E7387", name: "Ring gear", note: "A big ring with teeth on the inside of only half its rim. It is fixed to the inner gear, and the crank turns both together." },
    { key: "wheel", color: "#4FA58A", name: "Inner gear", note: "A gear with teeth on only half its rim. It sits in the middle of the ring and turns with it." },
    { key: "pinion", color: "#C8873A", name: "Pinion", note: "The small gear that is driven, first by the inner gear and then by the ring. Watch its red stripe change direction." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the ring and the inner gear. In a real machine an engine would do this." }
  ],
  controls: [{ id: "teeth", label: "Teeth", value: "half", options: [["half", "Half and half"], ["equal", "Same number"]] }],
  readouts: [{ id: "out", label: "Pinion" }, { id: "turns", label: "Moved" }],
  views: { "3d": [280, 140, 610], front: [0, 0, 720], side: [720, 0, -20] },
  target: [0, 0, -20],
  how: [
    "Turn the crank and the ring and the inner gear turn together. The pinion sits between them. Only one of them has teeth at the pinion at any moment. When the inner gear's teeth reach it, the pinion turns slowly the opposite way to the inner gear.",
    "When the ring's teeth come round, the pinion turns the same way as the ring, and much faster. Its teeth are far from the middle, so they move fast and push the pinion round quickly. The pinion goes slow one way, then quick the other way.",
    "With Half and half, as Brown drew it, the ring passes more teeth than the inner gear. So the pinion goes back further than it went forward, and it creeps round one way. Try Same number and watch the Moved readout come back to zero each time."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the disc behind the ring, the plate, the post that holds the pinion, the sizes and the number of teeth were made up. The teeth at each end of both toothed parts are cut down to stubs. Without that, the pinion would strike them as it changes direction. The choice of Same number was added: it gives the ring fewer teeth and the inner gear more, so the pinion swings to and fro instead of creeping round.",

  dims: { MD: 6, NP: 16, NW: 16, NR: 48 },
  // Pinion angle per turn of the wheels, as [end of stretch in degrees, pinion turn per wheel turn]. The wheel's teeth
  // turn it at -NW/NP, the ring's at +NR/NP. The stretches meet where both rims end in a gap, so the pinion switches cleanly.
  layouts: {
    half: { wheel: [175, 340, 11.25], ring: [-1, 173, 3.75], seg: [[90, -1], [270, 3], [360, -1]] },
    equal: { wheel: [130, 385, 11.25], ring: [44, 128, 3.75], seg: [[135, -1], [225, 3], [360, -1]] }
  },
  /** Pinion angle (radians) when the wheels have turned th radians anticlockwise. Starts at 0, a tooth pointing up. */
  pinionAngle: function (th, key) {
    var seg = this.layouts[key].seg, T = 2 * Math.PI, n = Math.floor(th / T), t = (th - n * T) * 180 / Math.PI, a = 0, prev = 0, net = 0, i;
    for (i = 0; i < seg.length; i++) net += (seg[i][0] - (i ? seg[i - 1][0] : 0)) * seg[i][1];
    for (i = 0; i < seg.length; i++) {
      var e = seg[i][0];
      a += (Math.min(t, e) - prev) * seg[i][1];
      if (t <= e) break;
      prev = e;
    }
    return (n * net + a) * Math.PI / 180;
  },
  rate: function (th, key) {
    var seg = this.layouts[key].seg, t = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * 180 / Math.PI;
    for (var i = 0; i < seg.length; i++) if (t < seg[i][0]) return seg[i][1];
    return seg[seg.length - 1][1];
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, self = this, DEG = Math.PI / 180;
    var YP = -(D.NR - D.NP) * D.MD / 2;                                          // pinion centre y = -96 (ring pitch 144 less pinion pitch 48)
    var o = this.o = { th: 0, sets: {} };
    // wheels: ring z -30..-14 on a disc z -36..-30, small wheel z -30..-14 on the disc's front face
    o.g = new T.Group(); scene.add(o.g);
    var ro = 0;
    Object.keys(this.layouts).forEach(function (k) {
      var L = self.layouts[k], s = { g: new T.Group() };
      var ring = P.internalGear({ teeth: D.NR, module: D.MD, width: 16, rim: 12, relief: 2, fromDeg: L.ring[0], toDeg: L.ring[1], material: c.mat("ring") });
      ring.rotation.z = L.ring[2] * DEG; ring.position.z = -22; s.g.add(ring);   // ring z -30..-14, rim out to 163.5
      ro = ring.outerRadius;
      var wh = P.partGear({ teeth: D.NW, module: D.MD, width: 16, relief: 1, fromDeg: L.wheel[0], toDeg: L.wheel[1], material: c.mat("wheel") });
      wh.rotation.z = L.wheel[2] * DEG; wh.position.z = -22; s.g.add(wh);       // small wheel z -30..-14
      o.g.add(s.g); o.sets[k] = s;
    });
    P.at(P.cylZ(ro, 6, c.mat("ring", "light")), 0, 0, -33, o.g);                     // disc z -36..-30, behind the ring and wheel
    P.at(P.cylZ(7, 14, c.mat("ring")), 0, 0, -43, o.g);                        // shaft z -50..-36, plate face to disc back
    P.at(P.cylZ(14, 4, c.mat("wheel")), 0, 0, -12, o.g);                       // hub z -14..-10, on the wheel face
    P.at(P.cylZ(7, 4, c.mat("wheel")), 0, 0, -8, o.g);                         // shaft stub z -10..-6
    P.at(P.box(12, 54, 6, c.mat("crank")), 0, 22, -3, o.g);                    // crank arm y -5..49, z -6..0, on the stub end
    P.at(P.cylZ(5, 24, c.mat("crank")), 0, 44, 12, o.g);                       // handle z 0..24, on the arm face; sweeps radius 49, clear of the post (top y -84)
    // pinion z -29..-15, axle z -15..-8 to the post's back face
    o.p = new T.Group(); o.p.position.set(0, YP, -22); scene.add(o.p);
    var pin = P.spurGear({ teeth: D.NP, module: D.MD, width: 14, material: c.mat("pinion") }); o.p.add(pin);
    P.at(P.cylZ(6, 7, c.mat("pinion")), 0, 0, 10.5, o.p);                      // axle z -15..-8
    var rf = pin.pitchRadius - 1.25 * D.MD;
    P.at(P.box(5, rf - 13, 1, c.mat("pinion", "mark")), 0, 7 + (rf - 13) / 2, 7.5, o.p);   // red stripe y 7..rf-6, z -14.5..-13.5, lifted off the face
    // supports
    P.at(P.box(380, 352, 10, c.fixed), 0, 6, -55, scene);                      // plate x -190..190, y -170..182, z -60..-50; shaft ends at z -50
    P.at(P.box(420, 12, 100, c.fixed), 0, -176, -30, scene);                   // base y -182..-170, z -80..20; plate stands on y -170
    P.at(P.box(20, 86, 12, c.fixed), 0, -127, -2, scene);                      // post x -10..10, y -170..-84, z -8..4; stands on the base, axle ends at z -8
  },

  step: function (c, dt, S) {
    var o = this.o, k = S.controls.teeth === "equal" ? "equal" : "half", j;
    if (o.k !== k) { o.k = k; o.th = 0; }
    for (j in o.sets) o.sets[j].g.visible = j === k;
    o.th += S.w * dt;
    o.g.rotation.z = o.th;
    var phi = this.pinionAngle(o.th, k);
    o.p.rotation.z = phi;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0, t = Math.round(phi / (2 * Math.PI) * 10) / 10;
    S.set("out", f(rpm * this.rate(o.th, k)));
    S.set("turns", (t < 0 ? "−" + -t : t) + " turns");
  }
});
