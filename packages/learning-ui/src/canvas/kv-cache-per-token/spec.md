# How big the KV cache is for one token

- **Slug:** `kv-cache-per-token`
- **Export:** `kvCachePerToken` in `data.ts`; arithmetic in `model.ts`.
- **Course:** AI Engineering Interview, chapter 11.3 "The KV cache from first principles".
- **Teaching claim:** The KV cache per token is the plain product 2 x layers x KV heads x head size x bytes per value, so doubling any part doubles it, and a long chat multiplies it by its length.
- **Renderer:** slider (`renderers/slider/`).

## Model

Inputs: layers 8 to 80 step 8 (default 32); KV heads 1 to 64 step 1 (default 8); head size 64 to 256 step 64 (default 128); bytes per value 1 to 2 step 1 (default 2; 1 stands for FP8, 2 for 16-bit).

- `bytes per token = 2 x layers x KV heads x head size x bytes per value`; shown in KiB (1,024 bytes).
- `chat = bytes per token x 32,768`; shown in GB (decimal, 1e9 bytes).
- Comparison: the same settings with 32 KV heads (full multi-head attention) and with 1 KV head. The third stat says how many times smaller or larger this model is than the 32-head case (`32 / KV heads`).

Worked values:

| Layers / KV heads / head size / bytes | Per token | One chat | Against 32 KV heads |
|---|---|---|---|
| 32 / 8 / 128 / 2 (default) | 131,072 bytes, 128 KiB | 4.29 GB | 4 times smaller |
| 32 / 16 / 128 / 2 | 256 KiB | 8.59 GB | 2 times smaller |
| 32 / 8 / 128 / 1 (FP8) | 64 KiB | 2.15 GB | 4 times smaller |
| 32 / 32 / 128 / 2 | 512 KiB | 17.18 GB | about the same |
| 32 / 1 / 128 / 2 | 16 KiB | 0.54 GB | 32 times smaller |
| 8 / 1 / 64 / 1 (minimums) | 1 KiB | 0.034 GB | 32 times smaller |
| 80 / 64 / 256 / 2 (maximums) | 5,120 KiB | 171.80 GB | 2 times larger |

Bars (one scale, GB per chat): this model; the same with 32 KV heads; the same with 1 KV head. At the default: 4.29, 17.18, 0.54. GB shows two decimals, or three below 0.1 GB. Non-finite input falls back to the default shape.

## Copy blocks

- **What this shows:** the bytes the cache keeps for one token, what one 32,768-token chat holds, and how that compares with full multi-head attention and with one KV head.
- **Try this:** (1) KV heads 8 to 16: 256 KiB per token and 8.59 GB per chat, because the size is a plain product. (2) Bytes per value 2 to 1 (FP8): 64 KiB and 2.15 GB, half.
- **What changed:** a live sentence names the input, the factor it puts on the cache (doubles, halves or "N times"), and the old and new KiB and GB.
- **Limits:** one sequence of 32,768 tokens; no paging overhead, weights, activations or other chats; the example's own shapes.

The chapter puts a Predict before the canvas (KiB per token and GB per chat for the default) and a transfer MCQ after it.

## QA

Model tests in `frontend/tests/unit/canvas/kv-cache-per-token.test.ts` cover the default, minimums, maximums, the 32-head case, bad input, label length and two "What changed" sentences. Check keyboard use of all four sliders, the live region, phone width (375px), dark mode and the reader preview.
