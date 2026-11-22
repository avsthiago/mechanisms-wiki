M507.define({
  number: 321,
  title: "Harrison's going-barrel",
  lede: "A clock weight turns the great wheel through a spring. While you wind the weight up, the spring keeps pushing the wheel round. So the clock keeps going during winding, instead of stopping or running backwards.",
  alt: "A large toothed wheel. In front of it a big ratchet wheel with spokes and, in front of that, a smaller ratchet wheel on a barrel. A cord hangs from the barrel to a weight. A curved spring joins the big ratchet to the toothed wheel, and two catches drop into the ratchet teeth, one from the frame at the top.",
  parts: [
    { key: "great", color: "#5E7387", name: "Great wheel", note: "The big toothed wheel that drives the rest of the clock. It must never stop. Watch its dark spoke." },
    { key: "spring", color: "#C2503F", name: "Spring", note: "A bent spring. One end is pinned to the big ratchet and the other to the great wheel. It is what really pushes the great wheel round." },
    { key: "big", color: "#4FA58A", name: "Big ratchet wheel", note: "A spoked ratchet wheel between the great wheel and the barrel. The holding pawl at the top, a hooked bar, lets it turn forward but never back." },
    { key: "barrel", color: "#C8873A", name: "Barrel and small ratchet", note: "The cord is wound on the barrel. A key on the square end turns it back to wind the weight up." },
    { key: "clicks", color: "#D9B13B", name: "Pawls", note: "The long one hangs from the frame and holds the big ratchet wheel. This is the holding pawl. The short one rides on the big ratchet wheel and is pushed by the small ratchet wheel." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "Its pull turns the barrel forward. While winding, it is lifted off and pulls nothing round." }
  ],
  controls: [{ id: "mode", label: "Key", value: "run", options: [["run", "Let it run"], ["wind", "Wind"]] }],
  speed: { label: "Great wheel", min: 1, max: 4, value: 2 },
  readouts: [{ id: "g", label: "Great wheel" }, { id: "h", label: "Weight" }],
  views: { "3d": [492, 8, 1732], front: [20, -150, 1650], side: [1650, -150, 0] },
  target: [20, -150, 0],
  how: [
    "The weight hangs on a cord from the barrel. Its pull turns the barrel and the small ratchet. The small ratchet wheel pushes the short pawl, which is fixed to the big ratchet, so the big ratchet turns too. The big ratchet pulls the great wheel along through the bent spring.",
    "To wind, a key turns the barrel backwards. Now the weight pulls nothing round, and the spring tries to drag the big ratchet back. The long holding pawl from the frame stops it. So the spring, held at one end, keeps pushing the great wheel forward on its own. It only needs to last the minute or so that winding takes.",
    "Press Wind and watch the great wheel's readout: it does not change. The spring readout drops instead, as the spring gives up its push. Let it run again, and the weight soon winds the spring back up."
  ],
  note: "This model is rebuilt from Brown's drawing. The rest of the clock is left out; the great wheel simply turns at a steady speed while the spring still pushes it. The key, the clock plate and the stud for the long holding pawl were added. The great wheel is drawn as a ring on spokes in front, so the spring and ratchets behind it show. The springs that press the catches onto the teeth are left out. Sizes, tooth counts and how far the weight falls were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D = Math.PI / 180, k;
    var o = this.o = { G: 0, d0: 52 * D, rb: 90.5, U: 240, aS: 85 * D, aS2: 207 * D, aR: -22 * D, rR: 164, aT: 41 * D, rT: 326, eps: .002, T3: T };
    // clock plate x -270..300, y -255..285, z -40..-30; the arbor and the long holding pawl's stud start on its front face z = -30
    P.at(P.box(570, 540, 10, c.fixed), 15, 15, -35, scene);
    // great wheel, in front of everything: toothed ring (inside 215) z 50..58 on three spokes and a hub that turns loose on the arbor
    o.g = P.at(new T.Group(), 0, 0, 0, scene);
    P.at(P.spurGear({ teeth: 68, module: 7, width: 8, bore: 215, material: c.mat("great") }), 0, 0, 54, o.g);
    P.at(P.cylZ(22, 8, c.mat("great")), 0, 0, 54, o.g);
    for (k = 0; k < 3; k++) {
      var ga = (30 + 120 * k) * D, gs = P.box(196, 12, 7, c.mat("great", k ? null : "dark"));   // radius 20..216, ends inside the hub and the ring
      gs.position.set(118 * Math.cos(ga), 118 * Math.sin(ga), 54); gs.rotation.z = ga; o.g.add(gs);
    }
    P.at(P.cylZ(4, 21, c.mat("great")), 225 * Math.cos(o.aS2), 225 * Math.sin(o.aS2), 39.5, o.g);   // spring's pin, z 29..50, outside the big ratchet
    // big ratchet: ring z -4..4 (tips 198, roots 176, inside 152) on four spokes and a hub; spring's pin behind it, z -12..-4
    o.L = P.at(new T.Group(), 0, 0, 0, scene);
    o.Lr = P.at(P.ratchet({ teeth: 26, radius: 194, depth: 14, width: 8, bore: 152, reverse: true, tip: 2, material: c.mat("big") }), 0, 0, 0, o.L);
    P.at(P.cylZ(24, 8, c.mat("big")), 0, 0, 0, o.L);
    for (k = 0; k < 4; k++) {
      var a = (45 + 90 * k) * D, sp = P.box(132, 14, 8, c.mat("big"));       // radius 21.5..153.5, ends inside the hub and the ring
      sp.position.set(87.5 * Math.cos(a), 87.5 * Math.sin(a), 0); sp.rotation.z = a; o.L.add(sp);
    }
    P.at(P.cylZ(4, 29, c.mat("big")), 165 * Math.cos(o.aS), 165 * Math.sin(o.aS), 18.5, o.L);   // spring's pin, z 4..33, on the ring's front face
    // short pawl on the big ratchet: hub z 4..15 sits on the ring's front face, body 5..14 in the small ratchet's plane
    o.R = P.pawl({ length: 126, thick: 8, width: 7.4, side: 1, material: c.mat("clicks") });
    P.at(o.R, o.rR * Math.cos(o.aR), o.rR * Math.sin(o.aR), 9.5, o.L);
    // barrel group: small ratchet z 6..14 (tips 128, roots 112), barrel 14..40, flange 40..43, arbor -30..66 (through the great wheel's hub), square 66..74
    o.B = P.at(new T.Group(), 0, 0, 0, scene);
    o.Sr = P.at(P.ratchet({ teeth: 22, radius: 126, depth: 11, width: 8, tip: 2, material: c.mat("barrel") }), 0, 0, 10, o.B);
    P.at(P.cylZ(88, 26, c.mat("barrel")), 0, 0, 27, o.B);
    P.at(P.cylZ(97, 3, c.mat("barrel")), 0, 0, 41.5, o.B);
    P.at(P.cylZ(10, 96, c.mat("barrel", "dark")), 0, 0, 18, o.B);
    P.at(P.box(20, 20, 8, c.mat("barrel", "dark")), 0, 0, 70, o.B);
    // long holding pawl from the frame: stud z -30..-4.3 at radius 326, hub z -4.3..4.3, body -3.3..3.3, inside the big ratchet (z -4..4) so no faces share a plane
    var tx = o.rT * Math.cos(o.aT), ty = o.rT * Math.sin(o.aT);
    P.at(P.cylZ(5, 25.7, c.fixed), tx, ty, -17.15, scene);
    o.T = P.at(P.pawl({ length: 335, thick: 12, width: 6.6, side: -1, material: c.mat("clicks") }), tx, ty, 0, scene);
    // spring: a bent strip from its pin on the big ratchet to its pin on the great wheel, in the plane z 31, between the barrel's flange and the great wheel
    o.spring = P.at(P.mesh(new T.BufferGeometry(), c.mat("spring")), 0, 0, 0, scene); o.spring.userData.live = true;
    // cord (wound part on the barrel and the hanging part, at z 22) and the weight
    o.cord = P.at(P.ropePath({ tube: 2.5, material: c.mat("weight", "dark") }), 0, 0, 0, scene);
    o.W = P.at(new T.Group(), -o.rb, 0, 22, scene);
    P.at(P.hook({ radius: 6, tube: 2, material: c.mat("weight") }), 0, 6, 0, o.W);   // ring y -2..14, bottom sunk into the weight's top
    P.at(P.box(160, 90, 50, c.mat("weight")), 0, -45, 0, o.W);             // top face y 0
    // start: weight wound up, short pawl resting on a tooth face, spring wound to its working push
    o.rimR = 115; o.rimT = 180;
    o.nR0 = o.aR - o.R.reach(o.rR, 115); o.nT0 = o.aT + o.T.reach(o.rT, 180);
    o.stS = 2 * Math.PI / 22; o.stL = 2 * Math.PI / 26;
    o.Lth = o.d0; o.Bth = o.Lth + o.nR0 - o.eps; o.Btop = o.Bth;
    this.place();
  },

  place: function () {
    var o = this.o, T = o.T3, k;
    o.g.rotation.z = o.G; o.L.rotation.z = o.Lth; o.B.rotation.z = o.Bth;
    // short pawl, in the big ratchet's frame: its nose rides on the small ratchet
    var psi = o.Bth - o.Lth, r = o.rimR, an;
    for (k = 0; k < 3; k++) { an = o.aR - o.R.reach(o.rR, r); r = o.Sr.rimAt(an - psi); }
    o.rimR = r; an = o.aR - o.R.reach(o.rR, r);
    o.R.rotation.z = Math.atan2(r * Math.sin(an) - o.rR * Math.sin(o.aR), r * Math.cos(an) - o.rR * Math.cos(o.aR));
    // long holding pawl: its nose rides on the big ratchet
    r = o.rimT;
    for (k = 0; k < 3; k++) { an = o.aT + o.T.reach(o.rT, r); r = o.Lr.rimAt(an - o.Lth); }
    o.rimT = r; an = o.aT + o.T.reach(o.rT, r);
    o.T.rotation.z = Math.atan2(r * Math.sin(an) - o.rT * Math.sin(o.aT), r * Math.cos(an) - o.rT * Math.cos(o.aT));
    // spring from its pin on the big ratchet to its pin on the great wheel, bowing in towards the barrel
    var A1 = o.Lth + o.aS, A2 = o.G + o.aS2, pts = [];
    for (k = 0; k <= 24; k++) {
      var t = k / 24, a = A1 + (A2 - A1) * t, rad = 165 + 60 * t - 85 * Math.sin(Math.PI * t);
      pts.push(new T.Vector3(rad * Math.cos(a), rad * Math.sin(a), 31));
    }
    o.spring.geometry.dispose();
    o.spring.geometry = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 64, 3.5, 8, false);
    // cord: wound on the barrel up to its left side, then straight down to the weight's ring
    var drop = o.rb * (o.Bth - o.Btop), yTop = -262 - drop;
    o.W.position.y = yTop;
    o.cord.set([{ c: [0, 0, 22], r: o.rb, a0: Math.PI - (o.U + 25 - drop) / o.rb, a1: Math.PI }, [-o.rb, yTop + 12, 22]]);
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w, fast = 6 * w * dt, G0 = o.G;
    // the great wheel goes on at the clock's pace for as long as the spring still pushes it
    o.G += Math.min(w * dt, Math.max(0, o.Lth - o.G));
    if (S.controls.mode === "run") {
      var room = o.Btop + o.U / o.rb - o.Bth;                              // how far the weight can still fall
      var kk = Math.floor((o.nR0 - o.eps - (o.Bth - o.Lth)) / o.stS + 1e-9);
      var gap = o.nR0 - o.eps - kk * o.stS - (o.Bth - o.Lth);             // barrel turns alone until a tooth meets the short pawl
      var budget = Math.min(fast, room), free = Math.min(gap, budget);
      o.Bth += free; budget -= free;
      if (gap - free < 1e-9) {                                            // caught: the weight drives the big ratchet and winds the spring
        var mv = Math.max(0, Math.min(budget, o.G + o.d0 - o.Lth));
        o.Lth += mv; o.Bth += mv;
      }
    } else {
      // the spring pulls the big ratchet back until a tooth rests on the long holding pawl; the key winds the barrel back
      var m = Math.floor((o.Lth - o.nT0 - o.eps) / o.stL + 1e-9), Lf = o.nT0 + o.eps + m * o.stL;
      var psiF = o.nR0 - o.eps - Math.floor((o.nR0 - o.eps - (o.Bth - o.Lth)) / o.stS + 1e-9) * o.stS;
      o.Lth -= Math.min(fast, Math.max(0, o.Lth - Math.max(Lf, o.G)));   // a slack spring no longer pulls it back
      o.Bth -= Math.min(fast, Math.max(0, o.Bth - o.Btop));
      if (o.Bth - o.Lth > psiF) o.Bth = o.Lth + psiF;                     // the short pawl drags the barrel back with it
    }
    this.place();
    if (dt > 0) S.set("g", (Math.round((o.G - G0) / dt * 300 / Math.PI) / 10) + " rpm");
    S.set("h", Math.round((o.U - o.rb * (o.Bth - o.Btop)) / 10) + " cm");
  }
});
