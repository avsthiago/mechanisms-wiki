M507.define({
  number: 18,
  title: "Two fixed pulleys and one movable pulley",
  lede: "Two pulleys hang one above the other from the beam. A third pulley below them carries the weight. Three ropes now hold the weight up, so you only pull a third as hard.",
  alt: "A block with two pulleys, one above the other, hooked to a beam. Below it a single pulley carries a weight. One rope is tied to the top of the lower block, runs over the small fixed pulley, under the movable pulley, over the big fixed pulley and down to a small winch.",
  parts: [
    { key: "upper", color: "#4FA58A", name: "Fixed block", note: "Hangs from the beam and does not move. It holds two pulleys, one above the other." },
    { key: "lower", color: "#E8E2D0", name: "Movable block", note: "Carries the weight and goes up with it. The rope's end is tied to its top." },
    { key: "sheaves", color: "#C8873A", name: "Pulleys", note: "Wheels the rope runs over. The nearer a pulley is to the winch along the rope, the faster the rope runs over it." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One rope from the movable block to the winch. Watch the red mark to see how far it moves." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "Shared by the three ropes that hold up the movable block." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "Winds in the rope. It does the job of a hand pulling." }
  ],
  readouts: [{ id: "r", label: "Rope pulled" }, { id: "l", label: "Weight raised" }],
  views: { "3d": [480, 60, 880], front: [-50, -30, 1020], side: [1020, -30, 0] },
  target: [-50, -30, 0],
  how: [
    "Follow the rope from its tied end on top of the movable block. It goes up over the small fixed pulley, down under the movable pulley, up over the big fixed pulley and down to the winch.",
    "Now count the ropes coming up out of the movable block. There are three, and they share the weight. If it weighs 90 kg, each rope holds 30 kg. The winch only holds one of them, so it pulls 30 kg.",
    "To lift the weight 1 cm, all three ropes must get 1 cm shorter. So the winch must pull in 3 cm of rope. Watch the readouts: the rope pulled is always three times the weight raised."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown leaves the end of the rope hanging; a small winch was added to pull it. The sizes, the ring where the rope is tied and the ground are made up. The pulleys and rope are taken to weigh nothing, and real pulleys rub a little, so a real lift needs a bit more pull than shown here.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R1 = 34, R2 = 20, RM = 20, YT = 120, GY = -290, mu = c.mat("upper");
    var YM = YT - R1 - R2 - 8;                                                      // 58: an 8 gap between the two fixed pulleys
    var o = this.o = { R1: R1, R2: R2, RM: RM, YT: YT, YM: YM, YL0: -110, TRAVEL: 240, th: 0 };
    // fixed block: two pulleys on one pair of straps (pulley width 8, straps at z ±4.5 .. ±7.5)
    var sb = YM - 14, st = YT + R1 + 13;                                            // straps y 44 .. 167
    [-1, 1].forEach(function (s) { P.at(P.box(16, st - sb, 3, mu), 0, (sb + st) / 2, s * 6, scene); });
    P.at(P.cylZ(4, 15, mu), 0, YT, 0, scene); P.at(P.cylZ(4, 15, mu), 0, YM, 0, scene);   // pins end at the straps' outer faces, z ±7.5
    P.at(P.box(18, 5, 15, mu), 0, st, 0, scene);                                    // cross strap, y 164.5 .. 169.5
    P.at(P.cylY(3, 34, mu), 0, st + 17, 0, scene);                                  // rod, y 167 .. 201
    P.at(P.hook({ material: mu }), 0, st + 41, 0, scene);                           // ring centre 208, rod 196 .. 220
    P.at(P.box(300, 16, 40, c.fixed), -40, st + 61, 0, scene);                      // beam, y 220 .. 236: underside on the ring's top edge
    o.tp = P.at(P.sheave({ radius: R1, material: c.mat("sheaves"), holes: c.mat("sheaves", "dark") }), 0, YT, 0, scene);
    o.mp = P.at(P.sheave({ radius: R2, material: c.mat("sheaves"), holes: c.mat("sheaves", "dark") }), 0, YM, 0, scene);
    // movable block, with a top strap and a ring where the rope is tied
    o.mv = new T.Group(); scene.add(o.mv);
    o.mblk = P.at(P.ropeBlock({ radius: RM, material: c.mat("lower"), up: false }), 0, 0, 0, o.mv);
    P.at(P.box(18, 5, 15, c.mat("lower")), 0, RM + 13, 0, o.mv);                    // top strap, y RM+10.5 .. RM+15.5, over the straps' ends
    P.at(P.hook({ radius: 6, tube: 2, material: c.mat("lower") }), 0, RM + 21.5, 0, o.mv);   // ring, rod bottom at RM+15.5 sits in the strap
    o.TIE = RM + 27.5;                                                              // middle of the ring's top
    P.at(P.sphere(4.5, c.mat("rope")), 0, o.TIE, 0, o.mv);                          // the knot
    o.bp = P.at(P.sheave({ radius: RM, material: c.mat("sheaves"), holes: c.mat("sheaves", "dark") }), 0, 0, 0, o.mv);
    // rope wraps, rebuilt every frame as the tangent points move
    function wrap(g) { var m = P.arc(1, 2.2, 1, c.mat("rope")); m.userData.live = true; (g || scene).add(m); return m; }
    o.wT = wrap(); o.wT.position.set(0, YT, 0);
    o.wM = wrap(); o.wM.position.set(0, YM, 0);
    o.wB = wrap(o.mv);
    o.tied = P.rod(2.2, c.mat("rope")); scene.add(o.tied);                          // movable block up to the small fixed pulley
    o.left = P.rod(2.2, c.mat("rope")); scene.add(o.left);                          // small fixed pulley down to the movable pulley
    o.right = P.rod(2.2, c.mat("rope")); scene.add(o.right);                        // movable pulley up to the big fixed pulley
    // ground and winch
    P.at(P.box(380, 8, 120, c.fixed), -60, GY - 4, 0, scene);                       // ground, y -298 .. -290
    o.w = P.at(P.winch({ height: 40, material: c.mat("winch"), handle: c.mat("winch", "dark"), rope: c.mat("rope") }), -170, GY + 40, 0, scene);   // foot bottom at GY
    // hauling end: outer tangent from the big fixed pulley to the drum, both on their left
    var x1 = 0, y1 = YT, r1 = R1, x2 = -170, y2 = GY + 40, r2 = o.w.ropeRadius;
    var dx = x1 - x2, dy = y1 - y2, L = Math.sqrt(dx * dx + dy * dy), ph = Math.atan2(dy, dx), ac = Math.acos((r1 - r2) / L);
    var th = Math.cos(ph + ac) > Math.cos(ph - ac) ? ph + ac : ph - ac, nx = Math.cos(th), ny = Math.sin(th);
    o.t1 = [x1 - r1 * nx, y1 - r1 * ny]; o.t2 = [x2 - r2 * nx, y2 - r2 * ny];
    o.a1 = Math.atan2(o.t1[1] - YT, o.t1[0]); if (o.a1 < 0) o.a1 += 2 * Math.PI;    // where the rope leaves the big pulley, left side
    o.haul = P.rod(2.2, c.mat("rope")); scene.add(o.haul);
    o.haul.span(o.t1[0], o.t1[1], 0, o.t2[0], o.t2[1], 0);
    o.hlen = Math.sqrt(Math.pow(o.t1[0] - o.t2[0], 2) + Math.pow(o.t1[1] - o.t2[1], 2));
    o.knot = P.at(P.sphere(6, c.mat("rope", "mark")), 0, 0, 0, scene);
    // weight: eye at the top, stem, ball; the origin is where the stem meets the ball's top
    o.wt = new T.Group(); scene.add(o.wt);
    var eye = P.at(P.hoop(5, 2, c.mat("weight")), 0, 13, 0, o.wt); eye.rotation.y = Math.PI / 2;   // eye, y 6 .. 20, top of the stem at 8 inside it
    P.at(P.cylY(2.5, 16, c.mat("weight")), 0, 0, 0, o.wt);                          // stem, y -8 .. 8
    P.at(P.sphere(30, c.mat("weight")), 0, -24, 0, o.wt);                           // ball, top at y 6
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, R1 = o.R1, R2 = o.R2, RM = o.RM;
    o.th += S.w * dt;
    var pull = o.TRAVEL * (.5 - .5 * Math.cos(o.th)), lift = pull / 3, yL = o.YL0 + lift;
    function arc(m, r, a0, a1) { m.geometry.dispose(); m.geometry = new T.TorusGeometry(r, 2.2, 10, 32, a1 - a0); m.rotation.z = a0; }
    o.mv.position.set(0, yL, 0);
    o.wt.position.set(0, yL + o.mblk.hookBend - 18, 0);                             // eye hangs in the hook's bend
    // tied rope: from the ring up to the right side of the small pulley
    var yt = yL + o.TIE, th = -Math.PI / 2 + Math.acos(R2 / (o.YM - yt));
    o.tied.span(0, yt, 0, R2 * Math.cos(th), o.YM + R2 * Math.sin(th), 0);
    arc(o.wM, R2, th, Math.PI);
    o.left.span(-R2, o.YM, 0, -RM, yL, 0);
    // long rope: outer tangent on the right, from the movable pulley up to the big pulley
    var b = -Math.asin((R1 - RM) / (o.YT - yL)), cb = Math.cos(b), sb = Math.sin(b);
    o.right.span(RM * cb, yL + RM * sb, 0, R1 * cb, o.YT + R1 * sb, 0);
    arc(o.wB, RM, Math.PI, 2 * Math.PI + b);
    arc(o.wT, R1, b, o.a1);
    // spins: rope runs over the small pulley at the lift speed, under the movable one at twice it, over the big one at the pull speed
    o.mp.rotation.z = lift / R2;
    o.bp.rotation.z = 2 * lift / RM;
    o.tp.rotation.z = pull / R1;
    o.w.drum.rotation.z = pull / o.w.ropeRadius;
    var t = Math.min(.96, (40 + pull) / o.hlen);
    o.knot.position.set(o.t1[0] + (o.t2[0] - o.t1[0]) * t, o.t1[1] + (o.t2[1] - o.t1[1]) * t, 0);
    S.set("r", Math.round(pull / 10) + " cm");
    S.set("l", (lift / 10).toFixed(1) + " cm");
  }
});
