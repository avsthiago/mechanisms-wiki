M507.define({
  number: 418,
  title: "Buchanan and Righter's valve motion",
  lede: "A steam valve slides back and forth on a flat seat. Steam pushes it down hard, so it rubs and wears. Here a rod and a roller running in hung arcs hold the valve up, so it just touches the seat.",
  alt: "Inside a cut-away steam chest, a slide valve sits on its seat. A rod rises from the valve to a pin in a vertical slot near the top. Halfway up, a roller on the rod runs in curved slots in two plates hung from a screw in the chest cover.",
  parts: [
    { key: "valve", color: "#C8873A", name: "Valve", note: "Slides left and right on the flat seat to open and close the steam ports. Steam above it pushes it down." },
    { key: "stem", color: "#5E7387", name: "Valve stem", note: "Moves the valve back and forth. In an engine it is worked by a cam on the engine shaft, not shown." },
    { key: "rod", color: "#D9B13B", name: "Rod and roller", note: "Pinned to the valve at the bottom. Its top pin slides in an upright slot. Watch the red rollers run along the curved slots." },
    { key: "arcs", color: "#4FA58A", name: "Hanging arcs", note: "Two plates with curved slots, hung from a screw in the cover. Turning the screw raises or lowers them." }
  ],
  controls: [{ type: "range", id: "h", label: "Height of the arcs", min: -5, max: 8, step: 1, value: 0, unit: " mm", presets: [[-5, "Too low"], [0, "Just touching"], [8, "Too high"]] }],
  closed: { label: "Valve chest" },
  readouts: [{ id: "x", label: "Valve" }, { id: "gap", label: "Gap under valve" }, { id: "seat", label: "Presses on seat" }],
  views: { "3d": [436, 257, 893], front: [20, 30, 1040], side: [1040, 30, 60] },
  target: [20, 30, 0],
  how: [
    "Watch the valve slide left and right. The rod leans one way, then the other. Its top pin moves up and down in the upright slot, and the red rollers run along the curved slots in the hanging plates.",
    "Steam fills the chest and pushes the valve down onto its seat. Without help, that push makes the valve rub hard. Here the valve hangs from the rod, and the rod hangs from the rollers resting in the curved slots. The curve is exactly the path the rollers take, so the valve stays the same height all the way along.",
    "The screw sets how high the arcs hang. Too low, and the rollers float clear, so the steam presses the valve hard. Too high, and the valve lifts off the seat and steam leaks under it. Try all three and watch the rollers and the gap. Choose Closed to see the valve chest as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown does not say what moves the valve; here a stem through the side of the chest does. The chest is cut away to show the inside. The way the arcs are hung from the screw, the guide for the top pin and all the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { th: 0, e: 36, L: 306, dC: 103.5, yP: -139, rr: 9, cl: 3 }, i;
    var ySeat = -190;
    // valve on the seat (y -190..-157), with two cheeks holding the bottom pin
    var mv = c.mat("valve");
    o.vg = new T.Group(); scene.add(o.vg);
    P.at(P.box(130, 33, 70, mv), 0, ySeat + 16.5, 0, o.vg);                          // valve x -65..65, y -190..-157, z -35..35
    P.at(P.box(60, 36, 4, mv), 0, -139, 7.5, o.vg);                                   // cheek y -157..-121, z 5.5..9.5
    P.at(P.box(60, 36, 4, mv), 0, -139, -7.5, o.vg);                                  // cheek z -9.5..-5.5
    P.at(P.cylZ(4, 20, c.mat("valve", "dark")), 0, o.yP, 0, o.vg);                    // bottom pin z -10..10
    // valve stem, out through the right wall
    var mst = c.mat("stem");
    P.at(P.cylX(5, 160, mst), 145, -173, 0, o.vg);                                    // stem x 65..225
    P.at(P.cylZ(12, 16, mst), 230, -173, 0, o.vg);                                    // eye at its end, where the cam rod would be pinned
    // rod: an arm from the bottom pin to the top pin, with an eye for the roller axle
    var mr = c.mat("rod");
    o.rod = P.armPlate({ length: o.L, r0: 9, r1: 9, thick: 10, material: mr }); scene.add(o.rod);   // z -5..5
    o.rg = new T.Group(); scene.add(o.rg);
    P.at(P.cylZ(14, 11, mr), 0, 0, 0, o.rg);                                          // eye z -5.5..5.5
    P.at(P.cylZ(4, 22.5, mr), 0, 0, 0, o.rg);                                         // axle z -11.75..11.75
    P.at(P.cylZ(o.rr, 3.5, c.mat("rod", "mark")), 0, 0, 10, o.rg);                    // roller z 8.25..11.75, inside the front plate (8..12)
    P.at(P.cylZ(o.rr, 3.5, c.mat("rod", "mark")), 0, 0, -10, o.rg);                   // roller in the back plate
    o.tp = P.at(P.cylZ(5, 26, c.mat("rod", "dark")), 0, 0, 0, scene);                 // top pin z -13..13
    // hanging plates: the curved slot follows the path of the roller centre, raised by the clearance
    var self = this, line = [], up = [], dn = [], N = 48, hw = o.rr + o.cl;
    for (i = 0; i <= N; i++) { var xc = -75 + 150 * i / N, q = this.cpath(xc / (1 - o.dC / o.L)); line.push(q); }
    for (i = 0; i <= N; i++) {
      var a = line[Math.max(0, i - 1)], b = line[Math.min(N, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty), nx = -ty / tl, ny = tx / tl;
      var m = [line[i][0] + nx * o.cl, line[i][1] + ny * o.cl];
      up.push([m[0] + nx * hw, m[1] + ny * hw]); dn.push([m[0] - nx * hw, m[1] - ny * hw]);
      if (i === 0) o.c0 = m; if (i === N) o.c1 = m;
    }
    function cap(ctr, a0, sgn) { var r = []; for (var k = 1; k < 12; k++) { var t = a0 + sgn * Math.PI * k / 12; r.push([ctr[0] + hw * Math.cos(t), ctr[1] + hw * Math.sin(t)]); } return r; }
    var slot = up.concat(cap(o.c1, Math.PI / 2, -1)).concat(dn.reverse()).concat(cap(o.c0, -Math.PI / 2, -1));
    var vs = [[5.5, 150]].concat(cap([0, 150], 0, -1)).concat([[-5.5, 150], [-5.5, 185]]).concat(cap([0, 185], Math.PI, -1)).concat([[5.5, 185]]);
    var outline = [[-35, 200], [-40, 70], [-95, 0], [-100, -60], [100, -60], [95, 0], [40, 70], [35, 200]];   // clear of the walls at x 110
    var win = [[-22, 125], [-25, 65], [-75, 5], [75, 5], [25, 65], [22, 125]];             // open window, so the rod shows
    var ma = c.mat("arcs");
    o.hg = new T.Group(); scene.add(o.hg);
    o.hg.add(P.outlinePlate({ points: outline, depth: 4, z0: 8, material: ma, holes: [slot, vs, win] }));    // front plate z 8..12
    o.hg.add(P.outlinePlate({ points: outline, depth: 4, z0: -12, material: ma, holes: [slot, vs, win] }));  // back plate z -12..-8
    P.at(P.box(70, 15, 24, ma), 0, 207.5, 0, o.hg);                                   // cross block y 200..215 joining the plates
    P.at(P.cylY(6, 95, ma), 0, 262.5, 0, o.hg);                                       // screw y 215..310, up through the cover
    P.at(P.box(26, 12, 26, c.mat("arcs", "dark")), 0, 269, 0, scene);                 // nut y 263..275, sitting on the cover top; the screw moves through it
    // chest and seat (not part of the movement); front and back walls left off to show the inside
    c.shell(P.at(P.box(300, 40, 90, c.fixed), 0, ySeat - 20, 0, scene));                     // seat x -150..150, y -230..-190
    c.shell(P.at(P.box(25, 180, 90, c.fixed), -122.5, -100, 0, scene));                     // left wall x -135..-110, y -190..-10
    var wr = P.guideBlock({ w: 180, h: 25, d: 90, hole: 5.6, hx: -73, material: c.fixed }); wr.rotation.z = Math.PI / 2;
    c.shell(P.at(wr, 122.5, -100, 0, scene));                                                 // right wall x 110..135, hole for the stem at y -173
    c.shell(P.at(P.box(90, 10, 90, c.fixed), -155, -5, 0, scene));                           // flange x -200..-110, y -10..0
    c.shell(P.at(P.box(90, 10, 90, c.fixed), 155, -5, 0, scene));                            // flange x 110..200
    var top = P.guideBlock({ w: 150, h: 12, d: 90, hole: 6.6, material: c.fixed }); c.shell(P.at(top, 0, 257, 0, scene));   // cover top y 251..263
    [-1, 1].forEach(function (sd) {                                                    // sloping sides from the flange (y 0) up to the top (y 251), z +-44.5 so their ends sit 0.5 inside the flange and top ends
      var sdm = P.box(14, 1, 89, c.fixed), x0 = sd * 128, x1 = sd * 68, len = Math.hypot(x1 - x0, 251);
      sdm.scale.y = len; sdm.position.set((x0 + x1) / 2, 125.5, 0); sdm.rotation.z = -Math.atan2(x1 - x0, 251); scene.add(c.shell(sdm));
    });
    // closed view: the front and back walls, z 45..49 and -49..-45, on the end faces of the seat, walls, flanges, sides and top
    var face = [[-135, -190], [135, -190], [135, -10], [200, -10], [200, 0], [135, 0], [75, 251], [75, 263], [-75, 263], [-75, 251], [-135, 0], [-200, 0], [-200, -10], [-135, -10]];
    scene.add(c.shell(P.outlinePlate({ points: face, depth: 4, z0: 45, material: c.fixed }), "closed"));
    scene.add(c.shell(P.outlinePlate({ points: face, depth: 4, z0: -49, material: c.fixed }), "closed"));
  },

  cpath: function (s) {                          // centre of the roller when the bottom pin is at x = s on the seat and the top pin is on x = 0
    var o = this.o, k = Math.sqrt(o.L * o.L - s * s) / o.L;
    return [s * (1 - o.dC / o.L), o.yP + o.dC * k];
  },

  step: function (c, dt, S) {
    var o = this.o, h = S.controls.h, lift = Math.max(0, h);
    o.th += S.w * dt;
    var s = o.e * Math.sin(o.th), yp = o.yP + lift, ty = yp + Math.sqrt(o.L * o.L - s * s);
    o.vg.position.set(s, lift, 0);
    o.rod.position.set(s, yp, 0); o.rod.rotation.z = Math.atan2(ty - yp, -s);
    var q = this.cpath(s); o.rg.position.set(q[0], q[1] + lift, 0);
    o.tp.position.set(0, ty, 0);
    o.hg.position.y = h;
    S.set("x", (s > .5 ? "+" : s < -.5 ? "−" : "") + Math.abs(Math.round(s)) + " mm");
    S.set("gap", lift + " mm");
    S.set("seat", h < 0 ? "Hard" : h > 0 ? "Not at all" : "Lightly");
  }
});
