# Will the KV cache fit beside the weights?

- **Slug:** `gpu-memory-budget`
- **Export:** `gpuMemoryBudget` in `data.ts`; arithmetic in `model.ts`.
- **Course:** AI Engineering Interview, chapter 11.4 "GPU memory budgeting and sizing".
- **Teaching claim:** Plan capacity in tokens held at once: the weights are a fixed cost, and what is left after the reserve is the KV cache, which grows with users x context x bytes per token.
- **Renderer:** slider (`renderers/slider/`).

## Model

Fixed model: the running example. Weights 8,030,261,248 parameters x 2 bytes = 16,060,522,496 bytes (16.06 GB). KV cache per token 131,072 bytes at 16-bit (2 x 32 x 8 x 128 x 2), 65,536 at 1 byte per value.

Inputs: users 1 to 64 (default 20); tokens per user 1,024 to 131,072 step 1,024 (default 32,768); KV bytes per value 1 to 2 (default 2; 1 stands for FP8); GPU memory 24 to 192 GB step 8 (default 80).

- `available = GPU x 0.9 - weights` (the 10% reserve is this example's own), never below 0 (at the 24 GB minimum it is 5.54 GB).
- `needed = users x tokens per user x bytes per token`; fits when `needed <= available`. Byte maths uses whole numbers, so a boundary case has no rounding noise.
- Most users that fit = `floor(available / (tokens per user x bytes per token))`.

Worked values:

| Users / tokens / bytes / GPU | Needed | Available | Verdict | Most users |
|---|---|---|---|---|
| 20 / 32,768 / 2 / 80 (default) | 85.90 GB | 55.94 GB | Out of memory by 29.96 GB | 13 |
| 20 / 32,768 / 1 / 80 | 42.95 GB | 55.94 GB | Fits | 26 |
| 20 / 32,768 / 2 / 96 | 85.90 GB | 70.34 GB | Out of memory by 15.56 GB | 16 |
| 1 / 1,024 / 1 / 24 (minimums) | 0.07 GB | 5.54 GB | Fits | 82 |
| 64 / 131,072 / 2 / 192 (maximums) | 1099.51 GB | 156.74 GB | Out of memory by 942.77 GB | 9 |
| 1 / 131,072 / 2 / 24 | 17.18 GB | 5.54 GB | Out of memory by 11.64 GB | 0 |

Stats: KV needed versus available; the verdict ("Fits" or "Out of memory by X GB"); most users that fit. Bars (GB, one scale): weights, KV needed (tone "bad" when it does not fit), KV available.

## Copy blocks

- **What this shows:** the weights, the cache the chats need and the cache memory that is left, with a plain verdict and the number of users that would fit.
- **Try this:** (1) KV bytes per value 2 to 1: the cache halves to 42.95 GB, it fits, 26 users fit. (2) GPU 80 to 96 GB without FP8: 70.34 GB available, still short of 85.90 GB, 16 users fit.
- **What changed:** a live sentence names the input, the old and new GB that moved, the verdict now and the most users that fit.
- **Limits:** one GPU, the example's 10% reserve, weights stay 16-bit, no paging waste or fragmentation, every user holds the full context at once.

The chapter puts a Predict before the canvas (do 20 users of 32,768 tokens fit on 80 GB?) and a transfer MCQ after it. No prices appear in this canvas.

## QA

Model tests in `frontend/tests/unit/canvas/gpu-memory-budget.test.ts` cover the default, FP8, minimums, maximums, the zero-users case, bad input, label length and two "What changed" sentences. Check keyboard use of all four sliders, the live region, phone width (375px), dark mode and the reader preview.
