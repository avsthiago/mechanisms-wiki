M507.define({
  number: 355,
  title: "Gyroscope",
  lede: "A heavy disc spins inside a ring. One side of the ring rests on top of a post, and nothing holds up the other side. While the disc spins fast, the ring does not drop. It moves slowly round the post instead.",
  alt: "An upright post on a round foot. A level ring rests by a bent pin on the top of the post and reaches out to one side. Inside the ring a heavy disc stands on edge on a spindle that runs across the ring.",
  parts: [
    { key: "ring", color: "#5E7387", name: "Ring and pin", note: "Holds the two ends of the spindle. Its bent pin rests on the point of the post and can tip or turn any way." },
    { key: "disc", color: "#C8873A", name: "Disc", note: "A heavy wheel that spins on its spindle. Watch the red stripe to see whether it is turning. It is drawn turning much slower than it really does." },
    { key: "post", color: "#4FA58A", name: "Post", note: "Stands still. Only its point touches the pin, so it holds the ring up at one side and nowhere else." }
  ],
  speed: false,
  controls: [{ id: "spin", label: "Disc", value: "fast", options: [["fast", "Fast"], ["slow", "Slow"], ["stop", "Stopped"]] }],
  readouts: [{ id: "d", label: "Disc" }, { id: "p", label: "Round the post" }, { id: "t", label: "Droop" }],
  views: { "3d": [150, 120, 640], front: [0, -10, 540], top: [0, 560, 1] },
  target: [50, -60, 0],
  how: [
    "Look at the ring. It is held up at one side only, where its pin sits on the post. You would expect the other side to fall. While the disc spins fast it stays out level and creeps round the post.",
    "The weight still pulls the ring down. But a spinning disc does not tip the way it is pushed. It turns sideways to the push. So the pull of the weight sends the ring round the post and not down. A fast disc needs only a slow drift to hold itself up.",
    "Try Slow. The disc has less spin, so the ring nods, sags and has to go round the post faster. Then try Stopped. Now nothing holds it up, and it drops and hangs against the post."
  ],
  note: "This model is rebuilt from Brown's drawing. The post is drawn taller than Brown's so the ring has room to hang, and the block under the foot was added for the same reason. The sizes and the two speeds were made up. Each time you choose a speed, the ring is let go from level again. The motion is worked out from the weight and spin of the disc alone. The weight of the ring is left out. A little rubbing at the pin makes the nodding die away. The disc never slows down here, though a real one would. The disc is drawn turning 60 times slower than it really does.",

  // A heavy symmetric top on a fixed point. th is the angle of the spindle from straight up, ph the angle round the
  // post. Lengths in metres (one model unit is a millimetre), per kilogram of disc.
  //   I1 th'' = I1 ph'^2 sin cos - p ph' sin + g l sin - rub      (p = I3 x spin, kept constant)
  //   ph' = (pphi - p cos th) / (I1 sin^2 th)                     (pphi is constant; 0 when let go from level at rest)
  G: 9.81, L: .115, RD: .062, C: 2.5, STOP: 147.5 * Math.PI / 180,
  acc: function (th, thd, p) {
    var I1 = this.RD * this.RD / 4 + this.L * this.L, s = Math.sin(th), co = Math.cos(th), phd = -p * co / (I1 * s * s);
    return { a: phd * phd * s * co - p / I1 * phd * s + this.G * this.L / I1 * s - this.C * thd, phd: phd };
  },
  advance: function (st, h, p) {          // one Runge-Kutta step of length h seconds
    var k1 = this.acc(st.th, st.thd, p), k2 = this.acc(st.th + h / 2 * st.thd, st.thd + h / 2 * k1.a, p);
    var k3 = this.acc(st.th + h / 2 * (st.thd + h / 2 * k1.a), st.thd + h / 2 * k2.a, p), k4 = this.acc(st.th + h * (st.thd + h / 2 * k2.a), st.thd + h * k3.a, p);
    st.th += h * (st.thd + h / 6 * (k1.a + k2.a + k3.a));
    st.thd += h / 6 * (k1.a + 2 * k2.a + 2 * k3.a + k4.a);
    st.ph += h / 6 * (k1.phd + 2 * k2.phd + 2 * k3.phd + k4.phd);
    st.phd = k4.phd;
    if (st.th > this.STOP) { st.th = this.STOP; st.thd = Math.abs(st.thd) < .4 ? 0 : -.3 * st.thd; }   // the disc rim meets the post
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, mr = c.mat("ring"), md = c.mat("disc"), mp = c.mat("post");
    var o = this.o = { st: { th: Math.PI / 2, thd: 0, ph: 0, phd: 0 }, psi: 0, mode: null };
    // post: its point is the origin, where the pin rests
    var prof = [[0, 0], [2, -3], [7, -16], [7, -150], [16, -152], [40, -158], [45, -165], [0, -165]].map(function (q) { return new T.Vector2(q[0], q[1]); });
    scene.add(new T.Mesh(new T.LatheGeometry(prof, 48), mp));                      // foot bottom y -165
    P.at(P.cylY(52, 60, c.fixed), 0, -194.5, 0, scene);                           // block y -224.5..-164.5, the foot sinks 0.5 into it
    // the part that tips and turns: yaw about the post, then pitch about the point
    o.yaw = new T.Group(); scene.add(o.yaw);
    o.tip = new T.Group(); o.yaw.add(o.tip);                                       // local X runs along the spindle, away from the post
    var ring = P.hoop(70, 4.5, mr); ring.rotation.x = Math.PI / 2; P.at(ring, 115, 0, 0, o.tip);   // level ring, centre 115 from the point
    var pts = [[0, 1.5], [1.5, 9], [8, 13], [17, 11], [24, 4], [32, 0], [45.5, 0]].map(function (q) { return new T.Vector3(q[0], q[1], 0); });
    o.tip.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 2.6, 10, false), mr));   // bent pin from the ring to the point
    P.at(P.sphere(2.6, mr), 0, 1.5, 0, o.tip);
    P.at(P.cylX(5, 12, mr), 191, 0, 0, o.tip); P.at(P.sphere(7.5, mr), 201, 0, 0, o.tip);   // knob on the far side
    P.at(P.cylX(6, 5, mr), 48, 0, 0, o.tip); P.at(P.cylX(6, 5, mr), 182, 0, 0, o.tip);      // spindle bearings inside the ring
    // disc: stands on edge, spins about local X
    o.disc = new T.Group(); o.disc.position.x = 115; o.tip.add(o.disc);
    o.disc.add(P.cylX(56, 5, md));                                                  // thin middle x -2.5..2.5
    var rim = P.hoop(56, 7, md); rim.rotation.y = Math.PI / 2; o.disc.add(rim);     // heavy rim, out to 63
    o.disc.add(P.cylX(3, 130, md));                                                 // spindle x -65..65, between the bearings
    P.at(P.cylX(11, 20, md), 0, 0, 0, o.disc);
    [-1, 1].forEach(function (s) { P.at(P.box(1.6, 36, 7, c.mat("disc", "mark")), s * 2.6, 30, 0, o.disc); });   // stripes stand .9 off each face
  },

  step: function (c, dt, S) {
    var o = this.o, st = o.st, mode = S.controls.spin, rpm = mode === "fast" ? 6000 : mode === "slow" ? 1500 : 0;
    if (mode !== o.mode) { o.mode = mode; st.th = Math.PI / 2; st.thd = 0; st.phd = 0; }      // let go from level, at rest
    var w = rpm * Math.PI / 30, p = this.RD * this.RD / 2 * w;
    if (!S.playing) dt = 0;
    var n = Math.ceil(dt / .0005), i;
    for (i = 0; i < n; i++) this.advance(st, dt / n, p);
    o.psi += w / 60 * dt;                                                           // drawn 60 times slower
    o.yaw.rotation.y = st.ph;
    o.tip.rotation.z = Math.PI / 2 - st.th;
    o.disc.rotation.x = o.psi;
    S.set("d", rpm + " rpm");
    S.set("p", (Math.round(st.phd * 30 / Math.PI * 10) / 10 || 0) + " rpm");
    S.set("t", (Math.round(st.th * 180 / Math.PI - 90) || 0) + "°");
  }
});
