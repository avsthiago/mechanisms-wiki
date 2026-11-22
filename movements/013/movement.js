M507.define({
  number: 13,
  title: "Fixed and movable pulley",
  lede: "The weight hangs from a pulley that rides up and down on the rope. Two ropes now hold the weight, so you only pull half as hard. In return, you pull in twice as much rope.",
  alt: "A pulley hooked to a beam and a second pulley below it carrying a weight. The rope is tied to a hook on the beam, runs down under the lower pulley, up over the upper one and down to a small winch.",
  parts: [
    { key: "upper", color: "#4FA58A", name: "Fixed block", note: "Hangs from the beam and does not move. Its pulley only turns the rope towards the winch." },
    { key: "lower", color: "#E8E2D0", name: "Movable block", note: "Carries the weight and goes up with it. The rope runs under its pulley." },
    { key: "sheaves", color: "#C8873A", name: "Pulleys", note: "Wheels the rope runs over. The top one turns twice as fast as the bottom one." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One rope. One end is tied to a hook on the beam and the winch pulls the other. Watch the red mark to see how far it moves." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "100 kg, shared by the two ropes that hold up the movable block." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "Winds in the rope. It does the job of a hand pulling." }
  ],
  readouts: [{ id: "r", label: "Rope pulled" }, { id: "l", label: "Weight raised" }],
  views: { "3d": [440, 60, 740], front: [-20, -10, 840], side: [840, -10, 60] },
  target: [-20, -10, 0],
  how: [
    "Follow the rope from the hook on the beam. It goes down under the movable pulley, up over the fixed pulley, and down to the winch. So two ropes hang below the movable pulley, one on each side.",
    "Those two ropes share the weight. With 100 kg, each one holds 50 kg, so the winch only pulls 50 kg. But to lift the weight, both ropes must get shorter by the same amount. So the winch pulls in twice as much rope as the weight rises.",
    "Half the pull, twice the rope. Watch the two readouts: the rope pulled is always twice the weight raised."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown leaves the end of the rope hanging; a small winch was added to pull it. The 100 kg weight and the sizes are made up. The pulleys and rope are taken to weigh nothing, and real pulleys rub a little, so a real lift needs a bit more pull than shown here.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 26, YF = 110, GY = -240;
    var o = this.o = { R: R, YF: YF, XM: 2 * R, XT: 3 * R, YM0: -60, TRAVEL: 160, th: 0 };
    // fixed block, hooked to the beam
    var blk = P.at(P.ropeBlock({ radius: R, material: c.mat("upper") }), 0, YF, 0, scene);
    o.fp = P.at(P.sheave({ radius: R, material: c.mat("sheaves"), holes: c.mat("sheaves", "dark") }), 0, YF, 0, scene);
    var YB = YF + blk.hookEdge;                                                     // beam underside, 202
    P.at(P.box(300, 16, 40, c.fixed), -10, YB + 8, 0, scene);                       // beam, y 202 .. 218
    // hook on the beam where the rope's end is tied
    P.at(P.cylY(3, 12, c.mat("upper")), o.XT, YB - 6, 0, scene);                    // shank, y 190 .. 202
    P.at(P.hook({ material: c.mat("upper"), gap: "up" }), o.XT, YB - 21, 0, scene); // ring centre 181, bend at 172
    o.YT = YB - 30;
    // movable block with its pulley
    o.mv = new T.Group(); scene.add(o.mv);
    o.mblk = P.at(P.ropeBlock({ radius: R, material: c.mat("lower"), up: false }), 0, 0, 0, o.mv);
    o.mp = P.at(P.sheave({ radius: R, material: c.mat("sheaves"), holes: c.mat("sheaves", "dark") }), 0, 0, 0, o.mv);
    var under = P.arc(R, 2.2, Math.PI, c.mat("rope")); under.rotation.z = Math.PI; o.mv.add(under);   // rope under the movable pulley
    P.at(P.box(400, 8, 120, c.fixed), -30, GY - 4, 0, scene);                       // ground, y -248 .. -240
    // winch on the ground, to the left
    o.w = P.at(P.winch({ height: 40, material: c.mat("winch"), handle: c.mat("winch", "dark"), rope: c.mat("rope") }), -150, GY + 40, 0, scene);   // foot bottom at GY
    // rope leaves the fixed pulley on its upper left and meets the drum on its upper left: outer tangent of the two circles
    var x1 = 0, y1 = YF, r1 = R, x2 = -150, y2 = GY + 40, r2 = o.w.ropeRadius;
    var dx = x1 - x2, dy = y1 - y2, L = Math.sqrt(dx * dx + dy * dy), ph = Math.atan2(dy, dx), ac = Math.acos((r1 - r2) / L);
    var th = Math.cos(ph + ac) > Math.cos(ph - ac) ? ph + ac : ph - ac, nx = Math.cos(th), ny = Math.sin(th);
    o.t1 = [x1 - r1 * nx, y1 - r1 * ny]; o.t2 = [x2 - r2 * nx, y2 - r2 * ny];
    P.at(P.arc(R, 2.2, Math.atan2(o.t1[1] - YF, o.t1[0]), c.mat("rope")), 0, YF, 0, scene);   // over the fixed pulley
    o.haul = P.rod(2.2, c.mat("rope")); scene.add(o.haul);
    o.haul.span(o.t1[0], o.t1[1], 0, o.t2[0], o.t2[1], 0);
    o.hlen = Math.sqrt(Math.pow(o.t1[0] - o.t2[0], 2) + Math.pow(o.t1[1] - o.t2[1], 2));
    o.knot = P.at(P.sphere(6, c.mat("rope", "mark")), 0, 0, 0, scene);
    o.down = P.rod(2.2, c.mat("rope")); scene.add(o.down);                          // fixed pulley to movable pulley (or to the weight)
    o.tied = P.rod(2.2, c.mat("rope")); scene.add(o.tied);                          // movable pulley up to the hook on the beam
    // weight: eye at the top, stem, ball; the origin is where the stem meets the ball's top
    o.wt = new T.Group(); scene.add(o.wt);
    var eye = P.at(P.hoop(5, 2, c.mat("weight")), 0, 13, 0, o.wt); eye.rotation.y = Math.PI / 2;   // eye, y 6 .. 20, top of the rod at 18
    P.at(P.cylY(2.5, 16, c.mat("weight")), 0, 0, 0, o.wt);                          // stem, y -8 .. 8
    P.at(P.sphere(30, c.mat("weight")), 0, -24, 0, o.wt);                           // ball, top at y 6
  },

  step: function (c, dt, S) {
    var o = this.o, R = o.R;
    o.th += S.w * dt;
    var pull = o.TRAVEL * (.5 - .5 * Math.cos(o.th)), lift = pull / 2;
    {
      var ym = o.YM0 + lift;
      o.mv.position.set(o.XM, ym, 0);
      o.mp.rotation.z = -lift / R;                    // rope runs under it from right to left, seen from the block: clockwise
      o.down.span(R, o.YF, 0, R, ym, 0);
      o.tied.span(o.XT, o.YT, 0, o.XT, ym, 0);
      o.wt.position.set(o.XM, ym + o.mblk.hookBend - 18, 0);   // eye hangs in the hook's bend
    }
    o.fp.rotation.z = pull / R;                       // rope over the top runs right to left: anticlockwise
    o.w.drum.rotation.z = pull / o.w.ropeRadius;
    var t = Math.min(.96, (40 + pull) / o.hlen);
    o.knot.position.set(o.t1[0] + (o.t2[0] - o.t1[0]) * t, o.t1[1] + (o.t2[1] - o.t1[1]) * t, 0);
    S.set("r", Math.round(pull / 10) + " cm");
    S.set("l", Math.round(lift / 10) + " cm");
  }
});
