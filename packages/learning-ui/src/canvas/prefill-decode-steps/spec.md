# Prefill and decode

- **Slug:** `prefill-decode-steps`
- **Course:** AI Engineering Interview, chapter 11.2 "What happens when a model answers: prefill and decode".
- **Teaching claim:** Prefill handles the whole prompt in one pass; decode then produces one token per step, and every step must read all the weights and the growing KV cache.
- **Renderer:** sequence (export `prefillDecodeSteps`; four lanes: App, Engine, Weights, KV cache).

## Model

The running example from the module 11 inference pack: an 8-billion-parameter open model with 32 layers, 8 KV heads and a head size of 128. Weights at 16-bit are 8,030,261,248 x 2 bytes = 16.06 GB. KV cache per token at 16-bit is 2 x 32 x 8 x 128 x 2 = 131,072 bytes (about 0.13 MB). Nothing is timed: the canvas shows order of work and bytes only.

Steps (10): a 2,000-token prompt arrives; prefill reads the weights once for all 2,000 positions together; the cache saves 2,000 tokens (2,000 x 131,072 = 262,144,000 bytes, about 262 MB); the first token goes out (time to first token ends); the first decode reads all 16.06 GB for one token; it also reads the cache and adds one entry (2,001 tokens); the second decode does the same (2,002 tokens); the pattern repeats (a 500-token answer reads the weights 500 times, 8,030 GB, and the cache is 2,500 tokens, 327,680,000 bytes); a batch of 8 users shares one weight read for 8 tokens (8 x 131,072 = 1,048,576 new bytes); the answer ends. The 2,000-token prompt, the 500-token answer and the batch of 8 are the example's own numbers.

## Learning interaction

- **What this shows:** the two phases as messages between the app, the engine, the weights and the cache, with the bytes in chips.
- **Try this:** predict how much of the weights decode reads for one token before opening the message called The first decode reads every weight again (all 16.06 GB); compare it with the message called A batch of 8 shares one weight read (same single read, 1 token versus 8 tokens). The lines name messages by title, because the renderer prints its own "Step N of 10" counter and the arrow labels do not use step numbers.
- **What changed:** each step note says what was read, what was written and what is shared.
- **Limits:** no real timings; one GPU; activations, kernel overhead and the arithmetic itself are ignored.

The chapter puts a predict right before the canvas and a transfer quiz after the copy blocks. The chapter's prose and mermaid diagram teach the claim without the canvas.

## QA

Labels are at most 18 characters, lane names at most 8 and subtitles at most 10. `frontend/tests/unit/canvas/inference-steps-11.test.ts` runs the label-fit loop at narrow and wide widths and checks the sizes above against arithmetic. Check light and dark mode and the reader at 375px.
