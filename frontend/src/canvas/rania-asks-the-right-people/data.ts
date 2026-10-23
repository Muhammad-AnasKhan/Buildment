import type { SequenceSpec } from "../renderers/sequence/types";

// Steady Hearts course (faith-and-resilience), chapter 5.3 "Shura: ask people
// who know". Rania consults three kinds of people, each about what they know
// best: her mother about the family, her mentor Reem about her career, and two
// people inside the work (Samah at the NGO, Jumana who worked with the
// startup). She still decides herself. Every name and fact matches the
// chapter. See spec.md.
export const raniaAsksTheRightPeople: SequenceSpec = {
  kind: "sequence",
  title: "Rania asks the right people",
  purpose: "See how asking each person about what they know brings facts and care that a group vote cannot.",
  summary:
    "Rania first hears many opinions in a family group chat, then writes her questions down. She asks her mother about the family's needs, her mentor Reem about her career, and Samah and Jumana about the work itself. Each answer adds something only that person knew. Then Rania weighs it all and makes the decision herself.",
  actors: [
    { name: "Rania", sub: "deciding" },
    { name: "Her mother", sub: "family" },
    { name: "Reem", sub: "mentor" },
    { name: "Inside the work", sub: "Samah, Jumana" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "ask for votes?",
      tone: "warn",
      outcome: "14 opinions",
      title: "A vote gives opinions, not facts",
      note: "On Sunday night Rania posts the two offers in the big family group chat. Fourteen replies come in. Most say 'take the safe one' or 'take the money'. Almost nobody knows what either job is. A vote counts voices; it does not add knowledge.",
    },
    {
      from: 0,
      to: 0,
      label: "write questions",
      title: "Questions first, people second",
      note: "She writes down what she is weighing, 'a steady income for my family against learning for my career', and one question for each person, about what that person knows best.",
      chips: ["family needs", "career", "the work itself"],
    },
    {
      from: 0,
      to: 1,
      label: "family needs?",
      title: "Ask your family about the family",
      note: "Rania asks her mother: 'What worries you most, and what does the family need from me this year?' She listens and writes it down without arguing.",
    },
    {
      from: 1,
      to: 0,
      label: "save; Muath helps",
      tone: "good",
      outcome: "new facts",
      title: "Care, and two facts Rania did not have",
      note: "Her mother's worry is the months after a contract ends, so she suggests saving part of any extra pay. She also says Muath could help Jana with maths on two evenings a week. 'I want you to grow too,' she adds.",
      chips: ["worry: after month six", "idea: save", "Muath: two evenings"],
    },
    {
      from: 0,
      to: 2,
      label: "career question",
      title: "Ask your mentor about your career",
      note: "Rania asks Reem: 'Which offer will help my career more in three years, and what am I not seeing?'",
    },
    {
      from: 2,
      to: 0,
      label: "plan for month six",
      tone: "good",
      outcome: "questions back",
      title: "A mentor helps you think; she does not choose",
      note: "Reem asks questions back: 'What will you be able to do after six months in each job? What is your plan for month six?' She says a weekly review by a senior analyst is rare and valuable early in a career, and that renewal is never promised, so plan for the end from the first day. Then she says: 'This is your decision.'",
    },
    {
      from: 0,
      to: 3,
      label: "what is the work?",
      title: "Ask people inside the work",
      note: "Rania calls Samah, the NGO's data officer, and Jumana, who worked with the startup last year. She asks each the same thing: 'What is the work really like, day to day?'",
    },
    {
      from: 3,
      to: 0,
      label: "18:00, two nights",
      tone: "good",
      outcome: "new facts",
      title: "Facts only an insider knows",
      note: "Samah says the NGO work is steady monthly reports, the team is kind, and nearly everyone is renewed each year, but there is little new to learn. Jumana says the startup now holds calls on two evenings at 18:00 for people in their region, pays on time, and last year renewed two of its three contractors.",
      chips: ["NGO: steady, little learning", "startup: two calls at 18:00", "renewed 2 of 3"],
    },
    {
      from: 0,
      to: 0,
      label: "she decides",
      tone: "good",
      outcome: "still hers",
      title: "Weigh what each person knew, then decide",
      note: "Rania updates her page. With calls on two evenings at 18:00 and Muath's help, the startup's 'free evenings' score rises from 2 to 3, and her totals are now 39 for the NGO and 38 for the startup. Everyone helped; nobody decided for her. Consult, decide, then trust Allah (Quran 3:159).",
    },
  ],
  tryThis: [
    "Before step 3, predict: which will give Rania more useful advice, the family vote or three people asked one question each?",
    "At each answer, name the one thing that person knew that nobody else did.",
    "Look at step 6. Why does Reem answer with questions instead of telling Rania which offer to take?",
  ],
  limits:
    "Real consultation takes longer and is messier than nine steps, and people sometimes disagree. Advice is only as good as the adviser's knowledge, care and honesty, so weigh each answer by what that person really knows. The canvas shows who to ask about what; it does not say which offer Rania should take.",
};
