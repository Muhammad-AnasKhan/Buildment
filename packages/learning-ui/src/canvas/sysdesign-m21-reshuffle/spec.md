# Canvas spec: sysdesign-m21-reshuffle

- **Course and chapter:** system-design, 21.4 beat 5 (Page two must not reshuffle page one).
- **Renderer:** `scene` (data only).
- **Claim:** A ranked list changes between requests, so an offset or a time cursor can repeat or skip posts. Saving the ranked ids and paging through that saved list keeps every page consistent.
- **Story:** Bug first: page 2 is re-ranked and repeats 3 posts. Then the fix: the cursor carries a list id and page 2 is cut from the saved list. Verdicts: "Re-ranking repeats posts", then "Pin the list to the cursor".
- **Numbers:** Pages of 20 posts, 100 ranked ids saved for 10 minutes, as in chapter 21.4.
- **Sources:** The offset problem is from chapter 6.3. The rest is a course design.
