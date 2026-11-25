M507.define({
  number: 250,
  title: "Anti-friction wheels",
  lede: "A shaft rests on the rims of wheels instead of sliding in a plain bearing. The wheels turn with it, so almost nothing rubs. It makes heavy shafts turn easily.",
  alt: "A frame with two rounded lobes, each carrying a large spoked wheel. A shaft lies in the dip between the wheels, with a big disc on its end. A red spoke marks one wheel.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Shaft and disc", note: "The shaft lies in the dip between the wheels. A large disc is fixed to its end. The red stripe on the disc follows its turning." },
    { key: "wheels", color: "#C8873A", name: "Wheels", note: "Four wheels, two on each side. They turn the opposite way to the shaft, and much more slowly. Watch the red spoke." },
    { key: "axles", color: "#4FA58A", name: "Axles", note: "Each pair of wheels turns on a fixed rod held by the frame." }
  ],
  controls: [],
  readouts: [{ id: "s", label: "Shaft" }, { id: "w", label: "Wheels" }, { id: "n", label: "Shaft turns" }],
  views: { "3d": [272, 83, 572], front: [0, -20, 640], side: [640, -20, 0] },
  target: [0, -65, -10],
  how: [
    "The shaft does not rub on a bearing. It lies in the dip between two wheels and turns on their rims. As the shaft turns one way, the wheels turn the other way, the way two gears do.",
    "The shaft is thin and the wheels are large. A point on the rim of the shaft travels exactly as far as a point on the rim of a wheel. So the wheels turn much more slowly than the shaft. The readouts show this.",
    "Because the wheels roll under the shaft, the shaft does not slide over anything. Rolling wears things far less than sliding. Watch the red stripe on the disc and the red spoke on a wheel, and count how many turns of one match one turn of the other."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows one bearing with a wheel pair on each side of the shaft and a large disc behind. The frame is drawn as two plain plates without the openings, and the wheels are placed side by side along the shaft so they can overlap as in the drawing without touching. The sizes, the disc and the red marks were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { a: 0 };
    var R = 78, AX = 60, AY = -72, RJ = Math.sqrt(AX * AX + AY * AY) - R;     // wheel radius, axle offset from the shaft, shaft radius (wheels just touch it)
    o.R = R; o.RJ = RJ;
    // shaft along z from -62 to 40, centred on the origin; the disc (z -74..-62) is fixed to its back end
    o.shaft = new T.Group(); c.scene.add(o.shaft);
    P.at(P.cylZ(RJ, 102, c.mat("shaft")), 0, 0, -11, o.shaft);                // z -62..40
    P.at(P.cylZ(57, 12, c.mat("shaft")), 0, 0, -68, o.shaft);                 // disc z -74..-62
    P.at(P.hoop(44, .9, c.mat("shaft", "dark")), 0, 0, -61.2, o.shaft);       // thin rings on the disc face, lifted 0.8
    P.at(P.hoop(52, .9, c.mat("shaft", "dark")), 0, 0, -61.2, o.shaft);
    P.at(P.box(34, 5, 1.2, c.mat("shaft", "mark")), 30, 0, -60.9, o.shaft);   // red stripe from the shaft to the rim, z -61.5..-60.3, lifted off the disc face (-62)
    // wheels: left axle carries the outer pair, right axle the inner pair, so the rims can cross
    o.wheels = [];
    [[-1, -24], [-1, 24], [1, -8], [1, 8]].forEach(function (w, i) {
      var g = new T.Group(), wh = P.pulley({ radius: R, width: 10, rim: 5, spokes: 4, hub: 9, material: c.mat("wheels") });
      g.add(wh); g.position.set(w[0] * AX, AY, w[1]); c.scene.add(g);
      if (i === 1 || i === 2) wh.spokes[0].material = c.mat("wheels", "mark");
      o.wheels.push(g);
    });
    // axles, z -42..42, ending at the inside faces of the two plates
    [-1, 1].forEach(function (s) {
      P.at(P.cylZ(5, 84, c.mat("axles")), s * AX, AY, 0, c.scene);
      [-1, 1].forEach(function (f) { P.at(P.cylZ(8, 1.6, c.mat("axles")), s * AX, AY, f * 50.8, c.scene); });   // axle heads on the outer faces z +-50..+-51.6
    });
    // frame: two plates with a rounded lobe over each axle and a dip between, standing on a base
    var sh = new T.Shape(), L = 27;
    sh.moveTo(-87, -210); sh.lineTo(-87, AY); sh.absarc(-AX, AY, L, Math.PI, 0, true); sh.quadraticCurveTo(-20, AY - 12, 0, -92);
    sh.quadraticCurveTo(20, AY - 12, AX - L, AY); sh.absarc(AX, AY, L, Math.PI, 0, true); sh.lineTo(87, AY); sh.lineTo(87, -210); sh.lineTo(-87, -210);
    [42, -50].forEach(function (z) {
      var m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false, curveSegments: 16 }), c.fixed); m.position.z = z; c.scene.add(m);   // plates z 42..50 and -50..-42
    });
    P.at(P.box(174, 8, 100, c.fixed), 0, -214, 0, c.scene);                   // base x +-87, y -218..-210, z -50..50
  },

  step: function (c, dt, S) {
    var o = this.o, k = o.RJ / o.R, rpm = S.playing ? S.rpm : 0;
    o.a += S.w * dt;
    o.shaft.rotation.z = o.a;
    o.wheels.forEach(function (g, i) { g.rotation.z = -o.a * k + (i < 2 ? 0 : 0); });
    S.set("s", rpm + " rpm");
    S.set("w", (-rpm * k).toFixed(1).replace("-", "−") + " rpm");
    S.set("n", (o.a / (2 * Math.PI)).toFixed(1));
  }
});
