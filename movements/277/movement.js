M507.define({
  number: 277,
  title: "Revolver cylinder ratchet",
  lede: "Pulling back the hammer of this revolver also turns its cylinder. A small finger on the hammer, called a pawl, pushes a ratchet on the back of the cylinder. Each time the hammer is pulled back, the next chamber turns up to the top, ready to fire.",
  alt: "On the left, the back of a big round cylinder seen from the side, with a ring of saw teeth on its back face. On the right, a hammer that pivots on a pin. A thin finger hangs from a pin low on the hammer and reaches up to the teeth. A thin spring from a fixed block above presses the finger against the teeth.",
  parts: [
    { key: "hammer", color: "#5E7387", name: "Hammer", note: "It swings back on its pin when you pull it with your thumb. The small dark hole shows it turning." },
    { key: "hand", color: "#C2503F", name: "Pawl", note: "A thin finger that pushes, called a pawl, on a pin low on the hammer. When the hammer goes back, it rises and pushes a tooth. Watch its tip." },
    { key: "spring", color: "#8E7AA8", name: "Spring", note: "A thin flat spring fixed at its top. It keeps the finger pressed against the teeth." },
    { key: "ratchet", color: "#4FA58A", name: "Ratchet", note: "Six saw teeth on the back of the cylinder, one for each chamber. Each tooth has a steep side for the finger to push." },
    { key: "cyl", color: "#C8873A", name: "Cylinder", note: "It holds six shots. The red chamber end shows how far it has turned." }
  ],
  controls: [{ type: "range", id: "cock", label: "Hammer pulled back", min: 0, max: 100, step: 1, value: 0, unit: "%",
    presets: [[0, "Down"], [50, "Half"], [100, "All the way"]], pauseOnInput: true }],
  speed: { min: 6, max: 40, value: 15, label: "Shots a minute", unit: "" },
  readouts: [{ id: "ch", label: "Top chamber" }, { id: "turn", label: "Turned" }],
  views: { "3d": [130, 70, 820], front: [20, 0, 800], top: [-40, 800, 40] },
  target: [20, 0, 0],
  distance: [300, 1800],
  how: [
    "Pull the hammer back and it swings on its pin. Low down on the hammer is a pin that carries a thin finger. As the hammer swings back, that pin moves up, and the finger rises with it.",
    "A spring presses the tip of the finger against the saw teeth on the back of the cylinder. Going up, the tip meets the steep side of a tooth and pushes it, so the cylinder turns one sixth of a turn. When the hammer falls, the finger slides back down over the sloping side of the next tooth and drops in behind it, ready for the next shot.",
    "Pause, then move the hammer slider slowly from down to all the way back. Watch the finger lift the tooth. Then move it back to down and watch the finger slip over a tooth while the cylinder stays still."
  ],
  note: "This model is rebuilt from Brown's drawing. The frame plate, the base, the block that holds the spring and the front bearing of the cylinder were made up. The hammer outline is traced from the drawing. In a real revolver a stop locks the cylinder after each turn and a main spring throws the hammer forward; both are left out, and here the cylinder simply stays where the finger leaves it. The end of the spring is fixed to one spot on the finger here; in a real gun it slides a little along it. The trigger and the link at the bottom of the hammer are left out too.",

  // H: hammer pin; P0: finger pin at rest; YC: cylinder axis height; ZH: plane of the finger; XB: back face of the cylinder
  K: { H: [9, -63], P0: [-45, -81], YC: -7, ZH: 29, R1: 3.5, XB: -114, BASE: 3, DEPTH: 9, GMAX: 45, SC: .6, EPS: .03 },
  hammerPts: [[-34.2,204.6],[0,220.2],[45,210],[87,201],[117,214.2],[144,226.2],[156,222],[153,210],[129,186],[105,162],[93,147],[75,126],[60,99],[52.2,63],[52.2,36],[75,3],[90,-21],[81,-37.8],[45,-45],[-9,-46.2],[-54,-43.8],[-64.2,-34.2],[-63,-21],[-65.4,-6],[-63,6],[-54,19.8],[-33,48],[-6,78],[10.2,114],[13.8,147],[7.8,172.2],[-6,189],[-24,197.4]],

  // hammer fraction over one shot: slow pull back, hold, fast fall, rest
  prof: function (p) {
    if (p < .55) return .5 - .5 * Math.cos(Math.PI * p / .55);
    if (p < .7) return 1;
    if (p < .75) { var q = (p - .7) / .05; return 1 - q * q; }
    return 0;
  },
  pin: function (g) { var K = this.K, a = this.th0 - g; return [K.H[0] + this.rh * Math.cos(a), K.H[1] + this.rh * Math.sin(a)]; },
  ang: function (y, z) { return Math.atan2(y - this.K.YC, z); },        // angle round the cylinder axis, 0 level, up positive
  // tip of the finger for hammer angle g and cylinder angle psi: the spring holds it on the tooth face
  tip: function (g, psi) {
    var K = this.K, Pp = this.pin(g), x = K.XB + K.BASE + K.R1, y = 0, i, rr = this.rat;
    for (i = 0; i < 6; i++) {
      var dx = Math.max(-this.lh, Math.min(this.lh, x - Pp[0]));
      y = Pp[1] + Math.sqrt(this.lh * this.lh - dx * dx);
      var hmax = Math.max(rr.heightAt(-(this.ang(y, K.ZH) - psi)), rr.heightAt(-(this.ang(y + K.R1 * .99, K.ZH) - psi)));
      x = K.XB + hmax + K.R1;
    }
    return { px: Pp[0], py: Pp[1], x: x, y: y, uc: this.ang(y + K.R1, K.ZH) };
  },

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, K = this.K, i;
    this.rh = Math.hypot(K.P0[0] - K.H[0], K.P0[1] - K.H[1]); this.th0 = Math.atan2(K.P0[1] - K.H[1], K.P0[0] - K.H[0]);
    this.lh = Math.hypot(K.XB + K.BASE + K.R1 - K.P0[0], -18 - K.P0[1]);
    var o = this.o = { ph: .8, g: 0, f: 0, was: true };
    // cylinder and ratchet, turning about X
    o.cyl = new T.Group(); o.cyl.position.set(0, K.YC, 0); scene.add(o.cyl);
    var mc = c.mat("cyl");
    P.at(P.cylX(130, 81, mc), -154.5, 0, 0, o.cyl);                    // x -195..-114
    this.rat = P.faceRatchet({ teeth: 6, rIn: 22, rOut: 50, depth: K.DEPTH, base: K.BASE, material: c.mat("ratchet") });
    var rg = new T.Group(); rg.position.x = K.XB; o.cyl.add(rg); rg.add(this.rat);
    P.frame(rg, new T.Vector3(0, 0, 1), new T.Vector3(0, -1, 0));      // ratchet axis along +X; its local angle is minus ours
    // where the steep faces are once a shot is done, chambers centred on the top there
    var gm = K.GMAX * Math.PI / 180, uTop = 0, pch = Math.PI / 3, ps = 0;
    for (i = 0; i < 4; i++) { uTop = this.tip(gm, ps).uc; ps = uTop + K.EPS; }   // tip in the valley, just short of a steep side
    o.psi0 = uTop + K.EPS - pch; o.psi = o.psi0; o.uPrev = this.tip(0, o.psi).uc - o.psi;
    var chU = Math.PI / 2 - uTop - K.EPS + pch;                                       // chamber angle on the cylinder that is on top at the start; the red one
    for (i = 0; i < 6; i++) {
      var u = chU + i * pch, y = 86 * Math.sin(u), z = 86 * Math.cos(u);
      P.at(P.cylX(20, 1.5, i === 0 ? c.mat("cyl", "mark") : c.mat("cyl", "dark")), K.XB + .5, y, z, o.cyl);    // chamber end x -114.25..-112.75, 1.25 proud of the back face
      var st = P.box(81, 1, 4, c.mat("cyl", "dark")); st.position.set(-154.5, 131 * Math.sin(u + pch / 2), 131 * Math.cos(u + pch / 2));
      st.rotation.x = -(u + pch / 2) + Math.PI / 2; o.cyl.add(st);      // line r 130.5..131.5, off the round side
    }
    // hammer
    o.ham = new T.Group(); o.ham.position.set(K.H[0], K.H[1], 0); scene.add(o.ham);
    var sh = new T.Shape(); this.hammerPts.forEach(function (p, j) { if (j) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); });
    var hg = new T.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false }); hg.translate(0, 0, -4);
    o.ham.add(new T.Mesh(hg, c.mat("hammer")));                         // hammer z -4..4
    var hp = [K.P0[0] - K.H[0], K.P0[1] - K.H[1]];
    P.at(P.cylZ(10, 9, c.mat("hammer")), hp[0], hp[1], 0, o.ham);      // boss z -4.5..4.5
    P.at(P.cylZ(4, 22.5, c.mat("hammer")), hp[0], hp[1], 15.75, o.ham); // stud z 4.5..27, the finger sits on its end
    P.at(P.cylZ(6, 9, c.mat("hammer", "dark")), 57, -39, 0, o.ham);     // dark hole, 0.5 proud each face
    for (i = 0; i < 6; i++) P.at(P.box(1.2, 7, 9, c.mat("hammer", "dark")), 121 + i * 5.5, 208 + i * 2, 0, o.ham).rotation.z = -.4;   // grip lines on the spur, 0.5 proud each face
    // finger and spring
    o.hand = new T.Group(); o.hand.position.z = K.ZH; scene.add(o.hand);
    o.hand.add(P.armPlate({ length: this.lh, r0: 9, r1: K.R1, thick: 4, material: c.mat("hand") }));   // z ZH-2..ZH+2
    P.at(P.cylZ(4, 1, c.mat("hand", "dark")), 0, 0, 2.5, o.hand);       // pin head z ZH+2..ZH+3
    o.spr = P.flatStrip({ points: [[0, 0], [0, -1], [0, -2], [0, -3]].concat(Array(16).fill([0, -4])), thick: 2.5, width: 4, material: c.mat("spring") });
    o.spr.userData.live = true; o.spr.position.z = K.ZH; scene.add(o.spr);
    // fixed: base, frame plate, spring block, hammer pin, front bearing
    P.at(P.box(360, 10, 44, c.fixed), -60, -155, -2, scene);            // base x -240..120, y -160..-150, z -24..20
    P.at(P.box(216, 258, 10, c.fixed), 12, -21, -19, scene);            // frame plate x -96..120, y -150..108, z -24..-14, on the base
    var bs = new T.Shape(); bs.moveTo(-93, 36); bs.absarc(-93, 67.5, 31.5, -Math.PI / 2, Math.PI / 2, false); bs.lineTo(-93, 36);
    var bg = new T.ExtrudeGeometry(bs, { depth: 46, bevelEnabled: false, curveSegments: 24 }); bg.translate(0, 0, -14);
    scene.add(new T.Mesh(bg, c.fixed));                                 // spring block z -14..32, on the plate face; bottom corner (-93, 36)
    P.at(P.cylZ(7, 19.5, c.fixed), K.H[0], K.H[1], -4.25, scene);       // hammer pin z -14..5.5, head 1.5 proud of the hammer
    P.at(P.box(25, 155, 40, c.fixed), -227.5, -72.5, 0, scene);         // front bearing x -240..-215, y -150..5, on the base
    P.at(P.cylX(10, 20, c.fixed), -205, K.YC, 0, scene);                // cylinder pin x -215..-195, from the bearing to the cylinder face
    this.place(0);
  },

  place: function (f) {
    var o = this.o, K = this.K, g = f * K.GMAX * Math.PI / 180, p = Math.PI / 3, t = this.tip(g, o.psi);
    var wall = (Math.floor(o.uPrev / p + 1e-6) + 1) * p;
    if (t.uc - o.psi > wall - K.EPS) { o.psi = t.uc - wall + K.EPS; t = this.tip(g, o.psi); }   // the tip pushes the steep side; EPS keeps it just clear of the corner
    o.uPrev = t.uc - o.psi;
    o.cyl.rotation.x = -o.psi;
    o.ham.rotation.z = -g;
    var be = Math.atan2(t.y - t.py, t.x - t.px);
    o.hand.position.x = t.px; o.hand.position.y = t.py; o.hand.rotation.z = be;
    // spring: from the bottom of the block down to the back of the finger
    var s = K.SC * this.lh, hw = 9 + (K.R1 - 9) * K.SC + 1.25, dx = Math.cos(be), dy = Math.sin(be);
    var C = [t.px + s * dx + hw * dy, t.py + s * dy - hw * dx], A = [-91.5, 36], L = Math.hypot(C[0] - A[0], C[1] - A[1]) / 3;
    var B1 = [A[0], A[1] - L], B2 = [C[0] + dx * L, C[1] + dy * L], pts = [], i;
    for (i = 0; i < 20; i++) {
      var q = i / 19, u = 1 - q;
      pts.push([u * u * u * A[0] + 3 * u * u * q * B1[0] + 3 * u * q * q * B2[0] + q * q * q * C[0], u * u * u * A[1] + 3 * u * u * q * B1[1] + 3 * u * q * q * B2[1] + q * q * q * C[1]]);
    }
    o.spr.setPoints(pts);
  },

  step: function (c, dt, S) {
    var o = this.o, f;
    if (S.playing) {
      if (!o.was && o.f > 0) o.ph = .55 * Math.acos(1 - 2 * o.f) / Math.PI;   // carry on from where the slider left the hammer
      o.ph += S.w * dt / (2 * Math.PI); o.ph -= Math.floor(o.ph);
      f = this.prof(o.ph);
      S.setControl("cock", Math.round(f * 100));
    } else f = (+S.controls.cock) / 100;
    o.was = S.playing; o.f = f;
    this.place(f);
    var n = Math.round((o.psi - o.psi0) / (Math.PI / 3));
    S.set("ch", String(((n % 6) + 6) % 6 + 1));
    S.set("turn", Math.round(((o.psi - o.psi0) * 180 / Math.PI) % 360) + "°");
  }
});
