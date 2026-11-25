M507.define({
  number: 34,
  title: "Internal gear and pinion",
  lede: "A small gear turns inside a big ring that has its teeth on the inside. Both turn the same way. More teeth touch at once, so the drive can push harder without breaking a tooth.",
  alt: "A big ring with teeth on its inner edge, held by three rollers on an upright plate. A small toothed gear sits inside it near the left edge, its teeth locked into the ring's teeth. A red stripe marks the ring.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Pinion", note: "The small driving gear. In a real machine an engine would turn it. A pinion is the name for the smaller gear of a pair." },
    { key: "driven", color: "#C8873A", name: "Big gear", note: "A ring with teeth on the inside, or an ordinary gear when you switch the control. Watch the red stripe to see which way it turns." }
  ],
  controls: [{ id: "kind", label: "Big gear", value: "ring", options: [["ring", "Inside ring"], ["gear", "Outside gear"]] }],
  readouts: [{ id: "in", label: "Pinion" }, { id: "out", label: "Big gear" }],
  views: { "3d": [175, 175, 710], front: [-40, 0, 840], side: [800, 0, 0] },
  target: [-40, 0, 0],
  how: [
    "The small gear, called a pinion, turns. Its teeth push the teeth on the inside of the ring, so the ring turns too. Both go the same way. A minus sign in the readout would mean the other way.",
    "The ring curves round the pinion, so the two edges stay close for longer. That puts more teeth in contact at once. Each tooth carries less of the load, so teeth of the same size can pass on more force.",
    "Try Inside ring, then Outside gear. The pinion and the big gear stay the same size and speed, but the outside gear turns the other way. Watch the red stripe."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the ring and the pinion. The plate, the three rollers that hold the ring, the sizes and the number of teeth were made up. The outside gear was added to compare the turning direction.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, NP = 18, NR = 48;
    var o = this.o = { a: 0, NP: NP, NR: NR };
    // pinion: gear z -8..8, shaft z -30..30 (starts at the plate face)
    o.gp = new T.Group(); scene.add(o.gp);
    o.pin = P.spurGear({ teeth: NP, module: MD, material: c.mat("drive") }); o.gp.add(o.pin);
    P.at(P.cylZ(6, 60, c.mat("drive")), 0, 0, 0, o.gp);                       // shaft z -30..30
    P.at(P.cylZ(11, 4, c.mat("drive")), 0, 0, 10, o.gp);                      // hub z 8..12, on the gear face

    // internal ring at the origin, z -8..8, held by three flanged rollers on its outer rim
    o.ring = new T.Group(); scene.add(o.ring);
    var ring = P.internalGear({ teeth: NR, module: MD, rim: 12, material: c.mat("driven") }); o.ring.add(ring);
    var Ro = ring.outerRadius, rt = ring.pitchRadius - MD;                    // Ro 163.5, tooth tips at 138
    P.at(P.box(Ro - 2 - (rt + 2), 3.5, 1, c.mat("driven", "mark")), (Ro + rt) / 2, 0, 9, o.ring);   // stripe on tooth 0, x 140..161.5, z 8.5..9.5
    o.ringR = Ro; o.ringPitchR = ring.pitchRadius;
    o.rollers = new T.Group(); scene.add(o.rollers); o.rolls = [];
    var RR = 14, D = Ro + RR;                                                 // roller core touches the ring rim
    [90, 210, 330].forEach(function (deg) {
      var g = new T.Group(), t = deg * Math.PI / 180;
      g.position.set(D * Math.cos(t), D * Math.sin(t), 0); o.rollers.add(g);
      P.at(P.cylZ(RR, 17, c.fixed), 0, 0, 0, g);                              // core z -8.5..8.5
      P.at(P.cylZ(20, 3, c.fixed), 0, 0, 10, g);                              // front flange z 8.5..11.5, 0.5 clear of the ring face
      P.at(P.cylZ(20, 3, c.fixed), 0, 0, -10, g);                             // back flange z -11.5..-8.5
      P.at(P.cylZ(5, 18.5, c.fixed), 0, 0, -20.75, g);                        // axle z -30..-11.5, plate face to flange
      P.at(P.box(3, 22, 1, c.mat("driven", "dark")), 0, 0, 12, g);            // dark line z 11.5..12.5 on the front flange, to show it rolling
      o.rolls.push(g);
    });

    // ordinary outside gear of the same size, on a shaft at the origin
    o.ext = new T.Group(); scene.add(o.ext);
    var eg = P.spurGear({ teeth: NR, module: MD, material: c.mat("driven") }); o.ext.add(eg);
    P.at(P.cylZ(6, 38, c.mat("driven")), 0, 0, -11, o.ext);                   // shaft z -30..8, plate face to gear face
    P.at(P.cylZ(10, 4, c.mat("driven")), 0, 0, 10, o.ext);                    // hub z 8..12, on the gear face
    var rf = eg.pitchRadius - 1.25 * MD;
    P.at(P.box(rf - 14, 5, 1, c.mat("driven", "mark")), 11 + (rf - 14) / 2, 0, 9, o.ext);   // stripe x 11..rf-3, z 8.5..9.5
    o.extPitch = eg.pitch; o.extPitchR = eg.pitchRadius;

    // supports
    P.at(P.box(490, 410, 10, c.fixed), -30, 0, -35, scene);                   // plate x -275..215, y -205..205, z -40..-30; shafts and axles end at z -30
    P.at(P.box(530, 12, 100, c.fixed), -30, -211, -30, scene);                // base x -295..235, y -217..-205, z -80..20; plate stands on y -205
  },

  step: function (c, dt, S) {
    var o = this.o, inside = S.controls.kind !== "gear", r = o.NP / o.NR, i;
    o.a += S.w * dt;
    o.ring.visible = o.rollers.visible = inside; o.ext.visible = !inside;
    // pinion sits left of the big gear's centre: inside, ring pitch radius minus pinion's; outside, the sum
    o.gp.position.x = inside ? -(o.ringPitchR - o.pin.pitchRadius) : -(o.extPitchR + o.pin.pitchRadius);
    if (inside) {
      o.gp.rotation.z = o.a + o.pin.pitch / 2;            // both have a tooth at the meeting point (angle 180), so the pinion is offset half a tooth
      o.ring.rotation.z = o.a * r;                        // same way, speed in inverse ratio of teeth
      for (i = 0; i < o.rolls.length; i++) o.rolls[i].rotation.z = -o.a * r * o.ringR / 14;   // rollers roll on the rim
    } else {
      o.gp.rotation.z = o.a;
      o.ext.rotation.z = -o.a * r + o.extPitch / 2;       // opposite way, offset half a tooth to mesh
    }
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : (inside ? 1 : -1) * rpm * r));
  }
});
