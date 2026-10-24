# Canvas spec: sysdesign-m23-intersect

- **Course and chapter:** system-design, 23.2 beat 4 ("Two words, two lists, one intersection").
- **Renderer:** `scene` (data only).
- **Claim:** To find products that contain every query word, start from the word with the shortest list and check only those products against the other lists.
- **Story:** Query "red waterproof shoes" over the three products of the chapter. Waterproof is in one product (3), so only product 3 is checked for red and shoe. Verdict: "Rarest word first: 1 product to check".
- **Numbers:** Lists (computed with the chapter code): red [1, 3], shoe [1, 3], waterproof [3].
- **Sources:** Lucene term dictionary and postings (S100). Starting from the shortest list is a standard technique; the chapter marks a first-party source as needed.
