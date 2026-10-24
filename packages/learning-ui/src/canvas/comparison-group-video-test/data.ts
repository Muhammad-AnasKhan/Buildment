import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 3.3 "Compare with a group that did not change".
// Sami tests a one-minute video note on his proposals. A coin decides which
// proposals get a video, and the no-video group shows what would have
// happened anyway. Every number matches the chapter. See spec.md.
export const comparisonGroupVideoTest: SequenceSpec = {
  kind: "sequence",
  title: "Does a video note win Sami more replies?",
  purpose: "See why picking by hand misleads, and how a group chosen by a coin shows what would have happened anyway.",
  summary:
    "Last month 4 of 20 proposals without videos got replies. Picking video jobs by hand would favour the jobs Sami fits best. Instead a coin decides: 21 proposals get a video and 19 do not, in the same four weeks. 9 of 21 video proposals and 5 of 19 others get replies, so the video's likely effect is the gap between the groups, not the rise since last month.",
  actors: [
    { name: "Sami", sub: "sends proposals" },
    { name: "Coin", sub: "decides" },
    { name: "Video", sub: "change group" },
    { name: "No video", sub: "comparison" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "last month",
      title: "Last month, no videos",
      note: "Sami sent 20 proposals without videos and got 4 replies: 1 in 5.",
      chips: ["4 of 20 replied"],
    },
    {
      from: 0,
      to: 2,
      label: "pick by hand",
      tone: "bad",
      outcome: "unfair",
      title: "If Sami picks by hand",
      note: "He would record videos for the jobs he is most excited about. Those are the jobs that fit him best, and good-fit jobs reply more often anyway. The video group would win even if the video did nothing.",
    },
    {
      from: 0,
      to: 1,
      label: "flip each time",
      title: "Let a coin decide",
      note: "Before writing each proposal, Sami flips a coin. Heads: a video. Tails: no video. The template, the price and his reply speed stay the same. He will stop after 40 proposals, about four weeks.",
      chips: ["40 proposals", "4 weeks"],
    },
    {
      from: 1,
      to: 2,
      label: "heads: 21",
      title: "21 proposals get a video",
      note: "A coin does not split exactly in half, and that is fine.",
    },
    {
      from: 1,
      to: 3,
      label: "tails: 19",
      title: "19 proposals get no video",
      note: "They live through the same weeks, the same season and the same luck as the video group.",
    },
    {
      from: 3,
      to: 0,
      label: "5 of 19 replied",
      tone: "warn",
      outcome: "about 1 in 4",
      title: "What would have happened anyway",
      note: "Without a video, replies were about 1 in 4 this month, a little more than last month's 1 in 5. Something else may have lifted replies, but the difference is about one reply, so that part is only a hint.",
    },
    {
      from: 2,
      to: 0,
      label: "9 of 21 replied",
      outcome: "about 4 in 10",
      title: "The video group",
      note: "Nine of 21 is a little over 4 in 10.",
    },
    {
      from: 0,
      to: 0,
      label: "compare",
      tone: "good",
      outcome: "a hint",
      title: "The gap is the video's likely effect",
      note: "Before and after would say: from 1 in 5 to 4 in 10, so videos doubled the replies. The gap between the groups this month is smaller: about 4 in 10 against 1 in 4, roughly three more replies for every 20 proposals. Forty proposals is a small test, so Sami will run it again next season.",
    },
  ],
  tryThis: [
    "Before the coin step, predict: if Sami picks by hand and the video does nothing at all, which group gets more replies?",
    "Compare the first step with the 'no video' step. What would Sami have credited to the video if he had no comparison group?",
  ],
  limits:
    "Forty proposals is a small test, and a difference of a few replies can come from luck. The coin makes the groups alike on average, not exactly. The model assumes Sami keeps the no-video proposals the same; if he improves them while recording videos, the gap shrinks. It shows which did better and by about how much, not why.",
};
