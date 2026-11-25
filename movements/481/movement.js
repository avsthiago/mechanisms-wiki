M507.define({
  number: 481,
  title: "Wet gas meter",
  lede: "This meter counts how much gas flows into a house. Inside a case half full of water, a drum with four curved rooms turns as the gas fills its rooms one after another. Each turn lets through the same amount of gas, so counting turns measures the gas.",
  alt: "A round case seen from the front with its front cut away. It is filled with water to a little above the middle. Inside, a drum is split into four rooms by curved walls that spiral out from the middle. A pipe enters at the centre and turns up so its mouth is just above the water.",
  parts: [
    { key: "drum", color: "#C8873A", name: "Drum", note: "Four rooms with curved walls. Each room has a door near the middle and a slot at its outer edge. Watch the red mark to count the turns." },
    { key: "case", color: "#5E7387", name: "Case", note: "A closed box, filled with water to a little above the middle. The measured gas leaves from the top." },
    { key: "pipe", color: "#4FA58A", name: "Inlet pipe", note: "Brings the gas in through the drum's hollow axle, then turns up so its mouth is above the water." }
  ],
  speed: { min: 1, max: 12, value: 4, label: "Gas flow", unit: " turns/min" },
  readouts: [{ id: "n", label: "Drum turns" }, { id: "v", label: "Gas" }],
  closed: { label: "Case" },
  views: { "3d": [215, 122, 431], front: [0, 5, 520], side: [520, 5, -30] },
  target: [0, 5, -30],
  how: [
    "The gas comes out of the pipe in the middle, just above the water. The door of one room is open to it there, and the gas fills that room. The darker grey shows fresh gas. The room's outer slot is still under water, so the gas cannot escape.",
    "Gas is light and water is heavy. The gas trapped on one side of the drum floats that side up, so the drum turns. As the drum turns, that room's door dips under the water and shuts. Its slot comes up out of the water and the gas leaves, shown paler. Then the room sinks and fills with water again.",
    "Each room holds a known amount of gas, so each turn of the drum is a known amount. A counter on the axle adds up the turns. Change the gas flow: the drum turns faster, but each turn still measures the same amount. Choose Closed to see the meter as it looks from outside."
  ],
  note: "This model is rebuilt from Brown's drawing. The front of the case and drum is cut away. The shape of the walls, the slots, the outlet at the top, the feet and the amount of gas per turn are made up. The counter is left out; the readouts do its job. In a real meter the water inside a filling room sits a little lower than outside.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, D2R = Math.PI / 180, k, t;
    var o = this.o = { YW: 12, RI: 20, RO: 98, phi: 0, turns: 0, rooms: [] };
    // case: rim r 116 .. 122, z -60 .. 0; back z -64 .. -60 with a hole for the pipe
    P.at(P.annulus({ rIn: 116, rOut: 122, depth: 60, z0: -60, material: c.mat("case") }), 0, 0, 0, scene);
    c.shell(P.at(P.annulus({ rIn: 4.5, rOut: 122, depth: 4, z0: -64, material: c.fixed }), 0, 0, 0, scene));
    // closed view: the front the cut leaves out: the rim carried on to z 1, then a cover z 1 .. 5 (clear of the red mark, z 0 .. 1)
    c.shell(P.at(P.annulus({ rIn: 116, rOut: 122, depth: 1, z0: 0, material: c.mat("case") }), 0, 0, 0, scene), "closed");
    c.shell(P.at(P.cylZ(122, 4, c.mat("case")), 0, 0, 3, scene), "closed");
    // base y -138 .. -130 and two feet that carry the rim
    P.at(P.box(240, 8, 72, c.fixed), 0, -134, -30, scene);                       // x -120 .. 120, z -66 .. 6
    [-1, 1].forEach(function (s) {
      var pts = [[s * 30, -130], [s * 30, -Math.sqrt(122 * 122 - 900)]], x;
      for (x = 30; x <= 90; x += 5) pts.push([s * x, -Math.sqrt(122 * 122 - x * x)]);
      pts.push([s * 90, -130]);
      scene.add(P.prism(pts, -64, 0, c.fixed));                                   // feet y -130 up to the rim's outer face
    });
    P.at(P.cylY(6, 30, c.mat("case")), 0, 135, -30, scene);                       // gas outlet y 120 .. 150, into the rim
    // water: the part of the case below the water line, z -60 .. -.5
    var wpts = [], a0 = Math.asin(o.YW / 116);
    for (k = 0; k <= 48; k++) { var a = Math.PI - a0 + (Math.PI + 2 * a0) * k / 48; wpts.push([116 * Math.cos(a), 116 * Math.sin(a)]); }
    var wm = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .28, depthWrite: false, side: T.DoubleSide });
    var water = P.prism(wpts, -59.5, -.5, wm); water.renderOrder = 2; scene.add(c.fluid(water));
    // drum: back z -56 .. -53, journal sleeve z -60 .. -56, four rim pieces with a slot each, four spiral walls
    o.drum = P.at(new T.Group(), 0, 0, 0, scene);
    var dm = c.mat("drum");
    P.at(P.annulus({ rIn: 4.5, rOut: 100, depth: 3, z0: -56, material: c.mat("drum", "light") }), 0, 0, 0, o.drum);
    P.at(P.annulus({ rIn: 4.5, rOut: 9, depth: 4, z0: -60, material: dm }), 0, 0, 0, o.drum);
    for (k = 0; k < 4; k++) {
      var ak = k * Math.PI / 2, path = [];
      P.at(P.annulus({ rIn: o.RO, rOut: 100, depth: 53, z0: -53, from: ak + 8 * D2R, to: ak + Math.PI / 2 - .012, material: dm }), 0, 0, 0, o.drum);   // slot from ak to ak + 8 degrees
      P.at(P.annulus({ rIn: 18, rOut: o.RI, depth: 53, z0: -53, from: ak + Math.PI + 30 * D2R, to: ak + 1.5 * Math.PI, material: dm }), 0, 0, 0, o.drum);   // hub wall; door from ak + 180 to ak + 210 degrees
      for (t = 0; t <= 1.0001; t += 1 / 40) path.push(this.wall(ak, t, 0));
      o.drum.add(P.curvedVane({ path: path, thickness: 2.2, depth: 53, z0: -53, material: dm }));
    }
    P.at(P.box(8, 4, 1, c.mat("drum", "mark")), 0, 99, .5, o.drum);              // red mark on the rim's cut edge, z 0 .. 1
    // inlet pipe: along the axis from behind, through the hollow journal, then up to just above the water
    var pm = c.mat("pipe");
    P.at(P.cylZ(4, 70, pm), 0, 0, -65, scene);                                     // z -100 .. -30
    P.at(P.sphere(4, pm), 0, 0, -30, scene);
    P.at(P.cylY(4, 17, pm), 0, 8.5, -30, scene);                                   // y 0 .. 17, inside the hub (radius 18)
    P.at(P.cylZ(9, 4, pm), 0, 0, -98, scene);                                      // flange z -100 .. -96
    // gas in the rooms, rebuilt each frame
    o.fresh = new T.MeshLambertMaterial({ color: 0x6E7B88, transparent: true, opacity: .55, depthWrite: false, side: T.DoubleSide });
    o.used = new T.MeshLambertMaterial({ color: 0xA9B4BE, transparent: true, opacity: .35, depthWrite: false, side: T.DoubleSide });
    for (k = 0; k < 4; k++) { var m = P.mesh(new T.BufferGeometry(), o.fresh); m.userData.live = true; m.renderOrder = 3; scene.add(c.fluid(m)); o.rooms.push(m); }
  },

  // a point on wall k: t 0 at the middle (radius 20), 1 at the rim; the wall turns half a circle on the way out
  wall: function (ak, t, phi) { var o = this.o, r = o.RI + (o.RO + 1 - o.RI) * t, a = ak + Math.PI * (1 - t) + phi; return [r * Math.cos(a), r * Math.sin(a)]; },

  room: function (k, phi) {                                       // outline of room k, between wall k and wall k + 1
    var o = this.o, ak = k * Math.PI / 2, pts = [], t, a;
    for (t = 0; t <= 1.0001; t += 1 / 30) pts.push(this.wall(ak, t, phi));
    for (a = 0; a <= 1.0001; a += 1 / 12) { var b = ak + phi + a * Math.PI / 2; pts.push([(o.RO - 1.6) * Math.cos(b), (o.RO - 1.6) * Math.sin(b)]); }
    for (t = 1; t >= -.0001; t -= 1 / 30) pts.push(this.wall(ak + Math.PI / 2, t, phi));
    for (a = 1; a >= -.0001; a -= 1 / 12) { var d = ak + phi + Math.PI + a * Math.PI / 2; pts.push([(o.RI + 1.6) * Math.cos(d), (o.RI + 1.6) * Math.sin(d)]); }
    return pts;
  },

  clip: function (pts, yw) {                                      // keep the part above the water line
    var out = [], n = pts.length;
    for (var i = 0; i < n; i++) {
      var A = pts[i], B = pts[(i + 1) % n], ia = A[1] > yw, ib = B[1] > yw;
      if (ia) out.push(A);
      if (ia !== ib) { var f = (yw - A[1]) / (B[1] - A[1]); out.push([A[0] + (B[0] - A[0]) * f, yw]); }
    }
    return out;
  },

  step: function (c, dt, S) {
    var o = this.o, T = c.THREE, me = this, k;
    o.phi += S.w * dt; o.turns += S.w * dt / (2 * Math.PI);
    o.drum.rotation.z = o.phi;
    for (k = 0; k < 4; k++) {
      var ak = k * Math.PI / 2, m = o.rooms[k];
      // the door (in the hub wall, from ak + 180 to ak + 210 degrees) is open while part of it is above the water
      var door = false, slot, s;
      for (s = 0; s <= 1; s += .05) { var b = ak + o.phi + Math.PI + s * Math.PI / 6; if (o.RI * Math.sin(b) > o.YW) door = true; }
      var sa = ak + o.phi + 4 * Math.PI / 180; slot = 100 * Math.sin(sa) > o.YW;
      var pts = me.clip(me.room(k, o.phi), o.YW);
      m.geometry.dispose();
      if (pts.length < 3) { m.geometry = new T.BufferGeometry(); continue; }
      m.material = slot ? o.used : o.fresh;
      m.geometry = new T.ExtrudeGeometry(new T.Shape(pts.map(function (q) { return new T.Vector2(q[0], q[1]); })), { depth: 51, bevelEnabled: false });
      m.geometry.translate(0, 0, -52);
    }
    S.set("n", o.turns.toFixed(1));
    S.set("v", (o.turns * 2).toFixed(1) + " L");
  }
});
