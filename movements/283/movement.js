M507.define({
  number: 283,
  title: "Air-pump racks and pinion",
  lede: "A curved handle rocks a small gear, called a pinion, to and fro. The wheel pushes two toothed bars, called racks, one on each side. One rack rises while the other sinks, so two small air pumps work in turn. People used this to pump air out of glass jars in science experiments.",
  alt: "A toothed wheel with a curved handle rising from it to the upper left. A short toothed bar stands on the left of the wheel and a taller toothed bar stands on the right. Each bar ends in a rod and a disc inside a clear tube below.",
  parts: [
    { key: "gear", color: "#D9B13B", name: "Pinion", note: "The small gear in the middle. Its teeth fit the teeth of both racks. Watch the red stripe rock to and fro." },
    { key: "lever", color: "#5E7387", name: "Handle", note: "A curved arm fixed to the pinion. A hand moves its end up and down to rock the pinion." },
    { key: "rack", color: "#C8873A", name: "Racks", note: "Two straight bars with teeth. One is pushed up while the other is pulled down. Watch the red bands." },
    { key: "piston", color: "#4FA58A", name: "Pistons", note: "Each rack carries a rod and a disc that slides in a tube. The disc pushes air out on one stroke and draws it in on the next." }
  ],
  controls: [{ type: "range", id: "swing", label: "How far the handle rocks", min: 40, max: 100, step: 10, value: 80, unit: "°", presets: [[50, "Short"], [80, "Medium"], [100, "Long"]] }],
  closed: { label: "Pumps" },
  readouts: [{ id: "h", label: "Handle" }, { id: "l", label: "Left piston" }, { id: "r", label: "Right piston" }],
  views: { "3d": [520, 100, 1150], front: [0, -80, 1250], side: [1150, -80, 0] },
  target: [0, -80, 0],
  distance: [500, 2800],
  how: [
    "Rock the handle and the pinion turns one way, then back. Its teeth push on the teeth of both racks at once. The rack on the left goes down while the rack on the right goes up. Then they swap.",
    "Each rack is joined to a rod and a disc, called a piston, that fits a tube. When a piston goes down it pushes air out of its tube. When it goes up it draws air in. The two pumps always work in opposite turns, so one of them is always pushing air.",
    "Try Short, then Long. Watch how far the discs slide inside the tubes. Choose Closed to see the pumps as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the pinion, the curved handle and the two racks, the right one taller than the left. The back plate and base, the guide rails behind the racks, the rods, discs and tubes for the pumps, the sizes and the number of teeth were made up. The choice of how far the handle rocks was added to show what it changes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 7, NG = 20, p = Math.PI * MD;
    var rp = NG * MD / 2, XB = 22.75;
    var o = this.o = { a: 0, rp: rp, rack: [] };
    var tube = c.fixed.clone(); tube.side = T.DoubleSide;
    // gear z -8..8, shaft z -30..8 (plate face to gear face), hub z 8..12, handle z 12..18
    var g = o.g = new T.Group(); scene.add(g);
    P.at(P.spurGear({ teeth: NG, module: MD, material: c.mat("gear") }), 0, 0, 0, g);
    P.at(P.cylZ(6, 38, c.mat("gear")), 0, 0, -11, g);
    P.at(P.cylZ(11, 4, c.mat("gear")), 0, 0, 10, g);
    var rf = rp - 1.25 * MD;
    P.at(P.box(rf - 14, 5, 1, c.mat("gear", "mark")), 11 + (rf - 14) / 2, 0, 9, g);      // red stripe x 11..rf-3, z 8.5..9.5, off the face
    // curved handle: an arc of radius 100 about (0, 100), from the hub at the bottom round to the upper left
    var lv = o.lever = new T.Group(); scene.add(lv);
    var arm = P.arc(100, 4.5, 80 * Math.PI / 180, c.mat("lever")); arm.rotation.z = -170 * Math.PI / 180;
    P.at(arm, 0, 100, 15, lv);                                                          // z 10.5..19.5, over the hub face at 12
    P.at(P.cylZ(9, 6, c.mat("lever")), 0, 0, 15, lv);                                   // boss z 12..18 on the hub face
    P.at(P.sphere(10, c.mat("lever", "mark")), -98.5, 82.6, 15, lv);                    // knob at the arm's end
    // racks: tooth rows face the gear. dir -1: left; local y 0..L; rod y -120..0; piston y -130..-120.
    [[-1, 1, -176, 12], [1, -1, -198, 17]].forEach(function (s, i) {
      var sx = s[0], side = s[1], B = s[2], N = s[3], L = N * p, grp = new T.Group(); grp.position.x = sx * rp; scene.add(grp);
      var rk = P.rack({ teeth: N, module: MD, side: side, body: 28, thick: 16, material: c.mat("rack") });
      grp.add(rk);                                                                        // body x -XB.. (28 wide), z -8..8
      P.at(P.box(24, 5, 1, c.mat("rack", "mark")), -side * XB, L * .6, 8.5, grp);         // red band, z 8.5..9.5, off the face
      P.at(P.cylY(5, 120, c.mat("piston")), -side * XB, -60, 0, grp);                     // rod y -120..0, on the rack end face
      c.shell(P.at(P.cylY(28.5, 10, c.mat("piston")), -side * XB, -125, 0, grp), "open");    // piston y -130..-120, on the rod end; hidden in the closed barrel
      c.shell(P.at(P.cylY(28.5, 1, c.mat("piston", "dark")), -side * XB, -130.5, 0, grp), "open");   // dark pad on the piston underside, y -131..-130
      o.rack.push({ g: grp, base: B, dir: -sx });
      var s3 = B - 200, s4 = B - 10, h = s4 - s3;
      var bx = sx * (rp + XB), t = P.cylY(30, h, tube); t.geometry = new T.CylinderGeometry(30, 30, h, 40, 1, true); t.material = tube;
      P.at(c.shell(t, "open"), bx, (s3 + s4) / 2, 0, scene);                              // barrel x +-30, z -30..30, y s3..s4
      // closed view: the same barrel solid, with a top cover y s4 that the rod (r 5) passes through
      var tw = P.mesh(new T.CylinderGeometry(30, 30, h, 40, 1, true), c.fixed);
      P.at(c.shell(tw, "closed"), bx, (s3 + s4) / 2, 0, scene);
      var cap = P.mesh(new T.RingGeometry(5, 30, 40), c.fixed); cap.rotation.x = -Math.PI / 2;
      P.at(c.shell(cap, "closed"), bx, s4, 0, scene);
      P.at(P.box(60, 8, 60, c.fixed), bx, s3 - 4, 0, scene);                              // foot y s3-8..s3, z -30..30, plate face at z -30
      var rc = i ? 60 : -20;
      P.at(P.box(28, 150, 22, c.fixed), bx, rc, -19, scene);                              // rail z -30..-8, y rc+-75, touches plate and rack back
    });
    P.at(P.box(340, 674, 10, c.fixed), 0, -77, -35, scene);                               // plate x -170..170, y -414..260, z -40..-30
    P.at(P.box(380, 12, 100, c.fixed), 0, -420, -30, scene);                              // base y -426..-414, z -80..20; plate stands on y -414; feet bottoms -384 and -406 clear it
  },

  step: function (c, dt, S) {
    var o = this.o, amp = S.controls.swing * Math.PI / 360, th;
    o.a += S.w * dt;
    th = amp * Math.sin(o.a);                                  // pinion swings back and forth, anticlockwise is positive
    o.g.rotation.z = th;
    o.lever.rotation.z = th;
    var d = o.rp * th;
    // right rack rises as the pinion turns anticlockwise, left rack falls
    o.rack[0].g.position.y = o.rack[0].base - d;
    o.rack[1].g.position.y = o.rack[1].base + d;
    function f(v) { v = Math.round(v); return (v < 0 ? "−" + -v : v) + " mm"; }
    var dg = Math.round(th * 180 / Math.PI);
    S.set("h", (dg < 0 ? "−" : "") + Math.abs(dg) + "°");
    S.set("l", f(-d));
    S.set("r", f(d));
  }
});
