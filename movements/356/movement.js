M507.define({
  number: 356,
  title: "Bohnenberger's machine",
  lede: "A heavy ball spins inside three rings, each free to turn inside the next. However the stand is turned or tipped, the axle of the spinning ball keeps pointing the same way. Ships and aircraft use the same idea to keep track of their direction.",
  alt: "A big upright ring on a short stand. Inside it a second ring turns on pivots at top and bottom. Inside that a third ring turns on pivots at its sides and carries a heavy ball on an axle.",
  parts: [
    { key: "outer", color: "#5E7387", name: "Outer ring and stand", note: "The part you hold. Here it stands on a tray that is slowly turned and tipped." },
    { key: "mid", color: "#C8873A", name: "Middle ring", note: "Turns on two pivots in the outer ring, one at the top and one at the bottom." },
    { key: "inner", color: "#D9B13B", name: "Inner ring", note: "Turns on two pivots in the middle ring. It holds the two ends of the ball's axle." },
    { key: "ball", color: "#4FA58A", name: "Ball", note: "A heavy ball that spins on its axle. Watch the red tip of the axle. While the ball spins, the tip keeps pointing the same way. The ball is drawn turning much slower than it really does." }
  ],
  speed: { min: 2, max: 20, value: 8, label: "Stand speed", unit: " rpm" },
  controls: [{ id: "spin", label: "Ball", value: "on", options: [["on", "Spinning"], ["off", "Stopped"]] }],
  readouts: [{ id: "s", label: "Stand turned" }, { id: "a", label: "Axle turned" }],
  views: { "3d": [150, 140, 740], front: [0, 0, 940], top: [0, 940, 1] },
  target: [0, -30, 0],
  how: [
    "Watch the red tip of the axle while the stand turns and tips under it. The stand and the outer ring go round. The tip does not follow. It keeps pointing at the same spot in the room.",
    "The three rings turn on pivots set crosswise to each other. Between them, they let the stand lean or turn any way without twisting the ball. And a fast spinning ball holds its direction unless something twists it. So the rings swing round the ball, and the ball stays as it was.",
    "Try Stopped. A ball that is not spinning has nothing to hold it steady. The small rub in the pivots is enough to carry it round with the stand. Then set it spinning again and see the tip hold still."
  ],
  note: "This model is rebuilt from Brown's drawing. The tray, the way it is turned and tipped, and all the sizes were made up. The pivots are taken as perfectly free while the ball spins, so the axle does not drift at all. A real one drifts slowly. With the ball stopped, the rings are simply carried round with the stand. The ball is drawn turning much slower than it really does.",

  build: function (c) {
    var T = c.THREE, P = c.P, mo = c.mat("outer"), mm = c.mat("mid"), mi = c.mat("inner"), mb = c.mat("ball");
    var o = this.o = { yawA: 0, spin: 0, al: 70 * Math.PI / 180, be: Math.PI / 2, mode: "on", drift: 0 };
    o.n = new T.Vector3(Math.sin(o.al), 0, Math.cos(o.al)); o.n0 = o.n.clone();    // where the axle points in the room
    // tray tips about a line on the ground (y -215); the stand turns on the tray
    o.tilt = new T.Group(); o.tilt.position.y = -215; c.scene.add(o.tilt);
    o.yaw = new T.Group(); o.yaw.position.y = 215; o.tilt.add(o.yaw);              // origin of o.yaw is the centre of the rings
    P.at(P.cylY(125, 6, c.fixed), 0, -212, 0, o.yaw);                              // tray y -215..-209
    P.at(P.cylY(50, 10, mo), 0, -204, 0, o.yaw);                                   // foot y -209..-199, stands on the tray
    var prof = [[0, -199], [30, -199], [15, -190], [12, -172], [17, -160], [17, -155], [0, -155]].map(function (q) { return new T.Vector2(q[0], q[1]); });
    o.yaw.add(new T.Mesh(new T.LatheGeometry(prof, 40), mo));                      // stem up into the outer ring
    o.yaw.add(P.hoop(150, 9, mo));                                                 // outer ring, facing the front
    // middle ring: pivots top and bottom (local Y)
    o.mid = new T.Group(); o.yaw.add(o.mid);
    o.mid.add(P.hoop(128, 4, mm));
    P.at(P.cylY(3, 20, mm), 0, 138, 0, o.mid); P.at(P.cylY(3, 20, mm), 0, -138, 0, o.mid);     // pivot pins y 128..148
    // inner ring: pivots at the sides of the middle ring (local X)
    o.inner = new T.Group(); o.mid.add(o.inner);
    o.inner.add(P.hoop(108, 4, mi));
    P.at(P.cylX(3, 18, mi), 117, 0, 0, o.inner); P.at(P.cylX(3, 18, mi), -117, 0, 0, o.inner); // pivot pins x 108..126
    // ball on its axle (local Y of the inner ring)
    o.ball = new T.Group(); o.inner.add(o.ball);
    o.ball.add(P.sphere(64, mb));
    o.ball.add(P.cylY(3.5, 210, mb));                                              // axle y -105..105, into the inner ring
    var h1 = P.hoop(64.6, 1.6, c.mat("ball", "dark")); o.ball.add(h1);             // two dark bands through the poles, to show the spin
    var h2 = P.hoop(64.6, 1.6, c.mat("ball", "dark")); h2.rotation.y = Math.PI / 2; o.ball.add(h2);
    var tip = new T.Mesh(new T.ConeGeometry(8, 22, 20), c.mat("ball", "mark")); P.at(tip, 0, 92, 0, o.ball);   // red tip y 81..103
    o.q = new T.Quaternion(); o.v = new T.Vector3();
  },

  step: function (c, dt, S) {
    var o = this.o, mode = S.controls.spin;
    o.yawA += S.w * dt;
    o.yaw.rotation.y = o.yawA;
    o.tilt.rotation.x = 15 * Math.PI / 180 * Math.sin(.37 * o.yawA);               // the tray rocks as it turns
    o.tilt.updateMatrixWorld(true);
    o.yaw.getWorldQuaternion(o.q);
    if (mode !== o.mode) { o.mode = mode; if (mode === "on") o.n0.copy(o.n); }
    if (mode === "on") {
      // the axle keeps its direction n in the room; find the two ring angles that allow it
      o.v.copy(o.n).applyQuaternion(o.q.conjugate());                              // n as seen from the outer ring
      o.be = Math.acos(Math.max(-1, Math.min(1, o.v.y)));
      o.al = Math.atan2(o.v.x, o.v.z);
      o.spin += 9 * dt * (S.playing ? 1 : 0);
    } else {
      // stopped: the rub in the pivots carries the rings along, so the axle turns with the stand
      o.n.set(Math.sin(o.be) * Math.sin(o.al), Math.cos(o.be), Math.sin(o.be) * Math.cos(o.al)).applyQuaternion(o.q);
    }
    o.mid.rotation.y = o.al;
    o.inner.rotation.x = o.be;
    o.ball.rotation.y = o.spin;
    var turned = ((o.yawA * 180 / Math.PI) % 360 + 360) % 360;
    S.set("s", Math.round(turned) % 360 + "°");
    S.set("a", Math.round(o.n.angleTo(o.n0) * 180 / Math.PI) + "°");
  }
});
