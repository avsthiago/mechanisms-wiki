M507.define({
  number: 476,
  title: "Steam siphon pump",
  lede: "Two pipes dip into the water and join into one pipe that rises above them. A jet of steam blows up the middle of the join and drags the water up with it. It has no moving parts to wear out or jam.",
  alt: "An upside-down Y of pipe, cut open down the middle. Two legs go down into the water and meet in one pipe going up. A thinner steam pipe comes down on the right, crosses one leg, and turns up into the middle of the join.",
  parts: [
    { key: "legs", color: "#4FA58A", name: "Suction legs", note: "The two pipes that hang down into the water. Water climbs up both of them and meets at the fork." },
    { key: "neck", color: "#C8873A", name: "Discharge pipe", note: "The single pipe above the fork. All the water from both legs leaves up this pipe." },
    { key: "steam", color: "#D9B13B", name: "Steam pipe", note: "Brings steam from the boiler. It turns up in the middle of the fork, with its narrow end pointing straight up the discharge pipe." }
  ],
  controls: [{ id: "jet", label: "Steam", value: "full", options: [["gentle", "Gentle"], ["full", "Full"]] }],
  speed: false,
  readouts: [{ id: "q", label: "Flow" }, { id: "v", label: "Lifted" }],
  closed: { label: "Pipes" },
  views: { "3d": [247, 150, 512], front: [8, 20, 600], side: [600, 20, 0] },
  target: [8, 20, 0],
  how: [
    "Steam comes down the thin pipe on the right, runs across inside one leg, and turns up at the fork. It shoots out of the narrow end straight up the discharge pipe. Water rises up both legs, meets at the fork and goes up too.",
    "A fast jet drags the water next to it along. The steam meets the cold water, turns back into water and gives its push to the stream. The water it carries away is replaced from below, so a steady current flows. The steam pipe sits right in the middle of the fork and points the same way as the water, so it is not in the way.",
    "Try a gentle jet, then a full one. Watch how fast the dots climb the legs. Choose Closed to see the pipes as they look from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half of the pipes is cut away so the inside shows, as in the engraving. The bend of the steam pipe is simplified, and the sizes, speeds and flow numbers are made up. The dots show the water and the steam.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { q: 0, lifted: 0, f: 0 };
    o.st = P.bendPath([[92, 64], [92, -35], [0, -35], [0, 46]], 16, 3);       // steam pipe centre line, nozzle at the top end
    var lp = P.bendPath([[-60, -115], [-60, -5], [0, 45], [0, 150]], 30, 3);  // left leg, fork and discharge pipe
    var rp = P.bendPath([[60, -115], [60, -5], [6, 40]], 30, 3);              // right leg, ends inside the fork
    var cut = [{ path: o.st, r: 8.5 }];
    // closed view: a whole pipe is the back half plus its mirror image in z = 0, with the flat cut strips (all corners on z = 0) taken out
    function half(o2) {
      var m = P.halfPipe(o2), g = m.geometry, p = g.attributes.position, ix = g.index.array, keep = [], k;
      for (k = 0; k < ix.length; k += 3) if (Math.abs(p.getZ(ix[k])) > 1e-6 || Math.abs(p.getZ(ix[k + 1])) > 1e-6 || Math.abs(p.getZ(ix[k + 2])) > 1e-6) keep.push(ix[k], ix[k + 1], ix[k + 2]);
      g.setIndex(keep); return m;
    }
    function whole(o2) { var g = new T.Group(), a = half(o2), b = half(o2); b.scale.z = -1; g.add(a); g.add(b); return c.shell(g, "closed"); }
    scene.add(c.shell(P.halfPipe({ path: lp.filter(function (q) { return q[1] <= 45.01; }), rIn: 13, rOut: 16, clip: cut.concat([{ path: rp, r: 13 }]), material: c.mat("legs") }), "open"));
    c.shell(P.at(P.halfPipe({ path: lp.filter(function (q) { return q[1] >= 44.99; }), rIn: 13, rOut: 16, material: c.mat("neck") }), 0, 0, .3, scene), "open");   // discharge pipe, y 45 .. 150
    scene.add(c.shell(P.halfPipe({ path: rp, rIn: 13, rOut: 16, clip: cut.concat([{ path: lp, r: 13 }]), material: c.mat("legs") }), "open"));
    scene.add(whole({ path: lp.filter(function (q) { return q[1] <= 45.01; }), rIn: 13, rOut: 16, clip: [{ path: rp, r: 13 }], material: c.mat("legs") }));   // no hole for the steam pipe: it runs through the wall
    scene.add(whole({ path: lp.filter(function (q) { return q[1] >= 44.99; }), rIn: 13, rOut: 16, material: c.mat("neck") }));
    scene.add(whole({ path: rp, rIn: 13, rOut: 16, clip: [{ path: lp, r: 13 }], material: c.mat("legs") }));
    // closed view: a solid fork casting fills the seams where the two legs and the discharge pipe meet, y 22 .. 47, r 15.6 under the pipe's 16
    scene.add(c.shell(P.wholeSection({ poly: [[0, 22], [8, 25], [13, 30], [15.6, 36], [15.6, 47], [0, 47]], material: c.mat("legs") }), "closed"));
    scene.add(c.shell(P.halfSection({ poly: [[16, 138], [21, 138], [21, 150], [16, 150]], material: c.mat("neck") }), "open"));   // collar at the top, r 16 .. 21
    scene.add(c.shell(P.wholeSection({ poly: [[16, 138], [21, 138], [21, 150], [16, 150]], material: c.mat("neck") }), "closed"));
    var sp = P.halfPipe({ path: o.st, rIn: 5, rOut: 7.5, material: c.mat("steam") }); c.shell(P.at(sp, 0, 0, .6, scene), "open");   // cut face lifted off the legs' cut face
    scene.add(whole({ path: o.st, rIn: 5, rOut: 7.5, material: c.mat("steam") }));
    sp.add(P.halfSection({ poly: [[5, 46], [7.5, 46], [5.5, 54], [3, 54]], material: c.mat("steam") }));          // nozzle, y 46 .. 54
    // water paths: each leg's centre line continued up the discharge pipe
    var neck = lp.filter(function (q) { return q[1] > 45; });
    o.paths = [lp.concat([[0, 172]]), rp.concat(neck, [[0, 172]])].map(function (p) {   // run 22 past the top so the water is seen leaving the pipe
      var L = [0]; for (var k = 1; k < p.length; k++) L.push(L[k - 1] + Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]));
      return { p: p, L: L };
    });
    o.water = P.waterDots(260, { radius: 2.2, color: c.spot }); scene.add(o.water);
    o.wp = []; for (i = 0; i < 260; i++) o.wp.push({ k: i % 2, s: Math.random(), u: (Math.random() - .5) * 1.6, w: -Math.random() * .8 });
    o.gas = P.waterDots(120, { radius: 2.4, color: "#7E8B97", opacity: .8 }); scene.add(o.gas);
    o.sd = [[92, 80]].concat(o.st);   // steam dots start 16 above the open end, so the steam is seen going in
    o.sL = [0]; for (i = 1; i < o.sd.length; i++) o.sL.push(o.sL[i - 1] + Math.hypot(o.sd[i][0] - o.sd[i - 1][0], o.sd[i][1] - o.sd[i - 1][1]));
    o.gs = []; for (i = 0; i < 120; i++) o.gs.push(Math.random());
  },

  along: function (pa, d, out) {      // point and direction at distance d along a path
    var j = 1; while (j < pa.L.length - 1 && pa.L[j] < d) j++;
    var a = pa.p[j - 1], b = pa.p[j], l = pa.L[j] - pa.L[j - 1] || 1, u = Math.max(0, Math.min(1, (d - pa.L[j - 1]) / l));
    out[0] = a[0] + (b[0] - a[0]) * u; out[1] = a[1] + (b[1] - a[1]) * u; out[2] = (b[0] - a[0]) / l; out[3] = (b[1] - a[1]) / l;
  },
  nearSteam: function (x, y, z) {
    var p = this.o.st, b = 1e9;
    for (var k = 0; k < p.length; k += 2) b = Math.min(b, (p[k][0] - x) * (p[k][0] - x) + (p[k][1] - y) * (p[k][1] - y));
    return b + z * z < 72;
  },

  step: function (c, dt, S) {
    var o = this.o, run = S.playing && dt > 0, full = S.controls.jet === "full", out = [0, 0, 0, 0], i, me = this;
    if (run) {
      o.f += ((full ? 1 : .55) - o.f) * Math.min(1, dt * 1.2);
      o.lifted += o.f * 150 / 60 * dt;          // 150 litres a minute at full steam
    }
    o.wp.forEach(function (q, n) {
      var pa = o.paths[q.k], d = q.s * pa.L[pa.L.length - 1];
      if (run) {
        me.along(pa, d, out);
        var v = 30 * o.f * (out[1] > 45 && Math.abs(out[0]) < 2 ? 1.85 : 1);   // two legs feed one pipe, so the water goes faster above the fork
        q.s += v * dt / pa.L[pa.L.length - 1]; if (q.s > 1) q.s -= 1;
        d = q.s * pa.L[pa.L.length - 1];
      }
      me.along(pa, d, out);
      var x = out[0] - out[3] * q.u * 11, y = out[1] + out[2] * q.u * 11, z = q.w * 11 - 1;
      o.water.put(n, x, y, z, me.nearSteam(x, y, z) ? 0 : y > 150 ? 1 - (y - 150) / 22 : 1);   // fades as it leaves the top
    });
    o.water.flush();
    var Ls = o.sL[o.sL.length - 1], sp = { p: o.sd, L: o.sL };
    o.gs.forEach(function (s, n) {
      if (run) { s += dt * (full ? .9 : .5); if (s > 1) s -= 1; o.gs[n] = s; }
      var x, y, z, sc;
      if (n < 30) { me.along(sp, ((n / 30 + s) % 1) * Ls, out); x = out[0]; y = out[1]; z = -2; sc = .8; }   // steam in the pipe
      else {                                        // the jet: shoots up and turns into water as it mixes
        var t = (s * 3) % 1; y = 54 + t * 70 * (full ? 1 : .7); x = Math.sin(n * 7.3) * t * 6; z = -1 - (n % 4); sc = 1.1 * (1 - t);
      }
      o.gas.put(n, x, y, z, sc);
    });
    o.gas.flush();
    S.set("q", Math.round(o.f * 150) + " L/min");
    S.set("v", Math.round(o.lifted) + " L");
  }
});
