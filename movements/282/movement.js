(function () {
  // Shared sizes, in model units. The bar's pivot is at (0, PY); the disc turns about (0, CY).
  var PY = -170, CY = 10, D = CY - PY;                        // pivot to disc centre: 180
  var MD = 6, NT = 16, RP = NT * MD / 2;                      // sector: module, teeth in a full circle, pitch radius 48
  var LA = 412, LG = 376;                                     // along the bar: cord eye, guide pin in the arch
  var PX = 225, PYP = 255, PR = 25;                           // pulley centre and radius (cord centre line)
  var DROP_TOP = 210;                                         // highest the weight's top may come (pulley rim bottom is 230)

  function barAngle(th, r) {                                  // tilt from upright (anticlockwise +) for disc angle th, pin radius r
    var x = r * Math.cos(th), y = CY + r * Math.sin(th) - PY;
    return -Math.atan2(x, y);
  }
  function cord(be) {                                         // free cord from the eye to where it leaves the pulley's right side
    var ax = -LA * Math.sin(be), ay = PY + LA * Math.cos(be);
    var dx = ax - PX, dy = ay - PYP, Dd = Math.hypot(dx, dy), al = Math.atan2(dy, dx);
    if (al < 0) al += 2 * Math.PI;
    var t = al - Math.acos(PR / Dd);                          // tangent point on the upper left of the pulley
    return { ax: ax, ay: ay, t: t, tx: PX + PR * Math.cos(t), ty: PYP + PR * Math.sin(t), free: Math.sqrt(Dd * Dd - PR * PR) + PR * t };
  }
  var BMAX = Math.asin(60 / D), FREE_MAX = cord(BMAX).free;   // bar leaning fully left: most cord between eye and pulley
  var LTOT = FREE_MAX + (PYP - DROP_TOP);                     // total cord, eye to the top of the weight

  M507.define({
    number: 282,
    title: "Slotted bar, sector and racks",
    lede: "A turning disc rocks a long upright bar from side to side. Its bottom end slides a toothed bar back and forth. Its top end pulls a cord that lifts and lowers a weight. One steady turn becomes two to-and-fro motions at once.",
    alt: "A frame of two uprights with a curved top piece. In front, a long bar hinged near the bottom has a slot. A pin on a disc behind it runs in the slot. Teeth on a fan at the bottom of the bar mesh with a toothed bar lying across the foot of the frame. A cord from the top of the bar runs over a pulley on the right to a hanging weight.",
    parts: [
      { key: "disc", color: "#5E7387", name: "Disc", note: "Turns steadily on its shaft. It has three holes for its pin, at different distances from the centre." },
      { key: "pin", color: "#C2503F", name: "Pin", note: "Stands out of the disc and runs up and down the slot in the bar as it goes round. Watch it push the bar from side to side." },
      { key: "bar", color: "#D9B13B", name: "Slotted bar", note: "Rocks on a pin near its foot. The fan of teeth at its bottom end is called a sector. A pin near the top runs in the curved slot of the frame to steady it." },
      { key: "rack", color: "#C8873A", name: "Toothed bar", note: "A bar with teeth along its top, called a rack. The sector rolls on it and slides it back and forth through its guides." },
      { key: "weight", color: "#8E7AA8", name: "Cord and weight", note: "The cord is tied to the top of the bar. As the bar leans away from the pulley the weight rises, and as it leans back the weight sinks." }
    ],
    controls: [{ id: "r", label: "Hole for the pin", value: "60", options: [["30", "Inner"], ["45", "Middle"], ["60", "Outer"]] }],
    readouts: [{ id: "tilt", label: "Bar" }, { id: "rack", label: "Rack" }],
    views: { "3d": [-420, 150, 1080], front: [20, -5, 1180], side: [1150, -5, -10] },
    target: [20, 10, 0],
    how: [
      "The pin on the disc goes round in a circle. It sits in a long slot in the bar, so it can slide along the bar but not across it. Each time it swings to one side, it pushes the bar over with it. The bar rocks to and fro on the pin near its foot.",
      "The bar's two ends move opposite ways. When the top leans left, the fan of teeth at the bottom swings right and rolls the rack to the right. At the same time the top end pulls the cord away from the pulley and the weight rises. The top is much farther from the pivot than the teeth, so it travels much farther.",
      "The disc turns at the same speed all the time, but the bar does not. It moves fastest when the pin passes the middle and slows to a stop at each end. Try the inner hole, then the outer one, and compare how far the rack and the weight travel."
    ],
    note: "This model is rebuilt from Brown's drawing. The rails that carry the disc's shaft and the bar's pivot, the guides for the rack and the bracket for the pulley were made up. Brown shows only one pin hole in the disc; the other two were added for the control. The curved slot in the top of the frame is read as a guide for a pin on the bar. The weight hangs a little lower than drawn so that it never reaches the pulley.",

    build: function (c) {
      var T = c.THREE, P = c.P, scene = c.scene, fx = c.fixed;
      var o = this.o = { th: 48 * Math.PI / 180, wrapT: -1 };
      // frame
      P.at(P.box(560, 10, 100, fx), 30, -290, -30, scene);                 // ground x -250..310, y -295..-285, z -80..20
      [-145, 145].forEach(function (x) {
        P.at(P.box(30, 420, 40, fx), x, -75, -40, scene);                  // uprights x ±130..±160, y -285..135 (on the ground), z -60..-20
        P.at(P.box(24, 29, 18.5, fx), x, -270.5, -10.75, scene);           // rack guide sill x ±133..±157, y -285..-256 (ground top to rack bottom), z -20..-1.5 (upright face)
        P.at(P.box(24, 26.5, 4, fx), x, -242.75, -3.5, scene);             // front cheek y -256..-229.5, z -5.5..-1.5 (0.5 clear of the rack's front at -6)
        P.at(P.box(24, 6.5, 18.5, fx), x, -226.25, -10.75, scene);         // cap y -229.5..-223 (0.5 over the rack bar's top), z -20..-1.5
      });
      P.at(P.box(260, 24, 20, fx), 0, CY, -50, scene);                     // disc rail x -130..130 (between uprights), y -2..22, z -60..-40
      P.at(P.box(260, 24, 20, fx), 0, PY, -50, scene);                     // pivot rail x -130..130, y -182..-158, z -60..-40
      // curved top piece: a band round the bar's pivot, with feet on the uprights at y 135, and a slot for the guide pin
      var DEG = Math.PI / 180, ol = [[185, 135]], i, a;
      var aO = Math.acos(185 / 400), aI = Math.acos(130 / 350);
      for (i = 0; i <= 40; i++) { a = aO + (Math.PI - 2 * aO) * i / 40; ol.push([400 * Math.cos(a), PY + 400 * Math.sin(a)]); }
      ol.push([-185, 135], [-130, 135]);
      for (i = 0; i <= 40; i++) { a = Math.PI - aI - (Math.PI - 2 * aI) * i / 40; ol.push([350 * Math.cos(a), PY + 350 * Math.sin(a)]); }
      ol.push([130, 135]);
      var sl = [];
      for (i = 0; i <= 48; i++) { a = (66 + 48 * i / 48) * DEG; sl.push([LG * Math.cos(a), PY + LG * Math.sin(a)]); }
      P.at(P.slottedPlate({ outline: ol, slot: sl, half: 6, thick: 12, material: fx }), 0, 0, -26, scene);   // z -32..-20, feet on the upright tops
      var br = new T.Shape(); [[185, 145], [240, 238], [240, 268], [212, 268], [185, 182]].forEach(function (q, k) { if (k) br.lineTo(q[0], q[1]); else br.moveTo(q[0], q[1]); });
      var bg = new T.ExtrudeGeometry(br, { depth: 12, bevelEnabled: false }); bg.translate(0, 0, -32);
      scene.add(new T.Mesh(bg, fx));                                       // pulley bracket z -32..-20, its left edge on the band's end face x 185
      P.at(P.cylZ(4, 12.3, fx), PX, PYP, -13.85, scene);                   // pulley axle z -20..-7.7, bracket face to the pulley hub's back

      // disc and pin
      o.disc = P.at(new T.Group(), 0, CY, -30, scene);                     // disc z -36..-24
      o.disc.add(P.cylZ(110, 12, c.mat("disc")));
      P.at(P.cylZ(8, 4, c.mat("disc")), 0, 0, -8, o.disc);                 // shaft z -40..-36, rail face to disc back
      [30, 45, 60].forEach(function (r) { P.at(P.cylZ(6.5, 1, c.mat("disc", "dark")), r, 0, 6.5, o.disc); });   // holes, z -24..-23, front 1 off the face
      P.at(P.box(30, 4, 1, c.mat("disc", "dark")), -85, 0, 6.5, o.disc);   // stripe on the far side, to see it turn
      o.pin = P.at(new T.Group(), 60, 0, 0, o.disc);
      P.at(P.cylZ(5, 19, c.mat("pin")), 0, 0, 15, o.pin);                  // pin z -24.5..-5.5, starts inside the disc, through the slot
      P.at(P.cylZ(9, 3, c.mat("pin")), 0, 0, 26, o.pin);                   // head z -5.5..-2.5, 0.5 off the bar's front face

      // slotted bar with its sector, local +X along the bar from the pivot
      o.bar = P.at(new T.Group(), 0, PY, -12, scene);                      // bar z -18..-6
      var mb = c.mat("bar");
      o.bar.add(P.armPlate({ length: 440, r0: 18, r1: 16, thick: 12, slot: { from: 108, to: 252, width: 13 }, material: mb }));
      o.bar.add(P.gearSector({ teeth: NT, module: MD, fromDeg: 128, toDeg: 232, width: 11, material: mb }));   // z -17.5..-6.5, inside the bar's faces; tooth on 180 points down when upright
      P.at(P.cylZ(6, 22, fx), 0, PY, -29, scene);                          // pivot pin z -40..-18, rail face to bar back
      P.at(P.cylZ(9, 3, c.mat("bar", "dark")), 0, 0, 7.5, o.bar);          // pin head z -6..-3, on the bar's face
      P.at(P.cylZ(4.5, 16, mb), LG, 0, -14, o.bar);                        // guide pin z -34..-18, through the curved slot
      P.at(P.cylZ(9, 2, mb), LG, 0, -23, o.bar);                           // washer z -36..-34, behind the band
      P.at(P.cylZ(4, 5, c.mat("weight")), LA, 0, 8.5, o.bar);              // cord eye z -6..-1, on the bar's front

      // rack: a plain bar with a run of teeth on top, sliding through the two guides
      o.rack = P.at(new T.Group(), 0, 0, -12, scene);                      // z -18..-6
      var rk = P.rack({ teeth: 10, module: MD, side: -1, body: 4.5, thick: 12, material: c.mat("rack") });
      rk.rotation.z = -Math.PI / 2; P.at(rk, -5 * rk.pitch, PY - RP, 0, o.rack);   // pitch line y -218, roots -225.5, back -230; a gap under the pivot
      P.at(P.box(420, 26, 12, c.mat("rack")), 0, -243, 0, o.rack);         // bar y -256..-230 (teeth sit on its top)
      P.at(P.box(4, 26, 1, c.mat("rack", "dark")), -185, -243, 6.5, o.rack);   // mark on its front face, lifted

      // pulley, cord and weight
      o.sheave = P.at(P.ropeWheel({ radius: PR, tube: 2, material: c.mat("weight") }), PX, PYP, -3, scene);   // rim radius 23, cord centre 25; z -8.2..2.2
      o.run = P.at(P.rod(2, c.mat("weight")), 0, 0, 0, scene);
      o.drop = P.at(P.rod(2, c.mat("weight")), 0, 0, 0, scene);
      o.wrap = P.at(new T.Mesh(new T.BufferGeometry(), c.mat("weight")), PX, PYP, -3, scene); o.wrap.userData.live = true;
      o.wt = P.at(new T.Group(), PX + PR, 0, -3, scene);
      P.at(P.box(36, 60, 30, c.mat("weight")), 0, -32, 0, o.wt);           // weight y top-62..top-2 under its hook
      P.at(P.cylY(2, 4, c.mat("weight")), 0, -1, 0, o.wt);
      o.P = P;
    },

    step: function (c, dt, S) {
      var o = this.o, r = +S.controls.r;
      o.th += S.w * dt;
      o.pin.position.x = r;
      o.disc.rotation.z = o.th;
      var be = barAngle(o.th, r);
      o.bar.rotation.z = Math.PI / 2 + be;
      o.rack.position.x = RP * be;                                         // the sector rolls the rack: shift = pitch radius × tilt
      var k = cord(be), top = PYP - (LTOT - k.free);
      o.run.span(k.ax, k.ay, -3, k.tx, k.ty, -3);
      o.drop.span(PX + PR, PYP, -3, PX + PR, top, -3);
      o.wt.position.y = top;
      if (Math.abs(k.t - o.wrapT) > 0.004) {
        o.wrapT = k.t; o.wrap.geometry.dispose();
        o.wrap.geometry = new c.THREE.TorusGeometry(PR, 2, 8, 24, k.t);
      }
      o.sheave.rotation.z = (k.free - FREE_MAX) / PR;
      function f(v, u) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + u; }
      S.set("tilt", f(-be * 180 / Math.PI, "°"));
      S.set("rack", f(RP * be, " mm"));
    }
  });
})();
