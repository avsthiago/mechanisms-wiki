/* No. 301 is the side elevation of No. 300's machine, the two-wheel escapement. The whole machine is built by
   window.M507TwoWheel in movements/300/movement.js; this file loads it if needed and gives this page its own wording and views. */
(function () {
  function go() {
    M507.define(window.M507TwoWheel({
      number: 301,
      title: "Two-wheel escapement, side view",
      lede: "Two toothed wheels stand side by side on one shaft, seen here edge on. A weight tries to turn them. A half disc rocks to and fro between them and lets one tooth past at a time, first from one wheel and then from the other.",
      alt: "Two thin wheels seen edge on, like two upright strips with a gap between them, joined by a shaft across the top. At the bottom, between the two strips, sits a half disc with its round side down and its straight edge up. A thin shaft runs through its middle, seen end on as a small circle.",
      partText: {
        front: { name: "Right wheel", note: "One of the two escape wheels, seen edge on. A weight, not shown, keeps trying to turn both. Its lowest teeth come towards you. Watch the red tooth." },
        back: { name: "Left wheel", note: "The second escape wheel, fixed on the same shaft. Its teeth sit half way between the teeth of the right wheel." },
        pallet: { note: "A half disc fixed on the balance shaft, between the two wheels. Its flat face stops the teeth. Its straight top edge rocks like a seesaw, and the teeth slide over it. It is called the pallet." },
        spring: { name: "Balance spring", note: "A fine coiled spring at the far end of the long shaft. It pulls the balance wheel back towards the middle, so the wheel keeps swinging." },
        balance: { note: "A ring with weights at the far end of the long shaft. It swings to and fro and rocks the half disc with it. It is drawn faint here. Pick it to see it solid." }
      },
      how: [
        "You are looking along the balance shaft. The lowest teeth of both wheels come straight towards you, just above the shaft. The half disc stands across their path. Watch its straight top edge rock like a seesaw. When its right end is up, a tooth of the right wheel runs into the flat face of the disc and stops.",
        "The balance swings back and the right end dips. When the edge drops below the tooth, the tooth moves on over it. The edge is cut on a slope, so the tooth pushes it further down as it slides across. That push keeps the balance swinging. Once the tooth is clear, both wheels jump on until a tooth of the left wheel hits the flat face, where the left end is now up. On the next swing the same thing happens on the left wheel.",
        "The balance wheel and its spring set the pace. Heavy weights make the balance slow to turn, so the beats come further apart. Try Light, then Heavy, and count the beats."
      ],
      note: "This model is rebuilt from Brown's two drawings and his description. Brown shows the wheels, the shaft and the half disc. The balance wheel, the balance spring and its post, the posts, the base, the slope on the half disc and all the sizes were made up. The balance wheel, the balance spring and the stand are drawn faint so that the wheels and the half disc show clearly. The weight that turns the wheels is left out. Rubbing between a resting tooth and the disc is left out, and the rubbing that keeps the swing steady is a simple guess.",
      views: { "3d": [-400, 150, 430], front: [0, 85, 660], side: [-540, 85, 0] },
      target: [0, 85, 0], distance: [200, 1800], standOpacity: .15,
      opacity: function (key, S) { return ((key !== "balance" && key !== "spring") || S.iso === key) ? 1 : .08; }
    }));
  }
  if (window.M507TwoWheel) go();
  else { var s = document.createElement("script"); s.src = "/movements/300/movement.js"; s.onload = go; document.body.appendChild(s); }
})();
