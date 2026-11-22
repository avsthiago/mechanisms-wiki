M507.define({
  number: 485,
  title: "Common wind-mill",
  lede: "The wind blows straight at the mill, yet the sails go round. They can do that because each sail is set at a slant.",
  alt: "Tower windmill with four lattice sails on a horizontal shaft. Streaks show the wind blowing onto the face of the sails.",
  _hint: "Drag to look around. Pinch or scroll to zoom. The streaks show the wind.",
  parts: [
    { key: "sails", color: "#C8873A", name: "Sails", note: "Four wooden frames covered with cloth. Each one is twisted a little, like a fan blade." },
    { key: "shaft", color: "#4FA58A", name: "Windshaft", note: "Turns with the sails. Inside the mill it would drive the machinery." },
    { key: "tower", color: "#5E7387", name: "Tower and cap", note: "Hold the sails up, facing into the wind." }
  ],
  controls: [{ type: "range", id: "angle", label: "Sail angle", min: 0, max: 90, step: 1, value: 20, unit: "\u00B0", presets: [[0, "Flat to the wind"], [20, "Typical"], [45, "Steepest push"], [90, "Edge-on"]] }],
  speed: { min: 1, max: 30, value: 12, label: "Wind", unit: " of 30" },
  readouts: [{ id: "w", label: "Wind" }, { id: "a", label: "Sail angle" }, { id: "r", label: "Sails" }],
  views: { "3d": [-640, 140, 1130], front: [0, -40, 1080], side: [1080, -40, 80] },
    target: [0, 30, 30],
  how: [
    "The wind blows straight at the front of the mill. If the sails were flat boards facing the wind, it would only push the mill backwards. Nothing would turn.",
    "So each sail is twisted a little. Now the wind hits it at a slant and slides off to one side. As the wind slides one way, it pushes the sail the other way. All four sails are twisted the same way, so they all get pushed round in the same direction.",
    "Try the slider. At 0 degrees the sails are flat to the wind and nothing turns. At 90 degrees they are edge-on and the wind slips past. In between, they spin."
  ],
  note: "This model is rebuilt from Brown's drawing. The speed uses a simple rule that is fastest at 45 degrees. Real sails are set at a smaller angle, because a sail that is already moving meets the wind differently.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k;
    var o = this.o = { rot: .3, om: 0, pitch: [], streaks: [], HY: 70, HZ: 100 };
    function lathe(pts, m) { return P.mesh(new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), 48), m); }
    // tower, cap, tail
    var mt = c.mat("tower"), dark = c.mat("tower", "dark");
    scene.add(lathe([[0, -200], [70, -200], [46, 40], [48, 40], [48, 66], [44, 86], [34, 102], [18, 112], [0, 116]], mt));
    P.at(P.sphere(5, mt), 0, 118, 0, scene);
    P.at(P.box(22, 44, 6, dark), 0, -177.5, 66, scene);
    P.at(P.box(10, 22, 5, dark), -22, -70, 56, scene); P.at(P.box(10, 22, 5, dark), 22, -70, 56, scene);
    P.at(P.box(5, 5, 70, mt), 0, 84, -75, scene);
    var loop = P.hoop(34, 2.5, mt); loop.rotation.y = Math.PI / 2; loop.scale.set(1.9, 1, 1); P.at(loop, 0, 96, -170, scene);
    P.at(P.cylY(270, 6, c.fixed), 0, -203, 0, scene);
    // windshaft and hub
    o.rotor = new T.Group(); o.rotor.position.set(0, o.HY, 0); scene.add(o.rotor);
    P.at(P.cylZ(7, 80, c.mat("shaft")), 0, 0, o.HZ - 34, o.rotor);
    P.at(P.cylZ(16, 14, c.mat("shaft")), 0, 0, o.HZ, o.rotor);
    // four sails: stock along local Y, frame on one side of it, pitched about the stock
    var wood = c.mat("sails"), cloth = c.mat("sails", "light");
    var sh = new T.Shape(); sh.moveTo(0, 62); sh.lineTo(40, 62); sh.lineTo(62, 190); sh.lineTo(0, 190); sh.closePath();
    var panel = new T.ExtrudeGeometry(sh, { depth: 1.5, bevelEnabled: false }); panel.translate(0, 0, -.75);
    for (i = 0; i < 4; i++) {
      var arm = new T.Group(); arm.rotation.z = i * Math.PI / 2; arm.position.z = o.HZ; o.rotor.add(arm);
      var s = new T.Group(); arm.add(s); o.pitch.push(s);
      P.at(P.box(6, 191, 6, wood), 0, 95.5, 0, s);
      s.add(P.mesh(panel, cloth));
      for (k = 0; k < 7; k++) { var y = 62 + k * 128 / 6, w = 40 + 22 * k / 6; P.at(P.box(w + .6, 2.5, 3.5, wood), w / 2 - .3, y, 0, s); }
      [.5, 1].forEach(function (f) { var b = P.box(2.5, 130, 3.5, wood); b.rotation.z = -Math.atan2(22 * f, 128); P.at(b, 40 * f + 11 * f, 126, 0, s); });
    }
    // wind streaks
    var ws = new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .45, depthWrite: false });
    for (i = 0; i < 40; i++) {
      var m = P.box(1.6, 1.6, 46, ws), a = i * 2.399, r = 40 + (i * 37 % 230);
      m.position.set(r * Math.cos(a), o.HY + r * Math.sin(a) * .9, (i * 97) % 760 - 330);
      if (m.position.y < -190) m.position.y = -150 + (i % 5) * 20;
      scene.add(m); o.streaks.push(m);
    }
  },

  step: function (c, dt, S) {
    var o = this.o, th = S.controls.angle * Math.PI / 180, wind = S.playing ? S.rpm : 0;
    var target = wind * Math.sin(2 * th) * 2 * Math.PI / 60;       // rad/s: push (cos) times sideways share (sin)
    o.om += (target - o.om) * Math.min(1, dt * 1.5);
    o.rot += o.om * dt; o.rotor.rotation.z = o.rot;
    o.pitch.forEach(function (s) { s.rotation.y = th; });
    o.streaks.forEach(function (m) { m.position.z -= wind * 14 * dt; if (m.position.z < -330) m.position.z += 760; });
    S.set("w", wind + " / 30");
    S.set("a", S.controls.angle + "°");
    S.set("r", (Math.abs(o.om) * 60 / (2 * Math.PI)).toFixed(1) + " rpm");
  }
});
