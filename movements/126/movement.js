M507.define({
  number: 126,
  title: "Bell-crank lever",
  lede: "A rope pulls straight down. A lever bent at a corner, called a bell crank, turns that pull into a pull sideways. This is how a pull can be sent round a corner, for example from a pedal to a brake far away.",
  alt: "A pulley at the upper left with a rope over it. The right-hand rope hangs down to a bent lever, shaped like an L. The lever turns on a fixed pin at its corner. Its other end pulls a second rope sideways.",
  parts: [
    { key: "pulley", color: "#5E7387", name: "Pulley", note: "It turns on a fixed shaft. The rope runs over it, so a pull on one side lifts the other side." },
    { key: "rope", color: "#D9B13B", name: "Ropes", note: "One rope hangs down from the pulley. Another goes off to the right. The red marks show how far each rope moves." },
    { key: "crank", color: "#C8873A", name: "Bell crank", note: "A lever with two arms at right angles. It turns on a fixed pin at its corner." },
    { key: "pin", color: "#C2503F", name: "Pins", note: "The fixed pin at the corner, and the pins where the ropes are tied. Watch the lower ones: they go along small arcs." }
  ],
  controls: [{ id: "b", label: "Lower arm", value: "97", options: [["60", "Short"], ["97", "As drawn"], ["150", "Long"]] }],
  readouts: [{ id: "in", label: "Rope down" }, { id: "out", label: "Rope sideways" }, { id: "ang", label: "Lever turn" }],
  views: { front: [50, 5, 800], "3d": [330, 150, 700], side: [800, -40, 0] },
  target: [50, 5, 0],
  how: [
    "The upper arm of the bell crank is tied to the rope that hangs from the pulley. The lower arm is tied to a second rope that runs sideways. The lever turns on a fixed pin at its corner.",
    "When the hanging rope is pulled down, the upper arm goes down and the lever turns. The lower arm swings to the right and pulls the sideways rope. A long arm moves further than a short arm, so the two ropes do not move the same distance.",
    "Try Short, then Long, and watch the readouts. A longer lower arm pulls the sideways rope further. The hanging rope moves the same distance as before."
  ],
  note: "This model is rebuilt from Brown's drawing. The shaft, the posts behind the pulley and the lever pin, and the base were made up. The ropes are drawn thick and run on past the edge, as in the drawing. The short and long lower arms were added for comparison.",

  K: { C: [-72, 81], R: 50, RC: 54, O: [93, -58], A: 111, YE: -45, XE: 300, YB: -155, PH: 0.45 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, o = this.o = { a: 0 };
    var mr = c.mat("rope"), mk = c.mat("rope", "mark"), mc = c.mat("crank"), mp = c.mat("pin");
    // pulley: rim z -7..7, hub z -6.3..6.3, shaft z -12..8 ends on the post face at z -12
    o.pul = P.pulley({ radius: K.R, width: 14, rim: 7, spokes: 4, hub: 11, material: c.mat("pulley") });
    o.pul.spokes[0].material = c.mat("pulley", "mark");
    P.at(o.pul, K.C[0], K.C[1], 0, scene);
    P.at(P.cylZ(6, 20, mp), K.C[0], K.C[1], -2, scene);                      // shaft z -12..8
    P.at(P.cylZ(8, 1.5, mp), K.C[0], K.C[1], 8.75, scene);                   // cap z 8..9.5
    // rope wrapped over the pulley: rebuilt every frame, z -4..4
    o.wrap = new T.Mesh(new T.BufferGeometry(), mr); o.wrap.userData.live = true; scene.add(o.wrap);
    o.lrope = P.at(P.box(8, 1, 8, mr), K.C[0] - K.RC, 0, 0, scene);          // left rope, x -134..-118 centred -126
    o.lmark = P.at(P.box(9, 12, 9, mk), K.C[0] - K.RC, 0, 0, scene);
    o.rrope = P.at(P.box(8, 1, 8, mr), 0, 0, 0, scene);
    o.rmark = P.at(P.box(9, 12, 9, mk), 0, 0, 0, scene);
    o.hrope = P.at(P.box(1, 8, 8, mr), 0, 0, 0, scene);
    o.hmark = P.at(P.box(12, 9, 9, mk), 0, 0, 0, scene);
    // bell crank: arms z 4..10; upper arm along -x, lower arm along -y
    o.cr = new T.Group(); o.cr.position.set(K.O[0], K.O[1], 0); scene.add(o.cr);
    P.at(P.box(K.A, 14, 6, mc), -K.A / 2, 0, 7, o.cr);                       // x -111..0, y +-7, z 4..10
    o.arm2 = P.at(P.box(14, 1, 6, mc), 0, 0, 7, o.cr);
    P.at(P.cylZ(14, 6, mc), 0, 0, 7, o.cr);                                  // boss z 4..10
    P.at(P.cylZ(9, 6, mc), -K.A, 0, 7, o.cr);                                // eye z 4..10
    o.eye2 = P.at(P.cylZ(9, 6, mc), 0, 0, 7, o.cr);
    // pins: z -3..12, caps z 11..13
    o.pin1 = P.at(P.cylZ(6, 15, mp), 0, 0, 4.5, scene); P.at(P.cylZ(8, 2, mp), 0, 0, 7.5, o.pin1);
    o.pin2 = P.at(P.cylZ(6, 15, mp), 0, 0, 4.5, scene); P.at(P.cylZ(8, 2, mp), 0, 0, 7.5, o.pin2);
    P.at(P.cylZ(6, 24, mp), K.O[0], K.O[1], 0, scene);                       // pivot z -12..12
    P.at(P.cylZ(8, 2, mp), K.O[0], K.O[1], 13, scene);                       // cap z 12..14
    // supports behind: posts z -22..-12, base y -225..-215, z -30..20
    P.at(P.box(16, 304, 10, c.fixed), K.C[0], -63, -17, scene);              // x -80..-64, y -215..89
    P.at(P.box(28, 171, 10, c.fixed), K.O[0], -129.5, -17, scene);           // x 79..107, y -215..-44
    P.at(P.box(430, 10, 50, c.fixed), 55, -220, -5, scene);                  // x -160..270
    o.q0 = [K.O[0] - K.A, K.O[1]];
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, T = c.THREE, b = +(S.controls.b || 97);
    o.a += S.w * dt;
    var ph = K.PH * Math.sin(o.a), cs = Math.cos(ph), sn = Math.sin(ph);
    var qx = K.O[0] - K.A * cs, qy = K.O[1] - K.A * sn;                      // upper pin
    var rx = K.O[0] + b * sn, ry = K.O[1] - b * cs;                          // lower pin
    o.cr.rotation.z = ph;
    o.arm2.scale.y = b; o.arm2.position.y = -b / 2; o.eye2.position.y = -b;
    o.pin1.position.set(qx, qy, 4.5); o.pin2.position.set(rx, ry, 4.5);

    // hanging rope: straight from the pin to where it touches the pulley
    var dx = qx - K.C[0], dy = qy - K.C[1], D = Math.sqrt(dx * dx + dy * dy), Lt = Math.sqrt(D * D - K.RC * K.RC);
    var tau = Math.atan2(dy, dx) + Math.acos(K.RC / D);
    var tx = K.C[0] + K.RC * Math.cos(tau), ty = K.C[1] + K.RC * Math.sin(tau);
    if (o.T0 === undefined) { o.T0 = Lt; o.tau0 = tau; }
    var th = (tau - o.tau0) - (Lt - o.T0) / K.RC;                            // pulley angle from rope length
    o.pul.rotation.z = th;
    var ang = Math.atan2(qy - ty, qx - tx);                                  // rope direction, pointing down
    o.rrope.scale.y = Lt; o.rrope.position.set((tx + qx) / 2, (ty + qy) / 2, 0); o.rrope.rotation.z = ang + Math.PI / 2;
    var m = 40 / Lt;
    o.rmark.position.set(qx + (tx - qx) * m, qy + (ty - qy) * m, 0); o.rmark.rotation.z = ang + Math.PI / 2;

    // rope over the pulley, from the right touch point to the left (angle PI)
    var sh = new T.Shape(), r1 = K.RC + 4, r0 = K.RC - 4;
    sh.absarc(0, 0, r1, tau, Math.PI, false); sh.absarc(0, 0, r0, Math.PI, tau, true);
    var g = new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false, curveSegments: 40 });
    g.translate(0, 0, -4); o.wrap.geometry.dispose(); o.wrap.geometry = g; o.wrap.position.set(K.C[0], K.C[1], 0);

    // left rope hangs from the pulley; its lower end rises when the pulley turns clockwise
    var ye = K.YE - K.RC * th, top = K.C[1], len = top - ye;
    o.lrope.scale.y = len; o.lrope.position.y = (top + ye) / 2;
    o.lmark.position.y = ye + 50;

    // sideways rope: from the lower pin to a fixed far end
    var ex = K.XE, ey = K.YB, hl = Math.sqrt((ex - rx) * (ex - rx) + (ey - ry) * (ey - ry)), ha = Math.atan2(ey - ry, ex - rx);
    o.hrope.scale.x = hl; o.hrope.position.set((rx + ex) / 2, (ry + ey) / 2, 0); o.hrope.rotation.z = ha;
    o.hmark.position.set(rx + 60 * Math.cos(ha), ry + 60 * Math.sin(ha), 0); o.hmark.rotation.z = ha;

    function sg(n, u, d) { return (n < -0.5 * Math.pow(10, -d) ? "−" : n > 0.5 * Math.pow(10, -d) ? "+" : "") + Math.abs(n).toFixed(d) + u; }
    S.set("in", sg(o.q0[1] - qy, " mm", 0)); S.set("out", sg(rx - K.O[0], " mm", 0)); S.set("ang", sg(ph * 180 / Math.PI, "°", 0));
  }
});
