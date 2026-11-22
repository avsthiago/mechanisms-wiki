M507.define({
  number: 433,
  title: "Horizontal overshot water-wheel",
  lede: "The wheel lies flat on an upright shaft. A jet of water from a sloping pipe hits its slanted blades and pushes them round. The shaft can turn a millstone directly, with no gears.",
  alt: "Flat water wheel with slanted blades on an upright shaft hanging from a beam. A jet of water from a sloping pipe at the upper right strikes the blades.",
  parts: [
    { key: "vane", color: "#C8873A", name: "Blades", note: "Slanted boards round the wheel. The jet strikes them and pushes them sideways." },
    { key: "shaft", color: "#5E7387", name: "Shaft and hub", note: "The upright shaft is held at the top by a beam. A flat plate at the bottom holds the blades." },
    { key: "mark", color: "#C2503F", name: "Red mark", note: "Watch it to follow one blade round." }
  ],
  controls: [{ id: "flow", label: "Water flow", value: "high", options: [["low", "Low"], ["high", "High"]] }],
  speed: false,
  readouts: [{ id: "rpm", label: "Wheel" }, { id: "turns", label: "Turns" }],
  views: { "3d": [70, 215, 540], front: [0, 60, 560], side: [560, 60, 20] },
  target: [30, 55, 0],
  distance: [200, 1600],
  how: [
    "Water runs down a sloping pipe and shoots out as a jet. The jet hits the blades at the front of the wheel. Each blade is slanted, so the water pushes it sideways, along the circle.",
    "As one blade moves away, the next one meets the jet. Used water drops off the ends of the blades to the floor. The wheel spins flat, and the shaft above it spins with it.",
    "Try Low flow, then High flow. Watch the jet and the wheel speed."
  ],
  note: "This model is rebuilt from Brown's drawing. The beam, its two posts, the floor, the support under the pipe and the water are made up. The number and slant of the blades are chosen to look right. The water is drawn as drops, and the wheel speeds are chosen to look right, not worked out from real flow.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { a: 0, om: -1, acc: 0, acs: 0 };
    var N = new T.Vector3(115, 85, 50), H = new T.Vector3(62, 0, 50), TT = .4, G = 400;
    o.N = N; o.v = new T.Vector3((H.x - N.x) / TT, (H.y - N.y) / TT + .5 * G * TT, 0); o.G = G;
    // supports: floor y -52..-46; posts x +-185, y -46..150 on the floor; beam y 150..162, x +-192 sits on the posts
    P.at(P.box(380, 6, 300, c.fixed), 0, -49, 0, scene);
    P.at(P.cylY(6, 196, c.fixed), -185, 52, 0, scene);
    P.at(P.cylY(6, 196, c.fixed), 185, 52, 0, scene);
    P.at(P.box(384, 12, 40, c.fixed), 0, 156, 0, scene);
    // pipe: a square trough 16 by 16, 80 long, ending at N and sloping at 45 degrees; one post under its back end
    var pipe = P.box(16, 16, 80, c.fixed), d = new T.Vector3(-.7071, -.7071, 0);
    pipe.position.set(N.x - d.x * 40, N.y - d.y * 40, N.z); pipe.lookAt(N.x, N.y, N.z); scene.add(pipe);
    var px = 160, py = N.y + (N.x - px) * 1 + 40 * .7071 * 0 + 0;
    P.at(P.cylY(4, 118.7 + 46, c.fixed), px, (118.7 - 46) / 2, 50, scene);   // y -46..118.7 touches the pipe underside
    // shaft and hub
    var sm = c.mat("shaft");
    P.at(P.cylY(10, 133, sm), 0, 63.5, 0, scene);                      // y -3..130
    P.at(P.mesh(new T.CylinderGeometry(3, 10, 20, 32), sm), 0, 140, 0, scene);   // y 130..150, tip on the beam
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylY(34, 6, sm), 0, 0, 0, o.wheel);                         // y -3..3
    var N16 = 16;
    for (i = 0; i < N16; i++) {
      var g = new T.Group(); g.rotation.y = i * 2 * Math.PI / N16; o.wheel.add(g);
      var v = P.box(66, 22, 2.5, c.mat("vane")); v.position.x = 67; v.rotation.x = 35 * Math.PI / 180; g.add(v);   // r 34..100
      if (i === 0) P.at(P.box(10, 8, 1.2, c.mat("mark")), 8, 0, 1.85, v);
    }
    o.pool = P.dropPool({ count: 200, radius: 2, color: c.spot, opacity: .85, parent: scene });
  },

  step: function (c, dt, S) {
    var o = this.o, high = S.controls.flow === "high", sim = S.playing ? dt : 0;
    var target = (high ? 10 : 5) * Math.PI / 30;
    if (o.om < 0) o.om = target;
    o.om += (target - o.om) * Math.min(1, sim * 1.2);
    o.a += o.om * sim; o.wheel.rotation.y = -o.a;
    var N = o.N, v = o.v, k;
    o.acc += sim * (high ? 110 : 55);
    while (o.acc >= 1) { o.acc -= 1; o.pool.emit(N.x + Math.random() * 3, N.y + Math.random() * 3, N.z + (Math.random() - .5) * 10, v.x * (1 + Math.random() * .03), v.y, v.z + (Math.random() - .5) * 8); }
    // water thrown off the blade ends, past the jet in the direction of turning
    o.acs += sim * (high ? 80 : 40);
    var phi0 = Math.atan2(50, 62);
    while (o.acs >= 1) {
      o.acs -= 1;
      var ph = phi0 + (40 + Math.random() * 120) * Math.PI / 180, sp = o.om * 96;
      o.pool.emit(96 * Math.cos(ph), -1 - Math.random() * 6, 96 * Math.sin(ph), -Math.sin(ph) * sp + Math.cos(ph) * 8, 0, Math.cos(ph) * sp + Math.sin(ph) * 8);
    }
    o.pool.step(sim, o.G, function (p) { return p.y < -45; });
    S.set("rpm", (o.om * 30 / Math.PI).toFixed(1) + " rpm");
    S.set("turns", (o.a / (2 * Math.PI)).toFixed(1));
  }
});
