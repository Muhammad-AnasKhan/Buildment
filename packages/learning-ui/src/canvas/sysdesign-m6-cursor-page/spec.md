# Canvas spec: sysdesign-m6-cursor-page

- **Course and chapter:** system-design, 6.3 beat 3 ("A cursor remembers where you stopped").
- **Renderer:** `scene` (data only).
- **Claim:** A cursor names the last row seen, not a position, so rows added above it do not change the next page.
- **Story:** Page 1 returns 9, 8, 7 and a cursor "after 7". A seller lists book 10. Page 2 asks "?after=7"; the API returns books older than 7: 6, 5, 4. Verdict: "After book 7: no repeats, no gaps".
- **Numbers:** 3 per page is illustrative.
- **Sources:** keyset pagination details are a source-needed note in the chapter. Kitabi is a course example.
