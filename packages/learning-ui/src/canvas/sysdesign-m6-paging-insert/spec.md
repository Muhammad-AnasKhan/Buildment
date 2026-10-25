# Canvas spec: sysdesign-m6-paging-insert

- **Course and chapter:** system-design, 6.3 ("Good API design"), beat 4 "Add new books while you page". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, with `RailStrip` (the shared rail under a picture) for the change, `BeatButton` for the Offset / Cursor toggle, `DotGrid` and `VerdictBanner`.
- **Claim:** Offset pagination repeats rows when rows are added in front of the reader and skips rows when rows are removed; cursor pagination does neither.
- **Model** (`models/paging-insert.ts`): books 9 down to 1, newest first, 3 per page. Page 1 = 9, 8, 7. A change k is applied, then page 2 is taken. k = -1: book 8 deleted; k = 0: none; k = 1, 2, 3: books 10, 11, 12 added at the top. Offset page 2 = rows 4 to 6 of the changed list. Cursor page 2 = the 3 books older than book 7.
- **Inputs:** a rail with 5 snaps ("8 deleted", "no change", "+1", "+2", "+3"; default "+1") and an Offset / Cursor toggle (default Offset). Arrow keys step along the snaps.
- **Worked values (offset page 2):** k = -1: 5, 4, 3 (book 6 skipped). 0: 6, 5, 4. 1: 7, 6, 5. 2: 8, 7, 6. 3: 9, 8, 7. Cursor page 2 is 6, 5, 4 for every k.
- **Picture:** a column of book cards that keep their order while the list makes room at the top (CSS transitions); a left bracket for page 1 ("Huda saw this") and a right bracket for page 2 ("rows 4 to 6" or "older than 7"). On page 2 a card seen on page 1 is amber with "again"; a skipped book is a red dashed card with "never shown"; a deleted book is a dashed ghost with "deleted".
- **Verdicts:** "No change: both pages are right", "Offset: book 7 shown twice", "Offset: books 8 and 7 twice", "Offset: all of page 1 again", "Offset: book 6 never shown", "Cursor: no repeats, no gaps".
- **Reduced motion:** cards move by CSS transition only; nothing loops.
- **Accessibility:** the rail is a `role="slider"` with value text ("+2"); the toggle buttons use `aria-pressed`; the SVG description names what Huda saw, what changed and what page 2 shows.
- **Sources:** none; it follows from the definitions.
