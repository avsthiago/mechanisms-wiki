/* Elevation, drawing units inside one group scaled by .5 (x right, y up, ground at y = 0, z towards the viewer). */
M507.define({
  number: 491,
  title: "Capstan",
  lede: "People push on long bars to turn a tall drum, and a rope wound round it is hauled in. A catch at the bottom lets the drum turn one way only. So the rope cannot pull the drum back when the pushing stops.",
  alt: "A capstan seen from the side. A tall waisted drum has a rope wound round its narrow middle, with the loose end running off to the right. A bar passes through the head at the top. At the bottom a small pivoted catch rests on the sloping teeth of a ring on the ground.",
  parts: [
    { key: "bars", color: "#5E7387", name: "Bar", note: "A long bar pushed through a hole in the head. People walk round pushing its ends." },
    { key: "drum", color: "#C8873A", name: "Drum", note: "The waisted barrel the rope is wound on. It turns on the spot. Watch the red stripe go round." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "Wound round the narrow middle of the drum. The red mark on the loose end shows it being hauled in." },
    { key: "ring", color: "#8E7AA8", name: "Ratchet ring", note: "A ring on the ground with sloping teeth. It never moves." },
    { key: "pawl", color: "#4FA58A", name: "Holding pawl", note: "A small lever, called a holding pawl, fixed to the bottom of the drum. Its tip slides up each slope and drops behind the tooth. It then stops the drum turning back." }
  ],
  controls: [{ id: "dir", label: "Push the bars", value: "fwd", options: [["fwd", "Forwards"], ["back", "Backwards"]] }],
  readouts: [{ id: "turns", label: "Drum" }, { id: "clicks", label: "Clicks" }],
  views: { "3d": [170, 178, 365], front: [0, 100, 430], side: [430, 100, 10] },
  target: [0, 85, 0],
  distance: [120, 1600],
  how: [
    "People push the bars round. The drum turns, and the rope winds on at its narrow middle. The loose end of the rope slides towards the drum, a little further with every turn.",
    "At the bottom, the pawl is fixed to the drum and turns with it. Its tip rides up each sloping tooth of the ring, then drops down behind it with a click. A rope under a heavy load pulls the drum backwards, but the tip is stopped by the steep side of the tooth.",
    "Try Backwards. The drum can only turn back as far as the nearest steep tooth side, and then it stops. Try Forwards again and the clicks start up."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows one bar. The number of teeth, the floor, the size of the head and the way the pawl is hinged were made up. The rope is shown only on the narrow middle and a short loose end. The pawl drops to the bottom of each tooth at once, with no spring.",

  build: function (c) {
    var T = c.THREE, P = c.P, S = .5, i;
    var o = this.o = { b: 0, clicks: 0, k: null, xn: 34 };
    var root = new T.Group(); root.scale.set(S, S, S); c.scene.add(root);
    var mb = c.mat("bars"), md = c.mat("drum"), mr = c.mat("rope");
    function rw(y) { return Math.min(86, 50 + 36 * Math.pow((y - 180) / 105, 2)); }
    o.rw = rw;
    P.at(P.box(640, 4, 300, c.fixed), 0, -2.5, 0, root);                    // ground: y -4.5 .. -.5
    o.ring = P.faceRatchet({ teeth: 12, rIn: 70, rOut: 105, depth: 14, base: 10, reverse: true, material: c.mat("ring") });
    o.ring.rotation.x = -Math.PI / 2; root.add(o.ring);                      // y 0 .. 24
    P.at(P.cylY(69, 26.5, c.fixed), 0, 12.75, 0, root);                      // plinth y -.5 .. 26
    o.cap = new T.Group(); root.add(o.cap);
    var pts = [[86, 26.8], [86, 72]], y;
    for (y = 82; y <= 282; y += 10) pts.push([rw(y), y]);
    pts.push([85, 282], [85, 317]);
    for (i = 1; i <= 8; i++) { var u = i / 8; pts.push([40 + 45 * Math.sqrt(1 - u * u), 317 + 25 * u]); }
    var body = P.lathePulley({ points: pts.map(function (p) { return [p[0], p[1]]; }), material: md, mark: c.mat("drum", "mark") });
    body.rotation.x = -Math.PI / 2; o.cap.add(body);
    P.at(P.cylX(5, 565, mb), 0, 307, 0, o.cap);                              // the bar, through the head
    for (i = 0; i < 8; i++) {
      if (i === 2 || i === 6) continue;                                      // the bar fills these holes
      var a = i * Math.PI / 4, hole = P.box(10, 10, 1.2, c.mat("bars", "dark"));
      hole.position.set(85 * Math.sin(a), 307, 85 * Math.cos(a)); hole.rotation.y = a; o.cap.add(hole);
    }
    // pawl: bracket on the collar, lever hinged to it
    P.at(P.box(28, 26, 8, md), 0, 60, 84, o.cap);                            // z 80 .. 88
    P.at(P.cylZ(4, 22, c.mat("pawl")), 0, 60, 89, o.cap);                    // z 78 .. 100
    o.pw = new T.Group(); P.at(o.pw, 0, 60, 92, o.cap);                      // lever z 89 .. 95
    o.L = 55;
    P.at(P.box(o.L, 7, 6, c.mat("pawl")), o.L / 2, 0, 0, o.pw);
    P.at(P.sphere(4, c.mat("pawl")), o.L, 0, 0, o.pw);
    // rope
    for (i = 0; i < 6; i++) { var yy = 157 + 12 * i, hp = P.hoop(rw(yy) + 4.5, 4.5, mr); hp.rotation.x = Math.PI / 2; P.at(hp, 0, yy, 0, root); }
    o.tz = rw(157) + 4.5; o.TL = 300;
    o.tail = P.rod(4.5, mr).span(0, 157, o.tz, o.TL, 157, o.tz); root.add(o.tail);
    o.mk = P.at(P.sphere(7, c.mat("rope", "mark")), 0, 157, o.tz, root);
  },

  step: function (c, dt, S) {
    var o = this.o, M = Math.PI, p = 2 * M / 12, i;
    var db = S.w * dt * (S.controls.dir === "back" ? -1 : 1);
    function psi(b, xn) { return -M / 2 + Math.atan(xn / 92) - b; }
    var prev = psi(o.b, o.xn);
    o.b += db;
    var cur = psi(o.b, o.xn);
    if (cur > prev) {                                                        // going backwards: the steep side stops the tip
      var lock = (Math.floor(prev / p + 1e-9) + 1) * p - 1e-4;
      if (cur > lock) { cur = Math.max(prev, lock); o.b = -M / 2 + Math.atan(o.xn / 92) - cur; }
    }
    var phi = 0;
    for (i = 0; i < 5; i++) {
      var ps = psi(o.b, o.xn), yn = o.ring.heightAt(ps) + 4;
      phi = Math.asin(Math.max(-1, Math.min(1, (yn - 60) / o.L))); o.xn = o.L * Math.cos(phi);
    }
    o.pw.rotation.z = phi;
    o.cap.rotation.y = -o.b;
    var k = Math.floor(psi(o.b, o.xn) / p);
    if (o.k !== null && k < o.k) o.clicks += o.k - k;
    o.k = k;
    var s = (((200 - 52 * o.b) % o.TL) + o.TL) % o.TL;
    o.mk.position.x = s;
    S.set("turns", (o.b / (2 * M)).toFixed(2) + " turns");
    S.set("clicks", String(o.clicks));
  }
});
