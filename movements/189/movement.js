M507.define({
  number: 189,
  title: "Unhooking the eccentric rod, fourth form",
  lede: "A rod pushed to and fro by the engine ends in an open hook, called a gab, that rests on a pin. The pin is on an arm that rocks a shaft. An upright rod and a bent lever, called a bell crank, lift the hook off the pin from a distance.",
  alt: "A level rod ends in a hook that rests on a pin at the bottom of an arm. The arm hangs from a round shaft above. To the right, a tall upright rod turns a bent lever. A short link hangs from the lever to the tail of the hooked end.",
  parts: [
      {
          "key": "rod",
          "color": "#D9B13B",
          "name": "Eccentric rod",
          "note": "The long rod that the engine pushes to and fro. Its hooked end is on a hinge, so it can be lifted off the pin."
      },
      {
          "key": "arm",
          "color": "#C8873A",
          "name": "Rocking shaft and arm",
          "note": "The arm hangs from the rocking shaft. When the arm swings, the shaft turns with it. The mark on the end of the shaft shows the turning."
      },
      {
          "key": "pin",
          "color": "#C2503F",
          "name": "Pin",
          "note": "The pin on the end of the arm. Watch it. The hook rests round it, and the rod carries it to and fro."
      },
      {
          "key": "handle",
          "color": "#4FA58A",
          "name": "Upright rod and bell crank",
          "note": "An upright rod turns a bell crank, which is a lever bent at a right angle. The crank pulls a link, and the link lifts the tail of the hooked end."
      }
  ],
  controls: [{ id: "h", label: "Eccentric rod", value: "on", options: [["on", "Hooked on"], ["off", "Lifted off"]] }],
  readouts: [{ id: "a", label: "Rocking shaft" }, { id: "r", label: "Rod" }, { id: "u", label: "Rod travel" }],
  views: { "3d": [330, 150, 880], front: [40, 90, 900], side: [900, 90, 0] },
  target: [40, 90, 0],
  how: [
      "The rod slides to and fro. Its hooked end sits round the red pin, so the arm swings with it and rocks the shaft above.",
      "Pull the upright rod and the bent lever turns. Its link lifts the tail of the hooked end, and the hook leaves the pin. The rod keeps sliding, but the arm and the shaft stay still.",
      "Press Lifted off and watch the upright rod lean. Then press Hooked on. The hook waits until it is over the pin, then drops onto it."
  ],
  note: "This model is rebuilt from Brown's drawing. The stand, the bearing, the hinge in the rod, the post for the bent lever and the sizes were made up. The bent lever is shown the other way round from the drawing so that it stays clear of the shaft. The engine's eccentric is off the picture, so the rod simply slides to and fro.",

  // R arm length, HG hinge to pin, LIFT hook lift angle, B foot of the post, E rod stroke, CL play of the pin in the hook, rate lift speed
  K: { R: 80, HG: 100, LIFT: 0.72, TX: 150, CX: 150, CY: 100, LC: 100, UP: 200, LL: 100, E: 20, CL: 1.5, RATE: 1.8, PR: 12, SLOT: 15, BOT: -22, TOP: 30, RH: 22, BW: 30, B: -60 },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K;
    var o = this.o = { th: 0, phi: 0, px: 0, drop: false, pin: { x: 0, y: 0 } };
    var HG = K.HG, R = K.R, RH = K.RH, BW = K.BW;
    // the angle at which the block's lowest corner clears the top of the pin
    for (var f = 0; f < 1.2; f += 0.005) { if ((HG - BW) * Math.sin(f) + K.BOT * Math.cos(f) > K.PR + 4) break; }
    K.ENTER = f; K.HOLD = Math.min(K.LIFT - 0.02, f + 0.04);
    // flat forged plate along a curve: outline offset by half the width, extruded z 7..21 (just in front of the rod face)
    function plate(pts, w) {
      var cv = new T.SplineCurve(pts.map(function (p) { return new T.Vector2(p[0], p[1]); })), q = cv.getPoints(70), L = [], Rr = [];
      for (var i = 0; i < q.length; i++) {
        var a = q[Math.max(0, i - 1)], b = q[Math.min(q.length - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
        L.push(new T.Vector2(q[i].x - dy / d * w / 2, q[i].y + dx / d * w / 2)); Rr.push(new T.Vector2(q[i].x + dy / d * w / 2, q[i].y - dx / d * w / 2));
      }
      var sh = new T.Shape(L.concat(Rr.reverse()));
      var gg = new T.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); gg.translate(0, 0, 7);
      P.at(P.mesh(gg, c.mat("handle")), 0, 0, 0, g);
      [pts[0], pts[pts.length - 1]].forEach(function (p) { P.at(P.cylZ(w / 2, 14, c.mat("handle")), p[0], p[1], 14, g); });
    }
    // rocking arm and shaft: group at the shaft, hangs down, turned in step()
    o.rock = new T.Group(); o.rock.position.set(0, R, 0); scene.add(o.rock);
    P.at(P.cylZ(20, 70, c.mat("arm")), 0, 0, -35, o.rock);                                  // shaft z -70..0, starts on the bearing face
    P.at(P.cylZ(34, 10, c.mat("arm")), 0, 0, -12, o.rock);                                  // big round boss z -17..-7
    var as = new T.Shape(); as.moveTo(-26, 0); as.lineTo(26, 0); as.lineTo(18, -R); as.lineTo(-18, -R);
    var ag = new T.ExtrudeGeometry(as, { depth: 9, bevelEnabled: false }); ag.translate(0, 0, -16.5);
    P.at(P.mesh(ag, c.mat("arm")), 0, 0, 0, o.rock);                                         // tapering arm z -16.5..-7.5
    P.at(P.cylZ(28, 10, c.mat("arm")), 0, -R, -12, o.rock);                                 // boss round the pin z -17..-7
    P.at(P.cylZ(16, 1, c.mat("arm", "dark")), 0, 0, 0.5, o.rock);                           // dark end face z 0..1
    P.at(P.box(32, 5, 1, c.mat("arm", "light")), 0, 0, 1.5, o.rock);                        // stripe z 1..2
    P.at(P.cylZ(K.PR, 25, c.mat("pin")), 0, -R, -3.5, o.rock);                              // pin z -16..9
    // rod: the long part slides, the hooked part hangs on a hinge
    o.rodg = new T.Group(); scene.add(o.rodg);
    var L0 = -480, L1 = -HG - RH - 1;
    P.at(P.box(L1 - L0, 2 * RH, 14, c.mat("rod")), (L0 + L1) / 2, 0, 0, o.rodg);            // heavy bar y -RH..RH, z -7..7
    P.at(P.box(RH, 2 * RH, 4, c.mat("rod")), -HG - RH / 2, 0, -5, o.rodg);                  // tongue x -HG-RH..-HG, z -7..-3
    var g = o.gab = new T.Group(); scene.add(g);
    P.at(P.cylZ(RH, 10, c.mat("rod")), 0, 0, 2, g);                                          // boss z -3..7
    P.at(P.cylZ(5, 18, c.mat("rod", "dark")), 0, 0, 0, g);                                   // hinge pin z -9..9
    P.at(P.box(HG - BW, 2 * RH, 14, c.mat("rod")), (HG - BW) / 2, 0, 0, g);                  // bar x 0..HG-BW
    var S = K.SLOT, sh = new T.Shape();
    sh.moveTo(HG - BW, K.BOT); sh.lineTo(HG - S, K.BOT); sh.lineTo(HG - S, 3);
    sh.absarc(HG, 3, S, Math.PI, 0, true);
    sh.lineTo(HG + S, K.BOT); sh.lineTo(HG + BW, K.BOT); sh.lineTo(HG + BW, K.TOP); sh.lineTo(HG - BW, K.TOP); sh.lineTo(HG - BW, K.BOT);
    var bg = new T.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false, curveSegments: 24 }); bg.translate(0, 0, -7);
    P.at(P.mesh(bg, c.mat("rod")), 0, 0, 0, g);                                             // wide block with the open slot facing down, z -7..7
    var TX = K.TX;
    P.at(P.box(TX + 15 - (K.HG + K.BW), 24, 14, c.mat('handle')), (K.HG + K.BW + TX + 15) / 2, 0, 0, g);   // tail bar x HG+BW..TX+15
    P.at(P.cylZ(12, 14, c.mat('handle')), TX, 0, 0, g);                                               // eye for the link
    P.at(P.cylZ(4, 14, c.mat('handle', 'dark')), TX, 0, 14, g);                                      // link pin z 7..21
    o.crank = new T.Group(); o.crank.position.set(K.CX, K.CY, 0); scene.add(o.crank);
    P.at(P.box(K.LC, 16, 6, c.mat('handle')), -K.LC / 2, 0, 12, o.crank);                 // arm z 9..15
    P.at(P.cylZ(18, 6, c.mat('handle')), 0, 0, 12, o.crank);
    P.at(P.cylZ(11, 6, c.mat('handle')), -K.LC, 0, 12, o.crank);
    P.at(P.box(9, K.UP, 6, c.mat('handle')), 0, K.UP / 2, 12, o.crank);                    // upright rod
    P.at(P.cylZ(4, 4, c.mat('handle', 'dark')), -K.LC, 0, 17, o.crank);                   // link pin head z 15..19
    P.at(P.cylZ(6, 40, c.mat('handle', 'dark')), K.CX, K.CY, 2, scene);                    // pivot pin z -18..22, starts on the post face
    o.link = P.at(P.rod(3, c.mat('handle')), 0, 0, 0, scene);
    P.at(P.box(18, K.CY - K.B, 22, c.fixed), K.CX, (K.CY + K.B) / 2, -29, scene);          // post x 141..159, z -40..-18
    P.at(P.box(60, 12, 40, c.fixed), K.CX, K.B - 6, -34, scene);                           // foot x 120..180, y B-12..B, z -54..-14
    // supports: only what the shaft needs to stand on
    P.at(P.box(110, 12, 50, c.fixed), 0, K.B - 6, -75, scene);                              // base x -55..55, y B-12..B, z -100..-50
    P.at(P.box(44, R - 36 - K.B, 18, c.fixed), 0, (K.B + R - 36) / 2, -79, scene);          // post y B..R-36, z -88..-70
    P.at(P.box(72, 72, 18, c.fixed), 0, R, -79, scene);                                     // bearing y R-36..R+36, z -88..-70; shaft starts on its face
  },

  step: function (c, dt, S) {
    var o = this.o, K = this.K, want = S.controls.h === "off", HG = K.HG, R = K.R;
    var w = S.w || 0;
    o.th += w * dt;
    var u = K.E * Math.sin(o.th), hx = u - HG;
    // the lift: going up is free, coming down waits until the hook will land on the pin
    if (want) { o.drop = false; o.phi = Math.min(K.LIFT, o.phi + K.RATE * dt); }
    else if (o.phi > 0) {
      if (o.phi > K.HOLD) o.phi = Math.max(K.HOLD, o.phi - K.RATE * dt);
      else {
        if (!o.drop) {
          var tau = (K.HOLD - K.ENTER) / K.RATE, hp = K.E * Math.sin(o.th + w * tau) - HG;
          if (Math.abs(o.px - (hp + HG / Math.cos(K.ENTER))) < 1.2) o.drop = true;
        }
        if (o.drop) o.phi = Math.max(0, o.phi - K.RATE * dt);
      }
    }
    if (o.phi <= 0) o.drop = false;
    // the pin is carried by the hook when it is inside the slot, otherwise the arm stays where it is
    if (o.phi < K.ENTER) {
      var cx = hx + HG / Math.cos(o.phi), cl = K.CL * o.phi / K.ENTER;
      o.px = Math.max(cx - cl, Math.min(cx + cl, o.px));
    }
    var a = Math.asin(Math.max(-0.9, Math.min(0.9, o.px / R)));
    o.pin.x = R * Math.sin(a); o.pin.y = R - R * Math.cos(a); o.a = a;
    o.rock.rotation.z = a;
    o.rodg.position.x = u;
    o.gab.position.set(hx, 0, 0); o.gab.rotation.z = o.phi;
    // bell crank turned so that its link, of fixed length, reaches the tail of the hooked end
    var tx = hx + K.TX * Math.cos(o.phi), ty = K.TX * Math.sin(o.phi);
    var dx = tx - K.CX, dy = ty - K.CY, d = Math.hypot(dx, dy);
    var gm = Math.acos(Math.max(-1, Math.min(1, (K.LC * K.LC + d * d - K.LL * K.LL) / (2 * K.LC * d))));
    var be = Math.atan2(dy, dx) - gm; while (be < 0) be += 2 * Math.PI;
    var px2 = K.CX + K.LC * Math.cos(be), py2 = K.CY + K.LC * Math.sin(be);
    o.crank.rotation.z = be - Math.PI;
    o.link.span(px2, py2, 16, tx, ty, 16);

    function sg(v) { return (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v).toFixed(0); }
    S.set("a", sg(a * 180 / Math.PI) + "°");
    S.set("r", want ? (o.phi >= K.LIFT - 0.001 ? "Lifted off" : "Lifting") : o.phi <= 0 ? "Hooked on" : o.drop ? "Dropping" : o.phi > K.HOLD ? "Lowering" : "Waiting");
    S.set("u", sg(u) + " mm");
  }
});
