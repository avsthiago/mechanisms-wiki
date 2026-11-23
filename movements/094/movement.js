M507.define({
  number: 94,
  title: "Variable crank",
  lede: "Two plates turn together on one shaft, and a bolt runs through both. One plate has slots that point out from the middle. The other has a spiral groove. Turn one plate a little against the other and the bolt slides in or out, so the crank gets longer or shorter while it keeps turning.",
  alt: "Two round plates on one shaft, seen face on. The front plate has six spokes with a slot in each. Through the gaps you can see a plate behind it with a dark spiral groove. A red bolt passes through a slot and the groove, and a rod joins it to a slider on a straight guide.",
  parts: [
    { key: "slots", color: "#5E7387", name: "Slotted plate", note: "The front plate. Each of its six spokes has a slot pointing out from the middle. It is fixed to the shaft. The small blue tab on its rim shows how it turns." },
    { key: "spiral", color: "#C8873A", name: "Spiral plate", note: "The back plate, with a spiral groove cut right through it. The dark tab on its rim shows how far it has turned against the front plate." },
    { key: "bolt", color: "#C2503F", name: "Bolt", note: "It goes through a slot and the groove together. Watch it walk along its slot as the groove moves past." },
    { key: "link", color: "#D9B13B", name: "Rod and slider", note: "The rod joins the bolt to a slider on a straight guide. The slider shows how far the crank pushes." }
  ],
  controls: [{ id: "m", label: "Spiral plate", value: "auto", options: [["auto", "Turning slowly"], ["short", "Held, short crank"], ["mid", "Held, middle"], ["long", "Held, long crank"]] }],
  readouts: [{ id: "r", label: "Crank radius" }, { id: "k", label: "Stroke" }],
  views: { "3d": [420, 240, 580], front: [110, 0, 640], side: [640, 40, 60] },
  target: [110, -10, 0],
  how: [
    "The bolt goes through a slot in the front plate and through the groove in the back plate. The slot is a straight line out from the middle. The groove is a spiral that winds outward. The bolt can only sit where the two cross.",
    "Here the back plate turns slowly against the front plate. Watch the dark tab slide past the blue tab. The crossing moves along the slot, and the bolt goes with it. The bolt is the crank pin, so its distance from the middle is the length of the crank. The slider moves twice that distance each turn.",
    "When the two plates are held together, the crank has one fixed length. Try Held, short crank, then Held, long crank, and compare the stroke of the slider."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown shows the plates and the bolt only. The shaft, the stand, the rod and the slider were made up to show what the crank does. The spiral makes one turn here, where the drawing shows more, so the bolt always meets the groove in one place. The slow turning of the spiral plate is added to show the adjustment. How the two plates are held against each other is not shown.",

  build: function (c) {
    var P = c.P, T = c.THREE || THREE, scene = c.scene, o = this.o = { th: 0, sd: null, ph: 2.3 };
    var R = 100, HW = 5.5, R1 = 30, R2 = 84, PITCH = 60, R0 = 32, A0 = -10 * Math.PI / 180, A1 = 310 * Math.PI / 180;
    o.R0 = R0; o.PITCH = PITCH; o.TS = 4 * Math.PI / 3; o.L = 200;       // crank starts at the lower left slot, as drawn

    function disc() { var s = new T.Shape(); s.absarc(0, 0, R, 0, 2 * Math.PI, false); return s; }
    function mk(shape, depth, key, z0) {
      var m = new T.Mesh(new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 48 }), c.mat(key));
      m.position.z = z0; return m;
    }
    function stadium(a) {                       // slot along angle a, centres from R1 to R2, width 2*HW
      var pts = [], i, ca = Math.cos(a), sa = Math.sin(a), n = 10;
      function pt(r, off) { return new T.Vector2(r * ca - off * sa, r * sa + off * ca); }
      for (i = 0; i <= n; i++) { var b2 = -Math.PI / 2 + Math.PI * i / n; pts.push(pt(R2 + HW * Math.cos(b2), HW * Math.sin(b2))); }   // outer cap
      for (i = 0; i <= n; i++) { var b3 = Math.PI / 2 + Math.PI * i / n; pts.push(pt(R1 + HW * Math.cos(b3), HW * Math.sin(b3))); }   // inner cap
      return new T.Path(pts);
    }
    function window_(a1) {                      // gap between the spoke at a1 and the next spoke 60 degrees on; spokes are 2*SW wide
      var SW = 14, RO = 86, a2 = a1 + Math.PI / 3, pts = [], i, tA = Math.sqrt(28 * 28 - SW * SW), tO = Math.sqrt(RO * RO - SW * SW);
      function onLine(a, side, t) { var u = [Math.cos(a), Math.sin(a)], n = [-Math.sin(a), Math.cos(a)]; return new T.Vector2(t * u[0] + side * SW * n[0], t * u[1] + side * SW * n[1]); }
      pts.push(onLine(a1, 1, tA), onLine(a1, 1, tO));
      var b1 = Math.atan2(pts[1].y, pts[1].x), b2 = Math.atan2(onLine(a2, -1, tO).y, onLine(a2, -1, tO).x);
      if (b2 < b1) b2 += 2 * Math.PI;
      for (i = 1; i < 12; i++) { var b = b1 + (b2 - b1) * i / 12; pts.push(new T.Vector2(RO * Math.cos(b), RO * Math.sin(b))); }
      pts.push(onLine(a2, -1, tO), onLine(a2, -1, tA));
      return new T.Path(pts);
    }
    function groove() {                         // spiral slot: radius R0 + PITCH * a / 2pi, rounded ends
      var pts = [], n = 120, i, a, r;
      function rr(t) { return R0 + PITCH * t / (2 * Math.PI); }
      for (i = 0; i <= n; i++) { a = A0 + (A1 - A0) * i / n; r = rr(a) + HW; pts.push(new T.Vector2(r * Math.cos(a), r * Math.sin(a))); }
      for (i = 1; i < 8; i++) { var b = Math.PI * i / 8, cx = rr(A1) * Math.cos(A1), cy = rr(A1) * Math.sin(A1), nx = Math.cos(A1), ny = Math.sin(A1);
        pts.push(new T.Vector2(cx + HW * (Math.cos(b) * nx - Math.sin(b) * ny), cy + HW * (Math.cos(b) * ny + Math.sin(b) * nx))); }
      for (i = n; i >= 0; i--) { a = A0 + (A1 - A0) * i / n; r = rr(a) - HW; pts.push(new T.Vector2(r * Math.cos(a), r * Math.sin(a))); }
      for (i = 1; i < 8; i++) { var b4 = Math.PI * i / 8, cx0 = rr(A0) * Math.cos(A0), cy0 = rr(A0) * Math.sin(A0), nx0 = Math.cos(A0), ny0 = Math.sin(A0);
        pts.push(new T.Vector2(cx0 + HW * (-Math.cos(b4) * nx0 + Math.sin(b4) * ny0), cy0 + HW * (-Math.cos(b4) * ny0 - Math.sin(b4) * nx0))); }
      return new T.Path(pts);
    }

    // spiral plate (back): z -12 .. -6.5, bore for the shaft, spiral groove cut through
    var sh = disc(); sh.holes.push(groove());
    var bore = new T.Path(); bore.absarc(0, 0, 10, 0, 2 * Math.PI, true); sh.holes.push(bore);
    o.spiral = new T.Group(); scene.add(o.spiral);
    o.spiral.add(mk(sh, 5.5, "spiral", -12));
    P.at(P.cylZ(R, 1.5, c.mat("spiral", "dark")), 0, 0, -12.25, o.spiral);          // dark floor behind the groove, z -13 .. -11.5
    P.at(P.box(8, 8, 5.5, c.mat("spiral", "dark")), R + 2, 0, -9.75, o.spiral);       // dark tab on the rim, x 98 .. 106 (sunk 2 into the rim), z -12 .. -6.5
    // slotted plate (front): z -6 .. 0, six slots, turns with the shaft
    var fh = disc(), k;
    for (k = 0; k < 6; k++) fh.holes.push(window_(k * Math.PI / 3));
    for (k = 0; k < 6; k++) fh.holes.push(stadium(k * Math.PI / 3));
    o.slots = new T.Group(); scene.add(o.slots);
    o.slots.add(mk(fh, 6, "slots", -6));
    P.at(P.box(12, 8, 6, c.mat("slots")), (R + 4) * Math.cos(Math.PI / 6), (R + 4) * Math.sin(Math.PI / 6), -3, o.slots).rotation.z = Math.PI / 6;   // blue tab on the rim between two slots, z -6 .. 0
    P.at(P.cylZ(16, 4.5, c.mat("slots")), 0, 0, 1.75, o.slots);                   // hub z -0.5 .. 4
    P.at(P.cylZ(8, 2, c.mat("slots", "dark")), 0, 0, 5, o.slots);                   // shaft end z 4 .. 6
    P.at(P.cylZ(8, 34, c.mat("slots", "dark")), 0, 0, -23, o.slots);              // shaft z -40 (post face) .. -6 (back of the slotted plate)

    // bolt through both plates, with a back head, a collar and a cap
    o.bolt = new T.Group(); scene.add(o.bolt);
    P.at(P.cylZ(4, 35, c.mat("bolt")), 0, 0, 1.5, o.bolt);                          // z -16 .. 19
    P.at(P.cylZ(7, 3, c.mat("bolt")), 0, 0, -14.5, o.bolt);                         // nut behind the dark floor, z -16 .. -13
    P.at(P.cylZ(5.2, 5, c.mat("bolt")), 0, 0, -9, o.bolt);                          // sleeve riding in the groove, z -11.5 .. -6.5
    P.at(P.cylZ(6, 13.5, c.mat("bolt")), 0, 0, 6.25, o.bolt);                       // collar z -0.5 .. 13
    P.at(P.cylZ(7, 4, c.mat("bolt")), 0, 0, 21, o.bolt);                          // head on the front z 19 .. 23

    // rod and slider on a straight guide along the X axis
    o.rod = P.at(P.rod(3, c.mat("link")), 0, 0, 0, scene);                          // rod z 13 .. 19
    o.slider = P.at(P.box(28, 18, 6, c.mat("link")), 0, 0, 11, scene);              // x +-14, y -9 .. 9, z 8 .. 14
    P.at(P.cylZ(4.5, 4, c.mat("link", "dark")), 0, 0, 14, o.slider).position.set(0, 0, 3);   // pin on top of the slider, local z 3 .. 5

    // stand and guide
    P.at(P.box(440, 10, 94, c.fixed), 110, -130, -17, scene);                       // base x -110 .. 330, y -135 .. -125, z -64 .. 30
    P.at(P.box(32, 139, 24, c.fixed), 0, -55.5, -52, scene);                        // post x -16 .. 16, y -125 .. 14, z -64 .. -40
    P.at(P.box(230, 10, 4, c.fixed), 215, 0, 6, scene);                             // guide bar x 100 .. 330, y -5 .. 5, z 4 .. 8
    P.at(P.box(10, 120, 8, c.fixed), 105, -65, 4, scene);                           // left leg x 100 .. 110, y -125 .. -5, z 0 .. 8
    P.at(P.box(10, 120, 8, c.fixed), 325, -65, 4, scene);                           // right leg x 320 .. 330, y -125 .. -5, z 0 .. 8
  },

  step: function (c, dt, S) {
    var o = this.o, m = S.controls.m, target;
    o.ph += S.w * dt / 5;                                                        // the spiral plate creeps against the slotted plate, reversing at both ends
    target = m === "auto" ? 150 - 150 * Math.cos(o.ph) : m === "short" ? 20 : m === "long" ? 280 : 150;
    if (o.sd === null) o.sd = target;
    o.sd += (target - o.sd) * (1 - Math.exp(-7 * dt));                           // ease the plate, so a change of setting is a smooth slide
    o.th += S.w * dt;
    var s = o.sd * Math.PI / 180, th = o.th;
    var r = o.R0 + o.PITCH * s / (2 * Math.PI);                                  // the groove crosses the slot at radius R0 + pitch * a / 2pi, where a is the groove angle there
    o.slots.rotation.z = th;
    o.spiral.rotation.z = th + o.TS - s;                                         // groove point at angle s then lies at the slot's angle
    var ang = o.TS + th, bx = r * Math.cos(ang), by = r * Math.sin(ang);
    o.bolt.position.set(bx, by, 0);
    var xs = bx + Math.sqrt(o.L * o.L - by * by);
    o.slider.position.x = xs;
    o.rod.span(bx, by, 16, xs, 0, 16);
    S.set("r", Math.round(r) + " mm");
    S.set("k", Math.round(2 * r) + " mm");
  }
});
