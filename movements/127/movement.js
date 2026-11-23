M507.define({
  number: 127,
  title: "Air-pump racks",
  lede: "A long handle rocks a toothed wheel back and forth. The wheel pushes two toothed bars, called racks, one on each side. One rack rises while the other sinks, so two pumps work in turn, one pushing air as the other draws it in.",
  alt: "A toothed wheel with a long slanting handle through its centre. A straight toothed bar stands on each side of the wheel, the left one higher than the right. Each bar ends in a rod and a disc inside a clear tube.",
  parts: [
    { key: "gear", color: "#5E7387", name: "Gear", note: "The wheel in the middle. Its teeth fit the gaps of both racks. Watch the red stripe rock to and fro." },
    { key: "lever", color: "#D9B13B", name: "Handle", note: "A long bar fixed to the wheel's shaft. A person pushes its ends up and down to rock the wheel." },
    { key: "rack", color: "#C8873A", name: "Racks", note: "Two straight bars with teeth. One is pushed up and the other is pulled down. Watch the red bands." },
    { key: "piston", color: "#4FA58A", name: "Pistons and rods", note: "Each rack carries a rod and a disc that slides in a tube. The disc pushes air out on one stroke and sucks it in on the next." }
  ],
  controls: [{ type: "range", id: "swing", label: "How far the handle rocks", min: 40, max: 120, step: 10, value: 80, unit: "°", presets: [[50, "Short"], [80, "Medium"], [120, "Long"]] }],
  closed: { label: "Pumps" },
  readouts: [{ id: "h", label: "Handle" }, { id: "l", label: "Left piston" }, { id: "r", label: "Right piston" }],
  views: { "3d": [520, 140, 1150], front: [0, -95, 1250], side: [1150, -95, 0] },
  target: [0, -95, 0],
  distance: [500, 2800],
  how: [
    "Rock the handle and the wheel turns one way, then back. Its teeth push on the teeth of both racks at once. The rack on the right goes up while the rack on the left goes down. Then they swap.",
    "Each rack is joined to a rod and a disc, called a piston, that fits a tube. When a piston goes down it pushes air out of its tube. When it goes up it draws air in. The two pumps always work in opposite turns, so a pump is always pushing air.",
    "Try Short, then Long. Watch how far the discs slide inside the tubes. Choose Closed to see the pumps as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the wheel, the handle and the two racks. The plate and base that hold the shafts, the guide rails behind the racks, the rods, discs and tubes for the pumps, the sizes and the number of teeth were made up. The choice of how far the handle rocks was added to show what it changes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 7, NG = 20, NR = 14, p = Math.PI * MD, L = NR * p;
    var rp = NG * MD / 2, XB = 22.75;
    var o = this.o = { a: 0, rp: rp, p: p, L: L, rack: [] };
    var tube = c.fixed.clone(); tube.side = T.DoubleSide;
    // gear z -8..8, shaft z -30..8 (plate face to gear face), hub z 8..12, handle z 12..18
    var g = o.g = new T.Group(); scene.add(g);
    P.at(P.spurGear({ teeth: NG, module: MD, material: c.mat("gear") }), 0, 0, 0, g);
    P.at(P.cylZ(6, 38, c.mat("gear")), 0, 0, -11, g);
    P.at(P.cylZ(11, 4, c.mat("gear")), 0, 0, 10, g);
    var rf = rp - 1.25 * MD;
    P.at(P.box(rf - 14, 5, 1, c.mat("gear", "mark")), 11 + (rf - 14) / 2, 0, 9, g);      // red stripe x 11..rf-3, z 8.5..9.5, off the face
    var lv = o.lever = new T.Group(); scene.add(lv);
    P.at(P.box(560, 9, 6, c.mat("lever")), 0, 0, 15, lv);                               // handle x -280..280, z 12..18, on the hub face
    P.at(P.sphere(11, c.mat("lever")), -280, 0, 15, lv);
    P.at(P.sphere(11, c.mat("lever", "mark")), 280, 0, 15, lv);
    // racks: side 1 (left) teeth on +X; side -1 (right) teeth on -X. Local y 0..L; rod y -120..0; piston y -130..-120.
    [[-1, 1, -132, -345, -170], [1, -1, -198, -410, -235]].forEach(function (s) {
      var sx = s[0], side = s[1], grp = new T.Group(); grp.position.x = sx * rp; scene.add(grp);
      var rk = P.rack({ teeth: NR, module: MD, side: side, body: 28, thick: 16, material: c.mat("rack") });
      grp.add(rk);                                                                        // body x -XB.. (28 wide), z -8..8
      P.at(P.box(24, 5, 1, c.mat("rack", "mark")), -side * XB, 150, 8.5, grp);            // red band, z 8.5..9.5, off the face
      P.at(P.cylY(5, 120, c.mat("piston")), -side * XB, -60, 0, grp);                     // rod y -120..0, on the rack end face
      c.shell(P.at(P.cylY(28.5, 10, c.mat("piston")), -side * XB, -125, 0, grp), "open");   // piston y -130..-120, on the rod end; hidden in the closed barrel so its edge cannot show through the wall
      c.shell(P.at(P.cylY(28.5, 1, c.mat("piston", "dark")), -side * XB, -130.5, 0, grp), "open");   // dark pad on the piston underside, y -131..-130
      o.rack.push({ g: grp, base: s[2], dir: -sx });
      var bx = sx * (rp + XB), h = s[4] - s[3];
      var t = P.cylY(30, h, tube); t.geometry = new T.CylinderGeometry(30, 30, h, 40, 1, true); t.material = tube;
      P.at(c.shell(t, "open"), bx, (s[3] + s[4]) / 2, 0, scene);                          // barrel x +-30, z -30..30, y s3..s4
      P.at(c.shell(P.wholeSection({ poly: [[29, s[3]], [30, s[3]], [30, s[4]], [29, s[4]]], material: c.fixed }), "closed"), bx, 0, 0, scene);   // closed view: solid barrel wall r 29..30, same y; the piston (r 28.5) slides inside
      P.at(P.box(60, 8, 60, c.fixed), bx, s[3] - 4, 0, scene);                            // foot y s3-8..s3, z -30..30, plate face at z -30
      var rh = 150, rc = s[2] === -132 ? 25 : -45;
      P.at(P.box(28, rh, 22, c.fixed), sx * (rp + XB), rc, -19, scene);                   // rail z -30..-8, y rc+-75, touches plate and rack back
    });
    P.at(P.box(340, 650, 10, c.fixed), 0, -95, -35, scene);                               // plate x -170..170, y -420..230, z -40..-30
    P.at(P.box(380, 12, 100, c.fixed), 0, -426, -30, scene);                              // base y -432..-420, z -80..20; plate stands on y -420
  },

  step: function (c, dt, S) {
    var o = this.o, amp = S.controls.swing * Math.PI / 360, th, rpm = S.playing ? S.rpm : 0;
    o.a += S.w * dt;
    th = amp * Math.sin(o.a);                                  // wheel swings back and forth, anticlockwise is positive
    o.g.rotation.z = th;
    o.lever.rotation.z = th - 0.42;                            // as drawn the left end is raised
    var d = o.rp * th;
    // right rack rises as the wheel turns anticlockwise, left rack falls; both stay a whole number of teeth from the wheel's tooth
    o.rack[0].g.position.y = o.rack[0].base - d;
    o.rack[1].g.position.y = o.rack[1].base + d;
    function f(v) { v = Math.round(v); return (v < 0 ? "−" + -v : v) + " mm"; }
    S.set("h", (Math.round(th * 180 / Math.PI) < 0 ? "−" : "") + Math.abs(Math.round(th * 180 / Math.PI)) + "°");
    S.set("l", f(-d));
    S.set("r", f(d));
  }
});
