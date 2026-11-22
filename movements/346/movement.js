M507.define({
  number: 346,
  title: "Table engine",
  lede: "Steam pushes a piston up and down inside an upright cylinder that stands on a table. A sliding block at the top of the rod is held straight by guides. Two long rods run down past the cylinder to cranks under the table, and turn the push into a spin.",
  alt: "An upright steam cylinder, cut open to show the piston, standing on a table. Tall guides on top hold a sliding block, and two rods run from the block down to two cranks on a shaft under the table.",
  parts: [
    { key: "cyl", color: "#4FA58A", name: "Cylinder", note: "Cut open at the front so you can see inside. It is fixed to the table and does not move." },
    { key: "piston", color: "#C8873A", name: "Piston, piston rod and sliding block", note: "The piston slides up and down. Its piston rod carries a sliding block that slides in the tall guides at the top." },
    { key: "rods", color: "#D9B13B", name: "Connecting rods", note: "Two rods, one on each side of the cylinder. They join the block to the two cranks." },
    { key: "crank", color: "#5E7387", name: "Cranks and shaft", note: "Two arms on one shaft under the table. They turn together." },
    { key: "pin", color: "#C2503F", name: "Crank pins", note: "Where the rods join the cranks. Watch them go round in a circle." }
  ],
  controls: [{ type: "range", id: "arm", label: "Crank arm", min: 16, max: 34, step: 1, value: 30, unit: " mm",
    presets: [[16, "Short"], [26, "Medium"], [34, "Long"]] }],
  readouts: [{ id: "tr", label: "Piston travel" }, { id: "tl", label: "Rod tilt" }],
  closed: { label: "Cylinder" },
  views: { "3d": [380, 190, 700], front: [0, 110, 760], side: [760, 110, 0] },
  target: [0, 115, 0],
  how: [
    "Watch the block at the top. It slides straight up and down in its guides, and the piston below it goes up and down with it. The two long rods lean first one way, then the other.",
    "The rods are joined to the block at the top and to the crank pins at the bottom. The pins go round in circles, and the block can only move up and down. So the rods have to tilt. The guides take the sideways push from the rods, so the piston rod stays straight.",
    "Try a short crank arm, then a long one. The long arm makes the piston travel further and makes the rods tilt more. Choose Closed to see the cylinder as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the cylinder is cut away so the piston shows. The table, its legs, the two bearings under it, the slots in the table top for the rods, the shape of the guides and all the sizes were made up. Steam pipes and valves are left out.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: Math.PI, L: 215, Hc: 90, yb: 40.5, rods: [], cranks: [] };
    var ri = 25, ro = 27, rf = 29, rh = 4.4, t = 6, H = o.Hc, rr = 3.6, zs = 36, i;
    // table, y -50 .. 40; top slab y 32 .. 40 is built in pieces so the side rods pass through slots (x +-34, z 30 .. 42)
    P.at(P.box(140, 8, 116, c.fixed), 0, -54, 0, scene);                     // base, y -58 .. -50
    P.at(P.box(4, 82, 116, c.fixed), -68, -9, 0, scene);                     // side wall, x -70 .. -66, y -50 .. 32
    P.at(P.box(4, 82, 116, c.fixed), 68, -9, 0, scene);                      // side wall, x 66 .. 70
    P.at(P.box(140, 8, 60, c.fixed), 0, 36, 0, scene);                       // top, middle strip z -30 .. 30, y 32 .. 40
    P.at(P.box(140, 8, 16, c.fixed), 0, 36, 50, scene);                      // front strip z 42 .. 58
    P.at(P.box(140, 8, 16, c.fixed), 0, 36, -50, scene);                     // back strip z -58 .. -42
    [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { P.at(P.box(36, 8, 12, c.fixed), a * 52, 36, b * 36, scene); }); });   // x 34 .. 70, z 30 .. 42
    [-1, 1].forEach(function (s) {
      var bb = P.bearingBlock({ bore: 5, outer: 12, drop: 50, width: 8, material: c.fixed });      // shaft bearings, y -50 .. 12, z 50 .. 58
      P.at(bb, 0, 0, s * 54, scene);
    });
    P.at(P.cylZ(4, 117, c.mat("crank")), 0, 0, 0, scene);                    // shaft, z -58.5 .. 58.5
    // cylinder on the table, y 40 .. 130
    o.cyl = P.at(new T.Group(), 0, o.yb, 0, scene);
    var poly = [[0, 0], [rf, 0], [rf, t], [ro, t], [ro, H - t], [rf, H - t], [rf, H], [rh, H], [rh, H - t], [ri, H - t], [ri, t], [0, t]];
    o.cyl.add(c.shell(P.halfSection({ poly: poly, material: c.mat("cyl") }), "open"));
    o.cyl.add(c.shell(P.wholeSection({ poly: poly, material: c.mat("cyl") }), "closed"));   // closed view: the whole cylinder
    // slotted guides on the cylinder top: plates lean in toward the top; y 130 .. 280
    var yg0 = o.yb + H, hg = 150, wb = 22, wt = 12, al = Math.atan((wb - wt) / hg);
    [-1, 1].forEach(function (s) {
      var pl = P.box(3, hg / Math.cos(al), 18, c.fixed);
      P.at(pl, s * (wb + wt) / 2, yg0 + hg / 2, 0, scene); pl.rotation.z = -s * al;
    });
    var arch = P.arc(wt, 1.5, Math.PI, c.fixed); arch.scale.z = 6; P.at(arch, 0, yg0 + hg, 0, scene);
    // piston, rod, block
    o.pis = P.at(new T.Group(), 0, 0, 0, scene);
    o.pis.add(P.halfSection({ poly: [[0, -5], [ri - .6, -5], [ri - .6, 5], [0, 5]], material: c.mat("piston") }));
    o.prod = P.at(P.cylY(rr, 1, c.mat("piston")), 0, 0, 0, o.pis);
    o.blk = P.at(new T.Group(), 0, 0, 0, scene);
    P.at(P.box(20, 16, 16, c.mat("piston")), 0, 0, 0, o.blk);
    P.at(P.cylZ(3.5, 79, c.mat("piston")), 0, 0, 0, o.blk);                 // block pin, z -39.5 .. 39.5
    // side rods and the two cranks
    function link() { return P.at(P.box(8, 1, 5, c.mat("rods")), 0, 0, 0, scene); }
    for (i = 0; i < 2; i++) {
      var s = i ? -1 : 1, rd = { s: s, bar: link() };
      P.at(P.cylZ(9, 6, c.mat("rods")), 0, 0, s * 36, o.blk);                // top eye, |z| 33 .. 39
      rd.eye = P.at(P.cylZ(9, 6, c.mat("rods")), 0, 0, s * 36, scene);       // lower eye
      var cr = P.at(new T.Group(), 0, 0, 0, scene);
      P.at(P.cylZ(20, 6.4, c.mat("crank")), 0, 0, s * 43.1, cr);             // hub, |z| 39.9 .. 46.3
      rd.arm = P.at(P.box(1, 18, 6, c.mat("crank")), 0, 0, s * 43, cr);      // arm, |z| 40 .. 46
      rd.boss = P.at(P.cylZ(12, 6.2, c.mat("crank")), 0, 0, s * 43.2, cr);    // boss, |z| 40.1 .. 46.3
      rd.pin = P.at(P.cylZ(4.5, 14.5, c.mat("pin")), 0, 0, s * 39.75, cr);   // pin, |z| 32.5 .. 47
      rd.cr = cr; o.rods.push(rd);
    }
  },

  step: function (c, dt, S) {
    var o = this.o, r = +S.controls.arm, L = o.L, i;
    o.th += S.w * dt;
    var cs = Math.cos(o.th), sn = Math.sin(o.th), px = r * cs, py = r * sn;
    var yc = py + Math.sqrt(L * L - px * px);                               // block height: rod length fixed, block only moves up and down
    var ymid = o.yb + 45, ellp = L - (ymid - 0);                            // piston is centred in the cylinder when the block is mid-stroke (y = L)
    var yp = yc - ellp;
    o.pis.position.y = yp; o.prod.scale.y = ellp - 8; o.prod.position.y = (ellp - 8) / 2 + 0;
    o.blk.position.y = yc;
    var dx = px, dy = py - yc, len = Math.sqrt(dx * dx + dy * dy);
    for (i = 0; i < 2; i++) {
      var rd = o.rods[i];
      rd.cr.rotation.z = o.th;
      rd.arm.scale.x = r; rd.arm.position.x = r / 2;
      rd.boss.position.x = r; rd.pin.position.x = r;
      rd.eye.position.set(px, py, rd.s * 36);
      rd.bar.position.set(px / 2, (py + yc) / 2, rd.s * 36);
      rd.bar.scale.y = len;
      rd.bar.rotation.z = Math.atan2(-dx, dy);
    }
    S.set("tr", Math.round(yc - (L - r)) + " mm");
    S.set("tl", (Math.atan2(px, yc - py) * 180 / Math.PI).toFixed(1) + "°");
  }
});
