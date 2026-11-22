M507.define({
  number: 219,
  title: "Eccentric crown wheel and pinion",
  lede: "A long gear, called a pinion, turns a crown wheel, a wheel with its teeth standing up round the rim. The wheel is fixed to its shaft off centre. So the pinion meets its rim sometimes near the shaft and sometimes far out, and the wheel speeds up and slows down in every turn.",
  alt: "A flat ring with teeth standing up round its rim, held by three arms on an upright shaft that is well off the middle of the ring. A long fluted pinion on a level shaft lies across the rim. Its outer shaft runs in two bearings on posts. One tooth of the ring is red.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Long pinion", note: "A small gear with very long teeth. It turns at a steady speed. The rim of the wheel can meet it anywhere along its length. The red stripe on its end shows it turning." },
    { key: "driven", color: "#C8873A", name: "Crown wheel", note: "A ring with its teeth standing up from the top. Watch the red tooth: it moves fast near the shaft and slowly far from it." },
    { key: "arms", color: "#D9B13B", name: "Arms and shaft", note: "Three arms hold the ring on the upright shaft. The shaft is not in the middle of the ring, so the ring swings round it." }
  ],
  controls: [{ id: "off", label: "Wheel centre", value: "far", options: [["far", "Far off the shaft"], ["near", "A little off"], ["on", "On the shaft"]] }],
  speed: { label: "Pinion speed", min: 5, max: 60, value: 30 },
  readouts: [{ id: "out", label: "Crown wheel" }, { id: "reach", label: "From shaft" }],
  views: { "3d": [-310, 350, 500], front: [-30, 40, 760], side: [700, 160, 0] },
  target: [-70, -10, 0],
  how: [
    "The pinion turns at a steady speed. Each of its teeth pushes one tooth of the ring past it. The ring is held on its shaft well off centre, so the whole ring swings round the shaft.",
    "Watch where the rim crosses the pinion. Sometimes it is close to the shaft and sometimes far away. Close in, the pinion's push acts on a short arm, so the wheel spins fast. Far out, the same push has to carry the rim round a much bigger circle, so the wheel turns slowly. The pinion is long so its teeth reach the rim wherever it is.",
    "Watch the From shaft and Crown wheel readouts together. Then pick On the shaft. Now the rim always crosses the pinion at the same place, and the speed stays the same all the way round."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown's pinion is long and fluted, so here it is a pinion with teeth along its whole length, and the rim slides along it as the wheel swings. Its teeth meet the ring's teeth at a slight slant when the rim is far from the middle of the pinion; a real wheel would need its teeth shaped for that. The bearings, posts, base, the foot bearing under the shaft, the shape of the arms, the sizes and the number of teeth were made up. The other two wheel positions were added to compare.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, MD = 5, N = 48, NP = 8, W = 10, OX = -60, BY = -110;
    var o = this.o = { a: 0, sets: {}, MD: MD, OX: OX };
    // crown wheel: pitch radius 120, teeth from r 112.5 to 127.5, ring z -5..5 (local), teeth stand on z 4.5..16.25, pitch line z 11.25
    var pin = P.spurGear({ teeth: NP, module: MD, width: 152, material: c.mat("drive") });   // long pinion, pitch radius 20
    var R = N * MD / 2, RP = pin.pitchRadius, rIn = R - 1.5 * MD, rOut = R + 1.5 * MD, YP = W / 2 + 1.25 * MD + RP;   // pinion axis y 31.25
    o.R = R; o.RP = RP;
    var S0 = 44, S1 = 196;                              // pinion from 44 to 196 out from the shaft along +X
    o.pin = new T.Group(); o.pin.position.set(OX + (S0 + S1) / 2, YP, 0); o.pin.rotation.y = Math.PI / 2; scene.add(o.pin);   // local Z -> world +X, local X -> world -Z
    o.spinP = new T.Group(); o.pin.add(o.spinP); o.spinP.add(pin);   // pinion z -76..76 (local)
    P.at(P.cylZ(5, 55, c.mat("drive")), 0, 0, 76 + 27.5, o.spinP);   // shaft z 76..131 = world s 196..251, ends at the outer bearing's outer face
    P.at(P.box(RP - 1.25 * MD - 4, 4, 1, c.mat("drive", "mark")), (RP - 1.25 * MD) / 2 + 2, 0, -77, o.spinP);   // stripe on the near end face, z -77.5..-76.5, lifted off it
    [214, 244].forEach(function (s) {                   // bearings at s 207..221 and 237..251, foot on the base top y -110
      var b = P.bearingBlock({ bore: 5.5, outer: 11, drop: YP - BY, width: 14, material: c.fixed });
      b.rotation.y = Math.PI / 2; P.at(b, OX + s, YP, 0, scene);
    });
    // upright shaft and its foot bearing, at x = OX
    o.spin = new T.Group(); o.spin.position.set(OX, 0, 0); scene.add(o.spin);
    P.at(P.cylY(7, 84, c.mat("arms")), 0, -48, 0, o.spin);           // shaft y -90..-6: from the foot bearing top to the hub bottom
    P.at(P.box(40, 20, 40, c.fixed), OX, BY + 10, 0, scene);           // foot bearing y -110..-90 on the base
    P.at(P.box(470, 10, 410, c.fixed), -25, BY - 5, 0, scene);         // base x -260..210, y -120..-110, z -205..205
    // one wheel for each offset; only one shown
    [["far", 60], ["near", 30], ["on", 0]].forEach(function (q) {
      var e = q[1], wg = new T.Group(); wg.position.set(-e, 0, 0); wg.rotation.x = -Math.PI / 2; o.spin.add(wg);   // crown centre e from the shaft; local (x, y) -> world (x, -z)
      var crown = P.crownWheel({ teeth: N, module: MD, width: W, material: c.mat("driven"), markMaterial: c.mat("driven", "mark") });
      crown.remove(crown.children[0]); wg.add(crown);   // keep the teeth, swap the full disc for a ring
      var ring = new T.Shape(); ring.absarc(0, 0, rOut, 0, 2 * Math.PI, false);
      var hole = new T.Path(); hole.absarc(0, 0, rIn, 0, 2 * Math.PI, true); ring.holes.push(hole);
      var rg = new T.ExtrudeGeometry(ring, { depth: W, bevelEnabled: false, curveSegments: 96 }); rg.translate(0, 0, -W / 2);
      wg.add(P.mesh(rg, c.mat("driven")));               // ring r 112.5..127.5, z -5..5
      P.at(P.cylZ(14, W + 2, c.mat("arms")), e, 0, 0, wg);   // hub on the shaft, z -6..6
      [[Math.PI, 34], [Math.PI / 3, 18], [-Math.PI / 3, 18]].forEach(function (am) {   // arms z -4..4, from the hub to 4 inside the ring
        var dx = Math.cos(am[0]), dy = Math.sin(am[0]), b = e * dx, L = -b + Math.sqrt(b * b - e * e + rIn * rIn) + 4;
        var arm = P.box(L, am[1], W - 2, c.mat("arms")); arm.position.set(e + dx * L / 2, dy * L / 2, 0); arm.rotation.z = am[0]; wg.add(arm);
      });
      // table: crown-local angle of the contact point against shaft angle. Crown centre in world: (OX - e cos th, -, e sin th).
      var M = 720, th = [], al = [], prev = null, k;
      for (k = 0; k <= M; k++) {
        var t = 2 * Math.PI * k / M, qx = -e * Math.cos(t), qz = e * Math.sin(t);
        var s = qx + Math.sqrt(R * R - qz * qz), wx = s - qx, wz = -qz;          // contact minus crown centre, world
        var lx = wx * Math.cos(t) - wz * Math.sin(t), lz = wx * Math.sin(t) + wz * Math.cos(t);   // undo the shaft turn
        var a = Math.atan2(-lz, lx);
        if (prev !== null) while (a > prev + Math.PI) a -= 2 * Math.PI;
        if (prev !== null) while (a < prev - Math.PI) a += 2 * Math.PI;
        th.push(t); al.push(a); prev = a;
      }
      o.sets[q[0]] = { g: wg, e: e, th: th, al: al };
    });
    o.th0 = -0.5;                                       // opening: crown centre back and left of the shaft, as drawn
  },

  // shaft angle for a crown-local contact angle (unwrapped), from the table
  theta: function (set, a) {
    var al = set.al, th = set.th, M = al.length - 1, m = Math.floor((al[0] - a) / (2 * Math.PI)), ar = a + 2 * Math.PI * m, lo = 0, hi = M;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (al[mid] >= ar) lo = mid; else hi = mid; }
    var f = (al[lo] - ar) / ((al[lo] - al[hi]) || 1e-9);
    return th[lo] + f * (th[hi] - th[lo]) + 2 * Math.PI * m;
  },
  alpha: function (set, t) {                            // inverse of theta, for the opening state
    var M = set.al.length - 1, n = Math.floor(t / (2 * Math.PI)), tr = t - 2 * Math.PI * n, f = tr / (2 * Math.PI) * M, i = Math.min(M - 1, Math.floor(f));
    return set.al[i] + (f - i) * (set.al[i + 1] - set.al[i]) - 2 * Math.PI * n;
  },

  step: function (c, dt, S) {
    var o = this.o, k, cur = o.sets[S.controls.off] || o.sets.far;
    for (k in o.sets) o.sets[k].g.visible = o.sets[k] === cur;
    // Mesh rule: a pinion gap sits on the crown tooth at the contact. Pinion angle psi (about world +X, local -Y points down):
    // psi = -PI/2 + (-R * alpha + PI * MD / 2) / RP. Driving the pinion steadily, alpha follows from psi, and the shaft angle from alpha.
    if (o.psi0 === undefined) o.psi0 = -Math.PI / 2 + (-o.R * this.alpha(o.sets.far, o.th0) + Math.PI * o.MD / 2) / o.RP;
    o.a += S.w * dt;
    var psi = o.psi0 + o.a, alpha = (Math.PI * o.MD / 2 - o.RP * (psi + Math.PI / 2)) / o.R;
    var th = this.theta(cur, alpha), th2 = this.theta(cur, alpha - 1e-3);
    o.spinP.rotation.z = psi;
    o.spin.rotation.y = th;
    var e = cur.e, qx = -e * Math.cos(th), qz = e * Math.sin(th), s = qx + Math.sqrt(o.R * o.R - qz * qz);
    var rpm = S.playing ? S.rpm : 0, ratio = (th2 - th) / (1e-3 * o.R / o.RP);   // shaft turn per pinion turn
    S.set("out", (Math.round(rpm * ratio * 10) / 10) + " rpm");
    S.set("reach", Math.round(s) + " mm");
  }
});
