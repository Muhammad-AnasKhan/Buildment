# How many requests to let in

- **Slug:** `admission-control-tokens`
- **Export:** `admissionControlTokens` in `data.ts`; arithmetic in `model.ts`.
- **Course:** AI Engineering Interview, chapter 11.8 "Admission control and capacity in tokens".
- **Teaching claim:** Admission control counts tokens, not requests: it admits a request only while the tokens already promised stay under a limit, and queues the rest instead of overfilling the cache.
- **Renderer:** slider (`renderers/slider/`).

## Model

Inputs: requests arriving together 1 to 100 (default 30); tokens each request will hold 1,024 to 32,768 step 1,024 (default 16,384); KV capacity in tokens 100,000 to 1,000,000 step 10,000 (default 420,000, about the running example's 55.94 GB at 131,072 bytes a token); admission limit as a share of capacity 50 to 100% step 5 (default 90).

- `limit tokens = capacity x limit / 100`.
- `admitted = min(arrivals, floor(limit tokens / tokens per request))`; `queued = arrivals - admitted`.
- Without control: `needed = arrivals x tokens per request`; it fits when `needed <= capacity`, otherwise it is over by `needed - capacity`.

Worked values:

| Arrivals / tokens / capacity / limit | Admitted | Queued | Without control |
|---|---|---|---|
| 30 / 16,384 / 420,000 / 90% (default) | 23 | 7 | 491,520 tokens, over by 71,520 |
| 30 / 16,384 / 420,000 / 70% | 17 | 13 | over by 71,520 |
| 30 / 8,192 / 420,000 / 90% | 30 | 0 | 245,760 tokens, fits |
| 60 / 16,384 / 420,000 / 90% | 23 | 37 | 983,040 tokens, over by 563,040 |
| 1 / 1,024 / 100,000 / 50% (minimums) | 1 | 0 | 1,024 tokens, fits |
| 100 / 32,768 / 1,000,000 / 100% (maximums) | 30 | 70 | over by 2,276,800 |

Held with control at the default: 23 x 16,384 = 376,832 tokens, under the 378,000 limit. If one request is larger than the limit, nothing is admitted and everything queues (not reachable inside the slider ranges, but finite).

Stats: admitted now; queued; without admission control ("Fits" or "Over by X"). Bars (tokens, one scale): KV capacity, admission limit, held with control, held without control (tone "bad" when over capacity).

## Copy blocks

- **What this shows:** how many of the arriving requests the server lets in under a token limit, how many wait, and how many tokens it would have needed if it let everyone in.
- **Try this:** (1) Limit 90% to 70%: 17 admitted, 13 queued, more spare room for counting errors. (2) Tokens each 16,384 to 8,192: all 30 admitted, nobody queues.
- **What changed:** a live sentence names the input, says what it did to the token limit or the request size, and gives the new admitted, queued and no-control result.
- **Limits:** a snapshot where no request finishes and no preemption is modelled; real engines also cap the number of sequences. The limit sits below 100% because the token count is an estimate (blocks round up, buffers take memory, a gateway may count tokens differently, a cap on output may not be enforced).

The intro does not ask its own prediction: it says "Make the prediction above first, then move one slider." The chapter puts a Predict right before the canvas (how many of 30 requests of 16,384 tokens get in at a 90% limit) and a transfer MCQ after it.

## QA

Model tests in `frontend/tests/unit/canvas/admission-control-tokens.test.ts` cover the default, minimums, maximums, the nobody-fits and everybody-fits cases, bad input, label length and three "What changed" sentences. Check keyboard use of all four sliders, the live region, phone width (375px), dark mode and the reader preview.
