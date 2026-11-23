M507.define({
  number: 382,
  title: "Adjustable mirror stand",
  lede: "A mirror sits on a thin stem inside a pillar. It can be raised or lowered, turned to the left or right, and tipped up or down. Two screws hold each setting.",
  alt: "A round pillar on a stepped base with a thin stem standing in its top. A square mirror in a frame is hinged to the top of the stem.",
  parts: [
    { key: "pillar", color: "#5E7387", name: "Pillar", note: "The heavy base and the hollow top, called the socket. It has a screw on its side. The screw has a red knob." },
    { key: "stem", color: "#C8873A", name: "Stem", note: "A thin rod that slides up and down in the socket. It also spins there, so the mirror can face left or right." },
    { key: "mirror", color: "#4FA58A", name: "Mirror", note: "The glass in its frame. A hinge at the top of the stem lets it tip up or down." },
    { key: "screw", color: "#C2503F", name: "Set screws", note: "Two screws with red knobs. Watch them. One is in the socket and one is on the hinge. A screw backs off to let a part move, then tightens to hold it." }
  ],
  controls: [{ id: "adj", label: "Adjustment", value: "all", options: [["all", "All three"], ["height", "Height"], ["turn", "Turn"], ["tilt", "Tilt"]] }],
  readouts: [{ id: "h", label: "Height" }, { id: "t", label: "Turn" }, { id: "k", label: "Tilt" }],
  views: { "3d": [196, 237, 925], front: [0, 230, 800], side: [800, 230, 0] },
  target: [-12, 209, 8],
  distance: [150, 2000],
  how: [
    "The screw in the socket backs off. The stem can now slide up and down, or spin round. Then the screw is tightened and the stem is held fast. The screw on the hinge does the same job for the tilt of the mirror.",
    "The set screw works by pressing its end against the stem. The press makes the rub too strong for the weight of the mirror to overcome, so it stays where it is put. Loosen the screw and the stem moves freely.",
    "Pick Height, Turn or Tilt and watch which screw backs off. Then try All three to see them one after the other."
  ],
  note: "This model is rebuilt from Brown's drawing. The shape of the pillar, the size of the mirror and the way the hinge is held were made up. Brown says the same stand is used for camera stands. In the model the stem is the only part that spins in the socket, and the movements go back and forth by themselves.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { th: 0, SY: 185, yaw0: -.45, tilt0: .3, h0: 90 };
    // pillar: lathe profile (radius, height), hollow socket at the top
    var pr = [[0, 0], [88, 0], [88, 6], [70, 10], [70, 18], [58, 22], [34, 30], [24, 46], [24, 62], [34, 82], [38, 100], [34, 120], [24, 140], [17, 156], [26, 160], [26, 170], [17, 174], [17, 185], [5.5, 185], [5.5, 100], [0, 100]];
    var g = new T.LatheGeometry(pr.map(function (p) { return new T.Vector2(p[0], p[1]); }), 48);
    P.at(new T.Mesh(g, c.mat("pillar")), 0, 0, 0, scene);
    var ms = c.mat("screw");
    // set screw in the socket, on the right side, wall at x=17
    o.s1 = new T.Group(); o.s1.position.set(17, 150, 0); scene.add(o.s1);
    P.at(P.cylX(3.5, 24, ms), -2, 0, 0, o.s1);
    P.at(P.cylX(9, 6, ms), 13, 0, 0, o.s1);
    P.at(P.box(.8, 2.4, 14, c.mat("screw", "dark")), 16.5, 0, 0, o.s1);
    // stem group: spins about the socket axis, slides up and down
    o.stem = new T.Group(); scene.add(o.stem);
    P.at(P.cylY(4, 240, c.mat("stem")), 0, -80, 0, o.stem);              // y -200..40 from the stem top reference; hidden length in the socket
    o.head = P.at(P.box(16, 12, 14, c.mat("stem")), 0, 6, 0, o.stem);     // x -8..8, y 0..12
    P.at(P.cylY(4, 12, c.mat("stem")), 0, 6, 0, o.stem);
    // mirror group: hinged on a pin along X at y = 12 above the stem top
    o.m = new T.Group(); o.m.position.y = 12; o.stem.add(o.m);
    var W = 190, H = 226, F = 14;
    function rr(w, h, r) { var s = new T.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; }
    var fr = rr(W, H, 28), hole = rr(W - 30, H - 30, 16); fr.holes.push(new T.Path(hole.getPoints()));
    var fg = new T.ExtrudeGeometry(fr, { depth: F, bevelEnabled: false }); fg.translate(0, 0, -F / 2);
    var cz = 30;                                                            // frame centre 30 in front of the pin
    P.at(new T.Mesh(fg, c.mat("mirror")), 0, 0, cz, o.m);                  // z 23..37
    var gl = new T.ExtrudeGeometry(rr(W - 30.6, H - 30.6, 16), { depth: 3, bevelEnabled: false }); gl.translate(0, 0, -1.5);
    P.at(new T.Mesh(gl, new T.MeshLambertMaterial({ color: 0xBFD9E2, transparent: true, opacity: .35, depthWrite: false, side: T.DoubleSide })), 0, 0, cz, o.m);         // glass z 28.5..31.5, inside the frame
    // two bars from the frame back to the pin, either side of the head
    [-1, 1].forEach(function (s) { P.at(P.box(5, 26, 17, c.mat("mirror")), 12.5 * s, 0, 14.5, o.m); });   // x 10..15, z 6..23
    // hinge pin along X with a knob on the left
    P.at(P.cylX(3.5, 40, ms), 0, 0, 0, o.m);                                // x -20..20
    o.s2 = new T.Group(); o.s2.position.set(-20, 12, 0); o.stem.add(o.s2);
    P.at(P.cylX(9, 6, ms), -3, 0, 0, o.s2);                                 // x -26..-20 when tight
    P.at(P.box(.8, 2.4, 14, c.mat("screw", "dark")), -6.5, 0, 0, o.s2);
    o.s2.position.y = 12;
  },

  step: function (c, dt, S) {
    var o = this.o, mode = S.controls.adj;
    o.th += S.w * dt * .25;
    var p = (o.th / (2 * Math.PI)) % 1, seg = 0, q = p;
    if (mode === "all") { seg = Math.floor(p * 3); q = p * 3 - seg; }
    else seg = { height: 0, turn: 1, tilt: 2 }[mode];
    function sm(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    var loose = sm(0, .1, q) - sm(.9, 1, q), v = Math.sin(2 * Math.PI * Math.max(0, Math.min(1, (q - .1) / .8)));
    var h = o.h0 + (seg === 0 ? 34 * v : 0), yaw = o.yaw0 + (seg === 1 ? .8 * v : 0), tilt = o.tilt0 + (seg === 2 ? .22 * v : 0);
    o.stem.position.y = o.SY + h; o.stem.rotation.y = yaw; o.m.rotation.x = -tilt;
    o.s1.position.x = 17 + 10 * (seg < 2 ? loose : 0); o.s1.rotation.x = -loose * (seg < 2 ? 6 : 0);
    o.s2.position.x = -20 - 10 * (seg === 2 ? loose : 0);
    o.s2.rotation.x = loose * (seg === 2 ? 6 : 0);
    S.set("h", Math.round(h * 3 / 10) + " cm");
    S.set("t", Math.round(yaw * 57.3) + "°");
    S.set("k", Math.round(tilt * 57.3) + "°");
  }
});
