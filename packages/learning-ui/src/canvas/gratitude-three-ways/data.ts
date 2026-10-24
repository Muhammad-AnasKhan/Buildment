import type { SequenceSpec } from "../renderers/sequence/types";

// Steady Hearts course (faith-and-resilience), chapter 4.2 "Gratitude you can
// practise". One evening of Ahmad's shukr: noticed in the heart, said on the
// tongue, a specific thank you to his brother Yousef, and action that uses the
// blessing well and passes some of it on. See spec.md.
export const gratitudeThreeWays: SequenceSpec = {
  kind: "sequence",
  title: "Gratitude in three places",
  purpose: "Follow one evening of Ahmad's gratitude from his heart to his tongue to his hands, and to the brother who helps him.",
  summary:
    "Ahmad notices three blessings in his heart, thanks Allah on his tongue, thanks his brother Yousef specifically for the data, uses the data hour to add three pieces to his portfolio, designs a CV for Yousef, and uses 'look at those below you' on himself when the comparing thought returns.",
  actors: [
    { name: "Heart", sub: "Ahmad notices" },
    { name: "Tongue", sub: "Ahmad says" },
    { name: "Hands", sub: "Ahmad does" },
    { name: "Yousef", sub: "his brother" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "notices",
      title: "In the heart: notice",
      note: "Ahmad does not feel grateful tonight, and he starts anyway. Before the data hour, he writes three blessings from this week: Yousef's data, two clients who paid $105 in total, and the falafel menu that customers ask about. He sees them as gifts from Allah, not luck. Whoever is grateful is grateful for his own good (Quran 31:12).",
      chips: ["three blessings", "Quran 31:12"],
    },
    {
      from: 0,
      to: 1,
      label: "alhamdulillah",
      title: "On the tongue: thank Allah",
      note: "He says alhamdulillah for each one and makes a short dua in his own words. Allah says: remember Me and I will remember you; be grateful to Me (Quran 2:152).",
      chips: ["Quran 2:152"],
    },
    {
      from: 1,
      to: 3,
      label: "thank you, brother",
      title: "Thank the person who helped",
      note: "At dinner he thanks Yousef specifically: for the data every night, which is how he reaches his clients, and for checking his portfolio every week. Whoever does not thank people does not thank Allah (Sunan Abi Dawud 4811).",
      chips: ["specific thanks", "Sunan Abi Dawud 4811"],
    },
    {
      from: 0,
      to: 2,
      label: "use it well",
      tone: "good",
      outcome: "8 to 11 pieces",
      title: "In action: use the blessing",
      note: "He uses the data hour to add the falafel menu and the two new logos to his portfolio: eight pieces become eleven. The Prophet, peace be upon him, showed gratitude in action when he asked: should I not be a grateful servant? (Sahih al-Bukhari 4836).",
      chips: ["Sahih al-Bukhari 4836"],
    },
    {
      from: 2,
      to: 3,
      label: "a CV design",
      title: "Gratitude that passes on",
      note: "Yousef is applying for a teaching post. Ahmad designs a clean one-page CV for him. Using a skill to help the person who helped you is gratitude in action too.",
    },
    {
      from: 0,
      to: 0,
      label: "looks below",
      title: "A tool he chooses",
      note: "At 23:00 another friend's news brings back the comparing thought. Ahmad closes the app and uses the Prophet's advice on himself: when you look at someone given more, also look at someone given less (Sahih Muslim 2963). He uses it to notice what he has, never to tell anyone their pain is small.",
      chips: ["by choice", "on himself only"],
    },
  ],
  tryThis: [
    "At step 1, check the prediction you made above the canvas: did Ahmad wait to feel grateful before he started?",
    "Count the steps that happen in the Hands lane. Which of them could you do this week with a blessing of your own?",
  ],
  limits:
    "This is one good evening, drawn in order for clarity. Real gratitude does not always move from heart to tongue to hands in this order, and some evenings it will feel flat. The canvas does not measure gratitude or reward; it shows where gratitude can live and what it can lead to.",
};
