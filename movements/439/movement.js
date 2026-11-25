M507.define({
  number: 439,
  title: "Self-emptying bucket",
  lede: "A bucket and a heavy weight hang on the two ends of a cord over a pulley. Water falling into the bucket makes it heavier, so it sinks. At the bottom a valve opens and the water runs out, and the weight pulls the bucket up again. One steady stream of water gives an up-and-down motion.",
  alt: "A pulley on a post with a cord over it. A wooden bucket hangs on the right under a trough that pours water into it. A heavy weight hangs on the left. A short valve rod sticks out under the bucket, above the ground.",
  parts: [
    { key: "pulley", color: "#5E7387", name: "Pulley", note: "A wheel on a post that the cord runs over. It turns one way as the bucket sinks and back as it rises." },
    { key: "cord", color: "#D9B13B", name: "Cord", note: "Joins the bucket to the weight. When one side goes down, the other goes up." },
    { key: "bucket", color: "#C8873A", name: "Bucket", note: "Fills from the trough. Its weight changes as the water comes in and goes out, and that is what makes it move." },
    { key: "weight", color: "#8E7AA8", name: "Counterweight", note: "Heavier than the empty bucket, lighter than the full one. It wins when the bucket is empty and loses when it is full." },
    { key: "valve", color: "#C2503F", name: "Valve rod", note: "A short rod under the bucket. When it hits the ground it is pushed up and opens the hole, so the water runs out. Watch it." }
  ],
  controls: [{ type: "range", id: "flow", label: "Water poured in", min: 1, max: 5, step: 1, value: 2, unit: "",
    presets: [[1, "A trickle"], [2, "Steady"], [5, "A flood"]] }],
  speed: false,
  readouts: [{ id: "w", label: "Water" }, { id: "v", label: "Valve" }, { id: "n", label: "Trips" }],
  views: { "3d": [282, 13, 541], front: [30, -125, 680], side: [660, -125, 40] },
  target: [30, -125, 0],
  distance: [260, 1600],
  how: [
    "Water pours from the trough into the bucket. As the bucket gets heavier it starts to sink, and the weight on the other side of the pulley is pulled up.",
    "When the rod under the bucket hits the ground, it is pushed up and opens a hole in the bottom. The water runs out. Now the bucket is lighter than the weight, so the weight sinks and the bucket is lifted back up to the trough. The valve closes as it leaves the ground.",
    "Try a trickle: the bucket takes a long time to fill, so it waits at the top. Try a flood: it fills so fast on the way up that it turns round before it reaches the top."
  ],
  note: "This model is rebuilt from Brown's drawing. The post behind the pulley, the ground and the trough are made up so the machine stands up. The weights, the size of the hole and the speeds are chosen so the cycle works. A foot ring under the bucket lets the water run out below it. The motion is worked out from the weights, with some drag from the air and the pulley.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { H: 160, d: 0, v: 0, w: 0, n: 0, was: false, G: -290, R: 40, yA0: -50, parts: [], next: 0, acc: 0 };
    var G = o.G, R = o.R;
    var wm = new T.MeshLambertMaterial({ color: new T.Color(c.spot) }); o.wm = wm;
    // pulley on a post
    o.pul = new T.Group(); scene.add(o.pul);
    o.pul.add(P.sheave({ radius: R, width: 12, material: c.mat("pulley"), holes: c.mat("pulley", "dark") }));
    P.at(P.cylZ(8, 14, c.mat("pulley", "light")), 0, 0, 0, o.pul);                     // hub, z -7 .. 7
    P.at(P.cylZ(5, 2, c.mat("pulley")), 0, 0, -8, scene);                                // axle, z -9 .. -7
    P.at(P.box(14, 52 - G, 10, c.fixed), 0, (52 + G) / 2, -14, scene);                  // post x ±7, y G .. 52, z -19 .. -9
    P.at(P.box(300, 10, 80, c.fixed), 20, G - 5, 0, scene);                             // ground x -130 .. 170, top y G
    var wrap = P.arc(R, 1.5, Math.PI, c.mat("cord")); scene.add(wrap);
    o.cr = P.at(P.rod(1.5, c.mat("cord")), 0, 0, 0, scene);
    o.cl = P.at(P.rod(1.5, c.mat("cord")), 0, 0, 0, scene);
    // bucket, origin at the top of the bail
    var B = o.B = new T.Group(); scene.add(B);
    P.at(new T.Mesh(new T.CylinderGeometry(30, 26, 56, 40, 1, true), c.mat("bucket")), 0, -46, 0, B);   // rim y -18, bottom y -74
    P.at(P.cylY(26, 2, c.mat("bucket")), 0, -73, 0, B);
    [-30, -62].forEach(function (y) { var h = P.hoop(30 - 4 * (-18 - y) / 56 + .6, 1.1, c.mat("bucket", "dark")); h.rotation.x = Math.PI / 2; P.at(h, 0, y, 0, B); });
    var foot = P.hoop(22, 3, c.mat("bucket", "dark")); foot.rotation.x = Math.PI / 2; P.at(foot, 0, -77, 0, B);   // foot ring y -80 .. -74
    var bail = P.arc(30, 1.4, Math.PI, c.mat("cord")); bail.scale.y = 0.6; P.at(bail, 0, -18, 0, B);
    o.water = P.at(P.cylY(1, 1, wm), 0, -72, 0, B);
    o.stem = P.at(P.cylY(2.5, 1, c.mat("valve")), 40, 0, 0, scene);
    // counterweight, origin at the top of its ring
    var W = o.W = new T.Group(); scene.add(W);
    P.at(P.hook({ radius: 5, tube: 1.8, material: c.mat("weight") }), 0, -6.8, 0, W);
    P.at(P.cylY(22, 44, c.mat("weight")), 0, -35, 0, W);                                 // y -13 .. -57
    // trough above the bucket (made up) and its stream
    var tr = P.box(100, 6, 16, c.fixed); tr.rotation.z = 0.3; P.at(tr, 98, -19, 12, scene);
    o.stream = P.at(P.rod(1, wm), 0, 0, 0, scene);
    var gp = new T.SphereGeometry(1.5, 8, 6);
    for (i = 0; i < 90; i++) { var m = new T.Mesh(gp, wm); m.visible = false; scene.add(m); o.parts.push({ m: m, on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }); }
  },

  step: function (c, dt, S) {
    var o = this.o, q = +S.controls.flow, H = o.H, G = o.G, R = o.R, i, open;
    var m0 = 1, mw = 1.2, Mc = 1.6, g = 300, damp = 1.5, inr = 0.07, leak = 16;
    if (S.playing && dt > 0) {
      var n = Math.ceil(dt / (1 / 120)), h = dt / n, k;
      for (k = 0; k < n; k++) {
        open = (H - o.d) < 5;
        if (open && !o.was) o.n++;
        o.was = open;
        o.w += (inr * q - (open ? leak * o.w : 0)) * h; o.w = Math.max(0, Math.min(1, o.w));
        var m = m0 + mw * o.w, a = ((m - Mc) * g - damp * o.v) / (m + Mc);
        o.v += a * h; o.d += o.v * h;
        if (o.d < 0) { o.d = 0; if (o.v < 0) o.v = 0; }
        if (o.d > H) { o.d = H; if (o.v > 0) o.v = -o.v * 0.15; if (Math.abs(o.v) < 3) o.v = 0; }
      }
    }
    open = (H - o.d) < 5;
    var yA = o.yA0 - o.d, yH = -225 + o.d, bottom = yA - 74;
    o.B.position.set(R, yA, 0); o.W.position.set(-R, yH, 0);
    o.pul.rotation.z = -o.d / R;
    o.cr.span(R, 0, 0, R, yA, 0); o.cl.span(-R, 0, 0, -R, yH, 0);
    var wh = Math.max(0.01, 50 * o.w); o.water.scale.set(25.8, wh, 25.8); o.water.position.y = -71.5 + wh / 2;
    var tip = Math.max(bottom - 14, G + 0.6), sl = Math.max(0.5, bottom - tip);
    o.stem.scale.set(1, sl, 1); o.stem.position.set(R, bottom - sl / 2, 0);
    var surf = yA - 72 + wh, top = -38;
    o.stream.span(R + 10, top, 12, R + 10, surf, 12);
    var rr = 0.8 + 0.25 * q; o.stream.scale.x = rr; o.stream.scale.z = rr;
    if (S.playing && dt > 0) {
      if (open) { o.acc += 70 * dt; }
      while (o.acc >= 1) {
        o.acc -= 1;
        var p = o.parts[o.next]; o.next = (o.next + 1) % o.parts.length;
        var ang = Math.random() * 6.283;
        p.x = R + 21 * Math.cos(ang); p.z = 21 * Math.sin(ang); p.y = bottom - 7;
        p.vx = Math.cos(ang) * (20 + Math.random() * 25); p.vz = Math.sin(ang) * (20 + Math.random() * 25); p.vy = 0;
        p.on = true; p.m.visible = true;
      }
      for (i = 0; i < o.parts.length; i++) {
        var pp = o.parts[i]; if (!pp.on) continue;
        pp.vy -= 330 * dt; pp.x += pp.vx * dt; pp.y += pp.vy * dt; pp.z += pp.vz * dt;
        if (pp.y < G + 1) { pp.on = false; pp.m.visible = false; } else pp.m.position.set(pp.x, pp.y, pp.z);
      }
    }
    S.set("w", Math.round(o.w * 100) + " %");
    S.set("v", open ? "open" : "shut");
    S.set("n", String(o.n));
  }
});
