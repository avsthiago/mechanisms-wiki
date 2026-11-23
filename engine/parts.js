/* Reusable 3D parts. Every helper returns a THREE.Mesh or THREE.Group.
   Add a new helper here the first time a movement needs a part a later one will reuse. */
window.M507Parts = function (THREE) {
  var Q = Math.SQRT1_2;
  function mesh(g, m) { return new THREE.Mesh(g, m); }
  var P = {
    mesh: mesh,
    /** Position an object and add it to parent. Returns the object. */
    at: function (o, x, y, z, parent) { o.position.set(x, y, z); parent.add(o); return o; },
    box: function (w, h, d, m) { return mesh(new THREE.BoxGeometry(w, h, d), m); },
    sphere: function (r, m) { return mesh(new THREE.SphereGeometry(r, 20, 14), m); },
    /** Cylinders by axis. */
    cylY: function (r, len, m) { return mesh(new THREE.CylinderGeometry(r, r, len, 40), m); },
    cylX: function (r, len, m) { var c = P.cylY(r, len, m); c.rotation.z = Math.PI / 2; return c; },
    cylZ: function (r, len, m) { var c = P.cylY(r, len, m); c.rotation.x = Math.PI / 2; return c; },
    /** Straight bar, link or rope between two points. Call .span(ax, ay, az, bx, by, bz) to place it; cheap enough for every frame. */
    rod: function (radius, m) {
      var c = mesh(new THREE.CylinderGeometry(radius, radius, 1, 12), m), up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3();
      c.span = function (ax, ay, az, bx, by, bz) {
        d.set(bx - ax, by - ay, bz - az); var L = d.length() || 1e-6;
        c.scale.set(1, L, 1); c.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); c.quaternion.setFromUnitVectors(up, d.divideScalar(L)); return c;
      };
      return c;
    },
    /** Part of a hoop, for rope or belt wrapped round a pulley. In the XY plane, from angle 0 through `angle` radians. */
    arc: function (r, tube, angle, m) { return mesh(new THREE.TorusGeometry(r, tube, 10, 32, angle), m); },
    /** Hoop in the XY plane (axis Z). */
    hoop: function (r, tube, m) { return mesh(new THREE.TorusGeometry(r, tube, 12, 72), m); },

    /** Spur gear. Axis local Z, centred on the origin.
        o: {teeth, module (default 8), width (default 16), bore (default 0), holes (optional list of THREE.Path cut
        through the face, such as curved slots), material}
        Result has .pitchRadius and .pitch (radians per tooth). A tooth is centred on angle 0.
        Two gears mesh when their centres are pitchRadius1 + pitchRadius2 apart. */
    spurGear: function (o) {
      var N = o.teeth, md = o.module || 8, w = o.width || 16, rp = N * md / 2, ra = rp + md, rf = rp - 1.25 * md;
      var st = 2 * Math.PI / N, sh = new THREE.Shape(), i, a;
      function pt(r, ang, first) { var x = r * Math.cos(ang), y = r * Math.sin(ang); if (first) sh.moveTo(x, y); else sh.lineTo(x, y); }
      for (i = 0; i < N; i++) {
        a = i * st;
        pt(rf, a - .27 * st, i === 0); pt(ra, a - .11 * st); pt(ra, a + .11 * st); pt(rf, a + .27 * st);
      }
      sh.closePath();
      if (o.bore) { var hole = new THREE.Path(); hole.absarc(0, 0, o.bore, 0, 2 * Math.PI, true); sh.holes.push(hole); }
      if (o.holes) o.holes.forEach(function (h) { sh.holes.push(h); });   // optional: extra THREE.Path holes (slots) cut through the face
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false });
      g.translate(0, 0, -w / 2);
      var gear = mesh(g, o.material); gear.pitchRadius = rp; gear.pitch = st;
      return gear;
    },

    /** Part of a spur gear, for sector-and-pinion drives. Axis local Z, pivot at the origin.
        o: {teeth (count for the full circle), module, fromDeg, toDeg, width (default 8), material}
        Teeth sit on multiples of .pitch, exactly as on spurGear. Result has .pitchRadius and .pitch. */
    gearSector: function (o) {
      var N = o.teeth, md = o.module || 8, w = o.width || 8, rp = N * md / 2, ra = rp + md, rf = rp - 1.25 * md, st = 2 * Math.PI / N;
      var i0 = Math.ceil(o.fromDeg * Math.PI / 180 / st), i1 = Math.floor(o.toDeg * Math.PI / 180 / st), sh = new THREE.Shape();
      sh.moveTo(0, 0);
      function L(r, a) { sh.lineTo(r * Math.cos(a), r * Math.sin(a)); }
      for (var i = i0; i <= i1; i++) { var a = i * st; L(rf, a - .27 * st); L(ra, a - .11 * st); L(ra, a + .11 * st); L(rf, a + .27 * st); }
      sh.closePath();
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2);
      var s = mesh(g, o.material); s.pitchRadius = rp; s.pitch = st; return s;
    },

    /** Spur gear with teeth on only part of its rim (a mutilated gear), for stop-and-go drives.
        Axis local Z, centred on the origin. o: {teeth (count for the full circle), module (default 8), fromDeg, toDeg
        (the toothed arc, measured anticlockwise from +X), width (default 16), bore (default 0), material}
        Teeth sit on multiples of .pitch exactly as on spurGear, so a rack or gear of the same module meshes with it.
        Optional relief (default 0): that many teeth at each end of the arc are cut down to stubs a fifth of full height,
        so a pinion can change direction there without striking them.
        Result has .pitchRadius, .pitch, .from and .to (the toothed arc in radians, at the tooth roots). */
    partGear: function (o) {
      var N = o.teeth, md = o.module || 8, w = o.width || 16, rp = N * md / 2, ra = rp + md, rf = rp - 1.25 * md, st = 2 * Math.PI / N;
      var i0 = Math.ceil(o.fromDeg * Math.PI / 180 / st), i1 = Math.floor(o.toDeg * Math.PI / 180 / st);
      var a0 = i0 * st - .27 * st, a1 = i1 * st + .27 * st, sh = new THREE.Shape(), i;
      function pt(r, ang, first) { var x = r * Math.cos(ang), y = r * Math.sin(ang); if (first) sh.moveTo(x, y); else sh.lineTo(x, y); }
      pt(rf, a0, true);
      for (i = i0; i <= i1; i++) {
        var a = i * st, rt = Math.min(i - i0, i1 - i) < (o.relief || 0) ? rf + .2 * (ra - rf) : ra;
        pt(rf, a - .27 * st); pt(rt, a - .11 * st); pt(rt, a + .11 * st); pt(rf, a + .27 * st);
      }
      sh.absarc(0, 0, rf, a1, a0 + 2 * Math.PI, false);      // plain rim, back to where the teeth start
      sh.closePath();
      if (o.bore) { var hole = new THREE.Path(); hole.absarc(0, 0, o.bore, 0, 2 * Math.PI, true); sh.holes.push(hole); }
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 48 });
      g.translate(0, 0, -w / 2);
      var gear = mesh(g, o.material); gear.pitchRadius = rp; gear.pitch = st; gear.from = a0; gear.to = a1;
      return gear;
    },

    /** Straight spur rack: a bar with gear teeth along one long edge, for turning rotation into a straight push.
        Local Y runs along the bar from y = 0 to y = length; the pitch line is x = 0; it is `thick` deep, centred on z = 0.
        o: {teeth, module (default 8), side (1 = teeth on the +X edge, -1 = on the -X edge; default 1), body (depth of the
        bar behind the tooth roots, default 16), thick (default 16), slot (optional {from, to, half, x}: a round-ended
        slot through the bar along Y, centred on x, default the middle of the body), material}
        Teeth sit on the same pitch as spurGear, so a gear of the same module meshes with it when its centre is
        pitchRadius from the pitch line. Tooth n is centred on y = (n + .5) * pitch, so a gap is centred on y = 0.
        Result has .pitch, .root (x of the tooth roots), .tip (x of the tooth tips) and .length. */
    rack: function (o) {
      var N = o.teeth, md = o.module || 8, p = Math.PI * md, s = o.side < 0 ? -1 : 1, b = o.body || 16, t = o.thick || 16;
      var rf = -1.25 * md, ra = .7 * md, L = N * p, sh = new THREE.Shape(), i;
      function pt(x, y, first) { if (first) sh.moveTo(s * x, y); else sh.lineTo(s * x, y); }
      pt(rf, 0, true);
      for (i = 0; i < N; i++) {
        var y = (i + .5) * p;
        pt(rf, y - .27 * p); pt(ra, y - .11 * p); pt(ra, y + .11 * p); pt(rf, y + .27 * p);
      }
      pt(rf, L); pt(rf - b, L); pt(rf - b, 0);
      sh.closePath();
      if (o.slot) {
        var q = o.slot, cx = q.x === undefined ? rf - b / 2 : q.x, hole = new THREE.Path();
        hole.moveTo(cx + q.half, q.from + q.half); hole.lineTo(cx + q.half, q.to - q.half);
        hole.absarc(cx, q.to - q.half, q.half, 0, Math.PI, false); hole.lineTo(cx - q.half, q.from + q.half);
        hole.absarc(cx, q.from + q.half, q.half, Math.PI, 2 * Math.PI, false);
        sh.holes.push(hole);
      }
      var g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, -t / 2);
      var m = mesh(g, o.material); m.pitch = p; m.root = s * rf; m.tip = s * ra; m.length = L;
      return m;
    },

    /** Text that always faces the camera, for dial numbers and the like. size is the height in model units. */
    label: function (text, size, color) {
      var cv = document.createElement("canvas"); cv.width = cv.height = 128;
      var x = cv.getContext("2d"); x.font = "600 84px IBM Plex Sans, system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillStyle = color || "#14283A"; x.fillText(text, 64, 68);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
      sp.scale.set(size, size, 1);
      sp.renderOrder = 10;      // draw after the parts: every part material is transparent-capable, so without this a label can be painted over by the surface behind it
      return sp;
    },

    /** Mitre (1:1, 45 degree) bevel gear. Axis local +Y, pitch-cone apex at the local origin,
        teeth facing the apex. o: {radius, teeth, face (0..1, default .68), addendum (default 7), material}
        Result has .pitch. A tooth is centred on azimuth 0 (local +X).
        To mesh two of them, give both the same apex and offset one by half a pitch.
        The body's root cone lies addendum below the pitch cone; tooth tips stand only .8 * addendum above it, leaving a
        small gap so a tip never lies on the mating gear's root cone (that flickers). Pitch geometry is unchanged. */
    bevelGear: function (o) {
      var RG = o.radius, NT = o.teeth, S0 = o.face || .68, H = o.addendum || 7, mat = o.material, pitch = 2 * Math.PI / NT, TIP = .8;
      var g = new THREE.Group();
      var rB = RG - H * Q, yB = RG + H * Q, rA = S0 * rB, yA = S0 * yB;
      var pts = [[0, yA], [rA, yA], [rB, yB], [rB + 1, yB + 8], [RG * .5, yB + 24], [20, yB + 24], [20, yB + 44], [0, yB + 44]]
        .map(function (p) { return new THREE.Vector2(p[0], p[1]); });
      g.add(mesh(new THREE.LatheGeometry(pts, 72), mat));
      var pos = [];
      function V(a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
      function quad(a, b, c, d) { V(a, b, c); V(a, c, d); }
      for (var i = 0; i < NT; i++) {
        var f = i * pitch, c = Math.cos(f), s = Math.sin(f), v = [];
        [S0, 1].forEach(function (sc) {
          var cx = sc * RG * c, cy = sc * RG, cz = sc * RG * s, h = sc * H, wr = sc * RG * .082, wt = sc * RG * .042;
          function pt(dn, dt) { return [cx + dn * c * Q - dt * s, cy - dn * Q, cz + dn * s * Q + dt * c]; }
          v.push(pt(-1.4 * h, -wr), pt(-1.4 * h, wr), pt(TIP * h, wt), pt(TIP * h, -wt));   // tips stop short of the mate's root cone (-h), so the two never share a surface
        });
        quad(v[0], v[1], v[2], v[3]); quad(v[4], v[5], v[6], v[7]);
        quad(v[0], v[3], v[7], v[4]); quad(v[1], v[2], v[6], v[5]); quad(v[3], v[2], v[6], v[7]);
      }
      var tg = new THREE.BufferGeometry();
      tg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); tg.computeVertexNormals();
      g.add(mesh(tg, mat));
      g.pitch = pitch; g.innerFaceY = yA; g.backY = yB + 44;
      return g;
    },

    /** Spoked belt pulley. Axis local Z, centred on the origin.
        o: {radius (outside of the rim), width (default 24), rim (rim thickness, default 6), spokes (default 4), hub (default radius * .22), material}
        Result has .radius and .spokes (the spoke meshes, so one can be given a marking material). */
    pulley: function (o) {
      var R = o.radius, w = o.width || 24, t = o.rim || 6, n = o.spokes || 4, hr = o.hub || Math.max(6, R * .22), m = o.material;
      var g = new THREE.Group(), sh = new THREE.Shape(), hole = new THREE.Path();
      sh.absarc(0, 0, R, 0, 2 * Math.PI, false); hole.absarc(0, 0, R - t, 0, 2 * Math.PI, true); sh.holes.push(hole);
      var rg = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 48 }); rg.translate(0, 0, -w / 2);
      g.add(mesh(rg, m));
      g.add(P.cylZ(hr, w * .9, m));
      g.spokes = [];
      var sl = R - t - hr + 2, sw = Math.max(3, R * .07);
      for (var i = 0; i < n; i++) {
        var a = i * 2 * Math.PI / n, s = P.box(sl, sw, sw * 1.3, m), mid = hr + sl / 2 - 1;
        s.position.set(mid * Math.cos(a), mid * Math.sin(a), 0); s.rotation.z = a; g.add(s); g.spokes.push(s);
      }
      g.radius = R;
      return g;
    },
    /** Drum with a flange at each end, for a belt or rope wound round it (capstans, winches, barrels). Axis local Z, centred.
        o: {radius (of the barrel), length (of the barrel, between flanges), flange (how far the flanges stand out, default 8),
        flangeThick (default 4), material, mark (optional material for a stripe on the front flange, to see it turn)}
        Total length is length + 2 * flangeThick. Result has .radius and .mark (the stripe, if any). */
    drum: function (o) {
      var R = o.radius, L = o.length, F = o.flange || 8, ft = o.flangeThick || 4, g = new THREE.Group();
      g.add(P.cylZ(R, L, o.material));
      [-1, 1].forEach(function (sd) { P.at(P.cylZ(R + F, ft, o.material), 0, 0, sd * (L + ft) / 2, g); });
      if (o.mark) g.mark = P.at(P.box(R + F - 4, 4, 1.5, o.mark), (R + F) / 2, 0, L / 2 + ft + .75, g);   // stripe on the face, z L/2+ft .. +1.5
      g.radius = R;
      return g;
    },

    /** Flat belt round two pulleys in the XY plane (pulley axes along Z), open or crossed.
        o: {width (along Z, default 20), thick (default 3), material}
        Call .set(x1, y1, r1, x2, y2, r2, crossed) to (re)build it; r is the radius at the middle of the belt, so a pulley rim
        under it has radius r - thick / 2. Open: both pulleys turn the same way. Crossed: the runs cross between the pulleys,
        pulley 2 turns the other way, and each run makes a half twist so the same face touches both pulleys; where the runs
        cross they lie flat, one just in front of the other.
        After .set: .length, and .pointAt(s) returns {x, y, z, a, tw} at distance s along the belt, going anticlockwise
        round pulley 1 first (a is the direction of travel in XY, tw the twist about it). .place(obj, s) puts a child of the
        belt (a mark: long along local X, thin along Y, wide along Z) on the belt at s. Pulley 1 turning anticlockwise at
        w rad/s moves the belt forward at w * r1. */
    belt: function (o) {
      var w = o.width || 20, t = o.thick || 3, b = mesh(new THREE.BufferGeometry(), o.material), segs = [];
      function pointAt(s) {
        var L = b.length; s = ((s % L) + L) % L;
        for (var i = 0; i < segs.length; i++) {
          var g = segs[i];
          if (s <= g.len || i === segs.length - 1) {
            if (g.r) { var th = g.a0 + g.dir * s / g.r; return { x: g.cx + g.r * Math.cos(th), y: g.cy + g.r * Math.sin(th), z: 0, a: th + g.dir * Math.PI / 2, tw: g.tw }; }
            var f = s / g.len, tw = g.tw, z = 0;
            if (g.cross) {     // half twist, flat over a stretch round the crossing point g.cross (fraction of the run)
              var h = f < g.cross ? f / g.cross - 1 : (f - g.cross) / (1 - g.cross);
              tw += Math.PI / 2 * (1 + h * Math.abs(h)); z = (t / 2 + .6) * Math.sin(tw);
            }
            return { x: g.x0 + (g.x1 - g.x0) * f, y: g.y0 + (g.y1 - g.y0) * f, z: z, a: Math.atan2(g.y1 - g.y0, g.x1 - g.x0), tw: tw };
          }
          s -= g.len;
        }
      }
      b.pointAt = pointAt;
      b.place = function (obj, s) { var pt = pointAt(s); obj.position.set(pt.x, pt.y, pt.z); obj.rotation.set(-pt.tw, 0, pt.a, "ZYX"); return obj; };
      b.set = function (x1, y1, r1, x2, y2, r2, crossed) {
        var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy), be = Math.atan2(dy, dx), k = crossed ? -1 : 1;
        var al = Math.acos((r1 - k * r2) / d), p = be + al, q = be - al;     // directions of the tangent points from centre 1
        function ux(a) { return Math.cos(a); } function uy(a) { return Math.sin(a); }
        segs = [
          { r: r1, cx: x1, cy: y1, a0: p, dir: 1, tw: 0, len: r1 * (2 * Math.PI - 2 * al) },
          { x0: x1 + r1 * ux(q), y0: y1 + r1 * uy(q), x1: x2 + k * r2 * ux(q), y1: y2 + k * r2 * uy(q), tw: 0 },
          crossed ? { r: r2, cx: x2, cy: y2, a0: q + Math.PI, dir: -1, tw: Math.PI, len: r2 * (2 * Math.PI - 2 * al) }
                  : { r: r2, cx: x2, cy: y2, a0: q, dir: 1, tw: 0, len: r2 * 2 * al },
          { x0: x2 + k * r2 * ux(p), y0: y2 + k * r2 * uy(p), x1: x1 + r1 * ux(p), y1: y1 + r1 * uy(p), tw: crossed ? Math.PI : 0 }
        ];
        if (crossed) { segs[1].cross = r1 / (r1 + r2); segs[3].cross = r2 / (r1 + r2); }
        segs[1].len = segs[3].len = Math.sqrt(d * d - (r1 - k * r2) * (r1 - k * r2));
        b.length = segs.reduce(function (s, g) { return s + g.len; }, 0);
        var N = crossed ? 360 : 240, pos = [], idx = [], f, i;
        for (i = 0; i < N; i++) {
          var pt = pointAt(i * b.length / N), ca = Math.cos(pt.a), sa = Math.sin(pt.a), ct = Math.cos(pt.tw), st = Math.sin(pt.tw);
          // v: across the thickness, outward from the pulleys; u: across the width (Z when untwisted)
          var v = [ct * sa, -ct * ca, st], u = [-st * sa, st * ca, ct];
          function c(sv, su) { return [pt.x + sv * v[0] * t / 2 + su * u[0] * w / 2, pt.y + sv * v[1] * t / 2 + su * u[1] * w / 2, pt.z + sv * v[2] * t / 2 + su * u[2] * w / 2]; }
          // four faces, each with its own vertices so the edges stay crisp: inside, outside, front edge, back edge
          [[c(-1, -1), c(-1, 1)], [c(1, 1), c(1, -1)], [c(-1, 1), c(1, 1)], [c(1, -1), c(-1, -1)]].forEach(function (fc) {
            pos.push(fc[0][0], fc[0][1], fc[0][2], fc[1][0], fc[1][1], fc[1][2]);
          });
        }
        for (i = 0; i < N; i++) for (f = 0; f < 4; f++) {
          var a0 = (i * 4 + f) * 2, a1 = (((i + 1) % N) * 4 + f) * 2;
          idx.push(a0, a1, a0 + 1, a0 + 1, a1, a1 + 1);
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
        b.geometry.dispose(); b.geometry = geo;
        return b;
      };
      return b;
    },

    /** Flat belt along any 3D path of pulley wraps, for belts that twist between shafts at an angle (quarter-turn drives,
        guide pulleys). o: {width (default 20), thick (default 3), material}
        Call .set(wraps) to (re)build it. Each wrap is {c: [x,y,z] centre, axis: [x,y,z] unit pulley axis, u: [x,y,z] unit
        vector to the angle-0 point (perpendicular to axis), r (radius at the middle of the belt), a0 (start angle), sweep
        (signed radians; positive goes from u towards axis × u)}. The belt runs round the wraps in order, joined by straight
        runs from the end of each wrap to the start of the next and from the last back to the first. On a wrap the belt's
        width lies along the axis; on a straight run it twists evenly from one to the next, so a run between crossed axes
        makes a quarter twist. After .set: .length, .pointAt(s) returns {p, t, w} (position, direction of travel, width
        direction, as arrays), and .place(obj, s) puts a child (long along local X, thin along Y, wide along Z) on the belt.
        Travel at s increasing moves round wrap 0 in the direction of its sweep.
        Options on a wrap: rise (advance along the axis over the whole sweep, for a belt wound round a drum in a helix);
        cross, lift, turn (for the run that leaves this wrap: lift it by `lift` along this wrap's axis, most at the fraction
        `cross` of the run and flat there, so two crossed runs pass one in front of the other; turn = +1 or -1 picks the way
        a half twist turns). Option on the belt: o.sameFace = true keeps the same face against every pulley (width along
        sign(sweep) * axis), so a run between pulleys turning opposite ways gets a half twist, as a real crossed belt does. */
    beltPath: function (o) {
      var w = o.width || 20, t = o.thick || 3, b = mesh(new THREE.BufferGeometry(), o.material), segs = [];
      function add(a, b2, k) { return [a[0] + b2[0] * k, a[1] + b2[1] * k, a[2] + b2[2] * k]; }
      function dot(a, c) { return a[0] * c[0] + a[1] * c[1] + a[2] * c[2]; }
      function cross(a, c) { return [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]]; }
      function norm(a) { var l = Math.sqrt(dot(a, a)) || 1e-9; return [a[0] / l, a[1] / l, a[2] / l]; }
      function wrapAt(g, th) {
        var c = Math.cos(th), s = Math.sin(th), d = g.sweep < 0 ? -1 : 1;
        var p = add(add(g.c, g.u, g.r * c), g.v, g.r * s), t = add([-s * g.u[0] * d, -s * g.u[1] * d, -s * g.u[2] * d], g.v, c * d), wd = g.wd;
        if (g.rise) {
          p = add(p, g.axis, g.rise * (th - g.a0) / g.sweep);
          t = norm(add([t[0] * g.r * Math.abs(g.sweep), t[1] * g.r * Math.abs(g.sweep), t[2] * g.r * Math.abs(g.sweep)], g.axis, g.rise));
          wd = norm(add(wd, t, -dot(wd, t)));
        }
        return { p: p, t: t, w: wd };
      }
      function pointAt(s) {
        var L = b.length; s = ((s % L) + L) % L;
        for (var i = 0; i < segs.length; i++) {
          var g = segs[i];
          if (s <= g.len || i === segs.length - 1) {
            var f = Math.min(1, s / g.len);
            if (g.r) return wrapAt(g, g.a0 + g.sweep * f);
            var e = f;
            if (g.cross) { var h = f < g.cross ? f / g.cross - 1 : (f - g.cross) / (1 - g.cross); e = (1 + h * Math.abs(h)) / 2; }
            var ca = Math.cos(g.th * e), sa = Math.sin(g.th * e), p = add(g.p0, g.d, g.len * f);
            if (g.lift) p = add(p, g.la, g.lift * Math.sin(Math.PI * e));
            return { p: p, t: g.d, w: norm(add([g.w0[0] * ca, g.w0[1] * ca, g.w0[2] * ca], g.n0, sa)) };
          }
          s -= g.len;
        }
      }
      b.pointAt = pointAt;
      var M = new THREE.Matrix4();
      b.place = function (obj, s) {
        var pt = pointAt(s), n = cross(pt.w, pt.t);
        M.makeBasis(new THREE.Vector3().fromArray(pt.t), new THREE.Vector3().fromArray(n), new THREE.Vector3().fromArray(pt.w));
        obj.position.fromArray(pt.p); obj.quaternion.setFromRotationMatrix(M); return obj;
      };
      b.set = function (wraps) {
        segs = []; var sign = 1, prev = null, i, k;
        var ws = wraps.map(function (q) {
          var L = Math.abs(q.sweep) * q.r;
          return { r: q.r, c: q.c, u: q.u, v: cross(q.axis, q.u), axis: q.axis, a0: q.a0, sweep: q.sweep, rise: q.rise || 0,
            cross: q.cross, lift: q.lift, turn: q.turn, len: q.rise ? Math.sqrt(L * L + q.rise * q.rise) : L };
        });
        // keep the width direction continuous round the loop: flip a wrap's width if the run into it would turn more than 90 degrees
        for (i = 0; i < ws.length; i++) {
          var g = ws[i];
          if (o.sameFace) { g.wd = g.sweep < 0 ? [-g.axis[0], -g.axis[1], -g.axis[2]] : g.axis; continue; }
          if (prev) {
            var e = wrapAt(prev, prev.a0 + prev.sweep), st = wrapAt(g, g.a0), d = norm(add(st.p, e.p, -1));
            var w0 = norm(add(prev.wd, d, -dot(prev.wd, d))), w1 = norm(add(g.axis, d, -dot(g.axis, d)));
            if (dot(w0, w1) < 0) sign = -sign;
          }
          g.wd = sign > 0 ? g.axis : [-g.axis[0], -g.axis[1], -g.axis[2]];
          prev = g;
        }
        for (i = 0; i < ws.length; i++) {
          var A = ws[i], B = ws[(i + 1) % ws.length], ea = wrapAt(A, A.a0 + A.sweep), sb = wrapAt(B, B.a0);
          var dv = add(sb.p, ea.p, -1), len = Math.sqrt(dot(dv, dv)), dn = norm(dv);
          var a = norm(add(A.wd, dn, -dot(A.wd, dn))), c = norm(add(B.wd, dn, -dot(B.wd, dn)));
          // twist: rotate the width about the run from a to c; a half twist turns the way A.turn says
          var th = Math.atan2(dot(cross(a, c), dn), dot(a, c));
          if (Math.abs(th) > Math.PI - 1e-3) th = (A.turn || 1) * Math.PI;
          segs.push(A, { p0: ea.p, d: dn, len: len, w0: a, n0: cross(dn, a), th: th, cross: A.cross, lift: A.lift, la: A.axis });
        }
        b.length = segs.reduce(function (s2, g2) { return s2 + g2.len; }, 0);
        var N = Math.max(240, Math.round(b.length / 2)), pos = [], idx = [], f;
        for (i = 0; i < N; i++) {
          var pt = pointAt(i * b.length / N), v = cross(pt.t, pt.w), u = pt.w;     // same face winding as belt()
          function cc(sv, su) { return add(add(pt.p, v, sv * t / 2), u, su * w / 2); }
          [[cc(-1, -1), cc(-1, 1)], [cc(1, 1), cc(1, -1)], [cc(-1, 1), cc(1, 1)], [cc(1, -1), cc(-1, -1)]].forEach(function (fc) {
            pos.push(fc[0][0], fc[0][1], fc[0][2], fc[1][0], fc[1][1], fc[1][2]);
          });
        }
        for (i = 0; i < N; i++) for (f = 0; f < 4; f++) {
          var a0 = (i * 4 + f) * 2, a1 = (((i + 1) % N) * 4 + f) * 2;
          idx.push(a0, a1, a0 + 1, a0 + 1, a1, a1 + 1);
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
        b.geometry.dispose(); b.geometry = geo;
        return b;
      };
      return b;
    },

    /** Solid pulley turned to any outline (cones, curved cones, stepped pulleys). Axis local Z, like pulley() and drum().
        o: {profile (function z -> radius), length (z runs -length/2 .. length/2), samples (default 48)} or
        o: {points: [[r, z], ...] along the outline with z increasing; repeat a point to make a sharp edge there},
        plus material, segments (round the axis, default 72) and mark (optional material for a thin stripe along the
        surface at angle 0, to see it turn). Both ends are closed with flat faces, so a shaft can end on them.
        Result has .mark (the stripe, if any), .z0 and .z1 (the end faces). */
    lathePulley: function (o) {
      var pts = o.points, i, n;
      if (!pts) {
        pts = []; n = o.samples || 48;
        for (i = 0; i <= n; i++) { var z = -o.length / 2 + o.length * i / n; pts.push([o.profile(z), z]); }
      }
      var first = pts[0], last = pts[pts.length - 1];
      function V(p, dr) { return new THREE.Vector2(p[0] + (dr || 0), p[1]); }
      // the outline is drawn from the axis out, along the surface and back to the axis; the corners at the end faces are doubled so they stay sharp
      var line = [V([0, first[1]]), V(first)].concat(pts.map(function (p) { return V(p); }), [V(last), V([0, last[1]])]);
      var g = new THREE.Group(), geo = new THREE.LatheGeometry(line, o.segments || 72);
      geo.rotateX(Math.PI / 2);                    // lathe axis Y -> Z
      g.add(mesh(geo, o.material));
      if (o.mark) {
        // lift the stripe off the surface along the outline's outward normal (dz, -dr), so it never lies in a flat step face
        var nrm = function (a, b) { var dr = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dr, dz); return l < 1e-6 ? null : [dz / l, -dr / l]; };
        var lifted = pts.map(function (p, k) {
          var a = k > 0 ? nrm(pts[k - 1], p) : null, b = k < pts.length - 1 ? nrm(p, pts[k + 1]) : null;
          var nn = a && b ? [a[0] + b[0], a[1] + b[1]] : (a || b || [1, 0]), l = Math.hypot(nn[0], nn[1]) || 1;
          return new THREE.Vector2(p[0] + .6 * nn[0] / l, p[1] + .6 * nn[1] / l);
        });
        var mg = new THREE.LatheGeometry(lifted, 1, -.06, .12);
        mg.rotateX(Math.PI / 2);
        g.mark = mesh(mg, o.mark); g.add(g.mark);
      }
      g.z0 = first[1]; g.z1 = last[1];
      return g;
    },

    /** Stepped (speed) pulley: a stack of short drums of different radii on one axis. Axis local Z, centred.
        o: {radii: [r, ...] in order along +Z, width (of each step along Z, default 24), material, mark (as in lathePulley)}
        Result has .radii, .width, .stepZ(i) (the z of the middle of step i), .z0 and .z1 (the end faces). */
    stepPulley: function (o) {
      var R = o.radii, w = o.width || 24, n = R.length, L = n * w, pts = [];
      for (var i = 0; i < n; i++) {
        var zs = -L / 2 + i * w, ze = zs + w;
        if (i > 0) pts.push([R[i], zs]);          // doubled corner where the step face meets the rim
        pts.push([R[i], zs], [R[i], ze]);
        if (i < n - 1) pts.push([R[i], ze]);
      }
      var g = P.lathePulley({ points: pts, material: o.material, mark: o.mark, segments: o.segments });
      g.radii = R; g.width = w;
      g.stepZ = function (k) { return -L / 2 + (k + .5) * w; };
      return g;
    },

    /** Plain wheel for a rope, as in a pulley block: a disc with three dark holes so you can see it turn. Axis local Z, centred.
        o: {radius, width (default 8), material, holes (material for the holes, default material)}
        A rope (tube about 2.2) laid at `radius` sits half sunk in the rim, as if in a groove. Result has .radius. */
    sheave: function (o) {
      var R = o.radius, w = o.width || 8, g = new THREE.Group();
      g.add(P.cylZ(R, w, o.material));
      for (var k = 0; k < 3; k++) { var a = k * 2 * Math.PI / 3; P.at(P.cylZ(R * .123, w + 1, o.holes || o.material), R * .58 * Math.cos(a), R * .58 * Math.sin(a), 0, g); }
      g.radius = R;
      return g;
    },

    /** Eye for hanging a block or tying a rope: a closed ring of rod in the XY plane, centred on the origin. A shank
        should end inside the rod (between radius - tube and radius + tube from the centre) so the two join.
        o: {radius (to the middle of the rod, default 9), tube (default 3), material}. Outer edge at radius + tube.
        o.gap is accepted for older callers and ignored: rings are always drawn closed. */
    hook: function (o) {
      return P.hoop(o.radius || 9, o.tube || 3, o.material);
    },

    /** Frame of a pulley block, for a sheave() whose axis is local Z: a narrow strap on each face of the pulley, a pin
        through the middle, a cross strap at one end, a short rod and a hook. The pin is at the origin.
        o: {radius (of the pulley), width (of the pulley, or of the stack of pulleys, along Z, default 8), strap (width of
        the side straps across X, default 16), material, up (default true: hook above; false: hook below, for a block that
        carries a weight)}. Straps: z = ±(width/2 + .5 .. width/2 + 3.5), y = ±(radius + 13); the pin ends at their outer faces.
        Result has .hookEdge (y of the hook's far edge: ±(radius + 66), hang the block from a beam whose face is there) and
        .hookBend (y of the middle of the rod at the hook's bend, ±(radius + 63), where a ring or weight hangs). */
    ropeBlock: function (o) {
      var R = o.radius, w = o.width || 8, sw = o.strap || 16, m = o.material, s = o.up === false ? -1 : 1, g = new THREE.Group(), zc = w / 2 + 2;
      P.at(P.box(sw, 2 * R + 26, 3, m), 0, 0, zc, g); P.at(P.box(sw, 2 * R + 26, 3, m), 0, 0, -zc, g);   // straps, z w/2+.5 .. w/2+3.5
      P.at(P.cylZ(4, w + 7, m), 0, 0, 0, g);                                                          // pin, z ±(w/2+3.5)
      P.at(P.box(sw + 2, 5, w + 7, m), 0, s * (R + 13), 0, g);                                        // cross strap over the straps' ends
      P.at(P.cylY(3, 34, m), 0, s * (R + 30), 0, g);                                                  // rod, R+13 .. R+47
      P.at(P.hook({ material: m, gap: s > 0 ? "down" : "up" }), 0, s * (R + 54), 0, g);               // hook, R+42 .. R+66
      g.hookEdge = s * (R + 66); g.hookBend = s * (R + 63);
      return g;
    },

    /** Hand winch standing on the ground: a drum between two side plates on a foot, with a crank on the front (+Z).
        The origin is the middle of the drum; the foot's underside is at y = -height. Rope is wound at z -6 .. 6.
        o: {radius (of the barrel, default 14), length (of the barrel, default 30), height (axle above the ground, default 40),
        material, handle (material for the crank handle), rope (material for the coils of rope, optional)}
        Result has .drum (the turning part: barrel, flanges, coils, crank; turn it with .drum.rotation.z) and .ropeRadius
        (the radius of rope coming off the drum, radius + 1.5). Turning the drum anticlockwise (seen from the front) by a
        radians winds in a * ropeRadius of rope that leaves from the drum's left side. */
    winch: function (o) {
      var R = o.radius || 14, L = o.length || 30, H = o.height || 40, m = o.material, g = new THREE.Group(), d = new THREE.Group();
      var zo = L / 2 + 9;                                                        // outer face of the side plates
      d.add(P.cylZ(R, L, m));                                                    // barrel, z ±L/2
      [-1, 1].forEach(function (s) { P.at(P.cylZ(R + 7, 3, m), 0, 0, s * (L / 2 + 1.5), d); });   // flanges, L/2 .. L/2+3
      if (o.rope) for (var i = -1; i <= 1; i++) P.at(P.hoop(R + 1.5, 2.2, o.rope), 0, 0, i * 6, d);
      P.at(P.cylZ(5, 6, m), 0, 0, zo + 3, d);                                    // crank boss, zo .. zo+6
      P.at(P.box(6, 40, 4, m), 0, 16, zo + 8, d);                                // crank arm, zo+6 .. zo+10
      P.at(P.cylZ(4, 16, o.handle || m), 0, 34, zo + 18, d);                     // handle, zo+10 .. zo+26
      g.add(d); g.drum = d; g.ropeRadius = R + 1.5;
      P.at(P.cylZ(4, 2 * zo, m), 0, 0, 0, g);                                    // axle, ends at the plates' outer faces
      [-1, 1].forEach(function (s) { P.at(P.box(12, H + 4, 5, m), 0, (12 - H) / 2, s * (zo - 2.5), g); });   // plates, y 4-H .. 8, z L/2+4 .. zo
      P.at(P.box(18, 4, 2 * zo, m), 0, 2 - H, 0, g);                             // foot, y -H .. 4-H
      return g;
    },

    /** Bevel gear with any cone angle, for unequal pairs. Axis local +Y, pitch-cone apex at the local origin, teeth facing the apex.
        o: {radius (pitch radius at the back), teeth, cone (half-angle of the pitch cone in degrees, default 45),
        face (0..1, default .68), addendum (default 7), hub (hub radius, default 20), hubLength (how far the back of the
        body and hub reach beyond the back pitch circle, default 44; at least 12), material}
        The back pitch circle sits at height radius / tan(cone) above the apex. Tooth width follows the tooth spacing.
        Two gears mesh with axes at right angles and the same apex when radius1 / radius2 = teeth1 / teeth2
        and tan(cone1) = radius1 / radius2 (so cone1 + cone2 = 90). Offset one by half a pitch.
        Result has .pitch, .pitchRadius, .apexDist (height of the back pitch circle) and .backY (top of the hub).
        As in bevelGear, the root cone is addendum below the pitch cone and tips stand .8 * addendum above it (tip clearance).
        Part-toothed (mutilated) gear: optional first (default 0) and count (default teeth) cut only teeth first .. first+count-1
        and leave the rest of the rim plain at the root; optional markMaterial colours tooth `first`. Tooth i is centred on
        local angle i * pitch, from local +X towards +Z. */
    bevelGearCone: function (o) {
      var RG = o.radius, NT = o.teeth, S0 = o.face || .68, H = o.addendum || 7, HR = o.hub || 20, mat = o.material, pitch = 2 * Math.PI / NT, TIP = .8;
      var dl = (o.cone || 45) * Math.PI / 180, cd = Math.cos(dl), sd = Math.sin(dl), A = RG / Math.tan(dl), TW = Math.PI * RG / NT;
      var g = new THREE.Group();
      var rB = RG - H * cd, yB = A + H * sd, rA = S0 * rB, yA = S0 * yB;
      var HL = Math.max(12, o.hubLength || 44), yS = yB + 8 + (HL - 8) * 4 / 9;     // default 44 gives the step at yB + 24
      var pts = [[0, yA], [rA, yA], [rB, yB], [rB + 1, yB + 8], [Math.max(HR + 6, RG * .5), yS], [HR, yS], [HR, yB + HL], [0, yB + HL]]
        .map(function (p) { return new THREE.Vector2(p[0], p[1]); });
      g.add(mesh(new THREE.LatheGeometry(pts, 72), mat));
      var pos = [], posM = [], cur = pos, F0 = o.first || 0, NC = o.count === undefined ? NT : o.count;
      function V(a, b, c) { cur.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
      function quad(a, b, c, d) { V(a, b, c); V(a, c, d); }
      for (var k = 0; k < NC; k++) {
        var i = (F0 + k) % NT, f = i * pitch, c = Math.cos(f), s = Math.sin(f), v = [];
        cur = o.markMaterial && k === 0 ? posM : pos;
        [S0, 1].forEach(function (sc) {
          var cx = sc * RG * c, cy = sc * A, cz = sc * RG * s, h = sc * H, wr = sc * TW * .626, wt = sc * TW * .321;
          function pt(dn, dt) { return [cx + dn * c * cd - dt * s, cy - dn * sd, cz + dn * s * cd + dt * c]; }
          v.push(pt(-1.4 * h, -wr), pt(-1.4 * h, wr), pt(TIP * h, wt), pt(TIP * h, -wt));   // tips stop short of the mate's root cone (-h), so the two never share a surface
        });
        quad(v[0], v[1], v[2], v[3]); quad(v[4], v[5], v[6], v[7]);
        quad(v[0], v[3], v[7], v[4]); quad(v[1], v[2], v[6], v[5]); quad(v[3], v[2], v[6], v[7]);
      }
      [[pos, mat], [posM, o.markMaterial]].forEach(function (q) {
        if (!q[0].length) return;
        var tg = new THREE.BufferGeometry();
        tg.setAttribute("position", new THREE.Float32BufferAttribute(q[0], 3)); tg.computeVertexNormals();
        g.add(mesh(tg, q[1]));
      });
      g.pitch = pitch; g.pitchRadius = RG; g.apexDist = A; g.backY = yB + HL;
      return g;
    },

    /** Raised spiral thread (a scroll) for the face of a disc: a rib of square section along an Archimedean spiral in
        the XY plane, standing from z=0 up to z=height. Its middle line is at radius r0 + pitch * a / (2 pi) at angle a,
        for a from `from` to `to` radians (more than 2 pi gives more than one turn). Ends are cut square.
        o: {r0, pitch (radial step per turn), from (default 0), to (default 2 pi), width, height, segments (default 160), material} */
    spiralRib: function (o) {
      var a0 = o.from || 0, a1 = o.to === undefined ? 2 * Math.PI : o.to, n = o.segments || 160, hw = o.width / 2, sh = new THREE.Shape(), i, a, r;
      function rr(t) { return o.r0 + o.pitch * t / (2 * Math.PI); }
      for (i = 0; i <= n; i++) { a = a0 + (a1 - a0) * i / n; r = rr(a) + hw; if (i) sh.lineTo(r * Math.cos(a), r * Math.sin(a)); else sh.moveTo(r * Math.cos(a), r * Math.sin(a)); }
      for (i = n; i >= 0; i--) { a = a0 + (a1 - a0) * i / n; r = rr(a) - hw; sh.lineTo(r * Math.cos(a), r * Math.sin(a)); }
      sh.closePath();
      return mesh(new THREE.ExtrudeGeometry(sh, { depth: o.height, bevelEnabled: false }), o.material);
    },

    /** Crown wheel (contrate wheel): a flat disc with its teeth standing up from the +Z face, to mesh with a spurGear
        of the same module whose axis is at right angles. Axis local Z, disc centred on z=0.
        o: {teeth, module (default 8), width (disc thickness, default 12), material, markMaterial (optional, for tooth 0)}
        Teeth run radially from pitchRadius - 1.5*module to pitchRadius + 1.5*module (the disc's rim) and stand
        2.25*module tall. Tooth 0 is centred on angle 0 (local +X). Result has .pitchRadius, .pitch (radians per tooth),
        .faceZ (the toothed face) and .pitchZ (height of the pitch line above z=0).
        To mesh a spurGear of width about 2.5*module: put its axis at right angles, its mid-plane through the pitch circle
        radius, and its centre pitchRadius(spur) back from z=.pitchZ. Speeds go in inverse ratio of the tooth counts. */
    crownWheel: function (o) {
      var N = o.teeth, md = o.module || 8, w = o.width || 12, rp = N * md / 2, st = 2 * Math.PI / N;
      var rIn = rp - 1.5 * md, rOut = rp + 1.5 * md, z0 = w / 2 - .5, z1 = w / 2 + 2.25 * md, g = new THREE.Group();
      var disc = mesh(new THREE.CylinderGeometry(rOut, rOut, w, 96), o.material); disc.rotation.x = Math.PI / 2; g.add(disc);
      function teeth(from, to) {
        var pos = [];
        function V(a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
        function quad(a, b, c, d) { V(a, b, c); V(a, c, d); }
        for (var i = from; i < to; i++) {
          var a = i * st, v = [];
          [rIn, rOut].forEach(function (r) {
            function pt(da, z) { return [r * Math.cos(a + da * st), r * Math.sin(a + da * st), z]; }
            v.push(pt(-.27, z0), pt(.27, z0), pt(.11, z1), pt(-.11, z1));   // same flank shape as spurGear, bent round the face
          });
          quad(v[0], v[1], v[2], v[3]); quad(v[4], v[5], v[6], v[7]);
          quad(v[0], v[3], v[7], v[4]); quad(v[1], v[2], v[6], v[5]); quad(v[3], v[2], v[6], v[7]);
        }
        var tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); tg.computeVertexNormals();
        return tg;
      }
      if (o.markMaterial) { g.add(mesh(teeth(0, 1), o.markMaterial)); g.add(mesh(teeth(1, N), o.material)); }
      else g.add(mesh(teeth(0, N), o.material));
      g.pitchRadius = rp; g.pitch = st; g.faceZ = w / 2; g.pitchZ = w / 2 + 1.25 * md;
      return g;
    },

    /** Gear that is not round (square, oval, lobed): teeth set at equal steps of arc length along any closed pitch curve.
        Axis local Z, centred on z = 0; the curve is given round the gear's own shaft at the origin.
        o: {points: [[x, y], ...] the pitch curve, closed, anticlockwise, closely spaced (a few hundred points),
        teeth, phase (in tooth pitches, default 0: a tooth is centred on points[0]; .5 puts a gap there),
        open (default false; true: the curve is not closed, teeth run from points[0] to the last point and a straight
        step joins the ends, as on a scroll gear; .length is then the open curve's length; only whole teeth are cut),
        relief (open only, default 0: teeth whose centre is less than this many pitches from either end are cut down
        to just under the pitch line, so they clear the other gear when its speed jumps at the step),
        width (default 16), bore (default 0), plate (default 0: a gear. Otherwise a disc of this radius, or a
        THREE.Shape, with the toothed curve cut out of it as a hole, for teeth that face inward round a closed track;
        list the points clockwise so the teeth point into the hole), material}
        Tooth outline matches spurGear, with module = pitch / pi. Result has .pitch (arc length per tooth) and .length
        (of the pitch curve). Two such gears mesh when their pitch curves roll on each other without slipping, have the
        same .pitch, and a tooth centre of one meets a gap centre of the other. */
    noncircularGear: function (o) {
      var pts = o.points, n = pts.length, N = o.teeth, w = o.width || 16, cum = [0], i, k;
      for (i = 0; i < n; i++) { var p0 = pts[i], p1 = pts[(i + 1) % n]; cum.push(cum[i] + Math.sqrt((p1[0] - p0[0]) * (p1[0] - p0[0]) + (p1[1] - p0[1]) * (p1[1] - p0[1]))); }
      var L = cum[n], pitch = L / N, md = pitch / Math.PI, add = md, ded = 1.25 * md, sh = new THREE.Shape(), first = true;
      function put(s, off) {                                 // point at arc length s, pushed `off` along the outward normal
        s = ((s % L) + L) % L;
        var lo = 0, hi = n; while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
        var a = pts[lo], b = pts[(lo + 1) % n], len = cum[lo + 1] - cum[lo] || 1e-9, f = (s - cum[lo]) / len;
        var tx = (b[0] - a[0]) / len, ty = (b[1] - a[1]) / len, x = a[0] + (b[0] - a[0]) * f + ty * off, y = a[1] + (b[1] - a[1]) * f - tx * off;
        if (first) { sh.moveTo(x, y); first = false; } else sh.lineTo(x, y);
      }
      var prof = [[-.5, -ded], [-.27, -ded], [-.11, add], [.11, add], [.27, -ded]];
      if (o.open) {                                          // open curve: teeth from points[0] to points[n-1], then a straight step back
        L = cum[n - 1]; pitch = L / N; md = pitch / Math.PI; add = md; ded = 1.25 * md;
        prof = [[-.5, -ded], [-.27, -ded], [-.11, add], [.11, add], [.27, -ded], [.5, -ded]];
        var ph = o.phase || 0;
        put = function (s, off) {
          s = Math.max(0, Math.min(L, s));
          var lo = 0, hi = n - 1; while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
          var a = pts[lo], b = pts[lo + 1], len = cum[lo + 1] - cum[lo] || 1e-9, f = (s - cum[lo]) / len;
          var tx = (b[0] - a[0]) / len, ty = (b[1] - a[1]) / len, x = a[0] + (b[0] - a[0]) * f + ty * off, y = a[1] + (b[1] - a[1]) * f - tx * off;
          if (first) { sh.moveTo(x, y); first = false; } else sh.lineTo(x, y);
        };
        put(0, -ded);                                        // only whole teeth; a part tooth at either end is left off
        var tip = function (sc) { var e = Math.min(sc, L - sc) / pitch; return e < (o.relief || 0) ? -ded * .2 : add; };
        for (i = -1; i <= N + 1; i++) if ((i + ph - .5) * pitch > -1e-6 && (i + ph + .5) * pitch < L + 1e-6)
          for (k = 0; k < prof.length; k++) put((i + ph + prof[k][0]) * pitch, prof[k][1] === add ? tip((i + ph) * pitch) : prof[k][1]);
        put(L, -ded);
      } else
      for (i = 0; i < N; i++) for (k = 0; k < prof.length; k++) put((i + (o.phase || 0) + prof[k][0]) * pitch, prof[k][1]);
      sh.closePath();
      if (o.plate) { var pl = o.plate.holes ? o.plate : new THREE.Shape(); if (!o.plate.holes) pl.absarc(0, 0, o.plate, 0, 2 * Math.PI, false); pl.holes.push(sh); sh = pl; }
      if (o.bore) { var hole = new THREE.Path(); hole.absarc(0, 0, o.bore, 0, 2 * Math.PI, true); sh.holes.push(hole); }
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: o.plate ? 96 : 12 });
      g.translate(0, 0, -w / 2);
      var gear = mesh(g, o.material); gear.pitch = pitch; gear.length = L;
      return gear;
    },

    /** Rope along a chain of straight runs and wraps round pulleys, each wrap in a plane parallel to XY, with marks that
        ride on the rope. o: {tube (default 2.2), material, mark (material for the marks), marks (how many, default 0)}.
        Add the result (a Group) to the scene at the origin and call .set(path) every frame. path lists, in order from the
        rope's start, points [x, y, z] and wraps {c: [x, y, z], r, a0, a1} (radians in XY; a1 > a0 goes anticlockwise
        round the pulley, a1 < a0 clockwise; the rope lies at radius r, half sunk in a sheave() of that radius). A straight
        run joins the end of each item to the start of the next. After .set: .length, .wrapS[i] (distance along the rope
        from its start to the beginning of wrap i) and .pointAt(s) ([x, y, z], or null past the end).
        A pulley gripped by wrap i turns by -(change in wrapS[i]) / r when a1 > a0, and the opposite way when a1 < a0.
        Marks: set .markS to an array of distances from the start. When the start is tied to something, a mark at a fixed
        distance stays on the same bit of rope however the path moves. Marks past the end are hidden. */
    ropePath: function (o) {
      var g = new THREE.Group(), tube = o.tube || 2.2, rods = [], arcs = [], marks = [], segs = [], i;
      for (i = 0; i < (o.marks || 0); i++) { var mk = P.sphere(tube * 2, o.mark || o.material); mk.visible = false; g.add(mk); marks.push(mk); }
      g.markS = []; g.wrapS = []; g.length = 0;
      g.pointAt = function (s) {
        if (s < 0) return null;
        for (var j = 0; j < segs.length; j++) {
          var q = segs[j];
          if (s <= q.len) {
            var f = q.len ? s / q.len : 0;
            if (q.c) { var a = q.a0 + (q.a1 - q.a0) * f; return [q.c[0] + q.r * Math.cos(a), q.c[1] + q.r * Math.sin(a), q.c[2]]; }
            return [q.a[0] + (q.b[0] - q.a[0]) * f, q.a[1] + (q.b[1] - q.a[1]) * f, q.a[2] + (q.b[2] - q.a[2]) * f];
          }
          s -= q.len;
        }
        return null;
      };
      g.set = function (path) {
        var prev = null, nr = 0, na = 0, acc = 0, k;
        segs = []; g.wrapS = [];
        path.forEach(function (it) {
          var st = it, en = it;
          if (!Array.isArray(it)) {
            st = [it.c[0] + it.r * Math.cos(it.a0), it.c[1] + it.r * Math.sin(it.a0), it.c[2]];
            en = [it.c[0] + it.r * Math.cos(it.a1), it.c[1] + it.r * Math.sin(it.a1), it.c[2]];
          }
          if (prev) {
            var len = Math.hypot(st[0] - prev[0], st[1] - prev[1], st[2] - prev[2]);
            if (len > 1e-6) {
              if (!rods[nr]) { rods[nr] = P.rod(tube, o.material); g.add(rods[nr]); }
              rods[nr].visible = true; rods[nr++].span(prev[0], prev[1], prev[2], st[0], st[1], st[2]);
              segs.push({ a: prev, b: st, len: len }); acc += len;
            }
          }
          if (!Array.isArray(it)) {
            var ang = Math.abs(it.a1 - it.a0), m = arcs[na];
            if (!m) { m = arcs[na] = mesh(new THREE.BufferGeometry(), o.material); m.userData.live = true; m.ang = -1; g.add(m); }
            if (Math.abs(m.ang - ang) > 1e-3 || m.r !== it.r) {   // rebuild only when the wrap's angle or radius changes
              m.geometry.dispose(); m.geometry = new THREE.TorusGeometry(it.r, tube, 10, Math.max(4, Math.ceil(ang * 10)), ang); m.ang = ang; m.r = it.r;
            }
            m.visible = true; m.position.set(it.c[0], it.c[1], it.c[2]); m.rotation.z = Math.min(it.a0, it.a1); na++;
            g.wrapS.push(acc);
            var wl = ang * it.r; segs.push({ c: it.c, r: it.r, a0: it.a0, a1: it.a1, len: wl }); acc += wl;
          }
          prev = en;
        });
        for (k = nr; k < rods.length; k++) rods[k].visible = false;
        for (k = na; k < arcs.length; k++) arcs[k].visible = false;
        g.length = acc;
        marks.forEach(function (mk, j) {
          var p = j < g.markS.length ? g.pointAt(g.markS[j]) : null;
          mk.visible = !!p; if (p) mk.position.set(p[0], p[1], p[2]);
        });
        return g;
      };
      return g;
    },

    /** Spoked wheel with a groove for a round rope or cord used as a belt: a pulley() with a raised lip each side of the
        groove. Axis local Z, centred. o: {radius (to the middle of the rope), tube (rope radius, default 3), spokes, hub, material}
        A rope of that tube laid at `radius` sits on the rim between the lips. The wheel is 5.2 * tube wide.
        Result has .radius and .spokes, as pulley(). */
    ropeWheel: function (o) {
      var t = o.tube || 3, lt = t * .8, w = 2 * (t + 2 * lt);
      var g = P.pulley({ radius: o.radius - t, width: w, spokes: o.spokes, hub: o.hub, material: o.material });
      [-1, 1].forEach(function (sd) { P.at(P.hoop(o.radius - t + 1, lt, o.material), 0, 0, sd * (t + lt), g); });   // lips, sunk 1 short of half into the rim
      g.radius = o.radius;
      return g;
    },

    /** Internal gear (annulus): a ring with its teeth on the inside, to mesh with a spurGear of the same module.
        Axis local Z, centred on the origin. o: {teeth, module (default 8), width (default 16), rim (thickness outside the
        tooth roots, default 1.5 * module), material}
        Tooth outline is spurGear's turned inside out: tips at pitchRadius - module, roots at pitchRadius + 1.25 * module.
        A tooth is centred on angle 0. Result has .pitchRadius, .pitch (radians per tooth), .rootRadius, .outerRadius.
        A pinion meshes inside when its centre is pitchRadius(ring) - pitchRadius(pinion) from the ring's centre; both
        turn the same way, at speeds in inverse ratio of the tooth counts. Keep the ring at least 10 teeth bigger.
        Optional fromDeg, toDeg (anticlockwise from +X): teeth only on that arc, as on partGear, and a plain inside at the
        root radius elsewhere, for mutilated (part-toothed) rings. Teeth still sit on multiples of .pitch. With an arc,
        optional relief (default 0) cuts that many teeth at each end down to stubs a fifth of full height, as on partGear. */
    internalGear: function (o) {
      var N = o.teeth, md = o.module || 8, w = o.width || 16, rp = N * md / 2, rt = rp - md, rr = rp + 1.25 * md;
      var Ro = rr + (o.rim === undefined ? 1.5 * md : o.rim), st = 2 * Math.PI / N, sh = new THREE.Shape(), hole = new THREE.Path(), pts = [], i, a;
      var part = o.fromDeg !== undefined, i0 = part ? Math.ceil(o.fromDeg * Math.PI / 180 / st) : 0, i1 = part ? Math.floor(o.toDeg * Math.PI / 180 / st) : N - 1;
      sh.absarc(0, 0, Ro, 0, 2 * Math.PI, false);
      for (i = i0; i <= i1; i++) {
        a = i * st; var tt = part && Math.min(i - i0, i1 - i) < (o.relief || 0) ? rr + .2 * (rt - rr) : rt;
        pts.push([rr, a - .27 * st], [tt, a - .11 * st], [tt, a + .11 * st], [rr, a + .27 * st]);
      }
      if (part) {                                           // plain inside at the root radius, back round to the first tooth
        var b0 = i1 * st + .27 * st, b1 = i0 * st - .27 * st + 2 * Math.PI, ns = Math.max(2, Math.ceil((b1 - b0) / .03));
        for (i = 1; i < ns; i++) pts.push([rr, b0 + (b1 - b0) * i / ns]);
      }
      pts.reverse();                                        // holes run clockwise
      pts.forEach(function (p, k) { var x = p[0] * Math.cos(p[1]), y = p[0] * Math.sin(p[1]); if (k) hole.lineTo(x, y); else hole.moveTo(x, y); });
      hole.closePath(); sh.holes.push(hole);
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 96 });
      g.translate(0, 0, -w / 2);
      var ring = mesh(g, o.material); ring.pitchRadius = rp; ring.pitch = st; ring.rootRadius = rr; ring.outerRadius = Ro;
      return ring;
    },

    /** Worm (endless screw): a right-hand thread of trapezoid section wound on a core, axis local X, centred on the origin.
        o: {radius (pitch radius), pitch (axial distance between neighbouring threads), length, starts (default 1),
            addendum (default pitch / pi), dedendum (default 1.25 * pitch / pi), material, coreMaterial (default material)}
        The thread rises from the core (radius - dedendum) to radius + addendum; it is .45*pitch wide at the root and
        .2*pitch at the tip, so it sits loosely in the tooth gap of a spurGear whose module is pitch / pi. The ends are cut
        square inside the core's length. Lead (advance per turn) = starts * pitch.
        At rotation 0 a thread crosses local -Y at x = 0 and at every pitch along X. Turning the worm by +phi
        (rotation.x) moves the threads at -Y by -lead * phi / (2 pi) along X, so a wheel of N teeth below it turns by
        phi * starts / N. Result has .radius, .pitch, .lead, .tip and .root. */
    worm: function (o) {
      var R = o.radius, p = o.pitch, L = o.length, s = o.starts || 1, lead = s * p, md = p / Math.PI;
      var ra = R + (o.addendum === undefined ? md : o.addendum), rr = R - (o.dedendum === undefined ? 1.25 * md : o.dedendum);
      var wr = .225 * p, wt = .1 * p, prof = [[-wr, rr - .5], [-wt, ra], [wt, ra], [wr, rr - .5]];   // root sunk 0.5 into the core
      var g = new THREE.Group(), pos = [], k, i;
      P.at(P.cylX(rr, L, o.coreMaterial || o.material), 0, 0, 0, g);
      function V(a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
      function ring(th, k) {
        var xc = lead * (th - Math.PI) / (2 * Math.PI) + k * p;
        return prof.map(function (q) { return [xc + q[0], q[1] * Math.cos(th), q[1] * Math.sin(th)]; });
      }
      for (k = 0; k < s; k++) {
        var t0 = Math.PI + 2 * Math.PI * (-L / 2 + wr - k * p) / lead, t1 = Math.PI + 2 * Math.PI * (L / 2 - wr - k * p) / lead;
        var n = Math.max(2, Math.ceil((t1 - t0) / (2 * Math.PI) * 96)), prev = ring(t0, k), first = prev;
        for (i = 1; i <= n; i++) {
          var cur = ring(t0 + (t1 - t0) * i / n, k);
          for (var j = 0; j < 4; j++) { var j2 = (j + 1) % 4; V(prev[j], cur[j], cur[j2]); V(prev[j], cur[j2], prev[j2]); }
          prev = cur;
        }
        V(first[0], first[1], first[2]); V(first[0], first[2], first[3]);   // end caps
        V(prev[0], prev[2], prev[1]); V(prev[0], prev[3], prev[2]);
      }
      var tg = new THREE.BufferGeometry();
      tg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); tg.computeVertexNormals();
      g.add(mesh(tg, o.material));
      g.radius = R; g.pitch = p; g.lead = lead; g.tip = ra; g.root = rr;
      return g;
    },

    /** Coil spring (compression or tension) that can change length while running. Axis local +X, from x = 0 to x = length.
        o: {radius (centre of the wire, default 6), wire (wire radius, default 1.5), turns (default 8), length (as built), material}
        Call .setLength(len) every frame to squeeze or stretch it; it scales along X, so keep len within about half to
        twice the built length or the wire looks flattened. */
    spring: function (o) {
      var L = o.length, r = o.radius || 6, n = o.turns || 8, curve = new THREE.Curve();
      curve.getPoint = function (t) { var a = 2 * Math.PI * n * t; return new THREE.Vector3(L * t, r * Math.cos(a), r * Math.sin(a)); };
      var sp = mesh(new THREE.TubeGeometry(curve, n * 24, o.wire || 1.5, 8, false), o.material);
      sp.setLength = function (len) { sp.scale.x = len / L; return sp; };
      return sp;
    },

    /** Gear whose spurGear outline is turned by a different angle at each height: the shared body of helicalGear and
        steppedGear. Axis local Z. o: {teeth, module (default 8), slices: [[z, angle in radians], ...] in rising z, material,
        mark (optional material for a strip lifted 0.6 off the tip of the tooth at angle 0, to follow one tooth)}
        Two slices at the same z make a flat step. Result has .pitchRadius, .pitch and .mark (the strip, a child mesh). */
    twistedGear: function (o) {
      var N = o.teeth, md = o.module || 8, rp = N * md / 2, ra = rp + md, rf = rp - 1.25 * md, st = 2 * Math.PI / N, sl = o.slices;
      var out = [], i, j, pos = [];
      for (i = 0; i < N; i++) out.push([rf, i * st - .27 * st], [ra, i * st - .11 * st], [ra, i * st + .11 * st], [rf, i * st + .27 * st]);
      function pt(k, s, arr) { var q = out[k % out.length], a = q[1] + s[1]; arr.push(q[0] * Math.cos(a), q[0] * Math.sin(a), s[0]); }
      function cap(s, up) {
        for (var k = 0; k < out.length; k++) { pos.push(0, 0, s[0]); pt(up ? k : k + 1, s, pos); pt(up ? k + 1 : k, s, pos); }
      }
      cap(sl[0], false);
      for (j = 0; j < sl.length - 1; j++) {
        if (sl[j + 1][0] - sl[j][0] < 1e-6) { cap(sl[j], true); cap(sl[j + 1], false); continue; }   // a step: close both faces
        for (i = 0; i < out.length; i++) {
          pt(i, sl[j], pos); pt(i + 1, sl[j], pos); pt(i + 1, sl[j + 1], pos);
          pt(i, sl[j], pos); pt(i + 1, sl[j + 1], pos); pt(i, sl[j + 1], pos);
        }
      }
      cap(sl[sl.length - 1], true);
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      var gear = mesh(g, o.material); gear.pitchRadius = rp; gear.pitch = st;
      if (o.mark) {
        var mp = [], R = ra + .6, h = .1 * st;
        function mk(s, sg) { mp.push(R * Math.cos(s[1] + sg * h), R * Math.sin(s[1] + sg * h), s[0]); }
        for (j = 0; j < sl.length - 1; j++) {
          if (sl[j + 1][0] - sl[j][0] < 1e-6) continue;
          mk(sl[j], -1); mk(sl[j], 1); mk(sl[j + 1], 1); mk(sl[j], -1); mk(sl[j + 1], 1); mk(sl[j + 1], -1);
        }
        var mg = new THREE.BufferGeometry();
        mg.setAttribute("position", new THREE.Float32BufferAttribute(mp, 3)); mg.computeVertexNormals();
        gear.mark = mesh(mg, o.mark); gear.add(gear.mark);
      }
      return gear;
    },

    /** Helical gear (slanting teeth) or herringbone gear (V-shaped teeth). Axis local Z, centred on the origin.
        o: {teeth, module (default 8), width (default 16), helix (slant of the teeth to the axis in degrees; positive is
        right-handed, like a normal screw), herringbone (true for V teeth: two halves of opposite hand), material, mark}
        The outline in any slice across the axis is spurGear's, so module is the transverse module and the pitch radius is
        teeth * module / 2. A tooth is centred on angle 0 at the middle of the width (the point of the V for herringbone).
        Parallel shafts: give the two gears opposite helix signs and the same module; centres a sum of pitch radii apart;
        offset one by half a pitch as for spur gears.
        Crossed shafts: the teeth must match in the normal section, so give each gear module = normalModule / cos(helix);
        the angle between the shafts is the sum of the helix angles (same hand) and speeds are still in inverse ratio of teeth.
        Result has .pitchRadius, .pitch and .mark as twistedGear. */
    helicalGear: function (o) {
      var md = o.module || 8, w = o.width || 16, rp = o.teeth * md / 2, k = Math.tan((o.helix || 0) * Math.PI / 180) / rp;
      var n = o.helix ? (o.herringbone ? 16 : 10) : 1, sl = [], i, z;
      for (i = 0; i <= n; i++) { z = -w / 2 + w * i / n; sl.push([z, (o.herringbone ? Math.abs(z) : z) * k]); }
      return P.twistedGear({ teeth: o.teeth, module: md, slices: sl, material: o.material, mark: o.mark });
    },

    /** Stepped gear: several thin spur gears side by side on one axis, each turned a fraction of a tooth from the last,
        made as one piece. Axis local Z, centred. o: {teeth, module (default 8), width (total, default 16), steps (default 3),
        stagger (+1 or -1: which way each step is turned, default +1), material, mark}
        Step i (from the -Z end) is turned by stagger * i * pitch / steps; the first step has a tooth on angle 0.
        Two of them mesh like spur gears when their staggers are opposite. Result as twistedGear. */
    steppedGear: function (o) {
      var n = o.steps || 3, w = o.width || 16, st = 2 * Math.PI / o.teeth, sg = o.stagger || 1, sl = [], i;
      for (i = 0; i < n; i++) sl.push([-w / 2 + w * i / n, sg * i * st / n], [-w / 2 + w * (i + 1) / n, sg * i * st / n]);
      return P.twistedGear({ teeth: o.teeth, module: o.module, slices: sl, material: o.material, mark: o.mark });
    },

    /** Skew bevel gear (hyperboloid gear), for two shafts that cross at an angle without meeting. Axis local Z. Its pitch
        surface is the waisted shape swept by a straight line turning about the axis: the line passes the axis at distance
        `throat` (at z = 0) and leans `angle` degrees from it. The teeth are straight and lie along such lines; the tooth
        at turn 0 lies on the line from (throat, 0, 0) along (0, sin angle, cos angle).
        o: {throat, angle, from, to (distances along that line from the waist to the two ends of the teeth), teeth,
        hub (radius, default 14), hubLen (default 30), material, mark (optional material for a strip on the tip of tooth 0)}
        Two gears mesh along one shared line when throat1 / throat2 = tan(angle1) / tan(angle2) and
        teeth1 / teeth2 = sin(angle1) / sin(angle2), with the same from and to. The shafts are then throat1 + throat2
        apart and cross at angle1 + angle2. Offset one by half a pitch. Tooth size follows from the tooth count.
        Result is a Group with .pitch, .frontZ and .backZ (the two ends along the axis). */
    skewBevelGear: function (o) {
      var a = o.throat, al = o.angle * Math.PI / 180, sa = Math.sin(al), ca = Math.cos(al), N = o.teeth, st = 2 * Math.PI / N, HR = o.hub || 14;
      // frame at distance s along the line: point p, outward normal n of the surface, w across the tooth, normal module m
      function fr(s) {
        var p = [a, s * sa, s * ca], n = [a, s * sa, -s * sa * sa / ca], L = Math.hypot(n[0], n[1], n[2]);
        n = [n[0] / L, n[1] / L, n[2] / L];
        var w = [sa * n[2] - ca * n[1], ca * n[0], -sa * n[0]];                       // line direction x n
        var pn = st * Math.abs(-w[0] * p[1] + w[1] * p[0]);                           // tooth spacing measured square to the teeth
        return { p: p, n: n, w: w, m: pn / Math.PI, pn: pn };
      }
      function pt(f, dn, dt) { return [f.p[0] + dn * f.n[0] + dt * f.w[0], f.p[1] + dn * f.n[1] + dt * f.w[1], f.p[2] + dn * f.n[2] + dt * f.w[2]]; }
      var g = new THREE.Group(), prof = [], i, j, K = 6, f, q, secs = [];
      for (j = 0; j <= K; j++) {
        f = fr(o.from + (o.to - o.from) * j / K); secs.push(f);
        q = pt(f, -1.25 * f.m, 0); prof.push([Math.hypot(q[0], q[1]), q[2]]);
      }
      var zA = prof[0][1], rB = prof[K][0], zB = prof[K][1], hl = o.hubLen || 30;
      var pts = [[0, zA]].concat(prof, [[rB + 1, zB + 6], [Math.max(HR + 6, rB * .5), zB + 16], [HR, zB + 16], [HR, zB + hl], [0, zB + hl]])
        .map(function (v) { return new THREE.Vector2(v[0], v[1]); });
      var body = new THREE.LatheGeometry(pts, 72); body.rotateX(Math.PI / 2);      // lathe axis Y becomes Z
      g.add(mesh(body, o.material));
      var pos = [], mp = [];
      function V(arr, A, B, C, t) {
        [A, B, C].forEach(function (v) { var c = Math.cos(t), s = Math.sin(t); arr.push(v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]); });
      }
      function quad(arr, A, B, C, D, t) { V(arr, A, B, C, t); V(arr, A, C, D, t); }
      function sec(f) { return [pt(f, -1.4 * f.m, -.27 * f.pn), pt(f, f.m, -.11 * f.pn), pt(f, f.m, .11 * f.pn), pt(f, -1.4 * f.m, .27 * f.pn)]; }
      for (i = 0; i < N; i++) {
        var t = i * st, s0 = sec(secs[0]), sK = sec(secs[K]);
        quad(pos, s0[0], s0[1], s0[2], s0[3], t); quad(pos, sK[0], sK[1], sK[2], sK[3], t);
        for (j = 0; j < K; j++) {
          var u = sec(secs[j]), v = sec(secs[j + 1]);
          quad(pos, u[0], u[1], v[1], v[0], t); quad(pos, u[1], u[2], v[2], v[1], t); quad(pos, u[2], u[3], v[3], v[2], t);
          if (i === 0 && o.mark) quad(mp, pt(secs[j], secs[j].m + .6, -.1 * secs[j].pn), pt(secs[j], secs[j].m + .6, .1 * secs[j].pn),
            pt(secs[j + 1], secs[j + 1].m + .6, .1 * secs[j + 1].pn), pt(secs[j + 1], secs[j + 1].m + .6, -.1 * secs[j + 1].pn), 0);
        }
      }
      var tg = new THREE.BufferGeometry();
      tg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); tg.computeVertexNormals();
      g.add(mesh(tg, o.material));
      if (o.mark) {
        var mg = new THREE.BufferGeometry();
        mg.setAttribute("position", new THREE.Float32BufferAttribute(mp, 3)); mg.computeVertexNormals();
        g.mark = mesh(mg, o.mark); g.add(g.mark);
      }
      g.pitch = st; g.frontZ = zA; g.backZ = zB + hl;
      return g;
    },

    /** Turn an object so its local X points along x and its local Y along y. x and y are unit THREE.Vector3 at right
        angles; local Z becomes x cross y. For parts whose direction is worked out from vectors each frame. Returns the object. */
    frame: function (obj, x, y) {
      var z = new THREE.Vector3().crossVectors(x, y);
      obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
      return obj;
    },

    /** Fork of a universal (Hooke's) joint drawn the old way: an oval ring of round rod on the end of a shaft. The joint
        centre is the local origin, the shaft axis is local X (the shaft comes in from -X) and the cross pin runs along
        local Y. The oval lies in the XY plane, from x = -back, where the shaft joins, to x = +reach past the joint
        centre, so two forks link like chain links. Pair it with hookeCross() and place both with frame().
        o: {back (default 78), reach (default 24), half (half width of the ring at the pin, default 32), tube (rod radius,
        default 5), material}. All sizes are to the middle of the rod. Returns a mesh with .half and .tube. */
    hookeFork: function (o) {
      var back = o.back || 78, reach = o.reach || 24, half = o.half || 32, tube = o.tube || 5;
      var A = (back + reach) / 2, c = (back - reach) / 2, B = half / Math.sqrt(1 - c * c / (A * A)), pts = [], i, t;
      for (i = 0; i < 48; i++) { t = i * Math.PI / 24; pts.push(new THREE.Vector3(-c + A * Math.cos(t), B * Math.sin(t), 0)); }
      var m = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 144, tube, 12, true), o.material);
      m.half = half; m.tube = tube;
      return m;
    },

    /** Cross of a universal (Hooke's) joint: two pins at right angles through a round hub, centred on the origin. One pin
        lies along local X and the other along local Y; each reaches `half` plus `head` from the centre, so its ends show
        through the rod of a hookeFork() with the same half. Place it with frame(cross, pinOfFork1, pinOfFork2).
        o: {half (default 32), head (default 8), radius (pin radius, default 3.5), hub (default 8), material} */
    hookeCross: function (o) {
      var g = new THREE.Group(), L = 2 * ((o.half || 32) + (o.head === undefined ? 8 : o.head)), r = o.radius || 3.5;
      g.add(P.cylX(r, L, o.material)); g.add(P.cylY(r, L, o.material)); g.add(P.sphere(o.hub || 8, o.material));
      return g;
    },

    /** Ratchet wheel: a disc with saw teeth, each a long slope ending in a steep face. Axis local Z, centred on the origin.
        o: {teeth, radius (to the tooth tips), depth (tooth height, default 7), width (default 16), bore (default 0),
        reverse (default false), tip (optional: width of a flat land on each tooth tip, so the points are blunt; default 0), material}
        The steep faces lie on multiples of .pitch. Going round by increasing angle the rim climbs from the root to the tip,
        so a pawl resting on it slides freely that way and is stopped by a face the other way. `reverse` mirrors the teeth.
        Result has .pitch (radians per tooth) and .rimAt(angle), the rim radius at a local angle, for lifting a pawl. */
    ratchet: function (o) {
      var N = o.teeth, R = o.radius, d = o.depth || 7, w = o.width || 16, st = 2 * Math.PI / N, rev = !!o.reverse, sh = new THREE.Shape(), i;
      function pt(r, a, first) { var x = r * Math.cos(a), y = r * Math.sin(a); if (first) sh.moveTo(x, y); else sh.lineTo(x, y); }
      var ta = Math.min((o.tip || 0) / R, st * .4);
      for (i = 0; i < N; i++) {
        if (!ta) { pt(rev ? R : R - d, i * st, i === 0); pt(rev ? R - d : R, (i + 1) * st); }
        else if (rev) { pt(R, i * st, i === 0); pt(R, i * st + ta); pt(R - d, (i + 1) * st); }
        else { pt(R - d, i * st, i === 0); pt(R, (i + 1) * st - ta); pt(R, (i + 1) * st); }
      }
      sh.closePath();
      if (o.bore) { var hole = new THREE.Path(); hole.absarc(0, 0, o.bore, 0, 2 * Math.PI, true); sh.holes.push(hole); }
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2);
      var wheel = mesh(g, o.material); wheel.pitch = st;
      wheel.rimAt = function (a) { var f = (rev ? -a : a) / st + 1e-9; f -= Math.floor(f); return R - d + d * Math.min(1, f / (1 - ta / st)); };
      return wheel;
    },

    /** Pawl (click) for a ratchet: a bar that pivots at the local origin about local Z and reaches along +X. Its nose is
        the corner at (length, 0); the body lies on the +Y side of the X axis, or the -Y side with side: -1, so put the
        body on the side away from the wheel. The nose end is cut back so it sits flat against a tooth face.
        o: {length, thick (default 7), width (default 12), side (1 or -1, default 1), material}
        Result has .reach(pivotRadius, rimRadius): the angle at the wheel centre between the pivot and the nose when the
        nose rests on a rim of that radius. Aim the pawl from its pivot at that point (rotation.z) every frame. */
    pawl: function (o) {
      var L = o.length, t = o.thick || 7, w = o.width || 12, s = o.side < 0 ? -1 : 1, g = new THREE.Group(), sh = new THREE.Shape();
      sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L - t * .47, s * t); sh.lineTo(0, s * t); sh.closePath();
      var wb = w - .8;      // body a little thinner than the wheel it rides on, so its faces never share a plane with the wheel's (flicker)
      var b = new THREE.ExtrudeGeometry(sh, { depth: wb, bevelEnabled: false }); b.translate(0, 0, -wb / 2);
      g.add(mesh(b, o.material));
      g.add(P.cylZ(t, w + 2, o.material));
      g.reach = function (pivotR, rimR) { return Math.acos((pivotR * pivotR + rimR * rimR - L * L) / (2 * pivotR * rimR)); };
      return g;
    },

    /** Fusee: a cone cut as one spiral step that climbs round it, for a chain or cord to wind on at a changing radius
        (watches, stepped scroll drums). Axis local Z, bottom face at z=0, top face at z = turns * pitch.
        o: {radius (function a -> radius of the step wall, a in radians along the spiral from the bottom), turns (how many
        step levels are cut, default 5), pitch (height of one step, default 16), hand (1: the spiral climbs anticlockwise
        seen from +Z, -1: clockwise; default 1), segments (default 96), material}
        At spiral angle a the wall stands at local angle hand * a, from z = pitch * a / (2 pi) up one pitch, so a chain
        lies against it at z = .z(a). Use a from 0 to 2 pi (turns - 1); radius is held constant outside that range.
        Result (a mesh) has .radius(a), .z(a) (the middle of the wall at a) and .height. */
    fusee: function (o) {
      var N = o.turns || 5, h = o.pitch || 16, H = N * h, hand = o.hand === -1 ? -1 : 1, seg = o.segments || 96, TAU = 2 * Math.PI;
      function rad(a) { return o.radius(Math.max(0, Math.min(TAU * (N - 1), a))); }
      function cl(z) { return Math.max(0, Math.min(H, z)); }
      var pos = [], idx = [], rows = [], i, j, k;
      for (i = 0; i <= seg; i++) {                 // outline at each angle: axis, bottom, then a wall and a ledge for every level, top, axis
        var t = i / seg, th = TAU * t, row = [[0, 0]];
        for (k = -1; k < N; k++) { var r = rad(th + TAU * k); row.push([r, cl(h * (k + t))], [r, cl(h * (k + 1 + t))]); }
        row.push([0, H]); rows.push(row);
      }
      var M = rows[0].length;
      for (j = 0; j < M - 1; j++) {                // every face of the outline gets its own vertices, so the corners stay sharp
        var base = pos.length / 3;
        for (i = 0; i <= seg; i++) {
          var an = hand * TAU * i / seg, cs = Math.cos(an), sn = Math.sin(an), A = rows[i][j], B = rows[i][j + 1];
          pos.push(A[0] * cs, A[0] * sn, A[1], B[0] * cs, B[0] * sn, B[1]);
        }
        for (i = 0; i < seg; i++) {
          var a0 = base + 2 * i, b0 = a0 + 1, a1 = a0 + 2, b1 = a0 + 3;
          if (hand > 0) idx.push(a0, a1, b0, a1, b1, b0); else idx.push(a0, b0, a1, a1, b0, b1);
        }
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      var f = mesh(geo, o.material);
      f.radius = rad; f.z = function (a) { return h * (a / TAU + .5); }; f.height = H;
      return f;
    },

    /** Flat spiral spring (a watch mainspring or hairspring): a strip wound from an inner post out to a barrel wall.
        In the XY plane, the strip standing from z = -width/2 to width/2. The inner end stays at angle 0 on radius rIn;
        the outer end is on radius rOut at the angle given to .set, so more angle means more coils.
        o: {rIn, rOut, width (default 20), thick (default 1.6), segments (default 240), material}
        Call .set(angle, crowd) when it winds: angle is the whole sweep in radians from the inner end to the outer end
        (anticlockwise seen from +Z; negative for the other hand); crowd (default 1) bends the spacing, below 1 pushes
        the coils out against the wall (run down) and above 1 packs them round the post (wound up). */
    spiralSpring: function (o) {
      var n = o.segments || 240, w = (o.width || 20) / 2, tk = (o.thick || 1.6) / 2, i, idx = [];
      var pos = new Float32Array((n + 1) * 24), geo = new THREE.BufferGeometry();
      // 8 vertices per section, 2 for each face of the strip: inner (0,1), top (2,3), outer (4,5), bottom (6,7)
      for (i = 0; i < n; i++) for (var f = 0; f < 4; f++) { var a = i * 8 + f * 2, b = a + 8; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
      var s = mesh(geo, o.material); s.userData.live = true;
      s.set = function (angle, crowd) {
        var p = crowd || 1, q = 0;
        for (var i = 0; i <= n; i++) {
          var u = i / n, r = o.rIn + (o.rOut - o.rIn) * Math.pow(u, p), an = angle * u, cs = Math.cos(an), sn = Math.sin(an);
          var xi = (r - tk) * cs, yi = (r - tk) * sn, xo = (r + tk) * cs, yo = (r + tk) * sn;
          pos[q++] = xi; pos[q++] = yi; pos[q++] = w; pos[q++] = xi; pos[q++] = yi; pos[q++] = -w;     // inner face
          pos[q++] = xo; pos[q++] = yo; pos[q++] = w; pos[q++] = xi; pos[q++] = yi; pos[q++] = w;      // top edge
          pos[q++] = xo; pos[q++] = yo; pos[q++] = -w; pos[q++] = xo; pos[q++] = yo; pos[q++] = w;     // outer face
          pos[q++] = xi; pos[q++] = yi; pos[q++] = -w; pos[q++] = xo; pos[q++] = yo; pos[q++] = -w;    // bottom edge
        }
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
        return s;
      };
      return s.set(o.angle || 8 * Math.PI, 1);
    },

    /** Chain of flat links that can follow any path (a watch fusee chain, a roller chain): `count` small plates, each
        placed by hand every frame. o: {count, length (of a link along the chain), height (across the chain, along the
        axis it wraps round), thick (off the surface it lies on), material, alt (optional material for every other link,
        so the chain shows its movement), mark (optional material for one link), markAt (index of that link)}
        Call .put(i, x, y, z, tx, ty, tz, nx, ny, nz): link i is centred on (x, y, z), its long side along the tangent t
        and its thin side along the normal n (roughly at right angles to t; neither needs to be unit length).
        Optional o.geo replaces the plain box for every link and o.altGeo for every other link (odd i); build them with
        the link's long side along local X and its thin side along local Z, centred on the origin.
        Result (a Group, add it at the origin) has .links (the meshes). */
    linkChain: function (o) {
      var g = new THREE.Group(), geo = o.geo || new THREE.BoxGeometry(o.length, o.height, o.thick), m4 = new THREE.Matrix4();
      var X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3();
      g.links = [];
      for (var i = 0; i < o.count; i++) {
        var l = mesh(i % 2 && o.altGeo ? o.altGeo : geo, i === o.markAt && o.mark ? o.mark : (i % 2 && o.alt ? o.alt : o.material)); g.add(l); g.links.push(l);
      }
      g.put = function (i, x, y, z, tx, ty, tz, nx, ny, nz) {
        var l = g.links[i];
        X.set(tx, ty, tz).normalize(); Z.set(nx, ny, nz); Y.crossVectors(Z, X).normalize(); Z.crossVectors(X, Y);
        l.quaternion.setFromRotationMatrix(m4.makeBasis(X, Y, Z)); l.position.set(x, y, z);
        return l;
      };
      return g;
    },

    /** Flat strap bent into a closed loop: a band of rounded-rectangle section swept along a closed path in the local XY
        plane. pts: [[x, y], ...] in order round the loop (counter-clockwise), not repeating the first. o: {thick (full
        size across the band, in the XY plane, default 5), width (full size along local Z, default 16), round (corner
        sharpness, 1 = ellipse, smaller = squarer, default 0.35), segs (round the section, default 28), open (true: the
        path is a strip with two capped ends, not a loop; default false), material}. */
    strapLoop: function (pts, o) {
      var n = pts.length, ns = o.segs || 28, a = (o.thick || 5) / 2, b = (o.width || 16) / 2, e = o.round || 0.35;
      var pos = [], idx = [], i, j, op = !!o.open;
      function sp(v) { return (v < 0 ? -1 : 1) * Math.pow(Math.abs(v), e); }
      for (i = 0; i < n; i++) {
        var p = pts[i], q = pts[op ? Math.min(i + 1, n - 1) : (i + 1) % n], r = pts[op ? Math.max(i - 1, 0) : (i + n - 1) % n], tx = q[0] - r[0], ty = q[1] - r[1], tl = Math.hypot(tx, ty);
        var nx = ty / tl, ny = -tx / tl;                                        // outward normal for a counter-clockwise loop
        for (j = 0; j < ns; j++) {
          var f = 2 * Math.PI * j / ns, u = a * sp(Math.cos(f)), w = b * sp(Math.sin(f));
          pos.push(p[0] + nx * u, p[1] + ny * u, w);
        }
      }
      for (i = 0; i < (op ? n - 1 : n); i++) for (j = 0; j < ns; j++) {
        var A = i * ns + j, B = ((i + 1) % n) * ns + j, C = i * ns + (j + 1) % ns, D = ((i + 1) % n) * ns + (j + 1) % ns;
        idx.push(A, B, C, B, D, C);
      }
      if (op) {                                                                 // flat caps on the two ends
        var c0 = n * ns, c1 = c0 + 1, l = (n - 1) * ns;
        pos.push(pts[0][0], pts[0][1], 0, pts[n - 1][0], pts[n - 1][1], 0);
        for (j = 0; j < ns; j++) { idx.push(c0, j, (j + 1) % ns); idx.push(c1, l + (j + 1) % ns, l + j); }
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      return mesh(g, o.material);
    },

    /** Fork of a universal (Hooke's) joint drawn as in old engravings: a flat strap loop (see strapLoop) on the end of
        a round shaft, which flares into it like the stem of a Y. Same frame and sizes as hookeFork(): joint centre at the
        local origin, shaft along local X coming from -X, cross pins along local Y at (0, +-half) on the middle of the band.
        o: {back (default 78), reach (default 24), half (default 32), thick (default 5), width (default 16), pinch (0 =
        plain oval, up to about 0.6 = narrowed to a point where the shaft joins, default 0.55), shaft (shaft radius,
        default 7), neck (length of the flare, 0 for none, default 22), flare (how many times the shaft radius the flare
        grows to across the band, default 1.75), open (default false), boss (radius, default width / 2 + 1.5), material}.
        With open: true it is a yoke, not a ring: the two arms stop at the pins, leaving the far side open, and each arm
        ends in a round boss on the pin axis (local Y), its flat faces at y = +-.inner and +-.outer.
        The shaft should end at .neckX (= -back - neck) with radius `shaft`. Returns a Group with .half, .thick, .width,
        .neckX, .inner and .outer (for open forks; for rings, the band's inside and outside at the pin). */
    hookeStrapFork: function (o) {
      var back = o.back || 78, reach = o.reach || 24, half = o.half || 32, th = o.thick || 5, wd = o.width || 16;
      var k = o.pinch === undefined ? 0.55 : o.pinch, rs = o.shaft || 7, nk = o.neck === undefined ? 22 : o.neck;
      var A = (back + reach) / 2, c = (back - reach) / 2, ct = c / A, i;
      function gf(cs) { return 1 - k * Math.pow((1 - cs) / 2, 3); }
      var B = half / (Math.sqrt(1 - ct * ct) * gf(ct)), pts = [], op = !!o.open, t0 = Math.acos(ct), grp = new THREE.Group();
      for (i = 0; i < 120; i++) {
        var t = op ? t0 + (2 * Math.PI - 2 * t0) * i / 119 : i * Math.PI / 60;  // an open yoke runs from one pin round the back to the other
        pts.push([-c + A * Math.cos(t), B * Math.sin(t) * gf(Math.cos(t))]);
      }
      grp.add(P.strapLoop(pts, { thick: th, width: wd, open: op, material: o.material }));
      grp.inner = half - th / 2; grp.outer = half + th / 2;
      if (op) {                                                                 // round bosses on the arm ends, on the pin axis
        var rb = o.boss || wd / 2 + 1.5, hb = th / 2 + 2;
        P.at(P.cylY(rb, 2 * hb, o.material), 0, half, 0, grp); P.at(P.cylY(rb, 2 * hb, o.material), 0, -half, 0, grp);
        grp.inner = half - hb; grp.outer = half + hb;
      }
      if (nk > 0) {                                                             // flare: round shaft to a broad oval inside the band's back
        var x0 = -back - nk, x1 = -back + th, ry = rs * (o.flare || 1.75), rz = Math.max(rs, wd / 2 - 0.6), NR = 12, NS = 28, pos = [], idx = [], j;
        for (i = 0; i <= NR; i++) {
          var s = i / NR, sq = s * s, yy = rs + (ry - rs) * sq, zz = rs + (rz - rs) * sq;
          for (j = 0; j < NS; j++) { var f = 2 * Math.PI * j / NS; pos.push(x0 + (x1 - x0) * s, yy * Math.cos(f), zz * Math.sin(f)); }
        }
        for (i = 0; i < NR; i++) for (j = 0; j < NS; j++) {
          var a0 = i * NS + j, a1 = i * NS + (j + 1) % NS, b0 = a0 + NS, b1 = a1 + NS;
          idx.push(a0, a1, b0, a1, b1, b0);
        }
        var cc = pos.length / 3; pos.push(x1, 0, 0);                            // end cap, the crotch of the Y
        for (j = 0; j < NS; j++) idx.push(cc, NR * NS + j, NR * NS + (j + 1) % NS);
        var g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        grp.add(mesh(g, o.material));
      }
      grp.half = half; grp.thick = th; grp.width = wd; grp.neckX = -back - nk;
      return grp;
    },

    /** Cross of a universal joint drawn as in old engravings: a flat plate with four arms that are narrow at the middle
        and broad, rounded ends, like a bow tie both ways. Arms along local +-X and +-Y, plate thickness along local Z.
        Each arm end is pinned into the band of a hookeStrapFork() with the same half and thick: a pin runs out through
        the band and ends in a small round head on its outside. Place it with frame(cross, pinOfFork1, pinOfFork2).
        o: {half (default 32), band (the fork's thick, default 5), end (width of an arm end, default 12), waist (default
        3), thick (plate thickness, default 6), pin (pin radius, default 2.2), head (head radius, default 3.4),
        tip (distance of an arm end from the centre, default half - band / 2 - 1.2), headAt (distance of a head's centre,
        default half + band * 0.575; for an open fork use tip = fork.inner - 1 and headAt = fork.outer),
        material, pinMaterial (default material)} */
    hookeWaistCross: function (o) {
      var half = o.half || 32, bd = o.band || 5, re = (o.end || 12) / 2, w = o.waist === undefined ? 3 : o.waist, th = o.thick || 6;
      var bv = 1, tip = o.tip || half - bd / 2 - 1.2, L = tip - re - bv, sh = new THREE.Shape(), i;
      sh.moveTo(L, -re);
      sh.absarc(L, 0, re, -Math.PI / 2, Math.PI / 2, false); sh.quadraticCurveTo(w, w, re, L);
      sh.absarc(0, L, re, 0, Math.PI, false); sh.quadraticCurveTo(-w, w, -L, re);
      sh.absarc(-L, 0, re, Math.PI / 2, 3 * Math.PI / 2, false); sh.quadraticCurveTo(-w, -w, -re, -L);
      sh.absarc(0, -L, re, Math.PI, 2 * Math.PI, false); sh.quadraticCurveTo(w, -w, L, -re);
      var geo = new THREE.ExtrudeGeometry(sh, { depth: th - 2 * bv, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 2, curveSegments: 10 });
      geo.translate(0, 0, -(th - 2 * bv) / 2);
      var g = new THREE.Group(), pm = o.pinMaterial || o.material, hr = o.head || 3.4, pr = o.pin || 2.2, hc = o.headAt || half + bd / 2 * 1.15;
      g.add(mesh(geo, o.material));
      for (i = 0; i < 4; i++) {                                                // pin from inside the arm end out to the head
        var ax = [[1, 0], [0, 1], [-1, 0], [0, -1]][i], len = hc - (tip - 3), mid = (hc + tip - 3) / 2;
        var pin = P.cylY(pr, len, pm), hd = P.sphere(hr, pm);
        if (ax[0]) { pin.rotation.z = Math.PI / 2; pin.position.x = ax[0] * mid; hd.position.x = ax[0] * hc; }
        else { pin.position.y = ax[1] * mid; hd.position.y = ax[1] * hc; }
        g.add(pin); g.add(hd);
      }
      return g;
    },

    /** Hollow shaft (sleeve) with a short piece at its end partly cut away, for lost-motion drives where a pin on the
        shaft inside pushes the cut edge. Axis local Z, from z = 0 to z = len; the last cutLen (z = len - cutLen .. len)
        keeps its wall only from angle 0 counter-clockwise to 2 pi - open, so the gap runs from -open to 0. A pin turning
        counter-clockwise in the gap pushes the edge at angle 0. A radial pin of radius pr reaching to rOut touches that
        edge when it is asin(pr / rOut) behind it. open = pi + 2 asin(pr / rOut) leaves exactly half a turn of free play;
        open = 2 asin(pr / rOut) is a slot the pin just fills.
        o: {rIn, rOut, len, cutLen, open (radians), material} */
    cutSleeve: function (o) {
      var g = new THREE.Group(), z0 = o.len - o.cutLen;
      function ring(a0, a1, depth, z) {
        var sh = new THREE.Shape();
        sh.absarc(0, 0, o.rOut, a0, a1, false); sh.absarc(0, 0, o.rIn, a1, a0, true);
        var m = mesh(new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 48 }), o.material);
        m.position.z = z; g.add(m); return m;
      }
      if (z0 > 0) ring(0, 2 * Math.PI, z0, 0);
      ring(0, 2 * Math.PI - o.open, o.cutLen, z0);
      return g;
    },

    /** Flat strip of rectangular section along a path in the local XY plane, for leaf springs that bend while running.
        o: {points: [[x, y], ...] (two or more), thick (across the path, in XY, default 3), width (along Z, centred on
        z = 0, default 8), material}. Call .setPoints(points) with the same number of points to bend it; mark it
        userData.live. */
    flatStrip: function (o) {
      var n = o.points.length, t = (o.thick || 3) / 2, w = (o.width || 8) / 2, geo = new THREE.BufferGeometry();
      var pos = new Float32Array((n * 8 + 8) * 3), idx = [], i, s;
      for (s = 0; s < 4; s++) for (i = 0; i < n - 1; i++) {
        var a = s * 2 * n + i * 2, b = a + 2;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
      var e = n * 8; idx.push(e, e + 2, e + 1, e, e + 3, e + 2, e + 4, e + 5, e + 6, e + 4, e + 6, e + 7);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
      var m = mesh(geo, o.material);
      m.setPoints = function (p) {
        var C = [];
        for (i = 0; i < n; i++) {
          var p0 = p[Math.max(0, i - 1)], p1 = p[Math.min(n - 1, i + 1)], dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
          var nx = -dy / L * t, ny = dx / L * t;
          C.push([[p[i][0] + nx, p[i][1] + ny, -w], [p[i][0] + nx, p[i][1] + ny, w], [p[i][0] - nx, p[i][1] - ny, w], [p[i][0] - nx, p[i][1] - ny, -w]]);
        }
        function put(k, v) { pos[k * 3] = v[0]; pos[k * 3 + 1] = v[1]; pos[k * 3 + 2] = v[2]; }
        for (s = 0; s < 4; s++) for (i = 0; i < n; i++) { put(s * 2 * n + i * 2, C[i][s]); put(s * 2 * n + i * 2 + 1, C[i][(s + 1) % 4]); }
        for (s = 0; s < 4; s++) { put(n * 8 + s, C[0][s]); put(n * 8 + 4 + s, C[n - 1][s]); }
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
        return m;
      };
      return m.setPoints(o.points);
    },

    /** Stud wheel: a flat disc with round studs (pins) standing out of its front face at equal steps round a circle,
        for tappet-and-stud and pin-wheel drives. Axis local Z, back face at z = -width, front face at z = 0, studs from
        z = 0 to z = studLength. o: {radius, width (default 6), studs, ring (radius of the stud circle), studRadius
        (default 4), studLength (default 20), start (angle of the first stud, default 0), material, studMaterial (default
        material), markMaterial (optional, used for the first stud)}. Result has .pitch (radians between studs). */
    studWheel: function (o) {
      var g = new THREE.Group(), w = o.width || 6, n = o.studs, rs = o.studRadius || 4, sl = o.studLength || 20, i;
      P.at(P.cylZ(o.radius, w, o.material), 0, 0, -w / 2, g);
      for (i = 0; i < n; i++) {
        var a = (o.start || 0) + i * 2 * Math.PI / n, m = (i === 0 && o.markMaterial) || o.studMaterial || o.material;
        P.at(P.cylZ(rs, sl, m), o.ring * Math.cos(a), o.ring * Math.sin(a), sl / 2, g);
      }
      g.pitch = 2 * Math.PI / n;
      return g;
    },

    /** Single-tooth stop drive: a driver disc with one finger turns a driven wheel one step per turn, and the round rim
        of the driver locks the wheel between steps. The driven angle is found from the two outlines (the finger pushes
        the wheel just far enough not to cut into it), and the driver's rim is cut back wherever the wheel swings through.
        Frame: driver centre at the origin, driven centre at (dist, 0), both turning about Z. Driver rotation.z = beta,
        with the finger along local +X; driven rotation.z = theta(beta), 0 while the finger points along -X.
        o: {dist, drivenR: function(angle) giving the driven rim radius (the outline must be star-shaped; at rest a lock
        hollow faces -X), finger: {base, tip, half} (a bar of half-width half from radius base to a round end centred at
        radius tip), lockR (driver rim radius), clear (gap cut round the moving wheel, default 0.6), dir (1 if the driver
        turns anticlockwise, -1 if clockwise), pitch (radians per step; if given, the found motion is scaled by the
        last trace of error so the wheel stops exactly one step on)}
        Result: {theta(beta), continuous over any number of turns; travel (radians the wheel moves per turn: design the
        outlines so it equals one step); driverR(a) and drivenR(a), the outline radii; driverShape(), drivenShape(), THREE
        shapes to extrude; overlap(beta, theta), true if the finger cuts into the wheel there}. */
    oneToothDrive: function (o) {
      var TAU = 2 * Math.PI, D = o.dist, f = o.finger, RL = o.lockR, cl = o.clear === undefined ? .6 : o.clear, s = o.dir < 0 ? -1 : 1;
      var NB = 7200, M = 1440, NT = 7200, dB = TAU / NT, rD = new Float64Array(NB + 1), Rmax = 0, i, k, a;
      for (i = 0; i <= NB; i++) { rD[i] = i < NB ? o.drivenR(i * TAU / NB) : rD[0]; Rmax = Math.max(Rmax, rD[i]); }
      function rd(a) { var u = (a / TAU - Math.floor(a / TAU)) * NB, j = Math.min(NB - 1, Math.floor(u)); return rD[j] + (rD[j + 1] - rD[j]) * (u - j); }
      var rim = [];                                        // rim points per bin, steep walls filled in
      for (k = 0; k < NB; k++) {
        var pts = [], g0 = k * TAU / NB, r0 = rD[k], r1 = rD[k + 1], n = Math.ceil(Math.abs(r1 - r0) / .25);
        pts.push([r0 * Math.cos(g0), r0 * Math.sin(g0)]);
        for (i = 1; i < n; i++) { var rr = r0 + (r1 - r0) * i / n, gg = g0 + TAU / NB * i / n; pts.push([rr * Math.cos(gg), rr * Math.sin(gg)]); }
        rim.push(pts);
      }
      var fp = [], x, y;                                   // points round the finger
      for (x = f.base; x <= f.tip; x += .25) fp.push([x, f.half], [x, -f.half]);
      for (y = -f.half; y <= f.half; y += .25) fp.push([f.base, y]);
      for (i = 0; i <= 48; i++) { a = -Math.PI / 2 + Math.PI * i / 48; fp.push([f.tip + f.half * Math.cos(a), f.half * Math.sin(a)]); }
      function inFinger(x, y) { return (x >= f.base && x <= f.tip && Math.abs(y) < f.half) || (x - f.tip) * (x - f.tip) + y * y < f.half * f.half; }
      function fingerR(a) {
        var c = Math.cos(a), sn = Math.abs(Math.sin(a)), xs, q;
        if (c <= 0) return 0;
        xs = sn > 1e-9 ? f.half / sn * c : Infinity;
        if (xs < f.base) return 0;
        if (xs <= f.tip) return f.half / sn;
        q = f.half * f.half - f.tip * f.tip * sn * sn; return q < 0 ? 0 : f.tip * c + Math.sqrt(q);
      }
      function overlap(b, t) {
        var cb = Math.cos(b), sb = Math.sin(b), ct = Math.cos(t), st = Math.sin(t), j, X, Y, xx, yy, r, lo = 9, hi = -9, ga, d;
        X = cb * f.tip - D; Y = sb * f.tip;
        if (X * X + Y * Y > Math.pow(Rmax + f.half + f.tip - f.base + 1, 2)) return false;
        ga = Math.atan2(-st * X + ct * Y, ct * X + st * Y);
        for (j = 0; j < fp.length; j++) {
          X = cb * fp[j][0] - sb * fp[j][1] - D; Y = sb * fp[j][0] + cb * fp[j][1];
          xx = ct * X + st * Y; yy = -st * X + ct * Y; r = Math.sqrt(xx * xx + yy * yy); a = Math.atan2(yy, xx);
          if (r < rd(a)) return true;
          d = a - ga; d -= TAU * Math.round(d / TAU); lo = Math.min(lo, d); hi = Math.max(hi, d);
        }
        var k0 = Math.floor((ga + lo) / TAU * NB) - 1, k1 = Math.ceil((ga + hi) / TAU * NB) + 1, kk, q;
        for (kk = k0; kk <= k1; kk++) {
          var ps = rim[((kk % NB) + NB) % NB];
          for (q = 0; q < ps.length; q++) {
            X = ct * ps[q][0] - st * ps[q][1] + D; Y = st * ps[q][0] + ct * ps[q][1];
            if (inFinger(cb * X + sb * Y, -sb * X + cb * Y)) return true;
          }
        }
        return false;
      }
      var tab = new Float64Array(NT + 1), t = 0, b, lo, hi, it;     // the push, one driver turn from the finger pointing away
      for (i = 0; i <= NT; i++) {
        b = Math.PI + s * i * dB;
        if (overlap(b, t)) {
          lo = t; hi = t;
          for (it = 0; it < 400 && overlap(b, hi); it++) { lo = hi; hi -= s * .004; }
          for (it = 0; it < 24; it++) { var m = (lo + hi) / 2; if (overlap(b, m)) lo = m; else hi = m; }
          t = hi;
        }
        tab[i] = t;
      }
      var end = tab[NT], sc = o.pitch ? o.pitch / Math.abs(end) : 1;   // remove the last trace of step error so the wheel stops exactly one step on
      for (i = 0; i <= NT; i++) tab[i] *= sc;
      var travel = Math.abs(end); end = tab[NT];
      function theta(b) {
        var p = s * (b - Math.PI), n = Math.floor(p / TAU), u = (p - n * TAU) / dB, j = Math.min(NT - 1, Math.floor(u));
        return n * end + tab[j] + (tab[j + 1] - tab[j]) * (u - j);
      }
      var cut = new Float64Array(M).fill(RL), w = Math.asin(Math.min(1, (RL + cl + 2) / D)) + .03;   // driver rim cut back where the wheel swings
      for (i = 0; i < NT; i += 2) {
        b = Math.PI + s * i * dB; t = tab[i];
        var cb = Math.cos(b), sb = Math.sin(b), ct = Math.cos(t), st = Math.sin(t), gd = Math.atan2(D * st, -D * ct);
        var k0 = Math.floor((gd - w) / TAU * NB), k1 = Math.ceil((gd + w) / TAU * NB), kk, q, X, Y, xx, yy, rr2, jb, jj;
        for (kk = k0; kk <= k1; kk++) {
          var ps = rim[((kk % NB) + NB) % NB];
          for (q = 0; q < ps.length; q++) {
            X = ct * ps[q][0] - st * ps[q][1] + D; Y = st * ps[q][0] + ct * ps[q][1];
            xx = cb * X + sb * Y; yy = -sb * X + cb * Y; rr2 = Math.sqrt(xx * xx + yy * yy);
            if (rr2 < RL + cl) {
              jb = Math.round(Math.atan2(yy, xx) / TAU * M);
              for (jj = jb - 1; jj <= jb + 1; jj++) { var mj = ((jj % M) + M) % M; cut[mj] = Math.min(cut[mj], rr2 - cl); }
            }
          }
        }
      }
      function driverR(a) {
        var u = (a / TAU - Math.floor(a / TAU)) * M, j = Math.floor(u) % M, c = cut[j] + (cut[(j + 1) % M] - cut[j]) * (u - Math.floor(u));
        return Math.max(c, fingerR(Math.atan2(Math.sin(a), Math.cos(a))));
      }
      function shape(fn, n) {
        var sh = new THREE.Shape(), j, aa, r;
        for (j = 0; j < n; j++) { aa = j * TAU / n; r = fn(aa); if (j) sh.lineTo(r * Math.cos(aa), r * Math.sin(aa)); else sh.moveTo(r, 0); }
        sh.closePath(); return sh;
      }
      return { theta: theta, travel: travel, driverR: driverR, drivenR: rd, overlap: overlap,
        driverShape: function () { return shape(driverR, 5760); }, drivenShape: function () { return shape(rd, NB); } };
    },

    /** Face ratchet: a flat ring with saw teeth standing up from its +Z face, for a pawl that presses on the face of a
        wheel instead of its rim. Axis local Z, back face at z = 0, tooth roots at z = base, tips at z = base + depth.
        o: {teeth, rIn, rOut, depth (default 6), base (default 2), reverse (default false), material}
        Going round by increasing angle the face climbs from root to tip, then drops at a steep face on each multiple of
        .pitch, so a pawl resting on it slides freely that way and is stopped the other way. `reverse` mirrors the teeth.
        Result has .pitch (radians per tooth) and .heightAt(angle), the z of the face at a local angle, for lifting a pawl. */
    faceRatchet: function (o) {
      var N = o.teeth, a = o.rIn, b = o.rOut, d = o.depth || 6, base = o.base === undefined ? 2 : o.base, st = 2 * Math.PI / N,
        rev = !!o.reverse, M = 6, pos = [], i, j;
      function h(f) { return base + d * (rev ? 1 - f : f); }
      function v(r, t, z) { return [r * Math.cos(t), r * Math.sin(t), z]; }
      function quad(p, q, r, s) { pos.push.apply(pos, p.concat(q, r, p, r, s)); }
      for (i = 0; i < N; i++) {
        for (j = 0; j < M; j++) {
          var t0 = (i + j / M) * st, t1 = (i + (j + 1) / M) * st, z0 = h(j / M), z1 = h((j + 1) / M);
          quad(v(a, t0, z0), v(b, t0, z0), v(b, t1, z1), v(a, t1, z1));    // sloping top
          quad(v(b, t0, 0), v(b, t1, 0), v(b, t1, z1), v(b, t0, z0));      // outer side
          quad(v(a, t1, 0), v(a, t0, 0), v(a, t0, z0), v(a, t1, z1));      // inner side
          quad(v(a, t1, 0), v(b, t1, 0), v(b, t0, 0), v(a, t0, 0));        // back
        }
        var tw = i * st, lo = h(0), hi = h(1);                              // steep face where tooth i starts
        if (hi > lo) quad(v(a, tw, lo), v(a, tw, hi), v(b, tw, hi), v(b, tw, lo));   // faces increasing angle
        else quad(v(a, tw, hi), v(b, tw, hi), v(b, tw, lo), v(a, tw, lo));           // faces decreasing angle
      }
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      var m = mesh(g, o.material); m.pitch = st;
      m.heightAt = function (t) { var f = t / st + 1e-9; f -= Math.floor(f); return h(f); };
      return m;
    },

    /** Straight ratchet rack: a flat bar with saw teeth on one or both long edges, for hooks or pawls that move it step by
        step. Local Y runs along the bar from y = 0 to y = length; x = 0 is its centre line; it is `thick` deep, centred on z = 0.
        o: {length, half (half width at the tooth roots), depth (tooth height, default 6), pitch, teeth (count), from (y of
        the lowest tooth, default 0), sides (1 = +X edge, -1 = -X edge, 2 = both; default 2), thick (default 10),
        slot (optional {from, to, half}: a round-ended slot through the bar along Y), material}
        Each tooth has a flat underside (a ledge facing -Y) at y = from + n * pitch, n = 0 .. teeth - 1, and slopes back to the
        root going up. A pawl moving up the bar catches a ledge; moving down it slides over. Outside the teeth the edge is
        at the root. Result has .pitch and .edgeAt(y), the distance of the edge from the centre line at height y. */
    ratchetRack: function (o) {
      var L = o.length, w = o.half, d = o.depth || 6, p = o.pitch, n = o.teeth, y0 = o.from || 0, sides = o.sides || 2,
        t = o.thick || 10, sh = new THREE.Shape(), i;
      function edge(sx, on) {                                               // points up one edge, bottom to top, x signed by sx
        var pts = [[w, 0]];
        if (on) { for (i = 0; i < n; i++) { pts.push([w, y0 + i * p], [w + d, y0 + i * p]); } pts.push([w, y0 + n * p]); }
        pts.push([w, L]);
        return pts.map(function (q) { return [sx * q[0], q[1]]; });
      }
      var right = edge(1, sides === 1 || sides === 2), left = edge(-1, sides === -1 || sides === 2).reverse();
      var all = right.concat(left).filter(function (q, k, a) { var r = a[(k + a.length - 1) % a.length]; return k === 0 || q[0] !== r[0] || q[1] !== r[1]; });
      all.forEach(function (q, k) { if (k === 0) sh.moveTo(q[0], q[1]); else sh.lineTo(q[0], q[1]); });
      sh.closePath();
      if (o.slot) {
        var s = o.slot, hole = new THREE.Path();
        hole.moveTo(s.half, s.from + s.half); hole.lineTo(s.half, s.to - s.half);
        hole.absarc(0, s.to - s.half, s.half, 0, Math.PI, false); hole.lineTo(-s.half, s.from + s.half);
        hole.absarc(0, s.from + s.half, s.half, Math.PI, 2 * Math.PI, false);
        sh.holes.push(hole);
      }
      var g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, -t / 2);
      var m = mesh(g, o.material); m.pitch = p;
      m.edgeAt = function (y) {
        if (y < y0 || y >= y0 + n * p) return w;
        var f = (y - y0) / p; f -= Math.floor(f); return w + d * (1 - f);
      };
      return m;
    },

    /** Hooked pawl that pulls a ratchet tooth towards its pivot, for pawls that lie almost along the rim (hanging from a
        lever above the wheel). Pivots at the local origin about local Z. Its nose is the point (length, 0); the bar bows out
        to the side given by `side` (1 for +Y, -1 for -Y, so put it on the side away from the wheel) and a claw comes back to
        the nose. The claw's flat face looks back towards the pivot, to sit against a tooth face.
        o: {length, reach (how far the bar's inner edge stands off the pivot-nose line at the claw, default 12),
        thick (default 7), width (default 12), claw (length of the claw along X, default 7), steep (rise of the claw's back per unit along X, default 1), lean (how far the top of the
        claw's face leans away from the pivot, default 0; lean it back so the face never cuts a tooth when the pawl meets
        the rim at a slant), side, material}
        Result has .outline: the shape's corners [[x, y], ...] in local XY, for checking clearances. */
    hookPawl: function (o) {
      var L = o.length, h = o.reach || 12, t = o.thick || 7, w = o.width || 12, k = o.claw || 7, s = o.side < 0 ? -1 : 1;
      var pts = [[0, -s * t / 2], [L + (o.lean || 0), s * h], [L, 0], [L + k, s * k * (o.steep || 1)], [L + Math.max(k, (o.lean || 0) + 3), s * (h + t)], [0, s * t / 2]];
      var sh = new THREE.Shape(), g = new THREE.Group();
      pts.forEach(function (p, i) { if (i) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
      sh.closePath();
      var wb = w - .8;      // body a little thinner than the wheel it rides on, so its faces never share a plane with the wheel's (flicker)
      var b = new THREE.ExtrudeGeometry(sh, { depth: wb, bevelEnabled: false }); b.translate(0, 0, -wb / 2);
      g.add(mesh(b, o.material));
      g.add(P.cylZ(t, w + 2, o.material));
      g.outline = pts;
      return g;
    },

    /** Pedestal bearing for a shaft that runs straight through it: an upright plate with a round boss on top, bored
        through. Axis local Z (the shaft runs along Z through the bore), centred on the origin; the foot is at y = -drop.
        o: {bore (hole radius; make it a little more than the shaft so the surfaces do not touch), outer (boss radius),
        post (plate width, default 1.5 * outer, less than 2 * outer), width (thickness along Z, default 14), drop, material}
        For a shaft along X, set rotation.y = PI / 2. Width runs from z = -width/2 to +width/2. */
    bearingBlock: function (o) {
      var R = o.outer, hw = Math.min((o.post || 1.5 * R) / 2, R * .95), yj = Math.sqrt(R * R - hw * hw), al = Math.atan2(yj, hw), w = o.width || 14;
      var sh = new THREE.Shape();
      sh.moveTo(-hw, -o.drop); sh.lineTo(hw, -o.drop); sh.lineTo(hw, -yj);
      sh.absarc(0, 0, R, -al, Math.PI + al, false); sh.lineTo(-hw, -o.drop);
      var hole = new THREE.Path(); hole.absarc(0, 0, o.bore, 0, 2 * Math.PI, true); sh.holes.push(hole);
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, -w / 2);
      return mesh(g, o.material);
    },

    /** Guide block: a box with a round hole straight through it along local Y, for a rod that slides in a fixed guide
        (or a shaft in a plain bearing). Centred on the origin: x -w/2..w/2, y -h/2..h/2, z -d/2..d/2.
        o: {w, h, d, hole (radius), hx, hz (hole centre, default 0, 0), material}
        For a hole along X, set mesh.rotation.z = Math.PI / 2 (then w becomes the height); along Z, rotation.x = Math.PI / 2.
        Give the hole about half a unit more radius than the rod so their surfaces do not touch. */
    guideBlock: function (o) {
      var w = o.w, d = o.d, h = o.h, hx = o.hx || 0, hz = o.hz || 0, sh = new THREE.Shape(), hole = new THREE.Path();
      sh.moveTo(-w / 2, -d / 2); sh.lineTo(w / 2, -d / 2); sh.lineTo(w / 2, d / 2); sh.lineTo(-w / 2, d / 2); sh.closePath();
      hole.absarc(hx, -hz, o.hole, 0, 2 * Math.PI, true); sh.holes.push(hole);
      var g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 32 });
      g.translate(0, 0, -h / 2); g.rotateX(-Math.PI / 2);                   // shape y becomes -z, extrusion becomes +y
      return mesh(g, o.material);
    },

    /** Toothed arc (ratchet sector): a flat plate shaped as a slice of a ratchet wheel, with saw teeth on its curved edge,
        for arcs that rock on a shaft and drive or hold a ratchet. Centre at the local origin, plate in local XY, `thick`
        along Z centred on z = 0. It spans local angles from..to (radians, from < to) between radius `inner` (a straight
        edge across the slice, default 0 = a point) and the teeth.
        o: {radius (tooth tips), depth (default 7), pitch (radians per tooth), from, to, inner (default 0), thick (default 12),
        reverse (default false), land (default 1: the slope fills the whole pitch; below 1 the slope is that share of the
        pitch, steeper, and the rest is flat at the root, giving narrower teeth with room behind them), windows (default
        false: two rounded holes either side of a centre web, as in old drawings), material}
        The teeth follow ratchet(): steep faces on multiples of .pitch; going by increasing angle the edge climbs from root
        to tip, then drops; `reverse` mirrors them. Result has .pitch and .rimAt(angle), the edge radius at a local angle. */
    ratchetSector: function (o) {
      var R = o.radius, d = o.depth || 7, st = o.pitch, a0 = o.from, a1 = o.to, ri = o.inner || 0, t = o.thick || 12, rev = !!o.reverse;
      var ld = o.land || 1;
      function rim(a) { var f = (rev ? -a : a) / st + 1e-9; f -= Math.floor(f); return R - d * Math.min(1, (1 - f) / ld); }
      var pts = [], k, a, e = 1e-4;
      function pol(r, a) { pts.push([r * Math.cos(a), r * Math.sin(a)]); }
      if (ri > 0) { pol(ri / Math.cos((a1 - a0) / 2), a0); } else pts.push([0, 0]);
      pol(rim(a0 + e), a0);
      var faces = [];
      for (k = Math.ceil(a0 / st + e); k * st < a1 - e; k++) faces.push(k * st);
      var marks = [a0].concat(faces, [a1]);
      for (k = 0; k + 1 < marks.length; k++) {
        var lo = marks[k], hi = marks[k + 1], j;
        var as = [0, .25, .5, .75, 1].map(function (q) { return lo + (hi - lo) * q; });
        if (ld < 1) {                                                         // corner where the slope meets the flat
          var c0 = (rev ? -1 : 1) * (1 - ld) * st, cn = c0 + st * (Math.floor((lo - c0) / st) + 1);
          if (cn < hi) as.push(cn);
        }
        as.sort(function (x, y) { return x - y; });
        for (j = 0; j < as.length; j++) { a = as[j]; pol(rim(Math.min(hi - e, Math.max(lo + e, a))), a); }
      }
      if (ri > 0) pol(ri / Math.cos((a1 - a0) / 2), a1);
      var sh = new THREE.Shape();
      pts.forEach(function (p, i) { if (i) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
      sh.closePath();
      if (o.windows) {
        var mid = (a0 + a1) / 2, rIn = Math.max(ri + 14, .3 * R), rOut = R - d - 14, web = 7, edge = 13;
        [-1, 1].forEach(function (s) {
          var h = new THREE.Path(), ae = s < 0 ? a0 : a1;
          var q = [[rIn, mid + s * web / rIn], [rOut, mid + s * web / rOut], [rOut, ae - s * edge / rOut], [rIn + 20, ae - s * edge / (rIn + 20)]];
          q.forEach(function (p, i) { var x = p[0] * Math.cos(p[1]), y = p[0] * Math.sin(p[1]); if (i) h.lineTo(x, y); else h.moveTo(x, y); });
          h.closePath(); sh.holes.push(h);
        });
      }
      var g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }); g.translate(0, 0, -t / 2);
      var m = mesh(g, o.material); m.pitch = st; m.rimAt = rim;
      return m;
    },

    /** Outline of a heart cam, as a list of [x, y] points going round once (counter-clockwise, about 1440 of them).
        The centre path of a follower roller is the Archimedean heart: radius rmin pointing along +X (the dimple), growing
        in a straight line with angle to rmax pointing along -X (the point), then shrinking again on the other side. A
        follower sliding along +X from the centre therefore moves at a steady speed out and back.
        o: {rmin, rmax, offset (default 0: the centre path itself; a negative number gives the edge a roller of that radius
        rolls on, a positive one gives the outer wall of a groove), n (points, default 1440)}
        The offset curve is found as the envelope of circles along the path, so the pointed ends are rounded or sharp the way
        a real cutter or roller would leave them. Use it for the plate (extrude it) and, at +/- half the groove width, for the
        two walls of a groove. */
    heartCurve: function (o) {
      var rmin = o.rmin, rmax = o.rmax, d = o.offset || 0, nb = o.n || 1440, k = (rmax - rmin) / Math.PI, TP = 2 * Math.PI;
      function rho(f) { return rmin + k * Math.abs(f); }
      if (!d) { var pts = []; for (var i = 0; i < nb; i++) { var a = -Math.PI + TP * (i + .5) / nb; pts.push([rho(a) * Math.cos(a), rho(a) * Math.sin(a)]); } return pts; }
      function norm(f, s) {                       // outward unit normal of the path at angle f, on the side s (-1 or +1) of a corner
        var c = Math.cos(f), sn = Math.sin(f), r = rho(f), tx = s * k * c - r * sn, ty = s * k * sn + r * c, l = Math.hypot(tx, ty);
        return Math.atan2(-tx / l, ty / l);
      }
      var raw = [], N = 6000, j, f, s, ang;
      function add(f, ang) { raw.push([rho(f) * Math.cos(f) + d * Math.cos(ang), rho(f) * Math.sin(f) + d * Math.sin(ang)]); }
      for (j = 0; j <= N; j++) { f = -Math.PI + TP * j / N; s = f < 0 ? -1 : 1; add(f, norm(f, s)); }
      [[0, -1, 1], [Math.PI, 1, -1], [-Math.PI, 1, -1]].forEach(function (q) {   // fans of normals at the corners
        var a0 = norm(q[0], q[1]), a1 = norm(q[0], q[2]), da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
        for (j = 0; j <= 60; j++) add(q[0], a0 + da * j / 60);
      });
      var rb = new Array(nb), m;
      raw.forEach(function (p) {
        var a = Math.atan2(p[1], p[0]), r = Math.hypot(p[0], p[1]), b = Math.min(nb - 1, Math.floor((a + Math.PI) / TP * nb));
        if (rb[b] === undefined || (d > 0 ? r > rb[b] : r < rb[b])) rb[b] = r;
      });
      for (j = 0; j < nb; j++) if (rb[j] === undefined) {   // fill any gap from its neighbours
        var lo = j, hi = j; while (rb[(lo + nb) % nb] === undefined) lo--; while (rb[hi % nb] === undefined) hi++;
        rb[j] = rb[(lo + nb) % nb] + (rb[hi % nb] - rb[(lo + nb) % nb]) * (j - lo) / (hi - lo);
      }
      var out = [];
      for (j = 0; j < nb; j++) { ang = -Math.PI + TP * (j + .5) / nb; out.push([rb[j] * Math.cos(ang), rb[j] * Math.sin(ang)]); }
      return out;
    },

    /** Drum (cylinder) cam: a round drum on the X axis with a groove cut round its surface, as a Group.
        A point at angle phi round the drum, x along the axis, is (x, r*cos(phi), r*sin(phi)); rotate the group about X to turn it.
        The groove's centre line is x = path(phi) (any periodic function of phi, one x for each phi). Its walls are path(phi)
        plus and minus halfWidth along the axis, and its floor is `depth` below the surface. Walls and floor are exact, built
        column by column, so a follower pin of radius a little under halfWidth * cos(slope) runs in it without touching.
        o: {radius, depth, length (along X, centred on 0), halfWidth, path, material, floorMaterial (optional, for the groove floor), n (columns round the drum, default 720)}
        The surface covers x = -length/2 .. length/2 only: add end caps (flush with those ends) yourself. */
    groovedDrum: function (o) {
      var g = new THREE.Group(), n = o.n || 720, L = o.length / 2, r1 = o.radius, r0 = o.radius - o.depth, hw = o.halfWidth, TP = 2 * Math.PI;
      var cols = [], i, k;
      for (i = 0; i <= n; i++) {
        var f = TP * i / n, xc = o.path(f);
        cols.push({ c: Math.cos(f), s: Math.sin(f), xs: [-L, xc - hw, xc - hw, xc + hw, xc + hw, L], rs: [r1, r1, r0, r0, r1, r1] });
      }
      for (k = 0; k < 5; k++) {
        var pos = [], idx = [];
        for (i = 0; i <= n; i++) {
          var cl = cols[i];
          [k, k + 1].forEach(function (q) { pos.push(cl.xs[q], cl.rs[q] * cl.c, cl.rs[q] * cl.s); });
          if (i < n) { var b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.setIndex(idx); geo.computeVertexNormals();
        g.add(mesh(geo, k === 2 && o.floorMaterial ? o.floorMaterial : o.material));
      }
      return g;
    },

    /** Part of an internal gear: an arc of teeth on the inside, from angle fromDeg to toDeg (only whole teeth, plus half a gap at each end).
        Axis local Z, centred on the origin, teeth on multiples of .pitch exactly as on internalGear.
        o: {teeth, module (default 8), width (default 16), rim (default 1.5 * module), fromDeg, toDeg, material}
        Result has .pitchRadius, .pitch, .rootRadius, .outerRadius, .startAngle and .endAngle (radians, the two flat ends). */
    internalSector: function (o) {
      var N = o.teeth, md = o.module || 8, w = o.width || 16, rp = N * md / 2, rt = rp - md, rr = rp + 1.25 * md;
      var Ro = rr + (o.rim === undefined ? 1.5 * md : o.rim), st = 2 * Math.PI / N;
      var i0 = Math.ceil(o.fromDeg * Math.PI / 180 / st), i1 = Math.floor(o.toDeg * Math.PI / 180 / st), a0 = (i0 - .5) * st, a1 = (i1 + .5) * st;
      var sh = new THREE.Shape(), pts = [], i, a;
      for (i = i0; i <= i1; i++) { a = i * st; pts.push([rr, a - .27 * st], [rt, a - .11 * st], [rt, a + .11 * st], [rr, a + .27 * st]); }
      sh.moveTo(Ro * Math.cos(a0), Ro * Math.sin(a0));
      sh.absarc(0, 0, Ro, a0, a1, false);
      sh.lineTo(rr * Math.cos(a1), rr * Math.sin(a1));
      for (i = pts.length - 1; i >= 0; i--) sh.lineTo(pts[i][0] * Math.cos(pts[i][1]), pts[i][0] * Math.sin(pts[i][1]));
      sh.closePath();
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 48 });
      g.translate(0, 0, -w / 2);
      var s = mesh(g, o.material); s.pitchRadius = rp; s.pitch = st; s.rootRadius = rr; s.outerRadius = Ro; s.startAngle = a0; s.endAngle = a1;
      return s;
    },

    /** Cog wheel with teeth that are the same on both sides (flat tip, sloping flanks, flat root), so a click can drive it either way.
        Axis local Z, centred on the origin, one tooth centred on angle 0.
        o: {teeth, radius (to the tooth tips), depth (default 10), width (default 16), tip (tip width as a fraction of the pitch, default .1),
        flank (width of each sloping side as a fraction of the pitch, default .25), material}
        The gap between teeth is the rest of the pitch. Result has .pitch (radians per tooth) and .rimAt(angle), the rim radius at a
        local angle; it is even in the angle, and its tooth centres lie on multiples of .pitch. */
    cogWheel: function (o) {
      var N = o.teeth, R = o.radius, d = o.depth || 10, w = o.width || 16, a = o.tip == null ? .1 : o.tip, f = o.flank == null ? .25 : o.flank;
      var st = 2 * Math.PI / N, sh = new THREE.Shape(), i, first = true, h = a / 2;
      function pt(r, ang) { var x = r * Math.cos(ang), y = r * Math.sin(ang); if (first) { sh.moveTo(x, y); first = false; } else sh.lineTo(x, y); }
      for (i = 0; i < N; i++) {
        var c = i * st;
        pt(R, c - h * st); pt(R, c + h * st); pt(R - d, c + (h + f) * st); pt(R - d, c + (1 - h - f) * st);
      }
      sh.closePath();
      var g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2);
      var wheel = mesh(g, o.material); wheel.pitch = st;
      wheel.rimAt = function (ang) { var s = ang / st; s = Math.abs(s - Math.round(s)); return s <= h ? R : s <= h + f ? R - d * (s - h) / f : R - d; };
      return wheel;
    },

    /** Flat arm (crank, lever or link): a rounded plate from a hub circle at the local origin to an end circle at (length, 0),
        with an optional slot cut through it. Axis local Z, thickness centred on z = 0.
        o: {length, r0 (hub radius), r1 (end radius, default r0), thick, slot: {from, to, width} (distances along the arm, optional), material}
        Rotate the returned mesh about Z to swing it. */
    armPlate: function (o) {
      var L = o.length, r0 = o.r0, r1 = o.r1 || o.r0, g = Math.acos((r0 - r1) / L), sh = new THREE.Shape();
      sh.moveTo(r0 * Math.cos(g), r0 * Math.sin(g)); sh.lineTo(L + r1 * Math.cos(g), r1 * Math.sin(g));
      sh.absarc(L, 0, r1, g, -g, true); sh.lineTo(r0 * Math.cos(g), -r0 * Math.sin(g));
      sh.absarc(0, 0, r0, -g, g - 2 * Math.PI, true);
      if (o.slot) {
        var s = o.slot, h = s.width / 2, hole = new THREE.Path();
        hole.moveTo(s.from, -h); hole.lineTo(s.to, -h); hole.absarc(s.to, 0, h, -Math.PI / 2, Math.PI / 2, false);
        hole.lineTo(s.from, h); hole.absarc(s.from, 0, h, Math.PI / 2, 1.5 * Math.PI, false); sh.holes.push(hole);
      }
      var geo = new THREE.ExtrudeGeometry(sh, { depth: o.thick, bevelEnabled: false, curveSegments: 24 }); geo.translate(0, 0, -o.thick / 2);
      return mesh(geo, o.material);
    },

    /** Whole solid of revolution with the same outline as halfSection: the closed-view twin of a cut-away part.
        o: {poly (as halfSection), material, steps (default 48)}. Axis is local Y. Register it with c.shell(mesh, "closed")
        and the halfSection with c.shell(group, "open"). */
    wholeSection: function (o) {
      var p = o.poly.slice(), A = 0, i;
      for (i = 0; i < p.length; i++) { var q = p[(i + 1) % p.length]; A += p[i][0] * q[1] - q[0] * p[i][1]; }
      if (A < 0) p.reverse();   // counter-clockwise in (r, y) puts the faces outward
      var pts = p.concat([p[0]]).map(function (v) { return new THREE.Vector2(Math.max(0, v[0]), v[1]); });
      return mesh(new THREE.LatheGeometry(pts, o.steps || 48), o.material);
    },

    /** Half section of a solid of revolution, as in a cut-away engraving: the front half (+Z) is taken away, the cut face is flat on z = 0.
        o: {poly: [[r, y], ...] closed outline of the wall on the right of the axis (r >= 0, no crossing edges), material, steps (default 28)}
        Axis is local Y. The result is a Group with .set(poly) to change the outline later (used for a part whose outline moves). */
    halfSection: function (o) {
      var g = new THREE.Group(), steps = o.steps || 28, m = o.material, shell = mesh(new THREE.BufferGeometry(), m), fr = mesh(new THREE.BufferGeometry(), m), fl = mesh(new THREE.BufferGeometry(), m);
      g.add(shell); g.add(fr); g.add(fl);
      g.set = function (poly) {
        var pos = [], n = poly.length, i, k, a, b;
        for (i = 0; i < n; i++) {
          a = poly[i]; b = poly[(i + 1) % n];
          if (a[0] === b[0] && a[1] === b[1]) continue;
          for (k = 0; k < steps; k++) {
            var p0 = Math.PI / 2 + Math.PI * k / steps, p1 = Math.PI / 2 + Math.PI * (k + 1) / steps, s0 = Math.sin(p0), c0 = Math.cos(p0), s1 = Math.sin(p1), c1 = Math.cos(p1);
            pos.push(a[0] * s0, a[1], a[0] * c0, b[0] * s0, b[1], b[0] * c0, b[0] * s1, b[1], b[0] * c1,
                     a[0] * s0, a[1], a[0] * c0, b[0] * s1, b[1], b[0] * c1, a[0] * s1, a[1], a[0] * c1);
          }
        }
        var gs = new THREE.BufferGeometry(); gs.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); gs.computeVertexNormals();
        shell.geometry.dispose(); shell.geometry = gs;
        var pr = poly.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), pl = poly.map(function (p) { return new THREE.Vector2(-p[0], p[1]); });
        fr.geometry.dispose(); fr.geometry = new THREE.ShapeGeometry(new THREE.Shape(pr));
        fl.geometry.dispose(); fl.geometry = new THREE.ShapeGeometry(new THREE.Shape(pl));
      };
      g.set(o.poly);
      return g;
    },
    /** Endless chain hung over a chain wheel (chain pulley or sprocket): works out where every joint of the chain is.
        The wheel turns about Z at (o.x, o.y). Its seats hold the joints on a circle of radius .radius, so the chain lies
        round it as a polygon. The chain leaves the wheel at the outermost joint on each side, hangs straight down, and
        its lower end hangs as a round loop as wide as the gap between the two runs.
        o: {seats (joints held in one turn of the wheel; even when the two link lengths differ), lengths ([a, b]: joint
        to joint length of the even and the odd links; b defaults to a), count (links in the loop, even), x, y}
        .seatAngle(j): angle of seat j when the wheel is at angle 0 (seat 0 at the top, numbered clockwise; link j lies
        from seat j to seat j + 1). Build the teeth from it.
        .set(angle): angle is the wheel's rotation.z (clockwise is negative). Afterwards .jx[i], .jy[i] give joint i; link i
        runs from joint i to joint (i + 1) % count and has length lengths[i % 2]. .onWheel[i] is true while link i lies on
        the wheel. .lift is how far the right-hand run goes down per radian the wheel turns clockwise at this moment; it
        ripples as each joint comes on and off the wheel. Returns the object. */
    chainLoop: function (o) {
      var a = o.lengths[0], b = o.lengths[1] || a, n = o.seats, N = o.count, x0 = o.x || 0, y0 = o.y || 0, k, lo, hi;
      function span(R) { return n / 2 * (2 * Math.asin(Math.min(1, a / 2 / R)) + 2 * Math.asin(Math.min(1, b / 2 / R))); }
      for (lo = Math.max(a, b) / 2, hi = 1e5, k = 0; k < 100; k++) { var mid = (lo + hi) / 2; if (span(mid) > 2 * Math.PI) lo = mid; else hi = mid; }
      var R = (lo + hi) / 2, da = 2 * Math.asin(a / 2 / R), dd = da + 2 * Math.asin(b / 2 / R);
      function A(j) { var h = Math.floor(j / 2); return h * dd + (j - 2 * h) * da; }
      function L(j) { return j - 2 * Math.floor(j / 2) ? b : a; }
      function md(j) { return ((j % N) + N) % N; }
      var c = { radius: R, count: N, jx: new Float64Array(N), jy: new Float64Array(N), onWheel: [], lift: 0 };
      c.seatAngle = function (j) { return Math.PI / 2 - A(j); };
      c.set = function (psi) {
        function th(j) { return Math.PI / 2 + psi - A(j); }
        function near(t) {
          var j0 = Math.round((Math.PI / 2 + psi - t) / (dd / 2)), best = j0, bv = 1e9;
          for (var j = j0 - 3; j <= j0 + 3; j++) { var v = Math.abs(th(j) - t); if (v < bv) { bv = v; best = j; } }
          return best;
        }
        var kk = near(0), m = near(Math.PI), j, i;
        for (i = 0; i < N; i++) c.onWheel[i] = false;
        for (j = m; j <= kk; j++) { c.jx[md(j)] = x0 + R * Math.cos(th(j)); c.jy[md(j)] = y0 + R * Math.sin(th(j)); if (j < kk) c.onWheel[md(j)] = true; }
        var xk = c.jx[md(kk)], yk = c.jy[md(kk)], xm = c.jx[md(m)], ym = c.jy[md(m)], Lf = 0;
        for (j = kk; j < m + N; j++) Lf += L(j);
        var r = (xk - xm) / 2, xc = (xk + xm) / 2, yb = (yk + ym + Math.PI * r - Lf) / 2, h1 = yk - yb, s = 0;
        for (j = kk + 1; j < m + N; j++) {
          s += L(j - 1); i = md(j);
          if (s <= h1) { c.jx[i] = xk; c.jy[i] = yk - s; }
          else if (s <= h1 + Math.PI * r) { var al = -(s - h1) / r; c.jx[i] = xc + r * Math.cos(al); c.jy[i] = yb + r * Math.sin(al); }
          else { c.jx[i] = xm; c.jy[i] = yb + s - h1 - Math.PI * r; }
        }
        c.lift = R * Math.cos(th(kk));
        return c;
      };
      return c;
    },

    /** Flat plate of any outline with a round-ended slot along any curved centre line (curved slotted arms and levers).
        Plate in local XY, thickness centred on z = 0. o: {outline: [[x, y], ...] closed loop, not repeating the first,
        either direction; smooth (true: the loop is drawn as a smooth curve through the points, default false);
        slot: [[x, y], ...] centre line of the slot, open, closely spaced; half (half the slot width); holes ([[x, y, r], ...]
        extra round holes, optional); thick (default 10); material}.
        Result has .slot = {points, cum (distance along the centre line at each point), length}, so a movement can find where
        a pin sits on the centre line. Keep the slot at least a few units inside the outline. */
    slottedPlate: function (o) {
      var ol = o.outline, sh = new THREE.Shape(), i;
      if (o.smooth) ol = new THREE.CatmullRomCurve3(ol.map(function (p) { return new THREE.Vector3(p[0], p[1], 0); }), true, "centripetal")
        .getPoints(ol.length * 12).slice(0, -1).map(function (v) { return [v.x, v.y]; });
      ol.forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); }); sh.closePath();
      var sp = o.slot, n = sp.length, h = o.half, cum = [0], L = [], R = [];
      for (i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(sp[i][0] - sp[i - 1][0], sp[i][1] - sp[i - 1][1]));
      for (i = 0; i < n; i++) {
        var a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
        L.push([sp[i][0] - ty / tl * h, sp[i][1] + tx / tl * h]); R.push([sp[i][0] + ty / tl * h, sp[i][1] - tx / tl * h]);
      }
      var hole = new THREE.Path(), e0 = Math.atan2(sp[1][1] - sp[0][1], sp[1][0] - sp[0][0]), e1 = Math.atan2(sp[n - 1][1] - sp[n - 2][1], sp[n - 1][0] - sp[n - 2][0]);
      hole.moveTo(R[0][0], R[0][1]);
      for (i = 1; i < n; i++) hole.lineTo(R[i][0], R[i][1]);
      hole.absarc(sp[n - 1][0], sp[n - 1][1], h, e1 - Math.PI / 2, e1 + Math.PI / 2, false);
      for (i = n - 2; i >= 0; i--) hole.lineTo(L[i][0], L[i][1]);
      hole.absarc(sp[0][0], sp[0][1], h, e0 + Math.PI / 2, e0 + 1.5 * Math.PI, false);
      sh.holes.push(hole);
      (o.holes || []).forEach(function (c) { var p = new THREE.Path(); p.absarc(c[0], c[1], c[2], 0, 2 * Math.PI, true); sh.holes.push(p); });
      var w = o.thick || 10, geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 16 }); geo.translate(0, 0, -w / 2);
      var m = mesh(geo, o.material); m.slot = { points: sp, cum: cum, length: cum[n - 1] };
      return m;
    },

    /** Saw-toothed crown wheel, as on a verge escapement: an upright band (a short tube) whose top edge is cut into saw
        teeth. Axis local Z; the band stands from z = 0 to z = base, the teeth from z = base to z = base + depth.
        o: {teeth, rIn, rOut, base, depth, material, markMaterial (optional, for tooth 0), flat (optional, default 0: width
        of a level land at each tip, measured at the middle of the band, so the teeth are blunt instead of sharp)}
        Tooth k climbs with increasing angle from its root at k * .pitch to its tip at (k + 1) * .pitch, where a steep
        face drops straight back to the root of the next tooth. So the steep faces lead when the wheel turns by
        increasing angle. Result has .pitch and .tipZ (base + depth). Put the band on a disc of your own. */
    sawCrown: function (o) {
      var N = o.teeth, a = o.rIn, b = o.rOut, z0 = o.base, d = o.depth, st = 2 * Math.PI / N, M = 8, g = new THREE.Group(), fl = (o.flat || 0) * 2 / (a + b) / st;
      function v(r, t, z) { return [r * Math.cos(t), r * Math.sin(t), z]; }
      function teeth(from, to) {
        var pos = [];
        function quad(p, q, r, s) { pos.push.apply(pos, p.concat(q, r, p, r, s)); }
        for (var i = from; i < to; i++) {
          for (var j = 0; j < (fl ? M + 1 : M); j++) {                         // the slope in M steps, then the level land if there is one
            var t0 = (i + Math.min(j, M) / M * (1 - fl)) * st, t1 = (i + (j < M ? (j + 1) / M * (1 - fl) : 1)) * st, h0 = z0 + d * Math.min(j, M) / M, h1 = z0 + d * Math.min(j + 1, M) / M;
            quad(v(a, t0, h0), v(b, t0, h0), v(b, t1, h1), v(a, t1, h1));   // sloping top
            quad(v(b, t0, 0), v(b, t1, 0), v(b, t1, h1), v(b, t0, h0));      // outer wall
            quad(v(a, t1, 0), v(a, t0, 0), v(a, t0, h0), v(a, t1, h1));      // inner wall
            quad(v(a, t1, 0), v(b, t1, 0), v(b, t0, 0), v(a, t0, 0));        // bottom
          }
          var tf = (i + 1) * st;
          quad(v(a, tf, z0 + d), v(a, tf, z0), v(b, tf, z0), v(b, tf, z0 + d));   // steep face at the tip
        }
        var gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); gg.computeVertexNormals();
        return gg;
      }
      if (o.markMaterial) { g.add(mesh(teeth(0, 1), o.markMaterial)); g.add(mesh(teeth(1, N), o.material)); }
      else g.add(mesh(teeth(0, N), o.material));
      g.pitch = st; g.tipZ = z0 + d;
      return g;
    },

    /** Not a mesh: a small flat (2D) solver for escapements and other parts that knock against each other. Every body
        turns about its own fixed pin; a torque and a drag act on it; where a corner of one body gets inside the outline
        of another, the two are pushed apart along the contact (shared by their inertias, no rub, no bounce).
        o: {bodies: [{pivot: [x, y], I (inertia; Infinity for a fixed body), polys: [[[x, y], ...], ...] (closed outlines
        drawn where they sit when the angle is 0; any winding, may be hollowed but not self-crossing), layers (optional,
        one number per outline: only outlines with the same number can touch, for parts that pass in front of each
        other; default all 0), a (start angle, default 0), min, max (optional stops on the angle), drag (default 0)}],
        pairs: [[i, j], ...] (which bodies can touch),
        links: [{i, j, gi, gj, c}] (optional one-sided ties: gi * a_i + gj * a_j + c is kept >= 0),
        iters (default 3)}
        Result: {bodies (each with a, w, tq (set the torque before every step), drag, min, max), step(h),
        touch (array, per pair, true if they touched in the last step), maxd (deepest overlap found so far; keep the
        time step small enough that this stays well under the thinnest part), setI(i, I) (change an inertia),
        outline(i, k) (polygon k of body i where it is now, as [[x, y], ...])}. */
    pivotSim: function (o) {
      function inside(x, y, p) {
        for (var i = 0, j = p.length - 1, c = false; i < p.length; j = i++)
          if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
        return c;
      }
      var B = o.bodies.map(function (b) {
        var polys = (b.polys || []).map(function (p, pk) {
          var n = p.length, s = 0, i, cx = 0, cy = 0, r = 0, q = p.map(function (v) { return [v[0] - b.pivot[0], v[1] - b.pivot[1]]; });
          for (i = 0; i < n; i++) { s += q[i][0] * q[(i + 1) % n][1] - q[(i + 1) % n][0] * q[i][1]; cx += q[i][0] / n; cy += q[i][1] / n; }
          if (s < 0) q.reverse();
          for (i = 0; i < n; i++) r = Math.max(r, Math.hypot(q[i][0] - cx, q[i][1] - cy));
          return { layer: b.layers ? b.layers[pk] : 0, loc: q, c: [cx, cy], r: r, w: q.map(function () { return [0, 0]; }), cw: [0, 0] };
        });
        return { pivot: b.pivot, I: b.I, iI: isFinite(b.I) ? 1 / b.I : 0, a: b.a || 0, w: 0, tq: 0, drag: b.drag || 0, min: b.min, max: b.max, polys: polys };
      });
      var pairs = o.pairs || [], links = o.links || [], iters = o.iters || 3;
      var sim = { bodies: B, touch: pairs.map(function () { return false; }), maxd: 0 };
      function place(b) {
        var c = Math.cos(b.a), s = Math.sin(b.a), px = b.pivot[0], py = b.pivot[1];
        b.polys.forEach(function (p) {
          for (var i = 0; i < p.loc.length; i++) { var v = p.loc[i]; p.w[i][0] = px + c * v[0] - s * v[1]; p.w[i][1] = py + s * v[0] + c * v[1]; }
          p.cw[0] = px + c * p.c[0] - s * p.c[1]; p.cw[1] = py + s * p.c[0] + c * p.c[1];
        });
      }
      function stopped(b, g) { return (g > 0 && b.max !== undefined && b.a >= b.max - 1e-9) || (g < 0 && b.min !== undefined && b.a <= b.min + 1e-9); }
      function push(V, Q, gV, gQ, d) {                // open the gap by d, sharing the move by the inertias; stop any closing speed
        var iV = stopped(V, gV) ? 0 : V.iI, iQ = stopped(Q, gQ) ? 0 : Q.iI;   // a body hard against its stop cannot give way
        var den = gV * gV * iV + gQ * gQ * iQ; if (den <= 1e-12) return;
        var lam = d / den; V.a += lam * gV * iV; Q.a += lam * gQ * iQ;
        var vn = gV * V.w + gQ * Q.w; if (vn < 0) { var mu = -vn / den; V.w += mu * gV * iV; Q.w += mu * gQ * iQ; }
      }
      function collide(V, Q) {                        // corners of V inside outlines of Q
        var hit = false;
        for (var a = 0; a < V.polys.length; a++) for (var b = 0; b < Q.polys.length; b++) {
          var pv = V.polys[a], pq = Q.polys[b], w = pq.w, n = w.length;
          if (pv.layer !== pq.layer || Math.hypot(pv.cw[0] - pq.cw[0], pv.cw[1] - pq.cw[1]) > pv.r + pq.r) continue;
          for (var k = 0; k < pv.w.length; k++) {
            var x = pv.w[k][0], y = pv.w[k][1];
            if (Math.hypot(x - pq.cw[0], y - pq.cw[1]) > pq.r || !inside(x, y, w)) continue;
            var best = 1e9, nx = 0, ny = 0;
            for (var i = 0; i < n; i++) {
              var p0 = w[i], p1 = w[(i + 1) % n], dx = p1[0] - p0[0], dy = p1[1] - p0[1], L2 = dx * dx + dy * dy;
              var t = Math.max(0, Math.min(1, ((x - p0[0]) * dx + (y - p0[1]) * dy) / L2)), d = Math.hypot(p0[0] + t * dx - x, p0[1] + t * dy - y);
              if (d < best) { best = d; var l = Math.sqrt(L2); nx = dy / l; ny = -dx / l; }
            }
            if (best > sim.maxd) sim.maxd = best;
            var gV = nx * -(y - V.pivot[1]) + ny * (x - V.pivot[0]), gQ = -(nx * -(y - Q.pivot[1]) + ny * (x - Q.pivot[0]));
            push(V, Q, gV, gQ, best); hit = true;
          }
        }
        return hit;
      }
      sim.step = function (h) {
        var i, it, b;
        for (i = 0; i < B.length; i++) { b = B[i]; if (!b.iI) continue; b.w += (b.tq - b.drag * b.w) * b.iI * h; b.a += b.w * h; }
        for (i = 0; i < pairs.length; i++) sim.touch[i] = false;
        for (it = 0; it < iters; it++) {
          for (i = 0; i < B.length; i++) place(B[i]);
          for (i = 0; i < pairs.length; i++) {
            var V = B[pairs[i][0]], Q = B[pairs[i][1]];
            if (collide(V, Q)) sim.touch[i] = true;
            if (collide(Q, V)) sim.touch[i] = true;
          }
          for (i = 0; i < links.length; i++) {
            var L = links[i], bi = B[L.i], bj = B[L.j], C = L.gi * bi.a + L.gj * bj.a + L.c;
            if (C < 0) push(bi, bj, L.gi, L.gj, -C);
          }
          for (i = 0; i < B.length; i++) {
            b = B[i];
            if (b.min !== undefined && b.a < b.min) { b.a = b.min; if (b.w < 0) b.w = 0; }
            if (b.max !== undefined && b.a > b.max) { b.a = b.max; if (b.w > 0) b.w = 0; }
          }
        }
      };
      sim.setI = function (i, I) { B[i].I = I; B[i].iI = isFinite(I) ? 1 / I : 0; };
      sim.outline = function (i, k) { place(B[i]); return B[i].polys[k].w.map(function (v) { return [v[0], v[1]]; }); };
      return sim;
    },

    /** Edge-on demonstration of a wheel for a chain, belt or band (Brown's 254 to 259): a wheel on a shaft in two posts, with its
        chain, belt or band running over it and down to a smaller wheel behind it. Builds everything into c.scene
        (the model lies in the plane of the belt, which is the world's ZY plane, so the opening front view sees the wheel edge-on).
        o: {kind: "chain" | "flanged" | "plain" | "round" | "vee" | "notched"}. Uses the parts "wheel" (large wheel), "driven"
        (small wheel) and "belt" (chain, belt or band; its "mark" variant is used for the few red marks), and c.fixed for the stand.
        Returns run with .step(dt, S): turns the large wheel at S.w and moves the belt at rim speed, the small wheel by the
        speed ratio, and writes the readouts with ids "w" (large wheel, rpm), "w2" (small wheel, rpm), "v" (belt, mm/s).
        Also .wheel1, .wheel2, .ratio. Camera hints: target [0, -80, 55]. */
    wheelRun: function (c, o) {
      var T = c.THREE, kind = o.kind, run = { ang: 0 }, i, k, W2 = 2 * Math.PI, chain = kind === "chain", flat = kind === "flanged" || kind === "plain";
      var pl = new T.Group(); pl.rotation.y = -Math.PI / 2; c.scene.add(pl);      // local x is world +z, local z is world -x
      var tube = kind === "round" ? 4.5 : 4, lift = kind === "notched" ? 1.2 : 0, vk = Math.hypot(13, 10) / 10, belt = 3;
      function prof(r) {
        var p, rb;
        if (kind === "flanged") { p = [[r + 7, -15], [r + 7, -10], [r + 7, -10], [r, -10], [r, -10], [r, 10], [r, 10], [r + 7, 10], [r + 7, 10], [r + 7, 15]]; rb = r + 1.8; }
        else if (kind === "plain") { p = []; for (i = -8; i <= 8; i++) { var z = i * 15 / 8; p.push([r - 3 * z * z / 225, z]); } rb = r + 1.8; }
        else if (kind === "round") {
          p = [[r, -15], [r, -11], [r, -11]];
          for (i = 1; i < 14; i++) { var t = Math.PI * i / 14; p.push([r - 11 * Math.sin(t), -11 * Math.cos(t)]); }
          p.push([r, 11], [r, 11], [r, 15]); rb = r - 11 + tube;
        } else if (chain) { p = [[r - 18, -15], [r - 18, 15]]; rb = r; }
        else { p = [[r, -15], [r, -10], [r, -10], [r - 13, 0], [r - 13, 0], [r, 10], [r, 10], [r, 15]]; rb = r - 13 + (tube + lift) * vk; }
        return { pts: p, rb: rb };
      }
      var R = [60, 40], pitch = 2 * Math.PI * 60 / 16;
      if (chain) R = [60, 37.5];
      var pr = [prof(R[0]), prof(R[1])], r1 = pr[0].rb, r2 = pr[1].rb;
      function len(d) { var al = Math.acos((r1 - r2) / d); return r1 * (W2 - 2 * al) + r2 * 2 * al + 2 * Math.sqrt(d * d - (r1 - r2) * (r1 - r2)); }
      var d = 260, K = 0;
      if (chain) {
        K = Math.round(len(d) / pitch); var lo = 200, hi = 330;
        for (i = 0; i < 40; i++) { d = (lo + hi) / 2; if (len(d) < K * pitch) lo = d; else hi = d; }
      }
      var C2 = [-d, 0], be = Math.atan2(C2[1], C2[0]), al = Math.acos((r1 - r2) / d), pa = be + al, qa = be - al;
      // wheels, each with a hub on both faces and a shaft that ends on the inner faces of two posts
      var info = [["wheel", 17, 8], ["driven", 11, 6]], wh = [];
      [0, 1].forEach(function (n) {
        var g = new T.Group(), key = info[n][0], rr = R[n], hr = info[n][1];
        g.add(P.lathePulley({ points: pr[n].pts, material: c.mat(key), mark: c.mat(key, "dark") }));
        [-1, 1].forEach(function (s) { P.at(P.cylZ(hr, 6.5, c.mat(key)), 0, 0, s * 18.25, g); });         // hubs z 15..21.5
        P.at(P.cylZ(info[n][2], 124, c.mat(key, "dark")), 0, 0, 0, g);                                    // shaft z -62..62, ends on the posts
        if (kind === "notched") {
          var rbx = P.box(15.5, 1.6, 1.2, c.mat(key, "dark"));
          for (i = 0; i < 36; i++) [-1, 1].forEach(function (s) {
            var h = new T.Group(); h.rotation.z = i * W2 / 36; g.add(h);
            var rib = new T.Mesh(rbx.geometry, rbx.material);
            rib.rotation.y = -s * Math.atan2(10, 13);                                                      // long side along the wall
            rib.position.set(rr - 6.5 + (10 / 16.4) * .6, 0, s * (5 - (13 / 16.4) * .6)); h.add(rib);      // on the wall, lifted .6 along its normal
          });
        }
        if (chain) {
          var Rr = rr - 18, N = n ? 10 : 16;
          for (i = 0; i < N; i++) {
            var h2 = new T.Group(); h2.rotation.z = i * W2 / N; g.add(h2);
            P.at(P.box(9, 5, 5, c.mat(key)), Rr + 3.5, 0, 0, h2);                                          // stem x Rr-1..Rr+8
            [-1, 1].forEach(function (s) {
              h2.add(P.rod(2.4, c.mat(key)).span(Rr + 8, 0, 0, Rr + 20, 0, s * 11));
              P.at(P.sphere(2.4, c.mat(key)), Rr + 20, 0, s * 11, h2);
            });
          }
        }
        wh.push(g); P.at(g, n ? C2[0] : 0, n ? C2[1] : 0, 0, pl);
      });
      run.wheel1 = wh[0]; run.wheel2 = wh[1]; run.ratio = r1 / r2;
      // stand: base under both wheels, a pair of posts at each shaft
      var bx0 = C2[0] - 24, bx1 = 24;
      P.at(P.box(bx1 - bx0, 10, 144, c.fixed), (bx0 + bx1) / 2, -95, 0, pl);                            // base y -100..-90, z -72..72
      [[0, 14], [C2[0], C2[1] + 14]].forEach(function (q) {
        [-1, 1].forEach(function (s) {
          var hgt = q[1] + 90;
          P.at(P.box(24, hgt, 10, c.fixed), q[0], -90 + hgt / 2, s * 67, pl);                            // post z 62..72, y -90 up to the shaft height + 14
        });
      });
      // belt, band or chain, and the marks that ride on it
      var path = run.path = P.belt({ width: kind === "plain" ? 22 : 18, thick: belt, material: c.mat("belt") });
      path.set(0, 0, r1, C2[0], C2[1], r2, false); pl.add(path); path.visible = flat;
      var L = path.length, marks = [];
      if (flat) for (i = 0; i < 3; i++) marks.push(path.place(P.at(P.box(10, belt + 1.2, (kind === "plain" ? 22 : 18) + 1.2, c.mat("belt", "mark")), 0, 0, 0, path), 0));
      else if (!chain) {
        var rope = P.ropePath({ tube: tube, material: c.mat("belt") }); pl.add(rope);
        rope.set([{ c: [0, 0, 0], r: r1, a0: pa, a1: pa + W2 - 2 * al }, { c: [C2[0], C2[1], 0], r: r2, a0: qa, a1: qa + 2 * al }, [r1 * Math.cos(pa), r1 * Math.sin(pa), 0]]);
        for (i = 0; i < 3; i++) marks.push(P.at(P.sphere(tube * 1.5, c.mat("belt", "mark")), 0, 0, 0, pl));
      }
      var links, bars = [], a0 = pa, S2 = r1 * (W2 - 2 * al) + Math.sqrt(d * d - (r1 - r2) * (r1 - r2)), psi0 = qa + (-r1 * a0 - S2) / r2;
      if (chain) {
        // every other link is a little wider (outer links, as on a real chain), so where two links overlap at a bend their sides
        // are not in one plane; the red link is a wide one, so with an odd count the two narrow links that meet are the same colour
        links = P.linkChain({ count: K, length: pitch, height: 6, thick: 3, altGeo: new T.BoxGeometry(pitch, 7, 3), material: c.mat("belt"), alt: c.mat("belt", "light"), mark: c.mat("belt", "mark"), markAt: 1 }); pl.add(links);
        for (i = 0; i < K; i++) bars.push(P.at(P.cylZ(2, 8, c.mat("belt", "dark")), 0, 0, 0, pl));
      }
      run.step = function (dt, S) {
        run.ang += S.w * dt;
        wh[0].rotation.z = run.ang; wh[1].rotation.z = (chain ? psi0 : 0) + run.ang * run.ratio;
        var s0 = run.ang * r1;
        if (chain) {
          var j, pts = [], s = r1 * (run.ang - a0);
          for (j = 0; j < K; j++) { var pt = path.pointAt(s + j * pitch); pts.push(pt); bars[j].position.set(pt.x, pt.y, 0); }
          for (j = 0; j < K; j++) {
            var A = pts[j], B = pts[(j + 1) % K], tx = B.x - A.x, ty = B.y - A.y, l = links.put(j, (A.x + B.x) / 2, (A.y + B.y) / 2, 0, tx, ty, 0, ty, -tx, 0);
            l.scale.x = Math.hypot(tx, ty) / pitch;
          }
        } else marks.forEach(function (m, n) {
          var s = s0 + n * L / 3;
          if (flat) path.place(m, s); else { var pt = path.pointAt(s); m.position.set(pt.x, pt.y, 0); }
        });
        var rpm = Math.abs(S.w) * 30 / Math.PI;
        S.set("w", Math.round(rpm * 10) / 10 + " rpm"); S.set("w2", Math.round(rpm * run.ratio * 10) / 10 + " rpm"); S.set("v", Math.round(Math.abs(S.w) * r1) + " mm/s");
      };
      return run;
    },

    /** Flat plate cut to any outline (escape wheels, pallets, levers, anything drawn as a flat shape): the same list of
        points that pivotSim takes, so the picture and the contact test use one shape. In the local XY plane, from
        z = z0 to z0 + depth. o: {points: [[x, y], ...], depth, z0 (default 0), material, windows (optional, for a wheel
        about the local origin: {count, rIn, rOut, spoke} cuts `count` openings between radius rIn and rOut, leaving
        straight spokes `spoke` wide), start (angle of the first spoke, default 0), holes (optional: [[[x, y], ...], ...],
        outlines of openings of any shape cut right through the plate)}. */
    outlinePlate: function (o) {
      var sh = new THREE.Shape(), w = o.windows, i;
      o.points.forEach(function (q, k) { if (k) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
      (o.holes || []).forEach(function (h) { var hp = new THREE.Path(); h.forEach(function (q, k) { if (k) hp.lineTo(q[0], q[1]); else hp.moveTo(q[0], q[1]); }); hp.closePath(); sh.holes.push(hp); });
      for (i = 0; w && i < w.count; i++) {
        var st = 2 * Math.PI / w.count, a = (o.start || 0) + i * st, d0 = Math.asin(w.spoke / 2 / w.rIn), d1 = Math.asin(w.spoke / 2 / w.rOut), hole = new THREE.Path();
        hole.absarc(0, 0, w.rOut, a + d1, a + st - d1, false); hole.absarc(0, 0, w.rIn, a + st - d0, a + d0, true); sh.holes.push(hole);
      }
      var g = new THREE.ExtrudeGeometry(sh, { depth: o.depth, bevelEnabled: false, curveSegments: 16 }); g.translate(0, 0, o.z0 || 0);
      return mesh(g, o.material);
    },

    /** Flat ruler or triangle cut to any outline, with optional round finger holes and rounded slots, as a mesh in the local XY
        plane from z0 to z0 + depth. o: {points: [[x, y], ...] (outline), holes: [[x, y, r], ...], slots: [{x0, x1, y, w}] (a slot
        along X from x0 to x1 centred on height y, w wide, round ends), z0 (default 0), depth, material} */
    rulerPlate: function (o) {
      var sh = new THREE.Shape(), i;
      o.points.forEach(function (q, k) { if (k) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
      (o.holes || []).forEach(function (h) { var p = new THREE.Path(); p.absarc(h[0], h[1], h[2], 0, 2 * Math.PI, true); sh.holes.push(p); });
      (o.slots || []).forEach(function (s) {
        var p = new THREE.Path(), r = s.w / 2;
        p.moveTo(s.x0, s.y - r); p.lineTo(s.x1, s.y - r); p.absarc(s.x1, s.y, r, -Math.PI / 2, Math.PI / 2, false);
        p.lineTo(s.x0, s.y + r); p.absarc(s.x0, s.y, r, Math.PI / 2, 1.5 * Math.PI, false); sh.holes.push(p);
      });
      var g = new THREE.ExtrudeGeometry(sh, { depth: o.depth, bevelEnabled: false, curveSegments: 16 }); g.translate(0, 0, o.z0 || 0);
      return mesh(g, o.material);
    },

    /** Pencil lines drawn along a ruler: up to n flat ribbons lying in the XY plane, each horizontal. Call .setLine(k, x0, x1, y, z, width)
        to set line k (every frame is fine) and .hide(k) to remove it. Redrawn by code, so the mesh is marked live. */
    ruledLines: function (n, material) {
      var pos = new Float32Array(n * 12), nor = new Float32Array(n * 12), idx = [], k;
      for (k = 0; k < n; k++) { for (var v = 0; v < 4; v++) nor[k * 12 + v * 3 + 2] = 1; idx.push(k * 4, k * 4 + 1, k * 4 + 2, k * 4, k * 4 + 2, k * 4 + 3); }
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setIndex(idx);
      var m = mesh(g, material); m.frustumCulled = false; m.userData.live = true;
      m.setLine = function (k, x0, x1, y, z, w) {
        var a = [x0, y - w / 2, x1, y - w / 2, x1, y + w / 2, x0, y + w / 2];
        for (var v = 0; v < 4; v++) { pos[k * 12 + v * 3] = a[v * 2]; pos[k * 12 + v * 3 + 1] = a[v * 2 + 1]; pos[k * 12 + v * 3 + 2] = z; }
        g.attributes.position.needsUpdate = true;
      };
      m.hide = function (k) { for (var i = 0; i < 12; i++) pos[k * 12 + i] = 0; g.attributes.position.needsUpdate = true; };
      return m;
    },

    /** Pencil standing on the paper with its tip at the group's origin and its body leaning away from a ruler along +Z.
        Call .place(x, y, z, out) with out = +1 if the ruler lies on the -Y side of the pencil, -1 if on the +Y side.
        o: {material (body), tip (material of the sharpened end)} */
    pencil: function (o) {
      var g = new THREE.Group(), tilt = new THREE.Group();
      var cone = new THREE.Mesh(new THREE.ConeGeometry(2.4, 9, 14), o.tip); cone.rotation.x = -Math.PI / 2; cone.position.z = 4.5; tilt.add(cone);
      var body = P.cylZ(2.4, 34, o.material); body.position.z = 26; tilt.add(body);
      g.add(tilt);
      g.place = function (x, y, z, out) { g.position.set(x, y, z); tilt.rotation.x = -out * 0.3; };
      return g;
    },

    /** Timetable for a ruler that steps across the paper and draws a line at each of n stops. u runs 0 to 1 and repeats.
        Returns {pos (stop number, fractional while moving, eased), k (line being drawn, or -1), frac (how much of line k is drawn),
        lines (lines started so far), pen (where the pencil is along the ruler, 0 to 1), air (how far the pencil is lifted, 0 to 1)}.
        Each stop draws for 1 unit, each move takes 0.6, then the ruler goes back (1.2) and waits (0.4). */
    ruleCycle: function (u, n) {
      var dr = 1, mv = .6, ret = 1.2, rest = .4, T = n * dr + (n - 1) * mv + ret + rest, t = (u - Math.floor(u)) * T, i, m;
      function sm(x) { return .5 - .5 * Math.cos(Math.PI * Math.min(1, x)); }
      function air(m) { return Math.min(1, 5 * Math.min(m, 1 - m)); }
      for (i = 0; i < n; i++) {
        if (t < dr) return { pos: i, k: i, frac: t / dr, lines: i + 1, pen: t / dr, air: 0 };
        t -= dr;
        if (i < n - 1) { if (t < mv) { m = t / mv; return { pos: i + sm(m), k: -1, frac: 1, lines: i + 1, pen: 1 - sm(m), air: air(m) }; } t -= mv; }
      }
      if (t < ret) { m = t / ret; return { pos: (n - 1) * (1 - sm(m)), k: -1, frac: 1, lines: n, pen: 1 - sm(m * 2.5), air: air(m) }; }
      return { pos: 0, k: -1, frac: 1, lines: n, pen: 0, air: 0 };
    },

    /** Draws one frame of a ruling demonstration: the finished lines, the line being drawn and the pencil.
        o: {n, cyc (from ruleCycle), edge (function(pos) giving {x0, x1, y}, the ruling edge of the ruler when it is at stop pos),
        lines (from ruledLines), pen (from pencil), out (+1 if the ruler is below the pencil, -1 if above), z (paper height, default 0.6)} */
    ruleDraw: function (o) {
      var c = o.cyc, out = o.out, z = o.z === undefined ? .6 : o.z, j, e, x1;
      for (j = 0; j < o.n; j++) {
        if (j < c.k || (c.k < 0 && j < c.lines) || j === c.k) { e = o.edge(j); x1 = j === c.k ? e.x0 + (e.x1 - e.x0) * c.frac : e.x1; o.lines.setLine(j, e.x0, x1, e.y + out, z, 1.6); }
        else o.lines.hide(j);
      }
      e = o.edge(c.pos);
      o.pen.place(e.x0 + (e.x1 - e.x0) * c.pen, e.y + out, z + .3 + 9 * c.air, out);
    },

    /** Not a mesh: where two circles in the XY plane meet, for solving linkages exactly (a link of length rb from
        point B and a link of length ra from point A share a pin). Returns [x, y]. side 1 takes the meeting point to
        the left of the line from A to B, side -1 the one to the right. If the circles do not meet it returns the
        nearest point on the line between them. */
    meet: function (ax, ay, ra, bx, by, rb, side) {
      var dx = bx - ax, dy = by - ay, d = Math.sqrt(dx * dx + dy * dy) || 1e-9, a = (ra * ra - rb * rb + d * d) / (2 * d);
      var h = Math.sqrt(Math.max(0, ra * ra - a * a)), ux = dx / d, uy = dy / d, s = side < 0 ? -1 : 1;
      return [ax + a * ux - s * h * uy, ay + a * uy + s * h * ux];
    },

    /** Live trace line: the path a moving point has drawn, as a THREE.Line (add it to the scene). It keeps the last
        `max` points (default 400) and skips steps shorter than `step` (default 0.4). o: {color (CSS or hex), opacity
        (default 1), max, step}. Call .push(x, y, z) every frame with the point's position and .clear() when the motion
        is changed so the old path no longer applies. */
    trail: function (o) {
      o = o || {};
      var max = o.max || 400, st = o.step || .4, buf = new Float32Array(max * 3), n = 0, g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(buf, 3)); g.setDrawRange(0, 0);
      var line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: o.color || 0xC2503F, transparent: o.opacity !== undefined, opacity: o.opacity === undefined ? 1 : o.opacity }));
      line.frustumCulled = false; line.userData.live = true;
      line.push = function (x, y, z) {
        if (n) { var k = (n - 1) * 3, dx = x - buf[k], dy = y - buf[k + 1], dz = z - buf[k + 2]; if (dx * dx + dy * dy + dz * dz < st * st) return; }
        if (n === max) { buf.copyWithin(0, 3); n--; }
        buf[n * 3] = x; buf[n * 3 + 1] = y; buf[n * 3 + 2] = z; n++;
        g.attributes.position.needsUpdate = true; g.setDrawRange(0, n);
      };
      line.clear = function () { n = 0; g.setDrawRange(0, 0); };
      return line;
    },

    /** Steam cylinder seen whole: a closed tube standing on axis local Y, with a cover on top that has a round hole
        (the gland) for the piston rod. Top face at y = 0, bottom face at y = -length. Use c.fixed so the piston shows.
        o: {radius (outside), length, wall (default 3), hole (gland hole radius; a little more than the rod), material}
        Inside: the bore is radius - wall wide, from y = -length + wall up to y = -wall. */
    steamCylinder: function (o) {
      var R = o.radius, w = o.wall || 3, L = o.length, h = o.hole, V = function (x, y) { return new THREE.Vector2(x, y); };
      var line = [V(h, 0), V(h, -w), V(R - w, -w), V(R - w, -L + w), V(0, -L + w), V(0, -L), V(R, -L), V(R, 0), V(h, 0)];
      return mesh(new THREE.LatheGeometry(line, 48), o.material);
    },

    /** Not a mesh: outline of a thick line drawn through a list of points (a bent bar, a curved arm), as a closed list
        of [x, y] points for outlinePlate or pivotSim. pts: [[x, y], ...] along the middle of the bar; w: its width.
        Ends are cut square and bends are mitred, so keep bends gentle (under about 100 degrees). */
    strokeOutline: function (pts, w) {
      var n = pts.length, L = [], Rr = [], i;
      for (i = 0; i < n; i++) {
        var a = pts[Math.max(i - 1, 0)], b = pts[i], d = pts[Math.min(i + 1, n - 1)];
        var l1 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, l2 = Math.hypot(d[0] - b[0], d[1] - b[1]) || 1;
        var ux = i ? (b[0] - a[0]) / l1 : (d[0] - b[0]) / l2, uy = i ? (b[1] - a[1]) / l1 : (d[1] - b[1]) / l2;
        var vx = i < n - 1 ? (d[0] - b[0]) / l2 : ux, vy = i < n - 1 ? (d[1] - b[1]) / l2 : uy;
        var mx = -(uy + vy), my = ux + vx, ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
        var k = w / 2 / Math.max(.5, mx * -uy + my * ux);
        L.push([b[0] + mx * k, b[1] + my * k]); Rr.push([b[0] - mx * k, b[1] - my * k]);
      }
      return L.concat(Rr.reverse());
    },

    /** Not a mesh: the moving parts of a gravity escapement, set up on pivotSim. Body 0 is the escape wheel (about the
        origin), 1 the left pallet, 2 the right pallet, 3 the pendulum. The wheel can touch both pallets and each pallet
        can touch the pendulum; give the outlines `layers` to say which ones meet. A pallet rests at angle 0 against a
        stop and its own weight turns it back there: the left one is lifted clockwise, the right one anticlockwise.
        o: {wheel: {polys, layers, I, drag}, pallets: [left, right], each {pivot, polys, layers, I, drag, weight (its
        turning force), lift (the angle the wheel holds it at, used for the start)}, pend: {pivot, polys, layers, I,
        drag, pull (turning force back to the middle, per radian)}, step (angle the wheel turns each beat, negative for
        clockwise), start (first swing of the pendulum, radians; it starts on the left with the wheel at angle 0, which
        must be where it is locked on the right pallet), iters}
        Result: the pivotSim, plus run(h, drive) (one time step with that turning force on the wheel), t, amp (last
        swing), beats (times of the last few passes through the middle), nbeats, steps (wheel steps so far) and jump
        (seconds the wheel took over its last step). */
    gravitySim: function (o) {
      var W = o.wheel, A = o.pallets[0], B = o.pallets[1], D = o.pend, st = o.start || .1, dir = o.step < 0 ? -1 : 1;
      var s = P.pivotSim({ bodies: [
        { pivot: [0, 0], I: W.I, polys: W.polys, layers: W.layers, drag: W.drag },
        { pivot: A.pivot, I: A.I, polys: A.polys, layers: A.layers, drag: A.drag, max: 0, a: -1.15 * st },
        { pivot: B.pivot, I: B.I, polys: B.polys, layers: B.layers, drag: B.drag, min: 0, a: B.lift || 0 },
        { pivot: D.pivot, I: D.I, polys: D.polys, layers: D.layers, drag: D.drag, a: -st }],
        pairs: [[0, 1], [0, 2], [1, 3], [2, 3]], iters: o.iters });
      s.t = 0; s.amp = st; s.beats = []; s.nbeats = 0; s.steps = 0; s.jump = 0; s.lock = 0; s.t0 = -1;
      s.run = function (h, drive) {
        var b = s.bodies, a0 = b[3].a, w0 = b[3].w;
        b[0].tq = dir * drive; b[1].tq = A.weight; b[2].tq = -B.weight; b[3].tq = -D.pull * Math.sin(b[3].a);
        s.step(h); s.t += h;
        var d = (b[0].a - s.lock) / o.step;                                  // how far the wheel is through its step, 0 to 1
        if (d > .05 && s.t0 < 0) s.t0 = s.t;
        if (d > .95) { s.jump = s.t - s.t0; s.t0 = -1; s.lock += o.step; s.steps++; }
        if (w0 * b[3].w < 0) s.amp = Math.abs(b[3].a);
        if (a0 * b[3].a < 0) { s.nbeats++; s.beats.push(s.t); if (s.beats.length > 6) s.beats.shift(); }
      };
      return s;
    },

    /** Water, smoke or any spray drawn as n small spheres in one draw call. o: {radius (default 2.5), color (CSS colour, such as c.spot),
        opacity (default .85)}. Call .put(i, x, y, z, scale) for each drop every frame (scale 0 hides it), then .flush(). */
    waterDots: function (n, o) {
      o = o || {};
      var im = new THREE.InstancedMesh(new THREE.SphereGeometry(o.radius || 2.5, 8, 6),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(o.color || "#4aa3df"), transparent: true, opacity: o.opacity || .85, depthWrite: false }), n);
      var m = new THREE.Matrix4();
      im.frustumCulled = false; im.userData.live = true; im.userData.fluid = true;   // fluid: shows faintly through a closed casing
      im.put = function (i, x, y, z, s) { m.makeScale(s, s, s); m.setPosition(x, y, z); im.setMatrixAt(i, m); };
      im.flush = function () { im.instanceMatrix.needsUpdate = true; };
      for (var i = 0; i < n; i++) im.put(i, 0, 0, 0, 0);
      im.flush();
      return im;
    },

    /** Flat ring (annulus) in the XY plane, from z = z0 to z0 + depth. o: {rIn, rOut, depth, z0 (default 0), material, from, to (optional
        angles in radians: only that part of the ring, anticlockwise from +X)}. */
    annulus: function (o) {
      var sh = new THREE.Shape(), a0 = o.from === undefined ? 0 : o.from, a1 = o.to === undefined ? 2 * Math.PI : o.to, full = a1 - a0 >= 2 * Math.PI - 1e-6;
      if (full) { sh.absarc(0, 0, o.rOut, 0, 2 * Math.PI, false); var h = new THREE.Path(); h.absarc(0, 0, o.rIn, 0, 2 * Math.PI, true); sh.holes.push(h); }
      else { sh.absarc(0, 0, o.rOut, a0, a1, false); sh.absarc(0, 0, o.rIn, a1, a0, true); }
      var g = new THREE.ExtrudeGeometry(sh, { depth: o.depth, bevelEnabled: false, curveSegments: 48 }); g.translate(0, 0, o.z0 || 0);
      return mesh(g, o.material);
    },

    /** Thin curved blade (guide vane, turbine bucket) drawn along a path in the XY plane, from z = z0 to z0 + depth.
        o: {path: [[x, y], ...] (centre line, at least 3 points), thickness, depth, z0 (default 0), material}. */
    curvedVane: function (o) {
      var L = [], R = [], p = o.path, n = p.length, t = o.thickness / 2, i;
      for (i = 0; i < n; i++) {
        var a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
        L.push([p[i][0] - dy / d * t, p[i][1] + dx / d * t]); R.push([p[i][0] + dy / d * t, p[i][1] - dx / d * t]);
      }
      return P.outlinePlate({ points: L.concat(R.reverse()), depth: o.depth, z0: o.z0, material: o.material });
    },

    /** Solid with any flat outline: pts is a list of [x, y] going round once (any direction); it is extruded along Z from z0 to z1.
        For beds, banks, channels and pools whose side view is not a rectangle. */
    prism: function (pts, z0, z1, m) {
      var s = new THREE.Shape(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }));
      var g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return mesh(g, m);
    },
    /** Pool of small water drops (round, see-through, cheap) for jets, spills and surface flow. o = {count, radius, color, opacity, parent}.
        Returns {drops, emit(x, y, z, vx, vy, vz, g), step(dt, g, dead)}. emit starts a drop (false if all are in use); g is that drop's own
        gravity, or omit for the pool's gravity (0 gives a drop that drifts straight). step moves every drop; dead(position, drop) returns true
        to remove it (it landed, or entered a bucket). */
    dropPool: function (o) {
      var geo = new THREE.SphereGeometry(o.radius || 2, 8, 6), mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(o.color || "#3F8FAE"), transparent: true, opacity: o.opacity || .8, depthWrite: false });
      var pool = { drops: [] }, i, k;
      for (i = 0; i < o.count; i++) { k = mesh(geo, mat); k.visible = false; k.userData.live = true; (o.parent).add(k); pool.drops.push({ m: k, alive: false, vx: 0, vy: 0, vz: 0, g: null }); }
      pool.emit = function (x, y, z, vx, vy, vz, g) {
        for (var j = 0; j < pool.drops.length; j++) { var d = pool.drops[j]; if (!d.alive) { d.alive = true; d.m.visible = true; d.m.position.set(x, y, z); d.vx = vx; d.vy = vy; d.vz = vz; d.g = g === undefined ? null : g; return true; } }
        return false;
      };
      pool.step = function (dt, g, dead) {
        pool.drops.forEach(function (d) {
          if (!d.alive) return;
          d.vy -= (d.g === null ? g : d.g) * dt; d.m.position.x += d.vx * dt; d.m.position.y += d.vy * dt; d.m.position.z += d.vz * dt;
          if (dead(d.m.position, d)) { d.alive = false; d.m.visible = false; }
        });
      };
      return pool;
    },
    /** Water wheel with buckets (overshot and breast wheels). Axis local Z, centred on the origin. o = {radius, inner, width, buckets, spokes,
        frame, bucket, mark}: radius is the outer rim, inner the floor of the buckets, width the sideways width (all in model units); frame, bucket
        and mark are materials. Two narrow side rings (shrouds) at each side, a bucket floor, a hub, spokes and, between the shrouds, one radial board and one slanted
        board per bucket, so each bucket opens outward and leans forward. A red patch on the front ring (mark) marks one bucket.
        Turn it with rotation.z. Fields: step (angle between buckets), centreAngle and centreRadius (where the middle of a bucket's water is, from the
        angle of its radial board), hub (the hub mesh), boards (group of boards, for fading). */
    bucketWheel: function (o) {
      var R = o.radius, r0 = o.inner, W = o.width, N = o.buckets, step = 2 * Math.PI / N, g = new THREE.Group(), i, t = 3;
      function ring(a, b, depth, m) {
        var s = new THREE.Shape(); s.absarc(0, 0, b, 0, 2 * Math.PI, false);
        var h = new THREE.Path(); h.absarc(0, 0, a, 0, 2 * Math.PI, true); s.holes.push(h);
        var ge = new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 48 }); ge.translate(0, 0, -depth / 2); return mesh(ge, m);
      }
      [r0 - 4, R - 6].forEach(function (ra) { var rb = ra < r0 ? r0 + 2 : R + 1; P.at(ring(ra, rb, t, o.frame), 0, 0, W / 2 - t / 2, g); P.at(ring(ra, rb, t, o.frame), 0, 0, -W / 2 + t / 2, g); });   // narrow side rings; z faces at +-W/2 and +-(W/2-3)
      g.add(ring(r0 - 2, r0, W - 2 * t, o.frame));                                                                                           // bucket floor, between the rings
      g.hub = P.at(P.cylZ(12, W - 8, o.frame), 0, 0, 0, g);
      for (i = 0; i < o.spokes; i++) for (var s = -1; s <= 1; s += 2) {
        var a = i * 2 * Math.PI / o.spokes, sp = P.rod(2.2, o.frame);
        sp.span(12 * Math.cos(a), 12 * Math.sin(a), s * (W / 2 - 8), (r0 - 1) * Math.cos(a), (r0 - 1) * Math.sin(a), s * (W / 2 - 8)); g.add(sp);
      }
      g.boards = new THREE.Group(); g.add(g.boards);
      for (i = 0; i < N; i++) {
        var th = i * step, rb = P.box(R - r0, 2, W - 2 * t, o.bucket); rb.position.set((r0 + R) / 2 * Math.cos(th), (r0 + R) / 2 * Math.sin(th), 0); rb.rotation.z = th; g.boards.add(rb);
        var x0 = r0 * Math.cos(th), y0 = r0 * Math.sin(th), x1 = R * Math.cos(th + .6 * step), y1 = R * Math.sin(th + .6 * step);
        var sb = P.box(Math.hypot(x1 - x0, y1 - y0), 2, W - 2 * t, o.bucket); sb.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); sb.rotation.z = Math.atan2(y1 - y0, x1 - x0); g.boards.add(sb);
      }
      P.at(P.box(5, 9, 1.5, o.mark), (R - 2.5) * Math.cos(.8 * step), (R - 2.5) * Math.sin(.8 * step), W / 2 + .75, g).rotation.z = .8 * step;   // z from W/2 to W/2+1.5
      g.step = step; g.centreAngle = .8 * step; g.centreRadius = (r0 + R) / 2; return g;
    },
    /** Pencil line on paper that grows as the pencil moves: a flat ribbon `width` wide lying in the plane z = const
        (the z of each pushed point), with its face up. Use it for curves drawn by an instrument (arcs, conics) where a
        THREE.Line would be too thin. o: {material, width (default 1.6), max (points kept, default 800; later points are
        ignored), step (smallest move that adds a point, default 1)}. Call .push(x, y, z) every frame with the pencil tip
        and .clear() to start a fresh line. Marked live. */
    inkTrail: function (o) {
      var max = o.max || 800, w = (o.width || 1.6) / 2, st = o.step || 1, pos = new Float32Array(max * 6), nor = new Float32Array(max * 6), idx = [], n = 0, lx = 0, ly = 0, k;
      for (k = 0; k < max * 2; k++) nor[k * 3 + 2] = 1;
      for (k = 0; k < max - 1; k++) idx.push(2 * k, 2 * k + 2, 2 * k + 1, 2 * k + 1, 2 * k + 2, 2 * k + 3);
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setIndex(idx); g.setDrawRange(0, 0);
      var m = mesh(g, o.material); m.frustumCulled = false; m.userData.live = true;
      function put(i, x, y, z, nx, ny) { pos.set([x - nx * w, y - ny * w, z, x + nx * w, y + ny * w, z], i * 6); }
      m.push = function (x, y, z) {
        if (n === max) return;
        if (n) {
          var dx = x - lx, dy = y - ly, d = Math.sqrt(dx * dx + dy * dy); if (d < st) return;
          var nx = -dy / d, ny = dx / d;
          if (n === 1) put(0, pos[0] / 2 + pos[3] / 2, pos[1] / 2 + pos[4] / 2, z, nx, ny);
          put(n, x, y, z, nx, ny);
        } else put(0, x, y, z, 0, 0);
        lx = x; ly = y; n++;
        g.attributes.position.needsUpdate = true; g.setDrawRange(0, Math.max(0, n - 1) * 6);
      };
      m.clear = function () { n = 0; g.setDrawRange(0, 0); };
      m.count = function () { return n; };
      return m;
    },

    /** Live ribbon between two curves in the local XY plane: steam or water filling a chamber whose walls move, or a
        rubber band that changes shape. o: {n (most segments, default 96), depth (default 0: a flat sheet at z = 0;
        otherwise a solid band from z = -depth/2 to depth/2), material (double-sided, as c.mat gives)}.
        Call .set(f, t0, t1, n) every frame: f(t) returns [x0, y0, x1, y1], a point on each curve, and the ribbon runs
        from t0 to t1 in n steps (default o.n). Nothing is drawn when t1 <= t0. */
    ribbon: function (o) {
      var N = o.n || 96, d = o.depth || 0, per = d ? 24 : 6, pos = new Float32Array((N * per + (d ? 12 : 0)) * 3), g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setDrawRange(0, 0);
      var m = mesh(g, o.material), k; m.frustumCulled = false; m.userData.live = true;
      function quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) {   // a-b-c-d round the quad
        pos[k++] = ax; pos[k++] = ay; pos[k++] = az; pos[k++] = bx; pos[k++] = by; pos[k++] = bz; pos[k++] = cx; pos[k++] = cy; pos[k++] = cz;
        pos[k++] = ax; pos[k++] = ay; pos[k++] = az; pos[k++] = cx; pos[k++] = cy; pos[k++] = cz; pos[k++] = dx; pos[k++] = dy; pos[k++] = dz;
      }
      m.set = function (f, t0, t1, n) {
        n = Math.min(n || N, N); k = 0;
        if (!(t1 > t0)) { g.setDrawRange(0, 0); return; }
        var h = d / 2, a = f(t0), b, i;
        if (d) quad(a[0], a[1], -h, a[2], a[3], -h, a[2], a[3], h, a[0], a[1], h);
        for (i = 1; i <= n; i++) {
          b = f(t0 + (t1 - t0) * i / n);
          quad(a[0], a[1], h, b[0], b[1], h, b[2], b[3], h, a[2], a[3], h);
          if (d) {
            quad(a[0], a[1], -h, a[2], a[3], -h, b[2], b[3], -h, b[0], b[1], -h);
            quad(a[0], a[1], -h, b[0], b[1], -h, b[0], b[1], h, a[0], a[1], h);
            quad(a[2], a[3], h, b[2], b[3], h, b[2], b[3], -h, a[2], a[3], -h);
          }
          a = b;
        }
        if (d) quad(a[0], a[1], h, a[2], a[3], h, a[2], a[3], -h, a[0], a[1], -h);
        g.attributes.position.needsUpdate = true; g.setDrawRange(0, k / 3); g.computeVertexNormals();
      };
      return m;
    },

    /** Steam, air or water drawn as a few hundred small balls that really move: they pour in along the inlet pipe, fill
        the working room, are carried round by the piston, thin out as the room grows and leave by the exhaust pipe.
        One InstancedMesh; nothing is allocated while it runs. Add the result to the scene.
        o: {color (CSS, usually c.spot), count (default 320), size (ball radius, default 2.7), z0, z1 (the balls are
        spread between these depths, default -12..12), opacity (default .85), light (default false: fresh steam is dark
        and used steam pale, for a pale background; true: fresh steam is bright blue-white and used steam dim, for a
        dark background), even (default false; true: every ball keeps the full colour, for water, which does not thin out)}
        .domain({f, density, pad, wobble, drain}) adds a region the rooms are cut from, a ribbon between two curves:
          f(t, out) writes [x0, y0, x1, y1] into out, a point on each curve at parameter t (as P.ribbon, but without
          making a new array). Balls only ever lie between the two curves, and shrink where the gap is narrow.
          density: balls per unit of area in a room of fresh steam (default .02). pad: how far, in t, to keep clear
          of each barrier (half the thickness of a vane, default 0). wobble: size of the jitter in t (default 1% of
          the span). drain: how far, in t, used steam moves toward its port per radian of `turn` (default 30% of span).
          Every frame call .set(bars, kinds, ports, n): bars[0..n] are the t values of the barriers in rising order
          (walls, vanes, the place a piston touches), kinds[0..n-1] say what is between each pair (0 nothing, 1 fresh
          steam, 2 steam shut in, 3 used steam) and ports[0..n-1] the t of the inlet (kind 1) or outlet (kind 3) of
          that room. Reuse the same arrays. A room of fresh steam is kept evenly full: its balls ride with the barrier
          far from the inlet and new ones appear at the inlet end. Balls shut in keep their share of the room on each
          side, so they spread as the room grows and turn paler; used steam drifts to its outlet and goes.
        .pipe({points: [[x, y], ...] from the outside end to the port, width, n (balls, default 14), out (default
          false), speed (pipe lengths per radian of `turn`, default .3)}) adds a stream along a pipe. Set .out = true
          to make it an exhaust (it runs from the port outward and fades) and .on = false to stop it.
        .update(turn) once per frame after the .set calls: turn is how far the shaft turned this frame in radians
          (Math.abs(S.w) * dt), so the steam stands still when the engine is paused. */
    steamFlow: function (o) {
      var N = o.count || 320, base = o.size || 2.7, z0 = o.z0 === undefined ? -12 : o.z0, z1 = o.z1 === undefined ? 12 : o.z1;
      var m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: o.opacity || .85 }), N);
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
      m.frustumCulled = false; m.userData.live = true; m.userData.fluid = true;
      var M = m.instanceMatrix.array, C = m.instanceColor.array, dense = new THREE.Color(o.color || "#3F8FAE"), thin = dense.clone().lerp(new THREE.Color(0xffffff), .62);
      if (o.light) { thin = dense.clone(); dense.lerp(new THREE.Color(0xffffff), .85); }
      if (o.even) thin = dense.clone();
      var dom = new Int8Array(N), iv = new Int8Array(N), pt = new Float64Array(N), pv = new Float32Array(N), ph = new Float32Array(N), sz = new Float32Array(N), zz = new Float32Array(N), tint = new Float32Array(N);
      var doms = [], pipes = [], used = 0, T = 0, out = [0, 0, 0, 0], cur = 0, K = 16, i;
      for (i = 0; i < N; i++) { dom[i] = -1; ph[i] = Math.random() * 6.283; sz[i] = .65 + .7 * Math.random(); zz[i] = z0 + (z1 - z0) * Math.random(); pv[i] = .14 + .72 * Math.random(); tint[i] = .3 * Math.random(); M[i * 16 + 15] = 1; }
      function put(k, x, y, r, b) {                          // ball k at (x, y) with radius r and strength b (1 dense .. 0 thin)
        var q = k * 16; M[q] = M[q + 5] = M[q + 10] = r; M[q + 12] = x; M[q + 13] = y; M[q + 14] = zz[k];
        b *= 1 - tint[k]; q = k * 3; C[q] = thin.r + (dense.r - thin.r) * b; C[q + 1] = thin.g + (dense.g - thin.g) * b; C[q + 2] = thin.b + (dense.b - thin.b) * b;
      }
      function free() { for (var n = 0; n < N; n++) { cur = cur + 1 < N ? cur + 1 : used; if (dom[cur] === -1) return cur; } return -1; }
      m.domain = function (q) {
        var d = { f: q.f, density: q.density || .02, pad: q.pad || 0, wob: q.wobble, drain: q.drain, n: 0, same: false, b: new Float64Array(10), pb: new Float64Array(10), k: new Int8Array(9), port: new Float64Array(9), area: new Float64Array(9), cnt: new Int16Array(9), cum: new Float64Array(9 * (K + 1)), pcum: new Float64Array(9 * (K + 1)) };
        d.set = function (bars, kinds, ports, n) {
          var j, span = bars[n] - bars[0];
          d.same = n === d.n;
          for (j = 0; j <= n; j++) { if (Math.abs(bars[j] - d.b[j]) > .2 * span) d.same = false; d.pb[j] = d.b[j]; d.b[j] = bars[j]; }
          for (j = 0; j < n; j++) { d.k[j] = kinds[j]; d.port[j] = ports[j]; }
          d.n = n;
        };
        doms.push(d); return d;
      };
      m.pipe = function (q) {
        var p = { pts: q.points, w: q.width || 10, n: q.n || 14, out: !!q.out, on: true, speed: q.speed || .3, first: used, cum: [0], len: 0 }, j;
        for (j = 1; j < p.pts.length; j++) { p.len += Math.hypot(p.pts[j][0] - p.pts[j - 1][0], p.pts[j][1] - p.pts[j - 1][1]); p.cum.push(p.len); }
        for (j = 0; j < p.n; j++) dom[used + j] = -2;
        used += p.n; cur = used; pipes.push(p); return p;
      };
      function find(b, n, x) { var j = 0; while (j < n - 1 && x >= b[j + 1]) j++; return j; }
      function along(tab, j, b, x) {                         // area of room j from its first barrier up to x
        var L = b[j + 1] - b[j], u = L > 1e-9 ? Math.max(0, Math.min(K, (x - b[j]) / L * K)) : 0, k = Math.min(K - 1, Math.floor(u)), q = j * (K + 1) + k;
        return tab[q] + (tab[q + 1] - tab[q]) * (u - k);
      }
      function where(tab, j, b, A) {                         // the x at which that area is reached
        var q = j * (K + 1), k = 0; while (k < K - 1 && tab[q + k + 1] < A) k++;
        var s0 = tab[q + k], s1 = tab[q + k + 1];
        return b[j] + (b[j + 1] - b[j]) * (k + (s1 - s0 > 1e-9 ? Math.max(0, Math.min(1, (A - s0) / (s1 - s0))) : .5)) / K;
      }
      m.update = function (turn) {
        var a, j, k, d, x, kind, L, g, e, q;
        T += turn > 0 ? turn : 0;
        for (a = 0; a < doms.length; a++) {                  // size of every room: running area along it in K slices
          d = doms[a]; g = d.cum; d.cum = d.pcum; d.pcum = g;
          for (j = 0; j < d.n; j++) {
            d.cnt[j] = 0; L = d.b[j + 1] - d.b[j]; g = 0; q = j * (K + 1); d.cum[q] = 0;
            var lx = 0, ly = 0, lw = 0;
            for (k = 0; k <= K; k++) {
              if (d.k[j] && L > 0) {
                d.f(d.b[j] + L * k / K, out);
                var mx = (out[0] + out[2]) / 2, my = (out[1] + out[3]) / 2, wd = Math.hypot(out[2] - out[0], out[3] - out[1]);
                if (k) g += Math.hypot(mx - lx, my - ly) * (wd + lw) / 2;
                lx = mx; ly = my; lw = wd;
              }
              d.cum[q + k] = g;
            }
            d.area[j] = g;
          }
        }
        for (i = used; i < N; i++) {                         // move the balls with their rooms
          if (dom[i] < 0) continue;
          d = doms[dom[i]]; x = pt[i];
          if (!d.n) { dom[i] = -1; continue; }
          if (d.same) {
            j = find(d.pb, d.n, x);
            var A0 = d.pcum[j * (K + 1) + K], A1 = d.area[j], cc = along(d.pcum, j, d.pb, x);
            if (d.k[j] === 1) {                              // fresh: keep the same amount of steam between the ball and the barrier far from the inlet
              if (d.port[j] - d.b[j] < d.b[j + 1] - d.port[j]) cc = A1 - (A0 - cc);
              if (cc < 0 || cc > A1) { dom[i] = -1; continue; }
            } else cc = A0 > 1e-9 ? cc / A0 * A1 : 0;       // shut in or used: keep the same share of the room on each side
            x = where(d.cum, j, d.b, cc);
          } else j = find(d.b, d.n, Math.max(d.b[0], Math.min(d.b[d.n], x)));
          kind = d.k[j];
          if (!kind) { dom[i] = -1; continue; }
          if (kind === 3) {
            g = (d.drain || .3 * (d.b[d.n] - d.b[0])) * (turn > 0 ? turn : 0); e = d.port[j] - x;
            if (Math.abs(e) <= g || d.b[j + 1] - d.b[j] < 1e-6) { if (turn > 0) { dom[i] = -1; continue; } } else x += e > 0 ? g : -g;
          }
          pt[i] = x; iv[i] = j; d.cnt[j]++;
        }
        for (a = 0; a < doms.length; a++) {                  // top up the rooms of fresh steam at their inlets
          d = doms[a];
          for (j = 0; j < d.n; j++) {
            if (d.k[j] !== 1) continue;
            var want = Math.round(d.density * d.area[j]), lack = want - d.cnt[j];
            if (lack <= 0) continue;
            g = lack / want; if (g > .5) g = 1;
            for (k = 0; k < lack; k++) {
              i = free(); if (i < 0) break;
              e = Math.random() * g * d.area[j];
              dom[i] = a; iv[i] = j; pt[i] = where(d.cum, j, d.b, d.port[j] - d.b[j] < d.b[j + 1] - d.port[j] ? e : d.area[j] - e); d.cnt[j]++;
            }
          }
        }
        for (i = used; i < N; i++) {                         // draw
          if (dom[i] < 0) { M[i * 16] = M[i * 16 + 5] = M[i * 16 + 10] = 0; continue; }
          d = doms[dom[i]]; j = iv[i];
          var lo = d.b[j] + d.pad, hi = d.b[j + 1] - d.pad; L = d.b[j + 1] - d.b[j];
          if (hi < lo) lo = hi = (d.b[j] + d.b[j + 1]) / 2;
          x = lo + (L > 1e-9 ? (pt[i] - d.b[j]) / L : 0) * (hi - lo) + (d.wob === undefined ? .01 * (d.b[d.n] - d.b[0]) : d.wob) * Math.sin(T * 2.3 + ph[i]);
          x = Math.max(lo, Math.min(hi, x));
          d.f(x, out);
          e = Math.max(.12, Math.min(.88, pv[i] + .08 * Math.sin(T * 3.1 + 2 * ph[i])));
          g = Math.hypot(out[2] - out[0], out[3] - out[1]);
          kind = d.k[j];
          put(i, out[0] + (out[2] - out[0]) * e, out[1] + (out[3] - out[1]) * e, hi > lo ? Math.min(base * sz[i], .12 * g) : 0,
            kind === 1 ? 1 : kind === 3 ? .3 : Math.max(.3, Math.min(1, d.cnt[j] / (d.density * d.area[j] + 1e-9))));
        }
        for (a = 0; a < pipes.length; a++) {                 // streams in the pipes
          var p = pipes[a];
          for (k = 0; k < p.n; k++) {
            i = p.first + k;
            if (!p.on) { M[i * 16] = M[i * 16 + 5] = M[i * 16 + 10] = 0; continue; }
            var s = ph[i] / 6.283 + T * p.speed; s -= Math.floor(s);
            var at = (p.out ? 1 - s : s) * p.len; j = 1; while (j < p.pts.length - 1 && p.cum[j] < at) j++;
            var p0 = p.pts[j - 1], p1 = p.pts[j], sl = p.cum[j] - p.cum[j - 1] || 1, u = (at - p.cum[j - 1]) / sl, off = (pv[i] - .5) * p.w + .06 * p.w * Math.sin(T * 3.1 + 2 * ph[i]);
            put(i, p0[0] + (p1[0] - p0[0]) * u - (p1[1] - p0[1]) / sl * off, p0[1] + (p1[1] - p0[1]) * u + (p1[0] - p0[0]) / sl * off,
              Math.min(base * sz[i], .2 * p.w) * (p.out ? 1 - .7 * s : Math.min(1, s * 6)), p.out ? .45 * (1 - s) : 1);
          }
        }
        m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
      };
      return m;
    },

    /** Face cam: a flat ring whose top face rises and falls round the circle, for a follower pressed against the face
        of a turning disc (a swash or end cam). Axis local Z; the ring stands from z = 0 up to z = rise(angle), between
        radius rIn and rOut. angle is anticlockwise from +X, in radians, 0 to 2 pi; keep rise above 0 everywhere.
        o: {rIn, rOut, rise: function (angle) -> height, n (steps round, default 360), material}
        The top face is flat across the ring at each angle, so a flat follower face touches it at the highest point
        under the follower. Each face has its own vertices, so the edges stay sharp. */
    faceCam: function (o) {
      var n = o.n || 360, pos = [], idx = [], i, a, h = [];
      for (i = 0; i <= n; i++) h.push(o.rise(2 * Math.PI * i / n));
      function strip(fn) {                                   // one face: two rows of n+1 points, joined in quads
        var b = pos.length / 3;
        for (i = 0; i <= n; i++) { a = 2 * Math.PI * i / n; var p = fn(a, h[i]); pos.push(p[0], p[1], p[2], p[3], p[4], p[5]); }
        for (i = 0; i < n; i++) { var k = b + i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
      }
      var ri = o.rIn, ro = o.rOut;
      strip(function (a, z) { var c = Math.cos(a), s = Math.sin(a); return [ro * c, ro * s, z, ri * c, ri * s, z]; });       // top
      strip(function (a, z) { var c = Math.cos(a), s = Math.sin(a); return [ro * c, ro * s, 0, ro * c, ro * s, z]; });       // outer wall
      strip(function (a, z) { var c = Math.cos(a), s = Math.sin(a); return [ri * c, ri * s, z, ri * c, ri * s, 0]; });       // inner wall
      strip(function (a) { var c = Math.cos(a), s = Math.sin(a); return [ri * c, ri * s, 0, ro * c, ro * s, 0]; });          // bottom
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      return mesh(geo, o.material);
    },

    /** Water running along pipes and through valves, drawn as dots (for pumps). Each path is a polyline in the XY plane;
        its dots are spread along it, across a width w and between depths z0 and z1, all in one draw call.
        o: {paths: [{pts: [[x, y], ...], n (dots), w (width across), z0, z1}], radius (default 2.4), color (CSS, such as c.spot), opacity}
        .move(k, ds): slide the dots of path k by ds along it (negative goes back); a dot leaving one end comes in at the other.
        .show(k, on): show or hide path k. Call .flush() once a frame after moving. */
    pipeDots: function (o) {
      var paths = o.paths, N = 0, i, k;
      paths.forEach(function (p) {
        p.first = N; N += p.n; p.cum = [0]; p.on = true;
        for (k = 1; k < p.pts.length; k++) p.cum.push(p.cum[k - 1] + Math.hypot(p.pts[k][0] - p.pts[k - 1][0], p.pts[k][1] - p.pts[k - 1][1]));
        p.L = p.cum[p.cum.length - 1]; p.s = []; p.off = []; p.z = [];
        for (k = 0; k < p.n; k++) { p.s.push((k + Math.random()) / p.n * p.L); p.off.push((Math.random() - .5) * p.w); p.z.push(p.z0 + (p.z1 - p.z0) * Math.random()); }
      });
      var dots = P.waterDots(N, { radius: o.radius || 2.4, color: o.color, opacity: o.opacity });
      function draw(p) {
        for (var q = 0; q < p.n; q++) {
          var s = p.s[q], j = 1; while (j < p.pts.length - 1 && p.cum[j] < s) j++;
          var a = p.pts[j - 1], b = p.pts[j], l = p.cum[j] - p.cum[j - 1] || 1, u = (s - p.cum[j - 1]) / l, dx = (b[0] - a[0]) / l, dy = (b[1] - a[1]) / l;
          dots.put(p.first + q, a[0] + (b[0] - a[0]) * u - dy * p.off[q], a[1] + (b[1] - a[1]) * u + dx * p.off[q], p.z[q], p.on ? 1 : 0);
        }
      }
      dots.move = function (k, ds) { var p = paths[k]; for (var q = 0; q < p.n; q++) { var s = (p.s[q] + ds) % p.L; p.s[q] = s < 0 ? s + p.L : s; } draw(p); };
      dots.show = function (k, on) { paths[k].on = on; draw(paths[k]); };
      for (i = 0; i < paths.length; i++) draw(paths[i]);
      dots.flush();
      return dots;
    },

    /** Helical flight (the spiral blade of an Archimedes screw) round the X axis, from x = 0 to x = length. A thin ribbon standing
        from radius rIn to rOut, with a small thickness along X. Its angle round the axis (from +Y towards +Z) at x is
        hand * 2 pi * x / pitch. o: {rIn, rOut, length, pitch, thickness (default 2), hand (1 or -1, default 1), material}. */
    helixFlight: function (o) {
      var n = Math.max(16, Math.round(o.length / o.pitch * 48)), th = (o.thickness || 2) / 2, hd = o.hand || 1, pos = [], i, k, v = [];
      function pt(x, r) { var a = hd * 2 * Math.PI * x / o.pitch; return [x, r * Math.cos(a), r * Math.sin(a)]; }
      for (i = 0; i <= n; i++) { var x = Math.min(o.length, Math.max(0, o.length * i / n)); v.push([pt(x - th * (i ? 1 : 0), o.rIn), pt(x - th * (i ? 1 : 0), o.rOut), pt(x + th * (i < n ? 1 : 0), o.rOut), pt(x + th * (i < n ? 1 : 0), o.rIn)]); }
      function T(a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
      function Q4(a, b, c, d) { T(a, b, c); T(a, c, d); }
      for (i = 0; i < n; i++) for (k = 0; k < 4; k++) { var a0 = v[i][k], a1 = v[i][(k + 1) % 4], b0 = v[i + 1][k], b1 = v[i + 1][(k + 1) % 4]; Q4(a0, a1, b1, b0); }
      for (k = 0; k < 2; k++) { var e = k ? v[n] : v[0]; Q4(e[0], e[1], e[2], e[3]); }
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      return mesh(g, o.material);
    },

    /** Bent pipe cut in half, as in a cut-away engraving: only the back half (z <= 0) is drawn, so the bore shows from the
        front, and the cut wall is a flat strip on z = 0. The centre line runs through path ([[x, y], ...] in the local XY
        plane, sampled closely enough to look smooth); the ends are open. o: {path, rIn, rOut, radii (optional [[rIn, rOut], ...],
        one pair per path point, for a pipe that swells into a chamber), material, sides (default 16),
        clip (optional [{path, r}, ...]: leave out every piece that lies within r of one of these centre lines, so two pipes
        can join in a fork without walls showing inside each other)}. */
    halfPipe: function (o) {
      var p = o.path, n = p.length, S = o.sides || 16, pos = [], idx = [], i, k, cl = o.clip || [];
      function inside(x, y, z) {
        for (var q = 0; q < cl.length; q++) {
          var c = cl[q].path, best = 1e9;
          for (var j = 0; j < c.length - 1; j++) {
            var ax = c[j][0], ay = c[j][1], dx = c[j + 1][0] - ax, dy = c[j + 1][1] - ay, L = dx * dx + dy * dy || 1e-9;
            var t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)), ex = ax + t * dx - x, ey = ay + t * dy - y;
            best = Math.min(best, ex * ex + ey * ey);
          }
          if (best + z * z < cl[q].r * cl[q].r) return true;
        }
        return false;
      }
      function tri(a, b, c) {
        var x = (pos[3 * a] + pos[3 * b] + pos[3 * c]) / 3, y = (pos[3 * a + 1] + pos[3 * b + 1] + pos[3 * c + 1]) / 3, z = (pos[3 * a + 2] + pos[3 * b + 2] + pos[3 * c + 2]) / 3;
        if (!inside(x, y, z)) idx.push(a, b, c);
      }
      var nx = [], ny = [];
      for (i = 0; i < n; i++) {
        var a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], d = Math.hypot(tx, ty) || 1;
        nx.push(-ty / d); ny.push(tx / d);
      }
      function rad(i, j) { return o.radii ? o.radii[i][j] : j ? o.rOut : o.rIn; }
      function ring(j) {                                       // (S + 1) points per path point, from the -normal side round the back to the +normal side
        var first = pos.length / 3;
        for (i = 0; i < n; i++) for (k = 0; k <= S; k++) {
          var r = rad(i, j);
          var f = Math.PI + Math.PI * k / S, cf = Math.cos(f), sf = Math.sin(f);
          pos.push(p[i][0] + r * cf * nx[i], p[i][1] + r * cf * ny[i], r * sf);
        }
        return first;
      }
      var I = ring(0), O = ring(1);
      for (i = 0; i < n - 1; i++) for (k = 0; k < S; k++) {
        var i0 = i * (S + 1) + k, i1 = i0 + S + 1;
        tri(O + i0, O + i1, O + i1 + 1); tri(O + i0, O + i1 + 1, O + i0 + 1);
        tri(I + i0, I + i1 + 1, I + i1); tri(I + i0, I + i0 + 1, I + i1 + 1);
      }
      [-1, 1].forEach(function (s) {                           // the two cut strips on z = 0
        var first = pos.length / 3;
        for (i = 0; i < n; i++) { pos.push(p[i][0] + s * rad(i, 0) * nx[i], p[i][1] + s * rad(i, 0) * ny[i], 0, p[i][0] + s * rad(i, 1) * nx[i], p[i][1] + s * rad(i, 1) * ny[i], 0); }
        for (i = 0; i < n - 1; i++) { var q = first + 2 * i; if (s > 0) { tri(q, q + 2, q + 3); tri(q, q + 3, q + 1); } else { tri(q, q + 3, q + 2); tri(q, q + 1, q + 3); } }
      });
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      return mesh(g, o.material);
    },
    /** Path helper for halfPipe and similar: points along straight runs and round bends. pts: [[x, y], ...] corner points;
        r: bend radius at each inner corner (number, or array per corner); step: spacing of points (default 3). Returns [[x, y], ...]. */
    bendPath: function (pts, r, step) {
      step = step || 3; var out = [], i, k;
      function push(x, y) { var l = out[out.length - 1]; if (!l || Math.hypot(l[0] - x, l[1] - y) > 1e-6) out.push([x, y]); }
      function line(a, b) { var L = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.ceil(L / step)); for (k = 0; k <= m; k++) push(a[0] + (b[0] - a[0]) * k / m, a[1] + (b[1] - a[1]) * k / m); }
      var cur = pts[0];
      for (i = 1; i < pts.length - 1; i++) {
        var A = pts[i - 1], B = pts[i], C = pts[i + 1], rr = Array.isArray(r) ? r[i - 1] : r;
        var u = [A[0] - B[0], A[1] - B[1]], v = [C[0] - B[0], C[1] - B[1]], lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]);
        u = [u[0] / lu, u[1] / lu]; v = [v[0] / lv, v[1] / lv];
        var th = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))), tl = Math.min(rr / Math.tan(th / 2), lu * .5, lv * .5), rad = tl * Math.tan(th / 2);
        var P0 = [B[0] + u[0] * tl, B[1] + u[1] * tl], P1 = [B[0] + v[0] * tl, B[1] + v[1] * tl];
        line(cur, P0);
        var bx = u[0] + v[0], by = u[1] + v[1], bl = Math.hypot(bx, by) || 1, dc = rad / Math.sin(th / 2), cx = B[0] + bx / bl * dc, cy = B[1] + by / bl * dc;
        var a0 = Math.atan2(P0[1] - cy, P0[0] - cx), a1 = Math.atan2(P1[1] - cy, P1[0] - cx), da = a1 - a0;
        while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        var m = Math.max(2, Math.ceil(Math.abs(da) * rad / step));
        for (k = 1; k <= m; k++) push(cx + rad * Math.cos(a0 + da * k / m), cy + rad * Math.sin(a0 + da * k / m));
        cur = P1;
      }
      line(cur, pts[pts.length - 1]);
      return out;
    },

    /** Cut-away pipe: the back half (z <= 0) of a round pipe along a polyline in the XY plane, as in a section drawing.
        Bends are mitred, so the pipe keeps its bore round each corner; the cut faces lie flat on z = 0.
        o: {pts: [[x, y], ...], rIn, rOut, material, steps (round the half, default 16), ends (default true: close each
        end with a half ring; false leaves the ends open, for a pipe that runs into a barrel or off the picture)}.
        To join a pipe to the side of a barrel, leave a gap in the barrel's wall with shellSection and run the pipe in to
        the barrel's bore. */
    pipeSection: function (o) {
      var p = o.pts, n = p.length, st = o.steps || 16, pos = [], M = [], i, k;
      for (i = 0; i < n; i++) {                                  // mitre direction (scaled) at each point
        var a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)], c0 = i > 0 ? p[i - 1] : p[i], c1 = i < n - 1 ? p[i + 1] : p[i];
        var t0x = p[i][0] - c0[0], t0y = p[i][1] - c0[1], t1x = c1[0] - p[i][0], t1y = c1[1] - p[i][1], l0 = Math.hypot(t0x, t0y), l1 = Math.hypot(t1x, t1y);
        if (!l0) { t0x = t1x; t0y = t1y; l0 = l1; } if (!l1) { t1x = t0x; t1y = t0y; l1 = l0; }
        var n0x = -t0y / l0, n0y = t0x / l0, n1x = -t1y / l1, n1y = t1x / l1, mx = n0x + n1x, my = n0y + n1y, ml = Math.hypot(mx, my) || 1;
        mx /= ml; my /= ml; var d = mx * n1x + my * n1y || 1; M.push([mx / d, my / d]);
      }
      function pt(i, r, k) { var f = Math.PI * k / st, c = Math.cos(f); return [p[i][0] + r * c * M[i][0], p[i][1] + r * c * M[i][1], -r * Math.sin(f)]; }
      function quad(A, B, C, D) { pos.push(A[0], A[1], A[2], B[0], B[1], B[2], C[0], C[1], C[2], A[0], A[1], A[2], C[0], C[1], C[2], D[0], D[1], D[2]); }
      for (i = 0; i < n - 1; i++) {
        for (k = 0; k < st; k++) {
          quad(pt(i, o.rOut, k), pt(i + 1, o.rOut, k), pt(i + 1, o.rOut, k + 1), pt(i, o.rOut, k + 1));
          quad(pt(i, o.rIn, k), pt(i, o.rIn, k + 1), pt(i + 1, o.rIn, k + 1), pt(i + 1, o.rIn, k));
        }
        quad(pt(i, o.rIn, 0), pt(i, o.rOut, 0), pt(i + 1, o.rOut, 0), pt(i + 1, o.rIn, 0));       // cut faces on z = 0
        quad(pt(i, o.rIn, st), pt(i + 1, o.rIn, st), pt(i + 1, o.rOut, st), pt(i, o.rOut, st));
      }
      if (o.ends !== false) [0, n - 1].forEach(function (e) { for (k = 0; k < st; k++) quad(pt(e, o.rIn, k), pt(e, o.rOut, k), pt(e, o.rOut, k + 1), pt(e, o.rIn, k + 1)); });
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      return mesh(g, o.material);
    },

    /** Part of a halfSection that only goes round part of the way, for a barrel wall with a gap where a side pipe
        joins it (see pipeSection). Same outline o.poly ([[r, y], ...], axis local Y). o.from and o.to are angles round
        the axis: 0 is +X, PI/2 the back (-Z), PI is -X; halfSection is from 0 to PI. Each end gets a flat face.
        o: {poly, from, to, material, steps (default 28 for a half turn)}. */
    shellSection: function (o) {
      var a0 = o.from, a1 = o.to, st = Math.max(2, Math.round((o.steps || 28) * (a1 - a0) / Math.PI)), pos = [], poly = o.poly, n = poly.length, i, k, g = new THREE.Group();
      for (i = 0; i < n; i++) {
        var a = poly[i], b = poly[(i + 1) % n];
        for (k = 0; k < st; k++) {
          var f0 = a0 + (a1 - a0) * k / st, f1 = a0 + (a1 - a0) * (k + 1) / st, c0 = Math.cos(f0), s0 = -Math.sin(f0), c1 = Math.cos(f1), s1 = -Math.sin(f1);
          pos.push(a[0] * c0, a[1], a[0] * s0, b[0] * c0, b[1], b[0] * s0, b[0] * c1, b[1], b[0] * s1,
                   a[0] * c0, a[1], a[0] * s0, b[0] * c1, b[1], b[0] * s1, a[0] * c1, a[1], a[0] * s1);
        }
      }
      var gs = new THREE.BufferGeometry(); gs.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); gs.computeVertexNormals();
      g.add(mesh(gs, o.material));
      [a0, a1].forEach(function (f) {
        var e = mesh(new THREE.ShapeGeometry(new THREE.Shape(poly.map(function (q) { return new THREE.Vector2(q[0], q[1]); }))), o.material);
        e.rotation.y = f; g.add(e);
      });
      return g;
    },

    /** Hinged flap valve (clack) for pumps, cut in half like the barrel round it: the back half of a round flap of
        radius r, lying flat on its seat (the plane y = 0) with its hinge along local Z at the origin. o: {radius,
        thickness (default 2), side (1: the flap reaches along +X, -1: along -X), open (angle when fully open, default
        1 radian), material, mark (material for a small mark near the free edge, optional), pin (material for the hinge
        pin, optional)}. Returns a Group; .set(t) opens it, t from 0 (shut) to 1 (fully open), lifting the free edge. */
    flapValve: function (o) {
      var r = o.radius, th = o.thickness || 2, s = o.side < 0 ? -1 : 1, g = new THREE.Group(), sh = new THREE.Shape(), k;
      for (k = 0; k <= 24; k++) { var f = Math.PI * k / 24; sh[k ? "lineTo" : "moveTo"](s * (r - r * Math.cos(f)), -r * Math.sin(f)); }
      var geo = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }); geo.rotateX(Math.PI / 2); geo.translate(0, th, -.4);
      g.add(mesh(geo, o.material));
      if (o.mark) P.at(P.box(3, 1, 3, o.mark), s * 1.55 * r, th + .5, -.4 - .45 * r, g);          // sits .5 above the flap
      if (o.pin) P.at(P.cylZ(th * .7, r - .6, o.pin), 0, th * .5, -.7 - r / 2, g);             // z -1 .. -.4-r: its cut end stands .6 behind the flap's cut face (z -.4)
      g.set = function (t) { g.rotation.z = s * t * (o.open || 1); };
      return g;
    },

    /** Button valve (a round lid that lifts straight up off its seat) for pumps, cut in half like the barrel round it.
        Its base sits on the seat at y = 0. o: {radius, height (default .45 radius), lift (default .4 radius), material,
        mark (material for a small knob on top, optional)}. Returns a Group; .set(t) lifts it, t from 0 (shut) to 1. */
    buttonValve: function (o) {
      var r = o.radius, h = o.height || .45 * r, g = new THREE.Group(), v = P.at(new THREE.Group(), 0, 0, 0, g);
      v.add(P.halfSection({ poly: [[0, 0], [r, 0], [r, .3 * h], [.6 * r, .8 * h], [0, h]], material: o.material }));
      if (o.mark) P.at(P.sphere(Math.max(1.4, .14 * r), o.mark), 0, h, -1.5, v);
      g.set = function (t) { v.position.y = t * (o.lift || .4 * r); };
      return g;
    },

    /** Water in a pump, drawn as dots that move by volume, so they run faster in narrow pipes than in a wide barrel.
        Water is counted as a flat section: a stretch of pipe w wide and L long holds w * L of it.
        o: {count, radius (default 2.2), color (CSS, such as c.spot), opacity, density (dots per unit of that volume,
        default .01), gravity (for spilt drops, default 400), fall (how far a drop falls before it goes, default 80)}.
        .chain({pts: [[x, y], ...], w: width or a width per segment, over, under, spill}) adds a stretch of pipe and
          returns its index; its volume is .chains[k].L. A dot pushed past the end goes to chain `over` (at its start),
          or with spill: true leaves as a falling drop at the speed .chains[k].v (set it each frame); else it goes.
          A dot pushed back below the start goes to chain `under` (at its start, as it now runs out that way), or goes.
        .fill(k, q0, q1) puts dots evenly between volumes q0 and q1 of chain k.
        .shift(k, dq, spawn) moves every dot of chain k by dq (volume, may be negative); spawn: true lets new dots in at
          the start when dq > 0 (water coming in from outside the picture). Shift the chain that water flows into
          before the chain it comes from, so dots that move across are not moved twice.
        .clear(k) removes the dots of chain k. .hide = function (x, y) {return true to hide a dot there}, e.g. inside a piston.
        .update(dt) moves the drops and draws everything; call it once a frame after the shifts. */
    pumpWater: function (o) {
      var N = o.count, dots = P.waterDots(N, { radius: o.radius || 2.2, color: o.color, opacity: o.opacity }), rad = o.radius || 2.2;
      var D = [], ch = [], i, rho = o.density || .01, G = o.gravity || 400, FALL = o.fall || 80;
      for (i = 0; i < N; i++) D.push({ k: -1, q: 0, lat: 0, zf: 0, x: 0, y: 0, vx: 0, vy: 0, y0: 0, drop: false });
      dots.chains = ch;
      function lane(d) { d.lat = Math.random() * 2 - 1; d.zf = Math.random(); }
      function free() { for (var j = 0; j < N; j++) if (D[j].k < 0 && !D[j].drop) return D[j]; return null; }
      dots.chain = function (q) {
        var c = { pts: q.pts, over: q.over, under: q.under, spill: !!q.spill, v: 0, cum: [0], w: [], len: [], L: 0 }, j;
        for (j = 1; j < q.pts.length; j++) {
          var w = Array.isArray(q.w) ? q.w[j - 1] : q.w, l = Math.hypot(q.pts[j][0] - q.pts[j - 1][0], q.pts[j][1] - q.pts[j - 1][1]);
          c.w.push(w); c.len.push(l); c.L += w * l; c.cum.push(c.L);
        }
        ch.push(c); return ch.length - 1;
      };
      function place(c, q, out) {                                   // centre point, unit direction and width at volume q
        var j = 0; while (j < c.len.length - 1 && c.cum[j + 1] < q) j++;
        var a = c.pts[j], b = c.pts[j + 1], u = Math.max(0, Math.min(1, (q - c.cum[j]) / (c.w[j] * c.len[j] || 1)));
        out[0] = a[0] + (b[0] - a[0]) * u; out[1] = a[1] + (b[1] - a[1]) * u; out[2] = (b[0] - a[0]) / (c.len[j] || 1); out[3] = (b[1] - a[1]) / (c.len[j] || 1); out[4] = c.w[j];
      }
      var tmp = [0, 0, 0, 0, 0];
      function add(k, q) { var d = free(); if (!d) return; d.k = k; d.q = q; lane(d); }
      dots.fill = function (k, q0, q1) { var n = Math.round((q1 - q0) * rho); for (var j = 0; j < n; j++) add(k, q0 + (q1 - q0) * (j + Math.random()) / n); };
      dots.clear = function (k) { D.forEach(function (d) { if (d.k === k) d.k = -1; }); };
      dots.shift = function (k, dq, spawn) {
        if (!dq) return;
        var c = ch[k], j, d;
        for (j = 0; j < N; j++) {
          d = D[j]; if (d.k !== k) continue;
          d.q += dq;
          if (d.q > c.L) {
            if (c.over !== undefined) { d.k = c.over; d.q -= c.L; }
            else if (c.spill) { place(c, c.L, tmp); d.k = -1; d.drop = true; d.x = tmp[0] - tmp[3] * d.lat * (tmp[4] / 2 - rad); d.y = tmp[1] + tmp[2] * d.lat * (tmp[4] / 2 - rad); d.vx = tmp[2] * c.v; d.vy = tmp[3] * c.v; d.y0 = d.y; d.z = -1 - d.zf * (tmp[4] / 2 - rad); }
            else d.k = -1;
          } else if (d.q < 0) {
            if (c.under !== undefined) { d.k = c.under; d.q = -d.q; } else d.k = -1;
          }
        }
        if (spawn && dq > 0) { var n = dq * rho, m = Math.floor(n) + (Math.random() < n - Math.floor(n) ? 1 : 0); for (j = 0; j < m; j++) add(k, Math.random() * dq); }
      };
      dots.hide = null;
      dots.update = function (dt) {
        for (var j = 0; j < N; j++) {
          var d = D[j];
          if (d.drop) {
            d.vy -= G * dt; d.x += d.vx * dt; d.y += d.vy * dt;
            if (d.y < d.y0 - FALL) { d.drop = false; dots.put(j, 0, 0, 0, 0); continue; }
            dots.put(j, d.x, d.y, d.z, 1); continue;
          }
          if (d.k < 0) { dots.put(j, 0, 0, 0, 0); continue; }
          place(ch[d.k], d.q, tmp);
          var h = tmp[4] / 2 - rad - 1, x = tmp[0] - tmp[3] * d.lat * h, y = tmp[1] + tmp[2] * d.lat * h;
          dots.put(j, x, y, -1.5 - d.zf * Math.max(0, h - 1), dots.hide && dots.hide(x, y) ? 0 : 1);
        }
        dots.flush();
      };
      return dots;
    },

    /** Not a mesh: the angle to add to gear b's own spin so that its teeth fall into the gaps of gear a, with both placed
        as they are now (any parents, any directions). For setting the starting phase of gear trains and for checking them.
        a, b: results of spurGear, internalGear, bevelGear or bevelGearCone. A spur or internal gear spins by rotation.z,
        a bevel gear by rotation.y, so use b.rotation.z += P.meshTurn(a, b) or b.rotation.y += P.meshTurn(a, b).
        Spur pairs must already be the right distance apart and bevel pairs must share an apex. The result lies within
        half a tooth either way and is 0 when the pair already meshes. */
    meshTurn: function (a, b) {
      function info(g) {
        g.updateWorldMatrix(true, false);
        var m = g.matrixWorld, bev = g.apexDist !== undefined || g.innerFaceY !== undefined;
        var x = new THREE.Vector3().setFromMatrixColumn(m, 0).normalize(), u = new THREE.Vector3().setFromMatrixColumn(m, bev ? 1 : 2).normalize();
        return { g: g, bev: bev, x: x, u: u, n: bev ? u.clone().negate() : u, c: new THREE.Vector3().setFromMatrixPosition(m) };   // teeth are numbered right-handed about n
      }
      var A = info(a), B = info(b), ring = a.rootRadius !== undefined ? A : b.rootRadius !== undefined ? B : null;
      function phase(G, O) {                              // where the line of contact falls on G, in teeth from tooth 0, and the way G's teeth count there
        var d = G.bev ? O.u.clone() : ring ? (ring === G ? O.c.clone().sub(G.c) : G.c.clone().sub(O.c)) : O.c.clone().sub(G.c);
        d.addScaledVector(G.n, -d.dot(G.n)).normalize();
        var y = new THREE.Vector3().crossVectors(G.n, G.x);
        return { f: Math.atan2(d.dot(y), d.dot(G.x)) / G.g.pitch, t: new THREE.Vector3().crossVectors(G.n, d) };
      }
      var pa = phase(A, B), pb = phase(B, A), same = pa.t.dot(pb.t) > 0;
      var e = pb.f - (same ? pa.f - .5 : .5 - pa.f); e -= Math.round(e);
      return (B.bev ? -1 : 1) * e * b.pitch;
    },

    /** Round tube along a bent centre line in the local XY plane (a glass U-tube, a siphon, a barometer), or the liquid
        inside one. o: {path: [[x, y], ...] (sample bends closely, e.g. with bendPath), radius, material, sides (default 16),
        caps (default true: close both ends with a flat disc)}. The mesh has .length (of the centre line) and
        .set(s0, s1) to draw only the stretch from distance s0 to s1 along the path (for a liquid column whose ends
        move; call it only when they change, it rebuilds the geometry). .pointAt(s) returns [x, y] on the centre line. */
    pathTube: function (o) {
      var p = o.path, n = p.length, cum = [0], i, S = o.sides || 16, r = o.radius, m = mesh(new THREE.BufferGeometry(), o.material);
      for (i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
      m.length = cum[n - 1];
      m.pointAt = function (s) {
        s = Math.max(0, Math.min(m.length, s));
        for (var k = 1; k < n; k++) if (cum[k] >= s || k === n - 1) { var f = (s - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1); return [p[k - 1][0] + (p[k][0] - p[k - 1][0]) * f, p[k - 1][1] + (p[k][1] - p[k - 1][1]) * f]; }
        return [p[0][0], p[0][1]];
      };
      m.set = function (s0, s1) {
        s0 = Math.max(0, s0); s1 = Math.min(m.length, s1);
        var pts = [], pos = [], k, j;
        if (s1 - s0 < 1e-3) { m.visible = false; return; }
        m.visible = true;
        pts.push(m.pointAt(s0)); for (k = 1; k < n - 1; k++) if (cum[k] > s0 && cum[k] < s1) pts.push(p[k]); pts.push(m.pointAt(s1));
        var N = pts.length, rings = [];
        for (k = 0; k < N; k++) {
          var a = pts[Math.max(0, k - 1)], b = pts[Math.min(N - 1, k + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1, ring = [];
          var nx = -ty / tl, ny = tx / tl;
          for (j = 0; j <= S; j++) { var f = 2 * Math.PI * j / S, c = Math.cos(f) * r, z = Math.sin(f) * r; ring.push([pts[k][0] + nx * c, pts[k][1] + ny * c, z]); }
          rings.push(ring);
        }
        function tri(A, B, C) { pos.push(A[0], A[1], A[2], B[0], B[1], B[2], C[0], C[1], C[2]); }
        for (k = 0; k < N - 1; k++) for (j = 0; j < S; j++) { tri(rings[k][j], rings[k + 1][j], rings[k + 1][j + 1]); tri(rings[k][j], rings[k + 1][j + 1], rings[k][j + 1]); }
        if (o.caps !== false) [0, N - 1].forEach(function (e) { var c0 = [pts[e][0], pts[e][1], 0]; for (j = 0; j < S; j++) tri(c0, rings[e][j + 1], rings[e][j]); });
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
        m.geometry.dispose(); m.geometry = g;
      };
      m.set(0, m.length);
      return m;
    },

    /** One blade of a screw propeller: a piece of a screw thread round the X axis. Centred on angle 0 (+Y), where it crosses
        x = 0; at angle t (from +Y towards +Z) its face lies at x = hand * pitch * t / (2 pi), so turning it by +t about +X
        (rotation.x) screws it towards -X when hand is 1. o: {rIn, rOut, pitch, halfWidth (function of u = 0 at the root .. 1 at
        the tip, giving the blade's half width as an angle in radians; return 0 at u = 1 for a rounded tip), thickness (along X,
        default 3), hand (1 or -1, default 1), nr, ns (grid, default 28 and 16), material}. Add more blades by rotating copies. */
    screwBlade: function (o) {
      var nr = o.nr || 28, ns = o.ns || 16, hd = o.hand || 1, t = (o.thickness || 3) / 2, F = [], B = [], pos = [], i, j;
      for (i = 0; i <= nr; i++) {
        var u = i / nr, r = o.rIn + u * (o.rOut - o.rIn), hw = Math.max(0, o.halfWidth(u)), fr = [], bk = [];
        for (j = 0; j <= ns; j++) {
          var a = hw * (2 * j / ns - 1), x = hd * o.pitch * a / (2 * Math.PI), y = r * Math.cos(a), z = r * Math.sin(a);
          fr.push([x + t, y, z]); bk.push([x - t, y, z]);
        }
        F.push(fr); B.push(bk);
      }
      function T(a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
      for (i = 0; i < nr; i++) for (j = 0; j < ns; j++) {
        T(F[i][j], F[i + 1][j], F[i][j + 1]); T(F[i + 1][j], F[i + 1][j + 1], F[i][j + 1]);
        T(B[i][j], B[i][j + 1], B[i + 1][j]); T(B[i + 1][j], B[i][j + 1], B[i + 1][j + 1]);
      }
      var loop = [];                                         // edge of the blade, once round
      for (i = 0; i < nr; i++) loop.push([i, 0]);
      for (j = 0; j < ns; j++) loop.push([nr, j]);
      for (i = nr; i > 0; i--) loop.push([i, ns]);
      for (j = ns; j > 0; j--) loop.push([0, j]);
      for (i = 0; i < loop.length; i++) {
        var p = loop[i], q = loop[(i + 1) % loop.length], f0 = F[p[0]][p[1]], f1 = F[q[0]][q[1]], b0 = B[p[0]][p[1]], b1 = B[q[0]][q[1]];
        T(f0, b0, f1); T(f1, b0, b1);
      }
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      return mesh(g, o.material);
    },

    /** Ring of clutch jaws. Axis local +Z, jaws run from z=0 to z=len, one jaw centred on angle 0.
        o: {count (default 4), widthDeg (default 40), rIn, rOut, len, material} */
    jawRing: function (o) {
      var g = new THREE.Group(), n = o.count || 4, w = (o.widthDeg || 40) * Math.PI / 180;
      for (var i = 0; i < n; i++) {
        var sh = new THREE.Shape(); sh.absarc(0, 0, o.rOut, -w / 2, w / 2, false); sh.absarc(0, 0, o.rIn, w / 2, -w / 2, true);
        var m = mesh(new THREE.ExtrudeGeometry(sh, { depth: o.len, bevelEnabled: false, curveSegments: 10 }), o.material);
        m.rotation.z = i * 2 * Math.PI / n; g.add(m);
      }
      return g;
    }
  };
  return P;
};
