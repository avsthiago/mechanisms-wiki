M507.define({
  number: 347,
  title: "Disc engine",
  lede: "A steam engine whose piston is a flat disc instead of a plug in a tube. The disc wobbles like a spinning coin settling on a table, and a rod through its middle turns a crank. There is no back-and-forth stroke, so it can run smoothly and fast.",
  alt: "A casing cut in half to show the inside. In it a flat disc, tilted, sits on a ball held between two cone-shaped ends. A rod through the ball sticks out at the left and its end is held in a socket on the face of a flywheel, whose shaft runs in a bearing on the left.",
  parts: [
    { key: "cyl", color: "#4FA58A", name: "Cylinder", note: "The casing, cut in half here so you can see in. Its two ends are cones, and the ball sits in seats at their points." },
    { key: "disc", color: "#C8873A", name: "Disc piston", note: "A flat disc fixed round a ball. Steam presses on one side of it, then the other. Watch its red stripe: it wobbles but never spins." },
    { key: "rod", color: "#D9B13B", name: "Piston rod", note: "Fixed in the ball, straight out of the disc's face. Its end goes round in a circle." },
    { key: "fly", color: "#5E7387", name: "Flywheel and shaft", note: "Holds the end of the rod in a socket. As the rod's end goes round, it turns the flywheel and the shaft." }
  ],
  speed: { label: "Flywheel", min: 1, max: 30, value: 8 },
  readouts: [{ id: "a", label: "Turned" }],
  closed: { label: "Case" },
  views: { "3d": [60, 160, 1080], front: [-120, -40, 1150], side: [1100, -40, 0] },
  target: [-120, -40, 0],
  how: [
    "The disc always leans over. One edge rests against the left cone and the opposite edge against the right cone. These two lines of touching cut the inside into spaces, and steam goes into them by turns.",
    "The steam pushes the disc where it is not touching, so the touching line rolls round the cones. The disc rocks like a coin settling on a table. The rod sticks straight out of the disc, so its end swings round a circle and turns the flywheel once for every roll of the disc.",
    "Turn the model and look along the shaft. The rod's end goes round, but the disc itself never turns round: watch it only rock. Try a slow speed to follow the line where it touches each cone. Choose Closed to see the case as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The casing is cut away like Brown's section, but the disc, ball and rod are shown whole. The steam pipes and valves, and the fixed plate that stops the disc from spinning, are left out. Brown also draws a curved bar over the top tying both ends of the rod together; it is left out, and the rod ends inside the right cone. The base, the bearing, the socket on the flywheel and all sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = Math.PI / 180;
    var al = 28 * D, be = Math.PI / 2 - al, t = 8, Rs = 175, rb = 48, ht = 12, Xe = 100, Ro = 200, XF = 225;
    var o = this.o = { a: 0, al: al, ell: XF / Math.cos(al), q: new T.Quaternion(), d: new T.Vector3(), ax: new T.Vector3(-1, 0, 0) };
    // casing in (x, r): chamber faces are cones of half-angle be whose surfaces stand t/2 off the disc's plane, so the
    // tilted disc touches each along one line; head shells ht thick; seats a hair outside the ball; end faces at x = +-Xe
    var e = t / 2 / Math.sin(be), e2 = e + ht / Math.sin(be);
    function hit(ax, sx, R) { var ux = sx * Math.cos(be), ur = Math.sin(be), b = ax * ux, s = -b + Math.sqrt(b * b - ax * ax + R * R); return [ax + s * ux, s * ur]; }
    function atX(ax, sx, x) { var s = (x - ax) / (sx * Math.cos(be)); return [x, s * Math.sin(be)]; }
    function arc(p, q, R, n) { var a0 = Math.atan2(p[1], p[0]), a1 = Math.atan2(q[1], q[0]), out = [], k; for (k = 1; k < n; k++) { var a = a0 + (a1 - a0) * k / n; out.push([R * Math.cos(a), R * Math.sin(a)]); } return out; }
    var p1 = hit(-e, -1, rb + 1), p2 = hit(-e, -1, Rs), p3 = hit(e, 1, Rs), p4 = hit(e, 1, rb + 1), p5 = hit(e2, 1, rb + 1), p6 = atX(e2, 1, Xe), p9 = atX(-e2, -1, -Xe), p10 = hit(-e2, -1, rb + 1);
    var poly = [p1, p2].concat(arc(p2, p3, Rs, 24), [p3, p4], arc(p4, p5, rb + 1, 4), [p5, p6, [Xe, Ro], [-Xe, Ro], p9, p10], arc(p10, p1, rb + 1, 4));
    var cas = P.halfSection({ poly: poly.map(function (p) { return [p[1], p[0]]; }), material: c.mat("cyl"), steps: 36 });
    cas.children[1].material = cas.children[2].material = c.mat("cyl", "light");   // the cut faces, pale like the hatching
    cas.rotation.z = -Math.PI / 2; scene.add(c.shell(cas, "open"));             // its axis (local y) along world x; front half (+z) cut away
    var whole = P.wholeSection({ poly: poly.map(function (p) { return [p[1], p[0]]; }), material: c.mat("cyl"), steps: 72 });
    whole.rotation.z = -Math.PI / 2; scene.add(c.shell(whole, "closed"));       // closed view: the whole case
    // piston: disc, ball, rod and a short stub, built along local -x (the disc's face normal points down the rod)
    o.pis = new T.Group(); scene.add(o.pis);
    P.at(P.cylX(Rs - 1, t, c.mat("disc")), 0, 0, 0, o.pis);                       // edge stays inside the sphere of the casing
    P.at(P.sphere(rb, c.mat("disc")), 0, 0, 0, o.pis);
    P.at(P.box(1, 114, 6, c.mat("disc", "mark")), -(t / 2 + .6), 112, 0, o.pis);       // thin red stripe y 55..169, lifted 0.6 off the disc's face
    var r0 = rb - 4, r1 = o.ell - 12;                                            // rod from inside the ball to inside the socket
    P.at(P.cylX(9, r1 - r0, c.mat("rod")), -(r0 + r1) / 2, 0, 0, o.pis);
    P.at(P.cylX(9, 80 - r0, c.mat("rod")), (r0 + 80) / 2, 0, 0, o.pis);           // stub ends 80 out, inside the right cone (x < 71)
    // flywheel x -265..-225 on a shaft; the socket stands on its inner face, lined up with the rod
    o.fly = new T.Group(); scene.add(o.fly);
    P.at(P.cylX(175, 40, c.mat("fly")), -245, 0, 0, o.fly);
    P.at(P.cylX(30, 20, c.mat("fly")), -275, 0, 0, o.fly);                         // hub x -285..-265
    P.at(P.cylX(16, 153, c.mat("fly", "dark")), -343.5, 0, 0, o.fly);              // shaft x -420..-265, through the bearing
    P.at(P.box(1, 110, 12, c.mat("fly", "dark")), -265.6, 105, 0, o.fly);          // stripe on the outer face, lifted 0.6
    var sock = P.cylX(17, 40, c.mat("fly")), sm = o.ell - 20;                      // socket centred 20 back from the rod's end at x = -225
    sock.position.set(-sm * Math.cos(al), sm * Math.sin(al), 0); sock.rotation.z = -al; o.fly.add(sock);
    // stand: base top y -280; bearing x -360..-330 with its foot on the base; upright x 100..140 against the casing's right end
    P.at(P.box(600, 20, 180, c.fixed), -140, -290, 0, scene);
    var bb = P.bearingBlock({ bore: 16.5, outer: 30, width: 30, drop: 280, material: c.fixed }); bb.rotation.y = Math.PI / 2; P.at(bb, -345, 0, 0, scene);
    c.shell(P.at(P.box(40, 330, 60, c.fixed), 120, -115, -30, scene), "open");    // y -280..50, z -60..0 (cut like the casing)
    c.shell(P.at(P.box(40, 330, 120, c.fixed), 120, -115, 0, scene), "closed");    // closed view: the whole upright, z -60..60
    this.place();
  },

  place: function () {
    var o = this.o, s = Math.sin(o.al);
    o.d.set(-Math.cos(o.al), s * Math.cos(o.a), s * Math.sin(o.a));
    o.q.setFromUnitVectors(o.ax, o.d);                                            // shortest turn from the axis to the rod: the disc rocks, never spins
    o.pis.quaternion.copy(o.q);
    o.fly.rotation.x = o.a;
  },

  step: function (c, dt, S) {
    var o = this.o;
    o.a += S.w * dt;
    this.place();
    var deg = Math.round(o.a * 180 / Math.PI) % 360;
    S.set("a", (deg < 0 ? deg + 360 : deg) + "°");
  }
});
