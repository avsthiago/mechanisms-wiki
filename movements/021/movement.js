M507.define({
  number: 21,
  title: "Two pulleys, ropes tied to the weight",
  lede: "Two ropes are tied to the weight, and both help to lift it. The lower pulley hangs from the top rope, so that rope pulls twice as hard as the winch. Together they lift 3 times the pull on the winch.",
  alt: "Two pulleys hang one below the other from a beam. Two ropes rise from a flat weight, each running over one pulley. The lower rope runs down to a small winch on the ground.",
  parts: [
    { key: "top", color: "#4FA58A", name: "Upper pulley", note: "Hangs from the beam and stays put. It only turns the top rope round." },
    { key: "hanging", color: "#C8873A", name: "Hanging pulley", note: "Hangs from the top rope. It goes down while the weight goes up, just as fast." },
    { key: "rope", color: "#D9B13B", name: "Ropes", note: "Two ropes, each tied to the weight. Use the control to put red marks on one of them and watch how fast it runs." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "Both ropes lift it at once." },
    { key: "winch", color: "#5E7387", name: "Winch", note: "Winds in the lower rope. It does the job of a hand pulling." }
  ],
  controls: [{ id: "k", label: "Red marks on", value: "0", options: [["0", "Top rope"], ["1", "Lower rope"]] }],
  readouts: [{ id: "t", label: "Marked rope" }, { id: "r", label: "Wound in" }, { id: "l", label: "Weight up" }],
  views: { "3d": [460, 135, 675], front: [0, 65, 820], side: [820, 65, 0] },
  target: [0, 65, 0],
  how: [
    "Each rope is tied to the weight at one end. It runs up over a pulley and down again. The lower rope goes to the winch. The top rope holds up the hanging pulley.",
    "The lower rope pulls on its pulley twice, once on each side. So the top rope, which holds that pulley, pulls twice as hard as the winch. Both ropes lift the weight: one share from the lower rope and two from the top one. That makes 3 times the winch's pull.",
    "Now watch the hanging pulley. As the weight rises, the pulley comes down to meet it just as fast. The winch winds in 3 times as far as the weight rises. Mark the top rope, then the lower one: the lower rope pulls half as hard but runs twice as fast."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown leaves the end of the rope loose; the winch was added to pull it. His rule for these figures doubles the power for each moving pulley, which would give 2 here. But his ropes are tied to the weight, so each one also lifts it directly. Counting the pulls in the drawing gives 3, and that is what the model shows. The weight and the sizes are made up. Real pulleys rub a little, so a real one needs a bit more pull.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o, k;
    o = this.o = {
      th: 0, H: 30, R: [30, 24], X: [20, -10], Y0: [150, 35],   // pulley centres; each hangs below the left side of the one above
      YT0: -74, WX: 32, WR: 32, WH: 30, kg: 30,                           // weight's top face, centre x, radius, height
      GY: -125, spin: [], ropes: [] };
    var N = o.N = o.R.length, B = N - 1;                                      // B: the bottom pulley, whose rope goes to the winch
    for (k = 0; k < N; k++) {
      var key = k ? "hanging" : "top", g = new T.Group();
      o.spin.push(P.at(P.sheave({ radius: o.R[k], material: c.mat(key), holes: c.mat(key, "dark") }), 0, 0, 0, g));
      g.add(P.ropeBlock({ radius: o.R[k], material: c.mat(key) }));       // straps y ±(R+13), hook ring R+42 .. R+66
      g.position.set(o.X[k], o.Y0[k], 0); scene.add(g); o.spin[k].block = g;
    }
    P.at(P.box(120, 16, 60, c.fixed), o.X[0], o.Y0[0] + o.R[0] + 74, 0, scene);   // beam, y 246 .. 262; hook top at 150+30+66 = 246
    // weight: a flat drum with an eye on top for each rope, under the right side of its pulley
    o.W = new T.Group(); scene.add(o.W);
    P.at(P.cylY(o.WR, o.WH, c.mat("weight")), o.WX, -o.WH / 2, 0, o.W);         // top face at local y 0
    for (k = 0; k < N; k++) P.at(P.hook({ radius: 6, tube: 2, material: c.mat("weight") }), o.X[k] + o.R[k], 5, 0, o.W);   // ring y -3 .. 13, sunk 3 into the top
    // ground and winch
    P.at(P.box(300, 8, 130, c.fixed), -10, o.GY - 4, 0, scene);                 // ground, top face y -125
    // winch turned side on, right under the bottom pulley's left side, so the hauling rope drops straight onto the front of its drum
    o.w = P.at(P.winch({ height: 40, material: c.mat("winch"), handle: c.mat("winch", "dark"), rope: c.mat("rope") }), o.X[B] - o.R[B], o.GY + 40, 0, scene);   // foot underside on the ground; plates x -58 .. -10
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
