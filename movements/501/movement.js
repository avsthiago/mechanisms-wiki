M507.define({
  number: 501,
  title: "Mercury barometer",
  lede: "A bent glass tube holds a column of mercury, a heavy liquid metal. The air pressing on the open end holds the column up. When the air presses harder the column rises, so the tube shows changes in the weather.",
  alt: "A tall glass tube bent into a J. The long leg is closed at the top and has a scale beside its top end. The short leg is open at the top. Mercury fills the bend and rises much higher in the long leg than in the short one.",
  parts: [
    { key: "tube", color: "#4FA58A", name: "Glass tube", note: "A tube bent into a J. The long side is closed at the top and the short side is open to the air." },
    { key: "mercury", color: "#5E7387", name: "Mercury", note: "A liquid metal, more than thirteen times as heavy as water. Above it, at the top of the long side, there is no air at all." },
    { key: "scale", color: "#E8E2D0", name: "Scale", note: "Marks for reading the height of the column, in centimetres of mercury." }
  ],
  controls: [{ type: "range", id: "air", label: "Air pressure", min: 700, max: 1050, step: 1, value: 1013, unit: " hPa", pauseOnInput: true,
    presets: [[700, "Mountain top"], [965, "Storm"], [1013, "Normal"], [1040, "Fine"]] }],
  speed: false,
  readouts: [{ id: "p", label: "Air" }, { id: "h", label: "Column" }],
  views: { "3d": [226, 104, 468], front: [0, -15, 540], side: [540, -15, 30] },
  target: [8, -15, 0],
  how: [
    "Look at the two mercury surfaces. The one in the short side is open to the air, and the air pushes down on it. The one in the long side has nothing above it, not even air. So the air pushes the mercury round the bend and up the long side.",
    "The mercury climbs until its weight balances the push of the air. On a normal day that takes about 760 mm of mercury, measured from the lower surface to the upper one. When the air pushes harder the column grows, and when it pushes less the column sinks. Falling pressure often brings rain.",
    "Both surfaces move, by the same amount in opposite ways. So the marks on the scale are set half as far apart as real centimetres. Try Storm, then Fine. Then try Mountain top, where there is much less air above you."
  ],
  note: "This model is rebuilt from Brown's drawing. It is drawn to scale, so changes in the weather move the mercury only a little. The board, the clips and the width of the tube are made up, and the open end is shown with a cloth cover. Brown's scale is in inches; this one is in centimetres.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, k;
    var o = this.o = { K: .25, YS0: -85, YL0: 105, XL: 15, XS: -15, TOP: 125, STOP: -40, key: "", p: null };
    // centre line from the open end of the short side, round the bend, to the closed top of the long side
    var path = P.bendPath([[o.XS, o.STOP], [o.XS, -140], [o.XL, -140], [o.XL, o.TOP]], 15, 1.5);
    o.glass = P.pathTube({ path: path, radius: 4.5, material: c.mat("tube") }); scene.add(o.glass);           // glass z -4.5 .. 4.5
    o.merc = P.pathTube({ path: path, radius: 3, material: c.mat("mercury") }); scene.add(o.merc);
    o.L = o.glass.length;
    P.at(P.cylY(5.4, 6, c.mat("scale")), o.XS, o.STOP + 1, 0, scene);                                         // cloth cover over the open end, y -42 .. -36
    // board behind the tube: z -12 .. -8; clips z -8 .. -4.5 reach the back of the glass
    P.at(P.box(88, 290, 4, c.fixed), 16, -15, -10, scene);                                                    // x -28 .. 60, y -160 .. 130
    [[o.XL, 40], [o.XL, -60], [o.XS, -70]].forEach(function (q) { P.at(P.box(5, 6, 3.5, c.fixed), q[0], q[1], -6.25, scene); });
    // scale strip beside the top of the long side: x 21 .. 57, y 64 .. 118, z -8 .. -6 (on the board's face)
    P.at(P.box(36, 54, 2, c.mat("scale")), 39, 91, -7, scene);
    var ink = c.mat("scale", "dark");
    for (k = 500; k <= 800; k += 10) {
      var y = this.yLong(k), major = k % 50 === 0;
      P.at(P.box(major ? 9 : 5, major ? .8 : .45, .5, ink), 21 + (major ? 4.5 : 2.5), y, -5.25, scene);      // z -5.5 .. -5, .5 off the strip's face
      if (k % 100 === 0) P.at(P.label(String(k / 10), 10, c.ink), 45, y, -4, scene);
    }
  },

  yLong: function (h) { var o = this.o; return o.YL0 + (h * o.K - (o.YL0 - o.YS0)) / 2; },   // where the upper surface stands for a column of h mm

  opacity: function (key) { return key === "tube" ? .22 : 1; },

  step: function (c, dt, S) {
    var o = this.o;
    if (o.p === null) o.p = S.controls.air;
    if (S.playing) {                                        // the weather drifts between stormy and fine
      o.t = (o.t || 0) + dt;
      var aim = 1004 + 40 * Math.sin(o.t * .45);
      o.p += (aim - o.p) * Math.min(1, dt * 1.2);
      S.setControl("air", Math.round(o.p));
    } else o.p = S.controls.air;
    var h = o.p * .75006, d = (h * o.K - (o.YL0 - o.YS0)) / 2, ys = o.YS0 - d, yl = o.YL0 + d;   // mm of mercury for the pressure in hPa
    var key = ys.toFixed(2);
    if (key !== o.key) {
      o.key = key;
      o.merc.set(o.STOP - ys, o.L - (o.TOP - yl));        // distances along the tube: short side runs down from its open end
    }
    S.set("p", Math.round(o.p) + " hPa");
    S.set("h", Math.round(h) + " mm");
  }
});
