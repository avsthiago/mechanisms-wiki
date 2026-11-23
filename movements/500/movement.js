M507.define({
  number: 500,
  title: "Magdeburg pressure gauge",
  lede: "Pressure pushes a thin metal disc up by a tiny amount. A lever and two gears turn that tiny push into a big swing of the pointer.",
  alt: "Pressure gauge seen from the front. A corrugated disc at the bottom pushes a rod up against a toothed sector, which turns a pinion carrying the pointer over a dial.",
  _hint: "Drag to look around. Pinch or scroll to zoom. Move the pressure slider to work the gauge by hand.",
  parts: [
    { key: "A", color: "#5E7387", name: "Disc", note: "A thin, wavy metal disc held tight around its edge. The liquid or gas pushes on it from below." },
    { key: "rod", color: "#D9B13B", name: "Push rod", note: "Passes the disc's push up to the toothed sector." },
    { key: "e", color: "#C8873A", name: "Toothed sector", note: "A slice of a big gear. It swings on a pin near the bottom." },
    { key: "out", color: "#4FA58A", name: "Pinion and pointer", note: "A small gear with the pointer fixed to it. The sector turns it." },
    { key: "dial", color: "#E8E2D0", name: "Dial", note: "The scale the pointer moves over, from 0 to 10." }
  ],
  controls: [{ type: "range", id: "pressure", label: "Pressure", min: 0, max: 10, step: .1, value: 5, pauseOnInput: true, unit: " of 10", presets: [[0, "Empty"], [5, "Half"], [10, "Full"]] }],
  speed: false,
  readouts: [{ id: "p", label: "Pressure" }, { id: "s", label: "Sector turns" }, { id: "o", label: "Pointer turns" }],
  views: { "3d": [330, 40, 780], front: [0, -50, 870], side: [860, -50, 60] },
    target: [0, -50, 0],
  how: [
    "The liquid or gas you want to measure is let in under the disc. The disc is held all round its edge, so only the middle can move. More pressure makes it bulge more. The waves in the metal make it springy, so it goes back when the pressure drops.",
    "That bulge is far too small to see. So a rod passes it to a lever with gear teeth on its end, called a sector. The teeth are much further from the pin than the rod is, so they move much further.",
    "Then the gears make the movement bigger again. The sector is a slice of a big gear, and it turns a small gear on the pointer's spindle. The small gear has far fewer teeth, so the pointer turns much further than the sector swings. A small swing sends the pointer most of the way round the dial."
  ],
  note: "This model is rebuilt from Brown's description. The disc moves much more here than in a real gauge, so that you can see it. The case, the sizes, the number of teeth and the 0 to 10 scale were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D2R = Math.PI / 180;
    var o = this.o = { t: 0, was: true, ARM: 25, SW: 22.5 * D2R, YD: -185, RD: 80, PVX: -25, PVY: -109.17 };
    o.H = 2 * o.ARM * Math.sin(o.SW);                     // full rise of the disc centre
    var b0 = Math.atan2(-o.PVY, -o.PVX);                  // direction from sector pivot to the pinion

    // case and pressure chamber: context only
    var shell = c.fixed.clone(); shell.side = T.DoubleSide; shell.depthWrite = false; shell.opacity = .35;
    P.at(P.cylZ(150, 4, shell), 0, 0, -28, scene);
    P.at(P.hoop(150, 5, c.fixed), 0, 0, 0, scene);
    P.at(P.cylZ(3, 28, c.fixed), o.PVX, o.PVY, -14, scene);
    var flange = P.hoop(o.RD + 3, 5, c.fixed); flange.rotation.x = Math.PI / 2; P.at(flange, 0, o.YD, 0, scene);
    function lathe(pts, m) { return P.mesh(new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), 48), m); }
    P.at(lathe([[10, -60], [10, -38], [30, -38], [80, -6], [86, -6], [86, 0]], shell), 0, o.YD, 0, scene);
    o.fluid = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .2, depthWrite: false });
    var fl = P.at(lathe([[0, -60], [9, -60], [9, -37], [29, -37], [77, -6], [77, -1], [0, -1]], o.fluid), 0, o.YD, 0, scene); fl.renderOrder = 4;

    // A: the corrugated disc, reshaped every frame
    var prof = [], r;
    for (r = 0; r <= o.RD; r += 2) prof.push([r, 0]);
    o.disc = lathe(prof, c.mat("A")); o.disc.userData.live = true; P.at(o.disc, 0, o.YD, 0, scene);

    // push rod
    o.L0 = (o.PVY - o.ARM * Math.sin(o.SW)) - o.YD;
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.cylY(3, o.L0 - 1, c.mat("rod")), 0, (o.L0 + 1) / 2, 0, o.rod);
    P.at(P.cylZ(4.5, 12, c.mat("rod")), 0, o.L0, 0, o.rod);
    P.at(P.cylY(9, 3, c.mat("rod")), 0, 2, 0, o.rod);

    // e: sector with its short arm
    o.sector = new T.Group(); o.sector.position.set(o.PVX, o.PVY, 0); scene.add(o.sector);
    var sec = P.gearSector({ teeth: 48, module: 4, fromDeg: b0 / D2R - 31, toDeg: b0 / D2R + 31, width: 6, material: c.mat("e") });
    o.sector.add(sec);
    P.at(P.box(o.ARM + 5, 7, 6, c.mat("e")), o.ARM / 2 + .5, 0, 0, o.sector);
    P.at(P.cylZ(8, 10, c.mat("e")), 0, 0, 0, o.sector);

    // pinion, spindle and pointer
    o.pinion = new T.Group(); scene.add(o.pinion);
    var pin = P.spurGear({ teeth: 8, module: 4, width: 10, material: c.mat("out") }); o.pinion.add(pin);
    P.at(P.cylZ(3, 62, c.mat("out")), 0, 0, 3, o.pinion);
    // phase so a sector tooth meets a pinion gap on the line of centres
    var us = b0 / sec.pitch, frac = (.5 - us) - Math.floor(.5 - us);
    o.psi0 = b0 + Math.PI - pin.pitch * frac;
    o.ratio = 48 / 8;
    var hand = new T.Group(); hand.position.z = 30; hand.rotation.z = 225 * D2R - (o.psi0 + o.ratio * o.SW); o.pinion.add(hand);
    var red = c.mat("out", "mark");
    P.at(P.box(126, 5, 2, red), 45, 0, 0, hand); P.at(P.cylZ(9, 4, red), 0, 0, 0, hand);

    // dial: a 270 degree arc, open at the bottom where the works are
    P.at(P.mesh(new T.RingGeometry(100, 143, 72, 1, -45 * D2R, 270 * D2R), c.mat("dial")), 0, 0, 18, scene);
    var ink = c.mat("dial", "dark");
    for (var k = 0; k <= 20; k++) {
      var a = (225 - 13.5 * k) * D2R, major = k % 2 === 0;
      var tk = P.box(major ? 14 : 8, major ? 3 : 1.5, 1, ink); tk.rotation.z = a;
      P.at(tk, (major ? 134 : 137) * Math.cos(a), (major ? 134 : 137) * Math.sin(a), 19, scene);
      if (major) P.at(P.label(String(k / 2), 24, c.ink), 114 * Math.cos(a), 114 * Math.sin(a), 21, scene);
    }
  },

  step: function (c, dt, S) {
    var o = this.o, p;
    if (S.playing) {                                       // sweep the pressure up and down
      if (!o.was) o.t = Math.acos(1 - 2 * S.controls.pressure / 10) / .7;
      o.t += dt; p = .5 - .5 * Math.cos(o.t * .7);
      S.setControl("pressure", Math.round(p * 100) / 10);
    } else p = S.controls.pressure / 10;
    o.was = S.playing;

    var lift = p * o.H;
    var phi = Math.asin((lift - o.H / 2) / o.ARM);         // sector angle, -22.5 to +22.5 degrees
    o.sector.rotation.z = phi;
    o.pinion.rotation.z = o.psi0 - o.ratio * phi;
    o.rod.position.y = o.YD + lift;
    o.fluid.opacity = .12 + .5 * p;

    var pos = o.disc.geometry.attributes.position, R = o.RD;
    for (var i = 0; i < pos.count; i++) {
      var r = Math.sqrt(pos.getX(i) * pos.getX(i) + pos.getZ(i) * pos.getZ(i)), u = r / R, w = Math.sin(Math.PI * u);
      pos.setY(i, 2.4 * w * w * Math.sin(u * Math.PI * 9) + lift * (1 - u * u) * (1 - u * u));
    }
    pos.needsUpdate = true; o.disc.geometry.computeVertexNormals();

    var turn = (phi + o.SW) * 180 / Math.PI;
    S.set("p", (p * 10).toFixed(1) + " / 10");
    S.set("s", Math.round(turn) + "°");
    S.set("o", Math.round(turn * o.ratio) + "°");
  }
});
