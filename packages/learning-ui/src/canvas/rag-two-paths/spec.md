# Two paths that meet at the vector store

- **Slug:** `rag-two-paths`
- **Export:** `ragTwoPaths` in `data.ts`
- **Course:** AI Engineering Interview, chapter 3.2 "The RAG pipeline end to end".
- **Teaching claim:** RAG has an offline indexing path and an online query path that meet only at the vector store; quality problems usually start in the indexing path and show up on the query path.
- **Renderer:** sequence (four lanes: Indexer, Store, App, Model).

## Model

Huda's late-fee bug at Najm Microfinance, with the chapter's numbers. Indexing path: load and clean 40 PDFs (450,000 words); cut 300-word chunks with 50 overlap, a new chunk every 250 words, about 1,800 chunks; embed to 768 dimensions and store (1,800 x 768 x 4 bytes, about 5.5 MB), with the 2025 policy never removed (warn). Query path: embed the question (30 ms); search top 3 (5 ms exact); the 2025 chunk ranks first (warn); prompt with about 1,200 tokens; the model call (about 1,800 ms) returns "2% per month" citing the 2025 chunk (bad). Fix on the indexing path: delete old chunks on re-index and store an effective date (good). The rankings are an example, labelled in the limits.

Nine steps; labels at most 18 characters; lane names at most 8 and subtitles at most 10 characters.

## Copy blocks

- **What this shows:** the two paths as messages between the indexer, the store, the app and the model, with the bug saved at step 3 and seen at step 8.
- **Try this:** predict the path before step 3, then see the gap between cause (step 3) and symptom (step 8); at step 8, ask what a better prompt or a larger model would change (nothing until step 9).
- **What changed:** each step note says what the step added or broke.
- **Limits:** one question with example rankings; one prototype's timings; no reranking, filters or caching; some problems do start on the query path.

The chapter puts a Predict before the canvas and a transfer quiz after it.

## QA

`frontend/tests/unit/canvas/rag-two-paths.test.ts` checks lane name and label lengths, that every label fits the narrow and wide layouts, and the order and tones of the key steps. Check light and dark mode and the reader at 375px.
