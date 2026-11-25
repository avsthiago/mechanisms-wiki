M507.define({
  number: 468,
  title: "Flexible water main",
  lede: "A water pipe made of short stiff sections joined by ball-and-socket joints can bend at every joint. Laid across a river bed, it bends to follow the bed and still carries water without leaking.",
  alt: "A water pipe made of four short sections lies on a sloping and then flat bed. Each section sits on two wooden logs, with iron straps over the pipe. At every joint a big ball-and-socket collar joins two sections, and a hinge pin lets them swing up and down.",
  parts: [
    { key: "pipes", color: "#5E7387", name: "Pipe sections", note: "Short, stiff lengths of iron pipe. Water runs through them. They do not bend, but they swing against each other." },
    { key: "joints", color: "#C8873A", name: "Ball-and-socket joints", note: "A ball on one pipe sits in a socket on the next. The pipes can tilt, and the water stays inside." },
    { key: "frames", color: "#D9B13B", name: "Log frames", note: "Two logs under each section, held to the pipe by iron straps. They keep each section steady on the bed." },
    { key: "hinges", color: "#8E7AA8", name: "Hinge plates", note: "Iron plates on each side of a joint, joined by a pin. The pin is red. Watch it as the pipe bends." }
  ],
  controls: [{ id: "bed", label: "Bed shape", value: "drawn", options: [["drawn", "Bank"], ["flat", "Flat"], ["valley", "River channel"], ["ridge", "Ridge"]] }],
  speed: { min: 1, max: 30, value: 10, label: "Water speed", unit: "" },
  readouts: [{ id: "bend", label: "Bend" }, { id: "drop", label: "Drop" }],
  views: { "3d": [235, 138, 503], front: [0, 25, 570], top: [0, 600, 1] },
  target: [0, 10, 0],
  how: [
    "The main is a chain of short, stiff pipes. At each joint, a ball sits inside a socket, so one pipe can tilt a little against the next. Each pipe lies on two logs, and iron plates and a pin at each joint let the logs swing too.",
    "The bed under the river is not flat. Each joint turns just enough for the pipes to lie on the bed. No single pipe bends, but the whole line does. Water keeps flowing through every joint.",
    "Brown says the line was built on one bank and hauled across the river. Bending let it follow the bed as it went. Press a bed shape to see the pipes find a new line, and compare the biggest bend in each."
  ],
  note: "This model is rebuilt from Brown's drawing. It shows the side view, as in the upper picture. The number of sections, their sizes, the logs, the straps, the hinge plates and the bed under them are made up, and the bed always has exactly the slope the pipe needs. The water is drawn as moving dots.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i, k, N = 4;
    var o = this.o = { N: N, L: 120, Rp: 18, Hn: 35, ang: [-35, -35, 0, 0], tgt: [-35, -35, 0, 0], sec: [], flow: 0, key: "" };
    var Rp = o.Rp, L = o.L;
    o.J = []; for (i = 0; i <= N; i++) o.J.push([0, 0]);
    for (k = 0; k < N; k++) {
      var g = new T.Group(); scene.add(g);
      P.at(P.cylX(Rp, L - 4, c.mat("pipes")), 0, 0, 0, g);                                   // pipe, x -58..58
      // collar and cone at the left end (socket)
      P.at(P.cylX(22, 14, c.mat("joints")), -L / 2 + 11, 0, 0, g);                              // collar x -49..-35
      var cone = new T.Mesh(new T.CylinderGeometry(Rp + .8, 22, 16, 32), c.mat("joints")); cone.rotation.z = Math.PI / 2; P.at(cone, -L / 2 + 26, 0, 0, g);   // cone x -34..-18 (Cylinder's top is +y, so rotating z by +90deg puts the narrow end at -x; flip below)
      cone.rotation.z = -Math.PI / 2;
      // red-free stripe rings on the pipe
      var ring = P.hoop(Rp + .8, 1.4, c.mat("pipes", "dark")); ring.rotation.y = Math.PI / 2; P.at(ring, 12, 0, 0, g);
      // two logs under the pipe, x -50..50, y -34..-14, z ±(11..23)
      for (var s = -1; s <= 1; s += 2) {
        P.at(P.box(100, 20, 12, c.mat("frames")), 0, -24, s * 17, g);
        // hinge plates on the outside of the logs, z 23..26 and 26..29
        P.at(P.box(38, 8, 3, c.mat("hinges")), L / 2 - 19 + 4, -24, s * 24.5, g);             // right end, x 41..79 -> pin at x 60
        P.at(P.box(38, 8, 3, c.mat("hinges")), -L / 2 + 19 - 4, -24, s * 27.5, g);            // left end, outside the other plate
      }
      // iron straps over the pipe
      [-28, 30].forEach(function (x) { var st = P.hoop(Rp + 1.5, 1.6, c.mat("frames", "dark")); st.rotation.y = Math.PI / 2; P.at(st, x, 0, 0, g); });
      o.sec.push(g);
    }
    // joints: ball at each inner joint, hinge pin through the plates
    o.ball = []; o.pin = [];
    for (i = 1; i < N; i++) {
      o.ball.push(P.at(P.sphere(20, c.mat("joints")), 0, 0, 0, scene));
      var pin = P.cylZ(3.5, 60, c.mat("hinges", "mark")); scene.add(pin); o.pin.push(pin);
    }
    // water as dots, drawn over the pipe so they can be seen inside it
    o.n = 36; o.dots = P.waterDots(o.n, { radius: 3.2, color: "#4aa3df", opacity: .95 }); o.dots.material.depthTest = false; o.dots.renderOrder = 10; scene.add(o.dots);
    o.off = []; for (i = 0; i < o.n; i++) o.off.push([(Math.random() - .5) * 18, (Math.random() - .5) * 18]);
    // the bed
    o.bed = new T.Mesh(new T.BufferGeometry(), c.fixed); o.bed.userData.live = true; scene.add(o.bed);
  },

  layout: function () {
    var o = this.o, N = o.N, L = o.L, J = o.J, i, d2r = Math.PI / 180;
    J[0] = [0, 0];
    for (i = 0; i < N; i++) { var a = o.ang[i] * d2r; J[i + 1] = [J[i][0] + L * Math.cos(a), J[i][1] + L * Math.sin(a)]; }
    var cx = (J[0][0] + J[N][0]) / 2, cy = (J[0][1] + J[N][1]) / 2;
    J.forEach(function (p) { p[0] -= cx; p[1] -= cy; });
  },

  bedShape: function () {
    var o = this.o, N = o.N, J = o.J, Hn = o.Hn, d2r = Math.PI / 180, pts = [], i;
    for (i = 0; i <= N; i++) {
      var n1, n2;
      if (i > 0) { var a = o.ang[i - 1] * d2r; n1 = [-Math.sin(a), Math.cos(a)]; }
      if (i < N) { var b = o.ang[i] * d2r; n2 = [-Math.sin(b), Math.cos(b)]; }
      var m, dist;
      if (!n1) { m = n2; dist = Hn; } else if (!n2) { m = n1; dist = Hn; }
      else { var mx = n1[0] + n2[0], my = n1[1] + n2[1], ml = Math.hypot(mx, my); m = [mx / ml, my / ml]; dist = Hn / (m[0] * n1[0] + m[1] * n1[1]); }
      pts.push([J[i][0] - m[0] * dist, J[i][1] - m[1] * dist]);
    }
    var a0 = o.ang[0] * d2r, a1 = o.ang[N - 1] * d2r, E = 130;
    pts.unshift([pts[0][0] - E * Math.cos(a0), pts[0][1] - E * Math.sin(a0)]);
    pts.push([pts[pts.length - 1][0] + E * Math.cos(a1), pts[pts.length - 1][1] + E * Math.sin(a1)]);
    var yb = Math.min.apply(null, pts.map(function (p) { return p[1]; })) - 70, T = this.o.T;
    var sh = new T.Shape(); sh.moveTo(pts[0][0], yb); pts.forEach(function (p) { sh.lineTo(p[0], p[1]); }); sh.lineTo(pts[pts.length - 1][0], yb);
    var geo = new T.ExtrudeGeometry(sh, { depth: 100, bevelEnabled: false }); geo.translate(0, 0, -50);   // z -50..50
    return geo;
  },

  step: function (c, dt, S) {
    var o = this.o, N = o.N, i, T = c.THREE, P = c.P;
    o.T = T;
    var tg = { drawn: [-35, -35, 0, 0], flat: [0, 0, 0, 0], valley: [-30, -12, 12, 30], ridge: [18, 6, -6, -18] }[S.controls.bed], moved = false;
    for (i = 0; i < N; i++) {
      var d = tg[i] - o.ang[i];
      if (Math.abs(d) > .01) { o.ang[i] += d * (dt === 0 ? 1 : Math.min(1, 5 * dt)); moved = true; } else o.ang[i] = tg[i];
    }
    if (moved || o.key === "") {
      o.key = "x";
      this.layout();
      var old = o.bed.geometry; o.bed.geometry = this.bedShape(); old.dispose();
    }
    var J = o.J, d2r = Math.PI / 180, big = 0;
    for (i = 0; i < N; i++) {
      var g = o.sec[i]; g.position.set((J[i][0] + J[i + 1][0]) / 2, (J[i][1] + J[i + 1][1]) / 2, 0); g.rotation.z = o.ang[i] * d2r;
      if (i > 0) big = Math.max(big, Math.abs(o.ang[i] - o.ang[i - 1]));
    }
    for (i = 1; i < N; i++) {
      o.ball[i - 1].position.set(J[i][0], J[i][1], 0); o.pin[i - 1].position.set(J[i][0], J[i][1] - 24 * 0, 0);
      // the pin sits in the plates, which are 24 below the pipe axis along each section's normal
      var am = (o.ang[i - 1] + o.ang[i]) / 2 * d2r;
      o.pin[i - 1].position.set(J[i][0] + 24 * Math.sin(am), J[i][1] - 24 * Math.cos(am), 0);
    }
    // water dots travel along the pipe line
    o.flow += (S.playing ? S.w : 0) * dt * 18;
    var total = N * o.L, nn = o.n;
    for (i = 0; i < nn; i++) {
      var s = ((i / nn) * total + o.flow) % total; if (s < 0) s += total;
      var k = Math.min(N - 1, Math.floor(s / o.L)), u = s - k * o.L - o.L / 2, a = o.ang[k] * d2r, cs = Math.cos(a), sn = Math.sin(a);
      var mx = (J[k][0] + J[k + 1][0]) / 2, my = (J[k][1] + J[k + 1][1]) / 2, q = o.off[i];
      o.dots.put(i, mx + u * cs - q[0] * sn, my + u * sn + q[0] * cs, q[1], 1);
    }
    o.dots.flush();
    var rise = Math.round(Math.abs(J[0][1] - J[N][1]) * .5);
    S.set("bend", Math.round(big) + "°");
    S.set("drop", rise + " cm");
  }
});
