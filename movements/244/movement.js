M507.define({
  number: 244,
  title: "Friction dynamometer",
  lede: "A dynamometer measures how much power a machine gives out. A wheel on the machine's shaft turns inside a clamp. The clamp is on a long lever, and weights hang from the lever's end. The weights that hold the lever level tell you how hard the wheel is pulling.",
  alt: "A wheel on a shaft turns inside a casing that hangs from a long horizontal lever. Three bolts stand on top of the lever. Two small blocks sit above and below the lever near its right end. From the lever's right end a pan hangs on ropes and holds some weights.",
  parts: [
    { key: "pulley", color: "#5E7387", name: "Pulley", note: "Fixed on the shaft of the machine being tested. It turns all the time. Watch the red stripe." },
    { key: "blocks", color: "#4FA58A", name: "Gripping blocks", note: "A casing round the pulley. The bolts squeeze it, so it rubs on the pulley and tries to turn with it." },
    { key: "lever", color: "#D9B13B", name: "Lever", note: "A long bar fixed to the casing. It is dragged round with the pulley, and the weights pull it back." },
    { key: "scale", color: "#8E7AA8", name: "Pan and weights", note: "Hangs from the end of the lever. Add weights until the lever floats level between the two stops." }
  ],
  controls: [{ type: "range", id: "w", label: "Weights in the pan", min: 0, max: 8, step: 1, value: 5, unit: " kg", presets: [[3, "Too light"], [5, "Balanced"], [7, "Too heavy"]] }],
  speed: { min: 1, max: 30, value: 12, label: "Pulley speed", unit: "rpm" },
  readouts: [{ id: "l", label: "Lever" }, { id: "p", label: "Power" }],
  views: { "3d": [330, 120, 760], front: [120, -30, 800], side: [800, -20, 0] },
  target: [120, -30, 0],
  how: [
    "The pulley turns inside the casing and rubs on it. The rubbing drags the casing, and the lever with it, in the direction the pulley turns. The weights in the pan pull the lever the other way.",
    "If the weights are too light, the rubbing wins and the lever rises until it hits the upper stop. If they are too heavy, the lever drops to the lower stop. When they match, the lever floats level between the stops. Then the weights tell you the pull of the rubbing. Multiply it by how fast the pulley turns and you have the power.",
    "Try Too light, then Balanced, then Too heavy, and watch the lever. Then change the pulley speed with the lever level and see the power change."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the pulley, the casing, the lever, the two stops and the pan. The wall they hang on, the bolts, the number of weights and the length of the lever were made up. The bolts are set so that a fixed number of weights balances the rubbing. The lever tilts only a little, as the stops allow. The power is worked out as weight times lever length times turning speed.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, KX = 289, KY = 32;
    var o = this.o = { a: 0, phi: null, Wf: 5, pmax: .06, KX: KX, KY: KY, wts: [] };
    // pulley: z -10..10; shaft z -34 (wall face) .. 20
    o.pulley = new T.Group(); scene.add(o.pulley);
    P.at(P.cylZ(30, 20, c.mat("pulley")), 0, 0, 0, o.pulley);                       // radius 30, z -10..10
    P.at(P.cylZ(12, 54, c.mat("pulley", "dark")), 0, 0, -7, o.pulley);              // shaft z -34..20
    P.at(P.box(22, 5, 1, c.mat("pulley", "mark")), 19, 0, 11, o.pulley);            // red stripe x 8..30, z 10.5..11.5, lifted off the face
    // lever group turns about the shaft axis
    o.lever = new T.Group(); scene.add(o.lever);
    var sh = new T.Shape();                                                         // casing: flat top at y 40, sides to y 0, round bottom radius 50, hole radius 30.6
    sh.moveTo(-50, 40); sh.lineTo(50, 40); sh.lineTo(50, 0); sh.absarc(0, 0, 50, 0, -Math.PI, true); sh.lineTo(-50, 40);
    var hole = new T.Path(); hole.absarc(0, 0, 30.6, 0, 2 * Math.PI, true); sh.holes.push(hole);
    var cg = new T.ExtrudeGeometry(sh, { depth: 24, bevelEnabled: false, curveSegments: 40 }); cg.translate(0, 0, -12);
    o.lever.add(new T.Mesh(cg, c.mat("blocks")));                                   // z -12..12
    for (i = 0; i < 9; i++) {                                                       // small bolts round the casing
      var q = Math.PI + .18 + i * (Math.PI - .36) / 8;
      P.at(P.cylZ(3, 2, c.mat("blocks", "dark")), 41 * Math.cos(q), 41 * Math.sin(q), 13, o.lever);   // z 12..14
    }
    P.at(P.box(384, 18, 24, c.mat("lever")), 127, 49, 0, o.lever);                  // lever x -65..319, y 40..58, z -12..12; sits on the casing top (y 40)
    [-43, 39, KX].forEach(function (x) {                                            // bolts with nuts on top of the lever
      P.at(P.cylY(3.5, 14, c.mat("lever", "dark")), x, 65, 0, o.lever);             // shank y 58..72
      P.at(P.cylY(7, 6, c.mat("lever", "dark")), x, 61, 0, o.lever);                // nut y 58..64
    });
    P.at(P.hook({ material: c.mat("scale"), radius: 6, tube: 2 }), KX, KY, 0, o.lever);   // ring y 24..40, hangs from the lever's underside at y 40
    // pan on four ropes
    o.pan = new T.Group(); scene.add(o.pan);
    P.at(P.box(130, 5, 50, c.mat("scale")), 0, 0, 0, o.pan);                         // pan x ±65, y ±2.5, z ±25
    for (i = 0; i < 8; i++) {
      var w = P.cylY(9, 14, c.mat("scale", "light"));
      P.at(w, ((i % 4) - 1.5) * 26, 9.5, i < 4 ? -11 : 11, o.pan);                   // weights sit on the pan top (y 2.5)
      o.wts.push(w);
    }
    o.ropes = [[-62, -22], [62, -22], [-62, 22], [62, 22]].map(function (p) { var r = P.rod(1.2, c.mat("scale")); r.userData.cx = p[0]; r.userData.cz = p[1]; scene.add(r); return r; });
    // wall behind, and the two stops on brackets
    P.at(P.box(480, 380, 6, c.fixed), 120, -50, -37, scene);                        // wall x -120..360, y -240..140, z -40..-34; shaft ends at z -34
    [[80.5], [17.5]].forEach(function (s) {
      P.at(P.box(30, 16, 24, c.fixed), 221, s[0], 0, scene);                         // stop x 206..236, z -12..12 (upper y 72.5..88.5, lower y 9.5..25.5)
      P.at(P.box(18, 16, 22, c.fixed), 221, s[0], -23, scene);                       // bracket z -34..-12, on the wall face and the stop's back
    });
  },

  step: function (c, dt, S) {
    var o = this.o, W = +S.controls.w, i, diff = o.Wf - W;
    var target = Math.max(-1, Math.min(1, diff)) * o.pmax;
    if (o.phi === null) o.phi = target; else o.phi += (target - o.phi) * (1 - Math.exp(-6 * Math.min(dt, .05)));
    o.a += S.w * dt;
    o.pulley.rotation.z = o.a;
    o.lever.rotation.z = o.phi;
    var cs = Math.cos(o.phi), sn = Math.sin(o.phi);
    var hx = o.KX * cs - o.KY * sn, hy = o.KX * sn + o.KY * cs;                     // ring centre after the lever turns
    var py = hy - 150;
    o.pan.position.set(hx, py, 0);
    o.ropes.forEach(function (r) { r.span(hx, hy - 8, 0, hx + r.userData.cx, py + 2.5, r.userData.cz); });
    for (i = 0; i < 8; i++) o.wts[i].visible = i < W;
    var level = diff === 0;
    S.set("l", level ? "Level" : diff > 0 ? "Up" : "Down");
    S.set("p", level ? Math.round(W * 9.81 * .5 * S.w) + " W" : "-");
  }
});
