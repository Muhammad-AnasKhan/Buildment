# Where the money goes in one request

- **Slug:** `llm-token-cost`
- **Export:** `llmTokenCost` in `data.ts`
- **Course:** AI Engineering Interview, chapter 2.2 "Tokens, context windows and cost".
- **Teaching claim:** Long context makes input tokens, not output tokens, the main cost, even when each output token costs more.
- **Renderer:** slider (three inputs, three stat cards, four bars).

## Model

Fixed: system prompt 600 tokens, question 50 tokens, 400 tokens per chunk, example prices $1 per million input tokens and $4 per million output tokens, 10,000 requests a day for 30 days (300,000 requests a month). These are the scenario's own example numbers, not any provider's price.

Inputs:

| Input | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Retrieved chunks | 0 | 20 | 1 | 10 | chunks |
| Chat history | 0 | 8,000 | 200 | 3,000 | tokens |
| Answer length | 50 | 1,000 | 50 | 350 | tokens |

`input tokens = 600 + 50 + history + 400 x chunks`; `cost per request = (input x 1 + output x 4) / 1,000,000`; `monthly = cost per request x 300,000`; `input share = input cost / cost per request`. Bars are monthly dollars for: system prompt and question, chat history, retrieved chunks, answer (output).

Worked values:

- Default (Sara's "after" request): 7,650 input and 350 output tokens, $0.00905 a request, $2,715 a month, input 85% of the cost. Bars $195, $900, $1,200, $420.
- Sara's "before" request (3 chunks, 400 history, 250 output): 2,250 input tokens, $0.00325, $975 a month. Matches the chapter.
- Answer length 700: $0.01045, $3,135 a month (+$420), input 73%.
- No chunks, no history, 350 output: $0.00205, $615 a month, output 68% of the cost.
- All minimums: $0.00085, $255, input 76%. All maximums: 16,650 input tokens, $0.02065, $6,195, input 81%.

Non-finite input falls back to the default; negative input counts as 0.

## Copy blocks

- **What this shows:** the cost of one request and one month split into its four parts, with input share as a card, so the learner sees that the chunks and history, not the answer, carry most of the bill.
- **Try this:** double the answer length from 350 to 700 (the month rises $420 to $3,135 and input is still 73%); set chunks and history to 0 (output becomes 68% of the cost).
- **What changed:** a live sentence names the input that moved, the monthly dollars added or saved, and the new input share, with the reason (history is resent every request; output is 4 times the price but small).
- **Limits:** example prices, same-size requests, given token counts rather than a real tokenizer, no retries, caching discounts or latency.

The chapter puts a Predict before the canvas and a transfer quiz after it.

## QA

Model tests in `frontend/tests/unit/canvas/llm-token-cost.test.ts` cover the default, the chapter's "before" request, the minimums, the maximums, the output-dominates edge case, non-numeric input, both try-this numbers and two "What changed" sentences. Check keyboard use of the sliders, the live region, phone width, dark mode and the reader preview.
