M507.define({
  number: 204,
  title: "Rolling contact on oblique shafts",
  lede: "Two rollers shaped like cotton reels sit on shafts that cross at a slant without meeting. They touch along a straight line, so one can turn the other with no teeth at all. Rollers like this join shafts that point different ways.",
  alt: "Two long rollers, each thin in the middle and wide at the ends, lie one across the other at a slant. The upper roller presses on the lower one along a straight line. Each has a short shaft at both ends held in a ring on a post. A red stripe runs straight along each roller.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Upper roller", note: "It does the driving. It is thinnest in the middle and widens towards both ends." },
    { key: "driven", color: "#C8873A", name: "Lower roller", note: "Turned by the upper roller where the two touch. Its shaft crosses the upper shaft at a slant." },
    { key: "stripe", color: "#C2503F", name: "Red stripes", note: "Each roller has one red stripe. Although the rollers are curved, the stripes are perfectly straight. Watch them meet and lie along each other." }
  ],
  controls: [{ id: "size", label: "Rollers", value: "same", options: [["same", "Same size"], ["diff", "Different sizes"]] }],
  readouts: [{ id: "in", label: "Upper" }, { id: "out", label: "Lower" }],
  views: { "3d": [-254, 130, 544], front: [0, 0, 620], side: [620, 20, 0] },
  target: [0, -10, 0],
  how: [
    "Turn the upper roller and the lower one turns the other way. Their shafts cross at a slant and never meet. Yet the two rollers touch all along one straight line, from end to end.",
    "That is possible because of their shape, called a hyperboloid. It looks curved, but it can be made entirely of straight lines laid at a slant round the shaft. The red stripe is one of those lines. Where the rollers touch, one straight line of each lies along a line of the other. Rubbing at that line drives the lower roller.",
    "When the rollers are the same size, both turn at the same speed. Pick Different sizes. Now the thin roller turns nearly twice as fast as the thick one. Watch how often each red stripe comes round."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows only the two rollers and their shaft ends. The rings and posts that hold the shafts, the base, the angle between the shafts and the sizes were made up. The rollers here are true hyperboloids, so they touch along a whole straight line. Real rollers like these also slide a little along that line as they turn, which wears them. The choice of different sizes was added to show the change in speed.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = Math.PI / 180;
    var o = this.o = { a: 0, sets: {} };
    var GAP = 80, TT = 131, GAM = 25 * D, NS = 100;   // shortest distance between shafts; half length of the touching line; tilt of that distance
    // Rig: the touching line runs along world X through the origin. The common perpendicular of the shafts is Yr (up and back), Zr = X x Yr.
    var X = new T.Vector3(1, 0, 0), Yr = new T.Vector3(0, Math.cos(GAM), -Math.sin(GAM)), Zr = new T.Vector3(0, Math.sin(GAM), Math.cos(GAM));
    function comb(a, u, b, v) { return u.clone().multiplyScalar(a).add(v.clone().multiplyScalar(b)); }

    // Hyperboloid of one sheet, axis local Z, throat radius r, straight lines at angle be to the axis.
    // Point on line at angle ph, distance t: (r cos ph - t sin be sin ph, r sin ph + t sin be cos ph, t cos be). Ends at t = +-TT.
    function surf(r, be, f0, f1, nf, nt) {
      var sb = Math.sin(be), cb = Math.cos(be), pos = [], idx = [], i, j;
      for (j = 0; j <= nt; j++) for (i = 0; i <= nf; i++) {
        var ph = f0 + (f1 - f0) * i / nf, t = -TT + 2 * TT * j / nt;
        pos.push(r * Math.cos(ph) - t * sb * Math.sin(ph), r * Math.sin(ph) + t * sb * Math.cos(ph), t * cb);
      }
      for (j = 0; j < nt; j++) for (i = 0; i < nf; i++) {
        var a = j * (nf + 1) + i, b = a + 1, d = a + nf + 1, e = d + 1;
        idx.push(a, b, d, b, e, d);                     // outward faces (d/dph x d/dt points away from the axis)
      }
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    function roller(r, be, key, parent) {
      var st = 2 * Math.PI / NS, sb = Math.sin(be), H = TT * Math.cos(be), RE = Math.sqrt(r * r + TT * TT * sb * sb), del = Math.atan2(TT * sb, r);
      parent.add(P.mesh(surf(r, be, st / 2, 2 * Math.PI - st / 2, NS - 1, 16), c.mat(key)));
      parent.add(P.mesh(surf(r, be, -st / 2, st / 2, 1, 16), c.mat("stripe")));   // red stripe: one straight line of the surface, same vertices as its neighbours
      [1, -1].forEach(function (sd) {                  // end faces z = +-H, rim vertices at the same angles as the surface's end rings
        var cap = P.mesh(new T.CircleGeometry(RE, NS, st / 2 + del), c.mat(key));
        if (sd < 0) cap.rotation.x = Math.PI; cap.position.z = sd * H; parent.add(cap);
      });
      parent.add(P.cylZ(6, 2 * H + 56, c.mat(key)));     // shaft z -(H+28)..H+28, stubs stick out 28 past each end
      return { H: H, RE: RE };
    }
    var minY = 0, cols = [];
    function makeSet(name, b1, b2) {
      var t1 = Math.tan(b1), t2 = Math.tan(b2), r1 = GAP * t1 / (t1 + t2), r2 = GAP - r1;   // r1 / r2 = tan b1 / tan b2: the two surfaces share the touching line
      var set = { g: new T.Group(), ratio: -r1 * Math.cos(b1) / (r2 * Math.cos(b2)), spins: [] };
      scene.add(set.g);
      // roller 1 (upper): centre r1 along Yr, axis cos b1 X + sin b1 Zr; local x -> -Yr so its throat point is the origin
      // roller 2 (lower): centre -r2 along Yr, axis cos b2 X - sin b2 Zr; local x -> +Yr
      [[r1, b1, "drive", -1], [r2, b2, "driven", 1]].forEach(function (q) {
        var r = q[0], be = q[1], s = q[3];
        var ax = comb(Math.cos(be), X, -s * Math.sin(be), Zr), lx = Yr.clone().multiplyScalar(s), ly = comb(Math.sin(be), X, s * Math.cos(be), Zr);
        var hold = new T.Group(); hold.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(lx, ly, ax));
        hold.position.copy(Yr).multiplyScalar(-s * r); set.g.add(hold);
        var spin = new T.Group(); hold.add(spin); set.spins.push(spin);
        var R = roller(r, be, q[2], spin);
        [1, -1].forEach(function (sd) {
          var zr = sd * (R.H + 14);                     // ring z H+11..H+17 along the shaft, 3 thick; stub runs through to H+28
          P.at(P.hoop(9.5, 3, c.fixed), 0, 0, zr, hold); // inner edge 6.5, shaft radius 6: they do not touch
          var ctr = hold.position.clone().add(ax.clone().multiplyScalar(zr));
          var down = new T.Vector3(0, -1, 0); down.sub(ax.clone().multiplyScalar(down.dot(ax))).normalize();
          var foot = ctr.add(down.multiplyScalar(9.5));  // lowest point of the ring's centre circle; the post ends inside the ring's tube
          cols.push({ set: set.g, p: foot });
          // lowest point of the roller's end rim
          var lowEnd = hold.position.clone().add(ax.clone().multiplyScalar(sd * R.H)).add(new T.Vector3(0, -1, 0).sub(ax.clone().multiplyScalar(-ax.y)).normalize().multiplyScalar(R.RE));
          minY = Math.min(minY, lowEnd.y, foot.y);
        });
      });
      o.sets[name] = set;
    }
    makeSet("same", 20 * D, 20 * D);
    makeSet("diff", 26 * D, 14 * D);
    var BY = Math.floor(minY) - 16;                     // base top
    cols.forEach(function (q) {                         // post from the base top y = BY up into the ring
      var L = q.p.y - BY; P.at(P.cylY(3, L, c.fixed), q.p.x, BY + L / 2, q.p.z, q.set);
    });
    P.at(P.box(400, 10, 230, c.fixed), 0, BY - 5, 0, scene);   // base y BY-10..BY; posts stand on y = BY
    o.spinStart = -2.0;                                 // stripes start in view, before they meet
  },

  step: function (c, dt, S) {
    var o = this.o, k, cur = o.sets[S.controls.size] || o.sets.same;
    o.a += S.w * dt;
    for (k in o.sets) o.sets[k].g.visible = o.sets[k] === cur;
    cur.spins[0].rotation.z = o.spinStart + o.a;
    cur.spins[1].rotation.z = (o.spinStart + o.a) * cur.ratio;   // surfaces move together across the touching line
    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("out", f(rpm === 0 ? 0 : rpm * cur.ratio));
  }
});
