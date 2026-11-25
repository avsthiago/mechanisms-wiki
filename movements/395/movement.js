M507.define({
  number: 395,
  title: "Four-way cock",
  lede: "A round plug turns inside a casing with four pipes. Two curved passages cut through the plug join the pipes in pairs. One quarter turn changes the pairs, so steam goes to the other end of the cylinder.",
  alt: "A section through a round plug fitted in a square casing. Four pipes leave the casing at the top, bottom, left and right. Two curved passages in the plug join neighbouring pipes, and they are coloured to show steam coming in and used steam going out.",
  parts: [
    { key: "plug", color: "#5E7387", name: "Plug", note: "The round part that turns. The red dot shows how far it has turned. The two curved passages are cut through it." },
    { key: "steam", color: "#D9B13B", name: "Fresh steam", note: "Comes in at the top pipe, runs through a passage in the plug and out to one end of the cylinder." },
    { key: "exhaust", color: "#4FA58A", name: "Used steam", note: "Comes back from the other end of the cylinder, runs through the other passage and leaves by the bottom pipe." }
  ],
  controls: [{ id: "pos", label: "Plug position", value: "1", options: [["1", "Steam to left"], ["2", "Steam to right"]] }],
  speed: false,
  closed: { label: "Casing" },
  readouts: [{ id: "in", label: "Steam goes to" }, { id: "out", label: "Exhaust from" }],
  views: { "3d": [135, 74, 289], front: [0, 0, 330], side: [330, 0, 30] },
  target: [0, 0, 0],
  how: [
    "Steam comes in at the top pipe. The left and right pipes go to the two ends of a steam cylinder. The bottom pipe lets used steam escape. The plug has two curved passages. Each one joins two pipes that are next to each other.",
    "In the first position, one passage joins the top pipe to the left pipe. Fresh steam pushes the piston from the left. The other passage joins the right pipe to the bottom pipe, so the steam on the right side is pushed out.",
    "Turn the plug a quarter turn and the passages move round to the next pair of pipes. Now fresh steam goes to the right end and the left end exhausts. Choose each position and watch the colours. Choose Closed to see the cock as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing, which shows the two positions side by side. Here one plug turns between them. The casing, its back plate and the length of the pipes are made up. The plug and casing are cut open so you can see the passages. The cylinder the pipes lead to is not drawn. The plug is turned by a hand lever in real life, which is left out.",

  build: function (c) {
    var T = c.THREE, P = c.P, sc = c.scene, i, k;
    var R = 45, W = 14, RB = 45.8, S = 55, PI = Math.PI;
    var o = this.o = { rho: PI / 2, W: W };
    function rim(a0, a1, rad, n) { var r = [], j; for (j = 0; j <= n; j++) { var a = a0 + (a1 - a0) * j / n; r.push([rad * Math.cos(a), rad * Math.sin(a)]); } return r; }
    // wall of a passage: an arc of radius rho about the corner (R, R), from the rim near the top port to the rim near the right port
    function wall(rho, Rr) {
      var s = (Rr * Rr + 2 * R * R - rho * rho) / (2 * R * Rr), q = Math.asin(s / Math.SQRT2), ahi = PI - q - PI / 4, alo = q - PI / 4;
      var p1 = [Rr * Math.cos(ahi), Rr * Math.sin(ahi)], p2 = [Rr * Math.cos(alo), Rr * Math.sin(alo)];
      var f1 = (Math.atan2(p1[1] - R, p1[0] - R) + 2 * PI) % (2 * PI), f2 = (Math.atan2(p2[1] - R, p2[0] - R) + 2 * PI) % (2 * PI), r = [], j;
      for (j = 0; j <= 24; j++) { var f = f1 + (f2 - f1) * j / 24; r.push([R + rho * Math.cos(f), R + rho * Math.sin(f)]); }
      return { pts: r, ahi: ahi, alo: alo };
    }
    function neg(l) { return l.map(function (p) { return [-p[0], -p[1]]; }); }
    function shape(l) { var s = new T.Shape(); l.forEach(function (p, j) { if (j) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); }); return s; }
    function slab(l, z0, z1, m) { var g = new T.ExtrudeGeometry(shape(l), { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return new T.Mesh(g, m); }
    var wo = wall(R + W / 2, R), wi = wall(R - W / 2, R), W1 = wo.pts, Wr = W1.slice().reverse();
    var main = rim(98.95 * PI / 180, 171.05 * PI / 180, R, 24).concat(neg(W1).reverse(), rim(279 * PI / 180 - 0.0001, 351 * PI / 180, R, 24), Wr);
    var capNE = rim(wi.alo, wi.ahi, R, 16).concat(wi.pts), capSW = neg(capNE);
    // plug: a body and two small caps, 10 thick, joined by a back disc
    o.plug = new T.Group(); sc.add(o.plug);
    var pm = c.mat("plug");
    o.plug.add(slab(main, -5, 5, pm)); o.plug.add(slab(capNE, -5, 5, pm)); o.plug.add(slab(capSW, -5, 5, pm));
    P.at(P.cylZ(R, 3, pm), 0, 0, -6.5, o.plug);                      // back disc z -8..-5
    P.at(P.cylZ(3.4, 1, c.mat("plug", "mark")), -22.6, 22.6, 6, o.plug);   // red dot, z 5.5..6.5, on the body
    // flows in the two passages (a little narrower than the passage, so they never touch its walls)
    var fo = wall(R + W / 2 - .7, R - .3), fi = wall(R - W / 2 + .7, R - .3);
    var fpoly = fo.pts.concat(rim(fo.alo, fi.alo, R - .3, 3), fi.pts.slice().reverse(), rim(fi.ahi, fo.ahi, R - .3, 3));
    o.fNE = slab(fpoly, -4, 4, c.mat("steam")); o.fSW = slab(neg(fpoly), -4, 4, c.mat("exhaust"));
    o.plug.add(c.fluid(o.fNE)); o.plug.add(c.fluid(o.fSW));   // fluid: still shows faintly when the casing is closed
    // casing: four corner blocks round the bore, a back plate, and a pair of walls for each pipe
    var q = Math.sqrt(RB * RB - W * W / 4), b = Math.asin(W / 2 / RB), E = S, cs = new T.Shape();
    cs.moveTo(W / 2, q); cs.lineTo(W / 2, E); cs.lineTo(E, E); cs.lineTo(E, W / 2); cs.lineTo(q, W / 2);
    cs.absarc(0, 0, RB, b, PI / 2 - b, false); cs.closePath();
    var cg = new T.ExtrudeGeometry(cs, { depth: 16, bevelEnabled: false, curveSegments: 20 }); cg.translate(0, 0, -8);
    for (k = 0; k < 4; k++) { var cp = new T.Mesh(cg, c.fixed); cp.rotation.z = k * PI / 2; sc.add(c.shell(cp)); }
    c.shell(P.at(P.box(110, 110, 1, c.fixed), 0, 0, -9, sc));       // back plate z -9.5..-8.5
    c.shell(P.at(P.box(110, 110, .5, c.fixed), 0, 0, -8.25, sc), "closed");   // closed view: fills z -8.5..-8, back plate to the corner blocks
    c.shell(P.at(P.box(110, 110, 1, c.fixed), 0, 0, 8.5, sc), "closed");      // closed view: front cover z 8..9 on the corner blocks' front face
    o.port = [];
    for (k = 0; k < 4; k++) {                                        // 0 top, 1 left, 2 bottom, 3 right
      var g = new T.Group(); g.rotation.z = k * PI / 2; sc.add(g);
      c.shell(P.at(P.box(22, 30, 1.5, c.fixed), 0, 70, 8.25, g), "closed");    // closed view: pipe top x -11..11, z 7.5..9 on the walls
      c.shell(P.at(P.box(22, 30, 1, c.fixed), 0, 70, -8, g), "closed");        // closed view: fills z -8.5..-7.5, floor to the walls
      c.shell(P.at(P.box(4, 30, 15, c.fixed), -9, 70, 0, g));        // walls x 7..11, y 55..85, z -7.5..7.5
      c.shell(P.at(P.box(4, 30, 15, c.fixed), 9, 70, 0, g));
      c.shell(P.at(P.box(26, 30, 1, c.fixed), 0, 70, -9, g));        // pipe floor, same plane as the back plate
      var st = P.at(P.box(12.6, 39.8, 8, c.mat("steam")), 0, 65.1, 0, g), ex = P.at(P.box(12.6, 39.8, 8, c.mat("exhaust")), 0, 65.1, 0, g);
      c.fluid(st); c.fluid(ex); o.port.push({ st: st, ex: ex });
    }
    o.port[0].ex.visible = false; o.port[2].st.visible = false;
  },

  step: function (c, dt, S) {
    var o = this.o, tgt = S.controls.pos === "2" ? 0 : Math.PI / 2, d = tgt - o.rho, mv = 2 * (dt || 0);
    o.rho += Math.abs(d) <= mv ? d : mv * Math.sign(d);
    o.plug.rotation.z = o.rho;
    var p1 = Math.abs(o.rho - Math.PI / 2) < .1, p2 = Math.abs(o.rho) < .1, open = p1 || p2;
    o.fNE.visible = o.fSW.visible = open;
    o.port[1].st.visible = p1; o.port[1].ex.visible = p2;
    o.port[3].st.visible = p2; o.port[3].ex.visible = p1;
    S.set("in", p1 ? "Left end" : p2 ? "Right end" : "Shut");
    S.set("out", p1 ? "Right end" : p2 ? "Left end" : "Shut");
  }
});
