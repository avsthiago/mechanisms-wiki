M507.define({
  number: 372,
  title: "White's dynamometer",
  lede: "A dynamometer measures how much power a machine takes to turn. Here the power passes through four bevel gears held in a hoop. The pull on the hoop shows how hard the machine is to drive, and a hanging weight measures it.",
  alt: "A level shaft between two upright posts. In the middle, four equal bevel gears form a square: two on the shaft and two above and below it. A wide hoop round them carries the top and bottom gears. A strap from the hoop hangs a stack of weights. On the right, a drum outside the post has a brake strap over it with a weight on one end.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Driving shaft", note: "Turned by the crank. The left bevel gear is fixed to it." },
    { key: "output", color: "#C8873A", name: "Driven gear and drum", note: "The right bevel gear turns loose on the shaft, with a drum on its sleeve. It turns the opposite way to the shaft. Watch the red mark on the drum." },
    { key: "hoop", color: "#4FA58A", name: "Hoop", note: "A frame that could turn freely on the middle of the shaft. It carries the top and bottom gears on pins. The weight holds it still." },
    { key: "planets", color: "#D9B13B", name: "Hoop gears", note: "The top and bottom bevel gears. They spin on their pins and pass the turning from the left gear to the right gear." },
    { key: "weight", color: "#8E7AA8", name: "Strap and weights", note: "A strap wound on the hoop. The weights on it hold the hoop still. The more weight it needs, the more power is passing through." },
    { key: "brake", color: "#E8E2D0", name: "Brake", note: "A strap rubbing on the drum, pulled tight by its weight. It stands for the machine being driven." }
  ],
  controls: [{ id: "load", label: "Brake weight", value: "mid", options: [["low", "Light"], ["mid", "Medium"], ["high", "Heavy"]] }],
  readouts: [{ id: "rpm", label: "Shaft" }, { id: "w", label: "Weight on hoop" }, { id: "p", label: "Power" }],
  views: { "3d": [420, 199, 900], front: [0, -30, 1020], side: [980, 50, 160] },
  target: [0, -30, 0],
  how: [
    "Turn the crank and the shaft turns the left bevel gear. That gear turns the top and bottom gears, and they turn the right gear the opposite way. The right gear drives the drum, and the brake on the drum stands for the machine being tested.",
    "The top and bottom gears ride in the hoop. The harder the machine is to turn, the harder they push the hoop round with the shaft. The strap and weights hold it back. When the hoop stays still, the weight on it measures the push. With equal gears, the push on the hoop is twice the turning force passing through.",
    "Try a light brake and then a heavy one, and watch the weights on the hoop change. Then change the speed. The weight stays the same, but the power goes up, because power is the push times the speed."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the drum and brake, the strap and weights, the pins and hub inside the hoop, the base, the sizes and the number of teeth were made up. Brown's hoop fits closer round the gears; here it is a little larger so the top and bottom gears clear it as they spin. The power readout takes a made-up size for the hoop and leaves out rubbing in the gears.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 120, N = 30, HL = 30, RH = 194, i;
    var o = this.o = { a: 0, R: R, N: N, RH: RH, stacks: {}, brakes: {} };
    var X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), nX = new T.Vector3(-1, 0, 0), nY = new T.Vector3(0, -1, 0), Z = new T.Vector3(0, 0, 1);
    function gear(key, parent, ax, xl) {             // mitre bevel gear, pitch-cone apex at the origin, axis ax away from it
      var g = P.bevelGearCone({ radius: R, teeth: N, cone: 45, addendum: 8, hub: 20, hubLength: HL, material: c.mat(key) });
      P.frame(g, xl, ax); parent.add(g); return g;  // back of the hub at 120 + 5.66 + 30 = 155.66 from the apex
    }
    // driving shaft (about x), crank on its left end
    var sh = o.shaft = new T.Group(); scene.add(sh);
    var sm = c.mat("shaft");
    P.at(P.cylX(10, 524, sm), 0, 0, 0, sh);                  // shaft x -262..262, its right end hidden in the drum
    o.gL = gear("shaft", sh, nX, Y);                          // left gear, hub back at x -155.66, fixed to the shaft
    P.at(P.box(6, 70, 16, sm), -265, 25, 0, sh);              // crank arm x -268..-262, y -10..60, on the shaft end
    P.at(P.cylX(5, 22, c.mat("shaft", "dark")), -279, 50, 0, sh);   // handle x -290..-268, on the arm's face

    // driven gear on a sleeve through the right post, with the brake drum
    var out = o.out = new T.Group(); scene.add(out);
    var om = c.mat("output");
    o.gR = gear("output", out, X, Y);                         // right gear, hub back at x 155.66
    P.at(P.cylX(16, 58.34, om), 184.83, 0, 0, out);           // sleeve x 155.66..214, through the post's bearing (x 172..196)
    var dr = P.drum({ radius: 50, length: 34, flange: 8, flangeThick: 4, material: om, mark: c.mat("output", "mark") });
    dr.rotation.y = Math.PI / 2; P.at(dr, 235, 0, 0, out);    // drum x 214..256 (flanges 214..218 and 252..256); red stripe x 256..257.5

    // hoop: a ring round the shaft in the y-z plane, a hub on the middle of the shaft, and two pins for the hoop gears
    var hp = o.hoop = new T.Group(); scene.add(hp);
    var hm = c.mat("hoop"), ring = new T.Shape(), hole = new T.Path();
    ring.absarc(0, 0, RH, 0, 2 * Math.PI, false); hole.absarc(0, 0, RH - 14, 0, 2 * Math.PI, true); ring.holes.push(hole);
    var rg = new T.ExtrudeGeometry(ring, { depth: 64, bevelEnabled: false, curveSegments: 96 }); rg.translate(0, 0, -32); rg.rotateY(Math.PI / 2);
    hp.add(new T.Mesh(rg, hm));                               // hoop r 180..194, x -32..32. The hoop gears' backs sweep out to r 176.5
    P.at(P.cylX(26, 40, hm), 0, 0, 0, hp);                    // hub x -20..20 on the shaft (r 10); the side gears' inner faces are at x +-85
    P.at(P.cylY(8, 162, hm), 0, 106, 0, hp);                  // pin y 25..187, from the hub into the hoop
    P.at(P.cylY(8, 162, hm), 0, -106, 0, hp);                 // pin y -187..-25
    o.pT = new T.Group(); hp.add(o.pT); o.gT = gear("planets", o.pT, Y, X);    // top gear spins about +y
    o.pB = new T.Group(); hp.add(o.pB); o.gB = gear("planets", o.pB, nY, X);   // bottom gear spins about -y
    P.at(P.box(10, 1, 4, c.mat("planets", "dark")), 14, 156.2, 0, o.pT);       // stripe x 9..19 on the top gear's hub end (y 155.66, hub r 20), lifted .5, clear of the pin (r 8)

    // strap round the front of the hoop, hanging from its equator at z = RH + 1 down to the weights
    var wm = c.mat("weight");
    var arc = new T.Mesh(new T.CylinderGeometry(RH + 1, RH + 1, 22, 40, 1, true, 0, Math.PI / 2), wm);
    arc.rotation.z = Math.PI / 2; scene.add(arc);             // r 195, 1 off the hoop, from the top (+y) round to the front (+z)
    P.at(P.box(22, 150, 1.5, wm), 0, -75, RH + 1, scene);     // strap y -150..0, z 194.25..195.75
    P.at(P.cylY(3, 86, wm), 0, -193, RH + 1, scene);          // hanger rod y -236..-150, through the slotted weights
    P.at(P.cylY(20, 4, wm), 0, -238, RH + 1, scene);          // pan y -240..-236
    var stacks = { low: 2, mid: 4, high: 6 };
    Object.keys(stacks).forEach(function (k) {
      var g = new T.Group(); scene.add(g); o.stacks[k] = g;
      for (i = 0; i < stacks[k]; i++) P.at(P.cylY(17, 7, c.mat("weight", i % 2 ? "light" : null)), 0, -232.5 + 7.6 * i, RH + 1, g);   // discs from the pan up, .6 apart
    });

    // brake: a strap over the top of the drum (r 51), its front end tied to the floor, its back end hanging a weight
    var bm = c.mat("brake");
    var band = new T.Mesh(new T.CylinderGeometry(51, 51, 30, 40, 1, true, 0, Math.PI), bm);
    band.rotation.z = Math.PI / 2; P.at(band, 235, 0, 0, scene);   // between the flanges (x 218..252)
    P.at(P.box(30, 270, 1.5, bm), 235, -135, 51, scene);     // front end y -270..0, down to its block on the floor, z 50.25..51.75
    P.at(P.box(30, 150, 1.5, bm), 235, -75, -51, scene);      // back end y -150..0
    [["low", 18], ["mid", 30], ["high", 42]].forEach(function (q) {
      var b = P.box(40, q[1], 40, c.mat("brake", "dark")); b.position.set(235, -150 - q[1] / 2, -51); scene.add(b); o.brakes[q[0]] = b;   // weight hangs from y -150
    });

    // supports: two posts with bearings, a turned rail between them, a floor
    [-184, 184].forEach(function (x) {
      var b = P.bearingBlock({ bore: x < 0 ? 10.6 : 16.6, outer: 24, post: 36, width: 24, drop: 280, material: c.fixed });
      b.rotation.y = Math.PI / 2; P.at(b, x, 0, 0, scene);   // x 172..196 each side, foot on the floor at y -280
    });
    P.at(P.cylX(7, 344, c.fixed), 0, -232, 0, scene);         // rail x -172..172, between the posts' faces, below the hoop (r 186)
    P.at(P.sphere(15, c.fixed), 0, -232, 0, scene);           // ball in its middle
    P.at(P.box(44, 10, 14, c.fixed), 235, -275, 51, scene);   // block x 213..257, y -280..-270, z 44..58, on the floor; the strap ends on its top
    P.at(P.box(600, 12, 460, c.fixed), 0, -286, 0, scene);    // floor x -300..300, y -292..-280, z -230..230
  },

  step: function (c, dt, S) {
    var o = this.o, pitch = 2 * Math.PI / o.N, load = S.controls.load || "mid";
    o.a += S.w * dt;
    var a = -o.a, hoop = 0;                                   // the shaft turns backwards about x, so the hoop's strap hangs in front; the weight holds the hoop still
    o.shaft.rotation.x = a;
    o.out.rotation.x = 2 * hoop - a + this.phase.R * pitch;  // the right gear turns back as fast as the left
    o.hoop.rotation.x = hoop;
    o.pT.rotation.y = (a - hoop) + this.phase.T * pitch;     // each hoop gear spins on its pin as fast as the shaft turns past it
    o.pB.rotation.y = -(a - hoop) + this.phase.B * pitch;
    var kg = { low: 4, mid: 8, high: 12 }[load];
    for (var k in o.stacks) { o.stacks[k].visible = k === load; o.brakes[k].visible = k === load; }
    var rpm = S.playing ? S.rpm : 0, torque = kg * 9.81 * .15 / 2, watts = torque * rpm * 2 * Math.PI / 60;
    S.set("rpm", (Math.round(rpm * 10) / 10) + " rpm");
    S.set("w", kg + " kg");
    S.set("p", Math.round(watts) + " W");
  },
  phase: { R: 0, T: .5, B: .5 }                             // in tooth pitches, found so a tooth of each gear sits in a gap of the next
});
