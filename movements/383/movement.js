M507.define({
  number: 383,
  title: "Cloth dressing rollers",
  lede: "Cloth is wound from one roller to another. On the way it passes over a turning cylinder covered with brushes. The brushes dress the cloth, which means they smooth and finish it.",
  alt: "An arched frame holding a roller at the top, a roller at the bottom and a brush cylinder in the middle. A strip of cloth runs from the upper roller, round the left side of the cylinder, to the lower roller.",
  parts: [
    { key: "frame", color: "#5E7387", name: "Frame", note: "Two arched side plates that hold the three shafts. They do not move." },
    { key: "roller", color: "#C8873A", name: "Rollers", note: "The upper roller gives out the cloth and the lower roller takes it in. Their cloth layers get thicker or thinner as the cloth moves." },
    { key: "cyl", color: "#4FA58A", name: "Brush cylinder", note: "A drum with brushes round its rim. Watch the one red brush go round." },
    { key: "cloth", color: "#E8E2D0", name: "Cloth", note: "The strip of cloth. It wraps the left side of the cylinder, so the brushes touch it." }
  ],
  controls: [{ id: "ratio", label: "Brush cylinder turns", value: "1", options: [["1", "With the cloth"], ["2.5", "Faster"], ["-1.5", "Against the cloth"]] }],
  speed: { min: 2, max: 30, value: 12, label: "Cloth speed", unit: "rpm" },
  readouts: [{ id: "top", label: "Upper roller" }, { id: "cyl", label: "Cylinder" }, { id: "bot", label: "Lower roller" }],
  views: { "3d": [133, 66, 1089], front: [0, 0, 930], side: [930, 0, 0] },
  target: [0, 5, 0],
  distance: [150, 2000],
  how: [
    "The cloth runs from the upper roller, round the left side of the cylinder, and down to the lower roller. The brushes brush it as it goes past. Both rollers turn the same way as the cloth moves.",
    "The cloth moves at one steady speed. The roller it is leaving gets thinner, so it must turn faster and faster to keep that speed. The roller it is winding onto gets thicker, so it turns slower and slower. When one roller is nearly bare, the cloth runs back the other way.",
    "The brush cylinder can turn with the cloth, faster than the cloth or against it. Try each one. The faster or opposite choices make the brushes rub across the cloth, and that does the dressing."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws a cut through the frame. The arch, the cloth thickness and the sizes were made up. The cloth is drawn much thicker than real cloth so the rollers visibly change size. When a roller is nearly empty, the model simply runs the cloth the other way. The cylinder is drawn with brush blocks round its rim.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { s: 0, dir: 1, YU: 156, RC: 78, CORE: 36, K: 5000, rt: 50, rb: 50, th: 0 };
    var mf = c.mat("frame");
    // side plates: arch-shaped band, z 66..78 and -78..-66
    function plate(z0) {
      var sh = new T.Shape(), a = 95, ai = 77, cy = 160;
      sh.moveTo(-155, -245); sh.lineTo(155, -245); sh.lineTo(a, cy); sh.absarc(0, cy, a, 0, Math.PI, false); sh.lineTo(-155, -245);
      var h = new T.Path(); h.moveTo(-130, -218); h.lineTo(130, -218); h.lineTo(ai, cy); h.absarc(0, cy, ai, 0, Math.PI, false); h.lineTo(-130, -218);
      sh.holes.push(h);
      var g = new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, z0);
      return new T.Mesh(g, mf);
    }
    scene.add(plate(66)); scene.add(plate(-78));                   // z 66..78 and -78..-66
    // rollers: orange core z -66..66, cloth layer z -56..56
    function roller(y) {
      var g = new T.Group(); g.position.y = y; scene.add(g);
      var spin = new T.Group(); g.add(spin);
      spin.add(P.cylZ(o.CORE, 132, c.mat("roller")));
      var bar = P.box(2 * o.CORE - 8, 5, 1, c.mat("roller", "dark")); bar.position.z = 67; spin.add(bar);
      P.at(P.box(2 * o.CORE - 8, 5, 1, c.mat("roller", "dark")), 0, 0, -67, spin);
      var cl = P.cylZ(1, 112, c.mat("cloth")); g.add(cl);
      return { spin: spin, cloth: cl };
    }
    o.top = roller(o.YU); o.bot = roller(-o.YU);
    // brush cylinder
    o.cyl = new T.Group(); scene.add(o.cyl);
    P.at(P.cylZ(50, 112, c.mat("cyl")), 0, 0, 0, o.cyl);              // core z -56..56
    P.at(P.cylZ(9, 132, c.mat("cyl", "dark")), 0, 0, 0, o.cyl);       // shaft z -66..66
    [57, -57].forEach(function (z) {
      var b1 = P.box(92, 5, 1, c.mat("cyl", "dark")), b2 = P.box(5, 92, 1, c.mat("cyl", "dark"));
      P.at(b1, 0, 0, z, o.cyl); P.at(b2, 0, 0, z, o.cyl);
    });
    for (var i = 0; i < 12; i++) {
      var a0 = i * Math.PI / 6 + .05, a1 = a0 + .44, sh = new T.Shape();
      sh.absarc(0, 0, 76, a0, a1, false); sh.absarc(0, 0, 50, a1, a0, true);
      var g = new T.ExtrudeGeometry(sh, { depth: 116, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -58);
      o.cyl.add(new T.Mesh(g, c.mat("cyl", i === 0 ? "mark" : null)));
    }
    // cloth ribbon: live strip
    o.N = 60;
    var geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(new Float32Array(o.N * 2 * 3), 3));
    var idx = []; for (i = 0; i < o.N - 1; i++) { var k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    geo.setIndex(idx);
    o.ribbon = new T.Mesh(geo, c.mat("cloth")); o.ribbon.userData.live = true; o.ribbon.frustumCulled = false; scene.add(o.ribbon);
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, i, V = S.w * 40 * o.dir;               // cloth speed, positive = downwards
    var K = +S.controls.ratio, cth = 6;                                 // cloth thickness (exaggerated)
    var dA = V * dt * cth / Math.PI;                                    // change of radius squared
    var rt2 = o.rt * o.rt - dA, rb2 = o.rb * o.rb + dA;
    if (rt2 < (o.CORE + 1) * (o.CORE + 1) && o.dir > 0 || rb2 < (o.CORE + 1) * (o.CORE + 1) && o.dir < 0) { o.dir = -o.dir; V = -V; }
    else { o.rt = Math.sqrt(rt2); o.rb = Math.sqrt(rb2); }
    var rt = o.rt, rb = o.rb, rc = o.RC, Y = o.YU;
    o.top.cloth.scale.set(rt, 1, rt); o.bot.cloth.scale.set(rb, 1, rb);
    o.top.spin.rotation.z -= V / rt * dt; o.bot.spin.rotation.z -= V / rb * dt; o.cyl.rotation.z += K * V / rc * dt;
    // path: upper roller right side -> cylinder left -> lower roller right side
    var d = Y, a1 = Math.acos((rt + rc) / d), n1 = -Math.PI / 2 + a1;        // normal at upper roller (x>0)
    var p1 = [rt * Math.cos(n1), Y + rt * Math.sin(n1)], q1 = [-rc * Math.cos(n1), -rc * Math.sin(n1)];
    var a2 = Math.acos((rc + rb) / d), n2 = -Math.PI / 2 - a2;                // normal at cylinder (left)
    var q2 = [rc * Math.cos(n2), rc * Math.sin(n2)], p2 = [-rb * Math.cos(n2), -Y - rb * Math.sin(n2)];
    var ang0 = Math.atan2(q1[1], q1[0]), ang1 = Math.atan2(q2[1], q2[0]); if (ang1 < ang0) ang1 += 2 * Math.PI;
    var pts = [], nA = 36;
    pts.push(p1); pts.push(q1);
    for (i = 1; i < nA; i++) { var a = ang0 + (ang1 - ang0) * i / nA; pts.push([rc * Math.cos(a), rc * Math.sin(a)]); }
    pts.push(q2); pts.push(p2);
    var pos = o.ribbon.geometry.attributes.position, cnt = pts.length, W = 56;
    // resample into N points by index (cnt <= N)
    for (i = 0; i < o.N; i++) {
      var p = pts[Math.min(i, cnt - 1)];
      pos.setXYZ(2 * i, p[0], p[1], -W); pos.setXYZ(2 * i + 1, p[0], p[1], W);
    }
    pos.needsUpdate = true; o.ribbon.geometry.computeVertexNormals();
    function f(x) { return (Math.round(x) || 0) + " rpm"; }
    S.set("top", f(-V / rt * 9.549));
    S.set("bot", f(-V / rb * 9.549));
    S.set("cyl", f(K * V / rc * 9.549));
  }
});
