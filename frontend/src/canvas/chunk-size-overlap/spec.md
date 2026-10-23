# Chunk size, overlap and the facts they cut

- **Slug:** `chunk-size-overlap`
- **Export:** `chunkSizeOverlap` in `data.ts`
- **Course:** AI Engineering Interview, chapter 3.3 "Chunking strategies".
- **Teaching claim:** Bigger chunks and more overlap keep facts whole but store more text; overlap only protects facts no longer than the overlap.
- **Renderer:** slider (three inputs, three stat cards, two bars).

## Model

A fixed 900-word section (section 4 of Najm's credit policy, stated in the intro) is cut into fixed word chunks.

| Input | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Chunk size | 100 | 600 | 50 | 300 | words |
| Overlap | 0 | 200 | 10 | 50 | words |
| Fact length | 10 | 150 | 10 | 40 | words |

- Overlap used = `min(overlap, size - 50)`, so a chunk always starts at least 50 words after the previous one (the clamp keeps overlap below chunk size). Stride = `size - overlap used`.
- Chunks start at 0 and every stride words; the last chunk is the one that reaches word 900. Stored words = sum of chunk lengths. Extra = stored / 900 - 1.
- Facts cut = `clamp((fact - 1 - overlap used) / stride, 0, 1)`: the share of start positions where a fact of that length is in no chunk whole, assuming it can start at any word, as in a long document cut the same way. With steps of 10 it is 0 exactly when the fact is no longer than the overlap.

Worked values:

- Default (300, 50, 40): starts at 0, 250, 500, 750; 4 chunks of 300, 300, 300, 150 = 1,050 words, +17%; 0% of 40-word facts cut. Matches the chapter.
- Overlap 0: 3 chunks, 900 words, +0%; 39/300 = 13% cut. Matches the chapter.
- Fact 80 with overlap 50: 29/250 = 12% cut.
- Minimums (100, 0, 10): 9 chunks, 900 words, 9% cut. Maximums (600, 200, 150): 2 chunks (600, 500), 1,100 words, 0% cut.
- Clamp (100, 200, 150): overlap used 50, stride 50, 17 chunks, 100% cut (the fact is longer than a chunk).

Non-finite input falls back to the default.

## Copy blocks

- **What this shows:** chunk count and extra stored text for the 900-word section, and the share of facts of the chosen length that a cut splits.
- **Try this:** overlap 0 (13% of 40-word facts cut, stored text 1,050 to 900 words); overlap 50 with an 80-word fact (about 12% cut again).
- **What changed:** a live sentence names what changed, the new chunk count and stored words, and why the fact is safe or not (no longer than the overlap, longer than the overlap, or longer than a chunk), plus the cap when it applies.
- **Limits:** word-count cuts only, the any-start assumption for facts, the 50-word cap, no retrieval quality, embedding limits or prompt cost.

The chapter puts a Predict before the canvas and a transfer quiz after it.

## QA

Model tests in `frontend/tests/unit/canvas/chunk-size-overlap.test.ts` cover the default, no overlap, the overlap rule, the minimums, the maximums, the clamp, non-numeric input and two "What changed" sentences. Check keyboard use of the sliders, the live region, phone width, dark mode and the reader preview.
