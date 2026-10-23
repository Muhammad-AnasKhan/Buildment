import type { SequenceSpec } from "../renderers/sequence/types";

// Building Habits That Last course, chapter 4.4 "Remove the cue and add
// friction". Maha's plan in two nights: the phone charges in the kitchen and a
// battery clock is her alarm (cue removed, friction added), she notices and
// names the urge and goes back to her book; then a slip night (she came home
// late and the phone came to bed), handled by noticing, acting and adding one
// if-then line. See spec.md.
export const phoneOutOfTheBedroom: SequenceSpec = {
  kind: "sequence",
  title: "The phone leaves the bedroom",
  purpose: "Follow one night with the plan and one slip night, and see how removing the cue, adding friction and noticing the moment work together.",
  summary:
    "At 22:45 Maha plugs her phone into a charger in the kitchen and uses a battery clock as her alarm. In bed she reads one story. When the urge to check the phone comes, she notices it, names it and goes back to the page, and she is asleep at 23:40. On a slip night she comes home late and the phone comes to bed; at 23:50 she notices, stops and takes the phone to the kitchen, asleep at 00:15. The next morning she writes one line on her card and adds an if-then line for late nights.",
  actors: [
    { name: "Maha", sub: "in her room" },
    { name: "Phone", sub: "kitchen charger" },
    { name: "Book", sub: "on the pillow" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "charge in kitchen",
      title: "Before bed: remove the cue",
      note: "At 22:45 Maha plugs the phone into a charger in the kitchen. A small battery alarm clock, about 15 shekels in this example, now wakes her at 6:45. The phone is no longer on her pillow, so the cue is gone from the bedroom.",
      chips: ["phone: kitchen", "alarm: battery clock"],
    },
    {
      from: 0,
      to: 2,
      label: "read one story",
      title: "In bed: the replacement is ready",
      note: "At 23:00 she lies down. The book of short stories and the small lamp are on her pillow, as in chapter 4.3. She starts the story.",
    },
    {
      from: 0,
      to: 0,
      label: "urge: just check",
      tone: "warn",
      outcome: "noticed",
      title: "In the moment: notice and name it",
      note: "At 23:10 a thought arrives: 'just check one thing'. She notices it and names it to herself: 'That is the scrolling habit. Not this time.' Naming it turns an automatic pull into something she can see.",
      chips: ["notice", "name it", "not this time"],
    },
    {
      from: 0,
      to: 2,
      label: "back to the page",
      tone: "good",
      outcome: "23:40",
      title: "Friction does the rest",
      note: "She turns the page. Getting the phone would mean getting up, walking to the kitchen in the dark and switching on a light: real steps. The urge passes. She is asleep at 23:40.",
      chips: ["3 steps to the phone", "asleep 23:40"],
    },
    {
      from: 1,
      to: 0,
      label: "phone comes to bed",
      tone: "bad",
      outcome: "slip",
      title: "A slip night",
      note: "On Thursday she comes home late from a family visit, tired, and falls into bed with the phone still in her hand. The cue is back on the pillow, and by 23:20 she is scrolling.",
    },
    {
      from: 0,
      to: 0,
      label: "notice: stop",
      tone: "good",
      outcome: "00:15",
      title: "Notice and act, without blame",
      note: "At 23:50 she sees the time and what is happening. She names it, stops the video, and walks the phone to the kitchen. She is asleep at 00:15, not 1:00. A slip noticed early costs less.",
    },
    {
      from: 0,
      to: 1,
      label: "kitchen first",
      title: "Learn from the slip, restart",
      note: "Next morning she writes one line on her card: 'came home late, phone came to bed'. She adds an if-then line: 'If I come home late, I plug the phone in the kitchen before I take off my shoes.' On Friday she is back to the plan.",
      chips: ["note on the card", "restart at the next cue"],
    },
  ],
  tryThis: [
    "Check the prediction you made above the canvas: at step 6, what did Maha do on the slip night instead of trying not to think about the videos?",
    "At step 5, find what brought the old cue back into the bedroom. Which line in step 7 deals with it?",
  ],
  limits:
    "Two nights cannot show every kind of slip, and some nights the urge will win before she notices. Noticing works by giving her control in the moment; it does not make the habit vanish. The plan depends on the alarm job moving to a clock and on the family being fine with no replies at night. The numbers belong to this example.",
};
