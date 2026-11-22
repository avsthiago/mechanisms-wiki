M507.define({
  number: 414,
  title: "Scroll gear and sliding pinion",
  lede: "A small gear turns a plate whose teeth run round it in a spiral. The gear slides along its shaft to keep up with the spiral. Turned one way the plate speeds up; turned back it slows down.",
  alt: "A round plate with a band of teeth that winds round its face in a spiral of about one and a half turns. A shaft runs straight up across the front of the plate, and a small gear on it meshes with the spiral near the bottom.",
  parts: [
    { key: "pinion", color: "#5E7387", name: "Pinion", note: "The small driving gear. It turns with the shaft but can slide along it, so it follows the spiral in and out." },
    { key: "shaft", color: "#D9B13B", name: "Driving shaft and feather", note: "The shaft turns at a steady speed. A long key on it, called a feather, fits a slot in the pinion so the pinion must turn with it but is free to slide." },
    { key: "plate", color: "#C8873A", name: "Scroll plate", note: "Its teeth stand on a band that winds round in a spiral, called a scroll. Watch the red stripe in the middle to see how fast it turns." }
  ],
  controls: [],
  readouts: [{ id: "p", label: "Pinion" }, { id: "a", label: "Plate" }],
  views: { "3d": [110, 60, 660], front: [0, 0, 800], side: [800, 0, 60] },
  target: [0, -5, 0],
  how: [
    "The shaft turns at one steady speed, and so does the small gear on it, called a pinion. Its teeth push the teeth of the spiral sideways, so the plate turns. As it turns, the spiral under the shaft moves in or out, and the pinion slides along the shaft to stay on it.",
    "Each tooth the pinion pushes moves the plate by the same distance along the spiral. Near the middle that distance is a bigger part of a turn, so the plate turns faster. Far out it is a smaller part, so the plate turns slower.",
    "The shaft turns one way until the pinion reaches an end of the spiral, then turns back. Watch the plate readout and the red stripe: they speed up while the pinion slides inward and slow down while it slides out."
  ],
  note: "This model is rebuilt from Brown's drawing. The three arms and hub behind the scroll, the back plate and the brackets that hold the shafts, the sizes, the number of teeth and the spacing of the spiral were made up. Brown does not say what turns the shaft; here it simply turns back at each end of the spiral.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var MD = 4, p = Math.PI * MD, W = 30;
    var o = this.o = { MD: MD, p: p, R0: 80, PS: 49, F0: Math.PI, F1: 12.13, d: -1, zp: 33 };
    var NP = 12;
    o.T = function (f) { var u = f - o.F0; return o.R0 * u + o.PS * u * u / (4 * Math.PI); };   // tangential length from the inner end
    o.Tinv = function (t) { var a = o.PS / (4 * Math.PI), b = o.R0; return o.F0 + (-b + Math.sqrt(b * b + 4 * a * t)) / (2 * a); };
    o.r = function (f) { return o.R0 + o.PS * (f - o.F0) / (2 * Math.PI); };
    o.N = Math.floor(o.T(o.F1) / p);

    // scroll plate: the spiral band itself, 10 thick (z -6..4; r = 80 at the inner end, 49 more per turn, 30 wide), held by
    // three arms (z -10..-6) from a hub (z -10..-2) on an axle from the back plate (z -40..-10); teeth stand on z 4..11.8
    o.plate = new T.Group(); scene.add(o.plate);
    var mp = c.mat("plate");
    P.at(P.cylZ(16, 8, mp), 0, 0, -6, o.plate);                             // hub z -10..-2
    P.at(P.cylZ(10, 30, mp), 0, 0, -25, o.plate);                           // axle z -40..-10
    var band = P.spiralRib({ r0: o.R0 - o.PS / 2, pitch: o.PS, from: o.F0, to: o.F1, width: W, height: 10, segments: 400, material: mp });
    band.position.z = -6; o.plate.add(band);
    [Math.PI / 2, 7 * Math.PI / 6, 11 * Math.PI / 6].forEach(function (a, j) {
      var re = 0;                                                           // outermost turn of the band at this angle
      for (var n = -1; n < 3; n++) { var ff = a + 2 * Math.PI * n; if (ff >= o.F0 && ff <= o.F1) re = Math.max(re, o.r(ff)); }
      var L = re + W / 2 - 2 - 10, arm = P.box(L, 12, 4, mp); arm.rotation.z = a;
      P.at(arm, (10 + L / 2) * Math.cos(a), (10 + L / 2) * Math.sin(a), -8, o.plate);   // r 10..outer edge less 2, z -10..-6
      if (!j) { var mk = P.box(44, 5, 1, c.mat("plate", "mark")); mk.rotation.z = a; P.at(mk, 38 * Math.cos(a), 38 * Math.sin(a), -5, o.plate); }   // red stripe r 16..60, z -5.5..-4.5
    });
    // teeth: radial ridges across the band at equal steps of tangential length, rack proportions as P.rack
    var pos = [], rf = 4, ra = 4 + 1.25 * MD + .7 * MD, wr = .27 * p, wt = .11 * p, prof = [[-wr, rf], [-wt, ra], [wt, ra], [wr, rf]];
    for (var k = 0; k < o.N; k++) {
      var f = o.Tinv((k + .5) * p), rk = o.r(f), ux = Math.cos(f), uy = Math.sin(f), tx = -uy, ty = ux;
      var ends = [rk - W / 2 + 1, rk + W / 2 - 1], v = [];
      ends.forEach(function (rho) { prof.forEach(function (q) { v.push([rho * ux + q[0] * tx, rho * uy + q[0] * ty, q[1]]); }); });
      var cx = rk * ux, cy = rk * uy, cz = (rf + ra) / 2, tris = [];
      for (i = 0; i < 3; i++) { tris.push([v[i], v[i + 1], v[i + 5]]); tris.push([v[i], v[i + 5], v[i + 4]]); }   // flanks and top
      tris.push([v[0], v[1], v[2]], [v[0], v[2], v[3]], [v[4], v[5], v[6]], [v[4], v[6], v[7]]);                 // end faces
      tris.forEach(function (t) {
        var a = new T.Vector3().fromArray(t[0]), b = new T.Vector3().fromArray(t[1]), cc = new T.Vector3().fromArray(t[2]);
        var nrm = new T.Vector3().subVectors(b, a).cross(new T.Vector3().subVectors(cc, a));
        var mid = new T.Vector3().addVectors(a, b).add(cc).multiplyScalar(1 / 3).sub(new T.Vector3(cx, cy, cz));
        if (nrm.dot(mid) < 0) { var s = t[1]; t[1] = t[2]; t[2] = s; }
        t.forEach(function (q) { pos.push(q[0], q[1], q[2]); });
      });
    }
    var tg = new T.BufferGeometry(); tg.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); tg.computeVertexNormals();
    o.plate.add(P.mesh(tg, mp));

    // shaft along world Y in front of the plate at z 33, from bracket face to bracket face (y -190..190), with its feather
    o.zp = 4 + 1.25 * MD + NP * MD / 2;                                     // pitch line z 9, plus the pinion's pitch radius 24
    o.shaft = new T.Group(); o.shaft.position.set(0, 0, o.zp); scene.add(o.shaft);
    P.at(P.cylY(6, 380, c.mat("shaft")), 0, 0, 0, o.shaft);
    P.at(P.box(3, 378, 2.5, c.mat("shaft", "dark")), 0, 0, 6.75, o.shaft);  // feather r 5.5..8, along the whole shaft
    // pinion: spurGear axis local Z turned to world Y; its local +Y then points at the plate (-Z)
    o.pin = new T.Group(); o.pin.position.z = o.zp; scene.add(o.pin);
    o.gear = P.spurGear({ teeth: NP, module: MD, width: 22, bore: 6.5, material: c.mat("pinion") });
    o.gq = new T.Group(); o.gq.rotation.x = -Math.PI / 2; o.pin.add(o.gq); o.gq.add(o.gear);
    var hub = P.cylZ(11, 12, c.mat("pinion")); hub.position.z = -17; o.gear.add(hub);   // collar below the gear, y -23..-11 world, as drawn
    o.rp = o.gear.pitchRadius; o.st = o.gear.pitch;

    // fixed: back plate z -50..-40; brackets y 190..206 and -206..-190, z -40..43, carrying the shaft ends
    P.at(P.box(460, 460, 10, c.fixed), 0, 0, -45, scene);
    P.at(P.box(28, 16, 83, c.fixed), 0, 198, 1.5, scene);
    P.at(P.box(28, 16, 83, c.fixed), 0, -198, 1.5, scene);

    o.Tc = o.T(11.0);                                                       // start as drawn: pinion on the outer turn at the bottom
    o.Tmin = 2.5 * p; o.Tmax = o.T(o.F1) - 2.5 * p;
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w;
    o.Tc += o.d * o.rp * w * dt;
    if (o.Tc < o.Tmin) { o.Tc = 2 * o.Tmin - o.Tc; o.d = 1; }
    if (o.Tc > o.Tmax) { o.Tc = 2 * o.Tmax - o.Tc; o.d = -1; }
    var fc = o.Tinv(o.Tc), rc = o.r(fc);
    o.plate.rotation.z = 1.5 * Math.PI - fc;                                 // the point of the spiral at fc sits straight under the shaft
    var g = Math.PI / 2 - o.st + o.Tc / o.rp;                                // pinion turned so its teeth fill the spiral's gaps
    o.gear.rotation.z = g;
    o.shaft.rotation.y = g;                                                  // turns with the pinion
    o.pin.position.y = -rc;

    function f(v) { v = Math.round(v * 10) / 10; return (v < 0 ? "−" + -v : v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("p", f(o.d * rpm));
    S.set("a", f(-o.d * rpm * o.rp / rc));
  }
});
