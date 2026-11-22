M507.define({
  number: 487,
  title: "Paddle wheel",
  lede: "A big wheel on the side of a boat, with flat boards round its edge. As it turns, the lowest boards push the water backwards. The water pushes back on the boards, and that drives the boat forwards.",
  alt: "A spoked wheel with two rims and eight flat boards round the outside, seen face on. The lowest boards dip into the water. Blue dots show water being pushed to the left.",
  _hint: "Drag to look around. Pinch or scroll to zoom. The boat is heading to the right.",
  parts: [
    { key: "buckets", color: "#C8873A", name: "Boards", note: "Flat boards, called floats or buckets, fixed to the ends of the spokes. The ones in the water do the pushing." },
    { key: "wheel", color: "#5E7387", name: "Wheel", note: "Hub, spokes and two rims. It is turned by the engine. Watch the red mark on the rim." },
    { key: "shaft", color: "#4FA58A", name: "Shaft", note: "Comes out of the side of the boat and carries the wheel." }
  ],
  controls: [{ id: "boat", label: "Boat", value: "free", options: [["free", "Free to move"], ["tied", "Tied up"]] }],
  readouts: [{ id: "v", label: "Boat" }, { id: "u", label: "Boards" }],
  views: { "3d": [170, 60, 980], front: [0, -25, 1180], side: [1180, -10, 140] },
  target: [0, -25, 0],
  distance: [380, 2400],
  how: [
    "The wheel turns clockwise in this picture. Only the boards at the bottom are in the water, and they move to the left, towards the back of the boat. Watch the dots: the boards shove the water backwards.",
    "Pushing water one way pushes the wheel the other way, like pushing off from a wall. So the boat moves forwards, to the right. The water in front of the wheel seems to stream past, because the boat is moving through it.",
    "Try tying the boat up. Now it cannot move, so the boards hit still water at full speed and throw it back hard. Set it free again. The boat speeds up until the push of the boards matches the drag of the water on the hull."
  ],
  note: "This model is rebuilt from Brown's drawing. The water, the side of the boat and the depth of the wheel were made up. The boat speed comes from a simple rule: the push grows with how much faster the boards move than the boat.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, WL = -185, i;
    var o = this.o = { WL: WL, th: 0, v: 0, N: 240, d: [] };
    o.wheel = new T.Group(); scene.add(o.wheel);
    var mw = c.mat("wheel"), mb = c.mat("buckets");
    P.at(P.cylZ(20, 240, c.mat("shaft")), 0, 0, -50, o.wheel);                    // shaft z -170..70, ends at the hull's face
    P.at(P.cylZ(45, 130, mw), 0, 0, 0, o.wheel);                                   // hub z -65..65
    [-65, 55].forEach(function (z) { o.wheel.add(P.annulus({ rIn: 150, rOut: 175, depth: 10, z0: z, material: mw })); });   // rims z -65..-55 and 55..65
    P.at(P.box(25, 6, 1, c.mat("wheel", "mark")), 162.5, 0, 65.8, o.wheel);  // mark z 65.3..66.3, on the front rim
    for (i = 0; i < 8; i++) {
      var g = new T.Group(); g.rotation.z = i * Math.PI / 4; o.wheel.add(g);
      [-60, 60].forEach(function (z) { P.at(P.box(185, 10, 8, mw), 137.5, 0, z, g); });   // spokes r 45..230
      P.at(P.box(80, 8, 150, mb), 190, -9, 0, g);                                   // board r 150..230, y -13..-5 against the spoke face y -5, z -75..75
    }
    // side of the boat behind (front face z -170) and the water (z -168..160, top at the waterline)
    P.at(P.box(1000, 460, 12, new T.MeshLambertMaterial({ color: 0x8696A2, transparent: true, opacity: .3, depthWrite: false })), 0, 0, -176, scene);
    var water = P.at(P.box(960, 150, 328, new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .25, depthWrite: false })), 0, WL - 75, -4, scene);
    water.renderOrder = 5;
    o.dots = P.waterDots(o.N, { radius: 2.6, color: c.spot, opacity: .85 }); scene.add(o.dots);
    for (i = 0; i < o.N; i++) o.d.push({ x: -470 + 940 * Math.random(), y: WL - 3 - 75 * Math.random(), z: -85 + 170 * Math.random(), vx: 0, vy: 0 });
  },

  step: function (c, dt, S) {
    var o = this.o, w = S.w, tied = S.controls.boat === "tied", RM = 205, u = w * RM, i, j;
    // boat: push from the boards against drag of the hull (cm/s)
    if (tied) o.v = 0;
    else { var rel = u - o.v; o.v += (rel * Math.abs(rel) - .16 * o.v * Math.abs(o.v)) * .004 * dt; }
    o.th += w * dt; var ang = -o.th, da = w * dt;                                  // clockwise seen from the front
    o.wheel.rotation.z = ang;
    for (i = 0; i < o.N; i++) {
      var d = o.d[i], r = Math.hypot(d.x, d.y), ph = Math.atan2(d.y, d.x);
      if (r > 150 && r < 232 && Math.abs(d.z) < 75 && da > 0) {
        for (j = 0; j < 8; j++) {
          var aj = ang + j * Math.PI / 4, gap = ((aj - ph) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);   // how far the board still has to turn to reach the dot
          if (gap < da + .01) {                                                     // the board swept over the dot this frame: it is carried along
            var p2 = aj - .09; d.x = r * Math.cos(p2); d.y = r * Math.sin(p2);
            d.vx = w * d.y; d.vy = -w * d.x; break;
          }
        }
      }
      var k = Math.min(1, 1.2 * dt);
      d.vx += (-o.v - d.vx) * k; d.vy += (0 - d.vy) * k;
      d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.y > o.WL - 3) { d.y = o.WL - 3; if (d.vy > 0) d.vy = 0; }
      if (d.y < o.WL - 140) { d.y = o.WL - 140; d.vy = 0; }
      if (d.x < -470) { d.x += 940; d.y = o.WL - 3 - 75 * Math.random(); d.vx = -o.v; d.vy = 0; }
      if (d.x > 470) d.x -= 940;
      o.dots.put(i, d.x, d.y, d.z, Math.min(1, (470 - Math.abs(d.x)) / 30));
    }
    o.dots.flush();
    S.set("v", (o.v * .036).toFixed(1) + " km/h");
    S.set("u", (u * .036).toFixed(1) + " km/h");
  }
});
