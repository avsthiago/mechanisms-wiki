M507.define({
  number: 14,
  title: "Blocks and tackle",
  lede: "A rope runs back and forth between two sets of pulleys. It lets you lift a heavy weight with a small pull. In return, you have to pull in a lot more rope.",
  alt: "Two pulley blocks, one hung from a beam and one carrying a weight, joined by a rope that runs back and forth between them and down to a small winch on the ground.",
  parts: [
    { key: "upper", color: "#4FA58A", name: "Upper block", note: "Hangs from the beam and does not move." },
    { key: "lower", color: "#E8E2D0", name: "Lower block", note: "Holds the weight and goes up with it." },
    { key: "sheaves", color: "#C8873A", name: "Pulleys", note: "Wheels the rope runs over. The ones nearest the winch spin fastest." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One long rope. One end is tied to the upper block and the winch pulls the other. Watch the red mark to see how far it moves." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "100 kg, shared by all the ropes that hold up the lower block." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "Winds in the rope. It does the job of a person pulling." }
  ],
  controls: [{ id: "n", label: "Pulleys in each block", value: "4", options: [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]] }],
  readouts: [{ id: "f", label: "Pull needed" }, { id: "r", label: "Rope pulled" }, { id: "l", label: "Weight raised" }],
  views: { "3d": [530, 30, 800], front: [80, -30, 920], side: [920, -30, -20] },
  target: [80, -30, 0],
  how: [
    "Count the ropes between the two blocks. Each pulley in the lower block has one rope going up on each side. So 4 pulleys give 8 ropes, and all 8 hold the weight up together.",
    "It is really one long rope, so every part of it pulls equally hard. With 8 parts sharing 100 kg, each part carries 12.5 kg. The winch only has to hold one part. That is Brown's rule: divide the weight by twice the number of lower pulleys.",
    "There is a catch. To lift the weight 1 cm, all 8 parts must get 1 cm shorter, so 8 cm of rope has to be pulled in. Less force, more rope. Try 1 pulley, then 4, and compare."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the end of the rope hanging loose; the winch was added so it has somewhere to go. Real pulleys rub and real rope is heavy, so a real tackle needs a bit more pull than shown here.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 26, S = 18, i;
    var o = this.o = { R: R, S: S, YU: 140, YL0: -75, TRAVEL: 220, th: 0, up: [], lo: [], front: [], back: [] };
    function sheave() {
      var g = new T.Group();
      g.add(P.cylX(R, 8, c.mat("sheaves")));
      for (var k = 0; k < 3; k++) { var a = k * 2 * Math.PI / 3; P.at(P.cylX(3.2, 9, c.mat("sheaves", "dark")), 0, 15 * Math.cos(a), 15 * Math.sin(a), g); }
      var wrap = P.arc(R, 2.2, Math.PI, c.mat("rope")); wrap.rotation.y = Math.PI / 2;
      var holder = new T.Group(); holder.add(wrap);
      return { spin: g, wrap: holder };
    }
    function block(key, flip) {            // side straps, pin and cross strap; widths are set in step() to suit the number of pulleys
      var g = new T.Group(), m = c.mat(key); scene.add(g);
      var b = { g: g, cheekL: P.at(P.box(3, 2 * R + 26, 16, m), 0, 0, 0, g), cheekR: P.at(P.box(3, 2 * R + 26, 16, m), 0, 0, 0, g),   // narrow side straps, so the pulleys stay visible
        pin: P.at(P.cylX(4, 1, m), 0, 0, 0, g), strap: P.at(P.box(1, 5, 18, m), 0, flip * (R + 13), 0, g) };
      P.at(P.cylY(3, 34, m), 0, flip * (R + 30), 0, g);
      P.at(P.hook({ material: m }), 0, flip * (R + 54), 0, g);                     // closed eye, R+42 .. R+66
      return b;
    }
    o.U = block("upper", 1); o.U.g.position.y = o.YU;
    o.L = block("lower", -1);
    for (i = 0; i < 4; i++) {
      var su = sheave(); o.U.g.add(su.spin); o.U.g.add(su.wrap); o.up.push(su);
      var sl = sheave(); sl.wrap.rotation.x = Math.PI; o.L.g.add(sl.spin); o.L.g.add(sl.wrap); o.lo.push(sl);
      o.front.push(P.at(P.rod(2.2, c.mat("rope")), 0, 0, 0, scene));
      o.back.push(P.at(P.rod(2.2, c.mat("rope")), 0, 0, 0, scene));
    }
    o.becket = P.at(P.rod(2.2, c.mat("rope")), 0, 0, 0, scene);
    o.haul = P.at(P.rod(2.2, c.mat("rope")), 0, 0, 0, scene);
    o.knot = P.at(P.sphere(6, c.mat("rope", "mark")), 0, 0, 0, scene);              // a mark on the rope, to follow how far it is hauled
    o.eye = P.at(P.sphere(4.5, c.mat("rope")), 0, 0, 0, scene);                      // where the fixed end is made fast
    // winch on the ground that takes up the hauling end
    o.DX = 190; o.DY = -190; o.RD = 14;
    o.drum = new T.Group(); o.drum.position.set(o.DX, o.DY, -R); scene.add(o.drum);
    var mw = c.mat("winch");
    o.drum.add(P.cylZ(o.RD, 30, mw));
    P.at(P.cylZ(o.RD + 7, 3, mw), 0, 0, 16, o.drum); P.at(P.cylZ(o.RD + 7, 3, mw), 0, 0, -16, o.drum);
    P.at(P.box(6, 40, 4, mw), 0, 16, 26, o.drum); P.at(P.cylZ(4, 20, c.mat("winch", "dark")), 0, 34, 38, o.drum); P.at(P.cylZ(4, 12, mw), 0, 0, 22, o.drum);
    for (i = -1; i <= 1; i++) P.at(P.hoop(o.RD + 1.5, 2.2, c.mat("rope")), 0, 0, i * 6, o.drum);
    P.at(P.box(8, 60, 5, c.fixed), o.DX, o.DY - 24, -R + 21, scene); P.at(P.box(8, 60, 5, c.fixed), o.DX, o.DY - 24, -R - 21, scene);
    P.at(P.box(460, 8, 170, c.fixed), 50, -240, 0, scene);                           // the ground
    o.weight = P.at(P.sphere(30, c.mat("weight")), 0, -(R + 96), 0, o.L.g);
    P.at(P.cylY(2.5, 16, c.mat("weight")), 0, -(R + 66), 0, o.L.g);
    P.at(P.box(260, 16, 40, c.fixed), 0, o.YU + R + 70, 0, scene);      // the beam it hangs from
  },

  step: function (c, dt, S) {
    var o = this.o, N = +S.controls.n, R = o.R, sp = o.S, i;
    o.th += S.w * dt;
    var pull = o.TRAVEL * (.5 - .5 * Math.cos(o.th)), lift = pull / (2 * N), yL = o.YL0 + lift, half = N * sp / 2 + 3;
    function x(k) { return (k - (N - 1) / 2) * sp; }
    [o.U, o.L].forEach(function (b) {
      b.cheekL.position.x = -half; b.cheekR.position.x = half; b.pin.scale.y = 2 * half + 6; b.strap.scale.x = 2 * half + 3;
    });
    o.L.g.position.y = yL;
    for (i = 0; i < 4; i++) {
      var on = i < N;
      o.up[i].spin.visible = o.up[i].wrap.visible = o.lo[i].spin.visible = o.lo[i].wrap.visible = o.front[i].visible = on;
      o.back[i].visible = i < N - 1;
      if (!on) continue;
      o.up[i].spin.position.x = o.up[i].wrap.position.x = o.lo[i].spin.position.x = o.lo[i].wrap.position.x = x(i);
      o.up[i].spin.rotation.x = -2 * (i + 1) * lift / R;           // rope crosses the top from the front strand to the back one; faster the nearer the hauling end
      o.lo[i].spin.rotation.x = -(2 * i + 1) * lift / R;
      o.front[i].span(x(i), yL, R, x(i), o.YU, R);
      if (i < N - 1) o.back[i].span(x(i), o.YU, -R, x(i + 1), yL, -R);
    }
    o.becket.span(-half, o.YU - R - 6, -R, x(0), yL, -R);            // fixed end, made fast to the upper block
    o.eye.position.set(-half, o.YU - R - 6, -R);
    // hauling end: off the back of the last upper pulley and down to the top of the winch drum
    var hx = x(N - 1), ex = o.DX - 9, ey = o.DY + 12, len = Math.sqrt((ex - hx) * (ex - hx) + (ey - o.YU) * (ey - o.YU));
    o.haul.span(hx, o.YU, -R, ex, ey, -R);
    var t = Math.min(.96, (50 + pull) / len);
    o.knot.position.set(hx + (ex - hx) * t, o.YU + (ey - o.YU) * t, -R);
    o.drum.rotation.z = -pull / o.RD;

    var share = 100 / (2 * N);
    S.set("f", (share % 1 ? share.toFixed(1) : share) + " kg of 100");
    S.set("r", Math.round(pull / 10) + " cm");
    S.set("l", (lift / 10).toFixed(1) + " cm");
  }
});
