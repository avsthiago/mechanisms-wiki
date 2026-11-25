M507.define({
  number: 361,
  title: "Pin clutch for a pulley",
  lede: "A cord turns a pulley that sits loose on a shaft. Slide the pulley along the shaft and a pin on its side meets a pin on the shaft, so the shaft turns with it. Slide it back and the shaft is free again. This is a simple way to start and stop a machine while the driving shaft keeps running.",
  alt: "Two horizontal shafts, one above the other, each in two upright posts. The driving shaft, the driving shaft, has a heavy wheel at one end, a crank at the other and a grooved drum. A cord runs from it down to a pulley on the driven shaft. A lever on the right slides that pulley along its shaft. A pin stands up from the driven shaft and a second pin sticks out of the side of the pulley.",
  parts: [
    { key: "upper", color: "#5E7387", name: "Driving shaft", note: "Turned by the crank. The heavy wheel on it keeps it turning smoothly." },
    { key: "cord", color: "#D9B13B", name: "Cord", note: "Runs from the upper drum down round the pulley. The red mark rides on it." },
    { key: "pulley", color: "#C8873A", name: "Sliding pulley", note: "Loose on the driven shaft, so it can turn without turning the shaft. It also slides along it." },
    { key: "shaft", color: "#4FA58A", name: "Driven shaft", note: "Only turns when the pin on the pulley pushes the pin on the shaft." },
    { key: "pins", color: "#C2503F", name: "Pins", note: "One stands on the shaft and one sticks out of the pulley. Watch them. When they touch, the shaft is driven." },
    { key: "lever", color: "#8E7AA8", name: "Lever", note: "Swings on the right-hand post. Its end slips between two discs on the pulley and slides it along." }
  ],
  controls: [{ id: "cl", label: "Pulley", value: "0", options: [["0", "Released"], ["1", "Engaged"]] }],
  readouts: [{ id: "u", label: "Driving shaft" }, { id: "l", label: "Driven shaft" }, { id: "s", label: "Pulley slid" }],
  views: { "3d": [191, 147, 419], front: [-5, 40, 720], side: [720, 40, 0] },
  target: [-5, 40, 0],
  distance: [300, 1500],
  how: [
    "Turn the crank. The driving shaft turns, and the cord makes the pulley below turn at the same speed. But the pulley is loose on the driven shaft, so the driven shaft stays still.",
    "Now press Engaged. The lever slides the pulley along the shaft, and the pin on its side moves into the path of the pin on the shaft. After a part of a turn the pins meet. The pulley pushes the shaft round with it. Press Released and the pins slide apart, so the shaft slows down and stops.",
    "Try Engaged, then Released. Notice the pins have to meet before the shaft starts, so there is a short wait. That is why this simple clutch is best for slow machines."
  ],
  note: "This model is rebuilt from Brown's drawing. The upper drum is made wide so the cord stays on it while the pulley slides. The posts, base, the bracket for the lever and all the sizes were added or made up. Rubbing slows the driven shaft to a stop when it is let go.",

  build: function (c) {
    var T = c.THREE, P = c.P, i, o = this.o = { thu: 0, thp: 0, ths: 0, ws: 0, s: 0, ps: 0, XG: 28.5, YU: 117 };
    function post(x0, x1) {                                      // upright with a hole for each shaft, as stacked pieces; y -63 .. 145
      var w = x1 - x0, cx = (x0 + x1) / 2, segs = [[-63, -13, 0], [-13, 13, 1], [13, 104, 0], [104, 130, 1], [130, 145, 0]];
      segs.forEach(function (sg) {
        var h = sg[1] - sg[0], m;
        if (sg[2]) { m = P.guideBlock({ w: h, h: w, d: 34, hole: 7, material: c.fixed }); m.rotation.z = Math.PI / 2; }
        else m = P.box(w, h, 34, c.fixed);
        P.at(m, cx, (sg[0] + sg[1]) / 2, 0, c.scene);
      });
    }
    post(-72, -52); post(70, 90);                                // posts x -72..-52 and 70..90, z -17..17
    P.at(P.box(230, 8, 50, c.fixed), 5, -67, 0, c.scene);         // base: y -71 .. -63
    P.at(P.box(52, 16, 4, c.fixed), 64, 70, 19, c.scene);         // bracket for the lever on the right post: x 38..90, z 17..21
    // upper shaft, wheel, drum and crank
    var um = c.mat("upper"), ug = o.up = new T.Group(); ug.position.y = o.YU; c.scene.add(ug);
    P.at(P.cylX(6.4, 214, um), 1, 0, 0, ug);                      // x -106 .. 108
    var R = 53, pts = [new T.Vector2(0, -8)], a;
    for (i = -6; i <= 6; i++) { a = i * Math.PI / 12; pts.push(new T.Vector2(R - 8 + 8 * Math.cos(a), 8 * Math.sin(a))); }
    pts.push(new T.Vector2(0, 8));
    var fw = new T.Mesh(new T.LatheGeometry(pts, 64), um); fw.rotation.z = Math.PI / 2; P.at(fw, -90, 0, 0, ug);   // x -98 .. -82
    P.at(P.box(1, 30, 6, c.mat("upper", "dark")), -81, 28, 0, ug);                                       // stripe on the wheel face, 0.5 off it
    P.at(P.cylX(26, 36, um), -12, 0, 0, ug); P.at(P.cylX(32, 4, um), -32, 0, 0, ug); P.at(P.cylX(32, 4, um), 12, 0, 0, ug);   // drum x -30..6, flanges -34..-30 and 10..14 (drum core -30..10)
    P.at(P.box(4, 52, 8, um), 96, -26, 0, ug);                    // crank arm x 94 .. 98
    P.at(P.cylX(3.5, 16, um), 106, -52, 0, ug);                   // handle x 98 .. 114
    // lower shaft with its pin
    var sm = c.mat("shaft"), sg = o.sh = new T.Group(); c.scene.add(sg);
    P.at(P.cylX(6.4, 188, sm), 2, 0, 0, sg);                      // x -92 .. 96
    P.at(P.cylX(10, 6, sm), -85, 0, 0, sg);                       // collar x -88 .. -82
    P.at(P.box(8, 27, 6, c.mat("pins")), -42, 13.5, 0, sg);       // pin x -46 .. -38, up to y 27
    // sliding pulley: slides on x, turns on thp
    var pm = c.mat("pulley"), pg = o.pg = new T.Group(); c.scene.add(pg);
    var pr = o.pr = new T.Group(); pg.add(pr);
    P.at(P.cylX(26, 16, pm), 0, 0, 0, pr); P.at(P.cylX(32, 4, pm), -10, 0, 0, pr); P.at(P.cylX(32, 4, pm), 10, 0, 0, pr);   // core x -8..8, flanges -12..-8 and 8..12
    P.at(P.cylX(9, 33, pm), 28.5, 0, 0, pr);                       // neck x 12 .. 45
    P.at(P.cylX(18, 4, pm), 29, 0, 0, pr); P.at(P.cylX(18, 4, pm), 43, 0, 0, pr);   // collar discs x 27..31 and 41..45, gap 31..41
    P.at(P.box(1, 14, 4, c.mat("pulley", "dark")), 12.75, 22, 0, pr);   // stripe on the right flange, 0.25 off it
    P.at(P.cylX(3, 12, c.mat("pins")), -18, 24, 0, pr);           // pin x -24 .. -12, at radius 24
    // cord: two upright runs and two half turns
    var cm = c.mat("cord");
    o.run = [1, -1].map(function (sd) { return P.at(P.rod(2.5, cm), 0, 0, 0, c.scene); });
    o.arcU = P.at(P.arc(o.XG, 2.5, Math.PI, cm), 0, o.YU, 0, c.scene); o.arcU.rotation.y = Math.PI / 2;
    o.arcL = P.at(P.arc(o.XG, 2.5, Math.PI, cm), 0, 0, 0, c.scene); o.arcL.rotation.set(0, Math.PI / 2, Math.PI);
    o.mark = P.at(P.sphere(4.5, c.mat("cord", "mark")), 0, 0, 0, c.scene);
    // lever on the bracket: pivot (44, 70), plate z 21..26
    var lm = c.mat("lever"), lg = o.lev = new T.Group(); lg.position.set(44, 70, 0); c.scene.add(lg);
    P.at(P.box(6, 134, 5, lm), 0, -59, 23.5, lg);                 // bar y 8 .. -126 (local)
    P.at(P.cylZ(7, 5, lm), 0, 0, 23.5, lg); P.at(P.cylZ(3.5, 2, lm), 0, 0, 27, lg);
    P.at(P.box(6, 6, 11, lm), 0, -70, 15.5, lg);                  // shoe z 10..21, slips between the two discs
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, TP = 2 * Math.PI, CT = .25, i;
    var tgt = +S.controls.cl;
    function wrap(x) { return x - TP * Math.floor(x / TP); }
    var dth = S.w * dt;
    o.thu += dth; o.thp = o.thu;
    var wp = S.w;
    // slide the pulley; the pins must not overlap while it moves in, so it waits at the edge of the path of the shaft pin
    var ns = tgt > o.s ? Math.min(tgt, o.s + 1.1 * dt) : Math.max(tgt, o.s - 1.1 * dt);
    var g = wrap(o.ths - o.thp), inZone = g < CT || g > TP - CT, edge = 14 / 20 - 1e-3;
    if (ns > o.s && o.s < edge && ns >= edge && inZone) ns = edge;
    o.s = ns;
    var engaged = -20 * o.s < -14.5;
    if (S.playing && dt > 0) {
      if (engaged) {
        g = wrap(o.ths - o.thp);
        if (g < CT || g > TP - CT) { o.ths = o.thp + CT; o.ws = Math.max(o.ws, wp); }      // the pulley's pin pushes the shaft's pin
        else o.ws *= Math.exp(-dt / 1.2);
      } else o.ws *= Math.exp(-dt / 1.2);
      if (Math.abs(o.ws) < 1e-3 && !engaged) o.ws = 0;
      if (!(engaged && (wrap(o.ths - o.thp) < CT + 1e-6))) o.ths += o.ws * dt;
      g = wrap(o.ths - o.thp);
      if (engaged && (g < CT || g > TP - CT)) o.ths = o.thp + CT;
    }
    var xc = -20 * o.s;
    o.up.rotation.x = o.thu; o.sh.rotation.x = o.ths; o.pg.position.x = xc; o.pr.rotation.x = o.thp;
    var sn = (xc + 36 - 44) / 70; o.lev.rotation.z = Math.asin(sn);
    // cord
    var X = xc, R = o.XG, YU = o.YU;
    o.run[0].span(X, YU, R, X, 0, R); o.run[1].span(X, 0, -R, X, YU, -R);
    o.arcU.position.x = X; o.arcL.position.x = X;
    var L1 = YU, L2 = Math.PI * R, tot = 2 * YU + 2 * L2, s = ((28.5 * o.thu) % tot + tot) % tot, px, py, pz, f;
    if (s < L1) { px = X; py = YU - s; pz = R; }
    else if (s < L1 + L2) { f = (s - L1) / R; px = X; py = -R * Math.sin(f); pz = R * Math.cos(f); }
    else if (s < 2 * L1 + L2) { px = X; py = s - L1 - L2; pz = -R; }
    else { f = (s - 2 * L1 - L2) / R; px = X; py = YU + R * Math.sin(f); pz = -R * Math.cos(f); }
    o.mark.position.set(px, py, pz);
    S.set("u", Math.round(S.rpm * (S.playing ? 1 : 0)) + " rpm");
    S.set("l", Math.round(o.ws * 60 / TP) + " rpm");
    S.set("s", Math.round(-xc) + " mm");
  }
});
