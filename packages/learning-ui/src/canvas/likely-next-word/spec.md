---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.2
slug: likely-next-word
version: 1
owner: interaction-designer
---

# Canvas spec: Likely words come out most often

## Teaching claim
A model picks likely words, so the common option comes out most of the time; adding your facts changes the odds; and the fix is the question, not a setting.

## Why a canvas
"It predicts the next word" stays abstract in prose. Asking 20 times and watching the tally follow the bars shows both the pattern (the common word leads) and the chance in it (it does not lead every time). Switching to a second tab with facts in the sentence shows the odds move without becoming certain, which a static table cannot do.

## Model
Data for the shared word sampler (`models/word-sampler.ts`, `primitives/word-sampler.tsx`, factory `makeWordSamplerCanvas`). No new model code.

- Inputs: the tab (two contexts), "Ask once", "Ask 20 times" (`manyCount` 20), seed 4127.
- Outputs: each word's share, its draw count, the last word drawn, and after 10 or more draws "<top word> came out <n> of <m> times".
- Weights (illustrative, made up for teaching; they sum to 100 in each context):

| Context | Prompt | Redis | Memcached | Valkey | KeyDB | Dragonfly |
|---|---|---|---|---|---|---|
| No context | A good cache for my project is ___ | 60 | 18 | 12 | 6 | 4 |
| With my facts | We sell hosted caching and need a BSD licence, so use ___ | 24 | 14 | 52 | 6 | 4 |

- Why these words: the cache tools the module names (B29 to B43). Why Valkey rises with the facts: BSD 3-clause has no field-of-use limit, and Redis 7.4 and later use RSALv2, SSPLv1 or AGPLv3 (B31, B34). Redis keeps 24 on purpose, so the learner sees that context moves the odds and does not decide the answer (B11 is vendor guidance with no effect size).
- Claim sources: ranked picks (B1); newest models ignore settings, so no temperature lesson (B2); popularity lean measured for code libraries (B6); similar outputs for many users (B10).
- Assumptions: the weights are not measured from any assistant.
- Limitations: a real assistant weighs far more than one sentence, and answers vary between tools and days. Stated in `limits`.

## Rendering
The shared `WordSampler` primitive: inline SVG in a `BeatFrame`, prompt card with a highlighted blank, one bar per word with percentage and tally, a verdict banner, the caption "Illustrative numbers, not measured". Two tabs in a `BeatSegmented`; two buttons.

## Controls
"Ask once", "Ask 20 times", and the two tabs. Each tab keeps its tally.

## Copy
- What this shows: how likely each word is and how often it came out.
- Try this: 1. Ask 20 times on "No context". 2. Switch to "With my facts" and ask 20 times. 3. Ask 20 times again and notice that Redis still appears now and then.
- What changed: the bars and the leader change with the facts.
- Limits of the model: the weights are made up; real odds depend on far more than one sentence.

## Edge cases
Five words in a 57-character prompt (tested to fit). Equal tallies resolve to the earlier word in the list. Switching tabs never moves the picture because the card is sized for the largest context.

## Accessibility
Real buttons; tabs are a radio group; the figure has a text alternative listing every word, percentage and count; an `aria-live="polite"` line reads what was asked and the leader. Under `prefers-reduced-motion` the word appears in the blank at once.

## Acceptance criteria
- [x] The claim is testable (the leader on the first tab differs from the leader on the second).
- [x] The model is tested (`checkWordSampler` returns no problems for this data; prompts at most 60 characters).
- [x] The design is simple and legible (shared primitive, five rows).
- [ ] Prediction before, transfer check after (chapter 6.2: predict before the canvas, two quiz items after).
- [x] Reader fallback exists (live text and the chapter prose).

## Placement
Course 13 v2, chapter 6.2 "Why you get the common answer", beat 1 ("A reply picks from a ranked list"). Data: `likely-next-word/data.ts` (`LIKELY_NEXT_WORD`, `likelyNextWord`). The orchestrator registers the slug.
