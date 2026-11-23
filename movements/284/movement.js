(function () {
  // Flat layout in model units, wheel centre at the origin, as in Brown's drawing.
  var DEG = Math.PI / 180, TAU = 2 * Math.PI;
  var NW = 60, RT = 105, DP = 6, RR = RT - DP, ST = TAU / NW;     // ratchet wheel: teeth, tip radius, depth, root radius, pitch angle
  var MD = 6, NP = 12, RPN = NP * MD / 2;                         // pinion: module, teeth, pitch radius 36
  var F = [0, 265], LA = 375;                                      // bell crank fulcrum and the length of its level arm
  var CS = [365, -110], CR = 75, CA0 = 172.4 * DEG;               // crank shaft, radius, angle as drawn
  var KN = 132 * DEG, KP = [RR * Math.cos(KN) + 40 * Math.sin(KN) + 40 * Math.cos(KN), RR * Math.sin(KN) - 40 * Math.cos(KN) + 40 * Math.sin(KN)];
  var LK = 40 * Math.SQRT2;                                        // click: pivot 40 back along the rim and 40 out from its nose as drawn
  var H0 = 75, NOSE0 = 12 * DEG;                                   // pawl pin as drawn: distance below the fulcrum; nose angle on the wheel
  var WRAP = 9 * TAU / NP;                                         // the bed runs 9 pinion teeth (45 ratchet teeth), then is put back
  var LR = (function () { var k = [CS[0] + CR * Math.cos(CA0), CS[1] + CR * Math.sin(CA0)]; return Math.hypot(F[0] + LA - k[0], F[1] - k[1]); })();
  var Q0 = [F[0] + 5, F[1] - H0], N0 = [RR * Math.cos(NOSE0), RR * Math.sin(NOSE0)], LC = Math.hypot(N0[0] - Q0[0], N0[1] - Q0[1]);

  function rimAt(a) { var f = -a / ST + 1e-9; f -= Math.floor(f); return RR + DP * f; }   // same as P.ratchet with reverse: true
  function meet(c, r1, q, r2, side) {                              // where circle (c, r1) meets circle (q, r2); side picks one of the two
    var dx = q[0] - c[0], dy = q[1] - c[1], d = Math.hypot(dx, dy), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    var ux = dx / d, uy = dy / d;
    return [c[0] + a * ux + side * h * uy, c[1] + a * uy - side * h * ux];
  }
  function bell(phi, al) {                                         // bell crank angle for crank angle phi (Newton from the last angle)
    var k = [CS[0] + CR * Math.cos(phi), CS[1] + CR * Math.sin(phi)];
    for (var i = 0; i < 12; i++) {
      var ex = F[0] + LA * Math.cos(al) - k[0], ey = F[1] + LA * Math.sin(al) - k[1], g = Math.hypot(ex, ey) - LR;
      var dg = (-ex * LA * Math.sin(al) + ey * LA * Math.cos(al)) / Math.hypot(ex, ey);
      al -= g / dg; if (Math.abs(g) < 1e-9) break;
    }
    return { al: al, k: k, e: [F[0] + LA * Math.cos(al), F[1] + LA * Math.sin(al)] };
  }
  function catchPin(al, h) { return [F[0] + 5 * Math.cos(al) + h * Math.sin(al), F[1] + 5 * Math.sin(al) - h * Math.cos(al)]; }
  function noseOn(q, r) { return meet([0, 0], r, q, LC, 1); }   // the meeting point on the right of the wheel
  function seat(pivot, len, side, th, guess) {                      // a nose resting on the toothed rim: iterate on the rim radius
    var n = guess, r = RR;
    for (var i = 0; i < 30; i++) { n = meet([0, 0], r, pivot, len, side); r = rimAt(Math.atan2(n[1], n[0]) - th); }
    return n;
  }

  function catchShape() {                                          // the pawl in its own frame: pivot at the origin, nose at (LC, 0), the wheel on the -Y side
    var q = catchPin(0, H0), n = N0, ex = (n[0] - q[0]) / LC, ey = (n[1] - q[1]) / LC, i, t;
    function loc(vx, vy) { return [vx * ex + vy * ey, -vx * ey + vy * ex]; }   // world direction to pawl frame
    var rh = loc(Math.cos(NOSE0), Math.sin(NOSE0)), th = loc(-Math.sin(NOSE0), Math.cos(NOSE0));
    function at(a, b) { return [LC + a * th[0] + b * rh[0], a * th[1] + b * rh[1]]; }   // a along the rim (forward), b outward
    var claw = [at(0, 0), at(-3.9, 11.4), at(-12, 15), at(-6, 5.4)];   // face leans back, so it stays clear of the tooth at every screw setting
    var j0 = at(-3, 13), mid = [LC * .5, 58], cp = [];
    for (i = 0; i <= 24; i++) { t = i / 24; cp.push([2 * t * (1 - t) * mid[0] + t * t * j0[0], 2 * t * (1 - t) * mid[1] + t * t * j0[1]]); }
    [at(-10, 19), at(-18, 26), at(-15, 36), at(-6, 37)].forEach(function (p) { cp.push(p); });   // the curl at the end, clear of the teeth
    return { claw: claw, strip: cp };
  }

  function clickShape() {                                          // the click in its own frame: pivot at the origin, nose at (LK, 0)
    var n = [RR * Math.cos(KN), RR * Math.sin(KN)], ex = (n[0] - KP[0]) / LK, ey = (n[1] - KP[1]) / LK;
    function loc(vx, vy) { return [vx * ex + vy * ey, -vx * ey + vy * ex]; }
    var rh = loc(Math.cos(KN), Math.sin(KN)), th = loc(-Math.sin(KN), Math.cos(KN));
    function at(a, b) { return [LK + a * th[0] + b * rh[0], a * th[1] + b * rh[1]]; }
    return [at(0, 0), at(-1.5, 8.5), at(-35, 45), at(-45, 35)];      // face leans back a little; the inner edge climbs faster than the slope
  }

  // the feed simulation: the pawl drags a tooth face forward; it slides back over the slopes; the click stops any return
  function Feed(h) {
    this.phi = CA0; this.al = 0; this.h = h; this.th = 0; this.total = 0; this.strokes = []; this.last = null;
    var b = bell(this.phi, 0); this.al = b.al;
    var n = noseOn(catchPin(this.al, h), RR), u = Math.atan2(n[1], n[0]);
    this.th = u - Math.round(u / ST) * ST;                          // as drawn: the pawl rests against a face
    this.kf = Math.round((u - this.th) / ST);
    this.u = u; this.du = 0; this.gain = 0;
  }
  Feed.prototype.step = function (dphi, h) {
    if (h !== this.h) {                                            // the screw moved the pawl pin: the pawl drops behind the face it is now beside
      this.h = h; var q = catchPin(this.al, h), n = noseOn(q, RR);
      this.u = Math.atan2(n[1], n[0]); this.kf = Math.ceil((this.u - this.th) / ST - 1e-9);
    }
    this.phi += dphi;
    var b = bell(this.phi, this.al); this.al = b.al;
    var q = catchPin(b.al, h), n = noseOn(q, RR), u = Math.atan2(n[1], n[0]), lam = u - this.th;
    if (lam > this.kf * ST) { var d = u - this.kf * ST - this.th; this.th += d; this.total += d; this.gain += d; }
    else this.kf = Math.ceil(lam / ST - 1e-9);
    var du = u - this.u;
    if (this.du > 0 && du < 0) { this.last = this.gain; this.gain = 0; }   // the pull has ended: count what it moved
    if (du !== 0) this.du = du;
    this.u = u;
    if (this.th > WRAP) { this.th -= WRAP; this.kf -= 45; }
    return { b: b, q: q };
  };

  M507.define({
    number: 284,
    title: "Saw-bed feed",
    lede: "This moves the bed of a sawing machine forward a little at a time, so the log on it is fed to the saw. A turning crank rocks a lever. A pawl on the lever pulls a toothed wheel round a tooth or two at each rock.",
    alt: "A long bed with a toothed bar under its front edge rests on a frame. A big wheel with saw teeth and four spokes turns in front, with a small gear behind it meshing with the toothed bar. A crank at the bottom right drives a long rod up to an L-shaped lever hinged at the top left. A curved pawl hangs from the upright arm of the lever and hooks onto the right side of the wheel. A short holding pawl on the left rests on the teeth.",
    parts: [
      { key: "crank", color: "#5E7387", name: "Crank and connecting rod", note: "The crank turns steadily. Its connecting rod pulls the lever's level arm down and pushes it up again." },
      { key: "lever", color: "#D9B13B", name: "Bell crank", note: "An L-shaped lever hinged at its corner, called a bell crank. Its level arm goes up and down, so its upright arm swings left and right. A screw inside the upright arm sets where the pawl hangs." },
      { key: "catch", color: "#C2503F", name: "Pawl", note: "A curved hook, called a pawl, that hangs from the bell crank. Its tip drops into the teeth and drags the wheel round, then slides back over them. Watch it work." },
      { key: "wheel", color: "#C8873A", name: "Ratchet wheel and gear", note: "A wheel with saw teeth, called a ratchet. A small gear on the same shaft, behind it, turns with it." },
      { key: "click", color: "#4FA58A", name: "Holding pawl", note: "A short stop, called a holding pawl, that rests on the teeth. It lets the wheel go forward and stops it slipping back while the pawl returns." },
      { key: "bed", color: "#8E7AA8", name: "Bed and rack", note: "The bed slides along the frame. The toothed bar under its edge, called a rack, is driven by the small gear, so the bed creeps to the left." }
    ],
    controls: [{ type: "range", id: "h", label: "Catch pin below the hinge", min: 52, max: 104, step: 1, value: 75, unit: " mm",
      presets: [[52, "Short"], [75, "As drawn"], [103, "Long"]] }],
    speed: { min: 4, max: 40, value: 15, label: "Crank speed", unit: " rpm" },
    readouts: [{ id: "feed", label: "Last pull" }, { id: "bed", label: "Bed fed" }],
    views: { "3d": [420, 190, 1080], front: [130, 40, 1120], side: [1050, 60, -40] },
    target: [130, 60, -30],
    how: [
      "The crank goes round and its rod pulls the level arm of the bell crank down, then pushes it up. So the upright arm swings left and right. The pawl hangs from that arm. When the arm swings left, the pawl is pulled up and its tip drags a tooth of the wheel with it.",
      "When the arm swings back, the tip slides down over the sloping backs of the teeth and drops in behind a new one. The holding pawl on the left keeps the wheel from going back with it. The small gear on the wheel's shaft rolls the rack, so the bed moves on a little after every turn of the crank.",
      "The screw sets how far below the hinge the pawl hangs. Lower down, the arm swings farther, so the pawl drags more teeth each time. Try the short setting and watch the pawl slide back and forth without moving the wheel. Then try the long one."
    ],
    note: "This model is rebuilt from Brown's drawing. The frame, the ways the bed slides on, the studs and the number of teeth were made up. Brown's screw is read as one that raises and lowers the pawl pin in a slot in the upright arm. The thing that turns the crank is left out. When the bed reaches the end of its run, the model puts it back at the start.",

    Feed: Feed, geo: { clickShape: clickShape, catchShape: catchShape, rimAt: rimAt, seat: seat, catchPin: catchPin, noseOn: noseOn, bell: bell, LC: LC, KP: KP, LK: LK, RR: RR, RT: RT, ST: ST, F: F },

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed, i;
      var o = this.o = { sim: new Feed(H0), T: T };
      // frame (all behind the moving parts)
      P.at(P.box(620, 10, 120, fx), 160, -200, -50, scene);           // ground x -150..470, y -205..-195, z -110..10
      P.at(P.box(55, 435, 39, fx), -57.5, 22.5, -80.5, scene);        // post x -85..-30, y -195..240 (on the ground), z -100..-61
      P.at(P.box(105, 50, 39, fx), -32.5, 265, -80.5, scene);         // bracket for the hinge x -85..20, y 240..290 (on the post top), z -100..-61
      P.at(P.box(440, 65, 69, fx), 190, -17.5, -65.5, scene);         // frame beam x -30..410 (from the post's face), y -50..15, z -100..-31
      P.at(P.box(440, 50, 29, fx), 190, 40, -45.5, scene);            // way x -30..410, y 15..65 (on the beam), z -60..-31; the bed slides on its top
      P.at(P.box(60, 145, 69, fx), 380, -122.5, -65.5, scene);        // right leg x 350..410, y -195..-50 (ground to beam), z -100..-31
      P.at(P.cylZ(6, 69, fx), F[0], F[1], -26.5, scene);              // hinge stud z -61..8, bracket face to bell crank back
      P.at(P.cylZ(5, 55, fx), KP[0], KP[1], -33.5, scene);            // click stud z -61..-6, post face to click back

      // bed and rack (slide together)
      o.bed = P.at(new T.Group(), 0, 0, 0, scene);
      P.at(P.box(560, 35, 42, c.mat("bed")), 155, 82.5, -39, o.bed);  // bed x -125..435, y 65..100 (on the way top), z -60..-18
      var rk = P.rack({ teeth: 29, module: MD, side: 1, body: 21.5, thick: 12, material: c.mat("bed") });
      rk.rotation.z = -Math.PI / 2; P.at(rk, -6 * rk.pitch, RPN, -24, o.bed);   // pitch line y 36, roots 43.5, back 65 (bed bottom), z -30..-18
      P.at(P.box(6, 30, 1, c.mat("bed", "dark")), 400, 82.5, -17.5, o.bed);      // mark on the bed's front, 1 off its face

      // ratchet wheel, pinion and shaft
      o.wheel = P.at(new T.Group(), 0, 0, 0, scene);
      var mw = c.mat("wheel");
      o.wheel.add(P.ratchet({ teeth: NW, radius: RT, depth: DP, width: 12, bore: 80, reverse: true, material: mw }));   // ring z -6..6
      o.wheel.add(P.cylZ(26, 16, mw));                                 // hub z -8..8
      for (i = 0; i < 4; i++) { var s = P.box(58, 14, 10, mw); s.position.set(53 * Math.cos(i * Math.PI / 2 + Math.PI / 4), 53 * Math.sin(i * Math.PI / 2 + Math.PI / 4), 0); s.rotation.z = i * Math.PI / 2 + Math.PI / 4; o.wheel.add(s); }   // spokes r 24..82, into hub and ring
      P.at(P.spurGear({ teeth: NP, module: MD, width: 12, material: mw }), 0, 0, -24, o.wheel);   // pinion z -30..-18, a tooth points up
      P.at(P.cylZ(8, 23, mw), 0, 0, -19.5, o.wheel);                  // shaft z -31..-8, beam face to hub back
      P.at(P.cylZ(10, 1, c.mat("wheel", "dark")), 0, 0, 8.5, o.wheel);  // cap on the hub, z 8..9

      // click
      var ks = new T.Shape(); clickShape().forEach(function (p, k) { if (k) ks.lineTo(p[0], p[1]); else ks.moveTo(p[0], p[1]); });
      var kg = new T.ExtrudeGeometry(ks, { depth: 10, bevelEnabled: false }); kg.translate(0, 0, -5);
      o.click = P.at(new T.Group(), KP[0], KP[1], 0, scene);
      o.click.add(new T.Mesh(kg, c.mat("click")));                      // z -5..5
      o.click.add(P.cylZ(8, 12, c.mat("click")));                       // boss z -6..6
      P.at(P.cylZ(4, 1, c.mat("click", "dark")), 0, 0, 6.5, o.click);   // pin head z 6..7

      // crank, rod and bell crank
      var mc = c.mat("crank");
      o.crank = P.at(new T.Group(), CS[0], CS[1], 0, scene);
      P.at(P.armPlate({ length: CR, r0: 13, r1: 9, thick: 10, material: mc }), 0, 0, 13, o.crank);   // arm z 8..18
      P.at(P.cylZ(4, 8.5, mc), CR, 0, 22.25, o.crank);                // crank pin z 18..26.5, through the rod's eye
      P.at(P.cylZ(7, 2, c.mat("crank", "dark")), CR, 0, 27.5, o.crank);   // head z 26.5..28.5
      P.at(P.cylZ(7, 39, fx), CS[0], CS[1], -11.5, scene);            // crank shaft z -31..8, leg face to arm back
      o.rod = P.at(P.rod(4, mc), 0, 0, 0, scene);
      o.eyeA = P.at(P.cylZ(8, 6, mc), 0, 0, 23.5, scene); o.eyeB = P.at(P.cylZ(8, 6, mc), 0, 0, 23.5, scene);   // rod eyes z 20.5..26.5

      var ml = c.mat("lever");
      o.bell = P.at(new T.Group(), F[0], F[1], 0, scene);             // bell crank z 8..20
      P.at(P.armPlate({ length: LA, r0: 14, r1: 10, thick: 11, material: ml }), 0, 0, 14, o.bell);   // level arm z 8.5..19.5, inside the upright arm's faces
      P.at(P.cylZ(4, 6.5, ml), LA, 0, 22.75, o.bell);                 // pin for the rod z 19.5..26
      P.at(P.cylZ(7, 2, c.mat("lever", "dark")), 0, 0, 21, o.bell);   // hinge cap z 20..22
      P.at(P.box(15, 160, 12, ml), -12.5, -55, 14, o.bell);           // upright arm, left side x -20..-5, y -135..25
      P.at(P.box(15, 160, 12, ml), 22.5, -55, 14, o.bell);            // right side x 15..30
      P.at(P.box(50, 10, 12, ml), 5, -140, 14, o.bell);               // foot y -145..-135, joins the sides
      P.at(P.box(20, 35, 12, ml), 5, 7.5, 14, o.bell);                // head between the sides, y -10..25, round the hinge
      o.screw = P.at(new T.Group(), 5, 0, 14, o.bell);
      P.at(P.cylY(3.5, 159, c.mat("lever", "light")), 0, -55.5, 0, o.screw);   // screw y -135..24, foot to head
      for (i = 0; i < 24; i++) P.at(P.hoop(3.6, .9, c.mat("lever", "dark")), 0, -132 + i * 5, 0, o.screw).rotation.x = Math.PI / 2;   // thread
      P.at(P.cylY(3.5, 18, c.mat("lever", "light")), 0, 34, 0, o.screw);   // stem above the head, y 25..43
      var eye = P.hook({ material: c.mat("lever", "light") }); P.at(eye, 0, 52, 0, o.screw);   // turning eye
      o.nut = P.at(new T.Group(), 5, -H0, 0, o.bell);
      P.at(P.box(19, 16, 11, ml), 0, 0, 14, o.nut);                   // nut x -4.5..14.5 (0.5 clear of the sides), z 8.5..19.5
      P.at(P.cylZ(4, 22.5, c.mat("catch")), 0, 0, 8.75, o.nut);        // catch pin z -2.5..20, into the head
      P.at(P.cylZ(7, 2, c.mat("catch", "dark")), 0, 0, 20.5, o.nut);  // head z 19.5..21.5

      // catch: built in its own frame, pivot at the origin, nose at (LC, 0), the wheel on the -Y side
      var cs = catchShape(), claw = cs.claw, cp = cs.strip;
      var sh = new T.Shape(); claw.forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
      var cg = new T.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false }); cg.translate(0, 0, -6);
      o.catchG = P.at(new T.Group(), 0, 0, 0, scene);
      o.catchG.add(new T.Mesh(cg, c.mat("catch")));
      o.catchG.add(P.flatStrip({ points: cp, thick: 9, width: 11, material: c.mat("catch") }));
      o.catchG.add(P.cylZ(9, 12, c.mat("catch")));                     // boss round the pin, z -6..6
      o.catchPts = { claw: claw, strip: cp };
      this.place();
    },

    place: function () {
      var o = this.o, s = o.sim;
      var b = bell(s.phi, s.al), q = catchPin(b.al, s.h);
      o.bell.rotation.z = b.al;
      o.nut.position.y = -s.h;
      o.screw.rotation.y = -s.h * .6;                                  // the screw turns as the pin is moved
      o.crank.rotation.z = s.phi;
      o.rod.span(b.e[0], b.e[1], 23.5, b.k[0], b.k[1], 23.5);
      o.eyeA.position.set(b.e[0], b.e[1], 23.5); o.eyeB.position.set(b.k[0], b.k[1], 23.5);
      var n = seat(q, LC, 1, s.th);
      o.catchG.position.set(q[0], q[1], 0); o.catchG.rotation.z = Math.atan2(n[1] - q[1], n[0] - q[0]);
      o.wheel.rotation.z = s.th;
      o.bed.position.x = -RPN * s.th;
      var m = seat(KP, LK, -1, s.th);
      o.click.rotation.z = Math.atan2(m[1] - KP[1], m[0] - KP[0]);
    },

    step: function (c, dt, S) {
      var o = this.o, h = +S.controls.h;
      if (dt > 0 || h !== o.sim.h) {
        var n = Math.max(1, Math.ceil(S.w * dt / .02));
        for (var i = 0; i < n; i++) o.sim.step(S.w * dt / n, h);
      }
      this.place();
      var last = o.sim.last;
      S.set("feed", last === null ? "–" : Math.round(last / ST) + (Math.round(last / ST) === 1 ? " tooth" : " teeth"));
      S.set("bed", Math.round(RPN * o.sim.total) + " mm");
    }
  });
})();
