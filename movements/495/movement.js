M507.define({
  number: 495,
  title: "Entwistle's gearing",
  lede: "Three equal bevel gears make a drum turn twice as fast as the shaft that drives it. One gear is fixed and never turns. A second gear is carried round it by the shaft and rolls on it as it goes.",
  alt: "A level shaft in two bearings on a base, with a hand wheel on its right end. A bevel gear on the right is fixed to the stand. A second bevel gear stands on a pin on a block in the middle of the shaft. A third bevel gear on the left, with a drum behind it, turns loosely on the shaft.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Shaft", note: "Turned by the hand wheel. A block in its middle holds a pin, and the pin carries one gear round with the shaft." },
    { key: "fixed", color: "#4FA58A", name: "Fixed gear", note: "Bolted to the stand. It never turns. The shaft passes freely through it." },
    { key: "carried", color: "#D9B13B", name: "Carried gear", note: "Turns on the pin. The shaft carries it round, and the fixed gear makes it spin on its pin at the same time." },
    { key: "drum", color: "#C8873A", name: "Drum gear", note: "Turns loosely on the shaft, with a drum on its back. Watch the red stripe on the drum to count its turns." }
  ],
  controls: [{ id: "drive", label: "Turn by hand", value: "shaft", options: [["shaft", "The shaft"], ["drum", "The drum"]] }],
  readouts: [{ id: "s", label: "Shaft" }, { id: "d", label: "Drum" }],
  views: { "3d": [177, 100, 444], front: [-30, 0, 500], side: [-520, 60, 60] },
  target: [-30, -15, 0],
  how: [
    "Turn the hand wheel. The shaft carries the middle gear round in a circle. That gear touches the fixed gear, which cannot turn, so the middle gear has to roll on it and spin on its own pin.",
    "The drum gear touches the other side of the middle gear. It gets one turn from being carried round with the shaft. It gets one more turn from the spin of the middle gear. The two add up, so the drum makes two turns for each turn of the shaft.",
    "It also works backwards. Turn the drum instead, and the shaft goes round at half the drum's speed, but with twice the push. Try The shaft, then The drum, and compare the readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows it cut through the middle; here the gears are whole. The base, the shape of the two bearings, the stripe on the hand wheel and the number of teeth were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 60, N = 16;
    var o = this.o = { th: 0, NA: N, NC: N, NB: N };
    var X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), Z = new T.Vector3(0, 0, 1);
    function gear(key, parent, ax, xl) {                 // bevel gear with its cone point at the middle of the shaft, axis ax pointing away from it
      var h = new T.Group(), g = P.bevelGearCone({ radius: R, teeth: N, cone: 45, hub: 18, hubLength: 16, material: c.mat(key) });
      P.frame(h, xl, ax); parent.add(h); h.add(g); return g;                 // back of the hub 60 + 4.95 + 16 = 80.95 from the cone point
    }
    var sh = o.shaft = new T.Group(); scene.add(sh);
    // shaft x -186..124, block in the middle, pin up through the carried gear, hand wheel on the right end
    P.at(P.cylX(8, 310, c.mat("shaft")), -31, 0, 0, sh);                     // shaft x -186..124
    P.at(P.box(34, 44, 34, c.mat("shaft")), 0, 0, 0, sh);                    // block x -17..17, y -22..22, between the gear faces (x -44.2 and 44.2)
    P.at(P.cylY(7, 68, c.mat("shaft")), 0, 56, 0, sh);                       // pin y 22..90, from the block top
    P.at(P.cylY(11, 5, c.mat("shaft")), 0, 84.5, 0, sh);                     // collar y 82..87, one unit clear of the gear's hub (80.95)
    P.at(P.cylX(48, 20, c.mat("shaft")), 114, 0, 0, sh);                     // hand wheel x 104..124
    P.at(P.box(1, 34, 6, c.mat("shaft", "dark")), 124.8, 27, 0, sh);         // stripe x 124.3..125.3, lifted off the wheel face
    // the three gears
    o.A = gear("fixed", scene, X, Y);                                        // fixed gear on the right, hub back at x 80.95
    o.B = gear("carried", sh, Y, X);                                         // carried gear on the pin, hub back at y 80.95
    o.C = gear("drum", scene, new T.Vector3(-1, 0, 0), Y);                   // drum gear on the left; its local y runs to the left
    P.at(P.cylY(26, 69, c.mat("drum")), 0, 115.5, 0, o.C);                   // drum x -150..-81, on the hub back
    P.at(P.cylY(32, 5, c.mat("drum")), 0, 85.5, 0, o.C);                     // flange x -88..-83
    P.at(P.cylY(32, 5, c.mat("drum")), 0, 148.5, 0, o.C);                    // flange x -151..-146
    P.at(P.box(1, 50, 6, c.mat("drum", "mark")), 26.8, 117, 0, o.C);         // red stripe along the drum, 26.3..27.3 from the axis (drum radius 26)
    // supports: two bearings and a base; base top y -115
    var b1 = P.bearingBlock({ bore: 8.5, outer: 20, drop: 115, width: 14, material: c.fixed }); b1.rotation.y = Math.PI / 2;
    P.at(b1, 87.95, 0, 0, scene);                                            // x 80.95..94.95, against the back of the fixed gear's hub
    var b2 = P.bearingBlock({ bore: 8.5, outer: 20, drop: 115, width: 14, material: c.fixed }); b2.rotation.y = Math.PI / 2;
    P.at(b2, -165, 0, 0, scene);                                             // x -172..-158
    P.at(P.box(350, 12, 120, c.fixed), -25, -121, 0, scene);                 // base x -200..150, y -127..-115, z -60..60
    // starting phases: the carried gear meshes with the fixed gear, the drum gear with the carried gear
    o.pB = o.B.rotation.y = P.meshTurn(o.A, o.B);
    o.pC = o.C.rotation.y = P.meshTurn(o.B, o.C);
    o.pairs = [[o.A, o.B], [o.B, o.C]];
  },

  step: function (c, dt, S) {
    var o = this.o, e = o.NA / o.NC, ratio = 1 + e;      // fixed gear still: (drum - shaft) / (0 - shaft) = -e, so drum = (1 + e) x shaft
    var k = S.controls.drive === "drum" ? 1 / ratio : 1; // shaft speed as a share of the hand's speed
    o.th += S.w * k * dt;
    o.shaft.rotation.x = o.th;
    o.B.rotation.y = o.pB + o.th * o.NA / o.NB;          // rolling on the fixed gear spins it on its pin
    o.C.rotation.y = o.pC - ratio * o.th;                // its own axis points left, so the sign flips
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("s", f(rpm * k));
    S.set("d", f(rpm * k * ratio));
  }
});
