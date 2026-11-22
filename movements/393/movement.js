M507.define({
  number: 393,
  title: "Lens polishing",
  lede: "A cup of polishing powder rides on a glass dome. A turning shaft drives the cup round the dome, and the cup also turns on itself. Every part of the cup meets a different part of the glass, so the dome wears evenly.",
  alt: "A glass dome stands on a wooden table. A cup sits on top of the dome and is held by a bent arm hanging from a turning shaft that ends in a flat disc above.",
  parts: [
    { key: "shaft", color: "#5E7387", name: "Shaft and disc", note: "The shaft stands straight above the middle of the dome and turns. The flat disc at the top is where the turning is put in." },
    { key: "arm", color: "#D9B13B", name: "Swinging arm", note: "Hangs from the shaft and swings round with it. Its lower end holds the cup on a ball joint." },
    { key: "cup", color: "#C8873A", name: "Polishing cup", note: "Holds the polishing powder. The ball joint lets it tilt and turn. Watch the red dot to see it turn on itself." },
    { key: "lens", color: "#4FA58A", name: "Glass dome", note: "The piece being polished. It stays still. The red line shows where the edge of the cup has been." }
  ],
  controls: [{ type: "range", id: "tilt", label: "How far off centre", min: 6, max: 30, step: 1, value: 16, unit: "°", presets: [[8, "Small"], [16, "Medium"], [28, "Big"]] }],
  readouts: [{ id: "sh", label: "Shaft" }, { id: "dr", label: "Cup drift" }],
  views: { "3d": [170, 170, 500], front: [0, 90, 420], side: [430, 90, 0] },
  target: [0, 89, 0],
  how: [
    "The shaft turns and carries the arm round with it. The arm holds the cup a little to one side of the shaft, so the cup does not sit still on top of the dome. It circles round the top.",
    "Because the cup is held on a ball joint, it does not just go round. It also turns on its own axis. The red dot on the cup moves round the cup every time the shaft turns once. The red line on the glass shows that the cup never goes over exactly the same path twice, because the pattern slowly turns round.",
    "That is the point: the same spot on the cup does not keep rubbing the same spot on the glass. Try Small, then Big. The bigger the circle, the faster the pattern turns round."
  ],
  note: "This model is rebuilt from Brown's drawing. The table legs, the post and the beam that hold the shaft are made up so it stands. The cup is turned on its ball joint by the glass, with no twist about its own axis. The red line is traced from one point on the edge of the cup.",

  build: function (c) {
    var T = c.THREE, P = c.P, sc = c.scene, i;
    var RL = 50, CY = 10, o = this.o = { th: 0, tilt: -1, RL: RL, CY: CY, v: new T.Vector3() };
    // table, legs, post and beam
    P.at(P.box(220, 10, 160, c.fixed), 0, -5, 0, sc);                    // table top: y -10..0
    [[-95, -70], [95, -70], [-95, 70], [95, 70]].forEach(function (q) { P.at(P.box(8, 80, 8, c.fixed), q[0], -50, q[1], sc); });   // legs y -90..-10
    P.at(P.box(10, 190, 10, c.fixed), 0, 95, -70, sc);                  // post y 0..190
    P.at(P.box(12, 12, 80, c.fixed), 0, 184, -35, sc);                  // beam y 178..190, z -75..5
    // dome: a sphere cut off where it meets the table
    var lm = c.mat("lens"), top = Math.acos(-CY / RL);
    var dome = new T.Mesh(new T.SphereGeometry(RL, 64, 32, 0, 2 * Math.PI, 0, top), lm); dome.position.y = CY; sc.add(dome);
    // shaft and disc
    var sm = c.mat("shaft");
    o.shaft = new T.Group(); sc.add(o.shaft);
    P.at(P.cylY(7, 54, sm), 0, 130, 0, o.shaft);                         // y 103..157
    P.at(P.cylY(30, 18, sm), 0, 166, 0, o.shaft);                        // disc y 157..175
    P.at(P.cylY(9, 12, sm), 0, 99, 0, o.shaft);                          // lower block y 93..105 (overlaps the shaft end)
    P.at(P.box(4, 1.4, 10, c.mat("shaft", "mark")), 20, 175.7, 0, o.shaft);   // red tick on the disc top
    P.at(P.cylY(4, 3, sm), 0, 176.5, 0, sc);                             // axle y 175..178 ends on the beam
    // arm group (turns with the shaft); local +x is the way the cup leans
    o.arm = new T.Group(); sc.add(o.arm);
    var am = c.mat("arm");
    o.r1 = P.at(P.rod(3, am), 0, 0, 0, o.arm); o.r2 = P.at(P.rod(3, am), 0, 0, 0, o.arm);
    o.pv = P.at(P.sphere(4.5, am), 0, 0, 0, o.arm); o.bend = P.at(P.sphere(3, am), 0, 0, 0, o.arm);
    o.ball = P.at(P.sphere(5, am), 0, 0, 0, o.arm);
    // cup: a spherical shell that fits the dome
    o.cupT = new T.Group(); o.cupT.position.y = CY; o.arm.add(o.cupT);
    o.cup = new T.Group(); o.cupT.add(o.cup);
    var prof = [], b;
    for (b = 0; b <= 38; b += 2) prof.push(new T.Vector2(53 * Math.sin(b * Math.PI / 180), 53 * Math.cos(b * Math.PI / 180)));
    for (b = 38; b >= 0; b -= 2) prof.push(new T.Vector2(51 * Math.sin(b * Math.PI / 180), 51 * Math.cos(b * Math.PI / 180)));
    o.cup.add(new T.Mesh(new T.LatheGeometry(prof, 48), c.mat("cup")));
    var ma = 24 * Math.PI / 180;
    P.at(P.sphere(2.6, c.mat("cup", "mark")), 54 * Math.sin(ma), 54 * Math.cos(ma), 0, o.cup);
    o.trail = P.trail({ color: 0xC2503F, max: 2400, step: .6 }); sc.add(o.trail);
  },

  step: function (c, dt, S) {
    var o = this.o, al = (+S.controls.tilt) * Math.PI / 180, ca = Math.cos(al), sa = Math.sin(al), CY = o.CY;
    if (al !== o.tilt) {
      o.tilt = al; o.trail.clear();
      var jx = 57 * sa, jy = CY + 57 * ca;
      o.o = { jx: jx, jy: jy };
      o.cupT.rotation.z = -al;
      o.ball.position.set(jx, jy, 0);
      o.pv.position.set(6, 100, 0);
      var bx = jx + 18, by = jy + 22;
      o.bend.position.set(bx, by, 0);
      o.r1.span(6, 100, 0, bx, by, 0); o.r2.span(bx, by, 0, jx, jy, 0);
      o.drift = (1 - ca);
    }
    o.th += S.w * dt;
    o.arm.rotation.y = o.th + Math.PI;
    o.shaft.rotation.y = o.th + Math.PI;
    o.cup.rotation.y = -ca * o.th;                      // no twist about the cup's own axis: it spins back relative to the arm
    o.arm.updateMatrixWorld(true);
    var be = 38.6 * Math.PI / 180, v = o.v.set(50.8 * Math.sin(be), 50.8 * Math.cos(be), 0);
    o.cup.localToWorld(v);
    if (S.w > 0) o.trail.push(v.x, v.y, v.z);
    S.set("sh", (S.playing ? S.rpm : 0) + " rpm");
    S.set("dr", (S.playing ? S.rpm * o.drift : 0).toFixed(1) + " rpm");
  }
});
