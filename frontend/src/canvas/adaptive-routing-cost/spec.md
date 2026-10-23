# What a question router saves

- **Slug:** `adaptive-routing-cost`
- **Export:** `adaptiveRoutingCost` in `data.ts`; arithmetic in `model.ts`.
- **Course:** AI Engineering Interview, chapter 4.5 "Adaptive retrieval, and RAG versus fine-tuning".
- **Teaching claim:** Routing easy questions away from retrieval saves most of the cost and latency when many questions are easy. When most questions need the multi-step route, the saving shrinks.
- **Renderer:** slider (`renderers/slider/`).

## Model

Example numbers per route (the chapter's own, not real prices): no retrieval 800 ms and $1.00 per 1,000 questions; single-step 1,900 ms and $4.00; multi-step 4,500 ms and $12.00.

Inputs: no-retrieval share `n` and multi-step share `m`, each 0 to 100%, step 5. Defaults 30% and 15% (Omar's sample in the chapter).

- `n` is used as given. `m` is clamped to `min(m, 100 - n)`. Single-step `s = 100 - n - m`. The three shares always add up to 100 and none is negative.
- Average latency = `(n × 800 + s × 1,900 + m × 4,500) / 100` ms.
- Cost per 1,000 questions = `(n × 1.00 + s × 4.00 + m × 12.00) / 100` dollars (computed in cents).
- Baseline with no router: every question multi-step, 4,500 ms and $12.00.
- Saving = `1 - routed / baseline`, rounded to a whole percent.

Worked values:

| No retrieval / single / multi | Latency | Cost per 1,000 | Cost saved |
|---|---|---|---|
| 30 / 55 / 15 (default) | 1,960 ms | $4.30 | 64% (latency 56%) |
| 60 / 25 / 15 | 1,630 ms | $3.40 | 72% |
| 30 / 20 / 50 | 2,870 ms | $7.10 | 41% |
| 0 / 40 / 60 | 3,460 ms | $8.80 | 27% |
| 30 / 0 / 70 (multi input 100, capped) | 3,390 ms | $8.70 | 28% |
| 0 / 100 / 0 (minimums) | 1,900 ms | $4.00 | 67% |
| 100 / 0 / 0 (none at maximum) | 800 ms | $1.00 | 92% |

Stats: single-step share (with a note when multi-step is capped), average latency, cost per 1,000 questions, each against the baseline. Bars: cost per 1,000 questions from each route, plus the no-router baseline, on one scale (max $12.00).

## Copy blocks

- **What this shows:** average latency and cost per 1,000 questions for a mix of three routes, against sending every question down the multi-step route.
- **Try this:** (1) no retrieval 30% to 60%: 1,630 ms, $3.40, 72% saved. (2) no retrieval 0%, multi-step 60%: $8.80, only 27% saved. (3) multi-step to 100% with no retrieval at 30%: capped at 70%.
- **What changed:** a live sentence gives the old and new mix, the direction of latency and cost, why (cheaper or costlier routes), the saving against the baseline, and the cap when it applies.
- **Limits:** example numbers; free and perfect router; no escalation; averages, not p95.

The chapter replaces its routing predict with one about the canvas (multi-step 15% to 50% with no retrieval at 30%: the saving falls from 64% to about 41%), and follows the canvas with a transfer MCQ in a new context (a legal-help assistant where 80% of questions are multi-step: routing saves about 13% of latency).

## QA

Model tests in `frontend/tests/unit/canvas/adaptive-routing-cost.test.ts`: default, minimums, maximums, the cap, every corner sums to 100, and two "What changed" sentences. Check keyboard use of both sliders, the live region, phone width (375px), dark mode and the reader preview.
