M507.define({
  number: 157,
  title: "Bell crank and connecting rod",
  lede: "A turning disc pulls a rod, and the rod rocks a lever bent at a corner, called a bell crank. The other arm of the bell crank pushes a second rod up and down. So a turning motion becomes a straight to-and-fro motion, at a spot well away from the disc.",
  alt: "A big disc at the left with a pin near its rim. A long thin rod runs from the pin to the top of a bell crank on the right. Its other arm reaches sideways to a rod that hangs down through a guide.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "A flat wheel on a shaft. It turns steadily and drives everything else." },
    { key: "pin", color: "#C2503F", name: "Pins", note: "Round pins that join the parts. Watch the one on the disc. It goes round in a circle." },
    { key: "link", color: "#D9B13B", name: "Connecting rod", note: "A long bar from the disc pin to the top of the lever. One end goes round, so the bar sways as it pushes and pulls." },
    { key: "lever", color: "#C8873A", name: "Bell crank", note: "A lever with two arms at a corner. It turns on a fixed pin at its corner, rocking to and fro." },
    { key: "rod", color: "#4FA58A", name: "Sliding rod", note: "A rod that hangs from the end of the lever's lower arm. A fixed guide lets it move only up and down." }
  ],
  controls: [{ id: "r", label: "Pin on the disc", value: "70", options: [["40", "Near the centre"], ["55", "Middle"], ["70", "Far"]] }],
  readouts: [{ id: "rod", label: "Rod" }, { id: "lev", label: "Lever" }, { id: "disc", label: "Disc" }],
  views: { front: [20, -115, 880], "3d": [380, -20, 1000], side: [850, -115, 0] },
  target: [20, -100, 0],
  how: [
    "The pin on the disc goes round in a circle. It pulls and pushes the long rod. The rod rocks the top of the lever, so the lever swings to and fro on its fixed pin.",
    "The lower arm of the lever swings up and down with it. It carries the sliding rod along, and the guide keeps that rod moving in a straight line. One turn of the disc gives one trip up and one trip down.",
    "Move the pin on the disc. Try Near the centre, then Far, and watch the rod reading. A pin further from the centre swings the lever further, so the sliding rod goes further."
  ],
  note: "This model is rebuilt from Brown's drawing. The bell crank is moved a little to the right of where Brown draws it. Otherwise the connecting rod would jam when the pin comes round close to the lever. The shaft, the posts, the base and the guide were made up. The lower arm ends in a pin that slides along a slot in the head of the rod, because the arm tip swings along a small arc. The pin positions on the disc were added for comparison.",

  K: { C: [-112, -4], O: [109, 5], R: 100, A1: 112, A2: 107, P1: 96.5 * Math.PI / 180, L: 244, TH0: 146 * Math.PI / 180, XR: 195, SL: 62 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, o = this.o = { a: 0 };
    var mp = c.mat("pin"), ml = c.mat("link"), mc = c.mat("lever"), mr = c.mat("rod"), md = c.mat("disc");
    // disc: z -7..7, shaft z -12..8, ends on the bearing face at z -12
    o.disc = new T.Group(); o.disc.position.set(K.C[0], K.C[1], 0); scene.add(o.disc);
    P.at(P.cylZ(K.R, 14, md), 0, 0, 0, o.disc);                              // z -7..7
    P.at(P.cylZ(14, 16, c.mat("disc", "dark")), 0, 0, 0, o.disc);            // hub z -8..8
    o.stripe = P.at(P.box(1, 7, 1, c.mat("disc", "dark")), 0, 0, 8, o.disc); // z 7.5..8.5, lifted off the face
    o.cpin = P.at(P.cylZ(5.5, 22, mp), 0, 0, 18, o.disc);                    // z 7..29
    P.at(P.cylZ(8, 1.5, mp), 0, 0, 29.5, o.cpin.parent);
    o.ccap = o.disc.children[o.disc.children.length - 1];
    P.at(P.cylZ(6, 20, c.mat("disc", "dark")), K.C[0], K.C[1], -2, scene);   // shaft z -12..8
    // connecting rod: group at the disc pin, local +X toward the lever; bar and eyes z 20..26
    o.link = new T.Group(); scene.add(o.link);
    o.lbar = P.at(P.box(1, 12, 6, ml), 0, 0, 23, o.link);
    P.at(P.cylZ(11, 6, ml), 0, 0, 23, o.link);
    o.leye = P.at(P.cylZ(11, 6, ml), 0, 0, 23, o.link);
    // bell crank: arms z 12..18, one along local +x, one at the arm angle
    o.cr = new T.Group(); o.cr.position.set(K.O[0], K.O[1], 0); scene.add(o.cr);
    P.at(P.box(K.A2, 14, 6, mc), K.A2 / 2, 0, 15, o.cr);                     // lower arm, y +-7
    P.at(P.cylZ(9, 6, mc), K.A2, 0, 15, o.cr);
    P.at(P.cylZ(14, 6, mc), 0, 0, 15, o.cr);                                 // boss z 12..18
    var up = new T.Group(); up.rotation.z = K.P1; o.cr.add(up);
    P.at(P.box(K.A1, 14, 6, mc), K.A1 / 2, 0, 15, up);
    P.at(P.cylZ(9, 6, mc), K.A1, 0, 15, up);
    // pins: lever pivot z -12..20 on the post face, joint of lever and rod z 12..27.5, slot pin z 4..20
    P.at(P.cylZ(6, 32, mp), K.O[0], K.O[1], 4, scene);                       // z -12..20
    P.at(P.cylZ(8, 1.5, mp), K.O[0], K.O[1], 20.75, scene);                  // cap z 20..21.5
    o.pj = P.at(P.cylZ(5.2, 16.5, mp), 0, 0, 19.25, scene);                  // z 11..27.5
    o.pjc = P.at(P.cylZ(8, 1.5, mp), 0, 0, 28.25, scene);                    // cap z 27.5..29
    o.ps = P.at(P.cylZ(5.5, 16, mp), 0, 0, 12, scene);                       // z 4..20
    o.psc = P.at(P.cylZ(8, 1.5, mp), 0, 0, 20.75, scene);                    // cap z 20..21.5
    // sliding rod: head frame z 4..10 with a horizontal slot, stem hangs from its bottom bar (y -19)
    o.head = new T.Group(); scene.add(o.head);
    P.at(P.box(2 * K.SL + 16, 8, 6, mr), 0, 15, 7, o.head);                  // y 11..19
    P.at(P.box(2 * K.SL + 16, 8, 6, mr), 0, -15, 7, o.head);                 // y -19..-11
    P.at(P.box(8, 38, 6, mr), K.SL + 4, 0, 7, o.head);
    P.at(P.box(8, 38, 6, mr), -K.SL - 4, 0, 7, o.head);
    P.at(P.cylY(6, 185, mr), 0, -111.5, 7, o.head);                          // y -19..-204, z 1..13
    // supports: base y -305..-295, z -35..0; posts z -22..-12; guide plate z -22..0, sleeve z 0..14
    P.at(P.box(470, 10, 35, c.fixed), 35, -300, -17.5, scene);               // x -200..270
    var bb = P.bearingBlock({ bore: 7, outer: 18, drop: K.C[1] + 295, width: 10, material: c.fixed });
    P.at(bb, K.C[0], K.C[1], -17, scene);                                    // foot y -295
    P.at(P.box(28, 314, 10, c.fixed), K.O[0], -138, -17, scene);             // x 95..123, y -295..19
    P.at(P.box(70, 190, 22, c.fixed), K.XR, -200, -11, scene);               // x 160..230, y -295..-105
    P.at(P.guideBlock({ w: 36, h: 60, d: 14, hole: 6.5, material: c.fixed }), K.XR, -135, 7, scene); // y -165..-105, z 0..14
    this.base = P;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, r = +(S.controls.r || 70);
    o.a += S.w * dt;
    var th = K.TH0 + o.a, cs = Math.cos(th), sn = Math.sin(th);
    var ax = K.C[0] + r * cs, ay = K.C[1] + r * sn;                          // disc pin
    var dx = ax - K.O[0], dy = ay - K.O[1], D = Math.sqrt(dx * dx + dy * dy);
    var k = (D * D + K.A1 * K.A1 - K.L * K.L) / (2 * K.A1 * D);
    k = Math.max(-1, Math.min(1, k));
    var f = Math.atan2(dy, dx) - Math.acos(k);                               // upper arm angle, one fixed branch
    var ph = f - K.P1;
    var bx = K.O[0] + K.A1 * Math.cos(f), by = K.O[1] + K.A1 * Math.sin(f);
    var tx = K.O[0] + K.A2 * Math.cos(ph), ty = K.O[1] + K.A2 * Math.sin(ph);
    o.disc.rotation.z = th;
    o.cpin.position.x = r; o.ccap.position.x = r;
    o.stripe.scale.x = r - 14; o.stripe.position.x = 14 + (r - 14) / 2;
    o.link.position.set(ax, ay, 0); o.link.rotation.z = Math.atan2(by - ay, bx - ax);
    o.lbar.scale.x = K.L; o.lbar.position.x = K.L / 2; o.leye.position.x = K.L;
    o.cr.rotation.z = ph;
    o.pj.position.set(bx, by, 19.75); o.pjc.position.set(bx, by, 28.25);
    o.ps.position.set(tx, ty, 12); o.psc.position.set(tx, ty, 20.75);
    o.head.position.set(K.XR, ty, 0);
    if (o.y0 === undefined) { o.y0 = ty; o.p0 = ph; }
    function sg(n, u, d) { return (n < -0.5 * Math.pow(10, -d) ? "−" : n > 0.5 * Math.pow(10, -d) ? "+" : "") + Math.abs(n).toFixed(d) + u; }
    S.set("rod", sg(ty - o.y0, " mm", 0)); S.set("lev", sg(((ph - o.p0 + 3 * Math.PI) % (2 * Math.PI) - Math.PI) * 180 / Math.PI, "°", 0));
    S.set("disc", (((o.a * 180 / Math.PI) % 360) + 360) % 360 < 0.5 ? "0°" : ((((o.a * 180 / Math.PI) % 360) + 360) % 360).toFixed(0) + "°");
  }
});
