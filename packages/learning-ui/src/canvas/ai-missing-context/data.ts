import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 1.4 "What AI does not know".
// Majd asks a chat assistant the same question twice for a print shop's order
// form: alone it gives a generic plan, with four facts only he knows it gives a
// plan that fits; one fact nobody wrote down still has to come from the owner.
// See spec.md.
export const aiMissingContext: SequenceSpec = {
  kind: "sequence",
  title: "Same question, with and without the facts",
  purpose: "See how the facts only you know change an AI answer, and which fact no question can add.",
  summary:
    "Majd asks a chat assistant how to build an order form for a print shop and gets a generic plan with cloud hosting, card payments and logins. He writes down four facts about the shop, asks again with them, and gets a light page on the shop's existing hosting with no card payments. The owner then tells him the staff never read email, a fact nobody wrote down, so Majd changes that part himself, checks the hosting's help page and tests an order from a phone.",
  actors: [
    { name: "You", sub: "Majd" },
    { name: "Chat assistant", sub: "AI tool" },
    { name: "Project facts", sub: "only you know" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "same question",
      title: "The question alone",
      note: "Majd types: 'How should I build an online order form for a print shop?' He says nothing about this shop: not the budget, not the customers, not what the owner already has.",
    },
    {
      from: 1,
      to: 0,
      label: "generic answer",
      tone: "warn",
      outcome: "fits most shops",
      title: "A confident, general plan",
      note: "A modern web app, cloud hosting with a monthly bill, card payments, email confirmations and a login for every customer. It is clear and well organised. It fits an average print shop, not this one.",
      chips: ["monthly hosting bill", "card payments", "customer login"],
    },
    {
      from: 0,
      to: 2,
      label: "list the facts",
      title: "What only Majd knows",
      note: "He writes four facts the AI could not see. All four are context: who the customers are, how they pay, the budget, and what the shop already has. Customers order from phones with weak data and pay cash at the counter. The budget is $300, with nothing to pay each month. The shop already pays for a hosting account this year.",
      chips: ["phones, weak data", "$300, nothing monthly", "hosting paid this year", "cash at the counter"],
    },
    {
      from: 0,
      to: 1,
      label: "question + facts",
      title: "Same question, four facts added",
      note: "He asks the same question again, with the four facts under it. He describes the shop without pasting anything private: no customer list, no passwords for the hosting account.",
    },
    {
      from: 1,
      to: 0,
      label: "fitted answer",
      tone: "good",
      outcome: "fits this shop",
      title: "A different plan",
      note: "One light page with a short form, on the hosting the shop already pays for. No card payments and no login. Each order is emailed to the shop, and the customer sees a short order number on screen. The facts changed the shape of the plan, not only its details.",
      chips: ["one light page", "existing hosting", "no card payments"],
    },
    {
      from: 0,
      to: 2,
      label: "ask the owner",
      tone: "warn",
      outcome: "nobody wrote it",
      title: "What the AI still cannot know",
      note: "Majd shows the plan to the owner. The staff never read email: they work at the counter all day. To the owner this is obvious, so it is written nowhere. No question to the AI could have found it.",
    },
    {
      from: 0,
      to: 0,
      label: "decide, then test",
      tone: "good",
      outcome: "checked",
      title: "Majd decides and checks",
      note: "He keeps the light page and changes one part himself: orders appear on a simple list the staff keep open on the counter computer. He checks the hosting's own help page to confirm it can run the form, then sends a test order from a phone with weak signal.",
    },
  ],
  tryThis: [
    "Step 5 shows which part of the first plan the AI kept, and step 6 shows why that part still fails at this shop.",
    "At step 6, which kind of missing knowledge is the email problem: context, private data, local and recent, or something nobody wrote down?",
    "Look at step 4. What did Majd leave out of his question on purpose, and why?",
  ],
  limits:
    "Real chats are messier: the AI may ask questions back, or ignore a fact you gave it. Adding facts makes an answer fit better, but it never makes the answer checked. Some facts, like how the staff really work, only come from asking the people involved.",
};
