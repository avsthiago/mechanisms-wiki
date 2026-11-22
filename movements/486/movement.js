M507.define({
  number: 486,
  title: "Vertical windmill",
  lede: "A windmill that turns flat, like a roundabout, on an upright shaft. Its sails swing on pins, so they catch the wind on one side and slip back through it edge first on the other.",
  alt: "Seen from above: six arms on an upright square shaft. At the end of each arm a flat sail hangs on a pin. Streaks show the wind blowing up the picture.",
  _hint: "Drag to look around. Pinch or scroll to zoom. The streaks show the wind.",
  parts: [
    { key: "sails", color: "#C8873A", name: "Sails", note: "Flat boards that swing on upright pins. Each one turns its face or its edge to the wind." },
    { key: "arms", color: "#5E7387", name: "Arms", note: "Six arms, top and bottom, that hold the sail pins. Watch the arm with the red stripe." },
    { key: "shaft", color: "#4FA58A", name: "Shaft", note: "A square upright shaft fixed to the arms. Below, it would drive the mill machinery." }
  ],
  controls: [{ id: "mode", label: "Sails", value: "pivot", options: [["pivot", "Pivoted"], ["fixed", "Fixed"]] }],
  speed: { min: 1, max: 30, value: 12, label: "Wind", unit: " of 30" },
  readouts: [{ id: "r", label: "Mill" }, { id: "s", label: "Red arm's sail" }],
  views: { "3d": [0, 1000, 280], top: [0, 1060, 1], side: [0, -40, 1060] },
  target: [0, -70, 0],
  distance: [380, 2400],
  how: [
    "The wind blows up the picture. On the right, the sails are moving the same way as the wind. They stand square across it, so it pushes them along like a hand pushing a door.",
    "On the left, the sails are coming back against the wind. Here each sail is turned edge first, so it slips through the air with hardly any push against it. The push on the right is much bigger than the push on the left, so the mill keeps turning.",
    "Try fixed sails. Now they cannot swing. The sails on the left get pushed back just as hard as the ones on the right are pushed forward, and the mill stops."
  ],
  note: "This model is rebuilt from Brown's drawing. The lower arms, the base and the sizes were made up. Here a rule sets each sail's angle exactly. A real mill would use stops on the arms and let the wind swing the sails.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 160, i;
    var o = this.o = { R: R, rot: 0, om: 0, sails: [], streaks: [] };
    o.rotor = new T.Group(); scene.add(o.rotor);
    var ma = c.mat("arms"), ms = c.mat("sails");
    P.at(P.box(22, 270, 22, c.mat("shaft")), 0, -95, 0, o.rotor);                 // square shaft y -230..40
    P.at(P.cylY(40, 24, ma), 0, 0, 0, o.rotor);                                    // top hub y -12..12
    P.at(P.cylY(30, 24, ma), 0, -140, 0, o.rotor);                                 // bottom hub y -152..-128
    P.at(P.hoop(R, 2, ma), 0, 0, 0, o.rotor).rotation.x = Math.PI / 2;           // ring joining the top arms
    for (i = 0; i < 6; i++) {
      var arm = new T.Group(); arm.rotation.y = i * Math.PI / 3; o.rotor.add(arm);
      P.at(P.box(165, 10, 12, ma), 102.5, 0, 0, arm);                              // top arm x 20..185, y -5..5
      P.at(P.box(150, 10, 12, ma), 95, -140, 0, arm);                              // bottom arm x 20..170, y -145..-135
      P.at(P.cylY(7, 5, c.mat("arms", "dark")), R, 7.5, 0, arm);                    // pivot cap y 5..10
      if (i === 0) P.at(P.box(110, 1, 4, c.mat("arms", "mark")), 95, 5.8, 0, arm); // stripe y 5.3..6.3, lifted off the arm
      var sail = new T.Group(); sail.position.x = R; arm.add(sail);
      P.at(P.cylY(3, 130, ma), 0, -70, 0, sail);                                    // pin y -135..-5, from arm to arm
      P.at(P.box(150, 120, 6, ms), 0, -70, 0, sail);                                // board y -130..-10, 5 clear of each arm
      o.sails.push(sail);
    }
    // bearing under the shaft: y -250..-230 (top = shaft bottom)
    P.at(P.box(90, 20, 90, c.fixed), 0, -240, 0, scene);
    var ws = new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .45, depthWrite: false });
    for (i = 0; i < 46; i++) {
      var m = P.box(1.6, 1.6, 46, ws);
      m.position.set(-280 + 560 * Math.random(), -150 + 170 * Math.random(), -340 + 680 * Math.random());
      scene.add(m); o.streaks.push(m);
    }
  },

  // world yaw of a sail at arm angle a: 0 is square across the wind, pi/2 is edge on to it
  yaw: function (a, fixed) {
    if (fixed) return a;
    var s = .42, t = Math.min(1, Math.max(0, (s - Math.cos(a)) / (2 * s)));
    return Math.PI / 2 * t * t * (3 - 2 * t);
  },

  step: function (c, dt, S) {
    var o = this.o, fixed = S.controls.mode === "fixed", w = S.playing ? S.rpm * 14 : 0, tau = 0, i;
    for (i = 0; i < 6; i++) {
      var a = o.rot + i * Math.PI / 3, b = this.yaw(a, fixed), px = o.R * Math.cos(a), pz = -o.R * Math.sin(a);
      var nx = Math.sin(b), nz = Math.cos(b), rel = -o.om * pz * nx + (-w + o.om * px) * nz;   // (wind - sail velocity) across the board
      var f = 2e-6 * rel * Math.abs(rel);
      tau += pz * f * nx - px * f * nz;
      o.sails[i].rotation.y = b - a;
    }
    o.om += (tau - .5 * o.om) / 10 * Math.min(dt, .05);                                // inertia 10, bearing drag
    o.rot += o.om * dt; o.rotor.rotation.y = o.rot;
    o.streaks.forEach(function (m) { m.position.z -= w * dt; if (m.position.z < -340) m.position.z += 680; });
    var k = Math.abs(Math.sin(this.yaw(o.rot, fixed)));
    S.set("r", (o.om * 30 / Math.PI).toFixed(1) + " rpm");
    S.set("s", fixed ? "Fixed" : k < .05 ? "Face on" : k > .95 ? "Edge on" : "Swinging");
  }
});
