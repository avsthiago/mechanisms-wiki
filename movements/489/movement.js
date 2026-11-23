M507.define({
  number: 489,
  title: "Vertical bucket paddle-wheel",
  lede: "A paddle-wheel whose paddles always hang straight down. They slip into the water edge first and come out the same way, without slapping it.",
  alt: "Paddle-wheel with eight arms. Each bucket hangs vertically, held by a crank linked to a ring on a fixed eccentric.",
  _hint: "Drag to look around. Pinch or scroll to zoom. In front view the vessel moves to the right.",
  parts: [
    { key: "a", color: "#C8873A", name: "Buckets", note: "The paddles. Each one can swivel where it joins the arms. One is marked in red so you can follow it." },
    { key: "b", color: "#5E7387", name: "Arms", note: "Fixed to the shaft. They carry the paddles round." },
    { key: "c", color: "#D9B13B", name: "Cranks", note: "A short lever fixed to each paddle. Turn the crank and the paddle turns with it." },
    { key: "d", color: "#8E7AA8", name: "Ring", note: "A loose ring with arms of its own. Each arm holds the end of one crank." },
    { key: "e", color: "#4FA58A", name: "Eccentric", note: "A round disc that does not turn. It sits a little to one side of the shaft, and the ring spins around it." }
  ],
  controls: [{ id: "buckets", label: "Bucket type", value: "upright", options: [["upright", "Upright buckets"], ["fixed", "Fixed buckets"]] }],
  readouts: [{ id: "ang", label: "Wheel angle" }, { id: "tilt", label: "Marked bucket tilt" }, { id: "rpm", label: "Speed" }],
  views: { "3d": [610, 300, 860], front: [20, -15, 1180], side: [1150, 90, 220] },
  viewLabels: { side: "End-on" },
  target: [20, -15, 10],
  distance: [380, 2000],
  how: [
    "The shaft turns the arms, and the arms carry the paddles round in a big circle. The ring goes round at the same speed. But the ring's centre is not on the shaft. The fixed disc holds it a little to one side.",
    "Each crank is exactly as long as that sideways gap. Because of that, the crank always points the same way as it goes round, like a seat on a Ferris wheel that always hangs level. The paddle is fixed to its crank, so it stays upright too.",
    "Switch to fixed buckets to see an ordinary wheel. Its paddles slap the water on the way in and lift water on the way out. Both waste effort."
  ],
  note: "This model is rebuilt from Brown's description. The number of arms, the sizes and the grey frame that holds the disc were made up.",

  // the linkage has no role in the fixed-bucket comparison, so fade it out
  opacity: function (key, S) { return (S.controls.buckets === "fixed" && "cde".indexOf(key) >= 0) ? .08 : 1; },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 190, ECC = 42, BH = 44, N = 8, WL = -112, i;
    var o = this.o = { R: R, N: N, theta: .35, tilt: 0, buckets: [], cranks: [] };
    o.wheel = new T.Group(); scene.add(o.wheel);
    P.at(P.cylZ(11, 236, c.mat("b")), 0, 0, -38, o.wheel);
    [-70, 70].forEach(function (z) {
      P.at(P.cylZ(24, 16, c.mat("b")), 0, 0, z, o.wheel);
      P.at(P.hoop(118, 3, c.mat("b")), 0, 0, z, o.wheel);
      for (var k = 0; k < N; k++) { var p = new T.Group(); p.rotation.z = k * 2 * Math.PI / N; p.position.z = z; o.wheel.add(p); P.at(P.box(R, 8, 8, c.mat("b")), R / 2, 0, 0, p); }
    });
    var marked = c.mat("a", "mark");
    for (i = 0; i < N; i++) {
      var g = new T.Group(); scene.add(g);
      P.at(P.box(8, 2 * BH, 128, i === 0 ? marked : c.mat("a")), 0, 0, 0, g);
      P.at(P.cylZ(4, 182, c.mat("c")), 0, 0, 15, g);
      o.buckets.push(g);
      var cr = new T.Group(); scene.add(cr);
      P.at(P.box(ECC + 8, 8, 7, c.mat("c")), ECC / 2, 0, 104, cr);
      P.at(P.cylZ(3.5, 24, c.mat("c")), ECC, 0, 112, cr);
      o.cranks.push(cr);
    }
    o.ring = new T.Group(); o.ring.position.set(ECC, 0, 120); scene.add(o.ring);
    o.ring.add(P.hoop(66, 6, c.mat("d")));
    for (i = 0; i < N; i++) { var q = new T.Group(); q.rotation.z = i * 2 * Math.PI / N; o.ring.add(q); P.at(P.box(R - 66, 5, 5, c.mat("d")), 66 + (R - 66) / 2, 0, 0, q); }
    P.at(P.cylZ(60, 10, c.mat("e")), ECC, 0, 120, scene);
    P.at(P.cylZ(12, 52, c.mat("e")), ECC, 0, 146, scene);
    // paddle frame, hull side and water: context only
    P.at(P.box(640, 12, 10, c.fixed), 20, 0, 176, scene);
    P.at(P.box(10, 12, 340, c.fixed), -295, 0, 11, scene);
    P.at(P.box(10, 12, 340, c.fixed), 335, 0, 11, scene);
    P.at(P.box(780, 430, 12, new T.MeshLambertMaterial({ color: 0x8696A2, transparent: true, opacity: .3, depthWrite: false })), 20, 40, -162, scene);
    var water = P.at(P.box(860, 170, 560, new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .3, depthWrite: false, side: T.DoubleSide })), 20, WL - 85, 0, scene);
    water.renderOrder = 5;
  },

  step: function (c, dt, S) {
    var o = this.o, target = S.controls.buckets === "fixed" ? 1 : 0;
    o.theta += S.w * dt;
    o.tilt += (target - o.tilt) * Math.min(1, dt * 7); if (Math.abs(target - o.tilt) < .001) o.tilt = target;
    var ang = -o.theta;                      // clockwise seen from the front, so the vessel moves right
    o.wheel.rotation.z = ang; o.ring.rotation.z = ang;
    for (var i = 0; i < o.N; i++) {
      var a = ang + i * 2 * Math.PI / o.N, px = o.R * Math.cos(a), py = o.R * Math.sin(a);
      var rad = ((a * 180 / Math.PI - 90) % 180 + 270) % 180 - 90;    // radial alignment folded to +-90 degrees
      o.buckets[i].position.set(px, py, 0); o.buckets[i].rotation.z = rad * o.tilt * Math.PI / 180;
      o.cranks[i].position.set(px, py, 0);
      if (i === 0) S.set("tilt", Math.round(Math.abs(rad * o.tilt)) + "°");
    }
    S.set("ang", Math.round(((o.theta * 180 / Math.PI) % 360 + 360) % 360) % 360 + "°");
    S.set("rpm", (S.playing ? S.rpm : 0) + " rpm");
  }
});
