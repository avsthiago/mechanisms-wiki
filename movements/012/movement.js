M507.define({
  number: 12,
  title: "Single fixed pulley",
  lede: "A rope runs over a wheel hung from a beam. Pulling one end down lifts a weight on the other end. It does not make the weight any lighter, but it lets you pull down instead of lifting up.",
  alt: "A pulley hung from a beam by a hook. A rope goes over it, with a weight on one end and a small winch on the ground winding in the other end.",
  parts: [
    { key: "block", color: "#4FA58A", name: "Block", note: "The frame that holds the pulley and hangs from the beam. It does not move." },
    { key: "pulley", color: "#C8873A", name: "Pulley", note: "A wheel the rope runs over. It turns with the rope, so the rope does not rub." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "The load being lifted. It hangs from one end of the rope." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One rope. One end holds the weight and the winch pulls the other. Watch the red mark to see how far it moves." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "Winds in the rope. It does the job of a hand pulling." }
  ],
  readouts: [{ id: "r", label: "Rope pulled" }, { id: "l", label: "Weight raised" }],
  views: { "3d": [420, 60, 720], front: [-40, -10, 820], side: [820, -10, 60] },
  target: [-40, -10, 0],
  how: [
    "The rope goes up from the weight, over the wheel and down to the winch. When the winch pulls in some rope, the weight rises by exactly the same amount. The red mark and the weight move together.",
    "Only one rope holds the weight up. So the winch must pull as hard as the weight pulls down. A 50 kg weight needs a 50 kg pull. The pulley only turns the pull round, from up to down.",
    "That still helps. Pulling down is easier than lifting up, because you can lean back and use your own weight. Watch the two readouts: the rope pulled and the weight raised always match."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows a hand pulling the rope; a small winch was added in its place. The sizes are made up. A real pulley rubs a little on its pin, so a real lift needs a bit more pull than shown here.",

  build: function (c) {
    var P = c.P, scene = c.scene, R = 26, YP = 110, GY = -232;
    var o = this.o = { R: R, YP: YP, YW0: -150, TRAVEL: 180, th: 0 };
    // block and pulley, hung from the beam
    var blk = P.at(P.ropeBlock({ radius: R, material: c.mat("block") }), 0, YP, 0, scene);
    o.pulley = P.at(P.sheave({ radius: R, material: c.mat("pulley"), holes: c.mat("pulley", "dark") }), 0, YP, 0, scene);
    P.at(P.box(220, 16, 40, c.fixed), -20, YP + blk.hookEdge + 8, 0, scene);   // beam, y 202 .. 218; hook top at 202
    P.at(P.box(420, 8, 120, c.fixed), -40, GY - 4, 0, scene);                  // ground, y -240 .. -232
    // winch on the ground, to the left
    o.w = P.at(P.winch({ height: 40, material: c.mat("winch"), handle: c.mat("winch", "dark"), rope: c.mat("rope") }), -170, GY + 40, 0, scene);   // foot bottom at GY
    // rope leaves the pulley on its upper left and meets the drum on its upper left: outer tangent of the two circles
    var x1 = 0, y1 = YP, r1 = R, x2 = -170, y2 = GY + 40, r2 = o.w.ropeRadius;
    var dx = x1 - x2, dy = y1 - y2, L = Math.sqrt(dx * dx + dy * dy), ph = Math.atan2(dy, dx), ac = Math.acos((r1 - r2) / L);
    var th = Math.cos(ph + ac) > Math.cos(ph - ac) ? ph + ac : ph - ac, nx = Math.cos(th), ny = Math.sin(th);
    o.t1 = [x1 - r1 * nx, y1 - r1 * ny]; o.t2 = [x2 - r2 * nx, y2 - r2 * ny];
    var wrap = P.arc(R, 2.2, Math.atan2(o.t1[1] - YP, o.t1[0]), c.mat("rope")); P.at(wrap, 0, YP, 0, scene);   // from the weight side over the top
    o.haul = P.rod(2.2, c.mat("rope")); scene.add(o.haul);
    o.haul.span(o.t1[0], o.t1[1], 0, o.t2[0], o.t2[1], 0);
    o.hlen = Math.sqrt(Math.pow(o.t1[0] - o.t2[0], 2) + Math.pow(o.t1[1] - o.t2[1], 2));
    o.knot = P.at(P.sphere(6, c.mat("rope", "mark")), 0, 0, 0, scene);       // a mark on the rope, to follow how far it is pulled
    o.lift = P.rod(2.2, c.mat("rope")); scene.add(o.lift);
    // weight: eye at the top, stem, ball; the origin is where the stem meets the ball's top
    o.wt = new c.THREE.Group(); scene.add(o.wt);
    var eye = P.at(P.hoop(5, 2, c.mat("weight")), 0, 13, 0, o.wt); eye.rotation.y = Math.PI / 2;   // eye, y 6 .. 20
    P.at(P.cylY(2.5, 16, c.mat("weight")), 0, 0, 0, o.wt);                    // stem, y -8 .. 8
    o.ball = P.at(P.sphere(30, c.mat("weight")), 0, -24, 0, o.wt);              // ball y -54 .. 6, its top tucked over the stem
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.th += S.w * dt;
    var pull = o.TRAVEL * (.5 - .5 * Math.cos(o.th)), y = o.YW0 + pull;
    o.wt.position.set(o.R, y, 0);
    o.lift.span(o.R, o.YP, 0, o.R, y + 18, 0);                                  // from the pulley's right side to the top of the eye
    o.pulley.rotation.z = pull / o.R;                                           // rope over the top runs right to left: anticlockwise
    o.w.drum.rotation.z = pull / o.w.ropeRadius;
    var t = Math.min(.96, (40 + pull) / o.hlen);
    o.knot.position.set(o.t1[0] + (o.t2[0] - o.t1[0]) * t, o.t1[1] + (o.t2[1] - o.t1[1]) * t, 0);
    S.set("r", Math.round(pull / 10) + " cm");
    S.set("l", Math.round(pull / 10) + " cm");
  }
});
