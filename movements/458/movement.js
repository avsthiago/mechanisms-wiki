M507.define({
  number: 458,
  title: "Pulley and two buckets",
  lede: "A rope runs over a wheel with a bucket on each end. When one bucket goes down, the other comes up. It is a common way to raise water from a well.",
  alt: "A small hut over a well. A pulley hangs from the roof. A rope runs over it with a bucket on each end. One bucket is high and the other hangs deep in the well.",
  parts: [
    { key: "pulley", color: "#5E7387", name: "Pulley", note: "The wheel the rope runs over. It turns whichever way the rope moves. Watch the red mark on it." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One rope with a bucket tied to each end. The red marks show how it moves." },
    { key: "bucket", color: "#4FA58A", name: "Buckets", note: "They fill with water at the bottom of the well and are emptied at the top." }
  ],
  controls: [{ id: "load", label: "Water in the bucket", value: "full", options: [["half", "Half full"], ["full", "Full"]] }],
  readouts: [{ id: "pull", label: "Pull needed" }, { id: "lift", label: "Water lifted" }],
  views: { "3d": [490, 263, 1051], front: [0, -5, 1130], side: [1100, -5, 60] },
  target: [0, -5, 0],
  how: [
    "The rope is one length. When one bucket goes down, the other has to come up by the same distance. The pulley just turns the rope round.",
    "The full bucket is heavier than the empty one, so it wants to fall. To raise it, you pull down on the empty bucket. You only pull the difference between the two weights.",
    "Try Half full, then Full. Watch how the Pull needed reading changes."
  ],
  note: "This model is rebuilt from Brown's drawing. The hut, the shaft, the water in the bottom of the well and the weights are made up. A steady rhythm stands in for the person who pulls. The step on the post in Brown's picture is shown as a small shelf.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 40, i;
    var o = this.o = { phi: 0.5, R: R, YP: 220, fill: [0, 1], lifted: 0, a0: null, WY: -195 };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .6, depthWrite: false });
    // earth: two blocks y -336..0, shaft between x -90..90; floor x -90..90 y -336..-326
    P.at(P.box(330, 336, 120, c.fixed), -255, -168, 0, scene);        // x -420..-90
    P.at(P.box(330, 336, 120, c.fixed), 255, -168, 0, scene);         // x 90..420
    P.at(P.box(180, 10, 120, c.fixed), 0, -331, 0, scene);            // y -336..-326
    P.at(P.box(180, 131, 118, wat), 0, -260.5, 0, scene);             // water y -326..-195
    // posts on the earth, x -114..-100 and 92..106, y 0..250; z -15..15
    P.at(P.box(14, 250, 30, c.fixed), -107, 125, 0, scene);
    P.at(P.box(14, 250, 30, c.fixed), 99, 125, 0, scene);
    P.at(P.box(55, 12, 30, c.fixed), -135.5, 80, 0, scene);           // shelf x -163..-108, y 74..86, touches the post at x -114
    // roof: two boards meeting at the peak (0, 320)
    var rl = P.box(200, 8, 70, c.fixed); rl.rotation.z = 0.46; P.at(rl, -88, 273, 0, scene);
    var rr = P.box(200, 8, 70, c.fixed); rr.rotation.z = -0.46; P.at(rr, 88, 273, 0, scene);
    // hanger straps and pin; pulley at y 220, width z -8..8
    P.at(P.box(6, 94, 3, c.mat("pulley")), 0, 267, 10.75, scene);       // y 220..314, z 8..11
    P.at(P.box(6, 94, 3, c.mat("pulley")), 0, 267, -10.75, scene);
    P.at(P.cylZ(4, 22, c.mat("pulley")), 0, o.YP, 0, scene);
    o.wheel = P.at(new T.Group(), 0, o.YP, 0, scene);
    o.wheel.add(P.sheave({ radius: R, width: 16, material: c.mat("pulley"), holes: c.mat("pulley", "dark") }));
    P.at(P.box(26, 3, 1.5, c.mat("pulley", "mark")), 14, 0, 8.75, o.wheel);
    P.at(P.arc(R, 2, Math.PI, c.mat("rope")), 0, o.YP, 0, scene);
    o.rl = P.at(P.rod(2, c.mat("rope")), 0, 0, 0, scene); o.rr = P.at(P.rod(2, c.mat("rope")), 0, 0, 0, scene);
    o.ml = P.at(P.sphere(4, c.mat("rope", "mark")), 0, 0, 0, scene); o.mr = P.at(P.sphere(4, c.mat("rope", "mark")), 0, 0, 0, scene);
    o.b = [0, 1].map(function () {
      var g = new T.Group(); scene.add(g);                              // origin at the top of the handle
      P.at(new T.Mesh(new T.CylinderGeometry(28, 24, 38, 24, 1, true), c.mat("bucket")), 0, -29, 0, g);   // y -48..-10
      P.at(P.cylY(24, 2, c.mat("bucket")), 0, -47, 0, g);
      P.at(P.arc(28, 1.8, Math.PI, c.mat("bucket", "dark")), 0, -10, 0, g);
      g.w = P.at(new T.Mesh(new T.CylinderGeometry(26.5, 24.3, 34, 24), wat), 0, -46, 0, g); g.w.userData.live = true;
      return g;
    });
    o.pool = P.dropPool({ count: 40, radius: 2, color: c.spot, opacity: .85, parent: scene });
  },

  step: function (c, dt, S) {
    var o = this.o, sim = S.playing ? dt : 0, R = o.R, lim = S.controls.load === "half" ? .5 : 1, i;
    o.phi += S.w * dt * .5;
    var yL = -27.5 + 147.5 * Math.cos(o.phi), yR = -55 - yL;          // tops of the handles: always add up to the same, so the rope is one length
    var ys = [yL, yR], xs = [-40, 40];
    for (i = 0; i < 2; i++) {
      var g = o.b[i], y = ys[i], f = o.fill[i];
      if (y < o.WY + 24) f += (lim - f) * Math.min(1, sim * 3);
      else if (y > 90 && f > .01) {
        if (sim > 0 && Math.random() < sim * 30 * f) o.pool.emit(xs[i] + (i ? 28 : -28), y - 10, (Math.random() - .5) * 30, i ? 40 : -40, 20, 0);
        var f0 = f; f = Math.max(0, f - sim * .7); if (f0 > .5 && f <= .5) o.lifted += 0;
        if (f0 > .02 && f <= .02) o.lifted += 16 * lim;
      }
      if (f > 1) f = 1; o.fill[i] = f;
      g.position.set(xs[i], y, 0);
      g.w.visible = f > .02; g.w.scale.set(1, Math.max(.01, f / 1), 1); g.w.position.y = -46 + 17 * f * 1;
    }
    o.rl.span(-40, o.YP, 0, -40, yL, 0); o.rr.span(40, o.YP, 0, 40, yR, 0);
    o.ml.position.set(-40, (o.YP + yL) / 2 + 20, 0); o.mr.position.set(40, (o.YP + yR) / 2, 0);
    o.wheel.rotation.z = (yR + 115) / R;
    var wl = 4 + 16 * o.fill[0] * 1, wr = 4 + 16 * o.fill[1];
    var vL = Math.sin(o.phi) * -1;                                       // left bucket moves up when yL grows: d(yL)/dphi = -sin
    var up = yL > yR ? 0 : 0;
    var rising = (-Math.sin(o.phi) * -1 > 0) ? 1 : 0;                   // right bucket rises when sin(phi) > 0
    var wUp = rising ? wr : wl, wDown = rising ? wl : wr;
    o.pool.step(sim, 450, function (p) { return p.y < 0; });
    S.set("pull", Math.max(0, Math.round(wUp - wDown)) + " kg");
    S.set("lift", Math.round(o.lifted) + " kg");
  }
});
