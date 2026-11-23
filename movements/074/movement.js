M507.define({
  number: 74,
  title: "Part-toothed bevel gear",
  lede: "A gear with teeth on only part of its rim turns two other gears, one after the other. Each one turns for a while, then waits. The two turn opposite ways, so the same steady drive gives a stop-and-go motion both ways.",
  alt: "Two bevel gears face each other on a level shaft line, one on the left and one on the right. Below them, on an upright shaft, is a bevel gear with teeth on only half of its rim. Its toothed half meshes with the right gear, and its plain half passes under the left gear.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Part-toothed gear", note: "It turns all the time. Only part of its rim has teeth; the rest is cut away plain. Watch the red tooth: it is the first to bite." },
    { key: "left", color: "#C8873A", name: "Left gear", note: "Turns only while the toothed part passes under it. The rest of the time it stands still." },
    { key: "right", color: "#4FA58A", name: "Right gear", note: "Gets the toothed part half a turn later than the left gear. It turns the other way." }
  ],
  controls: [{ id: "k", label: "Teeth on the lower gear", value: "half", options: [["third", "A third"], ["half", "Half"], ["two", "Two thirds"]] }],
  readouts: [{ id: "in", label: "Driving gear" }, { id: "l", label: "Left gear" }, { id: "r", label: "Right gear" }],
  views: { "3d": [330, 170, 720], front: [0, -40, 820], side: [820, -20, 120] },
  target: [0, -60, 0],
  how: [
    "The lower gear turns steadily. Only part of its rim has teeth. While the toothed part passes under the right gear, the right gear turns. When it moves on to the left gear, the left gear turns and the right one stops.",
    "Both side gears touch the lower gear on opposite sides of it. There the rim moves one way under the right gear and the other way under the left gear. So the two gears turn opposite ways. A gear that is not being driven is held still by a little rub on its shaft.",
    "The first tooth meets the waiting gear a little before the middle of the mesh, and the last one lets go a little after. So each gear turns a bit longer than the toothed part alone suggests. Try A third, then Two thirds. Watch when both gears rest, and when both turn at once."
  ],
  note: "This model is rebuilt from Brown's drawing. The stand, the sizes and the number of teeth were made up. The other tooth amounts are added for comparison. The resting gears are held by rub on their shafts, not by a lock. A real part-toothed gear often has its first tooth trimmed or a locking rim so it starts more gently. Here the first tooth sets the waiting gear going at full speed at once.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var R = 90, N = 24, o = this.o = { a: 0, k: null, gears: {}, prog: { l: 0, r: 0 } };
    o.N = N;
    // bottom gear: axis Y flipped so its teeth face up to the apex at the origin. Tooth i sits at world angle (a - i*pitch), measured from +X towards +Z.
    var flip = new T.Group(); flip.rotation.x = Math.PI; scene.add(flip);
    o.spin = new T.Group(); flip.add(o.spin);
    [["third", 8], ["half", 12], ["two", 16]].forEach(function (q) {
      var g = P.bevelGearCone({ radius: R, teeth: N, cone: 45, count: q[1], material: c.mat("drive"), markMaterial: c.mat("drive", "mark") });
      g.K = q[1]; o.spin.add(g); o.gears[q[0]] = g;
    });
    var gp = o.gears.half, b = gp.backY, L = 240 - b;
    o.pitch = gp.pitch;
    P.at(P.cylY(12, L, c.mat("drive")), 0, b - 10 + L / 2, 0, o.spin);                // upright shaft, world y -(b-10)..-240, ends on the base top
    P.at(P.box(2, 36, 5, c.mat("drive", "dark")), 13, 200, 0, o.spin);               // stripe x 12..14 off the shaft, world y -218..-182

    // side gears, same apex, axes along world X, teeth facing each other
    o.side = {};
    [["r", 1], ["l", -1]].forEach(function (q) {
      var outer = new T.Group(); outer.rotation.z = -q[1] * Math.PI / 2; scene.add(outer);   // local +Y points to world +X (right) or -X (left)
      var key = q[0] === "r" ? "right" : "left", m = c.mat(key);
      var g = P.bevelGearCone({ radius: R, teeth: N, cone: 45, material: m }); outer.add(g);
      var bs = g.backY, Ls = 230 - bs;
      P.at(P.cylY(12, Ls, m), 0, bs - 10 + Ls / 2, 0, g);                            // level shaft, |x| bs-10..230, ends at the post's inner face
      P.at(P.box(2, 36, 5, c.mat(key, "dark")), 13, 195, 0, g);                       // stripe x 12..14 off the shaft, |x| 177..213
      o.side[q[0]] = g;
    });

    // stand
    P.at(P.box(16, 300, 40, c.fixed), 238, -90, 0, scene);       // right post x 230..246, y -240..60, z -20..20; shaft ends at x 230
    P.at(P.box(16, 300, 40, c.fixed), -238, -90, 0, scene);      // left post x -246..-230, y -240..60
    P.at(P.box(520, 12, 200, c.fixed), 0, -246, 0, scene);       // base x -260..260, y -252..-240, z -100..100; posts and upright shaft end on y -240
  },

  step: function (c, dt, S) {
    var o = this.o, k = S.controls.k, g = o.gears[k] || o.gears.half, K = g.K, p = o.pitch, N = o.N;
    if (o.k !== k) {                                                // new tooth amount: start again with the toothed part under the right gear
      o.k = k; o.a = (K - 1) / 2 * p;
      for (var j in o.gears) o.gears[j].visible = o.gears[j] === g;
    }
    o.a += S.w * dt;
    o.spin.rotation.y = o.a;
    // A side gear is driven while the first tooth is less than 1.5 pitches before its contact point and the last tooth
    // less than 1.5 pitches past it: K + 2 pitches each turn. Checked in a flat (Tredgold) layout of the same teeth: no
    // overlap anywhere in the pass, and outside this window the plain rim passes under the resting teeth.
    function prog(u) {                                              // u: bottom gear angle in pitches, 0 when the first tooth is at the contact point
      var v = u + 1.5, rev = Math.floor(v / N), w = v - rev * N;
      return { x: rev * (K + 2) + Math.min(w, K + 2) - 1.5, on: w < K + 2 };
    }
    var u = o.a / p, pr = prog(u), pl = prog(u - N / 2);
    o.side.r.rotation.y = -pr.x * p + p / 2;                        // same speed as the driver when engaged, half a tooth offset to mesh
    o.side.l.rotation.y = -pl.x * p + p / 2;
    function f(v) { v = Math.round(v * 10) / 10; return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " rpm"; }
    var rpm = S.playing ? S.rpm : 0;
    S.set("in", f(rpm));
    S.set("l", f(pl.on ? rpm : 0));                                 // about the shaft line, pointing right
    S.set("r", f(pr.on ? -rpm : 0));
  }
});
