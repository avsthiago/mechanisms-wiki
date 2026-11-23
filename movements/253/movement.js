M507.define({
  number: 253,
  title: "Centrifugal check hooks",
  lede: "A safety catch for the drum that winds a mine rope. If the drum ever spins too fast, hooks fly out from it and catch on fixed pegs. The drum stops before the load can crash down the shaft.",
  alt: "A large round plate with three round pegs. In front of it a drum turns, carrying a smaller disc with three long hooks on pins. A rope passes over the drum and hangs down on both sides.",
  parts: [
    { key: "drum", color: "#5E7387", name: "Drum and disc", note: "The rope is wound on the drum. The disc behind it turns with the drum and carries the hooks." },
    { key: "hooks", color: "#C2503F", name: "Hooks", note: "Three hooks on pins near the middle of the disc. Springs hold them folded in. Watch them swing out when the drum runs too fast." },
    { key: "springs", color: "#8E7AA8", name: "Springs", note: "Each spring pulls its hook in against a small stop. A faster drum flings the hook out harder, and above a certain speed the spring loses." },
    { key: "frame", color: "#4FA58A", name: "Frame and pegs", note: "A plate fixed to the side of the mine shaft, with three strong pegs. A hook that flies out catches on one of them." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "Goes over the drum and down the shaft. The red marks show which way it runs." }
  ],
  controls: [{ id: "run", label: "Drum", value: "fast", options: [["safe", "Normal speed"], ["fast", "Running away"]] }],
  speed: false,
  readouts: [{ id: "w", label: "Drum" }, { id: "h", label: "Hooks" }],
  views: { "3d": [400, 170, 820], front: [0, 0, 960], side: [960, 0, 0] },
  target: [0, -10, 0],
  how: [
    "The drum winds the rope that lowers a cage or a load of ore. At normal speed the hooks stay folded against the disc. Their tips pass inside the pegs, so nothing touches.",
    "Each hook is pulled in by a spring. As the drum turns, the hook is also flung outwards, like a stone whirled on a string. That outward pull grows fast: at twice the speed it is four times as strong. Above a certain speed it beats the spring, and the hook swings out.",
    "A hook that is out reaches past the pegs. The next peg it meets lands in the crook of the hook, and the drum stops dead. Try normal speed, then running away, and watch which hook catches."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the hooks swung out; the folded position, the springs and the small stops were added to show how they are held in at normal speed. The rope ends, the sizes and the speeds are made up. Brown also says the drum should have a spring of its own to soften the jolt when it stops; that is left out, so here it stops at once.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o = {
      th: .62, w: 1.26, psi: 1.31, dpsi: 0, caught: -1,
      RP: 68, L: 128, HW: 4, RS: 178, RD: 12, PSI_IN: 1.31, WN: 1.26, WC: 2.3, R: 205
    };
    o.pivots = [92, 212, 332].map(function (d) { return d * Math.PI / 180; });
    o.studs = [125, 0, 239].map(function (d) { return d * Math.PI / 180; });
    // ---- frame plate (z -20 .. -10) with a bore for the shaft, and pegs z -10 .. 8 ----
    var sh = new T.Shape(); sh.absarc(0, 0, o.R, 0, 2 * Math.PI, false);
    var bore = new T.Path(); bore.absarc(0, 0, 8.5, 0, 2 * Math.PI, true); sh.holes.push(bore);
    var g = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false, curveSegments: 64 }); g.translate(0, 0, -20);
    scene.add(new T.Mesh(g, c.mat("frame")));
    o.studs.forEach(function (a) { P.at(P.cylZ(o.RD, 18, c.mat("frame", "dark")), o.RS * Math.cos(a), o.RS * Math.sin(a), -1, scene); });
    // ---- drum: shaft, disc, barrel, far flange ----
    o.drum = new T.Group(); scene.add(o.drum);
    var md = c.mat("drum");
    P.at(P.cylZ(8, 91, md), 0, 0, 25.5, o.drum);                                // shaft z -20 .. 71 (1 proud of the barrel end), through the bore (8.5) to the plate's back face
    P.at(P.cylZ(95, 6, md), 0, 0, -3, o.drum);                                  // disc z -6 .. 0
    P.at(P.cylZ(37, 70, md), 0, 0, 35, o.drum);                                 // barrel z 0 .. 70
    P.at(P.box(5, 22, 1, c.mat("drum", "mark")), 0, 22, 70.4, o.drum);           // red stripe on the barrel's end face (z 70), z 69.9 .. 70.9
    // ---- hooks: arm along local +X from the pin, crook at the end bent towards +Y (the way the drum turns) ----
    var mh = c.mat("hooks"), L = o.L;
    var barb = [[L - 4, 0], [L + 4, 0], [L + 4, 26], [L - 10, 32], [L - 4, 22]];
    o.hooks = []; o.springs = []; o.anchor = [];
    function polar(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
    function local(p0, ang, x, y) { var cs = Math.cos(ang), sn = Math.sin(ang); return [p0[0] + x * cs - y * sn, p0[1] + x * sn + y * cs]; }
    o.local = local;
    o.pivots.forEach(function (pa) {
      var p0 = polar(o.RP, pa), h = new T.Group(); h.position.set(p0[0], p0[1], 0); o.drum.add(h);
      var arm = c.P.armPlate({ length: L, r0: 9, r1: o.HW, thick: 6, material: mh }); arm.position.z = 3.5; h.add(arm);   // z .5 .. 6.5
      var s = new T.Shape(); barb.forEach(function (q, k) { if (k) s.lineTo(q[0], q[1]); else s.moveTo(q[0], q[1]); }); s.closePath();
      var bg = new T.ExtrudeGeometry(s, { depth: 6, bevelEnabled: false }); bg.translate(0, 0, .5); h.add(new T.Mesh(bg, mh));
      P.at(P.cylZ(3, 8.5, c.mat("drum", "dark")), p0[0], p0[1], 4.25, o.drum);   // pin z 0 .. 8.5, from the disc face
      // stops: one ahead of the folded arm, one behind the arm when it is straight out
      var a1 = local(p0, pa + o.PSI_IN, 60, o.HW + 3.2), a2 = local(p0, pa, 25, -o.HW - 3.2);
      [a1, a2].forEach(function (q) { P.at(P.cylZ(3, 7, c.mat("drum", "dark")), q[0], q[1], 3.5, o.drum); });   // z 0 .. 7
      // spring from the arm (40 along, on its leading face) to a pin on the disc
      var an = local(p0, pa + o.PSI_IN, 40, 30);
      P.at(P.cylZ(3, 7, c.mat("springs")), an[0], an[1], 3.5, o.drum);
      var sp = P.spring({ length: 45, radius: 2.4, wire: .8, turns: 9, material: c.mat("springs") }); sp.position.z = 3.5; o.drum.add(sp);
      o.hooks.push({ g: h, p0: p0, pa: pa }); o.springs.push(sp); o.anchor.push(an);
    });
    // ---- rope over the top of the barrel, down both sides, with a red mark on each side ----
    var mr = c.mat("rope"), RR = 39.5;
    P.at(P.arc(RR, 2.5, Math.PI, mr), 0, 0, 40, scene);
    [-1, 1].forEach(function (s) { P.at(P.rod(2.5, mr), 0, 0, 0, scene).span(s * RR, 0, 40, s * RR, -235, 40); });
    o.marks = [-1, 1].map(function (s) { return P.at(P.sphere(4, c.mat("rope", "mark")), s * RR, 0, 40, scene); });
    o.RR = RR;
    // ---- contact between a hook and a peg, in the disc's frame ----
    o.segs = function (k, psi) {                                                  // capsules [ax, ay, bx, by, radius] making up hook k
      var h = o.hooks[k], a = h.pa + psi, P0 = h.p0;
      function q(x, y) { return local(P0, a, x, y); }
      var t = q(L, 0), b1 = q(L, 26), b2 = q(L - 7, 29);
      return [[P0[0], P0[1], t[0], t[1], o.HW], [t[0], t[1], b1[0], b1[1], o.HW], [b1[0], b1[1], b2[0], b2[1], 3]];
    };
    o.gap = function (k, psi, th, j) {                                            // clearance between hook k and peg j (negative = overlap); side: +1 peg ahead of the arm
      var a = o.studs[j] - th, sx = o.RS * Math.cos(a), sy = o.RS * Math.sin(a), best = 1e9, side = 0;
      o.segs(k, psi).forEach(function (s) {
        var vx = s[2] - s[0], vy = s[3] - s[1], t = Math.max(0, Math.min(1, ((sx - s[0]) * vx + (sy - s[1]) * vy) / (vx * vx + vy * vy)));
        var d = Math.hypot(sx - s[0] - t * vx, sy - s[1] - t * vy) - s[4] - o.RD;
        if (d < best) { best = d; }
      });
      var h = o.hooks[k], ang = h.pa + psi;
      side = (-(sx - h.p0[0]) * Math.sin(ang) + (sy - h.p0[1]) * Math.cos(ang)) > 0 ? 1 : -1;
      return { d: best, side: side };
    };
    o.touch = function (psi, th) {                                                // first hook and peg in contact, or null
      for (var k = 0; k < 3; k++) for (var j = 0; j < 3; j++) { var r = o.gap(k, psi, th, j); if (r.d < 0) return { k: k, j: j, side: r.side }; }
      return null;
    };
  },

  step: function (c, dt, S) {
    var o = this.o, mode = S.controls.run, n = 10, h = (S.playing ? dt : 0) / n, i;
    for (i = 0; i < n && h > 0; i++) {
      if (o.caught >= 0) {
        if (mode === "safe") {                                                     // turn the drum back a little to free the hook
          o.th -= h; o.w = -1;
          if (o.gap(o.caught, o.psi, o.th, o.cj).d > 1 && o.psi > o.PSI_IN - 1e-3) { o.caught = -1; o.w = 0; }
        } else { o.w = 0; continue; }
      } else {
        if (mode === "fast") o.w += .9 * h;                                         // nothing holds the load back: the drum speeds up
        else o.w += Math.max(-3 * h, Math.min(3 * h, o.WN - o.w));                  // the brake brings it back to normal speed
      }
      // hook: flung out by the turning, pulled in by the spring
      var acc = -29 * (o.w * o.w - o.WC * o.WC) - 4 * o.dpsi;
      var dpsi = o.dpsi + acc * h, psi = o.psi + dpsi * h;
      if (psi > o.PSI_IN) { psi = o.PSI_IN; dpsi = 0; }
      if (psi < 0) { psi = 0; dpsi = 0; }
      var th = o.th + (o.caught >= 0 ? 0 : o.w * h);
      var hit = o.touch(psi, th);
      if (hit && (hit.side < 0 || o.caught >= 0)) { psi = o.psi; dpsi = 0; hit = o.touch(psi, th); }   // a peg behind the arm only holds it back; a caught hook stays put
      if (hit && o.caught < 0) {                                                    // a peg ahead: find where it touched, and stop
        var lo = o.th, hi = th;
        for (var k = 0; k < 20; k++) { var m = (lo + hi) / 2; if (o.touch(psi, m)) hi = m; else lo = m; }
        th = lo; o.caught = hit.k; o.cj = hit.j; o.w = 0; dpsi = 0;
      }
      o.th = th; o.psi = psi; o.dpsi = dpsi;
    }
    // place everything
    o.drum.rotation.z = o.th;
    o.hooks.forEach(function (hk, k) {
      hk.g.rotation.z = hk.pa + o.psi;
      var p = o.local(hk.p0, hk.pa + o.psi, 40, o.HW), an = o.anchor[k], sp = o.springs[k];
      sp.position.x = p[0]; sp.position.y = p[1]; sp.rotation.z = Math.atan2(an[1] - p[1], an[0] - p[0]);
      sp.setLength(Math.hypot(an[0] - p[0], an[1] - p[1]) - 3);
    });
    var s = o.th * o.RR, span = 200;
    o.marks[0].position.y = -20 - (((s % span) + span) % span);
    o.marks[1].position.y = -220 + (((s % span) + span) % span);
    var rpm = o.w * 60 / (2 * Math.PI);
    S.set("w", (Math.abs(rpm) < .05 ? "0" : rpm.toFixed(1).replace("-", "−")) + " rpm");
    S.set("h", o.caught >= 0 && mode === "fast" ? "caught" : o.caught >= 0 ? "freeing" : o.psi > o.PSI_IN - .01 ? "held in" : o.dpsi > 0 ? "folding in" : "flying out");
  }
});
