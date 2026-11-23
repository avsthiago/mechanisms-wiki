/* No. 446 is a second moment of No. 445's machine. The whole machine is built by window.M507Column in
   movements/445/movement.js; this file loads it if needed and gives this page its own wording and opening moment. */
(function () {
  function go() {
    var W = window.M507Column;
    M507.define(W({
      number: 446,
      title: "Oscillating water column, cone formed",
      lede: "Water piles up into a cone on a round plate until it plugs the hole the water falls from. The moving water above has nowhere to go, so it rises above the reservoir. Then the cone bursts and the beat starts again.",
      alt: "Cut-away drawing. A channel from the left ends in a small upright tube. Below it, in a wider tube, a tall, narrow cone of water stands on a round plate and reaches up through the hole into the small tube. The water in the small tube stands higher than in the channel and splashes up at the top.",
      parts: W.parts("Holds the cone of water. While the cone touches the hole above, no water falls. The red patch marks its rim."),
      how: [
        "This is the moment the cone of water on the plate reaches up into the hole. It is tall and narrow, and runs on up inside the small tube. The stream stops falling. Only a thin sheet still runs off the edge of the plate.",
        "The water in the long channel was moving, and it cannot stop at once. It runs on into the small tube and heaps up there, higher than the water in the channel. It splashes up out of the top. The column keeps rising until its weight bursts the cone. Then the stream falls again, faster than before, and the column sinks.",
        "Time runs slowly here, because this moment is short. Watch the Column reading climb while the Cone reads its tallest. Try a big supply, then a small one, and see how often the cone forms. Choose Closed to see the tubes as they look from outside."
      ],
      note: "This model is rebuilt from Brown's drawings and description. The tubes are drawn square and cut down the middle, and the stem under the plate is made up. How fast the cone grows, and how much it can hold back before it bursts, are chosen so the beat works; Brown gives no figures. The rise and fall of the water in the channel are worked out from its weight and speed. The shape of the cone and the splash at the top of the small tube are drawn to look like Brown's figures.",
      start: function (s) { return s.blk && s.yu - s.yh > 2; },                     // cone up in the hole, column near its highest, as drawn
      speed: 20                                                                     // slower, so the short plugged moment can be watched
    }));
  }
  if (window.M507Column) go();
  else { var s = document.createElement("script"); s.src = "movements/445/movement.js"; s.onload = go; document.body.appendChild(s); }
})();
