# Will this deployment fit?

- **Slug:** `deployment-fit-steps`
- **Course:** AI Engineering Interview, chapter 11.9 "Interview drill: will this deployment fit?".
- **Teaching claim:** A fit estimate is five multiplications and one comparison, done in tokens, and it ends with a fix and that fix's trade-off.
- **Renderer:** sequence (export `deploymentFitSteps`; four lanes: You, Model, GPU, Plan).

## Model

Worked example 1 of the chapter, so the canvas adds two fix checks to a case the learner has just read: Reem's team at Najm Microfinance (a fictional lender) serves 12 loan officers on one 48 GB GPU, with 10% kept back for activations and the engine. The model has 8,190,735,360 parameters, 36 layers, 8 KV heads and head size 128, all at 16-bit. Each officer keeps a chat of up to 16,384 tokens. (The 80 GB, 20-chat case appears in 11.1, 11.3, 11.4 and 11.6, so it is not repeated here.)

1. Weights: 8,190,735,360 x 2 = 16,381,470,720 bytes = 16.38 GB.
2. KV per token: 2 x 36 x 8 x 128 x 2 = 147,456 bytes.
3. Tokens held at once: 12 x 16,384 = 196,608 tokens; at 147,456 bytes each that is 28.99 GB (2.42 GB per chat).
4. Memory left: 48 x 0.9 = 43.2 GB; 43.2 - 16.38 = 26.82 GB, room for 11 chats (180,224 tokens; 181,874 tokens in all).
5. Compare: 28.99 GB > 26.82 GB, short by 2.17 GB, so it does not fit.
6. Fixes: five options (FP8 KV, shorter context, fewer users per GPU, a second GPU, admission control). Admission control is described as a tool for a spike, not a steady load: the 12 officers are the planned peak.
7. First fix, FP8 KV: 73,728 bytes per token, so 12 chats need 14.50 GB and fit with 12.32 GB spare; 22 chats fit.
8. Second fix, 8-bit weights: 8.19 GB of weights, so 43.2 - 8.19 = 35.01 GB is left and the 28.99 GB fits with 6.02 GB spare. The cache per token is unchanged.

Steps (11): request config, weights, KV per token, tokens held, memory left (loop on GPU), what the GPU reports, the verdict (tone bad, "does not fit"), the five fixes, FP8 KV checked (tone good, "fits"), 8-bit weights checked (tone good, "fits"), the answer in interview order (number, reason, trade-off, and admission control only as the safety net for a spike).

Step titles are words with no "Step N:" prefix, so they do not clash with the renderer's own counter ("Step 7 of 11" would otherwise read "Step 7: Step 5: compare and decide"): "Start with the model's numbers", "Weights", "KV cache per token", "Tokens held at once", "Memory left for the cache", "The GPU reports what is free", "Compare and decide", "A fix has a price", "Check the first fix with the same steps", "Check the second fix the same way", "Say it in the interview order".

## Learning interaction

- **What this shows:** each multiplication as a message, with the arithmetic in chips, so the estimate can be said aloud; then two fixes checked with the same steps.
- **Try this:** predict how many chats the memory left can hold before opening the message called The GPU reports what is free (11; the twelfth does not fit); then open the two fix messages and compare the spare room (12.32 GB for the FP8 cache, 6.02 GB for 8-bit weights). The lines name messages by title, not by number, because the renderer prints its own "Step N of 11" counter.
- **What changed:** each step note says which quantity was produced and which units it is in; the fix messages show which step each fix halves (step 2 for FP8 KV, step 1 for 8-bit weights).
- **Limits:** one GPU, the example's 10% reserve, 16-bit values unless a fix changes them; paging waste, fragmentation, prefix sharing and answer speed are left out, so a real server needs more headroom.

The chapter puts a predict right before the canvas (which of the two fixes leaves more spare room: the FP8 cache, 12.32 GB against 6.02 GB), a transfer quiz after the copy blocks, and gives the learner a third worked example in prose.

## QA

Labels are at most 18 characters, lane names at most 8 and subtitles at most 10. `frontend/tests/unit/canvas/inference-steps-11.test.ts` runs the label-fit loop at narrow and wide widths and checks every number above against arithmetic. Check light and dark mode and the reader at 375px.
