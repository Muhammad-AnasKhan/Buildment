# Canvas spec: sysdesign-m7-store-special

- **Course and chapter:** system-design, 7.2 beat 5.
- **Renderer:** `scene` (data only).
- **Claim:** A graph store follows links across many hops without joins. A search index finds and ranks documents by their words.
- **Story:** The app asks the graph store for friends of friends and gets 8 people. It asks the search index for 'jazz night' and gets the top 10 shows.
- **Numbers:** 8 people and 10 shows, both made up.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example. Neo4j: relationships are stored natively and graph databases do not use JOINs (Neo4j docs, read 2026-10-24); Lucene inverted index [S100].
