---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 9.4 Your voice, your consent
slug: voice-use-check
version: 1
owner: interaction-designer
---

# Canvas spec: Whose voice, and what for?

## Teaching claim
Your own voice, or a stock voice, with a label is fine. Anyone else's voice needs their explicit yes first. Some uses, such as tricking people into sending money, are never fine.

## Why a canvas
The three buckets look easy until the cards mix them: a joke, a public video and a friend's voice all feel harmless. Sorting and getting a reason for each wrong bucket teaches where the line is better than a list.

## Model
- Buckets: Fine (yours or stock), Needs a yes (their clear yes), Never (tricks for money).
- Cards (eight, dealt in a mixed order, three Fine, three Needs a yes, two Never):
  | Card | Bucket | Dossier ids |
  |---|---|---|
  | You record your own voice reading your demo script | Fine | C36 (own voice-overs) |
  | A classmate's voice, cloned for your group's demo video | Needs a yes | C27 |
  | A message in a cousin's voice asking for money fast | Never | C31 |
  | Your own cloned voice reads the script, line one says it is AI | Fine | C27, C35 to C38 |
  | A speaker's voice cloned from a public video | Needs a yes | C27 |
  | A voice like a shop owner's, telling customers to pay a new account | Never | C27, C31 |
  | A stock voice from the tool, marked "AI voice" | Fine | C35 to C38 |
  | A teacher's voice made to say a joke in the class chat | Needs a yes | C27 |
- Rule: the shared sorter model. A right bucket moves on; a wrong bucket shows the reason written for that card and bucket.
- Assumptions: the sort is this course's own advice. The tool's rules (C27) and platform rules (C36 to C38) can be stricter; the chapter says to read them. The default path of the chapter needs no cloning at all, and cloning is a paid, optional demonstration (C25, C26).
- Limitations: stated in `limits` (laws and platform rules differ by place and by whether you earn money; not legal advice).

## Rendering
- Primary: the shared sorter primitive (inline SVG, 420 units wide, three trays).
- Why this renderer: the learner must choose and get a consequence.
- Controls: tap a bucket or drag the card onto it. Bucket labels are at most 15 characters and sub lines at most 18. Card text is at most 72 characters.
- Static fallback: the card list and answers in the primitive's text alternative.

## Controls
Three bucket buttons, drag as an alternative, and "Sort again" at the end.

## Visualisation
One card on top, three trays with counts, a reason in red after a wrong try, a verdict after the last card.

## Copy
- What this shows: where each use of a voice belongs.
- Try this:
  1. Put the classmate card in Fine first, and read why it is wrong.
  2. Notice that a public video is not a yes.
  3. Notice that a yes does not make a trick for money acceptable.
- What changed: counts in the trays and the verdict.
- Limits of the model: set in `limits`.

## Edge cases
A wrong try keeps the card and marks it missed. A second round deals in a new order.

## Accessibility
Bucket buttons are real buttons labelled with name, gloss and count. A polite live region reads each result and reason. Reduced motion removes the flight and the shake.

## Acceptance criteria
- [x] The claim is testable: the learner can sort a new use of a voice into a bucket.
- [x] `checkDeck` returns no problems.
- [x] No dash characters; every person in the cards is fictional.
- [x] Prediction before (chapter 9.4: is a spoken yes in passing enough?), transfer check after.
- [x] Reader fallback exists.

## Build plan
`packages/learning-ui/src/canvas/voice-use-check/data.ts` (exports `VOICE_USE_BUCKETS`, `VOICE_USE_CARDS`, `voiceUseCheck`), primitive `makeSorterCanvas`. The orchestrator registers the slug.
