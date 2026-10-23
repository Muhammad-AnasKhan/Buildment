import type { SequenceSpec } from "../renderers/sequence/types";

// AI Engineering Interview course, chapter 3.2 "The RAG pipeline end to end".
// Huda's late-fee bug at Najm Microfinance, traced through the indexing path
// and then the query path, with the chapter's numbers: 40 PDFs, 450,000
// words, 300-word chunks with 50 overlap, about 1,800 chunks of 768
// dimensions, 30 ms to embed the question, 5 ms to search, about 1,800 ms
// for the model call. See spec.md.
export const ragTwoPaths: SequenceSpec = {
  kind: "sequence",
  title: "Two paths that meet at the vector store",
  purpose:
    "Follow the indexing path that runs ahead of time and the query path that runs for every question, and see where a wrong answer really started.",
  summary:
    "Offline, the indexer loads 40 policy PDFs, cuts about 1,800 chunks and saves their vectors, but leaves last year's late-fee rule in the store. Online, the app embeds a question, searches the store, gets the old rule first, and the model answers faithfully from it. The fix goes back to the indexing path.",
  actors: [
    { name: "Indexer", sub: "offline" },
    { name: "Store", sub: "vectors" },
    { name: "App", sub: "online" },
    { name: "Model", sub: "answers" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "load and clean",
      title: "The indexing path runs first",
      note: "No user is waiting yet. The indexer loads Najm's 40 policy PDFs, about 450,000 words, and strips repeated page headers. The folder holds the new 2026 policy, and the 2025 policy is still there next to it.",
      chips: ["40 PDFs", "450,000 words", "2025 and 2026 policies"],
    },
    {
      from: 0,
      to: 0,
      label: "cut chunks",
      title: "Cut the text into chunks",
      note: "Chunks of 300 words that overlap by 50 start every 250 words, so 450,000 / 250 gives about 1,800 chunks.",
      chips: ["300 words", "50 overlap", "about 1,800 chunks"],
    },
    {
      from: 0,
      to: 1,
      label: "embed and save",
      tone: "warn",
      outcome: "old rule kept",
      title: "Embed and store, old rule included",
      note: "Each chunk becomes a vector of 768 numbers, saved with its text and metadata: about 5.5 MB in total. Nobody deleted the chunks of the 2025 policy, so both late-fee rules are now in the store.",
      chips: ["768 dimensions", "about 5.5 MB", "both versions stored"],
    },
    {
      from: 2,
      to: 2,
      label: "embed question",
      title: "The query path starts with a question",
      note: "A loan officer asks: 'What is the late fee for a farming loan?' The query path runs for every question while someone waits. The app embeds the question with the same model in about 30 ms.",
      chips: ["30 ms", "same embedding model"],
    },
    {
      from: 2,
      to: 1,
      label: "search top 3",
      title: "Search the store",
      note: "The app asks the store for the 3 nearest chunk vectors. An exact search over 1,800 vectors takes about 5 ms. The query path can only find what the indexing path saved.",
      chips: ["k = 3", "5 ms"],
    },
    {
      from: 1,
      to: 2,
      label: "3 chunks back",
      tone: "warn",
      title: "The old rule ranks first",
      note: "Both late-fee chunks match the question well. The 2025 one happens to score slightly higher, so it comes back first. Search worked as designed; it ranked what was stored.",
      chips: ["1. 2025 late fee", "2. 2026 late fee", "3. farming loans"],
    },
    {
      from: 2,
      to: 3,
      label: "prompt + 3 chunks",
      title: "Ask the model",
      note: "The app sends the question and the 3 chunks, about 1,200 tokens, and asks for an answer that cites its chunk. The model call takes about 1,800 ms, far longer than retrieval.",
      chips: ["about 1,200 tokens", "about 1,800 ms"],
    },
    {
      from: 3,
      to: 2,
      label: "cited answer",
      tone: "bad",
      outcome: "wrong rule",
      title: "A faithful answer from the wrong rule",
      note: "The model answers '2% per month' and cites the 2025 chunk. It did its job: it answered from the passage it was given. The symptom shows on the query path, but the cause is step 3 on the indexing path.",
      chips: ["2% per month", "cites the 2025 policy"],
    },
    {
      from: 0,
      to: 1,
      label: "delete, re-index",
      tone: "good",
      outcome: "fixed",
      title: "Fix it where it started",
      note: "Re-indexing a document now deletes its old chunks first, and every chunk stores the date its rule takes effect, so search keeps only rules in effect today. A new prompt or a larger model could not have removed a chunk from the store.",
      chips: ["delete old chunks", "effective_from date"],
    },
  ],
  tryThis: [
    "Before step 3, predict on which path the wrong answer starts. Then check: the old rule is saved at step 3, but the wrong answer only appears at step 8.",
    "At step 8, ask what a better prompt or a larger model would change. Nothing: both act on the query path, and the old chunk is still in the store until step 9.",
  ],
  limits:
    "This is one question with example rankings, not output from a real index or model. The timings are one prototype's measurements. Real pipelines add steps such as reranking, metadata filters and caching, and some quality problems do start on the query path, for example a weak prompt or a k that is too small.",
};
