M507.define({
  number: 129,
  title: "Chinese windlass",
  lede: "A rope winds onto the thick part of a barrel while it unwinds from the thin part. A pulley with a hook hangs in the loop of rope between them. The hook rises only a little for each turn of the handle, so it can lift a very heavy load.",
  alt: "A barrel with a thick half and a thin half turns between two upright posts. One rope runs from the thick half down under a pulley with a hook and back up to the thin half.",
  parts: [
    { key: "handle", color: "#5E7387", name: "Handle", note: "A crank fixed to the end of the barrel. Turn it and the whole barrel turns." },
    { key: "barrel", color: "#C8873A", name: "Barrel", note: "One thick half and one thin half on the same axle, so both turn together. Rope is wound on both." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One rope. It winds onto the thick half and off the thin half, and the loop between them holds the pulley." },
    { key: "pulley", color: "#4FA58A", name: "Pulley", note: "A wheel hanging in the loop. It spins slowly as the two sides of the rope move in opposite directions." },
    { key: "block", color: "#C2503F", name: "Hook", note: "The frame under the pulley, with a hook for the load. Watch how slowly it rises." }
  ],
  controls: [{ id: "small", label: "Thin half of the barrel", value: "18", options: [["27", "Almost as thick"], ["22", "A little thinner"], ["18", "Thinner"], ["12", "Much thinner"]] }],
  readouts: [{ id: "t", label: "Handle" }, { id: "h", label: "Hook rise" }],
  views: { front: [0, -120, 760], "3d": [290, -40, 500], side: [680, -120, 0] },
  target: [0, -105, 0],
  distance: [250, 1300],
  how: [
    "Turn the handle. The barrel turns and the rope winds onto the thick half. At the same moment it unwinds from the thin half. The pulley hangs in the loop between them, so it is pulled up.",
    "The thick half takes in more rope than the thin half lets out. The loop gets shorter by the difference, and that shortening is shared by its two sides. So the hook rises by half the difference between the two lengths of rope for each turn.",
    "A small rise for each turn means a small hand force can lift a big load. Try the thin half Almost as thick, then Much thinner, and watch the hook rise and the number of turns."
  ],
  note: "This model is rebuilt from Brown's drawing. The two posts, the base, the crank and the sizes were made up. Brown shows no handle. The rope coils on the barrel stay the same as it turns; only the lengths of rope that hang down are worked out. The rope leans slightly from the barrel to the middle of the pulley. The turns shown are chosen so the hook stays clear of the barrel.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { R1: 30, XL: -52, XR: 56, XC: 2, RP: 54, YC0: -170, RISE: 66, h: 0, u: 0, rights: {} };
    var R1 = o.R1, m = c.mat("barrel"), mr = c.mat("rope");
    o.spin = new T.Group(); scene.add(o.spin);
    var s = o.spin;
    P.at(P.cylX(6, 226, m), 0, 0, 0, s);                                  // axle x -113..113, ends on the upright faces
    P.at(P.cylX(R1, 64, m), -49, 0, 0, s);                                // thick half x -81..-17
    P.at(P.cylX(R1 + 12, 4, m), -83, 0, 0, s);                            // outer flange x -85..-81, radius 42
    P.at(P.cylX(R1 + 12, 4, m), -15, 0, 0, s);                            // middle flange x -17..-13
    P.at(P.cylX(8, 47, m), 10.5, 0, 0, s);                                // thin shaft x -13..34
    P.at(P.box(.5, 30, 6, c.mat("barrel", "mark")), -85.25, 26, 0, s);    // red stripe on the outer face, x -85.5..-85 (lifted off the face at -85)
    for (var k = 0; k < 12; k++) P.at(rotY(P.hoop(R1 + 2.2, 2.2, mr)), -78.6 + k * 4.8, 0, 0, s);   // rope coils x -80.8..-23.8
    [27, 22, 18, 12].forEach(function (r2) {
      var g = new T.Group(); s.add(g);
      P.at(P.cylX(r2, 44, m), 56, 0, 0, g);                               // thin half x 34..78
      P.at(P.cylX(r2 + 12, 4, m), 80, 0, 0, g);                           // flange x 78..82
      for (var j = 0; j < 9; j++) P.at(rotY(P.hoop(r2 + 2.2, 2.2, mr)), 36.6 + j * 4.8, 0, 0, g);   // coils x 34.4..77.0
      g.visible = false; o.rights[r2] = g;
    });
    function rotY(h) { h.rotation.y = Math.PI / 2; return h; }
    // crank between the barrel flange and the right upright
    var mh = c.mat("handle");
    P.at(P.cylX(9, 10, mh), 97, 0, 0, s);                                 // hub x 92..102
    P.at(P.box(6, 64, 8, mh), 97, 32, 0, s);                              // arm x 94..100, y 0..64
    P.at(P.cylX(5, 14, mh), 101, 64, 0, s);                               // knob x 94..108
    P.at(P.box(.5, 40, 3, c.mat("handle", "dark")), 100.25, 35, 0, s);    // stripe on the arm face x 100..100.5
    // frame
    P.at(P.box(8, 366, 50, c.fixed), -117, -113, 0, scene);               // left upright x -121..-113, y -296..70
    P.at(P.box(8, 366, 50, c.fixed), 117, -113, 0, scene);                // right upright x 113..121, y -296..70
    P.at(P.box(300, 8, 100, c.fixed), 0, -300, 0, scene);                 // base x -150..150, y -304..-296; uprights stand on -296
    // pulley block
    o.blk = new T.Group(); scene.add(o.blk);
    o.pul = P.at(P.sheave({ radius: o.RP, material: c.mat("pulley"), holes: c.mat("pulley", "dark") }), 0, 0, 0, o.blk);
    P.at(P.ropeBlock({ radius: o.RP, up: false, strap: 10, material: c.mat("block") }), 0, 0, 0, o.blk);
    // rope
    o.wrap = P.arc(o.RP, 2.2, Math.PI, mr); o.wrap.rotation.z = Math.PI; o.blk.add(o.wrap);   // lower half of the pulley rim
    o.wrap.position.x = 0;
    o.L = P.rod(2.2, mr); scene.add(o.L);
    o.Rr = P.rod(2.2, mr); scene.add(o.Rr);
  },

  step: function (c, dt, S) {
    var o = this.o, R1 = o.R1, R2 = +S.controls.small || 18, RP = o.RP, k;
    if (S.playing) o.u += S.w * dt;
    var want = o.RISE * (1 - Math.cos(o.u)) / 2;
    o.h += (want - o.h) * Math.min(1, dt * 8);
    if (Math.abs(want - o.h) < .01) o.h = want;
    var n = o.h / (Math.PI * (R1 - R2));                                   // handle turns so far
    for (k in o.rights) o.rights[k].visible = +k === R2;
    o.spin.rotation.x = -n * 2 * Math.PI;                                  // rope on the front of the thick half goes up
    var yc = o.YC0 + o.h;
    o.blk.position.set(o.XC, yc, 0);
    o.pul.rotation.z = -(R1 + R2) * Math.PI * n / RP;                      // left side up, right side down: clockwise
    var d = -yc, e1 = R1 + 2.2, e2 = R2 + 2.2, f1 = Math.acos(e1 / d), f2 = Math.acos(e2 / d);
    o.L.span(o.XL, -e1 * Math.cos(f1), e1 * Math.sin(f1), o.XL, yc, 0);    // from the front of the thick half to the pulley's left side
    o.Rr.span(o.XR, -e2 * Math.cos(f2), -e2 * Math.sin(f2), o.XR, yc, 0);  // from the back of the thin half to the pulley's right side
    S.set("t", n.toFixed(1) + " turns");
    S.set("h", o.h.toFixed(0) + " mm");
  }
});
