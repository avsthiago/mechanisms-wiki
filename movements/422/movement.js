M507.define({
  number: 422,
  title: "Oscillating piston engine",
  lede: "A steam engine whose piston swings instead of sliding. The cylinder is shaped like a slice of pie, and the piston is a flat blade fixed to a shaft at the point. Steam pushes the blade one way, then the other, and the rocking shaft turns a crank.",
  alt: "A fan-shaped steam cylinder, cut open at the front, with a blade inside fixed to a shaft at the bottom. A slide valve sits in a box on top. An arm on the shaft drives a crank through a rod.",
  parts: [
    { key: "cyl", color: "#4FA58A", name: "Cylinder", note: "Shaped like a slice of pie and cut open at the front. Two channels run over the top from the valve to the two far corners." },
    { key: "vane", color: "#C8873A", name: "Piston and rocking shaft", note: "A flat blade fixed to a shaft at the point of the cylinder. It swings to and fro, and the arm on the shaft swings with it." },
    { key: "valve", color: "#8E7AA8", name: "Slide valve", note: "Slides to and fro in the box on top. It lets steam into one channel while the other channel lets used steam out." },
    { key: "rod", color: "#D9B13B", name: "Connecting rod", note: "Joins the end of the swinging arm to the crank." },
    { key: "crank", color: "#5E7387", name: "Crank", note: "Turns round and round as the arm swings up and down." },
    { key: "pin", color: "#C2503F", name: "Crank pin", note: "Where the rod joins the crank. Watch it go round in a circle." }
  ],
  closed: { label: "Cylinder" },
  readouts: [{ id: "sw", label: "Piston" }, { id: "st", label: "Steam on" }],
  views: { "3d": [150, 140, 480], front: [25, 72, 520], side: [520, 72, 25] },
  target: [25, 72, 0],
  how: [
    "Watch the blade inside the cylinder. It swings from one side to the other, like a door that never opens all the way. The arm on its shaft swings up and down and turns the crank through the rod.",
    "Steam comes in at the top. The valve sends it down one channel to a far corner of the cylinder. There it fills the space behind the blade and pushes it across. Meanwhile the steam on the other side flows out through the other channel. Then the valve slides over and it all happens the other way.",
    "Watch the valve and the blue dots of steam together. Each time the blade reaches the end of its swing, the valve has moved to send steam to the other side. Choose Closed to see the engine as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front of the cylinder is cut away so the blade shows. Brown only says the rocking shaft is joined to a crank, so the arm, rod, crank, the post that holds it and the base were made up, as were all the sizes. The rod that moves the valve is left unjoined; here the valve moves as if it were worked from the crank shaft. The blue dots show the steam. Dark dots are fresh steam pushing, and pale dots are used steam leaving.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = Math.PI / 180;
    var al = 28 * D, o = this.o = { th: Math.PI / 2, a: 108, rc: 33, Q: [108, 100], al: al, hw: 3.5, T: T };
    o.Lc = 100;
    function pol(r, f) { return [r * Math.sin(f), r * Math.cos(f)]; }
    function arcPts(r, f0, f1, n) { var p = [], k; for (k = 0; k <= n; k++) p.push(pol(r, f0 + (f1 - f0) * k / n)); return p; }
    function sector(r0, r1, f0, f1) { return arcPts(r1, f0, f1, 16).concat(arcPts(r0, f1, f0, 16)); }
    function plate(pts, mat, parent) { var m = P.outlinePlate({ points: pts, depth: 40, z0: -40, material: mat }); (parent || scene).add(m); return m; }
    function line(s, t, off) { var f = s * al; return [t * Math.sin(f) + off * Math.cos(f) * s, t * Math.cos(f) - off * Math.sin(f) * s]; }
    var cm = c.mat("cyl"), k, s, xs = 42;
    // cylinder walls, all z -40 .. 0 (the front is cut away). Chamber: between the side walls (+-28 degrees), radius 24.5 .. 140
    plate(sector(140, 147, -al + 6 * D, al - 6 * D), cm);                   // arc wall over the chamber; open at its ends into the channels
    plate(sector(147, 157, -2 * D, 2 * D), cm);                              // divider between the two channels
    [-1, 1].forEach(function (s) {
      plate([line(s, 24.5, 0), line(s, 165, 0), line(s, 165, 8), line(s, 35.1, 8)], cm);   // side wall, 8 thick
      var pts = arcPts(157, s * Math.asin(xs / 157), s * al, 10).concat(arcPts(165, s * al, s * Math.asin(xs / 165), 10));   // outer shell from the seat (|x| = 42) to the side wall, r 157 .. 165
      plate(pts, cm);
    });
    // valve seat on top, y up to 168, with two ports (|x| 8 .. 16) through it; |x| < 8 is the middle bar with the exhaust port
    function seat(x0, x1) { var p = [], k; for (k = 0; k <= 6; k++) { var x = x0 + (x1 - x0) * k / 6; p.push([x, Math.sqrt(157 * 157 - x * x)]); } return p.concat([[x1, 168], [x0, 168]]); }
    plate(seat(-xs, -16), cm); plate(seat(16, xs), cm); plate(seat(-8, 8), cm);
    P.at(P.box(4, .5, 24, c.mat("cyl", "dark")), 0, 168.75, -20, scene);    // exhaust port, y 168.5 .. 169, lifted 0.5 off the seat
    // steam box over the valve: walls x +-36 .. 42, y 168 .. 208
    P.at(P.box(6, 40, 40, cm), -39, 188, -20, scene); P.at(P.box(6, 40, 40, cm), 39, 188, -20, scene); P.at(P.box(84, 6, 40, cm), 0, 205, -20, scene);  // top y 202 .. 208
    P.at(P.box(8, 14, 16, cm), 46, 178, -20, scene);                        // gland for the valve rod, x 42 .. 50
    // seat for the shaft: part ring r 24.5 .. 36 round the bottom
    var hub = [], hb = [];
    for (k = 0; k <= 24; k++) { var f = al + (2 * Math.PI - 2 * al) * k / 24; hub.push(pol(36, f)); hb.unshift(pol(24.5, f)); }
    plate(hub.concat(hb), cm);
    // back plate z -46 .. -40, under everything
    var bp = [line(1, 165, 8)], a0 = Math.atan2(line(1, 35.1, 8)[0], line(1, 35.1, 8)[1]);
    bp.push(line(1, 35.1, 8));
    for (k = 1; k < 24; k++) bp.push(pol(36, a0 + (2 * Math.PI - 2 * a0) * k / 24));
    bp.push(line(-1, 35.1, 8), line(-1, 165, 8));
    bp = bp.concat(arcPts(165, -al, al, 16));
    scene.add(P.outlinePlate({ points: bp, depth: 6, z0: -46, material: cm }));
    scene.add(P.outlinePlate({ points: [[-42, 150], [42, 150], [42, 208], [-42, 208]], depth: 6, z0: -46, material: cm }));   // behind the seat and box
    // closed view: front cover z 0 .. 2 on the cut face, the same outline as the back; the arm's hub (z 2 .. 8) sits on it
    var sh = []; for (k = 0; k < 24; k++) sh.push([9.5 * Math.cos(-2 * Math.PI * k / 24), 9.5 * Math.sin(-2 * Math.PI * k / 24)]);   // hole r 9.5 for the shaft (r 9)
    scene.add(c.shell(P.outlinePlate({ points: bp, holes: [sh], depth: 2, z0: 0, material: cm }), "closed"));
    scene.add(c.shell(P.outlinePlate({ points: [[-42, 150], [42, 150], [42, 208], [-42, 208]], depth: 2, z0: 0, material: cm }), "closed"));
    // steam in the channels and ports (left, right), and in the chamber on each side of the blade
    o.sm = [0, 1].map(function () { return new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .1, depthWrite: false }); });
    [-1, 1].forEach(function (s, i) {
      var f0 = s * 2.3 * D, f1 = s * (al - .3 * D), pts = arcPts(156.5, f0, f1, 14).concat(arcPts(140, f1, s * (al - 5.7 * D), 3), arcPts(147.5, s * (al - 5.7 * D), f0, 14));
      scene.add(c.fluid(P.outlinePlate({ points: pts, depth: 39, z0: -39.5, material: o.sm[i] })));
      var pp = []; for (k = 0; k <= 4; k++) { var x = s * (8.3 + 7.4 * k / 4); pp.push([x, Math.sqrt(156.5 * 156.5 - x * x)]); }
      scene.add(c.fluid(P.outlinePlate({ points: pp.concat([[s * 15.7, 167.5], [s * 8.3, 167.5]]), depth: 39, z0: -39.5, material: o.sm[i] })));
    });
    o.ch = [0, 1].map(function (i) { var m = P.mesh(new T.BufferGeometry(), o.sm[i]); m.userData.live = true; scene.add(c.fluid(m)); return m; });
    // steam as moving balls: the chamber is one region cut in two by the blade (angle from upright, + to the right);
    // each channel is a stream from its port, round under the shell, into the chamber's top corner
    o.flow = P.steamFlow({ color: c.spot, light: true, count: 280, z0: -35, z1: -5 }); scene.add(o.flow);
    o.b = 0;
    o.dom = o.flow.domain({ density: .012, pad: .05, f: function (f, out) { var sf = Math.sin(f), cf = Math.cos(f); out[0] = 27 * sf; out[1] = 27 * cf; out[2] = 138 * sf; out[3] = 138 * cf; } });
    o.bars = [-al + .01, 0, al - .01]; o.kinds = [0, 0]; o.ports = [-al + .04, al - .04];
    o.fp = [-1, 1].map(function (s) { return o.flow.pipe({ points: [[s * 12, 167], [s * 12, 154]].concat(arcPts(152, s * 7 * D, s * (al - 3.2 * D), 8), [pol(141, s * (al - 3 * D))]), width: 6, n: 14 }); });
    // valve: a D-shaped slide with a hollow underneath, x +-18, y 168 .. 180, z -39 .. -1
    o.valve = P.at(new T.Group(), 0, 168, 0, scene);
    o.valve.add(P.outlinePlate({ points: [[-18, 0], [-8, 0], [-8, 6], [8, 6], [8, 0], [18, 0], [18, 12], [-18, 12]], depth: 38, z0: -39, material: c.mat("valve") }));
    P.at(P.cylX(3, 1, c.mat("valve")), 0, 6, -20, o.valve); o.vrod = o.valve.children[1];   // valve rod, out through the gland
    // blade on the rock shaft: hub r 24, blade 7 wide up to r 138.5, z -40 .. -1
    o.vane = P.at(new T.Group(), 0, 0, 0, scene);
    P.at(P.cylZ(24, 39, c.mat("vane")), 0, 0, -20.5, o.vane);
    P.at(P.box(2 * o.hw, 114.5, 39, c.mat("vane")), 0, 81.25, -20.5, o.vane);   // y 24 .. 138.5
    P.at(P.cylZ(9, 4, c.mat("vane")), 0, 0, 1, o.vane);                      // shaft, z -1 .. 3
    o.rock = P.at(new T.Group(), 0, 0, 5, scene);                           // arm, z 2 .. 8
    o.rock.add(P.armPlate({ length: o.a, r0: 13, r1: 8, thick: 6, material: c.mat("vane") }));
    P.at(P.cylZ(3.5, 12, c.mat("vane")), o.a, 0, 3, o.rock);                // pin at the arm's end, z 2 .. 14
    // post, shaft and crank
    P.at(P.box(68, 24, 46, c.fixed), 0, -48, -23, scene);                  // pedestal under the shaft seat, x +-34, y -60 .. -36, z -46 .. 0
    P.at(P.box(260, 10, 80, c.fixed), 0, -65, -20, scene);                 // base, y -70 .. -60, z -60 .. 20
    P.at(P.box(20, 180, 12, c.fixed), o.Q[0], 30, -40, scene);              // post, y -60 .. 120, z -46 .. -34
    P.at(P.cylZ(5, 36, c.mat("crank")), o.Q[0], o.Q[1], -16, scene);        // shaft, z -34 .. 2
    o.crank = P.at(new T.Group(), o.Q[0], o.Q[1], 5, scene);
    o.crank.add(P.armPlate({ length: o.rc, r0: 11, r1: 8, thick: 6, material: c.mat("crank") }));
    o.cpin = P.at(P.cylZ(3.5, 12, c.mat("pin")), o.rc, 0, 3.5, o.crank);   // crank pin, z 2.5 .. 14.5 (arm back face is z 2)
    o.rod = P.at(P.rod(3, c.mat("rod")), 0, 0, 0, scene);
    o.e1 = P.at(P.cylZ(7, 5, c.mat("rod")), 0, 0, 11, scene); o.e2 = P.at(P.cylZ(7, 5, c.mat("rod")), 0, 0, 11, scene);   // eyes, z 8.5 .. 13.5
  },

  // swing of the blade (radians, + leans right) for crank angle th: the arm's end lies on two circles
  swing: function (th) {
    var o = this.o, kx = o.Q[0] + o.rc * Math.cos(th), ky = o.Q[1] + o.rc * Math.sin(th);
    var d = Math.hypot(kx, ky), a = o.a, L = o.Lc, ca = (a * a + d * d - L * L) / (2 * a * d), base = Math.atan2(ky, kx);
    var g = base - Math.acos(Math.max(-1, Math.min(1, ca))), alt = base + Math.acos(Math.max(-1, Math.min(1, ca)));
    var ang = Math.abs(g) < Math.abs(alt) ? g : alt;                        // the branch with the arm pointing right
    return { b: -ang, kx: kx, ky: ky, tx: a * Math.cos(ang), ty: a * Math.sin(ang) };
  },

  step: function (c, dt, S) {
    var o = this.o, T = o.T, w = this.swing(o.th += S.w * dt), b = w.b, al = o.al, k;
    o.vane.rotation.z = -b; o.rock.rotation.z = -b;
    o.crank.rotation.z = o.th;
    o.rod.span(w.tx, w.ty, 11, w.kx, w.ky, 11);
    o.e1.position.set(w.tx, w.ty, 11); o.e2.position.set(w.kx, w.ky, 11);
    var xv = -8 * Math.cos(o.th);                                            // valve worked from the crank shaft, a quarter turn ahead of the crank
    o.valve.position.x = xv;
    o.vrod.scale.y = 80 - xv - 18; o.vrod.position.x = 18 + (80 - xv - 18) / 2;   // rod from the valve's side to x = 80
    var left = xv > 0;                                                       // valve to the right: the left port is open to the steam box
    o.sm[0].opacity = left ? .14 : .03; o.sm[1].opacity = left ? .03 : .14;
    // the spaces either side of the blade
    for (var i = 0; i < 2; i++) {
      var s = i ? 1 : -1, hw = o.hw + .3, pts = [], fv, fw = s * (al - .002);
      function V(r) { return [r * Math.sin(b) + s * hw * Math.cos(b), r * Math.cos(b) - s * hw * Math.sin(b)]; }
      pts.push(V(25), V(139.5));
      fv = Math.atan2(V(139.5)[0], V(139.5)[1]);
      for (k = 1; k <= 10; k++) { var f = fv + (fw - fv) * k / 10; pts.push([139.5 * Math.sin(f), 139.5 * Math.cos(f)]); }
      pts.push([25 * Math.sin(fw), 25 * Math.cos(fw)]);
      var sh = new T.Shape(); pts.forEach(function (p, j) { if (j) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
      var g = new T.ExtrudeGeometry(sh, { depth: 39, bevelEnabled: false }); g.translate(0, 0, -39.5);
      o.ch[i].geometry.dispose(); o.ch[i].geometry = g;
    }
    o.bars[1] = Math.max(-al + .02, Math.min(al - .02, b)); o.kinds[0] = left ? 1 : 3; o.kinds[1] = left ? 3 : 1;
    o.dom.set(o.bars, o.kinds, o.ports, 2);
    o.fp[0].out = !left; o.fp[1].out = left;
    o.flow.update(Math.abs(S.w) * dt);
    S.set("sw", (b > 0 ? "+" : b < 0 ? "−" : "") + Math.abs(b * 180 / Math.PI).toFixed(0) + "°");
    S.set("st", left ? "Left" : "Right");
  }
});
