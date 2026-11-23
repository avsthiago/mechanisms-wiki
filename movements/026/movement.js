M507.define({
  number: 26,
  title: "Crown wheel",
  lede: "A crown wheel has its teeth standing up from its flat face, like the points of a crown. An ordinary gear on an upright shaft meshes with them. Together they pass turning round a corner, from an upright shaft to a level one.",
  alt: "A big wheel stands on edge on a level shaft, with a ring of teeth standing up from its face. A small gear on an upright shaft lies flat above its top edge, with its teeth between the crown teeth.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Driving gear", note: "An ordinary gear, called a spur gear, on an upright shaft. It does the driving. The dark stripe shows it turning." },
    { key: "crown", color: "#C8873A", name: "Crown wheel", note: "A wheel with its teeth standing up from its flat face. Watch the red tooth to count its turns." },
    { key: "shaft", color: "#4FA58A", name: "Driven shaft", note: "Fixed to the back of the crown wheel. It turns with the wheel, at right angles to the upright shaft." }
  ],
  controls: [{ id: "n", label: "Driving gear size", value: "12", options: [["8", "Small"], ["12", "Medium"], ["24", "Big"]] }],
  readouts: [{ id: "p", label: "Driving gear" }, { id: "c", label: "Crown wheel" }],
  views: { "3d": [-535, 315, 590], front: [-10, 30, 900], side: [-900, 30, 0] },
  target: [-10, 30, 0],
  how: [
    "Look at the big wheel from the side. Its teeth do not stick out from the rim, as on most gears. They stand up from its flat face, all the way round. That is why it is called a crown wheel.",
    "The small gear lies flat on top. Its teeth dip in between the crown teeth near the top of the wheel. Each tooth pushes a crown tooth sideways, so the crown wheel moves on by one tooth. The fewer teeth the small gear has, the more times it must turn for one turn of the crown wheel.",
    "Brown warns that the crown teeth must be thin. They are held only at their foot, so a hard push can bend or snap them. That is why this gear is used only for light work. Try the small, medium and big gear. All three fit the same crown wheel, and the big one turns it fastest."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the number of teeth and the stand that holds the shafts were made up. Brown does not say which wheel drives; here the driving gear does. The choice of three gear sizes was added to show that one crown wheel fits them all.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 6, NC = 48, XC = -10, YB = 230;
    var o = this.o = { NC: NC, gam: Math.PI / 2, pin: {} };

    // crown wheel: axis along world X, toothed face towards -X. Disc x XC-6..XC+6, teeth out to XC-19.5
    var outer = new T.Group(); outer.position.set(XC, 0, 0); outer.rotation.y = -Math.PI / 2; scene.add(outer);
    o.crown = new T.Group(); outer.add(o.crown);
    var cw = P.crownWheel({ teeth: NC, module: MD, width: 12, material: c.mat("crown"), markMaterial: c.mat("crown", "mark") });
    o.crown.add(cw);
    var RC = cw.pitchRadius, XPL = XC - cw.pitchZ;               // RC 144; pitch line x = XC - 13.5
    P.at(P.cylZ(22, 20, c.mat("shaft")), 0, 0, -15.5, o.crown);  // hub, local z -25.5..-5.5 (world x XC+5.5..XC+25.5)
    P.at(P.cylZ(8, 102, c.mat("shaft")), 0, 0, -57, o.crown);    // shaft, local z -108..-6 (world x XC+6..XC+108, ends at the post face)

    // spur gears: upright axis, mid-plane at y = RC, pitch circle touching the crown's pitch line at x = XPL
    [8, 12, 24].forEach(function (n) {
      var g = new T.Group(), gear = P.spurGear({ teeth: n, module: MD, width: 16, material: c.mat("pinion") });
      gear.rotation.x = -Math.PI / 2; g.add(gear);                                   // gear y -8..8 about its centre
      g.position.set(XPL - gear.pitchRadius, RC, 0); scene.add(g);
      P.at(P.cylY(12, 14, c.mat("pinion")), 0, 14.5, 0, g);                           // hub, y 7.5..21.5
      P.at(P.cylY(5, YB - RC - 8, c.mat("pinion")), 0, (YB - RC + 8) / 2, 0, g);     // shaft, y 8..YB-RC, ends at the beam's underside
      P.at(P.box(gear.pitchRadius - 1.25 * MD - 12, 1, 4, c.mat("pinion", "dark")), (gear.pitchRadius - 1.25 * MD + 12) / 2, 9, 0, g);   // stripe, y 8.5..9.5
      o.pin[n] = { g: g, pitch: gear.pitch };
    });

    // stand
    P.at(P.box(280, 10, 340, c.fixed), XC + 10, -180, 0, scene);   // base, x XC-130..XC+150, y -185..-175
    P.at(P.box(24, 405, 30, c.fixed), XC + 120, 27.5, 0, scene);   // post, x XC+108..XC+132, y -175..230
    P.at(P.box(242, 16, 24, c.fixed), XC + 11, 238, 0, scene);     // beam, x XC-110..XC+132, y 230..246
  },

  step: function (c, dt, S) {
    var o = this.o, n = +S.controls.n;
    o.gam += S.w * dt * n / o.NC;                                   // crown turns n/NC as fast as the spur gear
    o.crown.rotation.z = o.gam;
    for (var k in o.pin) {
      var p = o.pin[k], on = +k === n;
      p.g.visible = on;
      if (on) p.g.rotation.y = p.pitch / 2 + (o.gam - Math.PI / 2) * o.NC / n;   // a gap meets the red tooth at the top
    }
    var rp = S.playing ? S.rpm : 0, rc = rp * n / o.NC;
    S.set("p", rp + " rpm");
    S.set("c", (rc < 10 ? rc.toFixed(1) : Math.round(rc)) + " rpm");
  }
});
