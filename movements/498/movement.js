M507.define({
  number: 498,
  title: "Siphon pressure gauge",
  lede: "A glass U-tube with mercury in its bend measures the pressure of steam. The steam pushes the mercury down on one side and up on the other. The difference in height tells you how hard the steam pushes.",
  alt: "A tall glass U-tube. Its left leg is joined at the top to a pipe with a tap that comes from a boiler. Its right leg is open at the top and has a scale beside it. Mercury fills the bend and stands higher in the right leg than in the left.",
  parts: [
    { key: "tube", color: "#4FA58A", name: "Glass tube", note: "A tube bent into a U. The left side is joined to the steam pipe and the right side is open to the air." },
    { key: "mercury", color: "#5E7387", name: "Mercury", note: "A liquid metal, more than thirteen times as heavy as water. Watch both of its surfaces move." },
    { key: "pipe", color: "#C8873A", name: "Pipe and tap", note: "Brings steam from the boiler to the top of the left side. The tap can shut it off." },
    { key: "scale", color: "#E8E2D0", name: "Scale", note: "Shows the pressure of the steam in kilopascals, read at the top of the mercury on the right." }
  ],
  controls: [{ type: "range", id: "p", label: "Steam pressure", min: 0, max: 60, step: 1, value: 40, unit: " kPa", pauseOnInput: true,
    presets: [[0, "None"], [20, "Low"], [40, "Medium"], [60, "High"]] }],
  speed: false,
  readouts: [{ id: "p", label: "Steam" }, { id: "h", label: "Level gap" }],
  views: { "3d": [221, 117, 538], front: [-30, -20, 600], side: [600, -20, 30] },
  target: [-30, -20, 0],
  how: [
    "With no steam, both sides of the U hold the mercury at the same level. Then the steam is let in at the top of the left side. It pushes the mercury down there, and the mercury climbs the right side, which only has air above it.",
    "The mercury stops when the extra weight of the taller side balances the push of the steam. The harder the steam pushes, the bigger the difference in height. This is the most exact gauge there is. But a boiler at ten times the pressure of the air would need a column about 7.6 m high, so it is only used for gentle pressures.",
    "One side drops as the other rises, so the marks on the scale are half as far apart as the real height. Try None, then High, and watch the two surfaces move by the same amount."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown's scale has the marks 0 to 6; here each mark stands for 10 kilopascals, and the model is drawn at half size. The board, the clips, the fittings and the tap's shape are made up. Real steam would turn to water at the top of the mercury; it is shown as a pale fill.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, k;
    var o = this.o = { K: .25, XL: -16, XR: 16, TL: 92, TR: 130, p: null, key: "" };   // K: model units of rise on each side per mm of height difference
    var path = P.bendPath([[o.XL, o.TL], [o.XL, -173], [o.XR, -173], [o.XR, o.TR]], 16, 1.5);   // bend bottom at y -173
    o.glass = P.pathTube({ path: path, radius: 4.5, caps: false, material: c.mat("tube") }); scene.add(o.glass);    // z -4.5 .. 4.5
    o.merc = P.pathTube({ path: path, radius: 3, material: c.mat("mercury") }); scene.add(o.merc);
    o.steam = P.pathTube({ path: path, radius: 2.9, material: new T.MeshBasicMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .28, depthWrite: false }) }); scene.add(o.steam);
    o.L = o.glass.length;
    // steam pipe: a sleeve over the top of the glass, an elbow, and a run to the left with a tap
    var pm = c.mat("pipe");
    P.at(P.cylY(7, 12, pm), o.XL, 94, 0, scene);                                                   // sleeve y 88 .. 100, the glass ends inside it
    scene.add(P.pathTube({ path: P.bendPath([[o.XL, 98], [o.XL, 112], [-150, 112]], 9, 2), radius: 5, material: pm }));
    [-40, -112].forEach(function (x) { P.at(P.cylX(7.5, 6, pm), x, 112, 0, scene); });               // unions
    P.at(P.cylY(9, 20, pm), -76, 112, 0, scene);                                                  // tap body y 102 .. 122
    P.at(P.cylY(2.5, 8, pm), -76, 126, 0, scene);                                                 // stem y 122 .. 130
    o.handle = P.at(P.box(20, 4, 5, pm), -76, 132, 0, scene);                                     // handle y 130 .. 134
    P.at(P.box(12, 6, 12, pm), -76, 99, 0, scene);                                                // plug end y 96 .. 102
    // board behind: x -48 .. 62, y -195 .. 140, z -12 .. -8; clips z -8 .. -4.5 touch the back of the glass
    P.at(P.box(110, 335, 4, c.fixed), 7, -27.5, -10, scene);
    [[o.XR, 60], [o.XR, -90], [o.XL, -90], [o.XL, 40]].forEach(function (q) { P.at(P.box(5, 6, 3.5, c.fixed), q[0], q[1], -6.25, scene); });
    // scale strip beside the right side: x 22 .. 58, y -8 .. 128, z -8 .. -6
    P.at(P.box(36, 136, 2, c.mat("scale")), 40, 60, -7, scene);
    var ink = c.mat("scale", "dark");
    for (k = 0; k <= 60; k += 2) {
      var y = this.rise(k), major = k % 10 === 0;
      P.at(P.box(major ? 9 : 5, major ? .9 : .5, .5, ink), 22 + (major ? 4.5 : 2.5), y, -5.25, scene);   // z -5.5 .. -5, lifted off the strip
      if (major) P.at(P.label(String(k), 10, c.ink), 45, y, -4, scene);
    }
    // the zero mark beside the left side
    P.at(P.box(18, 32, 2, c.mat("scale")), -36, 0, -7, scene);                                    // x -45 .. -27, y -16 .. 16
    P.at(P.box(9, .9, .5, ink), -31.5, 0, -5.25, scene);
    P.at(P.label("0", 10, c.ink), -40, 0, -4, scene);
  },

  rise: function (kpa) { return kpa * 1000 / (13595 * 9.81) * 1000 * this.o.K; },   // how far each surface moves for that pressure

  opacity: function (key) { return key === "tube" ? .22 : 1; },

  step: function (c, dt, S) {
    var o = this.o;
    if (o.p === null) o.p = S.controls.p;
    if (S.playing) {                                        // the boiler pressure rises and falls
      o.t = (o.t || 0) + dt;
      var aim = 30 + 28 * Math.sin(o.t * .5);
      o.p += (aim - o.p) * Math.min(1, dt * 1.5);
      S.setControl("p", Math.round(o.p));
    } else o.p = S.controls.p;
    var d = this.rise(o.p), yl = -d, yr = d;
    var key = d.toFixed(2);
    if (key !== o.key) {
      o.key = key;
      o.merc.set(o.TL - yl, o.L - (o.TR - yr));
      o.steam.set(0, o.TL - yl - .4);
    }
    S.set("p", Math.round(o.p) + " kPa");
    S.set("h", Math.round(o.p * 1000 / (13595 * 9.81) * 1000) + " mm");
  }
});
