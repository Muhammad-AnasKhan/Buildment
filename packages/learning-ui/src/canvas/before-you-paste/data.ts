import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 2.2 "Before you paste: privacy and
// checking". Mahmoud's sports club job: a key check, then the stranger test,
// then he sends the shape of the data instead of the data, and checks the
// answer before he uses it. Two requests are refused: pasting a key, and
// pasting the client's member list without permission. See spec.md.
export const beforeYouPaste: StateMachineSpec = {
  kind: "state-machine",
  title: "Before you paste: Mahmoud's club job",
  purpose: "See what is refused before anything goes into an AI tool, what goes in instead, and the check before the answer is used.",
  summary:
    "Mahmoud wants help with a club's reminder script and its 300-member list. Pasting the script with its API key is refused, so he replaces the key with a placeholder. Pasting the real member list is refused, because it fails the stranger test and the club never agreed. He sends the script and five made-up rows instead, then runs the answer on a copy and opens its link before he uses it.",
  states: [
    { id: "key", name: "Key check", sub: "no secrets", col: 0, row: 0 },
    { id: "stranger", name: "Stranger test", sub: "fine if read?", col: 1, row: 0 },
    { id: "sent", name: "Sent", sub: "shape, not data", col: 2, row: 0 },
    { id: "checked", name: "Checked", sub: "then used", col: 2, row: 1 },
  ],
  edges: [
    { from: "key", to: "stranger", label: "no keys" },
    { from: "key", to: "key", label: "paste a key", kind: "rejected" },
    { from: "stranger", to: "sent", label: "made safe" },
    { from: "stranger", to: "stranger", label: "client file", kind: "rejected" },
    { from: "sent", to: "checked", label: "run" },
  ],
  steps: [
    {
      state: "key",
      title: "What Mahmoud wants to paste",
      note: "The sports club's reminder script, about 60 lines, and its member list: 300 rows of names, phone numbers and the fee each member owes. He wants the bug found and every phone number written the same way.",
      chips: ["script: about 60 lines", "list: 300 members"],
    },
    {
      state: "key",
      edge: 1,
      tone: "bad",
      outcome: "refused",
      title: "Paste the script as it is",
      note: "Line 3 holds the club's API key for its text message service. Keys and passwords never go in, with any setting. The request is refused, and nothing is sent.",
      chips: ["line 3: API key"],
    },
    {
      state: "stranger",
      edge: 0,
      title: "Take the key out first",
      note: "He replaces the key with KEY_HERE. The script still shows where the key goes, without giving it away. Now the stranger test: would he be fine if a stranger read this?",
      chips: ["KEY_HERE"],
    },
    {
      state: "stranger",
      edge: 3,
      tone: "bad",
      outcome: "refused",
      title: "Paste the full member list",
      note: "300 real names, phone numbers and fees owed. A stranger would see other people's personal data, and the club never agreed to share it. The request is refused.",
      chips: ["personal data", "no permission"],
    },
    {
      state: "stranger",
      tone: "warn",
      outcome: "do not paste",
      title: "When it cannot be made safe",
      note: "If the job needed the real names, for example to find members of one family, Mahmoud would not paste the list. He would ask the club in writing first, or do that part by hand.",
    },
    {
      state: "sent",
      edge: 2,
      tone: "good",
      outcome: "safe to send",
      title: "Send the shape, not the data",
      note: "He sends the script with KEY_HERE and five made-up members in the same three columns. He would be fine if a stranger read every word. The AI finds the bug, a date written the wrong way, writes a formula for the phone numbers, and gives a link to the text service's guide.",
      chips: ["5 made-up rows", "script with KEY_HERE"],
    },
    {
      state: "checked",
      edge: 4,
      tone: "good",
      outcome: "checked",
      title: "Check it before you use it",
      note: "He runs the formula on his made-up rows, then on a copy of the real list on his own laptop, and compares ten rows by hand. He opens the link: it leads to an old page that no longer exists, so he finds the current guide on the service's own website. The real list never left his laptop.",
      chips: ["run on a copy", "open the link"],
    },
  ],
  tryThis: [
    "Go to step 6: the script with KEY_HERE and five made-up rows were enough for the AI to find the bug and write the formula.",
    "At step 5, think of one more job where the AI would need the real data. What would Mahmoud do then?",
  ],
  limits:
    "This is one freelance job with one tool. Real cases can be less clear: some data is public but still sensitive, and some clients agree in writing to share it. Settings and company rules differ between tools and change over time, so check the tool you use. Running an answer on a copy finds many problems, not all of them.",
};
