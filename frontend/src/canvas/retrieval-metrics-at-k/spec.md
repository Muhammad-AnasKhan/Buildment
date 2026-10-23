# Retrieval metrics at k

- **Slug:** `retrieval-metrics-at-k`
- **Course:** AI Engineering Interview, chapter 5.2 "Retrieval metrics: recall@k, precision@k and MRR".
- **Teaching claim:** Raising k can only keep or raise recall, and it lowers precision whenever the added chunks are not relevant. Reciprocal rank depends only on where the first relevant chunk is.
- **Renderer:** custom React component (HTML slider, stat cards and a ranked list). None of the three shared renderers has a live numeric control.

## Model

Input: k, integer 1 to 10, step 1, default 3. Data: 10 ranked chunks, relevant at ranks 2, 3, 6 and 9 (4 relevant in total). `recall@k = hits in top k / 4`; `precision@k = hits in top k / k`; `reciprocal rank = 1 / rank of the first relevant chunk in the top k`, or 0 if none. Values at k = 1, 2, 3, 5, 9, 10: recall 0, 0.25, 0.50, 0.50, 1.00, 1.00; precision 0, 0.50, 0.67, 0.40, 0.44, 0.40; reciprocal rank 0, 0.5, 0.5, 0.5, 0.5, 0.5. Non-finite input falls back to the default; out-of-range input is clamped.

## Learning interaction

- **What this shows:** the three metrics as cards above the slider, and the ranked list with kept and dropped rows and a text relevance badge.
- **Try this:** k from 1 to 2; k from 3 to 5; the smallest k with recall 1.
- **What changed:** a live sentence names the direction of the change and why (relevant or not relevant chunks added or dropped).
- **Limits:** one query, binary relevance, fixed ranking, no token or latency cost.

The chapter puts a Predict before the canvas and a transfer quiz after it.

## QA

Model tests in `frontend/tests/unit/canvas/retrieval-metrics.test.ts` cover the default, minimum, maximum, the recall-reaches-one point, clamping and the "What changed" sentence. Check keyboard use of the slider, the live region, phone width, dark mode and the reader preview.
