---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 11.02-judgment-context-and-taste
slug: who-leads-this-call
version: 1
owner: interaction-designer
renderer: sorter (shared primitive, data only)
---

# Canvas spec: Who leads this call?

## Teaching claim
Every call falls into one of three buckets. If a person's word, consent or a rule is needed, it is people only. If you can check the result and undo a mistake cheaply, the AI drafts and you decide. Otherwise you lead and the AI helps. A hard task can be a draft (a 40-line query you can test), and an easy-looking one can be people only (telling a client the date). Sources: A62, A64, A66 and chapter 1.5 "You make the call".

## Why a canvas
The chapter gives the three questions in a diagram and three short stories. Sorting eight calls makes the learner apply the questions to cards they have not seen, and a wrong try names the question the card fails. A list of "AI does / you do" cannot show that the bucket depends on the check and the relationship, not on how hard the task is.

## Model
- Primitive: sorter (`models/sorter.ts`, `primitives/sorter.tsx`, factory `makeSorterCanvas`).
- Buckets (3): `draft` "AI drafts, you decide", `lead` "You lead, AI helps", `people` "People only".
- Cards (8): three draft (subject lines, a 40-line query, a first list of tests), three lead (a layout, deploying the change, next month's plan), two people (telling the client the project is two weeks late, choosing between two applicants). Every card has a reason for each wrong bucket.
- Rules: the first question (a person's word, consent or rule) puts a card in `people`; otherwise "can I check it and undo it cheaply" puts it in `draft`; otherwise `lead`. These are the course's own tests (see `limits`).
- Assumptions: Manar's facts are the chapter's: a café client, weak phones, a copy of the data for testing.
- Limitations: real calls mix buckets; a company rule can move a card.

## Rendering
The shared sorter: a card on top, three trays, a banner, "Sort again" at the end. Bucket labels are 8 to 11 characters; card text is under 65 characters; every reason is under 85 characters.

## Copy
- What this shows: where each of Manar's calls belongs and which question decides it.
- Try this: sort the cards, then sort again and say the question out loud before each tap.
- What changed: the count in each tray goes up.
- Limits of the model: as in `limits`.

## Edge cases
A card that sounds like writing (telling the client) lands in `people`; a card that sounds hard (a 40-line query) lands in `draft`. Both are in the deck on purpose. Eight cards, split three, three and two.

## Accessibility
The shared sorter: real buttons over the trays, keyboard support, a live line that reads the result and the reason, text for every state. No colour carries meaning alone.

## Acceptance criteria
- [x] The claim is testable: the quick check transfers it to a school office.
- [x] The model is tested by `checkDeck` and the sorter tests once registered.
- [x] No em or en dashes, no colours in the data.
- [x] Prediction before (the chapter's predict about the query and the late date), transfer check after.
- [x] Reader fallback: the diagram and the beats in 11.2.

## Placement
Chapter 11.2, beat 5 "Sort Manar's afternoon". The orchestrator registers the slug in `registry.ts` and `server/src/shared/canvas/slugs.ts`.
