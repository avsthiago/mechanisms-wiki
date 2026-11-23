M507.define({
  number: 505,
  title: "Planet pinion and annular gear",
  lede: "A small gear on an arm runs between a centre gear and a ring with teeth on its inside. Hold either one still and turn the arm, and the other is driven round faster than the arm.",
  alt: "A big ring with teeth on its inside. At its centre is a gear about a third as wide. A small gear sits between them and meshes with both. A straight arm runs from the centre, across the small gear's pin, and out past the ring.",
  parts: [
    { key: "arm", color: "#5E7387", name: "Arm", note: "Turns about the centre and carries the small gear round on a pin. Its speed is set by the speed slider." },
    { key: "sun", color: "#C8873A", name: "Centre gear", note: "A gear at the centre with teeth on the outside. The dark stripe shows it turning." },
    { key: "planet", color: "#D9B13B", name: "Small gear", note: "Rides on the arm between the centre gear and the ring, touching both. It rolls on whichever one is held still." },
    { key: "ring", color: "#4FA58A", name: "Ring", note: "A gear with its teeth on the inside. Watch the red mark on its rim." }
  ],
  controls: [{ id: "hold", label: "Held still", value: "ring", options: [["ring", "The ring"], ["sun", "The centre gear"]] }],
  readouts: [{ id: "a", label: "Arm" }, { id: "s", label: "Centre gear" }, { id: "r", label: "Ring" }],
  speed: { min: 1, max: 30, value: 8, label: "Arm speed", unit: " rpm" },
  views: { "3d": [130, 70, 670], front: [0, 0, 690], side: [690, 40, 60] },
  target: [0, 0, 0],
  how: [
    "The ring is held still and the arm turns. The small gear rolls round the inside of the ring. As it rolls it spins on its pin, and its teeth push the centre gear round.",
    "The centre gear gets one turn from the arm carrying the small gear round it. It gets more turns from the small gear's spin. The ring has many more teeth than the centre gear, so that extra part is large, and the centre gear turns several times for each turn of the arm.",
    "Now hold the centre gear and let the ring go. The small gear rolls on the centre gear and pushes the ring. The ring is big, so it only turns a little faster than the arm. Try The ring, then The centre gear, and compare the readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two gears, the small gear and the arm. The disc behind the ring that holds it on the centre pin, the back plate, the base, the sizes and the number of teeth were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, NS = 16, NP = 12, NR = 40;   // ring teeth = centre teeth + twice the small gear's
    var o = this.o = { th: 0, aS: 0, aR: 0, NS: NS, NP: NP, NR: NR, a0: 40 * Math.PI / 180 };
    // ring z -8..8 with a disc behind it z -14..-8 and a sleeve z -30..-14 back to the plate
    var ring = o.ring = new T.Group(); scene.add(ring);
    o.R = P.internalGear({ teeth: NR, module: MD, rim: 14, material: c.mat("ring") }); ring.add(o.R);      // outer radius 141.5
    P.at(P.cylZ(o.R.outerRadius, 6, c.mat("ring", "light")), 0, 0, -11, ring);   // pale, so the teeth in front of it show
    P.at(P.cylZ(16, 15.5, c.mat("ring")), 0, 0, -21.75, ring);
    P.at(P.box(6, 10, 1, c.mat("ring", "mark")), 0, 134.5, 9, o.R);          // red mark on the rim (r 129.5..139.5), z 8.5..9.5, lifted off the face
    // centre wheel z -7.5..7.5, half a unit clear of the disc
    o.S = P.spurGear({ teeth: NS, module: MD, width: 15, bore: 6.5, material: c.mat("sun") }); scene.add(o.S);
    P.at(P.box(26, 4, 1, c.mat("sun", "dark")), 27, 0, 8.5, o.S);            // stripe r 14..40, z 8..9
    // arm z 12..18 at 40 degrees as drawn, with the small gear z -7..7 on a pin
    var arm = o.arm = new T.Group(); scene.add(arm);
    var dist = (NS + NP) * MD / 2;                                           // 84 from the centre
    P.at(P.armPlate({ length: 172, r0: 14, r1: 8, thick: 6, material: c.mat("arm") }), 0, 0, 15, arm);
    P.at(P.cylZ(5, 18.5, c.mat("arm")), dist, 0, 2.75, arm);                    // pin z -7..12, up to the arm's back face
    P.at(P.cylZ(8, 2, c.mat("arm", "dark")), dist, 0, 19, arm);              // pin head z 18..20 on the arm face
    o.Pn = P.spurGear({ teeth: NP, module: MD, width: 14, material: c.mat("planet") }); P.at(o.Pn, dist, 0, 0, arm);
    P.at(P.box(18, 4, 1, c.mat("planet", "dark")), 18, 0, 8, o.Pn);          // stripe r 9..27, z 7.5..8.5
    // supports: centre pin from a back plate on a base
    P.at(P.cylZ(6, 52, c.fixed), 0, 0, -4, scene);                           // centre pin z -30..22, starts at the plate face
    P.at(P.box(120, 330, 10, c.fixed), 0, -45, -35, scene);                  // plate x -60..60, y -210..120, z -40..-30
    P.at(P.box(240, 12, 110, c.fixed), 0, -216, -20, scene);                 // base y -222..-210, z -75..35
    arm.rotation.z = o.a0;
    o.pP = o.Pn.rotation.z = P.meshTurn(o.S, o.Pn);
    o.pR = o.R.rotation.z = P.meshTurn(o.Pn, o.R);
    o.pairs = [[o.S, o.Pn], [o.Pn, o.R]];
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w, sunHeld = S.controls.hold === "sun";
    // seen from the arm: centre wheel x its teeth = -(ring x its teeth). Hold one, and the other follows.
    var kS = sunHeld ? 0 : 1 + o.NR / o.NS, kR = sunHeld ? 1 + o.NS / o.NR : 0;
    o.th += w * dt; o.aS += w * kS * dt; o.aR += w * kR * dt;
    o.arm.rotation.z = o.a0 + o.th;
    o.S.rotation.z = o.aS;
    o.ring.rotation.z = o.aR;
    o.Pn.rotation.z = o.pP + (o.aR - o.th) * o.NR / o.NP;   // the small gear turns the same way as the ring, seen from the arm
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("a", f(rpm)); S.set("s", f(rpm * kS)); S.set("r", f(rpm * kR));
  }
});
