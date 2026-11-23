M507.define({
  number: 22,
  title: "Pulleys each hung from its own rope",
  lede: "Several pulleys hang one above the other, each in its own loop of rope. Every pulley halves the pull, so three of them let you lift eight times what you pull. In return, the weight rises very slowly.",
  alt: "A beam with a fixed pulley at its right end. Below it, three pulleys hang in a slanting line, each in a loop of rope tied to the beam and to the pulley above. A weight hangs from the lowest pulley, and the rope's free end runs from the fixed pulley down to a winch with a crank.",
  parts: [
    { key: "frame", color: "#4FA58A", name: "Upper pulley", note: "Fixed under the beam. It only turns the rope round, so you can pull down instead of up." },
    { key: "pulleys", color: "#C8873A", name: "Moving pulleys", note: "Each one hangs in its own loop of rope. Each rises half as fast as the one above it." },
    { key: "rope", color: "#D9B13B", name: "Ropes", note: "Each loop is tied to the beam at one end and to the pulley above at the other. Watch the red mark to see how far the free end is pulled." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "100 kg, hung from the lowest pulley. It rises slowest of all." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "A drum turned by a crank. It winds in the free end of the rope, so you can see how much rope is pulled." }
  ],
  controls: [{ id: "n", label: "Moving pulleys", value: "3", options: [["2", "2"], ["3", "3"], ["4", "4"]] }],
  readouts: [{ id: "r", label: "Rope pulled" }, { id: "l", label: "Weight raised" }],
  views: { "3d": [520, 55, 835], front: [20, -10, 1000], side: [1000, -10, 0] },
  target: [20, -10, 0],
  how: [
    "Look at the lowest pulley. It hangs in a loop of rope. One end is tied to the beam and the other to the pulley above. So two ropes hold it up, and each carries half the weight.",
    "The pulley above does the same. It only has to hold that half, and its own two ropes share it again. With 3 pulleys, 100 kg becomes 50, then 25, then 12.5 kg at your hand. That is 2 × 2 × 2 = 8 times less.",
    "Now watch the speeds. Each pulley rises half as fast as the one above it. Pull in 8 cm of rope and the pulleys rise 4 cm, 2 cm and 1 cm. Try 2 pulleys, then 4, and compare how far the weight moves."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows 3 moving pulleys; the control also lets you try 2 or 4. Brown leaves the end of the rope hanging; here it runs straight down to a winch. The winch, the frames round the pulleys, the rings and the weight are made up. Real pulleys rub on their pins and have weight of their own, so a real pull is a little more.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, R = 18, i;
    var o = this.o = { R: R, YC: 240, YF: 190, XF: 60, YTOP: 70, GAP: 78, TRAVEL: 140, th: 0, mov: [], left: [], right: [], ties: [] };
    P.at(P.box(200, 16, 40, c.fixed), 10, o.YC + 8, 0, scene);              // beam, y 240 .. 256
    // fixed pulley: straps above the pin, cross strap, rod up to the beam
    var F = o.F = new T.Group(); F.position.set(o.XF, o.YF, 0); scene.add(F);
    var mf = c.mat("frame");
    o.fs = P.at(P.sheave({ radius: R, width: 8, material: mf, holes: c.mat("frame", "dark") }), 0, 0, 0, F);   // faces z ±4
    [-1, 1].forEach(function (s) { P.at(P.box(8, R + 14, 3, mf), 0, (R + 2) / 2, s * 6, F); });   // straps y -6 .. R+8, z ±(4.5 .. 7.5)
    P.at(P.cylZ(3, 15, mf), 0, 0, 0, F);                                       // pin, ends at the straps' outer faces
    P.at(P.box(10, 5, 15, mf), 0, R + 10.5, 0, F);                             // cross strap, y R+8 .. R+13 (216 .. 221)
    P.at(P.cylY(3, o.YC - o.YF - R - 13, mf), 0, (R + 13 + o.YC - o.YF) / 2, 0, F);   // rod, 221 .. 240 (beam's underside)
    var wf = P.arc(R, 2.2, Math.PI, c.mat("rope")); F.add(wf);                 // rope over the top
    // moving pulleys: straps below the pin, cross strap, ring underneath for the rope from below
    for (i = 0; i < 4; i++) {
      var g = new T.Group(), mp = c.mat("pulleys"); scene.add(g);
      var sh = P.at(P.sheave({ radius: R, width: 8, material: mp, holes: c.mat("pulleys", "dark") }), 0, 0, 0, g);
      [-1, 1].forEach(function (s) { P.at(P.box(8, R + 14, 3, mp), 0, -(R + 2) / 2, s * 6, g); });   // straps y 6 .. -R-8
      P.at(P.cylZ(3, 15, mp), 0, 0, 0, g);
      P.at(P.box(10, 5, 15, mp), 0, -(R + 10.5), 0, g);                        // cross strap, y -R-8 .. -R-13
      P.at(P.hook({ radius: 5, tube: 1.8, material: mp }), 0, -(R + 18), 0, g); // ring, rod middle at -R-23; its top sits in the cross strap
      var w = P.arc(R, 2.2, Math.PI, c.mat("rope")); w.rotation.z = Math.PI; g.add(w);   // rope under the bottom
      o.mov.push({ g: g, sh: sh });
      o.left.push(P.at(P.rod(2.2, c.mat("rope")), 0, 0, 0, scene));
      o.right.push(P.at(P.rod(2.2, c.mat("rope")), 0, 0, 0, scene));
      var t = new T.Group(); scene.add(t);                                     // tie under the beam
      P.at(P.box(12, 3, 8, mf), 0, o.YC - 1.5, 0, t);                         // plate, y 237 .. 240
      P.at(P.hook({ radius: 6, tube: 2, material: mf }), 0, o.YC - 9, 0, t);  // ring, top edge 239 inside the plate; rope end at 225
      o.ties.push(t);
    }
    o.weight = new T.Group(); scene.add(o.weight);
    P.at(P.cylY(2.5, 12, c.mat("weight")), 0, -(R + 29), 0, o.weight);       // stem, -R-23 .. -R-35
    P.at(P.box(44, 34, 34, c.mat("weight")), 0, -(R + 52), 0, o.weight);     // block, top at -R-35
    // free end, straight down from the fixed pulley to the winch drum (rope leaves the drum's right side at x = XF + R)
    o.haul = P.at(P.rod(2.2, c.mat("rope")), 0, 0, 0, scene);
    o.winch = P.winch({ height: 60, material: c.mat("winch"), handle: c.mat("winch", "dark"), rope: c.mat("rope") });
    o.YW = -200;
    P.at(o.winch, o.XF + R - o.winch.ropeRadius, o.YW, 0, scene);              // foot y -260 .. -256
    P.at(P.box(260, 8, 120, c.fixed), 10, -264, 0, scene);                     // ground, y -268 .. -260, top meets the winch foot
    o.mark = P.at(P.sphere(5, c.mat("rope", "mark")), 0, 0, 0, scene);
  },

  step: function (c, dt, S) {
    var o = this.o, N = +S.controls.n, R = o.R, i;
    o.th += S.w * dt;
    var pull = o.TRAVEL * (.5 - .5 * Math.cos(o.th)), ys = [], xs = [];
    for (i = 0; i < N; i++) {                                     // 0 is the lowest; each rises half as much as the one above
      var rise = pull / Math.pow(2, N - i);
      xs[i] = o.XF - (N + 1 - i) * R;                             // right rope of each lands under the centre of the next
      ys[i] = o.YTOP - (N - 1 - i) * o.GAP + rise;
      o.mov[i].rise = rise;
    }
    for (i = 0; i < 4; i++) {
      var on = i < N, m = o.mov[i];
      m.g.visible = o.left[i].visible = o.right[i].visible = o.ties[i].visible = on;
      if (!on) continue;
      m.g.position.set(xs[i], ys[i], 0);
      m.sh.rotation.z = m.rise / R;                               // rolls up the tied rope
      o.ties[i].position.x = xs[i] - R;
      o.left[i].span(xs[i] - R, o.YC - 15, 0, xs[i] - R, ys[i], 0);
      if (i < N - 1) o.right[i].span(xs[i] + R, ys[i], 0, xs[i + 1], ys[i + 1] - R - 23, 0);
      else o.right[i].span(xs[i] + R, ys[i], 0, o.XF - R, o.YF, 0);
    }
    o.weight.position.set(xs[0], ys[0], 0);
    o.fs.rotation.z = -pull / R;
    var hx = o.XF + R;
    o.haul.span(hx, o.YF, 0, hx, o.YW, 0);
    o.winch.drum.rotation.z = -pull / o.winch.ropeRadius;
    o.mark.position.set(hx, 120 - pull, 0);

    S.set("r", Math.round(pull / 10) + " cm");
    S.set("l", (pull / Math.pow(2, N) / 10).toFixed(1) + " cm");
  }
});
