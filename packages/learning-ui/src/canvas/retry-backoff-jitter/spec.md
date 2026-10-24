# Jitter spreads a retry spike

- **Slug:** `retry-backoff-jitter`
- **Export:** `retryBackoffJitter` in `data.ts`
- **Course:** AI Engineering Interview, chapter 9.4 "Retries, timeouts and rate limits".
- **Teaching claim:** Without jitter, every client retries at the same instant; jitter spreads the spike, and only a random range much wider than the provider's counting window helps.
- **Renderer:** slider (`renderers/slider/`).

## Model

Inputs: clients that fail together (100 to 5,000, step 100, default 1,000), backoff wait (0.5 to 8 s, step 0.5, default 1), jitter share of the wait (0 to 100%, step 5, default 0).

`retrySpread` in `data.ts`: each client waits a time drawn evenly from [base x (1 - share), base]. The retries spread over a window of width W = base x share; 100% is full jitter, a wait from 0 to base, as in the chapter's `next_delay`. The busiest 100 ms holds:

- all clients, when W is 100 ms or less (one 100 ms window can hold the whole range);
- clients x 0.1 / W otherwise (the expected count for an even spread).

Average wait = base - W / 2.

Worked values (1,000 clients, 1 s wait):

| Jitter share | Spread | Busiest 100 ms | Average wait |
|---|---|---|---|
| 0% (default) | 0 ms | 1,000 | 1 s |
| 5% | 50 ms | 1,000 | 0.98 s |
| 20% | 200 ms | 500 | 0.9 s |
| 100% | 1 s | 100 | 0.5 s |

At 5,000 clients, an 8 s wait and full jitter, the busiest 100 ms holds 62.5, shown as 63. The defaults match the chapter's thundering herd (1,000 clients, first retry after 1 second, no random part).

Stats: busiest 100 ms, spread width, average wait. Bars (retries in the busiest 100 ms, scale = all clients): no jitter (bad), the chosen share (bad while it is still one burst), full jitter.

## Copy blocks

- **What this shows:** one retry wave after a shared failure, and how the random share of the wait sets the busiest 100 ms.
- **Try this:** (1) jitter 0% to 100%: busiest 100 ms falls from 1,000 to about 100. (2) jitter 5%: the range is 50 ms, so all 1,000 still land in one 100 ms.
- **What changed:** `describeRetryChange` says how wide the spread is now and how the busiest 100 ms moved, or that everything still lands together and why.
- **Limits:** one retry, a perfectly even spread (averages, not random draws), no new traffic, later retries, Retry-After or provider limit.

The chapter replaces its old spike predict with a full-jitter predict right before the canvas, and adds a transfer MCQ after the copy blocks.

## QA

Tests in `frontend/tests/unit/canvas/retry-backoff-jitter.test.ts`: defaults, full jitter, minimum, maximum, the 100 ms edge (5%, 10% and 20%), and two `describeChange` sentences. Check keyboard use, the live region, phone width and dark mode in `/workspace/canvases`.
