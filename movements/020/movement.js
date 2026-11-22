M507.define({
  number: 20,
  title: "Three pulleys, ropes tied to the weight",
  lede: "Three ropes are tied to the weight, and every one of them helps to lift it. The pulleys hang in a chain, so each rope pulls twice as hard as the one below it. Together they lift 7 times the pull on the winch.",
  alt: "Three pulleys hang one below another from a beam. Three ropes rise from a flat weight, each running over one pulley. The bottom rope runs down to a small winch on the ground.",
  parts: [
    { key: "top", color: "#4FA58A", name: "Upper pulley", note: "Hangs from the beam and stays put. It only turns the top rope round." },
    { key: "hanging", color: "#C8873A", name: "Hanging pulleys", note: "Each one hangs from the rope above it. They go down while the weight goes up, and the lower one goes three times as fast." },
    { key: "rope", color: "#D9B13B", name: "Ropes", note: "Three ropes, each tied to the weight. Use the control to put red marks on one of them and watch how fast it runs." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "All three ropes lift it at once." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "Winds in the bottom rope. It does the job of a hand pulling." }
  ],
  controls: [{ id: "k", label: "Red marks on", value: "0", options: [["0", "Top rope"], ["1", "Middle rope"], ["2", "Bottom rope"]] }],
  readouts: [{ id: "t", label: "Marked rope" }, { id: "r", label: "Wound in" }, { id: "l", label: "Weight up" }],
  views: { "3d": [620, 120, 900], front: [-10, 10, 1080], side: [1080, 10, 0] },
  target: [-10, 10, 0],
  how: [
    "Each rope is tied to the weight at one end. It runs up over a pulley and down again. The bottom rope goes to the winch. The other two each hold up the next pulley down.",
    "The bottom rope pulls on its pulley twice, once on each side. So the rope holding that pulley pulls twice as hard. The same happens again one pulley up. The three ropes pull 1, 2 and 4 times as hard as the winch. All three lift the weight, so it gets 7 times the winch's pull.",
    "Now watch the pulleys. As the weight rises, the hanging pulleys go down, the lower one three times as fast. The winch winds in 7 times as far as the weight rises. Mark the top rope, then the bottom one: each rope down the chain pulls half as hard but runs twice as fast."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown leaves the end of the rope loose; the winch was added to pull it. His rule for these figures doubles the power for each moving pulley, which would give 4 here. But his ropes are tied to the weight, so each one also lifts it directly. Counting the pulls in the drawing gives 7, and that is what the model shows. The weight and the sizes are made up. Real pulleys rub a little, so a real one needs a bit more pull.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o, k;
    o = this.o = {
      th: 0, H: 20, R: [24, 24, 24], X: [30, 6, -18], Y0: [170, 55, -60],   // pulley centres; each hangs below the left side of the one above
      YT0: -202, WX: 40, WR: 44, WH: 30, kg: 70,                          // weight's top face, centre x, radius, height
      GY: -250, spin: [], ropes: [] };
    var N = o.N = o.R.length, B = N - 1;                                      // B: the lower pulley, whose rope goes to the winch
    for (k = 0; k < N; k++) {
      var key = k ? "hanging" : "top", g = new T.Group();
      o.spin.push(P.at(P.sheave({ radius: o.R[k], material: c.mat(key), holes: c.mat(key, "dark") }), 0, 0, 0, g));
      g.add(P.ropeBlock({ radius: o.R[k], material: c.mat(key) }));       // straps y ±(R+13), hook ring R+42 .. R+66
      g.position.set(o.X[k], o.Y0[k], 0); scene.add(g); o.spin[k].block = g;
    }
    P.at(P.box(120, 16, 60, c.fixed), o.X[0], o.Y0[0] + o.R[0] + 74, 0, scene);   // beam, y 260 .. 276; hook top at 170+24+66 = 260
    // weight: a flat drum with an eye on top for each rope, under the right side of its pulley
    o.W = new T.Group(); scene.add(o.W);
    P.at(P.cylY(o.WR, o.WH, c.mat("weight")), o.WX, -o.WH / 2, 0, o.W);         // top face at local y 0
    for (k = 0; k < N; k++) P.at(P.hook({ radius: 6, tube: 2, material: c.mat("weight") }), o.X[k] + o.R[k], 5, 0, o.W);   // ring y -3 .. 13, sunk 3 into the top
    // ground and winch
    P.at(P.box(380, 8, 150, c.fixed), -40, o.GY - 4, 0, scene);                 // ground, top face y -250
    // winch turned side on, right under the lower pulley's left side, so the hauling rope drops straight onto the front of its drum
    o.w = P.at(P.winch({ height: 40, material: c.mat("winch"), handle: c.mat("winch", "dark"), rope: c.mat("rope") }), o.X[B] - o.R[B], o.GY + 40, 0, scene);   // foot underside on the ground; plates x -66 .. -18
    o.w.rotation.y = -Math.PI / 2;                                              // crank to the left, away from the weight
    o.w.position.z = -o.w.ropeRadius;
    for (k = 0; k < N; k++) o.ropes.push(P.at(P.ropePath({ material: c.mat("rope"), mark: c.mat("rope", "mark"), marks: 2 }), 0, 0, 0, scene));
    // reference pose, weight at the bottom: rope lengths, pulley grip points and where the marks start
    this.pose(0);
    o.L0 = o.ropes[B].length; o.ws0 = o.ropes.map(function (r) { return r.wrapS[0]; });
    o.marks = o.ropes.map(function (r, j) {
      var s1 = r.wrapS[0], s2 = s1 + o.wrapLen[j];
      return [s1 / 2, s2 + (r.length - s2) * (j === B ? .3 : .5)];
    });
  },

  // place everything for a given rise of the weight; every length follows from the ropes staying the same length
  pose: function (lift) {
    var o = this.o, y = [o.Y0[0]], yt = o.YT0 + lift, k;
    for (k = 1; k < o.N; k++) y[k] = o.Y0[k] + 2 * (y[k - 1] - o.Y0[k - 1]) - lift;   // (y[k-1] - weight) + (y[k-1] - y[k]) stays the same
    o.y = y; o.W.position.y = yt; o.wrapLen = [];
    for (k = 0; k < o.N; k++) {
      o.spin[k].block.position.y = y[k];
      var R = o.R[k], last = k === o.N - 1;
      o.wrapLen.push(Math.PI * R);
      var path = [[o.X[k] + R, yt + 11, 0], { c: [o.X[k], y[k], 0], r: R, a0: 0, a1: Math.PI },   // from the top of the weight's eye, up and over
        [o.X[k] - R, last ? o.GY + 40 : y[k + 1] + o.R[k + 1] + 63, 0]];             // down to the front of the drum, or to the top of the next pulley's ring
      o.ropes[k].set(path);
    }
  },

  step: function (c, dt, S) {
    var o = this.o, sel = +S.controls.k, k;
    o.th += S.w * dt;
    var lift = o.H * (.5 - .5 * Math.cos(o.th));
    for (k = 0; k < o.N; k++) o.ropes[k].markS = k === sel ? o.marks[k] : [];
    this.pose(lift);
    for (k = 0; k < o.N; k++) o.spin[k].rotation.z = -(o.ropes[k].wrapS[0] - o.ws0[k]) / o.R[k];   // the rope grips its pulley
    var pull = o.L0 - o.ropes[o.N - 1].length;                                          // what the bottom rope has lost went onto the drum
    o.w.drum.rotation.z = -pull / o.w.ropeRadius;                                // front of the drum turns down
    S.set("t", o.kg / (Math.pow(2, o.N) - 1) * Math.pow(2, o.N - 1 - sel) + " kg");   // each rope pulls twice as hard as the one below it
    S.set("r", (pull / 10).toFixed(1) + " cm");
    S.set("l", (lift / 10).toFixed(1) + " cm");
  }
});
