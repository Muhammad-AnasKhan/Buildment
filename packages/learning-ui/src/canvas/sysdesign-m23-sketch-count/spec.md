# Canvas spec: sysdesign-m23-sketch-count

- **Course and chapter:** system-design, 23.4 beat 3 ("A count-min sketch counts with a small grid").
- **Renderer:** `scene` (data only).
- **Claim:** A count-min sketch adds one to one cell per row for each event, and answers a count question with the smallest of the query's cells. Shared cells inflate counts, never lower them, so the smallest cell is the best guess.
- **Story:** "shoes" is added to cells 7, 3 and 9 of three rows. When asked, the rows reply 41, 12 and 30. Verdict: "Estimate: the smallest, 12".
- **Numbers:** Illustrative cell values (41, 12, 30) for the picture, with 12 the true count of shoes in the story. Real behaviour with a sketch of 2,000 cells by 5 rows and one million events is shown in the chapter code output.
- **Sources:** Count-min sketch error handling: S116 (Redis documentation). The primary paper was not read; see the chapter's source notes.
