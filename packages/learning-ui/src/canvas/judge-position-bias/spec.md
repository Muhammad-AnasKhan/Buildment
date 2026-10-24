# A judge that favours the first answer

- **Slug:** `judge-position-bias`
- **Export:** `judgePositionBias` in `data.ts`; arithmetic in `model.ts`.
- **Course:** AI Engineering Interview, chapter 5.4 "LLM-as-judge and its pitfalls".
- **Teaching claim:** A judge that favours the first answer inflates whichever answer goes first; scoring both orders and averaging cancels it.
- **Renderer:** slider (`renderers/slider/`).

## Model

Inputs: B's true win rate `t`, 0 to 100%, step 1, default 62; bonus for going first `b`, 0 to 40 points, step 1, default 10. Every pair has a winner, so A's true rate is `100 - t`.

- Observed win rate of the answer in first position = `clamp(true rate + b, 0, 100)`.
- B shown first: `clamp(t + b)`.
- B shown second: `100 - clamp((100 - t) + b)` (A is first and gets the bonus).
- Average of both orders = `(B first + B second) / 2`. While `b <= t <= 100 - b` neither run hits a limit, and the average equals `t` exactly: the bonus goes to B in one order and to A in the other. Outside that band one run is clamped and the average drifts from `t` by the clipped amount (the bar turns from good to warn, with a text note).
- Counting a pair that flips between orders as a tie, worth half a win to each, gives the same number as averaging the two orders' win rates, which links the canvas to the chapter's "same winner or tie" rule.

Worked values:

| t, b | B first | B second | Average |
|---|---|---|---|
| 62, 10 (default, Karim) | 72% | 52% | 62% |
| 62, 30 | 92% | 32% | 62% |
| 50, 10 | 60% | 40% | 50% |
| 62, 0 (bonus minimum) | 62% | 62% | 62% |
| 95, 10 (clipped) | 100% | 85% | 92.5% |
| 100, 40 (maximums) | 100% | 60% | 80% |
| 0, 0 (minimums) | 0% | 0% | 0% |

Stats: B wins with B first, B wins with B second, average of both orders (with a note when a run hit a limit). Bars on a 0 to 100 scale: B first, B second, average (tone good when it equals the true rate, warn when clipped), true rate.

## Copy blocks

- **What this shows:** B's win rate in each order and the average, when the judge adds a fixed bonus to whichever answer it reads first.
- **Try this:** (1) bonus 10 to 30: 92% and 32%, average still 62%. (2) true rate 50%: B still wins 60% when first; average 50%. (3) true rate 95%: B first hits 100%, average 92.5%.
- **What changed:** a live sentence names the input that moved, the two runs and their gap, and whether the average still equals the true rate, with the reason.
- **Limits:** no ties, the same bonus for every pair, clipping near 0% and 100%, and swapping does not remove verbosity or self-preference.

The chapter's story is aligned with the defaults: B wins 72 of 100 pairs when shown first and 52 when shown second. The predict before the canvas asks for the fairer estimate (62, the average); the transfer MCQ after it uses a new context (two summarising prompts, 80% and 50%: true rate about 65%, bonus about 15 points).

## QA

Model tests in `frontend/tests/unit/canvas/judge-position-bias.test.ts`: default, minimums, maximums, the clamp, exact recovery for every whole `t` and `b` inside the band, clipping on both sides, every corner finite, and two "What changed" sentences. Check keyboard use of both sliders, the live region, phone width (375px), dark mode and the reader preview.
