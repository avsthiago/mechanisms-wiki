M507.define({
  number: 352,
  title: "Chinese windlass, second form",
  lede: "One rope winds onto the thick part of a barrel and off the thin part. It runs up over two small pulleys and down to a hanging weight. A little turn of the handle shortens the rope a little, and the weight rises.",
  alt: "A tall A-shaped frame. Inside it a barrel with a thick half and a thin half turns on a level shaft. A rope goes up from each half to a small pulley hung on each leg, then slopes down to a small pulley that carries a bell-shaped weight.",
  parts: [
    { key: "handle", color: "#5E7387", name: "Handle", note: "A bar through the thick half of the barrel. Turn it and the whole barrel turns." },
    { key: "barrel", color: "#C8873A", name: "Barrel", note: "One thick half and one thin half on the same shaft, so both turn together. The rope is wound on both." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "One rope. It winds onto the thick half and off the thin half. The rest of it forms a loop that holds the weight." },
    { key: "pulley", color: "#4FA58A", name: "Pulleys", note: "Two small wheels hung from the frame and one that hangs in the loop. They turn as the rope runs over them." },
    { key: "weight", color: "#8E7AA8", name: "Weight", note: "A bell-shaped weight hung from the small pulley. Watch it rise." }
  ],
  controls: [{ id: "small", label: "Thin half of the barrel", value: "14", options: [["22", "Almost as thick"], ["18", "A little thinner"], ["14", "Thinner"], ["8", "Much thinner"]] }],
  readouts: [{ id: "t", label: "Handle" }, { id: "h", label: "Weight rise" }],
  views: { "3d": [420, 200, 700], front: [0, 90, 880], side: [880, 90, 0] },
  target: [0, 90, 0],
  distance: [260, 1600],
  how: [
    "Turn the handle. The barrel turns. The rope winds onto the thick half and unwinds from the thin half. The thick half takes in more rope than the thin half lets out, so the loop that holds the weight gets shorter.",
    "The two sloping parts of the rope each get shorter by half of that difference. As they shorten, the weight is pulled up towards the two pulleys. The flatter the rope becomes, the faster the weight rises for each turn, and the harder the rope has to pull.",
    "A small difference between the halves means a small shortening for each turn. Try the thin half Almost as thick, then Much thinner, and watch the turns the handle needs for the same rise."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame's feet, the base, the posts that hold the shaft, the handle and all the sizes were made up. The rope slopes a little more steeply than in the drawing, so the weight has room to rise. Brown shows two short chains near the weight; here it is one plain rope with a small pulley.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene;
    var o = this.o = { R1: 27, XP: 46, YP: 151, RF: 9, RH: 7, YC0: 119, RISE: 20, u: 0, n: 0, rights: {} };
    var R1 = o.R1, m = c.mat("barrel"), mr = c.mat("rope");
    o.spin = new T.Group(); scene.add(o.spin);
    var s = o.spin;
    P.at(P.cylX(5, 316, m), 0, 0, 0, s);                                  // shaft x -158..158, ends on the post faces
    P.at(P.cylX(R1, 100, m), -45, 0, 0, s);                               // thick half x -95..5
    P.at(P.cylX(R1 + 12, 4, m), -97, 0, 0, s);                            // end plate x -99..-95, radius 39
    P.at(P.box(1, 26, 5, c.mat("barrel", "dark")), -99.5, 24, 0, s);      // dark stripe x -100..-99 on the plate face (lifted 0 to 1)
    for (var k = 0; k < 7; k++) P.at(rotY(P.hoop(R1 + 2.2, 2.2, mr)), -55 + (k - 3) * 4.8, 0, 0, s);   // coils x -69.4..-40.6
    [22, 18, 14, 8].forEach(function (r2) {
      var g = new T.Group(); s.add(g);
      P.at(P.cylX(r2, 72, m), 41, 0, 0, g);                               // thin half x 5..77
      P.at(P.cylX(r2 + 10, 4, m), 79, 0, 0, g);                           // end plate x 77..81
      for (var j = 0; j < 5; j++) P.at(rotY(P.hoop(r2 + 2.2, 2.2, mr)), 55 + (j - 2) * 4.8, 0, 0, g);   // coils x 45.4..64.6
      g.visible = false; o.rights[r2] = g;
    });
    function rotY(h) { h.rotation.y = Math.PI / 2; return h; }
    var mh = c.mat("handle");
    P.at(P.box(7, 120, 7, mh), -85, 0, 0, s);                             // handle bar x -88.5..-81.5, y -60..60, through the thick half
    P.at(P.sphere(6, mh), -85, 60, 0, s); P.at(P.sphere(6, mh), -85, -60, 0, s);   // knobs
    P.at(P.box(.8, 50, 3, c.mat("handle", "dark")), -88.9, 30, 0, s);     // stripe on the bar face x -89.3..-88.5 (lifted off -88.5)
    // frame: two legs side by side in z -52..-38, behind the barrel; centre lines from (+-143, -69) to (+-20, 237)
    var th = Math.atan2(123, 306), len = 330, ang;
    [-1, 1].forEach(function (sd) {
      var leg = P.box(16, len, 14, c.fixed);
      leg.position.set(sd * (143 - 61.5), -66 + 153, -45);   // box centre: foot corner sits on y -69
      leg.rotation.z = sd * th; scene.add(leg);
    });
    P.at(P.box(88, 26, 14, c.fixed), 0, 252, -45, scene);                 // crown x -44..44, y 239..265, z -52..-38
    P.at(P.box(380, 12, 120, c.fixed), 0, -75, -20, scene);               // base x -190..190, y -81..-69, z -80..40; feet and posts stand on -69
    P.at(P.box(8, 83, 16, c.fixed), -162, -27.5, 0, scene);               // left post x -166..-158, y -69..14, z -8..8; shaft ends at -158
    P.at(P.box(8, 83, 16, c.fixed), 162, -27.5, 0, scene);                // right post x 158..166
    // fixed pulleys on short arms from the legs (arm z -38..-4 touches the pulley back at -4)
    o.fix = [];
    [-1, 1].forEach(function (sd) {
      var p = P.at(P.sheave({ radius: o.RF, width: 8, material: c.mat("pulley"), holes: c.mat("pulley", "dark") }), sd * o.XP, o.YP, 0, scene);
      P.at(P.cylZ(2.5, 9, c.mat("pulley")), 0, 0, 0.5, p);                // pin z -4..5
      P.at(P.box(8, 8, 34, c.fixed), sd * o.XP, o.YP, -21, scene);        // arm z -38..-4
      o.fix.push(p);
    });
    // hanging pulley and bell
    o.blk = new T.Group(); scene.add(o.blk);
    o.hp = P.at(P.sheave({ radius: o.RH, width: 6, material: c.mat("pulley"), holes: c.mat("pulley", "dark") }), 0, 0, 0, o.blk);
    P.at(P.cylZ(2, 10, c.mat("weight")), 0, 0, 0, o.blk);                 // pin z -5..5
    P.at(P.cylY(1.8, 12, c.mat("weight")), 0, -10, 0, o.blk);             // rod y -16..-4
    P.at(P.hook({ radius: 5, tube: 1.6, material: c.mat("weight") }), 0, -20, 0, o.blk);   // ring y -26.6..-13.4
    P.at(P.sphere(8, c.mat("weight")), 0, -31, 0, o.blk);
    P.at(new T.Mesh(new T.CylinderGeometry(8, 22, 48, 28), c.mat("weight")), 0, -55, 0, o.blk);   // bell y -79..-31
    // ropes
    o.wrapF = [P.arc(o.RF, 2.2, 1, mr), P.arc(o.RF, 2.2, 1, mr)];
    o.wrapH = P.arc(o.RH, 2.2, 1, mr);
    o.wrapF.forEach(function (w) { scene.add(w); w.userData.live = true; });
    o.wrapH.userData.live = true; o.blk.add(o.wrapH);
    o.vert = [P.rod(2.2, mr), P.rod(2.2, mr)]; o.diag = [P.rod(2.2, mr), P.rod(2.2, mr)];
    o.vert.concat(o.diag).forEach(function (r) { scene.add(r); });
    this.o.free0 = this.geo(o, o.YC0).free;
  },

  // Rope geometry for a hanging pulley centre at height yc (left and right sides are mirror images).
  geo: function (o, yc) {
    var d = o.YP - yc, rho = Math.sqrt(o.XP * o.XP + d * d), sr = o.RF + o.RH, beta = Math.atan2(d, o.XP);
    var th = beta + Math.asin(sr / rho), L = Math.sqrt(rho * rho - sr * sr);
    return { th: th, L: L, free: 2 * (o.RF * (Math.PI / 2 + th) + L + o.RH * th) };
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, R1 = o.R1, R2 = +S.controls.small || 14, k;
    if (S.playing) o.u += S.w * dt;
    var yc = o.YC0 + o.RISE * (1 - Math.cos(o.u)) / 2;
    var g = this.geo(o, yc);
    var n = (o.free0 - g.free) / (2 * Math.PI * (R1 - R2));                // handle turns so far
    for (k in o.rights) o.rights[k].visible = +k === R2;
    o.spin.rotation.x = n * 2 * Math.PI;
    o.blk.position.set(0, yc, 0);
    o.fix[0].rotation.z = 2 * Math.PI * n * R1 / o.RF;
    o.fix[1].rotation.z = 2 * Math.PI * n * R2 / o.RF;
    o.hp.rotation.z = -Math.PI * n * (R1 + R2) / o.RH;
    var th = g.th, sn = Math.sin(th), cs = Math.cos(th), RF = o.RF, RH = o.RH, XP = o.XP, YP = o.YP;
    // diagonals: from the fixed pulley's upper-inner side to the hanging pulley's lower side
    o.diag[0].span(-XP + RF * sn, YP + RF * cs, 0, -RH * sn, yc - RH * cs, 0);
    o.diag[1].span(XP - RF * sn, YP + RF * cs, 0, RH * sn, yc - RH * cs, 0);
    // wraps: left fixed from 180 degrees clockwise over the top to 90 - th; right fixed from 90 + th clockwise to 0
    o.wrapF[0].position.set(-XP, YP, 0); o.wrapF[0].geometry.dispose();
    o.wrapF[0].geometry = new T.TorusGeometry(RF, 2.2, 10, 24, Math.PI / 2 + th); o.wrapF[0].rotation.z = Math.PI / 2 - th;
    o.wrapF[1].position.set(XP, YP, 0); o.wrapF[1].geometry.dispose();
    o.wrapF[1].geometry = new T.TorusGeometry(RF, 2.2, 10, 24, Math.PI / 2 + th); o.wrapF[1].rotation.z = 0;
    o.wrapH.geometry.dispose(); o.wrapH.geometry = new T.TorusGeometry(RH, 2.2, 10, 24, 2 * th);
    o.wrapH.rotation.z = -Math.PI / 2 - th;
    // vertical ropes: from the front of the thick half and the back of the thin half up to the fixed pulleys
    var e1 = R1 + 2.2, e2 = R2 + 2.2, d1 = YP, f1 = Math.acos(e1 / d1), f2 = Math.acos(e2 / d1);
    o.vert[0].span(-XP - RF, e1 * Math.cos(f1), e1 * Math.sin(f1), -XP - RF, YP, 0);
    o.vert[1].span(XP + RF, e2 * Math.cos(f2), -e2 * Math.sin(f2), XP + RF, YP, 0);
    S.set("t", n.toFixed(2) + " turns");
    S.set("h", (yc - o.YC0).toFixed(0) + " mm");
  }
});
