M507.define({
  number: 460,
  title: "Fairbairn's bailing scoop",
  lede: "A hollow arm dips its open end into a pit of water. A rod from a rocking beam lifts the arm, and the water runs back along it and pours out at the pivot. It raises water a short way, from a pit into a higher pool.",
  alt: "A rocking beam on a stone post at the right. A rod hangs from a notch in the beam to a curved hollow arm. The arm is pivoted on the left bank and its open end dips into a pit of water.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam", note: "Rocks up and down on its post. Its lower edge has three notches for the rod." },
    { key: "rod", color: "#D9B13B", name: "Rod", note: "Joins the beam to the scoop. Its top end sits in one of the notches." },
    { key: "scoop", color: "#C8873A", name: "Scoop arm", note: "A hollow arm on a pivot. Its open end dips into the water and fills. Watch the red mark at its tip." }
  ],
  controls: [{ id: "notch", label: "Rod in notch", value: "2", options: [["1", "Near"], ["2", "Middle"], ["3", "Far"]] }],
  readouts: [{ id: "fill", label: "Scoop" }, { id: "out", label: "Poured out" }],
  views: { "3d": [120, 190, 1080], front: [20, 150, 950], side: [950, 150, 60] },
  target: [20, 130, 0],
  how: [
    "The beam rocks up and down. The rod pulls the scoop arm up and lets it down. When the arm is down, its open end is under water and fills.",
    "When the arm lifts, it slopes the other way. The water runs back along it to the pivot and pours out into the high pool. Water only pours out when the arm tilts far enough.",
    "Try the rod in the Near notch, then the Far notch. A far notch makes the arm swing more, so it pours more."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the pit, the high pool, the stone post and the beam's slope are made up. Brown shows a rocking beam of an engine, so a steady rhythm rocks it here. The arm is drawn hollow so the water inside can be seen as it runs along.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { phi: 0, a: -0.35, V: 0, out: 0, S: [-170, 130], L: 240, u: 140, v: 130, Lp: 120, B: [180, 260], WY: 60, ds: { "1": 140, "2": 160, "3": 180 } };
    o.rq = Math.hypot(o.u, o.v); o.dl = Math.atan2(o.v, o.u);
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .55, depthWrite: false });
    // earth: one profile extruded z -45..45 with the pit cut in
    P.at(P.prism([[-420, -60], [-420, 60], [-195, 60], [-195, 100], [-135, 100], [-75, -20], [95, -20], [135, 205], [420, 205], [420, -60]], -45, 45, c.fixed), 0, 0, 0, scene);
    P.at(P.prism([[-113.5, 60], [107.5, 60], [93.5, -18.5], [-73.5, -18.5]], -44, 44, wat), 0, 0, 0, scene);   // pit water, kept 1.5 inside the walls
    P.at(P.box(225, 36, 88, wat), -307.5, 78, 0, scene);                                // pool x -420..-195, y 60..96
    P.at(P.box(30, 15, 30, c.fixed), -170, 107.5, 0, scene);                           // pedestal x -185..-155, y 100..115
    P.at(P.box(30, 41, 30, c.fixed), 180, 225.5, 0, scene);                            // beam post x 165..195, y 205..246
    // beam: local x runs from the pivot towards the rod end; local y is down
    o.beam = P.at(new T.Group(), o.B[0], o.B[1], 0, scene);
    var pts = [[-50, -22], [200, -22], [200, 22]];
    [180, 160, 140].forEach(function (d) { pts.push([d + 7, 22], [d, 14], [d - 7, 22]); });
    pts.push([-50, 22]);
    o.beam.add(P.prism(pts, -8, 8, c.mat("beam")));
    o.beam.add(P.cylZ(14, 24, c.mat("beam")));
    // scoop arm: hollow, open to the front. Local x along the arm.
    o.arm = P.at(new T.Group(), o.S[0], o.S[1], 0, scene);
    var am = c.mat("scoop");
    o.arm.add(P.prism([[0, -16], [240, -4], [240, 18], [160, 40], [80, 38], [0, 18]], -24, -20, am));   // back plate
    var fl = P.box(240, 3, 48, am); fl.position.set(120, -12, 0); fl.rotation.z = Math.atan2(12, 240); o.arm.add(fl);
    var r1 = P.box(85, 3, 48, am); r1.position.set(200, 31, 0); r1.rotation.z = Math.atan2(-22, 80) ; o.arm.add(r1);
    var r2 = P.box(80, 3, 48, am); r2.position.set(40, 29, 0); r2.rotation.z = Math.atan2(20, 80); o.arm.add(r2);
    o.arm.add(P.prism([[110, 38], [170, 38], [o.u, o.v]], -4, 4, am));                                   // lug up to the rod pin
    P.at(P.cylZ(6, 56, am), 0, 0, 0, o.arm);                                                               // pivot pin through the hub, z -28..28
    P.at(P.sphere(5, c.mat("scoop", "mark")), 240, 7, 0, o.arm);
    o.dots = P.waterDots(48, { radius: 2.6, color: c.spot }); scene.add(o.dots);
    o.pinQ = P.at(P.cylZ(4, 12, c.mat("rod")), 0, 0, 10, scene);
    o.pinT = P.at(P.cylZ(4, 8, c.mat("rod")), 0, 0, 12, scene);
    o.rod = P.at(P.rod(3.5, c.mat("rod")), 0, 0, 0, scene);
    o.pool = P.dropPool({ count: 60, radius: 2.1, color: c.spot, opacity: .85, parent: scene });
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, d2r = Math.PI / 180, sim = S.playing ? dt : 0, i;
    o.phi += S.w * dt * .7;
    var beta = (33 + 25 * Math.cos(o.phi)) * d2r, d = o.ds[S.controls.notch] || 160;
    o.beam.rotation.z = Math.PI + beta;
    var e = [-Math.cos(beta), -Math.sin(beta)], f = [Math.sin(beta), -Math.cos(beta)];
    var Tx = o.B[0] + d * e[0] + 14 * f[0], Ty = o.B[1] + d * e[1] + 14 * f[1];
    var dd = Math.hypot(Tx - o.S[0], Ty - o.S[1]);
    if (dd < o.rq + o.Lp && dd > Math.abs(o.rq - o.Lp)) {
      var q = P.meet(o.S[0], o.S[1], o.rq, Tx, Ty, o.Lp, 1);
      o.a = Math.atan2(q[1] - o.S[1], q[0] - o.S[0]) - o.dl;
    }
    var a = o.a, ca = Math.cos(a), sa = Math.sin(a);
    o.arm.rotation.z = a;
    function W(u, v) { return [o.S[0] + u * ca - v * sa, o.S[1] + u * sa + v * ca]; }
    var Q = W(o.u, o.v), tip = W(240, 7);
    o.pinQ.position.set(Q[0], Q[1], 10); o.pinT.position.set(Tx, Ty, 12);
    o.rod.span(Tx, Ty, 12, Q[0], Q[1], 12);
    // water in the arm
    var flat = -3 * d2r;
    if (tip[1] < o.WY) o.V += (1 - o.V) * Math.min(1, sim * 3);
    else if (a < flat) { var lk = Math.min(o.V, sim * .3); o.V -= lk; if (lk > 0 && sim > 0 && Math.random() < .5) o.pool.emit(tip[0], tip[1], (Math.random() - .5) * 20, 20, -10, 0); }
    if (a > flat && o.V > 0) {
      var dr = Math.min(o.V, sim * (.3 + 2.5 * Math.sin(a - flat)));
      o.V -= dr; o.out += dr * 16;
      if (sim > 0) for (var k = 0; k < 2; k++) if (Math.random() < dr * 60) o.pool.emit(o.S[0] - 18, o.S[1] - 4, (Math.random() - .5) * 30, -50 - Math.random() * 20, 15, 0);
    }
    var n = Math.ceil(o.V * 48 - .01);
    for (i = 0; i < 48; i++) {
      if (i < n) {
        var uu = a < flat ? 236 - Math.floor(i / 2) * 9 : 6 + Math.floor(i / 2) * 9, vv = (-16 + .05 * uu) + 6 + (i % 2) * 6, w = W(uu, vv);
        o.dots.put(i, w[0], w[1], ((i % 3) - 1) * 12, 1);
      } else o.dots.put(i, 0, 0, 0, 0);
    }
    o.dots.flush();
    o.pool.step(sim, 450, function (p) { return p.y < 96 && p.x < -195 || p.y < 60 && p.x > -115; });
    S.set("fill", Math.round(o.V * 100) + " %");
    S.set("out", Math.round(o.out) + " L");
  }
});
