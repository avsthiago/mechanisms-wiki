M507.define({
  number: 412,
  title: "Capstan wheel-work",
  lede: "Gears hidden in the foot of a capstan let the same push wind the rope three times as hard. A bolt chooses between a quick, plain pull and a slow, strong one.",
  alt: "Seen from above: a big ring with teeth on its inside, the foot of the rope barrel. Inside it a small gear on the central spindle meshes with three equal gears on a three-lobed plate, and those mesh with the ring. Bars stick out from the spindle top. Two hooks rest on the outside of the ring.",
  parts: [
    { key: "head", color: "#5E7387", name: "Drumhead and spindle", note: "The top that the men push round with bars. It is fixed to the spindle and to the small gear in the middle. The bolt on its arm can lock it to the barrel." },
    { key: "barrel", color: "#C8873A", name: "Barrel", note: "The drum the rope winds on. Its foot is a ring with teeth on the inside. Watch the red stripe on its top." },
    { key: "pinions", color: "#D9B13B", name: "Three gears", note: "They turn on pins in a plate. Each one passes the turn from the middle gear out to the ring." },
    { key: "plate", color: "#4FA58A", name: "Gear plate", note: "Holds the pins of the three gears. With the gears working, it stays still. With the bolt in, it turns along with everything else." },
    { key: "catch", color: "#8E7AA8", name: "Holding pawls", note: "Two hooks, called holding pawls, on the base that rest against the barrel. On a real capstan they stop the rope pulling the barrel backwards." }
  ],
  controls: [{ id: "mode", label: "Drumhead and barrel", value: "geared", options: [["locked", "Bolted together"], ["geared", "Through the gears"]] }],
  readouts: [{ id: "h", label: "Drumhead" }, { id: "b", label: "Barrel" }],
  speed: { min: 1, max: 30, value: 12, label: "Drumhead speed", unit: " rpm" },
  views: { "3d": [0, 640, 200], top: [0, 680, 1], side: [0, 120, 780] },
  target: [0, 40, 0],
  how: [
    "The men push bars to turn the drumhead. The spindle under it carries a small gear in the middle. Three equal gears sit round it, and they touch the teeth inside the barrel's ring.",
    "With the gears working, the plate holding the three gears stays still. The middle gear turns them, and they turn the ring the other way. The ring has three times as many teeth as the middle gear, so the barrel goes round once for every three turns of the drumhead. The men walk three times as far, but the rope pulls three times as hard.",
    "With the bolt dropped in, drumhead and barrel are locked together. Nothing inside can turn against anything else, so the whole set goes round as one. Try Bolted together, then Through the gears, and watch the drumhead change direction and speed against the red stripe."
  ],
  note: "This model is rebuilt from Brown's drawing. The bars, the bolt on its arm, the holes in the barrel top, the short piece of barrel, the base and the ring track it runs on, the sizes and the number of teeth were made up. Brown does not say how the gear plate is let go for the plain pull; here it simply turns with the rest. The holding pawls only rest on a plain rim, because the notches they would drop into are not drawn.",

  build: function (c) {
    var T = c.THREE, P = c.P, MD = 7, NS = 12, NR = 36, i;
    var o = this.o = { NS: NS, NR: NR, s: 0, cr: 0, r: 0, mode: "geared", hb: 1, pl: [] };
    // everything in a group whose local XY is the ground plan and local +Z points up (world +Y); seen from above, x right, y away
    var G = o.G = new T.Group(); G.rotation.x = -Math.PI / 2; c.scene.add(G);
    var mh = c.mat("head"), mb = c.mat("barrel"), mp = c.mat("pinions"), mq = c.mat("plate"), mc = c.mat("catch");

    // fixed: base z -12..0; ring track (annulus r 140..158) z 0..8, the ring stands on its top
    P.at(P.box(560, 560, 12, c.fixed), 0, 0, -6, G);
    var tr = new T.Shape(); tr.absarc(0, 0, 158, 0, 2 * Math.PI, false); var th = new T.Path(); th.absarc(0, 0, 140, 0, 2 * Math.PI, true); tr.holes.push(th);
    G.add(P.mesh(new T.ExtrudeGeometry(tr, { depth: 8, bevelEnabled: false, curveSegments: 64 }), c.fixed));

    // gear plate z 0..6 (rests on the base), three lobes under the pinions, hole for the spindle
    o.plate = new T.Group(); G.add(o.plate);
    o.dist = (NR - NS) * MD / 4 * 2;                                        // planet centres 84 from the middle
    o.ang = [Math.PI / 6, 5 * Math.PI / 6, 3 * Math.PI / 2];               // top right, top left, bottom, as drawn
    var pts = [], raw = [], n = 360;
    for (i = 0; i < n; i++) {
      var t = i * 2 * Math.PI / n, ux = Math.cos(t), uy = Math.sin(t), r = 58;
      o.ang.forEach(function (a) {
        var cx = o.dist * Math.cos(a), cy = o.dist * Math.sin(a), d = cx * ux + cy * uy, q = 30 * 30 - (o.dist * o.dist - d * d);
        if (q >= 0) r = Math.max(r, d + Math.sqrt(q));
      });
      raw.push(r);
    }
    for (i = 0; i < n; i++) { var sm = 0; for (var k = -6; k <= 6; k++) sm += raw[(i + k + n) % n]; var rr = sm / 13, tt = i * 2 * Math.PI / n; pts.push([rr * Math.cos(tt), rr * Math.sin(tt)]); }
    var hole = []; for (i = 0; i < 40; i++) hole.push([10.5 * Math.cos(-i * Math.PI / 20), 10.5 * Math.sin(-i * Math.PI / 20)]);
    o.plate.add(P.outlinePlate({ points: pts, holes: [hole], depth: 6, z0: 0, material: mq }));   // max radius 114, inside the ring tips (119)

    // three pinions z 8..24 on pins z 6..27 standing on the plate
    o.pin = [];
    for (i = 0; i < 3; i++) {
      var a = o.ang[i], px = o.dist * Math.cos(a), py = o.dist * Math.sin(a);
      P.at(P.cylZ(7, 21, mq), px, py, 16.5, o.plate);    // pin z 6..27
      P.at(P.cylZ(10, 2.5, mq), px, py, 25.75, o.plate); // cap z 24.5..27, half a unit clear of the gear top
      var pg = new T.Group(); pg.position.set(px, py, 16); o.plate.add(pg);
      var g = P.spurGear({ teeth: NS, module: MD, bore: 7.5, material: mp }); pg.add(g);
      P.at(P.box(20, 4, 1, c.mat("pinions", "dark")), 22, 0, 9, pg);     // stripe r 12..32, z 24.5..25.5 on the gear top
      o.pin.push(pg);
    }
    o.pitchS = 2 * Math.PI / NS; o.pitchR = 2 * Math.PI / NR;

    // spindle with sun gear, drumhead, bars and locking arm, turning about local Z
    o.head = new T.Group(); G.add(o.head);
    var sun = P.spurGear({ teeth: NS, module: MD, material: mh }); sun.position.z = 16; o.head.add(sun);        // z 8..24
    P.at(P.box(24, 4, 1, c.mat("head", "dark")), 25, 0, 25, o.head);     // stripe r 13..37, z 24.5..25.5 on the sun top
    var sp = P.cylZ(9, 124, mh); P.at(sp, 0, 0, 62, o.head);                                // spindle z 0..124, stands on the base
    var dh = P.cylZ(26, 24, mh); P.at(dh, 0, 0, 112, o.head);                               // drumhead z 100..124
    for (i = 0; i < 4; i++) {
      var ba = Math.PI / 4 + i * Math.PI / 2, bar = P.box(170, 7, 7, mh);
      bar.rotation.z = ba; P.at(bar, 110 * Math.cos(ba), 110 * Math.sin(ba), 116, o.head);                    // bars r 25..195, z 112.5..119.5
    }
    o.bA = 0;                                                                                                  // bolt on the +X arm
    P.at(P.box(140, 16, 8, mh), 24 + 70, 0, 104, o.head);                                                     // arm r 24..164, z 100..108
    o.bolt = new T.Group(); o.bolt.position.set(146, 0, 0); o.head.add(o.bolt);
    var bl = P.cylZ(5, 54, mh); P.at(bl, 0, 0, 27, o.bolt);                                 // bolt z 0..54 in its own group (raised by step)
    var kn = P.cylZ(9, 6, c.mat("head", "mark")); P.at(kn, 0, 0, 57, o.bolt);              // red knob z 54..60

    // barrel: internal ring z 8..24 on the track, short barrel wall z 24..64, twelve holes for the bolt on its top
    o.barrel = new T.Group(); G.add(o.barrel);
    var ring = P.internalGear({ teeth: NR, module: MD, rim: 18, material: mb }); ring.position.z = 16; o.barrel.add(ring);   // outer r 152.75
    o.Ro = ring.outerRadius;
    var ws = new T.Shape(); ws.absarc(0, 0, o.Ro, 0, 2 * Math.PI, false); var wh = new T.Path(); wh.absarc(0, 0, 138, 0, 2 * Math.PI, true); ws.holes.push(wh);
    var wg = new T.ExtrudeGeometry(ws, { depth: 40, bevelEnabled: false, curveSegments: 72 }); wg.translate(0, 0, 24); o.barrel.add(P.mesh(wg, mb));
    for (i = 0; i < 12; i++) { var ha = i * Math.PI / 6, hc = P.cylZ(6, 1, c.mat("barrel", "dark")); P.at(hc, 146 * Math.cos(ha), 146 * Math.sin(ha), 64.75, o.barrel); }   // hole marks z 64.25..65.25
    var st = P.box(10, 6, 1, c.mat("barrel", "mark")); st.rotation.z = Math.PI / 12; P.at(st, 146 * Math.cos(Math.PI / 12), 146 * Math.sin(Math.PI / 12), 64.75, o.barrel);   // red stripe between two holes

    // catches, as drawn: pivots out to the right, hooks resting on the top and bottom of the barrel rim
    [1, -1].forEach(function (sg) {
      var tx = o.Ro * Math.cos(Math.PI / 2 + .0175), ty = o.Ro * Math.sin(Math.PI / 2 + .0175);   // tip on the rim, just left of the top
      var q = [[-8, 176], [140, 176], [146, 171], [140, 166], [14, 166], [tx, ty], [-8, 167]];
      if (sg < 0) q = q.map(function (p) { return [p[0], -p[1]]; }).reverse();
      G.add(P.outlinePlate({ points: q, depth: 15, z0: 8.5, material: mc }));                                  // z 8.5..23.5
      var pv = P.cylZ(6, 26, mc); P.at(pv, 140, sg * 171, 13, G);                           // pivot pin z 0..26, on the base
    });

    // phases so that every pinion meshes with the sun and the ring (sun tooth at angle 0 to start)
    o.p0 = o.ang.map(function (a) { return a + Math.PI + o.pitchS * (.5 + a / o.pitchS); });
    o.r0 = o.ang[0] + o.pitchR * (.5 + (o.p0[0] - o.ang[0]) / o.pitchS);
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w, want = S.controls.mode, k = 1 / 3, step = Math.PI / 6;
    function geared(t) { o.s -= w * t; o.r += w * k * t; }
    function locked(t) { o.s += w * t; o.r += w * t; o.cr += w * t; }
    function rel() { return o.s + o.bA - o.r0 - o.r; }          // bolt angle less the angle of the holes
    if (o.mode === "geared" && want === "locked") o.mode = "lowering";
    if (o.mode === "locked" && want === "geared") o.mode = "raising";
    if (o.mode === "lowering" && want === "geared") o.mode = "geared";
    if (o.mode === "raising" && want === "locked") o.mode = "locked";
    if (o.mode === "geared") { o.hb = Math.min(1, o.hb + dt * 3); geared(dt); }
    else if (o.mode === "raising") { locked(dt); o.hb = Math.min(1, o.hb + dt * 3); if (o.hb >= 1) o.mode = "geared"; }
    else if (o.mode === "locked") { o.hb = Math.max(0, o.hb - dt * 3); locked(dt); }
    else {                                                   // lowering: bolt rests on the barrel top until a hole comes round
      if (o.hb > .5) { o.hb = Math.max(.5, o.hb - dt * 3); geared(dt); }
      else {
        var x = rel() / step, fr = x - Math.floor(x), rate = -(1 + k) * w / step;        // rel falls as the drumhead runs back
        var tStar = rate < 0 ? fr / -rate : Infinity;
        if (fr < 1e-6 || tStar <= dt) { if (fr >= 1e-6) geared(tStar); o.mode = "locked"; o.hb = .5; locked(dt - Math.min(dt, tStar)); }
        else geared(dt);
      }
    }
    // relative turning: sun s, ring r (both measured from the start), plate cr; ring - plate = -(sun - plate) / 3
    var cr = o.cr, i;
    o.head.rotation.z = o.s;
    o.plate.rotation.z = cr;
    o.barrel.rotation.z = o.r0 + o.r;
    for (i = 0; i < 3; i++) o.pin[i].rotation.z = o.p0[i] - (o.s - cr);
    o.bolt.position.z = 58 + 12 * o.hb;                      // bottom 58 in a hole, 64 resting on top, 70 clear

    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0, gearedNow = o.mode === "geared" || o.mode === "lowering";
    S.set("h", f(gearedNow ? -rpm : rpm));
    S.set("b", f(gearedNow ? rpm / 3 : rpm));
  }
});
