# Canvas spec: sysdesign-m7-store-sorter

- **Course and chapter:** system-design, 7.2 ("Choosing a database"), beat "Sort eight workloads to a store".
- **Renderer:** custom beat canvas on `BeatFrame`, data only on the reusable `primitives/sorter.tsx` (`makeSorterCanvas`), the same primitive as `sysdesign-m1-requirement-sorter`. Two backward compatible additions to the primitive and `models/sorter.ts`: an optional `verdicts` wording for the end banner, and a narrow-tray layout used from four buckets (names and glosses wrap, the count sits in the corner). A wrong-answer reason now wraps to two lines of 60 characters (one line, as before, for short reasons).
- **Claim:** The way data is read, not the product name, picks the store family. Clue words in a workload point to relational, key-value or document, wide-column or time-series, or graph or search.
- **Model:** `models/sorter.ts`: cards come one at a time in data order; a wrong bucket keeps the card and shows the reason for that card and that bucket; the round ends when the deck is empty. No numbers.
- **Buckets (4, the primitive's limit):** Relational; Key-value or document; Wide-column or time-series; Graph or search. The chapter teaches seven families, grouped into these four.
- **Cards:** eight Ticketline workloads, each with a reason for every wrong bucket (see `data.ts`). Answers: sell a ticket (relational), login session (key-value), gate scans (time-series), friends of friends (graph), search titles (search), venue report (relational), whole order (document), cooler sensors (time-series). Two reasons are shortened from the first draft so they fit two lines.
- **Input:** tap a bucket (a real button over each bucket) or drag the card onto one. "Sort again" after the round deals the cards in a new order.
- **Verdict:** "Eight for eight, first try"; otherwise "1 card needed a second try" or "N cards needed a second try". Prompt "Which store family fits this workload?" (38 characters).
- **Notice:** the clue words: join and all-or-nothing, by id, every second and last hour, hops, words and rank.
- **Accessibility:** buckets are real buttons with a label that includes the count; a live region announces right and wrong answers and the reason.
- **Limits shown to the learner:** real workloads mix kinds, and several stores can serve one; four groups stand for seven families.
- **Sources:** the chapter's own folds; DynamoDB [S40]; Lucene [S100]; Bigtable, Cassandra, MongoDB, Neo4j and Tiger Data docs (read 2026-10-24).
