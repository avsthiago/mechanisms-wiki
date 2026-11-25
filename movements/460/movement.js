M507.define({
  number: 460,
  title: "Fairbairn's bailing scoop",
  lede: "A long hollow scoop is hinged on the low bank, with a deep bucket at its far end in a pit of water. A rocking beam on the high bank lifts it with a rod. The water runs back along the scoop and pours out at the hinge, into a channel a little higher than the pit.",
  alt: "A pit of water between two banks. On the high bank at the right, a beam rocks on a post, with a row of notches under its left end. A rod hangs from one notch to the side of a long scoop. The scoop is hinged on the low bank at the left, and its deep V-shaped end dips into the pit.",
  parts: [
    { key: "beam", color: "#5E7387", name: "Beam", note: "Rocks up and down on its post, driven by an engine. Under its left end is a row of notches for the rod." },
    { key: "rod", color: "#D9B13B", name: "Rod", note: "Joins the beam to the scoop. Its top end sits in one of the beam's notches." },
    { key: "scoop", color: "#C8873A", name: "Scoop", note: "A long hollow trough, hinged at the low bank. Its far end is a deep bucket that fills in the pit. Watch the red mark on the bucket." }
  ],
  controls: [{ id: "notch", label: "Rod in notch", value: "2", options: [["1", "Near"], ["2", "Middle"], ["3", "Far"]] }],
  readouts: [{ id: "fill", label: "Scoop" }, { id: "out", label: "Poured out" }],
  views: { "3d": [372, 267, 798], front: [0, 80, 900], side: [900, 80, 0] },
  target: [0, 80, 0],
  how: [
    "The beam rocks up and down. When its left end is low, the bucket at the end of the scoop sits deep in the pit and fills.",
    "As the beam rises, the rod lifts the scoop about its hinge. Once the scoop slopes down towards the hinge, the water runs back along it and pours out into the channel on the left. That channel is higher than the pit.",
    "Try the rod in the Near notch, then the Far notch. Near the post the beam moves the rod only a little, so the scoop barely tips and pours a trickle. The far notch lifts it high and pours much more."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the beam's swing, the channel and the supports are made up. Brown shows the beam of an engine, so a steady rhythm rocks it here. The scoop is left open at the front so the water inside can be seen.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    // S: scoop hinge. B: beam pivot. Q: rod pin on the scoop, in the scoop's own frame. th0: the beam as drawn, left arm 14.7 deg below level.
    var o = this.o = { phi: 0, a: 0, V: 1, out: 0, S: [-165, 125], B: [180, 220], Q: [190, -70], th0: Math.atan2(-50, -190), swing: 45 * Math.PI / 180,
      off: 16, WY: 15, flat: Math.atan2(152, 203) - .165, ds: { "1": 110, "2": 145, "3": 180 } };
    o.rq = Math.hypot(o.Q[0], o.Q[1]); o.dl = Math.atan2(o.Q[1], o.Q[0]);
    var t0 = this.notch(o.th0, 145), q0 = [o.S[0] + o.Q[0], o.S[1] + o.Q[1]];
    o.Lp = Math.hypot(t0[0] - q0[0], t0[1] - q0[1]);                                  // rod length: the drawn pose with the middle notch
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .55, depthWrite: false });
    // earth: one profile extruded z -45..45. Channel floor y 35, hinge bank top y 90, pit floor y -70, high bank top y 155.
    P.at(P.prism([[-420, -110], [-420, 35], [-195, 35], [-190, 90], [-135, 90], [-75, -70], [85, -70], [130, 155], [420, 155], [420, -110]], -45, 45, c.fixed), 0, 0, 0, scene);
    P.at(P.prism([[-105.4, 15], [100.5, 15], [83.8, -68.5], [-74.1, -68.5]], -44, 44, wat), 0, 0, 0, scene);   // pit water, 1.5 inside the walls
    P.at(P.box(224, 45, 88, wat), -308, 57.5, 0, scene);                                  // channel water x -420..-196, y 35..80
    // hinge cheeks on the low bank: x -180..-150, y 90..135, z 26..32 and -32..-26 (the scoop is z -24..24)
    [29, -29].forEach(function (z) { P.at(P.box(30, 45, 6, c.fixed), -165, 112.5, z, scene); });
    // beam post: slab x 150..210, y 155..168, and two cheeks z 9..15 and -15..-9 (the beam is z -8..8), y 168..232
    P.at(P.box(60, 13, 40, c.fixed), 180, 161.5, 0, scene);
    [12, -12].forEach(function (z) { P.at(P.box(24, 64, 6, c.fixed), 180, 200, z, scene); });
    P.at(P.cylZ(6, 30, c.fixed), 180, 220, 0, scene);                                     // pivot pin z -15..15, flush with the cheeks
    // beam: local x runs from the pivot along the left arm; local y points down. Right end 45 past the pivot, left end at 196.
    o.beam = P.at(new T.Group(), o.B[0], o.B[1], 0, scene);
    var pts = [[-45, -22], [196, -22], [196, 22]];
    [180, 145, 110].forEach(function (d) { pts.push([d + 7, 22], [d, 14], [d - 7, 22]); });
    pts.push([-45, 22]);
    o.beam.add(P.prism(pts, -8, 8, c.mat("beam")));
    // scoop: local frame from the hinge, as drawn. Floor runs from the hinge down to the bucket's V at (195, -160);
    // the bucket's end wall rises to (250, -100). Back side plate z -24..-20, open at the front.
    o.arm = P.at(new T.Group(), o.S[0], o.S[1], 0, scene);
    var am = c.mat("scoop");
    o.arm.add(P.prism([[-12, 8], [15, 14], [85, 5], [160, -25], [225, -55], [250, -100], [195, -160], [-8, -8]], -24, -20, am));
    function plank(x0, y0, x1, y1, w, z, m) { var b = P.box(Math.hypot(x1 - x0, y1 - y0), 3, w, m); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, z); b.rotation.z = Math.atan2(y1 - y0, x1 - x0); o.arm.add(b); }
    plank(-8, -9.5, 195, -161.5, 44, 2, am);                                               // floor, z -20..24
    plank(195.5, -161.5, 250.5, -101.5, 44, 2, am);                                        // bucket end wall
    o.arm.add(P.prism([[-8, -8], [195, -160], [250, -100], [244, -95], [195, -148], [-6, 0]], 20, 24, am));   // low front lip along floor and bucket
    o.arm.add(P.prism([[170, -50], [222, -56], [234, -84], [186, -94]], 24, 28, am));    // side plate for the rod pin, z 24..28
    P.at(P.cylZ(14, 48, am), 0, 0, 0, o.arm);                                              // hinge boss z -24..24
    P.at(P.cylZ(5, 64, am), 0, 0, 0, o.arm);                                               // hinge pin z -32..32, flush with the cheeks
    P.at(P.sphere(5, c.mat("scoop", "mark")), 250, -96, 22, o.arm);
    o.dots = P.waterDots(48, { radius: 2.6, color: c.spot }); scene.add(o.dots);
    o.pinQ = P.at(P.cylZ(4, 8, c.mat("rod")), 0, 0, 32, o.arm); o.pinQ.position.set(o.Q[0], o.Q[1], 32);   // z 28..36
    o.pinT = P.at(P.cylZ(4, 28, c.mat("rod")), 0, 0, 22, scene);                           // z 8..36
    o.rod = P.at(P.rod(3.5, c.mat("rod")), 0, 0, 0, scene);
    o.pool = P.dropPool({ count: 60, radius: 2.1, color: c.spot, opacity: .85, parent: scene });
  },

  // where the rod's top pin sits when the beam's left arm points at angle th and the rod is in the notch d from the pivot
  notch: function (th, d) {
    var o = this.o;
    return [o.B[0] + d * Math.cos(th) - o.off * Math.sin(th), o.B[1] + d * Math.sin(th) + o.off * Math.cos(th)];
  },

  step: function (c, dt, S) {
    var o = this.o, P = c.P, sim = S.playing ? dt : 0, i;
    o.phi += S.w * dt * .7;
    var th = o.th0 - o.swing * (1 - Math.cos(o.phi)) / 2, d = o.ds[S.controls.notch] || 145;
    o.beam.rotation.z = th;
    var t = this.notch(th, d);
    var q = P.meet(o.S[0], o.S[1], o.rq, t[0], t[1], o.Lp, -1);
    var a = o.a = Math.atan2(q[1] - o.S[1], q[0] - o.S[0]) - o.dl, ca = Math.cos(a), sa = Math.sin(a);
    o.arm.rotation.z = a;
    function W(u, v) { return [o.S[0] + u * ca - v * sa, o.S[1] + u * sa + v * ca]; }
    o.pinT.position.set(t[0], t[1], 22);
    o.rod.span(t[0], t[1], 32, q[0], q[1], 32);
    // water: the bucket fills while its V is under the pit's surface. It pours at the hinge once the floor is within about 9 deg of level, as the water then reaches up to it
    var V = W(195, -160);
    if (V[1] < o.WY - 5) o.V += (1 - o.V) * Math.min(1, sim * 3);
    var tilt = a - o.flat;
    if (tilt > 0 && o.V > 0) {
      var dr = Math.min(o.V, sim * 8 * Math.sin(tilt));
      o.V -= dr; o.out += dr * 16;
      if (sim > 0) for (var k = 0; k < 2; k++) if (Math.random() < dr * 60) { var h = W(-4, -2); o.pool.emit(h[0], h[1], (Math.random() - .5) * 30, -110 - Math.random() * 30, 10 + Math.random() * 20, 0); }
    }
    // dots lie on the floor, gathered at whichever end is lower
    var n = Math.ceil(o.V * 48 - .01), L = Math.hypot(203, 152), ux = 203 / L, uy = -152 / L;
    for (i = 0; i < n && i < 48; i++) {
      var s = Math.floor(i / 3) * 8, sv = tilt > 0 ? 8 + s : L - 8 - s, h2 = 5 + (i % 3) * 5;
      var w = W(-8 + sv * ux - h2 * uy, -8 + sv * uy + h2 * ux);
      o.dots.put(i, w[0], w[1], ((i % 3) - 1) * 12, 1);
    }
    for (; i < 48; i++) o.dots.put(i, 0, 0, 0, 0);
    o.dots.flush();
    o.pool.step(sim, 450, function (p) { return p.y < 80 && p.x < -196 || p.y < 90 && p.x > -190 && p.x < -135 || p.y < 15; });
    S.set("fill", Math.round(o.V * 100) + " %");
    S.set("out", Math.round(o.out) + " L");
  }
});
