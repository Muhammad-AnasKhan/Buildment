# When speculative decoding pays off

- **Slug:** `speculative-decoding-gain`
- **Export:** `speculativeDecodingGain` in `data.ts`; arithmetic in `model.ts`.
- **Course:** AI Engineering Interview, chapter 11.6 "Quantization, speculative decoding and FlashAttention".
- **Teaching claim:** Speculative decoding speeds up generation only when enough draft tokens are accepted to pay for the draft; a low acceptance rate or an expensive draft can make it slower.
- **Renderer:** slider (`renderers/slider/`).

## Model

The speculative decoding paper's idealised model: each draft token is accepted independently with probability `a`; the draft model proposes `g` tokens per step; one draft token costs `c` of one target step.

- `expected tokens per target step = (1 - a^(g+1)) / (1 - a)`; at `a = 1` it is `g + 1` (no division by zero; the slider stops at 0.95).
- `walltime factor = expected tokens / (g c + 1)`.
- Verdict on the factor rounded to two decimals: "Faster" above 1.05, "Slower" below 0.95, otherwise "About the same".

Inputs: acceptance rate 0.50 to 0.95 step 0.05 (default 0.80); draft tokens per step 1 to 10 (default 4); draft cost per token 0.01 to 0.50 step 0.01 (default 0.05).

Worked values:

| a / g / c | Tokens per step | Factor | Verdict |
|---|---|---|---|
| 0.80 / 4 / 0.05 (default) | 3.36 | 2.80 | Faster |
| 0.50 / 4 / 0.05 | 1.94 | 1.61 | Faster |
| 0.80 / 4 / 0.50 | 3.36 | 1.12 | Faster |
| 0.50 / 1 / 0.01 (minimums) | 1.50 | 1.49 | Faster |
| 0.95 / 10 / 0.50 (maximums) | 8.62 | 1.44 | Faster |
| 0.50 / 10 / 0.50 | 2.00 | 0.33 | Slower |
| 0.50 / 1 / 0.50 | 1.50 | 1.00 | About the same |

Stats: tokens per target step; walltime improvement ("N times"); verdict. Bars: plain decoding (1.00) and with speculation (the factor; tone "good" when faster, "bad" when slower).

## Copy blocks

- **What this shows:** how many tokens each target step yields on average, and the resulting speed against plain decoding, for the chosen acceptance rate, draft length and draft cost.
- **Try this:** (1) Acceptance 0.80 to 0.50: tokens per step 3.36 to 1.94, factor 2.80 to 1.61. (2) Draft cost 0.05 to 0.50: tokens stay at 3.36, factor falls to 1.12.
- **What changed:** a live sentence names the input, says why it matters (more or fewer drafts kept, extra draft cost) and gives the old and new tokens per step and factor.
- **Limits:** the paper's idealised model with independent acceptance and fixed costs; real gains depend on load and on how well the draft matches the target.

The chapter puts a Predict before the canvas (the factor at 0.80, 4 and 0.05) and a transfer MCQ after it. No prices appear in this canvas.

## QA

Model tests in `frontend/tests/unit/canvas/speculative-decoding-gain.test.ts` cover the default, minimums, maximums, slower and about-the-same verdicts, acceptance 1, bad input, label length and two "What changed" sentences. Check keyboard use of all three sliders, the live region, phone width (375px), dark mode and the reader preview.
