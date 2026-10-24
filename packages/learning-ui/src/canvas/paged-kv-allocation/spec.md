# Reserving the whole context versus paging

- **Slug:** `paged-kv-allocation`
- **Export:** `pagedKvAllocation` in `data.ts`; arithmetic in `model.ts`.
- **Course:** AI Engineering Interview, chapter 11.5 "Continuous batching, PagedAttention and prefix caching".
- **Teaching claim:** Reserving each request's full context wastes the gap between the reservation and the tokens used; allocating 16-token blocks as tokens arrive wastes at most part of one block per request.
- **Renderer:** slider (`renderers/slider/`).

## Model

Per token: 131,072 bytes (the running example at 16-bit). Block: 16 tokens.

Inputs: requests held at once 1 to 64 (default 20); reserved context 2,048 to 32,768 step 2,048 (default 32,768); average tokens actually used 100 to 32,768 step 100 (default 6,000).

- `actual = min(average, reserved)`; an average above the reservation is cut down to it.
- Contiguous: `requests x reserved x 131,072` bytes. Paged: `requests x ceil(actual / 16) x 16 x 131,072` bytes. Used: `requests x actual x 131,072` bytes. Shown in GB (decimal), two decimals, or three below 0.1 GB.
- Waste: contiguous `(reserved - actual) / reserved`; paged `(paged tokens - actual) / paged tokens`.

Worked values:

| Requests / reserved / actual | Contiguous | Paged | Used | Wasted (contiguous vs paged) |
|---|---|---|---|---|
| 20 / 32,768 / 6,000 (default) | 85.90 GB | 15.73 GB | 15.73 GB | 81.7% vs 0.0% (6,000 is 375 whole blocks) |
| 20 / 8,192 / 6,000 | 21.47 GB | 15.73 GB | 15.73 GB | 26.8% vs 0.0% |
| 20 / 32,768 / 100 | 85.90 GB | 0.29 GB | 0.26 GB | 99.7% vs 10.7% (100 tokens fill 7 blocks, 112 tokens) |
| 1 / 2,048 / 100 (minimums) | 0.27 GB | 0.015 GB | 0.013 GB | 95.1% vs 10.7% |
| 64 / 32,768 / 32,768 (maximums) | 274.88 GB | 274.88 GB | 274.88 GB | 0.0% vs 0.0% |
| 20 / 2,048 / 6,000 (clamped to 2,048) | 5.37 GB | 5.37 GB | 5.37 GB | 0.0% vs 0.0% |

Stats: contiguous reservation (GB); paged blocks (GB); share wasted in each. Bars (GB, one scale): tokens actually used, contiguous reserved (tone "bad" when over half of it is waste), paged allocated.

## Copy blocks

- **What this shows:** the memory the same requests need when each reserves its full context and when memory is handed out in 16-token blocks, next to the memory the tokens really use.
- **Try this:** (1) Reserved context 32,768 to 8,192: contiguous falls to 21.47 GB while paged stays at 15.73 GB. (2) Average used 6,000 to 100: paged falls to 0.29 GB and wastes 10.7%, because 100 tokens still fill 7 whole blocks.
- **What changed:** a live sentence names the input and says which way of allocating moved (contiguous follows the reservation, paged follows the tokens in use), then both totals and waste shares.
- **Limits:** every request has the average length; no prefix sharing; the paper's measured waste for real older systems (61.8% to 79.6%) also counts fragmentation this model leaves out.

The intro does not ask its own prediction: it says "Make the prediction above first, then move one slider." The chapter asks it just above the canvas in a line of prose (how much memory do 20 requests use if each reserves 32,768 tokens but averages 6,000?), and a transfer MCQ follows the canvas.

## QA

Model tests in `frontend/tests/unit/canvas/paged-kv-allocation.test.ts` cover the default, minimums, maximums, the clamp, whole-block rounding, bad input, label length and two "What changed" sentences. Check keyboard use of all three sliders, the live region, phone width (375px), dark mode and the reader preview.
