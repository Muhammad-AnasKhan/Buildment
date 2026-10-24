# Will this deployment fit?

- **Slug:** `deployment-fit-steps`
- **Course:** AI Engineering Interview, chapter 11.9 "Interview drill: will this deployment fit?".
- **Teaching claim:** A fit estimate is five multiplications and one comparison, done in tokens, and it ends with a fix and that fix's trade-off.
- **Renderer:** sequence (export `deploymentFitSteps`; four lanes: You, Model, GPU, Plan).

## Model

The running example: 8,030,261,248 parameters, 32 layers, 8 KV heads, head size 128; one 80 GB GPU with 10% kept back for activations and the engine; 20 chats of 32,768 tokens; all at 16-bit.

1. Weights: 8,030,261,248 x 2 = 16,060,522,496 bytes = 16.06 GB.
2. KV per token: 2 x 32 x 8 x 128 x 2 = 131,072 bytes.
3. Tokens held at once: 20 x 32,768 = 655,360 tokens; at 131,072 bytes each that is 85.9 GB (4.29 GB per chat).
4. Memory left: 80 x 0.9 = 72 GB; 72 - 16.06 = 55.94 GB, room for 13 chats (425,984 tokens).
5. Compare: 85.9 GB > 55.94 GB, short by 29.96 GB, so it does not fit.
6. Fix: five options (FP8 KV, shorter context, fewer users per GPU, a second GPU, admission control). FP8 KV gives 65,536 bytes per token, so 20 chats need 42.95 GB and fit with 12.99 GB spare; 26 chats fit.

Steps (10): request config, weights, KV per token, tokens held, memory left (loop on GPU), what the GPU reports, the verdict (tone bad, "does not fit"), the five fixes, FP8 KV re-checked (tone good, "fits"), the answer in interview order (number, reason, trade-off).

Step titles are words with no "Step N:" prefix, so they do not clash with the renderer's own counter ("Step 7 of 10" would otherwise read "Step 7: Step 5: compare and decide"): "Start with the model's numbers", "Weights", "KV cache per token", "Tokens held at once", "Memory left for the cache", "The GPU reports what is free", "Compare and decide", "A fix has a price", "Check the first fix with the same steps", "Say it in the interview order". The running example (20 chats on one 80 GB GPU) is kept.

## Learning interaction

- **What this shows:** each multiplication as a message, with the arithmetic in chips, so the estimate can be said aloud.
- **Try this:** predict the verdict before opening the message called Compare and decide (does not fit: 85.9 GB against 55.94 GB); at the message called Check the first fix with the same steps, halve the bytes per value and predict how many chats fit (26). The lines name messages by title, not by number, because the renderer prints its own "Step N of 10" counter.
- **What changed:** each step note says which quantity was produced and which units it is in.
- **Limits:** one GPU, the example's 10% reserve, 16-bit weights; paging waste, fragmentation, prefix sharing and answer speed are left out, so a real server needs more headroom.

The chapter puts a predict right before the canvas, a transfer quiz after the copy blocks, and gives the learner a third worked example in prose.

## QA

Labels are at most 18 characters, lane names at most 8 and subtitles at most 10. `frontend/tests/unit/canvas/inference-steps-11.test.ts` runs the label-fit loop at narrow and wide widths and checks every number above against arithmetic. Check light and dark mode and the reader at 375px.
