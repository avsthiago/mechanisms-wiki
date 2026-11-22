M507.define({
  number: 261,
  title: "Weight with a short down-stroke",
  lede: "A turning disc makes a weight bob up and down on a cord. The cord is also wound onto a drum on the disc. So each rise is longer than each fall, and the weight climbs a little with every turn.",
  alt: "A disc turns on a bracket fixed to a wall. A link joins a pin on the disc to an arm that swings from a pivot high on the wall. A pulley on the end of the arm carries a cord. One end of the cord hangs down to a weight, the other runs down to a drum on the disc.",
  parts: [
    { key: "disc", color: "#5E7387", name: "Disc", note: "Turns on a bracket fixed to the wall. A crank pin on it drives the link." },
    { key: "link", color: "#D9B13B", name: "Link", note: "Joins the crank pin to the swinging arm, so the arm rocks up and down once each turn." },
    { key: "arm", color: "#C8873A", name: "Swinging arm and pulley", note: "Pivots high on the wall and carries the pulley on its far end. The cord runs over the pulley." },
    { key: "drum", color: "#4FA58A", name: "Drum", note: "A small drum on the front of the disc. It winds in the cord as it turns. Watch the red stripe on its edge." },
    { key: "cord", color: "#E8E2D0", name: "Cord", note: "Tied to the drum, over the pulley and down to the weight." },
    { key: "w", color: "#8E7AA8", name: "Weight", note: "Hangs on the cord. Watch how far it rises and how far it falls." }
  ],
  controls: [{ id: "end", label: "Cord end", value: "drum", options: [["drum", "On the turning drum"], ["still", "Held still"]] }],
  readouts: [{ id: "u", label: "Last rise" }, { id: "d", label: "Last fall" }],
  views: { "3d": [-400, 140, 660], front: [0, 15, 770], side: [770, 15, 0] },
  target: [0, 15, 0],
  how: [
    "Turn the disc and the link rocks the arm up and down. The pulley on the arm lifts the cord and lets it down again. The weight bobs up and down, much farther than the pulley moves.",
    "When the pulley rises, it takes up cord on both sides of it at once. So the weight rises twice as far as the pulley. At the same time the drum keeps winding in a little cord on every turn. That adds to each rise and takes away from each fall, so the weight creeps upward.",
    "Try Held still and the drum stops, as if the cord were tied to a nail. Now the rise and the fall are equal. Then go back to On the turning drum and compare the readouts."
  ],
  note: "This model is rebuilt from Brown's drawing. The sizes, the wall and the brackets were made up. Held still stops the drum, which is the same as Brown's idea of tying the cord to a fixed point. Wound on the drum, the weight would soon reach the pulley, so the model turns the disc backwards when it gets close. Then the falls are longer than the rises until the weight is low again.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, ZC = 13;                         // the cord runs in the plane z = 13
    var o = this.o = {
      G: [88.2, 109.2], B: [7.2, -93], rc: 27.6, LA: 99.09, LE: 154, rE: 37, rd: 17,
      th: 0, tie: 4 * Math.PI, dir: 1, yH: -120, ext: null, last: 0, mode: "drum", ZC: ZC
    };
    var J0 = [-10.8, 105], p0 = [o.B[0] + o.rc, o.B[1]];                        // joint and crank pin as drawn
    o.LC = Math.hypot(J0[0] - p0[0], J0[1] - p0[1]);                            // link length, 203.2

    // disc z 0..6, drum z 6..20 (barrel z 8..18), crank arm z 21.5..25.5 (clear of the drum stripe), pin z 25.5..31; axle z -2..25.5
    o.disc = new T.Group(); o.disc.position.set(o.B[0], o.B[1], 0); scene.add(o.disc);
    P.at(P.cylZ(39, 6, c.mat("disc")), 0, 0, 3, o.disc);
    P.at(P.cylZ(4, 27.5, c.mat("disc")), 0, 0, 11.75, o.disc);                 // axle z -2..25.5, from the bracket face to the crank arm face
    var ca = P.armPlate({ length: o.rc, r0: 6, r1: 4.5, thick: 4, material: c.mat("disc") }); P.at(ca, 0, 0, 23.5, o.disc);
    P.at(P.cylZ(2.5, 5.5, c.mat("disc")), o.rc, 0, 28.25, o.disc);              // crank pin z 25.5..31
    o.drum = new T.Group(); o.drum.position.set(o.B[0], o.B[1], ZC); scene.add(o.drum);
    o.drum.add(P.drum({ radius: 15.8, length: 10, flange: 4, flangeThick: 2, material: c.mat("drum"), mark: c.mat("drum", "mark") }));   // z 6..20, front flange stripe z 20..21.5
    P.at(P.cylZ(17, 9.6, c.mat("cord")), 0, 0, 0, o.drum);                    // cord wound on the barrel, r 17

    // swinging arm z 20.5..24.5 from the pivot, pulley z 8..18 on an axle z 6..20.5
    o.arm = P.armPlate({ length: o.LE, r0: 7, r1: 6, thick: 4, material: c.mat("arm") }); P.at(o.arm, o.G[0], o.G[1], 22.5, scene);
    o.armAxle = P.at(P.cylZ(3.5, 14.5, c.mat("arm")), 0, 0, 13.25, scene);
    o.pul = P.at(P.sheave({ radius: o.rE, width: 10, material: c.mat("arm"), holes: c.mat("arm", "dark") }), 0, 0, ZC, scene);
    P.at(P.cylZ(3, 6, c.mat("arm", "dark")), o.G[0], o.G[1], 24, scene);   // pivot pin z 20.5..27, fixed
    // link z 26..30, pin through it and the arm z 20.5..31
    o.link = P.at(P.armPlate({ length: o.LC, r0: 4.5, thick: 4, material: c.mat("link") }), 0, 0, 28, scene);
    o.jpin = P.at(P.cylZ(2.5, 10, c.mat("link")), 0, 0, 26, scene);

    // cord: hanging part, span from pulley to drum, wrap on the pulley (rebuilt each frame)
    o.hang = P.rod(1.2, c.mat("cord")); scene.add(o.hang);
    o.span = P.rod(1.2, c.mat("cord")); scene.add(o.span);
    o.wrap = P.arc(o.rE, 1.2, 2, c.mat("cord")); o.wrap.position.z = ZC; o.wrap.userData.live = true; scene.add(o.wrap);

    // weight: ring top at yH, box below
    o.W = new T.Group(); scene.add(o.W);
    P.at(P.hook({ radius: 5, tube: 1.5, material: c.mat("w") }), 0, -5, 0, o.W);  // ring y -11.5..1.5 about its top
    P.at(P.box(28, 45, 20, c.mat("w")), 0, -32.5, 0, o.W);                       // box y -55..-10, the ring sunk into its top

    // wall x 105..113 and brackets (c.fixed)
    P.at(P.box(8, 420, 70, c.fixed), 109, -10, 5, scene);                       // wall x 105..113, y -220..200, z -30..40
    P.at(P.box(8, 34, 24, c.fixed), 101, 109, 18, scene);                       // top plate x 97..105, y 92..126, z 6..30
    P.at(P.box(17, 14, 10.5, c.fixed), 88.5, 109, 15.25, scene);                // pivot block x 80..97, y 102..116, z 10..20.5, the arm rests on its face
    P.at(P.box(8, 60, 16, c.fixed), 101, -102, -6, scene);                      // lower plate x 97..105, y -132..-72, z -14..2
    var sh = new T.Shape();                                                      // disc bracket: arm y -98..-88 from a boss round the axle, web down to the plate
    sh.moveTo(7, -101); sh.absarc(7, -93, 8, -Math.PI / 2, Math.PI / 2, true); sh.lineTo(97, -85);
    sh.lineTo(97, -132); sh.quadraticCurveTo(62, -126, 50, -101); sh.lineTo(7, -101);
    var br = P.mesh(new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false }), c.fixed); br.position.z = -12; scene.add(br);   // z -12..-2, axle starts at -2
    o.cordLen = null;
  },

  // positions of every part for disc angle th; cord length decides the weight height
  pose: function (th) {
    var o = this.o, B = o.B, G = o.G;
    var p = [B[0] + o.rc * Math.cos(th), B[1] + o.rc * Math.sin(th)];
    var dx = p[0] - G[0], dy = p[1] - G[1], d = Math.hypot(dx, dy);
    var a = (o.LA * o.LA - o.LC * o.LC + d * d) / (2 * d), h = Math.sqrt(Math.max(0, o.LA * o.LA - a * a));
    var mx = G[0] + a * dx / d, my = G[1] + a * dy / d, J1 = [mx + h * dy / d, my - h * dx / d], J2 = [mx - h * dy / d, my + h * dx / d];
    var J = J1[1] > J2[1] ? J1 : J2, al = Math.atan2(J[1] - G[1], J[0] - G[0]);
    var E = [G[0] + o.LE * Math.cos(al), G[1] + o.LE * Math.sin(al)];
    var ex = B[0] - E[0], ey = B[1] - E[1], D = Math.hypot(ex, ey), be = Math.atan2(ey, ex) + Math.acos((o.rE + o.rd) / D);   // crossed tangent
    var n = [Math.cos(be), Math.sin(be)], T1 = [E[0] + o.rE * n[0], E[1] + o.rE * n[1]], T2 = [B[0] - o.rd * n[0], B[1] - o.rd * n[1]];
    var spanL = Math.hypot(T2[0] - T1[0], T2[1] - T1[1]);
    return { p: p, J: J, al: al, E: E, be: be, T1: T1, T2: T2, rest: o.rE * (Math.PI - be) + spanL };   // cord from the pulley's left side to the drum
  },

  step: function (c, dt, S) {
    var o = this.o, mode = S.controls.end || "drum";
    function onDrum(q, tie) { return o.rd * (tie - (q.be + Math.PI)); }        // cord wound on the drum, from the leaving point to the tied end
    if (o.cordLen === null) { var q0 = this.pose(o.th); o.cordLen = (q0.E[1] - o.yH) + q0.rest + onDrum(q0, o.tie); }
    var d = o.dir * S.w * dt, th = o.th + d, tie = o.tie + (mode === "drum" ? d : 0);
    var q = this.pose(th), yH = q.E[1] - (o.cordLen - q.rest - onDrum(q, tie));
    if (d !== 0 && ((yH > q.E[1] - 14 && yH > o.yH) || (yH < -190 && yH < o.yH))) { o.dir = -o.dir; q = this.pose(o.th); }   // turn back before the weight hits the pulley or drops too low
    else { o.th = th; o.tie = tie; o.yH = yH; }
    var yW = o.yH, ZC = o.ZC;

    o.disc.rotation.z = o.th;
    o.drum.rotation.z = o.tie;
    o.arm.position.set(o.G[0], o.G[1], 22.5); o.arm.rotation.z = q.al;
    o.armAxle.position.set(q.E[0], q.E[1], 13.25);
    o.pul.position.set(q.E[0], q.E[1], ZC);
    o.pul.rotation.z = (q.E[1] - yW + o.rE * Math.PI / 2) / o.rE;               // rolls with the cord: cord from the weight to the top of the pulley
    o.link.position.set(q.p[0], q.p[1], 28); o.link.rotation.z = Math.atan2(q.J[1] - q.p[1], q.J[0] - q.p[0]);
    o.jpin.position.set(q.J[0], q.J[1], 26);
    var xL = q.E[0] - o.rE;
    o.hang.span(xL, q.E[1], ZC, xL, yW, ZC);
    o.span.span(q.T1[0], q.T1[1], ZC, q.T2[0], q.T2[1], ZC);
    o.wrap.geometry.dispose(); o.wrap.geometry = new c.THREE.TorusGeometry(o.rE, 1.2, 8, 40, Math.PI - q.be);
    o.wrap.position.set(q.E[0], q.E[1], ZC); o.wrap.rotation.z = q.be;          // from the leaving point over the top to the left side
    o.W.position.set(xL, yW, ZC);

    // strokes: measured between turning points of the weight
    if (o.ext === null) { o.ext = yW; o.prev = yW; o.sgn = 0; S.set("u", "–"); S.set("d", "–"); }
    var sg = Math.sign(yW - o.prev);
    if (sg && o.sgn && sg !== o.sgn && Math.abs(o.prev - o.ext) > 2) {
      var len = Math.round(Math.abs(o.prev - o.ext)) + " cm";
      S.set(o.sgn > 0 ? "u" : "d", len); o.ext = o.prev;
    }
    if (sg) o.sgn = sg; o.prev = yW;
  }
});
