import type { SequenceSpec } from "../renderers/sequence/types";

// AI Engineering Interview course, chapter 4.2 "Hybrid search and reranking".
// One question through keyword search, vector search, reciprocal rank fusion
// (constant 60) and a reranker. The fused scores are computed exactly; the
// reranker scores are illustrative. See spec.md.
export const ragHybridRerank: SequenceSpec = {
  kind: "sequence",
  title: "One question, two searches, one reranker",
  purpose:
    "Follow a question through keyword search and vector search, see how rank fusion merges the two lists, and why the reranker only reads a short list.",
  summary:
    "The app sends the question to a keyword index and a vector index. Each returns its top 3 chunks. The app fuses the two lists with reciprocal rank fusion into 5 candidates, sends those 5 to a reranker, and passes the reranked top 3 to the model.",
  actors: [
    { name: "App", sub: "retriever" },
    { name: "Keyword", sub: "BM25 index" },
    { name: "Vectors", sub: "embedding index" },
    { name: "Reranker", sub: "cross-encoder" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "keyword search",
      title: "Search by the words",
      note: "A customer asks: 'Can I return a damaged book after 30 days?' The app sends the same question to the keyword index. BM25 scores chunks that share rare words with the question, such as damaged and return.",
      chips: ["query: return a damaged book after 30 days"],
    },
    {
      from: 1,
      to: 0,
      label: "top 3 by words",
      title: "Keyword results",
      note: "Keyword search finds the chunk that uses the exact word damaged first. It misses a chunk that says the same thing about the refund window in different words.",
      chips: ["1. returns#2", "2. returns#0", "3. shipping#1"],
    },
    {
      from: 0,
      to: 2,
      label: "vector search",
      title: "Search by the meaning",
      note: "The app embeds the question and asks the vector index for the nearest chunks. This finds text with a similar meaning even when the words differ.",
      chips: ["cosine similarity", "top 3"],
    },
    {
      from: 2,
      to: 0,
      label: "top 3 by meaning",
      title: "Vector results",
      note: "Vector search ranks the refund window chunk first, because 'refunds are accepted within a month of delivery' is close in meaning. It also returns an accounts chunk that is only loosely related.",
      chips: ["1. returns#1", "2. returns#2", "3. accounts#0"],
    },
    {
      from: 0,
      to: 0,
      label: "fuse with RRF",
      title: "Merge the two lists by rank",
      note: "Reciprocal rank fusion gives each chunk 1 / (60 + rank) from every list it appears in, and adds them up. returns#2 is in both lists, so it wins: 1/61 + 1/62 = 0.0325. The others appear once: returns#1 0.0164, returns#0 0.0161, shipping#1 and accounts#0 0.0159 each. Scores from the two searches are never compared directly, only ranks.",
      chips: ["returns#2 0.0325", "returns#1 0.0164", "returns#0 0.0161", "5 candidates"],
    },
    {
      from: 0,
      to: 3,
      label: "rerank top 5",
      title: "Send only the short list to the reranker",
      note: "A cross-encoder reads the question and one chunk together, so it judges relevance better than either search. It is also much slower per chunk, so it only reads the 5 fused candidates, not the whole index.",
      chips: ["5 question and chunk pairs"],
    },
    {
      from: 3,
      to: 0,
      label: "new order",
      title: "The reranker reorders",
      note: "The reranker puts the refund window chunk first and the damaged books chunk second. The shipping and accounts chunks fall to the bottom. These scores are an example, not output from a real model.",
      chips: ["returns#1 0.91", "returns#2 0.88", "returns#0 0.40", "shipping#1 0.12"],
    },
    {
      from: 0,
      to: 0,
      label: "top 3 to model",
      tone: "good",
      outcome: "3 chunks",
      title: "Only the best 3 reach the model",
      note: "The app sends the reranked top 3 to the model as context. The model now sees both the damaged books rule and the 30 day window, which the keyword list alone would have missed.",
      chips: ["returns#1", "returns#2", "returns#0"],
    },
  ],
  tryThis: [
    "Before step 5, predict which chunk wins the fusion. Then check: being in both lists beats being first in one.",
    "At step 7, compare the reranked order with the fused order. Which chunk moved up, and why could the reranker see what the searches could not?",
  ],
  limits:
    "The keyword and vector results and the reranker scores are an example for one question, not output from real indexes or a real model. Real systems fuse 20 to 100 candidates, not 5, and the reranker's cost grows with that number. Query rewriting, metadata filters and deduplication are left out.",
};
