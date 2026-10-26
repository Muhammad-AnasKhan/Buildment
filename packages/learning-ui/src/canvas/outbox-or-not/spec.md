---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.5
slug: outbox-or-not
version: 1
owner: interaction-designer
---

# Canvas spec: Outbox or not

## Teaching claim
Use the outbox when the database change and the event must both happen or neither. It gives at-least-once delivery, so consumers must be idempotent. When the event can be rebuilt, publish directly; when other services need every row change, read the database log (CDC); when there are no transactions, listen to yourself.

## Why a canvas
"Always use the outbox" and "never use it" are both wrong. Changing one fact at a time shows which fact makes the outbox pay.

## Model
Data for the shared context picker. First matching rule wins; `checkContextConfig` is clean; every option is reached.

- Factors: A lost event (Must arrive, Can rebuild); Transactions (Available, Not available); Others need (One event, Every change).
- Options: Outbox (same transaction), Direct publish (no extra table), CDC (read the log), Listen to yourself (Kafka first).
- Start: Must arrive, Available, One event (Outbox).

| Rule | When | Pick | Dossier ids behind it |
|---|---|---|---|
| 0 | the event can be rebuilt | Direct publish | the course's reading of B57 and B62 (metrics, cache refresh, a search index you can sync again) |
| 1 | no transactions | Listen to yourself | B62 (outbox is limited to transactional databases; listen-to-yourself makes the database eventually consistent) |
| 2 | others need every change | CDC | B62 (CDC as a way to run the relay), B58, B59 |
| 3 | must arrive, transactions, one event | Outbox | B57, B59, B60 |
| fallback | (same as rule 3) | Outbox | B57 |

Results over all 8 combinations: every "Can rebuild" gives Direct publish; must + no transactions gives Listen to yourself (either "Others need"); must + transactions + every change gives CDC; must + transactions + one event gives Outbox.

- Left out of the picture: event sourcing (B62), named in the chapter's fold; delivery numbers (U6, no source gives delay or retention numbers); "Kafka transactions solve it" (B61).
- Assumptions: the rules are the course's reading of five sources (B57 to B62).
- Limitations: stated in `limits`; the costs of the outbox are in the chapter, not the picture.

## Rendering
The shared `ContextPicker` primitive with three factors of two choices and four options. "Listen to yourself" wraps to two lines. Every reason is 79 characters or fewer.

## Controls
Pills for each factor and "Reset".

## Copy
- What this shows: whether the outbox pays, or which other way fits.
- Try this: 1. Set A lost event to Can rebuild. 2. Set Transactions to Not available. 3. Set Others need to Every change.
- What changed: the ring moves and the reason changes.
- Limits of the model: see `limits`.

## Edge cases
Setting "Can rebuild" overrides the other two facts by design (rule 0 first). The fallback duplicates rule 3 so the picture never shows an empty ring.

## Accessibility
As the shared primitive.

## Acceptance criteria
- [x] The claim is testable.
- [x] The model is tested (`checkContextConfig` clean; 8 combinations resolve as listed).
- [x] The design is simple and legible.
- [ ] Prediction before, transfer check after (chapter 6.5: predict on the crash beat, two quiz items after).
- [x] Reader fallback exists (the table in the chapter's fold).

## Placement
Course 13 v2, chapter 6.5 "The Outbox pattern: when it pays", last beat ("Decide: does the outbox pay here?"). Data: `outbox-or-not/data.ts` (`OUTBOX_OR_NOT`, `outboxOrNot`). The same chapter embeds the existing `sysdesign-m14-outbox-crash`. The orchestrator registers the slug.
