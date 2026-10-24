import type { SequenceSpec } from "../renderers/sequence/types";

// Steady Hearts course (faith-and-resilience), chapter 7.2 "Serving others".
// Four fellows in a study circle pass small help from one to the next. Help
// reaches Rania from someone she did not help, and Ahmad, who gets nothing
// back, helps again anyway: the return is with Allah. The canvas steps through
// the people and the acts only; it never measures reward. See spec.md.
export const helpPassesOn: SequenceSpec = {
  kind: "sequence",
  title: "Where does the help go?",
  purpose: "Help passes on from person to person; the return is with Allah, not with the person you helped.",
  summary:
    "Rania sends Khalil a job lead. Khalil tests Ahmad's portfolio site on his phone and finds two broken links. Ahmad designs a clean layout for Mariam's CV. Mariam corrects the English in a report Rania is writing for a client. Khalil thanks Rania for the lead. Ahmad has received nothing back this month, and he helps again anyway by sending Khalil the notes of the Saturday call.",
  actors: [
    { name: "Rania", sub: "data analyst" },
    { name: "Khalil", sub: "software tester" },
    { name: "Ahmad", sub: "designer" },
    { name: "Mariam", sub: "English graduate" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "a job lead",
      title: "Rania sends a job lead",
      note: "Rania sees an advertisement for a remote software tester. She sends it to Khalil with a short note about the deadline. Khalil has little power and data this month, and he has nothing he can give back to her.",
      chips: ["a few minutes", "no return expected"],
    },
    {
      from: 1,
      to: 2,
      label: "tests his site",
      title: "Khalil tests Ahmad's site",
      note: "Khalil thought he had nothing to give. But he is a software tester. While his phone charges at his uncle's shop, he spends 30 minutes checking Ahmad's portfolio site and finds two broken links.",
      chips: ["30 minutes", "his own skill"],
    },
    {
      from: 2,
      to: 3,
      label: "designs her CV",
      title: "Ahmad designs Mariam's CV",
      note: "Mariam is well again after her illness and is updating her CV. Ahmad, a graphic designer, makes her a clean layout that is easy to read on a phone.",
      chips: ["after she is well"],
    },
    {
      from: 3,
      to: 0,
      label: "edits her report",
      title: "Mariam edits Rania's report",
      note: "Mariam studied English literature. She corrects the English in a report Rania is writing for a client. Help has reached Rania, but not from Khalil, the person she helped. Allah helps His servant while the servant helps his brother (Sahih Muslim 2699); the hadith does not say how or from whom.",
      chips: ["Sahih Muslim 2699"],
    },
    {
      from: 1,
      to: 0,
      label: "thanks her",
      title: "Khalil thanks Rania",
      note: "Khalil sends Rania a voice message to thank her for the lead and to say he has applied. Whoever does not thank people does not thank Allah (Sunan Abi Dawud 4811), as you saw in module 4.",
    },
    {
      from: 2,
      to: 1,
      label: "sends the notes",
      outcome: "helps again",
      title: "Ahmad helps again anyway",
      note: "Nobody has helped Ahmad back this month. Mariam's help went to Rania, not to him. He helps again anyway: he records the Saturday call as a short voice note for Khalil, who has little data. The return for his help is with Allah, whether or not he ever sees it.",
      chips: ["nothing returned", "Sahih al-Bukhari 2442"],
    },
  ],
  tryThis: [
    "Before you start, check your prediction: can Khalil, with little power, data or money, still help someone? Watch step 2.",
    "At step 6, nobody has helped Ahmad back. Why does he help again? Which hadith from the chapter answers that?",
  ],
  limits:
    "This is one month in one circle. Here help reached Rania in a way she could see, and Ahmad got nothing back that he could see. Often the return does not come through people at all. The canvas shows people and their acts only: it does not show or measure any reward, which is with Allah.",
};
