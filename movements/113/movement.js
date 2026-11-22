M507.define({
  number: 113,
  title: "Rack and pinion",
  lede: "A small gear, called a pinion, turns against a straight bar with teeth, called a rack. When the gear turns, the bar slides along. When the bar is pushed, the gear turns. It changes turning into straight motion, or the other way round.",
  alt: "A long flat table lies on two round rollers. Under the table hangs a short bar with teeth on its lower edge. A gear below meshes with those teeth, turning on a short shaft in an upright plate.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear that turns. Its teeth fit into the gaps of the rack. Watch the red stripe to see it turn one way, then back." },
    { key: "rack", color: "#C8873A", name: "Rack and table", note: "A bar with teeth along its lower edge, fixed under a flat table. It slides left and right. Watch the red block on the table." },
    { key: "roller", color: "#D9B13B", name: "Rollers", note: "Two round rollers carry the table. They stay in place and spin as the table slides over them." }
  ],
  controls: [{ id: "size", label: "Pinion size", value: "mid", options: [["small", "Small"], ["mid", "Medium"], ["large", "Big"]] }],
  readouts: [{ id: "a", label: "Pinion" }, { id: "x", label: "Table" }],
  views: { "3d": [400, 210, 740], front: [0, -50, 880], side: [880, -50, 0] },
  target: [0, -50, 0],
  distance: [400, 2600],
  how: [
    "The gear turns one way and its teeth push the teeth of the rack. The rack and the table above it slide sideways. At the end of the swing the gear turns back, and the table slides back.",
    "The gear and the rack move together, tooth for tooth. For every tooth that passes the meeting point, the table moves one tooth along. So a gear that turns once makes the table slide as far as the gear's rim is long. It works both ways. Push the table and the gear turns.",
    "Try Small, then Large. The gear swings the same amount each time, but watch how far the red block on the table travels."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the rack on a table that rests on two rollers, with the gear below. The upright plate and base, the way the gear swings back and forth, the sizes and the number of teeth were made up. The choice of gear size was added to show what it changes.",

  // Module 7. Pinion 12, 18 or 24 teeth, centre x = 0, shaft in the plate. The rack pitch line is y = 0, so the pinion centre is y = -pitch radius.
  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 7, NR = 12, p = Math.PI * MD, RR = 36;
    var o = this.o = { a: 0, p: p, NR: NR, RR: RR, sets: {} };
    // pinions: gear z -8..8, shaft z -30 (plate face) .. 8, hub z 8..12
    [["small", 12], ["mid", 18], ["large", 24]].forEach(function (s) {
      var g = new T.Group(), gear = P.spurGear({ teeth: s[1], module: MD, material: c.mat("pinion") });
      g.add(gear);
      P.at(P.cylZ(6, 38, c.mat("pinion")), 0, 0, -11, g);                    // shaft z -30..8
      P.at(P.cylZ(11, 4, c.mat("pinion")), 0, 0, 10, g);                     // hub z 8..12, on the gear face
      var rf = gear.pitchRadius - 1.25 * MD;
      P.at(P.box(rf - 14, 5, 1, c.mat("pinion", "mark")), 11 + (rf - 14) / 2, 0, 9, g);   // red stripe x 11..rf-3, z 8.5..9.5, off the face
      g.position.set(0, -gear.pitchRadius, 0); scene.add(g);
      o.sets[s[0]] = { g: g, N: s[1], rp: gear.pitchRadius };
    });
    // rack and table, everything in one group that slides in x
    var rg = o.rack = new T.Group(); scene.add(rg);
    var rack = P.rack({ teeth: NR, module: MD, side: 1, body: 36, thick: 16, material: c.mat("rack") });
    rack.rotation.z = -Math.PI / 2; rack.position.x = -NR * p / 2; rg.add(rack);   // teeth point down; root y 8.75, body top y 44.75, z -8..8
    P.at(P.box(680, 8, 40, c.mat("rack")), 0, 48.75, 0, rg);                      // table y 44.75..52.75, z -20..20, on the rack body top
    P.at(P.box(14, 8, 14, c.mat("rack", "mark")), 0, 56.75, 0, rg);               // red block y 52.75..60.75, on the table top
    // rollers: radius 36, centre y 8.75 so the top is the table's underside (44.75); roller z -15..15, shaft z -30..-15
    o.rollers = [];
    [-250, 250].forEach(function (x) {
      var r = new T.Group(); r.position.set(x, 8.75, 0); scene.add(r);
      P.at(P.cylZ(RR, 30, c.mat("roller")), 0, 0, 0, r);
      P.at(P.cylZ(5, 15, c.mat("roller")), 0, 0, -22.5, r);                      // shaft z -30..-15, from the plate face to the roller
      P.at(P.box(28, 5, 1, c.mat("roller", "mark")), 16, 0, 15.5, r);             // red stripe x 2..30, z 15..16, off the face
      o.rollers.push(r);
    });
    // supports
    P.at(P.box(800, 270, 10, c.fixed), 0, -65, -35, scene);                      // plate x -400..400, y -200..70, z -40..-30; shafts end at z -30
    P.at(P.box(840, 12, 100, c.fixed), 0, -206, -30, scene);                     // base x -420..420, y -212..-200, z -80..20; plate stands on y -200
  },

  step: function (c, dt, S) {
    var o = this.o, k, cur = o.sets[S.controls.size] || o.sets.mid, p = o.p, th, x;
    o.a += S.w * dt;
    th = 0.8 * Math.sin(o.a);                                  // the pinion swings back and forth, radians
    for (k in o.sets) o.sets[k].g.visible = o.sets[k] === cur;
    cur.g.rotation.z = -th;                                    // clockwise pushes the rack to the right
    // rack tooth gap sits under each pinion tooth: x = rp * th - N * p / 4, shifted by whole teeth to stay near the middle
    var off = -cur.N * p / 4; off -= p * Math.round(off / p);
    x = cur.rp * th + off;
    o.rack.position.x = x;
    o.rollers.forEach(function (r) { r.rotation.z = -x / o.RR; });
    var dx = cur.rp * th;
    S.set("a", (th < 0 ? "−" : "") + Math.abs(Math.round(th * 180 / Math.PI)) + "°");
    S.set("x", (dx < 0 ? "−" : "") + Math.abs(Math.round(dx)) + " mm");
  }
});
