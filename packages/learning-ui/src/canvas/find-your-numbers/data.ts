import type { SequenceSpec } from "../renderers/sequence/types";

// The Founder Interview course, chapter 2.3 "Find your numbers". Bilal fixed
// how his team's checkout handles a slow payment provider. He never measured
// the result, so he asks one question per source and writes each number with
// where it came from. One source gives nothing and becomes an honest gap.
// The numbers are the case's own. See spec.md.
export const findYourNumbers: SequenceSpec = {
  kind: "sequence",
  title: "Bilal looks for his numbers",
  purpose: "See how one question per source turns a fix you never measured into numbers with sources, and how one empty source becomes an honest gap.",
  summary:
    "Bilal asks what changed after his checkout fix. He gets permission, counts failed payments in the payment log before and after, asks the support inbox for the matching messages, and checks the cloud bill. The log and the inbox give numbers, which he writes down with their sources. The bill shows no change, so he writes that as an honest gap and says what he would check instead.",
  actors: [
    { name: "You", sub: "Bilal, developer" },
    { name: "The data", sub: "database and logs" },
    { name: "The people", sub: "inbox, users, client" },
    { name: "Your notes", sub: "number and source" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "ask one question",
      title: "Start with a question",
      note: "Bilal's fix made the checkout wait for a slow payment provider. He never measured it. He asks one question: how many payments failed before and after the fix? Before you press Next: who must Bilal ask before he looks at any data?",
      chips: ["one question", "one source"],
    },
    {
      from: 0,
      to: 1,
      label: "ask, then count",
      title: "Get permission, then count",
      note: "He asks his lead if he may read the payment log. His lead says yes for counts only. He will count failed and total attempts. He will not copy customer details. Before you press Next: what two numbers does he need from the log?",
      chips: ["ask your lead first", "counts only"],
    },
    {
      from: 1,
      to: 0,
      label: "124 of 2,480",
      tone: "good",
      title: "The log: four weeks before",
      note: "In the four weeks before the fix, the payment log shows 124 failed payments out of 2,480 attempts. That is 5%. Before you press Next: what does he need for the weeks after?",
      chips: ["124 / 2,480 = 5%", "source: payment log"],
    },
    {
      from: 1,
      to: 0,
      label: "52 of 2,600",
      tone: "good",
      outcome: "5% to 2%",
      title: "The log: four weeks after",
      note: "In the four weeks after, the log shows 52 failed payments out of 2,600 attempts. That is 2%. Before you press Next: what must he write next to these numbers?",
      chips: ["52 / 2,600 = 2%", "source: payment log"],
    },
    {
      from: 0,
      to: 3,
      label: "write it down",
      title: "Write the number with its source",
      note: "Bilal writes: 'Failed payments fell from 5% to 2% (124 of 2,480, then 52 of 2,600), four weeks each, from the payment log.' A number with no source is only a claim. Before you press Next: which other source could check the log?",
      chips: ["before", "after", "window", "source"],
    },
    {
      from: 0,
      to: 2,
      label: "ask support",
      title: "Ask the people",
      note: "He asks the support person to count messages that say 'I paid but saw an error'. The support person counts them in the inbox. Before you press Next: what might the inbox show?",
    },
    {
      from: 2,
      to: 0,
      label: "19 then 6",
      tone: "good",
      title: "The inbox: users' own words",
      note: "The inbox had 19 such messages in the four weeks before and 6 in the four weeks after. This agrees with the log, from a different source. It also shows what users felt. Before you press Next: can Bilal claim a saving from the cloud bill?",
      chips: ["19 then 6", "source: support inbox"],
    },
    {
      from: 0,
      to: 1,
      label: "check the bill",
      tone: "warn",
      outcome: "nothing found",
      title: "The cloud bill",
      note: "He compares the cloud bill for the two periods. It is the same within its usual ups and downs. His fix was not about cost, so the bill gives him nothing to claim. Before you press Next: what does he write when a source gives nothing?",
      chips: ["no change", "do not claim cost"],
    },
    {
      from: 0,
      to: 3,
      label: "write the gap",
      tone: "good",
      outcome: "honest gap",
      title: "Write what you do not know",
      note: "He adds: 'I did not measure sales. The checkout analytics belong to the marketing lead. I would ask for the count of finished checkouts before and after.' An honest gap with a plan is stronger than a guessed number.",
      chips: ["did not measure", "what I would ask"],
    },
  ],
  tryThis: [
    "Before step 1, decide whether Bilal can still find a number if he never measured. Then count how many sources gave him one.",
    "At step 2, find the two rules Bilal followed before he read any data.",
  ],
  limits:
    "This is one developer's example, with the case's own numbers. Your sources will differ, and your lead decides what data you may read. Never paste private data into the AI interviewer: write the numbers and the roles, not the names or the records. A before and after count is a hint that your work helped. It does not prove that it was your work alone.",
};
