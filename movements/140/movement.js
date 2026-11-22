M507.define({
  number: 140,
  title: "Toggle-joint punch",
  lede: "Two links joined at a knee are pushed until they lie in one straight line. As they straighten, they shove a punch down with a huge force. This is how machines punch holes in metal with only a hand lever.",
  alt: "An iron frame with a tall back plate and a column on a base. Two equal links hang from the top of the plate and meet at a knee on the left, then run down to a punch. A flat link joins the knee to a short arm of a long lever on the right. The lever points up and to the right.",
  parts: [
    { key: "lever", color: "#5E7387", name: "Lever", note: "A long handle with a short arm. It turns on a pin in the frame. A long handle with a short arm gives a big push from a small one." },
    { key: "link", color: "#D9B13B", name: "Flat link", note: "A flat bar from the short arm of the lever to the knee. It pushes the knee sideways when the lever is pulled down." },
    { key: "toggle", color: "#C8873A", name: "Toggle links", note: "Two equal links that meet at the knee. The top one is pinned to the frame and the lower one to the punch. The knee is the joint to watch." },
    { key: "punch", color: "#C2503F", name: "Punch", note: "The rod that slides up and down in its guide. Watch it go down and press on the metal." },
    { key: "die", color: "#4FA58A", name: "Die and metal", note: "The block that does not move, and the flat blank of metal on it. The punch presses into the blank." }
  ],
  controls: [{ id: "swing", label: "Handle swing", value: "full", options: [["short", "Short"], ["full", "Full"]] }],
  readouts: [{ id: "p", label: "Punch" }, { id: "a", label: "Knee" }],
  views: { "3d": [580, 170, 920], front: [0, 0, 980], side: [980, 0, 0] },
  target: [0, 0, 0],
  distance: [320, 2600],
  how: [
    "Pull the handle down. The short arm of the lever shoves the flat link to the right. The flat link pushes the knee towards the line between the two ends of the toggle, and the two links begin to straighten.",
    "At first the punch moves a good way for each bit of knee movement. Near the end the links are almost in a line, and the punch creeps down. A small handle movement now makes a huge push, which is just what a punch needs at the moment it cuts.",
    "Try Short, then Full. Look at the knee reading. With Full the links come close to a straight line, and the punch moves the least in the last part of the swing."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame, the base, the guide, the die and the metal, the thickness of the links and all the sizes were made up. The links lie in layers, one in front of the next, so that they can pass each other. The lever is drawn swinging down and back up. The short swing was added for comparison.",

  // Frame plane XY. U top pivot, F lever pivot. Links of length LL, flat link LM, lever arm RA at OFF degrees from the handle.
  K: { U: [0, 153], F: [88, 15], LL: 130, LM: 118, RA: 39, OFF: 116, A0: 140, A1: { full: 50, short: 95 }, HL: 221 },

  // Knee and punch pin for a lever arm at angle al (degrees, from +X).
  solve: function (al) {
    var K = this.K, a = al * Math.PI / 180, U = K.U, ax = K.F[0] + K.RA * Math.cos(a), ay = K.F[1] + K.RA * Math.sin(a);
    var dx = ax - U[0], dy = ay - U[1], d = Math.sqrt(dx * dx + dy * dy), q = (K.LL * K.LL - K.LM * K.LM + d * d) / (2 * d), h = Math.sqrt(Math.max(0, K.LL * K.LL - q * q));
    var ux = dx / d, uy = dy / d, px = U[0] + q * ux, py = U[1] + q * uy, kx = px + h * uy, ky = py - h * ux;
    if (px - h * uy < kx) { kx = px - h * uy; ky = py + h * ux; }
    var py2 = ky - Math.sqrt(K.LL * K.LL - kx * kx);
    return { A: [ax, ay], k: [kx, ky], y: py2 };
  },

  link: function (c, z, mat) {
    var P = c.P, g = new c.THREE.Group();
    g.bar = P.at(P.box(1, 12, 5, mat), 0, 0, z, g);
    P.at(P.cylZ(9, 6, mat), 0, 0, z, g);
    g.eye2 = P.at(P.cylZ(9, 6, mat), 0, 0, z, g);
    return g;
  },
  place: function (g, ax, ay, bx, by) {
    var len = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
    g.position.set(ax, ay, 0); g.rotation.z = Math.atan2(by - ay, bx - ax);
    g.bar.scale.x = len; g.bar.position.x = len / 2; g.eye2.position.x = len;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, K = this.K, o = this.o = { u: 0 };
    var root = new T.Group(); root.position.set(-95, 53, 0); c.scene.add(root); o.root = root;
    var pin = c.mat("toggle", "dark");
    // fixed frame (x, y, z edges in the comments)
    P.at(P.box(45, 433, 36, c.fixed), 2.5, -28.5, -6, root);                      // back plate x -20..25, y -245..188, z -24..12
    P.at(P.box(75, 105, 36, c.fixed), 62.5, 37.5, -6, root);                      // step block x 25..100, y -15..90, z -24..12
    P.at(P.box(20, 20, 36, c.fixed), 35, 100, -6, root);                          // upper step x 25..45, y 90..110, z -24..12
    P.at(P.box(75, 230, 36, c.fixed), 62.5, -130, -6, root);                      // column x 25..100, y -245..-15, z -24..12
    P.at(P.box(340, 50, 90, c.fixed), 70, -270, 5, root);                         // base x -100..240, y -295..-245, z -40..50
    P.at(P.guideBlock({ w: 40, h: 45, d: 28, hole: 10, hz: -3.5, material: c.fixed }), 0, -147.5, 26, root);   // guide x -20..20, y -170..-125, z 12..40; punch axis z 22.5
    P.at(P.box(60, 14, 32, c.mat("die")), 0, -238, 28, root);                     // die x -30..30, y -245..-231, z 12..44
    P.at(P.cylY(14, 3.5, c.mat("die", "light")), 0, -229.25, 22.5, root);         // blank y -231..-227.5
    // punch: group at the lower pin
    o.pun = new T.Group(); root.add(o.pun);
    P.at(P.box(26, 22, 19, c.mat("punch")), 0, 0, 22.5, o.pun);                    // head z 13..32
    P.at(P.cylY(9.5, 94, c.mat("punch")), 0, -58, 22.5, o.pun);                    // rod y -11..-105 below the pin, z 13..32
    P.at(P.cylY(6.5, 15, c.mat("punch")), 0, -112.5, 22.5, o.pun);                 // tip
    P.at(P.cylZ(5, 8, pin), 0, 0, 35, o.pun);                                      // pin z 31..39
    // toggle links, in layers: lower z 32..38, upper z 38..44; flat link z 44..50
    o.lo = this.link(c, 35, c.mat("toggle")); root.add(o.lo);
    o.up = this.link(c, 41, c.mat("toggle")); root.add(o.up);
    o.fl = this.link(c, 47, c.mat("link")); root.add(o.fl);
    P.at(P.cylZ(5, 33, pin), K.U[0], K.U[1], 28.5, root);                          // top pin z 12..45
    o.kp = P.at(P.cylZ(5, 18, pin), 0, 0, 42, root);                               // knee pin z 33..51
    o.ap = P.at(P.cylZ(5, 15, pin), 0, 0, 50.5, root);                             // lever arm pin z 43..58
    // lever
    o.lev = new T.Group(); P.at(o.lev, K.F[0], K.F[1], 0, root);
    var oa = K.OFF * Math.PI / 180;
    P.at(P.cylZ(16, 7, c.mat("lever")), 0, 0, 54, o.lev);                          // hub z 50.5..57.5
    var arm = P.at(P.box(K.RA, 12, 6, c.mat("lever")), K.RA / 2 * Math.cos(oa), K.RA / 2 * Math.sin(oa), 54, o.lev); arm.rotation.z = oa;
    P.at(P.cylZ(9, 7, c.mat("lever")), K.RA * Math.cos(oa), K.RA * Math.sin(oa), 54, o.lev);
    var h = P.at(P.cylX(8, K.HL - 14, c.mat("lever")), 14 + (K.HL - 14) / 2, 0, 54, o.lev);   // handle x 14..221, z 46..62
    P.at(P.cylZ(6.5, 47, pin), 0, 0, 35.5, o.lev);                                // pivot pin z 12..59, from the step block face
    P.at(P.cylZ(9, 2.5, pin), 0, 0, 58.75, o.lev);                                 // cap z 57.5..60
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K;
    if (S.playing) o.u += S.w * dt;
    var f = (1 - Math.cos(o.u)) / 2, a1 = K.A1[S.controls.swing === "short" ? "short" : "full"];
    var al = K.A0 - (K.A0 - a1) * f, r = this.solve(al), r0 = this.solve(K.A0);
    o.lev.rotation.z = (al - K.OFF) * Math.PI / 180;
    this.place(o.fl, r.k[0], r.k[1], r.A[0], r.A[1]);
    this.place(o.up, K.U[0], K.U[1], r.k[0], r.k[1]);
    this.place(o.lo, r.k[0], r.k[1], 0, r.y);
    o.pun.position.set(0, r.y, 0);
    o.kp.position.x = r.k[0]; o.kp.position.y = r.k[1];
    o.ap.position.x = r.A[0]; o.ap.position.y = r.A[1];
    var ux = -r.k[0], uy = K.U[1] - r.k[1], lx = -r.k[0], ly = r.y - r.k[1];
    var ang = Math.acos((ux * lx + uy * ly) / (Math.sqrt(ux * ux + uy * uy) * Math.sqrt(lx * lx + ly * ly))) * 180 / Math.PI;
    S.set("p", Math.round(r0.y - r.y) + " mm");
    S.set("a", Math.round(ang) + "°");
  }
});
