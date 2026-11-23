M507.define({
  number: 213,
  title: "Watch stop, second kind",
  lede: "A stop that lets a watch spring be wound only so many turns, then blocks the key. A pin on the winding wheel moves a stop wheel one tooth per turn. The stop wheel has only a few teeth, and its plain edge is what stops the pin.",
  alt: "A ring above with a narrow cut from its top edge into its middle, and a short row of square teeth along its lower edge. Below it, a wheel with saw teeth all round and a square end on its arbor. A small red pin on the lower wheel sits in a gap between two teeth of the ring.",
  parts: [
    { key: "drive", color: "#5E7387", name: "Ratchet wheel", note: "The wheel on the spring arbor, turned by the key. Its saw teeth are for the click that holds the spring, which is not shown. Watch the red pin on its face." },
    { key: "driven", color: "#C8873A", name: "Stop wheel", note: "A ring with a short row of teeth on one part of its edge. The rest of the edge is plain. The cut into the middle lets it spring tight on its round stud." },
    { key: "crank", color: "#D9B13B", name: "Winding key", note: "The key that winds the watch. It fits on the square end of the arbor." }
  ],
  readouts: [{ id: "wound", label: "Wound" }, { id: "state", label: "Key" }],
  views: { "3d": [250, 130, 620], front: [0, 0, 620], side: [620, 0, 0] },
  target: [0, 5, 0],
  how: [
    "Turn the key and the lower wheel turns with it. Once each turn its pin dips into a gap between two teeth of the ring. It pushes the ring round by one tooth, then lifts out. The rest of the time the ring stays where it was left.",
    "The ring has only a few gaps. When the last one has gone by, the pin meets the plain edge of the ring instead of a gap. It presses straight in towards the ring's centre, which cannot turn it. So the key stops.",
    "Let it run and watch the turns count up until the key stops. Then it turns back the other way, as the spring unwinds, and the plain edge on the other side stops it again. Count the turns between the two stops."
  ],
  note: "This model is rebuilt from Brown's drawing. Brown only calls it another kind of stop. Here the small circle he draws between the teeth is read as a pin on the lower wheel. The cut in the ring is read as a way to make it grip its stud, so rub holds it still between pushes. The key, the stud, the plate that holds the shafts and the sizes were made up. The click for the saw teeth is left out, as in the drawing. The spring is left out too, so the model just turns back to show unwinding.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, TAU = 2 * Math.PI, DEG = Math.PI / 180;
    var D = 142, RO = 90, RR = 76, RH = 45, SW = 4;        // ring: outer radius, gap bottoms, hole, half the width of the cut
    var G = 5, PIT = 24 * DEG, GW = 12 * DEG;              // gaps: number, step, width
    var RP = Math.sqrt(D * D + RO * RO - 2 * D * RO * Math.cos(12 * DEG)), PR = 3.5;   // pin circle (crosses the ring's edge 12 degrees each side of the bottom) and pin radius
    var UY = D / 2, LY = -D / 2;                           // ring centre above, wheel centre below
    var gaps = [], k;
    for (k = 0; k < G; k++) gaps.push(-Math.PI / 2 + (k - (G - 1) / 2) * PIT);
    function edgeR(g) {                                    // radius of the ring's outer edge at local angle g
      for (var j = 0; j < G; j++) { var d = g - gaps[j]; d -= TAU * Math.round(d / TAU); if (Math.abs(d) < GW / 2) return RR; }
      return RO;
    }
    var corners = [];                                      // corners of the gaps, where a pin could catch
    gaps.forEach(function (g) { [-1, 1].forEach(function (s) { [RO, RR].forEach(function (r) { corners.push([r * Math.cos(g + s * GW / 2), r * Math.sin(g + s * GW / 2)]); }); }); });
    var circ = [], i;
    for (i = 0; i < 90; i++) circ.push([PR * Math.cos(i * TAU / 90), PR * Math.sin(i * TAU / 90)]);
    function pin(b) { return [RP * Math.cos(b), LY + RP * Math.sin(b) - UY]; }    // pin centre relative to the ring centre
    function overlap(b, psi) {                             // does the pin cut into the ring turned by psi?
      var p = pin(b), cs = Math.cos(psi), sn = Math.sin(psi), j, x, y, r;
      if (Math.hypot(p[0], p[1]) > RO + PR) return false;
      for (j = 0; j < circ.length; j++) {
        x = p[0] + circ[j][0]; y = p[1] + circ[j][1]; r = Math.hypot(x, y);
        if (r < RO && r < edgeR(Math.atan2(-sn * x + cs * y, cs * x + sn * y))) return true;
      }
      for (j = 0; j < corners.length; j++) {
        x = cs * corners[j][0] - sn * corners[j][1]; y = sn * corners[j][0] + cs * corners[j][1];
        if (Math.hypot(x - p[0], y - p[1]) < PR) return true;
      }
      return false;
    }
    // The pin pushes the ring only as far as it must, whichever way the contact turns it. If no small turn of the ring
    // clears the pin, the pin is pressing on the plain edge straight towards the ring's centre: the key is stopped.
    // Returns the new ring angle, or null when stopped.
    function settle(b, psi) {
      if (!overlap(b, psi)) return psi;
      var best = null, s, lo, hi, it;
      for (s = -1; s <= 1; s += 2) {
        lo = 0; hi = 0;
        for (it = 0; it < 80; it++) { lo = hi; hi += .025 * DEG; if (!overlap(b, psi + s * hi)) break; }
        if (it === 80) continue;
        for (it = 0; it < 30; it++) { var m = (lo + hi) / 2; if (overlap(b, psi + s * m)) lo = m; else hi = m; }
        if (best === null || hi < Math.abs(best - psi)) best = psi + s * hi;
      }
      return best;
    }
    // Move the wheel from st.b towards b in small steps. Returns true if it was stopped on the way (st.b is then the touch).
    function advance(st, b) {
      var n = Math.ceil(Math.abs(b - st.b) / (.25 * DEG)), i, b1, q;
      for (i = 1; i <= n; i++) {
        b1 = st.b + (b - st.b) / (n - i + 1);
        q = settle(b1, st.psi);
        if (q === null) {
          var lo = st.b, hi = b1, it;
          for (it = 0; it < 40; it++) { var m = (lo + hi) / 2, qq = settle(m, st.psi); if (qq === null) hi = m; else { lo = m; st.psi = qq; } }
          st.b = lo; return true;
        }
        st.b = b1; st.psi = q;
      }
      return false;
    }
    var b0 = 98 * DEG, p0 = pin(b0);                       // the pin starts just left of the top of the wheel, in the middle gap
    var o = this.o = { advance: advance, overlap: overlap, dir: 1, hold: 0 };
    var st = { b: b0, psi: Math.atan2(p0[1], p0[0]) + Math.PI / 2 };
    var a = { b: st.b, psi: st.psi };
    while (!advance(a, a.b - 30 * DEG));                   // wind to the stop, as the model will first do
    o.bW = a.b; o.psiW = a.psi;
    while (!advance(a, a.b + 30 * DEG));                   // then unwind to the other stop
    o.bU = a.b; o.psiU = a.psi;
    o.st = st;

    // ring: the outline with its gaps, the cut from the top and the hole, as one shape
    var sh = new T.Shape(), gR = Math.PI / 2 - Math.asin(SW / RO), gL = Math.PI / 2 + Math.asin(SW / RO), hL = Math.PI / 2 + Math.asin(SW / RH), hR = Math.PI / 2 - Math.asin(SW / RH);
    var M = 2880, g, r;
    sh.moveTo(RO * Math.cos(gR), RO * Math.sin(gR));
    for (i = 1; i <= M; i++) { g = gR - (gR - (gL - TAU)) * i / M; r = edgeR(g); sh.lineTo(r * Math.cos(g), r * Math.sin(g)); }
    for (i = 0; i <= 360; i++) { g = hL + (hR + TAU - hL) * i / 360; sh.lineTo(RH * Math.cos(g), RH * Math.sin(g)); }
    sh.closePath();
    var geo = new T.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, -2);
    // stop wheel: ring z -2..8, turning on a fixed stud z -30..9 (plate face to just past the ring), hole 45 round a stud of 44.6
    o.g2 = new T.Group(); o.g2.position.set(0, UY, 0); scene.add(o.g2);
    o.g2.add(new T.Mesh(geo, c.mat("driven")));
    P.at(P.box(4, RO - RH - 12, 1, c.mat("driven", "dark")), 0, -(RO + RH) / 2, 8.5, o.g2);   // dark stripe y -73..-62 towards the teeth, z 8..9, lifted off the face
    P.at(P.cylZ(44.6, 39, c.fixed), 0, UY, -10.5, scene);                 // stud z -30..9, on the plate face
    // winding wheel: saw teeth z -14..-4, arbor z -30..-14, pin z -4..8, square end z -4..0, key pipe z 0..22, bow z 22..28
    o.g1 = new T.Group(); o.g1.position.set(0, LY, 0); scene.add(o.g1);
    var rat = P.ratchet({ teeth: 24, radius: 75, depth: 9, width: 10, material: c.mat("drive") }); rat.position.z = -9; o.g1.add(rat);
    P.at(P.cylZ(6, 16, c.mat("drive")), 0, 0, -22, o.g1);                 // arbor z -30..-14
    P.at(P.cylZ(PR, 12, c.mat("drive", "mark")), RP, 0, 2, o.g1);          // red pin z -4..8, on the wheel face
    P.at(P.box(12, 12, 4, c.mat("drive", "dark")), 0, 0, -2, o.g1);        // square end z -4..0, on the wheel face
    P.at(P.cylZ(7, 22, c.mat("crank")), 0, 0, 11, o.g1);                  // key pipe z 0..22, on the square end
    P.at(P.box(12, 56, 6, c.mat("crank")), 0, 0, 25, o.g1);               // key bow y -28..28, z 22..28, on the pipe end
    // supports: ring top at y 161, wheel bottom at y -146
    P.at(P.box(240, 340, 10, c.fixed), 0, 10, -35, scene);                // plate x -120..120, y -160..180, z -40..-30; arbor and stud end at z -30
    P.at(P.box(280, 12, 100, c.fixed), 0, -166, -30, scene);              // base x -140..140, y -172..-160, z -80..20; plate stands on y -160

    o.check = function () {                                // node test: no overlap over two full cycles, and contact at each stop
      var q = { b: o.bU, psi: o.psiU }, bad = 0, n = 0, cyc, lim = [];   // start at the unwound stop
      for (cyc = 0; cyc < 4; cyc++) {
        var tgt = cyc % 2 ? 1 : -1;
        while (true) { var stp = advance(q, q.b + tgt * 2 * DEG); n++; if (overlap(q.b, q.psi)) bad++; if (stp) break; }
        lim.push(((o.bU - q.b) / TAU).toFixed(4) + ' ring ' + (q.psi / DEG).toFixed(1));
      }
      return { turns: ((o.bU - o.bW) / TAU).toFixed(3), start: ((o.bU - b0) / TAU).toFixed(3), steps: n, overlaps: bad, stops: lim,
        ringU: (o.psiU / DEG).toFixed(1), ringW: (o.psiW / DEG).toFixed(1), ring0: (st.psi / DEG).toFixed(1) };
    };
  },

  step: function (c, dt, S) {
    var o = this.o, st = o.st, TAU = 2 * Math.PI;
    if (o.hold > 0) { if (S.w > 0) o.hold -= dt; if (o.hold <= 0) o.dir = -o.dir; }
    else if (S.w > 0 && o.advance(st, st.b - o.dir * S.w * dt)) o.hold = 1.2;   // winding turns the wheel clockwise
    o.g1.rotation.z = st.b;
    o.g2.rotation.z = st.psi;
    S.set("wound", ((o.bU - st.b) / TAU).toFixed(1) + " turns");
    S.set("state", o.hold > 0 ? "Stopped" : o.dir > 0 ? "Winding" : "Unwinding");
  }
});
