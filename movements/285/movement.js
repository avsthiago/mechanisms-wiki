M507.define({
  number: 285,
  title: "Lathe tailstock",
  lede: "This is the sliding head of a lathe. Turn the hand wheel and a screw turns inside it. The screw pushes the spindle, with its pointed centre, in or out. The centre holds the end of the work being turned.",
  alt: "The tailstock of a lathe, cut open. A hand wheel on the right turns a long screw. The screw runs inside a hollow spindle with a pointed centre on its left end.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Hand wheel", note: "You turn this by its handle. It is fixed to the screw, so the screw turns with it." },
    { key: "screw", color: "#4FA58A", name: "Screw", note: "A long screw that turns on the spot and cannot slide. Its thread pulls on the nut inside the spindle." },
    { key: "spindle", color: "#C8873A", name: "Spindle", note: "A hollow tube with a nut in its inner end. It cannot turn, so the nut makes it slide along the screw." },
    { key: "centre", color: "#C2503F", name: "Centre point", note: "The cone on the end of the spindle. It holds the work. Watch it move out and in." }
  ],
  controls: [{ id: "dir", label: "Turn the wheel to", value: "out", options: [["out", "Wind out"], ["in", "Wind in"]] }],
  speed: { min: 1, max: 30, value: 10, label: "Hand wheel speed", unit: " rpm" },
  closed: { label: "Casting" },
  readouts: [{ id: "t", label: "Turns made" }, { id: "s", label: "Centre point out" }],
  views: { "3d": [270, 100, 400], front: [-30, -40, 520], side: [-60, 20, 520] },
  target: [-30, -40, 0],
  how: [
    "The hand wheel is fixed to a screw. The screw can turn but it cannot slide. The spindle is a hollow tube with a nut in its inner end, and the nut grips the thread of the screw.",
    "The spindle is held so that it cannot turn. So when the screw turns, the nut has to slide along it, and the whole spindle slides too. One turn of the wheel moves the spindle only a small, fixed way. That is why you can set the centre point very exactly.",
    "Choose wind out and watch the red centre point move out. Then choose wind in. The spindle stops at each end of its travel, so the wheel stops too. Choose Closed to see the tailstock as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the casting is cut away so you can see inside, as in the picture. The clamp on top and the clamp bolt below are drawn but do not move. The bed, the way the spindle is kept from turning, the hand wheel's spokes and all the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { th: 0, LEAD: 10, TRAVEL: 50, XT: -137.5 };
    // supports (c.fixed). Bed y -146..-117.5, z -45..45. Pedestal and barrel are back halves: z -28..0.
    P.at(P.box(263, 28.5, 90, c.fixed), 1, -131.75, 0, scene);                    // x -130..133
    var ped = new T.Shape();
    [[-90, -117.5], [75, -117.5], [75, -21], [-90, -21]].forEach(function (p, k) { if (k) ped.lineTo(p[0], p[1]); else ped.moveTo(p[0], p[1]); });
    var win = new T.Path();
    [[-50.5, -31], [35.5, -31], [47.5, -43], [47.5, -84], [35.5, -96], [-50.5, -96], [-62.5, -84], [-62.5, -43]].forEach(function (p, k) { if (k) win.lineTo(p[0], p[1]); else win.moveTo(p[0], p[1]); });
    ped.holes.push(win);
    var gp = new T.ExtrudeGeometry(ped, { depth: 28, bevelEnabled: false }); gp.translate(0, 0, -28);
    scene.add(c.shell(P.mesh(gp, c.fixed), "open"));                              // x -90..75, y -117.5..-21 sits on the bed top
    var gw = new T.ExtrudeGeometry(ped, { depth: 56, bevelEnabled: false }); gw.translate(0, 0, -28);
    scene.add(c.shell(P.mesh(gw, c.fixed), "closed"));                            // closed view: the whole pedestal, z -28..28
    function barrel(x0, x1, bore) {                                               // back half of a square barrel with a round bore, along x
      var s = new T.Shape(); s.moveTo(0, -21); s.lineTo(28, -21); s.lineTo(28, 21); s.lineTo(0, 21); s.lineTo(0, bore); s.absarc(0, 0, bore, Math.PI / 2, -Math.PI / 2, true); s.lineTo(0, -21);
      var g = new T.ExtrudeGeometry(s, { depth: x1 - x0, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, x0); g.rotateY(Math.PI / 2);
      return P.mesh(g, c.fixed);
    }
    scene.add(c.shell(barrel(-92.5, 75, 12), "open"));                            // x -92.5..75, y -21..21, bottom = pedestal top
    scene.add(c.shell(barrel(75, 82, 5.5), "open"));                              // end plate x 75..82, bore for the screw journal
    function wholeBarrel(x0, x1, bore) {                                          // closed view: the whole square barrel, z -28..28
      var s = new T.Shape(); s.moveTo(-28, -21); s.lineTo(28, -21); s.lineTo(28, 21); s.lineTo(-28, 21); s.lineTo(-28, -21);
      var h = new T.Path(); h.absarc(0, 0, bore, 0, 2 * Math.PI, false); s.holes.push(h);
      var g = new T.ExtrudeGeometry(s, { depth: x1 - x0, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, x0); g.rotateY(Math.PI / 2);
      return P.mesh(g, c.fixed);
    }
    scene.add(c.shell(wholeBarrel(-92.5, 75, 12), "closed"));
    scene.add(c.shell(wholeBarrel(75, 82, 5.5), "closed"));
    // spindle clamp on top (z centre -14) and bolt head on the window floor
    c.shell(P.at(P.cylY(9, 5, c.fixed), -42.5, 23.5, -14, scene));                         // boss y 21..26
    c.shell(P.at(P.mesh(new T.CylinderGeometry(7, 7, 5, 6), c.fixed), -42.5, 28.5, -14, scene));   // nut y 26..31
    c.shell(P.at(P.cylY(3.5, 9, c.fixed), -42.5, 35.5, -14, scene));                       // stud y 31..40
    c.shell(P.at(P.box(30, 3, 7, c.fixed), -27.5, 41.5, -14, scene));                      // handle y 40..43
    c.shell(P.at(P.cylY(13, 4, c.fixed), -7.5, -94, -14, scene));                          // washer y -96..-92 on the window floor
    c.shell(P.at(P.cylY(10, 10, c.fixed), -7.5, -87, -14, scene));                         // bolt head y -92..-82

    // spindle: a half-section tube with the nut at its inner end; the cone is a separate red part
    var ml = c.mat("spindle");
    o.spindle = new T.Group(); o.spindle.position.set(o.XT, 0, 0); scene.add(o.spindle);
    var hs = P.halfSection({ material: ml, poly: [[0, 57.5], [11, 57.5], [11, 205], [7.8, 205], [7.8, 191], [8.5, 191], [8.5, 64], [0, 64]] });
    hs.rotation.z = -Math.PI / 2; o.spindle.add(c.shell(hs, "open"));                              // local y becomes x: spans x 57.5..205 from the tip
    var ws = P.wholeSection({ material: ml, poly: [[0, 57.5], [11, 57.5], [11, 205], [7.8, 205], [7.8, 191], [8.5, 191], [8.5, 64], [0, 64]] });
    ws.rotation.z = -Math.PI / 2; o.spindle.add(c.shell(ws, "closed"));          // closed view: the whole spindle, its outer end shows out of the barrel
    var cone = P.mesh(new T.CylinderGeometry(1.5, 10, 58.5, 32), c.mat("centre", "mark"));
    cone.rotation.z = Math.PI / 2; P.at(cone, 29.25, 0, 0, o.spindle);            // tip at 0, wide end at 58.5 sinks into the tube end plate
    o.cone = cone;

    // screw: thread and journal, turns on the spot. Collar x 69..75 on the end plate's inner face.
    o.screw = new T.Group(); scene.add(o.screw);
    var ms = c.mat("screw");
    var wm = P.worm({ radius: 6, pitch: 10, addendum: 1.5, dedendum: 1.5, length: 132, material: ms });
    wm.position.x = 1; o.screw.add(wm);                                           // x -65..67
    P.at(P.cylX(5, 31, ms), 82.5, 0, 0, o.screw);                                 // journal x 67..98 through the end plate bore
    P.at(P.cylX(8, 6, ms), 72, 0, 0, o.screw);                                    // collar x 69..75

    // handwheel on the journal, outside the end plate (x 82..)
    o.wheel = new T.Group(); scene.add(o.wheel);
    var mw = c.mat("wheel");
    P.at(P.cylX(10, 18, mw), 91, 0, 0, o.wheel);                                  // hub x 82..100, touches the end plate
    var rim = P.hoop(51, 3, mw); rim.rotation.y = Math.PI / 2; P.at(rim, 92, 0, 0, o.wheel);   // rim x 89..95
    for (i = 0; i < 3; i++) { var sp = P.at(P.box(4, 100, 5, mw), 92, 0, 0, o.wheel); sp.rotation.x = i * Math.PI / 3; }
    P.at(P.cylX(2.5, 12, mw), 101, 51, 0, o.wheel);                               // handle x 95..107
    P.at(P.sphere(5.5, mw), 109, 51, 0, o.wheel);
    P.at(P.cylX(4, .8, c.mat("wheel", "dark")), 100.4, 0, 0, o.wheel);            // end cap x 100..100.8
  },

  step: function (c, dt, S) {
    var o = this.o, dir = S.controls.dir === "in" ? -1 : 1, turns = o.th / (2 * Math.PI);
    var nt = o.th + dir * S.w * dt, maxTh = o.TRAVEL / o.LEAD * 2 * Math.PI;
    if (nt < 0) nt = 0; if (nt > maxTh) nt = maxTh;
    var moved = nt - o.th; o.th = nt; turns = o.th / (2 * Math.PI);
    o.screw.rotation.x = o.th; o.wheel.rotation.x = o.th;
    o.spindle.position.x = o.XT - o.LEAD * turns;                                 // right-hand thread: turning +x about the axis winds the spindle out
    var rpm = dt > 0 ? moved / dt * 60 / (2 * Math.PI) : 0;
    S.set("t", turns.toFixed(1) + " turns");
    S.set("s", Math.round(o.LEAD * turns) + " mm");
  }
});
