/* Elevation in drawing units (1 = a pixel of the engraving), x right, y up, origin at the lever's fulcrum on the standard,
   z towards the viewer; one group scaled by .5. Layers in z, back to front:
   lever rods z -13 .. -5, standard plate z -4 .. 4, tongue rods z 3.5 .. 12.5, tackle hook and block z 13 .. 23. */
M507.define({
  number: 492,
  title: "Boat-detaching hook",
  lede: "A boat hangs from ropes by a hook that will not come off while the boat is held up. One pull on a thin rope turns a lever, and the hook lets go at once. The boat drops into the water, free of its ropes.",
  alt: "An upright metal standard with a short bent arm hinged at its top. A hook from a rope tackle above holds a pin on the end of the arm. A curved lever pivots on the middle of the standard. Its upper end stands in the way of the pin and a thin rope is tied to its lower end.",
  parts: [
    { key: "standard", color: "#5E7387", name: "Standard", note: "The upright post bolted to the boat. The arm and the lever are both fixed to it by pins." },
    { key: "tongue", color: "#C8873A", name: "Tongue", note: "A bent arm hinged at the top of the standard. The tackle pulls its end upwards. Watch the red pin." },
    { key: "lever", color: "#D9B13B", name: "Lever and rope", note: "It turns on the middle of the standard. Its top end stands in the way of the pin. The thin rope on its bottom end is pulled to let go." },
    { key: "hook", color: "#4FA58A", name: "Tackle hook", note: "The hook of the ropes that hold the boat up. It stays where it is, and the boat falls away from it." }
  ],
  controls: [{ id: "pull", label: "Pull the rope", value: "full", options: [["full", "All the way"], ["part", "A little"]] }],
  speed: { min: 1, max: 12, value: 4, label: "Speed", unit: " cycles a min" },
  readouts: [{ id: "lever", label: "Lever" }, { id: "boat", label: "Boat" }],
  views: { "3d": [110, 40, 470], front: [0, 0, 480], side: [480, 0, 10] },
  target: [0, 0, 0],
  distance: [120, 1800],
  how: [
    "The boat hangs from the hook on the pin. The pin is on the end of the tongue, and the tackle pulls it upwards. The tongue wants to swing up, but the top end of the lever stands in its way. So the pin cannot leave the hook.",
    "Pull the thin rope and the lever turns on the middle of the standard. Its top end swings down and away from the pin. Nothing holds the tongue now. The pull of the tackle swings it up, and the pin slides out of the hook. The boat drops away from the ropes.",
    "Try pulling only a little. The lever moves, but its top end is still in the way, so the boat stays on the hook. Then pull all the way and see how far the lever must turn before the boat is let go."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows an eye in the lever that the tongue passes through. Here the eye is drawn as a round stop that stands in the way of a pin on the tongue, so the release can be seen. The tongue is made a little longer and its end lower than in the drawing so the pin can swing clear of the hook. The hook is shown as a wide open cup. The tackle ropes, the beam above them, the shape of the lever and the rope are made up. The boat is not drawn. It would be fixed to the bottom of the standard, so it drops with it.",

  build: function (c) {
    var T = c.THREE, P = c.P, S = .5, i;
    var o = this.o = { ph: 0 };
    var root = new T.Group(); root.scale.set(S, S, S); root.position.set(-97 * S, 25 * S, 0); c.scene.add(root);
    var ms = c.mat("standard"), mt = c.mat("tongue"), ml = c.mat("lever"), mh = c.mat("hook");
    o.A = [0, 95]; o.TK = [[-25, 30], [-62, -60]]; o.C0 = [-72, 45]; o.PL = [130, -222];
    // the standard and everything fixed to it (falls with the boat)
    o.std = new T.Group(); root.add(o.std);
    P.at(P.box(30, 210.5, 8, ms), 0, -10.25, 0, o.std);                            // plate x -15..15, y -115.5 .. 95
    P.at(P.cylZ(15, 8, ms), 0, 95, 0, o.std);                                       // rounded top to y 110
    P.at(P.cylY(28, 25, ms), 0, -127.5, 0, o.std);                                  // collar y -140 .. -115
    P.at(P.cylY(12, 146, ms), 0, -212, 0, o.std);                                   // threaded rod y -285 .. -139
    for (i = 0; i < 5; i++) P.at(P.hoop(12, 2, c.mat("standard", "dark")), 0, -250 + i * 8, 0, o.std).rotation.x = Math.PI / 2;
    P.at(P.cylZ(5, 18, ms), 0, 95, 4, o.std);                                       // hinge pin z -5 .. 13
    P.at(P.cylZ(5, 20, ms), 0, 0, -1, o.std);                                       // lever pin z -11 .. 9
    // tongue: two bent rods hinged at the top
    o.tongue = new T.Group(); P.at(o.tongue, 0, 95, 8, o.std);
    var M = o.TK[0], K = o.TK[1];
    o.tongue.add(P.rod(4.5, mt).span(0, 0, 0, M[0], M[1], 0));
    o.tongue.add(P.rod(4.5, mt).span(M[0], M[1], 0, K[0], K[1], 0));
    P.at(P.sphere(4.5, mt), M[0], M[1], 0, o.tongue);
    P.at(P.cylZ(4, 36, c.mat("tongue", "mark")), K[0], K[1], -4, o.tongue);         // the pin, z -14 .. 22
    // lever: round stop, curled end, bar through the fulcrum, curved arm down to the rope
    o.lever = new T.Group(); P.at(o.lever, 0, 0, -9, o.std);
    var pts = [[-72, 45], [-96, 38], [-96, 2], [0, 0], [30, -55], [80, -140], [130, -222]];
    for (i = 0; i < pts.length - 1; i++) {
      o.lever.add(P.rod(4, ml).span(pts[i][0], pts[i][1], 0, pts[i + 1][0], pts[i + 1][1], 0));
      P.at(P.sphere(4, ml), pts[i][0], pts[i][1], 0, o.lever);
    }
    P.at(P.cylZ(10, 8, ml), o.C0[0], o.C0[1], 0, o.lever);                          // the stop, z -13 .. -5 (rods the same, so the stop is 10 wide)
    P.at(P.hoop(8, 2.6, ml), o.PL[0], o.PL[1], 0, o.lever);                         // the ring the rope is tied to
    o.rope = P.rod(2.6, ml); o.std.add(o.rope);
    // tackle: hook, neck, block, falls and the beam they hang from; these do not move
    var kx = K[0], ky = o.A[1] + K[1] + 2.5;                                        // cup centre, so the pin rests on the cup
    var cup = P.arc(9, 2.5, 145 * Math.PI / 180, mh); cup.rotation.z = 215 * Math.PI / 180; P.at(cup, kx, ky, 17, root);
    P.at(P.sphere(2.5, mh), kx + 9 * Math.cos(215 * Math.PI / 180), ky + 9 * Math.sin(215 * Math.PI / 180), 17, root);
    root.add(P.rod(2.5, mh).span(kx + 9, ky, 17, kx + 9, ky + 68, 17));
    P.at(P.box(22, 30, 10, mh), kx + 9, ky + 83, 18, root);                         // block y 105.5 .. 135.5
    for (i = -1; i <= 1; i++) root.add(P.rod(2, mh).span(kx + 9 + i * 7, ky + 98, 18, kx + 9 + i * 20, 225, 18));
    P.at(P.box(130, 10, 30, c.fixed), kx + 9 - 20, 230, 18, root);                  // beam y 225 .. 235
    o.tz = 0;
  },

  step: function (c, dt, S) {
    var o = this.o, A = o.A, M = Math.PI, RF = 1.0, D = 75;
    function sm(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    o.ph = (o.ph + S.w * dt / (2 * M)) % 1;
    var ph = o.ph, full = S.controls.pull === "full", lamMax = full ? .62 : .12;
    var lam = lamMax * (sm((ph - .12) / .2) - sm((ph - .80) / .12));
    var rt = RF * (sm((ph - .26) / .14) - sm((ph - .70) / .10));
    var cl = Math.cos(lam), sl = Math.sin(lam), C = [o.C0[0] * cl - o.C0[1] * sl, o.C0[0] * sl + o.C0[1] * cl];
    var Kt = o.TK[1];
    function pin(r) { var cr = Math.cos(-r), sr = Math.sin(-r); return [A[0] + Kt[0] * cr - Kt[1] * sr, A[1] + Kt[0] * sr + Kt[1] * cr]; }
    var cap = RF;
    for (var r = 0; r <= RF + 1e-9; r += .01) { var k = pin(r); if (Math.hypot(k[0] - C[0], k[1] - C[1]) < 14) { cap = Math.max(0, r - .01); break; } }
    var rho = Math.min(rt, cap);
    o.tongue.rotation.z = -rho;
    o.lever.rotation.z = lam;
    var drop = full ? D * (sm((ph - .40) / .12) - sm((ph - .58) / .12)) : 0;
    o.std.position.y = -drop;
    var pl = [o.PL[0] * cl - o.PL[1] * sl, o.PL[0] * sl + o.PL[1] * cl];
    o.rope.span(pl[0] + 8, pl[1], -9, pl[0] + 170, pl[1] - 6, -9);
    S.set("lever", Math.round(lam * 180 / M) + "°");
    S.set("boat", drop > 1 ? "free" : rho > .05 ? "letting go" : "held");
  }
});
