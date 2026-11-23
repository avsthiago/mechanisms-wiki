/* No. 218 is the other half of No. 217's machine. The whole machine is built by window.M507WoolComb in
   movements/217/movement.js; this file loads it if needed and gives this page its own wording, views and opening moment. */
(function () {
  function go() {
    var W = window.M507WoolComb, D = Math.PI / 180;
    M507.define(W({
      number: 218,
      title: "Wool-comb roller catch and notch wheel",
      lede: "A swinging lever turns a notched wheel on a roller through a hooked catch. The catch drives the wheel back a little, then forward twice as far, then lets go while the lever swings back. So the roller feeds combed wool out in steps.",
      alt: "A round wheel with small notches round its edge, on the roller shaft. A long lever swings on the same shaft, with a stud on its lower end and a hooked catch hinged to its upper end. The catch lies over the top of the wheel with its nose in a notch. Behind, a big disc with a heart-shaped groove holds the stud.",
      parts: W.parts("A disc with a heart-shaped groove that swings the lever by its stud. A pale raised piece near its middle lifts the catch once each turn."),
      how: [
        "The lever turns loose on the roller shaft. The grooved disc behind it swings it to and fro once each turn. The notched wheel is fixed to the roller, so the roller only moves when the wheel does.",
        "A catch is hinged to the top of the lever, and a spring presses it down. While its nose sits in a notch, the wheel must follow the lever. First the lever swings back a little, then forward twice as far, and the roller goes with it. Then a raised piece on the disc lifts the catch out. The lever swings back, and the nose slides over the plain rim until it drops into the next notch. All that time the roller rests.",
        "Watch the Roller reading. It goes below zero, then up to its highest, then stays there while the Now reading says Resting. Each turn of the disc leaves the roller one notch further on. Pick the catch to follow its nose in and out of the notches."
      ],
      note: "This model is rebuilt from Brown's drawing and description. Brown shows the lever and the cam on two separate drawings, so how they sit together was made up. The cam is placed behind the lever, with its centre below and to the right of the roller. On this page the cam is drawn faint so the wheel and lever can be seen; pick it to see it solid. Brown puts the lifting projection on the back of the cam's wheel; here it is a raised piece on the cam's front face, and the catch has a tail with a pin for it to strike. The spring on the catch, the roller, the shafts and the stands were made up. Brown says the roller goes back a third of a turn and forward two thirds. With as many notches as his drawing shows, the lever cannot swing that far, so here it goes back one notch and forward two, which keeps his one to two share.",
      views: { "3d": [75, 45, 370], front: [8, -12, 290], side: [600, 0, 40] },
      target: [12, 0, 15], distance: [200, 1800],
      opacity: function (key, S) { return (key !== "cam" || S.iso === key) ? 1 : .3; },
      start: function (K, G) {                                // lever upright as drawn, on its forward swing, catch in a notch
        var lo = 185, hi = 355, i, m;
        for (i = 0; i < 40; i++) { m = (lo + hi) / 2; if (G.lever(K.thE - m * D) > 0) lo = m; else hi = m; }
        return (lo + hi) / 2;
      }
    }));
  }
  if (window.M507WoolComb) go();
  else { var s = document.createElement("script"); s.src = "movements/217/movement.js"; s.onload = go; document.body.appendChild(s); }
})();
