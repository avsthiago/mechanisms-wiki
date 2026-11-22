M507.define({
  number: 417,
  title: "Bent shaft and rocking rod",
  lede: "Turning a handle makes a slide move back and forth in a straight line. The end of the shaft is bent, and the bent end wobbles round in a cone. A rod hung on it passes that wobble down to the slide.",
  alt: "A shaft with a handle turns in a bearing on a pedestal. Its left end is bent slightly downwards and carries a sleeve on the top of a leaning rod. The foot of the rod sits in a ball socket in a long slide on the base.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Bent shaft", note: "Turned by the handle. Its left end is bent, so that end swings round in a cone. Watch the red knob on the handle." },
    { key: "rod", color: "#C8873A", name: "Rod and sleeve", note: "The sleeve on top fits over the bent end and can turn on it. The rod hangs from the sleeve." },
    { key: "slide", color: "#4FA58A", name: "Slide", note: "Can only move left and right between its guides. The rod's foot passes through a ball that swivels in a socket in the slide." }
  ],
  controls: [{ type: "range", id: "bend", label: "How far the end is bent", min: 4, max: 15, step: 1, value: 15, unit: "°", presets: [[5, "A little"], [10, "More"], [15, "As drawn"]] }],
  readouts: [{ id: "x", label: "Slide" }, { id: "st", label: "Stroke" }],
  views: { "3d": [110, 70, 780], front: [-40, 10, 800], side: [780, 20, 60] },
  target: [-40, 10, 0],
  how: [
    "Turn the handle and watch the bent end of the shaft. It points down and to the left, then round to the front, then up, then to the back. The sleeve on it goes round with it, but it does not spin with the shaft.",
    "When the bent end points down, the sleeve is low and to the right, and the rod stands nearly upright. Half a turn later the end points up, and the rod leans far over to the left. The rod's foot can only go along the slide, so the slide is pushed left and pulled back right once each turn.",
    "The more the end is bent, the further the sleeve swings and the longer the slide's stroke. Try a little bend, then the bend as drawn, and compare the stroke."
  ],
  note: "This model is rebuilt from Brown's drawing. The rod's foot slides a little way in and out of its ball as it rocks, because a rod fixed at both ends could not follow the bent end all the way round; Brown's drawing does not show how deep the socket is. The guides for the slide, the base and the collars on the shaft were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o = { phi: 0, Y0: 112, l: 70, Lr: 245, p: 0, bendSet: null };
    var n = Math.hypot(35, 210); o.u0 = [35 / n, -210 / n, 0];                       // rod direction in the drawn position
    o.yc = o.Y0 - o.l * Math.sin(15 * Math.PI / 180) + 190 * o.u0[1];                 // height of the ball centre, the top of the slide
    var ms = c.mat("shaft");
    // shaft, turning about its own axis (local X)
    o.sg = new T.Group(); o.sg.position.set(0, o.Y0, 0); scene.add(o.sg);
    P.at(P.cylX(9, 183, ms), 91.5, 0, 0, o.sg);                                      // straight shaft x 0..183, through the bearing x 18..140
    P.at(P.sphere(9, ms), 0, 0, 0, o.sg);                                            // the elbow
    o.bent = P.at(P.rod(9, ms), 0, 0, 0, o.sg);                                      // bent end, set in step()
    P.at(P.cylX(15, 14, ms), 9, 0, 0, o.sg);                                         // collar x 2..16
    P.at(P.cylX(15, 14, ms), 149, 0, 0, o.sg);                                       // collar x 142..156
    P.at(P.box(10, 84, 22, ms), 188, 31, 0, o.sg);                                   // crank arm x 183..193, y -11..73 about the axis
    P.at(P.cylX(5, 26, ms), 206, 64, 0, o.sg);                                       // handle pin x 193..219
    P.at(P.cylX(8, 23.5, c.mat("shaft", "mark")), 206.75, 64, 0, o.sg);                   // red handle grip x 195..219
    // rod with its sleeve, placed about the sleeve centre
    var mr = c.mat("rod");
    o.rg = new T.Group(); scene.add(o.rg);
    o.sleeve = P.at(P.rod(20, mr), 0, 0, 0, o.rg);                                   // sleeve round the bent end, set in step()
    o.cap = P.at(P.rod(23, mr), 0, 0, 0, o.rg);                                      // band at its outer end
    o.boss = P.at(P.sphere(22, mr), 0, 0, 0, o.rg);                                  // where the rod joins the sleeve
    o.rod = P.at(P.rod(9, mr), 0, 0, 0, o.rg).span(0, 0, 0, o.Lr * o.u0[0], o.Lr * o.u0[1], 0);
    // slide with its ball socket
    var mg = c.mat("slide");
    o.slide = new T.Group(); o.slide.position.y = o.yc; scene.add(o.slide);
    P.at(P.box(160, 58, 30, mg), -37.5, -29, 0, o.slide);                             // body x -117.5..42.5 about the ball, y -58..0 (base top), z -15..15
    o.ball = P.at(P.sphere(13, mg), 0, 0, 0, o.slide);                                // swivel ball, half sunk in the top
    P.at(P.hoop(14.5, 3, c.mat("slide", "dark")), 0, 1.5, 0, o.slide).rotation.x = Math.PI / 2;   // socket rim, lifted off the top face
    // supports (not part of the movement)
    var hb = P.guideBlock({ w: 56, h: 122, d: 56, hole: 9.6, material: c.fixed }); hb.rotation.z = Math.PI / 2;
    P.at(hb, 79, o.Y0, 0, scene);                                                     // bearing x 18..140, y 84..140, z -28..28
    P.at(P.box(40, 235.5, 32, c.fixed), 80, -33.75, 0, scene);                        // pedestal x 60..100, y -151.5..84 (bearing bottom), z -16..16
    P.at(P.box(70, 8, 50, c.fixed), 80, -147.5, 0, scene);                            // its foot y -151.5..-143.5 on the base
    var by = o.yc - 58;                                                                // base top, -151.5
    P.at(P.box(520, 15, 100, c.fixed), -30, by - 7.5, 0, scene);                      // base x -290..230, y -166.5..-151.5
    P.at(P.box(330, 30, 8, c.fixed), -125, by + 15, 19, scene);                       // front guide x -290..40, z 15..23
    P.at(P.box(330, 30, 8, c.fixed), -125, by + 15, -19, scene);                      // back guide z -23..-15
  },

  rot: function (v, u, a) {                     // turn v about the unit axis u by angle a
    var cs = Math.cos(a), sn = Math.sin(a), d = v[0] * u[0] + v[1] * u[1] + v[2] * u[2];
    return [v[0] * cs + (u[1] * v[2] - u[2] * v[1]) * sn + u[0] * d * (1 - cs),
            v[1] * cs + (u[2] * v[0] - u[0] * v[2]) * sn + u[1] * d * (1 - cs),
            v[2] * cs + (u[0] * v[1] - u[1] * v[0]) * sn + u[2] * d * (1 - cs)];
  },
  // The sleeve turns on the bent end by an angle p. Find p so the rod's line passes through the ball's line of travel
  // (height yc, z = 0); the ball is then where the rod crosses that height.
  solve: function (al, phi, p) {
    var o = this.o, self = this, d = [-Math.cos(al), -Math.sin(al) * Math.cos(phi), -Math.sin(al) * Math.sin(phi)];
    var S = [o.l * d[0], o.Y0 + o.l * d[1], o.l * d[2]], ur = this.rot(o.u0, [1, 0, 0], phi);
    function f(q) { var u = self.rot(ur, d, q); return (o.yc - S[1]) * u[2] + S[2] * u[1]; }
    function newton(q) { for (var i = 0; i < 30; i++) { var v = f(q); if (Math.abs(v) < 1e-9) break; q -= v / ((f(q + 1e-6) - v) / 1e-6); } return q; }
    // The rod's line meets the slide's line twice a turn of p: once with the rod hanging down, once pointing up.
    // Keep the hanging root: start from the last answer, and if that lands on the upward one, start half a turn away.
    p = newton(p);
    if (this.rot(ur, d, p)[1] >= 0) p = newton(p + Math.PI);
    p = Math.atan2(Math.sin(p), Math.cos(p));
    var u = this.rot(ur, d, p), lam = (o.yc - S[1]) / u[1];
    return { p: p, d: d, S: S, x: S[0] + lam * u[0] };
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, al = S.controls.bend * Math.PI / 180, i;
    if (o.bendSet !== S.controls.bend) {                                              // stroke for this bend: try a whole turn
      o.bendSet = S.controls.bend; o.p = 0;
      var lo = 1e9, hi = -1e9, pp = 0;
      for (i = 0; i <= 360; i++) { var r0 = this.solve(al, i * Math.PI / 180, pp); pp = r0.p; lo = Math.min(lo, r0.x); hi = Math.max(hi, r0.x); }
      o.mid = (lo + hi) / 2; o.stroke = hi - lo;
      this.o.p = this.solve(al, o.phi, 0).p;
      var d0 = [-Math.cos(al), -Math.sin(al), 0];
      o.bent.span(0, 0, 0, 122 * d0[0], 122 * d0[1], 0);                             // bent end, hidden in the sleeve beyond 15
      // sleeve along the bent end in the drawn pose, about its centre at distance l from the elbow
      o.sleeve.span(-55 * d0[0], -55 * d0[1], 0, 55 * d0[0], 55 * d0[1], 0);
      o.cap.span(42 * d0[0], 42 * d0[1], 0, 55 * d0[0], 55 * d0[1], 0);
      o.boss.position.set(.35 * 22 * o.u0[0], .35 * 22 * o.u0[1], 0);
      o.d0 = d0;
    }
    o.phi += S.w * dt;
    var r = this.solve(al, o.phi, o.p); o.p = r.p;
    o.sg.rotation.x = o.phi;
    // the rod group: drawn pose, turned about X by phi (the shaft's turn), then about the bent end by p
    var q1 = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), o.phi);
    var q2 = new T.Quaternion().setFromAxisAngle(new T.Vector3(r.d[0], r.d[1], r.d[2]), r.p);
    o.rg.quaternion.copy(q2.multiply(q1));
    o.rg.position.set(r.S[0], r.S[1], r.S[2]);
    o.slide.position.x = r.x;
    var dx = Math.round(r.x - o.mid);
    S.set("x", (dx > 0 ? "+" : dx < 0 ? "−" : "") + Math.abs(dx) + " mm");
    S.set("st", Math.round(o.stroke) + " mm");
  }
});
