# How temperature reshapes the next word

- **Slug:** `sampling-temperature`
- **Export:** `samplingTemperature` in `data.ts`
- **Course:** AI Engineering Interview, chapter 2.4 "Prompts, sampling and structured outputs".
- **Teaching claim:** Temperature reshapes the next-word probabilities: a low temperature makes the top word almost certain, a high one spreads the choice to unlikely words.
- **Renderer:** slider (one input, three stat cards, four bars on a 0 to 100% scale).

## Model

The ticket sorter is about to write the category word for one borderline message, "My data bundle was charged twice this month". Four candidate words with fixed example scores: bundle 3, billing 2, network 1, other 0.

Input: temperature, 0 to 2, step 0.05, default 0.9 (the setting the chapter's sorter was left at).

`p(word) = exp((score - top score) / T) / sum of the same over all four words` (softmax; subtracting the top score avoids overflow). For `T < 0.05` the sampler is greedy: bundle 1, the others 0, so nothing divides by zero. `two runs disagree = 1 - sum of p squared`.

Worked values (bundle, billing, network, other; disagree):

| T | Chances | Two runs disagree |
|---|---|---|
| 0 | 100, 0, 0, 0 | 0% |
| 0.2 | 99, 1, under 1, under 1 | 1% |
| 0.5 | 86, 12, 2, under 1 | 24% |
| 0.9 | 68, 22, 7, 2 | 48% |
| 1 | 64, 24, 9, 3 | 52% |
| 2 | 46, 28, 17, 10 | 68% |

Percentages are whole numbers; a chance above 0 and below 0.5% shows as "under 1%". Non-finite input falls back to 0.9; negative input counts as 0.

## Copy blocks

- **What this shows:** the chance of each candidate word at the chosen temperature, the chance of the worst-fitting word, and how often two runs on the same message disagree.
- **Try this:** lower 0.9 to 0.2 (bundle 68% to 99%, disagree 1%); raise to 2 (bundle 46%, other 2% to 10%).
- **What changed:** a live sentence says the direction, that the gaps between scores widened or shrank, and the new chances; at 0 it says the sampler always takes the top word.
- **Limits:** four whole words with made-up scores stand in for thousands of tokens; no top-p or top-k; real scores change with every word written; below 0.05 is treated as 0.

The chapter puts a Predict before the canvas and a transfer quiz after it. This message is borderline on purpose; the chapter's measured 9 of 100 changed categories is over many messages, most of them clear-cut.

## QA

Model tests in `frontend/tests/unit/canvas/sampling-temperature.test.ts` cover the default, plain softmax at 1, the greedy minimum and values just below 0.05, 0.05 without overflow, the maximum, monotonic top-word chance, non-numeric input and two "What changed" sentences. Check keyboard use of the slider, the live region, phone width, dark mode and the reader preview.
