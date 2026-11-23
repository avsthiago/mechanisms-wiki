M507.define({
  number: 368,
  title: "Drawing a spiral on a cylinder",
  lede: "One crank turns a cylinder and, at the same time, slides a marking point down beside it. The point draws a line that winds round the cylinder like the thread of a screw. Because one crank drives both, the turning and the sliding always keep in step.",
  alt: "On a table, a crank turns a level shaft carrying a spur gear and a bevel gear. The bevel gear turns a flat bevel gear and its upright shaft, which runs down through the table to a pale cylinder underneath. The spur gear drives an upright toothed bar that slides down through the table and carries an arm with a red point touching the cylinder, which draws a dark sloping line.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Crank and spur gear", note: "Turning the crank turns the level shaft, the spur gear on it and the upright bevel gear at its end." },
    { key: "bevel", color: "#C8873A", name: "Bevel gears", note: "Two gears with sloping teeth that turn the motion round a corner. The flat one turns the upright shaft of the cylinder." },
    { key: "cyl", color: "#E8E2D0", name: "Cylinder", note: "Hangs under the table on the upright shaft and turns with the flat bevel gear." },
    { key: "rack", color: "#4FA58A", name: "Toothed bar", note: "An upright bar with teeth, called a rack. The spur gear's teeth push it down through the table, carrying the arm." },
    { key: "point", color: "#C2503F", name: "Marking point", note: "Rides on the arm and presses on the cylinder. Watch it draw the line." }
  ],
  controls: [{ id: "ratio", label: "Cylinder turns", value: "1", options: [["1", "Same as crank"], ["2", "Twice as fast"]] }],
  readouts: [{ id: "turns", label: "Cylinder" }, { id: "down", label: "Point moved" }],
  views: { "3d": [600, 220, 960], front: [-10, 20, 1080], side: [1080, 20, 60] },
  target: [-10, 30, 0],
  how: [
    "Turn the crank and two things happen at once. The bevel gears turn the cylinder. The spur gear pushes the toothed bar down, and the marking point slides down the side of the cylinder.",
    "Both movements come from the same crank, so they always keep in step. Each turn of the cylinder, the point drops by the same amount. That makes an even spiral, called a helix, like the thread on a screw. When the point reaches the bottom, the crank turns back and the point runs up the same line.",
    "The bevel gears set how far the cylinder turns while the point moves down. Try Same as crank, then Twice as fast. With the cylinder turning faster, the line winds round more and lies flatter."
  ],
  note: "This model is rebuilt from Brown's drawing. The legs, the floor bearing under the cylinder, the post behind the toothed bar, the sizes and the number of teeth were made up. The second, smaller bevel gear is an extra to compare. The crank turns back on its own at each end so the model keeps going.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = 180 / Math.PI, i;
    var o = this.o = { th: 0, dir: 1, reach: 0, ratio: null, sets: {} };
    var AX = -60, AY = 80, RC = 65, RP = 60, YP0, TRAVEL = 170;
    o.AX = AX; o.RC = RC; o.RP = RP; o.TRAVEL = TRAVEL;
    function boxE(x0, x1, y0, y1, z0, z1, m) { return P.at(P.box(x1 - x0, y1 - y0, z1 - z0, m), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, scene); }
    // ---- level shaft (axis X, y 80): vertical bevel gear's hub ends at x 7; shaft x 7..156; crank at x 156..164
    o.drive = new T.Group(); o.drive.position.set(0, AY, 0); scene.add(o.drive);
    P.at(P.cylX(6, 149, c.mat("drive")), 81.5, 0, 0, o.drive);                       // shaft x 7..156
    var spur = P.spurGear({ teeth: 20, module: 6, width: 40, bore: 0, material: c.mat("drive") });
    spur.rotation.y = Math.PI / 2; P.at(spur, 87, 0, 0, o.drive);                    // x 67..107; a tooth sits at the front (+Z) when the shaft is at 0
    P.at(P.box(1, 4, 50, c.mat("drive", "dark")), 107.5, 0, 0, o.drive);            // stripe on the gear's right face, x 107..108
    P.at(P.box(8, 52, 10, c.mat("drive")), 160, -22, 0, o.drive);                   // crank arm x 156..164, hangs down
    P.at(P.cylX(4, 16, c.mat("drive")), 172, -44, 0, o.drive);                      // handle pin x 164..180
    P.at(P.cylX(7, 18, c.mat("drive", "dark")), 189, -44, 0, o.drive);              // grip x 180..198
    // bevel pairs: apex at (AX, AY). Built like a mitre pair with one gear on top and turned upside down, so the flat gear faces up
    function pair(id, rh, nh, rv, nv) {
      var s = { g: new T.Group(), r: nh / nv }, coneH = Math.atan2(rh, rv) * D;
      s.g.position.set(AX, AY, 0); s.g.rotation.z = Math.PI; scene.add(s.g);
      var aH = rh / Math.tan(coneH / D), aV = rv / Math.tan((90 - coneH) / D);
      s.h = P.bevelGearCone({ radius: rh, teeth: nh, cone: coneH, hubLength: 67 - aH - 7 * Math.sin(coneH / D) - .5, material: c.mat("bevel") });
      s.g.add(s.h);                                                                  // flat gear: its hub's lower face at y 80 - 66.5 = 13.5, just over the block
      var outer = new T.Group(); outer.rotation.z = Math.PI / 2; s.g.add(outer);     // local +Y points to world +X
      s.v = P.bevelGearCone({ radius: rv, teeth: nv, cone: 90 - coneH, hubLength: 67 - aV - 7 * Math.sin((90 - coneH) / D), material: c.mat("bevel") });
      outer.add(s.v);                                                                // upright gear: hub ends at x = AX + 67 = 7, where the shaft starts
      o.sets[id] = s;
    }
    pair("1", 50, 24, 50, 24);
    pair("2", 25, 12, 50, 24);
    // ---- cylinder and its upright shaft, turning about x = AX
    o.cyl = new T.Group(); o.cyl.position.set(AX, 0, 0); scene.add(o.cyl);
    P.at(P.cylY(6, 46.5, c.mat("bevel")), 0, -9.75, 0, o.cyl);                      // shaft y -33..13.5, through the block and the table
    P.at(P.cylY(RC, 205, c.mat("cyl")), 0, -137.5, 0, o.cyl);                        // cylinder y -240..-35
    P.at(P.cylY(6, 10, c.mat("cyl")), 0, -245, 0, o.cyl);                            // pivot y -250..-240, on the floor
    P.at(P.cylY(8, 2, c.mat("cyl")), 0, -34, 0, o.cyl);                              // collar y -35..-33 where the shaft meets the cylinder
    // ---- rack: teeth face -Z, pitch line at z = RP, so it meshes with the spur gear's front. Thickness along X, x 67..107
    var rk = P.rack({ teeth: 18, module: 6, side: 1, body: 16, thick: 40, material: c.mat("rack") });
    rk.rotation.y = Math.PI / 2;                                                    // local X (teeth) -> world -Z, local Z -> world X
    o.rk = new T.Group(); scene.add(o.rk); P.at(rk, 87, 0, RP, o.rk);
    YP0 = AY - 7 * rk.pitch;                                                         // rack bottom at the start; a gap centre then sits at y 80, at the gear's front tooth
    o.YP0 = YP0;
    // bracket under the rack's foot (y -10..0 below it), arm along X at z 35..45, then the point
    var back = RP - rk.root + 16;                                                    // z of the rack's back face (root 7.5 behind the pitch line, body 16)
    var bz0 = 35;
    P.at(P.box(40, 10, back - bz0, c.mat("rack")), 87, -5, (back + bz0) / 2, o.rk);     // bracket x 67..107, y -10..0, z 35..back; top meets the rack's foot
    var xc = AX + Math.sqrt((RC + .6) * (RC + .6) - 40 * 40);                         // where the point meets the cylinder, at z 40
    o.mu = Math.atan2(-40, xc - AX);                                                 // its angle round the cylinder (x, z) = R(cos mu, -sin mu)
    P.at(P.box(120 - (xc + 14), 8, 10, c.mat("rack")), (120 + xc + 14) / 2, -5, 40, o.rk);   // arm x xc+14..120
    var pen = new T.Mesh(new T.ConeGeometry(4, 14, 16), c.mat("point")); pen.rotation.z = Math.PI / 2; P.at(pen, xc + 7, -5, 40, o.rk);  // tip at xc
    o.penY = -5;
    // ---- the line on the cylinder, built for each gear set and shown up to how far the point has gone
    o.lines = {};
    ["1", "2"].forEach(function (id) {
      var s = o.sets[id], N = 400, pos = [], idx = [], k, R = RC + .6;
      for (k = 0; k <= N; k++) {
        var th = (TRAVEL / RP) * k / N, y = YP0 + o.penY - RP * th, lam = o.mu - th / s.r;       // cylinder turns -(th)/r about Y, so the point is at mu - turn
        var cx = R * Math.cos(lam), cz = -R * Math.sin(lam);
        pos.push(cx, y + 2, cz, cx, y - 2, cz);
        if (k) idx.push(2 * k - 2, 2 * k - 1, 2 * k, 2 * k - 1, 2 * k + 1, 2 * k);
      }
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      var m = new T.Mesh(g, c.mat("cyl", "dark")); m.material.side = T.DoubleSide; o.cyl.add(m); o.lines[id] = { m: m, N: N };
    });
    // ---- supports
    P.at(P.bearingBlock({ bore: 6.5, outer: 13, width: 12, drop: 80, material: c.fixed }), 40, 80, 0, scene).rotation.y = Math.PI / 2;    // x 34..46, foot on the table y 0
    P.at(P.bearingBlock({ bore: 6.5, outer: 13, width: 12, drop: 80, material: c.fixed }), 133, 80, 0, scene).rotation.y = Math.PI / 2;   // x 127..139
    var blk = P.guideBlock({ w: 60, h: 13, d: 60, hole: 6.5, material: c.fixed }); P.at(blk, AX, 6.5, 0, scene);   // block x -90..-30, y 0..13 under the flat gear
    // table y -20..0, x -200..200, z -80..100, with a hole for the upright shaft and a slot for the rack
    var sz = back + .5;
    boxE(-200, -67, -20, 0, -80, 100, c.fixed);
    boxE(-53, 66.5, -20, 0, -80, 100, c.fixed);
    boxE(-67, -53, -20, 0, -80, -7, c.fixed); boxE(-67, -53, -20, 0, 7, 100, c.fixed);          // square hole x -67..-53, z -7..7 round the shaft
    boxE(66.5, 107.5, -20, 0, -80, RP - rk.tip - .5, c.fixed); boxE(66.5, 107.5, -20, 0, sz, 100, c.fixed);   // rack slot
    boxE(107.5, 200, -20, 0, -80, 100, c.fixed);
    boxE(75, 99, 0, 200, sz, sz + 12, c.fixed);                                      // post behind the rack, standing on the table
    boxE(-200, 200, -260, -250, -80, 100, c.fixed);                                  // floor y -260..-250; the cylinder's pivot ends on it
    boxE(-195, -185, -250, -20, -80, -70, c.fixed); boxE(185, 195, -250, -20, -80, -70, c.fixed);   // legs from the floor up to the table's underside
  },

  step: function (c, dt, S) {
    var o = this.o, id = S.controls.ratio === "2" ? "2" : "1", s = o.sets[id], k, TH = o.TRAVEL / o.RP;
    if (o.ratio !== id) { o.ratio = id; o.th = 0; o.dir = 1; o.reach = 0; }
    o.th += o.dir * S.w * dt;
    if (o.th >= TH) { o.th = TH; o.dir = -1; } else if (o.th <= 0) { o.th = 0; o.dir = 1; }
    o.reach = Math.max(o.reach, o.th);
    for (k in o.sets) o.sets[k].g.visible = k === id;
    o.drive.rotation.x = o.th;                                                       // front of the gear moves down
    s.v.rotation.y = o.th;                                                           // upright bevel turns with the shaft
    var a = (s.v.pitch / 2 - o.th) / s.r;                                            // flat gear's own angle, half a tooth on to mesh
    s.h.rotation.y = a;
    o.cyl.rotation.y = -a;                                                           // the pair is turned over, so the flat gear's angle is reversed in the world
    o.rk.position.y = o.YP0 - o.RP * o.th;
    for (k in o.lines) {
      o.lines[k].m.visible = k === id;
      // the line was drawn with the cylinder at -(th)/r; shift it so it matches the cylinder's real angle
      o.lines[k].m.rotation.y = (o.sets[k].v.pitch / 2) / o.sets[k].r;
    }
    var L = o.lines[id], n = Math.floor(o.reach / TH * L.N);
    L.m.geometry.setDrawRange(0, n * 6);
    S.set("turns", (o.th / s.r / (2 * Math.PI)).toFixed(2) + " turns");
    S.set("down", Math.round(o.RP * o.th) + " mm");
  }
});
