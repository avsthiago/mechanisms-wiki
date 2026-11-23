M507.define({
  number: 231,
  title: "Drag link",
  lede: "Two cranks on separate shafts are joined by a link. When one shaft turns, the link drags the other crank all the way round with it. The second shaft turns faster and slower than the first.",
  alt: "Two parallel shafts side by side but not in a line. Each carries a crank, and a long link joins the ends of the two cranks.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Driving crank", note: "Fixed to the first shaft, which turns at a steady speed." },
    { key: "link", color: "#D9B13B", name: "Link", note: "A bar that joins the ends of the two cranks. It pulls the second crank round." },
    { key: "driven", color: "#C8873A", name: "Driven crank", note: "Fixed to the second shaft. It turns the whole way round, but not at a steady speed." },
    { key: "pin", color: "#C2503F", name: "Pins", note: "Hold the link to the cranks. Watch them go round." }
  ],
  controls: [{ type: "range", id: "gap", label: "Gap between the shafts", min: 0, max: 40, step: 1, value: 40, unit: " mm",
    presets: [[0, "None"], [15, "Small"], [25, "Medium"], [40, "Large"]] }],
  readouts: [{ id: "in", label: "Driving" }, { id: "out", label: "Driven" }],
  views: { "3d": [264, 72, 324], front: [0, 0, 560], side: [560, 0, 0] },
  target: [0, -60, 20],
  how: [
    "Turn the first shaft and watch the link. It is tied to the end of each crank, so when one pin goes round, the other pin has to follow. The second crank is dragged round with it, a whole turn each time.",
    "The two shafts are side by side, not in a line. So the link pulls the second crank at a changing angle. When the pull is nearly along the crank, it turns slowly. When the pull is sideways, it turns quickly. The Driven reading goes up and down while the Driving reading stays the same.",
    "Try the gap slider. With no gap, the shafts are in a line and both turn at the same speed. The larger the gap, the more the second shaft speeds up and slows down."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown draws the shafts in the air, so no bearings are drawn. The cranks and link lie in separate flat layers so they pass each other, and the pins are made long to join them. All lengths are made up, chosen so that both cranks can go right round. Brown shows one fixed gap, and the slider is added.",

  R1: 140, R2: 120, L: 130,
  // Four-bar linkage solved exactly: the end of the second crank is where a circle of radius R2 about its shaft
  // meets a circle of radius L about the end of the first crank (the same one of the two meeting points all the way round).
  kin: function (g, th) {
    var R1 = this.R1, R2 = this.R2, L = this.L;
    var p1x = -g / 2 + R1 * Math.cos(th), p1y = R1 * Math.sin(th), ex = p1x - g / 2, ey = p1y, d = Math.sqrt(ex * ex + ey * ey);
    var a = (d * d + R2 * R2 - L * L) / (2 * d), h = Math.sqrt(Math.max(0, R2 * R2 - a * a)), ux = ex / d, uy = ey / d;
    var qx = g / 2 + a * ux - h * uy, qy = a * uy + h * ux;
    return { p1x: p1x, p1y: p1y, p2x: qx, p2y: qy, phi: Math.atan2(qy, qx - g / 2) };
  },
  ratio: function (g, th) {
    var e = 1e-4, d = this.kin(g, th + e).phi - this.kin(g, th - e).phi;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    return d / (2 * e);
  },

  build: function (c) {
    var T = c.THREE, P = c.P, o = this.o = { th: 55 * Math.PI / 180, Y: -70 };
    // layers from far to near: driven crank z 0..8, link z 10..17, driving crank z 19..27
    o.g2 = new T.Group(); c.scene.add(o.g2);
    P.at(P.armPlate({ length: this.R2, r0: 16, r1: 10, thick: 8, material: c.mat("driven") }), 0, 0, 4, o.g2);
    P.at(P.cylZ(7, 110, c.mat("driven")), 0, 0, -55, o.g2);                                 // far shaft z -110..0
    P.at(P.box(3, 1, 70, c.mat("driven", "dark")), 0, 8, -60, o.g2);                        // stripe z -95..-25
    o.g1 = new T.Group(); c.scene.add(o.g1);
    P.at(P.armPlate({ length: this.R1, r0: 18, r1: 10, thick: 8, material: c.mat("drive") }), 0, 0, 23, o.g1);
    P.at(P.cylZ(7, 110, c.mat("drive")), 0, 0, 82, o.g1);                                   // near shaft z 27..137
    P.at(P.box(3, 1, 70, c.mat("drive", "dark")), 0, 8, 90, o.g1);                          // stripe z 55..125
    o.link = P.armPlate({ length: this.L, r0: 10, thick: 7, material: c.mat("link") }); o.link.position.z = 13.5; c.scene.add(o.link);   // z 10..17
    // pins: the far one stands on the driven crank (z 4..18.5, head z 17..18.5 on the link), the near one hangs from the driving crank (z 8.5..23, head z 8.5..10 under the link)
    o.pin2 = new T.Group(); c.scene.add(o.pin2);
    P.at(P.cylZ(3.5, 12.5, c.mat("pin", "mark")), 0, 0, 10.25, o.pin2);                     // z 4..16.5, ends inside the link
    P.at(P.cylZ(6, 1.5, c.mat("pin", "mark")), 0, 0, 17.75, o.pin2);                        // z 17..18.5
    o.pin1 = new T.Group(); c.scene.add(o.pin1);
    P.at(P.cylZ(3.5, 13.5, c.mat("pin", "mark")), 0, 0, 17.25, o.pin1);                     // z 10.5..24, starts inside the link
    P.at(P.cylZ(6, 1.5, c.mat("pin", "mark")), 0, 0, 9.25, o.pin1);                         // z 8.5..10
  },

  step: function (c, dt, S) {
    var o = this.o, g = +S.controls.gap, Y = o.Y;
    o.th += S.w * dt;
    var k = this.kin(g, o.th);
    o.g1.position.set(-g / 2, Y, 0); o.g1.rotation.z = o.th;
    o.g2.position.set(g / 2, Y, 0); o.g2.rotation.z = k.phi;
    o.pin1.position.set(k.p1x, Y + k.p1y, 0); o.pin2.position.set(k.p2x, Y + k.p2y, 0);
    o.link.position.x = k.p1x; o.link.position.y = Y + k.p1y;
    o.link.rotation.z = Math.atan2(k.p2y - k.p1y, k.p2x - k.p1x);
    var rpm = S.w * 60 / (2 * Math.PI);
    S.set("in", rpm.toFixed(1) + " rpm");
    S.set("out", (rpm * this.ratio(g, o.th)).toFixed(1) + " rpm");
  }
});
