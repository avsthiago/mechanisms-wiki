M507.define({
  number: 371,
  title: "Mangle wheel toothed on both faces",
  lede: "A small gear turns steadily one way, yet the big wheel turns almost a whole turn one way and then back again. The wheel has teeth on its front face and on its back face, and a gap in its rim lets the small gear cross from one face to the other.",
  alt: "A big upright wheel. Four curved spokes carry a wide drum, and a thin plate joins the drum to a broad rim. The rim carries teeth on both faces and is cut through at the lower left. A small gear on a level shaft meshes with the teeth on the front face at the left. A pin on the pinion's inner end runs in a looped groove round a drum in the middle of the wheel. The shaft runs out through a bearing that slides between two rails, to a crank.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small gear. It always turns the same way. A pin on its inner end runs in the groove, so its teeth stay in the teeth on either face." },
    { key: "wheel", color: "#C8873A", name: "Mangle wheel", note: "The big wheel. Its rim has teeth on both faces, and the teeth wrap round the two ends of the rim at the gap. A thin plate in the middle joins the rim to the guide drum, and the spokes join the drum to the hub. Watch the red mark to follow the wheel as it goes one way and back." },
    { key: "slide", color: "#4FA58A", name: "Sliding bearing", note: "The block the pinion's shaft turns in. It slides to and fro between two rails, so the pinion can move from the front of the rim to the back. The groove decides where it goes." },
    { key: "guide", color: "#8E7AA8", name: "Guide drum", note: "Fixed to the wheel inside the rim. One closed groove runs along its front, round one end of the gap, along its back and round the other end. The pin on the pinion's end runs in it." },
    { key: "crank", color: "#D9B13B", name: "Crank", note: "The handle that turns the pinion. In a real machine an engine would do this." }
  ],
  speed: { min: 5, max: 60, value: 30 },
  readouts: [{ id: "in", label: "Pinion" }, { id: "out", label: "Wheel" }, { id: "face", label: "Pinion is" }],
  views: { "3d": [-290, 150, 760], front: [-60, -10, 860], side: [-840, 60, 200] },
  target: [-60, -10, 0],
  how: [
    "Turn the crank and the small gear, called a pinion, turns with it. Its shaft points at the middle of the wheel, so its teeth meet the teeth standing on the face of the rim. In the picture it is on the front face, pushing the wheel round.",
    "When the gap in the rim comes round, the pinion rolls round the toothed end of the rim and through the gap. Now it is behind the rim, on the back face. The same turning now pushes the wheel the other way. A pin on the pinion's end runs in a groove on the wheel. The groove holds the pinion at the right depth on each face and leads it round the end of the rim.",
    "Watch the wheel readout as the pinion goes through the gap. The wheel slows, stops and turns back. A minus sign means the other way."
  ],
  note: "This model is rebuilt from Brown's drawing. The crank, the sliding bearing, the post, the base, the sizes and the number of teeth were made up. Brown does not say what moves the pinion across. Here a groove on a drum inside the rim guides a pin on the pinion's end, as on other mangle wheels. The teeth round the two ends of the rim lean a little, and are a little thinner and shorter, so the pinion meets them cleanly as it goes round.",

  // Sizes. Module 6, pinion 10 teeth (pitch radius RP). The rim's teeth run from radius RI to RO; their pitch line is
  // measured at radius RM, the middle of the pinion. Unrolled round the wheel (s along the rim at RM, z along the axle)
  // the pitch outline is a long loop: the back face (z = -H), a half circle round one end of the rim (radius H), the
  // front face (z = H) and a half circle round the other end. N teeth fit it; the rim covers the angle B.
  dims: (function () {
    var D = { MD: 6, NP: 10, RM: 170, RI: 140, RO: 200, N: 105 };
    D.RP = D.MD * D.NP / 2; D.H = 8 + 1.25 * D.MD; D.PI = Math.PI * D.MD;
    D.B = (D.N * D.PI - 2 * Math.PI * D.H) / (2 * D.RM);
    D.LS = D.RM * D.B;                       // length of each face along the pitch line; rim from s = -LS to s = 0
    return D;
  })(),

  /** Pitch outline at arc length t (anticlockwise in the s-z plane, from the back face's start at s = -LS):
      {s, z, psi (direction of travel), e (end: 0 on a face, +1 at the end s = 0, -1 at the end s = -LS), c (cos of the
      angle round that end, along the direction away from the rim; 0 where an end meets a face)}. */
  outline: function (t) {
    var D = this.dims, H = D.H, LS = D.LS, LE = Math.PI * H, L = 2 * LS + 2 * LE, a;
    t = ((t % L) + L) % L;
    if (t < LS) return { s: -LS + t, z: -H, psi: 0, e: 0, c: 0, L: L };
    t -= LS;
    if (t < LE) { a = -Math.PI / 2 + t / H; return { s: H * Math.cos(a), z: H * Math.sin(a), psi: a + Math.PI / 2, e: 1, c: Math.cos(a), sz: Math.sin(a), L: L }; }
    t -= LE;
    if (t < LS) return { s: -t, z: H, psi: Math.PI, e: 0, c: 0, L: L };
    t -= LS; a = Math.PI / 2 + t / H;
    return { s: -LS + H * Math.cos(a), z: H * Math.sin(a), psi: a + Math.PI / 2, e: -1, c: -Math.cos(a), sz: Math.sin(a), L: L };
  },

  /** Kinematics. The pinion's centre sits one pitch radius outside the outline, and is held at the wheel's left (world
      angle pi), so the wheel's angle is th = pi - s_c / RM. Rolling without slip turns the pinion (in the s-z plane) by
      rho = psi + pi/2 - pi/NP + t / RP, which puts a gap of the pinion on each tooth of the rim at t = k * pitch.
      Tabulated at K even steps of u = rho - rho(0) over one trip U. */
  kin: function () {
    var D = this.dims, M = 8000, K = 4000, L = this.outline(0).L, i, p, u = [], th = [], zc = [], fc = [], psi, r0;
    for (i = 0; i <= M; i++) {
      p = this.outline(L * i / M); psi = i === M ? 2 * Math.PI : p.psi;   // psi climbs from 0 to 2 pi round the loop
      var sc = p.s + D.RP * Math.sin(p.psi), z = p.z - D.RP * Math.cos(p.psi);
      var rho = psi + Math.PI / 2 - Math.PI / D.NP + L * i / M / D.RP;
      if (!i) r0 = rho;
      u.push(rho - r0); th.push(Math.PI - sc / D.RM); zc.push(z); fc.push(p.e ? (p.e > 0 ? 2 : 3) : (p.z > 0 ? 0 : 1));
    }
    var U = u[M], T = new Float64Array(K + 1), Z = new Float64Array(K + 1), F = new Uint8Array(K + 1), j = 0;
    for (i = 0; i <= K; i++) {
      var uu = U * i / K;
      while (j < M - 1 && u[j + 1] < uu) j++;
      var f = (uu - u[j]) / (u[j + 1] - u[j]);
      T[i] = th[j] + (th[j + 1] - th[j]) * f; Z[i] = zc[j] + (zc[j + 1] - zc[j]) * f; F[i] = fc[j];
    }
    // the drawing's pose: on the front face, the pinion's centre 16.6 short of the end at s = 0
    var tStart = D.LS + Math.PI * D.H + 16.6;
    return { U: U, K: K, th: T, z: Z, face: F, r0: r0, start: Math.PI + tStart / D.RP };   // u there: psi has turned by pi
  },

  /** The toothed rim as one mesh, bent round the wheel's axis. Along the faces a point (s, z) at radius r goes to angle
      s / RM. Round an end the teeth lean: the tooth met when the pinion is at angle a round that end is laid parallel to
      the pinion's shaft at that moment, so the two always meet squarely. */
  rim: function (T, material) {
    var D = this.dims, L = this.outline(0).L, n = D.N, md = D.MD, fr = [-.5, -.385, -.27, -.11, 0, .11, .27, .385], prof = [];
    var offs = [-1.25 * md, -1.25 * md, -1.25 * md, md, md, md, -1.25 * md, -1.25 * md];
    var k, j;
    var thin = [-.5, -.385, -.19, -.06, 0, .06, .19, .385];   // teeth round the rim's two ends are a little thinner: the pinion meets several there at once
    for (k = 0; k < n; k++) {
      var end = this.outline((k - .5) * D.PI).e || this.outline(k * D.PI).e || this.outline((k + .5) * D.PI).e, fk = end ? thin : fr;   // with roots 1.2 deeper and tips 1 lower, to clear the pinion
      for (j = 0; j < fr.length; j++) prof.push({ t: (k + fk[j]) * D.PI, o: offs[j] - (end ? (offs[j] < 0 ? 1.2 : 1) : 0) });
    }
    function place(p, rho, sp, r) {          // 3D point for pitch-outline sample p, pushed rho from the end centre (or o off the face)
      if (!p.e) {
        var a = p.s / D.RM;
        return [r * Math.cos(a), r * Math.sin(a), sp ? 0 : p.z + (p.z > 0 ? rho : -rho)];
      }
      var sEnd = p.e > 0 ? 0 : -D.LS, ac = (sEnd + p.e * (D.H + D.RP) * p.c) / D.RM;
      var tq = p.e * (rho - D.H - D.RP) * p.c, zq = sp ? 0 : rho * p.sz, lam = Math.sqrt(r * r - tq * tq);
      return [lam * Math.cos(ac) - tq * Math.sin(ac), lam * Math.sin(ac) + tq * Math.cos(ac), zq];
    }
    var pos = [], m = prof.length;
    function tri(a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
    function quad(a, b, c, d) { tri(a, b, c); tri(a, c, d); }
    var pts = prof.map(function (q) {
      var p = this.outline(q.t);
      var rho = p.e ? D.H + q.o : q.o;       // on a face: offset along the face normal; at an end: distance from its centre
      return { iI: place(p, rho, false, D.RI), iO: place(p, rho, false, D.RO), sI: place(p, 0, true, D.RI), sO: place(p, 0, true, D.RO) };
    }, this);
    for (k = 0; k < m; k++) {
      var A = pts[k], Bq = pts[(k + 1) % m];
      quad(A.iI, Bq.iI, Bq.iO, A.iO);         // tooth flanks and lands
      quad(A.iO, Bq.iO, Bq.sO, A.sO);         // outer edge of the rim
      quad(A.iI, A.sI, Bq.sI, Bq.iI);         // inner edge of the rim
    }
    var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return new T.Mesh(g, material);
  },

  /** Guide drum fixed to the wheel, inside the rim: a tube (r 122..127, z -60..60) carrying raised lands (to r 136) on
      both sides of one closed channel 9 wide. The channel's middle line is the path of the pinion's pin on the drum:
      at radius RD the pin sits at angle s_c / RM, so along the faces it runs at z = +-(H + RP), and round each rim
      end it follows a half ellipse (squeezed by RD / RM along the drum). The walls are offset 4.5 either side of that
      line along its true normal, measured on the drum, so the channel keeps its width all the way round. */
  guide: function (T, mat, dark) {
    var D = this.dims, HC = D.H + D.RP, W = 4.5, R0 = 127, R1 = 136, RD = 131.5, ZE = 60, k = RD / D.RM;
    var UA = -D.LS * k, AU = HC * k, gap = 2 * Math.PI * RD + UA, uS = UA - gap / 2, uE = gap / 2, pos = [], g = new T.Group(), i;
    function P3(u, z, r) { var an = u / RD; return [r * Math.cos(an), r * Math.sin(an), z]; }
    function tri(p, q, r) { pos.push(p[0], p[1], p[2], q[0], q[1], q[2], r[0], r[1], r[2]); }
    function quad(p, q, r, t) { tri(p, q, r); tri(p, r, t); }
    function dense(pts) {                    // split long steps so the bent surfaces follow the drum
      var out = [pts[0]];
      for (var m = 1; m < pts.length; m++) {
        var p = pts[m - 1], q = pts[m], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 4));
        for (var j = 1; j <= n; j++) out.push([p[0] + (q[0] - p[0]) * j / n, p[1] + (q[1] - p[1]) * j / n]);
      }
      return out;
    }
    function upper(d) {                      // top half of the middle line, pushed d along its normal, left tip to right tip
      var pts = [], m, a, nu, nz, l;
      function put(u, z, x, y) { l = Math.hypot(x, y); pts.push([u + d * x / l, z + d * y / l]); }
      for (m = 0; m <= 40; m++) { a = Math.PI - Math.PI / 2 * m / 40; put(UA + AU * Math.cos(a), HC * Math.sin(a), Math.cos(a) / AU, Math.sin(a) / HC); }
      for (m = 0; m <= 40; m++) { a = Math.PI / 2 - Math.PI / 2 * m / 40; put(AU * Math.cos(a), HC * Math.sin(a), Math.cos(a) / AU, Math.sin(a) / HC); }
      return pts;
    }
    function lands(pts, zTo) {               // face at R1 from the edge to z = zTo, the channel wall, both mirrored below
      [1, -1].forEach(function (m) {
        for (i = 0; i + 1 < pts.length; i++) {
          var p = pts[i], q = pts[i + 1];
          quad(P3(p[0], m * p[1], R1), P3(q[0], m * q[1], R1), P3(q[0], m * zTo, R1), P3(p[0], m * zTo, R1));
          if (p[1] > 1e-6 || q[1] > 1e-6) quad(P3(p[0], m * p[1], R0), P3(q[0], m * q[1], R0), P3(q[0], m * q[1], R1), P3(p[0], m * p[1], R1));
        }
      });
    }
    lands(dense([[uS, 0]].concat(upper(W), [[uE, 0]])), ZE);   // outer land: from the channel out to the drum's ends
    lands(dense(upper(-W)), 0);              // island inside the channel's loop
    var lg = new T.BufferGeometry(); lg.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); lg.computeVertexNormals();
    g.add(new T.Mesh(lg, mat));
    var tube = [[122, -ZE], [R0, -ZE], [R0, ZE], [122, ZE], [122, -ZE]].map(function (p) { return new T.Vector2(p[0], p[1]); });
    var tg = new T.LatheGeometry(tube, 160); tg.rotateX(Math.PI / 2);
    g.add(new T.Mesh(tg, mat));              // tube r 122..127
    var fl = new T.Mesh(new T.CylinderGeometry(R0 + .5, R0 + .5, 2 * ZE - 1, 160, 1, true), dark); fl.rotation.x = Math.PI / 2;
    g.add(fl);                               // dark channel floor r 127.5, .5 off the tube; the lands cover it outside the channel
    [-ZE, ZE].forEach(function (z) { var rg = new T.Mesh(new T.RingGeometry(R0, R1, 160), mat); rg.position.z = z; g.add(rg); });   // ends of the lands
    g.channel = { RD: RD, UA: UA, AU: AU, HC: HC, W: W, R0: R0, R1: R1 };
    return g;
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = this.dims, k = this.kin();
    var o = this.o = { a: 0, k: k, P: P };

    // wheel, turning about z. In its own frame the rim covers angles -B..0 and the gap 0..2pi-B.
    var w = o.wheel = new T.Group(), m = c.mat("wheel"); scene.add(w);
    w.add(this.rim(T, m));                                         // rim r 140..200, teeth z -21.5..21.5, plate z -8..8
    w.add(o.guide = this.guide(T, c.mat("guide"), c.mat("guide", "dark")));              // guide drum r 122..136, z -60..60, inside the rim (r 140) and over the ring
    var disc = new T.Shape(); disc.absarc(0, 0, 123, 0, 2 * Math.PI, false);       // spoked centre, r to 123: 1 into the drum's tube (r 122..127), never past it
    [1, 3, 5, 7].forEach(function (q) {
      var cx = 72 * Math.cos(q * Math.PI / 4), cy = 72 * Math.sin(q * Math.PI / 4), h = new T.Path(), i, x, y, r;
      for (i = 0; i <= 64; i++) {
        var al = -2 * Math.PI * i / 64; x = cx + 40 * Math.cos(al); y = cy + 40 * Math.sin(al); r = Math.sqrt(x * x + y * y);
        var rr = Math.min(102, Math.max(42, r)); x *= rr / r; y *= rr / r;
        if (i) h.lineTo(x, y); else h.moveTo(x, y);
      }
      disc.holes.push(h);                                          // window between the spokes, inside the ring (r 102..123)
    });
    var dg = new T.ExtrudeGeometry(disc, { depth: 20, bevelEnabled: false, curveSegments: 72 }); dg.translate(0, 0, -10);
    w.add(new T.Mesh(dg, m));                                      // ring and spokes z -10..10
    P.at(P.cylZ(30, 30, m), 0, 0, 0, w);                           // hub z -15..15
    P.at(P.cylZ(12, 4, c.mat("wheel", "dark")), 0, 0, 17, w);      // shaft end z 15..19, on the hub
    P.at(P.cylZ(9, 25, m), 0, 0, -27.5, w);                        // shaft z -40..-15, from the post's face to the hub
    P.at(P.box(16, 8, 1, c.mat("wheel", "mark")), 0, 112, 11, w);  // red mark z 10.5..11.5, lifted .5 off the ring face (z 10)
    // web: a thin plate in the middle plane joining the drum (lands r 136) to the rim (r 140), only where the rim is
    var web = new T.Shape(); web.absarc(0, 0, D.RI + .5, -D.B, 0, false); web.absarc(0, 0, 135.5, 0, -D.B, true); web.closePath();
    var wbg = new T.ExtrudeGeometry(web, { depth: 6, bevelEnabled: false, curveSegments: 200 }); wbg.translate(0, 0, -3);
    w.add(new T.Mesh(wbg, m));                                      // web r 135.5..140.5, z -3..3, angles -B..0; the channel only reaches |z| < 41 beyond the rim ends
    w.rotation.z = Math.PI;

    // pinion: axis along x on the line y = 0, sliding along z. Width 20: x -184..-164, close round the radius RM
    // where the rim's tooth spacing equals the pinion's, so its teeth fit the rim's along the whole width
    o.pin = new T.Group(); o.pin.rotation.y = Math.PI / 2; scene.add(o.pin);   // local z is world x, local x is world -z
    o.pin.position.set(-D.RM, 0, D.H + D.RP);
    o.rot = new T.Group(); o.pin.add(o.rot);
    var pm = c.mat("pinion");
    P.at(P.spurGear({ teeth: D.NP, module: D.MD, width: 20, material: pm }), 0, 0, -4, o.rot);    // local z -14..6: world x -184..-164
    P.at(P.cylZ(6, 123, pm), 0, 0, -75.5, o.rot);                  // shaft local z -137..-14: world x -307..-184, through the bearing
    P.at(P.cylZ(10, 2, c.mat("pinion", "dark")), 0, 0, 7, o.rot);  // cap local z 6..8 on the gear's inner end (world x -164..-162)
    P.at(P.cylZ(3.5, 34, c.mat("pinion", "dark")), 0, 0, 25, o.rot);   // guide pin local z 8..42: world r 162..128, past the rim (r 140) only in the gap, into the groove (floor r 127.5, lands r 136)
    var cm = c.mat("crank");
    P.at(P.box(50, 10, 6, cm), 18, 0, -140, o.rot);                // arm local x -7..43, z -143..-137, on the shaft end
    P.at(P.cylZ(4.5, 24, cm), 36, 0, -155, o.rot);                 // handle local z -167..-143, on the arm's face
    // sliding bearing: world x -261.5..-238.5, y -11.5..11.5, z zc-10..zc+10 (local z -91.5..-68.5)
    var blk = P.guideBlock({ w: 20, h: 23, d: 23, hole: 6.5, material: c.mat("slide") });
    blk.rotation.x = Math.PI / 2; P.at(blk, 0, 0, -80, o.pin);     // hole along the shaft

    // supports. Guide frame x -262..-238; the block (y -11.5..11.5) runs .25 clear of the rails
    P.at(P.box(24, 8, 132, c.fixed), -250, 15.75, 0, scene);       // top rail y 11.75..19.75, z -66..66 (the block goes to +-55.5)
    P.at(P.box(24, 8, 132, c.fixed), -250, -15.75, 0, scene);      // bottom rail y -19.75..-11.75
    P.at(P.box(24, 39.5, 8, c.fixed), -250, 0, 70, scene);         // front end wall z 66..74, y -19.75..19.75
    P.at(P.box(24, 39.5, 8, c.fixed), -250, 0, -70, scene);        // back end wall z -74..-66
    P.at(P.box(24, 195.25, 30, c.fixed), -250, -117.375, 0, scene); // guide post y -215..-19.75, z -15..15, under the bottom rail
    P.at(P.box(44, 235, 12, c.fixed), 0, -97.5, -46, scene);       // wheel post x -22..22, y -215..20, z -52..-40; the shaft ends at z -40
    P.at(P.box(330, 10, 140, c.fixed), -110, -220, -10, scene);    // base x -275..55, y -225..-215, z -80..60; both posts stand on y -215
  },

  step: function (c, dt, S) {
    var o = this.o, k = o.k, D = this.dims;
    o.a += S.w * dt;
    var u = (o.a + k.start) % k.U; if (u < 0) u += k.U;
    var x = u / k.U * k.K, i = Math.min(k.K - 1, Math.floor(x)), f = x - i;
    var th = k.th[i] + (k.th[i + 1] - k.th[i]) * f, zc = k.z[i] + (k.z[i + 1] - k.z[i]) * f;
    o.wheel.rotation.z = th;
    o.pin.position.z = zc;
    o.rot.rotation.z = -Math.PI / 2 - (k.r0 + o.a + k.start);     // the pinion's turn in the s-z plane, seen along world x
    var ratio = (k.th[i + 1] - k.th[i]) / (k.U / k.K);
    function fm(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", fm(rpm));
    S.set("out", fm(rpm === 0 ? 0 : rpm * ratio));
    S.set("face", ["in front", "behind", "crossing", "crossing"][k.face[i]]);
  }
});
