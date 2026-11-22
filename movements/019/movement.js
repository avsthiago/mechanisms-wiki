M507.define({
  number: 19,
  title: "Pulleys above and on the weight",
  lede: "Three ropes each loop under a small pulley on the weight, so each rope lifts it twice. The pulleys above hang in a chain, and each rope pulls three times as hard as the one below it. Together they lift 26 times the pull on the winch.",
  alt: "Three pulleys of shrinking size hang one below another from a beam. Under them a flat weight carries three small pulleys. Each rope runs from a pulley's frame down under a small pulley, up over the pulley above and down again. The bottom rope goes to a small winch.",
  parts: [
    { key: "top", color: "#4FA58A", name: "Upper pulley", note: "Hangs from the beam and stays put. The top rope is tied to its frame." },
    { key: "hanging", color: "#C8873A", name: "Hanging pulleys", note: "Each one hangs from the rope above it. They go down while the weight goes up, and the lower one goes four times as fast." },
    { key: "small", color: "#E8E2D0", name: "Pulleys on the weight", note: "Three small pulleys fixed to the weight. Each rope runs under one, so each rope lifts the weight twice." },
    { key: "rope", color: "#D9B13B", name: "Ropes", note: "Three ropes, each tied to the frame of a pulley above. Use the control to put red marks on one of them and watch how fast it runs." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "All three ropes lift it, each one twice." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "Winds in the bottom rope. It does the job of a hand pulling." }
  ],
  controls: [{ id: "k", label: "Red marks on", value: "0", options: [["0", "Top rope"], ["1", "Middle rope"], ["2", "Bottom rope"]] }],
  readouts: [{ id: "t", label: "Marked rope" }, { id: "r", label: "Wound in" }, { id: "l", label: "Weight up" }],
  views: { "3d": [640, 110, 940], front: [0, -8, 1100], side: [1100, -8, 0] },
  target: [0, -8, 0],
  how: [
    "Each rope is tied to the frame of a pulley above. It runs down under a small pulley on the weight, back up over the pulley above, and down again. The bottom rope goes to the winch. The other two each hold up the next pulley down.",
    "The bottom rope pulls on its pulley three times: once on each side of the wheel and once where it is tied. So the rope holding that pulley pulls 3 times as hard as the winch. One pulley up, the same thing makes it 9 times. Each rope lifts the weight twice, so the weight gets 2 + 6 + 18 = 26 times the winch's pull.",
    "The price is a lot of rope. The winch winds in 26 times as far as the weight rises, so the weight hardly moves. The lower pulley races down four times as fast as the middle one. Mark the top rope, then the bottom one: each rope down the chain pulls a third as hard but runs three times as fast."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown leaves the end of the rope loose; the winch was added to pull it. His rule for these figures doubles the power for each moving pulley. That does not fit this drawing, because the small pulleys on the weight make each rope lift it twice. Counting the pulls in the drawing gives 26, and that is what the model shows. The weight and the sizes are made up. Real pulleys rub a little, so a real one needs a bit more pull.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o, k;
    o = this.o = {
      th: 0, H: 6, R: [36, 28, 22], X: [40, 4, -24], Y0: [150, 25, -85],   // pulley centres; each hangs below the left side of the one above
      r: [18, 14, 11], YS: 26,                                              // small pulleys: radius half the big one's, centres 26 above the weight's top
      YT0: -234, WX: 36, WR: 56, WH: 30, kg: 260,                         // weight's top face, centre x, radius, height
      GY: -280, spin: [], small: [], ropes: [] };
    var N = o.N = o.R.length, B = N - 1;                                      // B: the lower pulley, whose rope goes to the winch
    for (k = 0; k < N; k++) {
      var key = k ? "hanging" : "top", m = c.mat(key), R = o.R[k], g = new T.Group();
      o.spin.push(P.at(P.sheave({ radius: R, material: m, holes: c.mat(key, "dark") }), 0, 0, 0, g));
      g.add(P.ropeBlock({ radius: R, material: m }));                         // straps y ±(R+13), z ±(4.5 .. 7.5); hook ring R+42 .. R+66
      P.at(P.box(18, 5, 15, m), 0, -(R + 13), 0, g);                          // lower cross strap over the straps' ends, y -(R+15.5) .. -(R+10.5)
      P.at(P.hook({ radius: 6, tube: 2, material: m }), 0, -(R + 21.5), 0, g); // ring for the tied rope end, top -(R+13.5) inside the strap; rope tied at -(R+27.5)
      g.position.set(o.X[k], o.Y0[k], 0); scene.add(g); o.spin[k].block = g;
    }
    P.at(P.box(120, 16, 60, c.fixed), o.X[0], o.Y0[0] + o.R[0] + 74, 0, scene);   // beam, y 252 .. 268; hook top at 150+36+66 = 252
    // weight: a flat drum carrying a small pulley in a fork under the right half of each pulley above
    o.W = new T.Group(); scene.add(o.W);
    P.at(P.cylY(o.WR, o.WH, c.mat("weight")), o.WX, -o.WH / 2, 0, o.W);         // top face at local y 0; x -20 .. 92
    for (k = 0; k < N; k++) {
      var sx = o.X[k] + o.r[k], ms = c.mat("small");
      o.small.push(P.at(P.sheave({ radius: o.r[k], material: ms, holes: c.mat("small", "dark") }), sx, o.YS, 0, o.W));   // z ±4
      [-1, 1].forEach(function (s) { P.at(P.box(8, o.YS + 6, 3, ms), sx, (o.YS + 6) / 2, s * 6, o.W); });   // fork, y 0 .. 32 (bottom on the weight's top), z ±(4.5 .. 7.5)
      P.at(P.cylZ(3, 15, ms), sx, o.YS, 0, o.W);                              // pin, ends at the fork's outer faces z ±7.5
    }
    // ground and winch
    P.at(P.box(420, 8, 170, c.fixed), -10, o.GY - 4, 0, scene);                 // ground, top face y -280
    // winch turned side on, right under the lower pulley's left side, so the hauling rope drops straight onto the front of its drum
    o.w = P.at(P.winch({ length: 20, height: 40, material: c.mat("winch"), handle: c.mat("winch", "dark"), rope: c.mat("rope") }), o.X[B] - o.R[B], o.GY + 40, 0, scene);   // foot underside on the ground; plates x -65 .. -27
    o.w.rotation.y = -Math.PI / 2;                                              // crank to the left, away from the weight
    o.w.position.z = -o.w.ropeRadius;
    for (k = 0; k < N; k++) o.ropes.push(P.at(P.ropePath({ material: c.mat("rope"), mark: c.mat("rope", "mark"), marks: 3 }), 0, 0, 0, scene));
    // reference pose, weight at the bottom: rope lengths, pulley grip points and where the marks start
    this.pose(0);
    o.L0 = o.ropes[B].length; o.ws0 = o.ropes.map(function (r) { return r.wrapS.slice(); });
    o.marks = o.ropes.map(function (rp, j) {
      var a = rp.wrapS[0], b = a + Math.PI * o.r[j], d = rp.wrapS[1] + Math.PI * o.R[j];   // straight parts: 0 .. a, b .. wrapS[1], d .. end
      return [a / 2, (b + rp.wrapS[1]) / 2, d + (rp.length - d) * (j === B ? .3 : .5)];
    });
  },

  // place everything for a given rise of the weight; every length follows from the ropes staying the same length
  pose: function (lift) {
    var o = this.o, y = [o.Y0[0]], yt = o.YT0 + lift, k;
    for (k = 1; k < o.N; k++) y[k] = o.Y0[k] + 3 * (y[k - 1] - o.Y0[k - 1]) - 2 * lift;   // 2 (y[k-1] - weight) + (y[k-1] - y[k]) stays the same
    o.W.position.y = yt;
    for (k = 0; k < o.N; k++) {
      o.spin[k].block.position.y = y[k];
      var R = o.R[k], r = o.r[k], x = o.X[k], last = k === o.N - 1;
      o.ropes[k].set([
        [x, y[k] - R - 27.5, 0],                                                 // tied to the ring under the pulley's frame
        { c: [x + r, yt + o.YS, 0], r: r, a0: Math.PI, a1: 2 * Math.PI },         // under the small pulley on the weight
        { c: [x, y[k], 0], r: R, a0: 0, a1: Math.PI },                            // up and over the pulley (its right side is x + 2r)
        [x - R, last ? o.GY + 40 : y[k + 1] + o.R[k + 1] + 63, 0]]);             // down to the front of the drum, or to the top of the next pulley's ring
    }
  },

  step: function (c, dt, S) {
    var o = this.o, sel = +S.controls.k, k;
    o.th += S.w * dt;
    var lift = o.H * (.5 - .5 * Math.cos(o.th));
    for (k = 0; k < o.N; k++) o.ropes[k].markS = k === sel ? o.marks[k] : [];
    this.pose(lift);
    for (k = 0; k < o.N; k++) {                                                  // the ropes grip their pulleys
      o.small[k].rotation.z = -(o.ropes[k].wrapS[0] - o.ws0[k][0]) / o.r[k];
      o.spin[k].rotation.z = -(o.ropes[k].wrapS[1] - o.ws0[k][1]) / o.R[k];
    }
    var pull = o.L0 - o.ropes[o.N - 1].length;                                    // what the bottom rope has lost went onto the drum
    o.w.drum.rotation.z = -pull / o.w.ropeRadius;                                // front of the drum turns down
    S.set("t", o.kg / 26 * Math.pow(3, o.N - 1 - sel) + " kg");                  // each rope pulls three times as hard as the one below it
    S.set("r", (pull / 10).toFixed(1) + " cm");
    S.set("l", (lift / 10).toFixed(1) + " cm");
  }
});
