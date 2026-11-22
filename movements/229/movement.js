M507.define({
  number: 229,
  title: "Chain and pulley, third kind",
  lede: "A chain of flat plates joined by pins runs over a notched wheel. Each pin drops into a notch, so the wheel grips the chain like a gear and it cannot slip.",
  alt: "A wheel with a notch at each corner of its rim. A chain of flat plates, one row in front of the wheel and one behind, joined by round pins, lies over the top with a pin in each notch. The chain hangs down both sides in a loop.",
  parts: [
    { key: "wheel", color: "#5E7387", name: "Notched wheel", note: "A wheel with a notch for every pin of the chain. The sides of the notches push the pins along." },
    { key: "outer", color: "#C8873A", name: "Outer plates", note: "Pairs of plates, one in front of the wheel and one behind, on the outside of the chain. Watch the red pair go round." },
    { key: "inner", color: "#D9B13B", name: "Inner plates", note: "Pairs of plates that sit just inside the outer ones, close to the wheel." },
    { key: "pins", color: "#4FA58A", name: "Pins", note: "Round pins that join each pair of plates to the next. They reach across the wheel and sit in its notches." }
  ],
  readouts: [{ id: "w", label: "Wheel" }, { id: "v", label: "Chain" }],
  views: { "3d": [176, 39, 546], front: [0, -45, 650], side: [650, -45, 0] },
  target: [0, -45, 0],
  how: [
    "The chain is made of flat plates in pairs, one in front of the wheel and one behind it. Round pins join each pair to the next. The rim of the wheel runs in the space between the two rows of plates.",
    "The rim has a notch for every pin. On top of the wheel each pin sits down in its own notch. When the wheel turns, the sides of the notches push the pins and carry the chain along. Where the chain leaves the wheel, the pins lift out of the notches.",
    "Each time one notch passes the top, the chain moves on by one link. Slow the wheel down and follow the red plates as they come down one side and go up the other."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the chain going over the top of the wheel only. Here it is joined into a loop that hangs below, so it can go round and round. Brown's notches lean like saw teeth; here they are the same on both sides, so the pins can lift out on either side. The stand and the sizes were made up.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, N = 16, RV = 84, WN = 7, DN = 9, RP = 2.6, CNT = 22, i;
    var o = this.o = { psi: 0, pins: [] };
    // wheel outline: a 16-sided rim with a V notch cut at each corner, corner 0 at the top
    var st = 2 * Math.PI / N, pts = [];
    function pv(k) { var a = Math.PI / 2 - k * st; return [RV * Math.cos(a), RV * Math.sin(a)]; }
    for (i = 0; i < N; i++) {
      var V = pv(i), Pr = pv(i - 1), Nx = pv(i + 1), sl = Math.hypot(Pr[0] - V[0], Pr[1] - V[1]), a0 = Math.PI / 2 - i * st;
      pts.push([V[0] + (Pr[0] - V[0]) / sl * WN, V[1] + (Pr[1] - V[1]) / sl * WN]);
      pts.push([(RV - DN) * Math.cos(a0), (RV - DN) * Math.sin(a0)]);
      pts.push([V[0] + (Nx[0] - V[0]) / sl * WN, V[1] + (Nx[1] - V[1]) / sl * WN]);
    }
    pts.reverse();                                                           // counter-clockwise for the shape
    var sh = new T.Shape(); pts.forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
    // pin resting in a notch: touching both sides of the V
    var half = Math.atan2(WN * Math.sin((Math.PI - st) / 2), DN - WN * Math.cos((Math.PI - st) / 2));   // angle between the radius and a side of the V
    var RJ = RV - DN + RP / Math.sin(half), pitch = 2 * RJ * Math.sin(Math.PI / N);                    // about 78.9 and 30.8
    var ch = o.ch = P.chainLoop({ seats: N, lengths: [pitch], count: CNT });
    o.wheel = new T.Group(); scene.add(o.wheel);
    var wg = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false }); wg.translate(0, 0, -5);   // wheel z -5..5
    o.wheel.add(new T.Mesh(wg, c.mat("wheel")));
    P.at(P.cylZ(16, 4, c.mat("wheel")), 0, 0, 7, o.wheel);                   // hub z 5..9, on the wheel face
    P.at(P.hoop(11, 1.2, c.mat("wheel", "dark")), 0, 0, 9.5, o.wheel);      // ring line on the hub face
    P.at(P.cylZ(6, 27, c.mat("wheel", "dark")), 0, 0, -1.5, o.wheel);       // shaft z -15..12, from the post face
    // plates: rounded ends of radius 7 round each pin; inner pairs z +-(5.8..8.3), outer pairs z +-(8.8..11.3)
    function plate(z) {
      var s = new T.Shape(); s.absarc(-pitch / 2, 0, 7, Math.PI / 2, 3 * Math.PI / 2, false); s.absarc(pitch / 2, 0, 7, -Math.PI / 2, Math.PI / 2, false);
      var g = new T.ExtrudeGeometry(s, { depth: 2.5, bevelEnabled: false, curveSegments: 14 }); g.translate(0, 0, z - 1.25); return g;
    }
    o.front = P.linkChain({ count: CNT, geo: plate(10.05), altGeo: plate(7.05), material: c.mat("outer"), alt: c.mat("inner"), mark: c.mat("outer", "mark"), markAt: 0 });
    o.back = P.linkChain({ count: CNT, geo: plate(-10.05), altGeo: plate(-7.05), material: c.mat("outer"), alt: c.mat("inner"), mark: c.mat("outer", "mark"), markAt: 0 });
    scene.add(o.front); scene.add(o.back);
    for (i = 0; i < CNT; i++) {
      var pin = new T.Group(); scene.add(pin); o.pins.push(pin);
      pin.add(P.cylZ(RP, 22.2, c.mat("pins")));                              // z -11.1..11.1, through all four plates, ends inside the outer plates (faces at 11.3)
      P.at(P.cylZ(RP + 1.3, 1.2, c.mat("pins")), 0, 0, 11.9, pin);          // heads z 11.3..12.5 on the outer plate faces
      P.at(P.cylZ(RP + 1.3, 1.2, c.mat("pins")), 0, 0, -11.9, pin);
    }
    // stand
    P.at(P.box(30, 210, 12, c.fixed), 0, -85, -21, scene);                   // post x -15..15, y -190..20, z -27..-15; shaft ends at z -15, back pin heads at -12.5
    P.at(P.box(270, 10, 90, c.fixed), 0, -195, -10, scene);                  // base y -200..-190, z -55..35; post stands on y -190; chain's lowest point about -178
  },

  step: function (c, dt, S) {
    var o = this.o, ch = o.ch, i, n = ch.count;
    o.psi -= S.w * dt;                                                       // clockwise: the right-hand run goes down
    o.wheel.rotation.z = o.psi;
    ch.set(o.psi);
    for (i = 0; i < n; i++) {
      var j = (i + 1) % n, x = ch.jx[i], y = ch.jy[i], tx = ch.jx[j] - x, ty = ch.jy[j] - y;
      o.front.put(i, x + tx / 2, y + ty / 2, 0, tx, ty, 0, 0, 0, 1);
      o.back.put(i, x + tx / 2, y + ty / 2, 0, tx, ty, 0, 0, 0, 1);
      o.pins[i].position.set(x, y, 0);
    }
    S.set("w", (S.playing ? Math.round(S.rpm * 10) / 10 : 0) + " rpm");
    S.set("v", (Math.abs(S.w) * ch.lift / 10).toFixed(1) + " cm/s");
  }
});
