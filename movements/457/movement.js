M507.define({
  number: 457,
  title: "Well sweep",
  lede: "A long pole rests on a post, with a heavy weight on its short end. The bucket hangs from the long end and is lowered into the well. The weight does part of the lifting, so raising a full bucket is easier.",
  alt: "A long pole slopes up from a tree post to the left. A rope hangs from its tip and carries a bucket above a round well. A block of weight hangs from the short end of the pole at the right.",
  parts: [
    { key: "pole", color: "#5E7387", name: "Pole", note: "Rests on the post and tips like a seesaw. The red mark is the end of the rope. Watch it go up and down." },
    { key: "weight", color: "#8E7AA8", name: "Counterweight", note: "Hangs from the short end. It pulls that end down, so the bucket end goes up." },
    { key: "rope", color: "#D9B13B", name: "Rope", note: "Hangs from the long end of the pole and holds the bucket." },
    { key: "bucket", color: "#4FA58A", name: "Bucket", note: "Goes down into the well, fills with water, and comes up again." }
  ],
  controls: [{ id: "cw", label: "Counterweight", value: "half", options: [["none", "None"], ["half", "Half the load"], ["full", "Full load"]] }],
  readouts: [{ id: "hand", label: "Hand" }, { id: "fill", label: "Bucket" }],
  views: { "3d": [-40, 190, 800], front: [-110, 185, 660], side: [700, 185, -40] },
  target: [-110, 150, 0],
  how: [
    "The pole tips on the post like a seesaw. The long end carries the bucket. The short end carries a heavy weight. When one end goes down, the other goes up.",
    "A full bucket weighs about twice as much as the weight. An empty bucket weighs less than the weight. So you pull down to sink the empty bucket. The weight then does half the work of lifting it back up.",
    "Try No counterweight, then Half the load, then Full load. Watch the Hand reading when the bucket is full."
  ],
  note: "This model is rebuilt from Brown's drawing. The pole, post, well, rope and the weights of the bucket and counterweight are made up. The up and down swing is driven by a steady rhythm in place of a person. Water is tipped out at the top into a small trough.",

  build: function (c) {
    var T = c.THREE, P = c.P, scene = c.scene, i;
    var o = this.o = { phi: 1.7, fill: 0, tilt: 0, HY: 130, L1: 300, L2: 80, Lr: 236, WY: -28 };
    var wat = new T.MeshLambertMaterial({ color: new T.Color(c.spot), transparent: true, opacity: .6, depthWrite: false });
    var fx = c.fixed.clone(); fx.side = T.DoubleSide;
    // ground: disc with a round hole (well mouth r 55) centred on the well, x -240; top y 0, bottom y -12
    var well = P.at(new T.Group(), -240, 0, 0, scene);
    var gr = P.annulus({ rIn: 55, rOut: 330, depth: 12, z0: 0, material: c.fixed }); gr.rotation.x = Math.PI / 2; P.at(gr, 0, 0, 0, well);   // y -12..0
    var rim = P.annulus({ rIn: 55, rOut: 68, depth: 4, z0: 0, material: c.fixed }); rim.rotation.x = -Math.PI / 2; P.at(rim, 0, 0, 0, well);   // y 0..4
    P.at(new T.Mesh(new T.CylinderGeometry(55, 55, 98, 40, 1, true), fx), 0, -61, 0, well);                      // shaft wall y -110..-12
    P.at(P.cylY(55, 2, c.fixed), 0, -111, 0, well);                                                                // floor y -112..-110
    P.at(P.cylY(54, 1, wat), 0, o.WY, 0, well);                                                                    // water surface in the well
    // trough for the tipped water, x -165..-120, floor y 0..4
    P.at(P.box(45, 4, 40, c.fixed), -142.5, 2, 0, scene);
    P.at(P.box(45, 10, 3, c.fixed), -142.5, 9, 20.5, scene); P.at(P.box(45, 10, 3, c.fixed), -142.5, 9, -20.5, scene);   // sides y 4..14
    P.at(P.box(3, 10, 40, c.fixed), -121.5, 9, 0, scene);                                                          // end wall x -123..-120
    // post: trunk y 0..105, two fork plates y 105..155 either side of the pole, pin at y 130
    P.at(new T.Mesh(new T.CylinderGeometry(16, 24, 105, 24), c.fixed), 0, 52.5, 0, scene);
    P.at(P.box(30, 50, 12, c.fixed), 0, 130, 16, scene);                                                           // z 10..22
    P.at(P.box(30, 50, 12, c.fixed), 0, 130, -16, scene);
    P.at(P.cylZ(5, 20, c.mat("pole")), 0, 130, 0, scene);                                                          // z -10..10, touches the plates
    P.at(P.cylZ(8, 4, c.mat("pole")), 0, 130, 24, scene); P.at(P.cylZ(8, 4, c.mat("pole")), 0, 130, -24, scene);   // collars outside the plates, z 22..26
    // pole: x -300..80 along its own axis
    o.pole = P.at(new T.Group(), 0, o.HY, 0, scene);
    P.at(P.box(380, 12, 12, c.mat("pole")), -110, 0, 0, o.pole);
    P.at(P.sphere(5, c.mat("pole", "mark")), -300, 0, 0, o.pole);
    o.wg = P.at(new T.Group(), 80, 0, 0, o.pole);
    o.rodw = P.at(P.rod(2.5, c.mat("rope")), 0, 0, 0, o.wg); o.rodw.span(0, 0, 0, 0, -16, 0);
    o.wbox = P.at(P.box(36, 40, 30, c.mat("weight")), 0, -36, 0, o.wg);
    // rope and bucket
    o.rope = P.at(P.rod(2.5, c.mat("rope")), 0, 0, 0, scene);
    o.bg = new T.Group(); scene.add(o.bg);                                       // origin at the top of the handle
    P.at(new T.Mesh(new T.CylinderGeometry(20, 17, 50, 24, 1, true), c.mat("bucket")), 0, -45, 0, o.bg);   // y -70..-20
    P.at(P.cylY(17, 2, c.mat("bucket")), 0, -69, 0, o.bg);
    P.at(P.arc(20, 1.6, Math.PI, c.mat("bucket", "dark")), 0, -20, 0, o.bg);
    o.bw = P.at(new T.Mesh(new T.CylinderGeometry(19, 17.3, 46, 24), wat), 0, -68, 0, o.bg); o.bw.userData.live = true;
    o.pool = P.dropPool({ count: 50, radius: 2, color: c.spot, opacity: .85, parent: scene });
  },

  step: function (c, dt, S) {
    var o = this.o, d2r = Math.PI / 180, sim = S.playing ? dt : 0;
    o.phi += S.w * dt * .8;
    var th = (36 + 9 * Math.cos(o.phi)) * d2r;
    o.pole.rotation.z = -th; o.wg.rotation.z = th;
    var tx = -o.L1 * Math.cos(th), ty = o.HY + o.L1 * Math.sin(th);
    var bottom = ty - o.Lr - 70;
    // water: fills when the bottom is under the surface, is tipped out near the top of the swing
    if (bottom < o.WY - 2) o.fill += (1 - o.fill) * Math.min(1, sim * 3.5);
    var tipping = th > 42 * d2r && o.fill > .01;
    o.tilt += ((tipping ? 70 : 0) - o.tilt) * Math.min(1, dt * 6);
    if (tipping && o.tilt > 25) {
      o.fill = Math.max(0, o.fill - sim * .9);
      var a = -o.tilt * d2r, rx = 20, ry = -20;
      var px = tx + rx * Math.cos(a) - ry * Math.sin(a), py = ty - o.Lr + rx * Math.sin(a) + ry * Math.cos(a);
      if (sim > 0 && Math.random() < sim * 40) o.pool.emit(px, py, (Math.random() - .5) * 20, 50 + Math.random() * 40, -10, 0);
    }
    o.bg.position.set(tx, ty - o.Lr, 0); o.bg.rotation.z = -o.tilt * d2r;
    o.rope.span(tx, ty, 0, tx, ty - o.Lr, 0);
    o.bw.visible = o.fill > .02; o.bw.scale.set(1, Math.max(.01, o.fill), 1); o.bw.position.y = -68 + 23 * o.fill;
    var cw = S.controls.cw, cwv = cw === "none" ? 0 : cw === "half" ? 10 : 20, k = cw === "full" ? 1.26 : 1;
    o.wg.visible = cw !== "none"; o.wbox.scale.set(k, k, k); o.wbox.position.y = -16 - 20 * k;
    o.pool.step(sim, 450, function (p) { return p.y < 6; });
    var net = (4 + 16 * o.fill) - cwv;
    S.set("hand", Math.abs(net) < .5 ? "0 kg" : (net < 0 ? Math.round(-net) + " kg down" : Math.round(net) + " kg up"));
    S.set("fill", Math.round(o.fill * 100) + " %");
  }
});
