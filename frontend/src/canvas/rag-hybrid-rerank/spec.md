# Hybrid search and reranking

- **Slug:** `rag-hybrid-rerank`
- **Course:** AI Engineering Interview, chapter 4.2 "Hybrid search and reranking".
- **Teaching claim:** Keyword search and vector search find different chunks. Reciprocal rank fusion merges them by rank, not by score, so a chunk found by both rises to the top. A reranker reads the question and each candidate together, which is accurate but slow, so it reorders only a short fused list.
- **Renderer:** sequence (four lanes: App, Keyword, Vectors, Reranker).

## Model

Fusion score for a chunk = sum over the lists it appears in of `1 / (60 + rank)`, with ranks starting at 1. With keyword list [returns#2, returns#0, shipping#1] and vector list [returns#1, returns#2, accounts#0]: returns#2 = 1/61 + 1/62 = 0.0325; returns#1 = 1/61 = 0.0164; returns#0 = 1/62 = 0.0161; shipping#1 = accounts#0 = 1/63 = 0.0159. The reranker scores are illustrative and labelled as such in the step note.

## Learning interaction

- **What this shows:** each retrieval stage as a message, with the candidate list in chips.
- **Try this:** predict the fusion winner before step 5; compare fused and reranked order at step 7.
- **What changed:** each step note says what the stage added or removed.
- **Limits:** one question, example results, 5 candidates instead of 20 to 100, no rewriting, filters or deduplication.

The chapter puts a Predict before the canvas and a transfer quiz after it.

## QA

Labels are at most 18 characters; the registry test checks that every label fits at phone and desktop widths. Check light and dark mode and the reader at 375px.
