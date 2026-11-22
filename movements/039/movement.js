M507.define({
  number: 39,
  title: "Sun and planet",
  lede: "A rod pushed up and down by an engine turns a shaft round and round, without a crank. A gear on the end of the rod rolls round a gear on the shaft. The shaft turns twice for every trip the rod's gear makes round it.",
  alt: "Two equal gears in mesh. The left one, the sun gear, is fixed on a shaft with a spoked flywheel behind it. The right one, the planet gear, is fixed to the bottom of a long upright rod. An arm joins the centres of the two gears. The top of the rod slides in an upright guide.",
  parts: [
    { key: "planet", color: "#5E7387", name: "Rod and planet gear", note: "The gear is fixed to the bottom of the rod, so it never spins on its own. It only tips a little as the rod leans. The top of the rod slides up and down in a guide." },
    { key: "sun", color: "#C8873A", name: "Sun gear", note: "Fixed on the flywheel shaft. The planet gear rolls round it and drives it. Watch the red stripe to count its turns." },
    { key: "arm", color: "#D9B13B", name: "Arm", note: "Joins the centres of the two gears. It turns freely on the shaft and keeps the planet gear in mesh as it goes round." },
    { key: "fly", color: "#4FA58A", name: "Flywheel", note: "A heavy wheel on the same shaft as the sun gear. It keeps the shaft turning smoothly between the pushes of the rod." }
  ],
  controls: [{ id: "size", label: "Planet gear", value: "same", options: [["same", "Same as sun"], ["small", "Half as big"]] }],
  readouts: [{ id: "arm", label: "Arm" }, { id: "sun", label: "Sun gear" }],
  views: { "3d": [360, 25, 910], front: [0, 0, 1020], side: [1020, 0, 0] },
  target: [0, -10, 0],
  how: [
    "The rod goes up and down, and its gear is carried round the sun gear. The arm holds the two centres together. The rod leans a little, but its gear never turns right round.",
    "Think of the planet gear as standing still while it is carried round. Its teeth roll along the sun's teeth like a wheel along a curved road. One trip round carries the sun gear round once. The rolling of the teeth adds one more turn. So the sun gear turns twice for each trip.",
    "Watch the readouts. With equal gears the sun makes two turns for each turn of the arm. Try Half as big and compare. The extra turn from rolling is now only half a turn."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the two gears, the arm and the bottom of the rod. The slotted ring round the sun gear is drawn here as a flywheel behind the gears. The guide at the top of the rod, the plate and base, the sizes and the number of teeth were made up. In a real engine the rod hangs from the end of a rocking beam instead of a straight guide. The choice of planet size was added to show where the second turn comes from.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 4, YS = -110, XG = 80, L = 280;
    var o = this.o = { phi: 0, th: 0, last: null, YS: YS, XG: XG, L: L, sets: {} };
    // sun gear, shaft and flywheel turn together. Gear z -8..8.
    o.sun = new T.Group(); o.sun.position.set(0, YS, 0); scene.add(o.sun);
    var sg = P.spurGear({ teeth: 20, module: MD, material: c.mat("sun") }); o.sun.add(sg); o.rs = sg.pitchRadius;   // pitch radius 40
    P.at(P.cylZ(6, 48.5, c.mat("sun")), 0, 0, -5.75, o.sun);                  // shaft z -30..18.5, from the plate face to the collar front
    P.at(P.cylZ(10, 2.5, c.mat("sun")), 0, 0, 17.25, o.sun);                  // collar z 16..18.5, against the arm front
    var rf = o.rs - 1.25 * MD;
    P.at(P.box(rf - 18, 4, 1, c.mat("sun", "mark")), 14 + (rf - 18) / 2, 0, 9, o.sun);   // red stripe x 14..rf-4, z 8.5..9.5, lifted off the gear face
    var fly = P.pulley({ radius: 70, width: 10, rim: 9, spokes: 4, hub: 13, material: c.mat("fly") });
    P.at(fly, 0, 0, -19, o.sun);                                              // flywheel z -24..-14, clear of plate (-30) and gear (-8)
    // arm: free on the sun shaft, z 10..16, in front of the gear faces (z 8)
    o.arm = new T.Group(); o.arm.position.set(0, YS, 13); scene.add(o.arm);
    o.armBar = P.at(P.box(1, 16, 6, c.mat("arm")), 0, 0, 0, o.arm);
    P.at(P.cylZ(12, 6, c.mat("arm")), 0, 0, 0, o.arm);                        // round end round the shaft
    o.armEnd = P.at(P.cylZ(12, 6, c.mat("arm")), 80, 0, 0, o.arm);            // round end round the planet sleeve
    // planet gears, one for each size; group rotation = rod lean
    [["same", 20], ["small", 10]].forEach(function (s) {
      var g = new T.Group(), gear = P.spurGear({ teeth: s[1], module: MD, material: c.mat("planet") });
      gear.rotation.z = gear.pitch / 2;                                         // half a tooth, so a gap faces the sun's tooth when upright
      g.add(gear); scene.add(g);
      P.at(P.cylZ(7, 11, c.mat("planet")), 0, 0, 13.5, g);                    // sleeve z 8..19, through the arm end, from gear face to rod boss
      P.at(P.cylZ(10, 11, c.mat("planet")), 0, 0, 24.5, g);                   // rod boss z 19..30
      var r2 = gear.pitchRadius - 1.25 * MD;
      P.at(P.box(4, r2 - 12, 1, c.mat("planet", "dark")), 0, 12 + (r2 - 12) / 2, 9, g);  // dark stripe up the face, z 8.5..9.5
      o.sets[s[0]] = { g: g, rp: gear.pitchRadius };
    });
    o.rod = P.rod(5, c.mat("planet")); scene.add(o.rod);                       // rod at z 24.5 (19.5..29.5), in front of the collar (18.5)
    o.head = new T.Group(); o.head.position.set(XG, 0, 0); scene.add(o.head);
    P.at(P.box(22, 20, 42, c.mat("planet")), 0, 0, -7, o.head);               // crosshead x 69..91, z -28..14, 2 off the plate face
    P.at(P.cylZ(5, 16, c.mat("planet")), 0, 0, 22, o.head);                   // pin z 14..30, on the crosshead front
    P.at(P.cylZ(9, 11, c.mat("planet")), 0, 0, 24.5, o.head);                 // rod eye z 19..30
    // supports
    P.at(P.box(8, 200, 44, c.fixed), XG - 15, 156, -8, scene);                // left rail x 61..69, y 56..256, z -30..14, on the plate face
    P.at(P.box(8, 200, 44, c.fixed), XG + 15, 156, -8, scene);                // right rail x 91..99
    P.at(P.box(260, 496, 10, c.fixed), 0, 8, -35, scene);                     // plate x -130..130, y -240..256, z -40..-30; shaft ends at z -30
    P.at(P.box(300, 12, 110, c.fixed), 0, -246, -25, scene);                  // base y -252..-240, z -80..30; plate stands on y -240. Lowest gear tip y -234
  },

  step: function (c, dt, S) {
    var o = this.o, k, key = S.controls.size || "same", cur = o.sets[key], rp = cur.rp, a = o.rs + rp;
    if (o.last !== key) { o.phi = 0; o.th = 0; o.last = key; }                 // fresh count for each size
    for (k in o.sets) o.sets[k].g.visible = o.sets[k] === cur;
    o.phi += S.w * dt;
    var px = a * Math.cos(o.phi), py = o.YS + a * Math.sin(o.phi);            // planet centre: on a circle round the sun centre
    var dx = o.XG - px, hy = py + Math.sqrt(o.L * o.L - dx * dx);             // crosshead: fixed rod length, on the guide line
    var rho = Math.atan2(-dx, hy - py);                                        // rod lean = planet angle, as they are one piece
    var th = o.phi + (rp / o.rs) * (o.phi - rho);                              // rolling: rs (th - phi) = rp (phi - rho)
    cur.g.position.set(px, py, 0); cur.g.rotation.z = rho;
    o.rod.span(px, py, 24.5, o.XG, hy, 24.5);
    o.head.position.y = hy;
    o.arm.rotation.z = o.phi; o.armBar.scale.x = a; o.armBar.position.x = a / 2; o.armEnd.position.x = a;
    o.sun.rotation.z = th;
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v.toFixed(1)) + " turns"; }
    S.set("arm", f(o.phi / (2 * Math.PI)));
    S.set("sun", f(th / (2 * Math.PI)));
  }
});
