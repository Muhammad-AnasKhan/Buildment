# How big the KV cache is for one token

- **Slug:** `kv-cache-per-token`
- **Export:** `kvCachePerToken` in `data.ts`; arithmetic in `model.ts`.
- **Course:** AI Engineering Interview, chapter 11.3 "The KV cache from first principles".
- **Teaching claim:** The KV cache per token is the plain product 2 x layers x KV heads x head size x bytes per value, so doubling any part doubles it, and a long chat multiplies it by its length (the Tokens in the chat slider shows this).
- **Renderer:** slider (`renderers/slider/`).

## Model

Inputs: layers 8 to 80 step 8 (default 32); KV heads 1 to 64 step 1 (default 8); bytes per value 1 to 2 step 1 (default 2; 1 stands for FP8, 2 for 16-bit); tokens in the chat 1,024 to 131,072 step 1,024 (default 32,768). Head size is fixed at 128 (the running example's) and the intro says so. The slider renderer allows at most four inputs, so tokens in the chat replaced the old head size slider.

- `bytes per token = 2 x layers x KV heads x 128 x bytes per value`; shown in KiB (1,024 bytes).
- `chat = bytes per token x tokens in the chat`; shown in GB (decimal, 1e9 bytes). The second stat's label follows the slider ("One 32,768-token chat", "One 131,072-token chat").
- Comparison: the same settings with 32 KV heads (full multi-head attention) and with 1 KV head, at the same chat length. The third stat says how many times smaller or larger this model is than the 32-head case (`32 / KV heads`).

Worked values:

| Layers / KV heads / bytes / tokens | Per token | One chat | Against 32 KV heads |
|---|---|---|---|
| 32 / 8 / 2 / 32,768 (default) | 131,072 bytes, 128 KiB | 4.29 GB | 4 times smaller |
| 32 / 16 / 2 / 32,768 | 256 KiB | 8.59 GB | 2 times smaller |
| 32 / 8 / 1 / 32,768 (FP8) | 64 KiB | 2.15 GB | 4 times smaller |
| 32 / 8 / 2 / 131,072 | 128 KiB | 17.18 GB | 4 times smaller |
| 32 / 8 / 2 / 8,192 | 128 KiB | 1.07 GB | 4 times smaller |
| 32 / 32 / 2 / 32,768 | 512 KiB | 17.18 GB | about the same |
| 32 / 1 / 2 / 32,768 | 16 KiB | 0.54 GB | 32 times smaller |
| 8 / 1 / 1 / 1,024 (minimums) | 2 KiB | 0.002 GB | 32 times smaller |
| 80 / 64 / 2 / 131,072 (maximums) | 2,560 KiB | 343.60 GB | 2 times larger |

Bars (one scale, GB per chat): this model; the same with 32 KV heads; the same with 1 KV head. At the default: 4.29, 17.18, 0.54. GB shows two decimals, or three below 0.1 GB. Non-finite input falls back to the default.

## Copy blocks

- **What this shows:** the bytes the cache keeps for one token, what one chat holds at the chosen length (32,768 tokens at the start), and how that compares with full multi-head attention and with one KV head.
- **Try this:** (1) KV heads 8 to 16: 256 KiB per token and 8.59 GB per chat, because the size is a plain product. (2) Bytes per value 2 to 1 (FP8): 64 KiB and 2.15 GB, half. (3) Tokens in the chat 32,768 to 131,072: the cache per token stays 128 KiB, one chat grows four times from 4.29 GB to 17.18 GB.
- **What changed:** a live sentence names the input, the factor it puts on the cache (doubles, halves or "N times"), and the old and new KiB and GB. A move of the chat length alone says the chat scales and the size per token does not.
- **Limits:** one sequence of the chosen length; no paging overhead, weights, activations or other chats; the example's own shapes and a fixed head size of 128.

The intro does not ask its own prediction: it says "Make the prediction above first, then move one slider." The chapter puts a Predict right before the canvas (16 KV heads with an FP8 cache: does a 32,768-token chat take about 2.15 GB or about 4.29 GB?) and a transfer MCQ after it.

## QA

Model tests in `frontend/tests/unit/canvas/kv-cache-per-token.test.ts` cover the default, the Tokens in the chat slider and its range, minimums, maximums, the 32-head case, bad input, label length, the three Try this results and four "What changed" sentences. Check keyboard use of all four sliders, the live region, phone width (375px), dark mode and the reader preview.
