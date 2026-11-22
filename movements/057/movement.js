M507.define({
  number: 57,
  title: "Belts driving two gears and a wandering pinion",
  lede: "One small pulley drives two belts. They turn a big ring and a gear inside it in opposite directions. A small gear between them spins and also travels round the centre, so one handle gives three different motions.",
  alt: "A small pulley with a crank at the top. One belt runs from it round the outside of a big ring with teeth on the inside. A second belt crosses over and runs down to a pulley on a gear in the middle of the ring. A small red gear at the bottom meshes with both and is held by an arm that swings about the centre.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving pulley", note: "The small pulley at the top, turned by the crank. Both belts run on it, so it drives everything else." },
    { key: "ring", color: "#C8873A", name: "Ring", note: "A big ring with teeth on the inside. The plain belt wraps its outer edge, so it turns the same way as the driving pulley. Watch its dark stripe." },
    { key: "pinion", color: "#C2503F", name: "Pinion", note: "A small gear, called a pinion, caught between the ring and the inner gear. Watch it spin on its pin and travel round the centre at the same time." },
    { key: "inner", color: "#4FA58A", name: "Inner gear", note: "A gear in the middle of the ring, with a pulley fixed on its front. The crossed belt turns it the opposite way to the ring." },
    { key: "arm", color: "#D9B13B", name: "Swinging arm", note: "Holds the pinion's pin. It swings freely about the same centre as the ring, so the pinion can travel round." },
    { key: "belt", color: "#8E7AA8", name: "Belts", note: "Two flat leather belts. The one round the ring is open. The one to the inner gear crosses over, so it turns its pulley the other way. Watch the red marks." }
  ],
  controls: [{ type: "range", id: "sun", label: "Pulley on the inner gear", min: 40, max: 130, step: 1, value: 40, unit: "",
    presets: [[40, "Small"], [91, "Arm stands still"], [130, "Big"]] }],
  readouts: [{ id: "ring", label: "Ring" }, { id: "sun", label: "Inner gear" }, { id: "arm", label: "Pinion arm" }],
  views: { "3d": [440, 300, 1040], front: [0, 90, 1150], side: [1150, 90, 0] },
  target: [0, 90, 0],
  how: [
    "Turn the crank and both belts move. The plain belt turns the ring the same way as the crank. The crossed belt turns the inner gear the other way. The red pinion sits between them, with its teeth in both.",
    "The ring pushes the pinion one way and the inner gear pushes it the other way. If one push is stronger, the pinion's arm is carried round with it. So the pinion spins on its pin and also wanders round the centre.",
    "Try the small pulley, then Arm stands still, then the big pulley. A bigger pulley makes the inner gear turn more slowly. Watch the arm stop, then creep round the same way as the ring."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not show how the parts are held. The plate, the posts, the spokes behind the ring and the arm that carries the pinion were made up, as were the sizes and the number of teeth. The choice of pulley size on the inner gear was added to show how it steers the arm.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, NS = 26, NP = 10, NR = NS + 2 * NP, BT = 4, Y1 = 287, R1 = 50;
    var o = this.o = { a: 0, aR: 0, aS: 0, aC: -Math.PI / 2, s1: 0, s2: 0, NS: NS, NP: NP, NR: NR, BT: BT, Y1: Y1, R1: R1, c: c };

    // driving pulley at (0, Y1): pulley z -8..36 (both belts on it), shaft z -40..36, crank arm z 36..42, handle z 42..66
    o.top = new T.Group(); o.top.position.set(0, Y1, 0); scene.add(o.top);
    var tp = P.at(P.pulley({ radius: R1 - BT / 2 - 3, width: 44, rim: 7, hub: 12, material: c.mat("drive") }), 0, 0, 14, o.top);
    tp.spokes[0].material = c.mat("drive", "dark");
    P.at(P.cylZ(7, 76, c.mat("drive")), 0, 0, -2, o.top);                    // shaft z -40..36, from the post face to the crank
    P.at(P.box(52, 12, 6, c.mat("drive")), 22, 0, 39, o.top);                 // crank arm x -4..48, z 36..42, on the shaft end
    P.at(P.cylZ(5, 24, c.mat("drive")), 44, 0, 54, o.top);                    // handle z 42..66, on the arm face
    P.at(P.cylZ(16, 20, c.fixed), 0, Y1, -50, scene);                        // post z -60..-40, plate face to shaft end

    // ring at the origin: teeth z -8..8, spokes behind z -14..-7.5, hub z -30..-14 on the post
    o.ring = new T.Group(); scene.add(o.ring);
    var ring = P.internalGear({ teeth: NR, module: MD, rim: 13.5, material: c.mat("ring") }); o.ring.add(ring);
    var Ro = ring.outerRadius, rt = ring.pitchRadius - MD;                    // Ro 159, tooth tips at 132
    for (var k = 0; k < 4; k++) {                                             // spokes z -14..-7.5, r 10..150, ending inside the rim (roots at 145.5)
      var sp = P.box(140, 14, 6.5, c.mat("ring")), ak = k * Math.PI / 2 + Math.PI / 4;
      sp.position.set(80 * Math.cos(ak), 80 * Math.sin(ak), -10.75); sp.rotation.z = ak; o.ring.add(sp);
    }
    P.at(P.cylZ(18, 16, c.mat("ring")), 0, 0, -22, o.ring);                   // hub z -30..-14
    P.at(P.box(Ro - 2 - (rt + 2), 4, 1, c.mat("ring", "dark")), (Ro + rt) / 2, 0, 9, o.ring);   // stripe x 134..157, z 8.5..9.5
    P.at(P.cylZ(24, 30, c.fixed), 0, 0, -45, scene);                         // post z -60..-30, plate face to ring hub
    o.RB = Ro + BT / 2 + .5;                                                       // middle of the belt on the ring: 161

    // inner gear: teeth z -7..7, shaft z -30..-7 inside the ring hub, hub z 7..22, pulley z 22..36
    o.sun = new T.Group(); scene.add(o.sun);
    var sun = P.spurGear({ teeth: NS, module: MD, width: 14, material: c.mat("inner") }); o.sun.add(sun);
    P.at(P.cylZ(8, 22.5, c.mat("inner")), 0, 0, -18.25, o.sun);                  // shaft z -30..-7
    P.at(P.cylZ(14, 15, c.mat("inner")), 0, 0, 14.5, o.sun);                  // hub z 7..22
    o.sunPitchR = sun.pitchRadius; o.sunPitch = sun.pitch;

    // arm and pinion: arm z 9..15, pinion z -7..7 at the sum of pitch radii from the centre
    o.arm = new T.Group(); scene.add(o.arm);
    var pin = P.spurGear({ teeth: NP, module: MD, width: 14, material: c.mat("pinion") });
    var RC = sun.pitchRadius + pin.pitchRadius;                               // 78 + 30 = 108; ring pitch 138 = 108 + 30
    P.at(P.cylZ(24, 6, c.mat("arm")), 0, 0, 12, o.arm);                       // boss round the inner gear's hub, z 9..15
    P.at(P.box(RC, 16, 6, c.mat("arm")), RC / 2, 0, 12, o.arm);               // bar x 0..108, z 9..15
    P.at(P.cylZ(11, 6, c.mat("arm")), RC, 0, 12, o.arm);                      // round end, z 9..15
    P.at(P.cylZ(6, 2, c.mat("arm")), RC, 0, 8, o.arm);                        // pin z 7..9, pinion face to arm
    P.at(P.cylZ(8, 3, c.mat("arm")), RC, 0, 16.5, o.arm);                     // pin head z 15..18
    o.pin = new T.Group(); o.pin.position.x = RC; o.arm.add(o.pin);
    o.pin.add(pin);
    var rf = pin.pitchRadius - 1.25 * MD;
    P.at(P.box(rf - 13, 4, 1, c.mat("pinion", "dark")), 11 + (rf - 13) / 2, 0, 8, o.pin);   // stripe x 11..rf-2, z 7.5..8.5, beside the pin head

    // belts: open one round the ring rim at z 0 (rim z -8..8), crossed one to the inner gear's pulley at z 29
    o.belt1 = P.at(P.belt({ width: 12, thick: BT, material: c.mat("belt") }), 0, 0, 0, scene);
    o.belt1.set(0, Y1, R1, 0, 0, o.RB, false);
    o.mark1 = P.at(P.box(14, BT + 2, 13, c.mat("belt", "mark")), 0, 0, 0, o.belt1);
    o.belt2 = P.at(P.belt({ width: 10, thick: BT, material: c.mat("belt") }), 0, 0, 29, scene);
    o.belt2.userData.live = true;
    o.mark2 = P.at(P.box(14, BT + 2, 11, c.mat("belt", "mark")), 0, 0, 0, o.belt2);

    // plate behind and base under it
    P.at(P.box(400, 545, 10, c.fixed), 0, 72.5, -65, scene);                 // plate x -200..200, y -200..345, z -70..-60; posts start at z -60
    P.at(P.box(460, 12, 110, c.fixed), 0, -206, -55, scene);                 // base y -212..-200, z -110..0; plate stands on y -200
  },

  setSun: function (r) {
    var o = this.o, c = o.c;
    if (o.sp) { o.sun.remove(o.sp); }
    o.sp = c.P.at(c.P.pulley({ radius: r - o.BT / 2 - 2, width: 14, rim: 6, hub: 16, material: c.mat("inner") }), 0, 0, 29, o.sun);   // z 22..36
    o.sp.spokes[0].material = c.mat("inner", "dark");
    o.belt2.set(0, o.Y1, o.R1, 0, 0, r, true);
    o.rS = r;
  },

  step: function (c, dt, S) {
    var o = this.o, r = +S.controls.sun;
    if (o.rS !== r) this.setSun(r);
    var w = S.w, wR = w * o.R1 / o.RB, wS = -w * o.R1 / r;                    // open belt: same way; crossed belt: other way
    var wC = (o.NR * wR + o.NS * wS) / (o.NR + o.NS);                         // arm speed, from both meshes rolling
    o.a += w * dt; o.aR += wR * dt; o.aS += wS * dt; o.aC += wC * dt;
    o.s1 += w * o.R1 * dt; o.s2 += w * o.R1 * dt;
    o.top.rotation.z = o.a;
    o.ring.rotation.z = o.aR;
    o.sun.rotation.z = o.aS;
    o.arm.rotation.z = o.aC;
    // pinion's own angle: rolls on the inner gear, so (pinion - arm) * NP = -(sun - arm) * NS; at the start the inner gear
    // shows a gap at the bottom and the pinion a tooth at the top (pinion angle pi/2 in the world)
    var aP = o.aC - (o.aS - (o.aC + Math.PI / 2)) * o.NS / o.NP + Math.PI;
    o.pin.rotation.z = aP - o.aC;
    o.belt1.place(o.mark1, o.s1);
    o.belt2.place(o.mark2, o.s2);
    function f(v) { v = Math.round(v * 10) / 10; if (v === 0) v = 0; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("ring", f(rpm * o.R1 / o.RB));
    S.set("sun", f(-rpm * o.R1 / r));
    S.set("arm", f(rpm * (o.NR * o.R1 / o.RB - o.NS * o.R1 / r) / (o.NR + o.NS)));
  }
});
