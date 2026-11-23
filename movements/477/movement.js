M507.define({
  number: 477,
  title: "Diaphragm steam trap",
  lede: "Steam in a heating pipe slowly turns into water, and the water must be let out. This box lets the water out but keeps the steam in. A sealed valve full of liquid swells when steam reaches it and shrinks when water does.",
  alt: "A round box cut open down the middle, with a pipe coming in at the top and one going out at the bottom. Inside, a hollow valve with a long stem hangs in the top pipe. Its wide bottom is a thin bowed sheet that rests on a bar across the outlet.",
  parts: [
    { key: "box", color: "#5E7387", name: "Box", note: "The water and steam come in through the top pipe and leave through the pipe at the bottom. The ring under the top pipe is the seat the valve closes against." },
    { key: "valve", color: "#C8873A", name: "Hollow valve", note: "Sealed shut and filled with liquid. Its long stem reaches up into the top pipe, where it feels whether steam or water is there." },
    { key: "skin", color: "#C2503F", name: "Flexible bottom", note: "A thin sheet that closes the bottom of the valve and rests on the bar across the outlet. Watch it bow down as the liquid warms, lifting the valve." },
    { key: "bar", color: "#4FA58A", name: "Bar", note: "A bridge across the mouth of the outlet pipe. The valve stands on it, and water runs out past it." }
  ],
  controls: [{ id: "cond", label: "Water made in the pipes", value: "little", options: [["little", "A little"], ["lots", "A lot"]] }],
  speed: false,
  readouts: [{ id: "g", label: "Valve" }, { id: "t", label: "Liquid" }],
  closed: { label: "Box" },
  views: { "3d": [130, 70, 440], front: [0, 18, 520], side: [520, 18, 0] },
  target: [0, 18, 0],
  how: [
    "Steam comes in at the top. While steam fills the box, the valve is pushed up against the ring and nothing can get out. Water that comes in collects in the top pipe, around the valve's stem. Watch it rise.",
    "The liquid sealed in the valve grows when it is hot and shrinks when it cools. Hot, it bows the thin bottom down onto the bar and lifts the valve shut. Water is cooler than steam, so as water piles up round the stem the liquid shrinks. The valve sinks, and the water runs past it and out at the bottom. When steam follows, the valve warms and shuts again.",
    "Try a little water, then a lot. Watch how often the valve opens. Choose Closed to see the trap as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front half is cut away so the inside shows, as in the engraving. The swelling of the bottom sheet and the movement of the valve are much bigger than in a real trap, so you can see them. The temperatures, timings and sizes are made up. The dots show the steam and the water.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { T: 1, sb: 1, hA: 0, t: 0, vy: 0, b: 8.5 };
    var water = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .45, depthWrite: false, side: T.DoubleSide });
    // box, cover and top pipe in one section: box r 62 .. 68, floor y -80 .. -74, cover y 25 .. 37, seat ring r 16 .. 26 down to y 15,
    // top pipe bore 16 up to y 140, outlet bore 12 from y -110 up to y -52
    var bx = [[12, -110], [17, -110], [17, -80], [68, -80], [68, 25], [80, 25], [80, 37], [26, 37], [26, 140], [16, 140], [16, 15], [26, 15], [26, 25], [62, 25], [62, -74], [17, -74], [17, -52], [12, -52]];
    scene.add(c.shell(P.halfSection({ poly: bx, steps: 32, material: c.mat("box") }), "open"));
    scene.add(c.shell(P.wholeSection({ poly: bx, material: c.mat("box") }), "closed"));   // closed view: the whole box
    P.at(P.box(40, 4, 5, c.mat("bar")), 0, -49.5, -2.7, scene);   // bar across the outlet: x -20 .. 20, y -52 .. -48, z -5 .. 0, sits on the outlet's top at y -52
    // valve: a group moved up and down; local y 0 is the shut position
    o.valve = P.at(new T.Group(), 0, 0, 0, scene); o.valve.position.z = .4;
    o.valve.add(P.halfSection({ poly: [[0, 135], [10, 135], [10, 15.5], [22, 15.5], [22, 8], [12, -8], [12, -22], [45, -30], [45, -38], [42, -38], [42, -32], [9, -24], [9, -8], [19, 7], [19, 12], [7, 12], [7, 132], [0, 132]], material: c.mat("valve") }));
    o.skin = P.halfSection({ poly: this.skin(8.5, 0), material: c.mat("skin") }); o.valve.add(o.skin);
    o.liq = P.halfSection({ poly: this.skin(8.5, 1), material: water }); o.valve.add(o.liq);
    // water standing in the top pipe and in the bottom of the box
    o.colA = P.halfSection({ poly: [[10.5, 15], [15.5, 15], [15.5, 16], [10.5, 16]], material: water }); scene.add(c.fluid(o.colA));
    scene.add(c.fluid(P.halfSection({ poly: [[17.5, -73.5], [61.5, -73.5], [61.5, -52.5], [17.5, -52.5]], material: water })));
    // dots: steam in the box and pipe, drops falling
    o.steam = P.waterDots(110, { radius: 2.4, color: "#8C99A5", opacity: .75 }); scene.add(o.steam);
    o.sd = []; for (i = 0; i < 110; i++) {
      var y, r;
      if (i >= 80) { y = Math.random(); r = 13; }                                // steam in the top pipe, above the water
      else if (i % 2) { r = 47 + Math.random() * 13; y = -50 + Math.random() * 72; }   // beside the valve
      else { r = 24 + Math.random() * 20; y = -16 + Math.random() * 38; }             // above the valve's wide bottom
      o.sd.push({ y: y, r: r, a: Math.PI + Math.random() * Math.PI, ph: Math.random() * 6.28 });
    }
    o.drops = P.waterDots(60, { radius: 2.2, color: c.spot }); scene.add(o.drops);
    o.dp = []; for (i = 0; i < 60; i++) o.dp.push({ on: false, x: 0, y: 0, z: 0, v: 0 });
    o.acc = 0; o.next = 0;
  },

  skin: function (b, liquid) {    // outline of the flexible bottom (or of the liquid above it) when it bows down by b
    var top = [], bot = [], k;
    for (k = 0; k <= 12; k++) { var r = 45 - 45 * k / 12, y = -38 - b * (1 - (r / 45) * (r / 45)); top.push([liquid ? Math.min(r, 41.5) : r, y + (liquid ? .5 : 0)]); bot.push([r, y - 1.5]); }
    if (liquid) return [[0, 131.5], [6.5, 131.5], [6.5, 11.5], [18.5, 11.5], [18.5, 7], [8.5, -8], [8.5, -24.5], [41.5, -32.5], [41.5, -37.5]].concat(top.slice(1));
    return top.concat(bot.reverse());
  },

  step: function (c, dt, S) {
    var o = this.o, run = S.playing && dt > 0, lots = S.controls.cond === "lots", i;
    if (run) {
      o.t += dt;
      var gap = Math.max(0, -o.vy);
      o.hA = Math.min(120, o.hA + (lots ? 5 : 2) * dt);                          // water arriving from the heating pipes
      var drain = Math.min(o.hA, 9 * gap * dt); o.hA -= drain;
      var blow = gap > .3 && o.hA < .5;                                          // the water is gone, so steam follows it
      o.sb += (blow ? (1 - o.sb) * 3 : -o.sb * .3) * dt;                         // steam in the box, slowly turning to water when shut in
      var cover = Math.min(1, o.hA / 50), env = .25 + .75 * o.sb * (1 - .8 * cover);
      o.T += (env - o.T) * Math.min(1, dt / 1.6);
      o.acc += drain * 1.2;
      while (o.acc >= 1) {                                                       // drops that fall off the edge of the valve
        o.acc -= 1; var d = o.dp[o.next]; o.next = (o.next + 1) % o.dp.length;
        var a = Math.PI + Math.random() * Math.PI; d.on = true; d.x = 47 * Math.cos(a); d.z = 47 * Math.sin(a) * .7 - 1; d.y = -34; d.v = 0; d.out = false;
      }
      o.dp.forEach(function (d) {
        if (!d.on) return;
        d.v += 300 * dt; d.y -= d.v * dt;
        if (!d.out && d.y < -52) { d.out = true; d.x = (Math.random() - .5) * 18; d.z = -Math.random() * 9; d.y = -56; d.v = 40; }   // runs under the bar and down the outlet
        if (d.y < -128) d.on = false;                                          // falls 18 out of the outlet's open end
      });
    }
    // the bottom bows by b; the valve stands on the bar, but cannot rise past the seat
    o.b = 2.5 + 7.5 * o.T;
    o.vy = Math.min(0, o.b - 8.5);                // centre of the sheet's underside, -39.5 - b + vy, stays on the bar's top at y -48
    o.valve.position.y = o.vy;
    var bb = Math.min(o.b, 8.5);                   // when shut, the seat holds the valve and the sheet cannot bow further
    o.skin.set(this.skin(bb, 0)); o.liq.set(this.skin(bb, 1));
    o.colA.set([[10.5, 15 + o.vy], [15.5, 15 + o.vy], [15.5, 15.2 + o.vy + o.hA], [10.5, 15.2 + o.vy + o.hA]]);
    o.colA.visible = o.hA > .3;
    var nb = Math.round(80 * o.sb), top = 15 + o.hA;
    o.sd.forEach(function (s, n) {
      var x, y, z, sc;
      if (n < 80) { y = s.y + 2 * Math.sin(o.t * 2 + s.ph); x = s.r * Math.cos(s.a); z = s.r * Math.sin(s.a) * .9 - 1; sc = n < nb ? 1 : 0; }
      else { y = top + 3 + (s.y * (140 - top - 6)); y = Math.min(137, y); x = (n % 2 ? 13 : -13); z = -2 - (n % 3); sc = top < 134 ? .8 : 0; }
      o.steam.put(n, x, y, z, sc);
    });
    o.steam.flush();
    o.dp.forEach(function (d, n) { o.drops.put(n, d.x, d.y, d.z, d.on ? 1 : 0); });
    o.drops.flush();
    S.set("g", (Math.round(-o.vy * 5) / 10) + " mm");
    S.set("t", Math.round(80 + 20 * o.T) + " °C");
  }
});
