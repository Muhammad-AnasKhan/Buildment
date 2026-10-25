---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 11.03-ownership-trust-accountability
slug: own-the-incident
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Own the incident

## Teaching claim
When an AI-assisted mistake reaches other people, the person who shipped it owns it, in five moves and in this order: notice, stop the harm, tell the people affected, fix, write it down. The machine refuses two shortcuts, "blame the AI" and "move on quietly". Sources: A56 (lawyers answered for fake citations), A58 (the airline answered for its chatbot), A59 and A60 (an agent deleted a live database; people recovered it and changed access), A62 (people must be able to override and stop). The five-move order is the course's own checklist, not a research finding.

## Why a canvas
The chapter tells three real cases in short beats and one fictional incident. The machine lets the learner walk the fictional incident move by move and meet the two refusals at the moment they tempt. A written list of five steps cannot show that two plausible moves are not allowed.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the lit state, the active edge, the step note, chips and an outcome badge.
- Rule: five states, six edges. Allowed path: Notice, stop it, Harm stopped, say, People told, fix it, Fixed, log, Owned. Refused: "blame the AI" (a loop on Notice) and "move on" (Harm stopped straight to Owned, dashed).
- Facts (must match chapters 11.1 and 11.3): a fictional booking service for 9 small clinics; Rima manages one clinic; Sunday's batch was 230 texts; each showed the visit time three hours early (10:00 for a 13:00 visit); Monday 8:40 the call; the next batch was 190 texts due at 18:00; the cause was the server's clock, three hours behind the clinics, and a test run only on Jawad's laptop.
- Assumptions: one person ships and owns the code; the clinics can be reached the same morning.
- Limitations: real incidents are messier; the order can bend; see `limits`.

## Rendering
- Primary: the shared state-machine renderer, grid 3 columns by 2 rows. Notice (0,0), Harm stopped (1,0), Owned (2,0); People told (1,1), Fixed (2,1); cell (0,1) is empty because the refused loop on Notice needs the cell below it.
- Why this layout: it mirrors `who-makes-the-call`. The refused "move on" edge runs straight along row 0 from Harm stopped to Owned (dashed), next to the long way round through People told and Fixed.
- Same-column edges ("say", "log") have labels of 3 characters. Longest label: "blame the AI" (12 characters). No diagonal edges.
- Static fallback: chapter 11.3 describes the five moves and both refusals in prose.

## Controls
Shared stepper controls only. No numeric inputs.

## Visualisation
Five pills, four allowed arrows and two refused moves. Tones: bad with the badge "refused" on both refused steps; good with the badge "owned" on the writing step; chips carry the facts above.

## Copy
- What this shows: one mistake from the first phone call to a written note.
- Try this: as in `tryThis`; the first line matches the chapter's predict (pause the 18:00 batch before looking for the cause).
- What changed: each step note says who made the move and why it is allowed or refused.
- Limits of the model: as in `limits`.

## Edge cases
Step 1 lights Notice with no edge; step 8 lights Owned with no edge. A refused step keeps the state. The names Jawad and Rima, and the clinic service, are fictional and said to be so in the chapter's Sources fold.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole path for screen readers; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable: the quick check transfers it to an office report with a made-up statistic and to the opening line of an incident note.
- [x] Registry consistency, label-fit and label-overlap tests pass once registered (labels checked by hand in both layouts).
- [x] No em or en dashes.
- [x] Prediction before (chapter predict), transfer check after.
- [x] Reader fallback exists: the chapter's prose.

## Placement
Chapter 11.3, beat 2 "Own the incident, one move at a time", after the predict. The orchestrator registers the slug.
