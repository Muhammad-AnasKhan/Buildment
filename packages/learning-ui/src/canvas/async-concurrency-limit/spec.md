# A semaphore in front of the provider

- **Slug:** `async-concurrency-limit`
- **Export:** `asyncConcurrencyLimit` in `data.ts`
- **Course:** AI Engineering Interview, chapter 9.2 "Async Python: gather, semaphores and cancellation".
- **Teaching claim:** A semaphore trades total time for staying under the provider's limit: time grows in waves of the limit, and any limit above the provider's turns the extra calls into rejections.
- **Renderer:** slider (`renderers/slider/`).

## Model

Inputs: calls in the batch (1 to 60, step 1, default 10), semaphore limit (1 to 20, default 3), time per call (0.5 to 5 s, step 0.5, default 1), provider limit (1 to 20, default 5).

`runBatch` in `data.ts`:

- Most calls sent at once = min(calls, semaphore limit).
- If that is at or under the provider limit: waves = ceil(calls / limit), total time = waves x time per call, 0 rejected.
- If it is above the provider limit: the provider rejects every call beyond its limit at once. A rejected call frees its slot straight away, so the next waiting call is sent and rejected too, while the accepted calls are still running. Result: calls minus provider limit are rejected, and the accepted calls finish in one call time.

Worked values:

| Inputs | Waves | Total time | Rejected |
|---|---|---|---|
| 10 calls, limit 3, 1 s, provider 5 (default) | 4 | 4.0 s | 0 |
| 40 calls, limit 5, 3 s, provider 5 | 8 | 24.0 s | 0 |
| 40 calls, limit 6, 3 s, provider 5 | 1 | 3.0 s | 35 |
| 10 calls, limit 6, 1 s, provider 5 | 1 | 1.0 s | 5 |

The defaults match the chapter's predict (10 calls, Semaphore(3), about 4 seconds) and its code output (`10 calls, peak 3 at once, 4.0s`). The 40-report rows match Omar's job in the chapter: 8 waves, about 24 seconds; and 35 rejected when everything goes at once.

Stats: total time, most calls at once (with the provider limit), rejected calls. Bars (time to finish): one at a time, the chosen semaphore (good when nothing is rejected, bad otherwise), all at once with no semaphore (bad when calls are rejected).

## Copy blocks

- **What this shows:** total time and rejected calls for one batch behind a shared semaphore, against one at a time and all at once.
- **Try this:** (1) 40 calls of 3 s with a limit of 5: 8 waves, 24.0 s, 0 rejected. (2) Raise the limit to 6: 3.0 s, but 35 of 40 rejected.
- **What changed:** `describeBatchChange` names the input that moved and says whether waves, total time or rejections changed, and why.
- **Limits:** equal call times, a fixed provider limit, rejected calls fail at once and are not retried, nothing else shares the provider's limit.

The chapter puts its existing predict right before the canvas and a transfer MCQ after the copy blocks.

## QA

Tests in `frontend/tests/unit/canvas/async-concurrency-limit.test.ts`: defaults, minimum, maximum, the 40-report job and the one-over-the-limit edge, a batch smaller than the provider limit, and two `describeChange` sentences. The registry test also checks every corner for finite numbers once the slug is registered. Check keyboard use of all four sliders, the live region, phone width and dark mode in `/workspace/canvases`.
