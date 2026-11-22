M507.define({
  number: 158,
  title: "Treadle and disc",
  lede: "A foot board, called a treadle, is pressed down and let up again. A rod joins it to a pin on a heavy disc, and the pin drags the disc round and round. So a foot that only goes up and down can keep a wheel turning, as on an old sewing machine or a potter's wheel.",
  alt: "A big round disc on a shaft, held by a post behind it. A pin near the rim of the disc carries a thin rod that slopes down to a long board. The board is hinged to a block at the right and its free end sticks out to the left.",
  parts: [
    { key: "treadle", color: "#5E7387", name: "Treadle", note: "A long board hinged at the right end. The foot presses on the free end at the left, so the board swings up and down." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "A thin bar from the treadle to the pin on the disc. It slopes one way, then the other, as the disc turns." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "The pin on the face of the disc. It goes round in a circle. Watch it." },
    { key: "disc", color: "#C8873A", name: "Disc", note: "A heavy round plate on a shaft. The dark stripe shows how far it has turned. Its weight keeps it moving past the two moments when the rod cannot turn it." }
  ],
  controls: [{ type: "range", id: "r", label: "Pin distance from the middle", min: 30, max: 106, step: 2, value: 45,
    presets: [[30, "Near"], [45, "Medium"], [75, "Far"], [106, "Farthest"]] }],
  readouts: [{ id: "t", label: "Treadle" }, { id: "s", label: "Swing" }, { id: "n", label: "Disc" }],
  views: { "3d": [330, 60, 820], front: [-20, -60, 900], side: [900, -60, 0] },
  target: [-20, -60, 0],
  how: [
    "The pin goes round in a circle. The rod pulls the end of the treadle up and pushes it down, so the board rocks on its hinge. One turn of the disc makes one down stroke and one up stroke.",
    "At the top and bottom of each stroke the rod points straight at the middle of the disc. Then pushing along the rod cannot turn the disc, so the disc's own weight carries it past. This is why the disc is heavy.",
    "Try Near, then Medium, then Far. A pin close to the middle makes the treadle swing only a little. A pin far out makes it swing a lot. Watch the swing reading."
  ],
  note: "This model is rebuilt from Brown's drawing. In the model the speed control turns the disc and the treadle follows it, which gives the same motion as a foot driving the treadle. A real foot would need the disc's weight to pass the two dead spots. The post, the shaft, the base, the hinge block, the pins and all the sizes were made up.",

  K: { PX: 157, PY: -202, S: 273, SL: 387, L: 186, TH0: 270 * Math.PI / 180 },

  // treadle angle for pin position (px, py), choosing the solution nearest the previous angle
  tre: function (px, py, prev) {
    var K = this.K, dx = px - K.PX, dy = py - K.PY, d = Math.hypot(dx, dy), b = Math.atan2(dy, dx);
    var g = Math.acos(Math.max(-1, Math.min(1, (K.S * K.S + d * d - K.L * K.L) / (2 * K.S * d))));
    var a1 = b + g, a2 = b - g;
    function w(x) { while (x - prev > Math.PI) x -= 2 * Math.PI; while (x - prev < -Math.PI) x += 2 * Math.PI; return x; }
    a1 = w(a1); a2 = w(a2);
    return Math.abs(a1 - prev) < Math.abs(a2 - prev) ? a1 : a2;
  },
  swing: function (R) {
    var K = this.K, prev = 177 * Math.PI / 180, lo = 9, hi = -9;
    for (var i = 0; i <= 720; i++) {
      var th = K.TH0 + i * Math.PI / 360;
      prev = this.tre(R * Math.cos(th), R * Math.sin(th), prev);
      var t = prev; lo = Math.min(lo, t); hi = Math.max(hi, t);
    }
    return (hi - lo) * 180 / Math.PI;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { a: 0 };
    o.a0 = this.tre(45 * Math.cos(K.TH0), 45 * Math.sin(K.TH0), 177 * Math.PI / 180);
    // base x -110..195, y -252..-240, z -50..40
    P.at(P.box(305, 12, 90, c.fixed), 42.5, -246, -5, scene);
    // post: foot x -55..55, y -240..-210, z -46..-14; upright x -35..35, y -240..0, z -40..-20; round top r 35, z -41..-19
    P.at(P.box(110, 30, 32, c.fixed), 0, -225, -30, scene);
    P.at(P.box(70, 240, 20, c.fixed), 0, -120, -30, scene);
    P.at(P.cylZ(35, 22, c.fixed), 0, 0, -30, scene);
    // hinge block: x 127..187, y -240..-165, z -2..11 (behind the treadle, which starts at z 12)
    P.at(P.box(60, 75, 13, c.fixed), 157, -202.5, 4.5, scene);
    P.at(P.cylZ(7, 36, c.mat("treadle", "dark")), K.PX, K.PY, 29, scene);  // hinge pin z 11..47
    P.at(P.cylZ(9, 3, c.mat("treadle", "dark")), K.PX, K.PY, 48.5, scene);                 // cap z 47..50
    // disc: z -6..8, hub z -8..10, shaft z -19..9 (starts on the post face z -19)
    o.disc = new T.Group(); scene.add(o.disc);
    P.at(P.cylZ(127, 14, c.mat("disc")), 0, 0, 1, o.disc);
    P.at(P.cylZ(22, 18, c.mat("disc")), 0, 0, 1, o.disc);
    P.at(P.cylZ(9, 28, c.mat("disc", "dark")), 0, 0, -5, o.disc);
    o.stripe = P.at(P.box(1, 8, 1, c.mat("disc", "dark")), 0, 0, 8.7, o.disc);             // z 8.2..9.2, lifted off the face
    o.pin = P.at(P.cylZ(6, 41, c.mat("pin")), 0, 0, 27.5, o.disc);                         // z 7..48
    o.cap = P.at(P.cylZ(9, 3, c.mat("pin")), 0, 0, 48.5, o.disc);                          // z 47..50
    // rod: group at the crank pin, +X toward the treadle; bar z 34..42, eyes z 33.7..42.3
    o.rod = new T.Group(); scene.add(o.rod);
    P.at(P.box(K.L, 14, 8, c.mat("rod")), K.L / 2, 0, 38, o.rod);
    P.at(P.cylZ(10, 8.6, c.mat("rod")), 0, 0, 38, o.rod);
    P.at(P.cylZ(10, 8.6, c.mat("rod")), K.L, 0, 38, o.rod);
    P.at(P.cylZ(6, 34, c.mat("rod")), K.L, 0, 31, o.rod);  // foot pin z 14..48
    P.at(P.cylZ(9, 3, c.mat("rod")), K.L, 0, 48.5, o.rod);
    // treadle: group at the hinge, +X toward the free end; board z 12..32, y +-6
    o.tre = new T.Group(); o.tre.position.set(K.PX, K.PY, 0); scene.add(o.tre);
    P.at(P.box(K.SL, 12, 20, c.mat("treadle")), K.SL / 2, 0, 22, o.tre);
    o.tre.rotation.z = o.a0;
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, R = +(S.controls.r || 45);
    o.a += S.w * dt;
    var th = K.TH0 + o.a, px = R * Math.cos(th), py = R * Math.sin(th);
    o.disc.rotation.z = th;
    o.pin.position.x = o.cap.position.x = R;
    o.stripe.scale.x = R; o.stripe.position.x = R / 2;
    o.ta = this.tre(px, py, o.ta === undefined ? o.a0 : o.ta);
    var fx = K.PX + K.S * Math.cos(o.ta), fy = K.PY + K.S * Math.sin(o.ta);
    o.tre.rotation.z = o.ta;
    o.rod.position.set(px, py, 0);
    o.rod.rotation.z = Math.atan2(fy - py, fx - px);
    var t = (o.ta - o.a0) * 180 / Math.PI;
    S.set("t", (t < -0.05 ? "−" : t > 0.05 ? "+" : "") + Math.abs(t).toFixed(1) + "°");
    S.set("s", this.swing(R).toFixed(0) + "°");
    S.set("n", (o.a / (2 * Math.PI)).toFixed(1) + " turns");
  }
});
