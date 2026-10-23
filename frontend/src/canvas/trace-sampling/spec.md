# Head or tail sampling

- **Slug:** `trace-sampling`
- **Export:** `traceSampling` in `data.ts`
- **Course:** AI Engineering Interview, chapter 10.3 "Tracing and observability".
- **Teaching claim:** Head sampling drops most errors with everything else; tail sampling keeps every error for the same storage.
- **Renderer:** slider (`renderers/slider/`).

## Model

Inputs: requests a day (5,000 to 100,000, step 5,000, default 20,000), requests that fail (0.05% to 5%, step 0.05, default 0.05%, the chapter's 1 in 2,000), share of traces kept (1% to 50%, step 1, default 10%).

`sampleTraces` in `data.ts`:

- failures = requests x failure share
- traces kept (both samplers, the same storage) = requests x keep share
- head sampling keeps failures x keep share, because it decides before the request runs
- tail sampling keeps min(failures, traces kept) failures and fills the rest with normal requests
- storage = traces kept x 6 KB (6 spans of about 1 KB, as in the chapter), with 1 MB = 1,000 KB

Worked values:

| Inputs | Failures | Head keeps | Tail keeps | Storage |
|---|---|---|---|---|
| 20,000, 0.05%, 10% (default) | 10 | 1 | 10 | 12 MB |
| 20,000, 0.05%, 2% | 10 | 0.2 | 10 | 2.4 MB |
| 20,000, 5%, 2% | 1,000 | 20 | 400 (storage full) | 2.4 MB |
| 20,000, 0.05%, 100% (not on the slider) | 10 | 10 | 10 | 120 MB |

The last row is the chapter's "about 120 MB a day" for every trace. Counts under 10 show one decimal so a fraction is not rounded up to a whole failure; a share under 0.05 shows as "under 0.1".

Stats: failures kept by head, failures kept by tail, storage for both. Bars: failed requests that day, kept by head sampling (bad), kept by tail sampling (good when it keeps every failure, warn when storage is full).

## Copy blocks

- **What this shows:** for one storage budget, how many failed requests each sampler keeps a trace of.
- **Try this:** (1) keep share 10% to 2%: storage 12 MB to 2.4 MB, head keeps about 0.2 of 10, tail keeps all 10. (2) failure rate 5% with a 2% keep share: 1,000 failures, 400 traces fit, so tail sampling drops failures too.
- **What changed:** `describeSamplingChange` reports storage and failures kept, and says when storage, not the sampler, is the limit.
- **Limits:** daily averages, a fixed trace size, tail rule simplified to failures first (no slow requests or feedback), the collector needed for tail sampling is not modelled.

The chapter keeps its existing head sampling predict right before the canvas and adds a transfer MCQ after the copy blocks.

## QA

Tests in `frontend/tests/unit/canvas/trace-sampling.test.ts`: defaults, the 120 MB check, minimum, maximum, the storage-full edge and two `describeChange` sentences. Check keyboard use, the live region, phone width and dark mode in `/workspace/canvases`.
