M507.define({
  number: 173,
  title: "Tappet wheel and screw",
  lede: "A turning disc carries a screw with a small toothed wheel on its end. Once in each turn the wheel knocks a fixed pin and turns by one tooth. The screw turns with it and moves a nut a little farther out, so the stroke of a bar grows turn after turn. Silk machines use this to lay thread evenly on a bobbin.",
  alt: "A large round disc. A screw in a frame lies across the disc and points to the upper right. A small toothed wheel sits on the screw end outside the disc, next to a short fixed pin on a stand. A nut on the screw carries a round peg. The peg slides in an upright slot of a flat bar that has a long arm to the right.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "The big disc, turned by the handle on its back. It carries the screw and its frame round with it. The dark stripe shows how far it has turned." },
    { key: "screw", color: "#C8873A", name: "Screw and tappet wheel", note: "A long screw with a small toothed wheel on its outer end, called a tappet wheel. When a tooth is knocked, the wheel and the screw turn together a little." },
    { key: "nut", color: "#8E7AA8", name: "Nut and peg", note: "The nut rides on the screw. Rails stop it from turning, so it slides along. The round peg on top fits in the slot of the bar. Watch how far the peg is from the centre of the disc." },
    { key: "bar", color: "#D9B13B", name: "Slotted bar", note: "A flat bar with an upright slot. The peg moves up and down in the slot and pushes the bar from side to side. Its long arm is the guide rod for the silk." },
    { key: "pin", color: "#4FA58A", name: "Tappet pin", note: "A short pin on a fixed stand. It never moves. The tappet wheel passes it once in each turn of the disc and gets knocked on by one tooth." }
  ],
  controls: [{ id: "teeth", label: "Teeth on the tappet wheel", value: "4", options: [["3", "3"], ["4", "4"], ["6", "6"]] }],
  readouts: [{ id: "disc", label: "Disc" }, { id: "screw", label: "Screw" }, { id: "stroke", label: "Stroke" }],
  views: { front: [140, 0, 1200], "3d": [800, 330, 1000], side: [1300, 100, 40] },
  target: [140, 0, 10],
  how: [
    "The disc turns round and carries the screw with it. The peg on the nut goes round in a circle. The slotted bar only moves from side to side, so it copies the sideways part of that circle. The wider the circle, the longer the stroke.",
    "Once in each turn the tappet wheel reaches the fixed pin. A tooth hits the pin and the wheel is pushed on by one tooth. The screw turns with the wheel, and the nut cannot turn, so it slides outward along the screw. The circle gets a little wider on every turn. At the far end the screw is wound back and it starts again.",
    "Try 3 teeth, then 6. Watch the stroke reading. With fewer teeth, each knock turns the screw further, so the stroke grows faster."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the disc as a bevel gear and no frame. The plain disc, the hub and handle, the back plate, the rails and end plates, the stand and pin, the guide for the arm, the sizes and the tooth counts were made up. The nut is solid, so its inside thread is not drawn. The screw is shown in line with the disc centre. When the nut reaches the far end, the model winds the screw back during one turn of the disc so you can keep watching. The choice of teeth was added to show what it changes.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, k;
    var BETA = 32 * Math.PI / 180, PHI0 = BETA - 0.45, ZS = 30, RT = 225, R1 = 34, SEP = 3.5, LEAD = 24, R0 = 32, RMAX = 152;
    var o = this.o = { a: 0, Ts: 0, N: 0, mLast: 0, rew: false, d0: 0, T0: 0, BETA: BETA, PHI0: PHI0, RT: RT, R1: R1, SEP: SEP, LEAD: LEAD, R0: R0, RMAX: RMAX, wheels: {} };
    // back plate x -250..400, y -260..260, z -70..-60
    P.at(P.box(650, 520, 10, c.fixed), 75, 0, -65, scene);
    // disc group turns about Z. Disc z -8..0, hub z -60..-8 on the plate face, handle on the back
    o.disc = new T.Group(); scene.add(o.disc);
    P.at(P.cylZ(190, 8, c.mat("disc")), 0, 0, -4, o.disc);                      // disc z -8..0, r 190
    P.at(P.cylZ(16, 52, c.mat("disc")), 0, 0, -34, o.disc);                     // hub z -60..-8
    P.at(P.box(6, 40, 1, c.mat("disc", "dark")), 0, 160, 1, o.disc);            // stripe y 140..180, z 0.5..1.5
    P.at(P.cylZ(6, 32, c.mat("disc")), 0, -130, -24, o.disc);                   // handle z -40..-8
    P.at(P.cylZ(8, 6, c.mat("disc")), 0, -130, -43, o.disc);                    // knob z -46..-40
    // frame on the disc, tilted by BETA. Rails z 0..46, y +-(33..39), x -35..195; end plates x -41..-35 and 195..201
    o.fr = new T.Group(); o.fr.rotation.z = BETA; o.disc.add(o.fr);
    P.at(P.box(230, 6, 46, c.mat("disc")), 80, 36, 23, o.fr);
    P.at(P.box(230, 6, 46, c.mat("disc")), 80, -36, 23, o.fr);
    P.at(P.box(6, 78, 46, c.mat("disc")), -38, 0, 23, o.fr);                    // x -41..-35, touches the worm end at -35
    P.at(P.box(6, 78, 46, c.mat("disc")), 198, 0, 23, o.fr);                    // x 195..201, the shaft passes through
    // screw group: turns about the screw axis (local X) at z = ZS
    o.spin = new T.Group(); o.spin.position.set(0, 0, ZS); o.fr.add(o.spin);
    P.at(P.worm({ radius: 15, pitch: LEAD, length: 230, material: c.mat("screw") }), 80, 0, 0, o.spin);   // x -35..195
    P.at(P.cylX(8, 26, c.mat("screw")), 207, 0, 0, o.spin);                   // shaft x 195..220 to the wheel face
    [3, 4, 6].forEach(function (N) {
      var al = Math.PI / N, w = new T.Group(), kk;
      var rest = al - Math.asin(SEP / R1);                                      // rest angle of a tooth just before the knock
      P.at(P.cylX(10, 10, c.mat("screw")), RT, 0, 0, w);                        // wheel body x 220..230
      for (kk = 0; kk < N; kk++) {
        var tg = new T.Group(); tg.rotation.x = rest + kk * 2 * al; tg.position.set(RT, 0, 0); w.add(tg);
        P.at(P.box(8, 3, 26, c.mat("screw", kk === 0 ? "mark" : undefined)), 0, 0, 21, tg);   // tooth radial 8..34, x 220..230
      }
      o.spin.add(w); o.wheels[N] = { g: w, N: N, al: al, rest: rest, zp: R1 * Math.cos(al) };
    });
    // nut on the frame rails: x +-15 about r, y +-32, z 6..54; peg z 54..77
    o.nut = new T.Group(); o.fr.add(o.nut);
    P.at(P.box(30, 64, 48, c.mat("nut")), 0, 0, 30, o.nut);
    P.at(P.cylZ(5, 20, c.mat("nut", "mark")), 0, 0, 64, o.nut);                  // peg z 54..74
    P.at(P.cylZ(8, 3, c.mat("nut")), 0, 0, 75.5, o.nut);                         // head z 74..77 (above the bar top at 74)
    // fixed stand and pin along PHI0
    o.pg = new T.Group(); o.pg.rotation.z = PHI0; scene.add(o.pg);
    P.at(P.box(60, 50, 130, c.fixed), 315, 0, 5, o.pg);                         // radial 285..345, z -60..70
    o.pin = P.at(P.cylX(2, 66, c.mat("pin")), 252, 0, 0, o.pg);                 // radial 219..285, ends on the stand face
    // slotted bar, flat at z 68..74, with a long arm at y -77..-63
    var L = 450, sh = new T.Shape(), hole = new T.Path();
    sh.moveTo(-16, -172); sh.lineTo(16, -172); sh.lineTo(16, -77); sh.lineTo(L, -77); sh.lineTo(L, -63); sh.lineTo(16, -63); sh.lineTo(16, 172); sh.lineTo(-16, 172); sh.closePath();
    hole.moveTo(-6, -158); hole.lineTo(-6, 158); hole.lineTo(6, 158); hole.lineTo(6, -158); hole.closePath(); sh.holes.push(hole);
    var bg = new T.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false });
    o.bar = new T.Mesh(bg, c.mat("bar")); o.bar.position.z = 68; scene.add(o.bar);
    // guide for the arm: block x 250..290, y -100..-40, z -60..92, with a slot 16 x 8 for the arm
    var s2 = new T.Shape(), h2 = new T.Path();
    s2.moveTo(-92, -100); s2.lineTo(60, -100); s2.lineTo(60, -40); s2.lineTo(-92, -40); s2.closePath();
    h2.moveTo(-75, -78); h2.lineTo(-75, -62); h2.lineTo(-67, -62); h2.lineTo(-67, -78); h2.closePath(); s2.holes.push(h2);
    var gb = new T.Mesh(new T.ExtrudeGeometry(s2, { depth: 40, bevelEnabled: false }), c.fixed);
    gb.rotation.y = Math.PI / 2; gb.position.x = 250; scene.add(gb);
  },

  step: function (c, dt, S) {
    var o = this.o, PI = Math.PI, N = +S.controls.teeth || 4, W = o.wheels[N], k;
    for (k in o.wheels) o.wheels[k].g.visible = (+k === N);
    if (o.N !== N) {                                                 // new wheel: keep the screw on a whole tooth
      o.N = N; o.Ts = Math.round(o.Ts * N) / N;
      o.pin.position.z = 30 + W.zp;                                // pin height above the disc: screw axis plus the tooth reach
    }
    o.a += S.w * dt;
    var d = o.PHI0 - o.BETA + o.a;                                  // angle still to go before the wheel reaches the pin
    var m = Math.floor((d + PI) / (2 * PI)), dp = d - 2 * PI * m;   // passes done, and position in this pass in -pi..pi
    var Ts, delta = 0;
    if (m > o.mLast) {
      var cnt = m - o.mLast; o.mLast = m;
      if (o.rew) { o.rew = false; }
      else {
        o.Ts += cnt / N;
        if (o.Ts >= (o.RMAX - o.R0) / o.LEAD - 1e-6) { o.rew = true; o.T0 = o.Ts; o.d0 = d; }
      }
    }
    if (o.rew) {
      var pr = Math.min(1, (d - o.d0) / (2 * PI * 0.4)); pr = pr * pr * (3 - 2 * pr);
      Ts = o.T0 * (1 - pr); o.Ts = Ts;
    } else {
      Ts = o.Ts;
      var t = Math.max(-o.R1 * Math.sin(W.al), Math.min(o.R1 * Math.sin(W.al), -o.RT * dp));   // sideways offset of the pin from the wheel
      var rho = Math.hypot(t, W.zp);
      delta = (Math.atan2(t, W.zp) - Math.asin(o.SEP / rho)) - W.rest;                      // tooth swing while it is pushed, 0 to -pitch
      if (dp > PI / 2) delta = -2 * W.al; else if (dp < -PI / 2) delta = 0;
    }
    var th = -2 * PI * Ts + delta, turns = -th / (2 * PI), r = o.R0 + o.LEAD * turns;
    o.disc.rotation.z = -o.a;
    o.spin.rotation.x = th;
    o.nut.position.set(r, 0, 0);
    var phi = o.BETA - o.a, px = r * Math.cos(phi), py = r * Math.sin(phi);
    o.bar.position.x = px;
    o.bar.position.y = 0;
    // the peg's world height equals py; its slot is a fixed 316 tall, so the bar does not move up or down
    S.set("disc", (Math.round(o.a / (2 * PI) * 10) / 10) + " turns");
    S.set("screw", (Math.round(turns * 10) / 10) + " turns");
    S.set("stroke", Math.round(2 * r) + " mm");
  }
});
