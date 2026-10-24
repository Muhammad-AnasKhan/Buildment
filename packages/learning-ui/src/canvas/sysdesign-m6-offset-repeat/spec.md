# Canvas spec: sysdesign-m6-offset-repeat

- **Course and chapter:** system-design, 6.3 beat 2 ("Offset pages repeat when rows arrive").
- **Renderer:** `scene` (data only).
- **Claim:** Offset pagination counts positions, and positions move when rows are added in front of the reader, so a page repeats rows.
- **Story:** Huda loads page 1 (offset 0): books 9, 8, 7. A seller lists book 10 at the top. Huda loads page 2 (offset 3); the API skips 10, 9, 8 and returns 7, 6, 5. Verdict: "Offset 3 now starts at book 7 again".
- **Numbers:** 3 per page and one new book are illustrative.
- **Predict before it (in the chapter):** which books page 2 shows.
- **Sources:** none needed; the behaviour follows from the definition of an offset. Kitabi is a course example.
