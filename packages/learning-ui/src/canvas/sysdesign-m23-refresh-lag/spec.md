# Canvas spec: sysdesign-m23-refresh-lag

- **Course and chapter:** system-design, 23.2 beat 7 ("A saved product shows up later").
- **Renderer:** `scene` (data only).
- **Claim:** A search index makes new documents searchable in batches. Between a save and the next refresh, a search cannot find the new product.
- **Story:** The seller's new product goes to the index and waits in a buffer. The shopper searches and gets "no match". The index refreshes (wait ring to 1 s). The same search now finds the product. Verdict: "Visible after the next refresh".
- **Numbers:** A 1 s refresh is a course number for the story, not a measurement. {/* source needed: the default refresh interval of Elasticsearch or OpenSearch, and Lucene near-real-time search, from the vendor documentation. */}
- **Sources:** None yet; flagged in the chapter.
