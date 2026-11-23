M507.define({
  number: 278,
  title: "Hoist safety stop",
  lede: "A lift platform runs up and down between two posts lined with saw teeth. If its rope ever breaks, two catches, called holding pawls, spring out into the teeth. The platform drops only a short way and then hangs safely.",
  alt: "Two tall posts with saw teeth on their inner edges. Between them a platform frame hangs from a rope by a long pin. A curved spring sits under the top of the frame, and two bent levers (bell cranks) link the pin to two short bars that face the teeth.",
  parts: [
    { key: "platform", color: "#5E7387", name: "Platform", note: "The top part of the lift platform. It slides up and down between the posts." },
    { key: "posts", color: "#4FA58A", name: "Toothed posts", note: "Two fixed posts with saw teeth up their inner edges. Each tooth has a flat top for a catch to land on." },
    { key: "pin", color: "#C8873A", name: "Rope and pin", note: "The rope is tied to a long pin that passes down through the top of the platform. While the rope pulls, the pin stays up." },
    { key: "spring", color: "#8E7AA8", name: "Spring", note: "A bent strip of steel under the top of the platform. It pushes the pin down all the time." },
    { key: "levers", color: "#D9B13B", name: "Bell cranks", note: "Each is a lever bent at a corner, called a bell crank. It turns on a pin. One end is moved by the pin, the other end moves a catch." },
    { key: "pawls", color: "#C2503F", name: "Holding pawls", note: "Two short bars that hold the platform up. They slide in slots in the platform's sides. Watch them when the rope breaks." }
  ],
  controls: [{ id: "rope", label: "Rope", value: "whole", options: [["whole", "Whole"], ["cut", "Broken"]] }],
  speed: { min: 2, max: 20, value: 6, label: "Up and down", unit: " a min" },
  readouts: [{ id: "c", label: "Catches" }, { id: "d", label: "Drop" }],
  views: { "3d": [380, 120, 800], front: [0, 0, 960], side: [960, 0, 0] },
  target: [0, -20, 0],
  how: [
    "The rope holds up the platform by a pin. The pin pulls up against a curved spring. Its lower end holds up the inner ends of two bell cranks. So the outer ends keep the two holding pawls pulled in, clear of the teeth.",
    "If the rope breaks, nothing pulls the pin up any more. The spring pushes it down. The levers turn, and their lower ends push the holding pawls out sideways into the teeth. The platform starts to fall, but each pawl lands on the flat top of the next tooth below it.",
    "The fall is never longer than the gap between two teeth. Try breaking the rope at different moments and read how far it drops. Then mend the rope and the holding pawls pull back in."
  ],
  note: "This model is rebuilt from Brown's drawing. The floor of the platform, the brackets that carry the levers and the ground were added. The sizes, the tooth spacing and how far the platform travels are made up. In the drawing the lever ends simply meet the pin; here they ride on two small cross pins in slots, so they can swing.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, o = this.o = {
      th: 0, Y: 0, v: 0, aW: .09, aB: -.0983, a: .09, rope: "whole", landed: false, follow: true, drop: 0, yBreak: 0, lift: 0,
      PX: -91, PY: 7, LV: 56, LP: 50, TOP: 190, PITCH: 14
    };
    // ---- posts: ratchet racks turned over so each tooth's flat face is on top ----
    var mp = c.mat("posts");
    o.rack = P.ratchetRack({ length: 440, half: 22.5, depth: 7, pitch: 14, teeth: 31, sides: 1, thick: 30, material: mp });
    o.rack.rotation.x = Math.PI; P.at(o.rack, -169.5, o.TOP, 0, scene);           // x -192 .. -147 (tips -140), y -250 .. 190, z +-15
    var r2 = P.ratchetRack({ length: 440, half: 22.5, depth: 7, pitch: 14, teeth: 31, sides: 1, thick: 30, material: mp });
    r2.rotation.z = Math.PI; P.at(r2, 169.5, o.TOP, 0, scene);                      // mirror image: tips at 140
    P.at(P.box(420, 8, 80, c.fixed), 0, -254, 0, scene);                          // ground y -258 .. -250, under the posts
    // ---- platform (moves as one, origin at y = o.Y) ----
    var pf = o.pf = new T.Group(); scene.add(pf);
    var mb = c.mat("platform");
    P.at(P.box(129, 35, 20, mb), -72.5, 66.5, 0, pf); P.at(P.box(129, 35, 20, mb), 72.5, 66.5, 0, pf);   // top beam x +-137, y 49 .. 84, z +-10, hole x +-8
    P.at(P.box(16, 35, 4, mb), 0, 66.5, 8, pf); P.at(P.box(16, 35, 4, mb), 0, 66.5, -8, pf);              // front and back of the hole, z 6 .. 10
    [-1, 1].forEach(function (s) {
      P.at(P.box(25, 92.5, 20, mb), s * 124.5, 2.75, 0, pf);                      // leg x 112 .. 137, y -43.5 .. 49
      P.at(P.box(25, 11, 4, mb), s * 124.5, -49, 8, pf); P.at(P.box(25, 11, 4, mb), s * 124.5, -49, -8, pf);   // sides of the catch slot, z 6 .. 10, y -54.5 .. -43.5
      P.at(P.box(25, 109.5, 20, mb), s * 124.5, -109.25, 0, pf);                  // leg y -164 .. -54.5
      P.at(P.box(28, 14, 20, mb), s * 98, 7, 0, pf);                              // lever bracket x 84 .. 112 against the leg's inner face, y 0 .. 14
      P.at(P.cylZ(3, 5.5, c.mat("platform", "dark")), s * 91, 7, 12.75, pf);       // lever pin z 10 .. 15.5
    });
    P.at(P.box(274, 10, 80, mb), 0, -169, 0, pf);                                 // floor y -174 .. -164, z +-40
    // ---- pin, eye and rope ----
    var mpin = c.mat("pin");
    o.pin = new T.Group(); pf.add(o.pin);
    P.at(P.box(32, 16, 10, mpin), 0, -2, 0, o.pin);                               // block y -10 .. 6 around the pin's level, z +-5
    P.at(P.box(13, 114, 9, mpin), 0, 63, 0, o.pin);                               // strap y 6 .. 120, x +-6.5, z +-4.5 (hole +-8, +-6)
    P.at(P.box(20, 4, 19, mpin), 0, 21, 4.5, o.pin);                              // collar under the spring, y 19 .. 23, z -5 .. 14
    P.at(P.hook({ radius: 12, tube: 3.5, material: mpin }), 0, 132, 0, o.pin);    // eye; its bottom rod (y 116.5 .. 123.5) takes the strap's top
    [-1, 1].forEach(function (s) { P.at(P.cylZ(2.5, 10.5, c.mat("pin", "dark")), s * 10, 0, 10.25, o.pin); });   // cross pins z 5 .. 15.5
    o.ropeLo = P.at(P.rod(3, mpin), 0, 0, 0, scene); o.ropeHi = P.at(P.rod(3, mpin), 0, 0, 0, scene);
    // ---- spring: a bent strip whose ends press up on the beam (49) and middle presses down on the collar ----
    o.springPts = function (sag) { var p = []; for (var k = 0; k <= 24; k++) { var x = -95 + k * 190 / 24; p.push([x, 47 - sag * (1 - x * x / 9025)]); } return p; };
    o.spring = P.flatStrip({ points: o.springPts(8), thick: 4, width: 8, material: c.mat("spring") });
    o.spring.position.z = 9.5; o.spring.userData.live = true; pf.add(o.spring);   // z 5.5 .. 13.5
    // ---- levers (z 10.5 .. 14.5) and catches ----
    o.levers = []; o.pawls = [];
    var ml = c.mat("levers");
    [-1, 1].forEach(function (s) {
      var mir = new T.Group(); mir.scale.x = -s; pf.add(mir);                     // left side drawn as s = -1; the right side is its mirror
      var lv = new T.Group(); lv.position.set(o.PX, o.PY, 12.5); mir.add(lv);
      lv.add(P.armPlate({ length: 85, r0: 7, r1: 5, thick: 4, slot: { from: 79, to: 83, width: 5.4 }, material: ml }));   // to the cross pin at x -10
      var lo = P.armPlate({ length: o.LV, r0: 7, r1: 5, thick: 4, material: ml }); lo.rotation.z = -Math.PI / 2; lv.add(lo);
      P.at(P.cylZ(2.5, 10, c.mat("levers", "dark")), 0, -o.LV, -2, lv);          // pin into the catch, z 5.5 .. 15.5
      var ps = new T.Shape(); ps.moveTo(0, -5); ps.lineTo(56, -5); ps.lineTo(56, 5); ps.lineTo(5, 5); ps.closePath();   // nose cut back at the slope of the teeth
      var pg = new T.ExtrudeGeometry(ps, { depth: 11, bevelEnabled: false }); pg.translate(0, 0, -5.5);
      var pw = new T.Mesh(pg, c.mat("pawls")); pw.position.set(0, -49, 0); mir.add(pw);   // y -54 .. -44, z +-5.5; x from the nose
      o.levers.push(lv); o.pawls.push(pw);
    });
  },

  surf: function (o, y) {                                                          // x of the left post's toothed face at height y (platform coordinates are added by the caller)
    return -169.5 + o.rack.edgeAt(o.TOP - y);
  },

  step: function (c, dt, S) {
    var o = this.o, n = 20, h = (S.playing ? dt : 0) / n, i, self = this;
    var mode = S.controls.rope;
    if (mode !== o.rope) {
      o.rope = mode;
      if (mode === "cut") { o.yBreak = o.Y; o.v = 0; o.landed = false; o.follow = false; o.lift = 0; }
    }
    function tipOf(a) { return o.PX + o.LV * Math.sin(a) - o.LP; }
    function blocked(Y) {                                                          // the furthest out the catch can be, given the teeth beside it
      var top = Y - 44, bot = Y - 54, m = -1e9, k, y;                               // the nose's face runs from (tip, bot) to (tip + 5, top)
      for (k = 0; k <= 20; k++) { y = bot + .01 + k * .499; m = Math.max(m, self.surf(o, y) - .5 * (y - bot)); }
      var nTop = Math.floor((o.TOP - bot) / o.PITCH), yl = o.TOP - nTop * o.PITCH; // a tooth top inside the catch's height?
      if (yl > bot && yl < top) m = Math.max(m, -140 - .5 * (yl - bot));
      return m + .3;
    }
    for (i = 0; i < n && h > 0; i++) {
      if (o.rope === "whole") {
        o.th += S.w * h;
        o.a = Math.min(o.aW, o.a + 2 * h);                                          // the rope pulls the pin up, the catches come in
        var hy = 30 * Math.sin(o.th);
        if (o.follow) o.Y = hy;
        else { var st = 60 * h; o.Y += Math.max(-st, Math.min(st, hy - o.Y)); if (Math.abs(hy - o.Y) < 1e-3) o.follow = true; }
        o.v = 0; o.landed = false; o.lift += 400 * h;
      } else {
        var a = Math.max(o.aB, o.a - 4 * h);                                        // the spring pushes the pin down
        if (!o.landed) {
          o.v += 980 * h; var Y1 = o.Y - o.v * h;
          var ledge = o.TOP - Math.ceil((o.TOP - (o.Y - 54)) / o.PITCH - 1e-9) * o.PITCH;   // next tooth top at or below the catch
          if (tipOf(a) < -140 && Y1 - 54 <= ledge && o.Y - 54 >= ledge) { Y1 = ledge + 54; o.v = 0; o.landed = true; }
          o.Y = Y1;
        }
        var lim = blocked(o.Y);
        if (tipOf(a) < lim) a = Math.asin((lim + o.LP - o.PX) / o.LV);
        o.a = a; o.lift += 400 * h;
      }
    }
    if (o.rope === "whole" && o.lift > 400) o.lift = 400;
    // place everything
    var yb = o.PY + 81 * Math.tan(o.a);                                             // height of the cross pins
    o.pf.position.y = o.Y;
    o.pin.position.y = yb;
    o.spring.setPoints(o.springPts(47 - (yb + 25.5)));                             // middle rests on the collar top (yb + 23)
    o.levers.forEach(function (l) { l.rotation.z = o.a; });
    var tip = tipOf(o.a);
    o.pawls.forEach(function (p) { p.position.x = tip; });
    var ey = o.Y + yb + 141;                                                        // rope tied into the top of the eye
    if (o.rope === "whole") { o.ropeLo.visible = true; o.ropeLo.span(0, ey, 0, 0, 260, 0); o.ropeHi.visible = false; o.lift = 0; }
    else {
      o.ropeLo.span(0, ey, 0, 0, ey + 22, 0);                                       // the broken end left on the eye
      var b = o.yBreak + 141 + o.PY + 81 * Math.tan(o.aW) + 40 + o.lift;           // the rest of the rope springs up and away
      o.ropeHi.visible = b < 255; if (b < 255) o.ropeHi.span(0, b, 0, 0, 260, 0);
    }
    S.set("c", o.rope === "whole" ? (tip > -137 ? "pulled in" : "pulling in") : o.landed ? "holding" : "pushed out");
    S.set("d", (o.rope === "whole" ? 0 : o.yBreak - o.Y).toFixed(1) + " cm");
  }
});
